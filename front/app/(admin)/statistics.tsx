import React, { useState, useEffect } from 'react';
import { View, Text, Alert, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from '@/components/CustomButton';
import api from '@/api';
import { useRouter } from 'expo-router';
import Modal from 'react-native-modal';
import PieChart from 'react-native-pie-chart';
import { Button, List } from 'react-native-paper';

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

  const fetchTasks = async (userEmail: string) => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await api.post('/admin-tasks', { email: userEmail }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    fetchTasks(user.email);
    setIsModalVisible(false);
  };

  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const notDoneTasks = tasks.filter(task => task.status === 'not done').length;
  const totalTasks = completedTasks + notDoneTasks;

  const series = [completedTasks, notDoneTasks];
  const sliceColor = ['#22543D', '#7F1D1D']; // green-800 for completed, red-800 for not done

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
          <Text className="text-secondary-200 text-lg mb-2 border-b border-gray-700 pb-2 font-bold text-center">Task Stats</Text>

          <TouchableOpacity
            className="bg-gray-200 p-2 rounded-lg mb-4"
            onPress={() => setIsModalVisible(true)}
          >
            <Text className="text-secondary-200 text-lg text-center">{selectedUser ? selectedUser.username : 'Select a user'}</Text>
          </TouchableOpacity>

          {selectedUser && (
            <View className="bg-gray-800 p-4 rounded-lg">
              <Text className="text-secondary-200 text-lg text-center mb-2">Tasks for {selectedUser.username}</Text>
              <View className="flex-1 items-center">
                <Text className="text-2xl my-2 text-white">Task Distribution</Text>
                <Text className="text-lg my-2 text-white">{completedTasks} tasks completed, {notDoneTasks} tasks not done</Text>
                {totalTasks > 0 ? (
                  <>
                    <PieChart
                      widthAndHeight={250}
                      series={series}
                      sliceColor={sliceColor}
                    />
                    <View className="mt-5">
                      <Text className="text-lg my-1 text-white">
                        <Text className="text-[#22543D]">{completedTasks}</Text> / {totalTasks} tasks completed
                      </Text>
                    </View>
                  </>
                ) : (
                  <Text className="text-lg text-red-800 mt-5">No tasks available</Text>
                )}
                <View className="flex-row mt-5 justify-center">
                  <View className="flex-row items-center mx-2">
                    <View className="w-5 h-5 rounded-full bg-[#22543D] mr-1" />
                    <Text className="text-lg text-white">Completed</Text>
                  </View>
                  <View className="flex-row items-center mx-2">
                    <View className="w-5 h-5 rounded-full bg-[#7F1D1D] mr-1" />
                    <Text className="text-lg text-white">Not Done</Text>
                  </View>
                </View>
                <View className="flex-row mt-5 justify-center">
                  <Text className="text-lg text-[#22543D]">Green: <Text className='text-white'>Completed</Text></Text>
                  <Text className="text-lg text-[#7F1D1D] ml-5">Red: <Text className='text-white'>Not Done</Text></Text>
                </View>
              </View>
            </View>
          )}
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
                  handleUserSelect(item);
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

export default UserStats;
