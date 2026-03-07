import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import AdBanner from '@/components/AdBanner';

export default function PourquoiAilaScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const features = [
    {
      icon: 'flash',
      titleKey: 'whyAila.features.simple.title',
      subtitleKey: 'whyAila.features.simple.subtitle',
      descriptionKey: 'whyAila.features.simple.description',
      benefitsKeys: ['whyAila.features.simple.benefits.0', 'whyAila.features.simple.benefits.1', 'whyAila.features.simple.benefits.2']
    },
    {
      icon: 'people',
      titleKey: 'whyAila.features.collaborative.title',
      subtitleKey: 'whyAila.features.collaborative.subtitle',
      descriptionKey: 'whyAila.features.collaborative.description',
      benefitsKeys: ['whyAila.features.collaborative.benefits.0', 'whyAila.features.collaborative.benefits.1', 'whyAila.features.collaborative.benefits.2']
    },
    {
      icon: 'chatbubbles',
      titleKey: 'whyAila.features.chat.title',
      subtitleKey: 'whyAila.features.chat.subtitle',
      descriptionKey: 'whyAila.features.chat.description',
      benefitsKeys: ['whyAila.features.chat.benefits.0', 'whyAila.features.chat.benefits.1', 'whyAila.features.chat.benefits.2']
    },
    {
      icon: 'document-text',
      titleKey: 'whyAila.features.import.title',
      subtitleKey: 'whyAila.features.import.subtitle',
      descriptionKey: 'whyAila.features.import.description',
      benefitsKeys: ['whyAila.features.import.benefits.0', 'whyAila.features.import.benefits.1', 'whyAila.features.import.benefits.2']
    },
    {
      icon: 'shield-checkmark',
      titleKey: 'whyAila.features.security.title',
      subtitleKey: 'whyAila.features.security.subtitle',
      descriptionKey: 'whyAila.features.security.description',
      benefitsKeys: ['whyAila.features.security.benefits.0', 'whyAila.features.security.benefits.1', 'whyAila.features.security.benefits.2']
    },
    {
      icon: 'gift',
      titleKey: 'whyAila.features.free.title',
      subtitleKey: 'whyAila.features.free.subtitle',
      descriptionKey: 'whyAila.features.free.description',
      benefitsKeys: ['whyAila.features.free.benefits.0', 'whyAila.features.free.benefits.1', 'whyAila.features.free.benefits.2']
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#D4AF37" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Ionicons name="leaf" size={40} color="#D4AF37" />
            <Text style={styles.headerTitle}>{t('whyAila.title')}</Text>
            <Text style={styles.headerSubtitle}>
              {t('whyAila.subtitle')}
            </Text>
          </View>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={styles.featureHeader}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name={feature.icon as any} size={28} color="#D4AF37" />
                </View>
                <View style={styles.featureTitleContainer}>
                  <Text style={styles.featureTitle}>{t(feature.titleKey)}</Text>
                  <Text style={styles.featureSubtitle}>{t(feature.subtitleKey)}</Text>
                </View>
              </View>
              
              <Text style={styles.featureDescription}>{t(feature.descriptionKey)}</Text>
              
              <View style={styles.benefitsList}>
                {feature.benefitsKeys.map((benefitKey, bIndex) => (
                  <View key={bIndex} style={styles.benefitItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.benefitText}>{t(benefitKey)}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>{t('whyAila.cta.title')}</Text>
          <Text style={styles.ctaSubtitle}>{t('whyAila.cta.subtitle')}</Text>
          
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => router.push('/(tabs)/tree?preview=true')}
          >
            <Ionicons name="play" size={20} color="#0A1628" />
            <Text style={styles.ctaButtonText}>{t('home.cta.tryNow')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.ctaSecondaryButton}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.ctaSecondaryButtonText}>{t('home.cta.createAccount')}</Text>
          </TouchableOpacity>
        </View>

        <AdBanner />
        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => router.push('/')}>
            <Text style={styles.footerLink}>{t('whyAila.backHome')}</Text>
          </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8BA1B7',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    padding: 16,
  },
  featureCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTitleContainer: {
    marginLeft: 16,
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  featureSubtitle: {
    fontSize: 14,
    color: '#D4AF37',
    marginTop: 2,
  },
  featureDescription: {
    fontSize: 14,
    color: '#B8C5D6',
    lineHeight: 22,
    marginBottom: 16,
  },
  benefitsList: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.1)',
    paddingTop: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 13,
    color: '#8BA1B7',
    marginLeft: 8,
  },
  ctaSection: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 14,
    color: '#8BA1B7',
    marginTop: 8,
    textAlign: 'center',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A1628',
  },
  ctaSecondaryButton: {
    marginTop: 12,
    paddingVertical: 10,
  },
  ctaSecondaryButtonText: {
    fontSize: 14,
    color: '#D4AF37',
    textDecorationLine: 'underline',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 40,
  },
  footerLink: {
    fontSize: 14,
    color: '#6B8BB8',
  },
});
