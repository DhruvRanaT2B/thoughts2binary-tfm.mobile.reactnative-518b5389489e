import React, {useState, useCallback, useEffect} from 'react'
import {
  StyleSheet,
  ScrollView,
  ImageBackground,
  StatusBar,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native'
import {Input, Button, Text, Layout} from '@ui-kitten/components'
import Logo from '@images/logo.svg'
import {SafeAreaView} from '@components'
import STRINGS from './strings'
import {AuthScreenProps} from 'types'
import {EventEmitter, LocalStorage} from '@react-native-granite/core'
import {AUTH_EVENTS, controller} from '@accounts'
import WebView from 'react-native-webview'
import {LOCAL_STORAGE} from '@constants'

// Global Constants
const eventEmitter = new EventEmitter()

const SingleSignOn: React.FC<AuthScreenProps<'Login'>> = ({navigation}) => {
  const [email, setEmail] = useState('')
  const [emailErrorText, setEmailErrorText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [url, setUrl] = useState()
  const [webHeight, setWebHeight] = useState<number | undefined>()

  const onEmailChange = useCallback(text => {
    setEmail(text)
    if (text.length === 0) setEmailErrorText(STRINGS.EMPTY_EMAIL)
    else setEmailErrorText('')
  }, [])

  const onNextPress = () => {
    setIsLoading(true)
    controller.ssoLogin(eventEmitter, email)
  }

  useEffect(() => {
    const subscription = eventEmitter.getObservable().subscribe(event => {
      switch (event.type) {
        case AUTH_EVENTS.SSO_START:
          setIsLoading(true)
          break
        case AUTH_EVENTS.SSO_SUCCESS:
          setUrl(event.data)
          break
        case AUTH_EVENTS.SSO_FAILURE:
          setIsLoading(false)
          Alert.alert('', STRINGS.ssoLoginFailedMessage)
          break
        case AUTH_EVENTS.INVALID_INPUT:
          setIsLoading(false)
          setEmailErrorText(event.data)
          break
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const onUrlChange = async (event: any) => {
    if (event.url.includes('access_token')) setWebHeight(1)
    if (
      event.url.includes('/login/') &&
      (event.url.includes('intent://') ||
        event.url.includes('forcefieldshare://'))
    ) {
      let value = event.url.match(/login\/(.*)/)[1]
      await LocalStorage.set(
        LOCAL_STORAGE.AUTH_TOKEN,
        String(
          Platform.OS === 'android'
            ? value.slice(0, value.indexOf('#'))
            : value,
        ),
      )
      navigation.navigate('SplashScreen')
    }
  }

  return (
    <ImageBackground
      style={[styles.imageContainer]}
      source={url ? {uri: ''} : require('@images/authBackground.png')}>
      <SafeAreaView style={styles.safeAreaView}>
        {url ? (
          <Layout style={[styles.container, !!webHeight && styles.hideView]}>
            <WebView
              style={[
                styles.webViewDimensions,
                webHeight && {height: webHeight, width: 1},
              ]}
              originWhitelist={['*', 'intent://']}
              source={{uri: url}}
              setSupportMultipleWindows={true}
              onNavigationStateChange={event => {
                onUrlChange(event)
              }}
            />
          </Layout>
        ) : (
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
            <Button
              style={styles.button}
              size="large"
              onPress={onNextPress}
              disabled={isLoading || !email}>
              {STRINGS.BUTTON_NEXT}
            </Button>
            <Text style={styles.ssoText} onPress={() => navigation.goBack()}>
              {STRINGS.STANDARD_SIGNIN}
            </Text>
          </ScrollView>
        )}
      </SafeAreaView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  webViewDimensions: {
    height: '100%',
    width: '100%',
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
  hideView: {
    flex: undefined,
    height: 1,
    width: 1,
  },
})

export default SingleSignOn
