import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Ionicons } from '@expo/vector-icons';

type Goal = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

const goals: Goal[] = [
  {
    id: 'lose_weight',
    title: 'Lose Weight',
    description: 'Focus on fat loss and improving body composition',
    icon: 'trending-down-outline',
  },
  {
    id: 'gain_muscle',
    title: 'Gain Muscle',
    description: 'Build strength and increase muscle mass',
    icon: 'barbell-outline',
  },
  {
    id: 'maintain_weight',
    title: 'Maintain Weight',
    description: 'Keep current fitness level and body composition',
    icon: 'scale-outline',
  },
];

const FitnessGoalsScreen = () => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleContinue = async () => {
    if (selectedGoal) {
      updateOnboardingData({ fitness_goal: selectedGoal });
      router.push('/(tabs)/onboarding/body-fat-estimation' as any);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <ThemedText type="title">What's your main goal?</ThemedText>
            <ThemedText type="subtitle">Select your primary fitness objective</ThemedText>
          </View>

          <View style={styles.goalsContainer}>
            {goals.map((goal) => (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.goalCard,
                  selectedGoal === goal.id && styles.selectedGoal,
                  { borderColor: colors.border }
                ]}
                onPress={() => setSelectedGoal(goal.id)}
              >
                <View style={styles.goalIconContainer}>
                  <Ionicons 
                    name={goal.icon as any} 
                    size={24} 
                    color={selectedGoal === goal.id ? 'white' : '#34C759'} 
                  />
                </View>
                <View style={styles.goalTextContainer}>
                  <ThemedText 
                    style={[
                      styles.goalTitle,
                      selectedGoal === goal.id && styles.selectedText
                    ]}
                  >
                    {goal.title}
                  </ThemedText>
                  <ThemedText 
                    style={[
                      styles.goalDescription,
                      selectedGoal === goal.id && styles.selectedText
                    ]}
                  >
                    {goal.description}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedGoal && styles.disabledButton,
              { backgroundColor: '#34C759' }
            ]}
            onPress={handleContinue}
            disabled={!selectedGoal}
          >
            <ThemedText style={styles.continueButtonText}>Continue</ThemedText>
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
  goalsContainer: {
    gap: 15,
  },
  goalCard: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  selectedGoal: {
    borderWidth: 2,
    borderColor: '#34C759',
    backgroundColor: '#34C759',
  },
  goalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  goalTextContainer: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
    opacity: 0.8,
  },
  selectedText: {
    color: 'white',
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

export default FitnessGoalsScreen; 