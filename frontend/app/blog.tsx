import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BlogComments from '../src/components/BlogComments';
import ShareButtons from '../src/components/ShareButtons';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://www.aila.family/api';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  read_time: string;
  icon: string;
}

// Articles par défaut (fallback si API indisponible)
const defaultArticles: Article[] = [
  {
    id: '7',
    title: "Partagez l'histoire de votre région d'origine",
    excerpt: "Racontez l'histoire, la géographie, la culture et les traditions de votre région.",
    content: "Chaque famille porte en elle l'histoire d'une région...",
    date: "20 janvier 2025",
    read_time: "5 min",
    icon: "earth-outline"
  },
  {
    id: '6',
    title: "Comment retrouver ses ancêtres gratuitement en 2025",
    excerpt: "Découvrez toutes les méthodes et ressources gratuites pour retrouver vos ancêtres.",
    content: "La généalogie gratuite est à portée de clic...",
    date: "15 janvier 2025",
    read_time: "8 min",
    icon: "gift-outline"
  },
];

export default function BlogScreen() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>(defaultArticles);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch(`${API_URL}/articles`);
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setArticles(data);
        }
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      // Keep default articles on error
    } finally {
      setLoading(false);
    }
  };

  if (selectedArticle) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedArticle(null)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#D4AF37" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Article</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.articleFull}>
            <View style={styles.articleMeta}>
              <Text style={styles.articleDate}>{selectedArticle.date}</Text>
              <Text style={styles.articleReadTime}>{selectedArticle.read_time} de lecture</Text>
            </View>
            <Text style={styles.articleFullTitle}>{selectedArticle.title}</Text>
            <Text style={styles.articleFullContent}>
              {selectedArticle.content.split('\n').map((paragraph, index) => {
                if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                  return (
                    <Text key={index} style={styles.articleSubtitle}>
                      {paragraph.replace(/\*\*/g, '')}{'\n\n'}
                    </Text>
                  );
                }
                return paragraph + '\n\n';
              })}
            </Text>
          </View>

          {/* Share Buttons */}
          <ShareButtons 
            title={selectedArticle.title}
            url={`https://www.aila.family/blog#${selectedArticle.id}`}
          />

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <BlogComments articleId={selectedArticle.id} />
          </View>

          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => router.push('/register')}
          >
            <Text style={styles.ctaButtonText}>Créer mon arbre généalogique</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2025 AÏLA - L'arbre généalogique qui connecte votre famille
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blog Généalogie</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.introSection}>
          <Ionicons name="newspaper-outline" size={48} color="#D4AF37" />
          <Text style={styles.introTitle}>Conseils & Astuces Généalogie</Text>
          <Text style={styles.introText}>
            Découvrez nos articles pour vous aider dans vos recherches généalogiques.
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D4AF37" />
          </View>
        ) : (
          <>
            {/* Guides Section */}
            <View style={styles.guidesSection}>
              <Text style={styles.guidesSectionTitle}>📚 Nos Guides</Text>
              
              <TouchableOpacity 
                style={styles.guideLink}
                onPress={() => router.push('/retrouver-ancetres-gratuitement')}
              >
                <View style={styles.guideLinkIcon}>
                  <Text style={styles.guideLinkEmoji}>🔍</Text>
                </View>
                <View style={styles.guideLinkContent}>
                  <Text style={styles.guideLinkTitle}>Retrouver ses ancêtres gratuitement</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#D4AF37" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.guideLink}
                onPress={() => router.push('/genealogie-debutant-guide')}
              >
                <View style={styles.guideLinkIcon}>
                  <Text style={styles.guideLinkEmoji}>🎓</Text>
                </View>
                <View style={styles.guideLinkContent}>
                  <Text style={styles.guideLinkTitle}>Généalogie pour débutant</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#D4AF37" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.guideLink, { backgroundColor: 'rgba(212, 175, 55, 0.15)', borderColor: '#D4AF37' }]}
                onPress={() => {
                  const regionArticle = articles.find(a => a.id === '7');
                  if (regionArticle) setSelectedArticle(regionArticle);
                }}
              >
                <View style={styles.guideLinkIcon}>
                  <Text style={styles.guideLinkEmoji}>🌍</Text>
                </View>
                <View style={styles.guideLinkContent}>
                  <Text style={styles.guideLinkTitle}>Partagez l'histoire de votre région</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#D4AF37" />
              </TouchableOpacity>
            </View>

            {/* Articles Section */}
            <View style={styles.articlesSectionHeader}>
              <Text style={styles.articlesSectionTitle}>📰 Articles</Text>
            </View>

            <View style={styles.articlesList}>
              {articles.map((article) => (
                <TouchableOpacity
                  key={article.id}
                  style={styles.articleCard}
                  onPress={() => setSelectedArticle(article)}
                  activeOpacity={0.7}
                >
                  <View style={styles.articleIcon}>
                    <Ionicons name={article.icon as any} size={28} color="#D4AF37" />
                  </View>
                  <View style={styles.articleInfo}>
                    <View style={styles.articleMetaRow}>
                      <Text style={styles.articleDate}>{article.date}</Text>
                      <Text style={styles.articleReadTime}>{article.read_time}</Text>
                    </View>
                    <Text style={styles.articleTitle}>{article.title}</Text>
                    <Text style={styles.articleExcerpt} numberOfLines={2}>
                      {article.excerpt}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Prêt à commencer ?</Text>
          <Text style={styles.ctaText}>
            Créez votre arbre généalogique gratuitement avec AÏLA.
          </Text>
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => router.push('/register')}
          >
            <Text style={styles.ctaButtonText}>Créer mon arbre gratuitement</Text>
          </TouchableOpacity>
        </View>

        {/* Back to Home */}
        <TouchableOpacity 
          style={styles.homeButton}
          onPress={() => router.push('/')}
        >
          <Ionicons name="home-outline" size={20} color="#D4AF37" />
          <Text style={styles.homeButtonText}>Retour à l'accueil</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2025 AÏLA - L'arbre généalogique qui connecte votre famille
          </Text>
        </View>
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
  },
  introSection: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A5F',
  },
  introTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  introText: {
    fontSize: 14,
    color: '#B8C5D6',
    textAlign: 'center',
    marginTop: 8,
  },
  guidesSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A5F',
  },
  guidesSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  guideLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  guideLinkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  guideLinkEmoji: {
    fontSize: 20,
  },
  guideLinkContent: {
    flex: 1,
  },
  guideLinkTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  articlesSectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  articlesSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  articlesList: {
    padding: 16,
    paddingTop: 8,
  },
  articleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  articleIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  articleInfo: {
    flex: 1,
  },
  articleMetaRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  articleDate: {
    fontSize: 11,
    color: '#6B7C93',
    marginRight: 12,
  },
  articleReadTime: {
    fontSize: 11,
    color: '#D4AF37',
  },
  articleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  articleExcerpt: {
    fontSize: 12,
    color: '#B8C5D6',
    lineHeight: 16,
  },
  articleFull: {
    padding: 20,
  },
  articleMeta: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  articleFullTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    lineHeight: 30,
  },
  articleFullContent: {
    fontSize: 15,
    color: '#B8C5D6',
    lineHeight: 24,
  },
  articleSubtitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  commentsSection: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  ctaSection: {
    margin: 16,
    padding: 20,
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  ctaText: {
    fontSize: 14,
    color: '#B8C5D6',
    textAlign: 'center',
    marginBottom: 16,
  },
  ctaButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  ctaButtonText: {
    color: '#0A1628',
    fontSize: 15,
    fontWeight: '600',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
    gap: 8,
  },
  homeButtonText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7C93',
    textAlign: 'center',
  },
});
