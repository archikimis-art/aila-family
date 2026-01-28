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
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { collaboratorsAPI, contributionsAPI } from '@/services/api';
import { useTranslation } from 'react-i18next';

interface Collaborator {
  id: string;
  email: string;
  role: string;
  status: string;
  invited_at: string;
  accepted_at?: string;
}

interface SharedTree {
  id: string;
  owner_id: string;
  owner_name: string;
  owner_email: string;
  role: string;
  persons_count: number;
  accepted_at: string;
}

interface Contribution {
  id: string;
  contributor_name: string;
  action: string;
  entity_type: string;
  entity_data?: any;
  status: string;
  created_at: string;
}

export default function ShareScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState<'collaborators' | 'shared' | 'contributions'>('collaborators');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [sharedTrees, setSharedTrees] = useState<SharedTree[]>([]);
  const [pendingContributions, setPendingContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'viewer' | 'editor'>('editor');
  const [inviting, setInviting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Helper function for alerts that works on web
  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`${title}\n\n${message}`)) {
        onConfirm();
      }
    } else {
      Alert.alert(title, message, [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Confirmer', style: 'destructive', onPress: onConfirm },
      ]);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [collabRes, sharedRes, contribRes] = await Promise.all([
        collaboratorsAPI.getAll(),
        collaboratorsAPI.getSharedWithMe(),
        contributionsAPI.getPending(),
      ]);
      setCollaborators(collabRes.data || []);
      setSharedTrees(sharedRes.data || []);
      setPendingContributions(contribRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      showAlert('Erreur', 'Veuillez entrer une adresse email');
      return;
    }

    setInviting(true);
    try {
      await collaboratorsAPI.invite(inviteEmail.trim(), inviteRole);
      setShowInviteModal(false);
      setInviteEmail('');
      setSuccessMessage(`✅ Invitation envoyée à ${inviteEmail} !`);
      setTimeout(() => setSuccessMessage(null), 5000);
      loadData();
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Erreur lors de l\'invitation';
      showAlert('Erreur', message);
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveCollaborator = async (id: string, email: string) => {
    const doRemove = async () => {
      try {
        await collaboratorsAPI.remove(id);
        setSuccessMessage(`✅ ${email} a été retiré de votre arbre`);
        setTimeout(() => setSuccessMessage(null), 3000);
        loadData();
      } catch (error) {
        showAlert('Erreur', 'Impossible de retirer le collaborateur');
      }
    };

    showConfirm(
      'Retirer le collaborateur',
      `Voulez-vous retirer ${email} de votre arbre ?`,
      doRemove
    );
  };

  const handleReviewContribution = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await contributionsAPI.review(id, status);
      Alert.alert('Succes', 'Contribution ' + (status === 'approved' ? 'approuvee' : 'refusee'));
      loadData();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de traiter la contribution');
    }
  };

  const handleViewSharedTree = (ownerId: string, ownerName: string) => {
    router.push({
      pathname: '/(tabs)/tree',
      params: { sharedOwnerId: ownerId, sharedOwnerName: ownerName },
    });
  };

  const renderCollaborator = ({ item }: { item: Collaborator }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.statusDot, { backgroundColor: item.status === 'accepted' ? '#4CAF50' : '#FFA000' }]} />
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.email}</Text>
          <Text style={styles.cardSubtitle}>
            {item.role === 'editor' ? 'Editeur' : 'Lecteur'} - {item.status === 'accepted' ? 'Accepte' : 'En attente'}
          </Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => handleRemoveCollaborator(item.id, item.email)}
      >
        <Ionicons name="close-circle" size={24} color="#FF6B6B" />
      </TouchableOpacity>
    </View>
  );

  const renderSharedTree = ({ item }: { item: SharedTree }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => handleViewSharedTree(item.owner_id, item.owner_name)}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.avatarSmall, { backgroundColor: '#D4AF37' }]}>
          <Text style={styles.avatarText}>{item.owner_name[0]}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.owner_name}</Text>
          <Text style={styles.cardSubtitle}>
            {item.persons_count} membres - {item.role === 'editor' ? 'Editeur' : 'Lecteur'}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#6B7C93" />
    </TouchableOpacity>
  );

  const renderContribution = ({ item }: { item: Contribution }) => (
    <View style={styles.contributionCard}>
      <View style={styles.contributionHeader}>
        <Ionicons 
          name={item.action === 'add' ? 'add-circle' : item.action === 'edit' ? 'create' : 'trash'} 
          size={24} 
          color={item.action === 'add' ? '#4CAF50' : item.action === 'edit' ? '#FFA000' : '#FF6B6B'} 
        />
        <View style={styles.contributionInfo}>
          <Text style={styles.contributionTitle}>{item.contributor_name}</Text>
          <Text style={styles.contributionSubtitle}>
            {item.action === 'add' ? 'Ajouter' : item.action === 'edit' ? 'Modifier' : 'Supprimer'}
            {' une '}
            {item.entity_type === 'person' ? 'personne' : 'relation'}
          </Text>
          {item.entity_data && item.entity_data.first_name && (
            <Text style={styles.contributionDetail}>
              {item.entity_data.first_name} {item.entity_data.last_name}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.contributionActions}>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.approveBtn]}
          onPress={() => handleReviewContribution(item.id, 'approved')}
        >
          <Ionicons name="checkmark" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.rejectBtn]}
          onPress={() => handleReviewContribution(item.id, 'rejected')}
        >
          <Ionicons name="close" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loginPrompt}>
          <Ionicons name="people-outline" size={60} color="#D4AF37" />
          <Text style={styles.loginTitle}>Connectez-vous</Text>
          <Text style={styles.loginSubtitle}>
            La collaboration necessite un compte
          </Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.loginButtonText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Partage</Text>
        <TouchableOpacity 
          style={styles.inviteButton}
          onPress={() => setShowInviteModal(true)}
        >
          <Ionicons name="person-add" size={20} color="#0A1628" />
          <Text style={styles.inviteButtonText}>Inviter</Text>
        </TouchableOpacity>
      </View>

      {/* Success message banner */}
      {successMessage && (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      )}

      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'collaborators' && styles.tabActive]}
          onPress={() => setActiveTab('collaborators')}
        >
          <Text style={[styles.tabText, activeTab === 'collaborators' && styles.tabTextActive]}>
            Collaborateurs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'shared' && styles.tabActive]}
          onPress={() => setActiveTab('shared')}
        >
          <Text style={[styles.tabText, activeTab === 'shared' && styles.tabTextActive]}>
            Partages
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'contributions' && styles.tabActive]}
          onPress={() => setActiveTab('contributions')}
        >
          <Text style={[styles.tabText, activeTab === 'contributions' && styles.tabTextActive]}>
            En attente {pendingContributions.length > 0 ? '(' + pendingContributions.length + ')' : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'collaborators' && (
        <FlatList
          data={collaborators}
          keyExtractor={(item) => item.id}
          renderItem={renderCollaborator}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={60} color="#2A3F5A" />
              <Text style={styles.emptyTitle}>Aucun collaborateur</Text>
              <Text style={styles.emptySubtitle}>
                Invitez votre famille a completer l'arbre
              </Text>
            </View>
          }
        />
      )}

      {activeTab === 'shared' && (
        <FlatList
          data={sharedTrees}
          keyExtractor={(item) => item.id}
          renderItem={renderSharedTree}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="git-branch-outline" size={60} color="#2A3F5A" />
              <Text style={styles.emptyTitle}>Aucun arbre partage</Text>
              <Text style={styles.emptySubtitle}>
                Quand quelqu'un vous invitera, son arbre apparaitra ici
              </Text>
            </View>
          }
        />
      )}

      {activeTab === 'contributions' && (
        <FlatList
          data={pendingContributions}
          keyExtractor={(item) => item.id}
          renderItem={renderContribution}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={60} color="#2A3F5A" />
              <Text style={styles.emptyTitle}>Aucune contribution</Text>
              <Text style={styles.emptySubtitle}>
                Les modifications proposees apparaitront ici
              </Text>
            </View>
          }
        />
      )}

      <Modal
        visible={showInviteModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowInviteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Inviter un collaborateur</Text>
              <TouchableOpacity onPress={() => setShowInviteModal(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Adresse email</Text>
            <TextInput
              style={styles.input}
              placeholder="email@exemple.com"
              placeholderTextColor="#6B7C93"
              value={inviteEmail}
              onChangeText={setInviteEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>Role</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[styles.roleButton, inviteRole === 'editor' && styles.roleButtonActive]}
                onPress={() => setInviteRole('editor')}
              >
                <Ionicons name="create-outline" size={20} color={inviteRole === 'editor' ? '#D4AF37' : '#6B7C93'} />
                <Text style={[styles.roleText, inviteRole === 'editor' && styles.roleTextActive]}>
                  Editeur
                </Text>
                <Text style={styles.roleDescription}>Peut ajouter et modifier</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleButton, inviteRole === 'viewer' && styles.roleButtonActive]}
                onPress={() => setInviteRole('viewer')}
              >
                <Ionicons name="eye-outline" size={20} color={inviteRole === 'viewer' ? '#D4AF37' : '#6B7C93'} />
                <Text style={[styles.roleText, inviteRole === 'viewer' && styles.roleTextActive]}>
                  Lecteur
                </Text>
                <Text style={styles.roleDescription}>Peut uniquement voir</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.sendButton, inviting && styles.sendButtonDisabled]}
              onPress={handleInvite}
              disabled={inviting}
            >
              {inviting ? (
                <ActivityIndicator color="#0A1628" />
              ) : (
                <>
                  <Ionicons name="send" size={20} color="#0A1628" />
                  <Text style={styles.sendButtonText}>Envoyer l'invitation</Text>
                </>
              )}
            </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  inviteButtonText: {
    color: '#0A1628',
    fontSize: 14,
    fontWeight: '600',
  },
  successBanner: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  successText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#1A2F4A',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#D4AF37',
  },
  tabText: {
    fontSize: 11,
    color: '#6B7C93',
    fontWeight: '500',
    textAlign: 'center',
  },
  tabTextActive: {
    color: '#0A1628',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2F4A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#0A1628',
    fontSize: 16,
    fontWeight: '700',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6B7C93',
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  contributionCard: {
    backgroundColor: '#1A2F4A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  contributionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  contributionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contributionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  contributionSubtitle: {
    fontSize: 14,
    color: '#6B7C93',
    marginTop: 2,
  },
  contributionDetail: {
    fontSize: 14,
    color: '#D4AF37',
    marginTop: 4,
  },
  contributionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  approveBtn: {
    backgroundColor: '#4CAF50',
  },
  rejectBtn: {
    backgroundColor: '#FF6B6B',
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
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 20,
  },
  loginSubtitle: {
    fontSize: 16,
    color: '#6B7C93',
    marginTop: 8,
  },
  loginButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
  },
  loginButtonText: {
    color: '#0A1628',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A2F4A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  inputLabel: {
    fontSize: 14,
    color: '#B8C5D6',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0A1628',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2A3F5A',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  roleButton: {
    flex: 1,
    backgroundColor: '#0A1628',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2A3F5A',
  },
  roleButtonActive: {
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7C93',
    marginTop: 8,
  },
  roleTextActive: {
    color: '#D4AF37',
  },
  roleDescription: {
    fontSize: 11,
    color: '#6B7C93',
    marginTop: 4,
    textAlign: 'center',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#0A1628',
    fontSize: 16,
    fontWeight: '600',
  },
});
