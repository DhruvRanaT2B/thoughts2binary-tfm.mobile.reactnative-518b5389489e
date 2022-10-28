import {Networking, Method, GNRequest} from '@react-native-granite/core'
import moment from 'moment'
import {
  CLIENT_ID,
  API_END_POINT,
  INCIDENT_CONTENT_TYPE_ID,
  AWS_END_POINT,
  // @ts-ignore
} from '@env'
import {
  Booking,
  BookingsResponse,
  BookingTag,
  BookingTripResponse,
  ConfigMasterResponse,
  CostCentreResponse,
  CreateBookingResponse,
  DriverResponse,
  ImagePathResponse,
  IncidentsResponse,
  SettingsResponse,
  StatusResponse,
  TagResponse,
  VehicleResponse,
  PurposeOfTripResponse,
  BookingCost,
} from './entity'
import {BookingListType, RecurringType, ImageFile, Address} from 'types'
import {FILTERS} from '@constants'
import {getBranches} from '../accounts/apiGateway'
import {encodeArray} from '@utility'

/**
 * Function to get list of bookings
 * @returns BookingsResponse
 */
async function getBookings(param: {
  bookingCategory: BookingListType
  pageNumber: number
  search?: string
  organisationID: number
  bookingType?: string[]
  status?: string[]
  branch?: string[]
  purposeOfTrip?: string[]
  costCentre?: string[]
  branchID: number
  driverID: number
  viewAllBookings: boolean
  viewBranchBookings: boolean
}) {
  const endPoint = '/tfm/v1/bookings/'
  const request = new GNRequest(Method.GET, endPoint)
  request.queryParams = {
    page: param.pageNumber,
    ignore_serialize: true,
    ordering: 'start_datetime',
  }
  if (!param.viewAllBookings) {
    request.queryParams['is_branch_bookings'] = true
    request.queryParams['driver_pks'] = `[${param.driverID}]`
    if (param.viewBranchBookings && param.branchID)
      request.queryParams['branch_pks'] = `[${param.branchID}]`
  }
  if (param.bookingType && param.bookingType.length > 0)
    request.queryParams['booking_type'] = encodeArray(param.bookingType)
  if (param.status && param.status.length > 0)
    request.queryParams['status_names'] = encodeArray(param.status)
  if (param.branch && param.branch.length > 0)
    request.queryParams['branch_names'] = encodeArray(param.branch)
  if (param.purposeOfTrip && param.purposeOfTrip.length > 0)
    request.queryParams['purpose_of_trip'] = encodeArray(param.purposeOfTrip)

  if (param.costCentre && param.costCentre.length > 0)
    request.queryParams['cost_centre_names'] = encodeArray(param.costCentre)
  if (param.search) request.queryParams['search'] = param.search

  switch (param.bookingCategory) {
    case 'Today':
      const today = moment().format('YYYY-MM-DD')
      request.queryParams['start_datetime'] = today
      request.queryParams['end_datetime'] = today
      request.queryParams['exclude_status_names'] = encodeArray(['In-Progress'])
      break

    case 'Upcoming':
      const tomorrow = moment().add(1, 'd').format('YYYY-MM-DD')
      request.queryParams['start_datetime'] = tomorrow
      request.queryParams['exclude_status_names'] = encodeArray(['In-Progress'])
      break

    case 'Past':
      const yesterday = moment().subtract(1, 'd').format('YYYY-MM-DD')
      request.queryParams['end_datetime'] = yesterday
      request.queryParams['exclude_status_names'] = encodeArray(['In-Progress'])
      break

    case 'In-Progress':
      request.queryParams['status_names'] = encodeArray(['In-Progress'])
      break
  }

  request.headersExtra = {client: CLIENT_ID, organisation: param.organisationID}
  const response = await Networking.makeApiCall(request, BookingsResponse)

  return response.data as BookingsResponse
}

/**
 * Function to get bookings for calendar views
 * @returns BookingsResponse
 */
async function getCalendarBookings(param: {
  date: Date
  showWeekly: boolean
  search?: string
  organisationID: number
  bookingType?: string[]
  status?: string[]
  branch?: string[]
  purposeOfTrip?: string[]
  costCentre?: string[]
  branchID: number
  driverID: number
  viewAllBookings: boolean
  viewBranchBookings: boolean
}) {
  const endPoint = '/tfm/v1/bookings/'
  const request = new GNRequest(Method.GET, endPoint)
  request.queryParams = {page_size: 10000, ignore_serialize: true}
  if (!param.viewAllBookings) {
    request.queryParams['is_branch_bookings'] = true
    request.queryParams['driver_pks'] = `[${param.driverID}]`
    if (param.viewBranchBookings && param.branchID)
      request.queryParams['branch_pks'] = `[${param.branchID}]`
  }
  if (param.bookingType && param.bookingType.length > 0)
    request.queryParams['booking_type'] = encodeArray(param.bookingType)
  if (param.status && param.status.length > 0)
    request.queryParams['status_names'] = encodeArray(param.status)
  if (param.branch && param.branch.length > 0)
    request.queryParams['branch_names'] = encodeArray(param.branch)
  if (param.purposeOfTrip && param.purposeOfTrip.length > 0)
    request.queryParams['purpose_of_trip'] = encodeArray(param.purposeOfTrip)
  if (param.costCentre && param.costCentre.length > 0)
    request.queryParams['cost_centre_names'] = encodeArray(param.costCentre)
  if (param.search) request.queryParams['search'] = param.search

  if (param.showWeekly) {
    const weekStartDate = moment(param.date)
      .startOf('week')
      .format('YYYY-MM-DD')
    const weekEndDate = moment(param.date).endOf('week').format('YYYY-MM-DD')
    request.queryParams['start_datetime'] = weekStartDate
    request.queryParams['end_datetime'] = weekEndDate
  } else {
    const currentStartEnd = moment(param.date).format('YYYY-MM-DD')
    request.queryParams['start_datetime'] = currentStartEnd
    request.queryParams['end_datetime'] = currentStartEnd
  }

  request.headersExtra = {client: CLIENT_ID, organisation: param.organisationID}
  const response = await Networking.makeApiCall(request, BookingsResponse)

  return response.data as BookingsResponse
}

/**
 * Function to get a particular booking
 * @param ({driverID, bookingID})
 * @returns Booking
 */
async function getBookingWithID({
  driverID,
  bookingID,
  organisationID,
}: {
  driverID: number
  bookingID: number
  organisationID: number
}) {
  const endPoint = `/tfm/v1/bookings/${bookingID}/`
  const request = new GNRequest(Method.GET, endPoint)
  request.queryParams = {driver_pk: driverID, ignore_serialize: true}

  request.headersExtra = {client: CLIENT_ID, organisation: organisationID}
  const response = await Networking.makeApiCall(request, Booking)

  return response.data as Booking
}

/**
 * Function to get a particular content type
 *
 * @returns Booking
 */
async function getContentType() {
  const endPoint = '/granite/v1/content-types/'
  const request = new GNRequest(Method.GET, endPoint)

  const response = await Networking.makeApiCall(request, SettingsResponse)

  return (response.data as SettingsResponse).results
}

/**
 * Function to get the images assosiated with the vehicle
 *
 * @returns Booking
 * target_content_type_id: 65
: 501
 */
async function getVehicleImages(
  bookingID: number,
  contentType: number,
  organisationID: number,
) {
  const endPoint = '/granite/v1/document/'
  const request = new GNRequest(Method.GET, endPoint)
  request.queryParams = {
    target_content_type_id: contentType,
    target_object_id: bookingID,
  }
  request.headersExtra = {client: CLIENT_ID, organisation: organisationID}

  const response = await Networking.makeApiCall(request, SettingsResponse)
  return (response.data as SettingsResponse).results
}

/**
 * Function responsible for getting checklist
 * @param emitter Eventemitter
 * @param bookingStatus Booking Status
 */
async function getChecklist({
  bookingStatus,
  organisationID,
}: {
  bookingStatus: string
  organisationID: number
}) {
  const endPoint = '/organisations/v1/settings/'
  const request = new GNRequest(Method.GET, endPoint)
  request.headersExtra = {client: CLIENT_ID, organisation: organisationID}

  request.queryParams = {setting_key: 'Enable Checklists'}
  let response = await Networking.makeApiCall(request, SettingsResponse)

  const showChecklist =
    (response.data as SettingsResponse).results?.[0]?.value == 'true'

  if (showChecklist) {
    switch (bookingStatus) {
      case 'Approved':
        request.queryParams = {
          setting_key: 'Booking Check-out Checklist',
        }
        break
      case 'In-Progress':
        request.queryParams = {
          setting_key: 'Booking Check-in Checklist',
        }
        break
    }
    response = await Networking.makeApiCall(request, SettingsResponse)

    return (response.data as SettingsResponse).results?.[0]
  }
}

/**
 * Function to post the booking extend data
 * @param ({bookingID, startDate, endDate, organisationID})
 */
async function extendBooking({
  bookingID,
  startDate,
  endDate,
  organisationID,
}: {
  bookingID: number
  startDate: Date
  endDate: Date
  organisationID: number
}) {
  const endPoint = `/tfm/v1/bookings/${bookingID}/booking-extension/`
  const request = new GNRequest(Method.POST, endPoint)
  request.headersExtra = {client: CLIENT_ID, organisation: organisationID}

  request.body = {
    start_datetime: moment(startDate).format('YYYY-MM-DD h:mm A'),
    end_datetime: moment(endDate).format('YYYY-MM-DD h:mm A'),
  }

  const response = await Networking.makeApiCall(request)
  console.log(response.data)
}

/**
 * Function responsible for getting value for showing booking extension
 * @param organisationID organisationID
 */

async function loadBookingExtensions({
  organisationID,
}: {
  organisationID: number
}) {
  const endPoint = '/organisations/v1/settings/'
  const request = new GNRequest(Method.GET, endPoint)
  request.headersExtra = {client: CLIENT_ID, organisation: organisationID}

  request.queryParams = {setting_key: 'Allow Manual Booking Extension'}

  let response = await Networking.makeApiCall(request, SettingsResponse)

  return (response.data as SettingsResponse).results?.[0]?.value
}

/**
 * Function responsible for getting cost
 * @param emitter Eventemitter
 * @param ({vehicleID,startDate,endDate,distance,organisationID})
 */
async function getCostDetails({
  vehicleID,
  startDate,
  endDate,
  distance,
  organisationID,
}: {
  vehicleID: number
  startDate: Date
  endDate: Date
  distance: number
  organisationID: number
}) {
  const endPoint = '/tfm/v1/bookings/cost/'
  const request = new GNRequest(Method.GET, endPoint)
  request.headersExtra = {client: CLIENT_ID, organisation: organisationID}

  request.queryParams = {
    vehicle_pk: vehicleID,
    start_datetime: moment(startDate).format('YYYY-MM-DD h:mm A'),
    end_datetime: moment(endDate).format('YYYY-MM-DD h:mm A'),
    distance: distance,
  }
  const response = await Networking.makeApiCall(request, BookingCost)

  return response.data as BookingCost
}

/**
 * Function responsible for getting terms and conditions
 * @param emitter Eventemitter
 */
async function getTnc(organisationID: number) {
  const endPoint = '/organisations/v1/settings/'
  const request = new GNRequest(Method.GET, endPoint)
  request.headersExtra = {client: CLIENT_ID, organisation: organisationID}

  request.queryParams = {setting_key: 'Terms and Conditions'}
  const response = await Networking.makeApiCall(request, SettingsResponse)

  return (response.data as SettingsResponse).results?.[0]?.value
}

/**
 * Function responsible for posting checklist
 * @param emitter Eventemitter
 * @param ({bookingID, organisationID, checkListObj}) CheckList
 */
async function postCheckLists({
  bookingID,
  organisationID,
  checkListObj,
  isCheckOut,
}: {
  bookingID: number
  organisationID: number
  checkListObj: any
  isCheckOut: boolean
}) {
  const endPoint = `/tfm/v1/bookings/${bookingID}/checklist/`
  const request = new GNRequest(Method.POST, endPoint)
  ;(request.queryParams = {is_check_out: isCheckOut, checklist: checkListObj}),
    (request.headersExtra = {client: CLIENT_ID, organisation: organisationID})
  const response = await Networking.makeApiCall(request)

  return response.data
}

/**
 * Function to get vehicles list
 * @param param0 Object containing optional filters and required fields
 * @returns VehicleResponse
 */
async function getVehicles({
  organisationID,
  driverID,
  branchID,
  startDate,
  endDate,
  pageNumber,
  vehicleClass = [],
  bodyType = [],
  costCentre = [],
  fuelType = [],
  grade = [],
  seats = [],
  doors = [],
  year = [],
  odoReading = '',
  bookingID,
  ordering,
  isRecurring,
  endsOn,
  recurringPattern,
  daysOfWeek,
  datesOfMonth,
}: {
  organisationID: number
  driverID: number
  branchID: number
  startDate: Date
  endDate: Date
  pageNumber: number
  vehicleClass: string[]
  bodyType: string[]
  costCentre: string[]
  fuelType: string[]
  grade: string[]
  seats: string[]
  doors: string[]
  year: string[]
  odoReading: string
  bookingID?: number
  ordering?: string
  isRecurring?: boolean
  endsOn?: Date
  recurringPattern?: RecurringType
  daysOfWeek?: number[]
  datesOfMonth?: number[]
}) {
  const endPoint = `/tfm/v1/vehicle-search/`
  const request = new GNRequest(Method.GET, endPoint)
  request.queryParams = {
    driver_pk: driverID,
    branch_pk: branchID,
    start_datetime: moment(startDate).format('YYYY-MM-DD h:mm A'),

    end_datetime: moment(endDate).format('YYYY-MM-DD h:mm A'),
    vehicle_class: encodeArray(vehicleClass),
    body_type: encodeArray(bodyType),
    cost_centre_names: encodeArray(costCentre),
    fuel_type: encodeArray(fuelType),
    grade: encodeArray(grade),
    seats: encodeArray(seats),
    doors: encodeArray(doors),
    year: encodeArray(year),
    odometer_reading: odoReading,
    page: pageNumber,
    is_active: true,
  }

  if (bookingID) request.queryParams['booking_pk'] = bookingID
  if (ordering) request.queryParams['ordering'] = ordering

  request.headersExtra = {client: CLIENT_ID, organisation: organisationID}
  const response = await Networking.makeApiCall<VehicleResponse>(request)

  return response.data as VehicleResponse
}

/**
 * Function to get vehicle filters
 * @param organisationID Organisation ID
 * @returns Array of Objects
 */
async function getVehicleFilters(organisationID: number) {
  const commonHeader = {client: CLIENT_ID, organisation: organisationID}

  const costCentreEndPoint = `/tfm/v1/cost-centre/`
  const costCentreRequest = new GNRequest(Method.GET, costCentreEndPoint)
  costCentreRequest.queryParams = {page_size: 100, ordering: 'name'}
  costCentreRequest.headersExtra = commonHeader

  const configMasterEndPoint = `/granite/v1/config-master/`
  const requests = ['Fuel Type', 'Body Type', 'Vehicle Class', 'Grade'].map(
    searchValue => {
      const request = new GNRequest(Method.GET, configMasterEndPoint)
      request.headersExtra = commonHeader
      request.queryParams = {
        config_type: 'OPTIONS',
        search: searchValue,
        page_size: 100,
      }
      return request
    },
  )
  const response = await Promise.all([
    Networking.makeApiCall<CostCentreResponse>(costCentreRequest),
    ...requests.map(request =>
      Networking.makeApiCall<ConfigMasterResponse>(request),
    ),
  ])

  const costCentres = (response[0].data as CostCentreResponse).results?.map(
    data => data.name!!,
  )
  const fuelType = (response[1].data as ConfigMasterResponse).results?.[0]
    .possible_values
  const bodyType = (response[2].data as ConfigMasterResponse).results?.[0]
    .possible_values
  const vehicleClass = (response[3].data as ConfigMasterResponse).results?.[0]
    .possible_values
  const grade = (response[4].data as ConfigMasterResponse).results?.[0]
    .possible_values

  const result: {
    category: FILTERS
    values: string[]
    multiSelect: boolean
  }[] = []
  if (vehicleClass && vehicleClass.length > 0)
    result.push({
      category: FILTERS.VEHICLE_CLASS,
      values: vehicleClass,
      multiSelect: true,
    })
  if (bodyType && bodyType.length > 0)
    result.push({
      category: FILTERS.BODY_TYPE,
      values: bodyType,
      multiSelect: true,
    })
  if (fuelType && fuelType.length > 0)
    result.push({
      category: FILTERS.FUEL_TYPE,
      values: fuelType,
      multiSelect: true,
    })
  if (grade && grade.length > 0)
    result.push({
      category: FILTERS.GRADE,
      values: grade,
      multiSelect: true,
    })
  if (costCentres && costCentres.length > 0)
    result.push({
      category: FILTERS.COST_CENTRE,
      values: costCentres,
      multiSelect: true,
    })
  return result
}

/**
 * Function to get booking purpose, cost centres and booking types
 * @param organisationID Organisation ID
 * @returns List of costCentres, pots and bookingTypes
 */
async function getBookingPurpose(organisationID: number) {
  const commonHeader = {client: CLIENT_ID, organisation: organisationID}

  const costCentreEndPoint = `/tfm/v1/cost-centre/`
  const costCentreRequest = new GNRequest(Method.GET, costCentreEndPoint)
  costCentreRequest.queryParams = {page_size: 100, ordering: 'name'}

  costCentreRequest.headersExtra = commonHeader

  const purposeOfTripEndPoint = `/tfm/v1/purpose-of-trips/`
  const purposeOfTripRequest = new GNRequest(Method.GET, purposeOfTripEndPoint)
  purposeOfTripRequest.queryParams = {page_size: 100, ordering: 'name'}

  purposeOfTripRequest.headersExtra = commonHeader

  const bookingTypeEndPoint = `/granite/v1/config-master/`
  const bookingTypeRequest = new GNRequest(Method.GET, bookingTypeEndPoint)
  bookingTypeRequest.queryParams = {
    config_type: 'OPTIONS',
    keys: encodeArray(['Booking Type']),
  }

  bookingTypeRequest.headersExtra = commonHeader

  const settingsEndPoint = '/organisations/v1/settings/'
  const settingsRequest = [
    'Prevent bookings from being made without a Purpose of Trip?',
    'Cost Centre selection mandatory during the booking process?',
  ].map(key => {
    const request = new GNRequest(Method.GET, settingsEndPoint)
    request.headersExtra = commonHeader
    request.queryParams = {setting_key: key}
    return request
  })

  const response = await Promise.all([
    Networking.makeApiCall<CostCentreResponse>(costCentreRequest),
    Networking.makeApiCall<PurposeOfTripResponse>(purposeOfTripRequest),
    Networking.makeApiCall<ConfigMasterResponse>(bookingTypeRequest),
    ...settingsRequest.map(request =>
      Networking.makeApiCall<SettingsResponse>(request),
    ),
  ])

  const costCentres = (response[0].data as CostCentreResponse).results

  const pots = (response[1].data as PurposeOfTripResponse).results?.map(
    data => data.name!!,
  )
  console.log('The booking Type ----->')
  console.log(response[2])
  const bookingTypes = (response[2].data as ConfigMasterResponse).results?.[0]
    .possible_values

  const isPOTMandatory =
    (response[3].data as SettingsResponse).results?.[0].value === 'true'

  const isCostCentreMandatory =
    (response[4].data as SettingsResponse).results?.[0].value === 'true'

  return [
    {costCentres, isMandatory: isCostCentreMandatory},
    {pots, isMandatory: isPOTMandatory},
    {bookingTypes, isMandatory: true},
  ]
}

/**
 * Function used to create a booking
 * @param param0
 * @returns booking id
 */
async function createBooking({
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
}: {
  address?: Address
  bookingType?: string
  branchID: number
  costCentreID?: number
  costCentreName?: string
  datesOfMonth?: number[]
  daysOfWeek?: number[]
  driverID: number
  endDate: Date
  endOnDate?: Date
  isRecurring: boolean
  recurringPattern?: RecurringType
  startDate: Date
  vehicleID: number
  organisationID: number
  purposeOfTrip?: string
  bookingID?: number
  bookingTags: BookingTag[]
  estimatedCost: string
}) {
  let endPoint = `/tfm/v1/bookings/`
  if (bookingID) endPoint += `${bookingID}/`

  const request = new GNRequest(bookingID ? Method.PUT : Method.POST, endPoint)
  request.headersExtra = {client: CLIENT_ID, organisation: organisationID}

  let payload: any = {
    branch: {pk: branchID},
    driver: {pk: driverID},
    end_datetime: moment(endDate).format('YYYY-MM-DD h:mm A'),
    is_recurring: isRecurring,
    start_datetime: moment(startDate).format('YYYY-MM-DD h:mm A'),
    vehicle: {pk: vehicleID},
    booking_tags: bookingTags,
  }

  if (estimatedCost) {
    payload['extra_data'] = {estimated_cost: estimatedCost}
  }

  if (address) {
    payload['address'] = address.name ?? ''
    if (address.coords?.lat && address.coords.long)
      payload['location'] = {
        coordinates: [address.coords?.lat, address.coords?.long],
      }
    if (address.bounds)
      payload['address_features'] = {
        bounds: address.bounds,
      }
    if (address.landmark)
      payload['address_features'] = {
        ...payload['address_features'],
        landmark: address.landmark,
      }
  }
  if (isRecurring && !bookingID)
    payload['ends_on'] = moment(endOnDate).format('YYYY-MM-DD')
  if (bookingType) payload['booking_type'] = bookingType
  if (costCentreID && costCentreName)
    payload['cost_centre'] = {pk: costCentreID, name: costCentreName}
  if (purposeOfTrip) payload['purpose_of_trip'] = purposeOfTrip
  if (isRecurring) {
    payload['is_regular'] = true
    payload['recurring_pattern'] = recurringPattern?.toLocaleLowerCase()
  }
  if (recurringPattern === 'Monthly') payload['dates_of_month'] = datesOfMonth
  else if (recurringPattern === 'Weekly') payload['days_of_week'] = daysOfWeek

  request.body = payload

  const response = await Networking.makeApiCall<CreateBookingResponse>(request)

  return response.data as CreateBookingResponse
}

/**
 * Function used to check out a vehicle
 * @param organisationID Organisation ID
 * @param bookingID Booking ID
 * @param notes Notes
 * @param odoReading Odometer reading
 */
async function checkOut(
  organisationID: number,
  bookingID: number,
  checkListObj: any,
  notes?: string,
  odoReading?: number,
) {
  if (checkListObj)
    await postCheckLists({
      bookingID,
      organisationID,
      checkListObj,
      isCheckOut: true,
    })
  const endPoint = `/tfm/v1/bookings/${bookingID}/check-out/`
  const request = new GNRequest(Method.POST, endPoint)
  request.headersExtra = {client: CLIENT_ID, organisation: organisationID}

  if (odoReading) {
    console.log('odoReading given')
    request.body = {
      start_odometer_reading: odoReading,
      is_odometer_update: true,
      notes,
      pk: bookingID,
    }
  } else {
    console.log('odoreading not given')
    request.body = {notes, pk: bookingID}
  }

  const response = await Networking.makeApiCall(request)
  console.log(response.data)

  if (notes) await postNotes(organisationID, bookingID, `Pick Up: ${notes}`)
}

/**
 * Function used to check in a vehicle
 * @param organisationID Organisation ID
 * @param bookingID Booking ID
 * @param odoReading Odometer reading
 * @param notes Notes
 */
async function checkIn(
  organisationID: number,
  bookingID: number,
  checkListObj: any,
  isOdoUpdated: boolean,
  odoReading?: number,
  notes?: string,
) {
  if (checkListObj)
    await postCheckLists({
      bookingID,
      organisationID,
      checkListObj,
      isCheckOut: false,
    })
  const endPoint = `/tfm/v1/bookings/${bookingID}/check-in/`
  const request = new GNRequest(Method.POST, endPoint)
  request.headersExtra = {client: CLIENT_ID, organisation: organisationID}
  if (isOdoUpdated) {
    request.body = {
      end_odometer_reading: odoReading,
      is_odometer_update: true,
      notes,
      pk: bookingID,
    }
  } else {
    request.body = {
      end_odometer_reading: odoReading,
      notes,
      pk: bookingID,
    }
  }

  const response = await Networking.makeApiCall(request)

  if (notes) await postNotes(organisationID, bookingID, `Drop Off: ${notes}`)
}

/**
 * Function used internally to post check in, check out notes
 * @param organisationID Organisation ID
 * @param bookingID Booking ID
 * @param notes Notes
 */
async function postNotes(
  organisationID: number,
  bookingID: number,
  notes: string,
) {
  const endPoint = `/granite/v1/notes/`
  const request = new GNRequest(Method.POST, endPoint)
  request.headersExtra = {client: CLIENT_ID, organisation: organisationID}

  request.body = {
    note: notes,
    note_type: 'INFO',
    target_content_type_name: 'tfm_booking',
    target_object_id: bookingID,
  }

  await Networking.makeApiCall(request)
}

/**
 * Function used to get list of incidents for check-in screen
 * @param organisationID Organisation ID
 * @returns Incident[]
 */
async function getIncidentsList(organisationID: number) {
  const endPoint = `/tfm/v1/incident-type/`
  const request = new GNRequest(Method.GET, endPoint)
  request.queryParams = {page_size: 100}
  request.headersExtra = {client: CLIENT_ID, organisation: organisationID}

  const response = await Networking.makeApiCall<IncidentsResponse>(request)

  return (response.data as IncidentsResponse).results
}

/**
 * Function used to get booking trip details
 * @param organisationID Organisation ID
 * @param bookingID Booking ID
 * @returns BookingTrip[]
 */
async function getBookingTrip(organisationID: number, bookingID: number) {
  const endPoint = `/tfm/v1/booking-trips/`
  const request = new GNRequest(Method.GET, endPoint)
  request.queryParams = {booking_id: bookingID}
  request.headersExtra = {client: CLIENT_ID, organisation: organisationID}

  const response = await Networking.makeApiCall<BookingTripResponse>(request)

  return (response.data as BookingTripResponse).results
}

/**
 * Function used to log incident
 * @param param0
 */
async function logIncident({
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
}: {
  organisationID: number
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
}) {
  // First do check in
  await checkIn(
    organisationID,
    bookingID,
    checkListObj,
    isOdoUpdated,
    odoReading,
    notes,
  )

  const endPoint = `/tfm/v1/incidents/`
  const request = new GNRequest(Method.POST, endPoint)
  request.headersExtra = {client: CLIENT_ID, organisation: organisationID}

  request.body = {
    address: address.name,
    booking: {
      pk: bookingID,
    },
    booking_trip_details: {pk: bookingTripID},
    incident_type: {pk: incidentID},
    is_critical: isCritical,
    location: {coordinates: [address.coords?.lat, address.coords?.long]},
    reported_on: moment(reportedOn).format('YYYY-MM-DD h:mm A'),
    vehicle: {pk: vehicleID},
    incident_tags: incidentTags,
    address_features: {bounds: address.bounds},
  }
  if (address.landmark)
    request.body['address_features'] = {
      ...request.body['address_features'],
      landmark: address.landmark,
    }
  if (incidentSubType) request.body['incident_sub_type'] = incidentSubType

  const incidentResponse = await Networking.makeApiCall(request)

  const incidentPK = (incidentResponse.data as any).pk

  // Upload Images
  try {
    if (images)
      await Promise.all(
        images.map(image => uploadImage(organisationID, image, incidentPK)),
      )
  } catch (error) {
    console.log('Image upload error', error)
  } finally {
    Networking.configure(API_END_POINT)
  }
}

/**
 * Function used to upload images (Log Incident)
 * @param organisationID Organisation ID
 * @param image Image
 * @param incidentID Incident ID
 */
async function uploadImage(
  organisationID: number,
  image: ImageFile,
  incidentID: number,
) {
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
  const documentEndPoint = '/granite/v1/document/'
  const documentRequest = new GNRequest(Method.POST, documentEndPoint)
  documentRequest.headersExtra = {
    client: CLIENT_ID,
    organisation: organisationID,
  }
  documentRequest.body = {
    document: imagePathResponseData.fields?.key,
    document_name: image.name,
    target_content_type_id: INCIDENT_CONTENT_TYPE_ID,
    target_object_id: incidentID,
    target_content_type_name: 'tfm_incident',
  }
  const documentResponse = await Networking.makeApiCall(documentRequest)
}

/**
 * Function to delete a booking
 * @param organisationID Organisation ID
 * @param bookingID Booking ID
 */
async function deleteBooking(organisationID: number, bookingID: number) {
  const endPoint = `/tfm/v1/bookings/${bookingID}/`
  const request = new GNRequest(Method.DELETE, endPoint)
  request.headersExtra = {client: CLIENT_ID, organisation: organisationID}

  const response = await Networking.makeApiCall(request)
}

/**
 * Function to get booking filters
 * @param organisationID Organisation ID
 * @returns Booking Filters
 */
async function getBookingFilters(organisationID: number) {
  const commonHeader = {client: CLIENT_ID, organisation: organisationID}
  const branchResponse = await getBranches(organisationID)

  const statusEndPoint = `/granite/v1/status-master/`
  const statusRequest = new GNRequest(Method.GET, statusEndPoint)
  statusRequest.queryParams = {page_size: 500, entity_name: 'booking'}
  statusRequest.headersExtra = commonHeader

  const costCentreEndPoint = `/tfm/v1/cost-centre/`
  const costCentreRequest = new GNRequest(Method.GET, costCentreEndPoint)
  costCentreRequest.queryParams = {page_size: 100, ordering: 'name'}

  costCentreRequest.headersExtra = commonHeader

  const purposeOfTripEndPoint = `/tfm/v1/purpose-of-trips/`
  const purposeOfTripRequest = new GNRequest(Method.GET, purposeOfTripEndPoint)
  purposeOfTripRequest.queryParams = {page_size: 100, ordering: 'name'}
  purposeOfTripRequest.headersExtra = commonHeader

  const bookingTypeEndPoint = `/granite/v1/config-master/`
  const bookingTypeRequest = new GNRequest(Method.GET, bookingTypeEndPoint)
  bookingTypeRequest.queryParams = {
    config_type: 'OPTIONS',
    keys: encodeArray(['Booking Type']),
  }

  bookingTypeRequest.headersExtra = commonHeader

  const response = await Promise.all([
    Networking.makeApiCall<StatusResponse>(statusRequest),
    Networking.makeApiCall<CostCentreResponse>(costCentreRequest),
    Networking.makeApiCall<PurposeOfTripResponse>(purposeOfTripRequest),
    Networking.makeApiCall<ConfigMasterResponse>(bookingTypeRequest),
  ])

  const branches = branchResponse?.map(data => data.name!!)
  const statuses = (response[0].data as StatusResponse).results?.map(
    data => data.status_name!!,
  )
  const costCentres = (response[1].data as CostCentreResponse).results?.map(
    data => data.name!!,
  )
  const pots = (response[2].data as PurposeOfTripResponse).results?.map(
    data => data.name!!,
  )
  const bookingTypes = (response[3].data as ConfigMasterResponse).results?.[0]
    .possible_values

  const result: {
    category: FILTERS
    values: string[]
    multiSelect: boolean
  }[] = []

  if (branches && branches.length > 0)
    result.push({
      category: FILTERS.BRANCH,
      values: branches,
      multiSelect: true,
    })
  if (statuses && statuses.length > 0)
    result.push({
      category: FILTERS.STATUS,
      values: statuses,
      multiSelect: true,
    })
  if (costCentres && costCentres.length > 0)
    result.push({
      category: FILTERS.COST_CENTRE,
      values: costCentres,
      multiSelect: true,
    })
  if (pots && pots.length > 0)
    result.push({
      category: FILTERS.PURPOSE_OF_TRIP,
      values: pots,
      multiSelect: true,
    })
  if (bookingTypes && bookingTypes.length > 0)
    result.push({
      category: FILTERS.BOOKING_TYPE,
      values: bookingTypes,
      multiSelect: true,
    })

  return result
}

/**
 * Function to cancel a booking
 * @param organisationID Organisation ID
 * @param bookingID Booking ID
 */
async function cancelBooking(organisationID: number, bookingID: number) {
  const endPoint = `/tfm/v1/bookings/${bookingID}/cancel/`
  const request = new GNRequest(Method.POST, endPoint)
  request.headersExtra = {client: CLIENT_ID, organisation: organisationID}

  request.body = {pk: bookingID}

  const response = await Networking.makeApiCall(request)
}

/**
 * Function to get list of drivers
 * @param param0
 * @returns List of drivers
 */
async function getDrivers({
  organisationID,
  bookingID,
}: {
  organisationID: number
  bookingID?: number
}) {
  const endPoint = `/tfm/v1/drivers/`
  const request = new GNRequest(Method.GET, endPoint)
  request.headersExtra = {client: CLIENT_ID, organisation: organisationID}
  request.queryParams = {page_size: 100, ordering: 'name'}

  if (bookingID) request.queryParams['exclude_booking_pk'] = bookingID

  const response = await Networking.makeApiCall<DriverResponse>(request)

  return (response.data as DriverResponse).results
}

async function allowBookingWithExpiredLicense(organisationID: number) {
  const endPoint = '/organisations/v1/settings/'
  const request = new GNRequest(Method.GET, endPoint)
  request.headersExtra = {client: CLIENT_ID, organisation: organisationID}
  request.queryParams = {
    setting_key: `Prevent user from making a booking with an expired driver's license?`,
  }

  const response = await Networking.makeApiCall<SettingsResponse>(request)
  return (response.data as SettingsResponse).results?.[0]?.value == 'true'
}

/**
 * Function to verify driver for booking
 * @param param0
 * @returns
 */
async function verifyDriver({
  organisationID,
  startDate,
  endDate,
  driverPK,
}: {
  organisationID: number
  startDate: Date
  endDate: Date
  driverPK: number
}) {
  const endPoint = `/tfm/v1/bookings/`
  const request = new GNRequest(Method.GET, endPoint)
  request.headersExtra = {client: CLIENT_ID, organisation: organisationID}
  request.queryParams = {
    is_active: true,

    filter_start_datetime: moment(startDate).format('YYYY-MM-DD h:mm A'),
    filter_end_datetime: moment(endDate).format('YYYY-MM-DD h:mm A'),
    driver_pks: driverPK,
    status_names: encodeArray(['In-Progress', 'Approved']),
    ignore_serialize: true,
  }

  const response = await Networking.makeApiCall<BookingsResponse>(request)

  return (response.data as BookingsResponse).results
}

/**
 * Function to get booking tags
 * @param organisationID Org ID
 * @returns Booking Tags
 */
async function getBookingTags(organisationID: number) {
  const endPoint = `/tfm/v1/tags/`
  const request = new GNRequest(Method.GET, endPoint)
  request.queryParams = {page_size: 100, tag_type: 'Booking'}

  request.headersExtra = {client: CLIENT_ID, organisation: organisationID}
  const response = await Networking.makeApiCall<TagResponse>(request)

  return (response.data as TagResponse).results
}

/**
 * Function to get incident tags
 * @param organisationID Org ID
 * @returns Incident Tags
 */
async function getIncidentTags(organisationID: number) {
  const endPoint = `/tfm/v1/tags/`
  const request = new GNRequest(Method.GET, endPoint)
  request.queryParams = {page_size: 100, tag_type: 'Incident'}

  request.headersExtra = {client: CLIENT_ID, organisation: organisationID}
  const response = await Networking.makeApiCall<TagResponse>(request)

  return (response.data as TagResponse).results
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
  getIncidentsList,
  getBookingTrip,
  logIncident,
  deleteBooking,
  getBookingFilters,
  cancelBooking,
  getDrivers,
  getBookingTags,
  getIncidentTags,
  verifyDriver,
  getChecklist,
  postCheckLists,
  getCostDetails,
  getTnc,
  loadBookingExtensions,
  extendBooking,
  getContentType,
  getVehicleImages,
  allowBookingWithExpiredLicense,
}
