import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SCREENSHOTS = [
  { id: '01', name: 'Page d\'accueil', file: '01_accueil.png' },
  { id: '02', name: 'Inscription', file: '02_inscription.png' },
  { id: '03', name: 'Connexion', file: '03_connexion.png' },
  { id: '04', name: 'Arbre généalogique ⭐', file: '04_arbre.png' },
  { id: '05', name: 'Ajouter une personne', file: '05_ajouter_personne.png' },
  { id: '06', name: 'Créer un lien', file: '06_creer_lien.png' },
  { id: '07', name: 'Liste des membres', file: '07_membres.png' },
  { id: '08', name: 'Page profil', file: '08_profil.png' },
];

const BASE_URL = 'https://www.aila.family/presentation';

export default function DownloadPage() {
  const openFile = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="videocam" size={48} color="#D4AF37" />
        <Text style={styles.title}>📦 Dossier Vidéo Promo</Text>
        <Text style={styles.subtitle}>Ressources pour générer la vidéo promotionnelle AÏLA</Text>
      </View>

      {/* Documents */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Documents</Text>
        
        <TouchableOpacity 
          style={styles.fileCard}
          onPress={() => openFile(`${BASE_URL}/README_IA_VIDEO.md`)}
        >
          <Ionicons name="document-text" size={24} color="#D4AF37" />
          <View style={styles.fileInfo}>
            <Text style={styles.fileName}>README_IA_VIDEO.md</Text>
            <Text style={styles.fileDesc}>Instructions et prompt pour l'IA vidéo</Text>
          </View>
          <Ionicons name="download-outline" size={24} color="#B8C5D6" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.fileCard}
          onPress={() => openFile(`${BASE_URL}/SCRIPT_VIDEO_AILA.md`)}
        >
          <Ionicons name="mic" size={24} color="#D4AF37" />
          <View style={styles.fileInfo}>
            <Text style={styles.fileName}>SCRIPT_VIDEO_AILA.md</Text>
            <Text style={styles.fileDesc}>Script de narration complet (~5 min)</Text>
          </View>
          <Ionicons name="download-outline" size={24} color="#B8C5D6" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.fileCard}
          onPress={() => openFile(`${BASE_URL}/GUIDE_CAPTURES.md`)}
        >
          <Ionicons name="book" size={24} color="#D4AF37" />
          <View style={styles.fileInfo}>
            <Text style={styles.fileName}>GUIDE_CAPTURES.md</Text>
            <Text style={styles.fileDesc}>Descriptions détaillées des captures</Text>
          </View>
          <Ionicons name="download-outline" size={24} color="#B8C5D6" />
        </TouchableOpacity>
      </View>

      {/* Screenshots */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📸 Captures d'écran (8 images HD)</Text>
        
        {SCREENSHOTS.map((screenshot) => (
          <TouchableOpacity 
            key={screenshot.id}
            style={styles.fileCard}
            onPress={() => openFile(`${BASE_URL}/screenshots/${screenshot.file}`)}
          >
            <Ionicons name="image" size={24} color="#3B82F6" />
            <View style={styles.fileInfo}>
              <Text style={styles.fileName}>{screenshot.file}</Text>
              <Text style={styles.fileDesc}>{screenshot.name}</Text>
            </View>
            <Ionicons name="download-outline" size={24} color="#B8C5D6" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🤖 Comment utiliser</Text>
        <View style={styles.instructionCard}>
          <Text style={styles.instructionText}>
            1. Téléchargez tous les fichiers ci-dessus{'\n'}
            2. Ouvrez README_IA_VIDEO.md pour le prompt{'\n'}
            3. Copiez le prompt dans votre IA vidéo (Runway, Pika, Synthesia...){'\n'}
            4. Uploadez les captures d'écran{'\n'}
            5. Utilisez le script de narration pour l'audio
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>AÏLA - L'arbre généalogique qui connecte votre famille</Text>
        <Text style={styles.footerUrl}>www.aila.family</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1628',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A5F',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#B8C5D6',
    marginTop: 8,
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 16,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A5F',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fileDesc: {
    fontSize: 14,
    color: '#B8C5D6',
    marginTop: 2,
  },
  instructionCard: {
    backgroundColor: '#1E3A5F',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#D4AF37',
  },
  instructionText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    borderTopWidth: 1,
    borderTopColor: '#1E3A5F',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#B8C5D6',
  },
  footerUrl: {
    fontSize: 16,
    color: '#D4AF37',
    fontWeight: 'bold',
    marginTop: 4,
  },
});
