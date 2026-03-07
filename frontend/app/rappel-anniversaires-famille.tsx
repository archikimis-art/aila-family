import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AdBanner from '@/components/AdBanner';

const SEOHead = () => {
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Ne Plus Jamais Oublier un Anniversaire Familial | AILA Rappels';
      
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Oubliez les anniversaires de famille ? AILA vous rappelle automatiquement tous les anniversaires de vos proches. Application gratuite de calendrier familial avec notifications.');
      }
      
      let canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.setAttribute('href', 'https://www.aila.family/rappel-anniversaires-famille');
      }
    }
  }, []);
  return null;
};

export default function RappelAnniversaires() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <SEOHead />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#D4AF37" />
          </TouchableOpacity>
          <Text style={styles.logoText}>🌳 AILA</Text>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.badge}>🎂 Fonctionnalité Gratuite</Text>
          <Text style={styles.h1}>Ne Plus Jamais Oublier un Anniversaire</Text>
          <Text style={styles.subtitle}>
            Fini la culpabilité d'avoir oublié l'anniversaire de Tonton Michel ! 
            AILA vous rappelle automatiquement tous les anniversaires de votre famille.
          </Text>
          
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.ctaButtonText}>Activer les Rappels Gratuits</Text>
            <Ionicons name="notifications" size={20} color="#0A1628" />
          </TouchableOpacity>
        </View>

        {/* Le problème */}
        <View style={styles.section}>
          <Text style={styles.h2}>😰 On est tous passés par là...</Text>
          
          <View style={styles.problemGrid}>
            <View style={styles.problemCard}>
              <Text style={styles.problemEmoji}>📱</Text>
              <Text style={styles.problemText}>"C'était l'anniversaire de mamie hier... j'ai complètement oublié"</Text>
            </View>
            
            <View style={styles.problemCard}>
              <Text style={styles.problemEmoji}>🤦</Text>
              <Text style={styles.problemText}>"Je confonds toujours les dates de mes neveux"</Text>
            </View>
            
            <View style={styles.problemCard}>
              <Text style={styles.problemEmoji}>📅</Text>
              <Text style={styles.problemText}>"J'ai 50 personnes dans ma famille, impossible de tout retenir"</Text>
            </View>
            
            <View style={styles.problemCard}>
              <Text style={styles.problemEmoji}>💔</Text>
              <Text style={styles.problemText}>"Ma cousine était vexée que j'aie oublié ses 30 ans"</Text>
            </View>
          </View>
        </View>

        {/* La solution */}
        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.h2}>✨ La Solution AILA</Text>
          
          <View style={styles.solutionCard}>
            <View style={styles.solutionIcon}>
              <Ionicons name="calendar" size={40} color="#D4AF37" />
            </View>
            <Text style={styles.solutionTitle}>Calendrier Familial Automatique</Text>
            <Text style={styles.solutionText}>
              Dès que vous ajoutez une date de naissance dans votre arbre généalogique, 
              elle est automatiquement ajoutée au calendrier familial.
            </Text>
          </View>
          
          <View style={styles.solutionCard}>
            <View style={styles.solutionIcon}>
              <Ionicons name="notifications" size={40} color="#D4AF37" />
            </View>
            <Text style={styles.solutionTitle}>Notifications Intelligentes</Text>
            <Text style={styles.solutionText}>
              Recevez un rappel 7 jours avant (pour préparer le cadeau), 1 jour avant, 
              et le jour J. Personnalisez selon vos préférences.
            </Text>
          </View>
          
          <View style={styles.solutionCard}>
            <View style={styles.solutionIcon}>
              <Ionicons name="people" size={40} color="#D4AF37" />
            </View>
            <Text style={styles.solutionTitle}>Partagé avec la Famille</Text>
            <Text style={styles.solutionText}>
              Tous les membres de la famille connectés reçoivent les rappels. 
              Plus d'excuse pour personne !
            </Text>
          </View>
        </View>

        {/* Fonctionnalités */}
        <View style={styles.section}>
          <Text style={styles.h2}>🎁 Fonctionnalités du Rappel d'Anniversaires</Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <Text style={styles.featureText}>Rappels automatiques 7j, 1j et jour J</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <Text style={styles.featureText}>Notifications push sur mobile</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <Text style={styles.featureText}>Email de rappel hebdomadaire</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <Text style={styles.featureText}>Vue calendrier mensuelle</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <Text style={styles.featureText}>Calcul automatique de l'âge</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <Text style={styles.featureText}>Export vers Google Calendar / iCal</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <Text style={styles.featureText}>Rappels personnalisables par personne</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <Text style={styles.featureText}>Liste des anniversaires à venir</Text>
            </View>
          </View>
        </View>

        {/* Comment ça marche */}
        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.h2}>📲 Comment Ça Marche ?</Text>
          
          <View style={styles.stepsContainer}>
            <View style={styles.step}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepTitle}>Créez votre arbre</Text>
              <Text style={styles.stepDesc}>Ajoutez les membres de votre famille avec leurs dates de naissance</Text>
            </View>
            
            <View style={styles.stepArrow}>
              <Ionicons name="arrow-forward" size={24} color="#D4AF37" />
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepTitle}>Activez les rappels</Text>
              <Text style={styles.stepDesc}>Choisissez vos préférences de notification</Text>
            </View>
            
            <View style={styles.stepArrow}>
              <Ionicons name="arrow-forward" size={24} color="#D4AF37" />
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.stepTitle}>Ne ratez plus rien !</Text>
              <Text style={styles.stepDesc}>Recevez vos rappels et fêtez tous les anniversaires</Text>
            </View>
          </View>
        </View>

        {/* Statistiques */}
        <View style={styles.section}>
          <Text style={styles.h2}>📊 Pourquoi C'est Important</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>62%</Text>
              <Text style={styles.statLabel}>des gens oublient au moins un anniversaire familial par an</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>3x</Text>
              <Text style={styles.statLabel}>plus de chance de maintenir des liens familiaux forts</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>15+</Text>
              <Text style={styles.statLabel}>anniversaires en moyenne dans une famille française</Text>
            </View>
          </View>
        </View>

        {/* Témoignages */}
        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.h2}>💬 Ce Qu'en Disent Nos Utilisateurs</Text>
          
          <View style={styles.testimonialCard}>
            <Text style={styles.testimonialStars}>⭐⭐⭐⭐⭐</Text>
            <Text style={styles.testimonialText}>
              "Depuis que j'utilise AILA, je n'ai plus oublié un seul anniversaire ! 
              Ma grand-mère était si contente que je l'appelle pile le bon jour."
            </Text>
            <Text style={styles.testimonialAuthor}>— Camille, 34 ans</Text>
          </View>
          
          <View style={styles.testimonialCard}>
            <Text style={styles.testimonialStars}>⭐⭐⭐⭐⭐</Text>
            <Text style={styles.testimonialText}>
              "Avec mes 8 frères et sœurs et tous leurs enfants, c'était impossible 
              de tout retenir. AILA a changé ma vie !"
            </Text>
            <Text style={styles.testimonialAuthor}>— Philippe, 52 ans</Text>
          </View>
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <Text style={styles.h2}>❓ Questions Fréquentes</Text>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Les rappels sont-ils vraiment gratuits ?</Text>
            <Text style={styles.faqAnswer}>
              Oui ! Les rappels d'anniversaires sont inclus gratuitement dans AILA. 
              Pas de version premium nécessaire pour cette fonctionnalité.
            </Text>
          </View>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Puis-je personnaliser quand recevoir les rappels ?</Text>
            <Text style={styles.faqAnswer}>
              Absolument. Vous pouvez choisir de recevoir les rappels 7 jours, 3 jours, 
              1 jour avant, ou uniquement le jour même. Pour chaque personne différemment.
            </Text>
          </View>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Et si je ne veux pas de rappels pour certaines personnes ?</Text>
            <Text style={styles.faqAnswer}>
              Vous pouvez désactiver les rappels pour des personnes spécifiques tout en 
              gardant leur date de naissance dans l'arbre.
            </Text>
          </View>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Les autres membres de ma famille reçoivent aussi les rappels ?</Text>
            <Text style={styles.faqAnswer}>
              Oui, si vous avez partagé votre arbre avec eux et qu'ils ont activé les 
              notifications. Chacun gère ses propres préférences.
            </Text>
          </View>
        </View>

        {/* CTA Final */}
        <View style={[styles.section, styles.ctaSection]}>
          <Text style={styles.ctaTitle}>🎂 Plus Jamais d'Oubli !</Text>
          <Text style={styles.ctaText}>
            Créez votre arbre généalogique et activez les rappels d'anniversaires. 
            Gratuit, simple, et votre famille vous remerciera !
          </Text>
          
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.ctaButtonText}>Commencer Maintenant</Text>
            <Ionicons name="arrow-forward" size={20} color="#0A1628" />
          </TouchableOpacity>
          
          <View style={styles.guarantees}>
            <Text style={styles.guaranteeItem}>✓ 100% Gratuit</Text>
            <Text style={styles.guaranteeItem}>✓ Sans publicité</Text>
            <Text style={styles.guaranteeItem}>✓ Inscription en 30 sec</Text>
          </View>
        </View>

        <AdBanner />
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 AILA Famille</Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => router.push('/arbre-genealogique-gratuit')}>
              <Text style={styles.footerLink}>Arbre Gratuit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/questions-grands-parents')}>
              <Text style={styles.footerLink}>Questions Grands-Parents</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/arbre-genealogique-famille-recomposee')}>
              <Text style={styles.footerLink}>Famille Recomposée</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  hero: { padding: 40, paddingTop: 20, alignItems: 'center' },
  badge: { backgroundColor: 'rgba(212, 175, 55, 0.2)', color: '#D4AF37', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, fontSize: 14, fontWeight: '600', marginBottom: 20 },
  h1: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 16, maxWidth: 700 },
  subtitle: { fontSize: 18, color: '#B8C5D6', textAlign: 'center', lineHeight: 28, maxWidth: 600, marginBottom: 30 },
  ctaButton: { backgroundColor: '#D4AF37', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  ctaButtonText: { color: '#0A1628', fontSize: 18, fontWeight: '600' },
  section: { padding: 24 },
  sectionAlt: { backgroundColor: '#0D1E36' },
  h2: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 24, textAlign: 'center' },
  problemGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  problemCard: { backgroundColor: '#1A2A44', borderRadius: 16, padding: 20, width: 280, alignItems: 'center' },
  problemEmoji: { fontSize: 40, marginBottom: 12 },
  problemText: { fontSize: 14, color: '#B8C5D6', textAlign: 'center', fontStyle: 'italic', lineHeight: 22 },
  solutionCard: { backgroundColor: '#1A2A44', borderRadius: 16, padding: 24, marginBottom: 16, alignItems: 'center', maxWidth: 500, alignSelf: 'center', width: '100%' },
  solutionIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(212, 175, 55, 0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  solutionTitle: { fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginBottom: 8, textAlign: 'center' },
  solutionText: { fontSize: 14, color: '#B8C5D6', textAlign: 'center', lineHeight: 22 },
  featuresList: { maxWidth: 500, alignSelf: 'center', width: '100%' },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, backgroundColor: '#1A2A44', padding: 16, borderRadius: 12 },
  featureText: { fontSize: 15, color: '#FFFFFF', flex: 1 },
  stepsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 16 },
  step: { alignItems: 'center', width: 200 },
  stepNumber: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#D4AF37', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  stepNumberText: { fontSize: 20, fontWeight: 'bold', color: '#0A1628' },
  stepTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 4, textAlign: 'center' },
  stepDesc: { fontSize: 13, color: '#B8C5D6', textAlign: 'center', lineHeight: 20 },
  stepArrow: { display: 'none' }, // Hidden on mobile, could be shown on desktop
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 20 },
  statCard: { backgroundColor: '#1A2A44', borderRadius: 16, padding: 24, width: 200, alignItems: 'center' },
  statNumber: { fontSize: 36, fontWeight: 'bold', color: '#D4AF37', marginBottom: 8 },
  statLabel: { fontSize: 13, color: '#B8C5D6', textAlign: 'center', lineHeight: 20 },
  testimonialCard: { backgroundColor: '#1A2A44', borderRadius: 16, padding: 24, marginBottom: 16, maxWidth: 600, alignSelf: 'center', width: '100%' },
  testimonialStars: { fontSize: 16, marginBottom: 12 },
  testimonialText: { fontSize: 15, color: '#B8C5D6', lineHeight: 24, fontStyle: 'italic', marginBottom: 12 },
  testimonialAuthor: { fontSize: 14, color: '#D4AF37', fontWeight: '600' },
  faqItem: { backgroundColor: '#1A2A44', borderRadius: 12, padding: 20, marginBottom: 16, maxWidth: 700, alignSelf: 'center', width: '100%' },
  faqQuestion: { fontSize: 16, fontWeight: '600', color: '#D4AF37', marginBottom: 8 },
  faqAnswer: { fontSize: 14, color: '#B8C5D6', lineHeight: 22 },
  ctaSection: { alignItems: 'center', paddingVertical: 48 },
  ctaTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 12 },
  ctaText: { fontSize: 16, color: '#B8C5D6', textAlign: 'center', lineHeight: 24, maxWidth: 500, marginBottom: 24 },
  guarantees: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16, marginTop: 24 },
  guaranteeItem: { fontSize: 14, color: '#4CAF50' },
  footer: { padding: 40, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#2A3F5A' },
  footerText: { fontSize: 14, color: '#6B7C93', marginBottom: 16 },
  footerLinks: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 24 },
  footerLink: { fontSize: 14, color: '#D4AF37' },
});
