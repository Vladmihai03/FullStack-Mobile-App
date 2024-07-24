import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Modal from 'react-native-modal';
import api from '@/api';
import CustomButton from '@/components/CustomButton';

interface User {
  email: string;
  username: string;
}

interface Task {
  status: string;
}

const UserStats: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
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

    fetchUsers();
  }, []);

  const fetchTasks = async (userEmail: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await api.get(`/tasks?assigned_to=${userEmail}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      Alert.alert('Error', 'Failed to load tasks');
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    fetchTasks(user.email);
    setIsModalVisible(false);
  };

  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const notDoneTasks = tasks.filter(task => task.status === 'not done').length;

  return (
    <View className="flex-1 bg-primary justify-center items-center p-5">
      <View className="absolute top-10 left-5">
        <CustomButton
          title="Back to Dashboard"
          handlePress={() => router.push('/home')}
          containerStyles="bg-primary text-white px-4 py-2 mt-10 rounded-full border border-blue-500"
        />
      </View>

      <View className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md space-y-3">
        <Text className="text-secondary-200 text-lg mb-2 border-b border-gray-700 pb-2 font-bold text-center">Task Stats</Text>

        <TouchableOpacity
          className="bg-gray-200 p-2 rounded-lg mb-4"
          onPress={() => setIsModalVisible(true)}
        >
          <Text className="text-black text-lg text-center">{selectedUser ? selectedUser.username : 'Select a user'}</Text>
        </TouchableOpacity>

        {selectedUser && (
          <View className="bg-gray-800 p-4 rounded-lg">
            <Text className="text-secondary-200 text-lg mb-4 text-center">Tasks for {selectedUser.username}</Text>
            <View className="flex-row justify-between mt-4">
              <View className="items-center">
                <Text className="text-lg font-bold text-white">{completedTasks}</Text>
                <Text className="text-secondary-200">Completed</Text>
              </View>
              <View className="items-center">
                <Text className="text-lg font-bold text-white">{notDoneTasks}</Text>
                <Text className="text-secondary-200">Not Done</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      <Modal isVisible={isModalVisible}>
        <View className="bg-white p-4 rounded-lg">
          <Text className="text-lg font-bold mb-2">Select User</Text>
          <FlatList
            data={users}
            keyExtractor={(item) => item.email}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleUserSelect(item)}>
                <Text className="text-lg">{item.username}</Text>
                <Text className="text-sm text-gray-500">{item.email}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity onPress={() => setIsModalVisible(false)}>
            <Text className="text-center text-blue-500 mt-4">Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default UserStats;
