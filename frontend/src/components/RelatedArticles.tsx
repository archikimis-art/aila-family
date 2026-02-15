import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface RelatedArticle {
  route: string;
  title: string;
  emoji: string;
  description?: string;
}

interface RelatedArticlesProps {
  silo: 'genealogie' | 'famille' | 'produit';
  currentPage?: string;
  maxItems?: number;
}

// Internal linking configuration by silo
const SILO_ARTICLES: Record<string, RelatedArticle[]> = {
  genealogie: [
    {
      route: '/arbre-genealogique-gratuit',
      title: 'Créer son arbre généalogique gratuit',
      emoji: '🌳',
      description: 'Guide complet pour débuter'
    },
    {
      route: '/retrouver-ancetres-gratuitement',
      title: 'Retrouver ses ancêtres',
      emoji: '🔍',
      description: 'Méthodes et ressources gratuites'
    },
    {
      route: '/genealogie-debutant-guide',
      title: 'Guide du débutant',
      emoji: '🎓',
      description: 'Par où commencer ?'
    },
    {
      route: '/questions-grands-parents',
      title: 'Questions à poser aux grands-parents',
      emoji: '👴',
      description: '50 questions essentielles'
    },
    {
      route: '/arbre-genealogique-famille-recomposee',
      title: 'Arbre pour famille recomposée',
      emoji: '👨‍👩‍👧‍👦',
      description: 'Cas particuliers et solutions'
    },
  ],
  famille: [
    {
      route: '/traditions-familiales',
      title: 'Traditions familiales',
      emoji: '🎄',
      description: '50 idées à créer'
    },
    {
      route: '/organiser-cousinade',
      title: 'Organiser une cousinade',
      emoji: '🎉',
      description: 'Guide + checklist complète'
    },
    {
      route: '/ecrire-histoire-famille',
      title: 'Écrire l\'histoire familiale',
      emoji: '✍️',
      description: 'Transformer ses recherches en récit'
    },
    {
      route: '/preserver-histoire-famille',
      title: 'Préserver l\'histoire',
      emoji: '📸',
      description: 'Numérisation et conservation'
    },
    {
      route: '/rappel-anniversaires-famille',
      title: 'Rappels anniversaires',
      emoji: '🎂',
      description: 'Ne jamais oublier une date'
    },
  ],
  produit: [
    {
      route: '/application-genealogie',
      title: 'L\'application AILA',
      emoji: '📱',
      description: 'Toutes les fonctionnalités'
    },
    {
      route: '/download',
      title: 'Télécharger AILA',
      emoji: '⬇️',
      description: 'iOS, Android et Web'
    },
    {
      route: '/pricing',
      title: 'Tarifs & Offres',
      emoji: '💎',
      description: 'Gratuit et Premium'
    },
    {
      route: '/faq',
      title: 'FAQ',
      emoji: '❓',
      description: 'Questions fréquentes'
    },
  ],
};

// Cross-silo recommendations
const CROSS_SILO_LINKS: Record<string, RelatedArticle[]> = {
  // From genealogie pages, suggest famille pages
  genealogie: [
    {
      route: '/traditions-familiales',
      title: 'Créer des traditions familiales',
      emoji: '🎄',
      description: 'Renforcez vos liens'
    },
  ],
  // From famille pages, suggest genealogie pages
  famille: [
    {
      route: '/arbre-genealogique-gratuit',
      title: 'Créer votre arbre généalogique',
      emoji: '🌳',
      description: 'Gratuit et facile'
    },
  ],
  // From produit pages, suggest content pages
  produit: [
    {
      route: '/genealogie-debutant-guide',
      title: 'Guide du débutant',
      emoji: '🎓',
      description: 'Commencez ici'
    },
  ],
};

export const RelatedArticles: React.FC<RelatedArticlesProps> = ({ 
  silo, 
  currentPage,
  maxItems = 4 
}) => {
  const router = useRouter();

  // Get articles from same silo (excluding current page)
  const siloArticles = SILO_ARTICLES[silo]?.filter(a => a.route !== currentPage) || [];
  
  // Get one cross-silo link
  const crossSiloArticles = CROSS_SILO_LINKS[silo] || [];
  
  // Combine and limit
  const articles = [...siloArticles.slice(0, maxItems - 1), ...crossSiloArticles.slice(0, 1)];

  if (articles.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📚 Articles Liés</Text>
      <View style={styles.grid}>
        {articles.map((article, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => router.push(article.route as any)}
          >
            <Text style={styles.emoji}>{article.emoji}</Text>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{article.title}</Text>
              {article.description && (
                <Text style={styles.cardDesc}>{article.description}</Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={16} color="#6B7C93" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// Contextual CTA component for internal linking
interface ContextualCTAProps {
  type: 'arbre' | 'download' | 'register';
  text?: string;
}

export const ContextualCTA: React.FC<ContextualCTAProps> = ({ type, text }) => {
  const router = useRouter();

  const ctas = {
    arbre: {
      route: '/arbre-genealogique-gratuit',
      defaultText: 'Découvrir comment créer votre arbre gratuitement',
      emoji: '🌳',
      buttonText: 'Créer mon arbre',
    },
    download: {
      route: '/download',
      defaultText: 'Téléchargez l\'application AILA sur votre mobile',
      emoji: '📱',
      buttonText: 'Télécharger',
    },
    register: {
      route: '/(auth)/register',
      defaultText: 'Rejoignez la communauté AILA gratuitement',
      emoji: '✨',
      buttonText: 'S\'inscrire gratuitement',
    },
  };

  const cta = ctas[type];

  return (
    <View style={styles.ctaContainer}>
      <Text style={styles.ctaEmoji}>{cta.emoji}</Text>
      <Text style={styles.ctaText}>{text || cta.defaultText}</Text>
      <TouchableOpacity 
        style={styles.ctaButton}
        onPress={() => router.push(cta.route as any)}
      >
        <Text style={styles.ctaButtonText}>{cta.buttonText}</Text>
        <Ionicons name="arrow-forward" size={16} color="#0A1628" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#0D1E36',
    borderTopWidth: 1,
    borderTopColor: '#2A3F5A',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  grid: {
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 42, 68, 0.8)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.1)',
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: 12,
    color: '#6B7C93',
  },
  // CTA styles
  ctaContainer: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    margin: 20,
  },
  ctaEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  ctaText: {
    fontSize: 15,
    color: '#B8C5D6',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  ctaButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0A1628',
  },
});

export default RelatedArticles;
