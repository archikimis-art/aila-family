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
      document.title = 'Traditions Familiales : 50 Idées pour Créer et Perpétuer les Vôtres | AILA';
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Découvrez 50+ idées de traditions familiales à créer ou perpétuer. Rituels quotidiens, fêtes, repas, voyages. Renforcez les liens familiaux avec des moments inoubliables.');
      }
    }
  }, []);
  return null;
};

const TraditionCard = ({ emoji, title, description }: { emoji: string; title: string; description: string }) => (
  <View style={styles.traditionCard}>
    <Text style={styles.traditionEmoji}>{emoji}</Text>
    <View style={styles.traditionContent}>
      <Text style={styles.traditionTitle}>{title}</Text>
      <Text style={styles.traditionDesc}>{description}</Text>
    </View>
  </View>
);

export default function TraditionsFamiliales() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <SEOHead />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.push('/')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#D4AF37" />
          </Pressable>
          <Pressable onPress={() => router.push('/')}>
            <Text style={styles.logoText}>🌳 AILA</Text>
          </Pressable>
        </View>

        {/* Breadcrumb SEO */}
        <SEOBreadcrumbs items={BREADCRUMB_CONFIGS['traditions-familiales']} />

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.badge}>🎄 Vie de Famille • Guide 2025</Text>
          <Text style={styles.h1}>Traditions Familiales : 50 Idées pour Créer des Souvenirs Inoubliables</Text>
          <Text style={styles.subtitle}>
            Les traditions familiales sont le ciment qui unit les générations. 
            Découvrez comment créer, perpétuer et transmettre ces moments précieux qui définissent votre famille.
          </Text>

          {/* Author box - EEAT */}
          <View style={styles.authorBox}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorAvatarText}>👨‍👩‍👧</Text>
            </View>
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>Rédigé par l'équipe AILA</Text>
              <Text style={styles.authorCredentials}>Experts en liens familiaux</Text>
              <Text style={styles.authorDate}>Janvier 2025</Text>
            </View>
          </View>
        </View>

        {/* Table of Contents */}
        <View style={styles.tocBox}>
          <Text style={styles.tocTitle}>📑 Sommaire</Text>
          <Text style={styles.tocItem}>1. Pourquoi les traditions sont-elles importantes ?</Text>
          <Text style={styles.tocItem}>2. Traditions quotidiennes</Text>
          <Text style={styles.tocItem}>3. Traditions de fêtes et célébrations</Text>
          <Text style={styles.tocItem}>4. Traditions culinaires</Text>
          <Text style={styles.tocItem}>5. Traditions de vacances</Text>
          <Text style={styles.tocItem}>6. Comment créer vos propres traditions</Text>
        </View>

        {/* Featured Snippet */}
        <View style={styles.featuredSnippet}>
          <Text style={styles.featuredTitle}>💡 En bref : Qu'est-ce qu'une tradition familiale ?</Text>
          <Text style={styles.featuredText}>
            Une tradition familiale est un rituel, une activité ou une célébration 
            qui se répète régulièrement au sein d'une famille. Elle crée un sentiment 
            d'appartenance, renforce les liens et transmet des valeurs aux générations futures. 
            Cela peut être aussi simple qu'un repas du dimanche ou aussi élaboré qu'un voyage annuel.
          </Text>
        </View>

        {/* Section 1 */}
        <View style={styles.section}>
          <Text style={styles.h2}>🌟 Pourquoi les Traditions Familiales Sont-elles Importantes ?</Text>
          
          <Text style={styles.paragraph}>
            Les recherches en psychologie montrent que les enfants qui grandissent avec des traditions 
            familiales ont une meilleure estime d'eux-mêmes et un sentiment d'identité plus fort.
          </Text>

          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Ionicons name="heart" size={24} color="#E91E63" />
              <View style={styles.benefitTextContainer}>
                <Text style={styles.benefitTitle}>Renforcent les liens</Text>
                <Text style={styles.benefitDesc}>Créent des moments de connexion réguliers</Text>
              </View>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
              <View style={styles.benefitTextContainer}>
                <Text style={styles.benefitTitle}>Sentiment de sécurité</Text>
                <Text style={styles.benefitDesc}>La prévisibilité rassure les enfants</Text>
              </View>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="sparkles" size={24} color="#D4AF37" />
              <View style={styles.benefitTextContainer}>
                <Text style={styles.benefitTitle}>Créent des souvenirs</Text>
                <Text style={styles.benefitDesc}>Ces moments deviennent des histoires</Text>
              </View>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="people" size={24} color="#2196F3" />
              <View style={styles.benefitTextContainer}>
                <Text style={styles.benefitTitle}>Transmettent des valeurs</Text>
                <Text style={styles.benefitDesc}>L'héritage culturel se perpétue</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section 2 - Traditions quotidiennes */}
        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.h2}>☀️ Traditions Quotidiennes et Hebdomadaires</Text>
          
          <Text style={styles.paragraph}>
            Les petits rituels du quotidien sont souvent les plus marquants. 
            Ils créent une structure réconfortante pour toute la famille.
          </Text>

          <TraditionCard
            emoji="🌅"
            title="Le petit-déjeuner du dimanche"
            description="Crêpes, pancakes ou brunch : un repas spécial pour commencer la semaine ensemble."
          />
          
          <TraditionCard
            emoji="📖"
            title="L'histoire du soir"
            description="Un moment de lecture avant le coucher, qui deviendra un souvenir d'enfance précieux."
          />
          
          <TraditionCard
            emoji="🎬"
            title="La soirée film"
            description="Chaque vendredi, un membre choisit le film. Pop-corn obligatoire !"
          />
          
          <TraditionCard
            emoji="🍝"
            title="Le dîner sans écrans"
            description="Un repas par semaine où tout le monde parle, écoute et partage."
          />
          
          <TraditionCard
            emoji="🎮"
            title="La soirée jeux"
            description="Jeux de société, cartes ou jeux vidéo en famille une fois par semaine."
          />

          <TraditionCard
            emoji="🚶"
            title="La balade dominicale"
            description="Une promenade en famille pour se reconnecter avec la nature et entre vous."
          />
        </View>

        {/* Section 3 - Fêtes */}
        <View style={styles.section}>
          <Text style={styles.h2}>🎄 Traditions de Fêtes et Célébrations</Text>

          <Text style={styles.h3}>Noël</Text>
          
          <TraditionCard
            emoji="🎅"
            title="Le calendrier de l'Avent DIY"
            description="Chaque jour, une petite surprise ou une activité à faire ensemble."
          />
          
          <TraditionCard
            emoji="🌲"
            title="La décoration du sapin"
            description="Même jour chaque année, avec la même musique et le chocolat chaud."
          />
          
          <TraditionCard
            emoji="📝"
            title="La lettre au Père Noël"
            description="Un moment pour rêver ensemble et partager ses souhaits."
          />
          
          <TraditionCard
            emoji="🥧"
            title="Les biscuits de Noël"
            description="Une recette transmise de génération en génération."
          />

          <Text style={styles.h3}>Anniversaires</Text>
          
          <TraditionCard
            emoji="🎂"
            title="Le petit-déjeuner au lit"
            description="Le jour de l'anniversaire commence avec un plateau surprise."
          />
          
          <TraditionCard
            emoji="📏"
            title="La toise de croissance"
            description="Marquez la taille de chaque enfant à chaque anniversaire."
          />
          
          <TraditionCard
            emoji="💌"
            title="La lettre annuelle"
            description="Écrivez une lettre à votre enfant chaque anniversaire. À lire à 18 ans !"
          />

          <Text style={styles.h3}>Pâques</Text>
          
          <TraditionCard
            emoji="🥚"
            title="La chasse aux œufs"
            description="Un classique indémodable qui fait le bonheur des petits et grands."
          />
          
          <TraditionCard
            emoji="🐣"
            title="La décoration des œufs"
            description="Peinture, autocollants, paillettes : laissez parler la créativité !"
          />
        </View>

        {/* Section 4 - Culinaires */}
        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.h2}>👨‍🍳 Traditions Culinaires</Text>
          
          <Text style={styles.paragraph}>
            La cuisine est un formidable vecteur de transmission. Les recettes de famille 
            portent en elles des histoires et des émotions.
          </Text>

          <TraditionCard
            emoji="📒"
            title="Le livre de recettes familial"
            description="Compilez les recettes de grands-parents, parents, et ajoutez les vôtres."
          />
          
          <TraditionCard
            emoji="🍰"
            title="Le gâteau signature"
            description="Chaque famille a SON gâteau. Quelle est la spécialité de la vôtre ?"
          />
          
          <TraditionCard
            emoji="👨‍👩‍👧‍👦"
            title="Cuisiner ensemble"
            description="Impliquez les enfants dans la préparation des repas de fête."
          />
          
          <TraditionCard
            emoji="🌍"
            title="Le tour du monde culinaire"
            description="Chaque mois, découvrez la cuisine d'un nouveau pays ensemble."
          />

          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>💡 Astuce</Text>
            <Text style={styles.tipText}>
              Documentez vos recettes familiales dans AILA ! Ajoutez les histoires 
              derrière chaque plat pour les générations futures.
            </Text>
          </View>
        </View>

        {/* Section 5 - Vacances */}
        <View style={styles.section}>
          <Text style={styles.h2}>🏖️ Traditions de Vacances</Text>
          
          <TraditionCard
            emoji="📍"
            title="Le lieu de vacances familial"
            description="Retourner au même endroit chaque année crée des souvenirs à couches multiples."
          />
          
          <TraditionCard
            emoji="📸"
            title="La photo annuelle"
            description="Même pose, même endroit, chaque année. Émotion garantie en regardant l'évolution !"
          />
          
          <TraditionCard
            emoji="🗺️"
            title="Le road trip généalogique"
            description="Visitez les villages d'origine de vos ancêtres avec votre arbre AILA."
          />
          
          <TraditionCard
            emoji="⛺"
            title="Le camping annuel"
            description="Une nuit sous les étoiles, sans écrans, juste la famille."
          />
          
          <TraditionCard
            emoji="🎿"
            title="Les vacances multi-générationnelles"
            description="Grands-parents, parents, enfants : tous ensemble une fois par an."
          />
        </View>

        {/* Section 6 - Créer ses traditions */}
        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.h2}>✨ Comment Créer Vos Propres Traditions</Text>
          
          <View style={styles.stepsBox}>
            <View style={styles.step}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>1</Text></View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Identifiez vos valeurs</Text>
                <Text style={styles.stepText}>Qu'est-ce qui compte pour votre famille ? La nature, la créativité, la générosité ?</Text>
              </View>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>2</Text></View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Commencez petit</Text>
                <Text style={styles.stepText}>Une tradition simple a plus de chances de durer qu'une élaborée.</Text>
              </View>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>3</Text></View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Impliquez tout le monde</Text>
                <Text style={styles.stepText}>Demandez l'avis de chaque membre, même les plus jeunes.</Text>
              </View>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>4</Text></View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Soyez constant</Text>
                <Text style={styles.stepText}>La répétition transforme une activité en tradition.</Text>
              </View>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>5</Text></View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Documentez</Text>
                <Text style={styles.stepText}>Prenez des photos, notez les anecdotes. Ces souvenirs sont précieux.</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Traditions à adapter */}
        <View style={styles.section}>
          <Text style={styles.h2}>🔄 Adapter les Traditions aux Familles Modernes</Text>
          
          <Text style={styles.paragraph}>
            Les familles évoluent : recomposées, éloignées géographiquement, monoparentales... 
            Les traditions peuvent s'adapter.
          </Text>

          <View style={styles.adaptCard}>
            <Text style={styles.adaptTitle}>👨‍👩‍👧 Familles recomposées</Text>
            <Text style={styles.adaptText}>
              Créez de nouvelles traditions qui appartiennent à cette nouvelle famille, 
              tout en respectant celles qui existaient avant.
            </Text>
          </View>

          <View style={styles.adaptCard}>
            <Text style={styles.adaptTitle}>🌍 Familles éloignées</Text>
            <Text style={styles.adaptText}>
              Appels vidéo rituels, envoi de colis surprises, jeux en ligne ensemble. 
              La distance n'empêche pas les traditions !
            </Text>
          </View>

          <View style={styles.adaptCard}>
            <Text style={styles.adaptTitle}>⏰ Parents très occupés</Text>
            <Text style={styles.adaptText}>
              Privilégiez la qualité à la quantité. 15 minutes de présence totale 
              valent mieux que des heures distraites.
            </Text>
          </View>
        </View>

        {/* CTA */}
        <View style={[styles.section, styles.ctaSection]}>
          <Text style={styles.ctaTitle}>🌳 Documentez Vos Traditions Familiales</Text>
          <Text style={styles.ctaText}>
            Créez votre arbre généalogique avec AILA et ajoutez les histoires, 
            traditions et recettes qui font l'identité de votre famille.
          </Text>
          
          <Pressable 
            style={styles.ctaButton}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.ctaButtonText}>Créer Mon Arbre Gratuit</Text>
            <Ionicons name="arrow-forward" size={20} color="#0A1628" />
          </Pressable>
        </View>

        {/* Related Articles - Internal Linking */}
        <RelatedArticles silo="famille" currentPage="/traditions-familiales" />

        {/* SEO Footer */}
        <SEOFooter currentPage="/traditions-familiales" />
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
  breadcrumb: { paddingHorizontal: 20, marginBottom: 10 },
  breadcrumbText: { fontSize: 12, color: '#6B7C93' },
  hero: { padding: 24, paddingTop: 10 },
  badge: { backgroundColor: 'rgba(233, 30, 99, 0.2)', color: '#F48FB1', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, fontSize: 12, fontWeight: '600', alignSelf: 'flex-start', marginBottom: 16 },
  h1: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 16, lineHeight: 34 },
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
  featuredTitle: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50', marginBottom: 12 },
  featuredText: { fontSize: 14, color: '#FFFFFF', lineHeight: 24 },
  section: { padding: 24 },
  sectionAlt: { backgroundColor: '#0D1E36' },
  h2: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 16 },
  h3: { fontSize: 18, fontWeight: '600', color: '#D4AF37', marginBottom: 12, marginTop: 24 },
  paragraph: { fontSize: 15, color: '#B8C5D6', lineHeight: 26, marginBottom: 16 },
  benefitsList: { marginTop: 8 },
  benefitItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, gap: 16 },
  benefitTextContainer: { flex: 1 },
  benefitTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 2 },
  benefitDesc: { fontSize: 14, color: '#B8C5D6' },
  traditionCard: { flexDirection: 'row', backgroundColor: '#1A2A44', borderRadius: 12, padding: 16, marginBottom: 12, alignItems: 'flex-start' },
  traditionEmoji: { fontSize: 28, marginRight: 16, width: 40 },
  traditionContent: { flex: 1 },
  traditionTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 },
  traditionDesc: { fontSize: 14, color: '#B8C5D6', lineHeight: 22 },
  tipBox: { backgroundColor: 'rgba(212, 175, 55, 0.1)', borderRadius: 12, padding: 16, marginTop: 16, borderLeftWidth: 4, borderLeftColor: '#D4AF37' },
  tipTitle: { fontSize: 14, fontWeight: 'bold', color: '#D4AF37', marginBottom: 8 },
  tipText: { fontSize: 14, color: '#B8C5D6', lineHeight: 22 },
  stepsBox: { marginVertical: 16 },
  step: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  stepNum: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#D4AF37', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  stepNumText: { fontSize: 16, fontWeight: 'bold', color: '#0A1628' },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 },
  stepText: { fontSize: 14, color: '#B8C5D6', lineHeight: 22 },
  adaptCard: { backgroundColor: '#1A2A44', borderRadius: 12, padding: 20, marginBottom: 12 },
  adaptTitle: { fontSize: 16, fontWeight: '600', color: '#D4AF37', marginBottom: 8 },
  adaptText: { fontSize: 14, color: '#B8C5D6', lineHeight: 22 },
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
