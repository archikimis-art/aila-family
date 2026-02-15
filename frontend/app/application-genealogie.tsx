import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// SEO Component
const SEOHead = () => {
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Application Arbre Généalogique Mobile & Web | AILA Famille';
      
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'AILA Famille : la meilleure application d\'arbre généalogique sur mobile et web. Créez et partagez votre généalogie sur iPhone, Android et ordinateur. Gratuit !');
      }
      
      let canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.setAttribute('href', 'https://www.aila.family/application-genealogie');
      }
    }
  }, []);
  
  return null;
};

export default function ApplicationGenealogieScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <SEOHead />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/')} style={styles.logo}>
            <Text style={styles.logoText}>🌳 AILA</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.badge}>📱 Mobile & Web</Text>
          <Text style={styles.h1}>L'Application Généalogie N°1 en France</Text>
          <Text style={styles.subtitle}>
            AILA Famille est l'application d'arbre généalogique la plus simple et la plus 
            complète. Disponible sur iPhone, Android et navigateur web.
          </Text>
          
          <View style={styles.platformBadges}>
            <View style={styles.platformBadge}>
              <Ionicons name="logo-apple" size={24} color="#FFFFFF" />
              <Text style={styles.platformText}>iOS</Text>
            </View>
            <View style={styles.platformBadge}>
              <Ionicons name="logo-android" size={24} color="#FFFFFF" />
              <Text style={styles.platformText}>Android</Text>
            </View>
            <View style={styles.platformBadge}>
              <Ionicons name="globe-outline" size={24} color="#FFFFFF" />
              <Text style={styles.platformText}>Web</Text>
            </View>
          </View>
          
          <View style={styles.ctaContainer}>
            <TouchableOpacity 
              style={styles.ctaPrimary}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={styles.ctaPrimaryText}>Télécharger Gratuit</Text>
              <Ionicons name="download" size={20} color="#0A1628" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Why This App */}
        <View style={styles.section}>
          <Text style={styles.h2}>Pourquoi AILA est la Meilleure Application de Généalogie ?</Text>
          
          <View style={styles.comparisonTable}>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonFeature}>Interface intuitive</Text>
              <Text style={styles.comparisonCheck}>✅ AILA</Text>
            </View>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonFeature}>100% gratuit illimité</Text>
              <Text style={styles.comparisonCheck}>✅ AILA</Text>
            </View>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonFeature}>Collaboration famille</Text>
              <Text style={styles.comparisonCheck}>✅ AILA</Text>
            </View>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonFeature}>Multi-plateforme</Text>
              <Text style={styles.comparisonCheck}>✅ AILA</Text>
            </View>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonFeature}>En français</Text>
              <Text style={styles.comparisonCheck}>✅ AILA</Text>
            </View>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonFeature}>Sans publicité invasive</Text>
              <Text style={styles.comparisonCheck}>✅ AILA</Text>
            </View>
          </View>
        </View>

        {/* Features */}
        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.h2}>Fonctionnalités de l'Application AILA</Text>
          
          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <Ionicons name="git-network-outline" size={40} color="#D4AF37" />
              <Text style={styles.featureTitle}>Arbre Visuel</Text>
              <Text style={styles.featureDesc}>
                Visualisez votre arbre généalogique de façon claire et interactive.
              </Text>
            </View>
            
            <View style={styles.featureCard}>
              <Ionicons name="people-outline" size={40} color="#D4AF37" />
              <Text style={styles.featureTitle}>Collaboration</Text>
              <Text style={styles.featureDesc}>
                Invitez vos proches à enrichir l'arbre familial ensemble.
              </Text>
            </View>
            
            <View style={styles.featureCard}>
              <Ionicons name="notifications-outline" size={40} color="#D4AF37" />
              <Text style={styles.featureTitle}>Rappels</Text>
              <Text style={styles.featureDesc}>
                Ne manquez plus aucun anniversaire avec les notifications.
              </Text>
            </View>
            
            <View style={styles.featureCard}>
              <Ionicons name="chatbubbles-outline" size={40} color="#D4AF37" />
              <Text style={styles.featureTitle}>Messagerie</Text>
              <Text style={styles.featureDesc}>
                Discutez avec votre famille et partagez des souvenirs.
              </Text>
            </View>
            
            <View style={styles.featureCard}>
              <Ionicons name="cloud-download-outline" size={40} color="#D4AF37" />
              <Text style={styles.featureTitle}>Export</Text>
              <Text style={styles.featureDesc}>
                Exportez votre arbre en PDF ou format GEDCOM standard.
              </Text>
            </View>
            
            <View style={styles.featureCard}>
              <Ionicons name="shield-checkmark-outline" size={40} color="#D4AF37" />
              <Text style={styles.featureTitle}>Sécurisé</Text>
              <Text style={styles.featureDesc}>
                Vos données sont cryptées et protégées. Conforme RGPD.
              </Text>
            </View>
          </View>
        </View>

        {/* Testimonials */}
        <View style={styles.section}>
          <Text style={styles.h2}>Ce que Disent Nos Utilisateurs</Text>
          
          <View style={styles.testimonialsGrid}>
            <View style={styles.testimonialCard}>
              <Text style={styles.testimonialStars}>⭐⭐⭐⭐⭐</Text>
              <Text style={styles.testimonialText}>
                "Enfin une application généalogique simple et en français ! 
                Toute ma famille l'utilise maintenant."
              </Text>
              <Text style={styles.testimonialAuthor}>- Marie L., Lyon</Text>
            </View>
            
            <View style={styles.testimonialCard}>
              <Text style={styles.testimonialStars}>⭐⭐⭐⭐⭐</Text>
              <Text style={styles.testimonialText}>
                "J'ai essayé plusieurs applications, AILA est de loin la meilleure. 
                Gratuite et complète !"
              </Text>
              <Text style={styles.testimonialAuthor}>- Jean-Pierre M., Paris</Text>
            </View>
            
            <View style={styles.testimonialCard}>
              <Text style={styles.testimonialStars}>⭐⭐⭐⭐⭐</Text>
              <Text style={styles.testimonialText}>
                "La collaboration familiale est top ! Mes cousins en Belgique peuvent 
                ajouter leurs branches."
              </Text>
              <Text style={styles.testimonialAuthor}>- Sophie D., Bordeaux</Text>
            </View>
          </View>
        </View>

        {/* FAQ */}
        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.h2}>Questions sur l'Application AILA</Text>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Comment télécharger l'application AILA ?</Text>
            <Text style={styles.faqAnswer}>
              AILA est accessible directement depuis votre navigateur sur aila.family. 
              Vous pouvez aussi l'installer comme application sur votre smartphone 
              en cliquant sur "Ajouter à l'écran d'accueil".
            </Text>
          </View>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>L'application est-elle synchronisée entre appareils ?</Text>
            <Text style={styles.faqAnswer}>
              Oui ! Votre arbre généalogique est automatiquement synchronisé entre tous 
              vos appareils. Modifiez-le sur votre téléphone et retrouvez les changements 
              sur votre ordinateur.
            </Text>
          </View>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Puis-je utiliser l'application hors ligne ?</Text>
            <Text style={styles.faqAnswer}>
              AILA fonctionne principalement en ligne pour permettre la synchronisation 
              et la collaboration. Une connexion internet est requise pour accéder à 
              vos données.
            </Text>
          </View>
        </View>

        {/* CTA Final */}
        <View style={[styles.section, styles.ctaFinal]}>
          <Text style={styles.h2}>Téléchargez AILA Gratuitement</Text>
          <Text style={styles.ctaFinalText}>
            Rejoignez des milliers de familles françaises qui utilisent AILA chaque jour.
          </Text>
          
          <TouchableOpacity 
            style={styles.ctaPrimary}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.ctaPrimaryText}>Créer Mon Compte Gratuit</Text>
            <Ionicons name="arrow-forward" size={20} color="#0A1628" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2024 AILA Famille - Meilleure application de généalogie
          </Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => router.push('/arbre-genealogique-gratuit')}>
              <Text style={styles.footerLink}>Arbre Gratuit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/faq')}>
              <Text style={styles.footerLink}>FAQ</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/privacy')}>
              <Text style={styles.footerLink}>Confidentialité</Text>
            </TouchableOpacity>
          </View>
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
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    padding: 20,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  hero: {
    padding: 40,
    alignItems: 'center',
  },
  badge: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    color: '#D4AF37',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 20,
  },
  h1: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    maxWidth: 700,
  },
  subtitle: {
    fontSize: 18,
    color: '#B8C5D6',
    textAlign: 'center',
    lineHeight: 28,
    maxWidth: 600,
    marginBottom: 24,
  },
  platformBadges: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 30,
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1A2A44',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  platformText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  ctaContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  ctaPrimary: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ctaPrimaryText: {
    color: '#0A1628',
    fontSize: 18,
    fontWeight: '600',
  },
  section: {
    padding: 40,
    paddingHorizontal: 20,
  },
  sectionAlt: {
    backgroundColor: '#0D1E36',
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 32,
  },
  comparisonTable: {
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A3F5A',
  },
  comparisonFeature: {
    fontSize: 16,
    color: '#B8C5D6',
  },
  comparisonCheck: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    maxWidth: 900,
    alignSelf: 'center',
  },
  featureCard: {
    backgroundColor: '#1A2A44',
    borderRadius: 16,
    padding: 24,
    width: 280,
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  featureDesc: {
    fontSize: 14,
    color: '#B8C5D6',
    textAlign: 'center',
    lineHeight: 22,
  },
  testimonialsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    maxWidth: 900,
    alignSelf: 'center',
  },
  testimonialCard: {
    backgroundColor: '#1A2A44',
    borderRadius: 16,
    padding: 24,
    width: 280,
  },
  testimonialStars: {
    fontSize: 16,
    marginBottom: 12,
  },
  testimonialText: {
    fontSize: 14,
    color: '#B8C5D6',
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  testimonialAuthor: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: '600',
  },
  faqItem: {
    backgroundColor: '#1A2A44',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4AF37',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#B8C5D6',
    lineHeight: 22,
  },
  ctaFinal: {
    alignItems: 'center',
  },
  ctaFinalText: {
    fontSize: 16,
    color: '#B8C5D6',
    textAlign: 'center',
    marginBottom: 24,
  },
  footer: {
    padding: 40,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#2A3F5A',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7C93',
    marginBottom: 16,
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 24,
  },
  footerLink: {
    fontSize: 14,
    color: '#D4AF37',
  },
});
