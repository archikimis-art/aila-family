import React, { useState, useEffect, lazy, Suspense } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Share, Platform, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '@/components/LanguageSelector';
import DailyChallengeBanner from '@/components/DailyChallengeBanner';
import SocialProofBanner from '@/components/SocialProofBanner';

// Lazy load the animated background for better LCP
const AnimatedTreeBackground = lazy(() => import('@/components/AnimatedTreeBackground').then(m => ({ default: m.AnimatedTreeBackground })));

const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isLargeScreen = width > 768;

// Store install prompt globally to catch it before React mounts
let globalDeferredPrompt: any = null;
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    globalDeferredPrompt = e;
    console.log('PWA install prompt captured globally');
  });
}

export default function WelcomeScreen() {
  const { t } = useTranslation();
  const { loading } = useAuth();
  const router = useRouter();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [showBackground, setShowBackground] = useState(false);

  // Defer animated background loading for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBackground(true);
    }, 100); // Load background after 100ms
    return () => clearTimeout(timer);
  }, []);

  // PWA Install prompt
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Check if we already captured the prompt globally
      if (globalDeferredPrompt) {
        setDeferredPrompt(globalDeferredPrompt);
        setShowInstallButton(true);
        console.log('Using globally captured install prompt');
      }

      const handleBeforeInstallPrompt = (e: any) => {
        e.preventDefault();
        globalDeferredPrompt = e;
        setDeferredPrompt(e);
        setShowInstallButton(true);
        console.log('PWA install prompt available');
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // Check if already installed
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setShowInstallButton(false);
      }

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    // Try to use the global prompt first
    const prompt = deferredPrompt || globalDeferredPrompt;
    
    if (!prompt) {
      // Fallback: try to trigger native browser install UI
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        // Check if there's a native install button visible
        const hasNativePrompt = document.querySelector('button[aria-label*="install"], button[aria-label*="Install"]');
        
        window.alert(
          '📲 Pour installer AÏLA sur votre appareil :\n\n' +
          '🖥️ Sur PC (Chrome/Edge) :\n' +
          '   → Regardez en haut à droite de la barre d\'adresse\n' +
          '   → Cliquez sur "Installer" ou l\'icône ⊕\n\n' +
          '📱 Sur Mobile :\n' +
          '   → Menu ⋮ puis "Installer l\'application"\n' +
          '   → Ou "Ajouter à l\'écran d\'accueil"'
        );
      }
      return;
    }

    try {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      console.log('PWA install outcome:', outcome);
      
      if (outcome === 'accepted') {
        setShowInstallButton(false);
      }
    } catch (error) {
      console.error('Install prompt error:', error);
    }
    
    globalDeferredPrompt = null;
    setDeferredPrompt(null);
  };

  // Supprimé le useEffect qui causait des problèmes

  // Injecter CSS pour forcer la barre en fixed
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const styleId = 'aila-bottom-bar-fix';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          /* Force bottom bar to be fixed */
          #aila-bottom-bar {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            z-index: 9999 !important;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="leaf" size={60} color="#D4AF37" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  // Simple navigation functions using router
  const goToPreview = () => {
    router.push('/(tabs)/tree?preview=true');
  };

  const goToRegister = () => {
    router.push('/(auth)/register');
  };

  const goToLogin = () => {
    router.push('/(auth)/login');
  };

  const shareApp = async () => {
    const shareMessage = "🌳 Découvrez AÏLA - L'arbre généalogique qui connecte votre famille ! Créez, partagez et préservez votre histoire familiale. 👉 https://www.aila.family";
    
    try {
      if (Platform.OS === 'web') {
        // Web Share API
        if (navigator.share) {
          await navigator.share({
            title: 'AÏLA - Arbre Généalogique Familial',
            text: shareMessage,
            url: 'https://www.aila.family',
          });
        } else {
          // Fallback: copy to clipboard
          await navigator.clipboard.writeText(shareMessage);
          window.alert('Lien copié ! Partagez-le avec votre famille 🌳');
        }
      } else {
        // Mobile Share
        await Share.share({
          message: shareMessage,
          title: 'AÏLA - Arbre Généalogique Familial',
        });
      }
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.backgroundContainer}>
        {/* Animated Background - Lazy loaded for performance */}
        {showBackground && (
          <Suspense fallback={null}>
            <AnimatedTreeBackground />
          </Suspense>
        )}
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        <SafeAreaView>
          <View style={styles.contentContainer}>
            <LinearGradient
              colors={['rgba(10, 22, 40, 0.85)', 'rgba(26, 47, 74, 0.9)', 'rgba(10, 22, 40, 0.95)']}
              style={styles.gradientBackground}
            />
            
            {/* Language Selector - Top Right */}
            <View style={styles.languageContainer}>
              <LanguageSelector compact />
            </View>
            
            {/* Header Logo */}
            <View style={styles.logoContainer}>
              <Ionicons name="leaf" size={60} color="#D4AF37" />
              <Text style={styles.title}>{t('home.title')}</Text>
              <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
            </View>

          {/* Features - Vrais arguments */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Ionicons name="flash-outline" size={22} color="#D4AF37" />
              <Text style={styles.featureText}>{t('home.features.simple')}</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="people-outline" size={22} color="#D4AF37" />
              <Text style={styles.featureText}>{t('home.features.collaborate')}</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="gift-outline" size={22} color="#D4AF37" />
              <Text style={styles.featureText}>{t('home.features.free')}</Text>
            </View>
          </View>

          {/* Buttons - CTA inversés pour conversion */}
          <View style={styles.buttonsContainer}>
            {/* CTA Principal - Essayer SANS inscription */}
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={goToPreview}
              activeOpacity={0.7}
              accessibilityLabel={t('home.cta.tryNow')}
              accessibilityRole="button"
            >
              <Ionicons name="play-outline" size={24} color="#0A1628" />
              <View style={styles.primaryButtonTextContainer}>
                <Text style={styles.primaryButtonText}>{t('home.cta.tryNow')}</Text>
                <Text style={styles.primaryButtonSubtext}>{t('home.cta.createTree')}</Text>
              </View>
            </TouchableOpacity>

            {/* Réassurance sous le CTA principal */}
            <View style={styles.reassuranceRow}>
              <View style={styles.reassuranceItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.reassuranceText}>{t('home.reassurance.noAccount')}</Text>
              </View>
              <View style={styles.reassuranceItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.reassuranceText}>{t('home.reassurance.free')}</Text>
              </View>
              <View style={styles.reassuranceItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.reassuranceText}>{t('home.reassurance.noCommitment')}</Text>
              </View>
            </View>

            {/* CTA Secondaire - Créer un compte */}
            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={goToRegister}
              activeOpacity={0.7}
              accessibilityLabel={t('home.cta.createAccount')}
              accessibilityRole="button"
            >
              <Ionicons name="person-add-outline" size={18} color="#D4AF37" />
              <Text style={styles.secondaryButtonText}>{t('home.cta.createAccount')}</Text>
            </TouchableOpacity>

            {/* Login Link - Discret */}
            <TouchableOpacity 
              style={styles.loginLink} 
              onPress={goToLogin}
              activeOpacity={0.7}
              accessibilityLabel={t('auth.login')}
              accessibilityRole="button"
            >
              <Text style={styles.loginLinkText}>{t('home.cta.alreadyMember')} </Text>
              <Text style={styles.loginLinkTextBold}>{t('home.cta.login')}</Text>
            </TouchableOpacity>
          </View>

          {/* Guides SEO Section - Design épuré */}
          <View style={styles.guidesSection}>
              <Text style={styles.guidesTitle}>{t('home.discover')}</Text>
              <View style={styles.guidesContainer}>
                {/* Bouton Défis - Gaming familial */}
                <TouchableOpacity style={styles.guideChipChallenge} onPress={() => router.push('/challenges')}>
                  <Ionicons name="trophy" size={14} color="#0A1628" />
                  <Text style={styles.guideChipTextChallenge}>{t('home.challenges')} 🎮</Text>
                </TouchableOpacity>
                {/* Bouton principal Pourquoi AÏLA */}
                <TouchableOpacity style={styles.guideChipHighlight} onPress={() => router.push('/pourquoi-aila')}>
                  <Ionicons name="sparkles" size={14} color="#0A1628" />
                  <Text style={styles.guideChipTextHighlight}>{t('home.whyAila')}</Text>
                </TouchableOpacity>
                {/* Bouton Blog */}
                <TouchableOpacity style={styles.guideChipBlog} onPress={() => router.push('/blog')}>
                  <Ionicons name="newspaper-outline" size={14} color="#D4AF37" />
                  <Text style={styles.guideChipTextBlog}>{t('home.blog')}</Text>
                </TouchableOpacity>
                {/* Bouton Communauté */}
                <TouchableOpacity style={styles.guideChip} onPress={() => router.push('/community')}>
                  <Ionicons name="people-circle-outline" size={14} color="#D4AF37" />
                  <Text style={styles.guideChipText}>{t('home.community')}</Text>
                </TouchableOpacity>
              </View>
              {/* Deuxième ligne - Guides SEO */}
              <View style={styles.guidesContainerSecondary}>
                <TouchableOpacity style={styles.guideChipSmall} onPress={() => router.push('/retrouver-ancetres-gratuitement')}>
                  <Text style={styles.guideChipTextSmall}>{t('home.ancestors')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.guideChipSmall} onPress={() => router.push('/genealogie-debutant-guide')}>
                  <Text style={styles.guideChipTextSmall}>{t('home.beginner')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.guideChipSmall} onPress={() => router.push('/traditions-familiales')}>
                  <Text style={styles.guideChipTextSmall}>{t('home.traditions')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.guideChipSmall} onPress={() => router.push('/organiser-cousinade')}>
                  <Text style={styles.guideChipTextSmall}>{t('home.cousinade')}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer text only */}
            <Text style={styles.footerSubtext}>{t('home.dataProtected')}</Text>
            
            {/* Mini gamification - Discret en bas */}
            <View style={styles.miniGamificationSection}>
              <DailyChallengeBanner />
              <SocialProofBanner />
            </View>
            
            {/* Legal Links - All on one line */}
            <View style={styles.legalLinks}>
              <TouchableOpacity onPress={() => router.push('/about')}>
                <Text style={styles.legalLink}>{t('home.about')}</Text>
              </TouchableOpacity>
              <Text style={styles.legalSeparator}>•</Text>
              <TouchableOpacity onPress={() => router.push('/blog')}>
                <Text style={styles.legalLink}>Blog</Text>
              </TouchableOpacity>
              <Text style={styles.legalSeparator}>•</Text>
              <TouchableOpacity onPress={() => router.push('/faq')}>
                <Text style={styles.legalLink}>FAQ</Text>
              </TouchableOpacity>
              <Text style={styles.legalSeparator}>•</Text>
              <TouchableOpacity onPress={() => router.push('/privacy')}>
                <Text style={styles.legalLink}>Confidentialité</Text>
              </TouchableOpacity>
              <Text style={styles.legalSeparator}>•</Text>
              <TouchableOpacity onPress={() => router.push('/terms')}>
                <Text style={styles.legalLink}>CGU</Text>
              </TouchableOpacity>
              <Text style={styles.legalSeparator}>•</Text>
              <TouchableOpacity onPress={() => router.push('/adminblog')}>
                <Text style={styles.legalLink}>Admin</Text>
              </TouchableOpacity>
            </View>
            
            {/* Spacer for bottom bar */}
            <View style={styles.bottomSpacer} />
          </View>
        </SafeAreaView>
      </ScrollView>
      
      {/* Bannière publicitaire fixée en bas avec boutons intégrés */}
      <View 
        nativeID="aila-bottom-bar"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#1E3A5F',
          borderTopWidth: 1,
          borderTopColor: '#2D4A6F',
          alignItems: 'center',
          zIndex: 100,
        }}>
        <View style={styles.adBannerContent}>
          {/* Bouton Partager */}
          <TouchableOpacity 
            style={styles.adShareButton}
            onPress={shareApp}
            activeOpacity={0.7}
          >
            <Ionicons name="share-social-outline" size={18} color="#D4AF37" />
            <Text style={styles.adShareButtonText}>{t('nav.share')}</Text>
          </TouchableOpacity>
          
          {/* Bouton Télécharger */}
          {isWeb && (
            <TouchableOpacity 
              style={styles.adInstallButton}
              onPress={handleInstallClick}
              activeOpacity={0.7}
            >
              <Ionicons name="download-outline" size={14} color="#A0AEC0" />
              <Text style={styles.adInstallButtonText}>{t('nav.download')}</Text>
            </TouchableOpacity>
          )}
          
          {/* Bouton Premium */}
          <TouchableOpacity 
            style={styles.adPremiumButton}
            onPress={() => router.push('/pricing')}
            activeOpacity={0.7}
          >
            <Ionicons name="star" size={14} color="#D4AF37" />
            <Text style={styles.adPremiumButtonText}>{t('nav.premium')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#152A45',
    position: 'relative', // Important pour que absolute fonctionne
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    paddingBottom: 140, // Espace pour la barre du bas fixe sur mobile
  },
  contentContainer: {
    paddingHorizontal: isLargeScreen ? 48 : 24,
    paddingTop: isLargeScreen ? 20 : 10,
    paddingBottom: 20,
    maxWidth: isLargeScreen ? 600 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  bottomSpacer: {
    height: 100, // Espace pour la barre du bas sur mobile
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#152A45',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#D4AF37',
    fontSize: 18,
    marginTop: 16,
    fontWeight: '500',
  },
  languageContainer: {
    position: 'absolute',
    top: 10,
    right: 16,
    zIndex: 100,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: isLargeScreen ? 6 : height * 0.01,
    marginBottom: isLargeScreen ? 6 : 6,
  },
  title: {
    fontSize: isLargeScreen ? 48 : 36,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 6,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: isLargeScreen ? 14 : 12,
    fontWeight: '500',
    color: '#D4AF37',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  sloganContainer: {
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
  },
  sloganLine1: {
    fontSize: 17,
    color: '#D4AF37',
    fontWeight: '400',
    fontStyle: 'italic',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  sloganLine2: {
    fontSize: 17,
    color: '#D4AF37',
    fontWeight: '400',
    fontStyle: 'italic',
    letterSpacing: 0.5,
    marginTop: 2,
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: isLargeScreen ? 4 : 6,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    paddingHorizontal: 16,
  },
  featureText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 12,
    flex: 1,
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 4,
    paddingBottom: 4,
  },
  primaryButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    // Shadow for emphasis
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonTextContainer: {
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#0A1628',
    fontSize: 15,
    fontWeight: '700',
  },
  primaryButtonSubtext: {
    color: '#0A1628',
    fontSize: 10,
    fontWeight: '500',
    opacity: 0.7,
    marginTop: 1,
  },
  reassuranceRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
    marginTop: 2,
  },
  reassuranceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  reassuranceText: {
    color: '#8BA1B7',
    fontSize: 11,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryButtonText: {
    color: '#D4AF37',
    fontSize: 12,
  },
  loginLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginBottom: 4,
  },
  loginLinkText: {
    color: '#8BA1B7',
    fontSize: 13,
  },
  loginLinkTextBold: {
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: '600',
  },
  previewNote: {
    color: '#6B7C93',
    fontSize: 11,
    marginTop: 2,
  },
  footerInline: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 10,
  },
  installButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3A5A7C',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  installButtonText: {
    color: '#6B8BB8',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  shareButtonText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    color: '#6B7C93',
    fontSize: 14,
  },
  footerSubtext: {
    color: '#4A5568',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    flexWrap: 'nowrap',
  },
  legalLink: {
    color: '#6B8BB8',
    fontSize: 10,
    textDecorationLine: 'underline',
  },
  legalSeparator: {
    color: '#4A5568',
    fontSize: 10,
    marginHorizontal: 4,
  },
  adContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1E3A5F',
    borderTopWidth: 1,
    borderTopColor: '#2D4A6F',
    alignItems: 'center',
    zIndex: 100,
  },
  adBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    maxWidth: 400, // Largeur max comme sur mobile
    width: '100%',
  },
  adShareButton: {
    flex: 1, // Prend l'espace disponible
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  adShareButtonText: {
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
  },
  adInstallButton: {
    flex: 1, // Prend l'espace disponible - CENTRÉ
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3A5A7C',
    borderRadius: 8,
    paddingVertical: 8,
    marginHorizontal: 8, // Marge pour centrer
    paddingHorizontal: 12,
    marginLeft: 16,
  },
  adInstallButtonText: {
    color: '#A0AEC0',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  adPremiumButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  adPremiumButtonText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    borderRadius: 20,
    alignSelf: 'center',
  },
  feedbackButtonText: {
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: '500',
  },
  communityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    borderRadius: 20,
    alignSelf: 'center',
  },
  communityButtonText: {
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: '500',
  },
  // Section "Pourquoi AILA" - Version compacte
  whySection: {
    marginTop: 20,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  whySectionTitle: {
    color: '#8BA1B7',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  whyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  whyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 5,
  },
  whyChipText: {
    color: '#B8C5D6',
    fontSize: 11,
    fontWeight: '500',
  },
  guidesSection: {
    marginTop: 4,
    marginBottom: 4,
  },
  gamificationRow: {
    marginTop: 8,
    marginBottom: 4,
    gap: 4,
  },
  miniGamificationSection: {
    marginTop: 8,
    marginBottom: 4,
    opacity: 0.8,
  },
  guidesTitle: {
    color: '#6B7C93',
    fontSize: 9,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  guidesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
  },
  guidesContainerSecondary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 12,
    marginTop: 6,
  },
  guideChipSmall: {
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  guideChipTextSmall: {
    color: '#6B7C93',
    fontSize: 10,
    textDecorationLine: 'underline',
  },
  guideChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 10,
    gap: 4,
  },
  guideChipHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 10,
    gap: 4,
  },
  guideChipBlog: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.5)',
  },
  guideChipTextBlog: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: '600',
  },
  guideChipText: {
    color: '#8BA1B7',
    fontSize: 11,
    fontWeight: '500',
  },
  guideChipTextHighlight: {
    color: '#0A1628',
    fontSize: 11,
    fontWeight: '600',
  },
  guideChipChallenge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  guideChipTextChallenge: {
    color: '#0A1628',
    fontSize: 11,
    fontWeight: '600',
  },
});
// Trigger Vercel deployment
// Force rebuild Mon Jan 12 14:50:50 UTC 2026
// Deploy: 1768281249
// Layout fix 1768284734
// Homepage simplified Mon Jan 19 12:40:24 UTC 2026
// Deploy fix 1768832382
// Mobile layout 1768833604
