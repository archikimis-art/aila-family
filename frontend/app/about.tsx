import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import AdBanner from '@/components/AdBanner';

export default function AboutScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('about.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Text style={styles.appName}>AÏLA</Text>
          <Text style={styles.tagline}>{t('about.tagline')}</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('about.mission.title')}</Text>
          <Text style={styles.paragraph}>
            {t('about.mission.description')}
          </Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('about.features.title')}</Text>
          
          <View style={styles.featureItem}>
            <Ionicons name="git-branch-outline" size={24} color="#D4AF37" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{t('about.features.tree.title')}</Text>
              <Text style={styles.featureDescription}>
                {t('about.features.tree.description')}
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="people-outline" size={24} color="#D4AF37" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{t('about.features.members.title')}</Text>
              <Text style={styles.featureDescription}>
                {t('about.features.members.description')}
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="chatbubbles-outline" size={24} color="#D4AF37" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{t('about.features.chat.title')}</Text>
              <Text style={styles.featureDescription}>
                {t('about.features.chat.description')}
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="share-social-outline" size={24} color="#D4AF37" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{t('about.features.share.title')}</Text>
              <Text style={styles.featureDescription}>
                {t('about.features.share.description')}
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="notifications-outline" size={24} color="#D4AF37" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{t('about.features.reminders.title')}</Text>
              <Text style={styles.featureDescription}>
                {t('about.features.reminders.description')}
              </Text>
            </View>
          </View>
        </View>

        {/* Why AILA */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('about.whyChoose.title')}</Text>
          <Text style={styles.paragraph}>
            {t('about.whyChoose.list')}
          </Text>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('about.contact.title')}</Text>
          <Text style={styles.paragraph}>
            {t('about.contact.description')}
          </Text>
        </View>

        {/* Version */}
        <View style={styles.versionSection}>
          <Text style={styles.version}>{t('about.version')}</Text>
          <Text style={styles.copyright}>{t('about.copyright')}</Text>
        </View>

        {/* Home Button */}
        <TouchableOpacity 
          style={styles.homeButton} 
          onPress={() => router.replace('/')}
        >
          <Ionicons name="home-outline" size={20} color="#0A1628" />
          <Text style={styles.homeButtonText}>{t('about.backHome')}</Text>
        </TouchableOpacity>

        <AdBanner />
        <View style={{ height: 40 }} />
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
    borderBottomColor: '#1A2F4A',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  appName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#A0AEC0',
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#D4AF37',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    color: '#E2E8F0',
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    backgroundColor: '#1A2F4A',
    borderRadius: 12,
    padding: 16,
  },
  featureText: {
    flex: 1,
    marginLeft: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#A0AEC0',
    lineHeight: 20,
  },
  versionSection: {
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 20,
  },
  version: {
    fontSize: 14,
    color: '#6B7C93',
  },
  copyright: {
    fontSize: 12,
    color: '#4A5568',
    marginTop: 4,
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  homeButtonText: {
    color: '#0A1628',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
