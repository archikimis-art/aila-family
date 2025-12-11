import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// Matrix-style falling characters
const MATRIX_CHARS = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
const NUM_COLUMNS = Math.floor(width / 20);
const NUM_PARTICLES = 30;

interface FallingCharProps {
  delay: number;
  column: number;
  speed: number;
}

const FallingChar: React.FC<FallingCharProps> = ({ delay, column, speed }) => {
  const translateY = useSharedValue(-50);
  const opacity = useSharedValue(0);
  const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(height + 50, { duration: speed, easing: Easing.linear }),
        -1,
        false
      )
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.8, { duration: speed * 0.1 }),
          withTiming(0.3, { duration: speed * 0.8 }),
          withTiming(0, { duration: speed * 0.1 })
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
    <Animated.Text
      style={[
        styles.matrixChar,
        { left: column * 20 },
        animatedStyle,
      ]}
    >
      {char}
    </Animated.Text>
  );
};

// Growing branch/leaf particle
interface LeafParticleProps {
  startX: number;
  startY: number;
  delay: number;
  direction: 'left' | 'right';
}

const LeafParticle: React.FC<LeafParticleProps> = ({ startX, startY, delay, direction }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    const xOffset = direction === 'left' ? -30 : 30;
    
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.2, { duration: 2000, easing: Easing.out(Easing.cubic) }),
          withTiming(0.8, { duration: 1000 }),
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
          withTiming(1, { duration: 1000 }),
          withTiming(0.6, { duration: 2000 }),
          withTiming(0, { duration: 500 })
        ),
        -1,
        false
      )
    );

    translateX.value = withDelay(
      delay,
      withRepeat(
        withTiming(xOffset, { duration: 3500, easing: Easing.out(Easing.cubic) }),
        -1,
        false
      )
    );

    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(-40, { duration: 3500, easing: Easing.out(Easing.cubic) }),
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
    <Animated.View
      style={[
        styles.leaf,
        { left: startX, top: startY },
        animatedStyle,
      ]}
    />
  );
};

// Glowing connection line
interface ConnectionLineProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  delay: number;
}

const ConnectionLine: React.FC<ConnectionLineProps> = ({ startX, startY, endX, endY, delay }) => {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);

  const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
  const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) }),
          withTiming(1, { duration: 2000 }),
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
          withTiming(0.8, { duration: 500 }),
          withTiming(0.4, { duration: 2500 }),
          withTiming(0, { duration: 500 })
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    width: interpolate(progress.value, [0, 1], [0, length]),
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.connectionLine,
        {
          left: startX,
          top: startY,
          transform: [{ rotate: `${angle}deg` }],
        },
        animatedStyle,
      ]}
    />
  );
};

// Main tree trunk that pulses
const TreeTrunk: React.FC = () => {
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 2000, easing: Easing.inOut(Easing.sine) }),
        withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.sine) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <Animated.View style={[styles.treeTrunk, animatedStyle]}>
      <View style={styles.trunkLine} />
      <View style={[styles.trunkLine, styles.trunkLine2]} />
      <View style={[styles.trunkLine, styles.trunkLine3]} />
    </Animated.View>
  );
};

export const AnimatedTreeBackground: React.FC = () => {
  // Generate matrix rain columns
  const matrixColumns = Array.from({ length: NUM_COLUMNS }, (_, i) => ({
    column: i,
    delay: Math.random() * 5000,
    speed: 3000 + Math.random() * 4000,
  }));

  // Generate leaf particles around center
  const centerX = width / 2;
  const centerY = height / 2;
  
  const leafParticles = Array.from({ length: NUM_PARTICLES }, (_, i) => ({
    startX: centerX + (Math.random() - 0.5) * 200,
    startY: centerY + (Math.random() - 0.5) * 300 + 100,
    delay: i * 200 + Math.random() * 1000,
    direction: (Math.random() > 0.5 ? 'left' : 'right') as 'left' | 'right',
  }));

  // Generate connection lines
  const connections = Array.from({ length: 15 }, (_, i) => ({
    startX: centerX + (Math.random() - 0.5) * 100,
    startY: centerY + Math.random() * 200,
    endX: centerX + (Math.random() - 0.5) * 300,
    endY: centerY + Math.random() * 200 - 100,
    delay: i * 400 + Math.random() * 2000,
  }));

  return (
    <View style={styles.container}>
      {/* Matrix rain effect - subtle */}
      <View style={styles.matrixContainer}>
        {matrixColumns.slice(0, 15).map((col, i) => (
          <FallingChar key={i} {...col} />
        ))}
      </View>

      {/* Central tree structure */}
      <TreeTrunk />

      {/* Growing connections */}
      {connections.map((conn, i) => (
        <ConnectionLine key={`conn-${i}`} {...conn} />
      ))}

      {/* Leaf particles */}
      {leafParticles.map((leaf, i) => (
        <LeafParticle key={`leaf-${i}`} {...leaf} />
      ))}

      {/* Gradient overlay */}
      <View style={styles.gradientOverlay} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  matrixContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  matrixChar: {
    position: 'absolute',
    fontSize: 14,
    color: '#D4AF37',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textShadowColor: '#D4AF37',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  treeTrunk: {
    position: 'absolute',
    left: '50%',
    bottom: '20%',
    width: 4,
    height: '40%',
    marginLeft: -2,
  },
  trunkLine: {
    position: 'absolute',
    width: 2,
    height: '100%',
    backgroundColor: '#D4AF37',
    left: '50%',
    marginLeft: -1,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  trunkLine2: {
    height: '60%',
    transform: [{ rotate: '-30deg' }],
    transformOrigin: 'bottom',
    bottom: '30%',
  },
  trunkLine3: {
    height: '60%',
    transform: [{ rotate: '30deg' }],
    transformOrigin: 'bottom',
    bottom: '30%',
  },
  leaf: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D4AF37',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  connectionLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: '#D4AF37',
    transformOrigin: 'left center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
});

export default AnimatedTreeBackground;
