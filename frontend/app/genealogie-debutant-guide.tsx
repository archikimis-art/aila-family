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
      document.title = 'Généalogie pour Débutant : Par Où Commencer ? Guide 2025 | AILA';
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Vous débutez en généalogie ? Découvrez par où commencer vos recherches. Guide complet pour débutants : méthode, outils gratuits, conseils d\'experts. Créez votre arbre familial facilement.');
      }
    }
  }, []);
  return null;
};

export default function GenealogieDebutant() {
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
          <Text style={styles.badge}>🎓 Guide Débutant • 2025</Text>
          <Text style={styles.h1}>Généalogie pour Débutant : Par Où Commencer ?</Text>
          <Text style={styles.subtitle}>
            Vous voulez découvrir l'histoire de votre famille mais ne savez pas par où commencer ? 
            Ce guide vous accompagne pas à pas dans vos premières recherches généalogiques.
          </Text>
        </View>

        <View style={styles.featuredSnippet}>
          <Text style={styles.featuredTitle}>💡 En bref : Par où commencer la généalogie ?</Text>
          <Text style={styles.featuredText}>
            1. Interrogez votre famille et collectez les documents existants\n
            2. Créez votre arbre avec ce que vous savez déjà\n
            3. Consultez les archives départementales en ligne (gratuit)\n
            4. Remontez génération par génération, sans sauter d'étapes
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Étape 1 : Commencez par Vous</Text>
          <Text style={styles.paragraph}>
            La généalogie commence toujours par soi-même. Notez votre nom complet, 
            date et lieu de naissance. Puis remontez progressivement.
          </Text>
          
          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>🎯 Règle d'or</Text>
            <Text style={styles.tipText}>
              Ne sautez jamais une génération ! Chaque ancêtre doit être vérifié 
              avant de passer au suivant.
            </Text>
          </View>
        </View>

        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.h2}>Étape 2 : Interrogez Votre Famille</Text>
          <Text style={styles.paragraph}>
            Vos parents, grands-parents, oncles et tantes sont des trésors d'informations. 
            Préparez une liste de questions et enregistrez leurs réponses.
          </Text>
          
          <View style={styles.checkList}>
            <Text style={styles.checkItem}>✅ Noms et prénoms des ancêtres</Text>
            <Text style={styles.checkItem}>✅ Dates importantes (naissance, mariage, décès)</Text>
            <Text style={styles.checkItem}>✅ Lieux de vie</Text>
            <Text style={styles.checkItem}>✅ Professions</Text>
            <Text style={styles.checkItem}>✅ Anecdotes familiales</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Étape 3 : Créez Votre Arbre</Text>
          <Text style={styles.paragraph}>
            Un arbre généalogique vous permet de visualiser vos recherches et d'identifier 
            les "trous" à combler. Utilisez un outil numérique comme AILA pour organiser 
            facilement vos découvertes.
          </Text>
        </View>

        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.h2}>Étape 4 : Les Archives en Ligne</Text>
          <Text style={styles.paragraph}>
            Les archives départementales sont numérisées et accessibles gratuitement. 
            Vous y trouverez les registres d'état civil, les recensements et bien plus.
          </Text>
          
          <View style={styles.resourceCard}>
            <Text style={styles.resourceTitle}>🏛️ Ressources gratuites</Text>
            <Text style={styles.resourceItem}>• Archives départementales de chaque région</Text>
            <Text style={styles.resourceItem}>• FamilySearch.org - Base mondiale gratuite</Text>
            <Text style={styles.resourceItem}>• Geneanet.org - Communauté francophone</Text>
            <Text style={styles.resourceItem}>• Mémoire des Hommes - Archives militaires</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Les 5 Erreurs du Débutant</Text>
          
          <View style={styles.errorItem}>
            <Text style={styles.errorTitle}>❌ 1. Vouloir aller trop vite</Text>
            <Text style={styles.errorDesc}>Prenez le temps de vérifier chaque information.</Text>
          </View>
          
          <View style={styles.errorItem}>
            <Text style={styles.errorTitle}>❌ 2. Ne pas noter ses sources</Text>
            <Text style={styles.errorDesc}>D'où vient cette info ? Notez-le systématiquement.</Text>
          </View>
          
          <View style={styles.errorItem}>
            <Text style={styles.errorTitle}>❌ 3. Confondre les homonymes</Text>
            <Text style={styles.errorDesc}>Jean Dupont, il y en a des milliers ! Vérifiez.</Text>
          </View>
          
          <View style={styles.errorItem}>
            <Text style={styles.errorTitle}>❌ 4. Copier des arbres en ligne</Text>
            <Text style={styles.errorDesc}>Ils contiennent souvent des erreurs. Vérifiez aux sources.</Text>
          </View>
          
          <View style={styles.errorItem}>
            <Text style={styles.errorTitle}>❌ 5. Négliger les collatéraux</Text>
            <Text style={styles.errorDesc}>Frères et sœurs peuvent révéler des informations sur vos ancêtres.</Text>
          </View>
        </View>

        <View style={[styles.section, styles.ctaSection]}>
          <Text style={styles.ctaTitle}>🌳 Prêt à Commencer ?</Text>
          <Text style={styles.ctaText}>
            Créez votre arbre généalogique gratuit avec AILA et 
            démarrez votre voyage dans l'histoire familiale.
          </Text>
          <TouchableOpacity style={styles.ctaButton} onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.ctaButtonText}>Créer Mon Arbre Gratuit</Text>
            <Ionicons name="arrow-forward" size={20} color="#0A1628" />
          </TouchableOpacity>
        </View>

        {/* SEO Footer */}
        <SEOFooter currentPage="/genealogie-debutant-guide" />
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
  badge: { backgroundColor: 'rgba(76, 175, 80, 0.2)', color: '#4CAF50', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, fontSize: 12, fontWeight: '600', alignSelf: 'flex-start', marginBottom: 16 },
  h1: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 16, lineHeight: 36 },
  subtitle: { fontSize: 16, color: '#B8C5D6', lineHeight: 26 },
  featuredSnippet: { backgroundColor: '#0D4F3C', margin: 20, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#4CAF50' },
  featuredTitle: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50', marginBottom: 12 },
  featuredText: { fontSize: 14, color: '#FFFFFF', lineHeight: 24 },
  section: { padding: 24 },
  sectionAlt: { backgroundColor: '#0D1E36' },
  h2: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 16 },
  paragraph: { fontSize: 15, color: '#B8C5D6', lineHeight: 26, marginBottom: 16 },
  tipBox: { backgroundColor: 'rgba(212, 175, 55, 0.1)', borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: '#D4AF37' },
  tipTitle: { fontSize: 14, fontWeight: 'bold', color: '#D4AF37', marginBottom: 8 },
  tipText: { fontSize: 14, color: '#B8C5D6', lineHeight: 22 },
  checkList: { backgroundColor: '#1A2A44', borderRadius: 12, padding: 16 },
  checkItem: { fontSize: 14, color: '#B8C5D6', marginBottom: 10, lineHeight: 22 },
  resourceCard: { backgroundColor: '#1A2A44', borderRadius: 12, padding: 20 },
  resourceTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12 },
  resourceItem: { fontSize: 14, color: '#B8C5D6', marginBottom: 8 },
  errorItem: { backgroundColor: '#1A2A44', borderRadius: 12, padding: 16, marginBottom: 12 },
  errorTitle: { fontSize: 15, fontWeight: 'bold', color: '#FF6B6B', marginBottom: 4 },
  errorDesc: { fontSize: 13, color: '#B8C5D6' },
  ctaSection: { alignItems: 'center', paddingVertical: 48, backgroundColor: '#0D1E36' },
  ctaTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12 },
  ctaText: { fontSize: 16, color: '#B8C5D6', textAlign: 'center', marginBottom: 24, maxWidth: 400 },
  ctaButton: { backgroundColor: '#D4AF37', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  ctaButtonText: { color: '#0A1628', fontSize: 18, fontWeight: '600' },
  footer: { padding: 40, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#2A3F5A' },
  footerText: { fontSize: 14, color: '#6B7C93' },
});