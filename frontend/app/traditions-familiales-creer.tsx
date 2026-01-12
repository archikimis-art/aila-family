import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const SEOHead = () => {
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = '25 Traditions Familiales à Créer pour Renforcer vos Liens | AILA';
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Découvrez 25 idées de traditions familiales à créer : rituels quotidiens, fêtes, voyages, activités. Renforcez les liens familiaux et créez des souvenirs inoubliables.');
      }
    }
  }, []);
  return null;
};

const TraditionCard = ({ emoji, title, desc }: { emoji: string; title: string; desc: string }) => (
  <View style={styles.traditionCard}>
    <Text style={styles.traditionEmoji}>{emoji}</Text>
    <View style={styles.traditionContent}>
      <Text style={styles.traditionTitle}>{title}</Text>
      <Text style={styles.traditionDesc}>{desc}</Text>
    </View>
  </View>
);

export default function TraditionsFamiliales() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <SEOHead />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#D4AF37" />
          </TouchableOpacity>
          <Text style={styles.logoText}>🌳 AILA</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.badge}>👨‍👩‍👧‍👦 Vie de Famille</Text>
          <Text style={styles.h1}>25 Traditions Familiales à Créer</Text>
          <Text style={styles.subtitle}>
            Les traditions familiales créent des liens, des souvenirs et une identité commune. 
            Voici 25 idées pour créer les vôtres.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>🌅 Traditions Quotidiennes</Text>
          <TraditionCard emoji="☕" title="Le petit-déjeuner du dimanche" desc="Un brunch en famille chaque dimanche matin, avec les plats préférés de chacun." />
          <TraditionCard emoji="🌙" title="L'histoire du soir" desc="Lire une histoire aux enfants chaque soir, ou partager un moment de la journée." />
          <TraditionCard emoji="🍽️" title="Le dîner ensemble" desc="Au moins un repas par jour tous ensemble, sans écrans." />
          <TraditionCard emoji="🚶" title="La balade du week-end" desc="Une promenade hebdomadaire en famille, toujours le même jour." />
          <TraditionCard emoji="🎮" title="La soirée jeux" desc="Un soir par semaine dédié aux jeux de société en famille." />
        </View>

        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.h2}>🎄 Traditions des Fêtes</Text>
          <TraditionCard emoji="🎅" title="Le calendrier de l'Avent fait maison" desc="Créez ensemble votre propre calendrier avec des surprises personnalisées." />
          <TraditionCard emoji="🥧" title="Le gâteau d'anniversaire maison" desc="Chaque anniversaire, le gâteau est fait maison par la famille." />
          <TraditionCard emoji="🕯️" title="Les bougies de Noël" desc="Allumer une bougie spéciale chaque soir de décembre." />
          <TraditionCard emoji="📸" title="La photo de groupe annuelle" desc="Même pose, même endroit, chaque année." />
          <TraditionCard emoji="🎁" title="Le cadeau fait main" desc="Au moins un cadeau fait maison pour chaque fête." />
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>✈️ Traditions de Vacances</Text>
          <TraditionCard emoji="🏖️" title="Le lieu de vacances rituel" desc="Retourner chaque année au même endroit crée des souvenirs précieux." />
          <TraditionCard emoji="🗺️" title="Le road trip annuel" desc="Un voyage en voiture chaque été, même court." />
          <TraditionCard emoji="⛺" title="Le camping en famille" desc="Une nuit sous la tente, même dans le jardin !" />
          <TraditionCard emoji="🏠" title="La visite aux grands-parents" desc="Des dates fixes pour visiter les grands-parents." />
          <TraditionCard emoji="📖" title="Le journal de voyage" desc="Chaque membre écrit ou dessine dans un carnet commun." />
        </View>

        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.h2}>🌳 Traditions de Mémoire</Text>
          <TraditionCard emoji="🖼️" title="L'album photo annuel" desc="Créer un album photo ensemble chaque année." />
          <TraditionCard emoji="📜" title="La lettre à l'avenir" desc="Écrire une lettre à ouvrir dans 5 ou 10 ans." />
          <TraditionCard emoji="🌱" title="L'arbre généalogique vivant" desc="Mettre à jour l'arbre familial régulièrement ensemble." />
          <TraditionCard emoji="🎤" title="Les interviews de grands-parents" desc="Enregistrer leurs histoires régulièrement." />
          <TraditionCard emoji="🏆" title="Le mur des réussites" desc="Afficher les réussites de chacun à la maison." />
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>❤️ Traditions de Connexion</Text>
          <TraditionCard emoji="📞" title="L'appel du dimanche" desc="Appeler la famille éloignée chaque dimanche." />
          <TraditionCard emoji="💌" title="La carte postale" desc="Envoyer une carte de chaque voyage, même court." />
          <TraditionCard emoji="🤗" title="La réunion de famille annuelle" desc="Rassemblement de toute la famille élargie une fois par an." />
          <TraditionCard emoji="🎂" title="Les anniversaires célébrés" desc="Chaque anniversaire est fêté, même modestement." />
          <TraditionCard emoji="🙏" title="Le moment de gratitude" desc="Partager ce pour quoi on est reconnaissant." />
        </View>

        <View style={[styles.section, styles.ctaSection]}>
          <Text style={styles.ctaTitle}>🌳 Préservez Vos Traditions</Text>
          <Text style={styles.ctaText}>
            Créez votre arbre généalogique familial avec AILA et documentez 
            vos traditions pour les transmettre aux générations futures.
          </Text>
          <TouchableOpacity style={styles.ctaButton} onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.ctaButtonText}>Créer Mon Arbre Gratuit</Text>
            <Ionicons name="arrow-forward" size={20} color="#0A1628" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 AILA Famille</Text>
        </View>
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
  hero: { padding: 24 },
  badge: { backgroundColor: 'rgba(212, 175, 55, 0.2)', color: '#D4AF37', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, fontSize: 12, fontWeight: '600', alignSelf: 'flex-start', marginBottom: 16 },
  h1: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 16, lineHeight: 36 },
  subtitle: { fontSize: 16, color: '#B8C5D6', lineHeight: 26 },
  section: { padding: 24 },
  sectionAlt: { backgroundColor: '#0D1E36' },
  h2: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 20 },
  traditionCard: { flexDirection: 'row', backgroundColor: '#1A2A44', borderRadius: 12, padding: 16, marginBottom: 12, alignItems: 'flex-start' },
  traditionEmoji: { fontSize: 28, marginRight: 16 },
  traditionContent: { flex: 1 },
  traditionTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 },
  traditionDesc: { fontSize: 14, color: '#B8C5D6', lineHeight: 20 },
  ctaSection: { alignItems: 'center', paddingVertical: 48, backgroundColor: '#0D1E36' },
  ctaTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12 },
  ctaText: { fontSize: 16, color: '#B8C5D6', textAlign: 'center', marginBottom: 24, maxWidth: 400 },
  ctaButton: { backgroundColor: '#D4AF37', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  ctaButtonText: { color: '#0A1628', fontSize: 18, fontWeight: '600' },
  footer: { padding: 40, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#2A3F5A' },
  footerText: { fontSize: 14, color: '#6B7C93' },
});