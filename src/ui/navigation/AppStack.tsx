import React from 'react'
import {createStackNavigator} from '@react-navigation/stack'
import {Layout} from '@ui-kitten/components'

import {AppStackParamList} from 'types'
import DashboardTabs from './DashboardTabs'
import BookingsStack from './BookingsStack'
import IncidentStack from './IncidentStack'
import ProfileStack from './ProfileStack'

// Global Constants
const Stack = createStackNavigator<AppStackParamList>()

function AppStack() {
  const CustomHeaderBackground = () => (
    <Layout style={{flex: 1, borderBottomWidth: 0.5}} />
  )
  return (
    <Stack.Navigator
      screenOptions={{
        headerBackground: CustomHeaderBackground,
        headerShown: false,
      }}>
      <Stack.Screen name="Dashboard" component={DashboardTabs} />
      <Stack.Screen name="BookingsStack" component={BookingsStack} />
      <Stack.Screen name="IncidentStack" component={IncidentStack} />
      <Stack.Screen name="ProfileStack" component={ProfileStack} />
    </Stack.Navigator>
  )
}

export default AppStack
