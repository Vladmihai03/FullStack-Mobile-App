import React, { useEffect, useState } from 'react';
import { View, Text, Alert, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from '@/components/CustomButton';
import api from '../../api'; 
import { useRouter } from 'expo-router';

interface UserProfile {
  username: string;
  email: string;
  description: string;
}

const AdminInfo: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newDescription, setNewDescription] = useState('');
  const router = useRouter();

  const fetchProfile = async () => {
    try {
      const storedEmail = await AsyncStorage.getItem('selectedEmail');
      if (!storedEmail) {
        throw new Error('No email found');
      }
  
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
  
      const response = await api.post('/profile-user', 
        { email: storedEmail }, // Trimiterea emailului în corpul cererii
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      setProfile(response.data);
      setNewDescription(response.data.description);
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    }
  };
  
  useEffect(() => {
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
        { email: profile?.email, description: newDescription },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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

  const handleDeleteUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      await api.delete('/delete-user', {
        data: { email: profile?.email },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert('Success', 'User deleted successfully');
      router.push('/list-users');
    } catch (error) {
      console.error('Error deleting user:', error);
      Alert.alert('Error', 'Failed to delete user');
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
          <CustomButton
            title="Delete User"
            handlePress={handleDeleteUser}
            containerStyles="mt-4 w-full bg-red-500 text-white"
          />
        </View>
      ) : (
        <Text className="text-secondary-200 text-lg mb-4">Loading...</Text>
      )}
      <CustomButton 
        title="Home"
        handlePress={() => router.push('/')}
        containerStyles="mt-7 w-full bg-green-500 text-white"
      />
    </View>
  );
};

export default AdminInfo;
