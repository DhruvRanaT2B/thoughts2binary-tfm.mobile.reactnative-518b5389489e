import {EventEmitter, LocalStorage} from '@react-native-granite/core'
import {BOOKING_EVENTS} from './events'
import * as API_GATEWAY from './apiGateway'
import {
  Booking,
  BookingVehicle,
  BookingTag,
  TermsAndConditions,
  Setting,
} from './entity'
import {LOCAL_STORAGE, FILTERS} from '@constants'
import {BookingListType, RecurringType, ImageFile, Address} from 'types'
import {getBookingStatusColor, getStringNumbers, getLastYears} from '@utility'
import moment from 'moment'

/**
 * Function responsible for getting list of bookings
 * @param emitter Eventemitter
 * @param param1 ({bookingCategory, pageNumber, currentList, search})
 * @returns Fires BOOKING_EVENTS
 */
const getBookings = async (
  emitter: EventEmitter,
  {
    bookingCategory,
    pageNumber,
    currentList,
    search,
    bookingType,
    status,
    branch,
    purposeOfTrip,
    costCentre,
  }: {
    bookingCategory: BookingListType
    pageNumber: number
    currentList: Booking[]
    search?: string
    bookingType?: string[]
    status?: string[]
    branch?: string[]
    purposeOfTrip?: string[]
    costCentre?: string[]
  },
) => {
  try {
    emitter.emit(BOOKING_EVENTS.LOAD_BOOKING_LIST_START)
    const organisationID = Number(
      await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID),
    )
    const branchID = Number(await LocalStorage.get(LOCAL_STORAGE.BRANCH_ID))
    const driverID = Number(await LocalStorage.get(LOCAL_STORAGE.DRIVER_ID))
    const viewAllBookings = JSON.parse(
      await LocalStorage.get(LOCAL_STORAGE.VIEW_ALL_BOOKINGS),
    )
    const viewBranchBookings = JSON.parse(
      await LocalStorage.get(LOCAL_STORAGE.VIEW_BRANCH_BOOKINGS),
    )
    const response = await API_GATEWAY.getBookings({
      bookingCategory,
      pageNumber,
      search,
      organisationID,
      bookingType,
      status,
      branch,
      purposeOfTrip,
      costCentre,
      branchID,
      driverID,
      viewAllBookings,
      viewBranchBookings,
    })

    let list = []
    if (pageNumber > 1)
      list = [...currentList, ...(response.results as Booking[])]
    else list = response.results as Booking[]

    emitter.emit(BOOKING_EVENTS.LOAD_BOOKING_LIST_SUCCESS, {
      list,
      nextPage: response.next_page,
      count: response.count,
    })
  } catch (error) {
    console.log(error)
    emitter.emit(BOOKING_EVENTS.LOAD_BOOKING_LIST_FAILURE)
  }
}

/**
 * Function responsible for getting list of calendar bookings
 * @param emitter Eventemitter
 * @param param1 ({date, showWeekly, search})
 * @returns Fires BOOKING_EVENTS
 */
const getCalendarBookings = async (
  emitter: EventEmitter,
  {
    date,
    showWeekly,
    search,
    bookingType,
    status,
    branch,
    purposeOfTrip,
    costCentre,
  }: {
    date: Date
    showWeekly: boolean
    search?: string
    bookingType?: string[]
    status?: string[]
    branch?: string[]
    purposeOfTrip?: string[]
    costCentre?: string[]
  },
) => {
  try {
    emitter.emit(BOOKING_EVENTS.LOAD_BOOKING_LIST_START)
    const organisationID = Number(
      await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID),
    )
    const branchID = Number(await LocalStorage.get(LOCAL_STORAGE.BRANCH_ID))
    const driverID = Number(await LocalStorage.get(LOCAL_STORAGE.DRIVER_ID))
    const viewAllBookings = JSON.parse(
      await LocalStorage.get(LOCAL_STORAGE.VIEW_ALL_BOOKINGS),
    )
    const viewBranchBookings = JSON.parse(
      await LocalStorage.get(LOCAL_STORAGE.VIEW_BRANCH_BOOKINGS),
    )
    const response = await API_GATEWAY.getCalendarBookings({
      date,
      showWeekly,
      search,
      organisationID,
      bookingType,
      status,
      branch,
      purposeOfTrip,
      costCentre,
      branchID,
      driverID,
      viewAllBookings,
      viewBranchBookings,
    })

    const bookings = response.results as Booking[]
    const calendarEvents = bookings.map(booking => ({
      id: booking.pk,
      start: moment(booking.start_datetime?.original).toISOString(),
      end: moment(booking.end_datetime?.original).toISOString(),
      color: getBookingStatusColor(booking.status?.status_name!!),
      summary: `${booking.pk} - ${booking.vehicle?.name}`,
    }))

    emitter.emit(BOOKING_EVENTS.LOAD_BOOKING_LIST_SUCCESS, calendarEvents)
  } catch (error) {
    console.log(error)
    emitter.emit(BOOKING_EVENTS.LOAD_BOOKING_LIST_FAILURE)
  }
}

/**
 * Function responsible for getting a particular booking
 * @param emitter Eventemitter
 * @param bookingID Booking ID
 */
const getBookingWithID = async (emitter: EventEmitter, bookingID: number) => {
  try {
    emitter.emit(BOOKING_EVENTS.LOAD_BOOKING_START)
    const driverID = Number(await LocalStorage.get(LOCAL_STORAGE.DRIVER_ID))
    const organisationID = Number(
      await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID),
    )
    const booking = await API_GATEWAY.getBookingWithID({
      driverID,
      bookingID,
      organisationID,
    })
    emitter.emit(BOOKING_EVENTS.LOAD_BOOKING_SUCCESS, booking)
  } catch (error) {
    console.log(error)
    emitter.emit(BOOKING_EVENTS.LOAD_BOOKING_FAILURE)
  }
}

/**
 * Function responsible for getting a particular booking
 * @param emitter Eventemitter
 */

//filter the content types
const filterContentTypes = (content: Setting[]) => {
  for (let i = 0; i < content.length; i++) {
    if (content[i].entity_name === 'tfm_vehicle') {
      return content[i].pk
    }
  }
}

const getContentTypes = async (emitter: EventEmitter, bookingID: number) => {
  try {
    emitter.emit(BOOKING_EVENTS.GET_CONTENT_TYPE_START)
    const organisationID = Number(
      await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID),
    )
    const content = await API_GATEWAY.getContentType()
    const contentType: number = Number(filterContentTypes(content ?? []))
    const data = (await API_GATEWAY.getVehicleImages(
      bookingID,
      contentType,
      organisationID,
    )) as Setting[]

    const imageList: any = data.map(item => {
      return item.document
    })

    emitter.emit(BOOKING_EVENTS.GET_CONTENT_TYPE_SUCCESS, imageList)
  } catch (error) {
    console.log(error)
    emitter.emit(BOOKING_EVENTS.LOAD_BOOKING_FAILURE)
  }
}

/**
 * Function responsible for getting chcklist
 * @param emitter Eventemitter
 * @param bookingStatus Booking Status
 */
const getCheckLists = async (emitter: EventEmitter, bookingStatus: string) => {
  try {
    const organisationID = Number(
      await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID),
    )
    let checklist = await API_GATEWAY.getChecklist({
      bookingStatus,
      organisationID,
    })
    if (checklist?.value) checklist = JSON.parse(checklist?.value)
    emitter.emit(BOOKING_EVENTS.SHOW_CHECKLIST_SUCCESS, checklist)
  } catch (error) {
    console.log(error)
    emitter.emit(BOOKING_EVENTS.SHOW_CHECKLIST_FAILURE)
  }
}

/**
 * Function to post the booking extend data
 * @param ({bookingID, startDate, endDate, organisationID})
 */
const extendBooking = async (
  emitter: EventEmitter,
  bookingID: number,
  startDate: Date,
  endDate: Date,
) => {
  try {
    emitter.emit(BOOKING_EVENTS.EXTEND_BOOKING_START)
    const organisationID = Number(
      await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID),
    )
    emitter.emit(BOOKING_EVENTS.EXTEND_BOOKING_START)
    await API_GATEWAY.extendBooking({
      bookingID,
      startDate,
      endDate,
      organisationID,
    })
    emitter.emit(BOOKING_EVENTS.EXTEND_BOOKING_SUCCESS)
  } catch (error) {
    console.log(error)
    emitter.emit(BOOKING_EVENTS.EXTEND_BOOKING_FAILURE)
  }
}

/**
 * Function responsible for getting value for showing booking extension
 * @param organisationID organisationID
 */
const loadBookingExtensions = async (emitter: EventEmitter) => {
  try {
    const organisationID = Number(
      await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID),
    )
    let extensionData = await API_GATEWAY.loadBookingExtensions({
      organisationID,
    })

    emitter.emit(BOOKING_EVENTS.LOAD_EXTENSION_SUCCESS, extensionData)
  } catch (error) {
    console.log(error)
    emitter.emit(BOOKING_EVENTS.LOAD_EXTENSION_FAILURE)
  }
}
/**
 * Function responsible for getting cost
 * @param emitter Eventemitter
 * @param ({vehicleID,startDate,endDate,distance,organisationID})
 */
const getCostDetails = async (
  emitter: EventEmitter,
  vehicleID: number,
  startDate: Date,
  endDate: Date,
  distance: number,
) => {
  try {
    const organisationID = Number(
      await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID),
    )
    let costDetails = await API_GATEWAY.getCostDetails({
      vehicleID,
      startDate,
      endDate,
      distance,
      organisationID,
    })

    emitter.emit(BOOKING_EVENTS.GET_BOOKING_COST_SUCCESS, costDetails)
  } catch (error) {
    console.log(error)
    emitter.emit(BOOKING_EVENTS.GET_BOOKING_COST_FAILURE)
  }
}

/**
 * Function responsible for getting terms and conditions
 * @param emitter Eventemitter
 */
const getTnc = async (emitter: EventEmitter) => {
  emitter.emit(BOOKING_EVENTS.GET_TNC_START)
  try {
    const organisationID = Number(
      await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID),
    )
    let tnc: any = await API_GATEWAY.getTnc(organisationID)
    tnc = JSON.parse(tnc) as TermsAndConditions
    emitter.emit(BOOKING_EVENTS.GET_TNC_SUCCESS, tnc)
  } catch (error) {
    console.log(error)
    emitter.emit(BOOKING_EVENTS.GET_TNC_FAILURE)
  }
}

/**
 * Function responsible for getting list of vehicles
 * @param emitter EventEmitter
 * @param param1 Object containing optional filters and required fields
 */
//  ordering,
//   isRecurring,
//   endsOn,
//   recurringPattern,
//   daysOfWeek,
//   datesOfMonth,
const getVehicles = async (
  emitter: EventEmitter,
  {
    currentList,
    pageNumber,
    bookingID,
    startDate,
    endDate,
    vehicleClass = [],
    bodyType = [],
    costCentre = [],
    fuelType = [],
    grade = [],
    seats = [],
    doors = [],
    year = [],
    odoReading = '',
    ordering,
    driverID,
    branchID,
    isRecurring,
    endsOn,
    recurringPattern,
    daysOfWeek,
    datesOfMonth,
  }: {
    currentList: BookingVehicle[]
    bookingID?: number
    startDate: Date
    endDate: Date
    pageNumber: number
    vehicleClass?: string[]
    bodyType?: string[]
    costCentre?: string[]
    fuelType?: string[]
    grade?: string[]
    seats?: string[]
    doors?: string[]
    year?: string[]
    odoReading?: string
    ordering?: string
    driverID: number
    branchID: number
    isRecurring?: boolean
    endsOn?: Date
    recurringPattern?: RecurringType
    daysOfWeek?: number[]
    datesOfMonth?: number[]
  },
) => {
  try {
    emitter.emit(BOOKING_EVENTS.LOAD_VEHICLE_START)
    const orgID = Number(await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID))
    const response = await API_GATEWAY.getVehicles({
      bookingID,
      organisationID: orgID,
      driverID,
      branchID,
      startDate,
      endDate,
      pageNumber,
      vehicleClass,
      bodyType,
      costCentre,
      fuelType,
      grade,
      seats,
      doors,
      year,
      odoReading,
      ordering,
      isRecurring,
      endsOn,
      recurringPattern,
      daysOfWeek,
      datesOfMonth,
    })

    let list = []
    if (pageNumber > 1)
      list = [...currentList, ...(response.results as BookingVehicle[])]
    else list = response.results as BookingVehicle[]

    emitter.emit(BOOKING_EVENTS.LOAD_VEHICLE_SUCCESS, {
      list,
      nextPage: response.next_page,
    })
  } catch (error) {
    console.log(error)
    emitter.emit(BOOKING_EVENTS.LOAD_VEHICLE_FAILURE)
  }
}

/**
 * Function responsible for getting vehicle filters
 * @param emitter EventEmitter
 */
const getVehicleFilters = async (emitter: EventEmitter) => {
  try {
    emitter.emit(BOOKING_EVENTS.LOAD_VEHICLE_FILTERS_START)
    const org_id = Number(await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID))
    const filters = await API_GATEWAY.getVehicleFilters(org_id)
    filters.push({
      category: FILTERS.SEATS,
      values: getStringNumbers(2, 8),
      multiSelect: true,
    })
    filters.push({
      category: FILTERS.DOORS,
      values: getStringNumbers(2, 9),
      multiSelect: true,
    })
    filters.push({
      category: FILTERS.YEAR,
      values: getLastYears(15),
      multiSelect: true,
    })
    filters.push({
      category: FILTERS.ODOMETER,
      values: [
        '0-99',
        '100-499',
        '500-999',
        '1000-9999',
        '10000-49999',
        '50000-99999',
        '100000-999999',
      ],
      multiSelect: false,
    })
    emitter.emit(BOOKING_EVENTS.LOAD_VEHICLE_FILTERS_SUCCESS, filters)
  } catch (error) {
    console.log(error)
    emitter.emit(BOOKING_EVENTS.LOAD_VEHICLE_FILTERS_FAILURE)
  }
}

/**
 * Function used to get booking purpose
 * @param emitter EventEmitter
 */
const getBookingPurpose = async (emitter: EventEmitter) => {
  try {
    emitter.emit(BOOKING_EVENTS.LOAD_BOOKING_PURPOSE_START)
    const org_id = Number(await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID))
    const costCentreID = Number(
      await LocalStorage.get(LOCAL_STORAGE.COST_CENTRE_ID),
    )
    const response = await API_GATEWAY.getBookingPurpose(org_id)
    const bookingTags = await API_GATEWAY.getBookingTags(org_id)

    emitter.emit(BOOKING_EVENTS.LOAD_BOOKING_PURPOSE_SUCCESS, {
      costCentres: response[0].costCentres,
      isCostCentreMandatory: response[0].isMandatory,
      pots: response[1].pots,
      isPOTMandatory: response[1].isMandatory,
      bookingTypes: response[2].bookingTypes,
      isBookingTypeMandatory: response[2].isMandatory,
      costCentreID,
      bookingTags,
    })
  } catch (error) {
    console.log(error)
    emitter.emit(BOOKING_EVENTS.LOAD_BOOKING_PURPOSE_FAILURE)
  }
}

/**
 * Function used to create a boooking
 * @param emitter EventEmitter
 * @param param1
 */
const createBooking = async (
  emitter: EventEmitter,
  {
    address,
    bookingType,
    branchID,
    costCentreID,
    costCentreName,
    datesOfMonth,
    daysOfWeek,
    endDate,
    endOnDate,
    isRecurring,
    recurringPattern,
    startDate,
    vehicleID,
    purposeOfTrip,
    bookingID,
    driverID,
    bookingTags,
    estimatedCost,
  }: {
    address?: Address
    bookingType?: string
    branchID: number
    costCentreID?: number
    costCentreName?: string
    datesOfMonth?: number[]
    daysOfWeek?: number[]
    endDate: Date
    endOnDate?: Date
    isRecurring: boolean
    recurringPattern?: RecurringType
    startDate: Date
    vehicleID: number
    purposeOfTrip?: string
    bookingID?: number
    driverID: number
    bookingTags: BookingTag[]
    estimatedCost: string
  },
) => {
  try {
    emitter.emit(BOOKING_EVENTS.CREATE_BOOKING_START)
    const organisationID = Number(
      await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID),
    )
    const response = await API_GATEWAY.createBooking({
      address,
      bookingType,
      branchID,
      costCentreID,
      costCentreName,
      datesOfMonth,
      daysOfWeek,
      driverID,
      endDate,
      endOnDate,
      isRecurring,
      recurringPattern,
      startDate,
      vehicleID,
      organisationID,
      purposeOfTrip,
      bookingID,
      bookingTags,
      estimatedCost,
    })
    emitter.emit(BOOKING_EVENTS.CREATE_BOOKING_SUCCESS, {
      id: response.pk,
      needsApproval: response.status?.status_name === 'Pending Approval',
    })
  } catch (error) {
    console.log(error)
    emitter.emit(
      BOOKING_EVENTS.CREATE_BOOKING_FAILURE,
      error?.response?.data?.title,
    )
  }
}

/**
 * Function used to check out a vehicle
 * @param emitter EventEmitter
 * @param param1
 */
const checkOut = async (
  emitter: EventEmitter,
  {
    bookingID,
    notes,
    odoReading,
    checkListObj,
  }: {
    bookingID: number
    notes?: string
    odoReading?: number
    checkListObj: any
  },
) => {
  try {
    emitter.emit(BOOKING_EVENTS.CHECK_OUT_START)
    const organisationID = Number(
      await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID),
    )
    await API_GATEWAY.checkOut(
      organisationID,
      bookingID,
      checkListObj,
      notes,
      odoReading,
    )
    emitter.emit(BOOKING_EVENTS.CHECK_OUT_SUCCESS)
  } catch (error) {
    console.log(error)
    emitter.emit(BOOKING_EVENTS.CHECK_OUT_FAILURE, error?.response?.data?.title)
  }
}

/**
 * Function used to check in a vehicle
 * @param emitter EventEmitter
 * @param param1
 */
const checkIn = async (
  emitter: EventEmitter,
  {
    bookingID,
    notes,
    odoReading,
    isOdoUpdated,
    checkListObj,
  }: {
    bookingID: number
    notes?: string
    odoReading?: number
    isOdoUpdated: boolean
    checkListObj: any
  },
) => {
  try {
    emitter.emit(BOOKING_EVENTS.CHECK_IN_START)
    const organisationID = Number(
      await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID),
    )
    await API_GATEWAY.checkIn(
      organisationID,
      bookingID,
      checkListObj,
      isOdoUpdated,
      odoReading,
      notes,
    )
    emitter.emit(BOOKING_EVENTS.CHECK_IN_SUCCESS)
  } catch (error) {
    console.log(error)
    emitter.emit(BOOKING_EVENTS.CHECK_IN_FAILURE, error?.response?.data?.title)
  }
}

/**
 * Function used to get incidents for Check in
 * @param emitter EventEmitter
 */
const getIncidents = async (emitter: EventEmitter) => {
  try {
    emitter.emit(BOOKING_EVENTS.LOAD_INCIDENTS_START)
    const organisationID = Number(
      await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID),
    )
    const incidents = await API_GATEWAY.getIncidentsList(organisationID)
    const tags = await API_GATEWAY.getIncidentTags(organisationID)
    emitter.emit(BOOKING_EVENTS.LOAD_INCIDENTS_SUCCESS, {incidents, tags})
  } catch (error) {
    console.log(error)
    emitter.emit(BOOKING_EVENTS.LOAD_INCIDENTS_FAILURE)
  }
}

/**
 * Function used to get booking trip details
 * @param emitter EventEmitter
 * @param bookingID BookingID
 */
const getBookingTrip = async (emitter: EventEmitter, bookingID: number) => {
  try {
    emitter.emit(BOOKING_EVENTS.LOAD_BOOKING_TRIP_START)
    const organisationID = Number(
      await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID),
    )
    const bookingTrip = await API_GATEWAY.getBookingTrip(
      organisationID,
      bookingID,
    )
    emitter.emit(BOOKING_EVENTS.LOAD_BOOKING_TRIP_SUCCESS, bookingTrip?.[0])
  } catch (error) {
    console.log(error)
    emitter.emit(BOOKING_EVENTS.LOAD_BOOKING_TRIP_FAILURE)
  }
}

/**
 * Function used to log incident
 * @param emitter EventEmitter
 * @param param1
 */
const logIncident = async (
  emitter: EventEmitter,
  {
    bookingID,
    notes,
    odoReading,
    address,
    incidentSubType,
    incidentID,
    isCritical,
    reportedOn,
    vehicleID,
    bookingTripID,
    images,
    incidentTags,
    checkListObj,
    isOdoUpdated,
  }: {
    bookingID: number
    notes?: string
    odoReading?: number
    address: Address
    incidentSubType?: string
    incidentID: number
    isCritical: boolean
    reportedOn: Date
    vehicleID: number
    bookingTripID: number
    images?: ImageFile[]
    incidentTags: BookingTag[]
    checkListObj: any
    isOdoUpdated: any
  },
) => {
  try {
    emitter.emit(BOOKING_EVENTS.LOG_INCIDENT_START)
    const organisationID = Number(
      await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID),
    )
    await API_GATEWAY.logIncident({
      organisationID,
      bookingID,
      notes,
      odoReading,
      address,
      incidentSubType,
      incidentID,
      isCritical,
      reportedOn,
      vehicleID,
      bookingTripID,
      images,
      incidentTags,
      checkListObj,
      isOdoUpdated,
    })
    emitter.emit(BOOKING_EVENTS.LOG_INCIDENT_SUCCESS)
  } catch (error) {
    console.log(error)
    emitter.emit(
      BOOKING_EVENTS.LOG_INCIDENT_FAILURE,
      error?.response?.data?.title,
    )
  }
}

/**
 * Function to delete a booking
 * @param emitter EventEmitter
 * @param bookingID Booking ID
 */
const deleteBooking = async (emitter: EventEmitter, bookingID: number) => {
  try {
    emitter.emit(BOOKING_EVENTS.DELETE_BOOKING_START)
    const organisationID = Number(
      await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID),
    )
    await API_GATEWAY.deleteBooking(organisationID, bookingID)
    emitter.emit(BOOKING_EVENTS.DELETE_BOOKING_SUCCESS)
  } catch (error) {
    console.log(error)
    emitter.emit(
      BOOKING_EVENTS.DELETE_BOOKING_FAILURE,
      error?.response?.data?.title,
    )
  }
}

const getBookingFilters = async (emitter: EventEmitter) => {
  try {
    emitter.emit(BOOKING_EVENTS.LOAD_BOOKING_FILTERS_START)
    const org_id = Number(await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID))
    const filters = await API_GATEWAY.getBookingFilters(org_id)
    emitter.emit(BOOKING_EVENTS.LOAD_BOOKING_FILTERS_SUCCESS, filters)
  } catch (error) {
    console.log(error)
    emitter.emit(BOOKING_EVENTS.LOAD_BOOKING_FILTERS_FAILURE)
  }
}

/**
 * Function to cancel a booking
 * @param emitter EventEmitter
 * @param bookingID Booking ID
 */
const cancelBooking = async (emitter: EventEmitter, bookingID: number) => {
  try {
    emitter.emit(BOOKING_EVENTS.CANCEL_BOOKING_START)
    const organisationID = Number(
      await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID),
    )
    await API_GATEWAY.cancelBooking(organisationID, bookingID)
    emitter.emit(BOOKING_EVENTS.CANCEL_BOOKING_SUCCESS)
  } catch (error) {
    console.log(error)
    emitter.emit(
      BOOKING_EVENTS.CANCEL_BOOKING_FAILURE,
      error?.response?.data?.title,
    )
  }
}

/**
 * Function to get list of drivers
 * @param emitter EventEmitter
 * @param param1
 */
const getDrivers = async (
  emitter: EventEmitter,
  {bookingID, driverPK}: {bookingID?: number; driverPK?: number},
) => {
  try {
    emitter.emit(BOOKING_EVENTS.LOAD_DRIVERS_START)
    const organisationID = Number(
      await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID),
    )
    const drivers = await API_GATEWAY.getDrivers({
      organisationID,
      bookingID,
    })

    let index = -1
    if (driverPK && drivers) {
      index = drivers.findIndex(element => element.pk === driverPK)
    }
    emitter.emit(BOOKING_EVENTS.LOAD_DRIVERS_SUCCESS, {
      drivers,
      index: index === -1 ? undefined : index,
    })
  } catch (error) {
    console.log(error)
    emitter.emit(
      BOOKING_EVENTS.LOAD_DRIVERS_FAILURE,
      error?.response?.data?.title,
    )
  }
}
/**
 * Function fetches seetings to allow/prevent user from making booking with expired license
 */

const allowBookingWithExpiredLicense = async (emitter: EventEmitter) => {
  try {
    emitter.emit(BOOKING_EVENTS.GET_EXPIRED_LICENSE_SETTING_START)
    const organisationID = Number(
      await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID),
    )
    const response: boolean = await API_GATEWAY.allowBookingWithExpiredLicense(
      organisationID,
    )

    emitter.emit(BOOKING_EVENTS.GET_EXPIRED_LICENSE_SETTING_SUCCESS, response)
  } catch (error) {
    console.log(error)
    emitter.emit(
      BOOKING_EVENTS.GET_EXPIRED_LICENSE_SETTING_FAILURE,
      error?.response?.data?.title,
    )
  }
}

/**
 * Function to verify driver for booking
 * @param emitter EventEmitter
 * @param param1
 */
const verifyDriver = async (
  emitter: EventEmitter,
  {
    startDate,
    endDate,
    driverPK,
  }: {
    startDate: Date
    endDate: Date
    driverPK: number
  },
) => {
  try {
    emitter.emit(BOOKING_EVENTS.VERIFY_DRIVER_START)
    const organisationID = Number(
      await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID),
    )
    const bookings = await API_GATEWAY.verifyDriver({
      organisationID,
      startDate,
      endDate,
      driverPK,
    })

    emitter.emit(BOOKING_EVENTS.VERIFY_DRIVER_SUCCESS, {bookings})
  } catch (error) {
    console.log(error)
    emitter.emit(
      BOOKING_EVENTS.VERIFY_DRIVER_FAILURE,
      error?.response?.data?.title,
    )
  }
}

export {
  getBookings,
  getCalendarBookings,
  getBookingWithID,
  getVehicles,
  getVehicleFilters,
  getBookingPurpose,
  createBooking,
  checkOut,
  checkIn,
  getIncidents,
  getBookingTrip,
  logIncident,
  deleteBooking,
  getBookingFilters,
  cancelBooking,
  getDrivers,
  verifyDriver,
  getCheckLists,
  getCostDetails,
  getTnc,
  loadBookingExtensions,
  extendBooking,
  getContentTypes,
  allowBookingWithExpiredLicense,
}
