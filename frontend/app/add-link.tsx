import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { personsAPI, linksAPI, previewAPI } from '../src/services/api';

interface Person {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
}

const LINK_TYPES = [
  { value: 'parent', label: 'Parent de', icon: 'arrow-up', description: 'La première personne est parent de la seconde' },
  { value: 'child', label: 'Enfant de', icon: 'arrow-down', description: 'La première personne est enfant de la seconde' },
  { value: 'spouse', label: 'Époux/Épouse de', icon: 'heart', description: 'Les deux personnes sont mariées' },
];

export default function AddLinkScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isPreviewMode = params.preview === 'true';
  const previewToken = params.token as string;

  const [persons, setPersons] = useState<Person[]>([]);
  const [person1, setPerson1] = useState<Person | null>(null);
  const [person2, setPerson2] = useState<Person | null>(null);
  const [linkType, setLinkType] = useState('parent');
  const [loading, setLoading] = useState(false);
  const [loadingPersons, setLoadingPersons] = useState(true);
  const [showPerson1List, setShowPerson1List] = useState(false);
  const [showPerson2List, setShowPerson2List] = useState(false);

  useEffect(() => {
    loadPersons();
  }, []);

  const loadPersons = async () => {
    try {
      if (isPreviewMode && previewToken) {
        const response = await previewAPI.getSession(previewToken);
        setPersons(response.data.persons || []);
      } else {
        const response = await personsAPI.getAll();
        setPersons(response.data || []);
      }
    } catch (error) {
      console.error('Error loading persons:', error);
    } finally {
      setLoadingPersons(false);
    }
  };

  const handleSave = async () => {
    if (!person1 || !person2) {
      Alert.alert('Erreur', 'Sélectionnez deux personnes.');
      return;
    }

    if (person1.id === person2.id) {
      Alert.alert('Erreur', 'Les deux personnes doivent être différentes.');
      return;
    }

    setLoading(true);
    try {
      const linkData = {
        person_id_1: person1.id,
        person_id_2: person2.id,
        link_type: linkType,
      };

      if (isPreviewMode && previewToken) {
        await previewAPI.addLink(previewToken, linkData);
      } else {
        await linksAPI.create(linkData);
      }

      Alert.alert('Succès', 'Le lien familial a été créé.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Erreur lors de la création du lien.';
      Alert.alert('Erreur', message);
    } finally {
      setLoading(false);
    }
  };

  const getGenderColor = (gender: string) => {
    switch (gender) {
      case 'male':
        return '#4A90D9';
      case 'female':
        return '#D94A8C';
      default:
        return '#6B7C93';
    }
  };

  const renderPersonSelector = (
    label: string,
    selectedPerson: Person | null,
    onSelect: (person: Person) => void,
    showList: boolean,
    setShowList: (show: boolean) => void,
    excludeId?: string
  ) => (
    <View style={styles.selectorContainer}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setShowList(!showList)}
      >
        {selectedPerson ? (
          <View style={styles.selectedPerson}>
            <View style={[styles.personDot, { backgroundColor: getGenderColor(selectedPerson.gender) }]} />
            <Text style={styles.selectedPersonText}>
              {selectedPerson.first_name} {selectedPerson.last_name}
            </Text>
          </View>
        ) : (
          <Text style={styles.placeholderText}>Sélectionner une personne</Text>
        )}
        <Ionicons
          name={showList ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#6B7C93"
        />
      </TouchableOpacity>
      {showList && (
        <View style={styles.personList}>
          <ScrollView style={styles.personListScroll} nestedScrollEnabled>
            {persons
              .filter((p) => p.id !== excludeId)
              .map((person) => (
                <TouchableOpacity
                  key={person.id}
                  style={[
                    styles.personItem,
                    selectedPerson?.id === person.id && styles.personItemActive,
                  ]}
                  onPress={() => {
                    onSelect(person);
                    setShowList(false);
                  }}
                >
                  <View style={[styles.personDot, { backgroundColor: getGenderColor(person.gender) }]} />
                  <Text
                    style={[
                      styles.personItemText,
                      selectedPerson?.id === person.id && styles.personItemTextActive,
                    ]}
                  >
                    {person.first_name} {person.last_name}
                  </Text>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  if (loadingPersons) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouveau lien</Text>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#0A1628" />
          ) : (
            <Text style={styles.saveButtonText}>Créer</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Person 1 */}
        {renderPersonSelector(
          'Première personne',
          person1,
          setPerson1,
          showPerson1List,
          setShowPerson1List,
          person2?.id
        )}

        {/* Link Type */}
        <View style={styles.section}>
          <Text style={styles.label}>Type de relation</Text>
          <View style={styles.linkTypeContainer}>
            {LINK_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.linkTypeButton,
                  linkType === type.value && styles.linkTypeButtonActive,
                ]}
                onPress={() => setLinkType(type.value)}
              >
                <Ionicons
                  name={type.icon as any}
                  size={24}
                  color={linkType === type.value ? '#D4AF37' : '#6B7C93'}
                />
                <Text
                  style={[
                    styles.linkTypeText,
                    linkType === type.value && styles.linkTypeTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {LINK_TYPES.find((t) => t.value === linkType) && (
            <Text style={styles.linkDescription}>
              {LINK_TYPES.find((t) => t.value === linkType)?.description}
            </Text>
          )}
        </View>

        {/* Person 2 */}
        {renderPersonSelector(
          'Deuxième personne',
          person2,
          setPerson2,
          showPerson2List,
          setShowPerson2List,
          person1?.id
        )}

        {/* Preview */}
        {person1 && person2 && (
          <View style={styles.previewCard}>
            <Ionicons name="git-merge" size={24} color="#D4AF37" />
            <Text style={styles.previewText}>
              <Text style={styles.previewName}>{person1.first_name} {person1.last_name}</Text>
              {' est '}
              <Text style={styles.previewRelation}>
                {linkType === 'parent' ? 'parent de' : linkType === 'child' ? 'enfant de' : 'époux/épouse de'}
              </Text>
              {' '}
              <Text style={styles.previewName}>{person2.first_name} {person2.last_name}</Text>
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1628',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  selectorContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#B8C5D6',
    marginBottom: 8,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A2F4A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#2A3F5A',
  },
  selectedPerson: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  personDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  selectedPersonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  placeholderText: {
    color: '#6B7C93',
    fontSize: 16,
  },
  personList: {
    backgroundColor: '#1A2F4A',
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#2A3F5A',
  },
  personListScroll: {
    padding: 8,
  },
  personItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  personItemActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
  },
  personItemText: {
    color: '#B8C5D6',
    fontSize: 15,
  },
  personItemTextActive: {
    color: '#D4AF37',
    fontWeight: '600',
  },
  linkTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  linkTypeButton: {
    flex: 1,
    backgroundColor: '#1A2F4A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2A3F5A',
  },
  linkTypeButtonActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderColor: '#D4AF37',
  },
  linkTypeText: {
    color: '#6B7C93',
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
  linkTypeTextActive: {
    color: '#D4AF37',
  },
  linkDescription: {
    color: '#6B7C93',
    fontSize: 13,
    marginTop: 12,
    fontStyle: 'italic',
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  previewText: {
    flex: 1,
    color: '#B8C5D6',
    fontSize: 15,
    lineHeight: 22,
  },
  previewName: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  previewRelation: {
    color: '#D4AF37',
    fontWeight: '600',
  },
});
