import React, {useState, useCallback, useEffect, useContext} from 'react'
import {
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
  ImageBackground,
  StatusBar,
  Alert,
  Platform,
} from 'react-native'
import {
  Input,
  Icon,
  IconProps,
  Button,
  Text,
  CheckBox,
} from '@ui-kitten/components'
import {AuthScreenProps} from 'types'
import STRINGS from './strings'
import {SafeAreaView} from '@components'
import {EventEmitter, LocalStorage} from '@react-native-granite/core'
import {AUTH_EVENTS, controller} from '@accounts'
import {AuthContext, BookingContext} from '@contexts'
import Logo from '@images/logo.svg'
import {LOCAL_STORAGE} from '@constants'

// Global Constants
const eventEmitter = new EventEmitter()

const Login: React.FC<AuthScreenProps<'Login'>> = ({navigation}) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [secureTextEntry, setSecureTextEntry] = useState(true)
  const [emailErrorText, setEmailErrorText] = useState('')
  const [passwordErrorText, setPasswordErrorText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [checked, setChecked] = useState<any>(false)

  const {updatePermissions} = useContext(BookingContext)
  const {setProfileImage, setEmployeeID, setUserRole} = useContext(AuthContext)

  const renderEye = useCallback(
    (props: IconProps) => (
      <TouchableWithoutFeedback
        onPress={() => setSecureTextEntry(!secureTextEntry)}>
        <Icon {...props} name={secureTextEntry ? 'eye-off' : 'eye'} />
      </TouchableWithoutFeedback>
    ),
    [secureTextEntry],
  )

  const onLoginPress = useCallback(async () => {
    controller.login(eventEmitter, email, password)
  }, [email, password])

  const onEmailChange = useCallback(text => {
    setEmail(text)
    if (text.length === 0) setEmailErrorText(STRINGS.EMPTY_EMAIL)
    else setEmailErrorText('')
  }, [])

  const onPasswordChange = useCallback(text => {
    setPassword(text)
    if (text.length === 0) setPasswordErrorText(STRINGS.EMPTY_PASSWORD)
    else setPasswordErrorText('')
  }, [])

  const openForgotPassword = useCallback(
    () => navigation.navigate('ForgotPassword'),
    [navigation],
  )

  const openSignUp = useCallback(
    () => navigation.navigate('Signup'),
    [navigation],
  )

  const openApp = useCallback(async () => {
    await updatePermissions()
    navigation.replace('App')
  }, [])

  async function getState() {
    setChecked(await controller.getRememberMeState())
  }

  useEffect(() => {
    getState()
    if (Platform.OS == 'android') {
      controller.getPassword(setEmail, setPassword)
    }
  }, [])

  useEffect(() => {
    const subscription = eventEmitter.getObservable().subscribe(event => {
      switch (event.type) {
        case AUTH_EVENTS.LOGIN_START:
          setIsLoading(true)
          break
        case AUTH_EVENTS.LOGIN_SUCCESS:
          LocalStorage.set(
            LOCAL_STORAGE.REMEMBER_ME,
            checked ? 'true' : 'false',
          )
          if (checked && Platform.OS == 'android') {
            controller.setPassword(email, password)
          } else {
            controller.resetKeychainPassword()
          }
          controller.getProfile(eventEmitter, true, true)
          break
        case AUTH_EVENTS.LOGIN_FAILURE:
          setIsLoading(false)
          Alert.alert('', STRINGS.INVALID_CREDENTIALS)
          break
        case AUTH_EVENTS.INVALID_INPUT:
          setIsLoading(false)
          setEmailErrorText(event.data)
          break

        case AUTH_EVENTS.LOAD_PROFILE_START:
          setIsLoading(true)
          break
        case AUTH_EVENTS.LOAD_PROFILE_SUCCESS:
          setEmployeeID(event.data.pk)
          setUserRole(event.data.role.name)
          setIsLoading(false)
          openApp()
          break
        case AUTH_EVENTS.LOAD_PROFILE_FAILURE:
          setIsLoading(false)
          Alert.alert('', STRINGS.SOMETHING_WENT_WRONG)
          break
      }
    })
    return () => subscription.unsubscribe()
  }, [checked, email])

  const singleSignOnPress = () => {
    console.log('SINGLE SIGN-ON SCREEN')
    navigation.navigate('SingleSignOn')
  }

  return (
    <ImageBackground
      style={styles.container}
      source={require('@images/authBackground.png')}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeAreaView}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollView}>
          <Logo style={styles.image} />
          <Input
            style={styles.input}
            placeholder={STRINGS.USERNAME_PLACEHOLDER}
            value={email}
            autoCapitalize="none"
            size="large"
            keyboardType="email-address"
            onChangeText={onEmailChange}
            status={emailErrorText ? 'danger' : 'basic'}
            caption={emailErrorText}
            autoCorrect={false}
            textContentType={'username'}
          />
          <Input
            style={styles.input}
            placeholder={STRINGS.PASSWORD_PLACEHOLDER}
            value={password}
            accessoryRight={renderEye}
            secureTextEntry={secureTextEntry}
            size="large"
            onChangeText={onPasswordChange}
            status={passwordErrorText ? 'danger' : 'basic'}
            caption={passwordErrorText}
            autoCorrect={false}
            textContentType={'password'}
          />
          <CheckBox checked={checked} onChange={() => setChecked(!checked)}>
            {() => (
              <Text style={styles.checkboxText}>{STRINGS.REMEMBER_ME}</Text>
            )}
          </CheckBox>
          <Button
            style={styles.button}
            size="large"
            onPress={onLoginPress}
            disabled={isLoading || !email || !password}>
            {STRINGS.BUTTON_LOGIN}
          </Button>
          {/* <Text style={styles.ssoText} onPress={singleSignOnPress}>
            {STRINGS.SSO_SIGN_IN}
          </Text> */}
          <Text style={styles.forgotPassword} onPress={openForgotPassword}>
            {STRINGS.TEXT_FORGOT_PASSWORD}
          </Text>
        </ScrollView>
        {/* <Layout style={styles.footer}>
          <Text style={styles.footerText}>
            {STRINGS.TEXT_NEW_USER + '  '}
            <Text style={styles.signUp} onPress={openSignUp}>
              {STRINGS.BUTTON_SIGN_UP}
            </Text>
          </Text>
        </Layout> */}
      </SafeAreaView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeAreaView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  image: {
    height: '14%',
    width: '100%',
    marginVertical: 24,
    alignSelf: 'center',
  },
  input: {
    marginVertical: 12,
  },
  button: {
    marginTop: 24,
    marginBottom: 18,
  },
  ssoText: {
    textDecorationLine: 'underline',
    alignSelf: 'center',
    color: 'white',
    marginBottom: 12,
  },
  forgotPassword: {
    textDecorationLine: 'underline',
    alignSelf: 'center',
    color: 'white',
    marginBottom: 12,
  },
  footer: {
    alignItems: 'center',
    padding: 8,
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
  },
  footerText: {
    color: 'white',
    textAlign: 'center',
  },
  signUp: {
    textDecorationLine: 'underline',
    color: 'white',
  },
  checkboxText: {
    marginHorizontal: 10,
    color: 'white',
  },
})

export default Login
