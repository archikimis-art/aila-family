import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SEOFooter } from '@/components/SEOFooter';
import { SEOBreadcrumbs, BREADCRUMB_CONFIGS } from '@/components/SEOBreadcrumbs';
import { RelatedArticles } from '@/components/RelatedArticles';

const SEOHead = () => {
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Comment Organiser une Cousinade : Guide Complet + Checklist | AILA';
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Organisez une cousinade réussie ! Guide complet : planification, budget, invitations, activités, repas. Checklist gratuite pour réunir toute la famille.');
      }
    }
  }, []);
  return null;
};

export default function OrganiserCousinade() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <SEOHead />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Pressable onPress={() => router.push('/')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#D4AF37" />
          </Pressable>
          <Text style={styles.logoText}>🌳 AILA</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.badge}>🎉 Réunion de Famille</Text>
          <Text style={styles.h1}>Comment Organiser une Cousinade Réussie</Text>
          <Text style={styles.subtitle}>
            Une cousinade est l'occasion parfaite de rassembler toute la famille. 
            Voici le guide complet pour l'organiser de A à Z.
          </Text>
        </View>

        <View style={styles.featuredSnippet}>
          <Text style={styles.featuredTitle}>📋 Checklist rapide</Text>
          <Text style={styles.featuredText}>
            ✓ Définir une date 6 mois à l'avance\n
            ✓ Créer une liste de tous les membres\n
            ✓ Choisir un lieu adapté au nombre\n
            ✓ Envoyer les invitations 3 mois avant\n
            ✓ Organiser activités et repas\n
            ✓ Prévoir photos et souvenirs
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>📅 Étape 1 : Planification (6 mois avant)</Text>
          
          <View style={styles.taskCard}>
            <Text style={styles.taskTitle}>Choisir la date</Text>
            <Text style={styles.taskDesc}>
              Préférez un week-end d'été ou un jour férié. Évitez les vacances scolaires 
              si vous voulez maximiser la participation.
            </Text>
          </View>
          
          <View style={styles.taskCard}>
            <Text style={styles.taskTitle}>Créer le comité d'organisation</Text>
            <Text style={styles.taskDesc}>
              Formez une équipe de 3-5 personnes de différentes branches. 
              Répartissez les responsabilités.
            </Text>
          </View>
          
          <View style={styles.taskCard}>
            <Text style={styles.taskTitle}>Lister tous les membres</Text>
            <Text style={styles.taskDesc}>
              Utilisez votre arbre généalogique AILA pour avoir la liste complète. 
              N'oubliez personne !
            </Text>
          </View>
        </View>

        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.h2}>📍 Étape 2 : Choisir le Lieu</Text>
          
          <View style={styles.optionCard}>
            <Text style={styles.optionIcon}>🏠</Text>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Chez un membre</Text>
              <Text style={styles.optionPros}>✅ Gratuit, intime, pratique</Text>
              <Text style={styles.optionCons}>❌ Limité en capacité</Text>
            </View>
          </View>
          
          <View style={styles.optionCard}>
            <Text style={styles.optionIcon}>🏕️</Text>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Gîte ou camping</Text>
              <Text style={styles.optionPros}>✅ Grande capacité, week-end possible</Text>
              <Text style={styles.optionCons}>❌ Coût, réservation anticipée</Text>
            </View>
          </View>
          
          <View style={styles.optionCard}>
            <Text style={styles.optionIcon}>🏛️</Text>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Salle des fêtes</Text>
              <Text style={styles.optionPros}>✅ Équipée, spacieuse</Text>
              <Text style={styles.optionCons}>❌ Peut manquer de charme</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>💰 Étape 3 : Budget Type</Text>
          
          <View style={styles.budgetTable}>
            <View style={styles.budgetRow}>
              <Text style={styles.budgetLabel}>Location lieu</Text>
              <Text style={styles.budgetAmount}>0€ - 500€</Text>
            </View>
            <View style={styles.budgetRow}>
              <Text style={styles.budgetLabel}>Repas (par personne)</Text>
              <Text style={styles.budgetAmount}>10€ - 25€</Text>
            </View>
            <View style={styles.budgetRow}>
              <Text style={styles.budgetLabel}>Activités</Text>
              <Text style={styles.budgetAmount}>50€ - 200€</Text>
            </View>
            <View style={styles.budgetRow}>
              <Text style={styles.budgetLabel}>Photos/Souvenirs</Text>
              <Text style={styles.budgetAmount}>30€ - 100€</Text>
            </View>
          </View>
          
          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>💡 Astuce budget</Text>
            <Text style={styles.tipText}>
              Demandez une participation par famille plutôt que par personne. 
              Format "auberge espagnole" pour le repas = économies garanties !
            </Text>
          </View>
        </View>

        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.h2}>🎯 Étape 4 : Activités Incontournables</Text>
          
          <View style={styles.activityGrid}>
            <View style={styles.activityCard}>
              <Text style={styles.activityIcon}>📸</Text>
              <Text style={styles.activityName}>Photo de groupe</Text>
            </View>
            <View style={styles.activityCard}>
              <Text style={styles.activityIcon}>🌳</Text>
              <Text style={styles.activityName}>Présentation arbre</Text>
            </View>
            <View style={styles.activityCard}>
              <Text style={styles.activityIcon}>🎮</Text>
              <Text style={styles.activityName}>Jeux intergénérationnels</Text>
            </View>
            <View style={styles.activityCard}>
              <Text style={styles.activityIcon}>🎤</Text>
              <Text style={styles.activityName}>Quiz famille</Text>
            </View>
            <View style={styles.activityCard}>
              <Text style={styles.activityIcon}>📖</Text>
              <Text style={styles.activityName}>Partage d'histoires</Text>
            </View>
            <View style={styles.activityCard}>
              <Text style={styles.activityIcon}>🏃</Text>
              <Text style={styles.activityName}>Tournoi sportif</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>✉️ Modèle d'Invitation</Text>
          
          <View style={styles.invitationCard}>
            <Text style={styles.invitationText}>
              "Chers cousins, cousines et toute la famille !\n\n
              La famille [NOM] vous invite à sa grande cousinade annuelle !\n\n
              📅 Date : [DATE]\n
              📍 Lieu : [ADRESSE]\n
              ⏰ Horaires : [HEURES]\n\n
              Au programme : repas partagé, jeux, photos et retrouvailles !\n\n
              Merci de confirmer votre présence avant le [DATE] à [EMAIL/TEL]\n\n
              On a hâte de vous voir !"
            </Text>
          </View>
        </View>

        <View style={[styles.section, styles.ctaSection]}>
          <Text style={styles.ctaTitle}>🌳 Préparez Votre Cousinade avec AILA</Text>
          <Text style={styles.ctaText}>
            Utilisez votre arbre généalogique pour identifier tous les membres 
            à inviter et ne laisser personne de côté.
          </Text>
          <Pressable style={styles.ctaButton} onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.ctaButtonText}>Créer Mon Arbre Gratuit</Text>
            <Ionicons name="arrow-forward" size={20} color="#0A1628" />
          </Pressable>
        </View>

        {/* Related Articles - Internal Linking */}
        <RelatedArticles silo="famille" currentPage="/organiser-cousinade" />

        {/* SEO Footer */}
        <SEOFooter currentPage="/organiser-cousinade" />
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
  hero: { padding: 24 },
  badge: { backgroundColor: 'rgba(233, 30, 99, 0.2)', color: '#F48FB1', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, fontSize: 12, fontWeight: '600', alignSelf: 'flex-start', marginBottom: 16 },
  h1: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 16, lineHeight: 36 },
  subtitle: { fontSize: 16, color: '#B8C5D6', lineHeight: 26 },
  featuredSnippet: { backgroundColor: '#0D4F3C', margin: 20, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#4CAF50' },
  featuredTitle: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50', marginBottom: 12 },
  featuredText: { fontSize: 14, color: '#FFFFFF', lineHeight: 24 },
  section: { padding: 24 },
  sectionAlt: { backgroundColor: '#0D1E36' },
  h2: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 20 },
  taskCard: { backgroundColor: '#1A2A44', borderRadius: 12, padding: 16, marginBottom: 12 },
  taskTitle: { fontSize: 16, fontWeight: '600', color: '#D4AF37', marginBottom: 4 },
  taskDesc: { fontSize: 14, color: '#B8C5D6', lineHeight: 22 },
  optionCard: { flexDirection: 'row', backgroundColor: '#1A2A44', borderRadius: 12, padding: 16, marginBottom: 12 },
  optionIcon: { fontSize: 32, marginRight: 16 },
  optionContent: { flex: 1 },
  optionTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 },
  optionPros: { fontSize: 13, color: '#4CAF50', marginBottom: 2 },
  optionCons: { fontSize: 13, color: '#FF6B6B' },
  budgetTable: { backgroundColor: '#1A2A44', borderRadius: 12, padding: 16, marginBottom: 16 },
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2A3F5A' },
  budgetLabel: { fontSize: 15, color: '#B8C5D6' },
  budgetAmount: { fontSize: 15, fontWeight: '600', color: '#D4AF37' },
  tipBox: { backgroundColor: 'rgba(212, 175, 55, 0.1)', borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: '#D4AF37' },
  tipTitle: { fontSize: 14, fontWeight: 'bold', color: '#D4AF37', marginBottom: 8 },
  tipText: { fontSize: 14, color: '#B8C5D6', lineHeight: 22 },
  activityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  activityCard: { backgroundColor: '#1A2A44', borderRadius: 12, padding: 16, alignItems: 'center', width: 100 },
  activityIcon: { fontSize: 28, marginBottom: 8 },
  activityName: { fontSize: 12, color: '#B8C5D6', textAlign: 'center' },
  invitationCard: { backgroundColor: '#1A2A44', borderRadius: 12, padding: 20, borderLeftWidth: 4, borderLeftColor: '#D4AF37' },
  invitationText: { fontSize: 14, color: '#B8C5D6', lineHeight: 24, fontStyle: 'italic' },
  ctaSection: { alignItems: 'center', paddingVertical: 48, backgroundColor: '#0D1E36' },
  ctaTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12, textAlign: 'center' },
  ctaText: { fontSize: 16, color: '#B8C5D6', textAlign: 'center', marginBottom: 24, maxWidth: 400 },
  ctaButton: { backgroundColor: '#D4AF37', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  ctaButtonText: { color: '#0A1628', fontSize: 18, fontWeight: '600' },
  footer: { padding: 40, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#2A3F5A' },
  footerText: { fontSize: 14, color: '#6B7C93' },
});