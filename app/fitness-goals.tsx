import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, ScrollView, SafeAreaView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
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
    id: 'get_fit',
    title: 'Get Fit',
    description: 'Improve overall fitness and endurance',
    icon: 'fitness-outline',
  },
  {
    id: 'maintain',
    title: 'Maintain',
    description: 'Keep current fitness level and body composition',
    icon: 'scale-outline',
  },
  {
    id: 'improve_health',
    title: 'Improve Health',
    description: 'Focus on overall health and wellness',
    icon: 'heart-outline',
  },
  {
    id: 'sport_specific',
    title: 'Sport Specific',
    description: 'Train for a specific sport or activity',
    icon: 'trophy-outline',
  },
  {
    id: 'rehabilitation',
    title: 'Rehabilitation',
    description: 'Recover from injury and rebuild strength',
    icon: 'medkit-outline',
  },
  {
    id: 'stress_relief',
    title: 'Stress Relief',
    description: 'Use exercise to manage stress and improve mental health',
    icon: 'happy-outline',
  },
];

export default function FitnessGoalsScreen() {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const handleContinue = async () => {
    if (selectedGoal) {
      // TODO: Save the selected goal to the user's profile
      router.push('/body-fat-estimation');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText type="title" style={styles.title}>What's Your Main Goal?</ThemedText>
          <ThemedText style={styles.subtitle}>
            Select your primary fitness objective to help us personalize your experience
          </ThemedText>

          <View style={styles.goalsContainer}>
            {goals.map((goal) => (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.goalCard,
                  selectedGoal === goal.id && styles.selectedGoal
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
              !selectedGoal && styles.disabledButton
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
}

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
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 30,
    lineHeight: 24,
  },
  goalsContainer: {
    gap: 15,
  },
  goalCard: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#34C759',
  },
  selectedGoal: {
    backgroundColor: '#34C759',
  },
  goalIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
    color: '#34C759',
  },
  goalDescription: {
    fontSize: 14,
    opacity: 0.8,
    color: '#34C759',
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
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 