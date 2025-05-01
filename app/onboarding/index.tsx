import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

type Gender = 'male' | 'female';

export default function OnboardingScreen() {
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [bmr, setBmr] = useState<number | null>(null);
  const [amr, setAmr] = useState<number | null>(null);

  const calculateBMR = () => {
    const weightKg = parseFloat(weight);
    const heightCm = parseFloat(height);
    const ageYears = parseFloat(age);

    if (isNaN(weightKg) || isNaN(heightCm) || isNaN(ageYears)) {
      return;
    }

    // Mifflin-St Jeor Equation
    let calculatedBMR = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
    calculatedBMR += gender === 'male' ? 5 : -161;

    setBmr(Math.round(calculatedBMR));
  };

  const calculateAMR = (activityLevel: number) => {
    if (!bmr) return;
    setAmr(Math.round(bmr * activityLevel));
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>Let's Calculate Your BMR</ThemedText>
        <ThemedText style={styles.subtitle}>
          This will help us determine your daily calorie needs
        </ThemedText>

        <ThemedView style={styles.form}>
          <ThemedView style={styles.inputGroup}>
            <ThemedText>Age</ThemedText>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              placeholder="Enter your age"
            />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText>Height (cm)</ThemedText>
            <TextInput
              style={styles.input}
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              placeholder="Enter your height"
            />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText>Weight (kg)</ThemedText>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              placeholder="Enter your weight"
            />
          </ThemedView>

          <ThemedView style={styles.genderButtons}>
            <TouchableOpacity
              style={[styles.genderButton, gender === 'male' && styles.selectedGender]}
              onPress={() => setGender('male')}
            >
              <ThemedText>Male</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderButton, gender === 'female' && styles.selectedGender]}
              onPress={() => setGender('female')}
            >
              <ThemedText>Female</ThemedText>
            </TouchableOpacity>
          </ThemedView>

          <TouchableOpacity style={styles.calculateButton} onPress={calculateBMR}>
            <ThemedText style={styles.buttonText}>Calculate BMR</ThemedText>
          </TouchableOpacity>

          {bmr && (
            <ThemedView style={styles.resultContainer}>
              <ThemedText type="subtitle">Your BMR: {bmr} calories/day</ThemedText>
              
              <ThemedView style={styles.activityButtons}>
                <TouchableOpacity
                  style={styles.activityButton}
                  onPress={() => calculateAMR(1.2)}
                >
                  <ThemedText>Sedentary</ThemedText>
                  <ThemedText style={styles.activitySubtext}>Little or no exercise</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.activityButton}
                  onPress={() => calculateAMR(1.375)}
                >
                  <ThemedText>Lightly Active</ThemedText>
                  <ThemedText style={styles.activitySubtext}>1-3 days/week</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.activityButton}
                  onPress={() => calculateAMR(1.55)}
                >
                  <ThemedText>Moderately Active</ThemedText>
                  <ThemedText style={styles.activitySubtext}>3-5 days/week</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.activityButton}
                  onPress={() => calculateAMR(1.725)}
                >
                  <ThemedText>Very Active</ThemedText>
                  <ThemedText style={styles.activitySubtext}>6-7 days/week</ThemedText>
                </TouchableOpacity>
              </ThemedView>

              {amr && (
                <ThemedView style={styles.amrResult}>
                  <ThemedText type="subtitle">Your AMR: {amr} calories/day</ThemedText>
                  <ThemedText style={styles.amrDescription}>
                    This is your estimated daily calorie needs based on your activity level
                  </ThemedText>
                </ThemedView>
              )}
            </ThemedView>
          )}
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 30,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  genderButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  selectedGender: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  calculateButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    marginTop: 20,
    gap: 20,
  },
  activityButtons: {
    gap: 10,
  },
  activityButton: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  activitySubtext: {
    fontSize: 12,
    opacity: 0.7,
  },
  amrResult: {
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  amrDescription: {
    marginTop: 10,
    fontSize: 14,
  },
}); 