import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import api, { gdprAPI, treeAPI, exportAPI } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AdBanner from '@/components/AdBanner';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isAdmin } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [clearingTree, setClearingTree] = useState(false);
  const [downloadingJSON, setDownloadingJSON] = useState(false);

  const performLogout = async () => {
    setLoggingOut(true);
    try {
      // Clear all local storage
      await AsyncStorage.clear();
      // Call logout from context
      await logout();
      // Navigate to home
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
      if (Platform.OS === 'web') {
        window.alert('Problème lors de la déconnexion');
      } else {
        Alert.alert('Erreur', 'Problème lors de la déconnexion');
      }
    } finally {
      setLoggingOut(false);
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      // On web, use window.confirm instead of Alert
      const confirmed = window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?');
      if (confirmed) {
        await performLogout();
      }
    } else {
      // On mobile, use Alert
      Alert.alert(
        'Déconnexion',
        'Êtes-vous sûr de vouloir vous déconnecter ?',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Déconnexion',
            style: 'destructive',
            onPress: performLogout,
          },
        ]
      );
    }
  };

  const handleExportData = async () => {
    if (!user) {
      if (Platform.OS === 'web') {
        window.alert('Créez un compte pour exporter vos données.');
      } else {
        Alert.alert('Information', 'Créez un compte pour exporter vos données.');
      }
      return;
    }

    setExporting(true);
    try {
      const response = await gdprAPI.exportData();
      const message = `Vos données ont été exportées.\n\n- ${response.data.persons?.length || 0} personnes\n- ${response.data.family_links?.length || 0} liens familiaux`;
      
      if (Platform.OS === 'web') {
        window.alert('Export réussi!\n\n' + message);
      } else {
        Alert.alert('Export réussi', message, [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('Export error:', error);
      if (Platform.OS === 'web') {
        window.alert('Erreur: Impossible d\'exporter les données.');
      } else {
        Alert.alert('Erreur', 'Impossible d\'exporter les données.');
      }
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    Alert.alert(
      'Supprimer le compte',
      'Cette action est irréversible. Toutes vos données seront définitivement supprimées.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await gdprAPI.deleteAccount();
              await logout();
              Alert.alert('Compte supprimé', 'Votre compte et toutes vos données ont été supprimés.');
              router.replace('/');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le compte.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleClearPreview = async () => {
    Alert.alert(
      'Effacer les données',
      'Les données du mode aperçu seront supprimées.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Effacer',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('preview_token');
            Alert.alert('Succès', 'Les données du mode aperçu ont été effacées.');
            router.replace('/');
          },
        },
      ]
    );
  };

  // Clear entire tree (keep account)
  const handleClearTree = async () => {
    if (!user) {
      Alert.alert('Information', 'Connectez-vous pour gérer votre arbre.');
      return;
    }

    const confirmClear = () => {
      setClearingTree(true);
      treeAPI.clearTree()
        .then((response) => {
          const data = response.data;
          if (Platform.OS === 'web') {
            window.alert(`Arbre supprimé avec succès!\n\n${data.deleted_persons} personnes supprimées\n${data.deleted_links} liens supprimés`);
          } else {
            Alert.alert(
              'Arbre supprimé',
              `${data.deleted_persons} personnes et ${data.deleted_links} liens ont été supprimés.`,
              [{ text: 'OK' }]
            );
          }
        })
        .catch((error) => {
          console.error('Clear tree error:', error);
          if (Platform.OS === 'web') {
            window.alert('Erreur lors de la suppression de l\'arbre.');
          } else {
            Alert.alert('Erreur', 'Impossible de supprimer l\'arbre.');
          }
        })
        .finally(() => {
          setClearingTree(false);
        });
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        'ATTENTION: Cette action est irréversible!\n\nToutes les personnes et liens de votre arbre seront supprimés.\n\nVotre compte restera actif.\n\nVoulez-vous continuer?'
      );
      if (confirmed) {
        confirmClear();
      }
    } else {
      Alert.alert(
        'Supprimer l\'arbre',
        'ATTENTION: Cette action est irréversible!\n\nToutes les personnes et liens de votre arbre seront supprimés.\n\nVotre compte restera actif.',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Supprimer tout',
            style: 'destructive',
            onPress: confirmClear,
          },
        ]
      );
    }
  };

  // Download tree as JSON file
  const handleDownloadJSON = async () => {
    if (!user) {
      if (Platform.OS === 'web') {
        window.alert('Connectez-vous pour télécharger votre arbre.');
      } else {
        Alert.alert('Information', 'Connectez-vous pour télécharger votre arbre.');
      }
      return;
    }

    setDownloadingJSON(true);
    try {
      const response = await exportAPI.downloadJSON();
      
      if (Platform.OS === 'web') {
        // Create blob and download
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `aila_tree_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        window.alert('Fichier téléchargé avec succès!');
      } else {
        // On mobile, show the data for now
        Alert.alert(
          'Export réussi',
          'Le fichier JSON a été généré. Sur mobile, utilisez le partage pour sauvegarder.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('Download error:', error);
      const errorMsg = error?.response?.data?.detail || 'Erreur lors du téléchargement.';
      if (Platform.OS === 'web') {
        window.alert(errorMsg);
      } else {
        Alert.alert('Erreur', errorMsg);
      }
    } finally {
      setDownloadingJSON(false);
    }
  };

  // Import GEDCOM file
  const handleImportGedcom = async () => {
    if (Platform.OS === 'web') {
      // Create file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.ged,.gedcom';
      
      input.onchange = async (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async (event) => {
          const content = event.target?.result as string;
          
          try {
            const response = await api.post('/tree/import/gedcom', {
              gedcom_content: content
            });
            
            window.alert(response.data.message);
          } catch (error: any) {
            console.error('Import error:', error);
            window.alert(error.response?.data?.detail || 'Erreur lors de l\'import');
          }
        };
        reader.readAsText(file);
      };
      
      input.click();
    } else {
      Alert.alert('Information', 'L\'import GEDCOM est disponible sur la version web.');
    }
  };

  // Send tree by email
  const handleSendByEmail = async () => {
    if (Platform.OS === 'web') {
      const emails = window.prompt(
        'Entrez les adresses email des destinataires (séparées par des virgules) :',
        ''
      );
      
      if (!emails) return;
      
      const message = window.prompt(
        'Ajoutez un message personnalisé (optionnel) :',
        ''
      );
      
      try {
        const emailList = emails.split(',').map(e => e.trim()).filter(e => e);
        
        if (emailList.length === 0) {
          window.alert('Veuillez entrer au moins une adresse email.');
          return;
        }
        
        const response = await api.post('/tree/send-email', {
          recipient_emails: emailList,
          format: 'json',
          message: message || null
        });
        
        window.alert(response.data.message);
      } catch (error: any) {
        console.error('Send email error:', error);
        window.alert(error.response?.data?.detail || 'Erreur lors de l\'envoi');
      }
    } else {
      Alert.alert('Information', 'Cette fonctionnalité est disponible sur la version web.');
    }
  };

  const handleGoToWelcome = () => {
    router.replace('/');
  };

  const getInitials = () => {
    if (!user) return 'A';
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
        indicatorStyle="white"
      >
        {/* Indicateur de scroll */}
        <View style={styles.scrollHint}>
          <Ionicons name="chevron-down" size={16} color="#6B7C93" />
          <Text style={styles.scrollHintText}>Défiler pour voir plus</Text>
          <Ionicons name="chevron-down" size={16} color="#6B7C93" />
        </View>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </View>
          {user ? (
            <>
              <View style={styles.userNameContainer}>
                <Text style={styles.userName}>{user.first_name} {user.last_name}</Text>
                {isAdmin() && (
                  <View style={styles.adminBadge}>
                    <Ionicons name="shield-checkmark" size={14} color="#FFF" />
                    <Text style={styles.adminBadgeText}>Admin</Text>
                  </View>
                )}
              </View>
              <Text style={styles.userEmail}>{user.email}</Text>
            </>
          ) : (
            <>
              <Text style={styles.userName}>Mode Aperçu</Text>
              <Text style={styles.userEmail}>Non connecté</Text>
            </>
          )}
        </View>


        {/* Admin Section */}
        {user && isAdmin() && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#D4AF37" />
              <Text style={styles.sectionTitle}>Administration</Text>
            </View>
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => router.push('/users-management')}
            >
              <Ionicons name="people-outline" size={22} color="#4A90D9" />
              <Text style={styles.menuItemText}>Gérer les utilisateurs</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
            </TouchableOpacity>
          </View>
        )}


        {/* Account Section */}
        {!user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Compte</Text>
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(auth)/login')}>
              <Ionicons name="log-in-outline" size={22} color="#D4AF37" />
              <Text style={styles.menuItemText}>Se connecter</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(auth)/register')}>
              <Ionicons name="person-add-outline" size={22} color="#D4AF37" />
              <Text style={styles.menuItemText}>Créer un compte</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
            </TouchableOpacity>
          </View>
        )}

        {/* Premium Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="star" size={20} color="#D4AF37" />
            <Text style={styles.sectionTitle}>Premium</Text>
          </View>
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => router.push('/pricing' as any)}
          >
            <Ionicons name="diamond-outline" size={22} color="#D4AF37" />
            <Text style={styles.menuItemText}>Voir les offres Premium</Text>
            <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
          </TouchableOpacity>
        </View>

        {/* GDPR Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#D4AF37" />
            <Text style={styles.sectionTitle}>Protection des données (RGPD)</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Conformément au RGPD, vous pouvez accéder, exporter ou supprimer vos données à tout moment.
          </Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleExportData}
            disabled={exporting}
          >
            {exporting ? (
              <ActivityIndicator size="small" color="#D4AF37" />
            ) : (
              <Ionicons name="cloud-download-outline" size={22} color="#4A90D9" />
            )}
            <Text style={styles.menuItemText}>Voir mes données</Text>
            <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
          </TouchableOpacity>

          {user && (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDownloadJSON}
              disabled={downloadingJSON}
            >
              {downloadingJSON ? (
                <ActivityIndicator size="small" color="#D4AF37" />
              ) : (
                <Ionicons name="download-outline" size={22} color="#4CAF50" />
              )}
              <Text style={styles.menuItemText}>Télécharger l'arbre (JSON)</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
            </TouchableOpacity>
          )}

          {/* Import GEDCOM */}
          {user && (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleImportGedcom}
            >
              <Ionicons name="cloud-upload-outline" size={22} color="#9B59B6" />
              <Text style={styles.menuItemText}>Importer un fichier GEDCOM</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
            </TouchableOpacity>
          )}

          {/* Send by Email */}
          {user && (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleSendByEmail}
            >
              <Ionicons name="mail-outline" size={22} color="#E67E22" />
              <Text style={styles.menuItemText}>Envoyer l'arbre par email</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
            </TouchableOpacity>
          )}

          {!user && (
            <TouchableOpacity style={styles.menuItem} onPress={handleClearPreview}>
              <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
              <Text style={[styles.menuItemText, { color: '#FF6B6B' }]}>Effacer données aperçu</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
            </TouchableOpacity>
          )}

          {user && (
            <TouchableOpacity
              style={[styles.menuItem, styles.dangerItem]}
              onPress={handleClearTree}
              disabled={clearingTree}
            >
              {clearingTree ? (
                <ActivityIndicator size="small" color="#FF9800" />
              ) : (
                <Ionicons name="git-branch-outline" size={22} color="#FF9800" />
              )}
              <Text style={[styles.menuItemText, { color: '#FF9800' }]}>Supprimer l'arbre</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
            </TouchableOpacity>
          )}

          {user && (
            <TouchableOpacity
              style={[styles.menuItem, styles.dangerItem]}
              onPress={handleDeleteAccount}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator size="small" color="#FF6B6B" />
              ) : (
                <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
              )}
              <Text style={[styles.menuItemText, { color: '#FF6B6B' }]}>Supprimer mon compte</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
            </TouchableOpacity>
          )}
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & Contact</Text>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              Alert.alert(
                'Nous contacter',
                'Pour toute question, suggestion ou problème :\n\ncontact@aila.family\n\nNous vous répondrons dans les plus brefs délais.',
                [{ text: 'OK' }]
              );
            }}
          >
            <Ionicons name="mail-outline" size={22} color="#4A90D9" />
            <Text style={styles.menuItemText}>Nous contacter</Text>
            <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color="#D4AF37" />
            <Text style={styles.infoText}>
              AÏLA est une application de généalogie pour préserver et partager l'histoire de votre famille.
              Vos données sont stockées de manière sécurisée et vous en gardez le contrôle total.
            </Text>
          </View>
          <View style={[styles.infoCard, { marginTop: 12 }]}>
            <Ionicons name="at-outline" size={20} color="#D4AF37" />
            <Text style={styles.infoText}>
              Contact : contact@aila.family
            </Text>
          </View>
        </View>

        {/* Logout */}
        {user && (
          <TouchableOpacity 
            style={[styles.logoutButton, loggingOut && styles.buttonDisabled]} 
            onPress={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
            )}
            <Text style={styles.logoutButtonText}>
              {loggingOut ? 'Déconnexion...' : 'Déconnexion'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Back to Welcome */}
        <TouchableOpacity style={styles.welcomeButton} onPress={handleGoToWelcome}>
          <Ionicons name="home-outline" size={22} color="#D4AF37" />
          <Text style={styles.welcomeButtonText}>Retour à l'accueil</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
      
      {/* Ad Banner for free users */}
      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1628',
  },
  content: {
    paddingBottom: 180, // Plus de marge pour le scroll complet sur mobile (bannière pub + tab bar)
  },
  scrollHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: 'rgba(26, 47, 74, 0.5)',
  },
  scrollHintText: {
    color: '#6B7C93',
    fontSize: 12,
    marginHorizontal: 8,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2F4A',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0A1628',
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  adminBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  userEmail: {
    fontSize: 15,
    color: '#6B7C93',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7C93',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#B8C5D6',
    lineHeight: 20,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2F4A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 14,
  },
  dangerItem: {
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#B8C5D6',
    lineHeight: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A3F5A',
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  welcomeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D4AF37',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  welcomeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4AF37',
  },
  version: {
    textAlign: 'center',
    color: '#4A5568',
    fontSize: 13,
    marginTop: 24,
  },
});
