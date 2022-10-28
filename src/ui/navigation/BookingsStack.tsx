import React from 'react'
import {createStackNavigator} from '@react-navigation/stack'
import {Layout, useTheme} from '@ui-kitten/components'

import AddNewBookingScreen from '../screens/bookings/AddNewBooking'
import SelectVehicleScreen from '../screens/bookings/SelectVehicle'
import SelectBookingPurposeScreen from '../screens/bookings/SelectBookingPurpose'
import BookingPreviewScreen from '../screens/bookings/BookingPreview'
import BookingDetailsScreen from '../screens/bookings/BookingDetails'
import VehicleFiltersScreen from '../screens/bookings/VehicleFilters'
import BookingCheckInScreen from '../screens/bookings/BookingCheckIn'
import BookingCheckOutScreen from '../screens/bookings/BookingCheckOut'
import BookingExtendScreen from '../screens/bookings/BookingExtend'

import {modalOptions} from './modalOptions'
import {BookingsStackParamList} from 'types'
import STRINGS from './strings'

// Global Constants
const Stack = createStackNavigator<BookingsStackParamList>()

function BookingsStack() {
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
        headerTitle: STRINGS.LABEL_ADD_NEW_BOOKING,
        headerBackTitle: STRINGS.LABEL_BACK,
      }}>
      <Stack.Screen name="AddNewBooking" component={AddNewBookingScreen} />
      <Stack.Screen name="SelectVehicle" component={SelectVehicleScreen} />
      <Stack.Screen
        name="SelectBookingPurpose"
        component={SelectBookingPurposeScreen}
      />
      <Stack.Screen name="BookingPreview" component={BookingPreviewScreen} />
      <Stack.Screen
        name="BookingDetail"
        component={BookingDetailsScreen}
        options={{headerTitle: STRINGS.LABEL_BOOKINGS}}
      />
      <Stack.Screen
        name="VehicleFilters"
        component={VehicleFiltersScreen}
        options={{
          headerTitle: STRINGS.LABEL_FILTER,
        }}
      />
      <Stack.Screen
        name="BookingCheckIn"
        component={BookingCheckInScreen}
        options={{
          ...modalOptions,
          headerTitle: STRINGS.LABEL_BOOKINGS,
        }}
      />
      <Stack.Screen
        name="BookingCheckOut"
        component={BookingCheckOutScreen}
        options={{
          ...modalOptions,
          headerTitle: STRINGS.LABEL_BOOKINGS,
        }}
      />
      <Stack.Screen
        name="BookingExtend"
        component={BookingExtendScreen}
        options={{
          ...modalOptions,
          headerTitle: STRINGS.LABEL_BOOKINGS,
        }}
      />
    </Stack.Navigator>
  )
}

export default BookingsStack
