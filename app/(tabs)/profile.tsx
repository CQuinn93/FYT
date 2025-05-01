import { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, ScrollView, Modal, Pressable } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

type Tab = 'meals' | 'activities' | 'events' | 'workouts';

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('meals');
  const [hasCompletedProfile, setHasCompletedProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);

  useFocusEffect(() => {
    loadProfile();
  });

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check if user_metrics row exists for this user
        const { data: metrics, error: metricsError } = await supabase
          .from('user_metrics')
          .select('user_id')
          .eq('user_id', user.id)
          .single();

        setHasCompletedOnboarding(!!metrics);

        // Still load profile info for display
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, avatar_url, start_date')
          .eq('id', user.id)
          .single();

        setUsername(profile?.name || '');
        setProfileImage(profile?.avatar_url);
        if (profile?.start_date) {
          setStartDate(new Date(profile.start_date));
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      // Convert image to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const fileExt = uri.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfileImage(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'meals':
        return (
          <View style={styles.tabContent}>
            <ThemedText>Your meals will appear here</ThemedText>
          </View>
        );
      case 'activities':
        return (
          <View style={styles.tabContent}>
            <ThemedText>Your activities will appear here</ThemedText>
          </View>
        );
      case 'events':
        return (
          <View style={styles.tabContent}>
            <ThemedText>Your events will appear here</ThemedText>
          </View>
        );
    }
  };

  const renderSectionCard = (icon: string, isActive: boolean, onPress: () => void) => (
    <TouchableOpacity 
      style={[
        styles.sectionCard,
        isActive && styles.activeCard
      ]}
      onPress={onPress}
    >
      <Ionicons name={icon as any} size={24} color={isActive ? 'white' : '#34C759'} />
    </TouchableOpacity>
  );

  const getButtonText = () => {
    if (!hasCompletedOnboarding) {
      return 'Complete Your Profile';
    }
    return 'Dashboard';
  };

  const handleButtonPress = () => {
    if (!hasCompletedOnboarding) {
      router.push('/(tabs)/onboarding/fitness-goals');
    } else {
      router.push('/(tabs)/dashboard');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={profileImage ? { uri: profileImage } : require('@/assets/images/logo.png')}
              style={styles.profileImage}
              contentFit="cover"
            />
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <ThemedText type="title" style={styles.username}>{username || 'Username'}</ThemedText>
            <ThemedText style={styles.bio}>Fitness enthusiast</ThemedText>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => setShowSettings(!showSettings)}
        >
          <Ionicons name="settings-outline" size={24} color="#34C759" />
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.detailsSection}>
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={20} color="#34C759" />
            <ThemedText style={styles.detailText}>Local Gym: Not set</ThemedText>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="people-outline" size={20} color="#34C759" />
            <ThemedText style={styles.detailText}>Club: Not joined</ThemedText>
          </View>
          <View style={styles.descriptionContainer}>
            <Ionicons name="pencil-outline" size={20} color="#34C759" />
            <ThemedText 
              style={styles.descriptionText}
              numberOfLines={2}
            >
              Add a brief description about your fitness journey and goals...
            </ThemedText>
          </View>
        </View>

        <View style={styles.tabsGrid}>
          <View style={styles.tabsRow}>
            {renderSectionCard(
              'restaurant-outline',
              activeTab === 'meals',
              () => setActiveTab('meals')
            )}
            {renderSectionCard(
              'fitness-outline',
              activeTab === 'activities',
              () => setActiveTab('activities')
            )}
          </View>
          <View style={styles.tabsRow}>
            {renderSectionCard(
              'calendar-outline',
              activeTab === 'events',
              () => setActiveTab('events')
            )}
            {renderSectionCard(
              'barbell-outline',
              activeTab === 'workouts',
              () => setActiveTab('workouts')
            )}
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.completeButton, { backgroundColor: hasCompletedOnboarding ? '#007AFF' : '#34C759' }]}
        onPress={handleButtonPress}
      >
        <ThemedText style={styles.completeButtonText}>{getButtonText()}</ThemedText>
      </TouchableOpacity>

      <ScrollView style={styles.contentSection}>
        {renderTabContent()}
      </ScrollView>

      {showSettings && (
        <Modal
          transparent={true}
          visible={showSettings}
          onRequestClose={() => setShowSettings(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowSettings(false)}>
            <View style={styles.settingsMenu}>
              <TouchableOpacity 
                style={styles.settingsOption}
                onPress={() => {
                  setShowSettings(false);
                  handleLogout();
                }}
              >
                <Ionicons name="log-out-outline" size={20} color="#34C759" />
                <ThemedText style={styles.settingsOptionText}>Log Out</ThemedText>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    opacity: 0.8,
  },
  settingsButton: {
    padding: 10,
  },
  mainContent: {
    flexDirection: 'row',
    padding: 20,
    gap: 20,
  },
  detailsSection: {
    flex: 1,
    gap: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    fontSize: 16,
  },
  completeButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    margin: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tabsGrid: {
    width: 110,
    gap: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sectionCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#34C759',
    width: 50,
    height: 50,
  },
  activeCard: {
    backgroundColor: '#34C759',
  },
  contentSection: {
    flex: 1,
    padding: 20,
  },
  tabContent: {
    padding: 20,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 20,
  },
  settingsMenu: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
    width: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  settingsOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  settingsOptionText: {
    fontSize: 16,
  },
  descriptionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 15,
    paddingRight: 20,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
    opacity: 0.8,
  },
}); 