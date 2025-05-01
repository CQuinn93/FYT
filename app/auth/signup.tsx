import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function SignUpScreen() {
  const colorScheme = useColorScheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setError(null);
    setLoading(true);

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // Update the profile with the user's name
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ name })
          .eq('id', data.user.id);

        if (profileError) throw profileError;

        // Navigate to onboarding
        router.push('/onboarding/body-fat-estimation');
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>Create Your Account</ThemedText>
        <ThemedText style={styles.subtitle}>
          Join FYT and start your fitness journey today
        </ThemedText>

        <ThemedView style={styles.form}>
          <ThemedView style={styles.inputGroup}>
            <ThemedText>Full Name</ThemedText>
            <TextInput
              style={[styles.input, { color: colorScheme === 'dark' ? 'white' : 'black' }]}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor={colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}
            />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText>Email</ThemedText>
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
            <ThemedText>Password</ThemedText>
            <TextInput
              style={[styles.input, { color: colorScheme === 'dark' ? 'white' : 'black' }]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Create a password"
              placeholderTextColor={colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}
            />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText>Confirm Password</ThemedText>
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
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          )}

          <TouchableOpacity 
            style={[styles.signupButton, loading && styles.disabledButton]} 
            onPress={handleSignUp}
            disabled={loading}
          >
            <ThemedText style={styles.buttonText}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.push('/auth/login')}
          >
            <ThemedText style={styles.loginText}>
              Already have an account? <ThemedText style={styles.loginTextBold}>Log In</ThemedText>
            </ThemedText>
          </TouchableOpacity>
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
    color: '#007AFF',
  },
}); 