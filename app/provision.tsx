import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle, Eye, EyeOff, Loader2, Lock, Send, Wifi } from 'lucide-react-native';
import { useState } from 'react';
import {
    Alert,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { useBLE } from '@/hooks/useBLE';

export default function ProvisionScreen() {
  const router = useRouter();
  const { isConnected, connectedPeripheralId, sendWifiCredentials, disconnect, error } = useBLE();

  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [staticIP, setStaticIP] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!isConnected || !connectedPeripheralId) {
      Alert.alert('Error', 'No device connected. Please go back and select a device.');
      return;
    }
    if (!ssid.trim()) {
      Alert.alert('Error', 'Please enter the WiFi SSID.');
      return;
    }

    setLoading(true);
    try {
      const result = await sendWifiCredentials(ssid, password);
      if (result) {
        setSuccess(true);
        setTimeout(async () => {
          await disconnect();
          router.replace('/dashboard');
        }, 1500);
      } else {
        Alert.alert('Error', error || 'Failed to send credentials. Please try again.');
      }
    } catch {
      Alert.alert('Error', 'Failed to send credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-bg-dark items-center justify-center p-4">
      <View className="w-full max-w-md bg-surface border border-border-color rounded p-6 relative" style={{ borderRadius: 2 }}>
        {/* Header */}
        <View className="flex-row items-center mb-8">
          <TouchableOpacity
            onPress={() => router.back()}
            className="text-primary mr-4">
            <ArrowLeft size={30} color="#00E5FF" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="font-display text-2xl font-bold text-text-main tracking-wide uppercase">
              Provisioning
            </Text>
            <Text className="font-mono text-muted text-xs mt-1">
              NODE_ID: GRAIN_01_A
            </Text>
          </View>
        </View>

        {/* BLE Status */}
        <View className="mb-6 border-b border-border-color pb-4">
          <Text className="text-sm text-muted font-body mb-2">
            Connect sensor to network
          </Text>
          <View className="flex-row items-center gap-2">
            <View className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <Text className="font-mono text-xs text-primary">
              {isConnected ? 'BLE CONNECTED' : 'BLE DISCONNECTED'}
            </Text>
          </View>
        </View>

        {success ? (
          <View className="items-center py-8">
            <CheckCircle size={80} color="#00FF66" />
            <Text className="text-2xl font-display font-bold text-text-main mt-5">
              Credentials Sent!
            </Text>
            <Text className="text-sm text-muted mt-2">
              Redirecting to dashboard...
            </Text>
          </View>
        ) : (
          <>
            {/* SSID Input */}
            <View className="mb-6">
              <Text className="text-xs font-display font-bold text-muted mb-2 uppercase tracking-wider">
                Network Name (SSID)
              </Text>
              <View className="relative">
                <View className="absolute inset-y-0 left-0 pl-3 items-center justify-center">
                  <Wifi size={18} color="#64748B" />
                </View>
                <TextInput
                  className="w-full pl-10 pr-3 py-3 bg-bg-dark border border-border-color rounded text-text-main font-mono h-14"
                  style={{
                    borderRadius: 2,
                    
                  }}
                  placeholder="ENTER_SSID"
                  placeholderTextColor="#64748B"
                  value={ssid}
                  onChangeText={setSsid}
                  editable={!loading}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-6">
              <Text className="text-xs font-display font-bold text-muted mb-2 uppercase tracking-wider">
                Password
              </Text>
              <View className="relative">
                <View className="absolute inset-y-0 left-0 pl-3 items-center justify-center z-10">
                  <Lock size={18} color="#64748B" />
                </View>
                <TextInput
                  className="w-full pl-10 pr-12 py-3 bg-bg-dark border border-border-color rounded text-text-main font-mono h-14"
                  style={{
                    borderRadius: 2,
                    
                  }}
                  placeholder="********"
                  placeholderTextColor="#64748B"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 items-center justify-center">
                  {showPassword ? (
                    <EyeOff size={18} color="#64748B" />
                  ) : (
                    <Eye size={18} color="#64748B" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Static IP Toggle */}
            <View className="flex-row items-center justify-between py-2 mb-6">
              <Text className="text-xs text-muted font-body">
                Static IP Configuration
              </Text>
              <Switch
                value={staticIP}
                onValueChange={setStaticIP}
                trackColor={{ false: '#1E293B', true: '#00E5FF' }}
                thumbColor={staticIP ? '#00E5FF' : '#64748B'}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!isConnected || loading}
              className="w-full bg-primary h-14 rounded flex-row items-center justify-center gap-2 mt-8"
              style={{
                borderRadius: 2,
                opacity: !isConnected || loading ? 0.5 : 1,
                shadowColor: 'rgba(0,229,255,0.4)',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 1,
                shadowRadius: 10,
              }}>
              {loading ? (
                <>
                  <Loader2 size={18} color="#090A0F" />
                  <Text className="text-bg-dark font-display font-bold text-sm tracking-[1px] uppercase">
                    Transmitting...
                  </Text>
                </>
              ) : (
                <>
                  <Send size={18} color="#090A0F" />
                  <Text className="text-bg-dark font-display font-bold text-sm tracking-[1px] uppercase">
                    Transmit Data
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {loading && (
              <View className="text-center mt-4">
                <Text className="font-mono text-xs text-muted">
                  AWAITING TRANSMISSION...
                </Text>
              </View>
            )}
          </>
        )}

        {/* Decorative corners */}
        <View className="absolute top-0 right-0 w-16 h-16 border-t border-r border-border-color opacity-30" style={{ marginTop: -1, marginRight: -1 }} />
        <View className="absolute bottom-0 left-0 w-16 h-16 border-b border-l border-border-color opacity-30" style={{ marginBottom: -1, marginLeft: -1 }} />
      </View>
    </View>
  );
}

