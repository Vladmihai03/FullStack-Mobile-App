import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import api from '@/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from '@/components/CustomButton';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

interface Reservation {
  EMAIL: string;
  START_DATE: string;
  END_DATE: string;
  SENT_AT: string;
  STATUS: string;
}

const ListReservations: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const router = useRouter();

  const fetchReservations = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await api.get('/reservations', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Reservations data from API:", response.data);
      // Filtrează rezervările cu statusul "Pending"
      const pendingReservations = response.data.filter((reservation: Reservation) => reservation.STATUS === 'Pending');
      setReservations(pendingReservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      Alert.alert('Error', 'Failed to load reservations');
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReservations();
    }, [])
  );

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <Text className="text-2xl font-extrabold text-gray-800 mb-10 text-center mt-20">List of Pending Reservations</Text>
      <ScrollView className="w-full">
        {reservations.map((reservation, index) => (
          <TouchableOpacity
            key={index}
            className="bg-white p-4 mb-4 rounded-lg shadow-md"
          >
            <Text className="text-lg font-bold text-gray-800">{reservation.EMAIL}</Text>
            <Text className="text-sm text-gray-600 my-1">Start Date: {reservation.START_DATE}</Text>
            <Text className="text-sm text-gray-600">End Date: {reservation.END_DATE}</Text>
            <Text className="text-sm text-gray-600">Sent At: {reservation.SENT_AT}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <CustomButton 
        title="Home"
        handlePress={() => { router.push('/home') }}
        containerStyles="mt-10 p-3 rounded-lg shadow-md my-5"
        textStyles="text-white text-lg font-bold"
      />
    </View>
  );
};

export default ListReservations;
