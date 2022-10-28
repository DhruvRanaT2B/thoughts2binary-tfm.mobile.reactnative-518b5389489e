import {Networking, Method, GNRequest} from '@react-native-granite/core'
// @ts-ignore
import {CLIENT_ID, INCIDENT_CONTENT_TYPE_ID} from '@env'
import {
  DocumentResponse,
  Incident,
  IncidentResponse,
  IncidentTypeResponse,
  VehicleListResponse,
  NotesResponse,
} from './entity'
import {FILTERS} from '@constants'
import {encodeArray} from '@utility'

async function getIncidents({
  pageNumber,
  search,
  organisationID,
  status,
  incidentType,
  incidentSubType,
  isCritical,
  isVerified,
  vehicleName,
  employeeId,
}: {
  pageNumber: number
  search?: string
  organisationID: number
  status: string
  incidentType?: string[]
  incidentSubType?: string[]
  isCritical?: string
  isVerified?: string
  vehicleName?: string[]
  employeeId?: string
}) {
  console.info('EMPLOYEE ID ----------------------->', employeeId)
  const endPoint = '/tfm/v1/incidents/'
  const request = new GNRequest(Method.GET, endPoint)
  if (employeeId)
    request.queryParams = {
      page: pageNumber,
      ignore_serialize: true,
      reported_by_id: employeeId,
    }
  else {
    request.queryParams = {page: pageNumber, ignore_serialize: true}
  }
  if (status.includes('!'))
    request.queryParams['exclude_status_name'] = status.replace('!', '')
  else request.queryParams['status_names'] = encodeArray([status])

  if (search) request.queryParams['search'] = search
  if (incidentType && incidentType.length > 0)
    request.queryParams['incident_type_names'] = encodeArray(incidentType)
  if (incidentSubType && incidentSubType.length > 0)
    request.queryParams['incident_sub_type'] = encodeArray(incidentSubType)
  if (isCritical) request.queryParams['is_critical'] = isCritical === 'Yes'
  if (isVerified) request.queryParams['is_verified'] = isVerified === 'Yes'
  if (vehicleName && vehicleName.length > 0)
    request.queryParams['vehicle_names'] = encodeArray(vehicleName)

  request.headersExtra = {client: CLIENT_ID, organisation: organisationID}
  const response = await Networking.makeApiCall<IncidentResponse>(request)

  return response.data as IncidentResponse
}

async function getIncidentFilters(organisationID: number) {
  const commonHeader = {client: CLIENT_ID, organisation: organisationID}

  const vehicleEndPoint = '/tfm/v1/vehicles/list/'
  const vehicleRequest = new GNRequest(Method.GET, vehicleEndPoint)
  vehicleRequest.queryParams = {
    page_size: 500,
    ordering: 'name',
    is_active: true,
  }
  vehicleRequest.headersExtra = commonHeader

  const incidentTypeEndPoint = '/tfm/v1/incident-type/'
  const incidentTypeRequest = new GNRequest(Method.GET, incidentTypeEndPoint)
  incidentTypeRequest.headersExtra = commonHeader

  const response = await Promise.all([
    Networking.makeApiCall<VehicleListResponse>(vehicleRequest),
    Networking.makeApiCall<IncidentTypeResponse>(incidentTypeRequest),
  ])

  const set = new Set<string>()
  ;(response[0].data as VehicleListResponse).results?.forEach(data =>
    set.add(data.name!!),
  )
  const vehicleArray: string[] = []
  set.forEach(vehicle => vehicleArray.push(vehicle))
  set.clear()

  const incidentTypeArray: string[] = []
  ;(response[1].data as IncidentTypeResponse).results?.forEach(data =>
    set.add(data.name!!),
  )
  set.forEach(type => incidentTypeArray.push(type))
  incidentTypeArray.sort()
  set.clear()

  const subTypes: string[] = []
  ;(response[1].data as IncidentTypeResponse).results?.forEach(item =>
    item.incident_sub_type?.forEach(type => set.add(type)),
  )
  set.forEach(type => subTypes.push(type))
  subTypes.sort()
  set.clear()

  const result: {
    category: FILTERS
    values: string[]
    multiSelect: boolean
  }[] = []

  if (vehicleArray && vehicleArray.length > 0) {
    result.push({
      category: FILTERS.VEHICLE_NAME,
      values: vehicleArray,
      multiSelect: true,
    })
  }
  if (incidentTypeArray && incidentTypeArray.length > 0) {
    result.push({
      category: FILTERS.INCIDENT_TYPE,
      values: incidentTypeArray,
      multiSelect: true,
    })
  }
  if (subTypes && subTypes.length > 0) {
    result.push({
      category: FILTERS.INCIDENT_SUB_TYPE,
      values: subTypes,
      multiSelect: true,
    })
  }
  return result
}

async function getIncident({
  incidentID,
  organisationID,
}: {
  incidentID: number
  organisationID: number
}) {
  const commonHeader = {client: CLIENT_ID, organisation: organisationID}

  const endPoint = `/tfm/v1/incidents/${incidentID}/`
  const request = new GNRequest(Method.GET, endPoint)
  request.queryParams = {ignore_serialize: true}

  request.headersExtra = commonHeader

  const imagesEndPoint = '/granite/v1/document/'
  const imageRequest = new GNRequest(Method.GET, imagesEndPoint)
  imageRequest.queryParams = {
    target_content_type_id: INCIDENT_CONTENT_TYPE_ID,
    target_object_id: incidentID,
  }

  imageRequest.headersExtra = commonHeader

  const response = await Promise.all([
    Networking.makeApiCall<Incident>(request),
    Networking.makeApiCall<DocumentResponse>(imageRequest),
  ])

  return {
    incident: response[0].data as Incident,
    images: (response[1].data as DocumentResponse).results,
  }
}

async function addNote({
  note,
  noteType,
  incidentID,
  organisationID,
}: {
  note: string
  noteType: string
  incidentID: number
  organisationID: number
}) {
  const endPoint = `/granite/v1/notes/`
  const request = new GNRequest(Method.POST, endPoint)
  request.headersExtra = {client: CLIENT_ID, organisation: organisationID}
  request.body = {
    note,
    note_type: noteType.toUpperCase(),
    target_content_type_name: 'tfm_incident',
    target_object_id: incidentID,
  }

  const response = await Networking.makeApiCall(request)
}

async function getNotes({
  pageNumber,
  organisationID,
  incidentID,
}: {
  pageNumber: number
  organisationID: number
  incidentID: number
}) {
  const endPoint = '/granite/v1/notes/'
  const request = new GNRequest(Method.GET, endPoint)
  request.queryParams = {
    page: pageNumber,
    ignore_serialize: true,
    target_content_type_name: 'tfm_incident',
    target_object_id: incidentID,
  }

  request.headersExtra = {client: CLIENT_ID, organisation: organisationID}
  const response = await Networking.makeApiCall<NotesResponse>(request)

  return response.data as NotesResponse
}

export {getIncidents, getIncidentFilters, getIncident, addNote, getNotes}
