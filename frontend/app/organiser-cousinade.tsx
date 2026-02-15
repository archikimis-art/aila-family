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
      document.title = t('seoPages.cousinade.metaTitle');
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', t('seoPages.cousinade.metaDescription'));
      }
    }
  }, [t]);
  return null;
};

export default function OrganiserCousinade() {
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
          <Text style={styles.badge}>{t('seoPages.cousinade.badge')}</Text>
          <Text style={styles.h1}>{t('seoPages.cousinade.title')}</Text>
          <Text style={styles.subtitle}>{t('seoPages.cousinade.subtitle')}</Text>
        </View>

        <View style={styles.featuredSnippet}>
          <Text style={styles.featuredTitle}>{t('seoPages.cousinade.checklistTitle')}</Text>
          <Text style={styles.featuredText}>{t('seoPages.cousinade.checklist')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>{t('seoPages.cousinade.step1.title')}</Text>
          
          <View style={styles.taskCard}>
            <Text style={styles.taskTitle}>{t('seoPages.cousinade.step1.task1.title')}</Text>
            <Text style={styles.taskDesc}>{t('seoPages.cousinade.step1.task1.desc')}</Text>
          </View>
          
          <View style={styles.taskCard}>
            <Text style={styles.taskTitle}>{t('seoPages.cousinade.step1.task2.title')}</Text>
            <Text style={styles.taskDesc}>{t('seoPages.cousinade.step1.task2.desc')}</Text>
          </View>
          
          <View style={styles.taskCard}>
            <Text style={styles.taskTitle}>{t('seoPages.cousinade.step1.task3.title')}</Text>
            <Text style={styles.taskDesc}>{t('seoPages.cousinade.step1.task3.desc')}</Text>
          </View>
        </View>

        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.h2}>{t('seoPages.cousinade.step2.title')}</Text>
          
          <View style={styles.optionCard}>
            <Text style={styles.optionIcon}>🏠</Text>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{t('seoPages.cousinade.step2.option1.title')}</Text>
              <Text style={styles.optionPros}>{t('seoPages.cousinade.step2.option1.pros')}</Text>
              <Text style={styles.optionCons}>{t('seoPages.cousinade.step2.option1.cons')}</Text>
            </View>
          </View>
          
          <View style={styles.optionCard}>
            <Text style={styles.optionIcon}>🏕️</Text>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{t('seoPages.cousinade.step2.option2.title')}</Text>
              <Text style={styles.optionPros}>{t('seoPages.cousinade.step2.option2.pros')}</Text>
              <Text style={styles.optionCons}>{t('seoPages.cousinade.step2.option2.cons')}</Text>
            </View>
          </View>
          
          <View style={styles.optionCard}>
            <Text style={styles.optionIcon}>🏛️</Text>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{t('seoPages.cousinade.step2.option3.title')}</Text>
              <Text style={styles.optionPros}>{t('seoPages.cousinade.step2.option3.pros')}</Text>
              <Text style={styles.optionCons}>{t('seoPages.cousinade.step2.option3.cons')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>{t('seoPages.cousinade.step3.title')}</Text>
          
          <View style={styles.budgetTable}>
            <View style={styles.budgetRow}>
              <Text style={styles.budgetLabel}>{t('seoPages.cousinade.step3.budget1.label')}</Text>
              <Text style={styles.budgetAmount}>{t('seoPages.cousinade.step3.budget1.amount')}</Text>
            </View>
            <View style={styles.budgetRow}>
              <Text style={styles.budgetLabel}>{t('seoPages.cousinade.step3.budget2.label')}</Text>
              <Text style={styles.budgetAmount}>{t('seoPages.cousinade.step3.budget2.amount')}</Text>
            </View>
            <View style={styles.budgetRow}>
              <Text style={styles.budgetLabel}>{t('seoPages.cousinade.step3.budget3.label')}</Text>
              <Text style={styles.budgetAmount}>{t('seoPages.cousinade.step3.budget3.amount')}</Text>
            </View>
            <View style={styles.budgetRow}>
              <Text style={styles.budgetLabel}>{t('seoPages.cousinade.step3.budget4.label')}</Text>
              <Text style={styles.budgetAmount}>{t('seoPages.cousinade.step3.budget4.amount')}</Text>
            </View>
          </View>
          
          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>{t('seoPages.cousinade.step3.tipTitle')}</Text>
            <Text style={styles.tipText}>{t('seoPages.cousinade.step3.tipText')}</Text>
          </View>
        </View>

        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.h2}>{t('seoPages.cousinade.step4.title')}</Text>
          
          <View style={styles.activityGrid}>
            <View style={styles.activityCard}>
              <Text style={styles.activityIcon}>📸</Text>
              <Text style={styles.activityName}>{t('seoPages.cousinade.step4.activity1')}</Text>
            </View>
            <View style={styles.activityCard}>
              <Text style={styles.activityIcon}>🌳</Text>
              <Text style={styles.activityName}>{t('seoPages.cousinade.step4.activity2')}</Text>
            </View>
            <View style={styles.activityCard}>
              <Text style={styles.activityIcon}>🎮</Text>
              <Text style={styles.activityName}>{t('seoPages.cousinade.step4.activity3')}</Text>
            </View>
            <View style={styles.activityCard}>
              <Text style={styles.activityIcon}>🎤</Text>
              <Text style={styles.activityName}>{t('seoPages.cousinade.step4.activity4')}</Text>
            </View>
            <View style={styles.activityCard}>
              <Text style={styles.activityIcon}>📖</Text>
              <Text style={styles.activityName}>{t('seoPages.cousinade.step4.activity5')}</Text>
            </View>
            <View style={styles.activityCard}>
              <Text style={styles.activityIcon}>🏃</Text>
              <Text style={styles.activityName}>{t('seoPages.cousinade.step4.activity6')}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, styles.ctaSection]}>
          <Text style={styles.ctaTitle}>{t('seoPages.cousinade.cta.title')}</Text>
          <Text style={styles.ctaText}>{t('seoPages.cousinade.cta.text')}</Text>
          <Pressable style={styles.ctaButton} onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.ctaButtonText}>{t('seoPages.cousinade.cta.button')}</Text>
            <Ionicons name="arrow-forward" size={20} color="#0A1628" />
          </Pressable>
        </View>

        <RelatedArticles silo="famille" currentPage="/organiser-cousinade" />
        <SEOFooter currentPage="/organiser-cousinade" />
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
  taskCard: { backgroundColor: '#1A2A44', borderRadius: 12, padding: 20, marginBottom: 12 },
  taskTitle: { fontSize: 16, fontWeight: 'bold', color: '#D4AF37', marginBottom: 8 },
  taskDesc: { fontSize: 14, color: '#B8C5D6', lineHeight: 22 },
  optionCard: { backgroundColor: '#1A2A44', borderRadius: 12, padding: 20, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  optionIcon: { fontSize: 32, marginRight: 16 },
  optionContent: { flex: 1 },
  optionTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  optionPros: { fontSize: 13, color: '#4CAF50', marginBottom: 2 },
  optionCons: { fontSize: 13, color: '#FF6B6B' },
  budgetTable: { backgroundColor: '#1A2A44', borderRadius: 12, padding: 20, marginBottom: 16 },
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2A3F5A' },
  budgetLabel: { fontSize: 14, color: '#B8C5D6' },
  budgetAmount: { fontSize: 14, fontWeight: '600', color: '#D4AF37' },
  tipBox: { backgroundColor: 'rgba(212, 175, 55, 0.1)', borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: '#D4AF37' },
  tipTitle: { fontSize: 14, fontWeight: 'bold', color: '#D4AF37', marginBottom: 8 },
  tipText: { fontSize: 14, color: '#B8C5D6', lineHeight: 22 },
  activityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  activityCard: { backgroundColor: '#1A2A44', borderRadius: 12, padding: 16, width: '47%', alignItems: 'center' },
  activityIcon: { fontSize: 28, marginBottom: 8 },
  activityName: { fontSize: 12, color: '#B8C5D6', textAlign: 'center' },
  ctaSection: { alignItems: 'center', paddingVertical: 48, backgroundColor: '#0D1E36' },
  ctaTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12 },
  ctaText: { fontSize: 16, color: '#B8C5D6', textAlign: 'center', marginBottom: 24, maxWidth: 400 },
  ctaButton: { backgroundColor: '#D4AF37', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  ctaButtonText: { color: '#0A1628', fontSize: 18, fontWeight: '600' },
});
