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
  Switch,
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
    setGoogleLoading(true);
    setErrorMessage('');

    try {
      if (!response.credential) {
        throw new Error('No credential received from Google');
      }

      // Send the ID token to our backend
      const result = await api.post('/api/auth/google', {
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

  // Handle Google button click
  const handleGoogleSignUp = () => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      Alert.alert('Info', 'L\'inscription Google n\'est disponible que sur le web.');
      return;
    }

    if (!googleInitialized || !(window as any).google?.accounts?.id) {
      showError('Google Sign-In est en cours de chargement. Veuillez patienter...');
      return;
    }

    setGoogleLoading(true);
    setErrorMessage('');

    try {
      // Trigger Google One Tap
      (window as any).google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // One Tap not available, show the standard button popup
          console.log('One Tap not available, using standard flow for registration');
          
          // Create a temporary container for Google button
          const tempDiv = document.createElement('div');
          tempDiv.style.position = 'fixed';
          tempDiv.style.top = '50%';
          tempDiv.style.left = '50%';
          tempDiv.style.transform = 'translate(-50%, -50%)';
          tempDiv.style.zIndex = '9999';
          tempDiv.style.background = 'white';
          tempDiv.style.padding = '20px';
          tempDiv.style.borderRadius = '12px';
          tempDiv.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
          tempDiv.id = 'google-signup-popup';
          
          // Add close button
          const closeBtn = document.createElement('button');
          closeBtn.innerHTML = '✕';
          closeBtn.style.position = 'absolute';
          closeBtn.style.top = '5px';
          closeBtn.style.right = '10px';
          closeBtn.style.border = 'none';
          closeBtn.style.background = 'none';
          closeBtn.style.fontSize = '20px';
          closeBtn.style.cursor = 'pointer';
          closeBtn.onclick = () => {
            document.body.removeChild(tempDiv);
            setGoogleLoading(false);
          };
          
          const title = document.createElement('p');
          title.innerHTML = 'Inscrivez-vous avec Google';
          title.style.marginBottom = '15px';
          title.style.fontWeight = 'bold';
          title.style.textAlign = 'center';
          
          const btnContainer = document.createElement('div');
          btnContainer.id = 'google-btn-container';
          
          tempDiv.appendChild(closeBtn);
          tempDiv.appendChild(title);
          tempDiv.appendChild(btnContainer);
          document.body.appendChild(tempDiv);
          
          // Render Google button
          (window as any).google.accounts.id.renderButton(btnContainer, {
            type: 'standard',
            theme: 'filled_blue',
            size: 'large',
            text: 'signup_with',
            width: 280,
          });
        } else if (notification.isDismissedMoment()) {
          console.log('Google prompt dismissed');
          setGoogleLoading(false);
        }
      });
    } catch (error) {
      console.error('Error triggering Google Sign-Up:', error);
      setGoogleLoading(false);
      showError('Erreur lors de l\'inscription Google.');
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
      showError('Vous devez accepter la politique de confidentialité');
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
                placeholder="Email"
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
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
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
              <Switch
                value={gdprConsent}
                onValueChange={setGdprConsent}
                trackColor={{ false: '#2A3F5A', true: '#D4AF37' }}
                thumbColor={gdprConsent ? '#FFFFFF' : '#6B7C93'}
              />
              <View style={styles.gdprTextContainer}>
                <Text style={styles.gdprText}>
                  J'accepte la{' '}
                  <Text style={styles.gdprLink}>politique de confidentialité</Text>
                  {' '}et les{' '}
                  <Text style={styles.gdprLink}>conditions d'utilisation</Text>
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.registerButton, loading && styles.buttonDisabled]}
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
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 8,
  },
  gdprTextContainer: {
    flex: 1,
  },
  gdprText: {
    color: '#6B7C93',
    fontSize: 14,
    lineHeight: 20,
  },
  gdprLink: {
    color: '#D4AF37',
    textDecorationLine: 'underline',
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
