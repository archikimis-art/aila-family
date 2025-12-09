import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { personsAPI, previewAPI } from '@/src/services/api';

const WILAYA_OPTIONS = [
  'Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna', 'Sétif', 'Djelfa',
  'Sidi Bel Abbès', 'Biskra', 'Tébessa', 'El Oued', 'Skikda', 'Tiaret', 'Béjaïa',
  'Tlemcen', 'Bechar', 'Mostaganem', 'Bordj Bou Arréridj', 'Chlef', 'Médéa', 'Tizi Ouzou',
  'Bouira', 'Khenchela', 'Mascara', 'Oum El Bouaghi', 'Ouargla', 'Ghardaïa', 'Relizane',
  'Autre',
];

export default function AddPersonScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isPreviewMode = params.preview === 'true';
  const previewToken = params.token as string;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('unknown');
  const [birthDate, setBirthDate] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [deathDate, setDeathDate] = useState('');
  const [deathPlace, setDeathPlace] = useState('');
  const [algerianBranch, setAlgerianBranch] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWilayaList, setShowWilayaList] = useState(false);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Erreur', 'Le prénom et le nom sont requis.');
      return;
    }

    setLoading(true);
    try {
      const personData = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        gender,
        birth_date: birthDate || null,
        birth_place: birthPlace || null,
        death_date: deathDate || null,
        death_place: deathPlace || null,
        algerian_branch: algerianBranch || null,
        notes: notes || null,
      };

      if (isPreviewMode && previewToken) {
        await previewAPI.addPerson(previewToken, personData);
      } else {
        await personsAPI.create(personData);
      }

      Alert.alert('Succès', `${firstName} ${lastName} a été ajouté(e) à votre arbre.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Erreur lors de l\'ajout.';
      Alert.alert('Erreur', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nouvelle personne</Text>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#0A1628" />
            ) : (
              <Text style={styles.saveButtonText}>Ajouter</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.form}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Name Fields */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Identité</Text>
            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>Prénom *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Prénom"
                  placeholderTextColor="#6B7C93"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>Nom *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nom de famille"
                  placeholderTextColor="#6B7C93"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                />
              </View>
            </View>
          </View>

          {/* Gender */}
          <View style={styles.section}>
            <Text style={styles.label}>Genre</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 'male' && styles.genderButtonActive,
                  gender === 'male' && { borderColor: '#4A90D9' },
                ]}
                onPress={() => setGender('male')}
              >
                <Ionicons name="male" size={24} color={gender === 'male' ? '#4A90D9' : '#6B7C93'} />
                <Text style={[styles.genderText, gender === 'male' && { color: '#4A90D9' }]}>
                  Homme
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 'female' && styles.genderButtonActive,
                  gender === 'female' && { borderColor: '#D94A8C' },
                ]}
                onPress={() => setGender('female')}
              >
                <Ionicons name="female" size={24} color={gender === 'female' ? '#D94A8C' : '#6B7C93'} />
                <Text style={[styles.genderText, gender === 'female' && { color: '#D94A8C' }]}>
                  Femme
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 'unknown' && styles.genderButtonActive,
                ]}
                onPress={() => setGender('unknown')}
              >
                <Ionicons name="person" size={24} color={gender === 'unknown' ? '#D4AF37' : '#6B7C93'} />
                <Text style={[styles.genderText, gender === 'unknown' && { color: '#D4AF37' }]}>
                  Inconnu
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Birth */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Naissance</Text>
            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="JJ/MM/AAAA"
                  placeholderTextColor="#6B7C93"
                  value={birthDate}
                  onChangeText={setBirthDate}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>Lieu</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ville"
                  placeholderTextColor="#6B7C93"
                  value={birthPlace}
                  onChangeText={setBirthPlace}
                />
              </View>
            </View>
          </View>

          {/* Death (optional) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Décès (optionnel)</Text>
            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="JJ/MM/AAAA"
                  placeholderTextColor="#6B7C93"
                  value={deathDate}
                  onChangeText={setDeathDate}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>Lieu</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ville"
                  placeholderTextColor="#6B7C93"
                  value={deathPlace}
                  onChangeText={setDeathPlace}
                />
              </View>
            </View>
          </View>

          {/* Algerian Branch */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Branche algérienne</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setShowWilayaList(!showWilayaList)}
            >
              <Ionicons name="location-outline" size={20} color="#D4AF37" />
              <Text style={[styles.selectText, algerianBranch && { color: '#FFFFFF' }]}>
                {algerianBranch || 'Sélectionner une wilaya'}
              </Text>
              <Ionicons
                name={showWilayaList ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#6B7C93"
              />
            </TouchableOpacity>
            {showWilayaList && (
              <View style={styles.wilayaList}>
                <ScrollView style={styles.wilayaScroll} nestedScrollEnabled>
                  {WILAYA_OPTIONS.map((wilaya) => (
                    <TouchableOpacity
                      key={wilaya}
                      style={[
                        styles.wilayaItem,
                        algerianBranch === wilaya && styles.wilayaItemActive,
                      ]}
                      onPress={() => {
                        setAlgerianBranch(wilaya);
                        setShowWilayaList(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.wilayaText,
                          algerianBranch === wilaya && styles.wilayaTextActive,
                        ]}
                      >
                        {wilaya}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Informations supplémentaires..."
              placeholderTextColor="#6B7C93"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1628',
  },
  keyboardView: {
    flex: 1,
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
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#0A1628',
    fontSize: 15,
    fontWeight: '600',
  },
  form: {
    flex: 1,
  },
  formContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4AF37',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#B8C5D6',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1A2F4A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2A3F5A',
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    backgroundColor: '#1A2F4A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2A3F5A',
  },
  genderButtonActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderColor: '#D4AF37',
  },
  genderText: {
    color: '#6B7C93',
    fontSize: 13,
    marginTop: 6,
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2F4A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#2A3F5A',
    gap: 10,
  },
  selectText: {
    flex: 1,
    color: '#6B7C93',
    fontSize: 16,
  },
  wilayaList: {
    backgroundColor: '#1A2F4A',
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#2A3F5A',
  },
  wilayaScroll: {
    padding: 8,
  },
  wilayaItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  wilayaItemActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
  },
  wilayaText: {
    color: '#B8C5D6',
    fontSize: 15,
  },
  wilayaTextActive: {
    color: '#D4AF37',
    fontWeight: '600',
  },
});
