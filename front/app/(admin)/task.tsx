import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from '@/components/CustomButton';
import api from '@/api';
import { useRouter } from 'expo-router';
import Modal from 'react-native-modal';
import { Button, List } from 'react-native-paper';

interface User {
  email: string;
  username: string;
}

const CreateTask: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [taskName, setTaskName] = useState<string>('');
  const [taskDetail, setTaskDetail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
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

  const handleCreateTask = async () => {
    if (!taskName || !taskDetail || !selectedUser) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      await api.post(
        '/tasks',
        { name: taskName, detail: taskDetail, assigned_to: selectedUser.email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert('Success', 'Task created successfully');
      setTaskName('');
      setTaskDetail('');
      setSelectedUser(null);

      router.push('/home');

    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Error', 'Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-primary justify-center items-center p-5">
      <View className="absolute top-10 left-5">
        <CustomButton
          title="Back to Dashboard"
          handlePress={() => router.push('/home')}
          containerStyles="bg-primary text-white px-4 py-2 mt-10 rounded-full border border-blue-500"
        />
      </View>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md space-y-3">
          <Text className="text-secondary-200 text-lg mb-2 border-b border-gray-700 pb-2 font-bold">Create Task</Text>

          <View className="mb-4">
            <Text className="text-secondary-200 text-lg mb-1 font-bold">Task Name</Text>
            <TextInput
              className="bg-white p-2 rounded-lg"
              placeholder="Enter task name"
              value={taskName}
              onChangeText={setTaskName}
            />
          </View>

          <View className="mb-4">
            <Text className="text-secondary-200 text-lg mb-1 font-bold">Task Detail</Text>
            <TextInput
              className="bg-white p-2 rounded-lg"
              placeholder="Enter task detail"
              value={taskDetail}
              onChangeText={setTaskDetail}
            />
          </View>

          <View className="mb-4">
            <Text className="text-secondary-200 text-lg mb-1 font-bold">Assign To</Text>
            <TouchableOpacity
              className="bg-white p-2 rounded-lg"
              onPress={() => setIsModalVisible(true)}
            >
              <Text className="text-secondary-200 text-lg">{selectedUser ? selectedUser.username : 'Select a user'}</Text>
            </TouchableOpacity>
          </View>

          <View className="mt-4">
            <CustomButton
              title="Create Task"
              handlePress={handleCreateTask}
              containerStyles="bg-blue-500 text-white px-4 py-2 rounded-full"
            />
          </View>
        </View>
      )}

      <Modal isVisible={isModalVisible}>
        <View className="bg-white p-4 rounded-lg">
          <Text className="text-lg font-bold mb-2">Select User</Text>
          <FlatList
            data={users}
            keyExtractor={(item) => item.email}
            renderItem={({ item }) => (
              <List.Item
                title={item.username}
                description={item.email}
                onPress={() => {
                  setSelectedUser(item);
                  setIsModalVisible(false);
                }}
              />
            )}
          />
          <Button onPress={() => setIsModalVisible(false)}>Close</Button>
        </View>
      </Modal>
    </View>
  );
};

export default CreateTask;
