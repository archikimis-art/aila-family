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

export default function TermsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Conditions d'Utilisation</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdate}>Dernière mise à jour : Décembre 2024</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptation des Conditions</Text>
          <Text style={styles.paragraph}>
            En utilisant l'application AÏLA, vous acceptez d'être lié par les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Description du Service</Text>
          <Text style={styles.paragraph}>
            AÏLA est une application de gestion d'arbre généalogique qui permet aux utilisateurs de :{"\n\n"}
            • Créer et gérer un arbre généalogique familial{"\n"}
            • Ajouter des informations sur les membres de la famille{"\n"}
            • Partager l'arbre avec d'autres membres de la famille{"\n"}
            • Communiquer avec les membres via le chat intégré{"\n"}
            • Recevoir des rappels pour les événements familiaux
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Création de Compte</Text>
          <Text style={styles.paragraph}>
            Pour utiliser AÏLA, vous devez :{"\n\n"}
            • Avoir au moins 16 ans{"\n"}
            • Fournir des informations exactes lors de l'inscription{"\n"}
            • Maintenir la confidentialité de vos identifiants{"\n"}
            • Nous informer immédiatement de toute utilisation non autorisée
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Utilisation Acceptable</Text>
          <Text style={styles.paragraph}>
            Vous vous engagez à :{"\n\n"}
            • Utiliser le service uniquement à des fins légales{"\n"}
            • Ne pas usurper l'identité d'autrui{"\n"}
            • Ne pas télécharger de contenu illégal ou offensant{"\n"}
            • Ne pas tenter de compromettre la sécurité du service{"\n"}
            • Respecter les droits des autres utilisateurs
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Contenu Utilisateur</Text>
          <Text style={styles.paragraph}>
            Vous conservez la propriété du contenu que vous publiez. En utilisant AÏLA, vous nous accordez une licence limitée pour stocker, afficher et partager votre contenu selon vos paramètres de confidentialité.{"\n\n"}
            Vous êtes responsable du contenu que vous publiez et garantissez avoir les droits nécessaires sur ce contenu.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Abonnement Premium</Text>
          <Text style={styles.paragraph}>
            L'abonnement Premium offre des fonctionnalités supplémentaires :{"\n\n"}
            • Suppression des publicités{"\n"}
            • Fonctionnalités avancées{"\n"}
            • Support prioritaire{"\n\n"}
            Les paiements sont traités de manière sécurisée. Vous pouvez annuler votre abonnement à tout moment.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Publicités</Text>
          <Text style={styles.paragraph}>
            La version gratuite d'AÏLA affiche des publicités fournies par Google AdSense. Ces publicités aident à financer le développement et la maintenance du service. Vous pouvez supprimer les publicités en souscrivant à l'offre Premium.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Limitation de Responsabilité</Text>
          <Text style={styles.paragraph}>
            AÏLA est fourni "tel quel" sans garantie d'aucune sorte. Nous ne sommes pas responsables :{"\n\n"}
            • Des pertes de données dues à des circonstances hors de notre contrôle{"\n"}
            • De l'utilisation que vous faites du service{"\n"}
            • Des contenus publiés par d'autres utilisateurs
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Résiliation</Text>
          <Text style={styles.paragraph}>
            Vous pouvez supprimer votre compte à tout moment depuis les paramètres de l'application. Nous nous réservons le droit de suspendre ou supprimer les comptes qui violent ces conditions d'utilisation.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Modifications</Text>
          <Text style={styles.paragraph}>
            Nous pouvons modifier ces conditions à tout moment. Les modifications importantes seront notifiées aux utilisateurs. L'utilisation continue du service après une modification constitue une acceptation des nouvelles conditions.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Droit Applicable</Text>
          <Text style={styles.paragraph}>
            Ces conditions sont régies par le droit français. Tout litige sera soumis à la juridiction des tribunaux français compétents.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. Contact</Text>
          <Text style={styles.paragraph}>
            Pour toute question concernant ces conditions :{"\n\n"}
            Email : legal@aila.family{"\n"}
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
