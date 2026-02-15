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
const PRODUCTION_API_URL = 'https://aila-backend-hc1m.onrender.com/api';
const getApiUrl = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8001/api';
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

  // Reminder state
  const [activeTab, setActiveTab] = useState<'users' | 'reminders'>('users');
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderTemplates, setReminderTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderMessage, setReminderMessage] = useState('');
  const [sendToAll, setSendToAll] = useState(true);
  const [reminderStats, setReminderStats] = useState<any>(null);
  const [recentReminders, setRecentReminders] = useState<any[]>([]);
  
  // Auto reminder state
  const [incompleteTreesAnalysis, setIncompleteTreesAnalysis] = useState<any[]>([]);
  const [showAutoReminderModal, setShowAutoReminderModal] = useState(false);
  const [autoReminderLoading, setAutoReminderLoading] = useState(false);
  const [autoReminderPreview, setAutoReminderPreview] = useState<any>(null);

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

      // Load reminder data
      await loadReminderData(authToken);
    } catch (error) {
      console.error('Load data error:', error);
    }
  };

  const loadReminderData = async (authToken: string) => {
    try {
      // Load reminder templates
      const templatesRes = await fetch(`${API_URL}/reminders/templates`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      if (templatesRes.ok) {
        const templates = await templatesRes.json();
        setReminderTemplates(templates);
      }

      // Load reminder stats
      const statsRes = await fetch(`${API_URL}/reminders/stats`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      if (statsRes.ok) {
        const stats = await statsRes.json();
        setReminderStats(stats);
      }

      // Load recent reminders
      const remindersRes = await fetch(`${API_URL}/reminders?limit=10`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      if (remindersRes.ok) {
        const reminders = await remindersRes.json();
        setRecentReminders(reminders);
      }
      
      // Load incomplete trees analysis
      const analysisRes = await fetch(`${API_URL}/reminders/analyze-trees?limit=20`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      if (analysisRes.ok) {
        const analysis = await analysisRes.json();
        setIncompleteTreesAnalysis(analysis);
      }
    } catch (error) {
      console.error('Load reminder data error:', error);
    }
  };

  const handleSendReminder = async () => {
    if (!reminderTitle || !reminderMessage) {
      Alert.alert('Erreur', 'Veuillez remplir le titre et le message');
      return;
    }

    setActionLoading(true);
    try {
      const token = await AsyncStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/reminders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: sendToAll ? null : selectedUser?.id,
          reminder_type: selectedTemplate?.id || 'custom',
          title: reminderTitle,
          message: reminderMessage,
          send_push: true,
        }),
      });

      if (response.ok) {
        const target = sendToAll ? 'tous les utilisateurs' : selectedUser?.email;
        Alert.alert('Succès', `Rappel envoyé à ${target}`);
        setShowReminderModal(false);
        setReminderTitle('');
        setReminderMessage('');
        setSelectedTemplate(null);
        await loadData();
      } else {
        throw new Error('Erreur lors de l\'envoi');
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible d\'envoyer le rappel');
    } finally {
      setActionLoading(false);
    }
  };

  const selectTemplate = (template: any) => {
    setSelectedTemplate(template);
    setReminderTitle(template.title);
    setReminderMessage(template.message);
  };

  const handlePreviewAutoReminders = async () => {
    setAutoReminderLoading(true);
    try {
      const token = await AsyncStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/reminders/send-auto?dry_run=true&min_days_inactive=7`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const preview = await response.json();
        setAutoReminderPreview(preview);
        setShowAutoReminderModal(true);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger la prévisualisation');
    } finally {
      setAutoReminderLoading(false);
    }
  };

  const handleSendAutoReminders = async () => {
    setAutoReminderLoading(true);
    try {
      const token = await AsyncStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/reminders/send-auto?dry_run=false&min_days_inactive=7`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        Alert.alert('Succès', `${result.reminders_sent} rappels envoyés !`);
        setShowAutoReminderModal(false);
        await loadData();
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer les rappels');
    } finally {
      setAutoReminderLoading(false);
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
          
          <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/')}>
            <Text style={styles.backButtonText}>← Retour à l'accueil</Text>
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
        <TouchableOpacity onPress={() => router.replace('/')} style={styles.homeButton}>
          <Ionicons name="home-outline" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="shield-checkmark" size={24} color="#D4AF37" />
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

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'users' && styles.tabActive]}
            onPress={() => setActiveTab('users')}
          >
            <Ionicons name="people" size={20} color={activeTab === 'users' ? '#D4AF37' : '#6B7C93'} />
            <Text style={[styles.tabText, activeTab === 'users' && styles.tabTextActive]}>Utilisateurs</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'reminders' && styles.tabActive]}
            onPress={() => setActiveTab('reminders')}
          >
            <Ionicons name="notifications" size={20} color={activeTab === 'reminders' ? '#D4AF37' : '#6B7C93'} />
            <Text style={[styles.tabText, activeTab === 'reminders' && styles.tabTextActive]}>Rappels</Text>
          </TouchableOpacity>
        </View>

        {/* REMINDERS TAB */}
        {activeTab === 'reminders' && (
          <View style={styles.remindersSection}>
            {/* Reminder Stats */}
            {reminderStats && (
              <View style={styles.reminderStatsContainer}>
                <View style={styles.reminderStatCard}>
                  <Text style={styles.reminderStatNumber}>{reminderStats.total_sent}</Text>
                  <Text style={styles.reminderStatLabel}>Envoyés</Text>
                </View>
                <View style={styles.reminderStatCard}>
                  <Text style={styles.reminderStatNumber}>{reminderStats.total_read}</Text>
                  <Text style={styles.reminderStatLabel}>Lus</Text>
                </View>
                <View style={styles.reminderStatCard}>
                  <Text style={[styles.reminderStatNumber, { color: '#4CAF50' }]}>{reminderStats.read_rate}%</Text>
                  <Text style={styles.reminderStatLabel}>Taux lecture</Text>
                </View>
              </View>
            )}

            {/* Action Buttons Row */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity 
                style={styles.sendReminderButton}
                onPress={() => setShowReminderModal(true)}
              >
                <Ionicons name="send" size={22} color="#0A1628" />
                <Text style={styles.sendReminderButtonText}>Rappel manuel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.sendReminderButton, styles.autoReminderButton]}
                onPress={handlePreviewAutoReminders}
                disabled={autoReminderLoading}
              >
                {autoReminderLoading ? (
                  <ActivityIndicator color="#0A1628" size="small" />
                ) : (
                  <>
                    <Ionicons name="flash" size={22} color="#0A1628" />
                    <Text style={styles.sendReminderButtonText}>Auto</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Incomplete Trees Section */}
            {incompleteTreesAnalysis.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>🌱 Arbres incomplets ({incompleteTreesAnalysis.length})</Text>
                <View style={styles.incompleteTreesList}>
                  {incompleteTreesAnalysis.slice(0, 5).map((analysis: any) => (
                    <View key={analysis.user_id} style={styles.incompleteTreeCard}>
                      <View style={styles.incompleteTreeHeader}>
                        <View style={styles.incompleteTreeInfo}>
                          <Text style={styles.incompleteTreeName}>{analysis.user_name || 'Utilisateur'}</Text>
                          <Text style={styles.incompleteTreeEmail}>{analysis.user_email}</Text>
                        </View>
                        <View style={styles.completionScoreContainer}>
                          <Text style={[
                            styles.completionScore,
                            analysis.completion_score < 30 && styles.completionScoreLow,
                            analysis.completion_score >= 30 && analysis.completion_score < 60 && styles.completionScoreMedium,
                            analysis.completion_score >= 60 && styles.completionScoreHigh,
                          ]}>
                            {analysis.completion_score}%
                          </Text>
                        </View>
                      </View>
                      <View style={styles.incompleteTreeStats}>
                        <Text style={styles.incompleteTreeStat}>👥 {analysis.persons_count} membres</Text>
                        <Text style={styles.incompleteTreeStat}>🔗 {analysis.links_count} liens</Text>
                        <Text style={styles.incompleteTreeStat}>📸 {analysis.photos_count} photos</Text>
                        <Text style={[styles.incompleteTreeStat, analysis.days_inactive > 14 && styles.inactiveWarning]}>
                          ⏰ {analysis.days_inactive}j inactif
                        </Text>
                      </View>
                      {analysis.incompletion_reasons && analysis.incompletion_reasons.length > 0 && (
                        <View style={styles.reasonsContainer}>
                          {analysis.incompletion_reasons.slice(0, 2).map((reason: any, idx: number) => (
                            <View key={idx} style={[
                              styles.reasonBadge,
                              reason.priority === 1 && styles.reasonBadgeHigh,
                              reason.priority === 2 && styles.reasonBadgeMedium,
                              reason.priority === 3 && styles.reasonBadgeLow,
                            ]}>
                              <Text style={styles.reasonBadgeText}>{reason.description}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                      <TouchableOpacity
                        style={styles.sendReminderToUserButton}
                        onPress={() => {
                          setSelectedUser({ id: analysis.user_id, email: analysis.user_email } as any);
                          setSendToAll(false);
                          if (analysis.incompletion_reasons && analysis.incompletion_reasons[0]) {
                            setReminderTitle(analysis.incompletion_reasons[0].description);
                            setReminderMessage(analysis.incompletion_reasons[0].suggestion);
                          }
                          setShowReminderModal(true);
                        }}
                      >
                        <Ionicons name="mail-outline" size={16} color="#D4AF37" />
                        <Text style={styles.sendReminderToUserText}>Envoyer un rappel</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Templates */}
            <Text style={styles.sectionTitle}>📋 Modèles de rappels</Text>
            <View style={styles.templatesGrid}>
              {reminderTemplates.map((template) => (
                <TouchableOpacity 
                  key={template.id}
                  style={styles.templateCard}
                  onPress={() => {
                    selectTemplate(template);
                    setShowReminderModal(true);
                  }}
                >
                  <Ionicons name={template.icon as any} size={28} color="#D4AF37" />
                  <Text style={styles.templateTitle}>{template.title}</Text>
                  <Text style={styles.templateMessage} numberOfLines={2}>{template.message}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Recent Reminders */}
            <Text style={styles.sectionTitle}>🕐 Rappels récents</Text>
            {recentReminders.length === 0 ? (
              <Text style={styles.emptyText}>Aucun rappel envoyé</Text>
            ) : (
              recentReminders.map((reminder) => (
                <View key={reminder.id} style={styles.reminderCard}>
                  <View style={styles.reminderHeader}>
                    <Text style={styles.reminderTitle}>{reminder.title}</Text>
                    <View style={[styles.reminderStatus, 
                      reminder.status === 'sent' && styles.reminderStatusSent,
                      reminder.status === 'read' && styles.reminderStatusRead
                    ]}>
                      <Text style={styles.reminderStatusText}>
                        {reminder.status === 'sent' ? 'Envoyé' : reminder.status === 'read' ? 'Lu' : 'En attente'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.reminderMessage} numberOfLines={2}>{reminder.message}</Text>
                  <Text style={styles.reminderDate}>
                    {reminder.created_at ? formatDate(reminder.created_at) : ''}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <>
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
                      style={[styles.actionButton, styles.reminderButton]}
                      onPress={() => {
                        setSelectedUser(user);
                        setSendToAll(false);
                        setShowReminderModal(true);
                      }}
                    >
                      <Ionicons name="notifications-outline" size={18} color="#D4AF37" />
                    </TouchableOpacity>
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
          </>
        )}
      </ScrollView>

      {/* Send Reminder Modal */}
      <Modal visible={showReminderModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📣 Envoyer un rappel</Text>
            <Text style={styles.modalSubtitle}>
              {sendToAll ? 'À tous les utilisateurs' : `À ${selectedUser?.email || 'utilisateur sélectionné'}`}
            </Text>
            
            <View style={styles.sendToToggle}>
              <TouchableOpacity 
                style={[styles.toggleButton, sendToAll && styles.toggleButtonActive]}
                onPress={() => setSendToAll(true)}
              >
                <Text style={[styles.toggleButtonText, sendToAll && styles.toggleButtonTextActive]}>
                  Tous les utilisateurs
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toggleButton, !sendToAll && styles.toggleButtonActive]}
                onPress={() => setSendToAll(false)}
              >
                <Text style={[styles.toggleButtonText, !sendToAll && styles.toggleButtonTextActive]}>
                  Utilisateur spécifique
                </Text>
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Titre du rappel"
              placeholderTextColor="#6B7C93"
              value={reminderTitle}
              onChangeText={setReminderTitle}
            />
            
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Message du rappel"
              placeholderTextColor="#6B7C93"
              value={reminderMessage}
              onChangeText={setReminderMessage}
              multiline
              numberOfLines={4}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowReminderModal(false);
                  setReminderTitle('');
                  setReminderMessage('');
                  setSendToAll(true);
                }}
              >
                <Text style={styles.modalButtonCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleSendReminder}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#0A1628" />
                ) : (
                  <Text style={styles.modalButtonConfirmText}>Envoyer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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

      {/* Auto Reminder Modal */}
      <Modal visible={showAutoReminderModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.autoReminderModalContent]}>
            <View style={styles.autoReminderHeader}>
              <Ionicons name="flash" size={32} color="#D4AF37" />
              <Text style={styles.modalTitle}>⚡ Rappels automatiques</Text>
            </View>
            
            {autoReminderPreview && (
              <>
                <View style={styles.autoReminderStats}>
                  <Text style={styles.autoReminderStatsText}>
                    {autoReminderPreview.eligible_users} utilisateur(s) éligible(s)
                  </Text>
                </View>
                
                <ScrollView style={styles.autoReminderList} showsVerticalScrollIndicator={false}>
                  {autoReminderPreview.results?.slice(0, 10).map((result: any, idx: number) => (
                    <View key={idx} style={styles.autoReminderItem}>
                      <View style={styles.autoReminderItemHeader}>
                        <Text style={styles.autoReminderItemName}>{result.user_name || result.user_email}</Text>
                        <Text style={styles.autoReminderItemScore}>{result.completion_score}%</Text>
                      </View>
                      <Text style={styles.autoReminderItemTitle}>📧 {result.reminder_title}</Text>
                      <Text style={styles.autoReminderItemMessage} numberOfLines={2}>{result.reminder_message}</Text>
                    </View>
                  ))}
                </ScrollView>
              </>
            )}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowAutoReminderModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleSendAutoReminders}
                disabled={autoReminderLoading}
              >
                {autoReminderLoading ? (
                  <ActivityIndicator color="#0A1628" />
                ) : (
                  <Text style={styles.modalButtonConfirmText}>
                    Envoyer {autoReminderPreview?.eligible_users || 0} rappels
                  </Text>
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
  homeButton: {
    padding: 8,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
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
  reminderButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: '#1A2F4A',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  tabActive: {
    backgroundColor: '#0A1628',
  },
  tabText: {
    fontSize: 14,
    color: '#6B7C93',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#D4AF37',
  },

  // Reminders Section
  remindersSection: {
    paddingHorizontal: 20,
  },
  reminderStatsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  reminderStatCard: {
    flex: 1,
    backgroundColor: '#1A2F4A',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  reminderStatNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#D4AF37',
  },
  reminderStatLabel: {
    fontSize: 12,
    color: '#6B7C93',
    marginTop: 4,
  },
  sendReminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 10,
  },
  sendReminderButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A1628',
  },
  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  templateCard: {
    width: '48%',
    backgroundColor: '#1A2F4A',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  templateTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 10,
    textAlign: 'center',
  },
  templateMessage: {
    fontSize: 12,
    color: '#6B7C93',
    marginTop: 6,
    textAlign: 'center',
  },
  reminderCard: {
    backgroundColor: '#1A2F4A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  reminderStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(107, 123, 147, 0.3)',
  },
  reminderStatusSent: {
    backgroundColor: 'rgba(74, 144, 217, 0.3)',
  },
  reminderStatusRead: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
  },
  reminderStatusText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  reminderMessage: {
    fontSize: 14,
    color: '#6B8BB8',
    marginBottom: 8,
  },
  reminderDate: {
    fontSize: 12,
    color: '#6B7C93',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7C93',
    textAlign: 'center',
    paddingVertical: 20,
  },

  // Send To Toggle
  sendToToggle: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#0A1628',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#D4AF37',
  },
  toggleButtonText: {
    fontSize: 13,
    color: '#6B7C93',
    fontWeight: '500',
  },
  toggleButtonTextActive: {
    color: '#0A1628',
  },
  modalTextArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
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
  
  // Action Buttons Row
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  autoReminderButton: {
    flex: 0,
    paddingHorizontal: 20,
  },
  
  // Incomplete Trees List
  incompleteTreesList: {
    marginBottom: 24,
  },
  incompleteTreeCard: {
    backgroundColor: '#1A2F4A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#D4AF37',
  },
  incompleteTreeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  incompleteTreeInfo: {
    flex: 1,
  },
  incompleteTreeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  incompleteTreeEmail: {
    fontSize: 13,
    color: '#6B8BB8',
    marginTop: 2,
  },
  completionScoreContainer: {
    backgroundColor: '#0A1628',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  completionScore: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7C93',
  },
  completionScoreLow: {
    color: '#FF6B6B',
  },
  completionScoreMedium: {
    color: '#FFA000',
  },
  completionScoreHigh: {
    color: '#4CAF50',
  },
  incompleteTreeStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 10,
  },
  incompleteTreeStat: {
    fontSize: 12,
    color: '#6B8BB8',
  },
  inactiveWarning: {
    color: '#FF6B6B',
  },
  reasonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  reasonBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(107, 123, 147, 0.3)',
  },
  reasonBadgeHigh: {
    backgroundColor: 'rgba(255, 107, 107, 0.3)',
  },
  reasonBadgeMedium: {
    backgroundColor: 'rgba(255, 160, 0, 0.3)',
  },
  reasonBadgeLow: {
    backgroundColor: 'rgba(107, 139, 184, 0.3)',
  },
  reasonBadgeText: {
    fontSize: 11,
    color: '#FFFFFF',
  },
  sendReminderToUserButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  sendReminderToUserText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D4AF37',
  },
  
  // Auto Reminder Modal
  autoReminderModalContent: {
    maxHeight: '80%',
  },
  autoReminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  autoReminderStats: {
    backgroundColor: '#0A1628',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  autoReminderStatsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4AF37',
  },
  autoReminderList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  autoReminderItem: {
    backgroundColor: '#0A1628',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  autoReminderItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  autoReminderItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  autoReminderItemScore: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D4AF37',
    marginLeft: 8,
  },
  autoReminderItemTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B8BB8',
    marginBottom: 4,
  },
  autoReminderItemMessage: {
    fontSize: 12,
    color: '#6B7C93',
  },
});
