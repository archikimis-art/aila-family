import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  icon: string;
}

const articles: Article[] = [
  {
    id: '1',
    title: "Comment commencer votre arbre généalogique : Le guide complet",
    excerpt: "Découvrez les étapes essentielles pour débuter vos recherches généalogiques et créer un arbre familial complet.",
    content: `La généalogie est une aventure passionnante qui vous permet de découvrir vos racines et de comprendre d'où vous venez. Voici un guide complet pour bien commencer.

**1. Commencez par ce que vous connaissez**

La première étape consiste à rassembler les informations que vous possédez déjà. Interrogez vos parents, grands-parents, oncles et tantes. Notez les noms complets, dates de naissance, lieux de naissance, professions et toute anecdote familiale.

**2. Organisez vos informations**

Utilisez une application comme AÏLA pour organiser vos données de manière structurée. Un arbre généalogique numérique vous permet de visualiser facilement les liens familiaux et d'ajouter des informations au fur et à mesure de vos découvertes.

**3. Consultez les documents familiaux**

Recherchez dans les archives familiales : actes de naissance, certificats de mariage, photos anciennes, lettres, livrets de famille. Ces documents sont des sources précieuses d'informations.

**4. Explorez les archives en ligne**

De nombreuses archives départementales et nationales sont désormais numérisées et accessibles en ligne. Les registres paroissiaux, les recensements et les actes d'état civil peuvent révéler des informations sur vos ancêtres.

**5. Vérifiez vos sources**

En généalogie, il est important de recouper les informations. Une même personne peut avoir des variations d'orthographe de son nom selon les documents.

**6. Partagez avec votre famille**

La généalogie est plus enrichissante quand elle est partagée. Avec AÏLA, vous pouvez inviter vos proches à consulter et contribuer à l'arbre familial.`,
    date: "15 janvier 2025",
    readTime: "8 min",
    icon: "book-outline"
  },
  {
    id: '2',
    title: "Les erreurs à éviter en généalogie",
    excerpt: "Évitez les pièges courants qui peuvent fausser vos recherches généalogiques et compromettre la fiabilité de votre arbre.",
    content: `La recherche généalogique demande rigueur et méthode. Voici les erreurs les plus courantes à éviter pour construire un arbre fiable.

**1. Ne pas vérifier les sources**

L'erreur la plus répandue est de copier des informations d'autres arbres sans vérification. Les erreurs se propagent ainsi d'arbre en arbre. Vérifiez toujours avec des documents originaux.

**2. Confondre les homonymes**

Dans les petites communautés, il était courant de réutiliser les mêmes prénoms. Deux Jean Dupont nés à la même époque dans le même village peuvent être des personnes différentes. Croisez les informations !

**3. Ignorer les variations d'orthographe**

L'orthographe des noms n'était pas fixe avant le XIXe siècle. MARTIN, MARTEN, MARTAIN peuvent désigner la même famille. Soyez flexible dans vos recherches.

**4. Aller trop vite**

La précipitation mène souvent à des erreurs. Prenez le temps de bien documenter chaque génération avant de passer à la suivante.

**5. Négliger les collatéraux**

Ne vous concentrez pas uniquement sur la ligne directe. Les frères, sœurs, oncles et tantes de vos ancêtres peuvent fournir des informations précieuses.

**6. Oublier de sauvegarder**

Faites régulièrement des sauvegardes de vos recherches. Avec AÏLA, vos données sont automatiquement sauvegardées et vous pouvez les exporter en format JSON ou GEDCOM.`,
    date: "10 janvier 2025",
    readTime: "6 min",
    icon: "warning-outline"
  },
  {
    id: '3',
    title: "Comprendre les liens de parenté et les degrés de cousinage",
    excerpt: "Maîtrisez le vocabulaire de la généalogie : cousins germains, cousins issus de germains, et plus encore.",
    content: `Les liens de parenté peuvent être complexes à comprendre. Voici un guide pour vous y retrouver.

**Les liens directs**

- **Parents** : père et mère
- **Grands-parents** : parents de vos parents
- **Arrière-grands-parents** : parents de vos grands-parents
- **Trisaïeuls** : parents de vos arrière-grands-parents

**Les liens collatéraux**

- **Frères et sœurs** : enfants des mêmes parents
- **Demi-frères/sœurs** : un seul parent en commun
- **Oncles et tantes** : frères et sœurs de vos parents
- **Neveux et nièces** : enfants de vos frères et sœurs

**Les cousins**

- **Cousins germains** : enfants de vos oncles et tantes (vous partagez les mêmes grands-parents)
- **Cousins issus de germains** : enfants de cousins germains (vous partagez les mêmes arrière-grands-parents)
- **Petits-cousins** : enfants de cousins issus de germains

**Les degrés de parenté**

En droit français, le degré de parenté se calcule en comptant les générations. Entre vous et votre cousin germain, il y a 4 degrés : vous → votre parent → grand-parent commun → oncle/tante → cousin.

**Les termes à connaître**

- **Ascendants** : ancêtres (parents, grands-parents, etc.)
- **Descendants** : enfants, petits-enfants, etc.
- **Collatéraux** : frères, sœurs, cousins
- **Alliés** : famille par mariage (beau-père, belle-sœur, etc.)`,
    date: "5 janvier 2025",
    readTime: "7 min",
    icon: "people-outline"
  },
  {
    id: '4',
    title: "Les archives en ligne : où chercher vos ancêtres",
    excerpt: "Découvrez les meilleures ressources en ligne pour retrouver la trace de vos ancêtres dans les archives.",
    content: `Internet a révolutionné la recherche généalogique. Voici les principales ressources en ligne pour retrouver vos ancêtres.

**Les Archives Départementales**

Chaque département français a numérisé une grande partie de ses archives. Vous y trouverez :
- Registres paroissiaux (avant 1792)
- État civil (après 1792)
- Recensements de population
- Registres matricules militaires

**Les sites nationaux**

- **Archives Nationales** (archives-nationales.culture.gouv.fr) : documents de l'État central
- **Geneanet** : base de données collaborative avec des millions d'arbres
- **Filae** : archives numérisées et indexées
- **FamilySearch** : site gratuit des Mormons avec des milliards de documents

**Les archives spécialisées**

- **Mémoire des Hommes** : archives militaires (morts pour la France, journaux des unités)
- **Légion d'Honneur** : base de données des décorés
- **AN-SIV** : notaires parisiens

**Les registres paroissiaux et d'état civil**

Ces registres sont la base de toute recherche généalogique. Ils contiennent :
- Actes de baptême/naissance
- Actes de mariage
- Actes de sépulture/décès

**Conseils pratiques**

1. Commencez par les archives de la commune d'origine
2. Notez toujours les cotes des documents consultés
3. Téléchargez les images des actes importants
4. Utilisez les tables décennales pour accélérer vos recherches`,
    date: "28 décembre 2024",
    readTime: "9 min",
    icon: "search-outline"
  },
  {
    id: '5',
    title: "Préserver et transmettre l'histoire familiale",
    excerpt: "Apprenez à conserver vos documents familiaux et à transmettre l'héritage généalogique aux générations futures.",
    content: `La généalogie n'est pas qu'une collection de dates et de noms. C'est la préservation d'un patrimoine immatériel précieux.

**Collecter les témoignages**

Les souvenirs familiaux sont fragiles. Enregistrez les récits de vos aînés pendant qu'il est encore temps. Posez des questions sur :
- Leur enfance et leur vie quotidienne
- Les traditions familiales
- Les métiers exercés par leurs parents
- Les événements historiques qu'ils ont vécus

**Numériser les documents anciens**

Scannez ou photographiez les documents et photos anciennes. Conservez-les en haute résolution et faites des sauvegardes sur plusieurs supports.

**Organiser vos archives familiales**

Classez vos documents par famille et par génération. Identifiez les personnes sur les photos anciennes tant que des témoins peuvent les reconnaître.

**Partager avec la famille**

Avec AÏLA, vous pouvez :
- Inviter vos proches à consulter l'arbre
- Utiliser le chat familial pour échanger
- Permettre à chacun de contribuer

**Transmettre aux jeunes générations**

Intéressez les enfants à l'histoire familiale :
- Racontez des anecdotes sur leurs ancêtres
- Montrez-leur les photos anciennes
- Visitez avec eux les lieux où vivaient vos ancêtres
- Faites-les participer à la création de l'arbre

**Protéger le patrimoine**

- Conservez les documents originaux à l'abri de l'humidité et de la lumière
- Ne collez jamais directement sur les photos anciennes
- Utilisez des pochettes sans acide pour le rangement
- Exportez régulièrement votre arbre en format GEDCOM`,
    date: "20 décembre 2024",
    readTime: "7 min",
    icon: "heart-outline"
  },
];

export default function BlogScreen() {
  const router = useRouter();
  const [selectedArticle, setSelectedArticle] = React.useState<Article | null>(null);

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
              <Text style={styles.articleReadTime}>{selectedArticle.readTime} de lecture</Text>
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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
            Découvrez nos articles pour vous aider dans vos recherches généalogiques 
            et créer un arbre familial complet et précis.
          </Text>
        </View>

        {/* Articles List */}
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
                <View style={styles.articleMeta}>
                  <Text style={styles.articleDate}>{article.date}</Text>
                  <Text style={styles.articleReadTime}>{article.readTime}</Text>
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
            Créez votre arbre généalogique gratuitement avec AÏLA et 
            préservez l'histoire de votre famille pour les générations futures.
          </Text>
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => router.push('/register')}
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  introText: {
    fontSize: 15,
    color: '#B8C5D6',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  articlesList: {
    padding: 16,
  },
  articleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  articleIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  articleInfo: {
    flex: 1,
  },
  articleMeta: {
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
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    lineHeight: 20,
  },
  articleExcerpt: {
    fontSize: 13,
    color: '#B8C5D6',
    lineHeight: 18,
  },
  articleFull: {
    padding: 20,
  },
  articleFullTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    lineHeight: 32,
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
  ctaSection: {
    margin: 16,
    padding: 24,
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  ctaText: {
    fontSize: 14,
    color: '#B8C5D6',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 25,
  },
  ctaButtonText: {
    color: '#0A1628',
    fontSize: 16,
    fontWeight: '600',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
    gap: 8,
  },
  homeButtonText: {
    color: '#D4AF37',
    fontSize: 15,
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
