import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useOnboarding } from '@/contexts/OnboardingContext';

const bodyFatRanges = [
  { id: 'very_lean', label: 'Very Lean (6-10%)', male: { min: 6, max: 10 }, female: { min: 14, max: 18 } },
  { id: 'lean', label: 'Lean (11-14%)', male: { min: 11, max: 14 }, female: { min: 19, max: 22 } },
  { id: 'moderate', label: 'Moderate (15-20%)', male: { min: 15, max: 20 }, female: { min: 23, max: 28 } },
  { id: 'above_average', label: 'Above Average (21-24%)', male: { min: 21, max: 24 }, female: { min: 29, max: 32 } },
  { id: 'high', label: 'High (25-30%)', male: { min: 25, max: 30 }, female: { min: 33, max: 38 } },
  { id: 'very_high', label: 'Very High (31%+)', male: { min: 31, max: 40 }, female: { min: 39, max: 45 } },
];

const BodyFatEstimationScreen = () => {
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<string | null>(null);
  const { updateOnboardingData } = useOnboarding();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleContinue = () => {
    if (selectedGender && selectedRange) {
      const range = bodyFatRanges.find(r => r.id === selectedRange);
      if (range) {
        const bodyFatPercentage = selectedGender === 'male' 
          ? (range.male.min + range.male.max) / 2 
          : (range.female.min + range.female.max) / 2;
        
        updateOnboardingData({
          gender: selectedGender,
          body_fat_percentage: bodyFatPercentage
        });
        router.push('/(tabs)/onboarding/bmr-calculation');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <ThemedText type="title">Estimate Your Body Fat</ThemedText>
            <ThemedText type="subtitle">Select your gender and body fat range</ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Gender</ThemedText>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  selectedGender === 'male' && styles.selectedGender,
                  { borderColor: colors.border }
                ]}
                onPress={() => setSelectedGender('male')}
              >
                <ThemedText style={[
                  styles.genderText,
                  selectedGender === 'male' && styles.selectedGenderText
                ]}>
                  Male
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  selectedGender === 'female' && styles.selectedGender,
                  { borderColor: colors.border }
                ]}
                onPress={() => setSelectedGender('female')}
              >
                <ThemedText style={[
                  styles.genderText,
                  selectedGender === 'female' && styles.selectedGenderText
                ]}>
                  Female
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {selectedGender && (
            <View style={styles.section}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Body Fat Range</ThemedText>
              <View style={styles.rangesContainer}>
                {bodyFatRanges.map((range) => (
                  <TouchableOpacity
                    key={range.id}
                    style={[
                      styles.rangeButton,
                      selectedRange === range.id && styles.selectedRange,
                      { borderColor: colors.border }
                    ]}
                    onPress={() => setSelectedRange(range.id)}
                  >
                    <ThemedText style={[
                      styles.rangeText,
                      selectedRange === range.id && styles.selectedRangeText
                    ]}>
                      {range.label}
                    </ThemedText>
                    <ThemedText style={styles.rangeDescription}>
                      {selectedGender === 'male' 
                        ? `Male: ${range.male.min}-${range.male.max}%`
                        : `Female: ${range.female.min}-${range.female.max}%`}
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
              (!selectedGender || !selectedRange) && styles.disabledButton,
              { backgroundColor: '#34C759' }
            ]}
            onPress={handleContinue}
            disabled={!selectedGender || !selectedRange}
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
  genderContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  genderButton: {
    flex: 1,
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  selectedGender: {
    borderWidth: 2,
    borderColor: '#34C759',
    backgroundColor: '#34C759',
  },
  genderText: {
    fontSize: 16,
  },
  selectedGenderText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  rangesContainer: {
    gap: 15,
  },
  rangeButton: {
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
  },
  selectedRange: {
    borderWidth: 2,
    borderColor: '#34C759',
    backgroundColor: '#34C759',
  },
  rangeText: {
    fontSize: 16,
    marginBottom: 5,
  },
  selectedRangeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  rangeDescription: {
    fontSize: 14,
    opacity: 0.8,
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

export default BodyFatEstimationScreen; 