// Build: 1765552905
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Line, Circle, G, Text as SvgText, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useAuth } from '@/context/AuthContext';
import { treeAPI, previewAPI } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Person {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  birth_date?: string;
  is_preview?: boolean;
}

interface FamilyLink {
  id: string;
  person_id_1: string;
  person_id_2: string;
  link_type: string;
}

interface TreeNode {
  person: Person;
  x: number;
  y: number;
  children: TreeNode[];
  spouse?: Person;
}

const NODE_WIDTH = 120;
const NODE_HEIGHT = 60;
const LEVEL_HEIGHT = 120;
const NODE_SPACING = 20;

export default function TreeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const isPreviewMode = params.preview === 'true';
  const inviteToken = params.invite as string | undefined;

  const [persons, setPersons] = useState<Person[]>([]);
  const [links, setLinks] = useState<FamilyLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [previewToken, setPreviewToken] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [sharedTreeOwner, setSharedTreeOwner] = useState<{id: string, name: string, role: string} | null>(null);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);

  // Handle invitation acceptance
  useEffect(() => {
    const handleInvite = async () => {
      if (inviteToken && user) {
        try {
          const { collaboratorsAPI } = await import('@/services/api');
          const response = await collaboratorsAPI.acceptInvitation(inviteToken);
          const data = response.data;
          
          setInviteMessage(`✅ Invitation acceptée ! Vous pouvez maintenant voir l'arbre de ${data.tree_owner_name}`);
          setSharedTreeOwner({
            id: data.tree_owner_id,
            name: data.tree_owner_name,
            role: data.role
          });
          
          // Load the shared tree
          const treeResponse = await collaboratorsAPI.getSharedTree(data.tree_owner_id);
          setPersons(treeResponse.data.persons || []);
          setLinks(treeResponse.data.links || []);
          setLoading(false);
          
          // Clear the invite message after 5 seconds
          setTimeout(() => setInviteMessage(null), 5000);
        } catch (error: any) {
          console.error('Error accepting invite:', error);
          const message = error.response?.data?.detail || 'Erreur lors de l\'acceptation de l\'invitation';
          setInviteMessage(`❌ ${message}`);
          setTimeout(() => setInviteMessage(null), 5000);
          // Load normal data
          loadData();
        }
      } else {
        loadData();
      }
    };
    
    handleInvite();
  }, [inviteToken, user]);

  useEffect(() => {
    if (!inviteToken) {
      loadData();
    }
  }, [isPreviewMode]);

  const loadData = async () => {
    try {
      if (isPreviewMode) {
        let token = await AsyncStorage.getItem('preview_token');
        if (!token) {
          const response = await previewAPI.createSession();
          token = response.data.session_token;
          await AsyncStorage.setItem('preview_token', token);
        }
        setPreviewToken(token);
        try {
          const sessionData = await previewAPI.getSession(token);
          setPersons(sessionData.data.persons || []);
          setLinks(sessionData.data.links || []);
        } catch (e: any) {
          if (e.response?.status === 404 || e.response?.status === 410) {
            const response = await previewAPI.createSession();
            token = response.data.session_token;
            await AsyncStorage.setItem('preview_token', token);
            setPreviewToken(token);
            setPersons([]);
            setLinks([]);
          }
        }
      } else if (user) {
        const response = await treeAPI.getTree();
        setPersons(response.data.persons || []);
        setLinks(response.data.links || []);
      }
    } catch (error) {
      console.error('Error loading tree:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [isPreviewMode]);

  const handleAddPerson = () => {
    if (isPreviewMode && persons.length >= 10) {
      Alert.alert(
        'Limite atteinte',
        'Le mode aperçu est limité à 10 membres. Créez un compte pour un arbre illimité.',
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

  const handleAddLink = () => {
    if (persons.length < 2) {
      Alert.alert('Information', 'Ajoutez au moins 2 personnes pour créer un lien familial.');
      return;
    }
    router.push({
      pathname: '/add-link',
      params: { preview: isPreviewMode ? 'true' : 'false', token: previewToken || '' },
    });
  };

  const handlePersonPress = (person: Person) => {
    setSelectedPerson(person);
    router.push({
      pathname: '/person/[id]',
      params: { id: person.id, preview: isPreviewMode ? 'true' : 'false', token: previewToken || '' },
    });
  };

  const handleConvertToAccount = async () => {
    if (previewToken) {
      await AsyncStorage.setItem('preview_token_to_convert', previewToken);
    }
    router.push('/(auth)/register');
  };

  // Build tree structure - PROFESSIONAL TREE LAYOUT ALGORITHM
  const buildTreeLayout = () => {
    if (persons.length === 0) return { nodes: [], connections: [] };

    // STEP 1: Normalize all relationships into parent->child direction
    // Handle both 'parent' and 'child' link types
    const parentChildPairs: {parentId: string, childId: string}[] = [];
    
    links.forEach((link) => {
      if (link.link_type === 'parent') {
        // person_id_1 is parent, person_id_2 is child
        parentChildPairs.push({ parentId: link.person_id_1, childId: link.person_id_2 });
      } else if (link.link_type === 'child') {
        // person_id_1 is child, person_id_2 is parent (reverse)
        parentChildPairs.push({ parentId: link.person_id_2, childId: link.person_id_1 });
      }
    });

    // STEP 2: Build bidirectional maps
    const childToParents = new Map<string, Set<string>>();
    const parentToChildren = new Map<string, Set<string>>();
    
    parentChildPairs.forEach(({ parentId, childId }) => {
      if (!childToParents.has(childId)) childToParents.set(childId, new Set());
      childToParents.get(childId)!.add(parentId);
      
      if (!parentToChildren.has(parentId)) parentToChildren.set(parentId, new Set());
      parentToChildren.get(parentId)!.add(childId);
    });

    // STEP 3: Calculate generation level for each person
    // Level 0 = roots (no parents), higher levels = descendants
    const personLevels = new Map<string, number>();
    
    const calculateLevel = (personId: string, visited: Set<string> = new Set()): number => {
      if (personLevels.has(personId)) return personLevels.get(personId)!;
      if (visited.has(personId)) return 0; // Prevent infinite loop
      
      visited.add(personId);
      const parents = childToParents.get(personId);
      
      if (!parents || parents.size === 0) {
        personLevels.set(personId, 0);
        return 0;
      }
      
      let maxParentLevel = -1;
      parents.forEach((parentId) => {
        const parentLevel = calculateLevel(parentId, new Set(visited));
        maxParentLevel = Math.max(maxParentLevel, parentLevel);
      });
      
      const level = maxParentLevel + 1;
      personLevels.set(personId, level);
      return level;
    };

    // Calculate levels for all persons
    persons.forEach((p) => calculateLevel(p.id));

    // STEP 4: Find spouse relationships
    const spouseLinks = links.filter((l) => l.link_type === 'spouse');
    const spouseMap = new Map<string, string>();
    spouseLinks.forEach((l) => {
      spouseMap.set(l.person_id_1, l.person_id_2);
      spouseMap.set(l.person_id_2, l.person_id_1);
    });

    // STEP 5: Group persons by level
    const levelGroups = new Map<number, Person[]>();
    persons.forEach((p) => {
      const level = personLevels.get(p.id) || 0;
      if (!levelGroups.has(level)) levelGroups.set(level, []);
      levelGroups.get(level)!.push(p);
    });

    // STEP 6: Layout nodes level by level
    const nodes: { person: Person; x: number; y: number }[] = [];
    const connections: { from: { x: number; y: number }; to: { x: number; y: number }; type: string }[] = [];
    const positionedPersons = new Set<string>();
    const personPositions = new Map<string, { x: number; y: number }>();

    // Sort levels
    const sortedLevels = Array.from(levelGroups.keys()).sort((a, b) => a - b);
    
    sortedLevels.forEach((level) => {
      const personsAtLevel = levelGroups.get(level) || [];
      const y = level * LEVEL_HEIGHT + 60;
      let x = 40;

      // Sort persons at this level: couples together
      const sortedPersons: Person[] = [];
      const addedAtLevel = new Set<string>();

      personsAtLevel.forEach((person) => {
        if (addedAtLevel.has(person.id)) return;
        
        sortedPersons.push(person);
        addedAtLevel.add(person.id);
        
        // Add spouse right after if at same level
        const spouseId = spouseMap.get(person.id);
        if (spouseId) {
          const spouse = personsAtLevel.find((p) => p.id === spouseId);
          if (spouse && !addedAtLevel.has(spouse.id)) {
            sortedPersons.push(spouse);
            addedAtLevel.add(spouse.id);
          }
        }
      });

      // Position each person at this level
      sortedPersons.forEach((person, index) => {
        if (positionedPersons.has(person.id)) return;
        
        const spouseId = spouseMap.get(person.id);
        const hasSpouseNext = spouseId && sortedPersons[index + 1]?.id === spouseId;
        
        nodes.push({ person, x, y });
        personPositions.set(person.id, { x, y });
        positionedPersons.add(person.id);
        
        if (hasSpouseNext) {
          // Spouse connection
          connections.push({
            from: { x: x + NODE_WIDTH, y: y + NODE_HEIGHT / 2 },
            to: { x: x + NODE_WIDTH + 20, y: y + NODE_HEIGHT / 2 },
            type: 'spouse',
          });
          x += NODE_WIDTH + NODE_SPACING;
        } else {
          x += NODE_WIDTH + NODE_SPACING;
        }
      });
    });

    // STEP 7: Draw parent-child connections
    parentChildPairs.forEach(({ parentId, childId }) => {
      const parentPos = personPositions.get(parentId);
      const childPos = personPositions.get(childId);
      
      if (parentPos && childPos) {
        // Check if parent has a spouse to adjust connection point
        const spouseId = spouseMap.get(parentId);
        const spousePos = spouseId ? personPositions.get(spouseId) : null;
        
        let fromX = parentPos.x + NODE_WIDTH / 2;
        if (spousePos && Math.abs(spousePos.y - parentPos.y) < 10) {
          // If spouse is on same level, connect from between them
          fromX = (parentPos.x + NODE_WIDTH + spousePos.x) / 2;
        }
        
        connections.push({
          from: { x: fromX, y: parentPos.y + NODE_HEIGHT },
          to: { x: childPos.x + NODE_WIDTH / 2, y: childPos.y },
          type: 'parent',
        });
      }
    });

    return { nodes, connections };
  };

  const { nodes, connections } = buildTreeLayout();
  const svgWidth = Math.max(SCREEN_WIDTH, nodes.reduce((max, n) => Math.max(max, n.x + NODE_WIDTH + 40), 0));
  const svgHeight = Math.max(400, nodes.reduce((max, n) => Math.max(max, n.y + NODE_HEIGHT + 60), 0));

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
          <Text style={styles.loadingText}>Chargement de l'arbre...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          // Clear any preview mode params and go to root
          router.replace('/');
        }} style={styles.homeButton}>
          <Ionicons name="home-outline" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <View style={styles.headerLeft}>
          <Ionicons name="leaf" size={28} color="#D4AF37" />
          <Text style={styles.headerTitle}>
            {sharedTreeOwner ? `Arbre de ${sharedTreeOwner.name}` : (isPreviewMode ? 'Mode Aperçu' : 'Mon Arbre')}
          </Text>
        </View>
        {isPreviewMode && (
          <TouchableOpacity style={styles.convertButton} onPress={handleConvertToAccount}>
            <Ionicons name="save-outline" size={18} color="#0A1628" />
            <Text style={styles.convertButtonText}>Sauvegarder</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Invite Success Banner */}
      {inviteMessage && (
        <View style={[styles.previewBanner, { backgroundColor: inviteMessage.startsWith('✅') ? '#4CAF50' : '#F44336' }]}>
          <Text style={styles.previewBannerText}>{inviteMessage}</Text>
        </View>
      )}

      {/* Shared Tree Banner */}
      {sharedTreeOwner && !inviteMessage && (
        <View style={[styles.previewBanner, { backgroundColor: '#2196F3' }]}>
          <Text style={styles.previewBannerText}>
            Vous consultez l'arbre de {sharedTreeOwner.name} ({sharedTreeOwner.role === 'editor' ? 'Éditeur' : 'Lecteur'})
          </Text>
        </View>
      )}

      {/* Preview Banner */}
      {isPreviewMode && (
        <View style={styles.previewBanner}>
          <Ionicons name="information-circle" size={20} color="#D4AF37" />
          <Text style={styles.previewBannerText}>
            Mode aperçu : {persons.length}/10 membres • Les données seront supprimées après 24h
          </Text>
        </View>
      )}

      {/* Tree View */}
      <ScrollView
        style={styles.treeContainer}
        contentContainerStyle={styles.treeContent}
        horizontal
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />
        }
      >
        <ScrollView
          nestedScrollEnabled
          contentContainerStyle={{ minHeight: svgHeight }}
        >
          {persons.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="git-branch-outline" size={80} color="#2A3F5A" />
              <Text style={styles.emptyTitle}>Votre arbre est vide</Text>
              <Text style={styles.emptySubtitle}>
                Commencez par ajouter le premier membre de votre famille
              </Text>
              <TouchableOpacity style={styles.emptyButton} onPress={handleAddPerson}>
                <Ionicons name="add" size={24} color="#0A1628" />
                <Text style={styles.emptyButtonText}>Ajouter une personne</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Svg width={svgWidth} height={svgHeight}>
              <Defs>
                <LinearGradient id="maleGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#4A90D9" stopOpacity="0.3" />
                  <Stop offset="1" stopColor="#4A90D9" stopOpacity="0.1" />
                </LinearGradient>
                <LinearGradient id="femaleGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#D94A8C" stopOpacity="0.3" />
                  <Stop offset="1" stopColor="#D94A8C" stopOpacity="0.1" />
                </LinearGradient>
                <LinearGradient id="unknownGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#6B7C93" stopOpacity="0.3" />
                  <Stop offset="1" stopColor="#6B7C93" stopOpacity="0.1" />
                </LinearGradient>
              </Defs>

              {/* Connections */}
              {connections.map((conn, index) => (
                <G key={`conn-${index}`}>
                  {conn.type === 'spouse' ? (
                    <Line
                      x1={conn.from.x}
                      y1={conn.from.y}
                      x2={conn.to.x}
                      y2={conn.to.y}
                      stroke="#D4AF37"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                  ) : (
                    <>
                      <Line
                        x1={conn.from.x}
                        y1={conn.from.y}
                        x2={conn.from.x}
                        y2={(conn.from.y + conn.to.y) / 2}
                        stroke="#3A5070"
                        strokeWidth="2"
                      />
                      <Line
                        x1={conn.from.x}
                        y1={(conn.from.y + conn.to.y) / 2}
                        x2={conn.to.x}
                        y2={(conn.from.y + conn.to.y) / 2}
                        stroke="#3A5070"
                        strokeWidth="2"
                      />
                      <Line
                        x1={conn.to.x}
                        y1={(conn.from.y + conn.to.y) / 2}
                        x2={conn.to.x}
                        y2={conn.to.y}
                        stroke="#3A5070"
                        strokeWidth="2"
                      />
                    </>
                  )}
                </G>
              ))}

              {/* Nodes */}
              {nodes.map((node) => {
                const gradId =
                  node.person.gender === 'male'
                    ? 'url(#maleGrad)'
                    : node.person.gender === 'female'
                    ? 'url(#femaleGrad)'
                    : 'url(#unknownGrad)';
                const borderColor = getGenderColor(node.person.gender);

                return (
                  <G
                    key={node.person.id}
                    onPress={() => handlePersonPress(node.person)}
                  >
                    <Rect
                      x={node.x}
                      y={node.y}
                      width={NODE_WIDTH}
                      height={NODE_HEIGHT}
                      rx={12}
                      fill={gradId}
                      stroke={borderColor}
                      strokeWidth="2"
                    />
                    <SvgText
                      x={node.x + NODE_WIDTH / 2}
                      y={node.y + 25}
                      fill="#FFFFFF"
                      fontSize="12"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {node.person.first_name}
                    </SvgText>
                    <SvgText
                      x={node.x + NODE_WIDTH / 2}
                      y={node.y + 42}
                      fill="#B8C5D6"
                      fontSize="10"
                      textAnchor="middle"
                    >
                      {node.person.last_name}
                    </SvgText>
                  </G>
                );
              })}
            </Svg>
          )}
        </ScrollView>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleAddPerson}>
          <Ionicons name="person-add" size={22} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Ajouter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButtonSecondary} onPress={handleAddLink}>
          <Ionicons name="git-merge" size={22} color="#D4AF37" />
          <Text style={styles.actionButtonTextSecondary}>Lien</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButtonSecondary} onPress={onRefresh}>
          <Ionicons name="refresh" size={22} color="#D4AF37" />
          <Text style={styles.actionButtonTextSecondary}>Actualiser</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 16,
    marginTop: 12,
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
  homeButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  convertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  convertButtonText: {
    color: '#0A1628',
    fontSize: 14,
    fontWeight: '600',
  },
  previewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  previewBannerText: {
    color: '#D4AF37',
    fontSize: 13,
    flex: 1,
  },
  treeContainer: {
    flex: 1,
  },
  treeContent: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 400,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6B7C93',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  emptyButtonText: {
    color: '#0A1628',
    fontSize: 16,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#1A2F4A',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#0A1628',
    fontSize: 15,
    fontWeight: '600',
  },
  actionButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D4AF37',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonTextSecondary: {
    color: '#D4AF37',
    fontSize: 15,
    fontWeight: '600',
  },
});
