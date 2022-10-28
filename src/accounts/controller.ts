import {EventEmitter, LocalStorage} from '@react-native-granite/core'
import {AUTH_EVENTS} from './events'
import * as API_GATEWAY from './apiGateway'
import {isValidEmail} from '@utility'
import {LOCAL_STORAGE} from '@constants'
import {ImageFile} from 'types'
import {
  ProfileResponse,
  LicenseExpiryReminderRecipients,
  Setting,
  Holiday,
} from './entity'
import * as Keychain from 'react-native-keychain'

/**
 * Function responsible for login
 * @param emitter Eventemitter
 * @param email Email
 * @param password Password
 * @returns Fires AUTH_EVENTS
 */
const login = async (
  emitter: EventEmitter,
  email: string,
  password: string,
) => {
  try {
    emitter.emit(AUTH_EVENTS.LOGIN_START)
    if (!isValidEmail(email)) {
      emitter.emit(AUTH_EVENTS.INVALID_INPUT, 'Invalid email address')
      return
    }
    const response = await API_GATEWAY.signIn(email, password)
    await LocalStorage.set(
      LOCAL_STORAGE.AUTH_TOKEN,
      String(response.access_token),
    )
    emitter.emit(AUTH_EVENTS.LOGIN_SUCCESS)
  } catch (error) {
    console.log(error)
    await LocalStorage.remove(LOCAL_STORAGE.AUTH_TOKEN)
    emitter.emit(AUTH_EVENTS.LOGIN_FAILURE)
  }
}

/**
 * Function responsible for login
 * @param emitter Eventemitter
 * @param email Email
 * @returns Fires AUTH_EVENTS
 */
const ssoLogin = async (emitter: EventEmitter, email: string) => {
  try {
    emitter.emit(AUTH_EVENTS.SSO_START)
    if (!isValidEmail(email)) {
      emitter.emit(AUTH_EVENTS.INVALID_INPUT, 'Invalid email address')
      return
    }
    const response = await API_GATEWAY.ssoSignIn(email)
    emitter.emit(AUTH_EVENTS.SSO_SUCCESS, response.url)
  } catch (error) {
    console.log(error)
    emitter.emit(AUTH_EVENTS.SSO_FAILURE, error)
  }
}

//controller function to get the remember me checkbox state on login screen, locally
const getRememberMeState = async () => {
  try {
    let res = await LocalStorage.get(LOCAL_STORAGE.REMEMBER_ME)
    return res == 'true'
  } catch (e) {
    console.log(e)
  }
}

/**
 * Function responsible for sign-up
 * @param emitter Eventemitter
 * @param param1 ({firstName, lastName, email})
 * @returns Fires AUTH_EVENTS
 */
const signUp = async (
  emitter: EventEmitter,
  {
    firstName,
    lastName,
    email,
  }: {firstName: string; lastName: string; email: string},
) => {
  try {
    emitter.emit(AUTH_EVENTS.SIGNUP_START)
    if (!isValidEmail(email)) {
      emitter.emit(AUTH_EVENTS.INVALID_INPUT, 'Invalid email address')
      return
    }
    await API_GATEWAY.signUp(firstName, lastName, email)
    emitter.emit(AUTH_EVENTS.SIGNUP_SUCCESS)
  } catch (error) {
    console.log(error)
    emitter.emit(AUTH_EVENTS.SIGNUP_FAILURE)
  }
}

/**
 * Function responsible for resetting password
 * @param emitter Eventemitter
 * @param email Email
 * @returns Fires AUTH_EVENTS
 */
const resetPassword = async (emitter: EventEmitter, email: string) => {
  try {
    emitter.emit(AUTH_EVENTS.RESET_PASSWORD_START)
    if (!isValidEmail(email)) {
      emitter.emit(AUTH_EVENTS.INVALID_INPUT, 'Invalid email address')
      return
    }
    await API_GATEWAY.resetPassword(email)
    emitter.emit(AUTH_EVENTS.RESET_PASSWORD_SUCCESS)
  } catch (error) {
    console.log(error)
    emitter.emit(AUTH_EVENTS.RESET_PASSWORD_FAILURE)
  }
}

/**
 * Function responsible for getting branches from API
 * @param emitter EventEmitter
 */
const getBranches = async (emitter: EventEmitter) => {
  try {
    emitter.emit(AUTH_EVENTS.LOAD_BRANCHES_START)
    const org_id = Number(await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID))
    const branches = await API_GATEWAY.getBranches(org_id)

    const driverName = await LocalStorage.get(LOCAL_STORAGE.DRIVER_NAME)
    const driverID = Number(await LocalStorage.get(LOCAL_STORAGE.DRIVER_ID))

    emitter.emit(AUTH_EVENTS.LOAD_BRANCHES_SUCCESS, {
      branches,
      loggedInUser: {name: driverName, pk: driverID},
    })
  } catch (error) {
    console.log(error)
    emitter.emit(AUTH_EVENTS.LOAD_BRANCHES_FAILURE)
  }
}

/**
 * Function to get holidaySettings
 * @param emitter EventEmitter
 */

const holidayFilter = (settingList?: Setting[]) => {
  const keys = [
    'Limit Advanced Future Bookings In Months',
    'Do not allow booking start and end date on Weekends',
    'Do not allow booking start and end date on Public Holidays',
    'Rule applies to all branches?',
    'Rule applies to select branches?',
  ]

  let res: Setting[] = []

  const pushIndex = (str: string) => {
    settingList?.map((item, index) => {
      if (item.setting_key === str) {
        res.push(item)
      }
    })
  }

  keys.map(item => {
    pushIndex(item)
  })

  return res
}

const getHolidaySettings = async (emitter: EventEmitter) => {
  try {
    emitter.emit(AUTH_EVENTS.LOAD_HOLIDAY_SETTINGS_START)

    const org_id = Number(await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID))

    const response = await API_GATEWAY.getOrganisationSettings(org_id)

    let filterResponse: Setting[] = holidayFilter(response)

    emitter.emit(AUTH_EVENTS.LOAD_HOLIDAY_SETTINGS_SUCCESS, filterResponse)
  } catch (error) {
    console.log(error)
    emitter.emit(AUTH_EVENTS.LOAD_HOLIDAY_SETTINGS_FAILURE)
  }
}

/**
 * Function to get all the holidayList
 * @param emitter EventEmitter
 */

const getHolidayList = async (emitter: EventEmitter, branchId: number) => {
  try {
    emitter.emit(AUTH_EVENTS.LOAD_HOLIDAY_LIST_START)

    const org_id = Number(await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID))

    const response = (await API_GATEWAY.getAllHolidayList(
      org_id,
      branchId,
    )) as Holiday[]
    emitter.emit(AUTH_EVENTS.LOAD_HOLIDAY_LIST_SUCCESS, response)
  } catch (error) {
    console.log(error)
    emitter.emit(AUTH_EVENTS.LOAD_HOLIDAY_LIST_FAILURE)
  }
}

//function to get generic keycahin password
const getPassword = async (setEmail: any, setPassword: any) => {
  Keychain.getGenericPassword()
    .then(result => {
      if (result) {
        setEmail(result.username)
        setPassword(result.password)
      }
    })
    .catch(error => {
      console.log(error)
    })
}

//function to set generic keychain password
const setPassword = async (email: string, password: string) => {
  Keychain.setGenericPassword(email, password)
    .then(resolve => {
      console.info('RESOLVE KEYCHAIN', email, password)
    })
    .catch(error => {
      console.log(error)
    })
}

//function to reset generic password
const resetKeychainPassword = async () => {
  await Keychain.resetGenericPassword()
}

/**
 * Function to get profile
 * @param emitter EventEmitter
 * @param deleteToken Remove token on failure (Defaults to false)
 * @param refreshPermissions To refresh permissions or not (Defaults to false)
 */
const getProfile = async (
  emitter: EventEmitter,
  deleteToken: boolean = false,
  refreshPermissions: boolean = false,
) => {
  try {
    emitter.emit(AUTH_EVENTS.LOAD_PROFILE_START)
    let org_id = Number(await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID))
    const profile = await API_GATEWAY.getProfile(org_id)
    await LocalStorage.set(LOCAL_STORAGE.DRIVER_ID, String(profile.pk))
    await LocalStorage.set(
      LOCAL_STORAGE.ORGANISATION_ID,
      String(profile.organisation),
    )
    await LocalStorage.set(LOCAL_STORAGE.DRIVER_NAME, String(profile.name))
    if (profile.employees_extension?.branch?.pk)
      await LocalStorage.set(
        LOCAL_STORAGE.BRANCH_ID,
        String(profile.employees_extension.branch.pk),
      )

    if (profile?.employees_extension?.cost_centre?.pk)
      await LocalStorage.set(
        LOCAL_STORAGE.COST_CENTRE_ID,
        String(profile.employees_extension.cost_centre.pk),
      )

    if (refreshPermissions) {
      org_id = Number(await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID))
      const permissions = await API_GATEWAY.getEmployeePermissions(org_id)
      let createBookingForOthers = false
      let bookingWrite = false
      let bookingDelete = false
      let bookingCancel = false
      let vehicleCheckOut = false
      let vehicleCheckIn = false
      let viewAllBookings = false
      let viewBranchBookings = false
      permissions?.forEach(permission => {
        switch (permission.name) {
          case 'create_booking_for_other_users':
            createBookingForOthers = true
            break
          case 'booking_write':
            bookingWrite = true
            break
          case 'booking_delete':
            bookingDelete = true
            break
          case 'booking_cancel':
            bookingCancel = true
            break
          case 'vehicle_check_out':
            vehicleCheckOut = true
            break
          case 'vehicle_check_in':
            vehicleCheckIn = true
            break
          case 'view_all_bookings':
            viewAllBookings = true
            break
          case 'view_branch_bookings':
            viewBranchBookings = true
            break
        }
      })
      await LocalStorage.set(
        LOCAL_STORAGE.CREATE_BOOKING_FOR_OTHERS,
        `${createBookingForOthers}`,
      )
      await LocalStorage.set(LOCAL_STORAGE.BOOKING_WRITE, `${bookingWrite}`)
      await LocalStorage.set(LOCAL_STORAGE.BOOKING_DELETE, `${bookingDelete}`)
      await LocalStorage.set(LOCAL_STORAGE.BOOKING_CANCEL, `${bookingCancel}`)
      await LocalStorage.set(
        LOCAL_STORAGE.VEHICLE_CHECK_OUT,
        `${vehicleCheckOut}`,
      )
      await LocalStorage.set(
        LOCAL_STORAGE.VEHICLE_CHECK_IN,
        `${vehicleCheckIn}`,
      )
      await LocalStorage.set(
        LOCAL_STORAGE.VIEW_ALL_BOOKINGS,
        `${viewAllBookings}`,
      )
      await LocalStorage.set(
        LOCAL_STORAGE.VIEW_BRANCH_BOOKINGS,
        `${viewBranchBookings}`,
      )
    }

    emitter.emit(AUTH_EVENTS.LOAD_PROFILE_SUCCESS, profile)
  } catch (error) {
    console.log(error)
    if (deleteToken) await LocalStorage.remove(LOCAL_STORAGE.AUTH_TOKEN)
    emitter.emit(AUTH_EVENTS.LOAD_PROFILE_FAILURE)
  }
}

/**
 * Function to get reports
 * @param emitter EventEmitter
 */
const getReport = async (emitter: EventEmitter) => {
  try {
    emitter.emit(AUTH_EVENTS.LOAD_REPORT_START)
    const org_id = Number(await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID))
    const driverID = Number(await LocalStorage.get(LOCAL_STORAGE.DRIVER_ID))
    const reports = await API_GATEWAY.getReport(org_id, driverID)
    emitter.emit(AUTH_EVENTS.LOAD_REPORT_SUCCESS, reports)
  } catch (error) {
    console.log(error)
    emitter.emit(AUTH_EVENTS.LOAD_REPORT_FAILURE)
  }
}

/**
 * Function to update profile
 * @param emitter EventEmitter
 * @param param1
 */
const updateProfile = async (
  emitter: EventEmitter,
  {
    firstName,
    lastName,
    profilePhoto,
    userProfile,
    licenseExpiryDays,
    licenseExpiryReminder,
    licenseExpiryRecipients,
    licenseClass,
    licenseCountry,
    licenseNumber,
    licenseExpiryDate,
    licenseBackImage,
    licenseFrontImage,
  }: {
    firstName: string
    lastName: string
    profilePhoto?: ImageFile
    userProfile: ProfileResponse
    licenseExpiryDays?: number
    licenseExpiryReminder?: boolean
    licenseExpiryRecipients?: LicenseExpiryReminderRecipients[]
    licenseClass?: string[]
    licenseCountry?: string
    licenseNumber?: string
    licenseExpiryDate?: string
    licenseBackImage?: ImageFile
    licenseFrontImage?: ImageFile
  },
) => {
  try {
    emitter.emit(AUTH_EVENTS.UPDATE_PROFILE_START)
    const organisationID = Number(
      await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID),
    )
    const driverID = Number(await LocalStorage.get(LOCAL_STORAGE.DRIVER_ID))
    await API_GATEWAY.updateProfile({
      driverID,
      organisationID,
      profileImage: profilePhoto,
      firstName,
      lastName,
      userProfile,
      licenseExpiryDays,
      licenseExpiryReminder,
      licenseExpiryRecipients: licenseExpiryRecipients?.map(item => ({
        name: item.name!!,
        pk: item.pk!!,
      })),
      licenseClass,
      licenseCountry,
      licenseNumber,
      licenseExpiryDate,
      licenseBackImage,
      licenseFrontImage,
    })
    emitter.emit(AUTH_EVENTS.UPDATE_PROFILE_SUCCESS)
  } catch (error) {
    console.log(error)
    emitter.emit(
      AUTH_EVENTS.UPDATE_PROFILE_FAILURE,
      error?.response?.data?.title,
    )
  }
}

/**
 * Function to get display priority
 * @param emitter EventEmitter
 */
const getDisplayPriority = async (emitter: EventEmitter) => {
  try {
    emitter.emit(AUTH_EVENTS.LOAD_DISPLAY_PRIORITY_START)
    const org_id = Number(await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID))
    const response = await API_GATEWAY.getDisplayPriority(org_id)
    emitter.emit(AUTH_EVENTS.LOAD_DISPLAY_PRIORITY_SUCCESS, response?.[0])
  } catch (error) {
    console.log(error)
    emitter.emit(
      AUTH_EVENTS.LOAD_DISPLAY_PRIORITY_FAILURE,
      error?.response?.data?.title,
    )
  }
}

/**
 * Function to update password
 * @param emitter EventEmitter
 * @param oldPassword Old Password
 * @param newPassword New Pasword
 */
const updatePassword = async (
  emitter: EventEmitter,
  oldPassword: string,
  newPassword: string,
) => {
  try {
    emitter.emit(AUTH_EVENTS.CHANGE_PASSWORD_START)
    const org_id = Number(await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID))
    await API_GATEWAY.changePassword(org_id, oldPassword, newPassword)
    emitter.emit(AUTH_EVENTS.CHANGE_PASSWORD_SUCCESS)
  } catch (error) {
    console.log(error)
    emitter.emit(
      AUTH_EVENTS.CHANGE_PASSWORD_FAILURE,
      error?.response?.data?.title,
    )
  }
}

/**
 * Function to request OTP
 * @param emitter EventEmitter
 * @param newEmail New Email Address
 * @param password User's password
 */
const requestOTPForEmailChange = async (
  emitter: EventEmitter,
  newEmail: string,
  password: string,
) => {
  try {
    emitter.emit(AUTH_EVENTS.REQUEST_OTP_START)
    const org_id = Number(await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID))
    await API_GATEWAY.requestOTPForEmailChange(org_id, password, newEmail)
    emitter.emit(AUTH_EVENTS.REQUEST_OTP_SUCCESS, {email: newEmail, password})
  } catch (error) {
    console.log(error)
    emitter.emit(AUTH_EVENTS.REQUEST_OTP_FAILURE, error?.response?.data?.title)
  }
}

/**
 * Function to verify email address
 * @param emitter EventEmitter
 * @param otp OTP
 */
const verifyEmail = async (emitter: EventEmitter, otp: string) => {
  try {
    emitter.emit(AUTH_EVENTS.VERIFY_EMAIL_START)
    const org_id = Number(await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID))
    await API_GATEWAY.verifyEmail(org_id, otp)
    emitter.emit(AUTH_EVENTS.VERIFY_EMAIL_SUCCESS)
  } catch (error) {
    console.log(error)
    emitter.emit(AUTH_EVENTS.VERIFY_EMAIL_FAILURE, error?.response?.data?.title)
  }
}

const getProfileDetails = async (emitter: EventEmitter) => {
  try {
    emitter.emit(AUTH_EVENTS.LOAD_PROFILE_DETAILS_START)
    const org_id = Number(await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID))
    const licenseClass = await API_GATEWAY.getLicenseClass(org_id)
    const employees = await API_GATEWAY.getAllEmployees(org_id)
    emitter.emit(AUTH_EVENTS.LOAD_PROFILE_DETAILS_SUCCESS, {
      licenseClass,
      employees,
    })
  } catch (error) {
    console.log(error)
    emitter.emit(
      AUTH_EVENTS.LOAD_PROFILE_DETAILS_FAILURE,
      error?.response?.data?.title,
    )
  }
}

export {
  login,
  signUp,
  resetPassword,
  getBranches,
  getProfile,
  getReport,
  updateProfile,
  getDisplayPriority,
  updatePassword,
  requestOTPForEmailChange,
  verifyEmail,
  getProfileDetails,
  getHolidaySettings,
  getHolidayList,
  getRememberMeState,
  getPassword,
  setPassword,
  resetKeychainPassword,
  ssoLogin,
}
