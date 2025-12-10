import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { personsAPI, previewAPI } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Person {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  birth_date?: string;
  birth_place?: string;
  geographic_branch?: string;
}

export default function MembersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const isPreviewMode = !user;

  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewToken, setPreviewToken] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (isPreviewMode) {
        const token = await AsyncStorage.getItem('preview_token');
        if (token) {
          setPreviewToken(token);
          try {
            const sessionData = await previewAPI.getSession(token);
            setPersons(sessionData.data.persons || []);
          } catch {
            setPersons([]);
          }
        }
      } else {
        const response = await personsAPI.getAll();
        setPersons(response.data || []);
      }
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const handleAddPerson = () => {
    if (isPreviewMode && persons.length >= 10) {
      Alert.alert(
        'Limite atteinte',
        'Le mode aperçu est limité à 10 membres.',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Créer un compte', onPress: () => router.push('/(auth)/register') },
        ]
      );
      return;
    }
    router.push({
      pathname: '/add-person',
      params: { preview: isPreviewMode ? 'true' : 'false', token: previewToken || '' },
    });
  };

  const handlePersonPress = (person: Person) => {
    router.push({
      pathname: '/person/[id]',
      params: { id: person.id, preview: isPreviewMode ? 'true' : 'false', token: previewToken || '' },
    });
  };

  const filteredPersons = persons.filter((p) =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getGenderIcon = (gender: string) => {
    switch (gender) {
      case 'male':
        return { name: 'male', color: '#4A90D9' };
      case 'female':
        return { name: 'female', color: '#D94A8C' };
      default:
        return { name: 'person', color: '#6B7C93' };
    }
  };

  const renderPerson = ({ item }: { item: Person }) => {
    const genderInfo = getGenderIcon(item.gender);
    return (
      <TouchableOpacity style={styles.personCard} onPress={() => handlePersonPress(item)}>
        <View style={[styles.avatarContainer, { borderColor: genderInfo.color }]}>
          <Ionicons name={genderInfo.name as any} size={24} color={genderInfo.color} />
        </View>
        <View style={styles.personInfo}>
          <Text style={styles.personName}>{item.first_name} {item.last_name}</Text>
          {item.birth_date && (
            <Text style={styles.personDetail}>
              <Ionicons name="calendar-outline" size={12} color="#6B7C93" /> {item.birth_date}
            </Text>
          )}
          {item.geographic_branch && (
            <Text style={styles.personBranch}>
              <Ionicons name="location-outline" size={12} color="#D4AF37" /> {item.geographic_branch}
            </Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
      </TouchableOpacity>
    );
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Membres</Text>
        <Text style={styles.memberCount}>{persons.length} personne{persons.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6B7C93" />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un membre..."
          placeholderTextColor="#6B7C93"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#6B7C93" />
          </TouchableOpacity>
        )}
      </View>

      {/* Members List */}
      <FlatList
        data={filteredPersons}
        keyExtractor={(item) => item.id}
        renderItem={renderPerson}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={60} color="#2A3F5A" />
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'Aucun résultat' : 'Aucun membre'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? 'Essayez avec d\'autres termes'
                : 'Commencez par ajouter des membres à votre arbre'}
            </Text>
          </View>
        }
      />

      {/* Add Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddPerson}>
        <Ionicons name="add" size={28} color="#0A1628" />
      </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2F4A',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  memberCount: {
    fontSize: 14,
    color: '#6B7C93',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2F4A',
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 10,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2F4A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0A1628',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  personInfo: {
    flex: 1,
    marginLeft: 14,
  },
  personName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  personDetail: {
    fontSize: 13,
    color: '#6B7C93',
    marginTop: 4,
  },
  personBranch: {
    fontSize: 13,
    color: '#D4AF37',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7C93',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
