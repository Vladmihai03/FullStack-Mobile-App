import React, { useEffect, useState } from 'react';
import { View, Text, Alert, TextInput } from 'react-native';
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
  const [isEditing, setIsEditing] = useState(false);
  const [newDescription, setNewDescription] = useState('');

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
        setNewDescription(response.data.description); // Set initial description
      } catch (error) {
        console.error('Error fetching profile:', error);
        Alert.alert('Error', 'Failed to load profile');
      }
    };

    fetchProfile();
  }, []);

  const handleEditDescription = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      await api.put(
        '/description',
        { description: newDescription },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Actualizează profilul local
      setProfile((prevProfile) =>
        prevProfile
          ? { ...prevProfile, description: newDescription }
          : null
      );

      setIsEditing(false);
      Alert.alert('Success', 'Description updated successfully');
    } catch (error) {
      console.error('Error updating description:', error);
      Alert.alert('Error', 'Failed to update description');
    }
  };

  return (
    <View className="flex-1 bg-primary justify-center items-center p-5">
      {profile ? (
        <View className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md">
          <Text className="text-secondary-200 text-lg mb-4 border-b border-gray-700 pb-2">
            <Text className="font-bold">Username:</Text> {profile.username}
          </Text>
          <Text className="text-secondary-200 text-lg mb-4 border-b border-gray-700 pb-2">
            <Text className="font-bold">Email:</Text> {profile.email}
          </Text>
          {isEditing ? (
            <View>
              <TextInput
                className="w-full p-2 border border-gray-300 rounded bg-white text-black mb-4"
                value={newDescription}
                onChangeText={setNewDescription}
              />
              <CustomButton
                title="Submit"
                handlePress={handleEditDescription}
                containerStyles="mt-2 w-full bg-blue-500 text-white"
              />
            </View>
          ) : (
            <View>
              <Text className="text-secondary-200 text-lg mb-4 border-b border-gray-700 pb-2">
                <Text className="font-bold">Description:</Text> {profile.description}
              </Text>
              <CustomButton
                title="Edit Description"
                handlePress={() => setIsEditing(true)}
                containerStyles="mt-2 w-full bg-blue-500 text-white"
              />
            </View>
          )}
        </View>
      ) : (
        <Text className="text-secondary-200 text-lg mb-4">Loading...</Text>
      )}
      <CustomButton 
        title="Home"
        handlePress={(): void => {}}
        containerStyles="mt-7 w-full bg-green-500 text-white"
        linkTo='/'
      />
    </View>
  );
};

export default Info;
