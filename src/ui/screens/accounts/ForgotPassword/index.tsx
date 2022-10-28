import React, {useState, useEffect, useCallback} from 'react'
import {StyleSheet, ScrollView, ImageBackground, Alert} from 'react-native'
import {Layout, Input, Button, Text, Modal} from '@ui-kitten/components'
import {AuthScreenProps} from 'types'
import STRINGS from './strings'
import {SafeAreaView} from '@components'
import {EventEmitter} from '@react-native-granite/core'
import {AUTH_EVENTS, controller} from '@accounts'
import SuccessIcon from '@images/SuccessIcon.svg'
import Logo from '@images/logo.svg'

// Global constants
const eventEmitter = new EventEmitter()

const ForgotPassword: React.FC<AuthScreenProps<'ForgotPassword'>> = ({
  navigation,
}) => {
  const [email, setEmail] = useState('')
  const [errorText, setErrorText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)

  useEffect(() => {
    const subscription = eventEmitter.getObservable().subscribe(event => {
      switch (event.type) {
        case AUTH_EVENTS.RESET_PASSWORD_START:
          setIsLoading(true)
          break
        case AUTH_EVENTS.RESET_PASSWORD_SUCCESS:
          setIsLoading(false)
          setModalVisible(true)
          break
        case AUTH_EVENTS.RESET_PASSWORD_FAILURE:
          setIsLoading(false)
          Alert.alert('', STRINGS.SOMETHING_WENT_WRONG)
          break
        case AUTH_EVENTS.INVALID_INPUT:
          setIsLoading(false)
          setErrorText(event.data)
          break
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const resetPassword = useCallback(() => {
    controller.resetPassword(eventEmitter, email)
  }, [eventEmitter, email])

  const onModalClose = useCallback(() => {
    setModalVisible(false)
  }, [])

  const openSignUp = useCallback(
    () => navigation.replace('Signup'),
    [navigation],
  )

  const goBack = useCallback(() => navigation.goBack(), [navigation])

  const onEmailChange = useCallback(text => {
    setEmail(text)
    if (text.length === 0) setErrorText(STRINGS.EMPTY_EMAIL)
    else setErrorText('')
  }, [])

  return (
    <ImageBackground
      style={styles.container}
      source={require('@images/authBackground.png')}>
      <SafeAreaView style={styles.safeAreaView}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollView}>
          <Logo style={styles.image} />
          <Text style={styles.title}>{STRINGS.FORGOT_TITLE}</Text>
          <Text style={styles.whiteText}>{STRINGS.FORGOT_TEXT}</Text>
          <Input
            style={styles.input}
            placeholder={STRINGS.EMAIL_PLACEHOLDER}
            value={email}
            autoCapitalize="none"
            size="large"
            keyboardType="email-address"
            onChangeText={onEmailChange}
            caption={errorText}
            status={errorText ? 'danger' : 'basic'}
            autoCorrect={false}
          />
          <Button
            style={styles.button}
            size="large"
            disabled={!email || isLoading}
            onPress={resetPassword}>
            {STRINGS.BUTTON_SEND_EMAIL}
          </Button>
          <Button
            style={styles.button}
            size="large"
            disabled={!email || isLoading}
            onPress={resetPassword}>
            {STRINGS.BUTTON_RESEND_LINK}
          </Button>
          <Text style={styles.returnLogin} onPress={goBack}>
            {STRINGS.RETURN_TO_LOGIN}
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
        <Modal visible={modalVisible} backdropStyle={styles.backdrop}>
          <Layout style={styles.modalWrapper}>
            <SuccessIcon />
            <Text style={styles.modalText}>
              {STRINGS.TEXT_MODAL + ' ' + email}
            </Text>
            <Button style={styles.modalButton} onPress={onModalClose}>
              {STRINGS.BUTTON_OKAY}
            </Button>
          </Layout>
        </Modal>
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
  title: {
    fontSize: 22,
    color: 'white',
    marginBottom: 12,
  },
  input: {
    marginVertical: 32,
  },
  button: {
    marginVertical: 8,
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
  whiteText: {
    color: 'white',
  },
  returnLogin: {
    textDecorationLine: 'underline',
    alignSelf: 'center',
    color: 'white',
    marginTop: 6,
    marginBottom: 12,
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalWrapper: {
    marginHorizontal: 24,
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderRadius: 4,
    alignItems: 'center',
  },
  modalButton: {
    marginTop: 24,
    paddingHorizontal: 32,
  },
  modalText: {
    textAlign: 'center',
    marginTop: 18,
  },
})

export default ForgotPassword
