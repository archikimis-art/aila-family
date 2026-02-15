import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://www.aila.family/api';

interface ReferralProgramProps {
  userEmail?: string;
}

export default function ReferralProgram({ userEmail }: ReferralProgramProps) {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const sendInvitation = async () => {
    if (!email.trim() || !userEmail) return;
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/referrals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referrer_email: userEmail,
          referred_email: email,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setEmail('');
      } else {
        const data = await response.json();
        setError(data.detail || 'Une erreur est survenue');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Ionicons name="gift" size={32} color="#D4AF37" />
        </View>
        
        <Text style={styles.title}>Invitez vos proches 🎁</Text>
        <Text style={styles.subtitle}>
          Parrainez 3 amis et obtenez 1 mois Premium gratuit !
        </Text>

        <View style={styles.benefitsList}>
          <View style={styles.benefit}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.benefitText}>Envoyez une invitation par email</Text>
          </View>
          <View style={styles.benefit}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.benefitText}>Votre ami crée son arbre gratuitement</Text>
          </View>
          <View style={styles.benefit}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.benefitText}>Vous gagnez du Premium gratuit !</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.inviteButton}
          onPress={() => setShowModal(true)}
        >
          <Ionicons name="paper-plane" size={20} color="#0A1628" />
          <Text style={styles.inviteButtonText}>Inviter un proche</Text>
        </TouchableOpacity>
      </View>

      {/* Invitation Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowModal(false);
          setSuccess(false);
          setError('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {success ? (
              <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
                <Text style={styles.successTitle}>Invitation envoyée ! 🎉</Text>
                <Text style={styles.successText}>
                  Votre invitation a été envoyée par email. Vous serez récompensé dès que votre ami s'inscrira !
                </Text>
                <TouchableOpacity 
                  style={styles.anotherButton}
                  onPress={() => {
                    setSuccess(false);
                  }}
                >
                  <Text style={styles.anotherButtonText}>Inviter quelqu'un d'autre</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => {
                    setShowModal(false);
                    setSuccess(false);
                  }}
                >
                  <Text style={styles.closeButtonText}>Fermer</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Inviter un proche</Text>
                  <TouchableOpacity onPress={() => setShowModal(false)}>
                    <Ionicons name="close" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalDescription}>
                  Entrez l'adresse email de la personne que vous souhaitez inviter. Elle recevra un email pour créer son arbre généalogique.
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="email@exemple.com"
                  placeholderTextColor="#6B7C93"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                {error ? (
                  <Text style={styles.errorText}>{error}</Text>
                ) : null}

                <TouchableOpacity 
                  style={[styles.sendButton, submitting && styles.sendButtonDisabled]}
                  onPress={sendInvitation}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#0A1628" />
                  ) : (
                    <>
                      <Ionicons name="send" size={18} color="#0A1628" />
                      <Text style={styles.sendButtonText}>Envoyer l'invitation</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#B8C5D6',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  benefitsList: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitText: {
    color: '#B8C5D6',
    fontSize: 14,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
  },
  inviteButtonText: {
    color: '#0A1628',
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#0A1628',
    borderRadius: 16,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalDescription: {
    color: '#B8C5D6',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#1E3A5F',
    borderRadius: 8,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 12,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
    marginBottom: 12,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    padding: 16,
    gap: 8,
    marginTop: 8,
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  sendButtonText: {
    color: '#0A1628',
    fontWeight: '600',
    fontSize: 16,
  },
  successContainer: {
    alignItems: 'center',
    padding: 12,
  },
  successTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
  },
  successText: {
    color: '#B8C5D6',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  anotherButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  anotherButtonText: {
    color: '#0A1628',
    fontWeight: '600',
    fontSize: 15,
  },
  closeButton: {
    paddingVertical: 12,
    marginTop: 12,
  },
  closeButtonText: {
    color: '#6B7C93',
    fontSize: 14,
  },
});
