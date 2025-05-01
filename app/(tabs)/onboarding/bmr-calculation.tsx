import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useOnboarding } from '@/contexts/OnboardingContext';

type UnitSystem = 'metric' | 'imperial';

const BMRCalculationScreen = () => {
  const [heightUnit, setHeightUnit] = useState<UnitSystem>('metric');
  const [weightUnit, setWeightUnit] = useState<UnitSystem>('metric');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [weightStone, setWeightStone] = useState('');
  const [weightPounds, setWeightPounds] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Convert cm to feet and inches
  const cmToFeetInches = (cm: number) => {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return { feet, inches };
  };

  // Convert feet and inches to cm
  const feetInchesToCm = (feet: number, inches: number) => {
    return Math.round((feet * 12 + inches) * 2.54);
  };

  // Convert kg to stone and pounds
  const kgToStonePounds = (kg: number) => {
    const totalPounds = kg * 2.20462;
    const stone = Math.floor(totalPounds / 14);
    const pounds = Math.round(totalPounds % 14);
    return { stone, pounds };
  };

  // Convert stone and pounds to kg
  const stonePoundsToKg = (stone: number, pounds: number) => {
    return Math.round((stone * 14 + pounds) * 0.453592);
  };

  // Update imperial height when metric changes
  React.useEffect(() => {
    if (height && heightUnit === 'metric') {
      const cm = parseFloat(height);
      if (!isNaN(cm)) {
        const { feet, inches } = cmToFeetInches(cm);
        setHeightFeet(feet.toString());
        setHeightInches(inches.toString());
      }
    }
  }, [height, heightUnit]);

  // Update metric height when imperial changes
  React.useEffect(() => {
    if (heightFeet && heightInches && heightUnit === 'imperial') {
      const feet = parseFloat(heightFeet);
      const inches = parseFloat(heightInches);
      if (!isNaN(feet) && !isNaN(inches)) {
        const cm = feetInchesToCm(feet, inches);
        setHeight(cm.toString());
      }
    }
  }, [heightFeet, heightInches, heightUnit]);

  // Update imperial weight when metric changes
  React.useEffect(() => {
    if (weight && weightUnit === 'metric') {
      const kg = parseFloat(weight);
      if (!isNaN(kg)) {
        const { stone, pounds } = kgToStonePounds(kg);
        setWeightStone(stone.toString());
        setWeightPounds(pounds.toString());
      }
    }
  }, [weight, weightUnit]);

  // Update metric weight when imperial changes
  React.useEffect(() => {
    if (weightStone && weightPounds && weightUnit === 'imperial') {
      const stone = parseFloat(weightStone);
      const pounds = parseFloat(weightPounds);
      if (!isNaN(stone) && !isNaN(pounds)) {
        const kg = stonePoundsToKg(stone, pounds);
        setWeight(kg.toString());
      }
    }
  }, [weightStone, weightPounds, weightUnit]);

  const calculateBMR = () => {
    // Check if we have all required data
    if (!age || !onboardingData?.gender) {
      console.log('Missing required data:', { age, gender: onboardingData?.gender });
      return null;
    }

    const ageNum = parseFloat(age);
    let weightNum = 0;
    let heightNum = 0;

    // Get weight in kg
    if (weightUnit === 'metric') {
      weightNum = parseFloat(weight);
    } else {
      const stone = parseFloat(weightStone);
      const pounds = parseFloat(weightPounds);
      if (!isNaN(stone) && !isNaN(pounds)) {
        weightNum = stonePoundsToKg(stone, pounds);
      }
    }

    // Get height in cm
    if (heightUnit === 'metric') {
      heightNum = parseFloat(height);
    } else {
      const feet = parseFloat(heightFeet);
      const inches = parseFloat(heightInches);
      if (!isNaN(feet) && !isNaN(inches)) {
        heightNum = feetInchesToCm(feet, inches);
      }
    }

    // Validate all numbers
    if (isNaN(ageNum) || isNaN(weightNum) || isNaN(heightNum)) {
      console.log('Invalid numbers:', { ageNum, weightNum, heightNum });
      return null;
    }

    console.log('Calculating BMR with:', {
      age: ageNum,
      weight: weightNum,
      height: heightNum,
      gender: onboardingData.gender,
      bodyFat: onboardingData.body_fat_percentage
    });

    // If we have body fat percentage, use Katch-McArdle formula
    if (onboardingData.body_fat_percentage !== null) {
      // Calculate Lean Body Mass (LBM)
      const lbm = weightNum * (1 - (onboardingData.body_fat_percentage / 100));
      // Katch-McArdle formula with gender adjustment
      const baseBMR = 370 + (21.6 * lbm);
      const adjustedBMR = onboardingData.gender === 'female' ? baseBMR * 0.95 : baseBMR;
      console.log('Katch-McArdle BMR:', adjustedBMR);
      return Math.round(adjustedBMR);
    }

    // Fall back to Mifflin-St Jeor if no body fat data
    const mifflinBMR = onboardingData.gender === 'male' 
      ? 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5
      : 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;
    
    console.log('Mifflin-St Jeor BMR:', mifflinBMR);
    return Math.round(mifflinBMR);
  };

  const handleContinue = async () => {
    const bmr = calculateBMR();
    if (bmr) {
      setIsLoading(true);
      try {
        // Convert all measurements to metric for storage
        const heightInCm = heightUnit === 'metric' 
          ? parseFloat(height) 
          : (parseFloat(heightFeet) * 12 + parseFloat(heightInches)) * 2.54;
        
        const weightInKg = weightUnit === 'metric' 
          ? parseFloat(weight) 
          : (parseFloat(weightStone) * 14 + parseFloat(weightPounds)) * 0.453592;

        // Update the onboarding context with the new data
        updateOnboardingData({
          age: parseInt(age),
          height: heightInCm,
          weight: weightInKg,
          bmr: bmr
        });

        router.push('/(tabs)/onboarding/amr-calculation');
      } catch (error) {
        console.error('Error updating onboarding data:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const bmr = calculateBMR();
  console.log('Current BMR:', bmr);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <ThemedText type="title">Calculate Your BMR</ThemedText>
            <ThemedText type="subtitle">Basal Metabolic Rate (BMR) is the number of calories your body needs at rest</ThemedText>
          </View>

          <View style={styles.inputSection}>
            <ThemedText type="defaultSemiBold" style={styles.inputLabel}>Age</ThemedText>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: '#FFFFFF' }]}
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              placeholder="Enter your age"
              placeholderTextColor={colors.text + '80'}
            />
          </View>

          <View style={styles.inputSection}>
            <View style={styles.unitToggleContainer}>
              <ThemedText type="defaultSemiBold" style={styles.inputLabel}>Height</ThemedText>
              <View style={styles.unitToggle}>
                <TouchableOpacity
                  style={[
                    styles.unitButton,
                    heightUnit === 'metric' && styles.selectedUnit,
                    { borderColor: colors.border }
                  ]}
                  onPress={() => setHeightUnit('metric')}
                >
                  <ThemedText style={styles.unitText}>cm</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.unitButton,
                    heightUnit === 'imperial' && styles.selectedUnit,
                    { borderColor: colors.border }
                  ]}
                  onPress={() => setHeightUnit('imperial')}
                >
                  <ThemedText style={styles.unitText}>ft & in</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
            {heightUnit === 'metric' ? (
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: '#FFFFFF' }]}
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
                placeholder="Enter height in cm"
                placeholderTextColor={colors.text + '80'}
              />
            ) : (
              <View style={styles.heightInputContainer}>
                <TextInput
                  style={[styles.input, styles.heightInput, { borderColor: colors.border, color: '#FFFFFF' }]}
                  value={heightFeet}
                  onChangeText={setHeightFeet}
                  keyboardType="numeric"
                  placeholder="ft"
                  placeholderTextColor={colors.text + '80'}
                />
                <TextInput
                  style={[styles.input, styles.heightInput, { borderColor: colors.border, color: '#FFFFFF' }]}
                  value={heightInches}
                  onChangeText={setHeightInches}
                  keyboardType="numeric"
                  placeholder="in"
                  placeholderTextColor={colors.text + '80'}
                />
              </View>
            )}
          </View>

          <View style={styles.inputSection}>
            <View style={styles.unitToggleContainer}>
              <ThemedText type="defaultSemiBold" style={styles.inputLabel}>Weight</ThemedText>
              <View style={styles.unitToggle}>
                <TouchableOpacity
                  style={[
                    styles.unitButton,
                    weightUnit === 'metric' && styles.selectedUnit,
                    { borderColor: colors.border }
                  ]}
                  onPress={() => setWeightUnit('metric')}
                >
                  <ThemedText style={styles.unitText}>kg</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.unitButton,
                    weightUnit === 'imperial' && styles.selectedUnit,
                    { borderColor: colors.border }
                  ]}
                  onPress={() => setWeightUnit('imperial')}
                >
                  <ThemedText style={styles.unitText}>st & lbs</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
            {weightUnit === 'metric' ? (
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: '#FFFFFF' }]}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                placeholder="Enter weight in kg"
                placeholderTextColor={colors.text + '80'}
              />
            ) : (
              <View style={styles.heightInputContainer}>
                <TextInput
                  style={[styles.input, styles.heightInput, { borderColor: colors.border, color: '#FFFFFF' }]}
                  value={weightStone}
                  onChangeText={setWeightStone}
                  keyboardType="numeric"
                  placeholder="st"
                  placeholderTextColor={colors.text + '80'}
                />
                <TextInput
                  style={[styles.input, styles.heightInput, { borderColor: colors.border, color: '#FFFFFF' }]}
                  value={weightPounds}
                  onChangeText={setWeightPounds}
                  keyboardType="numeric"
                  placeholder="lbs"
                  placeholderTextColor={colors.text + '80'}
                />
              </View>
            )}
          </View>

          {bmr !== null && (
            <View style={[styles.resultContainer, { backgroundColor: 'rgba(52, 199, 89, 0.1)' }]}>
              <ThemedText type="defaultSemiBold" style={styles.resultLabel}>Your BMR</ThemedText>
              <ThemedText style={[styles.resultValue, { color: '#34C759' }]}>{bmr} calories/day</ThemedText>
              <ThemedText style={styles.resultDescription}>
                This is the number of calories your body needs at complete rest
              </ThemedText>
              {onboardingData?.body_fat_percentage !== null && (
                <ThemedText style={styles.resultNote}>
                  (Calculated using Katch-McArdle formula with your body fat percentage)
                </ThemedText>
              )}
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              (!age || 
                (heightUnit === 'metric' && !height) || 
                (heightUnit === 'imperial' && (!heightFeet || !heightInches)) || 
                (weightUnit === 'metric' && !weight) || 
                (weightUnit === 'imperial' && (!weightStone || !weightPounds)) || 
                isLoading) && styles.disabledButton,
              { backgroundColor: '#34C759' }
            ]}
            onPress={handleContinue}
            disabled={!age || 
              (heightUnit === 'metric' && !height) || 
              (heightUnit === 'imperial' && (!heightFeet || !heightInches)) || 
              (weightUnit === 'metric' && !weight) || 
              (weightUnit === 'imperial' && (!weightStone || !weightPounds)) || 
              isLoading}
          >
            <ThemedText style={styles.continueButtonText}>
              {isLoading ? 'Saving...' : 'Continue'}
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
  unitToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  unitToggle: {
    flexDirection: 'row',
    gap: 10,
  },
  unitButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
  },
  selectedUnit: {
    borderWidth: 2,
    borderColor: '#34C759',
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
  },
  unitText: {
    fontSize: 14,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
  },
  heightInputContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  heightInput: {
    flex: 1,
  },
  resultContainer: {
    marginTop: 20,
    padding: 20,
    borderRadius: 10,
  },
  resultLabel: {
    fontSize: 18,
    marginBottom: 5,
  },
  resultValue: {
    fontSize: 24,
  },
  resultDescription: {
    fontSize: 14,
    opacity: 0.8,
  },
  resultNote: {
    fontSize: 12,
    opacity: 0.8,
    marginTop: 10,
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

export default BMRCalculationScreen; 