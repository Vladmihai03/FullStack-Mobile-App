import React, { useEffect, useState } from 'react';
import { View, Text, Alert, TextInput, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from '@/components/CustomButton';
import api from '../../api';
import { useRouter } from 'expo-router';

interface UserProfile {
  username: string;
  description: string;
}

const AdminInfo: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editField, setEditField] = useState<string | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const storedEmail = await AsyncStorage.getItem('selectedEmail');
      if (!storedEmail) {
        throw new Error('No email found');
      }

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await api.post(
        '/profile-user',
        { email: storedEmail },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProfile(response.data);
      setNewUsername(response.data.username);
      setNewDescription(response.data.description);
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const storedEmail = await AsyncStorage.getItem('selectedEmail');
      if (!storedEmail) {
        throw new Error('No email found');
      }

      const updatedProfile: UserProfile = {
        username: newUsername,
        description: newDescription,
      };

      if (editField === 'username') {
        await api.put(
          '/update-username',
          { username: newUsername, email: storedEmail },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else if (editField === 'description') {
        await api.put(
          '/update-description',
          { description: newDescription, email: storedEmail },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      setProfile(updatedProfile);
      setEditField(null);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    setIsDeleting(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const storedEmail = await AsyncStorage.getItem('selectedEmail');
      if (!storedEmail) {
        throw new Error('No email found');
      }

      await api.delete('/delete-user', {
        data: { email: storedEmail },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert('Success', 'User deleted successfully');
      router.push('/list-users');
    } catch (error) {
      console.error('Error deleting user:', error);
      Alert.alert('Error', 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const homeFunction = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      await api.post(
        '/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await AsyncStorage.removeItem('token');
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to log out');
    }
  };

  return (
    <View className="flex-1 bg-primary justify-center items-center p-5">
      <View className="absolute top-10 left-5">
          <CustomButton
            title="Back to User List"
            handlePress={() => router.push('/list-users')}
            containerStyles="bg-primary text-white px-4 py-2 mt-10 rounded-full border border-blue-500"
          />
      </View>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : profile ? (
        <View className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md space-y-4">
          <View className="mb-4">
            <Text className="text-secondary-200 text-lg mb-2 border-b border-gray-700 pb-2 font-bold">Username:</Text>
            {editField === 'username' ? (
              <View className="flex-row items-center space-x-2">
                <TextInput
                  className="flex-1 p-2 border border-gray-300 rounded bg-white text-black"
                  value={newUsername}
                  onChangeText={setNewUsername}
                />
                <CustomButton
                  title="Save"
                  handlePress={handleSaveChanges}
                  containerStyles="bg-blue-500 text-white px-4 py-2 rounded-full"
                  isloading={isLoading}
                />
              </View>
            ) : (
              <View className="flex-row items-center space-x-2">
                <Text className="text-secondary-200 text-lg flex-1" style={{ color: '#ccc', fontSize: 18 }}>{profile.username}</Text>
                <CustomButton
                  title="Edit"
                  handlePress={() => setEditField('username')}
                  containerStyles="bg-blue-500 text-white px-4 py-2 rounded-full"
                />
              </View>
            )}
          </View>

          <View className="mb-4">
            <Text className="text-secondary-200 text-lg mb-2 border-b border-gray-700 pb-2 font-bold">Description:</Text>
            {editField === 'description' ? (
              <View className="flex-row items-center space-x-2">
                <TextInput
                  className="flex-1 p-2 border border-gray-300 rounded bg-white text-black"
                  value={newDescription}
                  onChangeText={setNewDescription}
                />
                <CustomButton
                  title="Save"
                  handlePress={handleSaveChanges}
                  containerStyles="bg-blue-500 text-white px-4 py-2 rounded-full"
                  isloading={isLoading}
                />
              </View>
            ) : (
              <View className="flex-row items-center space-x-2">
                <Text className="text-secondary-200 text-lg flex-1" style={{ color: '#ccc', fontSize: 18 }}>{profile.description}</Text>
                <CustomButton
                  title="Edit"
                  handlePress={() => setEditField('description')}
                  containerStyles="bg-blue-500 text-white px-4 py-2 rounded-full"
                />
              </View>
            )}
          </View>

          <CustomButton
            title="Delete User"
            handlePress={handleDeleteUser}
            containerStyles="mt-4 w-full bg-red-500 text-white px-4 py-2 rounded-full"
            isloading={isDeleting}
          />
        </View>
      ) : (
        <Text className="text-secondary-200 text-lg mb-4">Loading...</Text>
      )}
      <CustomButton
        title="Home"
        handlePress={()=> {router.push('/home')}}
        containerStyles="mt-7 w-full bg-green-500 text-white px-4 py-2 rounded-full"
      />
    </View>
  );
};

export default AdminInfo;
