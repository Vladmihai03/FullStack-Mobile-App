import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { useRouter } from 'expo-router';
import { Link } from 'expo-router';

interface FormState {
  username: string,
  email: string;
  password: string;
}

const SignUp: React.FC = () => {
  const [form, setForm] = useState<FormState>({ username: '', email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const submit = () => {
    setIsSubmitting(true);
    // Handle form submission logic here
    router.push({
      pathname: "/info",
      params: { username: form.username,email: form.email, password: form.password },
    });
    setIsSubmitting(false);
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full justify-center min-h-[65vh] px-4 my-6">
          <Text className="text-2xl text-white text-semibold mt-5 mb-5 font-psemibold">
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
          />
          <CustomButton 
            title="Sign Up"
            handlePress={submit}
            containerStyles="mt-7"
            isloading={isSubmitting}
          />
          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">
              Have already ann account?
            </Text>
            <Link href="/(auth)/sign-in" className="text-lg font-psemibold text-secondary">
              Log in
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
