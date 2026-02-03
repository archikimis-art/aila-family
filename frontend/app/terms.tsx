import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export default function TermsScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const sections = [
    { titleKey: 'terms.sections.acceptance.title', contentKey: 'terms.sections.acceptance.content' },
    { titleKey: 'terms.sections.service.title', contentKey: 'terms.sections.service.content' },
    { titleKey: 'terms.sections.account.title', contentKey: 'terms.sections.account.content' },
    { titleKey: 'terms.sections.conduct.title', contentKey: 'terms.sections.conduct.content' },
    { titleKey: 'terms.sections.intellectualProperty.title', contentKey: 'terms.sections.intellectualProperty.content' },
    { titleKey: 'terms.sections.liability.title', contentKey: 'terms.sections.liability.content' },
    { titleKey: 'terms.sections.termination.title', contentKey: 'terms.sections.termination.content' },
    { titleKey: 'terms.sections.modifications.title', contentKey: 'terms.sections.modifications.content' },
    { titleKey: 'terms.sections.law.title', contentKey: 'terms.sections.law.content' },
    { titleKey: 'terms.sections.contact.title', contentKey: 'terms.sections.contact.content' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('terms.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdate}>{t('terms.lastUpdate')}</Text>

        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{index + 1}. {t(section.titleKey)}</Text>
            <Text style={styles.paragraph}>{t(section.contentKey)}</Text>
          </View>
        ))}

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.homeButton}
            onPress={() => router.push('/')}
          >
            <Ionicons name="home-outline" size={20} color="#D4AF37" />
            <Text style={styles.homeButtonText}>{t('terms.backHome')}</Text>
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
    padding: 20,
  },
  lastUpdate: {
    fontSize: 12,
    color: '#6B7C93',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    color: '#B8C5D6',
    lineHeight: 22,
  },
  footer: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
    gap: 8,
  },
  homeButtonText: {
    color: '#D4AF37',
    fontSize: 15,
    fontWeight: '500',
  },
});
