import React, { useEffect, useState } from 'react';
import { View, Text, Alert, TextInput, Button, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
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
  const [showRequests, setShowRequests] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
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

        setProfile(profileResponse.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        Alert.alert('Error', 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const fetchVacationRequests = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const requestsResponse = await api.get('/userRequests', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setVacationRequests(requestsResponse.data);
    } catch (error) {
      console.error('Error fetching vacation requests:', error);
      Alert.alert('Error', 'Failed to load vacation requests');
    }
  };

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

      await api.post(
        '/requestVacation',
        { start_date: startDate, end_date: endDate, sent_at },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchVacationRequests();
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

  const { height } = Dimensions.get('window');
  const contentHeight = height - 250; // Adjust based on your header and footer heights

  return (
    <View className="flex-1 bg-gray-900">
      {!showRequests && (
        <View className="absolute top-32 left-0 right-0 p-6 bg-gray-800 z-10">
          {profile ? (
            <View className="p-6 rounded-md w-full max-w-md mx-auto">
              <Text className="text-secondary-200 text-lg mb-4">
                <Text className="font-bold">Username:</Text> {profile.username}
              </Text>
              <Text className="text-secondary-200 text-lg mb-4">
                <Text className="font-bold">Email:</Text> {profile.email}
              </Text>
              <Text className="text-secondary-200 text-lg">
                <Text className="font-bold">Description:</Text> {profile.description}
              </Text>
            </View>
          ) : (
            <Text className="text-secondary-200 text-lg">Loading profile...</Text>
          )}
        </View>
      )}

      <ScrollView contentContainerStyle={{ paddingTop: showRequests ? 0 : 200, paddingBottom: 100 }} className="flex-1">
        <View style={{ minHeight: contentHeight }} className="p-4 pt-32">
          <CustomButton 
            title={showRequests ? "Hide Vacation Requests" : "Show Vacation Requests"}
            handlePress={() => {
              if (!showRequests) {
                fetchVacationRequests();
              }
              setShowRequests(!showRequests);
            }}
            containerStyles="mt-4 w-full bg-blue-500 text-white"
          />

          {showRequests && vacationRequests.length > 0 && (
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
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 p-4 bg-gray-800 z-10">
        {!showForm && (
          <CustomButton 
            title="Add Request"
            handlePress={() => setShowForm(true)}
            containerStyles="mt-4 w-full bg-blue-500 text-white"
          />
        )}
        <CustomButton 
          title="Home"
          handlePress={() => {}}
          containerStyles="mt-5 w-full bg-green-500 text-white"
          linkTo='/'
        />
      </View>
    </View>
  );
};

export default Info;
