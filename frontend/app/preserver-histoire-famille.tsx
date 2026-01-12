import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SEOFooter } from '@/components/SEOFooter';

const SEOHead = () => {
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Comment Préserver l\'Histoire de sa Famille : Guide Complet | AILA';
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Apprenez à préserver l\'histoire de votre famille pour les générations futures. Numérisation, interviews, arbre généalogique, conservation des photos. Guide pratique.');
      }
    }
  }, []);
  return null;
};

export default function PreserverHistoire() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <SEOHead />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#D4AF37" />
          </TouchableOpacity>
          <Text style={styles.logoText}>🌳 AILA</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.badge}>📚 Héritage Familial</Text>
          <Text style={styles.h1}>Préserver l'Histoire de sa Famille</Text>
          <Text style={styles.subtitle}>
            Chaque famille a une histoire unique qui mérite d'être préservée. 
            Voici comment immortaliser la vôtre pour les générations futures.
          </Text>
        </View>

        <View style={styles.featuredSnippet}>
          <Text style={styles.featuredTitle}>💡 Les 5 piliers de la préservation</Text>
          <Text style={styles.featuredText}>
            1. Numériser photos et documents anciens\n
            2. Enregistrer les témoignages des aînés\n
            3. Créer et maintenir un arbre généalogique\n
            4. Documenter les traditions familiales\n
            5. Partager avec toute la famille
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>📸 Numériser les Photos et Documents</Text>
          <Text style={styles.paragraph}>
            Les photos papier se détériorent avec le temps. La numérisation est la première étape 
            pour préserver ces trésors.
          </Text>
          
          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>🎯 Conseil pratique</Text>
            <Text style={styles.tipText}>
              Utilisez un scanner ou une application comme Google PhotoScan. 
              Résolution minimale : 300 DPI. N'oubliez pas de noter au dos les noms et dates !
            </Text>
          </View>

          <View style={styles.checkList}>
            <Text style={styles.checkTitle}>Documents à numériser en priorité :</Text>
            <Text style={styles.checkItem}>✅ Photos de famille anciennes</Text>
            <Text style={styles.checkItem}>✅ Livrets de famille</Text>
            <Text style={styles.checkItem}>✅ Lettres et correspondances</Text>
            <Text style={styles.checkItem}>✅ Actes officiels (naissances, mariages)</Text>
            <Text style={styles.checkItem}>✅ Diplômes et certificats</Text>
            <Text style={styles.checkItem}>✅ Articles de journaux mentionnant la famille</Text>
          </View>
        </View>

        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.h2}>🎤 Enregistrer les Témoignages</Text>
          <Text style={styles.paragraph}>
            Les histoires orales sont fragiles. Quand nos aînés disparaissent, 
            leurs souvenirs partent avec eux. Enregistrez-les maintenant.
          </Text>
          
          <View style={styles.methodCard}>
            <Text style={styles.methodTitle}>📹 Interview vidéo</Text>
            <Text style={styles.methodDesc}>
              Idéale pour capturer expressions et émotions. Un simple smartphone suffit.
            </Text>
          </View>
          
          <View style={styles.methodCard}>
            <Text style={styles.methodTitle}>🎙️ Enregistrement audio</Text>
            <Text style={styles.methodDesc}>
              Moins intimidant pour certaines personnes. Facile à transcrire ensuite.
            </Text>
          </View>
          
          <View style={styles.methodCard}>
            <Text style={styles.methodTitle}>✍️ Récit écrit</Text>
            <Text style={styles.methodDesc}>
              Demandez à vos aînés d'écrire leurs souvenirs ou transcrivez leurs histoires.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>🌳 Créer un Arbre Généalogique</Text>
          <Text style={styles.paragraph}>
            L'arbre généalogique est le cœur de la préservation familiale. 
            Il relie toutes les informations et crée une vue d'ensemble de votre histoire.
          </Text>
          
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <Text style={styles.benefitText}>Visualise les liens familiaux</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <Text style={styles.benefitText}>Centralise toutes les informations</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <Text style={styles.benefitText}>Se partage facilement</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <Text style={styles.benefitText}>Se transmet aux générations futures</Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.h2}>📝 Documenter les Traditions</Text>
          <Text style={styles.paragraph}>
            Les recettes de grand-mère, les chansons familiales, les rituels... 
            Tout cela mérite d'être écrit et préservé.
          </Text>
          
          <View style={styles.ideaCard}>
            <Text style={styles.ideaTitle}>💡 Idées de documentation :</Text>
            <Text style={styles.ideaItem}>• Livre de recettes familiales</Text>
            <Text style={styles.ideaItem}>• Calendrier des traditions annuelles</Text>
            <Text style={styles.ideaItem}>• Album des fêtes de famille</Text>
            <Text style={styles.ideaItem}>• Glossaire des expressions familiales</Text>
            <Text style={styles.ideaItem}>• Histoire des objets de famille</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>👨‍👩‍👧‍👦 Partager avec la Famille</Text>
          <Text style={styles.paragraph}>
            Une histoire familiale n'a de valeur que si elle est partagée. 
            Impliquez toute la famille dans ce projet de préservation.
          </Text>
          
          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>⚠️ Important</Text>
            <Text style={styles.warningText}>
              Faites des copies multiples de vos archives numériques ! 
              Disque dur externe + cloud + clé USB chez un proche.
            </Text>
          </View>
        </View>

        <View style={[styles.section, styles.ctaSection]}>
          <Text style={styles.ctaTitle}>🌳 Commencez Dès Aujourd'hui</Text>
          <Text style={styles.ctaText}>
            Créez votre arbre généalogique familial avec AILA et commencez 
            à préserver votre histoire. Gratuit et collaboratif.
          </Text>
          <TouchableOpacity style={styles.ctaButton} onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.ctaButtonText}>Créer Mon Arbre Gratuit</Text>
            <Ionicons name="arrow-forward" size={20} color="#0A1628" />
          </TouchableOpacity>
        </View>

        {/* SEO Footer */}
        <SEOFooter currentPage="/preserver-histoire-famille" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1628' },
  scrollContent: { paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 16 },
  backButton: { padding: 4 },
  logoText: { fontSize: 20, fontWeight: 'bold', color: '#D4AF37' },
  hero: { padding: 24 },
  badge: { backgroundColor: 'rgba(156, 39, 176, 0.2)', color: '#CE93D8', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, fontSize: 12, fontWeight: '600', alignSelf: 'flex-start', marginBottom: 16 },
  h1: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 16, lineHeight: 36 },
  subtitle: { fontSize: 16, color: '#B8C5D6', lineHeight: 26 },
  featuredSnippet: { backgroundColor: '#0D4F3C', margin: 20, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#4CAF50' },
  featuredTitle: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50', marginBottom: 12 },
  featuredText: { fontSize: 14, color: '#FFFFFF', lineHeight: 24 },
  section: { padding: 24 },
  sectionAlt: { backgroundColor: '#0D1E36' },
  h2: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 16 },
  paragraph: { fontSize: 15, color: '#B8C5D6', lineHeight: 26, marginBottom: 16 },
  tipBox: { backgroundColor: 'rgba(212, 175, 55, 0.1)', borderRadius: 12, padding: 16, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#D4AF37' },
  tipTitle: { fontSize: 14, fontWeight: 'bold', color: '#D4AF37', marginBottom: 8 },
  tipText: { fontSize: 14, color: '#B8C5D6', lineHeight: 22 },
  checkList: { backgroundColor: '#1A2A44', borderRadius: 12, padding: 16 },
  checkTitle: { fontSize: 15, fontWeight: '600', color: '#FFFFFF', marginBottom: 12 },
  checkItem: { fontSize: 14, color: '#B8C5D6', marginBottom: 8 },
  methodCard: { backgroundColor: '#1A2A44', borderRadius: 12, padding: 16, marginBottom: 12 },
  methodTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 },
  methodDesc: { fontSize: 14, color: '#B8C5D6' },
  benefitsList: { marginTop: 16 },
  benefitItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  benefitText: { fontSize: 15, color: '#B8C5D6' },
  ideaCard: { backgroundColor: '#1A2A44', borderRadius: 12, padding: 20 },
  ideaTitle: { fontSize: 16, fontWeight: '600', color: '#D4AF37', marginBottom: 12 },
  ideaItem: { fontSize: 14, color: '#B8C5D6', marginBottom: 6 },
  warningBox: { backgroundColor: 'rgba(255, 152, 0, 0.1)', borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: '#FF9800' },
  warningTitle: { fontSize: 14, fontWeight: 'bold', color: '#FF9800', marginBottom: 8 },
  warningText: { fontSize: 14, color: '#B8C5D6', lineHeight: 22 },
  ctaSection: { alignItems: 'center', paddingVertical: 48, backgroundColor: '#0D1E36' },
  ctaTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12 },
  ctaText: { fontSize: 16, color: '#B8C5D6', textAlign: 'center', marginBottom: 24, maxWidth: 400 },
  ctaButton: { backgroundColor: '#D4AF37', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  ctaButtonText: { color: '#0A1628', fontSize: 18, fontWeight: '600' },
  footer: { padding: 40, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#2A3F5A' },
  footerText: { fontSize: 14, color: '#6B7C93' },
});