import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import api, { gdprAPI, treeAPI, exportAPI } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AdBanner from '@/components/AdBanner';
import { useTranslation } from 'react-i18next';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isAdmin } = useAuth();
  const { t } = useTranslation();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [clearingTree, setClearingTree] = useState(false);
  const [downloadingJSON, setDownloadingJSON] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  const performLogout = async () => {
    setLoggingOut(true);
    try {
      // Clear all local storage
      await AsyncStorage.clear();
      // Call logout from context
      await logout();
      // Navigate to home
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
      if (Platform.OS === 'web') {
        window.alert('Problème lors de la déconnexion');
      } else {
        Alert.alert('Erreur', 'Problème lors de la déconnexion');
      }
    } finally {
      setLoggingOut(false);
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      // On web, use window.confirm instead of Alert
      const confirmed = window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?');
      if (confirmed) {
        await performLogout();
      }
    } else {
      // On mobile, use Alert
      Alert.alert(
        'Déconnexion',
        'Êtes-vous sûr de vouloir vous déconnecter ?',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Déconnexion',
            style: 'destructive',
            onPress: performLogout,
          },
        ]
      );
    }
  };

  const handleExportData = async () => {
    if (!user) {
      if (Platform.OS === 'web') {
        window.alert('Créez un compte pour exporter vos données.');
      } else {
        Alert.alert('Information', 'Créez un compte pour exporter vos données.');
      }
      return;
    }

    setExporting(true);
    try {
      const response = await gdprAPI.exportData();
      const message = `Vos données ont été exportées.\n\n- ${response.data.persons?.length || 0} personnes\n- ${response.data.family_links?.length || 0} liens familiaux`;
      
      if (Platform.OS === 'web') {
        window.alert('Export réussi!\n\n' + message);
      } else {
        Alert.alert('Export réussi', message, [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('Export error:', error);
      if (Platform.OS === 'web') {
        window.alert('Erreur: Impossible d\'exporter les données.');
      } else {
        Alert.alert('Erreur', 'Impossible d\'exporter les données.');
      }
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    console.log('[DELETE] handleDeleteAccount called');
    console.log('[DELETE] user:', user?.email);
    console.log('[DELETE] Platform.OS:', Platform.OS);
    
    if (!user) {
      console.log('[DELETE] No user - showing alert');
      if (Platform.OS === 'web') {
        window.alert('Vous devez être connecté pour supprimer votre compte.');
      } else {
        Alert.alert('Erreur', 'Vous devez être connecté pour supprimer votre compte.');
      }
      return;
    }

    if (Platform.OS === 'web') {
      // WEB: Use native browser confirm dialogs
      console.log('[DELETE] Web platform detected - showing confirm');
      
      const confirmed = window.confirm(
        '⚠️ SUPPRIMER VOTRE COMPTE ?\n\n' +
        'Cette action est IRRÉVERSIBLE.\n' +
        'Toutes vos données seront supprimées définitivement.'
      );
      
      console.log('[DELETE] First confirm result:', confirmed);

      if (!confirmed) {
        console.log('[DELETE] User cancelled first confirm');
        return;
      }

      const finalConfirm = window.confirm(
        '🚨 DERNIÈRE CONFIRMATION\n\n' +
        'Êtes-vous vraiment sûr de vouloir supprimer votre compte ?\n' +
        'Cliquez OK pour confirmer la suppression définitive.'
      );
      
      console.log('[DELETE] Final confirm result:', finalConfirm);

      if (!finalConfirm) {
        console.log('[DELETE] User cancelled final confirm');
        return;
      }

      // Proceed with deletion
      console.log('[DELETE] Starting deletion process...');
      setDeleting(true);
      
      try {
        console.log('[DELETE] Calling gdprAPI.deleteAccount()...');
        await gdprAPI.deleteAccount();
        console.log('[DELETE] Account deleted successfully');
        
        console.log('[DELETE] Logging out...');
        await logout();
        
        window.alert('✅ Compte supprimé avec succès !');
        console.log('[DELETE] Redirecting to home...');
        router.replace('/');
      } catch (error: any) {
        console.error('[DELETE] Error:', error);
        const errorMsg = error?.response?.data?.detail || 'Échec de la suppression du compte';
        window.alert('❌ Erreur: ' + errorMsg);
      } finally {
        setDeleting(false);
      }
    } else {
      // MOBILE: Use React Native Alert
      console.log('[DELETE] Mobile platform - showing Alert');
      Alert.alert(
        '⚠️ Supprimer le compte',
        'Cette action est irréversible. Toutes vos données seront supprimées définitivement.',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: async () => {
              setDeleting(true);
              try {
                await gdprAPI.deleteAccount();
                await logout();
                Alert.alert('Succès', 'Compte supprimé avec succès.');
                router.replace('/');
              } catch (error: any) {
                Alert.alert('Erreur', error?.response?.data?.detail || 'Échec de la suppression');
              } finally {
                setDeleting(false);
              }
            },
          },
        ]
      );
    }
  };

  const handleClearPreview = async () => {
    Alert.alert(
      'Effacer les données',
      'Les données du mode aperçu seront supprimées.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Effacer',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('preview_token');
            Alert.alert('Succès', 'Les données du mode aperçu ont été effacées.');
            router.replace('/');
          },
        },
      ]
    );
  };

  // Clear entire tree (keep account)
  const handleClearTree = async () => {
    if (!user) {
      Alert.alert('Information', 'Connectez-vous pour gérer votre arbre.');
      return;
    }

    const confirmClear = () => {
      setClearingTree(true);
      treeAPI.clearTree()
        .then((response) => {
          const data = response.data;
          if (Platform.OS === 'web') {
            window.alert(`Arbre supprimé avec succès!\n\n${data.deleted_persons} personnes supprimées\n${data.deleted_links} liens supprimés`);
          } else {
            Alert.alert(
              'Arbre supprimé',
              `${data.deleted_persons} personnes et ${data.deleted_links} liens ont été supprimés.`,
              [{ text: 'OK' }]
            );
          }
        })
        .catch((error) => {
          console.error('Clear tree error:', error);
          if (Platform.OS === 'web') {
            window.alert('Erreur lors de la suppression de l\'arbre.');
          } else {
            Alert.alert('Erreur', 'Impossible de supprimer l\'arbre.');
          }
        })
        .finally(() => {
          setClearingTree(false);
        });
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        'ATTENTION: Cette action est irréversible!\n\nToutes les personnes et liens de votre arbre seront supprimés.\n\nVotre compte restera actif.\n\nVoulez-vous continuer?'
      );
      if (confirmed) {
        confirmClear();
      }
    } else {
      Alert.alert(
        'Supprimer l\'arbre',
        'ATTENTION: Cette action est irréversible!\n\nToutes les personnes et liens de votre arbre seront supprimés.\n\nVotre compte restera actif.',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Supprimer tout',
            style: 'destructive',
            onPress: confirmClear,
          },
        ]
      );
    }
  };

  // Download tree as JSON file
  const handleDownloadJSON = async () => {
    if (!user) {
      if (Platform.OS === 'web') {
        window.alert('Connectez-vous pour télécharger votre arbre.');
      } else {
        Alert.alert('Information', 'Connectez-vous pour télécharger votre arbre.');
      }
      return;
    }

    setDownloadingJSON(true);
    try {
      const response = await exportAPI.downloadJSON();
      
      if (Platform.OS === 'web') {
        // Create blob and download
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `aila_tree_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        window.alert('Fichier téléchargé avec succès!');
      } else {
        // On mobile, show the data for now
        Alert.alert(
          'Export réussi',
          'Le fichier JSON a été généré. Sur mobile, utilisez le partage pour sauvegarder.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('Download error:', error);
      const errorMsg = error?.response?.data?.detail || 'Erreur lors du téléchargement.';
      if (Platform.OS === 'web') {
        window.alert(errorMsg);
      } else {
        Alert.alert('Erreur', errorMsg);
      }
    } finally {
      setDownloadingJSON(false);
    }
  };

  // Import GEDCOM file
  const handleImportGedcom = async () => {
    if (Platform.OS === 'web') {
      // Create file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.ged,.gedcom';
      
      input.onchange = async (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async (event) => {
          const content = event.target?.result as string;
          
          try {
            const response = await api.post('/tree/import/gedcom', {
              gedcom_content: content
            });
            
            window.alert(response.data.message);
          } catch (error: any) {
            console.error('Import error:', error);
            window.alert(error.response?.data?.detail || 'Erreur lors de l\'import');
          }
        };
        reader.readAsText(file);
      };
      
      input.click();
    } else {
      Alert.alert('Information', 'L\'import GEDCOM est disponible sur la version web.');
    }
  };

  // Send tree by email with format choice
  const handleSendByEmail = async () => {
    if (Platform.OS === 'web') {
      // Step 1: Choose format
      const formatChoice = window.prompt(
        'Choisissez le format d\'export :\n\n1 - JSON (données brutes)\n2 - PDF (document imprimable)\n3 - Excel/CSV (tableur)\n\nEntrez 1, 2 ou 3 :',
        '2'
      );
      
      if (!formatChoice) return;
      
      let format = 'pdf';
      let formatName = 'PDF';
      if (formatChoice === '1') { format = 'json'; formatName = 'JSON'; }
      else if (formatChoice === '2') { format = 'pdf'; formatName = 'PDF'; }
      else if (formatChoice === '3') { format = 'csv'; formatName = 'Excel/CSV'; }
      else {
        window.alert('Choix invalide. Veuillez entrer 1, 2 ou 3.');
        return;
      }
      
      // Step 2: Get email addresses
      const emails = window.prompt(
        `Envoyer l'arbre au format ${formatName}.\n\nEntrez les adresses email des destinataires (séparées par des virgules) :`,
        ''
      );
      
      if (!emails) return;
      
      // Step 3: Optional message
      const message = window.prompt(
        'Ajoutez un message personnalisé (optionnel) :',
        ''
      );
      
      try {
        const emailList = emails.split(',').map(e => e.trim()).filter(e => e);
        
        if (emailList.length === 0) {
          window.alert('Veuillez entrer au moins une adresse email.');
          return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = emailList.filter(e => !emailRegex.test(e));
        if (invalidEmails.length > 0) {
          window.alert(`Adresses email invalides : ${invalidEmails.join(', ')}`);
          return;
        }
        
        window.alert('Envoi en cours...');
        
        const response = await api.post('/tree/send-email', {
          recipient_emails: emailList,
          format: format,
          message: message || null
        });
        
        window.alert(response.data.message || `Arbre envoyé avec succès au format ${formatName} !`);
      } catch (error: any) {
        console.error('Send email error:', error);
        window.alert(error.response?.data?.detail || 'Erreur lors de l\'envoi. Vérifiez votre connexion.');
      }
    } else {
      Alert.alert(
        'Envoyer par email',
        'Choisissez le format :',
        [
          { text: 'Annuler', style: 'cancel' },
          { 
            text: 'JSON', 
            onPress: () => sendTreeByEmailMobile('json') 
          },
          { 
            text: 'PDF', 
            onPress: () => sendTreeByEmailMobile('pdf') 
          },
          { 
            text: 'Excel/CSV', 
            onPress: () => sendTreeByEmailMobile('csv') 
          },
        ]
      );
    }
  };

  // Mobile helper for sending email
  const sendTreeByEmailMobile = async (format: string) => {
    Alert.prompt(
      'Adresses email',
      'Entrez les adresses email (séparées par des virgules) :',
      async (emails) => {
        if (!emails) return;
        
        try {
          const emailList = emails.split(',').map((e: string) => e.trim()).filter((e: string) => e);
          
          if (emailList.length === 0) {
            Alert.alert('Erreur', 'Veuillez entrer au moins une adresse email.');
            return;
          }
          
          const response = await api.post('/tree/send-email', {
            recipient_emails: emailList,
            format: format,
            message: null
          });
          
          Alert.alert('Succès', response.data.message || 'Arbre envoyé !');
        } catch (error: any) {
          Alert.alert('Erreur', error.response?.data?.detail || 'Erreur lors de l\'envoi.');
        }
      },
      'plain-text'
    );
  };

  // Build tree structure using same algorithm as main tree display
  const buildTreeStructure = (persons: any[], links: any[]) => {
    const NODE_WIDTH = 150;
    const NODE_HEIGHT = 75;
    const LEVEL_HEIGHT = 130;
    const NODE_SPACING = 30;
    const COUPLE_SPACING = 15;
    
    if (persons.length === 0) return { nodes: [], connections: [], width: 800, height: 400 };
    
    // Build relationship maps
    const childToParents = new Map<string, Set<string>>();
    const parentToChildren = new Map<string, Set<string>>();
    const spouseMap = new Map<string, Set<string>>();
    const personById = new Map<string, any>();
    
    persons.forEach((p: any) => personById.set(p.id, p));
    
    links.forEach((link: any) => {
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
    
    // Find roots (people with no parents) - these go at TOP (level 0)
    const roots: string[] = [];
    persons.forEach((p: any) => {
      if (!childToParents.has(p.id) || childToParents.get(p.id)!.size === 0) {
        roots.push(p.id);
      }
    });
    
    // If no roots found, use first person
    if (roots.length === 0 && persons.length > 0) {
      roots.push(persons[0].id);
    }
    
    // BFS to assign levels (0 = top ancestors, higher = descendants)
    const personLevels = new Map<string, number>();
    const queue: { id: string; level: number }[] = roots.map(id => ({ id, level: 0 }));
    const visited = new Set<string>();
    
    while (queue.length > 0) {
      const { id, level } = queue.shift()!;
      
      if (visited.has(id)) continue;
      visited.add(id);
      personLevels.set(id, level);
      
      // Add children at next level (below)
      const children = parentToChildren.get(id);
      if (children) {
        children.forEach(childId => {
          if (!visited.has(childId)) {
            queue.push({ id: childId, level: level + 1 });
          }
        });
      }
    }
    
    // Handle unvisited persons
    persons.forEach((p: any) => {
      if (!personLevels.has(p.id)) {
        personLevels.set(p.id, 0);
      }
    });
    
    // Synchronize spouse levels
    let changed = true;
    while (changed) {
      changed = false;
      spouseMap.forEach((spouses, personId) => {
        const personLevel = personLevels.get(personId) || 0;
        spouses.forEach(spouseId => {
          const spouseLevel = personLevels.get(spouseId) || 0;
          if (spouseLevel !== personLevel) {
            const maxLevel = Math.max(personLevel, spouseLevel);
            personLevels.set(personId, maxLevel);
            personLevels.set(spouseId, maxLevel);
            changed = true;
          }
        });
      });
    }
    
    // Group by level
    const levelGroups = new Map<number, string[]>();
    personLevels.forEach((level, personId) => {
      if (!levelGroups.has(level)) levelGroups.set(level, []);
      levelGroups.get(level)!.push(personId);
    });
    
    // Sort levels
    const sortedLevels = Array.from(levelGroups.keys()).sort((a, b) => a - b);
    
    // Position nodes
    const nodes: any[] = [];
    const connections: any[] = [];
    const nodePositions = new Map<string, { x: number; y: number }>();
    const processedSpouses = new Set<string>();
    
    sortedLevels.forEach((level, levelIndex) => {
      const personsAtLevel = levelGroups.get(level) || [];
      let currentX = 50;
      const y = levelIndex * LEVEL_HEIGHT + 50;
      
      // Sort by birth date if available
      personsAtLevel.sort((a, b) => {
        const personA = personById.get(a);
        const personB = personById.get(b);
        const dateA = personA?.birth_date || '';
        const dateB = personB?.birth_date || '';
        return dateA.localeCompare(dateB);
      });
      
      personsAtLevel.forEach(personId => {
        if (processedSpouses.has(personId)) return;
        
        const person = personById.get(personId);
        if (!person) return;
        
        // Check for spouse
        const spouses = spouseMap.get(personId);
        const spouse = spouses ? personById.get(Array.from(spouses)[0]) : null;
        
        // Add main person
        nodes.push({
          person,
          x: currentX,
          y,
          width: NODE_WIDTH,
          height: NODE_HEIGHT
        });
        nodePositions.set(personId, { x: currentX, y });
        
        // Add spouse next to person
        if (spouse && !processedSpouses.has(spouse.id)) {
          processedSpouses.add(spouse.id);
          const spouseX = currentX + NODE_WIDTH + COUPLE_SPACING;
          
          nodes.push({
            person: spouse,
            x: spouseX,
            y,
            width: NODE_WIDTH,
            height: NODE_HEIGHT
          });
          nodePositions.set(spouse.id, { x: spouseX, y });
          
          // Spouse connection
          connections.push({
            type: 'spouse',
            from: { x: currentX + NODE_WIDTH, y: y + NODE_HEIGHT / 2 },
            to: { x: spouseX, y: y + NODE_HEIGHT / 2 }
          });
          
          currentX = spouseX + NODE_WIDTH + NODE_SPACING;
        } else {
          currentX += NODE_WIDTH + NODE_SPACING;
        }
      });
    });
    
    // Add parent-child connections
    links.forEach((link: any) => {
      if (link.link_type === 'parent') {
        const parentPos = nodePositions.get(link.person_id_1);
        const childPos = nodePositions.get(link.person_id_2);
        
        if (parentPos && childPos) {
          connections.push({
            type: 'parent-child',
            from: { x: parentPos.x + NODE_WIDTH / 2, y: parentPos.y + NODE_HEIGHT },
            to: { x: childPos.x + NODE_WIDTH / 2, y: childPos.y }
          });
        }
      }
    });
    
    // Calculate dimensions
    const maxX = Math.max(...nodes.map((n: any) => n.x + n.width), 800) + 50;
    const maxY = Math.max(...nodes.map((n: any) => n.y + n.height), 400) + 100;
    
    return { nodes, connections, width: maxX, height: maxY };
  };

  // Export PDF - Visual Tree
  const handlePrintPDF = async () => {
    if (Platform.OS !== 'web') {
      Alert.alert('Information', 'L\'impression PDF est disponible sur la version web.');
      return;
    }
    
    if (!user) {
      window.alert('Veuillez vous connecter pour exporter votre arbre.');
      return;
    }
    
    // Redirect to tree page with print mode
    // This will show the exact same tree as displayed
    const printUrl = `${window.location.origin}/(tabs)/tree?print=true`;
    
    // Show info message
    window.alert(
      '📄 Pour imprimer votre arbre :\n\n' +
      '1. Vous allez être redirigé vers la page Arbre\n' +
      '2. Ajustez le zoom selon vos besoins\n' +
      '3. Utilisez Ctrl+P (ou Cmd+P sur Mac) pour imprimer\n\n' +
      'Conseil : Choisissez "Paysage" dans les options d\'impression pour un meilleur rendu.'
    );
    
    // Navigate to tree tab
    router.push('/(tabs)/tree');
  };

  // Export Excel/CSV
  const handleExportExcel = async () => {
    if (Platform.OS !== 'web') {
      Alert.alert('Information', 'L\'export Excel est disponible sur la version web.');
      return;
    }
    
    if (!user) {
      window.alert('Veuillez vous connecter pour exporter votre arbre.');
      return;
    }
    
    setExportingExcel(true);
    try {
      console.log('[Export Excel] Fetching data...');
      
      // Fetch data - Note: backend uses /links not /family-links
      const [personsRes, linksRes] = await Promise.all([
        api.get('/persons'),
        api.get('/links')
      ]);
      
      console.log('[Export Excel] Data received:', personsRes.data?.length, 'persons', linksRes.data?.length, 'links');
      
      const persons = personsRes.data || [];
      const links = linksRes.data || [];
      
      if (persons.length === 0) {
        window.alert('Aucune personne dans votre arbre à exporter.\n\nAjoutez d\'abord des membres à votre arbre généalogique.');
        setExportingExcel(false);
        return;
      }
      
      // Generate CSV with BOM for Excel
      let csv = '\uFEFF'; // UTF-8 BOM
      csv += 'Prénom,Nom,Genre,Date de naissance,Date de décès,Lieu de naissance,Profession,Notes\n';
      
      persons.forEach((p: any) => {
        csv += `"${p.first_name || ''}","${p.last_name || ''}","${p.gender === 'male' ? 'Homme' : p.gender === 'female' ? 'Femme' : 'Autre'}","${p.birth_date || ''}","${p.death_date || ''}","${p.birth_place || ''}","${p.occupation || ''}","${(p.notes || '').replace(/"/g, '""')}"\n`;
      });
      
      csv += '\n\nLiens familiaux\nPersonne 1,Relation,Personne 2\n';
      
      links.forEach((link: any) => {
        const p1 = persons.find((p: any) => p.id === link.person_id_1);
        const p2 = persons.find((p: any) => p.id === link.person_id_2);
        const p1Name = p1 ? `${p1.first_name} ${p1.last_name}` : 'Inconnu';
        const p2Name = p2 ? `${p2.first_name} ${p2.last_name}` : 'Inconnu';
        const linkType = link.link_type || link.relationship_type || 'autre';
        const rel = linkType === 'parent' ? 'Parent de' : linkType === 'spouse' ? 'Conjoint(e)' : linkType === 'sibling' ? 'Frère/Sœur' : linkType;
        csv += `"${p1Name}","${rel}","${p2Name}"\n`;
      });
      
      // Download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `arbre_aila_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      window.alert('Fichier Excel/CSV téléchargé avec succès !');
    } catch (error: any) {
      console.error('[Export Excel] Error:', error);
      console.error('[Export Excel] Response:', error.response?.data);
      window.alert('Erreur lors de l\'export.\n\n' + (error.response?.data?.detail || error.message || 'Vérifiez votre connexion.'));
    } finally {
      setExportingExcel(false);
    }
  };

  const handleGoToWelcome = () => {
    router.replace('/');
  };

  const getInitials = () => {
    if (!user) return 'A';
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </View>
          {user ? (
            <>
              <View style={styles.userNameContainer}>
                <Text style={styles.userName}>{user.first_name} {user.last_name}</Text>
                {isAdmin() && (
                  <View style={styles.adminBadge}>
                    <Ionicons name="shield-checkmark" size={14} color="#FFF" />
                    <Text style={styles.adminBadgeText}>Admin</Text>
                  </View>
                )}
              </View>
              <Text style={styles.userEmail}>{user.email}</Text>
            </>
          ) : (
            <>
              <Text style={styles.userName}>{t('profile.previewMode')}</Text>
              <Text style={styles.userEmail}>{t('profile.notConnected')}</Text>
            </>
          )}
        </View>


        {/* Admin Section */}
        {user && isAdmin() && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#D4AF37" />
              <Text style={styles.sectionTitle}>{t('profile.administration')}</Text>
            </View>
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => router.push('/users-management')}
            >
              <Ionicons name="people-outline" size={22} color="#4A90D9" />
              <Text style={styles.menuItemText}>{t('profile.manageUsers')}</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
            </TouchableOpacity>
          </View>
        )}


        {/* Account Section */}
        {!user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profile.account')}</Text>
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(auth)/login')}>
              <Ionicons name="log-in-outline" size={22} color="#D4AF37" />
              <Text style={styles.menuItemText}>{t('auth.login')}</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(auth)/register')}>
              <Ionicons name="person-add-outline" size={22} color="#D4AF37" />
              <Text style={styles.menuItemText}>{t('auth.createAccount')}</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
            </TouchableOpacity>
          </View>
        )}

        {/* Premium Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="star" size={20} color="#D4AF37" />
            <Text style={styles.sectionTitle}>{t('pricing.title')}</Text>
          </View>
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => router.push('/pricing' as any)}
          >
            <Ionicons name="diamond-outline" size={22} color="#D4AF37" />
            <Text style={styles.menuItemText}>{t('profile.seePremiumOffers')}</Text>
            <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
          </TouchableOpacity>
        </View>

        {/* Tree Management Section - Visible for logged in users */}
        {user && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="git-branch" size={20} color="#D4AF37" />
              <Text style={styles.sectionTitle}>{t('profile.treeManagement')}</Text>
            </View>
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => router.push('/merge-trees' as any)}
            >
              <Ionicons name="git-merge-outline" size={22} color="#00BCD4" />
              <Text style={styles.menuItemText}>{t('profile.mergeTrees')}</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
            </TouchableOpacity>
          </View>
        )}

        {/* GDPR Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#D4AF37" />
            <Text style={styles.sectionTitle}>{t('profile.dataProtection')}</Text>
          </View>
          <Text style={styles.sectionDescription}>
            {t('profile.gdprDescription')}
          </Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleExportData}
            disabled={exporting}
          >
            {exporting ? (
              <ActivityIndicator size="small" color="#D4AF37" />
            ) : (
              <Ionicons name="cloud-download-outline" size={22} color="#4A90D9" />
            )}
            <Text style={styles.menuItemText}>{t('profile.viewMyData')}</Text>
            <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
          </TouchableOpacity>

          {user && (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDownloadJSON}
              disabled={downloadingJSON}
            >
              {downloadingJSON ? (
                <ActivityIndicator size="small" color="#D4AF37" />
              ) : (
                <Ionicons name="download-outline" size={22} color="#4CAF50" />
              )}
              <Text style={styles.menuItemText}>{t('profile.downloadJSON')}</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
            </TouchableOpacity>
          )}

          {/* Export PDF - Print */}
          {user && (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handlePrintPDF}
              disabled={exportingPDF}
            >
              {exportingPDF ? (
                <ActivityIndicator size="small" color="#D4AF37" />
              ) : (
                <Ionicons name="print-outline" size={22} color="#E91E63" />
              )}
              <Text style={styles.menuItemText}>{t('profile.exportPDF')}</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
            </TouchableOpacity>
          )}

          {/* Export Excel */}
          {user && (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleExportExcel}
              disabled={exportingExcel}
            >
              {exportingExcel ? (
                <ActivityIndicator size="small" color="#D4AF37" />
              ) : (
                <Ionicons name="grid-outline" size={22} color="#217346" />
              )}
              <Text style={styles.menuItemText}>{t('profile.exportExcel')}</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
            </TouchableOpacity>
          )}

          {/* Import GEDCOM */}
          {user && (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleImportGedcom}
            >
              <Ionicons name="cloud-upload-outline" size={22} color="#9B59B6" />
              <Text style={styles.menuItemText}>{t('profile.importGEDCOM')}</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
            </TouchableOpacity>
          )}

          {/* Send by Email */}
          {user && (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleSendByEmail}
            >
              <Ionicons name="mail-outline" size={22} color="#E67E22" />
              <Text style={styles.menuItemText}>{t('profile.sendByEmail')}</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
            </TouchableOpacity>
          )}

          {/* Merge Trees */}
          {user && (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/merge-trees')}
            >
              <Ionicons name="git-merge-outline" size={22} color="#00BCD4" />
              <Text style={styles.menuItemText}>{t('profile.mergeTrees')}</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
            </TouchableOpacity>
          )}

          {!user && (
            <TouchableOpacity style={styles.menuItem} onPress={handleClearPreview}>
              <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
              <Text style={[styles.menuItemText, { color: '#FF6B6B' }]}>{t('profile.clearPreviewData')}</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
            </TouchableOpacity>
          )}

          {user && (
            <TouchableOpacity
              style={[styles.menuItem, styles.dangerItem]}
              onPress={handleClearTree}
              disabled={clearingTree}
            >
              {clearingTree ? (
                <ActivityIndicator size="small" color="#FF9800" />
              ) : (
                <Ionicons name="git-branch-outline" size={22} color="#FF9800" />
              )}
              <Text style={[styles.menuItemText, { color: '#FF9800' }]}>{t('profile.clearTree')}</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
            </TouchableOpacity>
          )}

          {user && (
            <TouchableOpacity
              style={[styles.menuItem, styles.dangerItem]}
              onPress={handleDeleteAccount}
              disabled={deleting}
              activeOpacity={0.7}
              accessibilityLabel={t('profile.deleteAccount')}
              accessibilityRole="button"
            >
              {deleting ? (
                <ActivityIndicator size="small" color="#FF6B6B" />
              ) : (
                <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
              )}
              <Text style={[styles.menuItemText, { color: '#FF6B6B' }]}>{t('profile.deleteAccount')}</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
            </TouchableOpacity>
          )}
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.supportContact')}</Text>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              Alert.alert(
                t('profile.contactUs'),
                t('profile.contactMessage'),
                [{ text: 'OK' }]
              );
            }}
          >
            <Ionicons name="mail-outline" size={22} color="#4A90D9" />
            <Text style={styles.menuItemText}>{t('profile.contactUs')}</Text>
            <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.information')}</Text>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color="#D4AF37" />
            <Text style={styles.infoText}>
              {t('profile.appDescription')}
            </Text>
          </View>
          <View style={[styles.infoCard, { marginTop: 12 }]}>
            <Ionicons name="at-outline" size={20} color="#D4AF37" />
            <Text style={styles.infoText}>
              {t('profile.contactEmail')}
            </Text>
          </View>
        </View>

        {/* Logout */}
        {user && (
          <TouchableOpacity 
            style={[styles.logoutButton, loggingOut && styles.buttonDisabled]} 
            onPress={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
            )}
            <Text style={styles.logoutButtonText}>
              {loggingOut ? t('profile.loggingOut') : t('profile.logout')}
            </Text>
          </TouchableOpacity>
        )}

        {/* Back to Welcome */}
        <TouchableOpacity style={styles.welcomeButton} onPress={handleGoToWelcome}>
          <Ionicons name="home-outline" size={22} color="#D4AF37" />
          <Text style={styles.welcomeButtonText}>{t('profile.backToHome')}</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
      
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
  content: {
    paddingBottom: 180, // Plus de marge pour le scroll complet sur mobile (bannière pub + tab bar)
  },
  scrollHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderBottomWidth: 1,
    borderBottomColor: '#D4AF37',
  },
  scrollHintText: {
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: '500',
    marginHorizontal: 8,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2F4A',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0A1628',
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  adminBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  userEmail: {
    fontSize: 15,
    color: '#6B7C93',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7C93',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#B8C5D6',
    lineHeight: 20,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2F4A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 14,
  },
  dangerItem: {
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#B8C5D6',
    lineHeight: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A3F5A',
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  welcomeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D4AF37',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  welcomeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4AF37',
  },
  version: {
    textAlign: 'center',
    color: '#4A5568',
    fontSize: 13,
    marginTop: 24,
  },
});
