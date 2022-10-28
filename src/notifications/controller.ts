import {EventEmitter, LocalStorage} from '@react-native-granite/core'
import {NOTIFICATION_EVENTS} from './events'
import * as API_GATEWAY from './apiGateway'
import {Notification} from './entity'
import {LOCAL_STORAGE} from '@constants'

/**
 * Function to get notifications
 * @param emitter EventEmitter
 * @param param1
 */
const getNotifications = async (
  emitter: EventEmitter,
  {
    pageNumber,
    currentList,
  }: {
    pageNumber: number
    currentList: Notification[]
  },
) => {
  try {
    emitter.emit(NOTIFICATION_EVENTS.LOAD_NOTIFICATION_LIST_START)
    const organisationID = Number(
      await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID),
    )
    const response = await API_GATEWAY.getNotifications({
      pageNumber,
      organisationID,
    })

    let list = []
    let res = response.results as Notification[]
    res = res.filter(item => {
      return item.verb?.includes('https') === false
    })
    if (pageNumber > 1) list = [...currentList, ...res]
    else list = res
    emitter.emit(NOTIFICATION_EVENTS.LOAD_NOTIFICATION_LIST_SUCCESS, {
      list,
      nextPage: response.next_page,
    })
  } catch (error) {
    console.log(error)
    emitter.emit(NOTIFICATION_EVENTS.LOAD_NOTIFICATION_LIST_FAILURE)
  }
}

export {getNotifications}
