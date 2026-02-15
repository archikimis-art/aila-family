import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface SEOFooterProps {
  currentPage?: string;
}

const guides = [
  { route: '/retrouver-ancetres-gratuitement', label: 'Retrouver ses ancêtres', emoji: '🔍' },
  { route: '/genealogie-debutant-guide', label: 'Guide débutant', emoji: '🎓' },
  { route: '/traditions-familiales', label: 'Traditions familiales', emoji: '🎄' },
  { route: '/organiser-cousinade', label: 'Organiser une cousinade', emoji: '🎉' },
  { route: '/ecrire-histoire-famille', label: 'Écrire son histoire', emoji: '✍️' },
  { route: '/preserver-histoire-famille', label: 'Préserver l\'histoire', emoji: '📸' },
];

export const SEOFooter: React.FC<SEOFooterProps> = ({ currentPage }) => {
  const router = useRouter();

  // Filter out the current page from the guides list
  const otherGuides = guides.filter(g => g.route !== currentPage);

  return (
    <View style={styles.footerContainer}>
      {/* Back to Blog Button */}
      <TouchableOpacity 
        style={styles.backToBlogButton}
        onPress={() => router.push('/blog')}
      >
        <Ionicons name="arrow-back" size={18} color="#D4AF37" />
        <Text style={styles.backToBlogText}>Retour au Blog</Text>
      </TouchableOpacity>

      {/* Other Guides Section */}
      <View style={styles.guidesSection}>
        <Text style={styles.guidesSectionTitle}>📚 Autres Guides</Text>
        <View style={styles.guidesGrid}>
          {otherGuides.map((guide) => (
            <TouchableOpacity
              key={guide.route}
              style={styles.guideLink}
              onPress={() => router.push(guide.route as any)}
            >
              <Text style={styles.guideEmoji}>{guide.emoji}</Text>
              <Text style={styles.guideLinkText}>{guide.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Main Links */}
      <View style={styles.mainLinks}>
        <TouchableOpacity onPress={() => router.push('/')}>
          <Text style={styles.mainLink}>Accueil</Text>
        </TouchableOpacity>
        <Text style={styles.linkSeparator}>•</Text>
        <TouchableOpacity onPress={() => router.push('/blog')}>
          <Text style={styles.mainLink}>Blog</Text>
        </TouchableOpacity>
        <Text style={styles.linkSeparator}>•</Text>
        <TouchableOpacity onPress={() => router.push('/arbre-genealogique-gratuit')}>
          <Text style={styles.mainLink}>Arbre Gratuit</Text>
        </TouchableOpacity>
        <Text style={styles.linkSeparator}>•</Text>
        <TouchableOpacity onPress={() => router.push('/faq')}>
          <Text style={styles.mainLink}>FAQ</Text>
        </TouchableOpacity>
      </View>

      {/* Copyright */}
      <Text style={styles.copyright}>© 2025 AILA Famille - L'arbre généalogique qui connecte votre famille</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    padding: 24,
    backgroundColor: '#0D1E36',
    borderTopWidth: 1,
    borderTopColor: '#2A3F5A',
  },
  backToBlogButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 8,
  },
  backToBlogText: {
    color: '#D4AF37',
    fontSize: 15,
    fontWeight: '600',
  },
  guidesSection: {
    marginBottom: 24,
  },
  guidesSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  guidesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  guideLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 42, 68, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  guideEmoji: {
    fontSize: 14,
  },
  guideLinkText: {
    color: '#B8C5D6',
    fontSize: 12,
  },
  mainLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 4,
  },
  mainLink: {
    color: '#6B8BB8',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  linkSeparator: {
    color: '#4A5568',
    fontSize: 13,
    marginHorizontal: 6,
  },
  copyright: {
    fontSize: 11,
    color: '#6B7C93',
    textAlign: 'center',
  },
});

export default SEOFooter;
