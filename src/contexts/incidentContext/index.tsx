import React, {createContext, useState, useCallback} from 'react'
import {FILTERS} from '@constants'

export const IncidentContext = createContext({
  searchText: '',
  setSearchText: (text: string) => {},
  incidentFilters: [
    {category: FILTERS.IS_CRITICAL, values: [''], multiSelect: false},
  ],
  setIncidentFilters: (
    filters: {category: FILTERS; values: string[]; multiSelect: boolean}[],
  ) => {},
  activeFilters: [{category: '', selectedValues: ['']}],
  setActiveFilters: (
    filters: {category: string; selectedValues: string[]}[],
  ) => {},
  openIncident: 0,
  setOpenIncident: (num: number) => {},
  historicalIncident: 0,
  setHistoricalIncident: (num: number) => {},
})

export const IncidentContextProvider: React.FC = ({children}) => {
  const [text, setText] = useState('')
  const [filters, setFilters] = useState<
    {category: FILTERS; values: string[]; multiSelect: boolean}[]
  >([])
  const [selectedFilters, setSelectedFilters] = useState<
    {category: string; selectedValues: string[]}[]
  >([])
  const [openIncidentNumber, setOpenIncidentNumber] = useState(0)
  const [historicalIncidentNumber, setHistoricalIncidentNumber] = useState(0)

  const changeText = useCallback((text: string) => {
    setText(text)
  }, [])

  const changeOpenIncidentNumber = useCallback((n: number) => {
    setOpenIncidentNumber(n)
  }, [])

  const changeHistoricalIncidentNumber = useCallback((n: number) => {
    setHistoricalIncidentNumber(n)
  }, [])

  return (
    <IncidentContext.Provider
      value={{
        searchText: text,
        setSearchText: changeText,
        incidentFilters: filters,
        setIncidentFilters: setFilters,
        activeFilters: selectedFilters,
        setActiveFilters: setSelectedFilters,
        openIncident: openIncidentNumber,
        setOpenIncident: changeOpenIncidentNumber,
        historicalIncident: historicalIncidentNumber,
        setHistoricalIncident: changeHistoricalIncidentNumber,
      }}>
      {children}
    </IncidentContext.Provider>
  )
}
