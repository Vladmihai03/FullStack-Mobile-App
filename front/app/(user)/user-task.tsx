import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from '@/components/CustomButton';
import api from '@/api';
import { useRouter } from 'expo-router';

interface Task {
  id: number;
  name: string;
  detail: string;
  assigned_to: string;
  status: string;
  created_at: string;
}

const UserTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hiddenTasks, setHiddenTasks] = useState<Set<number>>(new Set());
  const [showHiddenTasks, setShowHiddenTasks] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }

        const response = await api.get('/tasks', {
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

    fetchTasks();
  }, []);

  const handleUpdateStatus = async (task: Task) => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      await api.put(
        '/tasks',
        { id: task.id, email: task.assigned_to },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedTasks = tasks.filter((t) => t.id !== task.id);
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Error updating task status:', error);
      Alert.alert('Error', 'Failed to update task status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHideTask = (taskId: number) => {
    setHiddenTasks(new Set(hiddenTasks.add(taskId)));
  };

  const handleShowHiddenTasks = () => {
    setShowHiddenTasks(!showHiddenTasks);
  };

  return (
    <View className="flex-1 bg-primary p-5">
      <View className="absolute top-5 left-5 mt-16">
        <CustomButton
          title="Back to Home"
          handlePress={() => router.push('/homee')}
          containerStyles="bg-primary text-white px-4 py-2 rounded-full border border-blue-500"
        />
      </View>
      <View className="mt-40 flex-1 w-full">
        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : tasks.filter(task => task.status !== 'completed' && !hiddenTasks.has(task.id)).length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-secondary-200 text-lg">You did all the tasks!</Text>
          </View>
        ) : (
          <FlatList
            data={tasks.filter(task => task.status !== 'completed' && !hiddenTasks.has(task.id))}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <View className="bg-gray-800 p-6 rounded-lg shadow-md w-full mb-4">
                <Text className="text-secondary-200 text-lg mb-2 font-bold">
                  {item.name}
                </Text>
                <Text className="text-secondary-200 mb-2">{item.detail}</Text>
                <Text className="text-secondary-200 mb-2">
                  Assigned on: {new Date(item.created_at).toLocaleDateString()}
                </Text>
                <Text className="text-secondary-200 mb-4">Status: {item.status}</Text>
                <View className="flex-row justify-around mt-4">
                  <CustomButton
                    title="Mark as Done"
                    handlePress={() => handleUpdateStatus(item)}
                    containerStyles="bg-green-500 text-white px-4 py-2 rounded-full"
                  />
                  <CustomButton
                    title="Hide Task"
                    handlePress={() => handleHideTask(item.id)}
                    containerStyles="bg-red-500 text-white px-4 py-2 rounded-full"
                  />
                </View>
              </View>
            )}
          />
        )}
      </View>
      <CustomButton
        title={showHiddenTasks ? 'Hide Hidden Tasks' : 'Show Hidden Tasks'}
        handlePress={handleShowHiddenTasks}
        containerStyles="bg-yellow-500 text-black px-4 py-2 rounded-full mt-4 mb-10"
      />
      {showHiddenTasks && (
        <FlatList
          data={tasks.filter(task => hiddenTasks.has(task.id))}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View className="bg-gray-800 p-6 rounded-lg shadow-md w-full mb-4">
              <Text className="text-secondary-200 text-lg mb-2 font-bold">
                {item.name}
              </Text>
              <Text className="text-secondary-200 mb-2">{item.detail}</Text>
              <Text className="text-secondary-200 mb-2">
                Assigned on: {new Date(item.created_at).toLocaleDateString()}
              </Text>
              <Text className="text-secondary-200 mb-4">Status: {item.status}</Text>
              <View className="flex-row justify-around mt-4">
                <CustomButton
                  title="Mark as Done"
                  handlePress={() => handleUpdateStatus(item)}
                  containerStyles="bg-green-500 text-white px-4 py-2 rounded-full"
                />
                <CustomButton
                  title="Unhide Task"
                  handlePress={() => setHiddenTasks(new Set([...hiddenTasks].filter(id => id !== item.id)))}
                  containerStyles="bg-blue-500 text-white px-4 py-2 rounded-full"
                />
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default UserTasks;
