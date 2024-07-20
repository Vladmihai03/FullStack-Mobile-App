import React, { useState, useEffect } from 'react';
import { View, Text, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from '@/components/CustomButton';
import api from '@/api';
import { useRouter } from 'expo-router';

interface Reservation {
  EMAIL: string;
  START_DATE: string;
  END_DATE: string;
  SENT_AT: string;
  STATUS: string;
}

const ReservationDetail: React.FC = () => {
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const fetchReservation = async () => {
    try {
      const storedReservation = await AsyncStorage.getItem('selectedReservation');
      if (!storedReservation) {
        throw new Error('No reservation found');
      }
      setReservation(JSON.parse(storedReservation));
    } catch (error) {
      console.error('Error fetching reservation:', error);
      Alert.alert('Error', 'Failed to load reservation');
    }
  };

  useEffect(() => {
    fetchReservation();
  }, []);

  const handleResponse = async (status: string) => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      await api.post(
        '/statusResponse',
        { status, email: reservation?.EMAIL, start_date: reservation?.START_DATE },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert('Success', `Reservation ${status.toLowerCase()}ed successfully`);
      router.push('/list-reservations');
    } catch (error) {
      console.error('Error updating reservation status:', error);
      Alert.alert('Error', `Failed to ${status.toLowerCase()} reservation`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-100 p-4 justify-center items-center">
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : reservation ? (
        <View className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <Text className="text-lg font-bold text-gray-800 mb-2">Email: {reservation.EMAIL}</Text>
          <Text className="text-sm text-gray-600 mb-1">Start Date: {reservation.START_DATE}</Text>
          <Text className="text-sm text-gray-600 mb-1">End Date: {reservation.END_DATE}</Text>
          <Text className="text-sm text-gray-600 mb-1">Sent At: {reservation.SENT_AT}</Text>
          <Text className="text-sm text-gray-600 mb-1">Status: {reservation.STATUS}</Text>
          <View className="flex-row justify-around mt-4">
            <CustomButton
              title="Approve"
              handlePress={() => handleResponse('Approved')}
              containerStyles="bg-green-500 text-white px-4 py-2 rounded-full"
            />
            <CustomButton
              title="Deny"
              handlePress={() => handleResponse('Denied')}
              containerStyles="bg-red-500 text-white px-4 py-2 rounded-full"
            />
          </View>
        </View>
      ) : (
        <Text className="text-gray-800 text-lg">Loading reservation details...</Text>
      )}
    </View>
  );
};

export default ReservationDetail;
