import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Share, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedTreeBackground } from '@/components/AnimatedTreeBackground';

const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isLargeScreen = width > 768;

export default function WelcomeScreen() {
  const { loading } = useAuth();
  const router = useRouter();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

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
      <SafeAreaView style={styles.container}>
        {/* Animated Background */}
        <AnimatedTreeBackground />
        
        <LinearGradient
          colors={['rgba(10, 22, 40, 0.85)', 'rgba(26, 47, 74, 0.9)', 'rgba(10, 22, 40, 0.95)']}
          style={styles.gradient}
        >
          {/* Header Logo */}
          <View style={styles.logoContainer}>
            <Ionicons name="leaf" size={80} color="#D4AF37" />
            <Text style={styles.title}>AÏLA</Text>
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

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            {/* Preview Button */}
            <TouchableOpacity 
              style={styles.previewButton} 
              onPress={goToPreview}
              activeOpacity={0.7}
            >
              <Ionicons name="eye-outline" size={22} color="#D4AF37" />
              <Text style={styles.previewButtonText}>Mode Aperçu</Text>
              <Text style={styles.previewNote}>Testez sans inscription (max 10 membres)</Text>
            </TouchableOpacity>

            {/* Register Button */}
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={goToRegister}
              activeOpacity={0.7}
            >
              <Ionicons name="person-add-outline" size={22} color="#0A1628" />
              <Text style={styles.primaryButtonText}>Créer un compte</Text>
            </TouchableOpacity>

            {/* Login Button - Simple text */}
            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={goToLogin}
              activeOpacity={0.7}
            >
              <Text style={styles.loginButtonText}>Déjà inscrit ?  </Text>
              <Text style={styles.loginButtonTextBold}>Se connecter</Text>
            </TouchableOpacity>

            {/* Footer text only */}
            <Text style={styles.footerSubtext}>Vos données sont protégées</Text>
          </View>
        </LinearGradient>
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
          
          {/* Bouton Installer l'app */}
          {isWeb && (
            <TouchableOpacity 
              style={styles.adInstallButton}
              onPress={handleInstallClick}
              activeOpacity={0.7}
            >
              <Ionicons name="download-outline" size={16} color="#A0AEC0" />
              <Text style={styles.adInstallButtonText}>Installer l'app</Text>
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
    backgroundColor: '#1E3A5F', // Même couleur que la bannière pub pour éviter la bande blanche
  },
  container: {
    flex: 1,
    backgroundColor: '#0A1628',
  },
  gradient: {
    flex: 1,
    paddingHorizontal: isLargeScreen ? 48 : 24,
    maxWidth: isLargeScreen ? 600 : '100%',
    alignSelf: 'center',
    width: '100%',
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
  previewButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 2,
    borderColor: '#D4AF37',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginBottom: 12,
    alignItems: 'center',
  },
  previewButtonText: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  previewNote: {
    color: '#B8C5D6',
    fontSize: 12,
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#0A1628',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  loginButton: {
    backgroundColor: '#1A2F4A',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginTextRow: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  loginButtonText: {
    color: '#D4AF37',
    fontSize: 16,
  },
  loginButtonTextBold: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '700',
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
  adContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1E3A5F',
    borderTopWidth: 1,
    borderTopColor: '#2D4A6F',
  },
  adBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Espace égal entre les boutons
    paddingVertical: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginLeft: 16,
  },
  adPremiumButtonText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});
