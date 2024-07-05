import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from '@/components/CustomButton';
import api from '../../api'; // Import the Axios instance

interface UserProfile {
  username: string;
  email: string;
  description: string;
}

const Info: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }

        const response = await api.get('/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        Alert.alert('Error', 'Failed to load profile');
      }
    };

    fetchProfile();
  }, []);

  return (
    <View className="bg-primary h-full flex-1 justify-center items-center">
      {profile ? (
        <>
          <Text className="text-secondary-200 text-lg mb-4">Username: {profile.username}</Text>
          <Text className="text-secondary-200 text-lg mb-4">Email: {profile.email}</Text>
          <Text className="text-secondary-200 text-lg mb-4">Description: {profile.description}</Text>
        </>
      ) : (
        <Text className="text-secondary-200 text-lg mb-4">Loading...</Text>
      )}
      <CustomButton 
        title="Home"
        handlePress={(): void => {}}
        containerStyles="mt-7 w-40"
        linkTo='/'
      />
    </View>
  );
};

export default Info;
