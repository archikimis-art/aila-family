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

  // Handle Google callback - defined before useEffect
  const handleGoogleCredential = async (credential: string) => {
    setGoogleLoading(true);
    setErrorMessage('');
    
    try {
      await loginWithGoogle(credential);
      router.replace('/(tabs)/tree');
    } catch (error: any) {
      console.error('Google login error:', error);
      showError(error.response?.data?.detail || error.message || 'Erreur de connexion avec Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Load Google Identity Services on web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Create a global callback function
      (window as any).handleGoogleCredentialResponse = (response: any) => {
        console.log('Google credential received');
        if (response.credential) {
          handleGoogleCredential(response.credential);
        }
      };

      // Load Google script if not already loaded
      if (!(window as any).google?.accounts?.id) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          initGoogleOneTap();
        };
        document.head.appendChild(script);
      } else {
        initGoogleOneTap();
      }
    }

    return () => {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        delete (window as any).handleGoogleCredentialResponse;
      }
    };
  }, []);

  const initGoogleOneTap = () => {
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.initialize({
        client_id: GOOGLE_WEB_CLIENT_ID,
        callback: (window as any).handleGoogleCredentialResponse,
        auto_select: false,
      });
    }
  };

  const handleGoogleLogin = () => {
    setErrorMessage('');
    
    if (Platform.OS !== 'web') {
      showError('La connexion Google est disponible uniquement sur le web.');
      return;
    }

    if (typeof window === 'undefined' || !(window as any).google?.accounts?.id) {
      showError('Google Sign-In non chargé. Veuillez rafraîchir la page.');
      return;
    }

    setGoogleLoading(true);
    
    // Use Google One Tap prompt
    (window as any).google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // One Tap not available, render the button instead
        setGoogleLoading(false);
        renderGoogleButton();
      } else if (notification.isDismissedMoment()) {
        setGoogleLoading(false);
      }
    });
  };

  const renderGoogleButton = () => {
    // Find or create a container for Google button
    let container = document.getElementById('google-signin-button');
    if (!container) {
      // Create a modal overlay with Google button
      const overlay = document.createElement('div');
      overlay.id = 'google-signin-overlay';
      overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;';
      
      const modal = document.createElement('div');
      modal.style.cssText = 'background:white;padding:30px;border-radius:16px;text-align:center;max-width:400px;';
      
      const title = document.createElement('h3');
      title.textContent = 'Connexion avec Google';
      title.style.cssText = 'margin:0 0 20px 0;color:#333;';
      
      container = document.createElement('div');
      container.id = 'google-signin-button';
      container.style.cssText = 'display:flex;justify-content:center;margin:20px 0;';
      
      const closeBtn = document.createElement('button');
      closeBtn.textContent = 'Annuler';
      closeBtn.style.cssText = 'margin-top:15px;padding:10px 30px;border:1px solid #ccc;background:white;border-radius:8px;cursor:pointer;';
      closeBtn.onclick = () => {
        overlay.remove();
        setGoogleLoading(false);
      };
      
      modal.appendChild(title);
      modal.appendChild(container);
      modal.appendChild(closeBtn);
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
    }
    
    // Render Google Sign-In button
    (window as any).google.accounts.id.renderButton(container, {
      theme: 'filled_blue',
      size: 'large',
      text: 'continue_with',
      width: 280,
    });
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
