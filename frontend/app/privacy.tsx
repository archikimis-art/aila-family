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
import AdBanner from '@/components/AdBanner';

export default function PrivacyScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const sections = [
    { titleKey: 'privacy.sections.intro.title', contentKey: 'privacy.sections.intro.content' },
    { titleKey: 'privacy.sections.dataCollected.title', contentKey: 'privacy.sections.dataCollected.content' },
    { titleKey: 'privacy.sections.dataUse.title', contentKey: 'privacy.sections.dataUse.content' },
    { titleKey: 'privacy.sections.dataSecurity.title', contentKey: 'privacy.sections.dataSecurity.content' },
    { titleKey: 'privacy.sections.yourRights.title', contentKey: 'privacy.sections.yourRights.content' },
    { titleKey: 'privacy.sections.cookies.title', contentKey: 'privacy.sections.cookies.content' },
    { titleKey: 'privacy.sections.thirdParty.title', contentKey: 'privacy.sections.thirdParty.content' },
    { titleKey: 'privacy.sections.changes.title', contentKey: 'privacy.sections.changes.content' },
    { titleKey: 'privacy.sections.contact.title', contentKey: 'privacy.sections.contact.content' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('privacy.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdate}>{t('privacy.lastUpdate')}</Text>

        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{index + 1}. {t(section.titleKey)}</Text>
            <Text style={styles.paragraph}>{t(section.contentKey)}</Text>
          </View>
        ))}

        <AdBanner />
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.homeButton}
            onPress={() => router.push('/')}
          >
            <Ionicons name="home-outline" size={20} color="#D4AF37" />
            <Text style={styles.homeButtonText}>{t('privacy.backHome')}</Text>
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
