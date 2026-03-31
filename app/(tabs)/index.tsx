import { useRouter } from 'expo-router';
import { Bluetooth, LayoutDashboard, Wheat } from 'lucide-react-native';
import { Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-bg-dark px-6">
      <Wheat size={80} color="#00E5FF" />
      <Text className="text-3xl font-display font-bold my-8 text-text-main tracking-wide">
        Grain Quality Monitor
      </Text>

      <TouchableOpacity
        onPress={() => router.push('/scanner')}
        className="flex-row bg-primary p-4 rounded w-4/5 justify-center items-center mb-4"
        style={{
          borderRadius: 2,
          shadowColor: 'rgba(0,229,255,0.3)',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1,
          shadowRadius: 15,
        }}>
        <Bluetooth color="#090A0F" size={20} />
        <Text className="text-bg-dark font-display font-bold ml-3 text-[15px] uppercase tracking-[1px]">
          Setup New Device
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/dashboard')}
        className="flex-row bg-transparent border-2 border-primary p-4 rounded w-4/5 justify-center items-center"
        style={{ borderRadius: 2 }}>
        <LayoutDashboard color="#00E5FF" size={20} />
        <Text className="text-primary font-display font-bold ml-3 text-[15px] uppercase tracking-[1px]">
          View Dashboard
        </Text>
      </TouchableOpacity>
    </View>
  );
}

