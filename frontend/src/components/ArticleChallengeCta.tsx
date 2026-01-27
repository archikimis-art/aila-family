import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

interface ArticleChallengeCtaProps {
  articleTitle: string;
  challengeType?: 'tree' | 'memory' | 'tradition' | 'community' | 'general';
}

const CHALLENGE_CONFIG = {
  tree: {
    title: 'Complétez votre arbre',
    description: 'Ajoutez un membre de votre famille',
    icon: 'leaf',
    color: '#4CAF50',
    route: '/add-person',
  },
  memory: {
    title: 'Ajoutez un souvenir',
    description: 'Gardez une trace de vos histoires familiales',
    icon: 'heart',
    color: '#E91E63',
    route: '/challenges',
  },
  tradition: {
    title: 'Documentez une tradition',
    description: 'Préservez les rituels de votre famille',
    icon: 'star',
    color: '#FF9800',
    route: '/challenges',
  },
  community: {
    title: 'Partagez votre histoire',
    description: 'Rejoignez la communauté AÏLA',
    icon: 'chatbubbles',
    color: '#2196F3',
    route: '/community',
  },
  general: {
    title: 'Relevez un défi',
    description: 'Passez à l\'action avec votre famille',
    icon: 'trophy',
    color: '#D4AF37',
    route: '/challenges',
  },
};

export default function ArticleChallengeCta({ articleTitle, challengeType = 'general' }: ArticleChallengeCtaProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const config = CHALLENGE_CONFIG[challengeType];

  useEffect(() => {
    // Bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -5,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <View style={styles.dividerIcon}>
          <Ionicons name="flash" size={16} color="#D4AF37" />
        </View>
        <View style={styles.dividerLine} />
      </View>

      <Text style={styles.headerText}>
        {t('blog.takeAction') || '🎯 Passez à l\'action !'}
      </Text>
      <Text style={styles.subText}>
        {t('blog.transformReading') || 'Transformez votre lecture en action familiale'}
      </Text>

      <Animated.View style={[styles.ctaCard, { transform: [{ translateY: bounceAnim }] }]}>
        <TouchableOpacity
          style={[styles.ctaButton, { borderColor: config.color + '60' }]}
          onPress={() => router.push(config.route as any)}
          activeOpacity={0.8}
        >
          <Animated.View 
            style={[
              styles.iconContainer, 
              { 
                backgroundColor: config.color,
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              }
            ]}
          >
            <Ionicons name={config.icon as any} size={28} color="#FFF" />
          </Animated.View>
          
          <View style={styles.textContainer}>
            <Text style={styles.ctaTitle}>{config.title}</Text>
            <Text style={styles.ctaDescription}>{config.description}</Text>
          </View>
          
          <View style={styles.arrowContainer}>
            <Ionicons name="arrow-forward-circle" size={32} color={config.color} />
          </View>
        </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity 
        style={styles.allChallengesLink}
        onPress={() => router.push('/challenges')}
      >
        <Text style={styles.allChallengesText}>
          {t('blog.viewAllChallenges') || 'Voir tous les défis'}
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#D4AF37" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
  },
  dividerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: '#B8C5D6',
    textAlign: 'center',
    marginBottom: 20,
  },
  ctaCard: {
    marginBottom: 16,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 58, 95, 0.8)',
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  ctaDescription: {
    fontSize: 13,
    color: '#B8C5D6',
  },
  arrowContainer: {
    marginLeft: 8,
  },
  allChallengesLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  allChallengesText: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: '500',
  },
});
