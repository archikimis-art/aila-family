import React, { useState, useEffect, lazy, Suspense } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Share, Platform, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

// Lazy load the animated background for better LCP
const AnimatedTreeBackground = lazy(() => import('@/components/AnimatedTreeBackground').then(m => ({ default: m.AnimatedTreeBackground })));

const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isLargeScreen = width > 768;

export default function WelcomeScreen() {
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
      const handleBeforeInstallPrompt = (e: any) => {
        e.preventDefault();
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
    if (!deferredPrompt) {
      // Fallback instructions
      if (Platform.OS === 'web') {
        window.alert(
          '📲 Pour installer AÏLA :\n\n' +
          '• Sur Chrome/Edge : Cliquez sur ⋮ puis "Installer l\'application"\n' +
          '• Sur Safari (iPhone) : Cliquez sur ⬆️ puis "Sur l\'écran d\'accueil"\n' +
          '• Sur Android : Cliquez sur ⋮ puis "Ajouter à l\'écran d\'accueil"'
        );
      }
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('PWA install outcome:', outcome);
    
    if (outcome === 'accepted') {
      setShowInstallButton(false);
    }
    setDeferredPrompt(null);
  };

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
            {/* Header Logo */}
            <View style={styles.logoContainer}>
              <Ionicons name="leaf" size={80} color="#D4AF37" />
              <Text style={styles.title}>AÏLA</Text>
              <Text style={styles.subtitle}>FAMILLE</Text>
              <View style={styles.sloganContainer}>
                <Text style={styles.sloganLine1}>L'arbre généalogique</Text>
                <Text style={styles.sloganLine2}>qui connecte votre famille</Text>
              </View>
            </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Ionicons name="git-branch-outline" size={28} color="#D4AF37" />
              <Text style={styles.featureText}>Créez votre arbre généalogique</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="chatbubbles-outline" size={28} color="#D4AF37" />
              <Text style={styles.featureText}>Discutez en famille</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="calendar-outline" size={28} color="#D4AF37" />
              <Text style={styles.featureText}>Partagez vos souvenirs</Text>
            </View>
          </View>

          {/* Buttons - Hiérarchie optimisée */}
          <View style={styles.buttonsContainer}>
            {/* CTA Principal - Inscription */}
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={goToRegister}
              activeOpacity={0.7}
              accessibilityLabel="Créer mon arbre généalogique gratuitement"
              accessibilityRole="button"
              accessibilityHint="Ouvre le formulaire d'inscription pour créer votre arbre"
            >
              <Ionicons name="leaf-outline" size={24} color="#0A1628" />
              <Text style={styles.primaryButtonText}>Créer mon arbre gratuit</Text>
            </TouchableOpacity>

            {/* Réassurance sous le CTA principal */}
            <View style={styles.reassuranceRow}>
              <View style={styles.reassuranceItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.reassuranceText}>Gratuit</Text>
              </View>
              <View style={styles.reassuranceItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.reassuranceText}>Simple</Text>
              </View>
              <View style={styles.reassuranceItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.reassuranceText}>Sécurisé</Text>
              </View>
            </View>

            {/* CTA Secondaire - Aperçu */}
            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={goToPreview}
              activeOpacity={0.7}
              accessibilityLabel="Essayer sans inscription"
              accessibilityRole="button"
              accessibilityHint="Tester l'application avec un arbre limité à 10 membres"
            >
              <Ionicons name="eye-outline" size={18} color="#D4AF37" />
              <Text style={styles.secondaryButtonText}>Essayer sans inscription</Text>
            </TouchableOpacity>

            {/* Login Link - Discret */}
            <TouchableOpacity 
              style={styles.loginLink} 
              onPress={goToLogin}
              activeOpacity={0.7}
              accessibilityLabel="Se connecter à un compte existant"
              accessibilityRole="button"
            >
              <Text style={styles.loginLinkText}>Déjà inscrit ? </Text>
              <Text style={styles.loginLinkTextBold}>Se connecter</Text>
            </TouchableOpacity>

            {/* Guides SEO Section - Design épuré */}
            <View style={styles.guidesSection}>
              <Text style={styles.guidesTitle}>Guides & Ressources</Text>
              <View style={styles.guidesContainer}>
                <TouchableOpacity style={styles.guideChip} onPress={() => router.push('/retrouver-ancetres-gratuitement')}>
                  <Ionicons name="search-outline" size={14} color="#D4AF37" />
                  <Text style={styles.guideChipText}>Ancêtres</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.guideChip} onPress={() => router.push('/genealogie-debutant-guide')}>
                  <Ionicons name="school-outline" size={14} color="#D4AF37" />
                  <Text style={styles.guideChipText}>Débutant</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.guideChip} onPress={() => router.push('/traditions-familiales')}>
                  <Ionicons name="gift-outline" size={14} color="#D4AF37" />
                  <Text style={styles.guideChipText}>Traditions</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.guideChip} onPress={() => router.push('/organiser-cousinade')}>
                  <Ionicons name="people-outline" size={14} color="#D4AF37" />
                  <Text style={styles.guideChipText}>Cousinade</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.guideChip} onPress={() => router.push('/ecrire-histoire-famille')}>
                  <Ionicons name="create-outline" size={14} color="#D4AF37" />
                  <Text style={styles.guideChipText}>Écrire</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.guideChip} onPress={() => router.push('/preserver-histoire-famille')}>
                  <Ionicons name="images-outline" size={14} color="#D4AF37" />
                  <Text style={styles.guideChipText}>Préserver</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer text only */}
            <Text style={styles.footerSubtext}>Vos données sont protégées</Text>
            
            {/* Legal Links - All on one line */}
            <View style={styles.legalLinks}>
              <TouchableOpacity onPress={() => router.push('/about')}>
                <Text style={styles.legalLink}>À propos</Text>
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
            </View>
            
            {/* Spacer for bottom bar */}
            <View style={styles.bottomSpacer} />
          </View>
        </ScrollView>
      </SafeAreaView>
      
      {/* Bannière publicitaire fixée en bas avec boutons intégrés */}
      <View style={styles.adContainer}>
        <View style={styles.adBannerContent}>
          {/* Bouton Partager */}
          <TouchableOpacity 
            style={styles.adShareButton}
            onPress={shareApp}
            activeOpacity={0.7}
          >
            <Ionicons name="share-social-outline" size={18} color="#D4AF37" />
            <Text style={styles.adShareButtonText}>Partager</Text>
          </TouchableOpacity>
          
          {/* Bouton Télécharger */}
          {isWeb && (
            <TouchableOpacity 
              style={styles.adInstallButton}
              onPress={handleInstallClick}
              activeOpacity={0.7}
            >
              <Ionicons name="download-outline" size={14} color="#A0AEC0" />
              <Text style={styles.adInstallButtonText}>Télécharger</Text>
            </TouchableOpacity>
          )}
          
          {/* Bouton Premium */}
          <TouchableOpacity 
            style={styles.adPremiumButton}
            onPress={() => router.push('/pricing')}
            activeOpacity={0.7}
          >
            <Ionicons name="star" size={14} color="#D4AF37" />
            <Text style={styles.adPremiumButtonText}>Premium</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#0A1628',
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  safeArea: {
    flex: 1,
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Espace pour la barre du bas fixe
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
    height: 20, // Un peu d'espace supplémentaire
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A1628',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#D4AF37',
    fontSize: 18,
    marginTop: 16,
    fontWeight: '500',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: isLargeScreen ? 10 : height * 0.02,
    marginBottom: isLargeScreen ? 10 : 15,
  },
  title: {
    fontSize: isLargeScreen ? 52 : 42,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: isLargeScreen ? 18 : 14,
    fontWeight: '600',
    color: '#D4AF37',
    letterSpacing: 6,
    marginTop: 4,
  },
  sloganContainer: {
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  sloganLine1: {
    fontSize: 19,
    color: '#D4AF37',
    fontWeight: '400',
    fontStyle: 'italic',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  sloganLine2: {
    fontSize: 19,
    color: '#D4AF37',
    fontWeight: '400',
    fontStyle: 'italic',
    letterSpacing: 0.5,
    marginTop: 2,
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: isLargeScreen ? 10 : 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 16,
    flex: 1,
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 10,
    paddingBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    // Shadow for emphasis
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#0A1628',
    fontSize: 18,
    fontWeight: '700',
  },
  reassuranceRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
    marginTop: 4,
  },
  reassuranceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reassuranceText: {
    color: '#8BA1B7',
    fontSize: 12,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#D4AF37',
    fontSize: 14,
  },
  loginLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  loginLinkText: {
    color: '#8BA1B7',
    fontSize: 14,
  },
  loginLinkTextBold: {
    color: '#D4AF37',
    fontSize: 14,
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
    alignItems: 'center', // Centre le contenu sur web
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
    flex: 1, // Prend l'espace disponible
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
  guidesSection: {
    marginTop: 16,
    marginBottom: 12,
  },
  guidesTitle: {
    color: '#6B7C93',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  guidesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  guideChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
  },
  guideChipText: {
    color: '#8BA1B7',
    fontSize: 12,
    fontWeight: '500',
  },
});
// Trigger Vercel deployment
// Force rebuild Mon Jan 12 14:50:50 UTC 2026
