import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend API URL (même que admin.tsx)
const PRODUCTION_API_URL = 'https://aila-backend-hc1m.onrender.com/api';
const getApiUrl = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8001/api';
    }
    return PRODUCTION_API_URL;
  }
  return PRODUCTION_API_URL;
};

// Mot de passe par défaut (peut être changé via l'interface)
const DEFAULT_PASSWORD = 'aila2025blog';
const PASSWORD_STORAGE_KEY = 'adminblog_password';
const RESET_CODE = 'AILA-RESET-2025'; // Code de réinitialisation

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  icon: string;
  read_time: string;
  date: string;
  published: boolean;
}

export default function AdminBlogScreen() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [storedPassword, setStoredPassword] = useState(DEFAULT_PASSWORD);
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [icon, setIcon] = useState('document-text-outline');
  const [readTime, setReadTime] = useState('5 min');
  
  // Settings
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const API_URL = getApiUrl();

  useEffect(() => {
    loadStoredPassword();
  }, []);

  const loadStoredPassword = async () => {
    try {
      const saved = await AsyncStorage.getItem(PASSWORD_STORAGE_KEY);
      if (saved) {
        setStoredPassword(saved);
      }
    } catch (e) {
      console.error('Error loading password:', e);
    }
  };

  const handleLogin = () => {
    if (password === storedPassword) {
      setIsLoggedIn(true);
      fetchArticles();
    } else {
      if (Platform.OS === 'web') {
        alert('Mot de passe incorrect');
      } else {
        Alert.alert('Erreur', 'Mot de passe incorrect');
      }
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }
    
    try {
      await AsyncStorage.setItem(PASSWORD_STORAGE_KEY, newPassword);
      setStoredPassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      setShowSettings(false);
      Alert.alert('Succès', 'Mot de passe modifié');
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de sauvegarder');
    }
  };

  const handleResetPassword = async () => {
    if (resetCode === RESET_CODE) {
      try {
        await AsyncStorage.removeItem(PASSWORD_STORAGE_KEY);
        setStoredPassword(DEFAULT_PASSWORD);
        setShowResetModal(false);
        setResetCode('');
        if (Platform.OS === 'web') {
          alert('Mot de passe réinitialisé ! Utilisez : aila2025blog');
        } else {
          Alert.alert('Succès', 'Mot de passe réinitialisé ! Utilisez : aila2025blog');
        }
      } catch (e) {
        Alert.alert('Erreur', 'Impossible de réinitialiser');
      }
    } else {
      if (Platform.OS === 'web') {
        alert('Code de réinitialisation incorrect');
      } else {
        Alert.alert('Erreur', 'Code de réinitialisation incorrect');
      }
    }
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/blog/articles`);
      if (response.ok) {
        const data = await response.json();
        setArticles(data);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      // Articles de démo si API non disponible
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveArticle = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Erreur', 'Titre et contenu requis');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('admin_token');
      const url = editingArticle 
        ? `${API_URL}/blog/articles/${editingArticle.id}`
        : `${API_URL}/blog/articles`;
      
      const method = editingArticle ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          title,
          excerpt,
          content,
          icon,
          read_time: readTime,
        }),
      });

      if (response.ok) {
        Alert.alert('Succès', editingArticle ? 'Article modifié' : 'Article créé');
        resetForm();
        fetchArticles();
      } else {
        Alert.alert('Info', 'Fonctionnalité bientôt disponible. Les articles sont gérés dans le code pour l\'instant.');
        resetForm();
      }
    } catch (error) {
      Alert.alert('Info', 'API non disponible. Contactez le développeur pour ajouter des articles.');
      resetForm();
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (Platform.OS === 'web') {
      if (!window.confirm('Supprimer cet article ?')) return;
    }
    
    try {
      const token = await AsyncStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/blog/articles/${articleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (response.ok) {
        fetchArticles();
      } else {
        Alert.alert('Info', 'Fonctionnalité bientôt disponible');
      }
    } catch (error) {
      Alert.alert('Info', 'API non disponible');
    }
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setTitle(article.title);
    setExcerpt(article.excerpt);
    setContent(article.content);
    setIcon(article.icon);
    setReadTime(article.read_time);
    setShowEditor(true);
  };

  const resetForm = () => {
    setEditingArticle(null);
    setTitle('');
    setExcerpt('');
    setContent('');
    setIcon('document-text-outline');
    setReadTime('5 min');
    setShowEditor(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setPassword('');
  };

  // Login screen
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loginContainer}>
          <TouchableOpacity style={styles.backButtonAbs} onPress={() => router.push('/')}>
            <Ionicons name="arrow-back" size={24} color="#D4AF37" />
          </TouchableOpacity>
          
          <Ionicons name="newspaper" size={60} color="#D4AF37" />
          <Text style={styles.loginTitle}>Admin Blog</Text>
          <Text style={styles.loginSubtitle}>Gestion des articles</Text>
          
          {!showResetModal ? (
            <>
              <TextInput
                style={styles.passwordInput}
                placeholder="Mot de passe"
                placeholderTextColor="#6B7C93"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                onSubmitEditing={handleLogin}
              />
              
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={handleLogin}
              >
                <Text style={styles.loginButtonText}>Se connecter</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.forgotButton}
                onPress={() => setShowResetModal(true)}
              >
                <Text style={styles.forgotButtonText}>Mot de passe oublié ?</Text>
              </TouchableOpacity>
              
              <Text style={styles.hintText}>
                Mot de passe par défaut : aila2025blog
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.resetTitle}>Réinitialisation</Text>
              <Text style={styles.resetSubtitle}>
                Entrez le code de réinitialisation fourni par le développeur
              </Text>
              
              <TextInput
                style={styles.passwordInput}
                placeholder="Code de réinitialisation"
                placeholderTextColor="#6B7C93"
                value={resetCode}
                onChangeText={setResetCode}
                autoCapitalize="characters"
              />
              
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={handleResetPassword}
              >
                <Text style={styles.loginButtonText}>Réinitialiser</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.forgotButton}
                onPress={() => {
                  setShowResetModal(false);
                  setResetCode('');
                }}
              >
                <Text style={styles.forgotButtonText}>Retour à la connexion</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Settings screen
  if (showSettings) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowSettings(false)}>
            <Ionicons name="arrow-back" size={24} color="#D4AF37" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Paramètres</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content}>
          <Text style={styles.sectionTitle}>Changer le mot de passe</Text>
          
          <Text style={styles.label}>Nouveau mot de passe</Text>
          <TextInput
            style={styles.input}
            placeholder="Minimum 6 caractères"
            placeholderTextColor="#6B7C93"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          
          <Text style={styles.label}>Confirmer le mot de passe</Text>
          <TextInput
            style={styles.input}
            placeholder="Répétez le mot de passe"
            placeholderTextColor="#6B7C93"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleChangePassword}
          >
            <Text style={styles.saveButtonText}>Enregistrer</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Editor screen
  if (showEditor) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={resetForm}>
            <Ionicons name="arrow-back" size={24} color="#D4AF37" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {editingArticle ? 'Modifier' : 'Nouvel article'}
          </Text>
          <TouchableOpacity onPress={handleSaveArticle} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#D4AF37" />
            ) : (
              <Ionicons name="checkmark" size={24} color="#D4AF37" />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.editorContent}>
          <Text style={styles.label}>Titre *</Text>
          <TextInput
            style={styles.input}
            placeholder="Titre de l'article"
            placeholderTextColor="#6B7C93"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Résumé</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Résumé court"
            placeholderTextColor="#6B7C93"
            value={excerpt}
            onChangeText={setExcerpt}
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>Contenu *</Text>
          <TextInput
            style={[styles.input, styles.contentArea]}
            placeholder="Contenu (utilisez **texte** pour le gras)"
            placeholderTextColor="#6B7C93"
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={15}
          />

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Icône</Text>
              <TextInput
                style={styles.input}
                placeholder="earth-outline"
                placeholderTextColor="#6B7C93"
                value={icon}
                onChangeText={setIcon}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Temps lecture</Text>
              <TextInput
                style={styles.input}
                placeholder="5 min"
                placeholderTextColor="#6B7C93"
                value={readTime}
                onChangeText={setReadTime}
              />
            </View>
          </View>
          
          <Text style={styles.noteText}>
            Note : Pour l'instant, les articles sont gérés dans le code source. 
            Cette interface sera connectée à la base de données prochainement.
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Main admin screen
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/')}>
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Blog</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.headerButton}>
            <Ionicons name="settings-outline" size={22} color="#D4AF37" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowEditor(true)} style={styles.headerButton}>
            <Ionicons name="add-circle" size={26} color="#D4AF37" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statsNumber}>{articles.length}</Text>
            <Text style={styles.statsLabel}>Articles</Text>
          </View>
          <TouchableOpacity style={styles.logoutCard} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
            <Text style={styles.logoutText}>Déconnexion</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color="#D4AF37" />
          <Text style={styles.infoText}>
            Les articles du blog sont actuellement gérés dans le code source (blog.tsx). 
            Une interface de gestion complète sera disponible prochainement.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Articles existants</Text>
        
        {loading ? (
          <ActivityIndicator color="#D4AF37" style={{ marginTop: 20 }} />
        ) : articles.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color="#6B7C93" />
            <Text style={styles.emptyText}>
              Les articles sont dans le fichier blog.tsx
            </Text>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => router.push('/blog')}
            >
              <Text style={styles.createButtonText}>Voir le blog</Text>
            </TouchableOpacity>
          </View>
        ) : (
          articles.map((article) => (
            <View key={article.id} style={styles.articleCard}>
              <View style={styles.articleInfo}>
                <Ionicons name={article.icon as any} size={24} color="#D4AF37" />
                <View style={styles.articleMeta}>
                  <Text style={styles.articleTitle} numberOfLines={2}>
                    {article.title}
                  </Text>
                  <Text style={styles.articleDate}>{article.date}</Text>
                </View>
              </View>
              <View style={styles.articleActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleEditArticle(article)}
                >
                  <Ionicons name="pencil" size={18} color="#D4AF37" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleDeleteArticle(article.id)}
                >
                  <Ionicons name="trash" size={18} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1628',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A5F',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    padding: 4,
  },
  backButtonAbs: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
  },
  loginSubtitle: {
    fontSize: 14,
    color: '#6B7C93',
    marginTop: 8,
    marginBottom: 32,
  },
  passwordInput: {
    width: '100%',
    backgroundColor: '#1E3A5F',
    borderRadius: 8,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 16,
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#0A1628',
    fontSize: 16,
    fontWeight: '600',
  },
  hintText: {
    color: '#6B7C93',
    fontSize: 12,
    marginTop: 20,
  },
  forgotButton: {
    marginTop: 16,
  },
  forgotButtonText: {
    color: '#D4AF37',
    fontSize: 14,
  },
  resetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  resetSubtitle: {
    fontSize: 13,
    color: '#6B7C93',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statsNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  statsLabel: {
    fontSize: 14,
    color: '#B8C5D6',
    marginTop: 4,
  },
  logoutCard: {
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 4,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#B8C5D6',
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#6B7C93',
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#0A1628',
    fontWeight: '600',
  },
  articleCard: {
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  articleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  articleMeta: {
    marginLeft: 12,
    flex: 1,
  },
  articleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  articleDate: {
    fontSize: 12,
    color: '#6B7C93',
    marginTop: 4,
  },
  articleActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  editorContent: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#B8C5D6',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#1E3A5F',
    borderRadius: 8,
    padding: 14,
    color: '#FFFFFF',
    fontSize: 15,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  contentArea: {
    minHeight: 200,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  noteText: {
    color: '#6B7C93',
    fontSize: 12,
    marginTop: 20,
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 18,
  },
  saveButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#0A1628',
    fontSize: 16,
    fontWeight: '600',
  },
});
