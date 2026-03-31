import { useBLE } from '@/hooks/useBLE';
import { useRouter } from 'expo-router';
import {
    AlertTriangle,
    BatteryCharging,
    Clock,
    Cpu,
    Link2Off,
    Power,
    Signal,
    Wifi
} from 'lucide-react-native';
import { useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function NodeSettingsScreen() {
  const router = useRouter();
  const { isConnected, disconnect } = useBLE();
  const [showRebootModal, setShowRebootModal] = useState(false);

  // Mock data - replace with real data from BLE
  const diagnostics = {
    battery: '87%',
    firmware: 'v2.4.1',
    uptime: '142 hrs',
    ssid: 'AGRI_NET_5G',
    rssi: '-65 dBm',
  };

  const handleDisconnect = async () => {
    await disconnect();
    router.back();
  };

  const handleReboot = () => {
    setShowRebootModal(true);
  };

  const confirmReboot = () => {
    // TODO: Send reboot command via BLE
    setShowRebootModal(false);
    router.back();
  };

  return (
    <View className="flex-1 bg-bg-dark">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-border-color">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-12 h-12 items-center justify-center">
          <Text className="text-primary text-2xl">←</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-text-main text-xl font-display font-bold tracking-tight ml-2">
          Node Settings
        </Text>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 p-4">
        {/* Hardware Diagnostics */}
        <View className="mb-6">
          <Text className="text-xs font-display font-bold text-muted uppercase tracking-widest mb-2 px-1">
            Hardware Diagnostics
          </Text>
          <View className="bg-surface border border-border-color rounded">
            {/* Battery */}
            <View className="flex-row justify-between items-center p-4 border-b border-border-color">
              <View className="flex-row items-center gap-3">
                <BatteryCharging size={20} color="#64748B" />
                <Text className="text-muted text-sm font-medium">Battery Life</Text>
              </View>
              <Text className="font-mono text-text-main text-lg" style={{ textShadowColor: 'rgba(241, 245, 249, 0.2)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 }}>
                {diagnostics.battery}
              </Text>
            </View>

            {/* Firmware */}
            <View className="flex-row justify-between items-center p-4 border-b border-border-color">
              <View className="flex-row items-center gap-3">
                <Cpu size={20} color="#64748B" />
                <Text className="text-muted text-sm font-medium">Firmware Version</Text>
              </View>
              <Text className="font-mono text-text-main text-lg" style={{ textShadowColor: 'rgba(241, 245, 249, 0.2)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 }}>
                {diagnostics.firmware}
              </Text>
            </View>

            {/* Uptime */}
            <View className="flex-row justify-between items-center p-4">
              <View className="flex-row items-center gap-3">
                <Clock size={20} color="#64748B" />
                <Text className="text-muted text-sm font-medium">System Uptime</Text>
              </View>
              <Text className="font-mono text-text-main text-lg" style={{ textShadowColor: 'rgba(241, 245, 249, 0.2)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 }}>
                {diagnostics.uptime}
              </Text>
            </View>
          </View>
        </View>

        {/* Connection Details */}
        <View className="mb-6">
          <Text className="text-xs font-display font-bold text-muted uppercase tracking-widest mb-2 px-1">
            Connection Details
          </Text>
          <View className="bg-surface border border-border-color rounded">
            {/* SSID */}
            <View className="flex-row justify-between items-center p-4 border-b border-border-color">
              <View className="flex-row items-center gap-3">
                <Wifi size={20} color="#64748B" />
                <Text className="text-muted text-sm font-medium">SSID</Text>
              </View>
              <Text className="font-mono text-text-main text-base">{diagnostics.ssid}</Text>
            </View>

            {/* RSSI */}
            <View className="flex-row justify-between items-center p-4">
              <View className="flex-row items-center gap-3">
                <Signal size={20} color="#64748B" />
                <Text className="text-muted text-sm font-medium">RSSI</Text>
              </View>
              <Text className="font-mono text-text-main text-base">{diagnostics.rssi}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View className="p-6 border-t border-border-color">
        <TouchableOpacity
          onPress={handleDisconnect}
          className="w-full h-14 bg-transparent border border-primary rounded flex-row items-center justify-center gap-2 mb-4"
          style={{ borderRadius: 2 }}>
          <Link2Off size={20} color="#00E5FF" />
          <Text className="text-primary font-display font-bold text-[15px] tracking-[1px] uppercase">
            Disconnect
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleReboot}
          className="w-full h-14 bg-surface border border-critical rounded flex-row items-center justify-center gap-2"
          style={{ borderRadius: 2 }}>
          <Power size={20} color="#FF2A2A" />
          <Text className="text-critical font-display font-bold text-[15px] tracking-[1px] uppercase">
            Reboot Hardware
          </Text>
        </TouchableOpacity>
      </View>

      {/* Reboot Confirmation Modal */}
      <Modal
        visible={showRebootModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRebootModal(false)}>
        <View className="flex-1 bg-black/80 items-center justify-center p-4">
          <View className="bg-surface border border-border-color rounded w-full max-w-sm p-6" style={{ borderRadius: 2 }}>
            <View className="flex-row items-center gap-3 mb-4">
              <AlertTriangle size={30} color="#FF2A2A" />
              <Text className="font-display font-bold text-xl text-text-main">
                Confirm Reboot
              </Text>
            </View>

            <Text className="text-muted text-sm leading-relaxed mb-6">
              Are you sure you want to restart this node? Data polling will be interrupted and
              connection must be re-established.
            </Text>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowRebootModal(false)}
                className="flex-1 h-12 bg-transparent border border-muted rounded items-center justify-center"
                style={{ borderRadius: 2 }}>
                <Text className="text-muted font-display font-bold text-[13px] tracking-[1px] uppercase">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={confirmReboot}
                className="flex-1 h-12 bg-critical rounded items-center justify-center"
                style={{ borderRadius: 2 }}>
                <Text className="text-white font-display font-bold text-[13px] tracking-[1px] uppercase">
                  Confirm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
