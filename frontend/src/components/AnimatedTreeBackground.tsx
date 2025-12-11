import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// Matrix-style characters
const MATRIX_CHARS = '01アイウエオ家族樹木葉根枝絆愛';

interface FallingCharProps {
  delay: number;
  left: number;
  duration: number;
  char: string;
}

const FallingChar: React.FC<FallingCharProps> = ({ delay, left, duration, char }) => {
  const translateY = useSharedValue(-30);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(height + 30, { duration }),
        -1,
        false
      )
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.6, { duration: duration * 0.1 }),
          withTiming(0.15, { duration: duration * 0.8 }),
          withTiming(0, { duration: duration * 0.1 })
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[styles.matrixChar, { left }, animatedStyle]}>
      {char}
    </Animated.Text>
  );
};

// Glowing particle/leaf
interface ParticleProps {
  startX: number;
  startY: number;
  delay: number;
  moveX: number;
  moveY: number;
}

const GlowingParticle: React.FC<ParticleProps> = ({ startX, startY, delay, moveX, moveY }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1500 }),
          withTiming(0.5, { duration: 1500 }),
          withTiming(0, { duration: 500 })
        ),
        -1,
        false
      )
    );
    
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.8, { duration: 800 }),
          withTiming(0.4, { duration: 2000 }),
          withTiming(0, { duration: 700 })
        ),
        -1,
        false
      )
    );

    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(moveX, { duration: 3000 }),
          withTiming(0, { duration: 0 })
        ),
        -1,
        false
      )
    );

    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(moveY, { duration: 3000 }),
          withTiming(0, { duration: 0 })
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.particle, { left: startX, top: startY }, animatedStyle]} />
  );
};

// Central pulsing element
const PulsingCenter: React.FC = () => {
  const opacity = useSharedValue(0.3);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 2500 }),
        withTiming(0.3, { duration: 2500 })
      ),
      -1,
      false
    );
    
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 2500 }),
        withTiming(0.9, { duration: 2500 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.pulsingCenter, animatedStyle]}>
      <View style={styles.centerDot} />
      <View style={styles.ring1} />
      <View style={styles.ring2} />
    </Animated.View>
  );
};

export const AnimatedTreeBackground: React.FC = () => {
  const centerX = width / 2;
  const centerY = height / 2;

  // Generate falling matrix characters
  const matrixChars = Array.from({ length: 18 }, (_, i) => ({
    left: (i * (width / 18)) + Math.random() * 20,
    delay: Math.random() * 5000,
    duration: 5000 + Math.random() * 4000,
    char: MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)],
  }));

  // Generate glowing particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    startX: centerX + (Math.random() - 0.5) * 300,
    startY: centerY + (Math.random() - 0.5) * 250,
    delay: i * 200 + Math.random() * 1000,
    moveX: (Math.random() - 0.5) * 50,
    moveY: -15 - Math.random() * 35,
  }));

  return (
    <View style={styles.container}>
      {/* Matrix rain */}
      {matrixChars.map((props, i) => (
        <FallingChar key={`char-${i}`} {...props} />
      ))}

      {/* Central pulsing element */}
      <PulsingCenter />

      {/* Particles (leaves/connections) */}
      {particles.map((props, i) => (
        <GlowingParticle key={`particle-${i}`} {...props} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  matrixChar: {
    position: 'absolute',
    fontSize: 14,
    color: '#D4AF37',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D4AF37',
  },
  pulsingCenter: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 150,
    height: 150,
    marginLeft: -75,
    marginTop: -75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#D4AF37',
    position: 'absolute',
  },
  ring1: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#D4AF37',
    position: 'absolute',
  },
  ring2: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    position: 'absolute',
  },
});

export default AnimatedTreeBackground;
