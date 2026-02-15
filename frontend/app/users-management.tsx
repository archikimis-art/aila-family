import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
}

export default function UsersManagementScreen() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is admin
    if (!isAdmin()) {
      if (Platform.OS === 'web') {
        window.alert('Accès refusé: Seuls les administrateurs peuvent accéder à cette page.');
      } else {
        Alert.alert('Accès refusé', 'Seuls les administrateurs peuvent accéder à cette page.');
      }
      router.back();
      return;
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert('Erreur: Impossible de charger la liste des utilisateurs.');
      } else {
        Alert.alert('Erreur', 'Impossible de charger la liste des utilisateurs.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handlePromoteUser = async (userId: string, userName: string) => {
    const doPromote = async () => {
      setProcessingUserId(userId);
      try {
        await api.put(`/users/${userId}/promote`);
        if (Platform.OS === 'web') {
          window.alert(`Succès: ${userName} est maintenant administrateur.`);
        } else {
          Alert.alert('Succès', `${userName} est maintenant administrateur.`);
        }
        fetchUsers();
      } catch (error: any) {
        const message = error.response?.data?.detail || 'Impossible de promouvoir l\'utilisateur.';
        if (Platform.OS === 'web') {
          window.alert(`Erreur: ${message}`);
        } else {
          Alert.alert('Erreur', message);
        }
      } finally {
        setProcessingUserId(null);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Voulez-vous promouvoir ${userName} en administrateur ?`);
      if (confirmed) {
        await doPromote();
      }
    } else {
      Alert.alert(
        'Promouvoir en Admin',
        `Voulez-vous promouvoir ${userName} en administrateur ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Promouvoir', onPress: doPromote },
        ]
      );
    }
  };

  const handleDemoteUser = async (userId: string, userName: string) => {
    const doDemote = async () => {
      setProcessingUserId(userId);
      try {
        await api.put(`/users/${userId}/demote`);
        if (Platform.OS === 'web') {
          window.alert(`Succès: ${userName} est maintenant membre.`);
        } else {
          Alert.alert('Succès', `${userName} est maintenant membre.`);
        }
        fetchUsers();
      } catch (error: any) {
        const message = error.response?.data?.detail || 'Impossible de rétrograder l\'utilisateur.';
        if (Platform.OS === 'web') {
          window.alert(`Erreur: ${message}`);
        } else {
          Alert.alert('Erreur', message);
        }
      } finally {
        setProcessingUserId(null);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Voulez-vous rétrograder ${userName} en membre ?`);
      if (confirmed) {
        await doDemote();
      }
    } else {
      Alert.alert(
        'Rétrograder en Membre',
        `Voulez-vous rétrograder ${userName} en membre ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Rétrograder', style: 'destructive', onPress: doDemote },
        ]
      );
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const renderUser = ({ item }: { item: User }) => {
    const isProcessing = processingUserId === item.id;
    
    return (
      <View style={styles.userCard}>
        <View style={styles.userInfo}>
          <View style={styles.userHeader}>
            <Text style={styles.userName}>{item.first_name} {item.last_name}</Text>
            <View style={[
              styles.roleBadge,
              item.role === 'admin' ? styles.adminBadge : styles.memberBadge
            ]}>
              <Text style={styles.roleBadgeText}>{item.role === 'admin' ? 'Admin' : 'Membre'}</Text>
            </View>
          </View>
          <Text style={styles.userEmail}>{item.email}</Text>
          <Text style={styles.userDate}>
            Inscrit le {new Date(item.created_at).toLocaleDateString('fr-FR')}
          </Text>
        </View>

        {item.role === 'admin' ? (
          <TouchableOpacity
            style={[styles.demoteButton, isProcessing && styles.disabledButton]}
            onPress={() => handleDemoteUser(item.id, `${item.first_name} ${item.last_name}`)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#FF6B6B" />
            ) : (
              <>
                <Ionicons name="arrow-down-circle-outline" size={20} color="#FF6B6B" />
                <Text style={styles.demoteButtonText}>Rétrograder</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.promoteButton, isProcessing && styles.disabledButton]}
            onPress={() => handlePromoteUser(item.id, `${item.first_name} ${item.last_name}`)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#4CAF50" />
            ) : (
              <>
                <Ionicons name="arrow-up-circle-outline" size={20} color="#4CAF50" />
                <Text style={styles.promoteButtonText}>Promouvoir</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Gestion des Utilisateurs</Text>
          <Text style={styles.headerSubtitle}>{users.length} utilisateur{users.length > 1 ? 's' : ''}</Text>
        </View>
      </View>

      {/* Users List */}
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#6B7C93" />
            <Text style={styles.emptyText}>Aucun utilisateur trouvé</Text>
          </View>
        }
      />
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2F4A',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7C93',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#6B7C93',
    marginTop: 16,
    fontSize: 16,
  },
  listContent: {
    padding: 20,
  },
  userCard: {
    backgroundColor: '#1A2F4A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  userInfo: {
    marginBottom: 12,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminBadge: {
    backgroundColor: '#D4AF37',
  },
  memberBadge: {
    backgroundColor: '#4A90D9',
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  userEmail: {
    fontSize: 14,
    color: '#B8C5D6',
    marginBottom: 4,
  },
  userDate: {
    fontSize: 12,
    color: '#6B7C93',
  },
  promoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A5936',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  promoteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  demoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A2F2F',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  demoteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  disabledButton: {
    opacity: 0.6,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7C93',
    marginTop: 16,
  },
});
