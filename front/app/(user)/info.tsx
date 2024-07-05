import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import CustomButton from '@/components/CustomButton';

const Info: React.FC = () => {
  const {username, email, password } = useLocalSearchParams();

  return (
    <View className=" bg-primary h-full flex-1 justify-center items-center">
      {username ?  <Text className="text-secondary-200 text-lg mb-4">Username: {username}</Text> : null}
      <Text className=" text-secondary-200 text-lg mb-4">Email: {email}</Text>
      <Text className="text-secondary-200 text-lg mb-4">Password: {password}</Text>
      <CustomButton 
            title="Home"
            handlePress={(): void=> {}}
            containerStyles="mt-7 w-40"
            linkTo='/'
          />
    </View>
  );
};

export default Info;
