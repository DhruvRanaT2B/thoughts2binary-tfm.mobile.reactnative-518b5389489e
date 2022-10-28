import React from 'react'
import {createStackNavigator} from '@react-navigation/stack'

import LoginPage from '../screens/accounts/Login'
import SignupPage from '../screens/accounts/Signup'
import ForgotPasswordPage from '../screens/accounts/ForgotPassword'
import {AuthStackParamList} from 'types'
import SingleSignOn from '../screens/accounts/SingleSignOn'

// Global Constants
const Stack = createStackNavigator<AuthStackParamList>()

function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="Login" headerMode="none">
      <Stack.Screen name="Login" component={LoginPage} />
      <Stack.Screen name="Signup" component={SignupPage} />
      <Stack.Screen name="SingleSignOn" component={SingleSignOn} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordPage} />
    </Stack.Navigator>
  )
}

export default AuthStack
