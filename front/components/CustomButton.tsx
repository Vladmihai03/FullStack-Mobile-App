import { TouchableOpacity, Text } from 'react-native';
import { Link } from 'expo-router';
import React from 'react';

interface CustomButtonProps {
  title: string;
  handlePress: () => void;
  containerStyles?: string;
  textStyles?: string;
  isloading?: boolean;
  linkTo?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  handlePress,
  containerStyles = '',
  textStyles = '',
  isloading = false,
  linkTo,
}) => {
  if (linkTo) {
    return (
      <Link href={linkTo} asChild>
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.7}
          className={`bg-purple-700 rounded-xl min-h-[62px] justify-center items-center ${containerStyles} ${isloading ? 'opacity-50' : ''}`}
          disabled={isloading}
        >
          <Text className={`text-white font-semibold text-lg ${textStyles}`}>{title}</Text>
        </TouchableOpacity>
      </Link>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={`bg-purple-700 rounded-xl min-h-[62px] justify-center items-center ${containerStyles} ${isloading ? 'opacity-50' : ''}`}
      disabled={isloading}
    >
      <Text className={`text-white font-semibold text-lg ${textStyles}`}>{title}</Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
