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
    <View className="flex-1 bg-primary justify-center items-center p-5">
      <View className="absolute top-10 left-5">
        <CustomButton
          title="Back to Reservations"
          handlePress={() => router.push('/list-reservations')}
          containerStyles="bg-primary text-white px-4 py-2 mt-10 rounded-full border border-blue-500"
        />
      </View>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : reservation ? (
        <View className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md space-y-3">
          <Text className="text-secondary-200 text-lg mb-2 border-b border-gray-700 pb-2 font-bold">Reservation Details:</Text>

          <View>
            <Text className="text-secondary-200 text-lg mb-1 font-bold">Email:</Text>
            <Text className="text-secondary-200 text-lg">{reservation.EMAIL}</Text>
          </View>

          <View>
            <Text className="text-secondary-200 text-lg mb-1 font-bold">Date:</Text>
            <Text className="text-secondary-200 text-lg">{reservation.START_DATE} - {reservation.END_DATE}</Text>
          </View>

          <View className="mb-4">
            <Text className="text-secondary-200 text-lg mb-1 font-bold">Sent At:</Text>
            <Text className="text-secondary-200 text-lg">{reservation.SENT_AT}</Text>
          </View>

          <View className="flex-row justify-around mt-4">
            <View className="flex-1 mx-3">
              <CustomButton
                title="Approve"
                handlePress={() => handleResponse('Approved')}
                containerStyles="bg-green-500 text-white px-4 py-2 rounded-full"
              />
            </View>
            <View className="flex-1 mx-3">
              <CustomButton
                title="Deny"
                handlePress={() => handleResponse('Denied')}
                containerStyles="bg-red-500 text-white px-4 py-2 rounded-full"
              />
            </View>
          </View>
        </View>
      ) : (
        <Text className="text-secondary-200 text-lg">Loading reservation details...</Text>
      )}
    </View>
  );
};

export default ReservationDetail;
