import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Get API URL from environment
const getApiUrl = () => {
  if (Platform.OS === 'web') {
    return '';
  }
  const backendUrl = Constants.expoConfig?.extra?.backendUrl;
  return backendUrl || 'https://aila-backend-hc1m.onrender.com';
};

interface ExcelImportProps {
  onImportSuccess?: (count: number) => void;
  onClose?: () => void;
}

interface ImportResult {
  success: boolean;
  message: string;
  imported_count: number;
  persons: Array<{ id: string; name: string; relation: string }>;
  errors: string[];
}

export const ExcelImport: React.FC<ExcelImportProps> = ({ onImportSuccess, onClose }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [step, setStep] = useState<'intro' | 'importing' | 'result'>('intro');

  const API_URL = getApiUrl();

  const downloadTemplate = async () => {
    const templateUrl = `${API_URL}/api/excel/template`;
    
    if (Platform.OS === 'web') {
      // On web, open the download link directly
      window.open(templateUrl, '_blank');
    } else {
      // On mobile, use Linking
      try {
        await Linking.openURL(templateUrl);
      } catch (error) {
        Alert.alert('Erreur', 'Impossible de télécharger le template');
      }
    }
  };

  const pickAndUploadFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        Alert.alert('Erreur', 'Veuillez sélectionner un fichier Excel (.xlsx ou .xls)');
        return;
      }

      setStep('importing');
      setIsLoading(true);

      // Get auth token
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        Alert.alert('Erreur', 'Vous devez être connecté pour importer un fichier');
        setIsLoading(false);
        setStep('intro');
        return;
      }

      // Create FormData
      const formData = new FormData();
      
      if (Platform.OS === 'web') {
        // On web, fetch the file and create a Blob
        const response = await fetch(file.uri);
        const blob = await response.blob();
        formData.append('file', blob, file.name);
      } else {
        // On mobile, read file as base64 and convert
        const fileUri = file.uri;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        
        if (!fileInfo.exists) {
          throw new Error('Fichier introuvable');
        }

        // For React Native, we need to use a different approach
        formData.append('file', {
          uri: fileUri,
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          name: file.name,
        } as any);
      }

      // Upload to API
      const uploadResponse = await fetch(`${API_URL}/api/excel/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data: ImportResult = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(data.message || 'Erreur lors de l\'import');
      }

      setImportResult(data);
      setStep('result');

      if (data.success && onImportSuccess) {
        onImportSuccess(data.imported_count);
      }

    } catch (error: any) {
      console.error('Import error:', error);
      Alert.alert('Erreur', error.message || 'Une erreur est survenue lors de l\'import');
      setStep('intro');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = () => {
    setModalVisible(true);
    setStep('intro');
    setImportResult(null);
  };

  const closeModal = () => {
    setModalVisible(false);
    setStep('intro');
    setImportResult(null);
    onClose?.();
  };

  const renderIntroStep = () => (
    <ScrollView style={styles.content}>
      <View style={styles.iconContainer}>
        <Ionicons name="document-text" size={60} color="#D4AF37" />
      </View>
      
      <Text style={styles.title}>Importer depuis Excel</Text>
      <Text style={styles.subtitle}>
        Construisez votre arbre rapidement en important un fichier Excel
      </Text>

      <View style={styles.stepsContainer}>
        <View style={styles.stepItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Téléchargez le template</Text>
            <Text style={styles.stepDescription}>
              Un fichier Excel pré-formaté avec les colonnes nécessaires
            </Text>
          </View>
        </View>

        <View style={styles.stepItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Remplissez vos données</Text>
            <Text style={styles.stepDescription}>
              Ajoutez les membres de votre famille avec leurs relations
            </Text>
          </View>
        </View>

        <View style={styles.stepItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Importez le fichier</Text>
            <Text style={styles.stepDescription}>
              Votre arbre sera créé automatiquement avec tous les liens
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.templateButton} onPress={downloadTemplate}>
        <Ionicons name="download-outline" size={20} color="#0A1628" />
        <Text style={styles.templateButtonText}>Télécharger le template Excel</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.importButton} onPress={pickAndUploadFile}>
        <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" />
        <Text style={styles.importButtonText}>Importer mon fichier Excel</Text>
      </TouchableOpacity>

      <Text style={styles.hint}>
        💡 Conseil : Commencez par vous-même avec la relation "MOI", puis ajoutez vos proches
      </Text>
    </ScrollView>
  );

  const renderImportingStep = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#D4AF37" />
      <Text style={styles.loadingText}>Import en cours...</Text>
      <Text style={styles.loadingSubtext}>
        Analyse du fichier et création des membres
      </Text>
    </View>
  );

  const renderResultStep = () => (
    <ScrollView style={styles.content}>
      <View style={styles.iconContainer}>
        {importResult?.success ? (
          <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
        ) : (
          <Ionicons name="alert-circle" size={60} color="#F44336" />
        )}
      </View>

      <Text style={styles.title}>
        {importResult?.success ? 'Import réussi !' : 'Erreur d\'import'}
      </Text>
      
      <Text style={styles.subtitle}>
        {importResult?.message}
      </Text>

      {importResult?.success && importResult.persons.length > 0 && (
        <View style={styles.resultList}>
          <Text style={styles.resultListTitle}>Membres importés :</Text>
          {importResult.persons.slice(0, 10).map((person, index) => (
            <View key={person.id} style={styles.resultItem}>
              <Ionicons 
                name={person.relation === 'MOI' ? 'person' : 'people'} 
                size={16} 
                color="#D4AF37" 
              />
              <Text style={styles.resultItemText}>
                {person.name} ({person.relation})
              </Text>
            </View>
          ))}
          {importResult.persons.length > 10 && (
            <Text style={styles.moreText}>
              ... et {importResult.persons.length - 10} autres
            </Text>
          )}
        </View>
      )}

      {importResult?.errors && importResult.errors.length > 0 && (
        <View style={styles.errorList}>
          <Text style={styles.errorListTitle}>Avertissements :</Text>
          {importResult.errors.map((error, index) => (
            <Text key={index} style={styles.errorItem}>• {error}</Text>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.importButton} onPress={closeModal}>
        <Text style={styles.importButtonText}>
          {importResult?.success ? 'Voir mon arbre' : 'Fermer'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <>
      {/* Trigger Button - Compact icon only */}
      <TouchableOpacity style={styles.triggerButton} onPress={openModal}>
        <Ionicons name="document-text-outline" size={22} color="#D4AF37" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>📊 Import Excel</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Content based on step */}
            {step === 'intro' && renderIntroStep()}
            {step === 'importing' && renderImportingStep()}
            {step === 'result' && renderResultStep()}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  triggerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderRadius: 8,
    width: 36,
    height: 36,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#0A1628',
    borderRadius: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#1A2F4A',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2F4A',
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#B8C5D6',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  stepsContainer: {
    marginBottom: 24,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#0A1628',
    fontWeight: '700',
    fontSize: 14,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 13,
    color: '#B8C5D6',
    lineHeight: 18,
  },
  templateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  templateButtonText: {
    color: '#0A1628',
    fontSize: 15,
    fontWeight: '600',
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A2F4A',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#2A3F5A',
  },
  importButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    color: '#6B7C93',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 20,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#B8C5D6',
    marginTop: 8,
  },
  resultList: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  resultListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 12,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  resultItemText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  moreText: {
    fontSize: 13,
    color: '#B8C5D6',
    fontStyle: 'italic',
    marginTop: 8,
  },
  errorList: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  errorListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F44336',
    marginBottom: 8,
  },
  errorItem: {
    fontSize: 13,
    color: '#B8C5D6',
    marginBottom: 4,
  },
});

export default ExcelImport;
