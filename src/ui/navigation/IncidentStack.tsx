import React from 'react'
import {createStackNavigator} from '@react-navigation/stack'
import {Layout, useTheme} from '@ui-kitten/components'

import IncidentDetailsScreen from '../screens/incidents/IncidentDetails'
import {IncidentStackParamList} from 'types'
import STRINGS from './strings'

// Global Constants
const Stack = createStackNavigator<IncidentStackParamList>()

function IncidentStack() {
  const theme = useTheme()

  const CustomHeaderBackground = () => (
    <Layout
      style={{
        flex: 1,
        backgroundColor: theme['color-primary-default'],
      }}
    />
  )
  return (
    <Stack.Navigator
      screenOptions={{
        headerBackground: CustomHeaderBackground,
        headerTintColor: 'white',
        headerBackTitle: STRINGS.LABEL_BACK,
      }}>
      <Stack.Screen
        name="IncidentDetails"
        component={IncidentDetailsScreen}
        options={{title: STRINGS.LABEL_INCIDENT_DETAILS}}
      />
    </Stack.Navigator>
  )
}

export default IncidentStack
