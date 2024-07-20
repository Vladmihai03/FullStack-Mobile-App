import React, { useEffect, useState } from 'react';
import { View, Text, Alert, TextInput, Button, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from '@/components/CustomButton';
import api from '@/api';

interface UserProfile {
  username: string;
  email: string;
  description: string;
}

interface VacationRequest {
  start_date: string;
  end_date: string;
  status: string;
  sent_at: string;
}

const Info: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [vacationRequests, setVacationRequests] = useState<VacationRequest[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchProfileAndRequests = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }

        const profileResponse = await api.get('/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const requestsResponse = await api.get('/userRequests', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProfile(profileResponse.data);
        setVacationRequests(requestsResponse.data);
      } catch (error) {
        console.error('Error fetching profile or vacation requests:', error);
        Alert.alert('Error', 'Failed to load profile or vacation requests');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndRequests();
  }, []);

  const handleRequestVacation = async () => {
    if (!startDate && !endDate) {
      setShowForm(false);
      return;
    }

    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const sent_at = new Date().toLocaleDateString('ro-RO');

      console.log("Sending request with start_date:", startDate, "end_date:", endDate, "sent_at:", sent_at);

      await api.post(
        '/requestVacation',
        { start_date: startDate, end_date: endDate, sent_at },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const requestsResponse = await api.get('/userRequests', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setVacationRequests(requestsResponse.data);
      setStartDate('');
      setEndDate('');
      setShowForm(false);
      Alert.alert('Success', 'Vacation request submitted successfully');
    } catch (error) {
      console.error('Error submitting vacation request:', error);
      Alert.alert('Error', 'Failed to submit vacation request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#00ff00" />;
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 10, backgroundColor: '#1a1a1a' }}>
      {profile ? (
        <View className="bg-gray-800 p-4 rounded-md mb-4 w-full max-w-sm">
          <Text className="text-secondary-200 text-sm mb-2">
            <Text className="font-bold">Username:</Text> {profile.username}
          </Text>
          <Text className="text-secondary-200 text-sm mb-2">
            <Text className="font-bold">Email:</Text> {profile.email}
          </Text>
          <Text className="text-secondary-200 text-sm">
            <Text className="font-bold">Description:</Text> {profile.description}
          </Text>
        </View>
      ) : (
        <Text className="text-secondary-200 text-sm mb-4">Loading profile...</Text>
      )}

      {vacationRequests.length > 0 && (
        <View className="bg-gray-800 p-4 rounded-md mb-4 w-full max-w-sm">
          <Text className="text-secondary-200 text-sm mb-2 font-bold">Vacation Requests</Text>
          {vacationRequests.map((request, index) => (
            <View key={index} className="mb-3 bg-gray-700 p-3 rounded-md shadow">
              <Text className="text-gray-300 text-xs mb-1">
                <Text className="font-bold">Start Date:</Text> {request.start_date}
              </Text>
              <Text className="text-gray-300 text-xs mb-1">
                <Text className="font-bold">End Date:</Text> {request.end_date}
              </Text>
              <Text className="text-gray-300 text-xs mb-1">
                <Text className="font-bold">Status:</Text> {request.status}
              </Text>
              <Text className="text-gray-300 text-xs">
                <Text className="font-bold">Sent At:</Text> {request.sent_at}
              </Text>
            </View>
          ))}
        </View>
      )}

      {!showForm && (
        <CustomButton 
          title="Add Request"
          handlePress={() => setShowForm(true)}
          containerStyles="mt-4 w-full bg-blue-500 text-white"
        />
      )}

      {showForm && (
        <View className="bg-gray-800 p-4 rounded-md w-full max-w-sm mt-4">
          <Text className="text-secondary-200 text-sm mb-2 font-bold">Request Vacation</Text>
          <TextInput
            placeholder="Start Date (DD.MM.YYYY)"
            value={startDate}
            onChangeText={setStartDate}
            className="bg-white p-2 mb-2 rounded text-xs"
          />
          <TextInput
            placeholder="End Date (DD.MM.YYYY)"
            value={endDate}
            onChangeText={setEndDate}
            className="bg-white p-2 mb-2 rounded text-xs"
          />
          <Button title="Submit" onPress={handleRequestVacation} disabled={submitting} />
          {submitting && <ActivityIndicator size="small" color="#00ff00" className="mt-2" />}
        </View>
      )}

      <CustomButton 
        title="Home"
        handlePress={() => {}}
        containerStyles="mt-5 w-full bg-green-500 text-white"
        linkTo='/'
      />
    </ScrollView>
  );
};

export default Info;
