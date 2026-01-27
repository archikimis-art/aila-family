import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface ConfettiPiece {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  rotation: Animated.Value;
  scale: Animated.Value;
  color: string;
}

interface ConfettiProps {
  active: boolean;
  duration?: number;
  count?: number;
  onComplete?: () => void;
}

const COLORS = ['#D4AF37', '#4CAF50', '#2196F3', '#E91E63', '#FF9800', '#9C27B0'];

export default function Confetti({ active, duration = 3000, count = 30, onComplete }: ConfettiProps) {
  const pieces = useRef<ConfettiPiece[]>([]);
  const [, forceUpdate] = React.useState({});

  useEffect(() => {
    if (active) {
      // Create confetti pieces
      pieces.current = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: new Animated.Value(Math.random() * width),
        y: new Animated.Value(-50),
        rotation: new Animated.Value(0),
        scale: new Animated.Value(Math.random() * 0.5 + 0.5),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      }));
      forceUpdate({});

      // Animate each piece
      const animations = pieces.current.map((piece) => {
        const xDrift = (Math.random() - 0.5) * 200;
        return Animated.parallel([
          Animated.timing(piece.y, {
            toValue: height + 50,
            duration: duration + Math.random() * 1000,
            useNativeDriver: true,
          }),
          Animated.timing(piece.x, {
            toValue: piece.x._value + xDrift,
            duration: duration + Math.random() * 1000,
            useNativeDriver: true,
          }),
          Animated.timing(piece.rotation, {
            toValue: Math.random() * 10 - 5,
            duration: duration,
            useNativeDriver: true,
          }),
        ]);
      });

      Animated.parallel(animations).start(() => {
        pieces.current = [];
        forceUpdate({});
        onComplete?.();
      });
    }
  }, [active]);

  if (!active || pieces.current.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {pieces.current.map((piece) => (
        <Animated.View
          key={piece.id}
          style={[
            styles.confetti,
            {
              backgroundColor: piece.color,
              transform: [
                { translateX: piece.x },
                { translateY: piece.y },
                { rotate: piece.rotation.interpolate({
                  inputRange: [-5, 5],
                  outputRange: ['-180deg', '180deg'],
                })},
                { scale: piece.scale },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    pointerEvents: 'none',
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});
