import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { useRouter } from 'expo-router';
import { Link } from 'expo-router';
import api from '../../api'; // Import the Axios instance

interface FormState {
  username: string;
  email: string;
  password: string;
  description: string;
}

const SignUp: React.FC = () => {
  const [form, setForm] = useState<FormState>({ username: '', email: '', password: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const submit = async () => {
    setIsSubmitting(true);
    try {
      const response = await api.post('/user', {
        username: form.username,
        email: form.email,
        password: form.password,
        description: form.description
      });
      const { token } = response.data;
      await AsyncStorage.setItem('token', token);
      Alert.alert('Success', 'Signed up successfully');
      router.push('/info'); // Navigate to the desired screen after sign-up
    } catch (error) {
      console.error('Error signing up:', error);
      Alert.alert('Error', 'Failed to sign up');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full justify-center min-h-[65vh] px-4 my-6">
          <Text className="text-2xl text-white text-semibold mt-5 mb-5 ">
            Register
          </Text>
          <FormField 
            title="Username"
            value={form.username}
            handleChangeText={(e) => setForm({ ...form, username: e })}
            otherStyles="mt-7"
          />
          <FormField 
            title="Email"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles="mt-7"
            keyboardType="email-address"
          />
          <FormField 
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
            secureTextEntry
          />
          <FormField 
            title="Description"
            value={form.description}
            handleChangeText={(e) => setForm({ ...form, description: e })}
            otherStyles="mt-7"
          />
          <CustomButton 
            title="Sign Up"
            handlePress={submit}
            containerStyles="mt-7"
            isloading={isSubmitting}
          />
          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 ">
              Have already an account?
            </Text>
            <Link href="/(auth)/sign-in" className="text-lg  text-secondary">
              Log in
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
