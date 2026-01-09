import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gdprConsent, setGdprConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleGoogleSignUp = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      setGoogleLoading(true);
      // Redirect to backend Google OAuth endpoint
      window.location.href = '/api/auth/google/login';
    } else {
      Alert.alert('Info', 'L\'inscription Google n\'est disponible que sur le web pour le moment.');
    }
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    if (Platform.OS === 'web') {
      // Keep error visible on screen for web
    } else {
      Alert.alert('Erreur', message);
    }
  };

  const handleRegister = async () => {
    setErrorMessage('');
    
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      showError('Veuillez remplir tous les champs');
      return;
    }

    if (password !== confirmPassword) {
      showError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      showError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (!gdprConsent) {
      showError('Vous devez accepter la politique de confidentialité pour créer un compte');
      return;
    }

    setLoading(true);
    try {
      await register({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        gdpr_consent: gdprConsent,
      });
      router.replace('/(tabs)/tree');
    } catch (error: any) {
      const detail = error.response?.data?.detail || '';
      
      // Messages d'erreur personnalisés
      if (detail.includes('already registered') || detail.includes('existe déjà')) {
        showError('Cette adresse email est déjà utilisée. Veuillez vous connecter ou utiliser une autre adresse.');
      } else if (detail.includes('Invalid email')) {
        showError('Adresse email invalide. Veuillez vérifier le format.');
      } else if (detail) {
        showError(detail);
      } else {
        showError('Erreur lors de l\'inscription. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#D4AF37" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Ionicons name="leaf" size={50} color="#D4AF37" />
            <Text style={styles.title}>Créer un compte</Text>
            <Text style={styles.subtitle}>Commencez votre arbre généalogique</Text>
          </View>

          {/* Google Sign Up Button - En premier pour plus de visibilité */}
          {Platform.OS === 'web' && (
            <View style={styles.googleSection}>
              <TouchableOpacity
                style={[styles.googleButton, googleLoading && styles.buttonDisabled]}
                onPress={handleGoogleSignUp}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <View style={styles.googleIconContainer}>
                      <Text style={styles.googleIcon}>G</Text>
                    </View>
                    <Text style={styles.googleButtonText}>S'inscrire avec Google</Text>
                  </>
                )}
              </TouchableOpacity>
              
              {/* Separator */}
              <View style={styles.separator}>
                <View style={styles.separatorLine} />
                <Text style={styles.separatorText}>ou par email</Text>
                <View style={styles.separatorLine} />
              </View>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            {/* Error Message */}
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#FF6B6B" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfInput]}>
                <Ionicons name="person-outline" size={20} color="#6B7C93" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Prénom"
                  placeholderTextColor="#6B7C93"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                />
              </View>
              <View style={[styles.inputContainer, styles.halfInput]}>
                <TextInput
                  style={styles.input}
                  placeholder="Nom"
                  placeholderTextColor="#6B7C93"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#6B7C93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Adresse email"
                placeholderTextColor="#6B7C93"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#6B7C93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor="#6B7C93"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#6B7C93"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#6B7C93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirmer le mot de passe"
                placeholderTextColor="#6B7C93"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </View>

            {/* GDPR Consent */}
            <View style={styles.gdprContainer}>
              <View style={styles.gdprHeader}>
                <Ionicons name="shield-checkmark-outline" size={24} color="#D4AF37" />
                <Text style={styles.gdprTitle}>Protection des données (RGPD)</Text>
              </View>
              <Text style={styles.gdprText}>
                En créant un compte, vous consentez au traitement de vos données personnelles 
                conformément à notre politique de confidentialité. Vous pouvez à tout moment :
              </Text>
              <View style={styles.gdprList}>
                <Text style={styles.gdprListItem}>• Accéder à vos données</Text>
                <Text style={styles.gdprListItem}>• Rectifier vos informations</Text>
                <Text style={styles.gdprListItem}>• Demander la suppression de votre compte</Text>
                <Text style={styles.gdprListItem}>• Exporter vos données</Text>
              </View>
              <View style={styles.consentRow}>
                <Switch
                  value={gdprConsent}
                  onValueChange={setGdprConsent}
                  trackColor={{ false: '#2A3F5A', true: '#D4AF37' }}
                  thumbColor={gdprConsent ? '#FFFFFF' : '#6B7C93'}
                />
                <Text style={styles.consentText}>
                  J'accepte la politique de confidentialité et le traitement de mes données
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.registerButton, loading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0A1628" />
              ) : (
                <>
                  <Text style={styles.registerButtonText}>Créer mon compte</Text>
                  <Ionicons name="arrow-forward" size={20} color="#0A1628" />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Déjà inscrit ?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.loginLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1628',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  backButton: {
    marginTop: 16,
    padding: 8,
    alignSelf: 'flex-start',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#B8C5D6',
    marginTop: 8,
  },
  form: {
    gap: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderWidth: 1,
    borderColor: '#FF6B6B',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2F4A',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#2A3F5A',
  },
  halfInput: {
    flex: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  gdprContainer: {
    backgroundColor: '#1A2F4A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A3F5A',
  },
  gdprHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  gdprTitle: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
  },
  gdprText: {
    color: '#B8C5D6',
    fontSize: 14,
    lineHeight: 20,
  },
  gdprList: {
    marginTop: 8,
    marginBottom: 16,
  },
  gdprListItem: {
    color: '#B8C5D6',
    fontSize: 13,
    lineHeight: 22,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  consentText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
  registerButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#0A1628',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    gap: 8,
  },
  footerText: {
    color: '#6B7C93',
    fontSize: 14,
  },
  loginLink: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
  },
  // Google Sign Up Styles
  googleSection: {
    marginBottom: 8,
  },
  googleButton: {
    backgroundColor: '#4285F4',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  googleIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  googleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2A3F5A',
  },
  separatorText: {
    color: '#6B7C93',
    fontSize: 14,
    paddingHorizontal: 16,
  },
});
