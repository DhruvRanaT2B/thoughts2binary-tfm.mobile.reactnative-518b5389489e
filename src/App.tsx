import React, {useCallback, useEffect} from 'react'
import {Alert, Linking} from 'react-native'
import {
  GraniteContainer,
  Networking,
  LocalStorage,
  Notification,
  GraniteApp,
  Router,
} from '@react-native-granite/core'
import {SafeAreaProvider} from 'react-native-safe-area-context'
import {default as theme} from '../theme.json'
import {IconRegistry} from '@ui-kitten/components'
import {EvaIconsPack} from '@ui-kitten/eva-icons'
import {
  BookingContextProvider,
  AuthContextProvider,
  IncidentContextProvider,
} from '@contexts'
import {LOCAL_STORAGE} from '@constants'

// @ts-ignore
import {API_END_POINT} from '@env'
import RootNavigator from './ui/navigation'

// Global Variables
let loggingOut = false

const App = () => {
  useEffect(() => {
    // Handle 401
    Networking.configure(API_END_POINT, {
      responseInterceptor: async (response, error) => {
        if (error?.response?.status === 401 && !loggingOut) {
          loggingOut = true
          const authToken = await LocalStorage.get(LOCAL_STORAGE.AUTH_TOKEN)
          if (authToken) {
            await GraniteApp.logout()
            Router.navigate('SplashScreen')
            Alert.alert('', 'You have been logout. Please login again')
          }
          loggingOut = false
        }
      },
    })
  }, [])

  // const parseURL = useCallback(async ({url}: {url: string}) => {
  //   console.log('URL ->', url)
  //   const authToken = await LocalStorage.get(LOCAL_STORAGE.AUTH_TOKEN)
  //   if (!authToken) return
  //   if (url.match(/incidents/)) {
  //     Notification.navigateTo('App', {
  //       screen: 'Dashboard',
  //       params: {
  //         screen: 'Incidents',
  //       },
  //     })
  //   } else if (url.match(/bookings\/edit\/(\d+)/)) {
  //     Notification.navigateTo('App', {
  //       screen: 'BookingsStack',
  //       params: {
  //         screen: 'BookingDetail',
  //         params: {bookingID: Number(url.match(/bookings\/edit\/(\d+)/)!![1])},
  //       },
  //     })
  //   }
  // }, [])

  // const getInitialURL = useCallback(async () => {
  //   const url = await Linking.getInitialURL()
  //   if (url) parseURL({url})
  // }, [])

  // useEffect(() => {
  //   // Handle Deep Linking
  //   getInitialURL()
  //   Linking.addEventListener('url', parseURL)

  //   return () => {
  //     Linking.removeEventListener('url', parseURL)
  //   }
  // }, [])

  useEffect(() => {
    initialiseDeepLink()
    Linking.addEventListener('url', handleDeepLink)

    return () => {
      Linking.removeEventListener('url', handleDeepLink)
    }
  }, [])

  const initialiseDeepLink = useCallback(async () => {
    const url = await Linking.getInitialURL()
    if (url) handleDeepLink({url})
  }, [])

  const handleDeepLink = useCallback(async event => {
    if (!event.url.includes('/login/')) return
    try {
      const value = event.url.match(/login\/(.*)/)[1]
      const authToken = await LocalStorage.get(LOCAL_STORAGE.AUTH_TOKEN)
      if (authToken) {
        // User is already logged in
        return
      }
      Router.navigate('SplashScreen')
    } catch (error) {
      console.log('handleDeepLink error', error)
    }
  }, [])

  return (
    <SafeAreaProvider>
      <GraniteContainer theme={theme}>
        <IconRegistry icons={EvaIconsPack} />
        <BookingContextProvider>
          <IncidentContextProvider>
            <AuthContextProvider>
              <RootNavigator />
            </AuthContextProvider>
          </IncidentContextProvider>
        </BookingContextProvider>
      </GraniteContainer>
    </SafeAreaProvider>
  )
}

export default App
