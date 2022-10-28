import React, {useState, useEffect, useCallback} from 'react'
import {ScrollView, Alert, ImageBackground, StyleSheet} from 'react-native'
import {
  Layout,
  Input,
  Button,
  Text,
  CheckBox,
  Modal,
  useTheme,
} from '@ui-kitten/components'
import {AuthScreenProps} from 'types'
import STRINGS from './strings'
import {SafeAreaView} from '@components'
import {EventEmitter} from '@react-native-granite/core'
import {AUTH_EVENTS, controller} from '@accounts'
import SuccessIcon from '@images/SuccessIcon.svg'
import RNExitApp from 'react-native-exit-app'
import Logo from '@images/logo.svg'

// Global Constants
const eventEmitter = new EventEmitter()

const SignUp: React.FC<AuthScreenProps<'Signup'>> = ({navigation}) => {
  const [email, setEmail] = useState('')
  const [emailErrorText, setEmailErrorText] = useState('')

  const [firstName, setFirstName] = useState('')
  const [firstNameErrorText, setFirstNameErrorText] = useState('')

  const [lastName, setLastName] = useState('')
  const [lastNameErrorText, setLastNameErrorText] = useState('')

  const [termsAccepted, setTermsAccepted] = useState(false)
  const [policyAccepted, setPolicyAccepted] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const theme = useTheme()

  const onBackdropPress = useCallback(() => {
    setModalVisible(false)
    RNExitApp.exitApp()
  }, [])

  const onSubmitPress = useCallback(() => {
    controller.signUp(eventEmitter, {firstName, lastName, email})
  }, [firstName, lastName, email])

  const onEmailChange = useCallback(text => {
    setEmail(text)
    if (text.length === 0) setEmailErrorText(STRINGS.EMPTY_EMAIL)
    else setEmailErrorText('')
  }, [])

  const onFirstNameChange = useCallback(text => {
    setFirstName(text)
    if (text.length === 0) setFirstNameErrorText(STRINGS.EMPTY_FIRST_NAME)
    else setFirstNameErrorText('')
  }, [])

  const onLastNameChange = useCallback(text => {
    setLastName(text)
    if (text.length === 0) setLastNameErrorText(STRINGS.EMPTY_LAST_NAME)
    else setLastNameErrorText('')
  }, [])

  useEffect(() => {
    const subscription = eventEmitter.getObservable().subscribe(event => {
      switch (event.type) {
        case AUTH_EVENTS.SIGNUP_START:
          setIsLoading(true)
          break
        case AUTH_EVENTS.SIGNUP_SUCCESS:
          setIsLoading(false)
          setModalVisible(true)
          break
        case AUTH_EVENTS.SIGNUP_FAILURE:
          setIsLoading(false)
          Alert.alert('', STRINGS.SOMETHING_WENT_WRONG)
          break
        case AUTH_EVENTS.INVALID_INPUT:
          setIsLoading(false)
          setEmailErrorText(event.data)
          break
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <ImageBackground
      source={require('@images/authBackground.png')}
      style={styles.container}>
      <SafeAreaView style={styles.safeAreaView}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollView}>
          <Logo style={styles.image} />
          <Input
            style={styles.input}
            placeholder={STRINGS.EMAIL_PLACEHOLDER}
            value={email}
            size="large"
            onChangeText={onEmailChange}
            autoCapitalize="none"
            keyboardType="email-address"
            status={emailErrorText ? 'danger' : 'basic'}
            caption={emailErrorText}
            autoCorrect={false}
          />
          <Input
            style={styles.input}
            placeholder={STRINGS.FIRSTNAME_PLACEHOLDER}
            value={firstName}
            size="large"
            onChangeText={onFirstNameChange}
            status={firstNameErrorText ? 'danger' : 'basic'}
            caption={firstNameErrorText}
            autoCorrect={false}
          />
          <Input
            style={styles.input}
            placeholder={STRINGS.LASTNAME_PLACEHOLDER}
            size="large"
            value={lastName}
            onChangeText={onLastNameChange}
            status={lastNameErrorText ? 'danger' : 'basic'}
            caption={lastNameErrorText}
            autoCorrect={false}
          />
          <Layout style={styles.hyperlinkWrapper}>
            <CheckBox
              checked={termsAccepted}
              onChange={isChecked => setTermsAccepted(isChecked)}
            />
            <Text style={styles.hyperlink}>
              {STRINGS.TEXT_TERMS_AND_CONDITIONS}
            </Text>
          </Layout>
          <Layout style={styles.hyperlinkWrapper}>
            <CheckBox
              checked={policyAccepted}
              onChange={isChecked => setPolicyAccepted(isChecked)}
            />
            <Text style={styles.hyperlink}>{STRINGS.TEXT_PRIVACY_POLICY}</Text>
          </Layout>
          <Button
            style={styles.button}
            onPress={onSubmitPress}
            size="large"
            disabled={
              !email ||
              !firstName ||
              !lastName ||
              !termsAccepted ||
              !policyAccepted ||
              isLoading
            }>
            {STRINGS.BUTTON_SUBMIT}
          </Button>
        </ScrollView>
        <Modal visible={modalVisible} backdropStyle={styles.backdrop}>
          <Layout style={styles.modalWrapper}>
            <SuccessIcon />
            <Text
              category="s1"
              style={[
                styles.modalHeaderText,
                {color: theme['color-primary-default']},
              ]}>
              {STRINGS.MODAL_HEADER}
            </Text>
            <Text style={styles.modalText}>
              {STRINGS.TEXT_MODAL + ' ' + email}
            </Text>
            <Button style={styles.modalButton} onPress={onBackdropPress}>
              {STRINGS.BUTTON_CLOSE_APP}
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
  input: {
    marginVertical: 12,
  },
  button: {
    marginTop: 24,
    marginBottom: 12,
  },
  hyperlink: {
    marginHorizontal: 8,
    textDecorationLine: 'underline',
    color: 'white',
  },
  hyperlinkWrapper: {
    flexDirection: 'row',
    marginVertical: 8,
    paddingVertical: 6,
    backgroundColor: 'transparent',
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
  modalHeaderText: {
    textAlign: 'center',
    fontSize: 18,
    marginTop: 6,
    marginBottom: 12,
  },
  modalText: {
    textAlign: 'center',
    marginVertical: 6,
  },
})

export default SignUp
