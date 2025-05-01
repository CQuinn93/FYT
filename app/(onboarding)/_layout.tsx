import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack>
      <Stack.Screen name="body-fat-estimation" options={{ headerShown: false }} />
      <Stack.Screen name="bmr-calculation" options={{ headerShown: false }} />
    </Stack>
  );
} 