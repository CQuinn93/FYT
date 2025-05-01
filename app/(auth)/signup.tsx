import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function SignupScreen() {
  const colorScheme = useColorScheme();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getPasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[a-z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };

  const getStrengthColor = (strength: number) => {
    const colors = ['#FF4444', '#FFA500', '#34C759'];
    return colors[Math.min(strength - 1, 2)];
  };

  const checkRequirement = (pass: string, requirement: string) => {
    switch (requirement) {
      case 'length':
        return pass.length >= 8;
      case 'uppercase':
        return /[A-Z]/.test(pass);
      case 'lowercase':
        return /[a-z]/.test(pass);
      case 'number':
        return /[0-9]/.test(pass);
      case 'special':
        return /[^A-Za-z0-9]/.test(pass);
      default:
        return false;
    }
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthColor = getStrengthColor(passwordStrength);

  const handleSignup = async () => {
    setError(null);
    setLoading(true);

    if (!email || !password || !confirmPassword || !username) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // Create profile with username
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: data.user.id,
              name: username,
              has_completed_onboarding: false
            }
          ]);

        if (profileError) throw profileError;

        router.replace('/(tabs)/profile');
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedView style={styles.content}>
            <ThemedText type="title" style={styles.title}>Create Account</ThemedText>
            <ThemedText style={styles.subtitle}>
              Join our fitness community and start your journey
            </ThemedText>

            <ThemedView style={styles.form}>
              <ThemedView style={styles.inputGroup}>
                <ThemedText style={styles.label}>Username</ThemedText>
                <TextInput
                  style={[styles.input, { color: colorScheme === 'dark' ? 'white' : 'black' }]}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  placeholder="Choose a username"
                  placeholderTextColor={colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}
                />
              </ThemedView>

              <ThemedView style={styles.inputGroup}>
                <ThemedText style={styles.label}>Email</ThemedText>
                <TextInput
                  style={[styles.input, { color: colorScheme === 'dark' ? 'white' : 'black' }]}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="Enter your email"
                  placeholderTextColor={colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}
                />
              </ThemedView>

              <ThemedView style={styles.inputGroup}>
                <ThemedText style={styles.label}>Password</ThemedText>
                <TextInput
                  style={[styles.input, { color: colorScheme === 'dark' ? 'white' : 'black' }]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="Create a password"
                  placeholderTextColor={colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}
                />
                <View style={styles.strengthIndicator}>
                  <View style={[styles.strengthBar, { width: `${(passwordStrength / 5) * 100}%`, backgroundColor: strengthColor }]} />
                </View>
                <View style={styles.requirements}>
                  <ThemedText style={[styles.requirementText, checkRequirement(password, 'length') && styles.requirementMet]}>
                    • At least 8 characters
                  </ThemedText>
                  <ThemedText style={[styles.requirementText, checkRequirement(password, 'uppercase') && styles.requirementMet]}>
                    • At least one uppercase letter
                  </ThemedText>
                  <ThemedText style={[styles.requirementText, checkRequirement(password, 'lowercase') && styles.requirementMet]}>
                    • At least one lowercase letter
                  </ThemedText>
                  <ThemedText style={[styles.requirementText, checkRequirement(password, 'number') && styles.requirementMet]}>
                    • At least one number
                  </ThemedText>
                  <ThemedText style={[styles.requirementText, checkRequirement(password, 'special') && styles.requirementMet]}>
                    • At least one special character
                  </ThemedText>
                </View>
              </ThemedView>

              <ThemedView style={styles.inputGroup}>
                <ThemedText style={styles.label}>Confirm Password</ThemedText>
                <TextInput
                  style={[styles.input, { color: colorScheme === 'dark' ? 'white' : 'black' }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholder="Confirm your password"
                  placeholderTextColor={colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}
                />
              </ThemedView>

              {error && (
                <ThemedText style={[styles.errorText, styles.textWrapper]}>{error}</ThemedText>
              )}

              <TouchableOpacity 
                style={[styles.signupButton, loading && styles.disabledButton]} 
                onPress={handleSignup}
                disabled={loading}
              >
                <ThemedText style={[styles.buttonText, styles.textWrapper]}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginLink}
                onPress={() => router.push('/(auth)/login')}
              >
                <ThemedText style={[styles.loginText, styles.textWrapper]}>
                  Already have an account? <ThemedText style={styles.loginTextBold}>Log In</ThemedText>
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
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
  signupButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 14,
  },
  loginTextBold: {
    fontWeight: 'bold',
    color: '#34C759',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  textWrapper: {
    textAlign: 'center',
  },
  strengthIndicator: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginTop: 4,
  },
  strengthBar: {
    height: '100%',
    borderRadius: 2,
  },
  requirements: {
    marginTop: 8,
    gap: 4,
  },
  requirementText: {
    fontSize: 12,
    opacity: 0.7,
    color: '#666',
  },
  requirementMet: {
    textDecorationLine: 'line-through',
    color: '#34C759',
    opacity: 1,
  },
}); 