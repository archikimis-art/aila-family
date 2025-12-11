import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// Trunk segment component
const TrunkSegment: React.FC<{ delay: number; bottom: number; height: number }> = ({ delay, bottom, height: h }) => {
  const scaleY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scaleY.value = withDelay(delay, withTiming(1, { duration: 1500 }));
    opacity.value = withDelay(delay, withTiming(0.8, { duration: 1000 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: scaleY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.trunkSegment, { bottom, height: h }, animatedStyle]} />
  );
};

// Branch component
interface BranchProps {
  startX: number;
  startY: number;
  length: number;
  angle: number;
  delay: number;
  thickness?: number;
}

const Branch: React.FC<BranchProps> = ({ startX, startY, length, angle, delay, thickness = 3 }) => {
  const scaleX = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scaleX.value = withDelay(delay, withTiming(1, { duration: 1200 }));
    opacity.value = withDelay(delay, withTiming(0.7, { duration: 800 }));
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

// Root component
interface RootProps {
  startX: number;
  length: number;
  angle: number;
  delay: number;
}

const Root: React.FC<RootProps> = ({ startX, length, angle, delay }) => {
  const scaleX = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scaleX.value = withDelay(delay, withTiming(1, { duration: 1500 }));
    opacity.value = withDelay(delay, withTiming(0.5, { duration: 1000 }));
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
          bottom: 80,
          width: length,
          transform: [{ rotate: `${angle}deg` }],
        },
        animatedStyle,
      ]}
    />
  );
};

// Leaf component
interface LeafProps {
  x: number;
  y: number;
  delay: number;
  size?: number;
}

const Leaf: React.FC<LeafProps> = ({ x, y, delay, size = 12 }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2000 }),
          withTiming(0.8, { duration: 1500 }),
          withTiming(1.1, { duration: 1500 }),
          withTiming(0, { duration: 1000 })
        ),
        -1,
        false
      )
    );
    
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.9, { duration: 1500 }),
          withTiming(0.6, { duration: 2500 }),
          withTiming(0, { duration: 1000 })
        ),
        -1,
        false
      )
    );

    rotation.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(15, { duration: 2000 }),
          withTiming(-15, { duration: 2000 }),
          withTiming(0, { duration: 1000 })
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.leaf, { left: x, bottom: y, width: size, height: size * 1.3 }, animatedStyle]} />
  );
};

// Glowing particle that floats up
interface ParticleProps {
  x: number;
  y: number;
  delay: number;
}

const FloatingParticle: React.FC<ParticleProps> = ({ x, y, delay }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-80, { duration: 3000 }),
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
          withTiming(0.8, { duration: 500 }),
          withTiming(0.3, { duration: 2000 }),
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
          withTiming(1, { duration: 500 }),
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
    <Animated.View style={[styles.particle, { left: x, bottom: y }, animatedStyle]} />
  );
};

export const AnimatedTreeBackground: React.FC = () => {
  const centerX = width / 2;
  const treeBottom = height * 0.12;

  // Tree trunk segments (growing from bottom)
  const trunkSegments = [
    { delay: 0, bottom: treeBottom, height: 60 },
    { delay: 300, bottom: treeBottom + 55, height: 50 },
    { delay: 600, bottom: treeBottom + 100, height: 45 },
    { delay: 900, bottom: treeBottom + 140, height: 40 },
    { delay: 1200, bottom: treeBottom + 175, height: 35 },
  ];

  // Main branches
  const branches = [
    // Left branches
    { startX: centerX - 15, startY: treeBottom + 180, length: 80, angle: 140, delay: 1500, thickness: 4 },
    { startX: centerX - 60, startY: treeBottom + 200, length: 50, angle: 160, delay: 1800, thickness: 3 },
    { startX: centerX - 30, startY: treeBottom + 150, length: 60, angle: 130, delay: 2000, thickness: 3 },
    { startX: centerX - 70, startY: treeBottom + 170, length: 40, angle: 150, delay: 2200, thickness: 2 },
    // Right branches
    { startX: centerX + 5, startY: treeBottom + 180, length: 80, angle: 40, delay: 1600, thickness: 4 },
    { startX: centerX + 50, startY: treeBottom + 200, length: 50, angle: 20, delay: 1900, thickness: 3 },
    { startX: centerX + 20, startY: treeBottom + 150, length: 60, angle: 50, delay: 2100, thickness: 3 },
    { startX: centerX + 60, startY: treeBottom + 170, length: 40, angle: 30, delay: 2300, thickness: 2 },
    // Top branches
    { startX: centerX - 10, startY: treeBottom + 200, length: 45, angle: 100, delay: 2400, thickness: 3 },
    { startX: centerX + 5, startY: treeBottom + 205, length: 45, angle: 80, delay: 2500, thickness: 3 },
  ];

  // Roots
  const roots = [
    { startX: centerX - 5, length: 70, angle: 200, delay: 500 },
    { startX: centerX - 10, length: 60, angle: 220, delay: 700 },
    { startX: centerX + 5, length: 70, angle: -20, delay: 600 },
    { startX: centerX + 10, length: 55, angle: -40, delay: 800 },
    { startX: centerX, length: 50, angle: 190, delay: 900 },
    { startX: centerX, length: 45, angle: -10, delay: 1000 },
  ];

  // Leaves
  const leaves = [
    // Left side leaves
    { x: centerX - 100, y: treeBottom + 220, delay: 2600, size: 14 },
    { x: centerX - 80, y: treeBottom + 240, delay: 2800, size: 12 },
    { x: centerX - 120, y: treeBottom + 200, delay: 3000, size: 10 },
    { x: centerX - 90, y: treeBottom + 180, delay: 3200, size: 13 },
    { x: centerX - 60, y: treeBottom + 230, delay: 3400, size: 11 },
    { x: centerX - 110, y: treeBottom + 170, delay: 3600, size: 9 },
    // Right side leaves
    { x: centerX + 80, y: treeBottom + 220, delay: 2700, size: 14 },
    { x: centerX + 100, y: treeBottom + 240, delay: 2900, size: 12 },
    { x: centerX + 60, y: treeBottom + 200, delay: 3100, size: 10 },
    { x: centerX + 90, y: treeBottom + 180, delay: 3300, size: 13 },
    { x: centerX + 110, y: treeBottom + 230, delay: 3500, size: 11 },
    { x: centerX + 70, y: treeBottom + 170, delay: 3700, size: 9 },
    // Top leaves
    { x: centerX - 30, y: treeBottom + 250, delay: 3800, size: 15 },
    { x: centerX + 20, y: treeBottom + 255, delay: 3900, size: 14 },
    { x: centerX - 10, y: treeBottom + 260, delay: 4000, size: 12 },
    { x: centerX + 40, y: treeBottom + 245, delay: 4100, size: 13 },
    { x: centerX - 50, y: treeBottom + 240, delay: 4200, size: 11 },
  ];

  // Floating particles (pollen/energy)
  const particles = Array.from({ length: 25 }, (_, i) => ({
    x: centerX + (Math.random() - 0.5) * 250,
    y: treeBottom + 100 + Math.random() * 150,
    delay: 2000 + i * 200,
  }));

  return (
    <View style={styles.container}>
      {/* Glow effect behind tree */}
      <View style={[styles.treeGlow, { left: centerX - 150, bottom: treeBottom + 80 }]} />
      
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

      {/* Leaves */}
      {leaves.map((leaf, i) => (
        <Leaf key={`leaf-${i}`} {...leaf} />
      ))}

      {/* Floating particles */}
      {particles.map((particle, i) => (
        <FloatingParticle key={`particle-${i}`} {...particle} />
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
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
  },
  trunkSegment: {
    position: 'absolute',
    left: '50%',
    width: 8,
    marginLeft: -4,
    backgroundColor: '#B8860B',
    borderRadius: 4,
  },
  branch: {
    position: 'absolute',
    backgroundColor: '#B8860B',
    borderRadius: 2,
    transformOrigin: 'left center',
  },
  root: {
    position: 'absolute',
    height: 3,
    backgroundColor: '#8B7355',
    borderRadius: 2,
    transformOrigin: 'left center',
  },
  leaf: {
    position: 'absolute',
    backgroundColor: '#D4AF37',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 50,
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFD700',
  },
});

export default AnimatedTreeBackground;
