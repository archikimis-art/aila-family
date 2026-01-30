import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Supprimer mon compte</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="trash-outline" size={64} color="#FF6B6B" />
        </View>

        <Text style={styles.title}>Suppression de compte AÏLA</Text>
        
        <Text style={styles.description}>
          Conformément au RGPD (Règlement Général sur la Protection des Données), 
          vous avez le droit de supprimer votre compte et toutes vos données personnelles à tout moment.
        </Text>

        {/* How to delete */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="phone-portrait-outline" size={20} color="#D4AF37" /> Comment supprimer mon compte ?
          </Text>
          
          <View style={styles.stepContainer}>
            <View style={styles.step}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepText}>Ouvrez l'application AÏLA</Text>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepText}>Connectez-vous à votre compte</Text>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.stepText}>Allez dans l'onglet "Profil"</Text>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>4</Text></View>
              <Text style={styles.stepText}>Section "Protection des données (RGPD)"</Text>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>5</Text></View>
              <Text style={styles.stepText}>Cliquez sur "Supprimer mon compte"</Text>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>6</Text></View>
              <Text style={styles.stepText}>Confirmez la suppression</Text>
            </View>
          </View>
        </View>

        {/* What gets deleted */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="document-text-outline" size={20} color="#D4AF37" /> Données supprimées
          </Text>
          
          <Text style={styles.listItem}>• Votre adresse email</Text>
          <Text style={styles.listItem}>• Votre arbre généalogique complet</Text>
          <Text style={styles.listItem}>• Tous les membres ajoutés</Text>
          <Text style={styles.listItem}>• Vos liens familiaux</Text>
          <Text style={styles.listItem}>• Vos messages dans la communauté</Text>
          <Text style={styles.listItem}>• Vos badges et points</Text>
          <Text style={styles.listItem}>• Toutes vos préférences</Text>
        </View>

        {/* Warning */}
        <View style={styles.warningBox}>
          <Ionicons name="warning-outline" size={24} color="#FF9800" />
          <Text style={styles.warningText}>
            Attention : Cette action est irréversible. Une fois votre compte supprimé, 
            toutes vos données seront définitivement effacées et ne pourront pas être récupérées.
          </Text>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="mail-outline" size={20} color="#D4AF37" /> Besoin d'aide ?
          </Text>
          
          <Text style={styles.description}>
            Si vous rencontrez des difficultés pour supprimer votre compte, 
            vous pouvez nous contacter :
          </Text>
          
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => Linking.openURL('mailto:contact@aila.family?subject=Demande de suppression de compte')}
          >
            <Ionicons name="mail" size={20} color="#0A1628" />
            <Text style={styles.contactButtonText}>contact@aila.family</Text>
          </TouchableOpacity>
          
          <Text style={styles.responseTime}>
            Nous traiterons votre demande dans un délai de 48 heures.
          </Text>
        </View>

        {/* Back to app */}
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Text style={styles.primaryButtonText}>Ouvrir l'application</Text>
          <Ionicons name="arrow-forward" size={20} color="#0A1628" />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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
    padding: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#B8C5D6',
    lineHeight: 24,
    marginBottom: 24,
  },
  section: {
    backgroundColor: '#0D2137',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D4AF37',
    marginBottom: 16,
  },
  stepContainer: {
    gap: 12,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0A1628',
  },
  stepText: {
    fontSize: 15,
    color: '#FFFFFF',
    flex: 1,
  },
  listItem: {
    fontSize: 15,
    color: '#B8C5D6',
    marginBottom: 8,
    paddingLeft: 8,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
    alignItems: 'flex-start',
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#FF9800',
    lineHeight: 20,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    padding: 12,
    gap: 8,
    marginVertical: 12,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A1628',
  },
  responseTime: {
    fontSize: 13,
    color: '#6B7C93',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginTop: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A1628',
  },
});
