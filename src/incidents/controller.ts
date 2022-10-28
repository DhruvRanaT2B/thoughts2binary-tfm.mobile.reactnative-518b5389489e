import {EventEmitter, LocalStorage} from '@react-native-granite/core'
import {INCIDENT_EVENTS} from './events'
import * as API_GATEWAY from './apiGateway'
import {Incident, Note} from './entity'
import {LOCAL_STORAGE, FILTERS} from '@constants'
import {useContext} from 'react'
import {AuthContext} from '@contexts'

const getIncidents = async (
  emitter: EventEmitter,
  {
    pageNumber,
    currentList,
    search,
    incidentStatus,
    incidentType,
    incidentSubType,
    isCritical,
    isVerified,
    vehicleName,
    employeeId,
  }: {
    pageNumber: number
    currentList: Incident[]
    search?: string
    incidentStatus: string
    incidentType?: string[]
    incidentSubType?: string[]
    isCritical?: string
    isVerified?: string
    vehicleName?: string[]
    employeeId?: string
  },
) => {
  try {
    emitter.emit(INCIDENT_EVENTS.LOAD_INCIDENT_LIST_START)
    const organisationID = Number(
      await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID),
    )
    const response = await API_GATEWAY.getIncidents({
      pageNumber,
      organisationID,
      status: incidentStatus,
      search,
      incidentType,
      incidentSubType,
      isCritical,
      isVerified,
      vehicleName,
      employeeId,
    })

    let list = []
    if (pageNumber > 1)
      list = [...currentList, ...(response.results as Incident[])]
    else list = response.results as Incident[]

    emitter.emit(INCIDENT_EVENTS.LOAD_INCIDENT_LIST_SUCCESS, {
      list,
      nextPage: response.next_page,
      count: response.count,
    })
  } catch (error) {
    console.log(error)
    emitter.emit(INCIDENT_EVENTS.LOAD_INCIDENT_LIST_FAILURE)
  }
}

const getIncidentFilters = async (emitter: EventEmitter) => {
  try {
    emitter.emit(INCIDENT_EVENTS.LOAD_INCIDENT_FILTERS_START)
    const organisationID = Number(
      await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID),
    )
    const filters = await API_GATEWAY.getIncidentFilters(organisationID)
    filters.push(
      {
        category: FILTERS.IS_CRITICAL,
        values: ['Yes', 'No'],
        multiSelect: false,
      },
      {
        category: FILTERS.IS_VERIFIED,
        values: ['Yes', 'No'],
        multiSelect: false,
      },
    )

    emitter.emit(INCIDENT_EVENTS.LOAD_INCIDENT_FILTERS_SUCCESS, filters)
  } catch (error) {
    console.log(error)
    emitter.emit(INCIDENT_EVENTS.LOAD_INCIDENT_FILTERS_FAILURE)
  }
}

const getIncident = async (
  emitter: EventEmitter,
  {incidentID}: {incidentID: number},
) => {
  try {
    emitter.emit(INCIDENT_EVENTS.LOAD_INCIDENT_START)
    const organisationID = Number(
      await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID),
    )
    const response = await API_GATEWAY.getIncident({organisationID, incidentID})
    emitter.emit(INCIDENT_EVENTS.LOAD_INCIDENT_SUCCESS, response)
  } catch (error) {
    console.log(error)
    emitter.emit(
      INCIDENT_EVENTS.LOAD_INCIDENT_FAILURE,
      error?.response?.data?.title,
    )
  }
}

const addNote = async (
  emitter: EventEmitter,
  {
    incidentID,
    note,
    noteType,
  }: {incidentID: number; note: string; noteType: string},
) => {
  try {
    emitter.emit(INCIDENT_EVENTS.POST_NOTE_START)
    const organisationID = Number(
      await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID),
    )
    await API_GATEWAY.addNote({note, noteType, incidentID, organisationID})
    emitter.emit(INCIDENT_EVENTS.POST_NOTE_SUCCESS)
  } catch (error) {
    console.log(error)
    emitter.emit(
      INCIDENT_EVENTS.POST_NOTE_FAILURE,
      error?.response?.data?.title,
    )
  }
}

const getNotes = async (
  emitter: EventEmitter,
  {
    pageNumber,
    currentList,
    incidentID,
  }: {
    pageNumber: number
    currentList: Note[]
    incidentID: number
  },
) => {
  try {
    emitter.emit(INCIDENT_EVENTS.LOAD_NOTES_START)
    const organisationID = Number(
      await LocalStorage.get(LOCAL_STORAGE.ORGANISATION_ID),
    )
    const response = await API_GATEWAY.getNotes({
      pageNumber,
      organisationID,
      incidentID,
    })

    let list = []
    if (pageNumber > 1) list = [...currentList, ...(response.results as Note[])]
    else list = response.results as Note[]

    emitter.emit(INCIDENT_EVENTS.LOAD_NOTES_SUCCESS, {
      list,
      nextPage: response.next_page,
    })
  } catch (error) {
    console.log(error)
    emitter.emit(
      INCIDENT_EVENTS.LOAD_NOTES_FAILURE,
      error?.response?.data?.title,
    )
  }
}

export {getIncidents, getIncidentFilters, getIncident, addNote, getNotes}
