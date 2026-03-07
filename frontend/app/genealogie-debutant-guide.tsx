import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SEOFooter } from '@/components/SEOFooter';
import { SEOBreadcrumbs, BREADCRUMB_CONFIGS } from '@/components/SEOBreadcrumbs';
import { RelatedArticles } from '@/components/RelatedArticles';
import { useTranslation } from 'react-i18next';
import AdBanner from '@/components/AdBanner';

const SEOHead = ({ t }: { t: any }) => {
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = t('seoPages.beginner.metaTitle');
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', t('seoPages.beginner.metaDescription'));
      }
    }
  }, [t]);
  return null;
};

export default function GenealogieDebutant() {
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
          <Text style={styles.logoText}>🌳 AILA</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.badge}>{t('seoPages.beginner.badge')}</Text>
          <Text style={styles.h1}>{t('seoPages.beginner.title')}</Text>
          <Text style={styles.subtitle}>{t('seoPages.beginner.subtitle')}</Text>
        </View>

        <View style={styles.featuredSnippet}>
          <Text style={styles.featuredTitle}>{t('seoPages.beginner.summaryTitle')}</Text>
          <Text style={styles.featuredText}>{t('seoPages.beginner.summaryText')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>{t('seoPages.beginner.step1.title')}</Text>
          <Text style={styles.paragraph}>{t('seoPages.beginner.step1.text')}</Text>
          
          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>{t('seoPages.beginner.step1.tipTitle')}</Text>
            <Text style={styles.tipText}>{t('seoPages.beginner.step1.tipText')}</Text>
          </View>
        </View>

        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.h2}>{t('seoPages.beginner.step2.title')}</Text>
          <Text style={styles.paragraph}>{t('seoPages.beginner.step2.text')}</Text>
          
          <View style={styles.checkList}>
            <Text style={styles.checkItem}>{t('seoPages.beginner.step2.check1')}</Text>
            <Text style={styles.checkItem}>{t('seoPages.beginner.step2.check2')}</Text>
            <Text style={styles.checkItem}>{t('seoPages.beginner.step2.check3')}</Text>
            <Text style={styles.checkItem}>{t('seoPages.beginner.step2.check4')}</Text>
            <Text style={styles.checkItem}>{t('seoPages.beginner.step2.check5')}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>{t('seoPages.beginner.step3.title')}</Text>
          <Text style={styles.paragraph}>{t('seoPages.beginner.step3.text')}</Text>
        </View>

        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.h2}>{t('seoPages.beginner.step4.title')}</Text>
          <Text style={styles.paragraph}>{t('seoPages.beginner.step4.text')}</Text>
          
          <View style={styles.resourceCard}>
            <Text style={styles.resourceTitle}>{t('seoPages.beginner.step4.resourceTitle')}</Text>
            <Text style={styles.resourceItem}>{t('seoPages.beginner.step4.resource1')}</Text>
            <Text style={styles.resourceItem}>{t('seoPages.beginner.step4.resource2')}</Text>
            <Text style={styles.resourceItem}>{t('seoPages.beginner.step4.resource3')}</Text>
            <Text style={styles.resourceItem}>{t('seoPages.beginner.step4.resource4')}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>{t('seoPages.beginner.errors.title')}</Text>
          
          <View style={styles.errorItem}>
            <Text style={styles.errorTitle}>{t('seoPages.beginner.errors.error1.title')}</Text>
            <Text style={styles.errorDesc}>{t('seoPages.beginner.errors.error1.desc')}</Text>
          </View>
          
          <View style={styles.errorItem}>
            <Text style={styles.errorTitle}>{t('seoPages.beginner.errors.error2.title')}</Text>
            <Text style={styles.errorDesc}>{t('seoPages.beginner.errors.error2.desc')}</Text>
          </View>
          
          <View style={styles.errorItem}>
            <Text style={styles.errorTitle}>{t('seoPages.beginner.errors.error3.title')}</Text>
            <Text style={styles.errorDesc}>{t('seoPages.beginner.errors.error3.desc')}</Text>
          </View>
          
          <View style={styles.errorItem}>
            <Text style={styles.errorTitle}>{t('seoPages.beginner.errors.error4.title')}</Text>
            <Text style={styles.errorDesc}>{t('seoPages.beginner.errors.error4.desc')}</Text>
          </View>
          
          <View style={styles.errorItem}>
            <Text style={styles.errorTitle}>{t('seoPages.beginner.errors.error5.title')}</Text>
            <Text style={styles.errorDesc}>{t('seoPages.beginner.errors.error5.desc')}</Text>
          </View>
        </View>

        <View style={[styles.section, styles.ctaSection]}>
          <Text style={styles.ctaTitle}>{t('seoPages.beginner.cta.title')}</Text>
          <Text style={styles.ctaText}>{t('seoPages.beginner.cta.text')}</Text>
          <Pressable style={styles.ctaButton} onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.ctaButtonText}>{t('seoPages.beginner.cta.button')}</Text>
            <Ionicons name="arrow-forward" size={20} color="#0A1628" />
          </Pressable>
        </View>

        <AdBanner />
        <RelatedArticles silo="genealogie" currentPage="/genealogie-debutant-guide" />
        <SEOFooter currentPage="/genealogie-debutant-guide" />
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
  hero: { padding: 24 },
  badge: { backgroundColor: 'rgba(76, 175, 80, 0.2)', color: '#4CAF50', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, fontSize: 12, fontWeight: '600', alignSelf: 'flex-start', marginBottom: 16 },
  h1: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 16, lineHeight: 36 },
  subtitle: { fontSize: 16, color: '#B8C5D6', lineHeight: 26 },
  featuredSnippet: { backgroundColor: '#0D4F3C', margin: 20, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#4CAF50' },
  featuredTitle: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50', marginBottom: 12 },
  featuredText: { fontSize: 14, color: '#FFFFFF', lineHeight: 24 },
  section: { padding: 24 },
  sectionAlt: { backgroundColor: '#0D1E36' },
  h2: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 16 },
  paragraph: { fontSize: 15, color: '#B8C5D6', lineHeight: 26, marginBottom: 16 },
  tipBox: { backgroundColor: 'rgba(212, 175, 55, 0.1)', borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: '#D4AF37' },
  tipTitle: { fontSize: 14, fontWeight: 'bold', color: '#D4AF37', marginBottom: 8 },
  tipText: { fontSize: 14, color: '#B8C5D6', lineHeight: 22 },
  checkList: { backgroundColor: '#1A2A44', borderRadius: 12, padding: 16 },
  checkItem: { fontSize: 14, color: '#B8C5D6', marginBottom: 10, lineHeight: 22 },
  resourceCard: { backgroundColor: '#1A2A44', borderRadius: 12, padding: 20 },
  resourceTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12 },
  resourceItem: { fontSize: 14, color: '#B8C5D6', marginBottom: 8 },
  errorItem: { backgroundColor: '#1A2A44', borderRadius: 12, padding: 16, marginBottom: 12 },
  errorTitle: { fontSize: 15, fontWeight: 'bold', color: '#FF6B6B', marginBottom: 4 },
  errorDesc: { fontSize: 13, color: '#B8C5D6' },
  ctaSection: { alignItems: 'center', paddingVertical: 48, backgroundColor: '#0D1E36' },
  ctaTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12 },
  ctaText: { fontSize: 16, color: '#B8C5D6', textAlign: 'center', marginBottom: 24, maxWidth: 400 },
  ctaButton: { backgroundColor: '#D4AF37', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  ctaButtonText: { color: '#0A1628', fontSize: 18, fontWeight: '600' },
});
