import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { personsAPI, linksAPI, previewAPI } from '@/services/api';

interface Person {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  birth_date?: string;
  birth_place?: string;
  death_date?: string;
  death_place?: string;
  geographic_branch?: string;
  notes?: string;
}

interface FamilyLink {
  id: string;
  person_id_1: string;
  person_id_2: string;
  link_type: string;
}

export default function PersonDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const personId = params.id as string;
  const isPreviewMode = params.preview === 'true';
  const previewToken = params.token as string;

  const [person, setPerson] = useState<Person | null>(null);
  const [allPersons, setAllPersons] = useState<Person[]>([]);
  const [links, setLinks] = useState<FamilyLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [deathDate, setDeathDate] = useState('');
  const [deathPlace, setDeathPlace] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadData();
  }, [personId]);

  const loadData = async () => {
    try {
      if (isPreviewMode && previewToken) {
        const response = await previewAPI.getSession(previewToken);
        const persons = response.data.persons || [];
        const foundPerson = persons.find((p: Person) => p.id === personId);
        setPerson(foundPerson || null);
        setAllPersons(persons);
        setLinks(response.data.links || []);
        if (foundPerson) {
          setFirstName(foundPerson.first_name);
          setLastName(foundPerson.last_name);
          setBirthDate(foundPerson.birth_date || '');
          setBirthPlace(foundPerson.birth_place || '');
          setDeathDate(foundPerson.death_date || '');
          setDeathPlace(foundPerson.death_place || '');
          setNotes(foundPerson.notes || '');
        }
      } else {
        const [personRes, allPersonsRes, linksRes] = await Promise.all([
          personsAPI.getOne(personId),
          personsAPI.getAll(),
          linksAPI.getAll(),
        ]);
        setPerson(personRes.data);
        setAllPersons(allPersonsRes.data || []);
        setLinks(linksRes.data || []);
        setFirstName(personRes.data.first_name);
        setLastName(personRes.data.last_name);
        setBirthDate(personRes.data.birth_date || '');
        setBirthPlace(personRes.data.birth_place || '');
        setDeathDate(personRes.data.death_date || '');
        setDeathPlace(personRes.data.death_place || '');
        setNotes(personRes.data.notes || '');
      }
    } catch (error) {
      console.error('Error loading person:', error);
      Alert.alert('Erreur', 'Impossible de charger les informations.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Erreur', 'Le prénom et le nom sont requis.');
      return;
    }

    setSaving(true);
    try {
      await personsAPI.update(personId, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        birth_date: birthDate || null,
        birth_place: birthPlace || null,
        death_date: deathDate || null,
        death_place: deathPlace || null,
        notes: notes || null,
      });
      await loadData();
      setEditing(false);
      Alert.alert('Succès', 'Les modifications ont été enregistrées.');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder les modifications.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Supprimer',
      `Êtes-vous sûr de vouloir supprimer ${person?.first_name} ${person?.last_name} ?\n\nCette action supprimera également tous les liens familiaux associés.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              if (isPreviewMode && previewToken) {
                // Delete from preview session
                await previewAPI.deletePerson(previewToken, personId);
              } else {
                // Delete from authenticated user's data
                await personsAPI.delete(personId);
              }
              Alert.alert('Succès', 'La personne a été supprimée.');
              router.back();
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Erreur', 'Impossible de supprimer la personne.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const getRelatedPersons = () => {
    const relatedLinks = links.filter(
      (l) => l.person_id_1 === personId || l.person_id_2 === personId
    );

    return relatedLinks.map((link) => {
      const relatedId = link.person_id_1 === personId ? link.person_id_2 : link.person_id_1;
      const relatedPerson = allPersons.find((p) => p.id === relatedId);
      let relationship = '';

      if (link.link_type === 'spouse') {
        relationship = 'Époux/Épouse';
      } else if (link.link_type === 'parent') {
        relationship = link.person_id_1 === personId ? 'Enfant' : 'Parent';
      } else if (link.link_type === 'child') {
        relationship = link.person_id_1 === personId ? 'Parent' : 'Enfant';
      }

      return {
        link,
        person: relatedPerson,
        relationship,
      };
    });
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
        </View>
      </SafeAreaView>
    );
  }

  if (!person) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#FF6B6B" />
          <Text style={styles.errorText}>Personne non trouvée</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const relatedPersons = getRelatedPersons();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails</Text>
        {!isPreviewMode && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => (editing ? handleSave() : setEditing(true))}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#D4AF37" />
            ) : (
              <Ionicons name={editing ? 'checkmark' : 'pencil'} size={22} color="#D4AF37" />
            )}
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={[styles.avatar, { borderColor: getGenderColor(person.gender) }]}>
            <Ionicons
              name={person.gender === 'male' ? 'male' : person.gender === 'female' ? 'female' : 'person'}
              size={40}
              color={getGenderColor(person.gender)}
            />
          </View>
          {editing ? (
            <View style={styles.editNameContainer}>
              <TextInput
                style={styles.editNameInput}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Prénom"
                placeholderTextColor="#6B7C93"
              />
              <TextInput
                style={styles.editNameInput}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Nom"
                placeholderTextColor="#6B7C93"
              />
            </View>
          ) : (
            <>
              <Text style={styles.personName}>
                {person.first_name} {person.last_name}
              </Text>
              {person.geographic_branch && (
                <View style={styles.branchBadge}>
                  <Ionicons name="location" size={14} color="#D4AF37" />
                  <Text style={styles.branchText}>{person.geographic_branch}</Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={20} color="#6B7C93" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Naissance</Text>
                {editing ? (
                  <TextInput
                    style={styles.editInput}
                    value={birthDate}
                    onChangeText={setBirthDate}
                    placeholder="JJ/MM/AAAA"
                    placeholderTextColor="#6B7C93"
                  />
                ) : (
                  <Text style={styles.infoValue}>{person.birth_date || 'Non renseigné'}</Text>
                )}
              </View>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={20} color="#6B7C93" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Lieu de naissance</Text>
                {editing ? (
                  <TextInput
                    style={styles.editInput}
                    value={birthPlace}
                    onChangeText={setBirthPlace}
                    placeholder="Ville"
                    placeholderTextColor="#6B7C93"
                  />
                ) : (
                  <Text style={styles.infoValue}>{person.birth_place || 'Non renseigné'}</Text>
                )}
              </View>
            </View>
          </View>

          {(person.death_date || person.death_place || editing) && (
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="calendar" size={20} color="#6B7C93" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Décès</Text>
                  {editing ? (
                    <TextInput
                      style={styles.editInput}
                      value={deathDate}
                      onChangeText={setDeathDate}
                      placeholder="JJ/MM/AAAA"
                      placeholderTextColor="#6B7C93"
                    />
                  ) : (
                    <Text style={styles.infoValue}>{person.death_date || 'Non renseigné'}</Text>
                  )}
                </View>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="location" size={20} color="#6B7C93" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Lieu de décès</Text>
                  {editing ? (
                    <TextInput
                      style={styles.editInput}
                      value={deathPlace}
                      onChangeText={setDeathPlace}
                      placeholder="Ville"
                      placeholderTextColor="#6B7C93"
                    />
                  ) : (
                    <Text style={styles.infoValue}>{person.death_place || 'Non renseigné'}</Text>
                  )}
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          {editing ? (
            <TextInput
              style={[styles.editInput, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Ajouter des notes..."
              placeholderTextColor="#6B7C93"
              multiline
              numberOfLines={4}
            />
          ) : (
            <Text style={styles.notesText}>
              {person.notes || 'Aucune note'}
            </Text>
          )}
        </View>

        {/* Relations Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Relations familiales</Text>
          {relatedPersons.length === 0 ? (
            <Text style={styles.noRelationsText}>Aucune relation familiale</Text>
          ) : (
            relatedPersons.map(({ link, person: relatedPerson, relationship }) => (
              <TouchableOpacity
                key={link.id}
                style={styles.relationCard}
                onPress={() =>
                  relatedPerson &&
                  router.push({
                    pathname: '/person/[id]',
                    params: { id: relatedPerson.id, preview: isPreviewMode ? 'true' : 'false', token: previewToken || '' },
                  })
                }
              >
                <View style={[styles.relationDot, { backgroundColor: getGenderColor(relatedPerson?.gender || 'unknown') }]} />
                <View style={styles.relationInfo}>
                  <Text style={styles.relationName}>
                    {relatedPerson ? `${relatedPerson.first_name} ${relatedPerson.last_name}` : 'Inconnu'}
                  </Text>
                  <Text style={styles.relationLabel}>{relationship}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator size="small" color="#FF6B6B" />
          ) : (
            <>
              <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
              <Text style={styles.deleteButtonText}>Supprimer cette personne</Text>
            </>
          )}
        </TouchableOpacity>
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
  errorText: {
    color: '#FF6B6B',
    fontSize: 18,
    marginTop: 16,
  },
  backButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#1A2F4A',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
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
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1A2F4A',
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  personName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
  },
  branchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    gap: 6,
  },
  branchText: {
    color: '#D4AF37',
    fontSize: 14,
  },
  editNameContainer: {
    marginTop: 16,
    gap: 8,
  },
  editNameInput: {
    backgroundColor: '#1A2F4A',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    width: 200,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7C93',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#1A2F4A',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7C93',
  },
  infoValue: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 2,
  },
  editInput: {
    backgroundColor: '#0A1628',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#2A3F5A',
  },
  notesText: {
    color: '#B8C5D6',
    fontSize: 15,
    lineHeight: 22,
  },
  notesInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  noRelationsText: {
    color: '#6B7C93',
    fontSize: 14,
    fontStyle: 'italic',
  },
  relationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2F4A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  relationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  relationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  relationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  relationLabel: {
    fontSize: 13,
    color: '#6B7C93',
    marginTop: 2,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    gap: 8,
  },
  deleteButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '500',
  },
});
