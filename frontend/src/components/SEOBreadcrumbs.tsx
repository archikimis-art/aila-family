import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface BreadcrumbItem {
  label: string;
  route?: string;
}

interface SEOBreadcrumbsProps {
  items: BreadcrumbItem[];
}

// SEO-optimized breadcrumbs with Schema.org markup
export const SEOBreadcrumbs: React.FC<SEOBreadcrumbsProps> = ({ items }) => {
  const router = useRouter();

  // Add Schema.org BreadcrumbList for SEO
  React.useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const existingSchema = document.querySelector('script[data-breadcrumb-schema]');
      if (existingSchema) existingSchema.remove();

      const schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": item.label,
          "item": item.route ? `https://www.aila.family${item.route}` : undefined
        }))
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-breadcrumb-schema', 'true');
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    }
  }, [items]);

  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <View key={index} style={styles.itemContainer}>
          {index > 0 && (
            <Ionicons name="chevron-forward" size={12} color="#6B7C93" style={styles.separator} />
          )}
          {item.route ? (
            <TouchableOpacity onPress={() => router.push(item.route as any)}>
              <Text style={[styles.text, styles.link]}>{item.label}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.text, styles.current]}>{item.label}</Text>
          )}
        </View>
      ))}
    </View>
  );
};

// Predefined breadcrumb configurations for each silo
export const BREADCRUMB_CONFIGS = {
  // Silo 1: Généalogie
  'arbre-genealogique-gratuit': [
    { label: 'Accueil', route: '/' },
    { label: 'Généalogie', route: '/blog' },
    { label: 'Arbre généalogique gratuit' }
  ],
  'retrouver-ancetres-gratuitement': [
    { label: 'Accueil', route: '/' },
    { label: 'Généalogie', route: '/arbre-genealogique-gratuit' },
    { label: 'Retrouver ses ancêtres' }
  ],
  'genealogie-debutant-guide': [
    { label: 'Accueil', route: '/' },
    { label: 'Généalogie', route: '/arbre-genealogique-gratuit' },
    { label: 'Guide débutant' }
  ],
  'questions-grands-parents': [
    { label: 'Accueil', route: '/' },
    { label: 'Généalogie', route: '/arbre-genealogique-gratuit' },
    { label: 'Questions grands-parents' }
  ],
  'arbre-genealogique-famille-recomposee': [
    { label: 'Accueil', route: '/' },
    { label: 'Généalogie', route: '/arbre-genealogique-gratuit' },
    { label: 'Famille recomposée' }
  ],
  
  // Silo 2: Vie de Famille
  'traditions-familiales': [
    { label: 'Accueil', route: '/' },
    { label: 'Famille', route: '/blog' },
    { label: 'Traditions familiales' }
  ],
  'organiser-cousinade': [
    { label: 'Accueil', route: '/' },
    { label: 'Famille', route: '/traditions-familiales' },
    { label: 'Organiser une cousinade' }
  ],
  'ecrire-histoire-famille': [
    { label: 'Accueil', route: '/' },
    { label: 'Famille', route: '/traditions-familiales' },
    { label: 'Écrire son histoire' }
  ],
  'preserver-histoire-famille': [
    { label: 'Accueil', route: '/' },
    { label: 'Famille', route: '/traditions-familiales' },
    { label: 'Préserver l\'histoire' }
  ],
  'rappel-anniversaires-famille': [
    { label: 'Accueil', route: '/' },
    { label: 'Famille', route: '/traditions-familiales' },
    { label: 'Rappels anniversaires' }
  ],
  
  // Silo 3: Produit
  'application-genealogie': [
    { label: 'Accueil', route: '/' },
    { label: 'Application AILA' }
  ],
  'pricing': [
    { label: 'Accueil', route: '/' },
    { label: 'Application', route: '/download' },
    { label: 'Tarifs' }
  ],
  'faq': [
    { label: 'Accueil', route: '/' },
    { label: 'Aide & FAQ' }
  ],
  'blog': [
    { label: 'Accueil', route: '/' },
    { label: 'Blog & Guides' }
  ],
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(26, 42, 68, 0.5)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.1)',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    marginHorizontal: 8,
  },
  text: {
    fontSize: 12,
  },
  link: {
    color: '#D4AF37',
  },
  current: {
    color: '#B8C5D6',
  },
});

export default SEOBreadcrumbs;
