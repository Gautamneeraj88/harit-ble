import { ReactNode } from 'react';
import { Text, View } from 'react-native';

interface TelemetryCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  progress?: number;
  progressColor?: string;
  animated?: boolean;
}

export function TelemetryCard({
  icon,
  label,
  value,
  progress = 0,
  progressColor = '#00FF66',
  animated = false,
}: TelemetryCardProps) {
  return (
    <View className="bg-surface border border-border-color p-4 w-[48%] mb-3" style={{ borderRadius: 2 }}>
      <View className="flex-row items-center justify-between mb-4">
        <View className="opacity-40">{icon}</View>
        <Text className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
          {label}
        </Text>
      </View>
      <Text
        className="font-mono text-[28px] text-cyan-glow tracking-tighter"
        style={{
          textShadowColor: 'rgba(0, 240, 255, 0.4)',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 10,
        }}>
        {value}
      </Text>
      {progress > 0 && (
        <View className="w-full h-[2px] bg-border-color mt-3 overflow-hidden">
          <View className="h-full" style={{ width: `${progress}%`, backgroundColor: progressColor }} />
        </View>
      )}
    </View>
  );
}
