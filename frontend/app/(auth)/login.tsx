import React, { useState, useEffect, useCallback } from 'react';
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

// Google OAuth Client ID - From Google Cloud Console
const GOOGLE_WEB_CLIENT_ID = '548263066328-916g23gmboqvmqtd7fi3ejatoseh4h09.apps.googleusercontent.com';

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);

  // Load Google Identity Services script on web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Check if script already loaded
      if ((window as any).google?.accounts) {
        setGoogleScriptLoaded(true);
        initializeGoogleSignIn();
        return;
      }

      // Load Google Identity Services script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setGoogleScriptLoaded(true);
        initializeGoogleSignIn();
      };
      script.onerror = () => {
        console.error('Failed to load Google Sign-In script');
      };
      document.body.appendChild(script);

      return () => {
        // Cleanup if needed
      };
    }
  }, []);

  const initializeGoogleSignIn = useCallback(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && (window as any).google?.accounts) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_WEB_CLIENT_ID,
          callback: handleGoogleCallback,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        console.log('Google Sign-In initialized');
      } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
      }
    }
  }, []);

  const handleGoogleCallback = async (response: any) => {
    console.log('Google callback received:', response);
    setGoogleLoading(true);
    setErrorMessage('');
    
    try {
      if (response.credential) {
        // Send the ID token to our backend
        await loginWithGoogle(response.credential);
        router.replace('/(tabs)/tree');
      } else {
        showError('Token Google non reçu. Veuillez réessayer.');
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      showError(error.response?.data?.detail || error.message || 'Erreur de connexion avec Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage('');
    
    if (Platform.OS !== 'web') {
      showError('La connexion Google est disponible uniquement sur le web pour le moment.');
      return;
    }

    if (typeof window === 'undefined' || !(window as any).google?.accounts) {
      showError('Google Sign-In non chargé. Veuillez rafraîchir la page.');
      return;
    }

    setGoogleLoading(true);
    
    try {
      // Trigger Google One Tap or popup
      (window as any).google.accounts.id.prompt((notification: any) => {
        console.log('Google prompt notification:', notification);
        
        if (notification.isNotDisplayed()) {
          console.log('One Tap not displayed, reason:', notification.getNotDisplayedReason());
          // Fall back to popup
          openGooglePopup();
        } else if (notification.isSkippedMoment()) {
          console.log('One Tap skipped, reason:', notification.getSkippedReason());
          setGoogleLoading(false);
        } else if (notification.isDismissedMoment()) {
          console.log('One Tap dismissed, reason:', notification.getDismissedReason());
          setGoogleLoading(false);
        }
      });
    } catch (error) {
      console.error('Google prompt error:', error);
      openGooglePopup();
    }
  };

  const openGooglePopup = () => {
    // Use OAuth 2.0 popup as fallback
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_WEB_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(window.location.origin)}&` +
      `response_type=token id_token&` +
      `scope=openid email profile&` +
      `nonce=${Math.random().toString(36).substring(2)}`;
    
    const popup = window.open(
      authUrl,
      'Google Sign In',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // Listen for the popup to close or redirect
    const checkPopup = setInterval(() => {
      try {
        if (popup?.closed) {
          clearInterval(checkPopup);
          setGoogleLoading(false);
        } else if (popup?.location?.href?.includes(window.location.origin)) {
          // Get the token from the URL
          const hash = popup.location.hash;
          popup.close();
          clearInterval(checkPopup);
          
          if (hash) {
            const params = new URLSearchParams(hash.substring(1));
            const idToken = params.get('id_token');
            if (idToken) {
              handleGoogleCallback({ credential: idToken });
            } else {
              setGoogleLoading(false);
              showError('Token non reçu de Google.');
            }
          } else {
            setGoogleLoading(false);
          }
        }
      } catch (e) {
        // Cross-origin error, popup still on Google's domain
      }
    }, 500);

    // Timeout after 2 minutes
    setTimeout(() => {
      clearInterval(checkPopup);
      if (!popup?.closed) {
        popup?.close();
      }
      setGoogleLoading(false);
    }, 120000);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    if (Platform.OS !== 'web') {
      Alert.alert('Erreur', message);
    }
  };

  const handleLogin = async () => {
    setErrorMessage('');
    
    // Nettoyer l'email (enlever espaces)
    const cleanEmail = email.trim().toLowerCase();
    
    if (!cleanEmail || !password) {
      showError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      await login(cleanEmail, password);
      router.replace('/(tabs)/tree');
    } catch (error: any) {
      const detail = error.response?.data?.detail || '';
      
      // Messages d'erreur personnalisés - ORDRE IMPORTANT
      if (detail.includes('Invalid email or password') || detail.includes('Invalid credentials') || detail.includes('Incorrect')) {
        showError('Email ou mot de passe incorrect. Utilisez "Mot de passe oublié" ci-dessous pour le réinitialiser.');
      } else if (detail.includes('not found') || detail.includes('User not found')) {
        showError('Aucun compte trouvé avec cette adresse email. Veuillez vous inscrire.');
      } else if (detail.includes('Invalid email format')) {
        showError('Format d\'email invalide.');
      } else if (error.message?.includes('Network') || error.code === 'ERR_NETWORK') {
        showError('Erreur de connexion au serveur. Vérifiez votre connexion internet.');
      } else if (detail) {
        showError(detail);
      } else {
        showError('Erreur de connexion. Veuillez réessayer ou utiliser "Mot de passe oublié".');
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
          {/* Header */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#D4AF37" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Ionicons name="leaf" size={60} color="#D4AF37" />
            <Text style={styles.title}>Connexion</Text>
            <Text style={styles.subtitle}>Accédez à votre arbre généalogique</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Error Message */}
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

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => router.push('/(auth)/forgot-password')}
            >
              <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
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
            <TouchableOpacity
              style={[styles.googleButton, googleLoading && styles.loginButtonDisabled]}
              onPress={handleGoogleLogin}
              disabled={googleLoading || !request}
            >
              {googleLoading ? (
                <ActivityIndicator color="#333" />
              ) : (
                <>
                  <View style={styles.googleIconContainer}>
                    <Text style={styles.googleIcon}>G</Text>
                  </View>
                  <Text style={styles.googleButtonText}>Continuer avec Google</Text>
                </>
              )}
            </TouchableOpacity>
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
    paddingHorizontal: 24,
  },
  backButton: {
    marginTop: 16,
    padding: 8,
    alignSelf: 'flex-start',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
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
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 12,
    padding: 4,
  },
  forgotPasswordText: {
    color: '#D4AF37',
    fontSize: 14,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#0A1628',
    fontSize: 18,
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
  googleButton: {
    backgroundColor: '#4285F4',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 0,
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
    marginTop: 40,
    gap: 8,
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
