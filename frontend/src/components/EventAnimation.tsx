import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Modal } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface EventAnimationProps {
  visible: boolean;
  eventType: 'birthday' | 'birth' | 'graduation' | 'wedding' | 'newyear' | 'holiday' | 'custom';
  title: string;
  subtitle?: string;
  personName?: string;
  onClose: () => void;
}

// Floating element component for balloons, confetti, etc.
const FloatingElement = ({ 
  emoji, 
  startX, 
  delay, 
  duration 
}: { 
  emoji: string; 
  startX: number; 
  delay: number;
  duration: number;
}) => {
  const translateY = useSharedValue(SCREEN_HEIGHT + 50);
  const translateX = useSharedValue(startX);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(-100, { duration, easing: Easing.out(Easing.quad) })
    );
    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(startX + 30, { duration: 1000 }),
          withTiming(startX - 30, { duration: 1000 })
        ),
        -1,
        true
      )
    );
    rotate.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(15, { duration: 800 }),
          withTiming(-15, { duration: 800 })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.floatingElement, animatedStyle]}>
      <Text style={styles.floatingEmoji}>{emoji}</Text>
    </Animated.View>
  );
};

// Firework particle
const FireworkParticle = ({ 
  centerX, 
  centerY, 
  angle, 
  color,
  delay 
}: { 
  centerX: number; 
  centerY: number; 
  angle: number;
  color: string;
  delay: number;
}) => {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);
  const distance = 150;

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 100 }));
    progress.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 200 })
      )
    );
    opacity.value = withDelay(
      delay + 600,
      withTiming(0, { duration: 400 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const x = centerX + Math.cos(angle) * distance * progress.value;
    const y = centerY + Math.sin(angle) * distance * progress.value;
    return {
      transform: [
        { translateX: x },
        { translateY: y },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[styles.fireworkParticle, { backgroundColor: color }, animatedStyle]} />
  );
};

// Main Event Animation Component
export default function EventAnimation({
  visible,
  eventType,
  title,
  subtitle,
  personName,
  onClose,
}: EventAnimationProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const [showElements, setShowElements] = useState(false);

  useEffect(() => {
    if (visible) {
      setShowElements(true);
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, { damping: 12 });
    } else {
      opacity.value = withTiming(0, { duration: 300 });
      scale.value = withTiming(0, { duration: 200 }, () => {
        runOnJS(setShowElements)(false);
      });
    }
  }, [visible]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Get elements based on event type
  const getEventConfig = () => {
    switch (eventType) {
      case 'birthday':
        return {
          emoji: '🎂',
          elements: ['🎈', '🎈', '🎈', '🎁', '🎈', '🎈', '🎉', '🎈'],
          colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181'],
          bgColor: 'rgba(255, 107, 107, 0.1)',
        };
      case 'birth':
        return {
          emoji: '👶',
          elements: ['🍼', '🧸', '💕', '⭐', '🌟', '💝', '🎀', '🧁'],
          colors: ['#FFB6C1', '#87CEEB', '#DDA0DD', '#F0E68C'],
          bgColor: 'rgba(255, 182, 193, 0.1)',
        };
      case 'graduation':
        return {
          emoji: '🎓',
          elements: ['🎊', '📚', '⭐', '🏆', '🎉', '✨', '🎊', '⭐'],
          colors: ['#FFD700', '#4169E1', '#228B22', '#FF6347'],
          bgColor: 'rgba(255, 215, 0, 0.1)',
        };
      case 'wedding':
        return {
          emoji: '💍',
          elements: ['💕', '💗', '💖', '🥂', '💐', '💝', '✨', '💕'],
          colors: ['#FF69B4', '#FFB6C1', '#FFC0CB', '#DC143C'],
          bgColor: 'rgba(255, 105, 180, 0.1)',
        };
      case 'newyear':
        return {
          emoji: '🎆',
          elements: ['🎇', '✨', '🥂', '🎊', '⭐', '🌟', '🎉', '🍾'],
          colors: ['#FFD700', '#FF6347', '#00CED1', '#9370DB', '#FF69B4'],
          bgColor: 'rgba(255, 215, 0, 0.1)',
          isFirework: true,
        };
      case 'holiday':
        return {
          emoji: '🎄',
          elements: ['❄️', '🎅', '🦌', '🎁', '⭐', '❄️', '🔔', '🎄'],
          colors: ['#228B22', '#DC143C', '#FFD700', '#FFFFFF'],
          bgColor: 'rgba(34, 139, 34, 0.1)',
        };
      default:
        return {
          emoji: '🎉',
          elements: ['🎊', '✨', '🎈', '⭐', '🎉', '💫', '🎊', '✨'],
          colors: ['#D4AF37', '#4A90D9', '#D94A8C', '#6B7C93'],
          bgColor: 'rgba(212, 175, 55, 0.1)',
        };
    }
  };

  const config = getEventConfig();

  if (!visible && !showElements) return null;

  return (
    <Modal transparent visible={visible || showElements} animationType="none">
      <Animated.View style={[styles.overlay, containerStyle]}>
        <TouchableOpacity style={styles.overlayTouch} activeOpacity={1} onPress={onClose}>
          {/* Floating elements */}
          {showElements && config.elements.map((emoji, index) => (
            <FloatingElement
              key={index}
              emoji={emoji}
              startX={(index / config.elements.length) * SCREEN_WIDTH}
              delay={index * 200}
              duration={4000 + Math.random() * 2000}
            />
          ))}

          {/* Fireworks for New Year */}
          {showElements && eventType === 'newyear' && (
            <>
              {[...Array(3)].map((_, burstIndex) => (
                <React.Fragment key={`burst-${burstIndex}`}>
                  {[...Array(12)].map((_, particleIndex) => (
                    <FireworkParticle
                      key={`particle-${burstIndex}-${particleIndex}`}
                      centerX={100 + burstIndex * (SCREEN_WIDTH / 4)}
                      centerY={150 + burstIndex * 50}
                      angle={(particleIndex / 12) * Math.PI * 2}
                      color={config.colors[particleIndex % config.colors.length]}
                      delay={burstIndex * 500}
                    />
                  ))}
                </React.Fragment>
              ))}
            </>
          )}

          {/* Main card */}
          <Animated.View style={[styles.card, { backgroundColor: config.bgColor }, cardStyle]}>
            <Text style={styles.mainEmoji}>{config.emoji}</Text>
            <Text style={styles.title}>{title}</Text>
            {personName && (
              <Text style={styles.personName}>{personName}</Text>
            )}
            {subtitle && (
              <Text style={styles.subtitle}>{subtitle}</Text>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 22, 40, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouch: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingElement: {
    position: 'absolute',
  },
  floatingEmoji: {
    fontSize: 36,
  },
  fireworkParticle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  card: {
    backgroundColor: 'rgba(26, 47, 74, 0.95)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D4AF37',
    maxWidth: 320,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  mainEmoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  personName: {
    fontSize: 20,
    color: '#D4AF37',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#B8C5D6',
    textAlign: 'center',
    marginBottom: 16,
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: '#D4AF37',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  closeButtonText: {
    color: '#0A1628',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
