import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/services/api';

const GOOGLE_CLIENT_ID = '548263066328-916g23gmboqvmqtd7fi3ejatoseh4h09.apps.googleusercontent.com';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gdprConsent, setGdprConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [googleInitialized, setGoogleInitialized] = useState(false);

  // Initialize Google Sign-In on mount
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const initializeGoogle = () => {
      if ((window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        setGoogleInitialized(true);
        console.log('Google Sign-In initialized for registration');
      }
    };

    // Check if script already loaded
    if ((window as any).google?.accounts?.id) {
      initializeGoogle();
    } else {
      // Load Google Identity Services script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      document.head.appendChild(script);
    }
  }, []);

  // Handle Google callback with the credential
  const handleGoogleCallback = async (response: any) => {
    console.log('Google callback received for registration');
    
    // Close any open Google popups
    closeGooglePopup();
    
    setGoogleLoading(true);
    setErrorMessage('');

    try {
      if (!response.credential) {
        throw new Error('No credential received from Google');
      }

      // Send the ID token to our backend
      const result = await api.post('/auth/google', {
        token: response.credential,
        id_token: response.credential,
      });

      if (result.data.access_token) {
        await AsyncStorage.setItem('auth_token', result.data.access_token);
        api.defaults.headers.common['Authorization'] = `Bearer ${result.data.access_token}`;
        await refreshUser();
        router.replace('/(tabs)/tree');
      } else {
        throw new Error('No access token received');
      }
    } catch (error: any) {
      console.error('Google signup error:', error);
      const message = error.response?.data?.detail || 'Erreur lors de l\'inscription Google. Veuillez réessayer.';
      showError(message);
    } finally {
      setGoogleLoading(false);
    }
  };

  // Close Google popup helper - Clean up ALL Google UI elements
  const closeGooglePopup = () => {
    console.log('[Google SignUp] Cleaning up Google UI elements');
    
    // Remove our custom popups
    const customPopups = document.querySelectorAll('#google-signup-backdrop, #google-signup-popup, #google-btn-signup');
    customPopups.forEach(el => el.remove());
    
    // Remove Google One Tap popup if present
    const googleContainers = document.querySelectorAll('[id^="credential_picker"], [id^="g_a11y"], .g_id_signin');
    googleContainers.forEach(el => el.remove());
    
    // Remove Google iframe popups
    const iframes = document.querySelectorAll('iframe[src*="accounts.google.com"]');
    iframes.forEach(el => el.remove());
    
    // Cancel any pending Google prompts
    try {
      (window as any).google?.accounts?.id?.cancel();
    } catch (e) {
      console.log('[Google SignUp] No prompt to cancel');
    }
    
    console.log('[Google SignUp] Cleanup complete');
  };

  // Handle Google button click - ALWAYS show account chooser
  const handleGoogleSignUp = () => {
    console.log('[Google SignUp] Button clicked');
    
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      Alert.alert('Info', 'L\'inscription Google n\'est disponible que sur le web.');
      return;
    }

    const google = (window as any).google;
    if (!google?.accounts?.id) {
      console.log('[Google SignUp] Google SDK not loaded, retrying...');
      showError('Google Sign-In est en cours de chargement. Veuillez patienter...');
      setTimeout(() => handleGoogleSignUp(), 1000);
      return;
    }

    setGoogleLoading(true);
    setErrorMessage('');

    // Cancel any existing prompts
    try {
      google.accounts.id.cancel();
    } catch (e) {
      console.log('[Google SignUp] No existing prompt to cancel');
    }

    // Clear stored credentials to force account chooser
    google.accounts.id.disableAutoSelect();

    // Reinitialize with fresh settings
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCallback,
      auto_select: false,
      cancel_on_tap_outside: true,
      prompt_parent_id: undefined,
      ux_mode: 'popup',  // Force popup mode
    });

    console.log('[Google SignUp] Showing account chooser fallback directly');
    // Skip One Tap and go directly to button fallback for reliable account chooser
    showGoogleButtonFallback();
  };

  // Fallback: Show Google Sign-In button in a modal
  const showGoogleButtonFallback = () => {
    // Remove existing popup if any
    closeGooglePopup();

    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.id = 'google-signup-backdrop';
    backdrop.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.6); z-index: 9998;
    `;
    backdrop.onclick = () => {
      closeGooglePopup();
      setGoogleLoading(false);
    };

    // Create popup
    const popup = document.createElement('div');
    popup.id = 'google-signup-popup';
    popup.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: white; padding: 32px; border-radius: 16px; z-index: 9999;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2); text-align: center; min-width: 300px;
    `;

    popup.innerHTML = `
      <h3 style="margin: 0 0 8px 0; color: #333; font-size: 18px;">S'inscrire avec Google</h3>
      <p style="margin: 0 0 20px 0; color: #666; font-size: 14px;">Choisissez votre compte</p>
      <div id="google-btn-signup" style="display: flex; justify-content: center;"></div>
      <button id="google-cancel-btn" style="
        margin-top: 16px; padding: 10px 24px; border: none; background: #f5f5f5;
        border-radius: 8px; cursor: pointer; color: #666; font-size: 14px;
      ">Annuler</button>
    `;

    document.body.appendChild(backdrop);
    document.body.appendChild(popup);

    // Add cancel handler
    document.getElementById('google-cancel-btn')?.addEventListener('click', () => {
      closeGooglePopup();
      setGoogleLoading(false);
    });

    // Render Google button
    (window as any).google.accounts.id.renderButton(
      document.getElementById('google-btn-signup'),
      { theme: 'outline', size: 'large', text: 'continue_with', width: 250 }
    );
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
    
    if (!email || !password) {
      showError('Veuillez remplir tous les champs');
      return;
    }

    // Validation email simple
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError('Adresse email invalide');
      return;
    }

    if (password.length < 6) {
      showError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (!gdprConsent) {
      showError('Vous devez accepter la politique de confidentialité');
      return;
    }

    setLoading(true);
    try {
      // Extraire prénom de l'email pour le profil initial
      const emailName = email.split('@')[0];
      const firstName = emailName.charAt(0).toUpperCase() + emailName.slice(1).split(/[._-]/)[0];
      
      await register({
        email,
        password,
        first_name: firstName,
        last_name: '',
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

          {/* Form - Simplifié */}
          <View style={styles.form}>
            {/* Error Message */}
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#FF6B6B" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Email */}
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#6B7C93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Votre email"
                placeholderTextColor="#6B7C93"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                accessibilityLabel="Adresse email"
                accessibilityHint="Entrez votre adresse email pour créer un compte"
              />
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#6B7C93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Mot de passe (6 caractères min.)"
                placeholderTextColor="#6B7C93"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                accessibilityLabel="Mot de passe"
                accessibilityHint="Créez un mot de passe d'au moins 6 caractères"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                accessibilityLabel={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                accessibilityRole="button"
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#6B7C93"
                />
              </TouchableOpacity>
            </View>

            {/* GDPR Consent - Checkbox style */}
            <TouchableOpacity 
              style={styles.gdprContainer}
              onPress={() => setGdprConsent(!gdprConsent)}
              accessibilityLabel="Accepter la politique de confidentialité"
              accessibilityRole="checkbox"
              accessibilityState={{ checked: gdprConsent }}
            >
              <View style={[styles.checkbox, gdprConsent && styles.checkboxChecked]}>
                {gdprConsent && <Ionicons name="checkmark" size={16} color="#0A1628" />}
              </View>
              <Text style={styles.gdprText}>
                J'accepte la{' '}
                <Text style={styles.gdprLink} onPress={() => router.push('/privacy')}>politique de confidentialité</Text>
              </Text>
            </TouchableOpacity>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              accessibilityLabel="Créer mon compte"
              accessibilityRole="button"
              accessibilityHint="Crée votre compte et accède à votre arbre généalogique"
            >
              {loading ? (
                <ActivityIndicator color="#0A1628" />
              ) : (
                <>
                  <Text style={styles.registerButtonText}>Créer mon compte gratuit</Text>
                  <Ionicons name="arrow-forward" size={20} color="#0A1628" />
                </>
              )}
            </TouchableOpacity>

            {/* Reassurance */}
            <View style={styles.reassurance}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#4CAF50" />
              <Text style={styles.reassuranceText}>Gratuit • Sans pub • Données protégées</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Déjà un compte ?</Text>
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
    padding: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7C93',
  },
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
  form: {
    gap: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 8,
    padding: 12,
    gap: 8,
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
    backgroundColor: '#1A2A44',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
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
  eyeIcon: {
    padding: 4,
  },
  gdprContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    paddingVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D4AF37',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#D4AF37',
  },
  gdprText: {
    color: '#8BA1B7',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  gdprLink: {
    color: '#D4AF37',
    textDecorationLine: 'underline',
  },
  reassurance: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 8,
  },
  reassuranceText: {
    color: '#8BA1B7',
    fontSize: 13,
  },
  registerButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  registerButtonText: {
    color: '#0A1628',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
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
});
