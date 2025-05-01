import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from '@/contexts/OnboardingContext';

export default function DashboardScreen() {
  const { onboardingData } = useOnboarding();

  const renderMetricCard = (title: string, value: string | number, icon: string) => (
    <TouchableOpacity style={styles.metricCard}>
      <Ionicons name={icon as any} size={24} color="#34C759" />
      <ThemedText style={styles.metricValue}>{value}</ThemedText>
      <ThemedText style={styles.metricTitle}>{title}</ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <ThemedText type="title">Dashboard</ThemedText>
          <ThemedText type="subtitle">Your daily overview</ThemedText>
        </View>

        <View style={styles.metricsGrid}>
          {renderMetricCard('Calories', `${onboardingData?.amr || 0}`, 'flame-outline')}
          {renderMetricCard('Protein', `${onboardingData?.protein_grams || 0}g`, 'nutrition-outline')}
          {renderMetricCard('Carbs', `${onboardingData?.carb_grams || 0}g`, 'barbell-outline')}
          {renderMetricCard('Fat', `${onboardingData?.fat_grams || 0}g`, 'fitness-outline')}
        </View>

        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Quick Actions</ThemedText>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="restaurant-outline" size={24} color="#34C759" />
              <ThemedText style={styles.actionText}>Log Meal</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="fitness-outline" size={24} color="#34C759" />
              <ThemedText style={styles.actionText}>Log Workout</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="footsteps-outline" size={24} color="#34C759" />
              <ThemedText style={styles.actionText}>Steps</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="water-outline" size={24} color="#34C759" />
              <ThemedText style={styles.actionText}>Water</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Today's Progress</ThemedText>
          <View style={styles.progressCard}>
            <ThemedText style={styles.progressText}>Track your daily progress here</ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 30,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#34C759',
    alignItems: 'center',
    gap: 10,
  },
  metricValue: {
    fontSize: 24,
    color: '#34C759',
  },
  metricTitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 15,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#34C759',
    alignItems: 'center',
    gap: 10,
  },
  actionText: {
    fontSize: 16,
  },
  progressCard: {
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#34C759',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    opacity: 0.8,
  },
}); 