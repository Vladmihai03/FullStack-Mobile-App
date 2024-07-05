import { TouchableOpacity, Text } from 'react-native';
import React from 'react';

interface CustomButtonProps {
  title: string;
  handlePress: () => void;
  containerStyles?: string;
  textStyles?: string;
  isloading?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({ title, handlePress, containerStyles = '', textStyles = '', isloading = false }) => {
  return (
    <TouchableOpacity 
      onPress={handlePress}
      activeOpacity={0.7}
      className={`bg-purple-700 rounded-full py-3 px-6 justify-center items-center shadow-lg ${containerStyles} ${isloading ? 'opacity-50' : ''}`}
      disabled={isloading}
    >
      <Text className={`text-white font-semibold text-lg ${textStyles}`}>{title}</Text>
    </TouchableOpacity>
  );
}

export default CustomButton;
