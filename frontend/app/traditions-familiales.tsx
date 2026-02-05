import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SEOFooter } from '@/components/SEOFooter';
import { SEOBreadcrumbs, BREADCRUMB_CONFIGS } from '@/components/SEOBreadcrumbs';
import { RelatedArticles } from '@/components/RelatedArticles';
import { useTranslation } from 'react-i18next';

const SEOHead = ({ t }: { t: any }) => {
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = t('seoPages.traditions.metaTitle');
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', t('seoPages.traditions.metaDescription'));
      }
    }
  }, [t]);
  return null;
};

const TraditionCard = ({ emoji, title, description }: { emoji: string; title: string; description: string }) => (
  <View style={styles.traditionCard}>
    <Text style={styles.traditionEmoji}>{emoji}</Text>
    <View style={styles.traditionContent}>
      <Text style={styles.traditionTitle}>{title}</Text>
      <Text style={styles.traditionDesc}>{description}</Text>
    </View>
  </View>
);

export default function TraditionsFamiliales() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <SEOHead t={t} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Pressable onPress={() => router.push('/')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#D4AF37" />
          </Pressable>
          <Pressable onPress={() => router.push('/')}>
            <Text style={styles.logoText}>🌳 AILA</Text>
          </Pressable>
        </View>

        <SEOBreadcrumbs items={BREADCRUMB_CONFIGS['traditions-familiales']} />

        <View style={styles.hero}>
          <Text style={styles.badge}>{t('seoPages.traditions.badge')}</Text>
          <Text style={styles.h1}>{t('seoPages.traditions.title')}</Text>
          <Text style={styles.subtitle}>{t('seoPages.traditions.subtitle')}</Text>

          <View style={styles.authorBox}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorAvatarText}>👨‍👩‍👧</Text>
            </View>
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{t('seoPages.traditions.authorName')}</Text>
              <Text style={styles.authorCredentials}>{t('seoPages.traditions.authorCredentials')}</Text>
              <Text style={styles.authorDate}>{t('seoPages.traditions.authorDate')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.tocBox}>
          <Text style={styles.tocTitle}>{t('seoPages.traditions.tocTitle')}</Text>
          <Text style={styles.tocItem}>{t('seoPages.traditions.toc.item1')}</Text>
          <Text style={styles.tocItem}>{t('seoPages.traditions.toc.item2')}</Text>
          <Text style={styles.tocItem}>{t('seoPages.traditions.toc.item3')}</Text>
          <Text style={styles.tocItem}>{t('seoPages.traditions.toc.item4')}</Text>
          <Text style={styles.tocItem}>{t('seoPages.traditions.toc.item5')}</Text>
          <Text style={styles.tocItem}>{t('seoPages.traditions.toc.item6')}</Text>
        </View>

        <View style={styles.featuredSnippet}>
          <Text style={styles.featuredTitle}>{t('seoPages.traditions.summaryTitle')}</Text>
          <Text style={styles.featuredText}>{t('seoPages.traditions.summaryText')}</Text>
        </View>

        {/* Section 1 - Why traditions matter */}
        <View style={styles.section}>
          <Text style={styles.h2}>{t('seoPages.traditions.section1.title')}</Text>
          <Text style={styles.paragraph}>{t('seoPages.traditions.section1.intro')}</Text>

          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Ionicons name="heart" size={24} color="#E91E63" />
              <View style={styles.benefitTextContainer}>
                <Text style={styles.benefitTitle}>{t('seoPages.traditions.section1.benefit1.title')}</Text>
                <Text style={styles.benefitDesc}>{t('seoPages.traditions.section1.benefit1.desc')}</Text>
              </View>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
              <View style={styles.benefitTextContainer}>
                <Text style={styles.benefitTitle}>{t('seoPages.traditions.section1.benefit2.title')}</Text>
                <Text style={styles.benefitDesc}>{t('seoPages.traditions.section1.benefit2.desc')}</Text>
              </View>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="sparkles" size={24} color="#D4AF37" />
              <View style={styles.benefitTextContainer}>
                <Text style={styles.benefitTitle}>{t('seoPages.traditions.section1.benefit3.title')}</Text>
                <Text style={styles.benefitDesc}>{t('seoPages.traditions.section1.benefit3.desc')}</Text>
              </View>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="people" size={24} color="#2196F3" />
              <View style={styles.benefitTextContainer}>
                <Text style={styles.benefitTitle}>{t('seoPages.traditions.section1.benefit4.title')}</Text>
                <Text style={styles.benefitDesc}>{t('seoPages.traditions.section1.benefit4.desc')}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section 2 - Daily traditions */}
        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.h2}>{t('seoPages.traditions.section2.title')}</Text>
          <Text style={styles.paragraph}>{t('seoPages.traditions.section2.intro')}</Text>

          <TraditionCard emoji="🌅" title={t('seoPages.traditions.section2.trad1.title')} description={t('seoPages.traditions.section2.trad1.desc')} />
          <TraditionCard emoji="📖" title={t('seoPages.traditions.section2.trad2.title')} description={t('seoPages.traditions.section2.trad2.desc')} />
          <TraditionCard emoji="🎬" title={t('seoPages.traditions.section2.trad3.title')} description={t('seoPages.traditions.section2.trad3.desc')} />
          <TraditionCard emoji="🍝" title={t('seoPages.traditions.section2.trad4.title')} description={t('seoPages.traditions.section2.trad4.desc')} />
          <TraditionCard emoji="🎮" title={t('seoPages.traditions.section2.trad5.title')} description={t('seoPages.traditions.section2.trad5.desc')} />
          <TraditionCard emoji="🚶" title={t('seoPages.traditions.section2.trad6.title')} description={t('seoPages.traditions.section2.trad6.desc')} />
        </View>

        {/* Section 3 - Holiday traditions */}
        <View style={styles.section}>
          <Text style={styles.h2}>{t('seoPages.traditions.section3.title')}</Text>
          <Text style={styles.h3}>{t('seoPages.traditions.section3.christmas')}</Text>
          
          <TraditionCard emoji="🎅" title={t('seoPages.traditions.section3.trad1.title')} description={t('seoPages.traditions.section3.trad1.desc')} />
          <TraditionCard emoji="🌲" title={t('seoPages.traditions.section3.trad2.title')} description={t('seoPages.traditions.section3.trad2.desc')} />
          <TraditionCard emoji="🎁" title={t('seoPages.traditions.section3.trad3.title')} description={t('seoPages.traditions.section3.trad3.desc')} />

          <Text style={styles.h3}>{t('seoPages.traditions.section3.birthdays')}</Text>
          <TraditionCard emoji="🎂" title={t('seoPages.traditions.section3.trad4.title')} description={t('seoPages.traditions.section3.trad4.desc')} />
          <TraditionCard emoji="📸" title={t('seoPages.traditions.section3.trad5.title')} description={t('seoPages.traditions.section3.trad5.desc')} />
        </View>

        {/* Section 4 - Culinary traditions */}
        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.h2}>{t('seoPages.traditions.section4.title')}</Text>
          <Text style={styles.paragraph}>{t('seoPages.traditions.section4.intro')}</Text>

          <TraditionCard emoji="🍳" title={t('seoPages.traditions.section4.trad1.title')} description={t('seoPages.traditions.section4.trad1.desc')} />
          <TraditionCard emoji="📒" title={t('seoPages.traditions.section4.trad2.title')} description={t('seoPages.traditions.section4.trad2.desc')} />
          <TraditionCard emoji="👨‍🍳" title={t('seoPages.traditions.section4.trad3.title')} description={t('seoPages.traditions.section4.trad3.desc')} />
        </View>

        {/* Section 5 - Vacation traditions */}
        <View style={styles.section}>
          <Text style={styles.h2}>{t('seoPages.traditions.section5.title')}</Text>
          
          <TraditionCard emoji="🏖️" title={t('seoPages.traditions.section5.trad1.title')} description={t('seoPages.traditions.section5.trad1.desc')} />
          <TraditionCard emoji="🗺️" title={t('seoPages.traditions.section5.trad2.title')} description={t('seoPages.traditions.section5.trad2.desc')} />
          <TraditionCard emoji="📷" title={t('seoPages.traditions.section5.trad3.title')} description={t('seoPages.traditions.section5.trad3.desc')} />
        </View>

        {/* Section 6 - How to create traditions */}
        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.h2}>{t('seoPages.traditions.section6.title')}</Text>
          
          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>{t('seoPages.traditions.section6.tip1.title')}</Text>
            <Text style={styles.tipText}>{t('seoPages.traditions.section6.tip1.text')}</Text>
          </View>
          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>{t('seoPages.traditions.section6.tip2.title')}</Text>
            <Text style={styles.tipText}>{t('seoPages.traditions.section6.tip2.text')}</Text>
          </View>
          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>{t('seoPages.traditions.section6.tip3.title')}</Text>
            <Text style={styles.tipText}>{t('seoPages.traditions.section6.tip3.text')}</Text>
          </View>
          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>{t('seoPages.traditions.section6.tip4.title')}</Text>
            <Text style={styles.tipText}>{t('seoPages.traditions.section6.tip4.text')}</Text>
          </View>
        </View>

        {/* CTA */}
        <View style={[styles.section, styles.ctaSection]}>
          <Text style={styles.ctaTitle}>{t('seoPages.traditions.cta.title')}</Text>
          <Text style={styles.ctaText}>{t('seoPages.traditions.cta.text')}</Text>
          <Pressable style={styles.ctaButton} onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.ctaButtonText}>{t('seoPages.traditions.cta.button')}</Text>
            <Ionicons name="arrow-forward" size={20} color="#0A1628" />
          </Pressable>
        </View>

        <RelatedArticles silo="famille" currentPage="/traditions-familiales" />
        <SEOFooter currentPage="/traditions-familiales" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E3A5F' },
  scrollContent: { paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 16 },
  backButton: { padding: 4 },
  logoText: { fontSize: 20, fontWeight: 'bold', color: '#D4AF37' },
  hero: { padding: 24, paddingTop: 10 },
  badge: { backgroundColor: 'rgba(76, 175, 80, 0.2)', color: '#4CAF50', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, fontSize: 12, fontWeight: '600', alignSelf: 'flex-start', marginBottom: 16 },
  h1: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 16, lineHeight: 36 },
  subtitle: { fontSize: 16, color: '#B8C5D6', lineHeight: 26, marginBottom: 24 },
  authorBox: { flexDirection: 'row', backgroundColor: '#1A2A44', borderRadius: 12, padding: 16, alignItems: 'center' },
  authorAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#D4AF37', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  authorAvatarText: { fontSize: 24 },
  authorInfo: { flex: 1 },
  authorName: { fontSize: 14, fontWeight: '600', color: '#FFFFFF', marginBottom: 2 },
  authorCredentials: { fontSize: 12, color: '#D4AF37', marginBottom: 2 },
  authorDate: { fontSize: 11, color: '#6B7C93' },
  tocBox: { backgroundColor: '#1A2A44', margin: 20, borderRadius: 12, padding: 20, borderLeftWidth: 4, borderLeftColor: '#D4AF37' },
  tocTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12 },
  tocItem: { fontSize: 14, color: '#B8C5D6', marginBottom: 8, paddingLeft: 8 },
  featuredSnippet: { backgroundColor: '#0D4F3C', margin: 20, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#4CAF50' },
  featuredTitle: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50', marginBottom: 12 },
  featuredText: { fontSize: 14, color: '#FFFFFF', lineHeight: 24 },
  section: { padding: 24 },
  sectionAlt: { backgroundColor: '#0D1E36' },
  h2: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 16 },
  h3: { fontSize: 18, fontWeight: '600', color: '#D4AF37', marginTop: 24, marginBottom: 12 },
  paragraph: { fontSize: 15, color: '#B8C5D6', lineHeight: 26, marginBottom: 16 },
  benefitsList: { marginTop: 16 },
  benefitItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2A44', borderRadius: 12, padding: 16, marginBottom: 12 },
  benefitTextContainer: { marginLeft: 16, flex: 1 },
  benefitTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 },
  benefitDesc: { fontSize: 13, color: '#B8C5D6' },
  traditionCard: { flexDirection: 'row', backgroundColor: '#1A2A44', borderRadius: 12, padding: 16, marginBottom: 12, alignItems: 'center' },
  traditionEmoji: { fontSize: 32, marginRight: 16 },
  traditionContent: { flex: 1 },
  traditionTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 },
  traditionDesc: { fontSize: 13, color: '#B8C5D6', lineHeight: 20 },
  tipBox: { backgroundColor: 'rgba(212, 175, 55, 0.1)', borderRadius: 12, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#D4AF37' },
  tipTitle: { fontSize: 14, fontWeight: 'bold', color: '#D4AF37', marginBottom: 8 },
  tipText: { fontSize: 14, color: '#B8C5D6', lineHeight: 22 },
  ctaSection: { alignItems: 'center', paddingVertical: 48 },
  ctaTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 12 },
  ctaText: { fontSize: 16, color: '#B8C5D6', textAlign: 'center', lineHeight: 24, maxWidth: 500, marginBottom: 24 },
  ctaButton: { backgroundColor: '#D4AF37', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  ctaButtonText: { color: '#0A1628', fontSize: 18, fontWeight: '600' },
});
