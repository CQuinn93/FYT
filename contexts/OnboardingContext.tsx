import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

type OnboardingData = {
  fitness_goal: string | null;
  body_fat_percentage: number | null;
  gender: string | null;
  age: number | null;
  height: number | null;
  weight: number | null;
  bmr: number | null;
  amr: number | null;
  activity_level: string | null;
  target_rate: number | null;
  macro_split: {
    protein: number;
    carbs: number;
    fat: number;
  } | null;
  protein_grams?: number | null;
  carb_grams?: number | null;
  fat_grams?: number | null;
  daily_steps?: number | null;
  exercise_type?: string | null;
};

type OnboardingContextType = {
  onboardingData: OnboardingData;
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
  saveOnboardingData: () => Promise<void>;
  clearOnboardingData: () => void;
};

const defaultOnboardingData: OnboardingData = {
  fitness_goal: null,
  body_fat_percentage: null,
  gender: null,
  age: null,
  height: null,
  weight: null,
  bmr: null,
  amr: null,
  activity_level: null,
  target_rate: null,
  macro_split: null,
  protein_grams: null,
  carb_grams: null,
  fat_grams: null,
  daily_steps: null,
  exercise_type: null,
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(defaultOnboardingData);

  const updateOnboardingData = (data: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
  };

  const clearOnboardingData = () => {
    setOnboardingData(defaultOnboardingData);
  };

  const saveOnboardingData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('user_metrics')
        .upsert({
          user_id: user.id,
          ...onboardingData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Clear the data after successful save
      clearOnboardingData();
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      throw error;
    }
  };

  return (
    <OnboardingContext.Provider value={{
      onboardingData,
      updateOnboardingData,
      saveOnboardingData,
      clearOnboardingData,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}; 