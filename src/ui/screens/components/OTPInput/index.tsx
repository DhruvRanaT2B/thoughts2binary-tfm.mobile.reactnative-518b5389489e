import React, {useRef, useCallback} from 'react'
import {StyleSheet, Platform} from 'react-native'
import {Input, Layout, Text} from '@ui-kitten/components'
import {OTPInputProps} from 'types'

const OTPInput: React.FC<OTPInputProps> = ({
  OTP,
  setOTP,
  error,
  errorStyle,
  autoFocus = true,
}) => {
  const majorVersionIOS = parseInt(String(Platform.Version), 10)
  const isAutoFillSupported = Platform.OS === 'ios' && majorVersionIOS >= 12

  const refs = [
    useRef<Input>(),
    useRef<Input>(),
    useRef<Input>(),
    useRef<Input>(),
    useRef<Input>(),
    useRef<Input>(),
  ]

  const onFocus = useCallback(() => {
    // Always focus on the very first empty text input
    for (let i = 0; i < 6; i++) {
      if (OTP[i] === undefined || OTP[i] === '') {
        refs[i].current?.focus()
        return
      }
    }
    refs[5].current?.focus()
  }, [OTP, refs])

  const onChangeText = useCallback(
    (textInputIndex: number, text: string) => {
      let otp = OTP
      otp[textInputIndex] = text

      if (text?.length > 1 && text?.length < 7) {
        for (let i = 0; i < text?.length; i++) {
          otp[i] = text[i]
        }
      }
      console.log('OTPInput -> onChangeText -> otp', otp)
      setOTP([...otp])
      onFocus()
    },
    [OTP, setOTP, onFocus],
  )

  return (
    <>
      <Layout style={styles.container}>
        {[0, 1, 2, 3, 4, 5].map(index => (
          <Input
            key={index}
            textStyle={styles.textInputStyle}
            style={styles.textInput}
            ref={refs[index]}
            autoFocus={autoFocus && index === 0}
            value={OTP[index]?.toString()}
            maxLength={index == 0 ? 6 : 1}
            // keyboardType="numeric"
            onFocus={onFocus}
            textContentType={isAutoFillSupported ? 'oneTimeCode' : 'none'}
            onChangeText={text => onChangeText(index, text)}
            onKeyPress={({nativeEvent: {key: keyValue}}) => {
              if (index > 0 && keyValue === 'Backspace' && !OTP[index]) {
                onChangeText(index - 1, '')
              }
            }}
          />
        ))}
      </Layout>

      {error ? (
        <Text style={[styles.errorText, errorStyle]}>{error}</Text>
      ) : null}
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  textInput: {
    width: 50,
    height: 50,
  },
  textInputStyle: {
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: 'red',
    paddingTop: 4,
    marginTop: 40,
    textAlign: 'center',
  },
})

export {OTPInput}
