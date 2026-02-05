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
      document.title = t('seoPages.ancestors.metaTitle');
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', t('seoPages.ancestors.metaDescription'));
      }
    }
  }, [t]);
  return null;
};

const SectionCard = ({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionCardHeader}>
      <Text style={styles.sectionCardIcon}>{icon}</Text>
      <Text style={styles.sectionCardTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

export default function RetrouverAncetres() {
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

        <SEOBreadcrumbs items={BREADCRUMB_CONFIGS['retrouver-ancetres-gratuitement']} />

        <View style={styles.hero}>
          <Text style={styles.badge}>{t('seoPages.ancestors.badge')}</Text>
          <Text style={styles.h1}>{t('seoPages.ancestors.title')}</Text>
          <Text style={styles.subtitle}>{t('seoPages.ancestors.subtitle')}</Text>
          
          <View style={styles.authorBox}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorAvatarText}>👨‍🏫</Text>
            </View>
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{t('seoPages.ancestors.authorName')}</Text>
              <Text style={styles.authorCredentials}>{t('seoPages.ancestors.authorCredentials')}</Text>
              <Text style={styles.authorDate}>{t('seoPages.ancestors.authorDate')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.tocBox}>
          <Text style={styles.tocTitle}>{t('seoPages.ancestors.tocTitle')}</Text>
          <Text style={styles.tocItem}>{t('seoPages.ancestors.toc.item1')}</Text>
          <Text style={styles.tocItem}>{t('seoPages.ancestors.toc.item2')}</Text>
          <Text style={styles.tocItem}>{t('seoPages.ancestors.toc.item3')}</Text>
          <Text style={styles.tocItem}>{t('seoPages.ancestors.toc.item4')}</Text>
          <Text style={styles.tocItem}>{t('seoPages.ancestors.toc.item5')}</Text>
          <Text style={styles.tocItem}>{t('seoPages.ancestors.toc.item6')}</Text>
          <Text style={styles.tocItem}>{t('seoPages.ancestors.toc.item7')}</Text>
        </View>

        <View style={styles.featuredSnippet}>
          <Text style={styles.featuredSnippetTitle}>{t('seoPages.ancestors.summaryTitle')}</Text>
          <Text style={styles.featuredSnippetText}>{t('seoPages.ancestors.summaryText')}</Text>
        </View>

        {/* Section 1 */}
        <View style={styles.section}>
          <Text style={styles.h2}>{t('seoPages.ancestors.section1.title')}</Text>
          <Text style={styles.paragraph}>{t('seoPages.ancestors.section1.intro')}</Text>

          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>{t('seoPages.ancestors.section1.tipTitle')}</Text>
            <Text style={styles.tipText}>{t('seoPages.ancestors.section1.tipText')}</Text>
          </View>

          <Text style={styles.h3}>{t('seoPages.ancestors.section1.checklistTitle')}</Text>
          
          <View style={styles.checkList}>
            <Text style={styles.checkItem}>{t('seoPages.ancestors.section1.check1')}</Text>
            <Text style={styles.checkItem}>{t('seoPages.ancestors.section1.check2')}</Text>
            <Text style={styles.checkItem}>{t('seoPages.ancestors.section1.check3')}</Text>
            <Text style={styles.checkItem}>{t('seoPages.ancestors.section1.check4')}</Text>
            <Text style={styles.checkItem}>{t('seoPages.ancestors.section1.check5')}</Text>
            <Text style={styles.checkItem}>{t('seoPages.ancestors.section1.check6')}</Text>
          </View>

          <Text style={styles.paragraph}>{t('seoPages.ancestors.section1.outro')}</Text>
        </View>

        {/* Section 2 */}
        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.h2}>{t('seoPages.ancestors.section2.title')}</Text>
          <Text style={styles.paragraph}>{t('seoPages.ancestors.section2.intro')}</Text>

          <SectionCard icon="🏛️" title={t('seoPages.ancestors.section2.cardTitle')}>
            <Text style={styles.cardText}>{t('seoPages.ancestors.section2.card1')}</Text>
            <Text style={styles.cardText}>{t('seoPages.ancestors.section2.card2')}</Text>
            <Text style={styles.cardText}>{t('seoPages.ancestors.section2.card3')}</Text>
            <Text style={styles.cardText}>{t('seoPages.ancestors.section2.card4')}</Text>
            <Text style={styles.cardText}>{t('seoPages.ancestors.section2.card5')}</Text>
            <Text style={styles.cardText}>{t('seoPages.ancestors.section2.card6')}</Text>
          </SectionCard>

          <Text style={styles.h3}>{t('seoPages.ancestors.section2.accessTitle')}</Text>
          <Text style={styles.paragraph}>{t('seoPages.ancestors.section2.accessText')}</Text>

          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>{t('seoPages.ancestors.section2.warningTitle')}</Text>
            <Text style={styles.warningText}>{t('seoPages.ancestors.section2.warningText')}</Text>
          </View>
        </View>

        {/* Section 3 */}
        <View style={styles.section}>
          <Text style={styles.h2}>{t('seoPages.ancestors.section3.title')}</Text>
          <Text style={styles.paragraph}>{t('seoPages.ancestors.section3.intro')}</Text>
          <Text style={styles.h3}>{t('seoPages.ancestors.section3.methodTitle')}</Text>
          <Text style={styles.paragraph}>{t('seoPages.ancestors.section3.methodText')}</Text>

          <View style={styles.stepsBox}>
            <View style={styles.step}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>1</Text></View>
              <Text style={styles.stepText}>{t('seoPages.ancestors.section3.step1')}</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>2</Text></View>
              <Text style={styles.stepText}>{t('seoPages.ancestors.section3.step2')}</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>3</Text></View>
              <Text style={styles.stepText}>{t('seoPages.ancestors.section3.step3')}</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>4</Text></View>
              <Text style={styles.stepText}>{t('seoPages.ancestors.section3.step4')}</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>5</Text></View>
              <Text style={styles.stepText}>{t('seoPages.ancestors.section3.step5')}</Text>
            </View>
          </View>
        </View>

        {/* Section 4 */}
        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.h2}>{t('seoPages.ancestors.section4.title')}</Text>
          <Text style={styles.paragraph}>{t('seoPages.ancestors.section4.intro')}</Text>

          <View style={styles.resourceCard}>
            <Text style={styles.resourceName}>{t('seoPages.ancestors.section4.resource1.name')}</Text>
            <Text style={styles.resourceDesc}>{t('seoPages.ancestors.section4.resource1.desc')}</Text>
            <Text style={styles.resourcePros}>{t('seoPages.ancestors.section4.resource1.pros')}</Text>
          </View>

          <View style={styles.resourceCard}>
            <Text style={styles.resourceName}>{t('seoPages.ancestors.section4.resource2.name')}</Text>
            <Text style={styles.resourceDesc}>{t('seoPages.ancestors.section4.resource2.desc')}</Text>
            <Text style={styles.resourcePros}>{t('seoPages.ancestors.section4.resource2.pros')}</Text>
          </View>

          <View style={styles.resourceCard}>
            <Text style={styles.resourceName}>{t('seoPages.ancestors.section4.resource3.name')}</Text>
            <Text style={styles.resourceDesc}>{t('seoPages.ancestors.section4.resource3.desc')}</Text>
            <Text style={styles.resourcePros}>{t('seoPages.ancestors.section4.resource3.pros')}</Text>
          </View>

          <View style={styles.resourceCard}>
            <Text style={styles.resourceName}>{t('seoPages.ancestors.section4.resource4.name')}</Text>
            <Text style={styles.resourceDesc}>{t('seoPages.ancestors.section4.resource4.desc')}</Text>
            <Text style={styles.resourcePros}>{t('seoPages.ancestors.section4.resource4.pros')}</Text>
          </View>
        </View>

        {/* Section 5 - Timeline */}
        <View style={styles.section}>
          <Text style={styles.h2}>{t('seoPages.ancestors.section5.title')}</Text>

          <View style={styles.timelineBox}>
            <View style={styles.timelineItem}>
              <Text style={styles.timelineWeek}>{t('seoPages.ancestors.section5.week1.label')}</Text>
              <Text style={styles.timelineTitle}>{t('seoPages.ancestors.section5.week1.title')}</Text>
              <Text style={styles.timelineDesc}>{t('seoPages.ancestors.section5.week1.desc')}</Text>
            </View>
            <View style={styles.timelineItem}>
              <Text style={styles.timelineWeek}>{t('seoPages.ancestors.section5.week2.label')}</Text>
              <Text style={styles.timelineTitle}>{t('seoPages.ancestors.section5.week2.title')}</Text>
              <Text style={styles.timelineDesc}>{t('seoPages.ancestors.section5.week2.desc')}</Text>
            </View>
            <View style={styles.timelineItem}>
              <Text style={styles.timelineWeek}>{t('seoPages.ancestors.section5.week3.label')}</Text>
              <Text style={styles.timelineTitle}>{t('seoPages.ancestors.section5.week3.title')}</Text>
              <Text style={styles.timelineDesc}>{t('seoPages.ancestors.section5.week3.desc')}</Text>
            </View>
            <View style={styles.timelineItem}>
              <Text style={styles.timelineWeek}>{t('seoPages.ancestors.section5.week4.label')}</Text>
              <Text style={styles.timelineTitle}>{t('seoPages.ancestors.section5.week4.title')}</Text>
              <Text style={styles.timelineDesc}>{t('seoPages.ancestors.section5.week4.desc')}</Text>
            </View>
          </View>
        </View>

        {/* Section 6 - Errors */}
        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.h2}>{t('seoPages.ancestors.section6.title')}</Text>

          <View style={styles.errorCard}>
            <Text style={styles.errorNum}>❌ 1</Text>
            <View style={styles.errorContent}>
              <Text style={styles.errorTitle}>{t('seoPages.ancestors.section6.error1.title')}</Text>
              <Text style={styles.errorDesc}>{t('seoPages.ancestors.section6.error1.desc')}</Text>
            </View>
          </View>
          <View style={styles.errorCard}>
            <Text style={styles.errorNum}>❌ 2</Text>
            <View style={styles.errorContent}>
              <Text style={styles.errorTitle}>{t('seoPages.ancestors.section6.error2.title')}</Text>
              <Text style={styles.errorDesc}>{t('seoPages.ancestors.section6.error2.desc')}</Text>
            </View>
          </View>
          <View style={styles.errorCard}>
            <Text style={styles.errorNum}>❌ 3</Text>
            <View style={styles.errorContent}>
              <Text style={styles.errorTitle}>{t('seoPages.ancestors.section6.error3.title')}</Text>
              <Text style={styles.errorDesc}>{t('seoPages.ancestors.section6.error3.desc')}</Text>
            </View>
          </View>
          <View style={styles.errorCard}>
            <Text style={styles.errorNum}>❌ 4</Text>
            <View style={styles.errorContent}>
              <Text style={styles.errorTitle}>{t('seoPages.ancestors.section6.error4.title')}</Text>
              <Text style={styles.errorDesc}>{t('seoPages.ancestors.section6.error4.desc')}</Text>
            </View>
          </View>
          <View style={styles.errorCard}>
            <Text style={styles.errorNum}>❌ 5</Text>
            <View style={styles.errorContent}>
              <Text style={styles.errorTitle}>{t('seoPages.ancestors.section6.error5.title')}</Text>
              <Text style={styles.errorDesc}>{t('seoPages.ancestors.section6.error5.desc')}</Text>
            </View>
          </View>
          <View style={styles.errorCard}>
            <Text style={styles.errorNum}>❌ 6</Text>
            <View style={styles.errorContent}>
              <Text style={styles.errorTitle}>{t('seoPages.ancestors.section6.error6.title')}</Text>
              <Text style={styles.errorDesc}>{t('seoPages.ancestors.section6.error6.desc')}</Text>
            </View>
          </View>
          <View style={styles.errorCard}>
            <Text style={styles.errorNum}>❌ 7</Text>
            <View style={styles.errorContent}>
              <Text style={styles.errorTitle}>{t('seoPages.ancestors.section6.error7.title')}</Text>
              <Text style={styles.errorDesc}>{t('seoPages.ancestors.section6.error7.desc')}</Text>
            </View>
          </View>
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <Text style={styles.h2}>{t('seoPages.ancestors.faq.title')}</Text>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>{t('seoPages.ancestors.faq.q1')}</Text>
            <Text style={styles.faqAnswer}>{t('seoPages.ancestors.faq.a1')}</Text>
          </View>
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>{t('seoPages.ancestors.faq.q2')}</Text>
            <Text style={styles.faqAnswer}>{t('seoPages.ancestors.faq.a2')}</Text>
          </View>
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>{t('seoPages.ancestors.faq.q3')}</Text>
            <Text style={styles.faqAnswer}>{t('seoPages.ancestors.faq.a3')}</Text>
          </View>
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>{t('seoPages.ancestors.faq.q4')}</Text>
            <Text style={styles.faqAnswer}>{t('seoPages.ancestors.faq.a4')}</Text>
          </View>
        </View>

        {/* CTA */}
        <View style={[styles.section, styles.ctaSection]}>
          <Text style={styles.ctaTitle}>{t('seoPages.ancestors.cta.title')}</Text>
          <Text style={styles.ctaText}>{t('seoPages.ancestors.cta.text')}</Text>
          
          <Pressable style={styles.ctaButton} onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.ctaButtonText}>{t('seoPages.ancestors.cta.button')}</Text>
            <Ionicons name="arrow-forward" size={20} color="#0A1628" />
          </Pressable>
        </View>

        <RelatedArticles silo="genealogie" currentPage="/retrouver-ancetres-gratuitement" />
        <SEOFooter currentPage="/retrouver-ancetres-gratuitement" />
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
  featuredSnippetTitle: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50', marginBottom: 12 },
  featuredSnippetText: { fontSize: 14, color: '#FFFFFF', lineHeight: 24 },
  section: { padding: 24 },
  sectionAlt: { backgroundColor: '#0D1E36' },
  h2: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 16 },
  h3: { fontSize: 18, fontWeight: '600', color: '#D4AF37', marginBottom: 12, marginTop: 20 },
  paragraph: { fontSize: 15, color: '#B8C5D6', lineHeight: 26, marginBottom: 16 },
  tipBox: { backgroundColor: 'rgba(212, 175, 55, 0.1)', borderRadius: 12, padding: 16, marginVertical: 16, borderLeftWidth: 4, borderLeftColor: '#D4AF37' },
  tipTitle: { fontSize: 14, fontWeight: 'bold', color: '#D4AF37', marginBottom: 8 },
  tipText: { fontSize: 14, color: '#B8C5D6', lineHeight: 22 },
  warningBox: { backgroundColor: 'rgba(255, 152, 0, 0.1)', borderRadius: 12, padding: 16, marginVertical: 16, borderLeftWidth: 4, borderLeftColor: '#FF9800' },
  warningTitle: { fontSize: 14, fontWeight: 'bold', color: '#FF9800', marginBottom: 8 },
  warningText: { fontSize: 14, color: '#B8C5D6', lineHeight: 22 },
  checkList: { backgroundColor: '#1A2A44', borderRadius: 12, padding: 16, marginVertical: 12 },
  checkItem: { fontSize: 14, color: '#B8C5D6', marginBottom: 10, lineHeight: 22 },
  sectionCard: { backgroundColor: '#1A2A44', borderRadius: 12, padding: 20, marginVertical: 12 },
  sectionCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionCardIcon: { fontSize: 24, marginRight: 12 },
  sectionCardTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  cardText: { fontSize: 14, color: '#B8C5D6', marginBottom: 6, paddingLeft: 8 },
  stepsBox: { marginVertical: 16 },
  step: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  stepNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#D4AF37', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  stepNumText: { fontSize: 14, fontWeight: 'bold', color: '#0A1628' },
  stepText: { flex: 1, fontSize: 14, color: '#B8C5D6', lineHeight: 22, paddingTop: 4 },
  resourceCard: { backgroundColor: '#1A2A44', borderRadius: 12, padding: 20, marginBottom: 16 },
  resourceName: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  resourceDesc: { fontSize: 14, color: '#B8C5D6', lineHeight: 22, marginBottom: 12 },
  resourcePros: { fontSize: 13, color: '#4CAF50' },
  timelineBox: { marginVertical: 16 },
  timelineItem: { backgroundColor: '#1A2A44', borderRadius: 12, padding: 20, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#D4AF37' },
  timelineWeek: { fontSize: 12, fontWeight: 'bold', color: '#D4AF37', marginBottom: 4 },
  timelineTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  timelineDesc: { fontSize: 14, color: '#B8C5D6', lineHeight: 22 },
  errorCard: { backgroundColor: '#1A2A44', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'flex-start' },
  errorNum: { fontSize: 18, marginRight: 12, width: 30 },
  errorContent: { flex: 1 },
  errorTitle: { fontSize: 15, fontWeight: 'bold', color: '#FF6B6B', marginBottom: 4 },
  errorDesc: { fontSize: 13, color: '#B8C5D6', lineHeight: 20 },
  faqItem: { backgroundColor: '#1A2A44', borderRadius: 12, padding: 20, marginBottom: 16 },
  faqQuestion: { fontSize: 16, fontWeight: '600', color: '#D4AF37', marginBottom: 12 },
  faqAnswer: { fontSize: 14, color: '#B8C5D6', lineHeight: 24 },
  ctaSection: { alignItems: 'center', paddingVertical: 48, backgroundColor: '#0D1E36' },
  ctaTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 12 },
  ctaText: { fontSize: 16, color: '#B8C5D6', textAlign: 'center', lineHeight: 24, maxWidth: 500, marginBottom: 24 },
  ctaButton: { backgroundColor: '#D4AF37', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  ctaButtonText: { color: '#0A1628', fontSize: 18, fontWeight: '600' },
});
