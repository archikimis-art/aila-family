import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SEOFooter } from '@/components/SEOFooter';
import { SEOBreadcrumbs, BREADCRUMB_CONFIGS } from '@/components/SEOBreadcrumbs';
import { RelatedArticles } from '@/components/RelatedArticles';

const SEOHead = () => {
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Comment Écrire l\'Histoire de sa Famille : Guide Pratique | AILA';
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Apprenez à écrire l\'histoire de votre famille étape par étape. Guide complet : recherches, structure, rédaction. Créez un livre familial mémorable.');
      }
    }
  }, []);
  return null;
};

export default function EcrireHistoire() {
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
          <Text style={styles.badge}>✍️ Héritage Familial</Text>
          <Text style={styles.h1}>Comment Écrire l'Histoire de sa Famille</Text>
          <Text style={styles.subtitle}>
            Transformer vos recherches généalogiques en un récit captivant 
            que les générations futures liront avec émotion.
          </Text>
        </View>

        <View style={styles.featuredSnippet}>
          <Text style={styles.featuredTitle}>📝 Les 5 étapes pour écrire votre histoire familiale</Text>
          <Text style={styles.featuredText}>
            1. Rassemblez toutes vos recherches et sources\n
            2. Définissez la structure de votre récit\n
            3. Commencez par ce qui vous touche le plus\n
            4. Ajoutez contexte historique et anecdotes\n
            5. Illustrez avec photos et documents
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>📚 Pourquoi Écrire l'Histoire de sa Famille ?</Text>
          <Text style={styles.paragraph}>
            Un arbre généalogique montre les liens. Un récit familial donne vie à ces liens. 
            Il transforme des noms et des dates en véritables personnages.
          </Text>
          
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Ionicons name="heart" size={20} color="#D4AF37" />
              <Text style={styles.benefitText}>Préserver la mémoire des ancêtres</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="people" size={20} color="#D4AF37" />
              <Text style={styles.benefitText}>Transmettre aux générations futures</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="book" size={20} color="#D4AF37" />
              <Text style={styles.benefitText}>Donner du sens à vos recherches</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="gift" size={20} color="#D4AF37" />
              <Text style={styles.benefitText}>Créer un héritage unique</Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.h2}>🗂️ Étape 1 : Rassemblez vos Matériaux</Text>
          <Text style={styles.paragraph}>
            Avant d'écrire, organisez tout ce que vous avez collecté durant vos recherches.
          </Text>
          
          <View style={styles.checkList}>
            <Text style={styles.checkItem}>📋 Votre arbre généalogique complet</Text>
            <Text style={styles.checkItem}>📸 Photos anciennes et récentes</Text>
            <Text style={styles.checkItem}>📜 Documents officiels (actes, certificats)</Text>
            <Text style={styles.checkItem}>🎤 Enregistrements d'interviews</Text>
            <Text style={styles.checkItem}>📝 Notes et anecdotes recueillies</Text>
            <Text style={styles.checkItem}>🗞️ Articles de journaux, coupures</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>📖 Étape 2 : Choisissez votre Structure</Text>
          
          <View style={styles.structureCard}>
            <Text style={styles.structureTitle}>Option 1 : Chronologique</Text>
            <Text style={styles.structureDesc}>
              Des ancêtres les plus anciens jusqu'à aujourd'hui. 
              Idéal pour montrer l'évolution de la famille.
            </Text>
          </View>
          
          <View style={styles.structureCard}>
            <Text style={styles.structureTitle}>Option 2 : Par branches</Text>
            <Text style={styles.structureDesc}>
              Une partie pour chaque branche familiale (maternelle, paternelle...). 
              Permet d'approfondir chaque lignée.
            </Text>
          </View>
          
          <View style={styles.structureCard}>
            <Text style={styles.structureTitle}>Option 3 : Thématique</Text>
            <Text style={styles.structureDesc}>
              Par thèmes : les métiers, les migrations, les guerres... 
              Original et captivant.
            </Text>
          </View>
          
          <View style={styles.structureCard}>
            <Text style={styles.structureTitle}>Option 4 : Portrait</Text>
            <Text style={styles.structureDesc}>
              Focus sur un ou quelques ancêtres marquants. 
              Parfait si vous avez une histoire exceptionnelle.
            </Text>
          </View>
        </View>

        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.h2}>✏️ Étape 3 : Conseils de Rédaction</Text>
          
          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>🎯 Écrivez pour être lu</Text>
            <Text style={styles.tipText}>
              Ce n'est pas un rapport académique. Racontez une histoire. 
              Utilisez des anecdotes, du suspense, de l'émotion.
            </Text>
          </View>
          
          <View style={styles.adviceList}>
            <Text style={styles.adviceItem}>📌 Commencez par un chapitre qui vous passionne</Text>
            <Text style={styles.adviceItem}>📌 Alternez faits et anecdotes</Text>
            <Text style={styles.adviceItem}>📌 Placez vos ancêtres dans leur contexte historique</Text>
            <Text style={styles.adviceItem}>📌 Incluez des dialogues imaginés mais plausibles</Text>
            <Text style={styles.adviceItem}>📌 Posez des questions : "Qu'a-t-il ressenti quand..."</Text>
            <Text style={styles.adviceItem}>📌 Reliez le passé au présent</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>🖼️ Étape 4 : Illustrer votre Récit</Text>
          <Text style={styles.paragraph}>
            Les images valent mille mots. Intégrez-les généreusement dans votre histoire.
          </Text>
          
          <View style={styles.imageTypes}>
            <View style={styles.imageType}>
              <Text style={styles.imageTypeIcon}>📷</Text>
              <Text style={styles.imageTypeTitle}>Photos de famille</Text>
              <Text style={styles.imageTypeDesc}>Portraits, groupes, lieux</Text>
            </View>
            <View style={styles.imageType}>
              <Text style={styles.imageTypeIcon}>📜</Text>
              <Text style={styles.imageTypeTitle}>Documents</Text>
              <Text style={styles.imageTypeDesc}>Actes, lettres, certificats</Text>
            </View>
            <View style={styles.imageType}>
              <Text style={styles.imageTypeIcon}>🗺️</Text>
              <Text style={styles.imageTypeTitle}>Cartes</Text>
              <Text style={styles.imageTypeDesc}>Lieux de vie, migrations</Text>
            </View>
            <View style={styles.imageType}>
              <Text style={styles.imageTypeIcon}>🌳</Text>
              <Text style={styles.imageTypeTitle}>Arbres</Text>
              <Text style={styles.imageTypeDesc}>Schémas de parenté</Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.h2}>📕 Étape 5 : Formats de Publication</Text>
          
          <View style={styles.formatCard}>
            <Text style={styles.formatTitle}>🖨️ Livre imprimé</Text>
            <Text style={styles.formatDesc}>
              Le plus traditionnel et prestigieux. Services d'impression à la demande 
              comme Blurb ou Amazon KDP.
            </Text>
          </View>
          
          <View style={styles.formatCard}>
            <Text style={styles.formatTitle}>📱 E-book</Text>
            <Text style={styles.formatDesc}>
              Facile à partager et à mettre à jour. Format PDF ou EPUB.
            </Text>
          </View>
          
          <View style={styles.formatCard}>
            <Text style={styles.formatTitle}>🌐 Site web familial</Text>
            <Text style={styles.formatDesc}>
              Accessible à tous, peut être enrichi continuellement. 
              Peut inclure vidéos et audio.
            </Text>
          </View>
        </View>

        <View style={[styles.section, styles.ctaSection]}>
          <Text style={styles.ctaTitle}>🌳 Commencez par votre Arbre</Text>
          <Text style={styles.ctaText}>
            Avant d'écrire, organisez vos informations dans un arbre généalogique. 
            AILA vous aide à structurer votre histoire familiale.
          </Text>
          <TouchableOpacity style={styles.ctaButton} onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.ctaButtonText}>Créer Mon Arbre Gratuit</Text>
            <Ionicons name="arrow-forward" size={20} color="#0A1628" />
          </TouchableOpacity>
        </View>

        {/* SEO Footer */}
        <SEOFooter currentPage="/ecrire-histoire-famille" />
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
  badge: { backgroundColor: 'rgba(33, 150, 243, 0.2)', color: '#90CAF9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, fontSize: 12, fontWeight: '600', alignSelf: 'flex-start', marginBottom: 16 },
  h1: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 16, lineHeight: 36 },
  subtitle: { fontSize: 16, color: '#B8C5D6', lineHeight: 26 },
  featuredSnippet: { backgroundColor: '#0D4F3C', margin: 20, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#4CAF50' },
  featuredTitle: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50', marginBottom: 12 },
  featuredText: { fontSize: 14, color: '#FFFFFF', lineHeight: 24 },
  section: { padding: 24 },
  sectionAlt: { backgroundColor: '#0D1E36' },
  h2: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 16 },
  paragraph: { fontSize: 15, color: '#B8C5D6', lineHeight: 26, marginBottom: 16 },
  benefitsList: { marginTop: 16 },
  benefitItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  benefitText: { fontSize: 15, color: '#B8C5D6' },
  checkList: { backgroundColor: '#1A2A44', borderRadius: 12, padding: 16 },
  checkItem: { fontSize: 14, color: '#B8C5D6', marginBottom: 10 },
  structureCard: { backgroundColor: '#1A2A44', borderRadius: 12, padding: 16, marginBottom: 12 },
  structureTitle: { fontSize: 16, fontWeight: '600', color: '#D4AF37', marginBottom: 4 },
  structureDesc: { fontSize: 14, color: '#B8C5D6', lineHeight: 22 },
  tipBox: { backgroundColor: 'rgba(212, 175, 55, 0.1)', borderRadius: 12, padding: 16, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#D4AF37' },
  tipTitle: { fontSize: 14, fontWeight: 'bold', color: '#D4AF37', marginBottom: 8 },
  tipText: { fontSize: 14, color: '#B8C5D6', lineHeight: 22 },
  adviceList: { backgroundColor: '#1A2A44', borderRadius: 12, padding: 16 },
  adviceItem: { fontSize: 14, color: '#B8C5D6', marginBottom: 10, lineHeight: 22 },
  imageTypes: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  imageType: { backgroundColor: '#1A2A44', borderRadius: 12, padding: 16, alignItems: 'center', width: 140 },
  imageTypeIcon: { fontSize: 28, marginBottom: 8 },
  imageTypeTitle: { fontSize: 14, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 },
  imageTypeDesc: { fontSize: 12, color: '#6B7C93', textAlign: 'center' },
  formatCard: { backgroundColor: '#1A2A44', borderRadius: 12, padding: 16, marginBottom: 12 },
  formatTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 },
  formatDesc: { fontSize: 14, color: '#B8C5D6', lineHeight: 22 },
  ctaSection: { alignItems: 'center', paddingVertical: 48 },
  ctaTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12 },
  ctaText: { fontSize: 16, color: '#B8C5D6', textAlign: 'center', marginBottom: 24, maxWidth: 400 },
  ctaButton: { backgroundColor: '#D4AF37', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  ctaButtonText: { color: '#0A1628', fontSize: 18, fontWeight: '600' },
  footer: { padding: 40, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#2A3F5A' },
  footerText: { fontSize: 14, color: '#6B7C93' },
});