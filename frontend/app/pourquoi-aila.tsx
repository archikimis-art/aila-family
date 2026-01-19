import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PourquoiAilaScreen() {
  const router = useRouter();

  const features = [
    {
      icon: 'flash',
      title: 'Simple & Intuitif',
      subtitle: 'Créez votre arbre en 5 minutes',
      description: 'AÏLA a été conçu pour être utilisé par tous, même sans compétences techniques. L\'interface intuitive vous guide pas à pas dans la création de votre arbre généalogique. Ajoutez des membres, créez des liens familiaux, et visualisez votre histoire familiale en quelques clics.',
      benefits: ['Interface épurée et moderne', 'Tutoriels intégrés', 'Pas de formation nécessaire']
    },
    {
      icon: 'people',
      title: 'Collaboratif',
      subtitle: 'Invitez votre famille',
      description: 'La généalogie est une aventure familiale ! Avec AÏLA, invitez vos proches à contribuer à l\'arbre. Chacun peut ajouter des informations, des photos et des anecdotes. Ensemble, vous construisez la mémoire de votre famille.',
      benefits: ['Invitations par email', 'Contributions en temps réel', 'Historique des modifications']
    },
    {
      icon: 'chatbubbles',
      title: 'Chat Familial Sécurisé',
      subtitle: 'Discutez en privé',
      description: 'Restez connecté avec votre famille grâce au chat intégré. Partagez des souvenirs, posez des questions sur vos ancêtres, ou organisez des réunions familiales. Toutes vos conversations sont privées et sécurisées.',
      benefits: ['Messagerie instantanée', 'Partage de photos', 'Notifications push']
    },
    {
      icon: 'document-text',
      title: 'Import & Export',
      subtitle: 'Excel & PDF inclus',
      description: 'Importez facilement vos données depuis un fichier Excel ou exportez votre arbre en PDF haute qualité pour l\'imprimer et l\'encadrer. AÏLA s\'adapte à vos besoins et vous permet de conserver votre travail sous différents formats.',
      benefits: ['Import Excel automatique', 'Export PDF professionnel', 'Sauvegarde GEDCOM']
    },
    {
      icon: 'shield-checkmark',
      title: 'RGPD & Sécurité',
      subtitle: 'Vos données protégées',
      description: 'Vos données familiales sont précieuses. AÏLA respecte scrupuleusement le RGPD et utilise un chiffrement de niveau bancaire. Vous gardez le contrôle total : exportez ou supprimez vos données à tout moment.',
      benefits: ['Conforme RGPD', 'Chiffrement SSL', 'Droit à l\'oubli garanti']
    },
    {
      icon: 'gift',
      title: '100% Gratuit',
      subtitle: 'Sans engagement',
      description: 'AÏLA est entièrement gratuit pour les fonctionnalités essentielles. Pas d\'abonnement caché, pas de limite de temps. Créez votre arbre, invitez votre famille, et profitez de toutes les fonctionnalités de base sans débourser un centime.',
      benefits: ['Arbre illimité', 'Pas de publicité intrusive', 'Fonctions premium optionnelles']
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
            <Text style={styles.headerTitle}>Pourquoi AÏLA ?</Text>
            <Text style={styles.headerSubtitle}>
              Découvrez ce qui fait d'AÏLA l'application idéale pour créer et partager votre arbre généalogique familial.
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
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
                </View>
              </View>
              
              <Text style={styles.featureDescription}>{feature.description}</Text>
              
              <View style={styles.benefitsList}>
                {feature.benefits.map((benefit, bIndex) => (
                  <View key={bIndex} style={styles.benefitItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Prêt à commencer ?</Text>
          <Text style={styles.ctaSubtitle}>Créez votre arbre généalogique en quelques minutes</Text>
          
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => router.push('/(tabs)/tree?preview=true')}
          >
            <Ionicons name="play" size={20} color="#0A1628" />
            <Text style={styles.ctaButtonText}>Essayer maintenant</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.ctaSecondaryButton}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.ctaSecondaryButtonText}>Créer un compte gratuit</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => router.push('/')}>
            <Text style={styles.footerLink}>← Retour à l'accueil</Text>
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
