import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  color: string;
}

const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: 'add_person',
    title: 'Ajoutez un proche',
    description: 'Enrichissez votre arbre avec un nouveau membre',
    icon: 'person-add',
    points: 25,
    color: '#4CAF50',
  },
  {
    id: 'add_memory',
    title: 'Partagez un souvenir',
    description: 'Ajoutez une anecdote à votre histoire familiale',
    icon: 'heart',
    points: 30,
    color: '#E91E63',
  },
  {
    id: 'invite_family',
    title: 'Invitez un proche',
    description: 'Votre arbre est plus riche à plusieurs',
    icon: 'people',
    points: 40,
    color: '#2196F3',
  },
  {
    id: 'explore_blog',
    title: 'Découvrez une astuce',
    description: 'Lisez un article du blog pour vous inspirer',
    icon: 'bulb',
    points: 15,
    color: '#FF9800',
  },
  {
    id: 'community_post',
    title: 'Partagez votre histoire',
    description: 'Publiez un message dans la communauté',
    icon: 'chatbubbles',
    points: 35,
    color: '#9C27B0',
  },
];

export default function DailyChallengeBanner() {
  const router = useRouter();
  const { t } = useTranslation();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Get daily challenge based on day of year
  const getDailyChallenge = () => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return DAILY_CHALLENGES[dayOfYear % DAILY_CHALLENGES.length];
  };

  const challenge = getDailyChallenge();

  useEffect(() => {
    // Entrance animation
    Animated.spring(slideAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Pulse animation for the icon
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, []);

  const handlePress = () => {
    switch (challenge.id) {
      case 'add_person':
        router.push('/add-person');
        break;
      case 'invite_family':
        router.push('/challenges');
        break;
      case 'explore_blog':
        router.push('/blog');
        break;
      case 'community_post':
        router.push('/community');
        break;
      default:
        router.push('/challenges');
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            })},
          ],
          opacity: slideAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.banner}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.header}>
          <View style={styles.labelContainer}>
            <Ionicons name="flash" size={12} color="#D4AF37" />
            <Text style={styles.label}>{t('challenges.dailyChallenge') || 'Défi du jour'}</Text>
          </View>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsText}>+{challenge.points} pts</Text>
          </View>
        </View>
        
        <View style={styles.content}>
          <Animated.View 
            style={[
              styles.iconContainer, 
              { 
                backgroundColor: challenge.color,
                transform: [{ scale: pulseAnim }],
              }
            ]}
          >
            <Ionicons name={challenge.icon as any} size={24} color="#FFF" />
          </Animated.View>
          
          <View style={styles.textContent}>
            <Text style={styles.title}>{challenge.title}</Text>
            <Text style={styles.description}>{challenge.description}</Text>
          </View>
          
          <Ionicons name="chevron-forward" size={20} color="#D4AF37" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  banner: {
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D4AF37',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pointsBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  pointsText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4CAF50',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 12,
    color: '#B8C5D6',
    marginTop: 2,
  },
});
