import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface ActivityItem {
  id: string;
  type: 'badge' | 'tree' | 'memory' | 'community';
  user: string;
  action: string;
  time: string;
  icon: string;
  color: string;
}

// Activity keys for translation
const ACTIVITY_KEYS = [
  {
    id: '1',
    type: 'badge',
    user: 'Marie D.',
    actionKey: 'socialProof.activities.badge1',
    timeKey: 'socialProof.time.2min',
    icon: 'ribbon',
    color: '#D4AF37',
  },
  {
    id: '2',
    type: 'tree',
    user: 'Jean-Pierre L.',
    actionKey: 'socialProof.activities.tree1',
    timeKey: 'socialProof.time.8min',
    icon: 'leaf',
    color: '#4CAF50',
  },
  {
    id: '3',
    type: 'memory',
    user: 'Sophie M.',
    actionKey: 'socialProof.activities.memory1',
    timeKey: 'socialProof.time.15min',
    icon: 'heart',
    color: '#E91E63',
  },
  {
    id: '4',
    type: 'community',
    user: 'Pierre B.',
    actionKey: 'socialProof.activities.community1',
    timeKey: 'socialProof.time.23min',
    icon: 'people',
    color: '#2196F3',
  },
  {
    id: '5',
    type: 'badge',
    user: 'Isabelle R.',
    actionKey: 'socialProof.activities.badge2',
    timeKey: 'socialProof.time.31min',
    icon: 'trophy',
    color: '#FF9800',
  },
];

export default function SocialProofBanner() {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Build translated activities
  const getActivities = () => ACTIVITY_KEYS.map(item => ({
    ...item,
    action: t(item.actionKey),
    time: t(item.timeKey),
  }));

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Change activity
        setCurrentIndex((prev) => (prev + 1) % ACTIVITY_KEYS.length);
        
        // Slide and fade in
        slideAnim.setValue(-20);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const activities = getActivities();
  const activity = activities[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>{t('community.liveActivity') || 'Activité en direct'}</Text>
        </View>
      </View>
      
      <Animated.View 
        style={[
          styles.activityCard,
          {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: activity.color + '20' }]}>
          <Ionicons name={activity.icon as any} size={18} color={activity.color} />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityText}>
            <Text style={styles.userName}>{activity.user}</Text>
            {' '}{activity.action}
          </Text>
          <Text style={styles.timeText}>{activity.time}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 0,
    marginVertical: 0,
    backgroundColor: 'transparent',
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  header: {
    display: 'none',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4CAF50',
  },
  liveText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#6B7C93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    display: 'none',
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityText: {
    fontSize: 10,
    color: '#6B7C93',
    textAlign: 'center',
  },
  userName: {
    fontWeight: '500',
    color: '#8BA1B7',
  },
  timeText: {
    display: 'none',
  },
});
