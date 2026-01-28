import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const SEOHead = () => {
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Arbre Généalogique Famille Recomposée : Guide Complet | AILA';
      
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Comment créer un arbre généalogique pour une famille recomposée ? Guide complet avec exemples, conseils pratiques et outil gratuit. Inclure beaux-parents, demi-frères et belles-familles.');
      }
      
      let canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.setAttribute('href', 'https://www.aila.family/arbre-genealogique-famille-recomposee');
      }
    }
  }, []);
  return null;
};

export default function FamilleRecomposee() {
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
          <Text style={styles.badge}>👨‍👩‍👧‍👦 Guide Spécialisé</Text>
          <Text style={styles.h1}>Arbre Généalogique pour Famille Recomposée</Text>
          <Text style={styles.subtitle}>
            Comment représenter une famille recomposée dans un arbre généalogique ? 
            Guide complet avec conseils pratiques et exemples.
          </Text>
        </View>

        {/* Intro */}
        <View style={styles.section}>
          <View style={styles.statsBox}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>1 sur 10</Text>
              <Text style={styles.statLabel}>enfants vivent dans une famille recomposée</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>720 000</Text>
              <Text style={styles.statLabel}>familles recomposées en France</Text>
            </View>
          </View>
          
          <Text style={styles.introText}>
            Les familles recomposées sont de plus en plus courantes, et pourtant, la plupart des 
            outils de généalogie ne sont pas adaptés à leur complexité. Chez AILA, nous avons 
            conçu notre application pour accueillir TOUTES les formes de familles.
          </Text>
        </View>

        {/* Les défis */}
        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.h2}>🤔 Les Défis d'un Arbre Recomposé</Text>
          
          <View style={styles.challengeCard}>
            <Text style={styles.challengeIcon}>1️⃣</Text>
            <View style={styles.challengeContent}>
              <Text style={styles.challengeTitle}>Comment représenter les beaux-parents ?</Text>
              <Text style={styles.challengeText}>
                Un beau-père ou une belle-mère n'est pas un parent biologique, mais fait 
                partie intégrante de la famille. Faut-il le placer au même niveau ?
              </Text>
              <Text style={styles.challengeSolution}>
                ✅ Solution AILA : Créez un lien "Beau-parent" distinct qui montre la relation 
                sans confusion avec les parents biologiques.
              </Text>
            </View>
          </View>
          
          <View style={styles.challengeCard}>
            <Text style={styles.challengeIcon}>2️⃣</Text>
            <View style={styles.challengeContent}>
              <Text style={styles.challengeTitle}>Demi-frères, demi-sœurs, quasi-frères...</Text>
              <Text style={styles.challengeText}>
                Les enfants peuvent avoir des demi-frères (un parent en commun) ou des 
                quasi-frères (aucun lien biologique mais vivent ensemble).
              </Text>
              <Text style={styles.challengeSolution}>
                ✅ Solution AILA : Types de relations personnalisables pour chaque lien familial.
              </Text>
            </View>
          </View>
          
          <View style={styles.challengeCard}>
            <Text style={styles.challengeIcon}>3️⃣</Text>
            <View style={styles.challengeContent}>
              <Text style={styles.challengeTitle}>Les ex-conjoints dans l'arbre</Text>
              <Text style={styles.challengeText}>
                L'ex-conjoint est le parent de vos enfants. Il/elle fait partie de l'histoire 
                familiale même après une séparation.
              </Text>
              <Text style={styles.challengeSolution}>
                ✅ Solution AILA : Indiquez les relations passées (divorcé, séparé) tout en 
                conservant les liens parent-enfant.
              </Text>
            </View>
          </View>
          
          <View style={styles.challengeCard}>
            <Text style={styles.challengeIcon}>4️⃣</Text>
            <View style={styles.challengeContent}>
              <Text style={styles.challengeTitle}>La belle-famille élargie</Text>
              <Text style={styles.challengeText}>
                Les parents du beau-parent deviennent-ils des "beaux-grands-parents" ? 
                Jusqu'où inclure la belle-famille ?
              </Text>
              <Text style={styles.challengeSolution}>
                ✅ Solution AILA : Vous décidez qui inclure. L'arbre s'adapte à votre vision 
                de la famille.
              </Text>
            </View>
          </View>
        </View>

        {/* Guide étape par étape */}
        <View style={styles.section}>
          <Text style={styles.h2}>📝 Guide Étape par Étape</Text>
          
          <View style={styles.stepCard}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Commencez par les enfants</Text>
              <Text style={styles.stepText}>
                Placez l'enfant (ou les enfants) au centre de votre réflexion. C'est à partir 
                d'eux que vous construirez les branches vers les différents parents.
              </Text>
            </View>
          </View>
          
          <View style={styles.stepCard}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Ajoutez les parents biologiques</Text>
              <Text style={styles.stepText}>
                Créez les deux parents biologiques de chaque enfant, même s'ils sont séparés. 
                Le lien biologique reste permanent dans l'arbre.
              </Text>
            </View>
          </View>
          
          <View style={styles.stepCard}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Intégrez les beaux-parents</Text>
              <Text style={styles.stepText}>
                Ajoutez le nouveau conjoint de chaque parent. Utilisez le type de relation 
                "Beau-parent" pour les lier aux enfants.
              </Text>
            </View>
          </View>
          
          <View style={styles.stepCard}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>4</Text></View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Connectez les demi-frères/sœurs</Text>
              <Text style={styles.stepText}>
                Les enfants du beau-parent ou les enfants nés de la nouvelle union sont 
                automatiquement positionnés comme demi-frères/sœurs.
              </Text>
            </View>
          </View>
          
          <View style={styles.stepCard}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>5</Text></View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Remontez les générations</Text>
              <Text style={styles.stepText}>
                Ajoutez les grands-parents biologiques ET les "beaux-grands-parents" si vous 
                le souhaitez. C'est votre famille, c'est votre choix !
              </Text>
            </View>
          </View>
        </View>

        {/* Types de liens */}
        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.h2}>🔗 Types de Liens dans une Famille Recomposée</Text>
          
          <View style={styles.linkTypesGrid}>
            <View style={styles.linkTypeCard}>
              <Text style={styles.linkTypeIcon}>👨‍👩‍👧</Text>
              <Text style={styles.linkTypeTitle}>Parent biologique</Text>
              <Text style={styles.linkTypeDesc}>Lien de sang direct parent-enfant</Text>
            </View>
            
            <View style={styles.linkTypeCard}>
              <Text style={styles.linkTypeIcon}>🤝</Text>
              <Text style={styles.linkTypeTitle}>Beau-parent</Text>
              <Text style={styles.linkTypeDesc}>Conjoint(e) du parent biologique</Text>
            </View>
            
            <View style={styles.linkTypeCard}>
              <Text style={styles.linkTypeIcon}>👫</Text>
              <Text style={styles.linkTypeTitle}>Demi-frère/sœur</Text>
              <Text style={styles.linkTypeDesc}>Un seul parent biologique en commun</Text>
            </View>
            
            <View style={styles.linkTypeCard}>
              <Text style={styles.linkTypeIcon}>🏠</Text>
              <Text style={styles.linkTypeTitle}>Quasi-frère/sœur</Text>
              <Text style={styles.linkTypeDesc}>Aucun lien biologique, même foyer</Text>
            </View>
            
            <View style={styles.linkTypeCard}>
              <Text style={styles.linkTypeIcon}>💍</Text>
              <Text style={styles.linkTypeTitle}>Ex-conjoint</Text>
              <Text style={styles.linkTypeDesc}>Ancien partenaire, parent des enfants</Text>
            </View>
            
            <View style={styles.linkTypeCard}>
              <Text style={styles.linkTypeIcon}>👴</Text>
              <Text style={styles.linkTypeTitle}>Beau-grand-parent</Text>
              <Text style={styles.linkTypeDesc}>Parent du beau-parent</Text>
            </View>
          </View>
        </View>

        {/* Conseils */}
        <View style={styles.section}>
          <Text style={styles.h2}>💡 Conseils Pratiques</Text>
          
          <View style={styles.tipCard}>
            <Ionicons name="heart-outline" size={24} color="#D4AF37" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Inclusivité avant tout</Text>
              <Text style={styles.tipText}>
                Chaque membre compte. Un beau-parent qui élève un enfant depuis 10 ans 
                mérite sa place dans l'arbre familial.
              </Text>
            </View>
          </View>
          
          <View style={styles.tipCard}>
            <Ionicons name="chatbubbles-outline" size={24} color="#D4AF37" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Dialoguez avec les enfants</Text>
              <Text style={styles.tipText}>
                Impliquez les enfants dans la création de l'arbre. Demandez-leur comment 
                ils perçoivent leurs relations familiales.
              </Text>
            </View>
          </View>
          
          <View style={styles.tipCard}>
            <Ionicons name="time-outline" size={24} color="#D4AF37" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>L'arbre évolue avec le temps</Text>
              <Text style={styles.tipText}>
                Une famille recomposée n'est jamais figée. Votre arbre peut et doit 
                évoluer au fil des années et des événements.
              </Text>
            </View>
          </View>
          
          <View style={styles.tipCard}>
            <Ionicons name="eye-off-outline" size={24} color="#D4AF37" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Respectez la vie privée</Text>
              <Text style={styles.tipText}>
                Si des tensions existent, vous pouvez créer des vues différentes de l'arbre 
                pour différents membres de la famille.
              </Text>
            </View>
          </View>
        </View>

        {/* FAQ */}
        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.h2}>❓ Questions Fréquentes</Text>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Mon beau-père m'a élevé, puis-je le mettre comme "père" ?</Text>
            <Text style={styles.faqAnswer}>
              Absolument ! Dans AILA, vous pouvez personnaliser les intitulés. Vous pouvez 
              l'appeler "Papa [Prénom]" ou "Père adoptif" selon ce qui reflète votre réalité.
            </Text>
          </View>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Comment gérer si je ne connais pas mon père biologique ?</Text>
            <Text style={styles.faqAnswer}>
              Vous pouvez créer une entrée "Père biologique inconnu" ou simplement ne pas 
              l'inclure. Votre arbre, vos règles.
            </Text>
          </View>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Mes quasi-frères sont-ils ma "vraie" famille ?</Text>
            <Text style={styles.faqAnswer}>
              La famille n'est pas que biologique ! Si vous avez grandi ensemble, partagé 
              des souvenirs, ils font partie de votre histoire familiale.
            </Text>
          </View>
        </View>

        {/* CTA */}
        <View style={[styles.section, styles.ctaSection]}>
          <Text style={styles.ctaTitle}>🌳 Créez l'arbre de VOTRE famille</Text>
          <Text style={styles.ctaText}>
            AILA est conçu pour toutes les familles, dans toute leur diversité. 
            Créez votre arbre généalogique recomposé gratuitement.
          </Text>
          
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.ctaButtonText}>Créer Mon Arbre Gratuit</Text>
            <Ionicons name="arrow-forward" size={20} color="#0A1628" />
          </TouchableOpacity>
          
          <View style={styles.features}>
            <Text style={styles.featureItem}>✓ Tous types de relations</Text>
            <Text style={styles.featureItem}>✓ Personnalisable</Text>
            <Text style={styles.featureItem}>✓ 100% gratuit</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 AILA Famille - Pour toutes les familles</Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => router.push('/arbre-genealogique-gratuit')}>
              <Text style={styles.footerLink}>Arbre Gratuit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/questions-grands-parents')}>
              <Text style={styles.footerLink}>Questions Grands-Parents</Text>
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
  subtitle: { fontSize: 18, color: '#B8C5D6', textAlign: 'center', lineHeight: 28, maxWidth: 600 },
  section: { padding: 24 },
  sectionAlt: { backgroundColor: '#0D1E36' },
  statsBox: { flexDirection: 'row', justifyContent: 'center', gap: 32, marginBottom: 24, flexWrap: 'wrap' },
  statItem: { alignItems: 'center', padding: 20, backgroundColor: '#1A2A44', borderRadius: 16, minWidth: 150 },
  statNumber: { fontSize: 28, fontWeight: 'bold', color: '#D4AF37', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#B8C5D6', textAlign: 'center' },
  introText: { fontSize: 16, color: '#B8C5D6', lineHeight: 26, textAlign: 'center', maxWidth: 700, alignSelf: 'center' },
  h2: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 24, textAlign: 'center' },
  challengeCard: { flexDirection: 'row', backgroundColor: '#1A2A44', borderRadius: 16, padding: 20, marginBottom: 16, alignItems: 'flex-start' },
  challengeIcon: { fontSize: 24, marginRight: 16 },
  challengeContent: { flex: 1 },
  challengeTitle: { fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginBottom: 8 },
  challengeText: { fontSize: 14, color: '#B8C5D6', lineHeight: 22, marginBottom: 12 },
  challengeSolution: { fontSize: 14, color: '#4CAF50', lineHeight: 22, backgroundColor: 'rgba(76, 175, 80, 0.1)', padding: 12, borderRadius: 8 },
  stepCard: { flexDirection: 'row', marginBottom: 20, alignItems: 'flex-start' },
  stepNumber: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#D4AF37', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  stepNumberText: { fontSize: 18, fontWeight: 'bold', color: '#0A1628' },
  stepContent: { flex: 1, backgroundColor: '#1A2A44', borderRadius: 12, padding: 16 },
  stepTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 8 },
  stepText: { fontSize: 14, color: '#B8C5D6', lineHeight: 22 },
  linkTypesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  linkTypeCard: { backgroundColor: '#1A2A44', borderRadius: 12, padding: 20, width: 160, alignItems: 'center' },
  linkTypeIcon: { fontSize: 32, marginBottom: 12 },
  linkTypeTitle: { fontSize: 14, fontWeight: '600', color: '#FFFFFF', marginBottom: 4, textAlign: 'center' },
  linkTypeDesc: { fontSize: 12, color: '#6B7C93', textAlign: 'center' },
  tipCard: { flexDirection: 'row', backgroundColor: '#1A2A44', borderRadius: 12, padding: 16, marginBottom: 12, alignItems: 'flex-start' },
  tipContent: { flex: 1, marginLeft: 16 },
  tipTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 },
  tipText: { fontSize: 14, color: '#B8C5D6', lineHeight: 22 },
  faqItem: { backgroundColor: '#1A2A44', borderRadius: 12, padding: 20, marginBottom: 16 },
  faqQuestion: { fontSize: 16, fontWeight: '600', color: '#D4AF37', marginBottom: 8 },
  faqAnswer: { fontSize: 14, color: '#B8C5D6', lineHeight: 22 },
  ctaSection: { alignItems: 'center', paddingVertical: 48 },
  ctaTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 12 },
  ctaText: { fontSize: 16, color: '#B8C5D6', textAlign: 'center', lineHeight: 24, maxWidth: 500, marginBottom: 24 },
  ctaButton: { backgroundColor: '#D4AF37', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 },
  ctaButtonText: { color: '#0A1628', fontSize: 18, fontWeight: '600' },
  features: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  featureItem: { fontSize: 14, color: '#4CAF50' },
  footer: { padding: 40, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#2A3F5A' },
  footerText: { fontSize: 14, color: '#6B7C93', marginBottom: 16 },
  footerLinks: { flexDirection: 'row', gap: 24 },
  footerLink: { fontSize: 14, color: '#D4AF37' },
});
