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

// Simulated recent activity (in production, would come from API)
const SAMPLE_ACTIVITIES: ActivityItem[] = [
  {
    id: '1',
    type: 'badge',
    user: 'Marie D.',
    action: 'a obtenu le badge "Gardien des Racines"',
    time: 'il y a 2 min',
    icon: 'ribbon',
    color: '#D4AF37',
  },
  {
    id: '2',
    type: 'tree',
    user: 'Jean-Pierre L.',
    action: 'a ajouté 5 personnes à son arbre',
    time: 'il y a 8 min',
    icon: 'leaf',
    color: '#4CAF50',
  },
  {
    id: '3',
    type: 'memory',
    user: 'Sophie M.',
    action: 'a partagé un souvenir familial',
    time: 'il y a 15 min',
    icon: 'heart',
    color: '#E91E63',
  },
  {
    id: '4',
    type: 'community',
    user: 'Pierre B.',
    action: 'a rejoint la communauté AÏLA',
    time: 'il y a 23 min',
    icon: 'people',
    color: '#2196F3',
  },
  {
    id: '5',
    type: 'badge',
    user: 'Isabelle R.',
    action: 'a complété le défi "Pont entre générations"',
    time: 'il y a 31 min',
    icon: 'trophy',
    color: '#FF9800',
  },
];

export default function SocialProofBanner() {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Change activity
        setCurrentIndex((prev) => (prev + 1) % SAMPLE_ACTIVITIES.length);
        
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

  const activity = SAMPLE_ACTIVITIES[currentIndex];

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
    marginHorizontal: 16,
    marginVertical: 6,
    backgroundColor: 'rgba(30, 58, 95, 0.5)',
    borderRadius: 12,
    padding: 12,
  },
  header: {
    marginBottom: 8,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7C93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 13,
    color: '#B8C5D6',
    lineHeight: 18,
  },
  userName: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timeText: {
    fontSize: 11,
    color: '#6B7C93',
    marginTop: 2,
  },
});
