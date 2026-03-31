import { useRouter } from 'expo-router';
import {
  Thermometer,
  Droplets,
  Wheat,
  Wind,
  Settings,
} from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';

import { useBLE } from '@/hooks/useBLE';
import { bleEmitter } from '@/services/bleManager';
import { GrainService, SensorReading } from '@/services/GrainService';

type DataSource = 'ble' | 'http' | 'none';

export default function DashboardScreen() {
  const router = useRouter();
  const { isConnected, connectedPeripheralId } = useBLE();
  const [reading, setReading] = useState<SensorReading | null>(null);
  const [dataSource, setDataSource] = useState<DataSource>('none');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const httpIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Handle BLE notification data
  const handleBleData = useCallback((data: { value: number[]; peripheral: string }) => {
    if (data.peripheral === connectedPeripheralId) {
      const parsed = GrainService.parseSensorData(data.value);
      if (parsed) {
        setReading(parsed);
        setDataSource('ble');
        setLastUpdate(new Date());
        
        // Trigger pulse animation on update
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  }, [connectedPeripheralId, pulseAnim]);

  // Start BLE notifications if connected
  useEffect(() => {
    if (isConnected && connectedPeripheralId) {
      GrainService.startSensorNotifications(connectedPeripheralId);

      const subscription = bleEmitter.addListener(
        'BleManagerDidUpdateValueForCharacteristic',
        handleBleData
      );

      return () => {
        subscription.remove();
        GrainService.stopSensorNotifications(connectedPeripheralId);
      };
    }
  }, [isConnected, connectedPeripheralId, handleBleData]);

  // Fallback to HTTP polling when not connected via BLE
  useEffect(() => {
    const fetchHttp = async () => {
      const data = await GrainService.getLatestReading();
      if (data) {
        setReading(data);
        if (dataSource !== 'ble') {
          setDataSource('http');
        }
        setLastUpdate(new Date());
      }
    };

    // If not connected via BLE, poll HTTP
    if (!isConnected) {
      fetchHttp();
      httpIntervalRef.current = setInterval(fetchHttp, 5000); // 5 second polling
    }

    return () => {
      if (httpIntervalRef.current) {
        clearInterval(httpIntervalRef.current);
        httpIntervalRef.current = null;
      }
    };
  }, [isConnected, dataSource]);

  // Pulsing animation for live monitoring indicator
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  if (!reading) {
    return (
      <View className="flex-1 bg-bg-dark items-center justify-center">
        <Text className="font-mono text-primary text-xs uppercase tracking-widest mb-4">
          AWAITING TELEMETRY...
        </Text>
        <TouchableOpacity
          onPress={async () => {
            if (isConnected && connectedPeripheralId) {
              const data = await GrainService.readSensorData(connectedPeripheralId);
              if (data) {
                setReading(data);
                setDataSource('ble');
                setLastUpdate(new Date());
              }
            }
          }}
          className="px-6 py-3 border border-primary rounded"
          style={{ borderRadius: 2 }}>
          <Text className="text-primary font-display font-bold uppercase text-sm">
            Request Data
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const score = reading.totalScore;
  const scoreColor =
    score >= 90 ? '#00FF66' : score >= 70 ? '#FFB300' : '#FF2A2A';
  const scoreGradient =
    score >= 90
      ? 'rgba(0, 255, 102, 0.15)'
      : score >= 70
      ? 'rgba(255, 179, 0, 0.15)'
      : 'rgba(255, 42, 42, 0.15)';

  return (
    <View className="flex-1 bg-bg-dark">
      {/* Header with Global Score */}
      <View className="pt-12 pb-8 items-center justify-center border-b border-border-color/50">
        <View className="flex-row items-center gap-2 mb-2">
          <Animated.View
            style={{
              opacity: pulseAnim,
            }}
            className="w-2 h-2 rounded-full bg-cyan-glow"
          />
          <Text className="font-mono text-[10px] tracking-widest text-cyan-glow uppercase">
            Live Monitoring
          </Text>
        </View>

        <Text
          className="font-display text-[120px] leading-none tracking-tight"
          style={{ color: scoreColor }}>
          {score}
        </Text>

        <Text className="text-white/50 text-xs font-medium tracking-[0.2em] uppercase mt-2">
          Global Quality Index
        </Text>

        {/* Sync Status */}
        <View className="mt-6 flex-row items-center gap-3 px-4 py-1.5 bg-surface border border-border-color rounded-full">
          <View className="w-4 h-4 items-center justify-center">
            <View className="w-3 h-3 rounded-full" style={{ backgroundColor: scoreColor }} />
          </View>
          <Text className="font-mono text-[11px] tracking-tighter text-white">
            SYNCED: {dataSource === 'ble' ? 'BLE_DEVICE' : 'HTTP_ENDPOINT'}
          </Text>
        </View>

        {/* Settings Button */}
        <TouchableOpacity
          onPress={() => router.push('/settings')}
          className="absolute top-12 right-4 w-10 h-10 items-center justify-center">
          <Settings size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Telemetry Grid */}
      <View className="px-4 py-6 flex-1">
        <View className="flex-row flex-wrap justify-between">
          {/* Temperature Card */}
          <View className="bg-surface border border-border-color p-4 w-[48%] mb-3" style={{ borderRadius: 2 }}>
            <View className="flex-row items-center justify-between mb-4">
              <Thermometer size={20} color="rgba(255,255,255,0.4)" />
              <Text className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                Temperature
              </Text>
            </View>
            <Animated.Text
              className="font-mono text-[28px] text-cyan-glow tracking-tighter"
              style={{
                transform: [{ scale: pulseAnim }],
                textShadowColor: 'rgba(0, 240, 255, 0.4)',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 10,
              }}>
              {reading.temperature}°C
            </Animated.Text>
            <View className="w-full h-[2px] bg-border-color mt-3 overflow-hidden">
              <View className="h-full bg-good" style={{ width: `${(reading.temperature / 50) * 100}%` }} />
            </View>
          </View>

          {/* Humidity Card */}
          <View className="bg-surface border border-border-color p-4 w-[48%] mb-3" style={{ borderRadius: 2 }}>
            <View className="flex-row items-center justify-between mb-4">
              <Droplets size={20} color="rgba(255,255,255,0.4)" />
              <Text className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                Humidity
              </Text>
            </View>
            <Animated.Text
              className="font-mono text-[28px] text-cyan-glow tracking-tighter"
              style={{
                transform: [{ scale: pulseAnim }],
                textShadowColor: 'rgba(0, 240, 255, 0.4)',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 10,
              }}>
              {reading.humidity}%
            </Animated.Text>
            <View className="w-full h-[2px] bg-border-color mt-3 overflow-hidden">
              <View className="h-full bg-good" style={{ width: `${reading.humidity}%` }} />
            </View>
          </View>

          {/* Moisture Card */}
          <View className="bg-surface border border-border-color p-4 w-[48%] mb-3" style={{ borderRadius: 2 }}>
            <View className="flex-row items-center justify-between mb-4">
              <Wheat size={20} color="rgba(255,255,255,0.4)" />
              <Text className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                Moisture
              </Text>
            </View>
            <Animated.Text
              className="font-mono text-[28px] text-cyan-glow tracking-tighter"
              style={{
                transform: [{ scale: pulseAnim }],
                textShadowColor: 'rgba(0, 240, 255, 0.4)',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 10,
              }}>
              {reading.grainMoisture}%
            </Animated.Text>
            <View className="w-full h-[2px] bg-border-color mt-3 overflow-hidden">
              <View
                className="h-full bg-warn"
                style={{ width: `${reading.grainMoisture}%` }}
              />
            </View>
          </View>

          {/* Gas Card */}
          <View className="bg-surface border border-border-color p-4 w-[48%] mb-3" style={{ borderRadius: 2 }}>
            <View className="flex-row items-center justify-between mb-4">
              <Wind size={20} color="rgba(255,255,255,0.4)" />
              <Text className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                CO2 Levels
              </Text>
            </View>
            <Animated.Text
              className="font-mono text-[28px] text-cyan-glow tracking-tighter"
              style={{
                transform: [{ scale: pulseAnim }],
                textShadowColor: 'rgba(0, 240, 255, 0.4)',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 10,
              }}>
              {reading.gasLevel}
              <Text className="text-xs ml-1">ppm</Text>
            </Animated.Text>
            <View className="w-full h-[2px] bg-border-color mt-3 overflow-hidden">
              <View className="h-full bg-good" style={{ width: '20%' }} />
            </View>
          </View>
        </View>
      </View>

      {/* Footer Timestamp */}
      <View className="px-6 py-4 items-center border-t border-border-color">
        <Text className="font-mono text-[10px] text-white/30 tracking-[0.3em] uppercase">
          LAST UPDATED: {lastUpdate ? lastUpdate.toLocaleTimeString() : '--:--:--'}
        </Text>
      </View>
    </View>
  );
}

