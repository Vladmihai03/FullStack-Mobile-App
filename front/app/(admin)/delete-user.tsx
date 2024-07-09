import { View, Text, Alert } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/api';
import FormField from '@/components/FormField';
import CustomButton from '@/components/CustomButton';

const DeleteUser = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const submit = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await api.delete('/delete-user', {
        data: { email },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      
      Alert.alert('Success', 'User deleted successfully');
      router.push('/home');
    } catch (error) {
      console.error('Error deleting user:', error);
      Alert.alert('Error', 'Failed to delete user');
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-primary p-4 -mt-20">
      <Text className="text-2xl font-extrabold text-white mb-10">Delete User</Text>

      <FormField
        title="Email"
        value={email}
        handleChangeText={(e) => setEmail(e)}
        otherStyles="mt-7"
      />

      <CustomButton
        title="Delete"
        handlePress={submit}
        containerStyles="mt-10 p-5"
      />
      
    </View>
  );
};

export default DeleteUser;
