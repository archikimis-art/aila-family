// ============================================================================
// TIKTOK LANDING PAGE - Special page for TikTok visitors
// ============================================================================

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { captureUTMParams, trackConversion } from '@/services/analytics';

const { width, height } = Dimensions.get('window');
const isLargeScreen = width > 768;

// TikTok account
const TIKTOK_USERNAME = '@www.aila.family';
const TIKTOK_URL = 'https://www.tiktok.com/@www.aila.family';

export default function TikTokLandingPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [visitCount, setVisitCount] = useState(0);

  useEffect(() => {
    // Capture UTM params (set tiktok as source)
    const trackVisit = async () => {
      // Force TikTok as source for this landing page
      await AsyncStorage.setItem('utm_source', 'tiktok');
      await AsyncStorage.setItem('utm_medium', 'landing');
      await AsyncStorage.setItem('utm_campaign', 'tiktok_page');
      
      // Track visit count
      const count = await AsyncStorage.getItem('tiktok_visit_count');
      const newCount = count ? parseInt(count) + 1 : 1;
      await AsyncStorage.setItem('tiktok_visit_count', newCount.toString());
      setVisitCount(newCount);
    };
    
    trackVisit();
  }, []);

  const handleStartFree = () => {
    trackConversion('signup');
    router.push('/(tabs)/tree');
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  const handleFollowTikTok = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(TIKTOK_URL, '_blank');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header with TikTok branding */}
          <View style={styles.header}>
            <View style={styles.tikTokBadge}>
              <Text style={styles.tikTokIcon}>♪</Text>
              <Text style={styles.tikTokBadgeText}>Vu sur TikTok</Text>
            </View>
          </View>

          {/* Main content */}
          <View style={styles.content}>
            {/* Welcome message */}
            <Text style={styles.welcomeEmoji}>👋</Text>
            <Text style={styles.title}>Bienvenue, TikToker !</Text>
            <Text style={styles.subtitle}>
              Tu as découvert AÏLA sur TikTok ?{'\n'}
              Crée ton arbre généalogique gratuitement !
            </Text>

            {/* Features highlights */}
            <View style={styles.features}>
              <FeatureItem 
                icon="leaf" 
                title="100% Gratuit" 
                description="Pas de carte bancaire requise"
              />
              <FeatureItem 
                icon="people" 
                title="Toute la famille" 
                description="Invite tes proches à participer"
              />
              <FeatureItem 
                icon="time" 
                title="2 minutes" 
                description="Pour créer ton premier arbre"
              />
              <FeatureItem 
                icon="lock-closed" 
                title="Privé & Sécurisé" 
                description="Tes données restent les tiennes"
              />
            </View>

            {/* CTA Buttons */}
            <View style={styles.ctaContainer}>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={handleStartFree}
              >
                <LinearGradient
                  colors={['#FE2C55', '#FF0050']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.primaryButtonText}>
                    🌳 Créer mon arbre gratuitement
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={handleLogin}
              >
                <Text style={styles.secondaryButtonText}>
                  J'ai déjà un compte
                </Text>
              </TouchableOpacity>
            </View>

            {/* Social proof */}
            <View style={styles.socialProof}>
              <Text style={styles.socialProofText}>
                🎉 Rejoint par <Text style={styles.highlight}>+2500</Text> familles
              </Text>
            </View>

            {/* TikTok follow */}
            <TouchableOpacity 
              style={styles.followButton}
              onPress={handleFollowTikTok}
            >
              <Text style={styles.followIcon}>♪</Text>
              <Text style={styles.followText}>
                Suivez-nous sur TikTok {TIKTOK_USERNAME}
              </Text>
            </TouchableOpacity>

            {/* Trust badges */}
            <View style={styles.trustBadges}>
              <Text style={styles.trustText}>🔒 RGPD Compliant</Text>
              <Text style={styles.trustSeparator}>•</Text>
              <Text style={styles.trustText}>🇫🇷 Made in France</Text>
              <Text style={styles.trustSeparator}>•</Text>
              <Text style={styles.trustText}>⭐ 4.8/5</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </ScrollView>
  );
}

// Feature item component
function FeatureItem({ icon, title, description }: { 
  icon: keyof typeof Ionicons.glyphMap; 
  title: string; 
  description: string;
}) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={24} color="#FE2C55" />
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollContent: {
    flexGrow: 1,
  },
  gradient: {
    flex: 1,
    minHeight: height,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  tikTokBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(254, 44, 85, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FE2C55',
  },
  tikTokIcon: {
    fontSize: 18,
    color: '#FE2C55',
    marginRight: 8,
  },
  tikTokBadgeText: {
    color: '#FE2C55',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  welcomeEmoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: isLargeScreen ? 36 : 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: isLargeScreen ? 18 : 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  features: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 30,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 12,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(254, 44, 85, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  featureDescription: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
  ctaContainer: {
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
    marginBottom: 24,
  },
  primaryButton: {
    width: '100%',
    marginBottom: 12,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#FE2C55',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  secondaryButtonText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  socialProof: {
    marginBottom: 24,
  },
  socialProofText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
  },
  highlight: {
    color: '#FE2C55',
    fontWeight: 'bold',
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 30,
  },
  followIcon: {
    fontSize: 18,
    color: '#FE2C55',
    marginRight: 8,
  },
  followText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  trustBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 40,
  },
  trustText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
  trustSeparator: {
    color: 'rgba(255,255,255,0.3)',
    marginHorizontal: 10,
  },
});
