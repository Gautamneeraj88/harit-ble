import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

interface RadarProps {
  isScanning: boolean;
  size?: number;
}

export function Radar({ isScanning, size = 256 }: RadarProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;

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

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View className="relative items-center justify-center" style={{ width: size, height: size }}>
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
            width: size,
            height: size,
            transform: [{ rotate: rotation }],
          }}>
          <View className="w-full h-full rounded-full bg-primary" style={{ opacity: 0.2 }} />
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
    </View>
  );
}
