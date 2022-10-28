import React, {useState, useCallback, useEffect} from 'react'
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native'
import {
  Layout,
  Text,
  Icon,
  useTheme,
  Input,
  Modal,
  Spinner,
  Divider,
  Button,
  Select,
  SelectItem,
  IndexPath,
  CheckBox,
} from '@ui-kitten/components'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import ImageCropPicker from 'react-native-image-crop-picker'
import moment from 'moment'
import _ from 'lodash'

import {ProfileScreenProps} from 'types'
import STRINGS from './strings'
import {controller, AUTH_EVENTS, entity} from '@accounts'
import {EventEmitter, GraniteApp} from '@react-native-granite/core'
import {ImageFile} from 'types'
import {isValidPassword, isValidEmail} from '@utility'
import {
  CollapsibleView,
  SafeAreaView,
  ImagePicker,
  CustomInput,
} from '@components'

// Global Constants
const eventEmitter = new EventEmitter()
const countries = [STRINGS.COUNTRY_AUSTRALIA, STRINGS.COUNTRY_INDIA]
const daysBeforeExpiry = ['10', '15', '20']

const ProfileEdit: React.FC<ProfileScreenProps<'ProfileEdit'>> = ({
  navigation,
  route,
}) => {
  const {userProfile} = route.params
  const theme = useTheme()

  const [firstName, setFirstName] = useState(userProfile.user?.first_name)
  const [firstNameErrorText, setFirstNameErrorText] = useState('')

  const [lastName, setLastName] = useState(userProfile.user?.last_name)
  const [lastNameErrorText, setLastNameErrorText] = useState('')

  const [mail] = useState(userProfile.user?.email)
  const [photo, setPhoto] = useState(userProfile.user?.profile_image)
  const [licenseBackPhoto, setLicenseBackPhoto] = useState<ImageFile[]>(
    userProfile.employees_extension?.license_back_image
      ? [
          {
            uri: userProfile.employees_extension?.license_back_image,
            name: '',
            type: '',
          },
        ]
      : [],
  )
  const [licenseFrontPhoto, setLicenseFrontPhoto] = useState<ImageFile[]>(
    userProfile.employees_extension?.license_front_image
      ? [
          {
            uri: userProfile.employees_extension?.license_front_image ?? '',
            name: '',
            type: '',
          },
        ]
      : [],
  )

  const [licenseExpiryDate, setLicenseExpiryDate] = useState(
    userProfile.employees_extension?.license_valid_upto?.original
      ? moment(
          userProfile.employees_extension?.license_valid_upto?.original,
        ).toDate()
      : undefined,
  )
  const [isLoading, setIsLoading] = useState(false)
  const [imageFile, setImageFile] = useState<ImageFile>()

  const [dateTimePickerVisible, setDateTimePickerVisible] = useState(false)
  const [passwordModalVisible, setPasswordModalVisible] = useState(false)
  const [emailModalVisible, setEmailModalVisible] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [currentPasswordError, setCurrentPasswordError] = useState('')

  const [newPassword, setNewPassword] = useState('')
  const [newPasswordError, setNewPasswordError] = useState('')

  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [confirmNewPasswordError, setConfirmNewPasswordError] = useState('')

  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(true)
  const [newPasswordVisible, setNewPasswordVisible] = useState(true)
  const [confirmNewPasswordVisible, setConfirmNewPasswordVisible] =
    useState(true)

  const [newEmail, setNewEmail] = useState('')
  const [newEmailError, setNewEmailError] = useState('')

  const [confirmNewEmail, setConfirmNewEmail] = useState('')
  const [confirmNewEmailError, setConfirmNewEmailError] = useState('')

  const [fetchingData, setFetchingData] = useState(true)
  const [employees, setEmployees] = useState<entity.Employee[]>([])
  const [availableLicenseClass, setAvailableLicenseClass] = useState<string[]>(
    [],
  )

  const [licenseNumber, setLicenseNumber] = useState(
    userProfile.employees_extension?.license_number,
  )
  const [licenseNumberError, setLicenseNumberError] = useState('')
  const [selectedClass, setSelectedClass] = React.useState<IndexPath[]>([])
  const [selectedCountry, setSelectedCountry] = React.useState<IndexPath>()
  const [isChecked, setIsChecked] = useState(
    userProfile.employees_extension?.license_exp_reminder,
  )
  const [selectedDay, setSelectedDay] = useState<IndexPath>()
  const [selectedRecipients, setSelectedRecipients] = React.useState<
    IndexPath[]
  >([])
  const [licenseClassError, setLicenseClassError] = useState('')
  const [daysError, setDaysError] = useState('')
  const [recipientsError, setRecipientsError] = useState('')
  const [hasGeneralErrors, setHasGeneralErrors] = useState(false)
  const [hasLicenseErrors, setHasLicenseErrors] = useState(false)
  const [hasAcknowledged, setHasAcknowledged] = useState(false)
  const [acknowledgementError, setAcknowledgementError] = useState(false)

  useEffect(() => {
    const subscription = eventEmitter.getObservable().subscribe(event => {
      switch (event.type) {
        case AUTH_EVENTS.LOAD_PROFILE_DETAILS_START:
          setFetchingData(true)
          break
        case AUTH_EVENTS.LOAD_PROFILE_DETAILS_SUCCESS:
          populateFields(event.data.employees, event.data.licenseClass)
          setEmployees(event.data.employees)
          setAvailableLicenseClass(event.data.licenseClass)
          setFetchingData(false)
          break
        case AUTH_EVENTS.LOAD_PROFILE_DETAILS_FAILURE:
          navigation.goBack()
          Alert.alert('', event.data || STRINGS.SOMETHING_WENT_WRONG)
          break

        case AUTH_EVENTS.UPDATE_PROFILE_START:
          setIsLoading(true)
          break
        case AUTH_EVENTS.UPDATE_PROFILE_SUCCESS:
          setIsLoading(false)
          navigation.goBack()
          break
        case AUTH_EVENTS.UPDATE_PROFILE_FAILURE:
          setIsLoading(false)
          navigation.goBack()
          Alert.alert('', event.data || STRINGS.SOMETHING_WENT_WRONG)
          break

        case AUTH_EVENTS.CHANGE_PASSWORD_START:
          setIsLoading(true)
          break
        case AUTH_EVENTS.CHANGE_PASSWORD_SUCCESS:
          setIsLoading(false)
          GraniteApp.logout()
          navigation.replace('SplashScreen')
          Alert.alert('', STRINGS.CHANGE_PASSWORD_SUCCESS)
          break
        case AUTH_EVENTS.CHANGE_PASSWORD_FAILURE:
          setIsLoading(false)
          Alert.alert('', event.data || STRINGS.SOMETHING_WENT_WRONG)
          break

        case AUTH_EVENTS.REQUEST_OTP_START:
          setIsLoading(true)
          break
        case AUTH_EVENTS.REQUEST_OTP_SUCCESS:
          setIsLoading(false)
          navigation.navigate('VerificationScreen', {
            email: event.data.email,
            password: event.data.password,
          })
          break
        case AUTH_EVENTS.REQUEST_OTP_FAILURE:
          setIsLoading(false)
          Alert.alert('', event.data || STRINGS.SOMETHING_WENT_WRONG)
          break
      }
    })

    controller.getProfileDetails(eventEmitter)

    return () => subscription.unsubscribe()
  }, [])

  const updateProfile = useCallback(() => {
    let generalErrors = 0
    let licenseErrors = 0

    setAcknowledgementError(!hasAcknowledged)

    if (!firstName) {
      setFirstNameErrorText(STRINGS.EMPTY_FIRST_NAME)
      generalErrors++
    }
    if (!lastName) {
      setLastNameErrorText(STRINGS.EMPTY_LAST_NAME)
      generalErrors++
    }

    if (!licenseNumber) {
      setLicenseNumberError(STRINGS.EMPTY_LICENSE_NUMBER)
      licenseErrors++
    }
    if (selectedClass.length === 0) {
      setLicenseClassError(STRINGS.EMPTY_LICENSE_CLASS)
      licenseErrors++
    }
    if (isChecked) {
      if (!selectedDay) {
        setDaysError(STRINGS.EMPTY_DAYS_BEFORE_EXPIRY)
        licenseErrors++
      }
      if (selectedRecipients.length === 0) {
        setRecipientsError(STRINGS.EMPTY_REMINDER_RECIPIENTS)
        licenseErrors++
      }
    }

    setHasGeneralErrors(generalErrors > 0)
    setHasLicenseErrors(licenseErrors > 0)

    if (hasAcknowledged && generalErrors === 0 && licenseErrors === 0) {
      const recipients: entity.LicenseExpiryReminderRecipients[] = []
      if (isChecked) {
        selectedRecipients.forEach(indexPath => {
          recipients.push(employees[indexPath.row])
        })
      }
      const licClass: string[] = []
      selectedClass.forEach(indexPath => {
        licClass.push(availableLicenseClass[indexPath.row])
      })

      controller.updateProfile(eventEmitter, {
        profilePhoto: imageFile,
        firstName: firstName!!,
        lastName: lastName!!,
        userProfile,
        licenseExpiryDays:
          selectedDay && Number(daysBeforeExpiry[selectedDay.row]),
        licenseExpiryReminder: isChecked,
        licenseExpiryRecipients: recipients,
        licenseNumber,
        licenseExpiryDate: licenseExpiryDate
          ? moment(licenseExpiryDate).format('YYYY-MM-DD')
          : '',
        licenseClass: licClass,
        licenseCountry: selectedCountry && countries[selectedCountry.row],
        licenseBackImage: licenseBackPhoto[0],
        licenseFrontImage: licenseFrontPhoto[0],
      })
    }
  }, [
    imageFile,
    firstName,
    lastName,
    licenseNumber,
    selectedClass,
    selectedDay,
    selectedRecipients,
    isChecked,
    hasAcknowledged,
    employees,
    licenseExpiryDate,
    availableLicenseClass,
    selectedCountry,
    licenseBackPhoto,
    licenseFrontPhoto,
  ])

  useEffect(() => {
    navigation.setOptions({
      headerRight: ({tintColor}) => {
        if (!fetchingData)
          return (
            <Text
              style={{
                color: tintColor,
                textDecorationLine: 'underline',
                marginEnd: 8,
              }}
              onPress={updateProfile}>
              {STRINGS.BUTTON_SAVE}
            </Text>
          )
      },
    })
  }, [updateProfile, fetchingData])

  const populateFields = useCallback(
    (listOfEmployees: entity.Employee[], listOfLicenseClass: string[]) => {
      const routeLicenseClass = userProfile.employees_extension?.license_class
      if (routeLicenseClass) {
        const indices = routeLicenseClass
          ?.map(item => listOfLicenseClass.indexOf(item))
          .filter(item => item >= 0)

        if (indices)
          setSelectedClass(indices?.map(index => new IndexPath(index)))
      }

      const routeCountry =
        userProfile.employees_extension?.license_country_of_issue
      if (routeCountry) {
        const index = countries.findIndex(item => item === routeCountry)
        if (index > -1) setSelectedCountry(new IndexPath(index))
      }

      const routeDays =
        userProfile.employees_extension?.lic_exp_remind_before_days
      if (routeDays) {
        const index = daysBeforeExpiry.findIndex(
          item => Number(item) === routeDays,
        )
        if (index > -1) setSelectedDay(new IndexPath(index))
      }

      const routeRecipients =
        userProfile.employees_extension?.lic_exp_reminder_recipients
      if (routeRecipients) {
        const indices: number[] = []
        routeRecipients.forEach(item => {
          for (let i = 0; i < listOfEmployees.length; i++) {
            if (listOfEmployees[i].pk === item.pk) indices.push(i)
          }
        })

        if (indices.length > 0)
          setSelectedRecipients(indices.map(index => new IndexPath(index)))
      }
    },
    [],
  )

  const showDatePicker = useCallback(() => setDateTimePickerVisible(true), [])

  const hideDatePicker = useCallback(() => setDateTimePickerVisible(false), [])

  const handleConfirm = useCallback((date: Date) => {
    setDateTimePickerVisible(false)
    setLicenseExpiryDate(date)
  }, [])

  const openImagePicker = useCallback(async () => {
    try {
      const response = await ImageCropPicker.openPicker({
        cropping: true,
        mediaType: 'photo',
        includeBase64: true,
      })
      console.log('Image crop response', response)
      const file = {
        uri:
          Platform.OS === 'android'
            ? response.path
            : response.path.replace('file://', ''),
        type: response.mime,
        name:
          response.filename ??
          `image_${response.height}${response.width}.${
            response.mime?.split('/')[1] ?? 'png'
          }`,
      }
      setImageFile(file)
      setPhoto(file.uri)
    } catch (error) {
      console.log(error)
    }
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

  const onChangePasswordPress = useCallback(() => {
    setPasswordModalVisible(true)
  }, [])

  const renderEye = useCallback(
    (value: boolean, setValue: () => void) => (
      <TouchableWithoutFeedback onPress={setValue}>
        <Icon
          style={styles.eyeIcon}
          fill="grey"
          name={value ? 'eye-off' : 'eye'}
        />
      </TouchableWithoutFeedback>
    ),
    [],
  )

  const onCurrentPasswordChange = useCallback((text: string) => {
    setCurrentPassword(text)
    if (text.length === 0)
      setCurrentPasswordError(STRINGS.CURRENT_PASSWORD_EMPTY)
    else setCurrentPasswordError('')
  }, [])

  const onNewPasswordChange = useCallback((text: string) => {
    setNewPassword(text)
    setConfirmNewPassword('')
    setConfirmNewPasswordError('')
    if (text.length === 0) setNewPasswordError(STRINGS.NEW_PASSWORD_EMPTY)
    else if (!isValidPassword(text))
      setNewPasswordError(STRINGS.NEW_PASSWORD_ERROR)
    else setNewPasswordError('')
  }, [])

  const onConfirmNewPasswordChange = useCallback(
    (text: string) => {
      setConfirmNewPassword(text)
      if (text.length === 0 && newPassword.length > 0)
        setConfirmNewPasswordError(STRINGS.CONFIRM_PASSWORD_EMPTY)
      else if (text !== newPassword)
        setConfirmNewPasswordError(STRINGS.CONFIRM_PASSWORD_ERROR)
      else setConfirmNewPasswordError('')
    },
    [newPassword],
  )

  const onCloseModal = useCallback(() => {
    setPasswordModalVisible(false)
    setEmailModalVisible(false)

    setCurrentPassword('')
    setCurrentPasswordError('')

    setNewPassword('')
    setNewPasswordError('')

    setConfirmNewPassword('')
    setConfirmNewPasswordError('')

    setNewEmail('')
    setNewEmailError('')

    setConfirmNewEmail('')
    setConfirmNewEmailError('')

    setCurrentPasswordVisible(true)
    setNewPasswordVisible(true)
    setConfirmNewPasswordVisible(true)
  }, [])

  const onUpdatePasswordPress = useCallback(() => {
    onCloseModal()
    controller.updatePassword(eventEmitter, currentPassword, newPassword)
  }, [onCloseModal, currentPassword, newPassword])

  const onEmailChangePress = useCallback(() => {
    setEmailModalVisible(true)
  }, [])

  const onNewEmailChange = useCallback((text: string) => {
    setNewEmail(text)
    setConfirmNewEmail('')
    setConfirmNewEmailError('')
    if (text.length === 0) setNewEmailError(STRINGS.NEW_EMAIL_EMPTY)
    else if (!isValidEmail(text)) setNewEmailError(STRINGS.NEW_EMAIL_ERROR)
    else setNewEmailError('')
  }, [])

  const onConfirmNewEmailChange = useCallback(
    (text: string) => {
      setConfirmNewEmail(text)
      if (text.length === 0 && newEmail.length > 0)
        setConfirmNewEmailError(STRINGS.CONFIRM_EMAIL_EMPTY)
      else if (text !== newEmail)
        setConfirmNewEmailError(STRINGS.CONFIRM_EMAIL_ERROR)
      else setConfirmNewEmailError('')
    },
    [newEmail],
  )

  const onUpdateEmailPress = useCallback(() => {
    onCloseModal()
    controller.requestOTPForEmailChange(eventEmitter, newEmail, currentPassword)
  }, [onCloseModal, newEmail, currentPassword])

  const onLicenseNumberChange = useCallback((text: string) => {
    setLicenseNumber(text)
    if (text.length === 0) setLicenseNumberError(STRINGS.EMPTY_LICENSE_NUMBER)
    else setLicenseNumberError('')
  }, [])

  const renderOption = useCallback(
    (title: string) => <SelectItem title={title} />,
    [],
  )

  const generalDetails = () => (
    <>
      <Input
        label={STRINGS.LABEL_FIRST_NAME}
        value={firstName}
        onChangeText={onFirstNameChange}
        style={styles.input}
        status={firstNameErrorText ? 'danger' : 'basic'}
        caption={firstNameErrorText}
        autoCorrect={false}
      />
      <Input
        label={STRINGS.LABEL_LAST_NAME}
        value={lastName}
        onChangeText={onLastNameChange}
        style={styles.input}
        status={lastNameErrorText ? 'danger' : 'basic'}
        caption={lastNameErrorText}
        autoCorrect={false}
      />
      <Input
        label={STRINGS.LABEL_EMAIL}
        value={mail}
        style={styles.input}
        disabled
        accessoryRight={() => (
          <Text status="primary" onPress={onEmailChangePress}>
            {STRINGS.CHANGE}
          </Text>
        )}
      />
      <Text
        status="primary"
        style={styles.changePassword}
        onPress={onChangePasswordPress}>
        {STRINGS.CHANGE_PASSWORD}
      </Text>
    </>
  )

  const licenseDetails = () => (
    <>
      <Input
        label={STRINGS.LABEL_LICENSE_NUMBER}
        value={licenseNumber}
        style={styles.input}
        onChangeText={onLicenseNumberChange}
        status={licenseNumberError ? 'danger' : 'basic'}
        caption={licenseNumberError}
        autoCorrect={false}
      />
      <CustomInput
        label={STRINGS.LABEL_LICENSE_EXPIRY_DATE}
        value={
          licenseExpiryDate
            ? moment(licenseExpiryDate).format('DD/MM/YYYY')
            : ''
        }
        style={styles.input}
        accessoryRight={
          <Icon
            name="calendar"
            fill={theme['color-primary-default']}
            style={styles.chevron}
          />
        }
        onPress={showDatePicker}
      />
      <Select
        multiSelect
        style={styles.input}
        label={STRINGS.LABEL_LICENSE_CLASS}
        value={selectedClass
          ?.map(value => availableLicenseClass[value.row])
          .join(', ')}
        selectedIndex={selectedClass}
        status={licenseClassError ? 'danger' : 'basic'}
        caption={licenseClassError}
        onSelect={index => {
          setSelectedClass(index as IndexPath[])
          setLicenseClassError('')
        }}>
        {availableLicenseClass.map(item => renderOption(item))}
      </Select>
      <Select
        style={styles.input}
        label={STRINGS.LABEL_COUNTRY_OF_ISSUE}
        value={selectedCountry && countries[selectedCountry.row]}
        selectedIndex={selectedCountry}
        onSelect={index => setSelectedCountry(index as IndexPath)}>
        {countries.map(item => renderOption(item))}
      </Select>
      <CheckBox
        checked={isChecked}
        children={STRINGS.LABEL_LICENSE_EXPIRY_REMINDER}
        style={styles.input}
        onChange={() => setIsChecked(!isChecked)}
      />
      {isChecked && (
        <>
          <Select
            style={styles.input}
            label={STRINGS.LABEL_DAYS_BEFORE_EXPIRY}
            value={selectedDay && daysBeforeExpiry[selectedDay.row]}
            selectedIndex={selectedDay}
            status={daysError ? 'danger' : 'basic'}
            caption={daysError}
            onSelect={index => {
              setSelectedDay(index as IndexPath)
              setDaysError('')
            }}>
            {daysBeforeExpiry.map(item => renderOption(item))}
          </Select>
          <Select
            multiSelect
            style={styles.input}
            label={STRINGS.LABEL_REMINDER_RECIPIENTS}
            status={recipientsError ? 'danger' : 'basic'}
            caption={recipientsError}
            value={selectedRecipients
              ?.map(
                value =>
                  `${employees[value.row].name} (${
                    employees[value.row].role?.name
                  })`,
              )
              .join(', ')}
            selectedIndex={selectedRecipients}
            onSelect={index => {
              setSelectedRecipients(index as IndexPath[])
              setRecipientsError('')
            }}>
            {employees.map(item =>
              renderOption(`${item.name} (${item.role?.name})`),
            )}
          </Select>
        </>
      )}
      <Text category="s1" style={styles.input}>
        {STRINGS.LABEL_LICENSE_IMAGE}
      </Text>
      <ImagePicker
        maxPhotos={1}
        images={licenseFrontPhoto}
        onImageChange={setLicenseFrontPhoto}
        cameraEnabled={false}
        imagePickerButton={color => (
          <Text
            style={[styles.buttonText, {borderColor: color, color}]}
            category="c1">
            {STRINGS.LABEL_FRONT_PHOTO}
          </Text>
        )}
      />
      <ImagePicker
        maxPhotos={1}
        images={licenseBackPhoto}
        onImageChange={setLicenseBackPhoto}
        cameraEnabled={false}
        imagePickerButton={color => (
          <Text
            style={[styles.buttonText, {borderColor: color, color}]}
            category="c1">
            {STRINGS.LABEL_BACK_PHOTO}
          </Text>
        )}
      />
    </>
  )

  if (fetchingData)
    return (
      <Layout style={styles.loaderWrapper}>
        <Spinner />
      </Layout>
    )

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView style={styles.scrollView}>
        <Layout style={styles.profileHeader}>
          <Layout
            style={[
              photo
                ? styles.profileImageHolder
                : styles.profileImagePlaceholder,
              {borderColor: theme['color-primary-default']},
            ]}>
            <Image
              source={photo ? {uri: photo} : require('@images/user_icon.png')}
              style={photo ? styles.profileImage : styles.avatar}
            />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={openImagePicker}
              style={[
                styles.cameraIconHolder,
                {
                  borderColor: theme['color-primary-default'],
                },
              ]}>
              <Icon
                name="camera"
                style={styles.icon}
                fill={theme['color-primary-default']}
              />
            </TouchableOpacity>
          </Layout>
        </Layout>

        <CollapsibleView
          label={STRINGS.TITLE_GENERAL}
          body={generalDetails()}
          expand
          headerColour={hasGeneralErrors ? '#d07c7b' : undefined}
        />

        <CollapsibleView
          label={STRINGS.TITLE_LICENSE_DETAIL}
          body={licenseDetails()}
          headerColour={hasLicenseErrors ? '#d07c7b' : undefined}
        />
      </ScrollView>

      <CheckBox
        checked={hasAcknowledged}
        children={STRINGS.ACKNOWLEDGEMENT_MESSAGE}
        style={{paddingHorizontal: 10, marginVertical: 6}}
        onChange={() => setHasAcknowledged(!hasAcknowledged)}
        status={acknowledgementError ? 'danger' : 'basic'}
      />

      <DateTimePickerModal
        isVisible={dateTimePickerVisible}
        date={licenseExpiryDate ?? new Date()}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />

      <Modal visible={isLoading} backdropStyle={styles.backdrop}>
        <Layout style={styles.modalWrapper}>
          <Spinner />
          <Text category="s1" style={{marginStart: 18}}>
            {STRINGS.PLEASE_WAIT}
          </Text>
        </Layout>
      </Modal>

      <Modal visible={passwordModalVisible} backdropStyle={styles.backdrop}>
        <ScrollView>
          <Layout
            style={{
              borderRadius: 4,
              width: Dimensions.get('window').width - 24,
            }}>
            <Text category="s1" style={styles.headerText}>
              {STRINGS.CHANGE_PASSWORD}
            </Text>
            <Divider
              style={[
                {backgroundColor: theme['color-primary-default']},
                styles.divider,
              ]}
            />
            <Layout style={styles.passwordInputWrapper}>
              <Input
                style={styles.input}
                label={STRINGS.LABEL_CURRENT_PASSWORD}
                placeholder={STRINGS.LABEL_CURRENT_PASSWORD}
                secureTextEntry={currentPasswordVisible}
                value={currentPassword}
                onChangeText={onCurrentPasswordChange}
                caption={currentPasswordError}
                status={currentPasswordError ? 'danger' : 'basic'}
                autoCorrect={false}
                accessoryRight={() =>
                  renderEye(currentPasswordVisible, () =>
                    setCurrentPasswordVisible(!currentPasswordVisible),
                  )
                }
              />
              <Input
                style={styles.input}
                label={STRINGS.LABEL_NEW_PASSWORD}
                placeholder={STRINGS.LABEL_NEW_PASSWORD}
                secureTextEntry={newPasswordVisible}
                value={newPassword}
                onChangeText={onNewPasswordChange}
                caption={newPasswordError}
                status={newPasswordError ? 'danger' : 'basic'}
                autoCorrect={false}
                accessoryRight={() =>
                  renderEye(newPasswordVisible, () =>
                    setNewPasswordVisible(!newPasswordVisible),
                  )
                }
              />
              <Input
                style={styles.input}
                label={STRINGS.LABEL_CONFIRM_NEW_PASSWORD}
                placeholder={STRINGS.LABEL_CONFIRM_NEW_PASSWORD}
                secureTextEntry={confirmNewPasswordVisible}
                value={confirmNewPassword}
                onChangeText={onConfirmNewPasswordChange}
                caption={confirmNewPasswordError}
                status={confirmNewPasswordError ? 'danger' : 'basic'}
                autoCorrect={false}
                accessoryRight={() =>
                  renderEye(confirmNewPasswordVisible, () =>
                    setConfirmNewPasswordVisible(!confirmNewPasswordVisible),
                  )
                }
              />
            </Layout>
            <Layout style={styles.buttonWrapper}>
              <Button
                style={styles.button}
                onPress={onCloseModal}
                appearance="ghost">
                {STRINGS.BUTTON_CANCEL}
              </Button>
              <Button
                style={styles.button}
                onPress={onUpdatePasswordPress}
                disabled={
                  currentPasswordError.length > 0 ||
                  newPasswordError.length > 0 ||
                  confirmNewPasswordError.length > 0 ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmNewPassword
                }>
                {STRINGS.BUTTON_UPDATE}
              </Button>
            </Layout>
          </Layout>
        </ScrollView>
      </Modal>

      <Modal visible={emailModalVisible} backdropStyle={styles.backdrop}>
        <ScrollView>
          <Layout
            style={{
              borderRadius: 4,
              width: Dimensions.get('window').width - 24,
            }}>
            <Text category="s1" style={styles.headerText}>
              {STRINGS.LABEL_CHANGE_EMAIL}
            </Text>
            <Divider
              style={[
                {backgroundColor: theme['color-primary-default']},
                styles.divider,
              ]}
            />
            <Layout style={styles.passwordInputWrapper}>
              <Input
                style={styles.input}
                label={STRINGS.LABEL_CURRENT_PASSWORD}
                placeholder={STRINGS.LABEL_CURRENT_PASSWORD}
                secureTextEntry={currentPasswordVisible}
                value={currentPassword}
                onChangeText={onCurrentPasswordChange}
                caption={currentPasswordError}
                status={currentPasswordError ? 'danger' : 'basic'}
                autoCorrect={false}
                accessoryRight={() =>
                  renderEye(currentPasswordVisible, () =>
                    setCurrentPasswordVisible(!currentPasswordVisible),
                  )
                }
              />
              <Input
                style={styles.input}
                label={STRINGS.LABEL_NEW_EMAIL}
                placeholder={STRINGS.LABEL_NEW_EMAIL}
                value={newEmail}
                onChangeText={onNewEmailChange}
                caption={newEmailError}
                status={newEmailError ? 'danger' : 'basic'}
                autoCorrect={false}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Input
                style={styles.input}
                label={STRINGS.LABEL_CONFIRM_NEW_EMAIL}
                placeholder={STRINGS.LABEL_CONFIRM_NEW_EMAIL}
                value={confirmNewEmail}
                onChangeText={onConfirmNewEmailChange}
                caption={confirmNewEmailError}
                status={confirmNewEmailError ? 'danger' : 'basic'}
                autoCorrect={false}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </Layout>
            <Layout style={styles.buttonWrapper}>
              <Button
                style={styles.button}
                onPress={onCloseModal}
                appearance="ghost">
                {STRINGS.BUTTON_CANCEL}
              </Button>
              <Button
                style={styles.button}
                onPress={onUpdateEmailPress}
                disabled={
                  currentPasswordError.length > 0 ||
                  newEmailError.length > 0 ||
                  confirmNewEmailError.length > 0 ||
                  !currentPassword ||
                  !newEmail ||
                  !confirmNewEmail
                }>
                {STRINGS.BUTTON_UPDATE}
              </Button>
            </Layout>
          </Layout>
        </ScrollView>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    paddingHorizontal: 10,
  },
  profileHeader: {
    marginTop: 30,
    marginBottom: 12,
    alignItems: 'center',
  },
  profileImageHolder: {
    width: 100,
    height: 100,
    borderRadius: 100,
    backgroundColor: 'lightgrey',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 100,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 100,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIconHolder: {
    borderWidth: 2,
    borderRadius: 18,
    padding: 4,
    backgroundColor: 'white',
    position: 'absolute',
    end: 1,
    bottom: 1,
  },
  icon: {
    height: 18,
    width: 18,
  },
  input: {
    marginVertical: 8,
  },
  chevron: {
    height: 24,
    width: 24,
  },
  avatar: {
    width: 32,
    height: 32,
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
  changePassword: {
    textDecorationLine: 'underline',
    marginTop: 4,
    marginBottom: 8,
  },
  headerText: {
    marginBottom: 12,
    marginTop: 18,
    fontSize: 20,
    marginHorizontal: 12,
  },
  divider: {
    height: 2,
    marginBottom: 14,
  },
  passwordInputWrapper: {
    marginHorizontal: 12,
  },
  buttonWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: 12,
    marginHorizontal: 12,
  },
  button: {
    marginHorizontal: 8,
    minWidth: 90,
  },
  eyeIcon: {
    height: 24,
    width: 24,
  },
  loaderWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    borderWidth: 1,
    padding: 8,
    borderRadius: 4,
    marginEnd: 16,
  },
})

export default ProfileEdit
