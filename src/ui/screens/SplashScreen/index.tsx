import React, {useState, useEffect, useContext} from 'react'
import {StyleSheet} from 'react-native'
import {Layout, Spinner} from '@ui-kitten/components'
import {EventEmitter, LocalStorage} from '@react-native-granite/core'
import {controller as AccountsController, AUTH_EVENTS} from '@accounts'
import {LOCAL_STORAGE} from '@constants'
import {AuthContext, BookingContext} from '@contexts'
import {RootScreenProps} from 'types'
import {useIsFocused} from '@react-navigation/native'

const SplashScreen: React.FC<RootScreenProps<'SplashScreen'>> = ({
  navigation,
}) => {
  console.log('INSIDE SPLASH SCREEN')
  const {setProfileImage, setEmployeeID, setUserRole} = useContext(AuthContext)
  const {updatePermissions} = useContext(BookingContext)
  const [eventEmitter] = useState(new EventEmitter())
  const focus = useIsFocused()

  useEffect(() => {
    const subscription = eventEmitter.getObservable().subscribe(event => {
      switch (event.type) {
        case AUTH_EVENTS.LOAD_PROFILE_START:
          break
        case AUTH_EVENTS.LOAD_PROFILE_SUCCESS:
          setProfileImage(event.data.user?.profile_image ?? '')
          console.log(
            'THE EMPLOYEE ID IS ---------------------------->',
            event.data.pk,
          )
          setEmployeeID(event.data.pk)
          setUserRole(event.data.role.name)
          openApp()
          break
        case AUTH_EVENTS.LOAD_PROFILE_FAILURE:
          openApp()
          break
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    init()
  }, [focus])

  const openApp = async () => {
    await updatePermissions()
    navigation.reset({
      index: 0,
      routes: [{name: 'App'}],
    })
  }

  const init = async () => {
    const token = await LocalStorage.get(LOCAL_STORAGE.AUTH_TOKEN)
    if (token) AccountsController.getProfile(eventEmitter, false, true)
    else
      navigation.reset({
        index: 0,
        routes: [{name: 'Auth'}],
      })
  }

  return (
    <Layout style={styles.container}>
      <Spinner />
    </Layout>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default SplashScreen
