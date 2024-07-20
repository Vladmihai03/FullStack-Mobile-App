import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import api from '@/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from '@/components/CustomButton';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

interface User {
  username: string;
  email: string;
  description: string;
}

const ListUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  const fetchUsers = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await api.get('/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to load users');
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [])
  );

  const handlePress = async (email: string) => {
    try {
      await AsyncStorage.setItem('selectedEmail', email);
      router.push('/admin-info');
    } catch (error) {
      console.error('Error setting email:', error);
      Alert.alert('Error', 'Failed to store selected email');
    }
  };



  return (
    <View className="flex-1 bg-gray-100 p-4">
      <Text className="text-2xl font-extrabold text-gray-800 mb-10 text-center mt-20">List of Users</Text>
      <ScrollView className="w-full">
        {users.map((user, index) => (
          <TouchableOpacity
            key={index}
            className="bg-white p-4 mb-4 rounded-lg shadow-md"
            onPress={() => handlePress(user.email)}
          >
            <Text className="text-lg font-bold text-gray-800">{user.username}</Text>
            <Text className="text-sm text-gray-600 my-1">{user.email}</Text>
            <Text className="text-sm text-gray-600">{user.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <CustomButton 
        title="Home"
        handlePress={()=>{router.push('/home')}}
        containerStyles="mt-10 p-3 rounded-lg shadow-md my-5"
        textStyles="text-white text-lg font-bold"
      />
    </View>
  );
};

export default ListUsers;
