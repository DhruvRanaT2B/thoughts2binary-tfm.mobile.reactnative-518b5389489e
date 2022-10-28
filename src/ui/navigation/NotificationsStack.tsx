import React from 'react'
import {createStackNavigator} from '@react-navigation/stack'

import NotificationOverviewScreen from '../screens/notifications/Overview'
import {NotificationsStackParamList} from 'types'

// Global Constants
const Stack = createStackNavigator<NotificationsStackParamList>()

function NotificationsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="NotificationOverview"
        component={NotificationOverviewScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  )
}

export default NotificationsStack
