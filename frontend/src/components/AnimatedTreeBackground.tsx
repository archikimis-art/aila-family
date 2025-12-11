import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const isLargeScreen = width > 768;

// Falling leaf (Matrix style)
interface FallingLeafProps {
  delay: number;
  left: number;
  duration: number;
  size: number;
}

const FallingLeaf: React.FC<FallingLeafProps> = ({ delay, left, duration, size }) => {
  const translateY = useSharedValue(-50);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(height + 50, { duration }),
        -1,
        false
      )
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.9, { duration: duration * 0.1 }),
          withTiming(0.5, { duration: duration * 0.7 }),
          withTiming(0, { duration: duration * 0.2 })
        ),
        -1,
        false
      )
    );
    rotation.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(360, { duration: duration }),
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.fallingLeaf, { left, width: size, height: size * 1.3 }, animatedStyle]} />
  );
};

// Matrix character falling
interface MatrixCharProps {
  delay: number;
  left: number;
  duration: number;
  char: string;
}

const MatrixChar: React.FC<MatrixCharProps> = ({ delay, left, duration, char }) => {
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
          withTiming(0.8, { duration: duration * 0.1 }),
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

// Tree trunk segment
const TrunkSegment: React.FC<{ delay: number; bottom: number; h: number; left: number }> = ({ delay, bottom, h, left }) => {
  const scaleY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scaleY.value = withDelay(delay, withTiming(1, { duration: 1200 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 800 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: scaleY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.trunkSegment, { bottom, height: h, left }, animatedStyle]} />
  );
};

// Branch
interface BranchProps {
  startX: number;
  startY: number;
  length: number;
  angle: number;
  delay: number;
  thickness: number;
}

const Branch: React.FC<BranchProps> = ({ startX, startY, length, angle, delay, thickness }) => {
  const scaleX = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scaleX.value = withDelay(delay, withTiming(1, { duration: 1000 }));
    opacity.value = withDelay(delay, withTiming(0.9, { duration: 700 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: scaleX.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.branch,
        {
          left: startX,
          bottom: startY,
          width: length,
          height: thickness,
          transform: [{ rotate: `${angle}deg` }],
        },
        animatedStyle,
      ]}
    />
  );
};

// Root
interface RootProps {
  startX: number;
  length: number;
  angle: number;
  delay: number;
  bottom: number;
}

const Root: React.FC<RootProps> = ({ startX, length, angle, delay, bottom }) => {
  const scaleX = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scaleX.value = withDelay(delay, withTiming(1, { duration: 1300 }));
    opacity.value = withDelay(delay, withTiming(0.7, { duration: 900 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: scaleX.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.root,
        {
          left: startX,
          bottom,
          width: length,
          transform: [{ rotate: `${angle}deg` }],
        },
        animatedStyle,
      ]}
    />
  );
};

// Growing leaf on tree
interface TreeLeafProps {
  x: number;
  y: number;
  delay: number;
  size: number;
}

const TreeLeaf: React.FC<TreeLeafProps> = ({ x, y, delay, size }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.2, { duration: 1500 }),
          withTiming(0.9, { duration: 1000 }),
          withTiming(1.1, { duration: 1000 }),
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
          withTiming(1, { duration: 1200 }),
          withTiming(0.7, { duration: 1800 }),
          withTiming(0, { duration: 800 })
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.treeLeaf, { left: x, bottom: y, width: size, height: size * 1.4 }, animatedStyle]} />
  );
};

// Glowing particle
interface ParticleProps {
  x: number;
  y: number;
  delay: number;
}

const GlowParticle: React.FC<ParticleProps> = ({ x, y, delay }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-100, { duration: 3500 }),
          withTiming(0, { duration: 0 })
        ),
        -1,
        false
      )
    );
    
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(0.4, { duration: 2500 }),
          withTiming(0, { duration: 500 })
        ),
        -1,
        false
      )
    );

    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.5, { duration: 1000 }),
          withTiming(0.5, { duration: 2500 })
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.glowParticle, { left: x, bottom: y }, animatedStyle]} />
  );
};

const MATRIX_CHARS = '01家族樹葉根枝愛絆命';

export const AnimatedTreeBackground: React.FC = () => {
  // Tree positioned on the right side
  const treeX = width * 0.75;
  const treeBottom = height * 0.08;

  // Matrix characters falling
  const matrixChars = Array.from({ length: 25 }, (_, i) => ({
    left: (i * (width / 25)) + Math.random() * 15,
    delay: Math.random() * 6000,
    duration: 5000 + Math.random() * 4000,
    char: MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)],
  }));

  // Falling leaves
  const fallingLeaves = Array.from({ length: 20 }, (_, i) => ({
    left: Math.random() * width,
    delay: Math.random() * 8000,
    duration: 6000 + Math.random() * 5000,
    size: 8 + Math.random() * 10,
  }));

  // Tree trunk segments
  const trunkSegments = [
    { delay: 0, bottom: treeBottom, h: 80, left: treeX },
    { delay: 200, bottom: treeBottom + 75, h: 70, left: treeX },
    { delay: 400, bottom: treeBottom + 140, h: 60, left: treeX },
    { delay: 600, bottom: treeBottom + 195, h: 50, left: treeX },
    { delay: 800, bottom: treeBottom + 240, h: 45, left: treeX },
  ];

  // Branches
  const branches = [
    // Left branches
    { startX: treeX - 5, startY: treeBottom + 250, length: 100, angle: 145, delay: 1000, thickness: 6 },
    { startX: treeX - 70, startY: treeBottom + 280, length: 70, angle: 160, delay: 1300, thickness: 4 },
    { startX: treeX - 40, startY: treeBottom + 200, length: 80, angle: 135, delay: 1500, thickness: 5 },
    { startX: treeX - 90, startY: treeBottom + 240, length: 50, angle: 155, delay: 1700, thickness: 3 },
    { startX: treeX - 20, startY: treeBottom + 160, length: 60, angle: 140, delay: 1900, thickness: 4 },
    // Right branches
    { startX: treeX + 10, startY: treeBottom + 250, length: 100, angle: 35, delay: 1100, thickness: 6 },
    { startX: treeX + 70, startY: treeBottom + 280, length: 70, angle: 20, delay: 1400, thickness: 4 },
    { startX: treeX + 35, startY: treeBottom + 200, length: 80, angle: 45, delay: 1600, thickness: 5 },
    { startX: treeX + 85, startY: treeBottom + 240, length: 50, angle: 25, delay: 1800, thickness: 3 },
    { startX: treeX + 15, startY: treeBottom + 160, length: 60, angle: 40, delay: 2000, thickness: 4 },
    // Top branches
    { startX: treeX - 8, startY: treeBottom + 280, length: 60, angle: 110, delay: 2100, thickness: 4 },
    { startX: treeX + 8, startY: treeBottom + 285, length: 60, angle: 70, delay: 2200, thickness: 4 },
  ];

  // Roots
  const roots = [
    { startX: treeX, length: 90, angle: 200, delay: 300, bottom: treeBottom },
    { startX: treeX - 5, length: 80, angle: 215, delay: 450, bottom: treeBottom - 5 },
    { startX: treeX + 5, length: 90, angle: -20, delay: 350, bottom: treeBottom },
    { startX: treeX + 10, length: 75, angle: -35, delay: 500, bottom: treeBottom - 5 },
    { startX: treeX, length: 70, angle: 185, delay: 550, bottom: treeBottom - 10 },
    { startX: treeX, length: 65, angle: -5, delay: 600, bottom: treeBottom - 10 },
    { startX: treeX - 8, length: 50, angle: 230, delay: 650, bottom: treeBottom - 15 },
    { startX: treeX + 8, length: 50, angle: -50, delay: 700, bottom: treeBottom - 15 },
  ];

  // Tree leaves
  const treeLeaves = [
    // Left side
    { x: treeX - 130, y: treeBottom + 300, delay: 2300, size: 18 },
    { x: treeX - 110, y: treeBottom + 320, delay: 2500, size: 16 },
    { x: treeX - 150, y: treeBottom + 280, delay: 2700, size: 14 },
    { x: treeX - 90, y: treeBottom + 260, delay: 2900, size: 17 },
    { x: treeX - 70, y: treeBottom + 310, delay: 3100, size: 15 },
    { x: treeX - 120, y: treeBottom + 250, delay: 3300, size: 13 },
    { x: treeX - 80, y: treeBottom + 220, delay: 3500, size: 14 },
    // Right side
    { x: treeX + 110, y: treeBottom + 300, delay: 2400, size: 18 },
    { x: treeX + 130, y: treeBottom + 320, delay: 2600, size: 16 },
    { x: treeX + 90, y: treeBottom + 280, delay: 2800, size: 14 },
    { x: treeX + 150, y: treeBottom + 260, delay: 3000, size: 17 },
    { x: treeX + 70, y: treeBottom + 310, delay: 3200, size: 15 },
    { x: treeX + 100, y: treeBottom + 250, delay: 3400, size: 13 },
    { x: treeX + 60, y: treeBottom + 220, delay: 3600, size: 14 },
    // Top
    { x: treeX - 40, y: treeBottom + 340, delay: 3700, size: 20 },
    { x: treeX + 30, y: treeBottom + 345, delay: 3800, size: 19 },
    { x: treeX - 10, y: treeBottom + 350, delay: 3900, size: 16 },
    { x: treeX + 50, y: treeBottom + 330, delay: 4000, size: 17 },
    { x: treeX - 60, y: treeBottom + 335, delay: 4100, size: 15 },
  ];

  // Glowing particles
  const particles = Array.from({ length: 30 }, (_, i) => ({
    x: treeX + (Math.random() - 0.5) * 300,
    y: treeBottom + 100 + Math.random() * 200,
    delay: 1500 + i * 150,
  }));

  return (
    <View style={styles.container}>
      {/* Large glow behind tree */}
      <View style={[styles.treeGlow, { left: treeX - 200, bottom: treeBottom + 100 }]} />
      <View style={[styles.treeGlowSmall, { left: treeX - 100, bottom: treeBottom + 180 }]} />

      {/* Matrix characters */}
      {matrixChars.map((props, i) => (
        <MatrixChar key={`matrix-${i}`} {...props} />
      ))}

      {/* Falling leaves */}
      {fallingLeaves.map((props, i) => (
        <FallingLeaf key={`falling-${i}`} {...props} />
      ))}

      {/* Roots */}
      {roots.map((root, i) => (
        <Root key={`root-${i}`} {...root} />
      ))}

      {/* Trunk */}
      {trunkSegments.map((segment, i) => (
        <TrunkSegment key={`trunk-${i}`} {...segment} />
      ))}

      {/* Branches */}
      {branches.map((branch, i) => (
        <Branch key={`branch-${i}`} {...branch} />
      ))}

      {/* Tree Leaves */}
      {treeLeaves.map((leaf, i) => (
        <TreeLeaf key={`treeleaf-${i}`} {...leaf} />
      ))}

      {/* Glowing particles */}
      {particles.map((particle, i) => (
        <GlowParticle key={`particle-${i}`} {...particle} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  treeGlow: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
  },
  treeGlowSmall: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
  },
  matrixChar: {
    position: 'absolute',
    fontSize: 16,
    color: '#FFD700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: 'bold',
  },
  fallingLeaf: {
    position: 'absolute',
    backgroundColor: '#D4AF37',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 50,
  },
  trunkSegment: {
    position: 'absolute',
    width: 12,
    marginLeft: -6,
    backgroundColor: '#CD853F',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DAA520',
  },
  branch: {
    position: 'absolute',
    backgroundColor: '#CD853F',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#DAA520',
  },
  root: {
    position: 'absolute',
    height: 4,
    backgroundColor: '#8B7355',
    borderRadius: 2,
  },
  treeLeaf: {
    position: 'absolute',
    backgroundColor: '#FFD700',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 50,
  },
  glowParticle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD700',
  },
});

export default AnimatedTreeBackground;
