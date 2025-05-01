import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        // Check if user has completed onboarding
        const { data: profile } = await supabase
          .from('user_metrics')
          .select('*')
          .eq('user_id', data.user.id)
          .single();

        if (profile) {
          // User has completed onboarding, go to main app
          router.replace('/(tabs)');
        } else {
          // User needs to complete onboarding
          router.replace('/onboarding/body-fat-estimation');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>Welcome Back</ThemedText>
        <ThemedText style={styles.subtitle}>
          Sign in to continue your fitness journey
        </ThemedText>

        <ThemedView style={styles.form}>
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
              placeholder="Enter your password"
              placeholderTextColor={colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}
            />
          </ThemedView>

          {error && (
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          )}

          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.disabledButton]} 
            onPress={handleLogin}
            disabled={loading}
          >
            <ThemedText style={styles.buttonText}>
              {loading ? 'Signing In...' : 'Sign In'}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signupLink}
            onPress={() => router.push('/auth/signup')}
          >
            <ThemedText style={styles.signupText}>
              Don't have an account? <ThemedText style={styles.signupTextBold}>Sign Up</ThemedText>
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
  loginButton: {
    backgroundColor: '#007AFF',
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
  signupLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  signupText: {
    fontSize: 14,
  },
  signupTextBold: {
    fontWeight: 'bold',
    color: '#34C759',
  },
}); 