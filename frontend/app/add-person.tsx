import React, { useState, useEffect } from 'react';
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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { personsAPI, previewAPI } from '@/services/api';

// ===================== DONNÉES GÉOGRAPHIQUES MONDIALES =====================
const WORLD_LOCATIONS: Record<string, Record<string, string[]>> = {
  'Afrique': {
    'Algérie': ['Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna', 'Sétif', 'Djelfa', 'Sidi Bel Abbès', 'Biskra', 'Tébessa', 'El Oued', 'Skikda', 'Tiaret', 'Béjaïa', 'Tlemcen', 'Bechar', 'Mostaganem', 'Tizi Ouzou', 'Bouira', 'Ghardaïa'],
    'Maroc': ['Casablanca', 'Rabat', 'Fès', 'Marrakech', 'Tanger', 'Agadir', 'Meknès', 'Oujda', 'Tétouan', 'Salé'],
    'Tunisie': ['Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte', 'Gabès', 'Ariana', 'Gafsa', 'Monastir'],
    'Égypte': ['Le Caire', 'Alexandrie', 'Gizeh', 'Louxor', 'Assouan', 'Port-Saïd', 'Suez'],
    'Sénégal': ['Dakar', 'Saint-Louis', 'Thiès', 'Rufisque', 'Kaolack', 'Ziguinchor'],
    'Côte d\'Ivoire': ['Abidjan', 'Yamoussoukro', 'Bouaké', 'Daloa', 'San-Pédro'],
    'Mali': ['Bamako', 'Sikasso', 'Mopti', 'Ségou', 'Kayes', 'Tombouctou'],
    'Cameroun': ['Yaoundé', 'Douala', 'Garoua', 'Bamenda', 'Maroua', 'Bafoussam'],
    'Afrique du Sud': ['Johannesburg', 'Le Cap', 'Durban', 'Pretoria', 'Port Elizabeth'],
    'Nigeria': ['Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt'],
    'Libye': ['Tripoli', 'Benghazi', 'Misrata', 'Zawiya', 'Zliten'],
    'Mauritanie': ['Nouakchott', 'Nouadhibou', 'Kaédi', 'Zouerate'],
  },
  'Europe': {
    'France': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Saint-Étienne', 'Toulon', 'Le Havre', 'Grenoble', 'Dijon', 'Angers', 'Nîmes', 'Villeurbanne'],
    'Allemagne': ['Berlin', 'Hambourg', 'Munich', 'Cologne', 'Francfort', 'Stuttgart', 'Düsseldorf', 'Leipzig', 'Dortmund', 'Essen'],
    'Espagne': ['Madrid', 'Barcelone', 'Valence', 'Séville', 'Saragosse', 'Malaga', 'Murcie', 'Palma', 'Bilbao'],
    'Italie': ['Rome', 'Milan', 'Naples', 'Turin', 'Palerme', 'Gênes', 'Bologne', 'Florence', 'Venise', 'Vérone'],
    'Royaume-Uni': ['Londres', 'Birmingham', 'Manchester', 'Leeds', 'Glasgow', 'Liverpool', 'Bristol', 'Sheffield', 'Édimbourg', 'Cardiff'],
    'Belgique': ['Bruxelles', 'Anvers', 'Gand', 'Charleroi', 'Liège', 'Bruges', 'Namur'],
    'Suisse': ['Zurich', 'Genève', 'Bâle', 'Lausanne', 'Berne', 'Winterthour', 'Lucerne'],
    'Pays-Bas': ['Amsterdam', 'Rotterdam', 'La Haye', 'Utrecht', 'Eindhoven', 'Tilburg'],
    'Portugal': ['Lisbonne', 'Porto', 'Braga', 'Coimbra', 'Funchal', 'Faro'],
    'Pologne': ['Varsovie', 'Cracovie', 'Łódź', 'Wrocław', 'Poznań', 'Gdańsk'],
    'Suède': ['Stockholm', 'Göteborg', 'Malmö', 'Uppsala', 'Västerås'],
    'Autriche': ['Vienne', 'Graz', 'Linz', 'Salzbourg', 'Innsbruck'],
    'Grèce': ['Athènes', 'Thessalonique', 'Patras', 'Héraklion', 'Larissa'],
    'Russie': ['Moscou', 'Saint-Pétersbourg', 'Novossibirsk', 'Ekaterinbourg', 'Kazan'],
  },
  'Amérique du Nord': {
    'Canada': ['Toronto', 'Montréal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Québec', 'Hamilton', 'Halifax'],
    'États-Unis': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphie', 'San Antonio', 'San Diego', 'Dallas', 'San Francisco', 'Washington D.C.', 'Boston', 'Seattle', 'Miami', 'Atlanta'],
    'Mexique': ['Mexico', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Cancún'],
  },
  'Amérique du Sud': {
    'Brésil': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte'],
    'Argentine': ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata'],
    'Colombie': ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Carthagène'],
    'Chili': ['Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta'],
    'Pérou': ['Lima', 'Arequipa', 'Trujillo', 'Chiclayo', 'Cusco'],
  },
  'Asie': {
    'Chine': ['Pékin', 'Shanghai', 'Canton', 'Shenzhen', 'Chengdu', 'Hangzhou', 'Xi\'an', 'Wuhan'],
    'Japon': ['Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo', 'Kobe', 'Kyoto', 'Fukuoka'],
    'Inde': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad'],
    'Turquie': ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'Adana', 'Konya'],
    'Arabie Saoudite': ['Riyad', 'Djeddah', 'La Mecque', 'Médine', 'Dammam'],
    'Émirats Arabes Unis': ['Dubaï', 'Abou Dhabi', 'Sharjah', 'Ajman', 'Al Ain'],
    'Liban': ['Beyrouth', 'Tripoli', 'Sidon', 'Tyr', 'Jounieh', 'Zahlé'],
    'Syrie': ['Damas', 'Alep', 'Homs', 'Lattaquié', 'Hama'],
    'Jordanie': ['Amman', 'Zarqa', 'Irbid', 'Aqaba', 'Salt'],
    'Irak': ['Bagdad', 'Bassora', 'Mossoul', 'Erbil', 'Kirkouk'],
    'Iran': ['Téhéran', 'Mashhad', 'Ispahan', 'Karaj', 'Tabriz', 'Chiraz'],
    'Pakistan': ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad'],
    'Corée du Sud': ['Séoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon'],
    'Vietnam': ['Hô Chi Minh-Ville', 'Hanoï', 'Da Nang', 'Haiphong', 'Can Tho'],
    'Thaïlande': ['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya', 'Nonthaburi'],
    'Indonésie': ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Bali'],
    'Malaisie': ['Kuala Lumpur', 'George Town', 'Johor Bahru', 'Ipoh', 'Shah Alam'],
    'Philippines': ['Manille', 'Quezon City', 'Davao', 'Cebu', 'Zamboanga'],
  },
  'Océanie': {
    'Australie': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adélaïde', 'Canberra'],
    'Nouvelle-Zélande': ['Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Dunedin'],
  },
};

const REGIONS = Object.keys(WORLD_LOCATIONS);

export default function AddPersonScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isPreviewMode = params.preview === 'true';
  const previewToken = params.token as string;
  const sharedOwnerId = params.sharedOwnerId as string | undefined;
  const editPersonId = params.editId as string | undefined; // Mode édition
  const isEditMode = !!editPersonId;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('unknown');
  const [birthDate, setBirthDate] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [deathDate, setDeathDate] = useState('');
  const [deathPlace, setDeathPlace] = useState('');
  const [geographicBranch, setGeographicBranch] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [showWilayaList, setShowWilayaList] = useState(false);
  
  // Pour le mode édition - liens familiaux
  const [familyLinks, setFamilyLinks] = useState<any[]>([]);
  const [allPersons, setAllPersons] = useState<any[]>([]);
  
  // Charger les données en mode édition
  useEffect(() => {
    if (isEditMode && editPersonId) {
      loadPersonData();
    }
  }, [editPersonId]);

  const loadPersonData = async () => {
    setInitialLoading(true);
    try {
      if (isPreviewMode && previewToken) {
        const response = await previewAPI.getSession(previewToken);
        const persons = response.data.persons || [];
        const foundPerson = persons.find((p: any) => p.id === editPersonId);
        if (foundPerson) {
          setFirstName(foundPerson.first_name || '');
          setLastName(foundPerson.last_name || '');
          setGender(foundPerson.gender || 'unknown');
          setBirthDate(foundPerson.birth_date || '');
          setBirthPlace(foundPerson.birth_place || '');
          setDeathDate(foundPerson.death_date || '');
          setDeathPlace(foundPerson.death_place || '');
          setGeographicBranch(foundPerson.geographic_branch || '');
          setNotes(foundPerson.notes || '');
        }
        setAllPersons(persons);
        setFamilyLinks(response.data.links || []);
      } else if (editPersonId) {
        const [personRes, allPersonsRes, linksRes] = await Promise.all([
          personsAPI.getOne(editPersonId),
          personsAPI.getAll(),
          (await import('@/services/api')).linksAPI.getAll(),
        ]);
        const person = personRes.data;
        setFirstName(person.first_name || '');
        setLastName(person.last_name || '');
        setGender(person.gender || 'unknown');
        setBirthDate(person.birth_date || '');
        setBirthPlace(person.birth_place || '');
        setDeathDate(person.death_date || '');
        setDeathPlace(person.death_place || '');
        setGeographicBranch(person.geographic_branch || '');
        setNotes(person.notes || '');
        setAllPersons(allPersonsRes.data || []);
        setFamilyLinks(linksRes.data || []);
      }
    } catch (error) {
      console.error('Error loading person:', error);
      if (typeof window !== 'undefined') {
        window.alert('Erreur lors du chargement des données.');
      }
    } finally {
      setInitialLoading(false);
    }
  };

  // Obtenir les liens de cette personne
  const getPersonLinks = () => {
    if (!editPersonId) return [];
    return familyLinks.filter(
      (link: any) => link.person_id_1 === editPersonId || link.person_id_2 === editPersonId
    );
  };

  // Obtenir le nom d'une personne par ID
  const getPersonName = (id: string) => {
    const person = allPersons.find((p: any) => p.id === id);
    return person ? `${person.first_name} ${person.last_name}` : 'Inconnu';
  };

  // Déterminer la relation
  const getRelationship = (link: any) => {
    if (link.link_type === 'spouse') return 'Conjoint(e)';
    if (link.link_type === 'parent') {
      if (link.person_id_1 === editPersonId) return 'Parent de';
      return 'Enfant de';
    }
    return link.link_type;
  };

  // Supprimer un lien
  const handleDeleteLink = async (linkId: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Supprimer ce lien familial ?')) {
      return;
    }
    try {
      if (isPreviewMode && previewToken) {
        await previewAPI.deleteLink(previewToken, linkId);
      } else {
        const { linksAPI } = await import('@/services/api');
        await linksAPI.delete(linkId);
      }
      setFamilyLinks(familyLinks.filter((l: any) => l.id !== linkId));
      if (typeof window !== 'undefined') {
        window.alert('Lien supprimé.');
      }
    } catch (error) {
      console.error('Error deleting link:', error);
      if (typeof window !== 'undefined') {
        window.alert('Erreur lors de la suppression du lien.');
      }
    }
  };
  
  // États pour la sélection géographique
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationPickerMode, setLocationPickerMode] = useState<'birth' | 'death' | 'branch'>('birth');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [manualLocationInput, setManualLocationInput] = useState(false);

  // Ouvrir le sélecteur de lieu
  const openLocationPicker = (mode: 'birth' | 'death' | 'branch') => {
    setLocationPickerMode(mode);
    setSelectedRegion(null);
    setSelectedCountry(null);
    setManualLocationInput(false);
    setShowLocationPicker(true);
  };

  // Sélectionner une ville
  const selectCity = (city: string, country: string) => {
    const fullLocation = `${city}, ${country}`;
    if (locationPickerMode === 'birth') {
      setBirthPlace(fullLocation);
    } else if (locationPickerMode === 'death') {
      setDeathPlace(fullLocation);
    } else if (locationPickerMode === 'branch') {
      setGeographicBranch(fullLocation);
    }
    setShowLocationPicker(false);
  };

  // Sauvegarder un lieu manuel
  const saveManualLocation = (location: string) => {
    if (locationPickerMode === 'birth') {
      setBirthPlace(location);
    } else if (locationPickerMode === 'death') {
      setDeathPlace(location);
    } else if (locationPickerMode === 'branch') {
      setGeographicBranch(location);
    }
    setShowLocationPicker(false);
  };
  
  // Obtenir la valeur actuelle selon le mode
  const getCurrentLocationValue = () => {
    switch (locationPickerMode) {
      case 'birth': return birthPlace;
      case 'death': return deathPlace;
      case 'branch': return geographicBranch;
    }
  };
  
  // Mettre à jour la valeur selon le mode
  const setCurrentLocationValue = (value: string) => {
    switch (locationPickerMode) {
      case 'birth': setBirthPlace(value); break;
      case 'death': setDeathPlace(value); break;
      case 'branch': setGeographicBranch(value); break;
    }
  };
  
  // Obtenir le titre du modal selon le mode
  const getLocationPickerTitle = () => {
    switch (locationPickerMode) {
      case 'birth': return 'Lieu de naissance';
      case 'death': return 'Lieu de décès';
      case 'branch': return 'Branche géographique';
    }
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      if (typeof window !== 'undefined') {
        window.alert('Erreur: Le prénom et le nom sont requis.');
      }
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
        geographic_branch: geographicBranch || null,
        notes: notes || null,
      };

      console.log('Saving person:', personData, 'Edit mode:', isEditMode);

      if (isEditMode && editPersonId) {
        // Mode édition - mettre à jour la personne existante
        if (isPreviewMode && previewToken) {
          await previewAPI.updatePerson(previewToken, editPersonId, personData);
        } else {
          await personsAPI.update(editPersonId, personData);
        }
        if (typeof window !== 'undefined') {
          window.alert(`${firstName} ${lastName} a été mis(e) à jour.`);
        }
      } else if (isPreviewMode && previewToken) {
        // Mode aperçu - ajouter
        await previewAPI.addPerson(previewToken, personData);
        if (typeof window !== 'undefined') {
          window.alert(`${firstName} ${lastName} a été ajouté(e) à l'arbre.`);
        }
      } else if (sharedOwnerId) {
        // Arbre partagé - utiliser l'endpoint spécifique pour les éditeurs
        const { collaboratorsAPI } = await import('@/services/api');
        await collaboratorsAPI.createPersonInSharedTree(sharedOwnerId, personData);
        if (typeof window !== 'undefined') {
          window.alert(`${firstName} ${lastName} a été ajouté(e) à l'arbre.`);
        }
      } else {
        // Mon propre arbre - ajouter
        await personsAPI.create(personData);
        if (typeof window !== 'undefined') {
          window.alert(`${firstName} ${lastName} a été ajouté(e) à l'arbre.`);
        }
      }
      
      // Navigate to tree with proper parameters
      if (isPreviewMode && previewToken) {
        router.replace(`/(tabs)/tree?preview=true&token=${previewToken}`);
      } else {
        router.replace('/(tabs)/tree');
      }
    } catch (error: any) {
      console.error('Save person error:', error);
      const message = error.response?.data?.detail || 'Erreur lors de la sauvegarde.';
      if (typeof window !== 'undefined') {
        window.alert('Erreur: ' + message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.headerTitle}>{isEditMode ? 'Modifier' : 'Nouvelle personne'}</Text>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
            testID="save-button"
            accessibilityLabel={isEditMode ? "Enregistrer les modifications" : "Ajouter une personne"}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#0A1628" />
            ) : (
              <Text style={styles.saveButtonText}>{isEditMode ? 'Enregistrer' : 'Ajouter'}</Text>
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
                <TouchableOpacity
                  style={styles.locationButton}
                  onPress={() => openLocationPicker('birth')}
                >
                  <Ionicons name="location-outline" size={18} color="#D4AF37" />
                  <Text style={[styles.locationButtonText, birthPlace && { color: '#FFFFFF' }]} numberOfLines={1}>
                    {birthPlace || 'Choisir un lieu'}
                  </Text>
                </TouchableOpacity>
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
                <TouchableOpacity
                  style={styles.locationButton}
                  onPress={() => openLocationPicker('death')}
                >
                  <Ionicons name="location-outline" size={18} color="#D4AF37" />
                  <Text style={[styles.locationButtonText, deathPlace && { color: '#FFFFFF' }]} numberOfLines={1}>
                    {deathPlace || 'Choisir un lieu'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Geographic Branch */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Branche géographique</Text>
            <Text style={styles.sectionDescription}>Région d'origine de la famille</Text>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={() => openLocationPicker('branch')}
            >
              <Ionicons name="globe-outline" size={18} color="#D4AF37" />
              <Text style={[styles.locationButtonText, geographicBranch && { color: '#FFFFFF' }]} numberOfLines={1}>
                {geographicBranch || 'Choisir une région'}
              </Text>
            </TouchableOpacity>
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

          {/* Liens familiaux - seulement en mode édition */}
          {isEditMode && getPersonLinks().length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Liens familiaux</Text>
              {getPersonLinks().map((link: any) => {
                const otherId = link.person_id_1 === editPersonId ? link.person_id_2 : link.person_id_1;
                return (
                  <View key={link.id} style={styles.linkRow}>
                    <View style={styles.linkInfo}>
                      <Text style={styles.linkRelation}>{getRelationship(link)}</Text>
                      <Text style={styles.linkName}>{getPersonName(otherId)}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteLinkButton}
                      onPress={() => handleDeleteLink(link.id)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#E53E3E" />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de sélection de lieu */}
      <Modal
        visible={showLocationPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLocationPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {getLocationPickerTitle()}
              </Text>
              <TouchableOpacity onPress={() => setShowLocationPicker(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Option pour saisie manuelle */}
            <TouchableOpacity
              style={[styles.manualInputButton, manualLocationInput && styles.manualInputButtonActive]}
              onPress={() => setManualLocationInput(!manualLocationInput)}
            >
              <Ionicons name="create-outline" size={20} color="#D4AF37" />
              <Text style={styles.manualInputButtonText}>Saisir manuellement</Text>
            </TouchableOpacity>

            {manualLocationInput ? (
              <View style={styles.manualInputContainer}>
                <TextInput
                  style={styles.manualInput}
                  placeholder="Ex: Paris, France"
                  placeholderTextColor="#6B7C93"
                  value={getCurrentLocationValue()}
                  onChangeText={setCurrentLocationValue}
                  autoFocus
                />
                <TouchableOpacity
                  style={styles.manualSaveButton}
                  onPress={() => setShowLocationPicker(false)}
                >
                  <Text style={styles.manualSaveButtonText}>Valider</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView style={styles.locationScroll}>
                {!selectedRegion ? (
                  // Sélection de région
                  <>
                    <Text style={styles.locationSectionTitle}>Sélectionnez une région</Text>
                    {REGIONS.map((region) => (
                      <TouchableOpacity
                        key={region}
                        style={styles.locationItem}
                        onPress={() => setSelectedRegion(region)}
                      >
                        <Ionicons name="globe-outline" size={20} color="#D4AF37" />
                        <Text style={styles.locationItemText}>{region}</Text>
                        <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
                      </TouchableOpacity>
                    ))}
                  </>
                ) : !selectedCountry ? (
                  // Sélection de pays
                  <>
                    <TouchableOpacity
                      style={styles.backButton}
                      onPress={() => setSelectedRegion(null)}
                    >
                      <Ionicons name="arrow-back" size={20} color="#D4AF37" />
                      <Text style={styles.backButtonText}>Retour aux régions</Text>
                    </TouchableOpacity>
                    <Text style={styles.locationSectionTitle}>{selectedRegion}</Text>
                    {Object.keys(WORLD_LOCATIONS[selectedRegion] || {}).map((country) => (
                      <TouchableOpacity
                        key={country}
                        style={styles.locationItem}
                        onPress={() => setSelectedCountry(country)}
                      >
                        <Ionicons name="flag-outline" size={20} color="#4A90D9" />
                        <Text style={styles.locationItemText}>{country}</Text>
                        <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
                      </TouchableOpacity>
                    ))}
                  </>
                ) : (
                  // Sélection de ville
                  <>
                    <TouchableOpacity
                      style={styles.backButton}
                      onPress={() => setSelectedCountry(null)}
                    >
                      <Ionicons name="arrow-back" size={20} color="#D4AF37" />
                      <Text style={styles.backButtonText}>Retour à {selectedRegion}</Text>
                    </TouchableOpacity>
                    <Text style={styles.locationSectionTitle}>{selectedCountry}</Text>
                    {(WORLD_LOCATIONS[selectedRegion]?.[selectedCountry] || []).map((city) => (
                      <TouchableOpacity
                        key={city}
                        style={styles.locationItem}
                        onPress={() => selectCity(city, selectedCountry)}
                      >
                        <Ionicons name="location" size={20} color="#4CAF50" />
                        <Text style={styles.locationItemText}>{city}</Text>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionDescription: {
    fontSize: 12,
    color: '#6B7C93',
    marginBottom: 12,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#B8C5D6',
    fontSize: 16,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A2F4A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2A3F5A',
  },
  linkInfo: {
    flex: 1,
  },
  linkRelation: {
    fontSize: 12,
    color: '#D4AF37',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  linkName: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  deleteLinkButton: {
    padding: 8,
    marginLeft: 12,
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
  // Styles pour le sélecteur de lieu
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2F4A',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#2A3F5A',
    gap: 8,
  },
  locationButtonText: {
    flex: 1,
    color: '#6B7C93',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0A1628',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2F4A',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  manualInputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#1A2F4A',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    gap: 10,
  },
  manualInputButtonActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  manualInputButtonText: {
    color: '#D4AF37',
    fontSize: 15,
    fontWeight: '500',
  },
  manualInputContainer: {
    padding: 16,
  },
  manualInput: {
    backgroundColor: '#1A2F4A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#D4AF37',
    marginBottom: 12,
  },
  manualSaveButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  manualSaveButtonText: {
    color: '#0A1628',
    fontSize: 16,
    fontWeight: '600',
  },
  locationScroll: {
    maxHeight: 400,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  locationSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4AF37',
    marginVertical: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2F4A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    gap: 12,
  },
  locationItemText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  backButtonText: {
    color: '#D4AF37',
    fontSize: 15,
    fontWeight: '500',
  },
});
