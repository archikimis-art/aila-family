// ============================================================================
// FAMILY REMINDER COMPONENT - Allow users to remind family members
// ============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { remindersAPI } from '@/services/api';

interface FamilyReminderProps {
  familyMemberEmail?: string;
  familyMemberName?: string;
  onSuccess?: () => void;
  buttonStyle?: 'full' | 'icon' | 'compact';
}

export default function FamilyReminderButton({ 
  familyMemberEmail,
  familyMemberName,
  onSuccess,
  buttonStyle = 'icon'
}: FamilyReminderProps) {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState(familyMemberEmail || '');
  const [name, setName] = useState(familyMemberName || '');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendReminder = async () => {
    if (!email || !name) {
      Alert.alert('Erreur', 'Veuillez remplir le nom et l\'email');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Erreur', 'Veuillez entrer un email valide');
      return;
    }

    setLoading(true);
    try {
      const senderName = user ? `${user.first_name} ${user.last_name}` : 'Un membre de votre famille';
      
      await remindersAPI.sendToFamily({
        family_member_email: email,
        family_member_name: name,
        sender_name: senderName,
        custom_message: message || undefined,
      });

      Alert.alert(
        'Rappel envoyé ! ✉️',
        `${name} recevra une notification pour rejoindre votre arbre familial.`
      );
      
      setShowModal(false);
      setEmail(familyMemberEmail || '');
      setName(familyMemberName || '');
      setMessage('');
      onSuccess?.();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible d\'envoyer le rappel');
    } finally {
      setLoading(false);
    }
  };

  const renderButton = () => {
    if (buttonStyle === 'icon') {
      return (
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => setShowModal(true)}
        >
          <Ionicons name="mail-outline" size={20} color="#D4AF37" />
        </TouchableOpacity>
      );
    }

    if (buttonStyle === 'compact') {
      return (
        <TouchableOpacity 
          style={styles.compactButton}
          onPress={() => setShowModal(true)}
        >
          <Ionicons name="mail-outline" size={18} color="#0A1628" />
          <Text style={styles.compactButtonText}>Relancer</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity 
        style={styles.fullButton}
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="mail-outline" size={22} color="#0A1628" />
        <Text style={styles.fullButtonText}>Envoyer un rappel</Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      {renderButton()}

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📧 Relancer un proche</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowModal(false)}
              >
                <Ionicons name="close" size={24} color="#6B7C93" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Envoyez un rappel à un membre de votre famille pour l'inviter à rejoindre votre arbre.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Prénom / Nom</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Marie Dupont"
                placeholderTextColor="#6B7C93"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: marie@exemple.com"
                placeholderTextColor="#6B7C93"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Message personnalisé (optionnel)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Ajoute un message personnel..."
                placeholderTextColor="#6B7C93"
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.previewBox}>
              <Text style={styles.previewTitle}>Aperçu du message :</Text>
              <Text style={styles.previewText}>
                {user?.first_name || 'Quelqu\'un'} vous invite à rejoindre l'arbre familial sur AÏLA ! 🌳
                {message ? `\n\n"${message}"` : ''}
              </Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.sendButton, loading && styles.sendButtonDisabled]}
                onPress={handleSendReminder}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#0A1628" size="small" />
                ) : (
                  <>
                    <Ionicons name="send" size={18} color="#0A1628" />
                    <Text style={styles.sendButtonText}>Envoyer</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Button styles
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  compactButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0A1628',
  },
  fullButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 10,
  },
  fullButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A1628',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1A2F4A',
    borderRadius: 20,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  modalDescription: {
    fontSize: 14,
    color: '#6B8BB8',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D4AF37',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0A1628',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2A4A6A',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  previewBox: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D4AF37',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#6B7C93',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7C93',
  },
  sendButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  sendButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0A1628',
  },
});
