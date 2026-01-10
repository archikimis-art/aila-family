import React, { useState, useEffect, useRef } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/services/api';

const GOOGLE_CLIENT_ID = '548263066328-916g23gmboqvmqtd7fi3ejatoseh4h09.apps.googleusercontent.com';

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { login, refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
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
        console.log('Google Sign-In initialized');
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
    console.log('Google callback received');
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
      console.error('Google login error:', error);
      const message = error.response?.data?.detail || 'Erreur lors de la connexion Google. Veuillez réessayer.';
      showError(message);
    } finally {
      setGoogleLoading(false);
    }
  };

  // Handle Google button click
  const handleGoogleLogin = () => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      showError('La connexion Google n\'est disponible que sur le web.');
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
          console.log('One Tap not available, using standard flow');
          
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
          tempDiv.id = 'google-signin-popup';
          
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
          title.innerHTML = 'Connectez-vous avec Google';
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
            text: 'continue_with',
            width: 280,
          });
        } else if (notification.isDismissedMoment()) {
          console.log('Google prompt dismissed');
          setGoogleLoading(false);
        }
      });
    } catch (error) {
      console.error('Error triggering Google Sign-In:', error);
      setGoogleLoading(false);
      showError('Erreur lors de la connexion Google.');
    }
  };

  // Handle legacy OAuth callback (from URL params)
  useEffect(() => {
    const handleOAuthCallback = async () => {
      if (params.token && params.google_auth === 'success') {
        setGoogleLoading(true);
        try {
          await AsyncStorage.setItem('auth_token', params.token as string);
          api.defaults.headers.common['Authorization'] = `Bearer ${params.token}`;
          await refreshUser();
          router.replace('/(tabs)/tree');
        } catch (error) {
          console.error('OAuth callback error:', error);
          showError('Erreur lors de la connexion.');
        } finally {
          setGoogleLoading(false);
        }
      }
      if (params.error) {
        showError('La connexion Google a échoué.');
      }
    };
    handleOAuthCallback();
  }, [params]);

  const showError = (message: string) => {
    setErrorMessage(message);
    if (Platform.OS !== 'web') {
      Alert.alert('Erreur', message);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      showError('Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      await login(email.trim().toLowerCase(), password);
      router.replace('/(tabs)/tree');
    } catch (error: any) {
      const detail = error.response?.data?.detail || '';
      if (detail.includes('Invalid credentials') || detail.includes('Identifiants invalides')) {
        showError('Email ou mot de passe incorrect.');
      } else if (detail.includes('User not found')) {
        showError('Aucun compte trouvé avec cet email.');
      } else {
        showError(detail || 'Erreur de connexion. Veuillez réessayer.');
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
        >
          {/* Logo and Title */}
          <View style={styles.header}>
            <Text style={styles.logo}>🌳</Text>
            <Text style={styles.title}>Bienvenue sur AÏLA</Text>
            <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#FF6B6B" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

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

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => router.push('/(auth)/forgot-password')}
            >
              <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0A1628" />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Se connecter</Text>
                  <Ionicons name="arrow-forward" size={20} color="#0A1628" />
                </>
              )}
            </TouchableOpacity>

            {/* Separator */}
            <View style={styles.separator}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>ou</Text>
              <View style={styles.separatorLine} />
            </View>

            {/* Google Sign In Button */}
            {Platform.OS === 'web' && (
              <TouchableOpacity
                style={[styles.googleButton, googleLoading && styles.buttonDisabled]}
                onPress={handleGoogleLogin}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <View style={styles.googleIconContainer}>
                      <Text style={styles.googleIcon}>G</Text>
                    </View>
                    <Text style={styles.googleButtonText}>Continuer avec Google</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Pas encore de compte ?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.registerLink}>Créer un compte</Text>
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7C93',
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2A44',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
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
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    color: '#D4AF37',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#0A1628',
    fontSize: 16,
    fontWeight: '600',
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
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
  googleButton: {
    backgroundColor: '#4285F4',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    gap: 4,
  },
  footerText: {
    color: '#6B7C93',
    fontSize: 14,
  },
  registerLink: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
  },
});
