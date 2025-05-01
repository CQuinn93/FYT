import { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import React from 'react';

export default function VerifyScreen() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string | null>(null);
  const params = useLocalSearchParams();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: params.token as string,
          type: 'email',
        });

        if (error) throw error;

        setStatus('success');
        // Wait a moment to show success message before redirecting
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 2000);
      } catch (err: any) {
        setStatus('error');
        setError(err.message || 'Verification failed');
      }
    };

    if (params.token) {
      verifyEmail();
    } else {
      setStatus('error');
      setError('No verification token found');
    }
  }, [params.token]);

  return (
    <ThemedView style={styles.container}>
      {status === 'verifying' && (
        <>
          <ActivityIndicator size="large" />
          <ThemedText style={styles.message}>Verifying your email...</ThemedText>
        </>
      )}
      
      {status === 'success' && (
        <ThemedText style={styles.message}>Email verified successfully! Redirecting to login...</ThemedText>
      )}
      
      {status === 'error' && (
        <>
          <ThemedText style={[styles.message, styles.error]}>Verification failed</ThemedText>
          <ThemedText style={styles.errorDetail}>{error}</ThemedText>
          <ThemedText style={styles.helpText}>
            Please try signing up again or contact support if the problem persists.
          </ThemedText>
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  error: {
    color: 'red',
  },
  errorDetail: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.8,
  },
  helpText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    opacity: 0.8,
  },
}); 