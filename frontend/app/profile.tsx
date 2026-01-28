import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';

interface Badge {
  id: string;
  name: string;
  icon: string;
  color: string;
  earnedAt: string;
  category: string;
}

interface UserStats {
  totalPoints: number;
  challengesCompleted: number;
  badgesEarned: number;
  communityPosts: number;
  treeMembersCount: number;
  memberSince: string;
}

const CHALLENGES_STORAGE_KEY = 'aila_challenges_progress';
const BADGES_STORAGE_KEY = 'aila_user_badges';

// Badge definitions with details
const BADGE_DETAILS: Record<string, { icon: string; color: string; description: string }> = {
  'Gardien des Racines': { 
    icon: 'shield-checkmark', 
    color: '#4CAF50',
    description: 'A complété son arbre sur 3 générations'
  },
  'Gardien des Mémoires': { 
    icon: 'book', 
    color: '#E91E63',
    description: 'A ajouté son premier souvenir familial'
  },
  'Tisseur de Liens': { 
    icon: 'people', 
    color: '#2196F3',
    description: 'A interviewé un grand-parent'
  },
  'Passeur de Traditions': { 
    icon: 'flame', 
    color: '#FF9800',
    description: 'A documenté une tradition familiale'
  },
  'Voix de la Communauté': { 
    icon: 'chatbubble-ellipses', 
    color: '#9C27B0',
    description: 'A partagé avec la communauté AÏLA'
  },
};

// Levels based on points
const LEVELS = [
  { name: 'Explorateur', minPoints: 0, maxPoints: 99, icon: 'compass' },
  { name: 'Chercheur', minPoints: 100, maxPoints: 249, icon: 'search' },
  { name: 'Historien', minPoints: 250, maxPoints: 499, icon: 'library' },
  { name: 'Gardien', minPoints: 500, maxPoints: 999, icon: 'shield' },
  { name: 'Sage', minPoints: 1000, maxPoints: Infinity, icon: 'star' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();
  const [badges, setBadges] = useState<string[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalPoints: 0,
    challengesCompleted: 0,
    badgesEarned: 0,
    communityPosts: 0,
    treeMembersCount: 0,
    memberSince: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Load badges
      const savedBadges = await AsyncStorage.getItem(BADGES_STORAGE_KEY);
      if (savedBadges) {
        setBadges(JSON.parse(savedBadges));
      }

      // Load challenges progress
      const savedProgress = await AsyncStorage.getItem(CHALLENGES_STORAGE_KEY);
      let points = 0;
      let completed = 0;
      
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        Object.values(progress).forEach((p: any) => {
          if (p.completed) {
            completed++;
            // Calculate points based on challenge
            const challengePoints: Record<string, number> = {
              'tree_3gen': 100,
              'first_memory': 50,
              'ask_grandparent': 75,
              'family_tradition': 60,
              'share_community': 40,
            };
            points += challengePoints[p.odx] || 0;
          }
        });
      }

      // Load community posts count
      const communityMessages = await AsyncStorage.getItem('aila_community_messages');
      let postsCount = 0;
      if (communityMessages) {
        const messages = JSON.parse(communityMessages);
        postsCount = messages.filter((m: any) => 
          m.author_name === user?.first_name || m.author_name === `${user?.first_name} ${user?.last_name}`
        ).length;
      }

      setStats({
        totalPoints: points,
        challengesCompleted: completed,
        badgesEarned: savedBadges ? JSON.parse(savedBadges).length : 0,
        communityPosts: postsCount,
        treeMembersCount: 0, // Would come from API
        memberSince: user?.created_at || new Date().toISOString(),
      });

    } catch (e) {
      console.error('Error loading user data:', e);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLevel = () => {
    return LEVELS.find(l => stats.totalPoints >= l.minPoints && stats.totalPoints <= l.maxPoints) || LEVELS[0];
  };

  const getNextLevel = () => {
    const currentIndex = LEVELS.findIndex(l => stats.totalPoints >= l.minPoints && stats.totalPoints <= l.maxPoints);
    return LEVELS[currentIndex + 1] || null;
  };

  const getProgressToNextLevel = () => {
    const current = getCurrentLevel();
    const next = getNextLevel();
    if (!next) return 100;
    
    const progressInLevel = stats.totalPoints - current.minPoints;
    const levelRange = current.maxPoints - current.minPoints + 1;
    return Math.min(100, (progressInLevel / levelRange) * 100);
  };

  const handleLogout = () => {
    Alert.alert(
      t('auth.logout'),
      t('alerts.confirmLogout'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('auth.logout'), style: 'destructive', onPress: () => {
          logout();
          router.push('/');
        }},
      ]
    );
  };

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profile.title')}</Text>
        <TouchableOpacity onPress={() => router.push('/challenges')} style={styles.challengesButton}>
          <Ionicons name="ribbon" size={24} color="#D4AF37" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.first_name?.charAt(0)?.toUpperCase() || 'A'}
              </Text>
            </View>
            <View style={[styles.levelBadge, { backgroundColor: '#D4AF37' }]}>
              <Ionicons name={currentLevel.icon as any} size={14} color="#0A1628" />
            </View>
          </View>
          
          <Text style={styles.userName}>
            {user?.first_name} {user?.last_name}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          
          {/* Level Progress */}
          <View style={styles.levelSection}>
            <View style={styles.levelHeader}>
              <Text style={styles.levelName}>{t(`profile.levels.${currentLevel.name.toLowerCase()}`) || currentLevel.name}</Text>
              {nextLevel && (
                <Text style={styles.levelNext}>→ {t(`profile.levels.${nextLevel.name.toLowerCase()}`) || nextLevel.name}</Text>
              )}
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${getProgressToNextLevel()}%` }]} />
            </View>
            <Text style={styles.pointsText}>
              {stats.totalPoints} {t('profile.points')}
              {nextLevel && ` • ${nextLevel.minPoints - stats.totalPoints} pts`}
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <TouchableOpacity style={styles.statBox} onPress={() => router.push('/challenges')}>
            <Ionicons name="trophy" size={24} color="#D4AF37" />
            <Text style={styles.statNumber}>{stats.challengesCompleted}</Text>
            <Text style={styles.statLabel}>{t('challenges.title')}</Text>
          </TouchableOpacity>
          
          <View style={styles.statBox}>
            <Ionicons name="ribbon" size={24} color="#E91E63" />
            <Text style={styles.statNumber}>{stats.badgesEarned}</Text>
            <Text style={styles.statLabel}>{t('challenges.badges')}</Text>
          </View>
          
          <TouchableOpacity style={styles.statBox} onPress={() => router.push('/community')}>
            <Ionicons name="chatbubbles" size={24} color="#2196F3" />
            <Text style={styles.statNumber}>{stats.communityPosts}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </TouchableOpacity>
        </View>

        {/* Badges Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('profile.myBadges')}</Text>
            <TouchableOpacity onPress={() => router.push('/challenges')}>
              <Text style={styles.seeAllText}>{t('common.seeAll')}</Text>
            </TouchableOpacity>
          </View>
          
          {badges.length > 0 ? (
            <View style={styles.badgesGrid}>
              {badges.map((badgeName, index) => {
                const details = BADGE_DETAILS[badgeName] || { 
                  icon: 'star', 
                  color: '#D4AF37',
                  description: 'Badge spécial'
                };
                return (
                  <View key={index} style={styles.badgeCard}>
                    <View style={[styles.badgeIcon, { backgroundColor: details.color }]}>
                      <Ionicons name={details.icon as any} size={24} color="#FFF" />
                    </View>
                    <Text style={styles.badgeName}>{badgeName}</Text>
                    <Text style={styles.badgeDescription} numberOfLines={2}>
                      {details.description}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyBadges}>
              <Ionicons name="ribbon-outline" size={48} color="#6B7C93" />
              <Text style={styles.emptyText}>{t('profile.noBadges')}</Text>
              <TouchableOpacity 
                style={styles.startButton}
                onPress={() => router.push('/challenges')}
              >
                <Text style={styles.startButtonText}>{t('profile.startChallenges')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.quickActions')}</Text>
          
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => router.push('/challenges')}
          >
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(76, 175, 80, 0.15)' }]}>
              <Ionicons name="flag" size={20} color="#4CAF50" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>{t('profile.familyChallenges')}</Text>
              <Text style={styles.actionSubtitle}>{t('profile.earnBadges')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => router.push('/community')}
          >
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(33, 150, 243, 0.15)' }]}>
              <Ionicons name="people" size={20} color="#2196F3" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>{t('profile.communityTitle')}</Text>
              <Text style={styles.actionSubtitle}>{t('profile.shareExchange')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => router.push('/blog')}
          >
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(212, 175, 55, 0.15)' }]}>
              <Ionicons name="newspaper" size={20} color="#D4AF37" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>{t('profile.blogInspiration')}</Text>
              <Text style={styles.actionSubtitle}>{t('profile.articlesAdvice')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
          </TouchableOpacity>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.account')}</Text>
          
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => router.push('/pricing')}
          >
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(212, 175, 55, 0.15)' }]}>
              <Ionicons name="star" size={20} color="#D4AF37" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>{t('profile.goPremium')}</Text>
              <Text style={styles.actionSubtitle}>{t('profile.unlockFeatures')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionItem, styles.logoutItem]}
            onPress={handleLogout}
          >
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(244, 67, 54, 0.15)' }]}>
              <Ionicons name="log-out" size={20} color="#F44336" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={[styles.actionTitle, { color: '#F44336' }]}>{t('profile.logout')}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1628',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A5F',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  challengesButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    backgroundColor: '#1E3A5F',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0A1628',
  },
  levelBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1E3A5F',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7C93',
    marginTop: 4,
  },
  levelSection: {
    width: '100%',
    marginTop: 20,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  levelName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4AF37',
  },
  levelNext: {
    fontSize: 12,
    color: '#6B7C93',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#0A1628',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 4,
  },
  pointsText: {
    fontSize: 12,
    color: '#B8C5D6',
    marginTop: 8,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1E3A5F',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7C93',
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  seeAllText: {
    fontSize: 13,
    color: '#D4AF37',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    width: '47%',
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  badgeName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  badgeDescription: {
    fontSize: 11,
    color: '#6B7C93',
    textAlign: 'center',
    marginTop: 4,
  },
  emptyBadges: {
    backgroundColor: '#1E3A5F',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7C93',
    marginTop: 12,
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  startButtonText: {
    color: '#0A1628',
    fontSize: 14,
    fontWeight: '600',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6B7C93',
    marginTop: 2,
  },
  logoutItem: {
    marginTop: 8,
  },
});
