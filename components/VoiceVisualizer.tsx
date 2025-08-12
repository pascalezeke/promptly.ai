import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';

const { width } = Dimensions.get('window');
const BARS_COUNT = 20;

interface VoiceVisualizerProps {
  isActive: boolean;
}

export function VoiceVisualizer({ isActive }: VoiceVisualizerProps) {
  const { theme } = useTheme();
  const animations = Array.from({ length: BARS_COUNT }, () => useSharedValue(0));

  useEffect(() => {
    animations.forEach((animation, index) => {
      if (isActive) {
        animation.value = withRepeat(
          withTiming(Math.random(), { duration: 300 + index * 50 }),
          -1,
          true
        );
      } else {
        animation.value = withTiming(0, { duration: 200 });
      }
    });
  }, [isActive]);

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.visualizer}>
        {animations.map((animation, index) => {
          const animatedStyle = useAnimatedStyle(() => {
            const height = interpolate(
              animation.value,
              [0, 1],
              [4, 40]
            );
            return {
              height,
            };
          });

          return (
            <Animated.View
              key={index}
              style={[styles.bar, animatedStyle]}
            />
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    width: width - 48,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  visualizer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 2,
    height: 40,
  },
  bar: {
    width: 3,
    backgroundColor: '#6750A4',
    borderRadius: 1.5,
    minHeight: 4,
  },
});