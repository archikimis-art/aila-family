import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://www.aila.family/api';

interface Testimonial {
  id: string;
  author_name: string;
  content: string;
  rating: number;
  author_location?: string;
  created_at: string;
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await fetch(`${API_URL}/testimonials`);
      if (response.ok) {
        const data = await response.json();
        setTestimonials(data);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitTestimonial = async () => {
    if (!name.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/testimonials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_name: name,
          author_location: location || null,
          content,
          rating,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setName('');
        setLocation('');
        setContent('');
        setRating(5);
      }
    } catch (error) {
      console.error('Error submitting testimonial:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (count: number, interactive: boolean = false) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            disabled={!interactive}
            onPress={() => interactive && setRating(star)}
          >
            <Ionicons
              name={star <= (interactive ? rating : count) ? 'star' : 'star-outline'}
              size={interactive ? 28 : 16}
              color="#D4AF37"
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#D4AF37" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💬 Ce que nos utilisateurs disent</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
          <Ionicons name="create-outline" size={18} color="#0A1628" />
          <Text style={styles.addButtonText}>Donner mon avis</Text>
        </TouchableOpacity>
      </View>

      {testimonials.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Soyez le premier à partager votre expérience !</Text>
        </View>
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {testimonials.map((testimonial) => (
            <View key={testimonial.id} style={styles.testimonialCard}>
              {renderStars(testimonial.rating)}
              <Text style={styles.testimonialContent}>"{testimonial.content}"</Text>
              <View style={styles.testimonialFooter}>
                <Text style={styles.authorName}>{testimonial.author_name}</Text>
                {testimonial.author_location && (
                  <Text style={styles.authorLocation}>{testimonial.author_location}</Text>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Modal for submitting testimonial */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {submitted ? (
              <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
                <Text style={styles.successTitle}>Merci ! 🎉</Text>
                <Text style={styles.successText}>
                  Votre témoignage a été envoyé et sera publié après validation.
                </Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => {
                    setShowModal(false);
                    setSubmitted(false);
                  }}
                >
                  <Text style={styles.closeButtonText}>Fermer</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Partagez votre expérience</Text>
                  <TouchableOpacity onPress={() => setShowModal(false)}>
                    <Ionicons name="close" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>Votre note</Text>
                {renderStars(rating, true)}

                <Text style={styles.label}>Votre nom *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Jean Dupont"
                  placeholderTextColor="#6B7C93"
                  value={name}
                  onChangeText={setName}
                />

                <Text style={styles.label}>Ville (optionnel)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Paris"
                  placeholderTextColor="#6B7C93"
                  value={location}
                  onChangeText={setLocation}
                />

                <Text style={styles.label}>Votre témoignage *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Partagez votre expérience avec AÏLA..."
                  placeholderTextColor="#6B7C93"
                  value={content}
                  onChangeText={setContent}
                  multiline
                  numberOfLines={4}
                />

                <TouchableOpacity 
                  style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                  onPress={submitTestimonial}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#0A1628" />
                  ) : (
                    <Text style={styles.submitButtonText}>Envoyer mon témoignage</Text>
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
    marginVertical: 24,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  addButtonText: {
    color: '#0A1628',
    fontWeight: '600',
    fontSize: 13,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  testimonialCard: {
    width: 280,
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  testimonialContent: {
    color: '#B8C5D6',
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  testimonialFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 12,
  },
  authorName: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  authorLocation: {
    color: '#6B7C93',
    fontSize: 12,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    color: '#6B7C93',
    fontSize: 14,
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
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  label: {
    color: '#B8C5D6',
    fontSize: 14,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#1E3A5F',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 15,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#0A1628',
    fontWeight: '600',
    fontSize: 16,
  },
  successContainer: {
    alignItems: 'center',
    padding: 20,
  },
  successTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  successText: {
    color: '#B8C5D6',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  closeButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  closeButtonText: {
    color: '#0A1628',
    fontWeight: '600',
    fontSize: 15,
  },
});
