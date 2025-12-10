import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/(tabs)/tree');
    }
  }, [user, loading]);

  const handlePreviewMode = () => {
    router.push('/(tabs)/tree?preview=true');
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  const handleRegister = () => {
    router.push('/(auth)/register');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="leaf" size={60} color="#D4AF37" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0A1628', '#1A2F4A', '#0A1628']}
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
            <Text style={styles.featureText}>Créez votre arbre ensemble</Text>
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
          <TouchableOpacity style={styles.previewButton} onPress={handlePreviewMode}>
            <Ionicons name="eye-outline" size={22} color="#D4AF37" />
            <Text style={styles.previewButtonText}>Mode Aperçu</Text>
            <Text style={styles.previewNote}>Testez sans inscription (max 10 membres)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton} onPress={handleRegister}>
            <Ionicons name="person-add-outline" size={22} color="#0A1628" />
            <Text style={styles.primaryButtonText}>Créer un compte</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleLogin}>
            <Text style={styles.secondaryButtonText}>Déjà inscrit ? Se connecter</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Préservez votre héritage familial</Text>
          <Text style={styles.footerSubtext}>Vos données sont protégées</Text>
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
    marginTop: height * 0.08,
    marginBottom: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#B8C5D6',
    marginTop: 8,
    letterSpacing: 1,
  },
  sloganContainer: {
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  sloganLine1: {
    fontSize: 18,
    color: '#B8C5D6',
    fontWeight: '400',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  sloganLine2: {
    fontSize: 20,
    color: '#D4AF37',
    fontWeight: '600',
    marginVertical: 4,
    letterSpacing: 1,
    textAlign: 'center',
  },
  sloganLine3: {
    fontSize: 18,
    color: '#B8C5D6',
    fontWeight: '400',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#B8C5D6',
    fontSize: 16,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 30,
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
