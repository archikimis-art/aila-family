import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SuccessToastProps {
  visible: boolean;
  message: string;
  badge?: string;
  icon?: string;
  onHide: () => void;
  duration?: number;
}

export default function SuccessToast({ 
  visible, 
  message, 
  badge, 
  icon = 'checkmark-circle',
  onHide,
  duration = 4000 
}: SuccessToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{ translateY }, { scale }],
          opacity,
        }
      ]}
    >
      <TouchableOpacity 
        style={styles.toast}
        onPress={hideToast}
        activeOpacity={0.9}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={28} color="#4CAF50" />
        </View>
        <View style={styles.content}>
          <Text style={styles.message}>{message}</Text>
          {badge && (
            <View style={styles.badgeRow}>
              <Ionicons name="ribbon" size={14} color="#D4AF37" />
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
        <Ionicons name="close" size={20} color="#6B7C93" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 1001,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A5F',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '500',
  },
});
