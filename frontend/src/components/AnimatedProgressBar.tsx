import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface AnimatedProgressBarProps {
  progress: number; // 0-100
  color?: string;
  backgroundColor?: string;
  height?: number;
  animated?: boolean;
}

export default function AnimatedProgressBar({
  progress,
  color = '#D4AF37',
  backgroundColor = 'rgba(255,255,255,0.1)',
  height = 8,
  animated = true,
}: AnimatedProgressBarProps) {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animated) {
      // Animate the progress bar width
      Animated.timing(widthAnim, {
        toValue: progress,
        duration: 800,
        useNativeDriver: false, // width can't use native driver
      }).start();

      // Add a subtle pulse when progress is updated
      if (progress > 0) {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      }
    } else {
      widthAnim.setValue(progress);
    }
  }, [progress, animated]);

  const animatedWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor, 
          height,
          borderRadius: height / 2,
          transform: [{ scaleY: pulseAnim }],
        }
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            backgroundColor: color,
            width: animatedWidth,
            height,
            borderRadius: height / 2,
          },
        ]}
      />
      {/* Shimmer effect */}
      {progress > 0 && progress < 100 && (
        <View style={[styles.shimmer, { height }]} />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  shimmer: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});
