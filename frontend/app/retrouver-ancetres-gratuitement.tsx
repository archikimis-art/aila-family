import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SEOFooter } from '@/components/SEOFooter';
import { SEOBreadcrumbs, BREADCRUMB_CONFIGS } from '@/components/SEOBreadcrumbs';
import { RelatedArticles, ContextualCTA } from '@/components/RelatedArticles';

const SEOHead = () => {
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Comment Retrouver ses Ancêtres Gratuitement : Guide Complet 2025 | AILA';
      
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Découvrez comment retrouver vos ancêtres gratuitement en 2025. Guide complet avec archives en ligne, registres d\'état civil, méthodes de recherche et outils gratuits. Par des généalogistes experts.');
      }
    }
  }, []);
  return null;
};

const SectionCard = ({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionCardHeader}>
      <Text style={styles.sectionCardIcon}>{icon}</Text>
      <Text style={styles.sectionCardTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

export default function RetrouverAncetres() {
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
          <TouchableOpacity onPress={() => router.push('/')}>
            <Text style={styles.logoText}>🌳 AILA</Text>
          </TouchableOpacity>
        </View>

        {/* Breadcrumb */}
        <View style={styles.breadcrumb}>
          <Text style={styles.breadcrumbText}>Accueil → Blog → Retrouver ses ancêtres</Text>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.badge}>📚 Guide Expert • Mis à jour janvier 2025</Text>
          <Text style={styles.h1}>Comment Retrouver ses Ancêtres Gratuitement</Text>
          <Text style={styles.subtitle}>
            Le guide complet pour débuter vos recherches généalogiques sans dépenser un centime. 
            Méthodes, ressources et outils gratuits testés par notre équipe.
          </Text>
          
          {/* Author box - EEAT */}
          <View style={styles.authorBox}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorAvatarText}>👨‍🏫</Text>
            </View>
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>Rédigé par l'équipe AILA</Text>
              <Text style={styles.authorCredentials}>Experts en généalogie • 10+ ans d'expérience</Text>
              <Text style={styles.authorDate}>Dernière mise à jour : 12 janvier 2025</Text>
            </View>
          </View>
        </View>

        {/* Table of Contents */}
        <View style={styles.tocBox}>
          <Text style={styles.tocTitle}>📑 Sommaire</Text>
          <Text style={styles.tocItem}>1. Par où commencer ses recherches ?</Text>
          <Text style={styles.tocItem}>2. Les archives en ligne gratuites</Text>
          <Text style={styles.tocItem}>3. Les registres d'état civil</Text>
          <Text style={styles.tocItem}>4. Les bases de données généalogiques</Text>
          <Text style={styles.tocItem}>5. Méthode pas à pas</Text>
          <Text style={styles.tocItem}>6. Erreurs à éviter</Text>
          <Text style={styles.tocItem}>7. FAQ</Text>
        </View>

        {/* Featured Snippet Box */}
        <View style={styles.featuredSnippet}>
          <Text style={styles.featuredSnippetTitle}>💡 En bref : Comment retrouver ses ancêtres gratuitement ?</Text>
          <Text style={styles.featuredSnippetText}>
            Pour retrouver vos ancêtres gratuitement, commencez par interroger votre famille, 
            puis consultez les archives départementales en ligne (état civil, recensements). 
            Utilisez des outils gratuits comme FamilySearch ou Geneanet pour élargir vos recherches. 
            Organisez tout dans un arbre généalogique numérique comme AILA.
          </Text>
        </View>

        {/* Section 1 */}
        <View style={styles.section}>
          <Text style={styles.h2}>1. Par Où Commencer ses Recherches Généalogiques ?</Text>
          
          <Text style={styles.paragraph}>
            Avant de vous plonger dans les archives poussiéreuses (ou leurs versions numériques), 
            la première étape est souvent la plus simple et la plus riche : <Text style={styles.bold}>parler à votre famille</Text>.
          </Text>

          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>🎯 Conseil d'expert</Text>
            <Text style={styles.tipText}>
              Commencez TOUJOURS par ce que vous savez. Notez les noms, dates et lieux que vous 
              connaissez déjà. Chaque information est un fil à tirer.
            </Text>
          </View>

          <Text style={styles.h3}>Les informations à collecter en priorité :</Text>
          
          <View style={styles.checkList}>
            <Text style={styles.checkItem}>✅ Noms et prénoms complets (y compris noms de jeune fille)</Text>
            <Text style={styles.checkItem}>✅ Dates de naissance, mariage, décès</Text>
            <Text style={styles.checkItem}>✅ Lieux (commune, département)</Text>
            <Text style={styles.checkItem}>✅ Professions</Text>
            <Text style={styles.checkItem}>✅ Anecdotes et histoires familiales</Text>
            <Text style={styles.checkItem}>✅ Photos anciennes avec noms au dos</Text>
          </View>

          <Text style={styles.paragraph}>
            N'oubliez pas de fouiller dans les tiroirs ! Livrets de famille, faire-part, 
            lettres anciennes... Ces documents sont des mines d'or.
          </Text>
        </View>

        {/* Section 2 */}
        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.h2}>2. Les Archives Départementales en Ligne (100% Gratuit)</Text>
          
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Bonne nouvelle :</Text> la quasi-totalité des archives départementales 
            françaises sont numérisées et accessibles gratuitement en ligne. C'est LA ressource 
            incontournable pour tout généalogiste.
          </Text>

          <SectionCard icon="🏛️" title="Ce que vous y trouverez">
            <Text style={styles.cardText}>• Registres paroissiaux (avant 1792)</Text>
            <Text style={styles.cardText}>• État civil (naissances, mariages, décès)</Text>
            <Text style={styles.cardText}>• Recensements de population</Text>
            <Text style={styles.cardText}>• Registres matricules militaires</Text>
            <Text style={styles.cardText}>• Tables décennales</Text>
            <Text style={styles.cardText}>• Cadastres et plans anciens</Text>
          </SectionCard>

          <Text style={styles.h3}>Comment accéder aux archives de votre département ?</Text>
          
          <Text style={styles.paragraph}>
            Recherchez "archives départementales + [nom du département]" sur Google, ou consultez 
            le portail France Archives qui recense tous les sites.
          </Text>

          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>⚠️ Attention</Text>
            <Text style={styles.warningText}>
              Les registres de moins de 75 ans (naissances) ou 25 ans (mariages/décès) ne sont 
              généralement pas en ligne pour des raisons de vie privée.
            </Text>
          </View>
        </View>

        {/* Section 3 */}
        <View style={styles.section}>
          <Text style={styles.h2}>3. Les Registres d'État Civil : Mode d'Emploi</Text>
          
          <Text style={styles.paragraph}>
            Les registres d'état civil sont tenus en double exemplaire depuis 1792 : 
            un en mairie, un aux archives départementales. Voici comment les exploiter.
          </Text>

          <Text style={styles.h3}>La méthode des tables décennales</Text>
          
          <Text style={styles.paragraph}>
            Les tables décennales sont des index qui récapitulent tous les actes sur 10 ans. 
            C'est votre meilleur ami pour trouver rapidement un acte !
          </Text>

          <View style={styles.stepsBox}>
            <View style={styles.step}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>1</Text></View>
              <Text style={styles.stepText}>Identifiez la commune et la période approximative</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>2</Text></View>
              <Text style={styles.stepText}>Consultez la table décennale correspondante</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>3</Text></View>
              <Text style={styles.stepText}>Trouvez le nom et notez l'année exacte</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>4</Text></View>
              <Text style={styles.stepText}>Accédez au registre de cette année</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>5</Text></View>
              <Text style={styles.stepText}>Lisez l'acte complet et notez les informations</Text>
            </View>
          </View>
        </View>

        {/* Section 4 */}
        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.h2}>4. Les Bases de Données Généalogiques Gratuites</Text>
          
          <Text style={styles.paragraph}>
            En plus des archives officielles, plusieurs sites communautaires offrent des 
            ressources précieuses gratuitement.
          </Text>

          <View style={styles.resourceCard}>
            <Text style={styles.resourceName}>🌍 FamilySearch.org</Text>
            <Text style={styles.resourceDesc}>
              La plus grande base gratuite au monde. Des milliards de documents numérisés 
              et des arbres généalogiques partagés. 100% gratuit, géré par les Mormons.
            </Text>
            <Text style={styles.resourcePros}>✅ Gratuit • Énorme base • International</Text>
          </View>

          <View style={styles.resourceCard}>
            <Text style={styles.resourceName}>🇫🇷 Geneanet.org</Text>
            <Text style={styles.resourceDesc}>
              Le leader français. Version gratuite généreuse avec accès aux arbres partagés 
              et à de nombreuses bases de données collaboratives.
            </Text>
            <Text style={styles.resourcePros}>✅ En français • Communauté active • Arbres partagés</Text>
          </View>

          <View style={styles.resourceCard}>
            <Text style={styles.resourceName}>📋 Filae.com</Text>
            <Text style={styles.resourceDesc}>
              Accès gratuit limité mais utile pour les relevés d'état civil. 
              Version payante pour l'accès complet aux archives.
            </Text>
            <Text style={styles.resourcePros}>✅ Relevés indexés • Recherche facile</Text>
          </View>

          <View style={styles.resourceCard}>
            <Text style={styles.resourceName}>⚔️ Mémoire des Hommes</Text>
            <Text style={styles.resourceDesc}>
              Site officiel du Ministère des Armées. Fiches de soldats morts pour la France, 
              journaux de marche, registres matricules.
            </Text>
            <Text style={styles.resourcePros}>✅ 100% gratuit • Officiel • Détaillé</Text>
          </View>
        </View>

        {/* Section 5 */}
        <View style={styles.section}>
          <Text style={styles.h2}>5. Méthode Pas à Pas : Votre Premier Mois de Recherche</Text>

          <View style={styles.timelineBox}>
            <View style={styles.timelineItem}>
              <Text style={styles.timelineWeek}>Semaine 1</Text>
              <Text style={styles.timelineTitle}>Collecte familiale</Text>
              <Text style={styles.timelineDesc}>
                Interrogez parents, grands-parents, oncles, tantes. Photographiez tous les documents. 
                Créez votre arbre avec ce que vous savez.
              </Text>
            </View>
            
            <View style={styles.timelineItem}>
              <Text style={styles.timelineWeek}>Semaine 2</Text>
              <Text style={styles.timelineTitle}>Archives en ligne</Text>
              <Text style={styles.timelineDesc}>
                Identifiez les communes d'origine. Accédez aux archives départementales. 
                Recherchez les actes de vos grands-parents.
              </Text>
            </View>
            
            <View style={styles.timelineItem}>
              <Text style={styles.timelineWeek}>Semaine 3</Text>
              <Text style={styles.timelineTitle}>Remontée génération</Text>
              <Text style={styles.timelineDesc}>
                Utilisez les informations des actes pour remonter. Les actes de mariage 
                mentionnent souvent les parents des époux.
              </Text>
            </View>
            
            <View style={styles.timelineItem}>
              <Text style={styles.timelineWeek}>Semaine 4</Text>
              <Text style={styles.timelineTitle}>Consolidation</Text>
              <Text style={styles.timelineDesc}>
                Vérifiez vos sources. Complétez votre arbre. Identifiez les "murs de briques" 
                à creuser plus tard.
              </Text>
            </View>
          </View>
        </View>

        {/* Section 6 */}
        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.h2}>6. Les 7 Erreurs à Éviter en Généalogie</Text>

          <View style={styles.errorCard}>
            <Text style={styles.errorNum}>❌ 1</Text>
            <Text style={styles.errorTitle}>Ne pas citer ses sources</Text>
            <Text style={styles.errorDesc}>
              Notez TOUJOURS d'où vient chaque information. Dans 6 mois, vous ne vous 
              souviendrez plus pourquoi vous avez cette date.
            </Text>
          </View>

          <View style={styles.errorCard}>
            <Text style={styles.errorNum}>❌ 2</Text>
            <Text style={styles.errorTitle}>Confondre homonymes</Text>
            <Text style={styles.errorDesc}>
              Jean Dupont né en 1850 à Lyon, il y en a des dizaines ! Croisez toujours 
              plusieurs sources avant de valider.
            </Text>
          </View>

          <View style={styles.errorCard}>
            <Text style={styles.errorNum}>❌ 3</Text>
            <Text style={styles.errorTitle}>Faire confiance aux arbres en ligne</Text>
            <Text style={styles.errorDesc}>
              Les arbres partagés contiennent souvent des erreurs recopiées. Vérifiez 
              systématiquement avec les sources originales.
            </Text>
          </View>

          <View style={styles.errorCard}>
            <Text style={styles.errorNum}>❌ 4</Text>
            <Text style={styles.errorTitle}>Ignorer les collatéraux</Text>
            <Text style={styles.errorDesc}>
              Frères, sœurs, oncles... Leurs actes peuvent contenir des infos sur vos 
              ancêtres directs que vous ne trouvez pas ailleurs.
            </Text>
          </View>

          <View style={styles.errorCard}>
            <Text style={styles.errorNum}>❌ 5</Text>
            <Text style={styles.errorTitle}>Oublier les variations de noms</Text>
            <Text style={styles.errorDesc}>
              Lefevre, Lefebvre, Le Fèvre, Lefèvre... L'orthographe variait énormément. 
              Pensez phonétique !
            </Text>
          </View>

          <View style={styles.errorCard}>
            <Text style={styles.errorNum}>❌ 6</Text>
            <Text style={styles.errorTitle}>Négliger le contexte historique</Text>
            <Text style={styles.errorDesc}>
              Guerres, épidémies, migrations... Comprendre le contexte aide à expliquer 
              les "trous" dans les archives.
            </Text>
          </View>

          <View style={styles.errorCard}>
            <Text style={styles.errorNum}>❌ 7</Text>
            <Text style={styles.errorTitle}>Vouloir aller trop vite</Text>
            <Text style={styles.errorDesc}>
              La généalogie est un marathon, pas un sprint. Prenez le temps de bien 
              documenter chaque génération.
            </Text>
          </View>
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <Text style={styles.h2}>7. Questions Fréquentes</Text>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Jusqu'où peut-on remonter gratuitement ?</Text>
            <Text style={styles.faqAnswer}>
              En France, les registres paroissiaux commencent généralement au XVIe siècle (1539). 
              Avec de la patience, vous pouvez donc remonter jusqu'à 15-20 générations, 
              soit potentiellement le Moyen Âge tardif, gratuitement via les archives départementales.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Combien de temps faut-il pour retrouver ses ancêtres ?</Text>
            <Text style={styles.faqAnswer}>
              Comptez quelques heures pour remonter jusqu'aux arrière-grands-parents, 
              quelques jours pour atteindre le XVIIIe siècle, et plusieurs mois/années 
              pour une généalogie complète sur 10+ générations.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Faut-il savoir lire l'ancien français ?</Text>
            <Text style={styles.faqAnswer}>
              Pour les documents récents (après 1800), non. Pour les registres plus anciens, 
              la paléographie (lecture des écritures anciennes) s'apprend progressivement. 
              Des guides et tutoriels gratuits existent en ligne.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Comment organiser toutes ces informations ?</Text>
            <Text style={styles.faqAnswer}>
              Utilisez un logiciel ou une application d'arbre généalogique comme AILA. 
              Cela vous permet de centraliser les informations, d'ajouter des sources, 
              et de visualiser facilement votre arbre.
            </Text>
          </View>
        </View>

        {/* CTA */}
        <View style={[styles.section, styles.ctaSection]}>
          <Text style={styles.ctaTitle}>🌳 Prêt à Retrouver Vos Ancêtres ?</Text>
          <Text style={styles.ctaText}>
            Créez votre arbre généalogique gratuit avec AILA et organisez toutes vos 
            découvertes. Partagez avec votre famille et préservez votre histoire.
          </Text>
          
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.ctaButtonText}>Créer Mon Arbre Gratuit</Text>
            <Ionicons name="arrow-forward" size={20} color="#0A1628" />
          </TouchableOpacity>
        </View>

        {/* SEO Footer */}
        <SEOFooter currentPage="/retrouver-ancetres-gratuitement" />
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
  breadcrumb: { paddingHorizontal: 20, marginBottom: 10 },
  breadcrumbText: { fontSize: 12, color: '#6B7C93' },
  hero: { padding: 24, paddingTop: 10 },
  badge: { backgroundColor: 'rgba(76, 175, 80, 0.2)', color: '#4CAF50', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, fontSize: 12, fontWeight: '600', alignSelf: 'flex-start', marginBottom: 16 },
  h1: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 16, lineHeight: 36 },
  subtitle: { fontSize: 16, color: '#B8C5D6', lineHeight: 26, marginBottom: 24 },
  authorBox: { flexDirection: 'row', backgroundColor: '#1A2A44', borderRadius: 12, padding: 16, alignItems: 'center' },
  authorAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#D4AF37', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  authorAvatarText: { fontSize: 24 },
  authorInfo: { flex: 1 },
  authorName: { fontSize: 14, fontWeight: '600', color: '#FFFFFF', marginBottom: 2 },
  authorCredentials: { fontSize: 12, color: '#D4AF37', marginBottom: 2 },
  authorDate: { fontSize: 11, color: '#6B7C93' },
  tocBox: { backgroundColor: '#1A2A44', margin: 20, borderRadius: 12, padding: 20, borderLeftWidth: 4, borderLeftColor: '#D4AF37' },
  tocTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12 },
  tocItem: { fontSize: 14, color: '#B8C5D6', marginBottom: 8, paddingLeft: 8 },
  featuredSnippet: { backgroundColor: '#0D4F3C', margin: 20, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#4CAF50' },
  featuredSnippetTitle: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50', marginBottom: 12 },
  featuredSnippetText: { fontSize: 14, color: '#FFFFFF', lineHeight: 24 },
  section: { padding: 24 },
  sectionAlt: { backgroundColor: '#0D1E36' },
  h2: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 16 },
  h3: { fontSize: 18, fontWeight: '600', color: '#D4AF37', marginBottom: 12, marginTop: 20 },
  paragraph: { fontSize: 15, color: '#B8C5D6', lineHeight: 26, marginBottom: 16 },
  bold: { fontWeight: 'bold', color: '#FFFFFF' },
  tipBox: { backgroundColor: 'rgba(212, 175, 55, 0.1)', borderRadius: 12, padding: 16, marginVertical: 16, borderLeftWidth: 4, borderLeftColor: '#D4AF37' },
  tipTitle: { fontSize: 14, fontWeight: 'bold', color: '#D4AF37', marginBottom: 8 },
  tipText: { fontSize: 14, color: '#B8C5D6', lineHeight: 22 },
  warningBox: { backgroundColor: 'rgba(255, 152, 0, 0.1)', borderRadius: 12, padding: 16, marginVertical: 16, borderLeftWidth: 4, borderLeftColor: '#FF9800' },
  warningTitle: { fontSize: 14, fontWeight: 'bold', color: '#FF9800', marginBottom: 8 },
  warningText: { fontSize: 14, color: '#B8C5D6', lineHeight: 22 },
  checkList: { backgroundColor: '#1A2A44', borderRadius: 12, padding: 16, marginVertical: 12 },
  checkItem: { fontSize: 14, color: '#B8C5D6', marginBottom: 10, lineHeight: 22 },
  sectionCard: { backgroundColor: '#1A2A44', borderRadius: 12, padding: 20, marginVertical: 12 },
  sectionCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionCardIcon: { fontSize: 24, marginRight: 12 },
  sectionCardTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  cardText: { fontSize: 14, color: '#B8C5D6', marginBottom: 6, paddingLeft: 8 },
  stepsBox: { marginVertical: 16 },
  step: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  stepNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#D4AF37', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  stepNumText: { fontSize: 14, fontWeight: 'bold', color: '#0A1628' },
  stepText: { flex: 1, fontSize: 14, color: '#B8C5D6', lineHeight: 22, paddingTop: 4 },
  resourceCard: { backgroundColor: '#1A2A44', borderRadius: 12, padding: 20, marginBottom: 16 },
  resourceName: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  resourceDesc: { fontSize: 14, color: '#B8C5D6', lineHeight: 22, marginBottom: 12 },
  resourcePros: { fontSize: 13, color: '#4CAF50' },
  timelineBox: { marginVertical: 16 },
  timelineItem: { backgroundColor: '#1A2A44', borderRadius: 12, padding: 20, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#D4AF37' },
  timelineWeek: { fontSize: 12, fontWeight: 'bold', color: '#D4AF37', marginBottom: 4 },
  timelineTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  timelineDesc: { fontSize: 14, color: '#B8C5D6', lineHeight: 22 },
  errorCard: { backgroundColor: '#1A2A44', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'flex-start' },
  errorNum: { fontSize: 18, marginRight: 12, width: 30 },
  errorTitle: { fontSize: 15, fontWeight: 'bold', color: '#FF6B6B', marginBottom: 4 },
  errorDesc: { fontSize: 13, color: '#B8C5D6', lineHeight: 20, flex: 1 },
  faqItem: { backgroundColor: '#1A2A44', borderRadius: 12, padding: 20, marginBottom: 16 },
  faqQuestion: { fontSize: 16, fontWeight: '600', color: '#D4AF37', marginBottom: 12 },
  faqAnswer: { fontSize: 14, color: '#B8C5D6', lineHeight: 24 },
  ctaSection: { alignItems: 'center', paddingVertical: 48, backgroundColor: '#0D1E36' },
  ctaTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 12 },
  ctaText: { fontSize: 16, color: '#B8C5D6', textAlign: 'center', lineHeight: 24, maxWidth: 500, marginBottom: 24 },
  ctaButton: { backgroundColor: '#D4AF37', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  ctaButtonText: { color: '#0A1628', fontSize: 18, fontWeight: '600' },
  footer: { padding: 40, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#2A3F5A' },
  footerText: { fontSize: 14, color: '#6B7C93', marginBottom: 16 },
  footerLinks: { flexDirection: 'row', gap: 24 },
  footerLink: { fontSize: 14, color: '#D4AF37' },
});
