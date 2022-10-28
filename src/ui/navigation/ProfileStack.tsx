import React from 'react'
import {createStackNavigator} from '@react-navigation/stack'
import {Layout, useTheme} from '@ui-kitten/components'

import ProfileEditScreen from '../screens/profile/ProfileEdit'
import VerificationScreen from '../screens/profile/VerificationScreen'
import {ProfileStackParamList} from 'types'
import STRINGS from './strings'

// Global Constants
const Stack = createStackNavigator<ProfileStackParamList>()

function ProfileStack() {
  const theme = useTheme()

  const CustomHeaderBackground = () => (
    <Layout
      style={{flex: 1, backgroundColor: theme['color-primary-default']}}
    />
  )
  return (
    <Stack.Navigator
      screenOptions={{
        headerBackground: CustomHeaderBackground,
        headerBackTitle: STRINGS.LABEL_BACK,
        headerTintColor: 'white',
      }}>
      <Stack.Screen
        name="ProfileEdit"
        component={ProfileEditScreen}
        options={{title: STRINGS.LABEL_EDIT_PROFILE}}
      />
      <Stack.Screen
        name="VerificationScreen"
        component={VerificationScreen}
        options={{title: STRINGS.LABEL_EMAIL_VERIFICATION}}
      />
    </Stack.Navigator>
  )
}

export default ProfileStack
