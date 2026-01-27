import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import Confetti from '@/components/Confetti';
import SuccessToast from '@/components/SuccessToast';
import { useSound } from '@/context/SoundContext';

// Types
interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'tree' | 'memory' | 'connection' | 'tradition';
  points: number;
  badge: string;
  badgeIcon: string;
  action: string;
  actionRoute?: string;
  checkProgress: () => Promise<{ completed: boolean; progress: number; total: number }>;
}

interface UserProgress {
  odx: string;
  completed: boolean;
  completedAt?: string;
  progress: number;
  shared: boolean;
}

const CHALLENGES_STORAGE_KEY = 'aila_challenges_progress';
const BADGES_STORAGE_KEY = 'aila_user_badges';

// Définition des défis
const CHALLENGES: Challenge[] = [
  {
    id: 'tree_3gen',
    title: 'Racines profondes',
    description: 'Complétez votre arbre sur 3 générations (vous, parents, grands-parents)',
    icon: 'leaf',
    category: 'tree',
    points: 100,
    badge: 'Gardien des Racines',
    badgeIcon: 'shield-checkmark',
    action: 'Compléter mon arbre',
    actionRoute: '/add-person',
    checkProgress: async () => ({ completed: false, progress: 0, total: 7 }), // Placeholder
  },
  {
    id: 'first_memory',
    title: 'Premier souvenir',
    description: 'Ajoutez une anecdote ou un souvenir à un membre de votre famille',
    icon: 'heart',
    category: 'memory',
    points: 50,
    badge: 'Gardien des Mémoires',
    badgeIcon: 'book',
    action: 'Ajouter un souvenir',
    actionRoute: '/add-person',
    checkProgress: async () => ({ completed: false, progress: 0, total: 1 }),
  },
  {
    id: 'ask_grandparent',
    title: 'Pont entre générations',
    description: 'Posez 3 questions à un grand-parent et notez ses réponses',
    icon: 'chatbubbles',
    category: 'connection',
    points: 75,
    badge: 'Tisseur de Liens',
    badgeIcon: 'people',
    action: 'Voir les questions suggérées',
    actionRoute: '/questions-grands-parents',
    checkProgress: async () => ({ completed: false, progress: 0, total: 3 }),
  },
  {
    id: 'family_tradition',
    title: 'Tradition vivante',
    description: 'Documentez une tradition familiale (recette, rituel, fête...)',
    icon: 'star',
    category: 'tradition',
    points: 60,
    badge: 'Passeur de Traditions',
    badgeIcon: 'flame',
    action: 'Ajouter une tradition',
    actionRoute: '/traditions-familiales',
    checkProgress: async () => ({ completed: false, progress: 0, total: 1 }),
  },
  {
    id: 'share_community',
    title: 'Voix de la famille',
    description: 'Partagez votre histoire ou une astuce avec la communauté AÏLA',
    icon: 'megaphone',
    category: 'connection',
    points: 40,
    badge: 'Voix de la Communauté',
    badgeIcon: 'chatbubble-ellipses',
    action: 'Rejoindre la communauté',
    actionRoute: '/community',
    checkProgress: async () => ({ completed: false, progress: 0, total: 1 }),
  },
];

const CATEGORY_COLORS = {
  tree: '#4CAF50',
  memory: '#E91E63',
  connection: '#2196F3',
  tradition: '#FF9800',
};

const CATEGORY_LABELS = {
  tree: 'Arbre',
  memory: 'Mémoire',
  connection: 'Lien',
  tradition: 'Tradition',
};

export default function ChallengesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const { playSound } = useSound();
  const [progress, setProgress] = useState<Record<string, UserProgress>>({});
  const [badges, setBadges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Celebration states
  const [showConfetti, setShowConfetti] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastBadge, setToastBadge] = useState('');

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const savedProgress = await AsyncStorage.getItem(CHALLENGES_STORAGE_KEY);
      const savedBadges = await AsyncStorage.getItem(BADGES_STORAGE_KEY);
      
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        setProgress(parsed);
        
        // Calculer les points totaux
        let points = 0;
        Object.keys(parsed).forEach(challengeId => {
          if (parsed[challengeId].completed) {
            const challenge = CHALLENGES.find(c => c.id === challengeId);
            if (challenge) points += challenge.points;
          }
        });
        setTotalPoints(points);
      }
      
      if (savedBadges) {
        setBadges(JSON.parse(savedBadges));
      }
    } catch (e) {
      console.error('Error loading progress:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteChallenge = async (challenge: Challenge) => {
    if (!isAuthenticated) {
      Alert.alert(
        t('alerts.connectionRequired'),
        t('alerts.createAccountPrompt'),
        [
          { text: t('alerts.later'), style: 'cancel' },
          { text: t('alerts.signUp'), onPress: () => router.push('/(auth)/register') },
        ]
      );
      return;
    }

    // Marquer comme complété
    const newProgress = {
      ...progress,
      [challenge.id]: {
        odx: challenge.id,
        completed: true,
        completedAt: new Date().toISOString(),
        progress: 1,
        shared: false,
      },
    };
    
    const newBadges = [...badges, challenge.badge];
    const newPoints = totalPoints + challenge.points;

    setProgress(newProgress);
    setBadges(newBadges);
    setTotalPoints(newPoints);

    await AsyncStorage.setItem(CHALLENGES_STORAGE_KEY, JSON.stringify(newProgress));
    await AsyncStorage.setItem(BADGES_STORAGE_KEY, JSON.stringify(newBadges));

    // 🎉 Celebration effects!
    playSound('badge');
    setShowConfetti(true);
    setToastMessage(t('challenges.celebrationMessage') || 'Vous faites vivre votre histoire familiale !');
    setToastBadge(challenge.badge);
    setToastVisible(true);

    // After celebration, propose to share
    setTimeout(() => {
      Alert.alert(
        '🎉 ' + (t('challenges.congratulations') || 'Félicitations !'),
        `${t('challenges.badgeEarned') || 'Vous avez obtenu le badge'} "${challenge.badge}" !\n\n+${challenge.points} ${t('challenges.points')}\n\n${t('challenges.shareQuestion') || 'Voulez-vous partager cette réussite avec la communauté ?'}`,
        [
          { text: t('alerts.later'), style: 'cancel' },
          { 
            text: t('common.share'), 
            onPress: () => shareToCommmunity(challenge),
          },
        ]
      );
    }, 2000);
  };

  const shareToCommmunity = async (challenge: Challenge) => {
    try {
      const userName = user?.first_name || 'Un membre';
      const message = {
        id: Date.now().toString(),
        content: `🎉 ${userName} a complété le défi "${challenge.title}" et obtenu le badge "${challenge.badge}" ! #DéfiFamilial`,
        author_name: userName,
        author_country: 'AÏLA Family',
        created_at: new Date().toISOString(),
        likes: 0,
        topic: 'stories',
        isChallenge: true,
        challengeId: challenge.id,
        badge: challenge.badge,
      };

      // Récupérer les messages existants
      const existing = await AsyncStorage.getItem('aila_community_messages');
      const messages = existing ? JSON.parse(existing) : [];
      messages.unshift(message);
      await AsyncStorage.setItem('aila_community_messages', JSON.stringify(messages));

      // Marquer comme partagé
      const newProgress = {
        ...progress,
        [challenge.id]: { ...progress[challenge.id], shared: true },
      };
      setProgress(newProgress);
      await AsyncStorage.setItem(CHALLENGES_STORAGE_KEY, JSON.stringify(newProgress));

      Alert.alert(t('alerts.shared'), t('community.sharedSuccess') || 'Votre réussite est visible dans la communauté.');
    } catch (e) {
      console.error('Error sharing:', e);
    }
  };

  const filteredChallenges = selectedCategory
    ? CHALLENGES.filter(c => c.category === selectedCategory)
    : CHALLENGES;

  const completedCount = Object.values(progress).filter(p => p.completed).length;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#D4AF37" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Confetti effect */}
      <Confetti 
        active={showConfetti} 
        onComplete={() => setShowConfetti(false)}
      />
      
      {/* Success Toast */}
      <SuccessToast
        visible={toastVisible}
        message={toastMessage}
        badge={toastBadge}
        icon="trophy"
        onHide={() => setToastVisible(false)}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('challenges.title')}</Text>
        <TouchableOpacity onPress={() => router.push('/profile')} style={styles.profileButton}>
          <Ionicons name="trophy" size={24} color="#D4AF37" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalPoints}</Text>
            <Text style={styles.statLabel}>{t('challenges.points')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{badges.length}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{completedCount}/{CHALLENGES.length}</Text>
            <Text style={styles.statLabel}>Défis</Text>
          </View>
        </View>

        {/* Badges Preview */}
        {badges.length > 0 && (
          <View style={styles.badgesPreview}>
            <Text style={styles.sectionTitle}>Vos badges</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {badges.map((badge, index) => {
                const challenge = CHALLENGES.find(c => c.badge === badge);
                return (
                  <View key={index} style={styles.badgeItem}>
                    <View style={[styles.badgeIcon, { backgroundColor: CATEGORY_COLORS[challenge?.category || 'tree'] }]}>
                      <Ionicons name={challenge?.badgeIcon as any || 'star'} size={20} color="#FFF" />
                    </View>
                    <Text style={styles.badgeName} numberOfLines={2}>{badge}</Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Category Filter */}
        <View style={styles.categoryFilter}>
          <TouchableOpacity
            style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[styles.categoryChipText, !selectedCategory && styles.categoryChipTextActive]}>
              Tous
            </Text>
          </TouchableOpacity>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.categoryChip,
                selectedCategory === key && styles.categoryChipActive,
                selectedCategory === key && { backgroundColor: CATEGORY_COLORS[key as keyof typeof CATEGORY_COLORS] }
              ]}
              onPress={() => setSelectedCategory(key === selectedCategory ? null : key)}
            >
              <Text style={[
                styles.categoryChipText,
                selectedCategory === key && styles.categoryChipTextActive
              ]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Challenges List */}
        <Text style={styles.sectionTitle}>
          {selectedCategory ? CATEGORY_LABELS[selectedCategory as keyof typeof CATEGORY_LABELS] : 'Tous les défis'}
        </Text>
        
        {filteredChallenges.map((challenge) => {
          const isCompleted = progress[challenge.id]?.completed;
          const isShared = progress[challenge.id]?.shared;
          
          return (
            <View 
              key={challenge.id} 
              style={[
                styles.challengeCard,
                isCompleted && styles.challengeCardCompleted
              ]}
            >
              <View style={styles.challengeHeader}>
                <View style={[styles.challengeIcon, { backgroundColor: CATEGORY_COLORS[challenge.category] }]}>
                  <Ionicons name={challenge.icon as any} size={24} color="#FFF" />
                </View>
                <View style={styles.challengeInfo}>
                  <View style={styles.challengeTitleRow}>
                    <Text style={styles.challengeTitle}>{challenge.title}</Text>
                    {isCompleted && (
                      <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                    )}
                  </View>
                  <Text style={styles.challengePoints}>+{challenge.points} points • {challenge.badge}</Text>
                </View>
              </View>
              
              <Text style={styles.challengeDescription}>{challenge.description}</Text>
              
              <View style={styles.challengeFooter}>
                {isCompleted ? (
                  <View style={styles.completedRow}>
                    <View style={styles.completedBadge}>
                      <Ionicons name="checkmark" size={14} color="#4CAF50" />
                      <Text style={styles.completedText}>Complété</Text>
                    </View>
                    {!isShared && (
                      <TouchableOpacity 
                        style={styles.shareButton}
                        onPress={() => shareToCommmunity(challenge)}
                      >
                        <Ionicons name="share-social" size={16} color="#D4AF37" />
                        <Text style={styles.shareButtonText}>Partager</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <View style={styles.actionRow}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => challenge.actionRoute && router.push(challenge.actionRoute as any)}
                    >
                      <Text style={styles.actionButtonText}>{challenge.action}</Text>
                      <Ionicons name="arrow-forward" size={16} color="#0A1628" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.completeButton}
                      onPress={() => handleCompleteChallenge(challenge)}
                    >
                      <Ionicons name="checkmark" size={18} color="#D4AF37" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          );
        })}

        {/* CTA Blog */}
        <View style={styles.ctaCard}>
          <Ionicons name="bulb" size={32} color="#D4AF37" />
          <Text style={styles.ctaTitle}>Besoin d'inspiration ?</Text>
          <Text style={styles.ctaText}>
            Découvrez nos articles pour enrichir votre histoire familiale
          </Text>
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => router.push('/blog')}
          >
            <Text style={styles.ctaButtonText}>Explorer le blog</Text>
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
  profileButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#1E3A5F',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  statLabel: {
    fontSize: 12,
    color: '#B8C5D6',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 10,
  },
  badgesPreview: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  badgeItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 70,
  },
  badgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  badgeName: {
    fontSize: 10,
    color: '#B8C5D6',
    textAlign: 'center',
  },
  categoryFilter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  categoryChipActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#D4AF37',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#0A1628',
  },
  challengeCard: {
    backgroundColor: '#1E3A5F',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  challengeCardCompleted: {
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  challengePoints: {
    fontSize: 12,
    color: '#D4AF37',
    marginTop: 2,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#B8C5D6',
    lineHeight: 20,
    marginBottom: 16,
  },
  challengeFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    paddingVertical: 10,
    gap: 8,
  },
  actionButtonText: {
    color: '#0A1628',
    fontSize: 14,
    fontWeight: '600',
  },
  completeButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  completedText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  shareButtonText: {
    color: '#D4AF37',
    fontSize: 13,
  },
  ctaCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 12,
  },
  ctaText: {
    fontSize: 14,
    color: '#B8C5D6',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  ctaButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  ctaButtonText: {
    color: '#0A1628',
    fontSize: 14,
    fontWeight: '600',
  },
});
