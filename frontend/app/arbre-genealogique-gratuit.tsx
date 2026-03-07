import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AdBanner from '@/components/AdBanner';

// SEO Component for setting page metadata
const SEOHead = () => {
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Créer un Arbre Généalogique Gratuit en Ligne | AILA Famille';
      
      // Update meta description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Créez votre arbre généalogique gratuitement avec AILA Famille. Application en ligne simple et collaborative pour visualiser votre histoire familiale. Commencez en 2 minutes !');
      }
      
      // Update canonical
      let canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.setAttribute('href', 'https://www.aila.family/arbre-genealogique-gratuit');
      }
    }
  }, []);
  
  return null;
};

export default function ArbreGenealogiquGratuit() {
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
          <Text style={styles.badge}>✨ 100% Gratuit</Text>
          <Text style={styles.h1}>Créez Votre Arbre Généalogique Gratuit en Ligne</Text>
          <Text style={styles.subtitle}>
            Avec AILA Famille, créez, visualisez et partagez votre arbre généalogique 
            en quelques minutes. Simple, gratuit et collaboratif.
          </Text>
          
          <View style={styles.ctaContainer}>
            <TouchableOpacity 
              style={styles.ctaPrimary}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={styles.ctaPrimaryText}>Créer Mon Arbre Gratuit</Text>
              <Ionicons name="arrow-forward" size={20} color="#0A1628" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.ctaSecondary}
              onPress={() => router.push('/(tabs)/tree?preview=true')}
            >
              <Text style={styles.ctaSecondaryText}>Voir une Démo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.h2}>Pourquoi Choisir AILA pour Votre Arbre Généalogique ?</Text>
          
          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🆓</Text>
              <Text style={styles.featureTitle}>Gratuit à Vie</Text>
              <Text style={styles.featureDesc}>
                Créez un arbre généalogique illimité sans payer. Pas de frais cachés.
              </Text>
            </View>
            
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>👨‍👩‍👧‍👦</Text>
              <Text style={styles.featureTitle}>Collaboratif</Text>
              <Text style={styles.featureDesc}>
                Invitez votre famille à enrichir l'arbre ensemble. Travaillez à plusieurs.
              </Text>
            </View>
            
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>📱</Text>
              <Text style={styles.featureTitle}>Multi-Plateforme</Text>
              <Text style={styles.featureDesc}>
                Accessible sur ordinateur, tablette et smartphone. Toujours synchronisé.
              </Text>
            </View>
            
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🇫🇷</Text>
              <Text style={styles.featureTitle}>100% Français</Text>
              <Text style={styles.featureDesc}>
                Interface en français, support français, données hébergées en Europe.
              </Text>
            </View>
            
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🔒</Text>
              <Text style={styles.featureTitle}>Sécurisé</Text>
              <Text style={styles.featureDesc}>
                Vos données sont cryptées et protégées. Conforme RGPD.
              </Text>
            </View>
            
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>💾</Text>
              <Text style={styles.featureTitle}>Export GEDCOM</Text>
              <Text style={styles.featureDesc}>
                Exportez votre arbre au format standard compatible avec tous les logiciels.
              </Text>
            </View>
          </View>
        </View>

        {/* How It Works */}
        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.h2}>Comment Créer Votre Arbre Généalogique en 3 Étapes</Text>
          
          <View style={styles.stepsContainer}>
            <View style={styles.step}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepTitle}>Inscrivez-vous Gratuitement</Text>
              <Text style={styles.stepDesc}>
                Créez votre compte AILA en 30 secondes avec votre email ou Google.
              </Text>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepTitle}>Ajoutez Vos Proches</Text>
              <Text style={styles.stepDesc}>
                Commencez par vous, puis ajoutez parents, grands-parents, enfants...
              </Text>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.stepTitle}>Partagez avec la Famille</Text>
              <Text style={styles.stepDesc}>
                Invitez vos proches à rejoindre l'arbre et à le compléter ensemble.
              </Text>
            </View>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.h2}>Questions Fréquentes sur les Arbres Généalogiques</Text>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Qu'est-ce qu'un arbre généalogique ?</Text>
            <Text style={styles.faqAnswer}>
              Un arbre généalogique est une représentation visuelle de votre famille montrant 
              les liens entre les générations : parents, grands-parents, arrière-grands-parents, 
              enfants, cousins, etc. C'est un outil précieux pour préserver votre histoire familiale.
            </Text>
          </View>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Comment faire un arbre généalogique gratuitement ?</Text>
            <Text style={styles.faqAnswer}>
              Avec AILA Famille, créez votre arbre généalogique gratuitement en ligne. 
              Inscrivez-vous, ajoutez vos premiers membres de famille, et l'arbre se construit 
              automatiquement. Aucun téléchargement ni paiement requis.
            </Text>
          </View>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Combien de personnes puis-je ajouter ?</Text>
            <Text style={styles.faqAnswer}>
              Avec la version gratuite d'AILA, ajoutez autant de membres que vous voulez. 
              Il n'y a pas de limite sur le nombre de personnes dans votre arbre généalogique.
            </Text>
          </View>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Puis-je partager mon arbre avec ma famille ?</Text>
            <Text style={styles.faqAnswer}>
              Oui ! AILA est conçu pour la collaboration familiale. Invitez vos proches par 
              email ou lien de partage. Ils pourront voir et enrichir l'arbre avec vous.
            </Text>
          </View>
        </View>

        {/* CTA Final */}
        <View style={[styles.section, styles.ctaFinal]}>
          <Text style={styles.h2}>Prêt à Créer Votre Arbre Généalogique ?</Text>
          <Text style={styles.ctaFinalText}>
            Rejoignez des milliers de familles qui utilisent AILA pour préserver leur histoire.
          </Text>
          
          <TouchableOpacity 
            style={styles.ctaPrimary}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.ctaPrimaryText}>Commencer Gratuitement</Text>
            <Ionicons name="arrow-forward" size={20} color="#0A1628" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2024 AILA Famille - Application de généalogie gratuite
          </Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => router.push('/about')}>
              <Text style={styles.footerLink}>À propos</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/faq')}>
              <Text style={styles.footerLink}>FAQ</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/privacy')}>
              <Text style={styles.footerLink}>Confidentialité</Text>
            </TouchableOpacity>
          </View>
        </View>
        <AdBanner />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    textAlign: 'center',
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
    marginBottom: 30,
  },
  ctaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
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
  ctaSecondary: {
    borderWidth: 2,
    borderColor: '#D4AF37',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  ctaSecondaryText: {
    color: '#D4AF37',
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
  featureIcon: {
    fontSize: 40,
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  featureDesc: {
    fontSize: 14,
    color: '#B8C5D6',
    textAlign: 'center',
    lineHeight: 22,
  },
  stepsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 32,
    maxWidth: 900,
    alignSelf: 'center',
  },
  step: {
    alignItems: 'center',
    width: 250,
  },
  stepNumber: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumberText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0A1628',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepDesc: {
    fontSize: 14,
    color: '#B8C5D6',
    textAlign: 'center',
    lineHeight: 22,
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
    backgroundColor: '#0D1E36',
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
