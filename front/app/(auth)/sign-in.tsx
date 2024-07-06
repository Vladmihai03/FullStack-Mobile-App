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
  email: string;
  password: string;
}

const SignIn: React.FC = () => {
  const [form, setForm] = useState<FormState>({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const submit = async () => {
    setIsSubmitting(true);
    try {
      const response = await api.post('/signin', { email: form.email, password: form.password });
      const { token } = response.data;
      await AsyncStorage.setItem('token', token);
      Alert.alert('Success', 'Signed in successfully');
      router.push('/info'); // Navigate to the desired screen after sign-in
    } catch (error) {
      console.error('Error signing in:', error);
      Alert.alert('Error', 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full justify-center min-h-[65vh] px-4 my-6">
          <Text className="text-2xl text-white text-semibold mt-5 mb-5 ">
            Log in
          </Text>
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
            
          />
          <CustomButton 
            title="Sign In"
            handlePress={submit}
            containerStyles="mt-7"
            isloading={isSubmitting}
          />
          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 ">
              Don't have an account?
            </Text>
            <Link href="/(auth)/sign-up" className="text-lg  text-secondary">
              Sign Up
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
