import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BlogComments from '../src/components/BlogComments';
import ShareButtons from '../src/components/ShareButtons';
import ArticleChallengeCta from '../src/components/ArticleChallengeCta';
import { useTranslation } from 'react-i18next';
import AdBanner from '@/components/AdBanner';

interface ArticleKey {
  id: string;
  titleKey: string;
  excerptKey: string;
  contentKey: string;
  dateKey: string;
  readTimeKey: string;
  icon: string;
  challengeType?: 'tree' | 'memory' | 'tradition' | 'community' | 'general';
}

// Article keys for translation
const articleKeys: ArticleKey[] = [
  {
    id: '7',
    titleKey: 'blog.articles.region.title',
    excerptKey: 'blog.articles.region.excerpt',
    contentKey: 'blog.articles.region.content',
    dateKey: 'blog.articles.region.date',
    readTimeKey: 'blog.articles.region.readTime',
    icon: 'earth-outline',
    challengeType: 'community'
  },
  {
    id: '6',
    titleKey: 'blog.articles.ancestors.title',
    excerptKey: 'blog.articles.ancestors.excerpt',
    contentKey: 'blog.articles.ancestors.content',
    dateKey: 'blog.articles.ancestors.date',
    readTimeKey: 'blog.articles.ancestors.readTime',
    icon: 'search-outline',
    challengeType: 'tree'
  },
  {
    id: '1',
    titleKey: 'blog.articles.start.title',
    excerptKey: 'blog.articles.start.excerpt',
    contentKey: 'blog.articles.start.content',
    dateKey: 'blog.articles.start.date',
    readTimeKey: 'blog.articles.start.readTime',
    icon: 'book-outline',
    challengeType: 'tree'
  },
  {
    id: '2',
    titleKey: 'blog.articles.mistakes.title',
    excerptKey: 'blog.articles.mistakes.excerpt',
    contentKey: 'blog.articles.mistakes.content',
    dateKey: 'blog.articles.mistakes.date',
    readTimeKey: 'blog.articles.mistakes.readTime',
    icon: 'warning-outline',
    challengeType: 'tree'
  },
  {
    id: '3',
    titleKey: 'blog.articles.relationships.title',
    excerptKey: 'blog.articles.relationships.excerpt',
    contentKey: 'blog.articles.relationships.content',
    dateKey: 'blog.articles.relationships.date',
    readTimeKey: 'blog.articles.relationships.readTime',
    icon: 'people-outline',
    challengeType: 'tree'
  },
];

export default function BlogScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  // Build translated articles
  const articles = articleKeys.map(key => ({
    id: key.id,
    title: t(key.titleKey),
    excerpt: t(key.excerptKey),
    content: t(key.contentKey),
    date: t(key.dateKey),
    read_time: t(key.readTimeKey),
    icon: key.icon,
    challengeType: key.challengeType,
  }));

  const selectedArticle = selectedArticleId ? articles.find(a => a.id === selectedArticleId) : null;

  if (selectedArticle) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => setSelectedArticleId(null)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#D4AF37" />
          </Pressable>
          <Text style={styles.headerTitle}>{t('blog.article')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.articleFull}>
            <View style={styles.articleMeta}>
              <Text style={styles.articleDate}>{selectedArticle.date}</Text>
              <Text style={styles.articleReadTime}>{selectedArticle.read_time} {t('blog.reading')}</Text>
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

          <ShareButtons 
            title={selectedArticle.title}
            url={`https://www.aila.family/blog`}
          />

          <ArticleChallengeCta 
            articleTitle={selectedArticle.title}
            challengeType={selectedArticle.challengeType || 'general'}
          />

          <View style={styles.commentsSection}>
            <BlogComments articleId={selectedArticle.id} />
          </View>

          <Pressable 
            style={styles.ctaButton}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.ctaButtonText}>{t('blog.createMyTree')}</Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('blog.copyright')}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.push('/')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </Pressable>
        <Text style={styles.headerTitle}>{t('blog.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introSection}>
          <Ionicons name="newspaper-outline" size={48} color="#D4AF37" />
          <Text style={styles.introTitle}>{t('blog.introTitle')}</Text>
          <Text style={styles.introText}>{t('blog.introText')}</Text>
          <Pressable 
            style={styles.communityLink}
            onPress={() => router.push('/community')}
          >
            <Ionicons name="chatbubbles-outline" size={16} color="#D4AF37" />
            <Text style={styles.communityLinkText}>{t('blog.joinCommunity')}</Text>
          </Pressable>
        </View>

        <View style={styles.guidesSection}>
          <Text style={styles.guidesSectionTitle}>{t('blog.guides')}</Text>
          
          <Pressable 
            style={styles.guideLink}
            onPress={() => router.push('/retrouver-ancetres-gratuitement')}
          >
            <View style={styles.guideLinkIcon}>
              <Text style={styles.guideLinkEmoji}>🔍</Text>
            </View>
            <View style={styles.guideLinkContent}>
              <Text style={styles.guideLinkTitle}>{t('blog.guideAncestors')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D4AF37" />
          </Pressable>

          <Pressable 
            style={styles.guideLink}
            onPress={() => router.push('/genealogie-debutant-guide')}
          >
            <View style={styles.guideLinkIcon}>
              <Text style={styles.guideLinkEmoji}>🎓</Text>
            </View>
            <View style={styles.guideLinkContent}>
              <Text style={styles.guideLinkTitle}>{t('blog.guideBeginner')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D4AF37" />
          </Pressable>

          <Pressable 
            style={[styles.guideLink, { backgroundColor: 'rgba(212, 175, 55, 0.15)', borderColor: '#D4AF37' }]}
            onPress={() => setSelectedArticleId('7')}
          >
            <View style={styles.guideLinkIcon}>
              <Text style={styles.guideLinkEmoji}>🌍</Text>
            </View>
            <View style={styles.guideLinkContent}>
              <Text style={styles.guideLinkTitle}>{t('blog.guideRegion')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D4AF37" />
          </Pressable>
        </View>

        <View style={styles.challengesBanner}>
          <View style={styles.challengesBannerIcon}>
            <Ionicons name="trophy" size={28} color="#FFF" />
          </View>
          <View style={styles.challengesBannerContent}>
            <Text style={styles.challengesBannerTitle}>{t('blog.takeAction')}</Text>
            <Text style={styles.challengesBannerText}>{t('blog.transformReading')}</Text>
          </View>
          <Pressable 
            style={styles.challengesBannerButton}
            onPress={() => router.push('/challenges')}
          >
            <Text style={styles.challengesBannerButtonText}>{t('blog.viewChallenges')}</Text>
          </Pressable>
        </View>

        <View style={styles.articlesSectionHeader}>
          <Text style={styles.articlesSectionTitle}>{t('blog.articlesSection')}</Text>
        </View>

        <View style={styles.articlesList}>
          {articles.map((article) => (
            <Pressable
              key={article.id}
              style={styles.articleCard}
              onPress={() => setSelectedArticleId(article.id)}
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
                <Text style={styles.articleExcerpt} numberOfLines={2}>{article.excerpt}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
            </Pressable>
          ))}
        </View>

        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>{t('blog.readyToStart')}</Text>
          <Text style={styles.ctaText}>{t('blog.createTreeFree')}</Text>
          <Pressable 
            style={styles.ctaButton}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.ctaButtonText}>{t('blog.createMyTreeFree')}</Text>
          </Pressable>
        </View>

        <Pressable 
          style={styles.homeButton}
          onPress={() => router.push('/')}
        >
          <Ionicons name="home-outline" size={20} color="#D4AF37" />
          <Text style={styles.homeButtonText}>{t('blog.backHome')}</Text>
        </Pressable>

        <AdBanner />
        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('blog.copyright')}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1628' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1E3A5F' },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  content: { flex: 1 },
  introSection: { alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: '#1E3A5F' },
  introTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginTop: 16, textAlign: 'center' },
  introText: { fontSize: 14, color: '#B8C5D6', textAlign: 'center', marginTop: 8 },
  communityLink: { flexDirection: 'row', alignItems: 'center', marginTop: 16, paddingVertical: 8, paddingHorizontal: 16, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.4)', borderRadius: 20, gap: 6 },
  communityLinkText: { color: '#D4AF37', fontSize: 13, fontWeight: '500' },
  guidesSection: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#1E3A5F' },
  guidesSectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12 },
  guideLink: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(212, 175, 55, 0.08)', borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.2)', borderRadius: 12, padding: 12, marginBottom: 8 },
  guideLinkIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(212, 175, 55, 0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  guideLinkEmoji: { fontSize: 20 },
  guideLinkContent: { flex: 1 },
  guideLinkTitle: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  challengesBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4CAF50', marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 16 },
  challengesBannerIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  challengesBannerContent: { flex: 1 },
  challengesBannerTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  challengesBannerText: { fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  challengesBannerButton: { backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  challengesBannerButtonText: { color: '#4CAF50', fontSize: 12, fontWeight: '600' },
  articlesSectionHeader: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  articlesSectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  articlesList: { padding: 16, paddingTop: 8 },
  articleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E3A5F', borderRadius: 12, padding: 14, marginBottom: 10 },
  articleIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(212, 175, 55, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  articleInfo: { flex: 1 },
  articleMetaRow: { flexDirection: 'row', marginBottom: 4 },
  articleDate: { fontSize: 11, color: '#6B7C93', marginRight: 12 },
  articleReadTime: { fontSize: 11, color: '#D4AF37' },
  articleTitle: { fontSize: 14, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 },
  articleExcerpt: { fontSize: 12, color: '#B8C5D6', lineHeight: 16 },
  articleFull: { padding: 20 },
  articleMeta: { flexDirection: 'row', marginBottom: 12 },
  articleFullTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 20, lineHeight: 30 },
  articleFullContent: { fontSize: 15, color: '#B8C5D6', lineHeight: 24 },
  articleSubtitle: { fontSize: 17, fontWeight: 'bold', color: '#D4AF37' },
  commentsSection: { paddingHorizontal: 20, marginTop: 16 },
  ctaSection: { margin: 16, padding: 20, backgroundColor: '#1E3A5F', borderRadius: 12, alignItems: 'center' },
  ctaTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  ctaText: { fontSize: 14, color: '#B8C5D6', textAlign: 'center', marginBottom: 16 },
  ctaButton: { backgroundColor: '#D4AF37', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25 },
  ctaButtonText: { color: '#0A1628', fontSize: 15, fontWeight: '600' },
  homeButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 16, marginVertical: 8, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#D4AF37', gap: 8 },
  homeButtonText: { color: '#D4AF37', fontSize: 14, fontWeight: '500' },
  footer: { padding: 24, alignItems: 'center' },
  footerText: { fontSize: 12, color: '#6B7C93', textAlign: 'center' },
});
