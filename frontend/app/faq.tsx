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
import { useTranslation } from 'react-i18next';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    category: "Premiers pas",
    question: "Comment créer mon premier arbre généalogique ?",
    answer: "Pour créer votre premier arbre généalogique avec AÏLA, commencez par créer un compte gratuit. Une fois connecté, cliquez sur 'Ajouter une personne' pour ajouter le premier membre de votre famille. Vous pouvez commencer par vous-même, vos parents ou vos grands-parents. Ensuite, utilisez le bouton 'Créer un lien' pour établir les relations familiales entre les personnes (parent, enfant, époux/épouse, frère/sœur)."
  },
  {
    category: "Premiers pas",
    question: "Dois-je créer un compte pour utiliser AÏLA ?",
    answer: "Vous pouvez découvrir AÏLA en mode aperçu sans créer de compte. Cependant, pour sauvegarder votre arbre généalogique et accéder à toutes les fonctionnalités (partage familial, chat, export de données), vous devrez créer un compte gratuit. Vos données seront alors sécurisées et accessibles depuis n'importe quel appareil."
  },
  {
    category: "Premiers pas",
    question: "AÏLA est-il gratuit ?",
    answer: "Oui, AÏLA propose une version gratuite complète qui vous permet de créer votre arbre généalogique, d'ajouter des membres, de créer des liens familiaux, et d'utiliser le chat familial. Des fonctionnalités premium sont également disponibles pour les utilisateurs qui souhaitent des options avancées comme la fusion d'arbres ou l'export en différents formats."
  },
  {
    category: "Gestion de l'arbre",
    question: "Comment ajouter une personne à mon arbre ?",
    answer: "Pour ajouter une personne, cliquez sur le bouton 'Ajouter' dans la vue de l'arbre. Remplissez les informations de la personne : prénom, nom, genre, date et lieu de naissance, et éventuellement date et lieu de décès. Vous pouvez également ajouter des notes et une branche géographique pour mieux organiser votre arbre."
  },
  {
    category: "Gestion de l'arbre",
    question: "Comment créer un lien de parenté entre deux personnes ?",
    answer: "Après avoir ajouté au moins deux personnes, cliquez sur le bouton 'Lien' dans la vue de l'arbre. Sélectionnez le type de relation (Parent, Enfant, Époux/Épouse, Frère/Sœur), puis choisissez les deux personnes concernées. Le lien sera automatiquement créé et visible dans l'arbre généalogique."
  },
  {
    category: "Gestion de l'arbre",
    question: "Puis-je modifier les informations d'une personne ?",
    answer: "Oui, vous pouvez modifier les informations d'une personne à tout moment. Cliquez sur la carte de la personne dans l'arbre ou accédez à l'onglet 'Membres', puis sélectionnez la personne à modifier. Vous pourrez mettre à jour toutes ses informations : nom, dates, lieu, notes, etc."
  },
  {
    category: "Gestion de l'arbre",
    question: "Comment supprimer une personne de mon arbre ?",
    answer: "Pour supprimer une personne, accédez à sa fiche en cliquant sur sa carte dans l'arbre. Faites défiler jusqu'en bas de la fiche et cliquez sur 'Supprimer cette personne'. Attention : cette action supprimera également tous les liens associés à cette personne."
  },
  {
    category: "Navigation et affichage",
    question: "Comment naviguer dans mon arbre sur mobile ?",
    answer: "Sur mobile, vous pouvez naviguer dans votre arbre de plusieurs façons : utilisez un doigt pour faire glisser l'arbre dans toutes les directions, pincez avec deux doigts pour zoomer ou dézoomer, et faites un double-tap pour recentrer la vue. Les boutons +/- permettent également de contrôler le zoom."
  },
  {
    category: "Navigation et affichage",
    question: "Que signifient les couleurs des cartes dans l'arbre ?",
    answer: "Les couleurs des cartes indiquent le genre de la personne : les cartes bleues représentent les hommes, les cartes roses représentent les femmes, et les cartes grises sont utilisées pour les personnes dont le genre n'est pas spécifié. Les lignes dorées en pointillés représentent les liens de couple, tandis que les lignes continues représentent les liens parent-enfant."
  },
  {
    category: "Partage et collaboration",
    question: "Comment partager mon arbre avec ma famille ?",
    answer: "AÏLA permet de partager votre arbre généalogique avec vos proches. Accédez à votre profil, puis utilisez la fonction 'Partager l'arbre' pour générer un lien de partage. Vous pouvez définir la durée de validité du lien et les permissions accordées (lecture seule ou édition). Envoyez ensuite ce lien à vos proches par email ou messagerie."
  },
  {
    category: "Partage et collaboration",
    question: "Qu'est-ce que la fusion d'arbres ?",
    answer: "La fusion d'arbres est une fonctionnalité premium qui permet de combiner deux arbres généalogiques distincts. C'est utile lorsque deux membres de la famille ont créé des arbres séparés et souhaitent les regrouper. Le système détecte automatiquement les personnes en commun et vous guide pour résoudre les éventuels conflits."
  },
  {
    category: "Chat familial",
    question: "Comment fonctionne le chat familial ?",
    answer: "Le chat familial permet aux membres de votre famille de communiquer directement dans l'application. Tous les membres qui ont accès à votre arbre peuvent participer aux discussions. C'est un excellent moyen de partager des souvenirs, de poser des questions sur l'histoire familiale, ou simplement de rester en contact."
  },
  {
    category: "Données et confidentialité",
    question: "Mes données sont-elles sécurisées ?",
    answer: "Oui, la sécurité de vos données est notre priorité. AÏLA utilise le chiffrement SSL pour toutes les communications, et vos données sont stockées de manière sécurisée. Nous respectons le RGPD et ne partageons jamais vos informations personnelles avec des tiers sans votre consentement explicite."
  },
  {
    category: "Données et confidentialité",
    question: "Comment exporter mes données ?",
    answer: "Vous pouvez exporter vos données à tout moment depuis votre profil. AÏLA propose l'export au format JSON (pour sauvegarde ou transfert) et supporte également l'import/export au format GEDCOM, le standard international pour les données généalogiques, compatible avec la plupart des logiciels de généalogie."
  },
  {
    category: "Données et confidentialité",
    question: "Puis-je supprimer mon compte et toutes mes données ?",
    answer: "Oui, conformément au RGPD, vous avez le droit de supprimer votre compte et toutes vos données. Accédez à votre profil, puis à la section 'Protection des données'. Vous y trouverez l'option 'Supprimer mon compte'. Cette action est irréversible et supprimera définitivement toutes vos données, y compris votre arbre généalogique."
  },
  {
    category: "Technique",
    question: "AÏLA fonctionne-t-il hors ligne ?",
    answer: "Actuellement, AÏLA nécessite une connexion internet pour fonctionner car vos données sont synchronisées en temps réel avec nos serveurs sécurisés. Cela garantit que vous avez toujours accès à la dernière version de votre arbre, quel que soit l'appareil utilisé."
  },
  {
    category: "Technique",
    question: "Sur quels appareils puis-je utiliser AÏLA ?",
    answer: "AÏLA est disponible sur tous les appareils modernes : smartphones (iOS et Android), tablettes, et ordinateurs via votre navigateur web. L'interface s'adapte automatiquement à la taille de votre écran pour une expérience optimale."
  },
  {
    category: "Technique",
    question: "Que faire si l'arbre ne s'affiche pas correctement ?",
    answer: "Si vous rencontrez des problèmes d'affichage, essayez d'abord de rafraîchir la page ou de redémarrer l'application. Utilisez les boutons de zoom (+/-) et le bouton de recentrage pour ajuster la vue. Si le problème persiste, videz le cache de votre navigateur ou réinstallez l'application."
  },
];

export default function FAQScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");

  const categories = ["Tous", ...Array.from(new Set(faqData.map(item => item.category)))];
  
  const filteredFAQ = selectedCategory === "Tous" 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('faq.title') || 'FAQ'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.introSection}>
          <Ionicons name="help-circle-outline" size={48} color="#D4AF37" />
          <Text style={styles.introTitle}>{t('faq.howCanWeHelp') || 'Comment pouvons-nous vous aider ?'}</Text>
          <Text style={styles.introText}>
            {t('faq.intro') || "Trouvez rapidement des réponses à vos questions sur AÏLA, l'application de création d'arbres généalogiques."}
          </Text>
        </View>

        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* FAQ Items */}
        <View style={styles.faqContainer}>
          {filteredFAQ.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.faqItem}
              onPress={() => toggleExpand(index)}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <View style={styles.faqQuestion}>
                  <Text style={styles.categoryBadge}>{item.category}</Text>
                  <Text style={styles.questionText}>{item.question}</Text>
                </View>
                <Ionicons 
                  name={expandedIndex === index ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#D4AF37" 
                />
              </View>
              {expandedIndex === index && (
                <View style={styles.answerContainer}>
                  <Text style={styles.answerText}>{item.answer}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Vous n'avez pas trouvé votre réponse ?</Text>
          <Text style={styles.contactText}>
            Notre équipe est là pour vous aider. N'hésitez pas à nous contacter 
            pour toute question concernant AÏLA.
          </Text>
          <TouchableOpacity style={styles.contactButton}>
            <Ionicons name="mail-outline" size={20} color="#0A1628" />
            <Text style={styles.contactButtonText}>Nous contacter</Text>
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
  categoryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1E3A5F',
    marginRight: 10,
  },
  categoryButtonActive: {
    backgroundColor: '#D4AF37',
  },
  categoryText: {
    color: '#B8C5D6',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#0A1628',
  },
  faqContainer: {
    padding: 16,
  },
  faqItem: {
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestion: {
    flex: 1,
    marginRight: 12,
  },
  categoryBadge: {
    fontSize: 11,
    color: '#D4AF37',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  questionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  answerContainer: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#2A4A6A',
  },
  answerText: {
    fontSize: 14,
    color: '#B8C5D6',
    lineHeight: 22,
    paddingTop: 12,
  },
  contactSection: {
    margin: 16,
    padding: 20,
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  contactText: {
    fontSize: 14,
    color: '#B8C5D6',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  contactButtonText: {
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
