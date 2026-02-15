import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const SEOHead = () => {
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = '50 Questions à Poser à ses Grands-Parents (Avant qu\'il ne soit trop tard) | AILA';
      
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Découvrez 50 questions essentielles à poser à vos grands-parents pour préserver leur histoire et vos souvenirs de famille. Liste complète + conseils pour des conversations mémorables.');
      }
      
      let canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.setAttribute('href', 'https://www.aila.family/questions-grands-parents');
      }
    }
  }, []);
  return null;
};

const QuestionCard = ({ number, question, tip }: { number: number; question: string; tip?: string }) => (
  <View style={styles.questionCard}>
    <View style={styles.questionNumber}>
      <Text style={styles.questionNumberText}>{number}</Text>
    </View>
    <View style={styles.questionContent}>
      <Text style={styles.questionText}>{question}</Text>
      {tip && <Text style={styles.questionTip}>💡 {tip}</Text>}
    </View>
  </View>
);

export default function QuestionsGrandsParents() {
  const router = useRouter();

  const questionsEnfance = [
    { q: "Où es-tu né(e) et comment était ta maison d'enfance ?", tip: "Demandez des détails sur les pièces, les odeurs, les sons" },
    { q: "Quel est ton premier souvenir d'enfance ?", tip: "Laissez-les prendre leur temps pour se remémorer" },
    { q: "À quoi jouais-tu quand tu étais petit(e) ?", tip: "Comparez avec les jeux d'aujourd'hui" },
    { q: "Comment étaient tes parents avec toi ?", tip: "Question sensible, restez bienveillant" },
    { q: "Avais-tu des frères et sœurs ? Comment était votre relation ?", tip: "Parfait pour enrichir l'arbre généalogique" },
    { q: "Quel était ton plat préféré préparé par ta mère/grand-mère ?", tip: "Demandez la recette !" },
    { q: "Comment se passaient les fêtes de Noël dans ta famille ?", tip: "Les traditions familiales sont précieuses" },
    { q: "Quelle était ta matière préférée à l'école ?", tip: null },
    { q: "As-tu eu un animal de compagnie étant enfant ?", tip: null },
    { q: "Quel est le souvenir le plus drôle de ton enfance ?", tip: "Ces histoires sont souvent les meilleures" },
  ];

  const questionsJeunesse = [
    { q: "Comment as-tu rencontré grand-père/grand-mère ?", tip: "L'histoire d'amour de vos grands-parents !" },
    { q: "Quel était ton premier travail ?", tip: "Découvrez leur parcours professionnel" },
    { q: "Comment était ton mariage ?", tip: "Demandez à voir des photos si possible" },
    { q: "Quel était le prix d'une baguette de pain à ton époque ?", tip: "Amusant pour comparer" },
    { q: "As-tu vécu des événements historiques importants ?", tip: "Guerres, événements politiques, etc." },
    { q: "Quelle musique écoutais-tu quand tu étais jeune ?", tip: "Écoutez ensemble ces chansons" },
    { q: "Où as-tu voyagé pour la première fois ?", tip: null },
    { q: "Quelle était la mode vestimentaire à ton époque ?", tip: null },
    { q: "Comment communiquais-tu avec tes amis sans téléphone portable ?", tip: "Lettres, téléphone fixe..." },
    { q: "Quel était ton rêve quand tu avais 20 ans ?", tip: "Comparez avec ce qu'ils ont accompli" },
  ];

  const questionsVieAdulte = [
    { q: "Quel a été le plus beau jour de ta vie ?", tip: null },
    { q: "Quel a été le moment le plus difficile que tu as traversé ?", tip: "Question sensible, soyez à l'écoute" },
    { q: "De quoi es-tu le/la plus fier(e) dans ta vie ?", tip: null },
    { q: "Quel conseil donnerais-tu à ton toi de 20 ans ?", tip: "Sagesse précieuse" },
    { q: "Qu'est-ce qui t'a le plus surpris dans l'évolution du monde ?", tip: "Technologie, société..." },
    { q: "Quelle est la leçon de vie la plus importante que tu as apprise ?", tip: "À transmettre aux générations futures" },
    { q: "Y a-t-il quelque chose que tu regrettes de ne pas avoir fait ?", tip: "Question profonde" },
    { q: "Comment as-tu surmonté les moments difficiles ?", tip: "Résilience et force" },
    { q: "Quelle tradition familiale voudrais-tu qu'on perpétue ?", tip: "Important pour l'héritage familial" },
    { q: "Qu'est-ce qui te rend heureux/heureuse aujourd'hui ?", tip: null },
  ];

  const questionsHistoireFamiliale = [
    { q: "D'où vient notre nom de famille ?", tip: "Origine et signification" },
    { q: "Y a-t-il des histoires familiales qu'on ne m'a jamais racontées ?", tip: "Secrets de famille parfois" },
    { q: "Qui était la personne la plus remarquable dans notre famille ?", tip: "Ancêtres exceptionnels" },
    { q: "Y a-t-il eu des métiers ou talents particuliers dans la famille ?", tip: "Traditions professionnelles" },
    { q: "D'où venaient tes grands-parents ?", tip: "Remontez les générations" },
    { q: "Y a-t-il des objets de famille avec une histoire particulière ?", tip: "Héritages et souvenirs" },
    { q: "Connais-tu des anecdotes sur nos ancêtres ?", tip: null },
    { q: "Y a-t-il eu des migrations dans notre famille ?", tip: "Mouvements géographiques" },
    { q: "Quelles étaient les valeurs importantes dans notre famille ?", tip: "Transmission des valeurs" },
    { q: "Y a-t-il des photos anciennes que tu pourrais me montrer ?", tip: "Proposez de les numériser" },
  ];

  const questionsVous = [
    { q: "Quel est ton souvenir préféré avec moi ?", tip: "Moment émouvant garanti" },
    { q: "Qu'est-ce que tu espères pour mon avenir ?", tip: null },
    { q: "Y a-t-il quelque chose que tu voudrais me transmettre ?", tip: "Savoir, valeur, objet..." },
    { q: "Comment me décrivais-tu quand j'étais bébé ?", tip: "Anecdotes sur votre enfance" },
    { q: "Quel conseil me donnerais-tu pour être heureux dans la vie ?", tip: "Sagesse intergénérationnelle" },
    { q: "Y a-t-il quelque chose que tu n'as jamais osé me dire ?", tip: "Question profonde" },
    { q: "Qu'est-ce qui te fait le plus plaisir quand on se voit ?", tip: null },
    { q: "Comment puis-je te rendre plus heureux/heureuse ?", tip: "Attention et amour" },
    { q: "Y a-t-il un endroit où tu aimerais qu'on aille ensemble ?", tip: "Planifiez une sortie" },
    { q: "Qu'aimerais-tu que je raconte à mes propres enfants sur toi ?", tip: "Transmission de mémoire" },
  ];

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
          <Text style={styles.badge}>👴👵 Guide Familial</Text>
          <Text style={styles.h1}>50 Questions à Poser à ses Grands-Parents</Text>
          <Text style={styles.subtitle}>
            Avant qu'il ne soit trop tard... Préservez leur histoire et créez des souvenirs 
            inoubliables avec ces questions essentielles.
          </Text>
        </View>

        {/* Intro */}
        <View style={styles.section}>
          <View style={styles.introBox}>
            <Text style={styles.introTitle}>⏰ Pourquoi c'est important ?</Text>
            <Text style={styles.introText}>
              Nos grands-parents sont les gardiens de notre histoire familiale. Chaque conversation 
              est une opportunité de préserver des souvenirs précieux, des traditions et une sagesse 
              qui risquent de disparaître. N'attendez pas qu'il soit trop tard.
            </Text>
          </View>
          
          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>💡 Conseils avant de commencer</Text>
            <Text style={styles.tipText}>• Choisissez un moment calme, sans distraction</Text>
            <Text style={styles.tipText}>• Enregistrez la conversation (avec leur accord)</Text>
            <Text style={styles.tipText}>• Prenez des notes dans votre arbre généalogique AILA</Text>
            <Text style={styles.tipText}>• Ne les brusquez pas, laissez-les raconter à leur rythme</Text>
            <Text style={styles.tipText}>• Posez des questions de suivi : "Et ensuite ?"</Text>
          </View>
        </View>

        {/* Questions Enfance */}
        <View style={styles.section}>
          <Text style={styles.h2}>💒 Questions sur leur Enfance</Text>
          <Text style={styles.sectionIntro}>
            Découvrez comment était la vie quand ils étaient petits.
          </Text>
          {questionsEnfance.map((item, index) => (
            <QuestionCard key={index} number={index + 1} question={item.q} tip={item.tip} />
          ))}
        </View>

        {/* Questions Jeunesse */}
        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.h2}>💑 Questions sur leur Jeunesse</Text>
          <Text style={styles.sectionIntro}>
            L'époque de leur rencontre, leurs premiers pas dans la vie adulte.
          </Text>
          {questionsJeunesse.map((item, index) => (
            <QuestionCard key={index} number={index + 11} question={item.q} tip={item.tip} />
          ))}
        </View>

        {/* Questions Vie Adulte */}
        <View style={styles.section}>
          <Text style={styles.h2}>🌟 Questions sur leur Vie</Text>
          <Text style={styles.sectionIntro}>
            Leurs accomplissements, leurs défis, leur sagesse.
          </Text>
          {questionsVieAdulte.map((item, index) => (
            <QuestionCard key={index} number={index + 21} question={item.q} tip={item.tip} />
          ))}
        </View>

        {/* Questions Histoire Familiale */}
        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.h2}>🌳 Questions sur l'Histoire Familiale</Text>
          <Text style={styles.sectionIntro}>
            Remontez dans le temps et découvrez vos origines.
          </Text>
          {questionsHistoireFamiliale.map((item, index) => (
            <QuestionCard key={index} number={index + 31} question={item.q} tip={item.tip} />
          ))}
        </View>

        {/* Questions Sur Vous */}
        <View style={styles.section}>
          <Text style={styles.h2}>❤️ Questions sur Votre Relation</Text>
          <Text style={styles.sectionIntro}>
            Renforcez votre lien et créez des moments précieux.
          </Text>
          {questionsVous.map((item, index) => (
            <QuestionCard key={index} number={index + 41} question={item.q} tip={item.tip} />
          ))}
        </View>

        {/* CTA */}
        <View style={[styles.section, styles.ctaSection]}>
          <Text style={styles.ctaTitle}>📝 Préservez ces souvenirs pour toujours</Text>
          <Text style={styles.ctaText}>
            Créez votre arbre généalogique familial avec AILA et ajoutez toutes ces histoires, 
            photos et souvenirs. Partagez-les avec toute votre famille.
          </Text>
          
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.ctaButtonText}>Créer Mon Arbre Gratuit</Text>
            <Ionicons name="arrow-forward" size={20} color="#0A1628" />
          </TouchableOpacity>
          
          <View style={styles.features}>
            <Text style={styles.featureItem}>✓ Gratuit et illimité</Text>
            <Text style={styles.featureItem}>✓ Ajoutez photos et histoires</Text>
            <Text style={styles.featureItem}>✓ Partagez avec la famille</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 AILA Famille</Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => router.push('/arbre-genealogique-gratuit')}>
              <Text style={styles.footerLink}>Arbre Gratuit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/blog')}>
              <Text style={styles.footerLink}>Blog</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/faq')}>
              <Text style={styles.footerLink}>FAQ</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  backButton: {
    padding: 4,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  hero: {
    padding: 40,
    paddingTop: 20,
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
    fontSize: 32,
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
  },
  section: {
    padding: 24,
  },
  sectionAlt: {
    backgroundColor: '#0D1E36',
  },
  introBox: {
    backgroundColor: '#1A2A44',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#D4AF37',
  },
  introTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  introText: {
    fontSize: 15,
    color: '#B8C5D6',
    lineHeight: 24,
  },
  tipBox: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#B8C5D6',
    lineHeight: 24,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sectionIntro: {
    fontSize: 15,
    color: '#6B7C93',
    marginBottom: 20,
  },
  questionCard: {
    flexDirection: 'row',
    backgroundColor: '#1A2A44',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  questionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  questionNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0A1628',
  },
  questionContent: {
    flex: 1,
  },
  questionText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  questionTip: {
    fontSize: 13,
    color: '#4CAF50',
    marginTop: 8,
    fontStyle: 'italic',
  },
  ctaSection: {
    alignItems: 'center',
    backgroundColor: '#0D1E36',
    paddingVertical: 48,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  ctaText: {
    fontSize: 16,
    color: '#B8C5D6',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 500,
    marginBottom: 24,
  },
  ctaButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  ctaButtonText: {
    color: '#0A1628',
    fontSize: 18,
    fontWeight: '600',
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  featureItem: {
    fontSize: 14,
    color: '#4CAF50',
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
