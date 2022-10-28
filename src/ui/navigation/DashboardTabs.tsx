import React, {useContext} from 'react'
import {SafeAreaView} from '@components'
import {StyleSheet, Image} from 'react-native'
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs'
import {
  BottomNavigation,
  BottomNavigationTab,
  Icon,
  Layout,
  useTheme,
} from '@ui-kitten/components'

import BookingsTabs from './BookingsTabs'
import IncidentTabs from './IncidentTabs'
import NotificationsStack from './NotificationsStack'
import MyProfileScreen from '../screens/profile/MyProfile'
import {DashboardTabsParamList} from 'types'
import Booking from '@images/Booking.svg'
import {AuthContext} from '@contexts'

// Global Constants
const Tab = createBottomTabNavigator<DashboardTabsParamList>()

function DashboardTabs() {
  const theme = useTheme()
  const {profileImage} = useContext(AuthContext)

  const CustomBottomTabs = ({navigation, state}: BottomTabBarProps) => (
    <SafeAreaView edges={['bottom', 'left', 'right']}>
      <BottomNavigation
        selectedIndex={state.index}
        onSelect={index => navigation.navigate(state.routeNames[index])}>
        <BottomNavigationTab
          title="Bookings"
          icon={props => (
            <Booking
              color={props?.style?.tintColor ?? 'grey'}
              style={styles.tabIcon}
            />
          )}
          style={styles.tabItemContainer}
        />
        <BottomNavigationTab
          title="Incidents"
          icon={props => <Icon {...props} name="alert-circle" />}
          style={styles.tabItemContainer}
        />
        <BottomNavigationTab
          title="Notifications"
          icon={props => <Icon {...props} name="bell" />}
          style={styles.tabItemContainer}
        />
        <BottomNavigationTab
          title="My Profile"
          icon={() => {
            if (profileImage)
              return (
                <Image
                  source={{uri: profileImage}}
                  style={[
                    styles.profileIcon,
                    {borderColor: theme['color-primary-default']},
                  ]}
                />
              )

            return (
              <Layout
                style={[
                  styles.profileIconPlaceholder,
                  {borderColor: theme['color-primary-default']},
                ]}>
                <Image
                  source={require('@images/user_icon.png')}
                  resizeMode="contain"
                  style={styles.avatar}
                />
              </Layout>
            )
          }}
          style={styles.tabItemContainer}
        />
      </BottomNavigation>
    </SafeAreaView>
  )

  return (
    <Tab.Navigator
      initialRouteName="Bookings"
      tabBar={CustomBottomTabs}
      backBehavior="initialRoute">
      <Tab.Screen name="Bookings" component={BookingsTabs} />
      <Tab.Screen name="Incidents" component={IncidentTabs} />
      <Tab.Screen
        name="Notifications"
        component={NotificationsStack}
        options={{unmountOnBlur: true}}
      />
      <Tab.Screen name="MyProfile" component={MyProfileScreen} />
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  tabItemContainer: {
    justifyContent: 'space-between',
  },
  tabIcon: {
    marginTop: 4,
  },
  profileIcon: {
    height: 24,
    width: 24,
    borderRadius: 24,
    backgroundColor: 'lightgrey',
    borderWidth: 1,
    marginTop: 4,
  },
  profileIconPlaceholder: {
    height: 24,
    width: 24,
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 10,
    height: 10,
  },
})

export default DashboardTabs
