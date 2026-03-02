// members.tsx - SECURITY REWRITE using PreviewContext
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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { usePreview } from '@/context/PreviewContext';
import { personsAPI } from '@/services/api';
import AdBanner from '@/components/AdBanner';
import { useTranslation } from 'react-i18next';

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
  const { user } = useAuth();
  const { t } = useTranslation();
  
  // SECURITY: Use PreviewContext as single source of truth
  const { isPreviewMode, isLoading: previewLoading, previewPersons, previewToken } = usePreview();

  const [userPersons, setUserPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // SECURITY: The displayed persons depend ONLY on isPreviewMode
  const persons = isPreviewMode ? previewPersons : userPersons;

  // Load user data only when NOT in preview mode
  useEffect(() => {
    console.log('[Members] Mode changed - isPreviewMode:', isPreviewMode, 'previewLoading:', previewLoading);
    
    if (previewLoading) {
      // Wait for preview context to determine mode
      return;
    }
    
    if (isPreviewMode) {
      // In preview mode - use previewPersons from context
      console.log('[Members] PREVIEW MODE - using', previewPersons.length, 'demo persons');
      setLoading(false);
    } else if (user) {
      // User mode - load their data
      console.log('[Members] USER MODE - loading user data');
      loadUserData();
    } else {
      setLoading(false);
    }
  }, [isPreviewMode, previewLoading, user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const response = await personsAPI.getAll();
      setUserPersons(response.data || []);
      console.log('[Members] Loaded', response.data?.length || 0, 'user persons');
    } catch (error) {
      console.error('[Members] Error loading user data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (!isPreviewMode && user) {
      loadUserData();
    } else {
      setRefreshing(false);
    }
  }, [isPreviewMode, user]);

  const handleAddPerson = () => {
    if (isPreviewMode && persons.length >= 10) {
      Alert.alert(
        t('membersScreen.limitReached'),
        t('membersScreen.limitMessage'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('membersScreen.createAccount'), onPress: () => router.push('/(auth)/register') },
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

  // Show loading while preview context is determining mode
  if (previewLoading || loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>
            {isPreviewMode ? 'Chargement de la démo...' : 'Chargement...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Preview mode indicator */}
      {isPreviewMode && (
        <View style={styles.previewBanner}>
          <Ionicons name="eye-outline" size={14} color="#D4AF37" />
          <Text style={styles.previewText}>MODE APERÇU - Famille de démonstration</Text>
        </View>
      )}
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('membersScreen.title')}</Text>
        <Text style={styles.memberCount}>
          {persons.length === 1 
            ? t('membersScreen.personCount', { count: persons.length })
            : t('membersScreen.personsCount', { count: persons.length })}
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6B7C93" />
        <TextInput
          style={styles.searchInput}
          placeholder={t('membersScreen.searchPlaceholder')}
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
              {searchQuery ? t('membersScreen.empty.noResults') : t('membersScreen.empty.noMembers')}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? t('membersScreen.empty.tryOther')
                : t('membersScreen.empty.startAdding')}
            </Text>
          </View>
        }
      />

      {/* Add Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddPerson}>
        <Ionicons name="add" size={28} color="#0A1628" />
      </TouchableOpacity>
      
      {/* Ad Banner */}
      <AdBanner />
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
  loadingText: {
    color: '#D4AF37',
    marginTop: 12,
    fontSize: 14,
  },
  previewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.3)',
  },
  previewText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '600',
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
