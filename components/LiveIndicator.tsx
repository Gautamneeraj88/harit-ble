import { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';

interface LiveIndicatorProps {
  label?: string;
  color?: string;
}

export function LiveIndicator({ label = 'Live Monitoring', color = '#00F0FF' }: LiveIndicatorProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
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
    ).start();
  }, [pulseAnim]);

  return (
    <View className="flex-row items-center gap-2">
      <Animated.View
        className="w-2 h-2 rounded-full"
        // @ts-ignore
        style={{ backgroundColor: color, opacity: pulseAnim }}
      />
      <Text
        className="font-mono text-[10px] tracking-widest uppercase"
        style={{ color }}>
        {label}
      </Text>
    </View>
  );
}
