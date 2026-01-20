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

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://www.aila.family/api';

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

export default function AdminScreen() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [icon, setIcon] = useState('document-text-outline');
  const [readTime, setReadTime] = useState('5 min');

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setAdminToken(data.token);
        setIsLoggedIn(true);
        fetchArticles(data.token);
      } else {
        Alert.alert('Erreur', 'Mot de passe incorrect');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Connexion impossible');
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/articles?published_only=false`);
      if (response.ok) {
        const data = await response.json();
        setArticles(data);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const handleSaveArticle = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Erreur', 'Titre et contenu requis');
      return;
    }

    setLoading(true);
    try {
      const url = editingArticle 
        ? `${API_URL}/articles/${editingArticle.id}?admin_token=${adminToken}`
        : `${API_URL}/articles?admin_token=${adminToken}`;
      
      const method = editingArticle ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
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
        fetchArticles(adminToken);
      } else {
        Alert.alert('Erreur', 'Impossible de sauvegarder');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (Platform.OS === 'web') {
      if (!window.confirm('Supprimer cet article ?')) return;
    }
    
    try {
      const response = await fetch(
        `${API_URL}/articles/${articleId}?admin_token=${adminToken}`,
        { method: 'DELETE' }
      );
      
      if (response.ok) {
        fetchArticles(adminToken);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de supprimer');
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

  // Login screen
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loginContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#D4AF37" />
          </TouchableOpacity>
          
          <Ionicons name="shield-checkmark" size={60} color="#D4AF37" />
          <Text style={styles.loginTitle}>Administration AÏLA</Text>
          <Text style={styles.loginSubtitle}>Accès réservé</Text>
          
          <TextInput
            style={styles.passwordInput}
            placeholder="Mot de passe admin"
            placeholderTextColor="#6B7C93"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0A1628" />
            ) : (
              <Text style={styles.loginButtonText}>Se connecter</Text>
            )}
          </TouchableOpacity>
        </View>
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
            {editingArticle ? 'Modifier l\'article' : 'Nouvel article'}
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
            placeholder="Résumé court (affiché dans la liste)"
            placeholderTextColor="#6B7C93"
            value={excerpt}
            onChangeText={setExcerpt}
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>Contenu *</Text>
          <TextInput
            style={[styles.input, styles.contentArea]}
            placeholder="Contenu de l'article (Markdown supporté)"
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
                placeholder="newspaper-outline"
                placeholderTextColor="#6B7C93"
                value={icon}
                onChangeText={setIcon}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Temps de lecture</Text>
              <TextInput
                style={styles.input}
                placeholder="5 min"
                placeholderTextColor="#6B7C93"
                value={readTime}
                onChangeText={setReadTime}
              />
            </View>
          </View>

          <Text style={styles.helpText}>
            💡 Pour le formatage : utilisez **texte** pour le gras
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Main admin screen
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Blog</Text>
        <TouchableOpacity onPress={() => setShowEditor(true)}>
          <Ionicons name="add-circle" size={28} color="#D4AF37" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsCard}>
          <Text style={styles.statsNumber}>{articles.length}</Text>
          <Text style={styles.statsLabel}>Articles publiés</Text>
        </View>

        {articles.length === 0 && (
          <TouchableOpacity 
            style={styles.initButton}
            onPress={async () => {
              setLoading(true);
              try {
                const response = await fetch(`${API_URL}/articles/init-default?admin_token=${adminToken}`, {
                  method: 'POST'
                });
                if (response.ok) {
                  Alert.alert('Succès', 'Articles par défaut initialisés');
                  fetchArticles(adminToken);
                }
              } catch (e) {
                Alert.alert('Erreur', 'Impossible d\'initialiser');
              } finally {
                setLoading(false);
              }
            }}
          >
            <Ionicons name="cloud-download-outline" size={20} color="#0A1628" />
            <Text style={styles.initButtonText}>Charger les articles par défaut</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>Articles</Text>
        
        {articles.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color="#6B7C93" />
            <Text style={styles.emptyText}>Aucun article</Text>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => setShowEditor(true)}
            >
              <Text style={styles.createButtonText}>Créer le premier article</Text>
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
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  initButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    gap: 8,
  },
  initButtonText: {
    color: '#0A1628',
    fontSize: 14,
    fontWeight: '600',
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
  statsCard: {
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  statsNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  statsLabel: {
    fontSize: 14,
    color: '#B8C5D6',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#6B7C93',
    marginTop: 12,
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 24,
    paddingVertical: 12,
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
  helpText: {
    fontSize: 12,
    color: '#6B7C93',
    marginTop: 20,
    marginBottom: 40,
    textAlign: 'center',
  },
});
