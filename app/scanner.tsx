import { useRouter } from 'expo-router';
import { ChevronRight, Cpu, Loader2, Radio, Signal } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Peripheral } from 'react-native-ble-manager';

import { useBLE } from '@/hooks/useBLE';

export default function ScannerScreen() {
  const router = useRouter();
  const {
    isScanning,
    isConnecting,
    discoveredDevices,
    bluetoothState,
    error,
    requestPermissions,
    startScan,
    stopScan,
    connect,
    clearError,
  } = useBLE();

  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const init = async () => {
      const granted = await requestPermissions();
      if (granted && bluetoothState === 'on') {
        startScan(15);
      }
    };
    init();

    return () => {
      stopScan();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bluetoothState]);

  // Radar rotation animation
  useEffect(() => {
    if (isScanning) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
  }, [isScanning, rotateAnim]);

  const handleDevicePress = async (peripheral: Peripheral) => {
    stopScan();
    const success = await connect(peripheral.id);
    if (success) {
      router.push('/provision');
    }
  };

  const handleScanToggle = () => {
    if (isScanning) {
      stopScan();
    } else {
      clearError();
      startScan(15);
    }
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Bluetooth is off
  if (bluetoothState === 'off') {
    return (
      <View className="flex-1 bg-bg-dark items-center justify-center p-10">
        <Radio size={60} color="#FF2A2A" />
        <Text className="text-xl font-display font-bold text-text-main mt-5">
          Bluetooth is Off
        </Text>
        <Text className="text-sm text-muted text-center mt-2">
          Please enable Bluetooth in your device settings to scan for devices.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-bg-dark">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-border-color">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center">
          <Text className="text-text-main text-2xl">←</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-text-main text-xl font-display font-bold ml-2 tracking-wide uppercase">
          Device Discovery
        </Text>
      </View>

      {/* Radar Visualization (30%) */}
      <View className="h-[265px] items-center justify-center border-b border-border-color relative overflow-hidden">
        {/* Radar circles */}
        <View className="absolute w-64 h-64 border border-border-color rounded-full opacity-50" />
        <View className="absolute w-48 h-48 border border-border-color rounded-full opacity-50" />
        <View className="absolute w-32 h-32 border border-border-color rounded-full opacity-50" />
        <View className="absolute w-16 h-16 border border-primary rounded-full" />

        {/* Radar Sweep */}
        {isScanning && (
          <Animated.View
            style={{
              position: 'absolute',
              width: 256,
              height: 256,
              transform: [{ rotate: rotation }],
            }}>
            {/* Note: conic-gradient not supported in React Native, using opacity instead */}
            <View
              className="w-full h-full rounded-full bg-primary"
              style={{ opacity: 0.2 }}
            />
          </Animated.View>
        )}

        {/* Central dot */}
        <View
          className="absolute w-3 h-3 bg-primary rounded-full"
          style={{
            shadowColor: '#00E5FF',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 15,
          }}
        />

        {/* Status Text */}
        <View className="absolute bottom-4 w-full items-center">
          <Text
            className="font-mono text-primary text-xs uppercase tracking-widest"
            style={{
              textShadowColor: 'rgba(0,229,255,0.4)',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 10,
            }}>
            {isScanning ? 'Scanning BLE Frequencies...' : 'Ready to Scan'}
          </Text>
        </View>
      </View>

      {/* Error Banner */}
      {error && (
        <View className="mx-4 mt-3 p-3 bg-critical/20 border border-critical rounded">
          <Text className="text-critical text-sm font-mono">{error}</Text>
        </View>
      )}

      {/* Device List (70%) */}
      <View className="flex-1">
        <FlatList
          data={discoveredDevices}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleDevicePress(item)}
              disabled={isConnecting}
              className="w-full flex-row items-center justify-between p-4 bg-surface border border-border-color rounded mb-3 active:border-primary"
              style={{ borderRadius: 2 }}>
              <View className="flex-row items-center gap-4 flex-1">
                <View className="w-10 h-10 rounded bg-bg-dark border border-border-color items-center justify-center">
                  <Cpu size={20} color="#64748B" />
                </View>
                <View className="flex-1">
                  <Text className="font-display text-text-main font-bold text-lg leading-none mb-1">
                    {item.name || 'Unknown Device'}
                  </Text>
                  <Text className="font-mono text-muted text-xs">
                    MAC: {item.id}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center gap-3">
                {item.rssi && item.rssi > -70 ? (
                  <Signal size={20} color="#00E5FF" />
                ) : (
                  <Signal size={20} color="#64748B" />
                )}
                <ChevronRight size={20} color="#64748B" />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="py-12 items-center">
              {isScanning ? (
                <>
                  <Loader2 size={32} color="#64748B" />
                  <Text className="text-muted text-sm mt-4">Searching...</Text>
                </>
              ) : (
                <>
                  <Radio size={40} color="#64748B" />
                  <Text className="text-muted font-body text-sm max-w-[250px] text-center mt-4">
                    No hardware detected. Tap &quot;Scan Network&quot; to search.
                  </Text>
                </>
              )}
            </View>
          }
        />
      </View>

      {/* Fixed Bottom CTA */}
      <View className="absolute bottom-0 left-0 w-full p-4 pt-8 bg-bg-dark">
        <TouchableOpacity
          onPress={handleScanToggle}
          disabled={isConnecting}
          className="w-full h-14 bg-primary rounded flex-row items-center justify-center gap-2"
          style={{
            borderRadius: 2,
            shadowColor: 'rgba(0,229,255,0.3)',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 15,
          }}>
          {isScanning ? (
            <>
              <Loader2 size={20} color="#090A0F" />
              <Text className="text-bg-dark font-display font-bold text-[15px] uppercase tracking-[1px]">
                Stop Scan
              </Text>
            </>
          ) : (
            <>
              <Radio size={20} color="#090A0F" />
              <Text className="text-bg-dark font-display font-bold text-[15px] uppercase tracking-[1px]">
                Scan Network
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Connecting Overlay */}
      {isConnecting && (
        <View className="absolute inset-0 bg-black/80 items-center justify-center">
          <View className="bg-surface border border-border-color rounded p-8 items-center" style={{ borderRadius: 2 }}>
            <Loader2 size={40} color="#00E5FF" />
            <Text className="text-text-main text-lg mt-4">Connecting...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

