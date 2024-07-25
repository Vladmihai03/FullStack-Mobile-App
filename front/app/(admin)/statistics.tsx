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

  const handleBackToDashboard = () => {
    setSelectedUser(null);
    setTasks([]);
    router.push('/home');
  };

  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const notDoneTasks = tasks.filter(task => task.status === 'not done').length;
  const totalTasks = completedTasks + notDoneTasks;

  const series = [completedTasks, notDoneTasks];
  const sliceColor = ['#FF6347', '#4682B4']; // tomato for completed, steel blue for not done

  return (
    <View className="flex-1 bg-primary justify-center items-center p-5">
      <View className="absolute top-10 left-5">
        <CustomButton
          title="Back to Dashboard"
          handlePress={handleBackToDashboard}
          containerStyles="bg-primary text-white px-4 py-2 mt-10 rounded-full border border-blue-500"
        />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View className="mt-20 bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md space-y-3">
          <Text className="text-secondary-200 text-lg mb-2 border-b border-gray-700 pb-2 font-bold text-center">Task Stats</Text>

          <TouchableOpacity
            className="bg-gray-200 p-2 rounded-lg mb-4"
            onPress={() => setIsModalVisible(true)}
          >
            <Text className="text-secondary-200 text-lg text-center">{selectedUser ? selectedUser.username : 'Select a user'}</Text>
          </TouchableOpacity>

          {selectedUser && (
            <View className="bg-gray-800 p-4 rounded-lg">
              <Text className="text-lg my-2 text-secondary-200 text-center">
                Task Distribution for {selectedUser.username}
              </Text>
              <Text className="text-lg my-2 text-secondary-200 text-center mb-10">{completedTasks} tasks completed, {notDoneTasks} tasks not done</Text>
              {totalTasks > 0 ? (
                <>
                  <View className="items-center">
                    <PieChart
                      widthAndHeight={250}
                      series={series}
                      sliceColor={sliceColor}
                    />
                  </View>
                </>
              ) : (
                <Text className="text-lg text-red-800 mt-5 text-center">No tasks available</Text>
              )}
              <View className="mt-5">
                <View className="flex-row justify-center">
                  <View className="flex-row items-center mx-2">
                    <View className="w-5 h-5 rounded-full bg-[#FF6347] mr-1" />
                    <Text className="text-lg text-secondary-200">Completed</Text>
                  </View>
                  <View className="flex-row items-center mx-2">
                    <View className="w-5 h-5 rounded-full bg-[#4682B4] mr-1" />
                    <Text className="text-lg text-secondary-200">Not Done</Text>
                  </View>
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
