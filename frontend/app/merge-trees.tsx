import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { mergeAPI } from '@/services/api';
import { useTranslation } from 'react-i18next';

interface MergeableTree {
  owner_id: string;
  owner_name: string;
  owner_email: string;
  persons_count: number;
  role: string;
}

interface DuplicateCandidate {
  source_person_id: string;
  source_person_name: string;
  source_birth_date?: string;
  target_person_id: string;
  target_person_name: string;
  target_birth_date?: string;
  similarity_score: number;
  match_reason: string;
}

interface MergeAnalysis {
  source_tree_owner_id: string;
  source_tree_owner_name: string;
  source_persons_count: number;
  target_persons_count: number;
  duplicates_found: DuplicateCandidate[];
  new_persons_count: number;
  new_links_count: number;
}

interface MergeDecision {
  source_person_id: string;
  action: 'merge' | 'add' | 'skip';
  target_person_id?: string;
}

export default function MergeTreesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [mergeableTrees, setMergeableTrees] = useState<MergeableTree[]>([]);
  const [selectedTree, setSelectedTree] = useState<MergeableTree | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<MergeAnalysis | null>(null);
  const [decisions, setDecisions] = useState<Map<string, MergeDecision>>(new Map());
  const [executing, setExecuting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [mergeResults, setMergeResults] = useState<any>(null);

  useEffect(() => {
    loadMergeableTrees();
  }, []);

  const loadMergeableTrees = async () => {
    try {
      const response = await mergeAPI.getMergeableTrees();
      setMergeableTrees(response.data.trees || []);
    } catch (error) {
      console.error('Error loading mergeable trees:', error);
      Alert.alert('Erreur', 'Impossible de charger les arbres disponibles');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTree = async (tree: MergeableTree) => {
    setSelectedTree(tree);
    setAnalyzing(true);
    
    try {
      const response = await mergeAPI.analyzeMerge(tree.owner_id);
      setAnalysis(response.data);
      
      // Initialize decisions for duplicates
      const initialDecisions = new Map<string, MergeDecision>();
      response.data.duplicates_found.forEach((dup: DuplicateCandidate) => {
        initialDecisions.set(dup.source_person_id, {
          source_person_id: dup.source_person_id,
          action: 'merge',  // Default to merge for duplicates
          target_person_id: dup.target_person_id,
        });
      });
      setDecisions(initialDecisions);
    } catch (error: any) {
      console.error('Error analyzing merge:', error);
      Alert.alert('Erreur', error.response?.data?.detail || 'Impossible d\'analyser la fusion');
      setSelectedTree(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const updateDecision = (sourcePersonId: string, action: 'merge' | 'add' | 'skip', targetPersonId?: string) => {
    const newDecisions = new Map(decisions);
    newDecisions.set(sourcePersonId, {
      source_person_id: sourcePersonId,
      action,
      target_person_id: targetPersonId,
    });
    setDecisions(newDecisions);
  };

  const handleExecuteMerge = async () => {
    if (!analysis) return;
    
    Alert.alert(
      'Confirmer la fusion',
      `Voulez-vous fusionner l'arbre de ${analysis.source_tree_owner_name} avec votre arbre ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Fusionner',
          onPress: async () => {
            setExecuting(true);
            try {
              const response = await mergeAPI.executeMerge({
                source_tree_owner_id: analysis.source_tree_owner_id,
                decisions: Array.from(decisions.values()),
                import_links: true,
              });
              
              setMergeResults(response.data);
              setShowResults(true);
            } catch (error: any) {
              console.error('Error executing merge:', error);
              Alert.alert('Erreur', error.response?.data?.detail || 'Erreur lors de la fusion');
            } finally {
              setExecuting(false);
            }
          },
        },
      ]
    );
  };

  const handleBack = () => {
    if (analysis) {
      setAnalysis(null);
      setSelectedTree(null);
      setDecisions(new Map());
    } else {
      router.back();
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="log-in-outline" size={60} color="#D4AF37" />
          <Text style={styles.emptyTitle}>Connexion requise</Text>
          <Text style={styles.emptySubtitle}>Connectez-vous pour fusionner des arbres</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="git-merge" size={24} color="#D4AF37" />
          <Text style={styles.headerTitle}>Fusionner des arbres</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!analysis ? (
          // Step 1: Select tree to merge
          <>
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={24} color="#D4AF37" />
              <Text style={styles.infoText}>
                Sélectionnez un arbre partagé avec vous pour le fusionner avec votre arbre. 
                Vous devez être éditeur de l'arbre source pour pouvoir le fusionner.
              </Text>
            </View>

            {mergeableTrees.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={60} color="#2A3F5A" />
                <Text style={styles.emptyTitle}>Aucun arbre disponible</Text>
                <Text style={styles.emptySubtitle}>
                  Pour fusionner des arbres, vous devez d'abord être invité comme éditeur sur un autre arbre familial.
                </Text>
                <TouchableOpacity 
                  style={styles.helpButton}
                  onPress={() => router.push('/(tabs)/share')}
                >
                  <Text style={styles.helpButtonText}>Voir mes partages</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.treeList}>
                <Text style={styles.sectionTitle}>Arbres disponibles pour fusion</Text>
                {mergeableTrees.map((tree) => (
                  <TouchableOpacity
                    key={tree.owner_id}
                    style={styles.treeCard}
                    onPress={() => handleSelectTree(tree)}
                    disabled={analyzing}
                  >
                    <View style={styles.treeCardIcon}>
                      <Ionicons name="git-branch" size={32} color="#D4AF37" />
                    </View>
                    <View style={styles.treeCardContent}>
                      <Text style={styles.treeCardName}>{tree.owner_name}</Text>
                      <Text style={styles.treeCardEmail}>{tree.owner_email}</Text>
                      <Text style={styles.treeCardStats}>
                        {tree.persons_count} personne{tree.persons_count > 1 ? 's' : ''} • {tree.role === 'editor' ? 'Éditeur' : 'Lecteur'}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#6B7C93" />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        ) : analyzing ? (
          // Analyzing
          <View style={styles.analyzingContainer}>
            <ActivityIndicator size="large" color="#D4AF37" />
            <Text style={styles.analyzingText}>Analyse en cours...</Text>
            <Text style={styles.analyzingSubtext}>Détection des doublons et préparation de la fusion</Text>
          </View>
        ) : (
          // Step 2: Review duplicates and confirm
          <>
            {/* Summary */}
            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>Résumé de l'analyse</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Arbre source :</Text>
                <Text style={styles.summaryValue}>{analysis.source_tree_owner_name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Personnes dans l'arbre source :</Text>
                <Text style={styles.summaryValue}>{analysis.source_persons_count}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Personnes dans votre arbre :</Text>
                <Text style={styles.summaryValue}>{analysis.target_persons_count}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Doublons détectés :</Text>
                <Text style={[styles.summaryValue, { color: analysis.duplicates_found.length > 0 ? '#FFA500' : '#4CAF50' }]}>
                  {analysis.duplicates_found.length}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Nouvelles personnes :</Text>
                <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>{analysis.new_persons_count}</Text>
              </View>
            </View>

            {/* Duplicates */}
            {analysis.duplicates_found.length > 0 && (
              <View style={styles.duplicatesSection}>
                <Text style={styles.sectionTitle}>⚠️ Doublons détectés</Text>
                <Text style={styles.sectionSubtitle}>
                  Choisissez comment traiter chaque doublon potentiel
                </Text>

                {analysis.duplicates_found.map((dup) => {
                  const currentDecision = decisions.get(dup.source_person_id);
                  return (
                    <View key={dup.source_person_id} style={styles.duplicateCard}>
                      <View style={styles.duplicateHeader}>
                        <View style={styles.similarityBadge}>
                          <Text style={styles.similarityText}>{Math.round(dup.similarity_score)}%</Text>
                        </View>
                        <Text style={styles.matchReason}>{dup.match_reason}</Text>
                      </View>

                      <View style={styles.duplicateComparison}>
                        <View style={styles.duplicatePerson}>
                          <Text style={styles.duplicateLabel}>Source</Text>
                          <Text style={styles.duplicateName}>{dup.source_person_name}</Text>
                          {dup.source_birth_date && (
                            <Text style={styles.duplicateDate}>Né(e) : {dup.source_birth_date}</Text>
                          )}
                        </View>
                        <Ionicons name="swap-horizontal" size={24} color="#6B7C93" />
                        <View style={styles.duplicatePerson}>
                          <Text style={styles.duplicateLabel}>Votre arbre</Text>
                          <Text style={styles.duplicateName}>{dup.target_person_name}</Text>
                          {dup.target_birth_date && (
                            <Text style={styles.duplicateDate}>Né(e) : {dup.target_birth_date}</Text>
                          )}
                        </View>
                      </View>

                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={[
                            styles.actionButton,
                            currentDecision?.action === 'merge' && styles.actionButtonActive,
                          ]}
                          onPress={() => updateDecision(dup.source_person_id, 'merge', dup.target_person_id)}
                        >
                          <Ionicons name="git-merge" size={18} color={currentDecision?.action === 'merge' ? '#0A1628' : '#D4AF37'} />
                          <Text style={[styles.actionButtonText, currentDecision?.action === 'merge' && styles.actionButtonTextActive]}>
                            Fusionner
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.actionButton,
                            currentDecision?.action === 'add' && styles.actionButtonActive,
                          ]}
                          onPress={() => updateDecision(dup.source_person_id, 'add')}
                        >
                          <Ionicons name="add-circle" size={18} color={currentDecision?.action === 'add' ? '#0A1628' : '#4CAF50'} />
                          <Text style={[styles.actionButtonText, currentDecision?.action === 'add' && styles.actionButtonTextActive]}>
                            Ajouter
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.actionButton,
                            currentDecision?.action === 'skip' && styles.actionButtonActive,
                          ]}
                          onPress={() => updateDecision(dup.source_person_id, 'skip')}
                        >
                          <Ionicons name="close-circle" size={18} color={currentDecision?.action === 'skip' ? '#0A1628' : '#F44336'} />
                          <Text style={[styles.actionButtonText, currentDecision?.action === 'skip' && styles.actionButtonTextActive]}>
                            Ignorer
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Execute button */}
            <TouchableOpacity
              style={[styles.executeButton, executing && styles.executeButtonDisabled]}
              onPress={handleExecuteMerge}
              disabled={executing}
            >
              {executing ? (
                <ActivityIndicator color="#0A1628" />
              ) : (
                <>
                  <Ionicons name="git-merge" size={24} color="#0A1628" />
                  <Text style={styles.executeButtonText}>Exécuter la fusion</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Results Modal */}
      <Modal
        visible={showResults}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowResults(false);
          router.replace('/(tabs)/tree');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
            </View>
            <Text style={styles.modalTitle}>Fusion terminée !</Text>
            {mergeResults && (
              <View style={styles.modalStats}>
                <Text style={styles.modalStatText}>✅ {mergeResults.persons_merged} personne(s) fusionnée(s)</Text>
                <Text style={styles.modalStatText}>➕ {mergeResults.persons_added} personne(s) ajoutée(s)</Text>
                <Text style={styles.modalStatText}>🔗 {mergeResults.links_added} lien(s) créé(s)</Text>
                {mergeResults.persons_skipped > 0 && (
                  <Text style={styles.modalStatText}>⏭️ {mergeResults.persons_skipped} personne(s) ignorée(s)</Text>
                )}
              </View>
            )}
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowResults(false);
                router.replace('/(tabs)/tree');
              }}
            >
              <Text style={styles.modalButtonText}>Voir mon arbre</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2F4A',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#D4AF37',
    fontSize: 16,
    marginTop: 12,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#1A2F4A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  infoText: {
    flex: 1,
    color: '#B8C5D6',
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7C93',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  helpButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#1A2F4A',
    borderRadius: 8,
  },
  helpButtonText: {
    color: '#D4AF37',
    fontWeight: '600',
  },
  treeList: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7C93',
    marginBottom: 16,
  },
  treeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2F4A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  treeCardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  treeCardContent: {
    flex: 1,
  },
  treeCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  treeCardEmail: {
    fontSize: 13,
    color: '#6B7C93',
    marginTop: 2,
  },
  treeCardStats: {
    fontSize: 12,
    color: '#D4AF37',
    marginTop: 4,
  },
  analyzingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  analyzingText: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
  },
  analyzingSubtext: {
    color: '#6B7C93',
    fontSize: 14,
    marginTop: 8,
  },
  summaryBox: {
    backgroundColor: '#1A2F4A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4AF37',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2A3F5A',
  },
  summaryLabel: {
    color: '#B8C5D6',
    fontSize: 14,
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  duplicatesSection: {
    marginBottom: 20,
  },
  duplicateCard: {
    backgroundColor: '#1A2F4A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFA500',
  },
  duplicateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  similarityBadge: {
    backgroundColor: '#FFA500',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  similarityText: {
    color: '#0A1628',
    fontSize: 12,
    fontWeight: '700',
  },
  matchReason: {
    color: '#B8C5D6',
    fontSize: 13,
    flex: 1,
  },
  duplicateComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  duplicatePerson: {
    flex: 1,
    alignItems: 'center',
  },
  duplicateLabel: {
    fontSize: 11,
    color: '#6B7C93',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  duplicateName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  duplicateDate: {
    fontSize: 12,
    color: '#B8C5D6',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#2A3F5A',
    gap: 6,
  },
  actionButtonActive: {
    backgroundColor: '#D4AF37',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtonTextActive: {
    color: '#0A1628',
  },
  executeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 40,
    gap: 10,
  },
  executeButtonDisabled: {
    opacity: 0.6,
  },
  executeButtonText: {
    color: '#0A1628',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1A2F4A',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  modalIcon: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  modalStats: {
    alignSelf: 'stretch',
    backgroundColor: '#0A1628',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  modalStatText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginVertical: 4,
  },
  modalButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 12,
  },
  modalButtonText: {
    color: '#0A1628',
    fontSize: 16,
    fontWeight: '700',
  },
});
