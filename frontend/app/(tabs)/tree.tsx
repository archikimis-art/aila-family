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
import { useAuth } from '../../src/context/AuthContext';
import { treeAPI, previewAPI } from '../../src/services/api';
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

  const [persons, setPersons] = useState<Person[]>([]);
  const [links, setLinks] = useState<FamilyLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [previewToken, setPreviewToken] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  useEffect(() => {
    loadData();
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

  // Build tree structure
  const buildTreeLayout = () => {
    if (persons.length === 0) return { nodes: [], connections: [] };

    // Find root nodes (people without parents)
    const childIds = new Set(
      links
        .filter((l) => l.link_type === 'parent')
        .map((l) => l.person_id_2)
    );
    const parentIds = new Set(
      links
        .filter((l) => l.link_type === 'parent')
        .map((l) => l.person_id_1)
    );

    let roots = persons.filter((p) => !childIds.has(p.id));
    if (roots.length === 0) roots = [persons[0]];

    const nodes: { person: Person; x: number; y: number }[] = [];
    const connections: { from: { x: number; y: number }; to: { x: number; y: number }; type: string }[] = [];
    const visited = new Set<string>();

    const layoutNode = (person: Person, level: number, xOffset: number): number => {
      if (visited.has(person.id)) return xOffset;
      visited.add(person.id);

      // Find children
      const childLinks = links.filter(
        (l) => l.link_type === 'parent' && l.person_id_1 === person.id
      );
      const childPersons = childLinks
        .map((l) => persons.find((p) => p.id === l.person_id_2))
        .filter((p): p is Person => p !== undefined);

      // Find spouse
      const spouseLink = links.find(
        (l) => l.link_type === 'spouse' && (l.person_id_1 === person.id || l.person_id_2 === person.id)
      );
      const spouse = spouseLink
        ? persons.find((p) => p.id === (spouseLink.person_id_1 === person.id ? spouseLink.person_id_2 : spouseLink.person_id_1))
        : undefined;

      let childrenWidth = 0;
      const childXPositions: number[] = [];

      // Layout children first to determine width
      childPersons.forEach((child) => {
        childXPositions.push(xOffset + childrenWidth);
        childrenWidth = layoutNode(child, level + 1, xOffset + childrenWidth);
        childrenWidth += NODE_SPACING;
      });

      if (childrenWidth > 0) childrenWidth -= NODE_SPACING;
      const nodeWidth = spouse ? NODE_WIDTH * 2 + 20 : NODE_WIDTH;
      const totalWidth = Math.max(childrenWidth, nodeWidth);

      const personX = xOffset + (totalWidth - nodeWidth) / 2;
      const personY = level * LEVEL_HEIGHT + 60;

      nodes.push({ person, x: personX, y: personY });

      if (spouse && !visited.has(spouse.id)) {
        visited.add(spouse.id);
        nodes.push({ person: spouse, x: personX + NODE_WIDTH + 20, y: personY });
        connections.push({
          from: { x: personX + NODE_WIDTH, y: personY + NODE_HEIGHT / 2 },
          to: { x: personX + NODE_WIDTH + 20, y: personY + NODE_HEIGHT / 2 },
          type: 'spouse',
        });
      }

      // Draw connections to children
      const parentCenterX = spouse
        ? personX + NODE_WIDTH + 10
        : personX + NODE_WIDTH / 2;

      childPersons.forEach((child, index) => {
        const childNode = nodes.find((n) => n.person.id === child.id);
        if (childNode) {
          connections.push({
            from: { x: parentCenterX, y: personY + NODE_HEIGHT },
            to: { x: childNode.x + NODE_WIDTH / 2, y: childNode.y },
            type: 'parent',
          });
        }
      });

      return xOffset + totalWidth;
    };

    let currentX = 40;
    roots.forEach((root) => {
      currentX = layoutNode(root, 0, currentX) + 60;
    });

    // Handle unconnected persons
    persons.forEach((p) => {
      if (!visited.has(p.id)) {
        nodes.push({ person: p, x: currentX, y: 60 });
        currentX += NODE_WIDTH + NODE_SPACING;
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
        <View style={styles.headerLeft}>
          <Ionicons name="leaf" size={28} color="#D4AF37" />
          <Text style={styles.headerTitle}>
            {isPreviewMode ? 'Mode Aperçu' : 'Mon Arbre'}
          </Text>
        </View>
        {isPreviewMode && (
          <TouchableOpacity style={styles.convertButton} onPress={handleConvertToAccount}>
            <Ionicons name="save-outline" size={18} color="#0A1628" />
            <Text style={styles.convertButtonText}>Sauvegarder</Text>
          </TouchableOpacity>
        )}
      </View>

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
