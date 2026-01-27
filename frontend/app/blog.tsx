import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BlogComments from '../src/components/BlogComments';
import ShareButtons from '../src/components/ShareButtons';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  read_time: string;
  icon: string;
}

// Articles complets
const articles: Article[] = [
  {
    id: '7',
    title: "Partagez l'histoire de votre région d'origine",
    excerpt: "Racontez l'histoire, la géographie, la culture et les traditions de votre région, où que vous soyez dans le monde.",
    content: `Chaque famille porte en elle l'histoire d'une région, d'un terroir, d'une culture. Aujourd'hui, nous vous invitons à partager ces trésors avec la communauté AÏLA.

**🌍 D'où venez-vous ?**

Que vos origines soient en Europe, en Afrique, en Amérique, en Asie ou en Océanie, chaque histoire mérite d'être racontée. AÏLA est une communauté internationale qui célèbre la diversité de nos origines.

**🌎 Amérique du Nord & du Sud**
États-Unis, Canada, Mexique, Brésil, Argentine, Colombie, Pérou, Chili...

**🌍 Europe**
France, Italie, Espagne, Portugal, Allemagne, Belgique, Suisse, Pologne, Royaume-Uni, Irlande...

**🌍 Afrique**
Algérie, Maroc, Tunisie, Sénégal, Côte d'Ivoire, Cameroun, Congo, Madagascar, Afrique du Sud...

**🌏 Asie & Océanie**
Chine, Inde, Japon, Vietnam, Philippines, Liban, Turquie, Australie, Nouvelle-Zélande...

**🏝️ Îles & Territoires**
Antilles, Réunion, Mayotte, Polynésie, Nouvelle-Calédonie, Maurice, Haïti, Cuba...

**📜 L'histoire de votre région**

Partagez avec nous :
- Les grands événements historiques qui ont marqué votre région
- Les personnages célèbres qui en sont originaires
- Les migrations et diasporas
- L'évolution de votre pays ou région

**🎭 La culture et les traditions**

Racontez-nous :
- Les fêtes et célébrations traditionnelles
- Les costumes et habits traditionnels
- La musique, les danses, les chants
- Les légendes et contes populaires
- Les croyances et rituels familiaux

**🍽️ La gastronomie**

Partagez vos recettes familiales :
- Les plats traditionnels de votre région
- Les spécialités transmises de génération en génération
- Les ingrédients typiques et épices locales

**💬 Participez à la discussion !**

Dans les commentaires, présentez votre région d'origine :

📍 **Pays / Région** : 
🌍 **Continent** : 
📜 **Un fait historique** : 
🎭 **Une tradition** : 
🍽️ **Un plat typique** : 
🗣️ **Une expression locale** :

Nous avons hâte de découvrir vos origines !`,
    date: "20 janvier 2025",
    read_time: "5 min",
    icon: "earth-outline"
  },
  {
    id: '6',
    title: "Comment retrouver ses ancêtres gratuitement en 2025",
    excerpt: "Découvrez toutes les méthodes et ressources gratuites pour retrouver vos ancêtres. Archives en ligne, astuces et outils.",
    content: `**🎯 Par où commencer ?**

1. **Interrogez votre famille** : Parents, grands-parents détiennent des informations précieuses.
2. **Rassemblez les documents** : Livrets de famille, actes de naissance, photos anciennes.
3. **Créez votre arbre** : Utilisez AÏLA pour organiser vos découvertes.

**📚 Les Archives Départementales (GRATUIT)**

Chaque département a son site d'archives avec accès gratuit :
- Registres paroissiaux (avant 1792)
- État civil (depuis 1792)
- Recensements de population
- Registres matricules militaires

**🌐 Sites gratuits incontournables**

1. **FamilySearch.org** : Milliards de documents gratuits
2. **Geneanet.org** : Arbres partagés par d'autres généalogistes
3. **Mémoire des Hommes** : Archives militaires

**💡 Astuces**

- Utilisez les tables décennales
- Variez l'orthographe des noms
- Cherchez les frères et sœurs
- Exploitez les témoins de mariage

**🚀 Commencez maintenant !**

Créez votre arbre sur AÏLA et découvrez vos ancêtres dès aujourd'hui !`,
    date: "15 janvier 2025",
    read_time: "8 min",
    icon: "search-outline"
  },
  {
    id: '1',
    title: "Comment commencer votre arbre généalogique",
    excerpt: "Découvrez les étapes essentielles pour débuter vos recherches généalogiques et créer un arbre familial complet.",
    content: `**1. Commencez par ce que vous connaissez**

Rassemblez les informations que vous possédez déjà. Interrogez vos parents, grands-parents. Notez les noms, dates, lieux et professions.

**2. Organisez vos informations**

Utilisez AÏLA pour organiser vos données. Un arbre numérique permet de visualiser les liens familiaux.

**3. Consultez les documents familiaux**

Recherchez : actes de naissance, certificats de mariage, photos anciennes, lettres, livrets de famille.

**4. Explorez les archives en ligne**

De nombreuses archives sont numérisées : registres paroissiaux, recensements, actes d'état civil.

**5. Vérifiez vos sources**

Recoupez les informations. Une même personne peut avoir des variations d'orthographe.

**6. Partagez avec votre famille**

Avec AÏLA, invitez vos proches à consulter et contribuer à l'arbre familial.`,
    date: "15 janvier 2025",
    read_time: "6 min",
    icon: "book-outline"
  },
  {
    id: '2',
    title: "Les erreurs à éviter en généalogie",
    excerpt: "Évitez les pièges courants qui peuvent fausser vos recherches et compromettre la fiabilité de votre arbre.",
    content: `**1. Ne pas vérifier les sources**

Ne copiez pas d'autres arbres sans vérification. Les erreurs se propagent.

**2. Confondre les homonymes**

Deux Jean Dupont peuvent être différents. Croisez les informations !

**3. Ignorer les variations d'orthographe**

MARTIN, MARTEN, MARTAIN peuvent désigner la même famille.

**4. Aller trop vite**

Documentez bien chaque génération avant de passer à la suivante.

**5. Négliger les collatéraux**

Les frères, sœurs, oncles peuvent fournir des informations précieuses.

**6. Oublier de sauvegarder**

Avec AÏLA, vos données sont automatiquement sauvegardées.`,
    date: "10 janvier 2025",
    read_time: "5 min",
    icon: "warning-outline"
  },
  {
    id: '3',
    title: "Comprendre les liens de parenté",
    excerpt: "Maîtrisez le vocabulaire : cousins germains, cousins issus de germains, et plus encore.",
    content: `**Les liens directs**

- Parents : père et mère
- Grands-parents : parents de vos parents
- Arrière-grands-parents : parents de vos grands-parents

**Les liens collatéraux**

- Frères et sœurs : mêmes parents
- Demi-frères/sœurs : un seul parent en commun
- Oncles et tantes : frères et sœurs de vos parents

**Les cousins**

- Cousins germains : enfants de vos oncles/tantes
- Cousins issus de germains : enfants de cousins germains

**Termes à connaître**

- Ascendants : ancêtres
- Descendants : enfants, petits-enfants
- Collatéraux : frères, sœurs, cousins
- Alliés : famille par mariage`,
    date: "5 janvier 2025",
    read_time: "5 min",
    icon: "people-outline"
  },
];

export default function BlogScreen() {
  const router = useRouter();
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  if (selectedArticle) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedArticle(null)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#D4AF37" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Article</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.articleFull}>
            <View style={styles.articleMeta}>
              <Text style={styles.articleDate}>{selectedArticle.date}</Text>
              <Text style={styles.articleReadTime}>{selectedArticle.read_time} de lecture</Text>
            </View>
            <Text style={styles.articleFullTitle}>{selectedArticle.title}</Text>
            <Text style={styles.articleFullContent}>
              {selectedArticle.content.split('\n').map((paragraph, index) => {
                if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                  return (
                    <Text key={index} style={styles.articleSubtitle}>
                      {paragraph.replace(/\*\*/g, '')}{'\n\n'}
                    </Text>
                  );
                }
                return paragraph + '\n\n';
              })}
            </Text>
          </View>

          {/* Share Buttons */}
          <ShareButtons 
            title={selectedArticle.title}
            url={`https://www.aila.family/blog`}
          />

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <BlogComments articleId={selectedArticle.id} />
          </View>

          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => router.push('/register')}
          >
            <Text style={styles.ctaButtonText}>Créer mon arbre généalogique</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2025 AÏLA - L'arbre généalogique qui connecte votre famille
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blog Généalogie</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.introSection}>
          <Ionicons name="newspaper-outline" size={48} color="#D4AF37" />
          <Text style={styles.introTitle}>Conseils & Astuces Généalogie</Text>
          <Text style={styles.introText}>
            Découvrez nos articles pour vous aider dans vos recherches généalogiques.
          </Text>
          {/* Lien vers la communauté */}
          <TouchableOpacity 
            style={styles.communityLink}
            onPress={() => router.push('/community')}
          >
            <Ionicons name="chatbubbles-outline" size={16} color="#D4AF37" />
            <Text style={styles.communityLinkText}>Rejoindre la communauté</Text>
          </TouchableOpacity>
        </View>

        {/* Guides Section */}
        <View style={styles.guidesSection}>
          <Text style={styles.guidesSectionTitle}>📚 Nos Guides</Text>
          
          <TouchableOpacity 
            style={styles.guideLink}
            onPress={() => router.push('/retrouver-ancetres-gratuitement')}
          >
            <View style={styles.guideLinkIcon}>
              <Text style={styles.guideLinkEmoji}>🔍</Text>
            </View>
            <View style={styles.guideLinkContent}>
              <Text style={styles.guideLinkTitle}>Retrouver ses ancêtres gratuitement</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D4AF37" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.guideLink}
            onPress={() => router.push('/genealogie-debutant-guide')}
          >
            <View style={styles.guideLinkIcon}>
              <Text style={styles.guideLinkEmoji}>🎓</Text>
            </View>
            <View style={styles.guideLinkContent}>
              <Text style={styles.guideLinkTitle}>Généalogie pour débutant</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D4AF37" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.guideLink, { backgroundColor: 'rgba(212, 175, 55, 0.15)', borderColor: '#D4AF37' }]}
            onPress={() => {
              const regionArticle = articles.find(a => a.id === '7');
              if (regionArticle) setSelectedArticle(regionArticle);
            }}
          >
            <View style={styles.guideLinkIcon}>
              <Text style={styles.guideLinkEmoji}>🌍</Text>
            </View>
            <View style={styles.guideLinkContent}>
              <Text style={styles.guideLinkTitle}>Partagez l'histoire de votre région</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D4AF37" />
          </TouchableOpacity>
        </View>

        {/* Défis Section - Gaming familial */}
        <View style={styles.challengesBanner}>
          <View style={styles.challengesBannerIcon}>
            <Ionicons name="trophy" size={28} color="#FFF" />
          </View>
          <View style={styles.challengesBannerContent}>
            <Text style={styles.challengesBannerTitle}>🎮 Passez à l'action !</Text>
            <Text style={styles.challengesBannerText}>
              Transformez votre lecture en action familiale
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.challengesBannerButton}
            onPress={() => router.push('/challenges')}
          >
            <Text style={styles.challengesBannerButtonText}>Voir les défis</Text>
          </TouchableOpacity>
        </View>

        {/* Articles Section */}
        <View style={styles.articlesSectionHeader}>
          <Text style={styles.articlesSectionTitle}>📰 Articles</Text>
        </View>

        <View style={styles.articlesList}>
          {articles.map((article) => (
            <TouchableOpacity
              key={article.id}
              style={styles.articleCard}
              onPress={() => setSelectedArticle(article)}
              activeOpacity={0.7}
            >
              <View style={styles.articleIcon}>
                <Ionicons name={article.icon as any} size={28} color="#D4AF37" />
              </View>
              <View style={styles.articleInfo}>
                <View style={styles.articleMetaRow}>
                  <Text style={styles.articleDate}>{article.date}</Text>
                  <Text style={styles.articleReadTime}>{article.read_time}</Text>
                </View>
                <Text style={styles.articleTitle}>{article.title}</Text>
                <Text style={styles.articleExcerpt} numberOfLines={2}>
                  {article.excerpt}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
            </TouchableOpacity>
          ))}
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Prêt à commencer ?</Text>
          <Text style={styles.ctaText}>
            Créez votre arbre généalogique gratuitement avec AÏLA.
          </Text>
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.ctaButtonText}>Créer mon arbre gratuitement</Text>
          </TouchableOpacity>
        </View>

        {/* Back to Home */}
        <TouchableOpacity 
          style={styles.homeButton}
          onPress={() => router.push('/')}
        >
          <Ionicons name="home-outline" size={20} color="#D4AF37" />
          <Text style={styles.homeButtonText}>Retour à l'accueil</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2025 AÏLA - L'arbre généalogique qui connecte votre famille
          </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A5F',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  introSection: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A5F',
  },
  introTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  introText: {
    fontSize: 14,
    color: '#B8C5D6',
    textAlign: 'center',
    marginTop: 8,
  },
  communityLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    borderRadius: 20,
    gap: 6,
  },
  communityLinkText: {
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: '500',
  },
  guidesSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A5F',
  },
  guidesSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  guideLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  guideLinkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  guideLinkEmoji: {
    fontSize: 20,
  },
  guideLinkContent: {
    flex: 1,
  },
  guideLinkTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  challengesBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
  },
  challengesBannerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  challengesBannerContent: {
    flex: 1,
  },
  challengesBannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  challengesBannerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  challengesBannerButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  challengesBannerButtonText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
  },
  articlesSectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  articlesSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  articlesList: {
    padding: 16,
    paddingTop: 8,
  },
  articleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  articleIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  articleInfo: {
    flex: 1,
  },
  articleMetaRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  articleDate: {
    fontSize: 11,
    color: '#6B7C93',
    marginRight: 12,
  },
  articleReadTime: {
    fontSize: 11,
    color: '#D4AF37',
  },
  articleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  articleExcerpt: {
    fontSize: 12,
    color: '#B8C5D6',
    lineHeight: 16,
  },
  articleFull: {
    padding: 20,
  },
  articleMeta: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  articleFullTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    lineHeight: 30,
  },
  articleFullContent: {
    fontSize: 15,
    color: '#B8C5D6',
    lineHeight: 24,
  },
  articleSubtitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  commentsSection: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  ctaSection: {
    margin: 16,
    padding: 20,
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  ctaText: {
    fontSize: 14,
    color: '#B8C5D6',
    textAlign: 'center',
    marginBottom: 16,
  },
  ctaButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  ctaButtonText: {
    color: '#0A1628',
    fontSize: 15,
    fontWeight: '600',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
    gap: 8,
  },
  homeButtonText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7C93',
    textAlign: 'center',
  },
});
