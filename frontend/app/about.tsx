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
        <Text style={styles.headerTitle}>{t('home.about')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Text style={styles.appName}>AÏLA</Text>
          <Text style={styles.tagline}>{t('home.subtitle')}</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notre Mission</Text>
          <Text style={styles.paragraph}>
            AÏLA est une application innovante dédiée à la création et à la gestion de votre arbre généalogique familial. 
            Notre mission est de vous aider à préserver et partager l'histoire de votre famille à travers les générations.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fonctionnalités Principales</Text>
          
          <View style={styles.featureItem}>
            <Ionicons name="git-branch-outline" size={24} color="#D4AF37" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Arbre Généalogique Interactif</Text>
              <Text style={styles.featureDescription}>
                Visualisez votre famille dans un arbre dynamique avec des connexions claires entre les générations.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="people-outline" size={24} color="#D4AF37" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Gestion des Membres</Text>
              <Text style={styles.featureDescription}>
                Ajoutez facilement des membres de votre famille avec leurs informations personnelles, photos et dates importantes.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="chatbubbles-outline" size={24} color="#D4AF37" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Discussion Familiale</Text>
              <Text style={styles.featureDescription}>
                Communiquez avec les membres de votre famille grâce à notre système de chat intégré et privé.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="share-social-outline" size={24} color="#D4AF37" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Partage Sécurisé</Text>
              <Text style={styles.featureDescription}>
                Partagez votre arbre avec vos proches de manière sécurisée grâce à des liens de prévisualisation.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="notifications-outline" size={24} color="#D4AF37" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Rappels d'Événements</Text>
              <Text style={styles.featureDescription}>
                Ne manquez plus jamais un anniversaire ou une date importante grâce à nos notifications automatiques.
              </Text>
            </View>
          </View>
        </View>

        {/* Why AILA */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pourquoi Choisir AÏLA ?</Text>
          <Text style={styles.paragraph}>
            • Interface intuitive et élégante{"\n"}
            • Respect de votre vie privée et protection des données{"\n"}
            • Synchronisation automatique sur tous vos appareils{"\n"}
            • Support multilingue (Français, Arabe){"\n"}
            • Exportation de vos données à tout moment{"\n"}
            • Équipe de support réactive
          </Text>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nous Contacter</Text>
          <Text style={styles.paragraph}>
            Pour toute question ou suggestion, n'hésitez pas à nous contacter à :{"\n"}
            Email : contact@aila.family{"\n"}
            Site web : www.aila.family
          </Text>
        </View>

        {/* Version */}
        <View style={styles.versionSection}>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.copyright}>© 2024 AÏLA. Tous droits réservés.</Text>
        </View>

        {/* Home Button */}
        <TouchableOpacity 
          style={styles.homeButton} 
          onPress={() => router.replace('/')}
        >
          <Ionicons name="home-outline" size={20} color="#0A1628" />
          <Text style={styles.homeButtonText}>Retour à l'accueil</Text>
        </TouchableOpacity>

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
