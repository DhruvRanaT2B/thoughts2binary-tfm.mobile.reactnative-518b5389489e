import React, {useState, useEffect, useCallback} from 'react'
import {StyleSheet, ScrollView, Alert} from 'react-native'
import {Layout, Button, Text, Modal, Spinner} from '@ui-kitten/components'
import {ProfileScreenProps} from 'types'
import {STRINGS} from './strings'
import {SafeAreaView, OTPInput} from '@components'
import {EventEmitter} from '@react-native-granite/core'
import {controller, AUTH_EVENTS} from '@accounts'

// Global Constants
const eventEmitter = new EventEmitter()

const VerificationScreen: React.FC<ProfileScreenProps<'VerificationScreen'>> =
  ({navigation, route}) => {
    const [OTP, setOTP] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
      const subscription = eventEmitter.getObservable().subscribe(event => {
        switch (event.type) {
          case AUTH_EVENTS.REQUEST_OTP_START:
            setIsLoading(true)
            break
          case AUTH_EVENTS.REQUEST_OTP_SUCCESS:
            setIsLoading(false)
            Alert.alert('', STRINGS.OTP_SENT)
            break
          case AUTH_EVENTS.REQUEST_OTP_FAILURE:
            setIsLoading(false)
            Alert.alert('', event.data || STRINGS.SOMETHING_WENT_WRONG)
            break

          case AUTH_EVENTS.VERIFY_EMAIL_START:
            setIsLoading(true)
            break
          case AUTH_EVENTS.VERIFY_EMAIL_SUCCESS:
            setIsLoading(false)
            navigation.navigate('Dashboard')
            Alert.alert('', STRINGS.EMAIL_VERIFIED)
            break
          case AUTH_EVENTS.VERIFY_EMAIL_FAILURE:
            setIsLoading(false)
            Alert.alert('', event.data || STRINGS.SOMETHING_WENT_WRONG)
            break
        }
      })

      return () => subscription.unsubscribe()
    }, [])

    const resendOTP = useCallback(() => {
      controller.requestOTPForEmailChange(
        eventEmitter,
        route.params.email,
        route.params.password,
      )
    }, [route])

    const onConfirmPress = useCallback(() => {
      controller.verifyEmail(eventEmitter, OTP.join(''))
    }, [OTP])

    return (
      <SafeAreaView
        style={styles.safeAreaView}
        edges={['bottom', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <Text status="primary" category="h4" style={styles.titleText}>
            {STRINGS.LABEL_VERIFICATION}
          </Text>
          <Text>
            {STRINGS.VERIFICATION_MESSAGE + ' '}
            <Text status="primary">{route.params.email}</Text>
            {STRINGS.TO_VERIFY}
          </Text>
          <Layout style={styles.otpWrapper}>
            <OTPInput OTP={OTP} setOTP={otp => setOTP(otp)} autoFocus={false} />
            <Text style={{marginTop: 8, textAlign: 'center'}}>
              {STRINGS.DID_NOT_RECEIVE_OTP + ' '}
              <Text
                style={{textDecorationLine: 'underline'}}
                status="primary"
                onPress={resendOTP}>
                {STRINGS.RESEND}
              </Text>
            </Text>
          </Layout>
        </ScrollView>
        <Layout style={styles.footer}>
          <Button
            disabled={isLoading || OTP.join('').length < 6}
            onPress={onConfirmPress}>
            {STRINGS.BUTTON_CONFIRM}
          </Button>
          <Text style={styles.footerText}>
            {STRINGS.WRONG_EMAIL_ADDRESS + '  '}
            <Text
              status="primary"
              style={{textDecorationLine: 'underline'}}
              onPress={navigation.goBack}>
              {STRINGS.GO_BACK}
            </Text>
          </Text>
        </Layout>
        <Modal visible={isLoading} backdropStyle={styles.backdrop}>
          <Layout style={styles.modalWrapper}>
            <Spinner />
            <Text category="s1" style={{marginStart: 18}}>
              {STRINGS.PLEASE_WAIT}
            </Text>
          </Layout>
        </Modal>
      </SafeAreaView>
    )
  }

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  titleText: {
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  otpWrapper: {
    marginTop: 54,
    marginBottom: 12,
  },
  footer: {
    paddingHorizontal: 24,
  },
  footerText: {
    textAlign: 'center',
    marginVertical: 8,
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalWrapper: {
    flexDirection: 'row',
    marginHorizontal: 24,
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
})

export default VerificationScreen
