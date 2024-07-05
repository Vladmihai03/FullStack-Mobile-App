import { View, Text, Image, ImageBackground } from 'react-native'
import React from 'react'
import images from '../constants/Colors'
import { StatusBar } from 'expo-status-bar'
import CustomButton from '@/components/CustomButton'
import {Redirect, router} from 'expo-router'

const App = () => {
  return (
    <View className='flex-1'>
      <ImageBackground 
      source={images.homepage} 
      className="flex-1 items-center justify-center opacity-80" 
      resizeMode='cover'>
        <CustomButton title="Welcome"  handlePress={()=>router.push('/sign-in')} containerStyles="w-50 mt-7" />
      </ImageBackground>
      <StatusBar  backgroundColor='#161622' style='light'/>
    </View>
  )
}

export default App