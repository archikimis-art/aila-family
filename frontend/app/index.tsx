import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Share, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedTreeBackground } from '@/components/AnimatedTreeBackground';

const { height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const { loading } = useAuth();
  const router = useRouter();

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

          {/* Login Button - Big and clear */}
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={goToLogin}
            activeOpacity={0.7}
          >
            <Ionicons name="log-in-outline" size={22} color="#D4AF37" />
            <View style={styles.loginTextContainer}>
              <Text style={styles.loginSubText}>Déjà inscrit ?</Text>
              <Text style={styles.loginButtonText}>SE CONNECTER</Text>
            </View>
          </TouchableOpacity>

          {/* Footer inside buttons container */}
          <View style={styles.footerInline}>
            <TouchableOpacity 
              style={styles.shareButton}
              onPress={shareApp}
              activeOpacity={0.7}
            >
              <Ionicons name="share-social-outline" size={20} color="#D4AF37" />
              <Text style={styles.shareButtonText}>Partager l'application</Text>
            </TouchableOpacity>
            <Text style={styles.footerSubtext}>Vos données sont protégées</Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1628',
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 24,
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
    marginTop: height * 0.06,
    marginBottom: 30,
  },
  title: {
    fontSize: 42,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    letterSpacing: 2,
  },
  sloganContainer: {
    alignItems: 'center',
    marginTop: 16,
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
    marginBottom: 100,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
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
    justifyContent: 'center',
    paddingBottom: 20,
  },
  previewButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 2,
    borderColor: '#D4AF37',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    marginBottom: 16,
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
    paddingVertical: 18,
    paddingHorizontal: 24,
    marginBottom: 16,
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
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loginTextContainer: {
    marginLeft: 12,
    alignItems: 'flex-start',
  },
  loginSubText: {
    color: '#8B9AAF',
    fontSize: 12,
  },
  loginButtonText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  footerInline: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 20,
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
    marginTop: 4,
  },
});
