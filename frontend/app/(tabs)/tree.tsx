// Build: 2024121401 - DEFINITIVE TREE LAYOUT
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
import Svg, { Line, Circle, G, Text as SvgText, Rect, Defs, LinearGradient, Stop, Path } from 'react-native-svg';
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

const NODE_WIDTH = 130;
const NODE_HEIGHT = 65;
const LEVEL_HEIGHT = 140;
const NODE_SPACING = 30;
const COUPLE_SPACING = 15;

export default function TreeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const isPreviewMode = params.preview === 'true';
  const inviteToken = params.invite as string | undefined;
  const sharedOwnerId = params.sharedOwnerId as string | undefined;
  const sharedOwnerName = params.sharedOwnerName as string | undefined;

  const [persons, setPersons] = useState<Person[]>([]);
  const [links, setLinks] = useState<FamilyLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [previewToken, setPreviewToken] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [sharedTreeOwner, setSharedTreeOwner] = useState<{id: string, name: string, role: string} | null>(null);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);

  // Handle shared tree viewing (from share tab)
  useEffect(() => {
    const loadSharedTree = async () => {
      if (sharedOwnerId && sharedOwnerName && user) {
        setLoading(true);
        try {
          const { collaboratorsAPI } = await import('@/services/api');
          const treeResponse = await collaboratorsAPI.getSharedTree(sharedOwnerId);
          setPersons(treeResponse.data.persons || []);
          setLinks(treeResponse.data.links || []);
          setSharedTreeOwner({
            id: sharedOwnerId,
            name: sharedOwnerName,
            role: 'viewer' // Default, could be fetched from API
          });
          console.log('Loaded shared tree:', sharedOwnerName, 'Persons:', treeResponse.data.persons?.length, 'Links:', treeResponse.data.links?.length);
        } catch (error: any) {
          console.error('Error loading shared tree:', error);
          const message = error.response?.data?.detail || 'Erreur lors du chargement de l\'arbre partagé';
          setInviteMessage(`❌ ${message}`);
          setTimeout(() => setInviteMessage(null), 5000);
        } finally {
          setLoading(false);
        }
      }
    };
    
    if (sharedOwnerId) {
      loadSharedTree();
    }
  }, [sharedOwnerId, sharedOwnerName, user]);

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
    // Don't load user's own data if viewing a shared tree
    if (!inviteToken && !sharedOwnerId) {
      loadData();
    }
  }, [isPreviewMode, sharedOwnerId]);

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

  // ============================================================================
  // DEFINITIVE TREE LAYOUT ALGORITHM v7 - ROBUST SPOUSE SYNCHRONIZATION
  // ============================================================================
  // RÈGLES FONDAMENTALES:
  // 1. Les parents sont TOUJOURS au-dessus de leurs enfants
  // 2. Les époux sont TOUJOURS sur la même ligne (même niveau)
  // 3. Le repositionnement est automatique peu importe l'ordre de création
  // ============================================================================
  const buildTreeLayout = () => {
    if (persons.length === 0) return { nodes: [], connections: [], debugInfo: null };

    console.log('========== TREE LAYOUT v7 - ROBUST ==========');
    
    // ==================== STEP 1: BUILD RELATIONSHIP MAPS ====================
    const childToParents = new Map<string, Set<string>>();
    const parentToChildren = new Map<string, Set<string>>();
    const spouseMap = new Map<string, Set<string>>();
    const personById = new Map<string, Person>();
    
    persons.forEach(p => personById.set(p.id, p));
    
    links.forEach(link => {
      if (link.link_type === 'parent') {
        const parentId = link.person_id_1;
        const childId = link.person_id_2;
        
        if (!childToParents.has(childId)) childToParents.set(childId, new Set());
        childToParents.get(childId)!.add(parentId);
        
        if (!parentToChildren.has(parentId)) parentToChildren.set(parentId, new Set());
        parentToChildren.get(parentId)!.add(childId);
      } else if (link.link_type === 'spouse') {
        if (!spouseMap.has(link.person_id_1)) spouseMap.set(link.person_id_1, new Set());
        if (!spouseMap.has(link.person_id_2)) spouseMap.set(link.person_id_2, new Set());
        spouseMap.get(link.person_id_1)!.add(link.person_id_2);
        spouseMap.get(link.person_id_2)!.add(link.person_id_1);
      }
    });

    // ==================== STEP 2: CALCULATE BASE LEVELS ====================
    // Level = distance from furthest ancestor (0 = root with no parents)
    const personLevels = new Map<string, number>();
    
    const calculateLevel = (personId: string, visited: Set<string>): number => {
      if (visited.has(personId)) return personLevels.get(personId) || 0;
      if (personLevels.has(personId)) return personLevels.get(personId)!;
      
      const parents = childToParents.get(personId);
      if (!parents || parents.size === 0) {
        return 0; // Root = level 0
      }
      
      visited.add(personId);
      let maxParentLevel = -1;
      
      parents.forEach(parentId => {
        const parentLevel = calculateLevel(parentId, new Set(visited));
        maxParentLevel = Math.max(maxParentLevel, parentLevel);
      });
      
      return maxParentLevel + 1;
    };
    
    // Calculate initial levels
    persons.forEach(p => {
      const level = calculateLevel(p.id, new Set());
      personLevels.set(p.id, level);
    });

    console.log('Initial levels:', [...personLevels.entries()].map(([id, level]) => {
      const p = personById.get(id);
      return `${p?.first_name} ${p?.last_name}: ${level}`;
    }));

    // ==================== STEP 3: SYNCHRONIZE SPOUSE LEVELS ====================
    // RÈGLE CRITIQUE: Les époux doivent TOUJOURS être au même niveau
    // On prend le niveau le plus ÉLEVÉ (le plus bas dans l'arbre) pour que
    // l'époux sans parents descende au niveau de l'époux avec parents
    
    let changed = true;
    let iterations = 0;
    const MAX_ITERATIONS = 50;
    
    while (changed && iterations < MAX_ITERATIONS) {
      changed = false;
      iterations++;
      
      spouseMap.forEach((spouses, personId) => {
        const personLevel = personLevels.get(personId)!;
        
        spouses.forEach(spouseId => {
          const spouseLevel = personLevels.get(spouseId)!;
          
          // Les époux doivent être au MÊME niveau
          // Prendre le niveau le plus ÉLEVÉ (plus bas dans l'arbre)
          // car un époux peut avoir des parents qui le placent plus bas
          if (personLevel !== spouseLevel) {
            const targetLevel = Math.max(personLevel, spouseLevel);
            
            if (personLevels.get(personId) !== targetLevel) {
              personLevels.set(personId, targetLevel);
              changed = true;
            }
            if (personLevels.get(spouseId) !== targetLevel) {
              personLevels.set(spouseId, targetLevel);
              changed = true;
            }
          }
        });
      });
      
      // Après synchronisation des époux, recalculer les enfants
      // car si un parent a bougé, ses enfants doivent bouger aussi
      if (changed) {
        persons.forEach(p => {
          const parents = childToParents.get(p.id);
          if (parents && parents.size > 0) {
            let maxParentLevel = -1;
            parents.forEach(parentId => {
              maxParentLevel = Math.max(maxParentLevel, personLevels.get(parentId) || 0);
            });
            const newLevel = maxParentLevel + 1;
            if (personLevels.get(p.id) !== newLevel) {
              personLevels.set(p.id, newLevel);
              changed = true;
            }
          }
        });
      }
    }

    console.log(`Synchronization completed in ${iterations} iterations`);
    console.log('Final levels:', [...personLevels.entries()].map(([id, level]) => {
      const p = personById.get(id);
      return `${p?.first_name} ${p?.last_name}: ${level}`;
    }));

    // ==================== STEP 4: GROUP BY LEVEL ====================
    const levelGroups = new Map<number, Person[]>();
    persons.forEach(p => {
      const level = personLevels.get(p.id) || 0;
      if (!levelGroups.has(level)) levelGroups.set(level, []);
      levelGroups.get(level)!.push(p);
    });

    // ==================== STEP 5: POSITION NODES ====================
    const nodes: { person: Person; x: number; y: number }[] = [];
    const personPositions = new Map<string, { x: number; y: number }>();
    
    const sortedLevels = Array.from(levelGroups.keys()).sort((a, b) => b - a);
    
    sortedLevels.forEach(level => {
      const personsAtLevel = levelGroups.get(level) || [];
      const y = level * LEVEL_HEIGHT + 80;
      
      // Group spouses together
      const processedIds = new Set<string>();
      const familyUnits: Person[][] = [];
      
      personsAtLevel.forEach(person => {
        if (processedIds.has(person.id)) return;
        
        const unit: Person[] = [person];
        processedIds.add(person.id);
        
        // Add all spouses at this level
        const spouses = spouseMap.get(person.id);
        if (spouses) {
          spouses.forEach(spouseId => {
            const spouse = personsAtLevel.find(p => p.id === spouseId);
            if (spouse && !processedIds.has(spouse.id)) {
              unit.push(spouse);
              processedIds.add(spouse.id);
            }
          });
        }
        
        familyUnits.push(unit);
      });

      // Position each family unit
      let currentX = 50;
      
      familyUnits.forEach(unit => {
        // Try to center above children
        const allChildrenIds: string[] = [];
        unit.forEach(person => {
          const children = parentToChildren.get(person.id);
          if (children) children.forEach(cId => allChildrenIds.push(cId));
        });

        let unitX = currentX;
        if (allChildrenIds.length > 0) {
          const childPositions = allChildrenIds
            .map(cId => personPositions.get(cId))
            .filter(pos => pos !== undefined);
          
          if (childPositions.length > 0) {
            const avgChildX = childPositions.reduce((sum, p) => sum + p!.x + NODE_WIDTH / 2, 0) / childPositions.length;
            const unitWidth = unit.length * NODE_WIDTH + (unit.length - 1) * COUPLE_SPACING;
            unitX = Math.max(currentX, avgChildX - unitWidth / 2);
          }
        }

        // Position each person in unit
        let x = unitX;
        unit.forEach(person => {
          nodes.push({ person, x, y });
          personPositions.set(person.id, { x, y });
          x += NODE_WIDTH + COUPLE_SPACING;
        });
        
        currentX = x + NODE_SPACING;
      });
    });

    // ==================== STEP 6: FIX OVERLAPPING ====================
    const topDownLevels = Array.from(levelGroups.keys()).sort((a, b) => a - b);
    topDownLevels.forEach(level => {
      const nodesAtLevel = nodes.filter(n => personLevels.get(n.person.id) === level);
      nodesAtLevel.sort((a, b) => a.x - b.x);
      
      let minX = 50;
      nodesAtLevel.forEach(node => {
        if (node.x < minX) {
          node.x = minX;
          personPositions.set(node.person.id, { x: node.x, y: node.y });
        }
        minX = node.x + NODE_WIDTH + NODE_SPACING;
      });
    });

    // ==================== STEP 7: CREATE CONNECTIONS ====================
    const connections: { from: { x: number; y: number }; to: { x: number; y: number }; type: string; isMultipleSpouse?: boolean }[] = [];
    
    // Spouse connections
    const drawnSpouseConnections = new Set<string>();
    spouseMap.forEach((spouses, personId) => {
      spouses.forEach(spouseId => {
        const key = [personId, spouseId].sort().join('-');
        if (drawnSpouseConnections.has(key)) return;
        drawnSpouseConnections.add(key);
        
        const pos1 = personPositions.get(personId);
        const pos2 = personPositions.get(spouseId);
        
        if (pos1 && pos2) {
          const leftPos = pos1.x < pos2.x ? pos1 : pos2;
          const rightPos = pos1.x < pos2.x ? pos2 : pos1;
          
          connections.push({
            from: { x: leftPos.x + NODE_WIDTH, y: leftPos.y + NODE_HEIGHT / 2 },
            to: { x: rightPos.x, y: rightPos.y + NODE_HEIGHT / 2 },
            type: 'spouse',
          });
        }
      });
    });

    // Parent-child connections
    const drawnParentChildLines = new Set<string>();
    
    links.forEach(link => {
      if (link.link_type === 'parent') {
        const parentId = link.person_id_1;
        const childId = link.person_id_2;
        const lineKey = `${parentId}->${childId}`;
        
        if (drawnParentChildLines.has(lineKey)) return;
        drawnParentChildLines.add(lineKey);
        
        const parentPos = personPositions.get(parentId);
        const childPos = personPositions.get(childId);
        
        if (!parentPos || !childPos) return;
        
        // Check if other parent exists
        const otherParents = childToParents.get(childId);
        let fromX = parentPos.x + NODE_WIDTH / 2;
        
        if (otherParents && otherParents.size > 1) {
          const mySpouses = spouseMap.get(parentId) || new Set();
          
          otherParents.forEach(otherParentId => {
            if (otherParentId !== parentId && mySpouses.has(otherParentId)) {
              const otherParentPos = personPositions.get(otherParentId);
              if (otherParentPos && Math.abs(otherParentPos.y - parentPos.y) < 10) {
                const minX = Math.min(parentPos.x, otherParentPos.x);
                const maxX = Math.max(parentPos.x, otherParentPos.x) + NODE_WIDTH;
                fromX = (minX + maxX) / 2;
                drawnParentChildLines.add(`${otherParentId}->${childId}`);
              }
            }
          });
        }
        
        connections.push({
          from: { x: fromX, y: parentPos.y + NODE_HEIGHT },
          to: { x: childPos.x + NODE_WIDTH / 2, y: childPos.y },
          type: 'parent',
        });
      }
    });

    // Create debug info
    const debugInfo = {
      totalPersons: persons.length,
      totalLinks: links.length,
      parentLinks: links.filter(l => l.link_type === 'parent').length,
      spouseLinks: links.filter(l => l.link_type === 'spouse').length,
      personLevelsMap: [...personLevels.entries()].map(([id, level]) => {
        const p = personById.get(id);
        return { name: p ? `${p.first_name} ${p.last_name}` : 'UNKNOWN', level };
      }),
    };

    console.log('========== END TREE LAYOUT v7 ==========');
    return { nodes, connections, debugInfo };
  };

  const { nodes, connections, debugInfo } = buildTreeLayout();
      nodesAtLevel.forEach(node => {
        if (node.x < minX) {
          node.x = minX;
          personPositions.set(node.person.id, { x: node.x, y: node.y });
        }
        minX = node.x + NODE_WIDTH + NODE_SPACING;
      });
    });

    // ==================== STEP 7: CREATE CONNECTIONS ====================
    const connections: { from: { x: number; y: number }; to: { x: number; y: number }; type: string; isMultipleSpouse?: boolean }[] = [];
    
    // --- SPOUSE CONNECTIONS ---
    const drawnSpouseConnections = new Set<string>();
    spouseMap.forEach((spouses, personId) => {
      spouses.forEach(spouseId => {
        const key = [personId, spouseId].sort().join('-');
        if (drawnSpouseConnections.has(key)) return;
        drawnSpouseConnections.add(key);
        
        const pos1 = personPositions.get(personId);
        const pos2 = personPositions.get(spouseId);
        
        if (pos1 && pos2) {
          const leftPos = pos1.x < pos2.x ? pos1 : pos2;
          const rightPos = pos1.x < pos2.x ? pos2 : pos1;
          
          // Check if this is a multiple spouse situation
          const isMultipleSpouse = spouses.size > 1 || (spouseMap.get(spouseId)?.size || 0) > 1;
          
          connections.push({
            from: { x: leftPos.x + NODE_WIDTH, y: leftPos.y + NODE_HEIGHT / 2 },
            to: { x: rightPos.x, y: rightPos.y + NODE_HEIGHT / 2 },
            type: 'spouse',
            isMultipleSpouse,
          });
        }
      });
    });

    // --- PARENT-CHILD CONNECTIONS ---
    // Group children by their parent pairs to draw clean lines
    const drawnParentChildLines = new Set<string>();
    
    links.forEach(link => {
      if (link.link_type === 'parent') {
        const parentId = link.person_id_1;
        const childId = link.person_id_2;
        const lineKey = `${parentId}->${childId}`;
        
        if (drawnParentChildLines.has(lineKey)) return;
        drawnParentChildLines.add(lineKey);
        
        const parentPos = personPositions.get(parentId);
        const childPos = personPositions.get(childId);
        
        if (!parentPos || !childPos) return;
        
        // Find other parent of this child (if exists)
        const otherParents = childToParents.get(childId);
        let fromX = parentPos.x + NODE_WIDTH / 2;
        
        if (otherParents && otherParents.size > 1) {
          // Find if any other parent is a spouse of this parent
          const mySpouses = spouseMap.get(parentId) || new Set();
          
          otherParents.forEach(otherParentId => {
            if (otherParentId !== parentId && mySpouses.has(otherParentId)) {
              // Both parents are spouses - draw from center
              const otherParentPos = personPositions.get(otherParentId);
              if (otherParentPos && Math.abs(otherParentPos.y - parentPos.y) < 10) {
                const minX = Math.min(parentPos.x, otherParentPos.x);
                const maxX = Math.max(parentPos.x, otherParentPos.x) + NODE_WIDTH;
                fromX = (minX + maxX) / 2;
                
                // Mark the other parent's line as drawn too
                drawnParentChildLines.add(`${otherParentId}->${childId}`);
              }
            }
          });
        }
        
        connections.push({
          from: { x: fromX, y: parentPos.y + NODE_HEIGHT },
          to: { x: childPos.x + NODE_WIDTH / 2, y: childPos.y },
          type: 'parent',
        });
      }
    });

    console.log('========== END DEFINITIVE LAYOUT ==========');
    
    // Create debug info object
    const debugInfo = {
      totalPersons: persons.length,
      totalLinks: links.length,
      parentLinks: links.filter(l => l.link_type === 'parent').length,
      spouseLinks: links.filter(l => l.link_type === 'spouse').length,
      personLevelsMap: [...personLevels.entries()].map(([id, level]) => {
        const p = personById.get(id);
        return { name: p ? `${p.first_name} ${p.last_name}` : 'UNKNOWN', level };
      }),
    };
    
    return { nodes, connections, debugInfo };
  };

  const { nodes, connections, debugInfo } = buildTreeLayout();
  const svgWidth = Math.max(SCREEN_WIDTH, nodes.reduce((max, n) => Math.max(max, n.x + NODE_WIDTH + 60), 0));
  const svgHeight = Math.max(400, nodes.reduce((max, n) => Math.max(max, n.y + NODE_HEIGHT + 80), 0));
  
  // State to show/hide debug panel
  const [showDebug, setShowDebug] = useState(false);

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
        <TouchableOpacity 
          style={styles.debugButton} 
          onPress={() => setShowDebug(!showDebug)}
        >
          <Ionicons name="bug-outline" size={20} color={showDebug ? '#4CAF50' : '#6B7C93'} />
        </TouchableOpacity>
        {isPreviewMode && (
          <TouchableOpacity style={styles.convertButton} onPress={handleConvertToAccount}>
            <Ionicons name="save-outline" size={18} color="#0A1628" />
            <Text style={styles.convertButtonText}>Sauvegarder</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Debug Panel */}
      {showDebug && debugInfo && (
        <View style={styles.debugPanel}>
          <Text style={styles.debugTitle}>🔍 DEBUG - Liens et Niveaux</Text>
          <Text style={styles.debugText}>Personnes: {debugInfo.totalPersons}</Text>
          <Text style={styles.debugText}>Liens parent: {debugInfo.parentLinks}</Text>
          <Text style={styles.debugText}>Liens époux: {debugInfo.spouseLinks}</Text>
          <Text style={styles.debugSubtitle}>Niveaux calculés:</Text>
          {debugInfo.personLevelsMap.map((item, idx) => (
            <Text key={idx} style={styles.debugText}>
              • {item.name}: Niveau {item.level}
            </Text>
          ))}
          <Text style={styles.debugSubtitle}>Liens bruts:</Text>
          {links.map((link, idx) => {
            const p1 = persons.find(p => p.id === link.person_id_1);
            const p2 = persons.find(p => p.id === link.person_id_2);
            return (
              <Text key={idx} style={styles.debugText}>
                • [{link.link_type}] {p1?.first_name} → {p2?.first_name}
              </Text>
            );
          })}
        </View>
      )}

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
  debugButton: {
    padding: 8,
    borderRadius: 8,
  },
  debugPanel: {
    backgroundColor: '#1A2F4A',
    padding: 12,
    margin: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
    maxHeight: 300,
  },
  debugTitle: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  debugSubtitle: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  debugText: {
    color: '#B8C5D6',
    fontSize: 11,
    fontFamily: 'monospace',
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
