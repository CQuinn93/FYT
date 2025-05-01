import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Image } from 'expo-image';

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
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      router.replace('/(tabs)/profile');
    } catch (err: any) {
      setError(err?.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: '#000000' }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/images/logo.png')}
                style={styles.logo}
                contentFit="contain"
              />
            </View>

            <ThemedText type="title" style={styles.title}>Your Fitness Journey Starts Here</ThemedText>
            <ThemedText style={styles.subtitle}>
              Sign in to continue your fitness journey
            </ThemedText>
            <View style={styles.breakLine} />

            <View style={styles.form}>
              <View style={styles.inputGroup}>
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
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Password</ThemedText>
                <TextInput
                  style={[styles.input, { color: colorScheme === 'dark' ? 'white' : 'black' }]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="Enter your password"
                  placeholderTextColor={colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}
                />
              </View>

              {error && (
                <ThemedText style={[styles.errorText, styles.textWrapper]}>{error}</ThemedText>
              )}

              <TouchableOpacity 
                style={[styles.loginButton, loading && styles.disabledButton]} 
                onPress={handleLogin}
                disabled={loading}
              >
                <ThemedText style={[styles.buttonText, styles.textWrapper]}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.signupLink}
                onPress={() => router.push('/(auth)/signup')}
              >
                <ThemedText style={[styles.signupText, styles.textWrapper]}>
                  Don't have an account? <ThemedText style={styles.signupTextBold}>Sign Up</ThemedText>
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 200,
    height: 200,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 20,
    textAlign: 'center',
  },
  breakLine: {
    height: 1,
    backgroundColor: '#34C759',
    width: '100%',
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
    backgroundColor: '#1A1A1A',
  },
  loginButton: {
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
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  textWrapper: {
    textAlign: 'center',
  },
}); 