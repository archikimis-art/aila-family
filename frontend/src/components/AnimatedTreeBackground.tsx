import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  interpolate,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// Matrix-style characters
const MATRIX_CHARS = '01アイウエオカキクケコ家族樹木葉根枝絆愛';

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
          withTiming(0.7, { duration: duration * 0.1 }),
          withTiming(0.2, { duration: duration * 0.8 }),
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
          withTiming(1, { duration: 800 }),
          withTiming(0.5, { duration: 2000 }),
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

// Pulsing glow line
interface GlowLineProps {
  startX: number;
  startY: number;
  length: number;
  angle: number;
  delay: number;
}

const GlowLine: React.FC<GlowLineProps> = ({ startX, startY, length, angle, delay }) => {
  const scaleX = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scaleX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1200 }),
          withTiming(1, { duration: 1500 }),
          withTiming(0, { duration: 800 })
        ),
        -1,
        false
      )
    );

    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.8, { duration: 600 }),
          withTiming(0.4, { duration: 2100 }),
          withTiming(0, { duration: 800 })
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${angle}deg` },
      { scaleX: scaleX.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.glowLine,
        { left: startX, top: startY, width: length },
        animatedStyle,
      ]}
    />
  );
};

// Central pulsing trunk
const PulsingTrunk: React.FC = () => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 2000 }),
        withTiming(0.3, { duration: 2000 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.trunk, animatedStyle]}>
      <View style={styles.trunkMain} />
      <View style={[styles.trunkBranch, styles.branchLeft]} />
      <View style={[styles.trunkBranch, styles.branchRight]} />
    </Animated.View>
  );
};

export const AnimatedTreeBackground: React.FC = () => {
  const centerX = width / 2;
  const centerY = height / 2;

  // Generate falling matrix characters
  const matrixChars = Array.from({ length: 20 }, (_, i) => ({
    left: (i * (width / 20)) + Math.random() * 30,
    delay: Math.random() * 4000,
    duration: 4000 + Math.random() * 3000,
    char: MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)],
  }));

  // Generate glowing particles around tree
  const particles = Array.from({ length: 25 }, (_, i) => ({
    startX: centerX + (Math.random() - 0.5) * 250,
    startY: centerY + (Math.random() - 0.5) * 200 + 50,
    delay: i * 150 + Math.random() * 800,
    moveX: (Math.random() - 0.5) * 60,
    moveY: -20 - Math.random() * 40,
  }));

  // Generate glow lines (branches)
  const lines = Array.from({ length: 12 }, (_, i) => ({
    startX: centerX + (Math.random() - 0.5) * 80,
    startY: centerY + Math.random() * 150,
    length: 40 + Math.random() * 80,
    angle: -90 + (Math.random() - 0.5) * 120,
    delay: i * 300 + Math.random() * 1000,
  }));

  return (
    <View style={styles.container}>
      {/* Matrix rain */}
      {matrixChars.map((props, i) => (
        <FallingChar key={`char-${i}`} {...props} />
      ))}

      {/* Central trunk */}
      <PulsingTrunk />

      {/* Glow lines (branches) */}
      {lines.map((props, i) => (
        <GlowLine key={`line-${i}`} {...props} />
      ))}

      {/* Particles (leaves) */}
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
    fontSize: 16,
    color: '#D4AF37',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    opacity: 0.5,
  },
  particle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D4AF37',
  },
  glowLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#D4AF37',
    transformOrigin: 'left center',
  },
  trunk: {
    position: 'absolute',
    left: '50%',
    bottom: '25%',
    width: 4,
    height: '35%',
    marginLeft: -2,
  },
  trunkMain: {
    position: 'absolute',
    width: 3,
    height: '100%',
    backgroundColor: '#D4AF37',
    left: '50%',
    marginLeft: -1.5,
  },
  trunkBranch: {
    position: 'absolute',
    width: 2,
    height: '50%',
    backgroundColor: '#D4AF37',
    bottom: '40%',
    left: '50%',
    marginLeft: -1,
  },
  branchLeft: {
    transform: [{ rotate: '-35deg' }],
  },
  branchRight: {
    transform: [{ rotate: '35deg' }],
  },
});

export default AnimatedTreeBackground;
