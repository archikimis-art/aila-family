import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API URL configuration
const PRODUCTION_API_URL = 'https://aila-backend-hc1m.onrender.com';
const getApiUrl = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8001';
    }
    return PRODUCTION_API_URL;
  }
  return PRODUCTION_API_URL;
};

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  role: string;
  gdpr_consent: boolean;
  persons_count: number;
  last_login?: string;
}

interface Stats {
  total_users: number;
  total_persons: number;
  total_links: number;
  users_today: number;
  users_this_week: number;
  users_this_month: number;
  premium_users: number;
}

export default function AdminScreen() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  // Data state
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Modal state
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const API_URL = getApiUrl();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('admin_token');
      if (token) {
        setIsAuthenticated(true);
        await loadData(token);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoginLoading(true);
    setLoginError('');
    
    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Identifiants incorrects');
      }
      
      const data = await response.json();
      await AsyncStorage.setItem('admin_token', data.access_token);
      setIsAuthenticated(true);
      await loadData(data.access_token);
    } catch (error: any) {
      setLoginError(error.message || 'Erreur de connexion');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    setStats(null);
    setUsers([]);
  };

  const loadData = async (token?: string) => {
    const authToken = token || await AsyncStorage.getItem('admin_token');
    if (!authToken) return;
    
    try {
      // Load stats
      const statsRes = await fetch(`${API_URL}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      
      // Load users
      const usersRes = await fetch(`${API_URL}/admin/users?limit=100${searchQuery ? `&search=${searchQuery}` : ''}`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users);
        setTotalUsers(usersData.total);
      }
    } catch (error) {
      console.error('Load data error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSearch = async () => {
    await loadData();
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) return;
    
    setActionLoading(true);
    try {
      const token = await AsyncStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/admin/users/${selectedUser.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ new_password: newPassword }),
      });
      
      if (response.ok) {
        Alert.alert('Succès', `Mot de passe réinitialisé pour ${selectedUser.email}`);
        setShowResetModal(false);
        setNewPassword('');
        setSelectedUser(null);
      } else {
        throw new Error('Erreur lors de la réinitialisation');
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setActionLoading(true);
    try {
      const token = await AsyncStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        Alert.alert('Succès', `Utilisateur ${selectedUser.email} supprimé`);
        setShowDeleteModal(false);
        setSelectedUser(null);
        await loadData();
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  // Login Screen
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loginContainer}>
          <View style={styles.loginHeader}>
            <Ionicons name="shield-checkmark" size={60} color="#D4AF37" />
            <Text style={styles.loginTitle}>Administration AÏLA</Text>
            <Text style={styles.loginSubtitle}>Accès réservé aux administrateurs</Text>
          </View>
          
          {loginError ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={20} color="#FF6B6B" />
              <Text style={styles.errorText}>{loginError}</Text>
            </View>
          ) : null}
          
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#6B7C93" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email administrateur"
              placeholderTextColor="#6B7C93"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#6B7C93" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              placeholderTextColor="#6B7C93"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          
          <TouchableOpacity
            style={[styles.loginButton, loginLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loginLoading}
          >
            {loginLoading ? (
              <ActivityIndicator color="#0A1628" />
            ) : (
              <Text style={styles.loginButtonText}>Se connecter</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← Retour à l'application</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Admin Dashboard
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="shield-checkmark" size={28} color="#D4AF37" />
          <Text style={styles.headerTitle}>Admin AÏLA</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />
        }
      >
        {/* Stats Cards */}
        {stats && (
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>📊 Statistiques</Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, styles.statCardPrimary]}>
                <Text style={styles.statNumber}>{stats.total_users}</Text>
                <Text style={styles.statLabel}>Utilisateurs</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.total_persons}</Text>
                <Text style={styles.statLabel}>Personnes</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.users_today}</Text>
                <Text style={styles.statLabel}>Aujourd'hui</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.users_this_week}</Text>
                <Text style={styles.statLabel}>Cette semaine</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.users_this_month}</Text>
                <Text style={styles.statLabel}>Ce mois</Text>
              </View>
              <View style={[styles.statCard, styles.statCardGold]}>
                <Text style={styles.statNumber}>{stats.premium_users}</Text>
                <Text style={styles.statLabel}>Premium</Text>
              </View>
            </View>
          </View>
        )}

        {/* Search */}
        <View style={styles.searchContainer}>
          <Text style={styles.sectionTitle}>👥 Utilisateurs ({totalUsers})</Text>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#6B7C93" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher par email ou nom..."
              placeholderTextColor="#6B7C93"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity onPress={handleSearch}>
              <Ionicons name="arrow-forward-circle" size={28} color="#D4AF37" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Users List */}
        <View style={styles.usersList}>
          {users.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.userInfo}>
                <View style={styles.userHeader}>
                  <Text style={styles.userName}>
                    {user.first_name} {user.last_name}
                  </Text>
                  {user.role === 'admin' && (
                    <View style={styles.adminBadge}>
                      <Text style={styles.adminBadgeText}>ADMIN</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.userEmail}>{user.email}</Text>
                <View style={styles.userMeta}>
                  <Text style={styles.userMetaText}>
                    📅 Inscrit le {formatDate(user.created_at)}
                  </Text>
                  <Text style={styles.userMetaText}>
                    👥 {user.persons_count} personnes
                  </Text>
                </View>
              </View>
              
              <View style={styles.userActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.resetButton]}
                  onPress={() => {
                    setSelectedUser(user);
                    setShowResetModal(true);
                  }}
                >
                  <Ionicons name="key-outline" size={18} color="#4A90D9" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => {
                    setSelectedUser(user);
                    setShowDeleteModal(true);
                  }}
                >
                  <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Reset Password Modal */}
      <Modal visible={showResetModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🔑 Réinitialiser le mot de passe</Text>
            <Text style={styles.modalSubtitle}>{selectedUser?.email}</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Nouveau mot de passe"
              placeholderTextColor="#6B7C93"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowResetModal(false);
                  setNewPassword('');
                }}
              >
                <Text style={styles.modalButtonCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleResetPassword}
                disabled={actionLoading || !newPassword}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#0A1628" />
                ) : (
                  <Text style={styles.modalButtonConfirmText}>Confirmer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete User Modal */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="warning" size={48} color="#FF6B6B" style={styles.modalIcon} />
            <Text style={styles.modalTitle}>Supprimer l'utilisateur ?</Text>
            <Text style={styles.modalSubtitle}>{selectedUser?.email}</Text>
            <Text style={styles.modalWarning}>
              Cette action est irréversible. Toutes les données de l'utilisateur seront supprimées.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonDanger]}
                onPress={handleDeleteUser}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.modalButtonDangerText}>Supprimer</Text>
                )}
              </TouchableOpacity>
            </View>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A1628',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Login styles
  loginContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  loginHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
  },
  loginSubtitle: {
    fontSize: 14,
    color: '#6B7C93',
    marginTop: 8,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF6B6B',
    marginLeft: 8,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2F4A',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 16,
  },
  loginButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#0A1628',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    marginTop: 24,
  },
  backButtonText: {
    color: '#6B7C93',
    fontSize: 14,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2F4A',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  logoutButton: {
    padding: 8,
  },
  
  // Content
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  
  // Stats
  statsContainer: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  statCard: {
    width: '30%',
    backgroundColor: '#1A2F4A',
    borderRadius: 12,
    padding: 16,
    margin: 6,
    alignItems: 'center',
  },
  statCardPrimary: {
    backgroundColor: '#2A3F5A',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  statCardGold: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#D4AF37',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7C93',
    marginTop: 4,
    textAlign: 'center',
  },
  
  // Search
  searchContainer: {
    padding: 16,
    paddingTop: 0,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2F4A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 12,
    paddingVertical: 8,
  },
  
  // Users List
  usersList: {
    padding: 16,
    paddingTop: 0,
  },
  userCard: {
    backgroundColor: '#1A2F4A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  adminBadge: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0A1628',
  },
  userEmail: {
    fontSize: 14,
    color: '#6B8BB8',
    marginTop: 4,
  },
  userMeta: {
    flexDirection: 'row',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  userMetaText: {
    fontSize: 12,
    color: '#6B7C93',
    marginRight: 16,
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  resetButton: {
    backgroundColor: 'rgba(74, 144, 217, 0.2)',
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
  },
  
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#1A2F4A',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalIcon: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B8BB8',
    textAlign: 'center',
    marginTop: 8,
  },
  modalWarning: {
    fontSize: 13,
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
  },
  modalInput: {
    backgroundColor: '#0A1628',
    borderRadius: 8,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#2A3F5A',
    marginRight: 8,
  },
  modalButtonCancelText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalButtonConfirm: {
    backgroundColor: '#D4AF37',
    marginLeft: 8,
  },
  modalButtonConfirmText: {
    color: '#0A1628',
    fontWeight: '600',
  },
  modalButtonDanger: {
    backgroundColor: '#FF6B6B',
    marginLeft: 8,
  },
  modalButtonDangerText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
