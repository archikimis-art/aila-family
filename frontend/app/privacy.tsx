import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Politique de Confidentialité</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdate}>Dernière mise à jour : Décembre 2024</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.paragraph}>
            Bienvenue sur AÏLA ("nous", "notre", "nos"). Nous nous engageons à protéger votre vie privée et vos données personnelles. Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons vos informations lorsque vous utilisez notre application de gestion d'arbre généalogique.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Données Collectées</Text>
          <Text style={styles.paragraph}>
            Nous collectons les types de données suivants :{"\n\n"}
            <Text style={styles.bold}>Données de compte :</Text>{"\n"}
            • Nom et prénom{"\n"}
            • Adresse email{"\n"}
            • Mot de passe (crypté){"\n\n"}
            <Text style={styles.bold}>Données généalogiques :</Text>{"\n"}
            • Informations sur les membres de la famille (noms, dates de naissance, lieux){"\n"}
            • Relations familiales{"\n"}
            • Photos de famille (optionnel){"\n\n"}
            <Text style={styles.bold}>Données d'utilisation :</Text>{"\n"}
            • Statistiques d'utilisation de l'application{"\n"}
            • Préférences et paramètres
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Utilisation des Données</Text>
          <Text style={styles.paragraph}>
            Vos données sont utilisées pour :{"\n\n"}
            • Créer et gérer votre compte utilisateur{"\n"}
            • Construire et afficher votre arbre généalogique{"\n"}
            • Vous envoyer des notifications importantes (anniversaires, événements){"\n"}
            • Améliorer nos services et votre expérience utilisateur{"\n"}
            • Assurer la sécurité de votre compte{"\n"}
            • Vous contacter en cas de besoin (support technique)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Stockage et Sécurité</Text>
          <Text style={styles.paragraph}>
            Vos données sont stockées de manière sécurisée :{"\n\n"}
            • Serveurs sécurisés avec cryptage SSL/TLS{"\n"}
            • Mots de passe hashés avec des algorithmes modernes{"\n"}
            • Accès restreint aux données personnelles{"\n"}
            • Sauvegardes régulières et sécurisées{"\n"}
            • Conformité avec le RGPD (Règlement Général sur la Protection des Données)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Partage des Données</Text>
          <Text style={styles.paragraph}>
            Nous ne vendons jamais vos données personnelles. Vos données peuvent être partagées uniquement :{"\n\n"}
            • Avec les membres de votre famille que vous avez explicitement invités{"\n"}
            • Avec nos prestataires techniques (hébergement, email) sous contrat de confidentialité{"\n"}
            • Si requis par la loi ou une autorité judiciaire
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Vos Droits (RGPD)</Text>
          <Text style={styles.paragraph}>
            Conformément au RGPD, vous disposez des droits suivants :{"\n\n"}
            • <Text style={styles.bold}>Droit d'accès :</Text> Obtenir une copie de vos données{"\n"}
            • <Text style={styles.bold}>Droit de rectification :</Text> Corriger vos données inexactes{"\n"}
            • <Text style={styles.bold}>Droit à l'effacement :</Text> Supprimer votre compte et vos données{"\n"}
            • <Text style={styles.bold}>Droit à la portabilité :</Text> Exporter vos données{"\n"}
            • <Text style={styles.bold}>Droit d'opposition :</Text> Vous opposer au traitement de vos données{"\n\n"}
            Pour exercer ces droits, contactez-nous à : privacy@aila.family
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Cookies et Publicités</Text>
          <Text style={styles.paragraph}>
            Notre application utilise :{"\n\n"}
            • Des cookies techniques nécessaires au fonctionnement{"\n"}
            • Google AdSense pour afficher des publicités pertinentes{"\n"}
            • Google Analytics pour comprendre l'utilisation de notre service{"\n\n"}
            Vous pouvez désactiver les publicités en souscrivant à notre offre Premium.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Conservation des Données</Text>
          <Text style={styles.paragraph}>
            Vos données sont conservées tant que votre compte est actif. En cas de suppression de compte, vos données sont définitivement effacées dans un délai de 30 jours, sauf obligation légale de conservation.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Contact</Text>
          <Text style={styles.paragraph}>
            Pour toute question concernant cette politique de confidentialité ou vos données personnelles :{"\n\n"}
            Email : privacy@aila.family{"\n"}
            Site web : www.aila.family
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 AÏLA. Tous droits réservés.</Text>
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
    borderBottomColor: '#1A2F4A',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  lastUpdate: {
    fontSize: 12,
    color: '#6B7C93',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D4AF37',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 22,
  },
  bold: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 12,
    color: '#4A5568',
  },
});
