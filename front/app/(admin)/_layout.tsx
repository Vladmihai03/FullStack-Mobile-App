// admin/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const AdminLayout: React.FC = () => {
  return (
    <>
      <Stack>
        <Stack.Screen name="delete-user" options={{ headerShown: false }} />
        <Stack.Screen name="list-users" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="admin-info" options={{ headerShown: false }} />
        <Stack.Screen name="list-reservations" options={{ headerShown: false }} />
        <Stack.Screen name="reservation-detail" options={{ headerShown: false }} />
      </Stack>
      <StatusBar backgroundColor="#161622" style="light" />
    </>
  );
};

export default AdminLayout;
