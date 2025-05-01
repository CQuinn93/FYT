import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useOnboarding } from '@/contexts/OnboardingContext';

const activityLevels = [
  { id: 'sedentary', label: 'Sedentary', description: 'Little or no exercise' },
  { id: 'light', label: 'Lightly Active', description: 'Light exercise 1-3 days/week' },
  { id: 'moderate', label: 'Moderately Active', description: 'Moderate exercise 3-5 days/week' },
  { id: 'very', label: 'Very Active', description: 'Hard exercise 6-7 days/week' },
  { id: 'extra', label: 'Extra Active', description: 'Very hard exercise & physical job' },
];

const targetRates = [
  { id: 'slow', label: 'Relaxed (0.25 kg/week)', value: 0.25 },
  { id: 'moderate', label: 'Moderate (0.5 kg/week)', value: 0.5 },
  { id: 'fast', label: 'Fast (0.75 kg/week)', value: 0.75 },
  { id: 'very_fast', label: 'Determined (1 kg/week)', value: 1.0 },
];

const AMRCalculationScreen = () => {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [selectedRate, setSelectedRate] = useState<number | null>(null);
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleContinue = () => {
    if (selectedActivity) {
      updateOnboardingData({
        activity_level: selectedActivity,
        target_rate: selectedRate
      });
      router.push('/(tabs)/onboarding/macro-split' as any);
    }
  };

  // Only show target rate for weight loss or muscle gain goals
  const shouldShowTargetRate = onboardingData.fitness_goal === 'lose_weight' || 
                             onboardingData.fitness_goal === 'gain_muscle';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <ThemedText type="title">Calculate Your AMR</ThemedText>
            <ThemedText type="subtitle">Active Metabolic Rate (AMR) is your daily calorie needs based on activity level</ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Activity Level</ThemedText>
            <View style={styles.activitiesContainer}>
              {activityLevels.map((activity) => (
                <TouchableOpacity
                  key={activity.id}
                  style={[
                    styles.activityButton,
                    selectedActivity === activity.id && styles.selectedActivity,
                    { borderColor: colors.border }
                  ]}
                  onPress={() => setSelectedActivity(activity.id)}
                >
                  <ThemedText style={[
                    styles.activityText,
                    selectedActivity === activity.id && styles.selectedActivityText
                  ]}>
                    {activity.label}
                  </ThemedText>
                  <ThemedText style={styles.activityDescription}>
                    {activity.description}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {shouldShowTargetRate && (
            <View style={styles.section}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                {onboardingData.fitness_goal === 'lose_weight' ? 'Weight Loss Rate' : 'Muscle Gain Rate'}
              </ThemedText>
              <View style={styles.ratesContainer}>
                {targetRates.map((rate) => (
                  <TouchableOpacity
                    key={rate.id}
                    style={[
                      styles.rateButton,
                      selectedRate === rate.value && styles.selectedRate,
                      { borderColor: colors.border }
                    ]}
                    onPress={() => setSelectedRate(rate.value)}
                  >
                    <ThemedText style={[
                      styles.rateText,
                      selectedRate === rate.value && styles.selectedRateText
                    ]}>
                      {rate.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              (!selectedActivity || (shouldShowTargetRate && !selectedRate)) && styles.disabledButton,
              { backgroundColor: '#34C759' }
            ]}
            onPress={handleContinue}
            disabled={!selectedActivity || (shouldShowTargetRate && !selectedRate)}
          >
            <ThemedText style={styles.continueButtonText}>
              Continue
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    marginBottom: 15,
    fontSize: 18,
  },
  activitiesContainer: {
    gap: 15,
  },
  activityButton: {
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
  },
  selectedActivity: {
    borderWidth: 2,
    borderColor: '#34C759',
    backgroundColor: '#34C759',
  },
  activityText: {
    fontSize: 16,
    marginBottom: 5,
  },
  selectedActivityText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  activityDescription: {
    fontSize: 14,
    opacity: 0.8,
  },
  ratesContainer: {
    gap: 15,
  },
  rateButton: {
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  selectedRate: {
    borderWidth: 2,
    borderColor: '#34C759',
    backgroundColor: '#34C759',
  },
  rateText: {
    fontSize: 16,
  },
  selectedRateText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  continueButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AMRCalculationScreen; 