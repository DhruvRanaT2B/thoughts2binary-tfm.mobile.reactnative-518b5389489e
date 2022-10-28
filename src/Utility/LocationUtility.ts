import {Platform} from 'react-native'
import PermissionHandler from 'react-native-permissions'
import Geolocation, {
  GeoError,
  GeoOptions,
  GeoPosition,
} from 'react-native-geolocation-service'
import {PermissionStatus, RequestPermissionResponse} from 'types'

/**
 * Function to check whether the device has location permission or not
 * @returns Status of permission
 */
const hasLocationPermission = async (): Promise<PermissionStatus> => {
  try {
    const status = await PermissionHandler.check(
      Platform.OS === 'android'
        ? PermissionHandler.PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
        : PermissionHandler.PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    )

    return {
      isGranted: status === PermissionHandler.RESULTS.GRANTED,
      inAppRequestable: status === PermissionHandler.RESULTS.DENIED,
      isAvailable: status !== PermissionHandler.RESULTS.UNAVAILABLE,
    }
  } catch (error) {
    console.log('hasLocationPermission', error)
    return {isGranted: false, inAppRequestable: false, isAvailable: false}
  }
}

/**
 * Function to request location permission
 * @param inAppRequestable if true, the app will show a system popup to request permission
 * otherwise open system settings
 * @returns Status of request
 */
const requestLocationPermission = async <T extends boolean>(
  inAppRequestable: T,
): Promise<RequestPermissionResponse<T>> => {
  if (inAppRequestable) {
    try {
      const status = await PermissionHandler.request(
        Platform.OS === 'android'
          ? PermissionHandler.PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
          : PermissionHandler.PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      )
      return {
        isGranted: status === PermissionHandler.RESULTS.GRANTED,
        inAppRequestable: status === PermissionHandler.RESULTS.DENIED,
        isAvailable: status !== PermissionHandler.RESULTS.UNAVAILABLE,
      } as RequestPermissionResponse<T>
    } catch (error) {
      console.log('requestLocationPermission', error)
      return {
        isGranted: false,
        inAppRequestable: false,
        isAvailable: false,
      } as RequestPermissionResponse<T>
    }
  } else {
    PermissionHandler.openSettings()
    return undefined as RequestPermissionResponse<T>
  }
}

/**
 * Function to get device location
 * @param onSuccess callback which will be called with GeoPosition
 * @param onFailure callback which will be called with GeoError
 * @param options Configurable options
 */
const getLocation = (
  onSuccess: (position: GeoPosition) => void,
  onFailure: (error: GeoError) => void,
  options?: GeoOptions,
) => {
  Geolocation.getCurrentPosition(onSuccess, onFailure, {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 10000,
    ...options,
  })
}

export {hasLocationPermission, requestLocationPermission, getLocation}
