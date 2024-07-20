import React, { useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '@/components/CustomButton';

const Home: React.FC = () => {
  const navigation = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  return (
    <SafeAreaView className="bg-primary h-full">
      <View className="w-full justify-center min-h-[65vh] px-4 my-6 mt-20">
          <CustomButton 
            title="List Reservations"
            handlePress={()=> {}}
            containerStyles="mt-7"
            isloading={isSubmitting}
            linkTo='/list-reservations'
          />
          <CustomButton 
            title="List Users"
            handlePress={()=> {}}
            containerStyles="mt-7"
            isloading={isSubmitting}
            linkTo='/list-users'
          />
          <CustomButton 
            title="HomePage"
            handlePress={()=> {}}
            containerStyles="mt-7"
            isloading={isSubmitting}
            linkTo='/'
          />
      </View>
    </SafeAreaView>
  );
};

export default Home;
