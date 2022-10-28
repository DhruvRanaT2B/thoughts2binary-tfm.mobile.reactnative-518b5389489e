import {Networking, Method, GNRequest} from '@react-native-granite/core'
import {
  CLIENT_ID,
  API_END_POINT,
  USER_REPORT_ID,
  AWS_END_POINT,
  SSO_END_POINT,
  // @ts-ignore
} from '@env'
import {
  BranchResponse,
  DisplayPriorityResponse,
  EmployeeSearchResponse,
  HolidayList,
  LoginResponse,
  PermissionResponse,
  ProfileResponse,
  ReportResponse,
  SettingsResponse,
  SSOResponse,
  UploadProfileImageResponse,
} from './entity'
import {ImageFile} from 'types'
import _ from 'lodash'
import {ConfigMasterResponse, ImagePathResponse} from '../bookings/entity'

/**
 * Function to call sign-in API
 * @param email User email
 * @param password User password
 * @returns Raw api response
 */
async function signIn(email: string, password: string) {
  const endPoint = '/accounts/v1/user/login/'
  const request = new GNRequest(Method.POST, endPoint)
  request.body = {email, password}
  request.headersExtra = {client: CLIENT_ID}
  const response = await Networking.makeApiCall<LoginResponse>(request)

  return response.data as LoginResponse
}

/**
 * Function to call SSO api
 * @param email User email
 * @returns Raw api response
 */
async function ssoSignIn(email: string) {
  const endPoint = SSO_END_POINT
  const request = new GNRequest(Method.POST, endPoint)
  request.queryParams = {email: email}
  const response = await Networking.makeApiCall<SSOResponse>(request)

  return response.data as SSOResponse
}

/**
 * Function to call sign-up API
 * @param first_name First name
 * @param last_name Last Name
 * @param email Email
 */
async function signUp(first_name: string, last_name: string, email: string) {
  const endPoint = '/tfm/v1/employees-extensions/register/'
  const request = new GNRequest(Method.POST, endPoint)
  request.body = {first_name, last_name, email}
  request.headersExtra = {client: CLIENT_ID}
  const response = await Networking.makeApiCall(request)
}

/**
 * Function to call reset password API
 * @param email Email
 */
async function resetPassword(email: string) {
  const endPoint = '/accounts/v1/user/recover-password/'
  const request = new GNRequest(Method.POST, endPoint)
  request.body = {email}
  request.headersExtra = {client: CLIENT_ID}
  const response = await Networking.makeApiCall(request)
}

/**
 * Function to call profile API
 * @param organisation_id Org ID
 * @returns Raw API response
 */
async function getProfile(organisation_id?: number) {
  // if org id is not there, get it first
  if (!organisation_id) {
    const userProfileEndPoint = '/accounts/v1/user/profile/'
    const userRequest = new GNRequest(Method.GET, userProfileEndPoint)
    userRequest.headersExtra = {client: CLIENT_ID}
    const userResponse = await Networking.makeApiCall(userRequest)

    if (_.isEmpty((userResponse.data as any)?.organisations)) throw Error()
    organisation_id = (userResponse.data as any).organisations[0]
      .organisation__pk
  }

  const endPoint = '/tfm/v1/employees-extensions/get-profile/'
  const request = new GNRequest(Method.GET, endPoint)
  request.headersExtra = {client: CLIENT_ID, organisation: organisation_id}
  request.queryParams = {ignore_serialize: true}
  const response = await Networking.makeApiCall<ProfileResponse>(request)

  return response.data as ProfileResponse
}

/**
 * Function to get list of branches
 * @param organisation_id Organisation ID
 * @returns List of branch
 */
async function getBranches(organisation_id: number) {
  const endPoint = '/tfm/v1/branches/'
  const request = new GNRequest(Method.GET, endPoint)
  request.headersExtra = {client: CLIENT_ID, organisation: organisation_id}
  request.queryParams = {page_size: 100, ordering: 'name'}

  const response = await Networking.makeApiCall<BranchResponse>(request)

  return (response.data as BranchResponse).results
}

/**
 *function to get All the organisation settings
 * entity_name: tfm_booking
config_type: ORGANISATION_SETTING
page_size: 499
 */

async function getOrganisationSettings(organisationID: number) {
  const endPoint = `/organisations/v1/settings/`
  const request = new GNRequest(Method.GET, endPoint)
  request.headersExtra = {client: CLIENT_ID, organisation: organisationID}

  request.queryParams = {
    entity_name: 'tfm_booking',
    config_type: 'ORGANISATION_SETTING',
    page_size: '499',
  }

  const response = await Networking.makeApiCall<SettingsResponse>(request)

  return (response.data as SettingsResponse).results
}

/**
 *function to get All the Holiday list of a particular branch
 * branch_id: 56
page: 1
page_size: 300
ignore_serialize: true
 */

async function getAllHolidayList(organisationID: number, branchId: number) {
  const endPoint = `/tfm/v1/branch-holidays/`
  const request = new GNRequest(Method.GET, endPoint)
  request.headersExtra = {client: CLIENT_ID, organisation: organisationID}

  request.queryParams = {
    branch_id: branchId,
    page: 1,
    page_size: '300',
    ignore_serialize: true,
  }

  const response = await Networking.makeApiCall<HolidayList>(request)

  return (response.data as HolidayList).results
}

/**
 * Function to get report
 * @param organisation_id Organisation ID
 * @param driverID Driver ID
 * @returns Report[]
 */
async function getReport(organisation_id: number, driverID: number) {
  const endPoint = `/aggregate/v1/report/${USER_REPORT_ID}/result/`
  const request = new GNRequest(Method.POST, endPoint)
  request.headersExtra = {client: CLIENT_ID, organisation: organisation_id}
  request.body = {
    params: {
      driver_pk: driverID,
    },
  }
  const response = await Networking.makeApiCall<ReportResponse>(request)

  return (response.data as ReportResponse).results
}

/**
 * Function to update user profile
 * @param param0
 */
async function updateProfile({
  driverID,
  organisationID,
  firstName,
  lastName,
  profileImage,
  userProfile,
  licenseExpiryDays,
  licenseExpiryReminder = false,
  licenseExpiryRecipients,
  licenseClass,
  licenseCountry,
  licenseNumber,
  licenseExpiryDate,
  licenseBackImage,
  licenseFrontImage,
}: {
  driverID: number
  organisationID: number
  firstName: string
  lastName: string
  profileImage?: ImageFile
  userProfile: ProfileResponse
  licenseExpiryDays?: number
  licenseExpiryReminder?: boolean
  licenseExpiryRecipients?: {name: string; pk: number}[]
  licenseClass?: string[]
  licenseCountry?: string
  licenseNumber?: string
  licenseExpiryDate?: string
  licenseBackImage?: ImageFile
  licenseFrontImage?: ImageFile
}) {
  // First upload license images (if any)
  let frontImageKey, backImageKey
  try {
    if (licenseFrontImage && licenseFrontImage.name) {
      frontImageKey = await uploadLicenseImage(
        organisationID,
        licenseFrontImage,
      )
    }
    if (licenseBackImage && licenseBackImage.name) {
      backImageKey = await uploadLicenseImage(organisationID, licenseBackImage)
    }
  } catch (error) {
    Networking.configure(API_END_POINT)
    throw error
  } finally {
    Networking.configure(API_END_POINT)
  }

  const endPoint = `/tfm/v1/employees-extensions/${driverID}/`
  const request = new GNRequest(Method.PUT, endPoint)
  request.headersExtra = {client: CLIENT_ID, organisation: organisationID}
  let payload: any = {
    employee_id: userProfile.employee_id,
    is_active: userProfile.is_active,
    pk: userProfile.pk,
    role: userProfile.role,
    status: userProfile.status,
    employees_extension: {
      license_exp_reminder: licenseExpiryReminder,
      pk: userProfile.employees_extension?.pk,
      associated_tags: userProfile.employees_extension?.associated_tags,
    },
    user: {
      first_name: firstName,
      last_name: lastName,
      phone: userProfile.user?.phone,
      email: userProfile.user?.email,
      pk: userProfile.user?.pk,
    },
  }
  if (userProfile.employees_extension?.cost_centre?.pk)
    payload['employees_extension'] = {
      ...payload['employees_extension'],
      cost_centre: userProfile.employees_extension?.cost_centre,
    }

  if (licenseExpiryReminder)
    payload['employees_extension'] = {
      ...payload['employees_extension'],
      lic_exp_remind_before_days: licenseExpiryDays,
      lic_exp_reminder_recipients: licenseExpiryRecipients,
    }

  if (!_.isEmpty(licenseClass))
    payload['employees_extension'] = {
      ...payload['employees_extension'],
      license_class: licenseClass,
    }

  if (licenseCountry)
    payload['employees_extension'] = {
      ...payload['employees_extension'],
      license_country_of_issue: licenseCountry,
    }

  if (licenseNumber)
    payload['employees_extension'] = {
      ...payload['employees_extension'],
      license_number: licenseNumber,
    }

  if (licenseExpiryDate)
    payload['employees_extension'] = {
      ...payload['employees_extension'],
      license_valid_upto: licenseExpiryDate,
    }

  if (frontImageKey)
    payload['employees_extension'] = {
      ...payload['employees_extension'],
      license_front_image: frontImageKey,
    }

  if (backImageKey)
    payload['employees_extension'] = {
      ...payload['employees_extension'],
      license_back_image: backImageKey,
    }

  request.body = payload

  const response = await Networking.makeApiCall(request)

  try {
    if (profileImage) await uploadProfileImage(organisationID, profileImage)
  } catch (error) {
    Networking.configure(API_END_POINT)
    throw error
  } finally {
    Networking.configure(API_END_POINT)
  }
}

async function uploadProfileImage(organisation_id: number, image: ImageFile) {
  const endPoint = '/accounts/v1/user/image/upload/'
  const request = new GNRequest(Method.POST, endPoint)
  request.headersExtra = {client: CLIENT_ID, organisation: organisation_id}
  request.body = {
    file_name: image.name,
  }
  const response = await Networking.makeApiCall<UploadProfileImageResponse>(
    request,
  )

  Networking.configure(AWS_END_POINT)
  const s3Request = new GNRequest(Method.POST, '')
  s3Request.contentType = 'multipart/form-data'

  const imagePathResponseData = (response.data as UploadProfileImageResponse)
    .result
  const formData = new FormData()
  formData.append('key', imagePathResponseData?.fields?.key)
  formData.append('acl', imagePathResponseData?.fields?.acl)
  formData.append(
    'AWSAccessKeyId',
    imagePathResponseData?.fields?.AWSAccessKeyId,
  )
  formData.append('policy', imagePathResponseData?.fields?.policy)
  formData.append('signature', imagePathResponseData?.fields?.signature)
  formData.append('file', image)

  s3Request.body = formData
  s3Request.useAuthHeader = false
  const s3Response = await Networking.makeApiCall(s3Request)

  Networking.configure(API_END_POINT)
  const profileEndPoint = '/accounts/v1/user/me/'
  const profileRequest = new GNRequest(Method.PUT, profileEndPoint)
  profileRequest.headersExtra = {
    client: CLIENT_ID,
    organisation: organisation_id,
  }
  profileRequest.body = {
    profile_image: imagePathResponseData?.fields?.key,
  }
  const profileResponse = await Networking.makeApiCall(profileRequest)
}

/**
 * Function used to upload license images
 * @param organisationID Organisation ID
 * @param image Image
 */
async function uploadLicenseImage(organisationID: number, image: ImageFile) {
  const imagePathEndPoint = `/granite/v1/document/upload/?filename=${image.name}`
  const imagePathRequest = new GNRequest(Method.GET, imagePathEndPoint)
  imagePathRequest.headersExtra = {
    client: CLIENT_ID,
    organisation: organisationID,
  }

  const imagePathResponse = await Networking.makeApiCall<ImagePathResponse>(
    imagePathRequest,
  )

  Networking.configure(AWS_END_POINT)
  const s3Request = new GNRequest(Method.POST, '')
  s3Request.contentType = 'multipart/form-data'

  const imagePathResponseData = imagePathResponse.data as ImagePathResponse
  const formData = new FormData()
  formData.append('key', imagePathResponseData.fields?.key)
  formData.append('acl', imagePathResponseData.fields?.acl)
  formData.append(
    'AWSAccessKeyId',
    imagePathResponseData.fields?.AWSAccessKeyId,
  )
  formData.append('policy', imagePathResponseData.fields?.policy)
  formData.append('signature', imagePathResponseData.fields?.signature)
  formData.append('file', image)

  s3Request.body = formData
  s3Request.useAuthHeader = false
  const s3Response = await Networking.makeApiCall(s3Request)

  Networking.configure(API_END_POINT)
  return imagePathResponseData.fields?.key
}

/**
 * Function to get display priority
 * @param organisationID Organisation ID
 * @returns DisplayPriority[]
 */
async function getDisplayPriority(organisationID: number) {
  const endPoint = `/organisations/v1/settings/`
  const request = new GNRequest(Method.GET, endPoint)
  request.headersExtra = {client: CLIENT_ID, organisation: organisationID}
  request.queryParams = {setting_key: 'Type of Display Priority'}

  const response = await Networking.makeApiCall<DisplayPriorityResponse>(
    request,
  )

  return (response.data as DisplayPriorityResponse).results
}

/**
 * Function to change account password
 * @param organisationID Org ID
 * @param oldPassword Current Password
 * @param newPassword New Password
 * @returns
 */
async function changePassword(
  organisationID: number,
  oldPassword: string,
  newPassword: string,
) {
  const endPoint = `/accounts/v1/user/change-password/`
  const request = new GNRequest(Method.POST, endPoint)
  request.headersExtra = {client: CLIENT_ID, organisation: organisationID}
  request.body = {
    password: oldPassword,
    new_password: newPassword,
    confirm_new_password: newPassword,
  }

  const response = await Networking.makeApiCall(request)
}

/**
 * Function to request OTP for email change
 * @param organisationID Org ID
 * @param password User's password
 * @param newEmail new email address
 */
async function requestOTPForEmailChange(
  organisationID: number,
  password: string,
  newEmail: string,
) {
  const endPoint = `/accounts/v1/user/change/email/request/`
  const request = new GNRequest(Method.POST, endPoint)
  request.headersExtra = {client: CLIENT_ID, organisation: organisationID}
  request.body = {
    new_email: newEmail,
    password,
  }

  const response = await Networking.makeApiCall(request)
}

/**
 * Function to verify email address
 * @param organisationID Org ID
 * @param otp OTP
 */
async function verifyEmail(organisationID: number, otp: string) {
  const endPoint = `/accounts/v1/user/change/email/`
  const request = new GNRequest(Method.POST, endPoint)
  request.headersExtra = {client: CLIENT_ID, organisation: organisationID}
  request.body = {otp}

  const response = await Networking.makeApiCall(request)
}

/**
 * Function to get all permissions of logged in user
 * @param organisationID Org Id
 * @returns Permissions
 */
async function getEmployeePermissions(organisationID: number) {
  const endPoint = `/organisations/v1/employee/permissions/`
  const request = new GNRequest(Method.GET, endPoint)
  request.headersExtra = {client: CLIENT_ID, organisation: organisationID}
  request.queryParams = {page_size: 499}

  const response = await Networking.makeApiCall<PermissionResponse>(request)

  return (response.data as PermissionResponse).results
}

async function getLicenseClass(organisationID: number) {
  const endPoint = `/granite/v1/config-master/`
  const request = new GNRequest(Method.GET, endPoint)
  request.headersExtra = {client: CLIENT_ID, organisation: organisationID}
  request.queryParams = {search: 'License Class', config_type: 'OPTIONS'}

  const response = await Networking.makeApiCall<ConfigMasterResponse>(request)

  return (response.data as ConfigMasterResponse).results?.[0].possible_values
}

async function getAllEmployees(organisationID: number) {
  const endPoint = `/tfm/v1/employees-extensions/search/`
  const request = new GNRequest(Method.GET, endPoint)
  request.headersExtra = {client: CLIENT_ID, organisation: organisationID}
  request.queryParams = {
    ordering: 'name',
    page_size: 1000,
    status: 'Active',
    page: 1,
  }

  const response = await Networking.makeApiCall<EmployeeSearchResponse>(request)

  return (response.data as EmployeeSearchResponse).results
}

export {
  signIn,
  signUp,
  resetPassword,
  getProfile,
  getBranches,
  getReport,
  updateProfile,
  getDisplayPriority,
  changePassword,
  requestOTPForEmailChange,
  verifyEmail,
  getEmployeePermissions,
  getLicenseClass,
  getAllEmployees,
  getOrganisationSettings,
  getAllHolidayList,
  ssoSignIn,
}
