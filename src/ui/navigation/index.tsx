import React from 'react'
import {GraniteContainer, GraniteApp} from '@react-native-granite/core'
import {createStackNavigator} from '@react-navigation/stack'

import SplashScreenPage from '../screens/SplashScreen'
import AuthStack from './AuthStack'
import AppStack from './AppStack'
import {RootStackParamList} from 'types'

// Global Constants
const Stack = createStackNavigator<RootStackParamList>()

const RootNavigator: React.FC = () => (
  <GraniteApp.RootStack initialRouteName="SplashScreen" headerMode="none">
    <Stack.Screen name="SplashScreen" component={SplashScreenPage} />
    <Stack.Screen name="Auth" component={AuthStack} />
    <Stack.Screen name="App" component={AppStack} />
  </GraniteApp.RootStack>
)

export default RootNavigator
