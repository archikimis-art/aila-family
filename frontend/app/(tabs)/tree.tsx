// Build: 2025010605 - WEB + NATIVE ZOOM SOLUTION
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Modal,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Line, Circle, G, Text as SvgText, Rect, Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { useAuth } from '@/context/AuthContext';
import { treeAPI, previewAPI, eventsAPI } from '@/services/api';
import api from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EventAnimation from '@/components/EventAnimation';
import AdBanner from '@/components/AdBanner';

// Import conditionnel pour le web
let TransformWrapper: any = null;
let TransformComponent: any = null;
if (Platform.OS === 'web') {
  try {
    const zoomPanPinch = require('react-zoom-pan-pinch');
    TransformWrapper = zoomPanPinch.TransformWrapper;
    TransformComponent = zoomPanPinch.TransformComponent;
  } catch (e) {
    console.log('react-zoom-pan-pinch not available');
  }
}

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

// Composant réutilisable pour le contenu SVG de l'arbre
interface TreeSvgContentProps {
  svgWidth: number;
  svgHeight: number;
  connections: any[];
  nodes: any[];
  getGenderColor: (gender: string) => string;
  handlePersonPress: (person: Person) => void;
}

const TreeSvgContent: React.FC<TreeSvgContentProps> = ({
  svgWidth,
  svgHeight,
  connections,
  nodes,
  getGenderColor,
  handlePersonPress,
}) => (
  <View style={{ width: svgWidth, height: svgHeight, position: 'relative' }}>
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
        const gradientId = node.person.gender === 'male' ? 'maleGrad' : 
                           node.person.gender === 'female' ? 'femaleGrad' : 'unknownGrad';
        const borderColor = getGenderColor(node.person.gender);
        
        return (
          <G key={`node-${node.person.id}`}>
            <Rect
              x={node.x}
              y={node.y}
              width={NODE_WIDTH}
              height={NODE_HEIGHT}
              rx={12}
              fill={`url(#${gradientId})`}
              stroke={borderColor}
              strokeWidth="2"
            />
            <SvgText
              x={node.x + NODE_WIDTH / 2}
              y={node.y + 25}
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="12"
              fontWeight="bold"
            >
              {node.person.first_name}
            </SvgText>
            <SvgText
              x={node.x + NODE_WIDTH / 2}
              y={node.y + 42}
              textAnchor="middle"
              fill="#B8C5D6"
              fontSize="10"
            >
              {node.person.last_name}
            </SvgText>
          </G>
        );
      })}
    </Svg>

    {/* Clickable overlay for person nodes */}
    {nodes.map((node) => (
      <TouchableOpacity
        key={`touch-${node.person.id}`}
        style={{
          position: 'absolute',
          left: node.x,
          top: node.y,
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
          borderRadius: 12,
        }}
        onPress={() => handlePersonPress(node.person)}
        activeOpacity={0.7}
      />
    ))}
  </View>
);

export default function TreeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, refreshUser } = useAuth();
  const isPreviewMode = params.preview === 'true';
  const inviteToken = params.invite as string | undefined;
  const sharedOwnerId = params.sharedOwnerId as string | undefined;
  const sharedOwnerName = params.sharedOwnerName as string | undefined;
  
  // Google OAuth callback params
  const googleToken = params.token as string | undefined;
  const googleAuthSuccess = params.google_auth === 'success';

  const [persons, setPersons] = useState<Person[]>([]);
  const [links, setLinks] = useState<FamilyLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [previewToken, setPreviewToken] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [sharedTreeOwner, setSharedTreeOwner] = useState<{id: string, name: string, role: string} | null>(null);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [googleAuthHandled, setGoogleAuthHandled] = useState(false);

  // Handle Google OAuth callback - CRITICAL for Google Sign-In
  useEffect(() => {
    const handleGoogleAuth = async () => {
      if (googleToken && googleAuthSuccess && !googleAuthHandled) {
        setGoogleAuthHandled(true);
        console.log('Google OAuth callback detected - processing token...');
        
        try {
          // Store the token in AsyncStorage
          await AsyncStorage.setItem('auth_token', googleToken);
          
          // Set the token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${googleToken}`;
          
          // Refresh user data to update AuthContext
          await refreshUser();
          
          console.log('Google OAuth successful - user authenticated');
          
          // Show success message
          setInviteMessage('✅ Connexion Google réussie !');
          setTimeout(() => setInviteMessage(null), 3000);
          
          // Clean URL params by navigating to clean tree page (web only)
          if (Platform.OS === 'web' && typeof window !== 'undefined') {
            // Replace URL without query params to clean up
            window.history.replaceState({}, '', '/(tabs)/tree');
          }
          
          // Reload data for the authenticated user
          loadData();
        } catch (error) {
          console.error('Error handling Google OAuth callback:', error);
          setInviteMessage('❌ Erreur lors de la connexion Google');
          setTimeout(() => setInviteMessage(null), 5000);
        }
      }
    };
    
    handleGoogleAuth();
  }, [googleToken, googleAuthSuccess, googleAuthHandled]);

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
        let token: string | null = await AsyncStorage.getItem('preview_token');
        if (!token) {
          const response = await previewAPI.createSession();
          token = response.data.session_token;
          if (token) await AsyncStorage.setItem('preview_token', token);
        }
        if (token) {
          setPreviewToken(token);
          try {
            const sessionData = await previewAPI.getSession(token);
            setPersons(sessionData.data.persons || []);
            setLinks(sessionData.data.links || []);
          } catch (e: any) {
            if (e.response?.status === 404 || e.response?.status === 410) {
              const response = await previewAPI.createSession();
              token = response.data.session_token;
              if (token) {
                await AsyncStorage.setItem('preview_token', token);
                setPreviewToken(token);
              }
              setPersons([]);
              setLinks([]);
            }
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (isPreviewMode) {
        let token: string | null = await AsyncStorage.getItem('preview_token');
        if (token) {
          const sessionData = await previewAPI.getSession(token);
          setPersons(sessionData.data.persons || []);
          setLinks(sessionData.data.links || []);
        }
      } else if (user) {
        const response = await treeAPI.getTree();
        setPersons(response.data.persons || []);
        setLinks(response.data.links || []);
      }
    } catch (error) {
      console.error('Error refreshing tree:', error);
    } finally {
      setRefreshing(false);
    }
  }, [isPreviewMode, user]);

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
      params: { 
        preview: isPreviewMode ? 'true' : 'false', 
        token: previewToken || '',
        sharedOwnerId: sharedTreeOwner?.id || '',
      },
    });
  };

  const handleAddLink = () => {
    if (persons.length < 2) {
      Alert.alert('Information', 'Ajoutez au moins 2 personnes pour créer un lien familial.');
      return;
    }
    router.push({
      pathname: '/add-link',
      params: { 
        preview: isPreviewMode ? 'true' : 'false', 
        token: previewToken || '',
        sharedOwnerId: sharedTreeOwner?.id || '',
      },
    });
  };

  // Track last tap for double-tap detection
  const lastTapRef = useRef<{ personId: string; time: number } | null>(null);
  const DOUBLE_TAP_DELAY = 300; // ms

  const handlePersonPress = (person: Person) => {
    const now = Date.now();
    const lastTap = lastTapRef.current;

    // Check if this is a double tap on the same person
    if (lastTap && lastTap.personId === person.id && (now - lastTap.time) < DOUBLE_TAP_DELAY) {
      // Double tap - open edit mode
      lastTapRef.current = null;
      setSelectedPerson(person);
      router.push({
        pathname: '/add-person',
        params: { 
          editId: person.id, 
          preview: isPreviewMode ? 'true' : 'false', 
          token: previewToken || '',
          sharedOwnerId: sharedTreeOwner?.id || '',
        },
      });
    } else {
      // Single tap - just view info (go to person detail page)
      lastTapRef.current = { personId: person.id, time: now };
      
      // Small delay to distinguish from double tap
      setTimeout(() => {
        if (lastTapRef.current && lastTapRef.current.personId === person.id && (Date.now() - lastTapRef.current.time) >= DOUBLE_TAP_DELAY) {
          setSelectedPerson(person);
          router.push({
            pathname: '/person/[id]',
            params: { 
              id: person.id, 
              preview: isPreviewMode ? 'true' : 'false', 
              token: previewToken || '',
              sharedOwnerId: sharedTreeOwner?.id || '',
            },
          });
          lastTapRef.current = null;
        }
      }, DOUBLE_TAP_DELAY);
    }
  };

  const handleConvertToAccount = async () => {
    if (previewToken) {
      await AsyncStorage.setItem('preview_token_to_convert', previewToken);
    }
    router.push('/(auth)/register');
  };

  // ============================================================================
  // DEFINITIVE TREE LAYOUT ALGORITHM v9 - CLEAN REWRITE
  // ============================================================================
  // RÈGLES FONDAMENTALES (INVIOLABLES):
  // 1. Les époux sont TOUJOURS côte à côte (jamais séparés)
  // 2. Les fratries sont triées par date de naissance (aîné à gauche)
  // 3. Les parents sont centrés au-dessus de leurs enfants
  // ============================================================================
  const buildTreeLayout = () => {
    if (persons.length === 0) return { nodes: [], connections: [], debugInfo: null };

    console.log('========== TREE LAYOUT v17 - REINGOLD-TILFORD ==========');
    
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

    // ==================== STEP 2: CALCULATE LEVELS (TOP-DOWN) ====================
    // Level 0 = roots (no parents), Level increases downward
    const personLevels = new Map<string, number>();
    
    // Find all roots (people with no parents)
    const roots: string[] = [];
    persons.forEach(p => {
      if (!childToParents.has(p.id) || childToParents.get(p.id)!.size === 0) {
        roots.push(p.id);
      }
    });
    
    // BFS to assign levels
    const queue: { id: string; level: number }[] = roots.map(id => ({ id, level: 0 }));
    const visited = new Set<string>();
    
    while (queue.length > 0) {
      const { id, level } = queue.shift()!;
      
      if (visited.has(id)) {
        // Update if we found a higher level (further from root)
        if (level > (personLevels.get(id) || 0)) {
          personLevels.set(id, level);
        }
        continue;
      }
      
      visited.add(id);
      personLevels.set(id, level);
      
      // Add children at next level
      const children = parentToChildren.get(id);
      if (children) {
        children.forEach(childId => {
          queue.push({ id: childId, level: level + 1 });
        });
      }
    }
    
    // Handle orphaned nodes (not connected to any root)
    persons.forEach(p => {
      if (!personLevels.has(p.id)) {
        personLevels.set(p.id, 0);
      }
    });

    // ==================== STEP 3: SYNCHRONIZE SPOUSE LEVELS ====================
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
          
          if (personLevel !== spouseLevel) {
            const targetLevel = Math.max(personLevel, spouseLevel);
            personLevels.set(personId, targetLevel);
            personLevels.set(spouseId, targetLevel);
            changed = true;
          }
        });
      });
      
      // Recalculate children levels after spouse sync
      if (changed) {
        persons.forEach(p => {
          const parents = childToParents.get(p.id);
          if (parents && parents.size > 0) {
            let maxParentLevel = -1;
            parents.forEach(parentId => {
              maxParentLevel = Math.max(maxParentLevel, personLevels.get(parentId) || 0);
            });
            const newLevel = maxParentLevel + 1;
            if ((personLevels.get(p.id) || 0) < newLevel) {
              personLevels.set(p.id, newLevel);
            }
          }
        });
      }
    }

    console.log('Levels after sync:', [...personLevels.entries()].map(([id, level]) => {
      const p = personById.get(id);
      return `${p?.first_name}: ${level}`;
    }));

    // ==================== STEP 4: GROUP BY LEVEL ====================
    const levelGroups = new Map<number, Person[]>();
    persons.forEach(p => {
      const level = personLevels.get(p.id) || 0;
      if (!levelGroups.has(level)) levelGroups.set(level, []);
      levelGroups.get(level)!.push(p);
    });

    // ==================== STEP 4.5: SORT SIBLINGS BY BIRTH DATE ====================
    // Trier automatiquement les fratries par date de naissance (du plus âgé au plus jeune)
    // Les membres sans date de naissance sont placés à la fin
    
    const parseBirthDate = (dateStr?: string): Date | null => {
      if (!dateStr) return null;
      // Handle various date formats: YYYY-MM-DD, DD/MM/YYYY, etc.
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) return date;
      // Try DD/MM/YYYY format
      const parts = dateStr.split(/[\/\-\.]/);
      if (parts.length === 3) {
        // Try YYYY-MM-DD
        if (parts[0].length === 4) {
          return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        }
        // Try DD/MM/YYYY or DD-MM-YYYY
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
      return null;
    };

    const sortSiblingsByBirthDate = (siblingIds: string[]): string[] => {
      return [...siblingIds].sort((aId, bId) => {
        const personA = personById.get(aId);
        const personB = personById.get(bId);
        const dateA = parseBirthDate(personA?.birth_date);
        const dateB = parseBirthDate(personB?.birth_date);
        
        // Both have dates - sort oldest first (earliest date first)
        if (dateA && dateB) {
          return dateA.getTime() - dateB.getTime();
        }
        // Only A has date - A comes first
        if (dateA && !dateB) return -1;
        // Only B has date - B comes first
        if (!dateA && dateB) return 1;
        // Neither has date - keep original order
        return 0;
      });
    };

    // Sort children for each parent by birth date
    parentToChildren.forEach((childrenSet, parentId) => {
      const sortedChildren = sortSiblingsByBirthDate(Array.from(childrenSet));
      parentToChildren.set(parentId, new Set(sortedChildren));
    });

    // Also sort persons within each level group based on sibling order
    levelGroups.forEach((personsAtLevel, level) => {
      // Group persons by their common parents (siblings)
      const siblingGroups = new Map<string, Person[]>();
      const noParentGroup: Person[] = [];
      
      personsAtLevel.forEach(person => {
        const parents = childToParents.get(person.id);
        if (parents && parents.size > 0) {
          // Create a key from sorted parent IDs
          const parentKey = Array.from(parents).sort().join(',');
          if (!siblingGroups.has(parentKey)) {
            siblingGroups.set(parentKey, []);
          }
          siblingGroups.get(parentKey)!.push(person);
        } else {
          noParentGroup.push(person);
        }
      });
      
      // Sort each sibling group by birth date
      siblingGroups.forEach((siblings, key) => {
        siblings.sort((a, b) => {
          const dateA = parseBirthDate(a.birth_date);
          const dateB = parseBirthDate(b.birth_date);
          if (dateA && dateB) return dateA.getTime() - dateB.getTime();
          if (dateA && !dateB) return -1;
          if (!dateA && dateB) return 1;
          return 0;
        });
      });
      
      // Rebuild the level group with sorted siblings
      const sortedPersons: Person[] = [];
      siblingGroups.forEach(siblings => {
        sortedPersons.push(...siblings);
      });
      sortedPersons.push(...noParentGroup);
      
      levelGroups.set(level, sortedPersons);
    });

    console.log('Siblings sorted by birth date');

    // ==================== STEP 5: BUILD AND SORT FAMILY UNITS ====================
    // RÈGLE ABSOLUE: Les époux ne sont JAMAIS séparés
    // RÈGLE ABSOLUE: Les fratries sont triées par date de naissance (aîné à gauche)
    
    // Identifier qui est un "enfant" (a des parents dans l'arbre) vs "conjoint qui a épousé"
    const getChildrenAtLevel = (level: number): Set<string> => {
      const children = new Set<string>();
      const personsAtLevel = levelGroups.get(level) || [];
      
      personsAtLevel.forEach(person => {
        const parents = childToParents.get(person.id);
        if (parents && parents.size > 0) {
          children.add(person.id);
        }
      });
      
      return children;
    };
    
    const buildFamilyUnits = (personsAtLevel: Person[]): Person[][] => {
      console.log('=== BUILD FAMILY UNITS ===');
      console.log('Input:', personsAtLevel.map(p => p.first_name).join(', '));
      
      // ÉTAPE 1: Construire le graphe des époux pour CE niveau
      const spouseGraphAtLevel = new Map<string, Set<string>>();
      
      personsAtLevel.forEach(person => {
        const globalSpouses = spouseMap.get(person.id);
        if (globalSpouses) {
          globalSpouses.forEach(spouseId => {
            if (personsAtLevel.find(p => p.id === spouseId)) {
              if (!spouseGraphAtLevel.has(person.id)) {
                spouseGraphAtLevel.set(person.id, new Set());
              }
              spouseGraphAtLevel.get(person.id)!.add(spouseId);
              
              // Bidirectionnel
              if (!spouseGraphAtLevel.has(spouseId)) {
                spouseGraphAtLevel.set(spouseId, new Set());
              }
              spouseGraphAtLevel.get(spouseId)!.add(person.id);
            }
          });
        }
      });
      
      // Log des couples trouvés
      const loggedPairs = new Set<string>();
      spouseGraphAtLevel.forEach((spouses, personId) => {
        spouses.forEach(spouseId => {
          const pairKey = [personId, spouseId].sort().join('-');
          if (!loggedPairs.has(pairKey)) {
            loggedPairs.add(pairKey);
            const p1 = personById.get(personId);
            const p2 = personById.get(spouseId);
            console.log(`  COUPLE: ${p1?.first_name} <-> ${p2?.first_name}`);
          }
        });
      });
      
      // ÉTAPE 2: Union-Find pour grouper les époux
      const parent = new Map<string, string>();
      personsAtLevel.forEach(p => parent.set(p.id, p.id));
      
      const find = (id: string): string => {
        if (parent.get(id) !== id) {
          parent.set(id, find(parent.get(id)!));
        }
        return parent.get(id)!;
      };
      
      const union = (id1: string, id2: string) => {
        const root1 = find(id1);
        const root2 = find(id2);
        if (root1 !== root2) {
          parent.set(root2, root1);
        }
      };
      
      // Unir tous les époux
      spouseGraphAtLevel.forEach((spouses, personId) => {
        spouses.forEach(spouseId => {
          union(personId, spouseId);
        });
      });
      
      // ÉTAPE 3: Grouper par composante connexe
      const componentGroups = new Map<string, Person[]>();
      personsAtLevel.forEach(person => {
        const root = find(person.id);
        if (!componentGroups.has(root)) {
          componentGroups.set(root, []);
        }
        componentGroups.get(root)!.push(person);
      });
      
      // Convertir en tableau d'unités
      const familyUnits: Person[][] = Array.from(componentGroups.values());
      
      console.log('Units created:', familyUnits.map(u => `[${u.map(p => p.first_name).join('+')}]`).join(' | '));
      
      return familyUnits;
    };
    
    // Fonction de tri des unités par date de naissance
    const sortFamilyUnitsByBirthDate = (units: Person[][], level: number): Person[][] => {
      console.log('=== SORT FAMILY UNITS ===');
      
      // Identifier les "vrais enfants" (qui ont des parents) vs "conjoints mariés"
      const childrenAtLevel = getChildrenAtLevel(level);
      
      console.log('Children at this level:', Array.from(childrenAtLevel).map(id => personById.get(id)?.first_name).join(', '));
      
      // Pour chaque unité, trouver la date de naissance du MEMBRE DE LA FRATRIE (pas le conjoint)
      const getUnitSortKey = (unit: Person[]): { birthDate: Date | null; siblingName: string } => {
        let birthDate: Date | null = null;
        let siblingName = '';
        
        // Chercher le membre de la fratrie dans l'unité (celui qui a des parents)
        for (const person of unit) {
          if (childrenAtLevel.has(person.id)) {
            const date = parseBirthDate(person.birth_date);
            siblingName = person.first_name;
            birthDate = date;
            console.log(`  Unit [${unit.map(p => p.first_name).join('+')}]: sibling=${siblingName}, birthDate=${person.birth_date}`);
            break; // On prend le premier membre de la fratrie trouvé
          }
        }
        
        // Si aucun membre de la fratrie, utiliser le premier de l'unité
        if (!siblingName && unit.length > 0) {
          birthDate = parseBirthDate(unit[0].birth_date);
          siblingName = unit[0].first_name;
        }
        
        return { birthDate, siblingName };
      };
      
      // Trier les unités par date de naissance (aîné en premier = plus petite date)
      const sortedUnits = [...units].sort((unitA, unitB) => {
        const keyA = getUnitSortKey(unitA);
        const keyB = getUnitSortKey(unitB);
        
        if (keyA.birthDate && keyB.birthDate) {
          return keyA.birthDate.getTime() - keyB.birthDate.getTime();
        }
        if (keyA.birthDate && !keyB.birthDate) return -1;
        if (!keyA.birthDate && keyB.birthDate) return 1;
        // Si pas de date, tri alphabétique
        return keyA.siblingName.localeCompare(keyB.siblingName);
      });
      
      console.log('Sorted order:', sortedUnits.map(u => {
        const key = getUnitSortKey(u);
        return `[${u.map(p => p.first_name).join('+')}] (${key.siblingName})`;
      }).join(' -> '));
      
      return sortedUnits;
    };

    // Helper pour obtenir le niveau actuel
    const getLevelForPerson = (personId: string): number => {
      return personLevels.get(personId) || 0;
    };

    // Helper to get all parent IDs at a given level
    const getParentIdsForLevel = (level: number): string[] => {
      const parentIds: string[] = [];
      const personsAtLevel = levelGroups.get(level) || [];
      
      personsAtLevel.forEach(person => {
        const parents = childToParents.get(person.id);
        if (parents) {
          parents.forEach(parentId => {
            if (!parentIds.includes(parentId)) {
              parentIds.push(parentId);
            }
          });
        }
      });
      
      return parentIds;
    };

    // ==================== STEP 6: REINGOLD-TILFORD INSPIRED LAYOUT v17 ====================
    // Algorithme professionnel basé sur Reingold-Tilford:
    // 1. Calculer la largeur de chaque sous-arbre (bottom-up)
    // 2. Positionner en assignant un espace proportionnel à chaque sous-arbre (top-down)
    // 3. Chaque parent est TOUJOURS centré au-dessus de ses enfants
    
    const personPositions = new Map<string, { x: number; y: number }>();
    const nodes: { person: Person; x: number; y: number }[] = [];
    
    console.log('=== REINGOLD-TILFORD INSPIRED v17 ===');
    
    // Step 1: Calculate subtree width for each person (bottom-up)
    // Width = max(own width with spouse, sum of children's subtree widths)
    const subtreeWidths = new Map<string, number>();
    const processedForWidth = new Set<string>();
    
    const calculateSubtreeWidth = (personId: string): number => {
      if (subtreeWidths.has(personId)) return subtreeWidths.get(personId)!;
      if (processedForWidth.has(personId)) return NODE_WIDTH;
      processedForWidth.add(personId);
      
      const person = personById.get(personId);
      if (!person) return NODE_WIDTH;
      
      // Get this person's spouse(s) at the same level
      const personLevel = personLevels.get(personId) || 0;
      const spouses = spouseMap.get(personId);
      let unitMembers = [personId];
      
      if (spouses) {
        spouses.forEach(sId => {
          if ((personLevels.get(sId) || 0) === personLevel && !unitMembers.includes(sId)) {
            unitMembers.push(sId);
          }
        });
      }
      
      // Calculate own unit width
      const ownWidth = unitMembers.length * NODE_WIDTH + (unitMembers.length - 1) * COUPLE_SPACING;
      
      // Get all children
      const allChildren = new Set<string>();
      unitMembers.forEach(memberId => {
        const children = parentToChildren.get(memberId);
        if (children) children.forEach(cId => allChildren.add(cId));
      });
      
      if (allChildren.size === 0) {
        subtreeWidths.set(personId, ownWidth);
        return ownWidth;
      }
      
      // Calculate children's total width
      // Group children into units (with their spouses)
      const childrenArray = Array.from(allChildren);
      const processedChildren = new Set<string>();
      let totalChildrenWidth = 0;
      
      // Sort children by birth date
      childrenArray.sort((aId, bId) => {
        const a = personById.get(aId);
        const b = personById.get(bId);
        const dateA = a?.birth_date ? new Date(a.birth_date).getTime() : Infinity;
        const dateB = b?.birth_date ? new Date(b.birth_date).getTime() : Infinity;
        return dateA - dateB;
      });
      
      let childUnitCount = 0;
      childrenArray.forEach(childId => {
        if (processedChildren.has(childId)) return;
        
        // Get child's unit (child + their spouse)
        const childSubtreeWidth = calculateSubtreeWidth(childId);
        totalChildrenWidth += childSubtreeWidth;
        childUnitCount++;
        
        // Mark child and their spouse as processed
        processedChildren.add(childId);
        const childSpouses = spouseMap.get(childId);
        if (childSpouses) {
          childSpouses.forEach(csId => processedChildren.add(csId));
        }
      });
      
      // Add spacing between child units
      if (childUnitCount > 1) {
        totalChildrenWidth += (childUnitCount - 1) * NODE_SPACING;
      }
      
      const subtreeWidth = Math.max(ownWidth, totalChildrenWidth);
      subtreeWidths.set(personId, subtreeWidth);
      
      // Store same width for spouse(s)
      unitMembers.forEach(memberId => {
        subtreeWidths.set(memberId, subtreeWidth);
      });
      
      return subtreeWidth;
    };
    
    // Calculate widths for all root persons
    persons.forEach(p => {
      const parents = childToParents.get(p.id);
      if (!parents || parents.size === 0) {
        calculateSubtreeWidth(p.id);
      }
    });
    
    // Also calculate for any remaining persons
    persons.forEach(p => calculateSubtreeWidth(p.id));
    
    console.log('Subtree widths calculated');
    
    // Step 2: Position recursively (top-down)
    const positionedPersons = new Set<string>();
    
    const positionSubtree = (personId: string, startX: number, level: number) => {
      if (positionedPersons.has(personId)) return;
      
      const person = personById.get(personId);
      if (!person) return;
      
      const y = level * LEVEL_HEIGHT + 80;
      const personLevel = personLevels.get(personId) || 0;
      
      // Get unit members (person + spouse at same level)
      const spouses = spouseMap.get(personId);
      let unitMembers = [person];
      
      if (spouses) {
        spouses.forEach(sId => {
          const spouse = personById.get(sId);
          if (spouse && (personLevels.get(sId) || 0) === personLevel && !positionedPersons.has(sId)) {
            unitMembers.push(spouse);
          }
        });
      }
      
      // Get subtree width and unit width
      const subtreeWidth = subtreeWidths.get(personId) || NODE_WIDTH;
      const unitWidth = unitMembers.length * NODE_WIDTH + (unitMembers.length - 1) * COUPLE_SPACING;
      
      // Center unit within its subtree space
      const unitStartX = startX + (subtreeWidth - unitWidth) / 2;
      
      // Position unit members
      let x = unitStartX;
      unitMembers.forEach(member => {
        personPositions.set(member.id, { x, y });
        positionedPersons.add(member.id);
        x += NODE_WIDTH + COUPLE_SPACING;
      });
      
      // Get all children
      const allChildren = new Set<string>();
      unitMembers.forEach(member => {
        const children = parentToChildren.get(member.id);
        if (children) children.forEach(cId => allChildren.add(cId));
      });
      
      if (allChildren.size === 0) return;
      
      // Sort and group children
      const childrenArray = Array.from(allChildren);
      childrenArray.sort((aId, bId) => {
        const a = personById.get(aId);
        const b = personById.get(bId);
        const dateA = a?.birth_date ? new Date(a.birth_date).getTime() : Infinity;
        const dateB = b?.birth_date ? new Date(b.birth_date).getTime() : Infinity;
        return dateA - dateB;
      });
      
      // Position children
      let childX = startX;
      const processedChildren = new Set<string>();
      
      childrenArray.forEach(childId => {
        if (processedChildren.has(childId)) return;
        
        const childSubtreeWidth = subtreeWidths.get(childId) || NODE_WIDTH;
        const childLevel = personLevels.get(childId) || (level + 1);
        
        positionSubtree(childId, childX, childLevel);
        
        // Mark child and spouse as processed
        processedChildren.add(childId);
        const childSpouses = spouseMap.get(childId);
        if (childSpouses) {
          childSpouses.forEach(csId => processedChildren.add(csId));
        }
        
        childX += childSubtreeWidth + NODE_SPACING;
      });
    };
    
    // Find and position all root persons (those without parents)
    const rootPersons: Person[] = [];
    persons.forEach(person => {
      const parents = childToParents.get(person.id);
      if (!parents || parents.size === 0) {
        rootPersons.push(person);
      }
    });
    
    // Sort roots by level, then by birth date
    rootPersons.sort((a, b) => {
      const levelA = personLevels.get(a.id) || 0;
      const levelB = personLevels.get(b.id) || 0;
      if (levelA !== levelB) return levelA - levelB;
      const dateA = a.birth_date ? new Date(a.birth_date).getTime() : Infinity;
      const dateB = b.birth_date ? new Date(b.birth_date).getTime() : Infinity;
      return dateA - dateB;
    });
    
    // Group roots by level
    const rootsByLevel = new Map<number, Person[]>();
    rootPersons.forEach(p => {
      const level = personLevels.get(p.id) || 0;
      if (!rootsByLevel.has(level)) rootsByLevel.set(level, []);
      rootsByLevel.get(level)!.push(p);
    });
    
    // Position each root family tree
    let currentX = 50;
    const processedRoots = new Set<string>();
    
    // Process level 0 roots first
    const sortedRootLevels = Array.from(rootsByLevel.keys()).sort((a, b) => a - b);
    
    sortedRootLevels.forEach(level => {
      const roots = rootsByLevel.get(level) || [];
      
      roots.forEach(root => {
        if (processedRoots.has(root.id)) return;
        
        // Check if this root's spouse is also a root
        const spouses = spouseMap.get(root.id);
        if (spouses) {
          spouses.forEach(sId => processedRoots.add(sId));
        }
        processedRoots.add(root.id);
        
        const subtreeWidth = subtreeWidths.get(root.id) || NODE_WIDTH;
        positionSubtree(root.id, currentX, level);
        currentX += subtreeWidth + NODE_SPACING * 2;
      });
    });
    
    // Position any remaining unpositioned persons
    persons.forEach(person => {
      if (!positionedPersons.has(person.id)) {
        const level = personLevels.get(person.id) || 0;
        const y = level * LEVEL_HEIGHT + 80;
        personPositions.set(person.id, { x: currentX, y });
        positionedPersons.add(person.id);
        currentX += NODE_WIDTH + NODE_SPACING;
      }
    });

    // Build final nodes array
    persons.forEach(person => {
      const pos = personPositions.get(person.id);
      if (pos) {
        nodes.push({ person, x: pos.x, y: pos.y });
      }
    });

    // ==================== STEP 10: CREATE CONNECTIONS ====================
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
        
        // Check if other parent exists (couple)
        const otherParents = childToParents.get(childId);
        let fromX = parentPos.x + NODE_WIDTH / 2;
        
        if (otherParents && otherParents.size > 1) {
          const mySpouses = spouseMap.get(parentId) || new Set();
          
          otherParents.forEach(otherParentId => {
            if (otherParentId !== parentId && mySpouses.has(otherParentId)) {
              const otherParentPos = personPositions.get(otherParentId);
              if (otherParentPos && Math.abs(otherParentPos.y - parentPos.y) < 10) {
                // Draw from center between the two parents
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

    console.log('========== END TREE LAYOUT v17 ==========');
    return { nodes, connections, debugInfo };
  };

  const { nodes: rawNodes, connections: rawConnections, debugInfo } = buildTreeLayout();
  
  // NORMALISER les positions pour que l'arbre commence toujours en haut-gauche
  const minY = rawNodes.length > 0 ? Math.min(...rawNodes.map(n => n.y)) : 0;
  const minX = rawNodes.length > 0 ? Math.min(...rawNodes.map(n => n.x)) : 0;
  
  const offsetX = -minX + 20;
  const offsetY = -minY + 20;
  
  // Décaler tous les nodes
  const nodes = rawNodes.map(n => ({
    ...n,
    x: n.x + offsetX,
    y: n.y + offsetY
  }));
  
  // Décaler toutes les connexions
  const connections = rawConnections.map(c => ({
    ...c,
    from: { x: c.from.x + offsetX, y: c.from.y + offsetY },
    to: { x: c.to.x + offsetX, y: c.to.y + offsetY }
  }));
  
  // Recalculer les dimensions du SVG après normalisation
  const svgWidth = Math.max(SCREEN_WIDTH, nodes.reduce((max, n) => Math.max(max, n.x + NODE_WIDTH + 60), 0));
  const svgHeight = Math.max(400, nodes.reduce((max, n) => Math.max(max, n.y + NODE_HEIGHT + 80), 0));
  
  console.log(`[SVG] Normalized: offset(${offsetX}, ${offsetY}), size: ${svgWidth}x${svgHeight}, nodes: ${nodes.length}`);
  
  // State to show/hide debug panel
  const [showDebug, setShowDebug] = useState(false);
  
  // State to show/hide user guide
  const [showGuide, setShowGuide] = useState(false);

  // ============================================================================
  // PROFESSIONAL PRINT FUNCTION
  // ============================================================================
  const handlePrintTree = useCallback(() => {
    if (Platform.OS !== 'web') {
      Alert.alert('Information', 'L\'impression est disponible sur la version web.');
      return;
    }

    // Generate SVG content with light theme for printing
    const generatePrintSVG = () => {
      let svgContent = '';
      
      // Draw connections first (behind nodes)
      connections.forEach((conn, idx) => {
        if (conn.type === 'spouse') {
          // Spouse connection - golden dashed line
          svgContent += `<line x1="${conn.from.x}" y1="${conn.from.y}" x2="${conn.to.x}" y2="${conn.to.y}" stroke="#8B4513" stroke-width="3" stroke-dasharray="8,4"/>`;
        } else {
          // Parent-child connection - dark solid line with elbow
          const midY = conn.from.y + 30;
          svgContent += `
            <path d="M${conn.from.x},${conn.from.y} L${conn.from.x},${midY} L${conn.to.x},${midY} L${conn.to.x},${conn.to.y}" 
                  fill="none" stroke="#333" stroke-width="2"/>
          `;
        }
      });
      
      // Draw nodes
      nodes.forEach((node) => {
        const p = node.person;
        // Light colors for print
        const fillColor = p.gender === 'male' ? '#BBDEFB' : p.gender === 'female' ? '#F8BBD9' : '#E0E0E0';
        const borderColor = p.gender === 'male' ? '#1565C0' : p.gender === 'female' ? '#AD1457' : '#616161';
        const textColor = p.gender === 'male' ? '#0D47A1' : p.gender === 'female' ? '#880E4F' : '#212121';
        
        const birthYear = p.birth_date ? p.birth_date.substring(0, 4) : '';
        const deathYear = p.death_date ? p.death_date.substring(0, 4) : '';
        const years = birthYear ? (deathYear ? `${birthYear}-${deathYear}` : `*${birthYear}`) : '';
        
        svgContent += `
          <g>
            <rect x="${node.x}" y="${node.y}" width="${NODE_WIDTH}" height="${NODE_HEIGHT}" 
                  rx="10" fill="${fillColor}" stroke="${borderColor}" stroke-width="2.5"/>
            <text x="${node.x + NODE_WIDTH/2}" y="${node.y + 28}" text-anchor="middle" 
                  fill="${textColor}" font-size="14" font-weight="bold" font-family="Arial, sans-serif">${p.first_name || ''}</text>
            <text x="${node.x + NODE_WIDTH/2}" y="${node.y + 45}" text-anchor="middle" 
                  fill="#333" font-size="12" font-family="Arial, sans-serif">${p.last_name || ''}</text>
            ${years ? `<text x="${node.x + NODE_WIDTH/2}" y="${node.y + 60}" text-anchor="middle" 
                  fill="#666" font-size="10" font-family="Arial, sans-serif">${years}</text>` : ''}
          </g>
        `;
      });
      
      return svgContent;
    };

    const today = new Date().toLocaleDateString('fr-FR');
    const familyName = user?.last_name || 'Ma Famille';
    const printSvgContent = generatePrintSVG();
    
    // Calculate exact print dimensions - tight fit
    const printWidth = svgWidth + 20;
    const printHeight = svgHeight + 20;

    const printHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Arbre Généalogique - ${familyName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    @page { 
      size: landscape; 
      margin: 8mm; 
    }
    
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: white;
    }
    
    .print-container {
      background: white;
    }
    
    /* Header - Light theme for printing */
    .header {
      background: white;
      padding: 15px 20px;
      text-align: center;
      border-bottom: 3px solid #1565C0;
    }
    
    .header h1 {
      font-size: 22px;
      color: #1565C0;
      margin-bottom: 3px;
    }
    
    .header .subtitle {
      font-size: 16px;
      color: #333;
      font-weight: 600;
    }
    
    .header .date {
      font-size: 11px;
      color: #666;
      margin-top: 5px;
    }
    
    /* Controls - hidden on print */
    .controls {
      background: #f0f0f0;
      padding: 12px 15px;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      border-bottom: 1px solid #ddd;
    }
    
    .controls button {
      padding: 8px 16px;
      font-size: 13px;
      border: 1px solid #333;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s;
    }
    
    .controls button:hover {
      background: #333;
      color: white;
    }
    
    .controls button.primary {
      background: #1565C0;
      border-color: #1565C0;
      color: white;
      font-weight: bold;
      padding: 10px 25px;
    }
    
    .controls button.primary:hover {
      background: #0D47A1;
    }
    
    .zoom-info {
      font-weight: bold;
      min-width: 55px;
      text-align: center;
      font-size: 14px;
      color: #333;
    }
    
    /* Tree area */
    .tree-wrapper {
      padding: 10px;
      background: white;
      text-align: center;
    }
    
    .tree-svg {
      display: inline-block;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      background: white;
    }
    
    /* Legend - compact */
    .legend {
      display: flex;
      justify-content: center;
      gap: 25px;
      padding: 10px 15px;
      background: #f8f8f8;
      border-top: 1px solid #e0e0e0;
      flex-wrap: wrap;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #333;
    }
    
    .legend-box {
      width: 20px;
      height: 14px;
      border-radius: 3px;
      border: 2px solid;
    }
    
    .legend-line {
      width: 25px;
      height: 2px;
    }
    
    /* Stats */
    .stats {
      text-align: center;
      padding: 8px;
      background: white;
      color: #555;
      font-size: 12px;
      border-top: 1px solid #eee;
    }
    
    /* Footer */
    .footer {
      text-align: center;
      padding: 8px;
      color: #999;
      font-size: 10px;
      background: white;
    }
    
    /* Print styles - CLEAN OUTPUT */
    @media print {
      body { background: white !important; }
      .controls { display: none !important; }
      .print-container { box-shadow: none; }
      .tree-wrapper { padding: 5px; }
      .tree-svg { border: none; }
      .header { 
        padding: 10px;
        border-bottom-width: 2px;
      }
      .legend { padding: 8px; }
      .stats { padding: 5px; }
      .footer { display: none; }
    }
  </style>
</head>
<body>
  <div class="print-container">
    <div class="header">
      <h1>🌳 Arbre Généalogique</h1>
      <div class="subtitle">Famille ${familyName}</div>
      <div class="date">Exporté le ${today} • AÏLA</div>
    </div>
    
    <div class="controls">
      <button onclick="zoomOut()">➖</button>
      <span class="zoom-info" id="zoomLevel">100%</span>
      <button onclick="zoomIn()">➕</button>
      <button onclick="fitToPage()">📐 Ajuster</button>
      <button onclick="resetZoom()">🔄 Reset</button>
      <button class="primary" onclick="window.print()">🖨️ IMPRIMER</button>
    </div>
    
    <div class="tree-wrapper">
      <svg id="treeSvg" class="tree-svg" 
           width="${printWidth}" height="${printHeight}" 
           viewBox="0 0 ${printWidth} ${printHeight}">
        <rect width="100%" height="100%" fill="white"/>
        <g transform="translate(10, 10)">
          ${printSvgContent}
        </g>
      </svg>
    </div>
    
    <div class="legend">
      <div class="legend-item">
        <div class="legend-box" style="background: #BBDEFB; border-color: #1565C0;"></div>
        <span>Homme</span>
      </div>
      <div class="legend-item">
        <div class="legend-box" style="background: #F8BBD9; border-color: #AD1457;"></div>
        <span>Femme</span>
      </div>
      <div class="legend-item">
        <div class="legend-line" style="background: #8B4513; border-top: 2px dashed #8B4513; height: 0;"></div>
        <span>Couple</span>
      </div>
      <div class="legend-item">
        <div class="legend-line" style="background: #333;"></div>
        <span>Filiation</span>
      </div>
    </div>
    
    <div class="stats">
      ${nodes.length} personnes • ${connections.filter(c => c.type === 'parent').length} liens de filiation • ${connections.filter(c => c.type === 'spouse').length} couples
    </div>
    
    <div class="footer">
      www.aila.family - L'application de généalogie familiale
    </div>
  </div>
  
  <script>
    let zoom = 1;
    const svg = document.getElementById('treeSvg');
    const zoomDisplay = document.getElementById('zoomLevel');
    const baseWidth = ${printWidth};
    const baseHeight = ${printHeight};
    
    function updateZoom() {
      svg.style.width = (baseWidth * zoom) + 'px';
      svg.style.height = (baseHeight * zoom) + 'px';
      zoomDisplay.textContent = Math.round(zoom * 100) + '%';
    }
    
    function zoomIn() { zoom = Math.min(zoom + 0.15, 2.5); updateZoom(); }
    function zoomOut() { zoom = Math.max(zoom - 0.15, 0.3); updateZoom(); }
    function resetZoom() { zoom = 1; updateZoom(); }
    
    function fitToPage() {
      const availableWidth = window.innerWidth - 60;
      const availableHeight = window.innerHeight - 250;
      zoom = Math.min(availableWidth / baseWidth, availableHeight / baseHeight, 1.2);
      zoom = Math.max(zoom, 0.3);
      updateZoom();
    }
    
    // Auto-fit on load
    fitToPage();
  </script>
</body>
</html>`;

    // Open print window
    const printWindow = window.open('', '_blank', 'width=1200,height=800');
    if (printWindow) {
      printWindow.document.write(printHTML);
      printWindow.document.close();
    } else {
      window.alert('Veuillez autoriser les popups pour imprimer votre arbre.');
    }
  }, [nodes, connections, svgWidth, svgHeight, user]);

  // ============================================================================
  // EVENTS STATE
  // ============================================================================
  const [showEventsPanel, setShowEventsPanel] = useState(false);
  const [showEventAnimation, setShowEventAnimation] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<any[]>([]);
  const [todaysEvents, setTodaysEvents] = useState<any[]>([]);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [newEventType, setNewEventType] = useState('custom');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [sendByEmail, setSendByEmail] = useState(true);
  const [sendInApp, setSendInApp] = useState(true);
  const [sharedTrees, setSharedTrees] = useState<any[]>([]);
  const [showSharedTrees, setShowSharedTrees] = useState(false);

  // Load events and collaborators on mount (only for authenticated users)
  useEffect(() => {
    if (user && !isPreviewMode) {
      loadEvents();
      loadCollaborators();
    }
  }, [user, isPreviewMode]);

  const loadCollaborators = async () => {
    try {
      const response = await api.get('/collaborators');
      setCollaborators(response.data || []);
    } catch (error) {
      console.log('Collaborators not loaded');
    }
  };

  // Load shared trees (trees shared with the current user)
  const loadSharedTrees = async () => {
    try {
      const response = await api.get('/collaborators/shared-with-me');
      setSharedTrees(response.data || []);
      console.log('Shared trees loaded:', response.data?.length || 0);
    } catch (error) {
      console.log('Shared trees not loaded:', error);
    }
  };

  // Load shared trees on mount
  useEffect(() => {
    if (user && !isPreviewMode) {
      loadSharedTrees();
    }
  }, [user, isPreviewMode]);

  const loadEvents = async () => {
    try {
      console.log('Loading events...');
      const [birthdaysRes, todayRes] = await Promise.all([
        eventsAPI.getUpcomingBirthdays(),
        eventsAPI.getTodaysEvents()
      ]);
      console.log('Birthdays response:', birthdaysRes.data);
      console.log('Today events response:', todayRes.data);
      
      setUpcomingBirthdays(birthdaysRes.data || []);
      setTodaysEvents(todayRes.data?.events || []);
      
      // Show animation for today's events (birthdays today)
      if (todayRes.data?.has_events && todayRes.data.events.length > 0) {
        console.log('Showing today event animation');
        const firstEvent = todayRes.data.events[0];
        setCurrentEvent(firstEvent);
        setShowEventAnimation(true);
      } 
      // Show popup alert for upcoming birthdays (next 7 days, but not today)
      else if (birthdaysRes.data && birthdaysRes.data.length > 0) {
        console.log('Checking upcoming birthdays:', birthdaysRes.data);
        const upcomingInWeek = birthdaysRes.data.filter((b: any) => b.days_until > 0 && b.days_until <= 7);
        console.log('Upcoming in week:', upcomingInWeek);
        if (upcomingInWeek.length > 0) {
          const nextBirthday = upcomingInWeek[0];
          const message = upcomingInWeek.length === 1
            ? `🎂 Anniversaire de ${nextBirthday.person_name} dans ${nextBirthday.days_until} jour${nextBirthday.days_until > 1 ? 's' : ''} !`
            : `🎂 ${upcomingInWeek.length} anniversaires cette semaine ! Prochain: ${nextBirthday.person_name} dans ${nextBirthday.days_until} jour${nextBirthday.days_until > 1 ? 's' : ''}`;
          
          console.log('Showing birthday popup:', message);
          if (Platform.OS === 'web') {
            // Use a timeout to not block the UI
            setTimeout(() => {
              window.alert(message);
            }, 1500);
          } else {
            Alert.alert('🎂 Anniversaire à venir', message);
          }
        }
      }
    } catch (error) {
      console.log('Events not loaded:', error);
    }
  };

  const toggleRecipient = (email: string) => {
    setSelectedRecipients(prev => 
      prev.includes(email) 
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  const selectAllRecipients = () => {
    const allEmails = collaborators.filter(c => c.status === 'accepted').map(c => c.email);
    setSelectedRecipients(allEmails);
  };

  const handleCreateEvent = async () => {
    if (!newEventTitle.trim()) return;
    
    try {
      await eventsAPI.createEvent({
        event_type: newEventType,
        title: newEventTitle,
        description: newEventDescription,
        event_date: new Date().toISOString(),
        recipients: selectedRecipients,
        send_email: sendByEmail,
      });
      
      // Reset form
      setNewEventTitle('');
      setNewEventDescription('');
      setSelectedRecipients([]);
      setShowCreateEvent(false);
      loadEvents();
      
      // Show success animation
      setCurrentEvent({
        type: newEventType,
        title: `✅ Événement créé et envoyé!`,
        subtitle: sendByEmail && selectedRecipients.length > 0 
          ? `Email envoyé à ${selectedRecipients.length} personne(s)` 
          : 'Événement enregistré'
      });
      setShowEventsPanel(false);
      setShowEventAnimation(true);
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  // ============================================================================
  // ZOOM & PAN - WEB SOLUTION avec react-zoom-pan-pinch
  // ============================================================================
  const transformRef = useRef<any>(null);

  const MIN_ZOOM = 0.1;
  const MAX_ZOOM = 5;

  // Reset zoom
  const resetToCenter = useCallback(() => {
    if (Platform.OS === 'web' && transformRef.current) {
      transformRef.current.resetTransform();
    }
  }, []);

  // Fit to screen
  const fitToScreen = useCallback(() => {
    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height - 250;
    
    const scaleX = screenWidth / svgWidth;
    const scaleY = screenHeight / svgHeight;
    let optimalScale = Math.min(scaleX, scaleY) * 0.85;
    optimalScale = Math.max(MIN_ZOOM, Math.min(optimalScale, 1));
    
    if (Platform.OS === 'web' && transformRef.current) {
      transformRef.current.setTransform(0, 0, optimalScale);
    }
  }, [svgWidth, svgHeight]);

  // Zoom buttons
  const zoomIn = useCallback(() => {
    if (Platform.OS === 'web' && transformRef.current) {
      transformRef.current.zoomIn(0.5);
    }
  }, []);

  const zoomOut = useCallback(() => {
    if (Platform.OS === 'web' && transformRef.current) {
      transformRef.current.zoomOut(0.5);
    }
  }, []);

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
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>
              {sharedTreeOwner ? `Arbre de ${sharedTreeOwner.name}` : (isPreviewMode ? 'Mode Aperçu' : 'Mon Arbre')}
            </Text>
            {user && !isPreviewMode && !sharedTreeOwner && (
              <Text style={styles.headerAccount}>
                {user.first_name} {user.last_name} • {user.email}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.headerButtons}>
          {/* Shared trees button - show badge if there are shared trees */}
          {user && !isPreviewMode && sharedTrees.length > 0 && (
            <TouchableOpacity 
              style={[styles.helpButton, styles.sharedTreesButton]} 
              onPress={() => setShowSharedTrees(true)}
            >
              <Ionicons name="people" size={20} color="#4A90D9" />
              <View style={styles.sharedBadge}>
                <Text style={styles.sharedBadgeText}>{sharedTrees.length}</Text>
              </View>
            </TouchableOpacity>
          )}
          {/* Events button - visible for all users */}
          <TouchableOpacity 
            style={[styles.helpButton, upcomingBirthdays.length > 0 && styles.eventButtonActive]} 
            onPress={() => setShowEventsPanel(true)}
          >
            <Text style={{ fontSize: 18 }}>🎉</Text>
            {upcomingBirthdays.length > 0 && (
              <View style={styles.eventBadge}>
                <Text style={styles.eventBadgeText}>{upcomingBirthdays.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.helpButton} 
            onPress={() => setShowGuide(true)}
          >
            <Ionicons name="help-circle-outline" size={22} color="#D4AF37" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.debugButton} 
            onPress={() => setShowDebug(!showDebug)}
          >
            <Ionicons name="bug-outline" size={20} color={showDebug ? '#4CAF50' : '#6B7C93'} />
          </TouchableOpacity>
        </View>
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

      {/* Tree View with Zoom & Pan - SOLUTION WEB */}
      <View style={styles.treeContainer}>
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
          <>
            {Platform.OS === 'web' && TransformWrapper ? (
              <TransformWrapper
                ref={transformRef}
                initialScale={1}
                minScale={MIN_ZOOM}
                maxScale={MAX_ZOOM}
                centerOnInit={false}
                limitToBounds={false}
                panning={{ velocityDisabled: false }}
                pinch={{ step: 10 }}
                doubleClick={{ mode: 'reset' }}
                wheel={{ step: 0.1 }}
              >
                <TransformComponent
                  wrapperStyle={{ width: '100%', height: '100%' }}
                  contentStyle={{ width: svgWidth, height: svgHeight }}
                >
                  <TreeSvgContent 
                    svgWidth={svgWidth}
                    svgHeight={svgHeight}
                    connections={connections}
                    nodes={nodes}
                    getGenderColor={getGenderColor}
                    handlePersonPress={handlePersonPress}
                  />
                </TransformComponent>
              </TransformWrapper>
            ) : (
              <ScrollView 
                style={{ flex: 1 }}
                contentContainerStyle={{ minWidth: svgWidth, minHeight: svgHeight }}
                horizontal={true}
                showsHorizontalScrollIndicator={true}
                showsVerticalScrollIndicator={true}
                maximumZoomScale={MAX_ZOOM}
                minimumZoomScale={MIN_ZOOM}
                bouncesZoom={true}
              >
                <ScrollView
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                >
                  <TreeSvgContent 
                    svgWidth={svgWidth}
                    svgHeight={svgHeight}
                    connections={connections}
                    nodes={nodes}
                    getGenderColor={getGenderColor}
                    handlePersonPress={handlePersonPress}
                  />
                </ScrollView>
              </ScrollView>
            )}

            {/* Zoom Controls - Compact for mobile */}
            <View style={styles.zoomControls}>
              <TouchableOpacity style={styles.zoomButton} onPress={zoomIn}>
                <Ionicons name="add" size={18} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.zoomButton} onPress={zoomOut}>
                <Ionicons name="remove" size={18} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.zoomButton} onPress={resetToCenter}>
                <Ionicons name="locate-outline" size={16} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.zoomButton, styles.fitButton]} onPress={fitToScreen}>
                <Ionicons name="scan-outline" size={16} color="#D4AF37" />
              </TouchableOpacity>
              {Platform.OS === 'web' && (
                <TouchableOpacity style={[styles.zoomButton, styles.printButton]} onPress={handlePrintTree}>
                  <Ionicons name="print-outline" size={16} color="#4CAF50" />
                </TouchableOpacity>
              )}
            </View>

            {/* Zoom hint */}
            <View style={styles.zoomHint}>
              <Text style={styles.zoomHintText}>👆 Glisser • 🤏 Pincer • Double-tap: reset</Text>
            </View>
          </>
        )}
      </View>

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

      {/* User Guide Modal */}
      <Modal
        visible={showGuide}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGuide(false)}
      >
        <View style={styles.guideOverlay}>
          <View style={styles.guideContent}>
            <View style={styles.guideHeader}>
              <Text style={styles.guideTitle}>📖 Guide d'utilisation</Text>
              <TouchableOpacity onPress={() => setShowGuide(false)}>
                <Ionicons name="close-circle" size={28} color="#D4AF37" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.guideScroll} showsVerticalScrollIndicator={false}>
              {/* Étape 1 */}
              <View style={styles.guideStep}>
                <View style={styles.guideStepNumber}>
                  <Text style={styles.guideStepNumberText}>1</Text>
                </View>
                <View style={styles.guideStepContent}>
                  <Text style={styles.guideStepTitle}>Créer des personnes</Text>
                  <Text style={styles.guideStepText}>
                    Cliquez sur le bouton <Text style={styles.guideHighlight}>"Ajouter"</Text> en bas de l'écran pour créer une nouvelle personne dans votre arbre.
                  </Text>
                  <View style={styles.guideStepDetails}>
                    <Text style={styles.guideStepDetail}>• Renseignez le prénom et le nom (obligatoires)</Text>
                    <Text style={styles.guideStepDetail}>• Choisissez le genre</Text>
                    <Text style={styles.guideStepDetail}>• Ajoutez la date et le lieu de naissance</Text>
                    <Text style={styles.guideStepDetail}>• Indiquez la branche géographique</Text>
                  </View>
                </View>
              </View>

              {/* Étape 2 */}
              <View style={styles.guideStep}>
                <View style={styles.guideStepNumber}>
                  <Text style={styles.guideStepNumberText}>2</Text>
                </View>
                <View style={styles.guideStepContent}>
                  <Text style={styles.guideStepTitle}>Créer les liens familiaux</Text>
                  <Text style={styles.guideStepText}>
                    Une fois au moins 2 personnes créées, cliquez sur <Text style={styles.guideHighlight}>"Lien"</Text> pour établir les relations.
                  </Text>
                  <View style={styles.guideStepDetails}>
                    <Text style={styles.guideStepDetail}>• <Text style={styles.guideHighlight}>Parent</Text> : X est parent de Y</Text>
                    <Text style={styles.guideStepDetail}>• <Text style={styles.guideHighlight}>Enfant</Text> : X est enfant de Y</Text>
                    <Text style={styles.guideStepDetail}>• <Text style={styles.guideHighlight}>Époux/Épouse</Text> : X est marié(e) à Y</Text>
                  </View>
                </View>
              </View>

              {/* Étape 3 */}
              <View style={styles.guideStep}>
                <View style={styles.guideStepNumber}>
                  <Text style={styles.guideStepNumberText}>3</Text>
                </View>
                <View style={styles.guideStepContent}>
                  <Text style={styles.guideStepTitle}>Actualiser la visualisation</Text>
                  <Text style={styles.guideStepText}>
                    Après avoir créé des personnes ou des liens, cliquez sur <Text style={styles.guideHighlight}>"Actualiser"</Text> pour mettre à jour l'affichage de l'arbre.
                  </Text>
                </View>
              </View>

              {/* Étape 4 */}
              <View style={styles.guideStep}>
                <View style={styles.guideStepNumber}>
                  <Text style={styles.guideStepNumberText}>4</Text>
                </View>
                <View style={styles.guideStepContent}>
                  <Text style={styles.guideStepTitle}>Ordre de création recommandé</Text>
                  <Text style={styles.guideStepText}>
                    Pour un arbre bien organisé :
                  </Text>
                  <View style={styles.guideStepDetails}>
                    <Text style={styles.guideStepDetail}>1. Commencez par les grands-parents</Text>
                    <Text style={styles.guideStepDetail}>2. Créez leurs enfants (vos parents)</Text>
                    <Text style={styles.guideStepDetail}>3. Ajoutez les liens "parent" entre eux</Text>
                    <Text style={styles.guideStepDetail}>4. Continuez avec votre génération</Text>
                  </View>
                  <Text style={styles.guideNote}>
                    💡 L'arbre se réorganise automatiquement même si vous ajoutez des ancêtres après coup !
                  </Text>
                </View>
              </View>

              {/* Étape 5 */}
              <View style={styles.guideStep}>
                <View style={styles.guideStepNumber}>
                  <Text style={styles.guideStepNumberText}>5</Text>
                </View>
                <View style={styles.guideStepContent}>
                  <Text style={styles.guideStepTitle}>Partager votre arbre</Text>
                  <Text style={styles.guideStepText}>
                    Allez dans l'onglet <Text style={styles.guideHighlight}>"Partage"</Text> pour inviter des membres de votre famille à collaborer sur l'arbre.
                  </Text>
                  <View style={styles.guideStepDetails}>
                    <Text style={styles.guideStepDetail}>• <Text style={styles.guideHighlight}>Éditeur</Text> : peut ajouter des personnes et liens</Text>
                    <Text style={styles.guideStepDetail}>• <Text style={styles.guideHighlight}>Lecteur</Text> : peut uniquement visualiser</Text>
                  </View>
                </View>
              </View>

              {/* Astuce */}
              <View style={styles.guideTip}>
                <Ionicons name="bulb" size={24} color="#D4AF37" />
                <View style={styles.guideTipContent}>
                  <Text style={styles.guideTipTitle}>Astuce</Text>
                  <Text style={styles.guideTipText}>
                    Cliquez sur une personne dans l'arbre pour voir ses détails et modifier ses informations.
                  </Text>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity 
              style={styles.guideCloseButton}
              onPress={() => setShowGuide(false)}
            >
              <Text style={styles.guideCloseButtonText}>J'ai compris !</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Events Panel Modal */}
      <Modal
        visible={showEventsPanel}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEventsPanel(false)}
      >
        <View style={styles.eventsOverlay}>
          <View style={styles.eventsContent}>
            <View style={styles.eventsHeader}>
              <Text style={styles.eventsTitle}>🎉 Événements Familiaux</Text>
              <TouchableOpacity onPress={() => setShowEventsPanel(false)}>
                <Ionicons name="close-circle" size={28} color="#D4AF37" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.eventsScroll} showsVerticalScrollIndicator={false}>
              {/* Upcoming Birthdays */}
              <Text style={styles.eventsSectionTitle}>🎂 Anniversaires à venir</Text>
              {upcomingBirthdays.length === 0 ? (
                <Text style={styles.eventsEmpty}>Aucun anniversaire dans les 30 prochains jours</Text>
              ) : (
                upcomingBirthdays.map((birthday, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.eventCard}
                    onPress={() => {
                      setCurrentEvent({
                        type: 'birthday',
                        title: `🎂 Anniversaire de ${birthday.person_name}!`,
                        person_name: birthday.person_name,
                        subtitle: birthday.days_until === 0 
                          ? `Aujourd'hui - ${birthday.age} ans!` 
                          : `Dans ${birthday.days_until} jour${birthday.days_until > 1 ? 's' : ''} - ${birthday.age} ans`
                      });
                      setShowEventsPanel(false);
                      setShowEventAnimation(true);
                    }}
                  >
                    <Text style={styles.eventCardEmoji}>🎂</Text>
                    <View style={styles.eventCardContent}>
                      <Text style={styles.eventCardTitle}>{birthday.person_name}</Text>
                      <Text style={styles.eventCardSubtitle}>
                        {birthday.days_until === 0 
                          ? `🎉 Aujourd'hui! - ${birthday.age} ans` 
                          : `Dans ${birthday.days_until} jour${birthday.days_until > 1 ? 's' : ''} - ${birthday.age} ans`}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
                  </TouchableOpacity>
                ))
              )}

              {/* Create Event Section */}
              <Text style={styles.eventsSectionTitle}>✨ Créer un événement</Text>
              
              {!showCreateEvent ? (
                <View style={styles.eventTypeGrid}>
                  {[
                    { type: 'birthday', emoji: '🎂', label: 'Anniversaire' },
                    { type: 'birth', emoji: '👶', label: 'Naissance' },
                    { type: 'graduation', emoji: '🎓', label: 'Diplôme' },
                    { type: 'wedding', emoji: '💍', label: 'Mariage' },
                    { type: 'newyear', emoji: '🎆', label: 'Nouvel An' },
                    { type: 'holiday', emoji: '🎄', label: 'Fête' },
                  ].map((item) => (
                    <TouchableOpacity 
                      key={item.type}
                      style={styles.eventTypeButton}
                      onPress={() => {
                        setNewEventType(item.type);
                        setNewEventTitle(`${item.emoji} ${item.label}`);
                        setShowCreateEvent(true);
                      }}
                    >
                      <Text style={styles.eventTypeEmoji}>{item.emoji}</Text>
                      <Text style={styles.eventTypeLabel}>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.createEventForm}>
                  <TextInput
                    style={styles.eventInput}
                    placeholder="Titre de l'événement"
                    placeholderTextColor="#6B7C93"
                    value={newEventTitle}
                    onChangeText={setNewEventTitle}
                  />
                  <TextInput
                    style={[styles.eventInput, styles.eventInputMultiline]}
                    placeholder="Description (optionnel)"
                    placeholderTextColor="#6B7C93"
                    value={newEventDescription}
                    onChangeText={setNewEventDescription}
                    multiline
                    numberOfLines={3}
                  />

                  {/* Recipients Selection */}
                  <View style={styles.recipientsSection}>
                    <View style={styles.recipientsSectionHeader}>
                      <Text style={styles.recipientsSectionTitle}>📨 Envoyer à :</Text>
                      {collaborators.filter(c => c.status === 'accepted').length > 0 && (
                        <TouchableOpacity onPress={selectAllRecipients}>
                          <Text style={styles.selectAllText}>Tout sélectionner</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    
                    {collaborators.filter(c => c.status === 'accepted').length === 0 ? (
                      <Text style={styles.noRecipientsText}>
                        Aucun collaborateur invité. Allez dans l'onglet "Partage" pour inviter des membres de votre famille.
                      </Text>
                    ) : (
                      <View style={styles.recipientsList}>
                        {collaborators.filter(c => c.status === 'accepted').map((collab, idx) => (
                          <TouchableOpacity 
                            key={idx}
                            style={[
                              styles.recipientItem,
                              selectedRecipients.includes(collab.email) && styles.recipientItemSelected
                            ]}
                            onPress={() => toggleRecipient(collab.email)}
                          >
                            <Ionicons 
                              name={selectedRecipients.includes(collab.email) ? "checkbox" : "square-outline"} 
                              size={20} 
                              color={selectedRecipients.includes(collab.email) ? "#D4AF37" : "#6B7C93"} 
                            />
                            <Text style={styles.recipientEmail}>{collab.email}</Text>
                            <Text style={styles.recipientRole}>
                              {collab.role === 'editor' ? '✏️' : '👁️'}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* Notification Options */}
                  <View style={styles.notificationOptions}>
                    <TouchableOpacity 
                      style={styles.notificationOption}
                      onPress={() => setSendByEmail(!sendByEmail)}
                    >
                      <Ionicons 
                        name={sendByEmail ? "checkbox" : "square-outline"} 
                        size={22} 
                        color={sendByEmail ? "#D4AF37" : "#6B7C93"} 
                      />
                      <Text style={styles.notificationOptionText}>📧 Envoyer par email</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.notificationOption}
                      onPress={() => setSendInApp(!sendInApp)}
                    >
                      <Ionicons 
                        name={sendInApp ? "checkbox" : "square-outline"} 
                        size={22} 
                        color={sendInApp ? "#D4AF37" : "#6B7C93"} 
                      />
                      <Text style={styles.notificationOptionText}>📱 Notification in-app</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.createEventButtons}>
                    <TouchableOpacity 
                      style={styles.createEventCancel}
                      onPress={() => {
                        setShowCreateEvent(false);
                        setNewEventTitle('');
                        setNewEventDescription('');
                        setSelectedRecipients([]);
                      }}
                    >
                      <Text style={styles.createEventCancelText}>Annuler</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[
                        styles.createEventSubmit,
                        (!newEventTitle.trim()) && styles.createEventSubmitDisabled
                      ]}
                      onPress={handleCreateEvent}
                      disabled={!newEventTitle.trim()}
                    >
                      <Ionicons name="send" size={16} color="#0A1628" />
                      <Text style={styles.createEventSubmitText}>
                        Envoyer{selectedRecipients.length > 0 ? ` (${selectedRecipients.length})` : ''}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Test animations */}
              <Text style={styles.eventsSectionTitle}>🎬 Tester les animations</Text>
              <View style={styles.testAnimGrid}>
                {[
                  { type: 'birthday', emoji: '🎂', title: '🎂 Joyeux Anniversaire!' },
                  { type: 'birth', emoji: '👶', title: '👶 Bienvenue au nouveau-né!' },
                  { type: 'graduation', emoji: '🎓', title: '🎓 Félicitations Diplômé!' },
                  { type: 'wedding', emoji: '💍', title: '💍 Vive les Mariés!' },
                  { type: 'newyear', emoji: '🎆', title: '🎆 Bonne Année!' },
                ].map((item) => (
                  <TouchableOpacity 
                    key={item.type}
                    style={styles.testAnimButton}
                    onPress={() => {
                      setCurrentEvent({
                        type: item.type,
                        title: item.title,
                      });
                      setShowEventsPanel(false);
                      setShowEventAnimation(true);
                    }}
                  >
                    <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Shared Trees Modal */}
      <Modal
        visible={showSharedTrees}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSharedTrees(false)}
      >
        <View style={styles.sharedTreesOverlay}>
          <View style={styles.sharedTreesContent}>
            <View style={styles.sharedTreesHeader}>
              <Text style={styles.sharedTreesTitle}>👥 Arbres partagés avec moi</Text>
              <TouchableOpacity onPress={() => setShowSharedTrees(false)}>
                <Ionicons name="close-circle" size={28} color="#D4AF37" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.sharedTreesScroll} showsVerticalScrollIndicator={false}>
              {sharedTrees.length === 0 ? (
                <View style={styles.sharedTreesEmpty}>
                  <Ionicons name="people-outline" size={48} color="#6B7C93" />
                  <Text style={styles.sharedTreesEmptyText}>
                    Aucun arbre partagé avec vous pour le moment.
                  </Text>
                  <Text style={styles.sharedTreesEmptyHint}>
                    Lorsqu'un membre de votre famille vous invitera, son arbre apparaîtra ici.
                  </Text>
                </View>
              ) : (
                sharedTrees.map((tree, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={styles.sharedTreeCard}
                    onPress={() => {
                      setShowSharedTrees(false);
                      router.push({
                        pathname: '/(tabs)/tree',
                        params: { 
                          sharedOwnerId: tree.owner_id,
                          sharedOwnerName: tree.owner_name
                        }
                      });
                    }}
                  >
                    <View style={styles.sharedTreeIcon}>
                      <Ionicons name="git-branch" size={24} color="#D4AF37" />
                    </View>
                    <View style={styles.sharedTreeInfo}>
                      <Text style={styles.sharedTreeOwner}>{tree.owner_name}</Text>
                      <Text style={styles.sharedTreeEmail}>{tree.owner_email}</Text>
                      <Text style={styles.sharedTreeMeta}>
                        {tree.persons_count} membre{tree.persons_count > 1 ? 's' : ''} • Rôle: {tree.role === 'editor' ? 'Éditeur' : tree.role === 'admin' ? 'Admin' : 'Lecteur'}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#6B7C93" />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.sharedTreesCloseButton}
              onPress={() => setShowSharedTrees(false)}
            >
              <Text style={styles.sharedTreesCloseButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Event Animation */}
      {currentEvent && (
        <EventAnimation
          visible={showEventAnimation}
          eventType={currentEvent.type}
          title={currentEvent.title}
          subtitle={currentEvent.subtitle}
          personName={currentEvent.person_name}
          onClose={() => {
            setShowEventAnimation(false);
            setCurrentEvent(null);
          }}
        />
      )}
      
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
  headerTitleContainer: {
    flexDirection: 'column',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerAccount: {
    fontSize: 11,
    color: '#B8C5D6',
    marginTop: 4,
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
    overflow: 'hidden',
  },
  zoomableView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  treeContent: {
    flexGrow: 1,
    minWidth: '100%',
    minHeight: '100%',
  },
  nodesOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  // Zoom controls styles
  zoomControls: {
    position: 'absolute',
    right: 8,
    top: 8,
    flexDirection: 'row',
    backgroundColor: 'rgba(26, 47, 74, 0.85)',
    borderRadius: 20,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.5)',
  },
  zoomButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(42, 63, 90, 0.9)',
    borderRadius: 16,
  },
  fitButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  printButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  zoomHint: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  zoomHintText: {
    color: '#6B7C93',
    fontSize: 10,
    backgroundColor: 'rgba(10, 22, 40, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
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
  // Styles pour les boutons du header
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  helpButton: {
    padding: 8,
    borderRadius: 8,
  },
  // Styles pour le Guide d'utilisation
  guideOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  guideContent: {
    backgroundColor: '#0A1628',
    borderRadius: 20,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2F4A',
  },
  guideTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  guideScroll: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  guideStep: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  guideStepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  guideStepNumberText: {
    color: '#0A1628',
    fontSize: 16,
    fontWeight: '700',
  },
  guideStepContent: {
    flex: 1,
  },
  guideStepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  guideStepText: {
    fontSize: 14,
    color: '#B8C5D6',
    lineHeight: 20,
  },
  guideHighlight: {
    color: '#D4AF37',
    fontWeight: '600',
  },
  guideStepDetails: {
    marginTop: 10,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#1A2F4A',
  },
  guideStepDetail: {
    fontSize: 13,
    color: '#8A9BAD',
    marginBottom: 4,
    lineHeight: 18,
  },
  guideNote: {
    fontSize: 13,
    color: '#4CAF50',
    marginTop: 10,
    fontStyle: 'italic',
  },
  guideTip: {
    flexDirection: 'row',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  guideTipContent: {
    flex: 1,
    marginLeft: 12,
  },
  guideTipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4AF37',
    marginBottom: 4,
  },
  guideTipText: {
    fontSize: 13,
    color: '#B8C5D6',
    lineHeight: 18,
  },
  guideCloseButton: {
    backgroundColor: '#D4AF37',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  guideCloseButtonText: {
    color: '#0A1628',
    fontSize: 16,
    fontWeight: '600',
  },
  // Events styles
  eventButtonActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
  },
  eventBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#E74C3C',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  eventBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  eventsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 22, 40, 0.95)',
    justifyContent: 'flex-end',
  },
  eventsContent: {
    backgroundColor: '#1A2F4A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingTop: 20,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
  },
  eventsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  eventsScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  eventsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4AF37',
    marginTop: 16,
    marginBottom: 12,
  },
  eventsEmpty: {
    color: '#6B7C93',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(42, 63, 90, 0.6)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  eventCardEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  eventCardContent: {
    flex: 1,
  },
  eventCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  eventCardSubtitle: {
    fontSize: 13,
    color: '#B8C5D6',
    marginTop: 2,
  },
  eventTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  eventTypeButton: {
    width: '30%',
    backgroundColor: 'rgba(42, 63, 90, 0.6)',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  eventTypeEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  eventTypeLabel: {
    fontSize: 12,
    color: '#B8C5D6',
    textAlign: 'center',
  },
  createEventForm: {
    backgroundColor: 'rgba(42, 63, 90, 0.4)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  eventInput: {
    backgroundColor: 'rgba(10, 22, 40, 0.6)',
    borderRadius: 10,
    padding: 14,
    color: '#FFFFFF',
    fontSize: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  eventInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  createEventButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  createEventCancel: {
    flex: 1,
    backgroundColor: 'rgba(107, 124, 147, 0.3)',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  createEventCancelText: {
    color: '#B8C5D6',
    fontSize: 14,
    fontWeight: '600',
  },
  createEventSubmit: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#D4AF37',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  createEventSubmitText: {
    color: '#0A1628',
    fontSize: 14,
    fontWeight: '600',
  },
  testAnimGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 40,
  },
  testAnimButton: {
    flex: 1,
    backgroundColor: 'rgba(42, 63, 90, 0.6)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  // Recipients styles
  recipientsSection: {
    marginBottom: 16,
  },
  recipientsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recipientsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  selectAllText: {
    fontSize: 12,
    color: '#D4AF37',
    textDecorationLine: 'underline',
  },
  noRecipientsText: {
    fontSize: 13,
    color: '#6B7C93',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  recipientsList: {
    gap: 8,
  },
  recipientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 22, 40, 0.5)',
    borderRadius: 10,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(107, 124, 147, 0.3)',
  },
  recipientItemSelected: {
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  recipientEmail: {
    flex: 1,
    fontSize: 14,
    color: '#B8C5D6',
  },
  recipientRole: {
    fontSize: 14,
  },
  notificationOptions: {
    marginBottom: 16,
    gap: 10,
  },
  notificationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  notificationOptionText: {
    fontSize: 14,
    color: '#B8C5D6',
  },
  createEventSubmitDisabled: {
    opacity: 0.5,
  },
  // Shared Trees Button styles
  sharedTreesButton: {
    backgroundColor: 'rgba(74, 144, 217, 0.2)',
    borderWidth: 1,
    borderColor: '#4A90D9',
  },
  sharedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#4A90D9',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sharedBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  // Shared Trees Modal styles
  sharedTreesOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  sharedTreesContent: {
    backgroundColor: '#0A1628',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 30,
  },
  sharedTreesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2F4A',
  },
  sharedTreesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sharedTreesScroll: {
    maxHeight: 400,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sharedTreesEmpty: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  sharedTreesEmptyText: {
    color: '#B8C5D6',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  sharedTreesEmptyHint: {
    color: '#6B7C93',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  sharedTreeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2F4A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2D4A6F',
  },
  sharedTreeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sharedTreeInfo: {
    flex: 1,
  },
  sharedTreeOwner: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sharedTreeEmail: {
    fontSize: 13,
    color: '#B8C5D6',
    marginTop: 2,
  },
  sharedTreeMeta: {
    fontSize: 12,
    color: '#6B7C93',
    marginTop: 4,
  },
  sharedTreesCloseButton: {
    backgroundColor: '#1A2F4A',
    borderRadius: 12,
    paddingVertical: 14,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  sharedTreesCloseButtonText: {
    color: '#B8C5D6',
    fontSize: 16,
    fontWeight: '600',
  },
});
