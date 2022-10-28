import {Networking, Method, GNRequest} from '@react-native-granite/core'
// @ts-ignore
import {CLIENT_ID} from '@env'
import {NotificationsResponse} from './entity'

/**
 * Function to get notifications
 * @param param0
 * @returns NotificationsResponse
 */
async function getNotifications({
  pageNumber,
  organisationID,
}: {
  pageNumber: number
  organisationID: number
}) {
  const endPoint = '/granite/v1/notifications/'
  const request = new GNRequest(Method.GET, endPoint)
  request.queryParams = {page: pageNumber, ignore_serialize: true}

  request.headersExtra = {client: CLIENT_ID, organisation: organisationID}
  const response = await Networking.makeApiCall<NotificationsResponse>(request)

  return response.data as NotificationsResponse
}

export {getNotifications}
