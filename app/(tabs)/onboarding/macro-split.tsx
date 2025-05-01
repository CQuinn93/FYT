import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import Slider from '@react-native-community/slider';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { supabase } from '@/lib/supabase';

type ExerciseType = 'gym' | 'running' | 'sports' | 'steps';
type DayType = 'rest' | 'workout';

const MacroSplitScreen = () => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType | null>(null);
  const [recommendations, setRecommendations] = useState<{
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    workouts: number;
    steps: number;
    notes: string[];
  } | null>(null);
  const [dayType, setDayType] = useState<DayType>('rest');
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [selectedGender, setSelectedGender] = useState<string | null>(null);

  useEffect(() => {
    if (onboardingData) {
      calculateRecommendations();
    }
  }, [onboardingData, selectedExercise]);

  const calculateRecommendations = () => {
    if (!onboardingData?.bmr || !onboardingData?.activity_level || !onboardingData?.weight) return;

    // Base TDEE calculation
    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very: 1.725,
      extra: 1.9
    };

    // Activity calorie burns (per session)
    const activityCalories: Record<ExerciseType, number> = {
      gym: 300,
      running: 400,
      sports: 350,
      steps: 200
    };

    let baseCalories = onboardingData.bmr;
    let targetCalories = baseCalories;
    let proteinPerKg = 1.6;
    let carbPercentage = 0.45;
    let fatPercentage = 0.25;
    let workoutsPerWeek = 3;
    let stepGoal = 8000;
    const notes: string[] = [];

    // Calculate base calorie adjustments
    const weeklyDeficit = (onboardingData.target_rate || 0.5) * 7700;
    const dailyDeficit = weeklyDeficit / 7;
    const weeklySurplus = (onboardingData.target_rate || 0.25) * 5500;
    const dailySurplus = weeklySurplus / 7;

    // Adjust base calories based on goal
    switch (onboardingData.fitness_goal) {
      case 'lose_weight':
        const firstWeekDeficit = dailyDeficit * 0.5;
        targetCalories = Math.round(baseCalories - firstWeekDeficit);
        
        notes.push("First week: Starting with a moderate calorie deficit to help you adjust");
        notes.push("We'll review your progress after 1 week and adjust if needed");
        
        if (onboardingData.body_fat_percentage && onboardingData.body_fat_percentage > 25) {
          proteinPerKg = 2.0;
          notes.push("Higher protein intake recommended to preserve muscle during fat loss");
        }
        break;

      case 'gain_muscle':
        const firstWeekSurplus = dailySurplus * 0.5;
        targetCalories = Math.round(baseCalories + firstWeekSurplus);
        proteinPerKg = 2.2;
        
        notes.push("First week: Starting with a moderate calorie surplus to help you adjust");
        notes.push("We'll review your progress after 1 week and adjust if needed");
        
        if (onboardingData.body_fat_percentage && onboardingData.body_fat_percentage > 20) {
          notes.push("Consider a body recomposition approach");
        }
        break;

      case 'maintain_weight':
        targetCalories = baseCalories;
        notes.push("Focus on maintaining your current weight while optimizing body composition");
        break;
    }

    // Adjust for activity level
    targetCalories = Math.round(targetCalories * activityMultipliers[onboardingData.activity_level]);

    // Add activity-specific adjustments
    if (selectedExercise) {
      const activityCalorieBurn = activityCalories[selectedExercise];
      const weeklyActivityCalories = activityCalorieBurn * workoutsPerWeek;
      const dailyActivityCalories = Math.round(weeklyActivityCalories / 7);
      
      // Add activity calories to target
      targetCalories += dailyActivityCalories;
      
      notes.push(`Added ${dailyActivityCalories} calories for ${selectedExercise} activities`);
      notes.push(`On workout days, you may want to eat ${activityCalorieBurn} more calories`);
      notes.push(`On rest days, you can reduce calories by ${Math.round(activityCalorieBurn * 0.5)}`);
    }

    // Add tracking information
    notes.push(`Target rate: ${onboardingData.target_rate}kg per week`);
    notes.push(`Activity level: ${onboardingData.activity_level}`);
    notes.push(`Next review: After 1 week of tracking`);
    notes.push("Tip: Focus on consistency with your meal plan this week");

    // Adjust macros and activity goals based on exercise type
    if (selectedExercise) {
      switch (selectedExercise) {
        case 'gym':
          notes.push("Higher protein intake for muscle recovery and growth");
          break;
        case 'running':
          notes.push("Higher carb intake for sustained energy during runs");
          break;
        case 'sports':
          notes.push("Balanced macros for high-intensity sports performance");
          break;
        case 'steps':
          notes.push("Focus on daily activity and step goals");
          break;
      }
    }

    // Calculate final macros
    const proteinGrams = Math.round(onboardingData.weight * proteinPerKg);
    const proteinCalories = proteinGrams * 4;
    const remainingCalories = targetCalories - proteinCalories;
    const carbGrams = Math.round((remainingCalories * carbPercentage) / 4);
    const fatGrams = Math.round((remainingCalories * fatPercentage) / 9);

    setRecommendations({
      calories: targetCalories,
      protein: proteinGrams,
      carbs: carbGrams,
      fat: fatGrams,
      workouts: workoutsPerWeek,
      steps: stepGoal,
      notes
    });
  };

  const handleContinue = async () => {
    if (recommendations && selectedExercise) {
      setIsLoading(true);
      try {
        updateOnboardingData({
          protein_grams: recommendations.protein,
          carb_grams: recommendations.carbs,
          fat_grams: recommendations.fat,
          daily_steps: recommendations.steps,
          exercise_type: selectedExercise,
          gender: onboardingData.gender,
          body_fat_percentage: onboardingData.body_fat_percentage
        });

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase
            .from('user_metrics')
            .upsert({
              user_id: user.id,
              age: onboardingData.age,
              height: onboardingData.height,
              weight: onboardingData.weight,
              body_fat_perc: onboardingData.body_fat_percentage,
              bmr: onboardingData.bmr,
              amr: recommendations.calories,
              activity_level: onboardingData.activity_level,
              gender: onboardingData.gender,
              fitness_goal: onboardingData.fitness_goal,
              carb_grams: recommendations.carbs,
              protein_grams: recommendations.protein,
              fat_grams: recommendations.fat,
              daily_steps: recommendations.steps,
              exercise_type: selectedExercise,
              macro_split: JSON.stringify({
                protein: recommendations.protein,
                carbs: recommendations.carbs,
                fat: recommendations.fat,
              }),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (error) throw error;

          // Update the profiles table to mark onboarding as complete and set start_date if not already set
          await supabase
            .from('profiles')
            .update({
              has_completed_onboarding: true,
              start_date: new Date().toISOString(),
            })
            .eq('id', user.id);

          router.push('/(tabs)/loading');
        }
      } catch (error) {
        console.error('Error saving user metrics:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Helper to get calories/macros for rest or workout day
  const getDayNutrition = (type: DayType) => {
    if (!recommendations || !selectedExercise || !onboardingData.weight) return null;
    const activityCalories: Record<ExerciseType, number> = {
      gym: 300,
      running: 400,
      sports: 350,
      steps: 200
    };
    let calories = recommendations.calories;
    if (type === 'workout') {
      calories += activityCalories[selectedExercise];
    }
    // Use the same proteinPerKg, carbPercentage, fatPercentage as in recommendations
    const proteinGrams = recommendations.protein;
    const proteinCalories = proteinGrams * 4;
    const remainingCalories = calories - proteinCalories;
    // Estimate percentages from recommendations
    const carbGrams = Math.round((remainingCalories * (recommendations.carbs * 4 / (remainingCalories))) / 4);
    const fatGrams = Math.round((remainingCalories * (recommendations.fat * 9 / (remainingCalories))) / 9);
    // Or, if you have the original percentages, use them directly
    // const carbGrams = Math.round((remainingCalories * carbPercentage) / 4);
    // const fatGrams = Math.round((remainingCalories * fatPercentage) / 9);
    return {
      calories,
      protein: proteinGrams,
      carbs: Math.round((remainingCalories * recommendations.carbs * 4 / (recommendations.carbs * 4 + recommendations.fat * 9)) / 4),
      fat: Math.round((remainingCalories * recommendations.fat * 9 / (recommendations.carbs * 4 + recommendations.fat * 9)) / 9),
    };
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <ThemedText type="title">Your Personalized Plan</ThemedText>
            <ThemedText type="subtitle">Based on your goals and current metrics</ThemedText>
          </View>

          {recommendations && (
            <>
              <View style={styles.summarySection}>
                <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Your Profile</ThemedText>
                <View style={styles.summaryContainer}>
                  <View style={styles.summaryRow}>
                    <ThemedText style={styles.summaryLabel}>Main Goal:</ThemedText>
                    <ThemedText style={styles.summaryValue}>
                      {onboardingData.fitness_goal === 'lose_weight' ? 'Lose Weight' :
                       onboardingData.fitness_goal === 'gain_muscle' ? 'Gain Muscle' :
                       'Maintain Weight'}
                    </ThemedText>
                  </View>
                  <View style={styles.summaryRow}>
                    <ThemedText style={styles.summaryLabel}>Activity Level:</ThemedText>
                    <ThemedText style={styles.summaryValue}>
                      {onboardingData.activity_level === 'sedentary' ? 'Sedentary' :
                       onboardingData.activity_level === 'light' ? 'Lightly Active' :
                       onboardingData.activity_level === 'moderate' ? 'Moderately Active' :
                       onboardingData.activity_level === 'very' ? 'Very Active' :
                       'Extra Active'}
                    </ThemedText>
                  </View>
                  <View style={styles.summaryRow}>
                    <ThemedText style={styles.summaryLabel}>BMR:</ThemedText>
                    <ThemedText style={styles.summaryValue}>{onboardingData.bmr} calories</ThemedText>
                  </View>
                  {onboardingData.body_fat_percentage && (
                    <View style={styles.summaryRow}>
                      <ThemedText style={styles.summaryLabel}>Body Fat:</ThemedText>
                      <ThemedText style={styles.summaryValue}>{onboardingData.body_fat_percentage}%</ThemedText>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.section}>
                <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Exercise Type</ThemedText>
                <View style={styles.exerciseContainer}>
                  <TouchableOpacity
                    style={[
                      styles.exerciseButton,
                      selectedExercise === 'gym' && styles.selectedExerciseButton
                    ]}
                    onPress={() => setSelectedExercise('gym')}
                  >
                    <ThemedText style={[
                      styles.exerciseButtonText,
                      selectedExercise === 'gym' && styles.selectedExerciseButtonText
                    ]}>Gym Workouts</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.exerciseButton,
                      selectedExercise === 'running' && styles.selectedExerciseButton
                    ]}
                    onPress={() => setSelectedExercise('running')}
                  >
                    <ThemedText style={[
                      styles.exerciseButtonText,
                      selectedExercise === 'running' && styles.selectedExerciseButtonText
                    ]}>Running</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.exerciseButton,
                      selectedExercise === 'sports' && styles.selectedExerciseButton
                    ]}
                    onPress={() => setSelectedExercise('sports')}
                  >
                    <ThemedText style={[
                      styles.exerciseButtonText,
                      selectedExercise === 'sports' && styles.selectedExerciseButtonText
                    ]}>High Intensity Sports</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.exerciseButton,
                      selectedExercise === 'steps' && styles.selectedExerciseButton
                    ]}
                    onPress={() => setSelectedExercise('steps')}
                  >
                    <ThemedText style={[
                      styles.exerciseButtonText,
                      selectedExercise === 'steps' && styles.selectedExerciseButtonText
                    ]}>Step Goal Focus</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.section}>
                <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Daily Nutrition</ThemedText>
                <View style={styles.dayTabContainer}>
                  <TouchableOpacity
                    style={[styles.dayTab, dayType === 'rest' && styles.activeDayTab]}
                    onPress={() => setDayType('rest')}
                  >
                    <ThemedText style={[styles.dayTabText, dayType === 'rest' && styles.activeDayTabText]}>Rest Day</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.dayTab, dayType === 'workout' && styles.activeDayTab]}
                    onPress={() => setDayType('workout')}
                  >
                    <ThemedText style={[styles.dayTabText, dayType === 'workout' && styles.activeDayTabText]}>Workout Day</ThemedText>
                  </TouchableOpacity>
                </View>

                <View style={styles.caloriesCard}>
                  <ThemedText style={styles.caloriesValue}>{getDayNutrition(dayType)?.calories}</ThemedText>
                  <ThemedText style={styles.caloriesLabel}>Calories</ThemedText>
                </View>

                {/* Macro boxes for the selected day */}
                {(() => {
                  const dayNutrition = getDayNutrition(dayType);
                  if (!dayNutrition) return null;
                  return (
                    <View style={styles.macroContainer}>
                      <View style={styles.macroCard}>
                        <ThemedText style={styles.macroValue}>{dayNutrition.protein}g</ThemedText>
                        <ThemedText style={styles.macroLabel}>Protein</ThemedText>
                      </View>
                      <View style={styles.macroCard}>
                        <ThemedText style={styles.macroValue}>{dayNutrition.carbs}g</ThemedText>
                        <ThemedText style={styles.macroLabel}>Carbs</ThemedText>
                      </View>
                      <View style={styles.macroCard}>
                        <ThemedText style={styles.macroValue}>{dayNutrition.fat}g</ThemedText>
                        <ThemedText style={styles.macroLabel}>Fat</ThemedText>
                      </View>
                    </View>
                  );
                })()}
              </View>

              <View style={styles.section}>
                <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Activity Goals</ThemedText>
                <View style={styles.activityContainer}>
                  <View style={styles.activityCard}>
                    <ThemedText style={styles.activityValue}>{recommendations.workouts}</ThemedText>
                    <ThemedText style={styles.activityLabel}>Workouts per week</ThemedText>
                  </View>
                  <View style={styles.activityCard}>
                    <ThemedText style={styles.activityValue}>{recommendations.steps.toLocaleString()}</ThemedText>
                    <ThemedText style={styles.activityLabel}>Daily steps</ThemedText>
                  </View>
                </View>
              </View>

              {recommendations.notes.length > 0 && (
                <View style={styles.section}>
                  <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Recommendations</ThemedText>
                  <View style={styles.notesContainer}>
                    {recommendations.notes.map((note, index) => (
                      <View key={index} style={styles.noteItem}>
                        <ThemedText style={styles.noteText}>• {note}</ThemedText>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              (!recommendations || !selectedExercise || isLoading) && styles.disabledButton,
              { backgroundColor: '#34C759' }
            ]}
            onPress={handleContinue}
            disabled={!recommendations || !selectedExercise || isLoading}
          >
            <ThemedText style={styles.continueButtonText}>
              {isLoading ? 'Saving...' : 'Complete'}
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
  summarySection: {
    marginBottom: 30,
  },
  summaryContainer: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#34C759',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(52, 199, 89, 0.2)',
  },
  summaryLabel: {
    fontSize: 16,
    opacity: 0.8,
  },
  summaryValue: {
    fontSize: 16,
    color: '#34C759',
    fontWeight: '600',
  },
  exerciseContainer: {
    gap: 10,
  },
  exerciseButton: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#34C759',
    alignItems: 'center',
  },
  selectedExerciseButton: {
    backgroundColor: '#34C759',
  },
  exerciseButtonText: {
    fontSize: 16,
    color: '#34C759',
  },
  selectedExerciseButtonText: {
    color: '#fff',
  },
  caloriesCard: {
    paddingTop: 30,
    paddingBottom: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    minHeight: 140,
    width: '100%',
  },
  caloriesValue: {
    fontSize: 42,
    color: '#34C759',
    marginBottom: 5,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 50,
  },
  caloriesLabel: {
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'center',
  },
  dayTabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dayTab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  activeDayTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#34C759',
  },
  dayTabText: {
    fontSize: 16,
    color: '#34C759',
  },
  activeDayTabText: {
    fontWeight: 'bold',
  },
  macroContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  macroCard: {
    flex: 1,
    minWidth: '45%',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#34C759',
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 24,
    color: '#34C759',
    marginBottom: 5,
  },
  macroLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  activityContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  activityCard: {
    flex: 1,
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#34C759',
    alignItems: 'center',
  },
  activityValue: {
    fontSize: 24,
    color: '#34C759',
    marginBottom: 5,
  },
  activityLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  notesContainer: {
    gap: 10,
  },
  noteItem: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#34C759',
  },
  noteText: {
    fontSize: 14,
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

export default MacroSplitScreen; 