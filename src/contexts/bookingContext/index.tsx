import React, {createContext, useState, useCallback} from 'react'
import {LocalStorage} from '@react-native-granite/core'
import {FILTERS, LOCAL_STORAGE} from '@constants'
import {Setting} from 'bookings/entity'

export const BookingContext = createContext({
  searchText: '',
  setSearchText: (text: string) => {},
  bookingFilters: [{category: FILTERS.SEATS, values: [''], multiSelect: false}],
  setBookingFilters: (
    filters: {category: FILTERS; values: string[]; multiSelect: boolean}[],
  ) => {},
  activeFilters: [{category: '', selectedValues: ['']}],
  setActiveFilters: (
    filters: {category: string; selectedValues: string[]}[],
  ) => {},
  todayBooking: 0,
  setTodayBooking: (num: number) => {},
  upcomingBooking: 0,
  setUpcomingBooking: (num: number) => {},
  pastBooking: 0,
  setPastBooking: (num: number) => {},
  setInProgressBooking: (num: number) => {},
  inProgressBooking: 0,
  permissions: {
    createForOthers: false,
    write: false,
    delete: false,
    cancel: false,
    checkOut: false,
    checkIn: false,
  },
  updatePermissions: async () => {},
  vehicleImages: undefined,
  setVehicleImages: (images: string[] | undefined) => {},
})

export const BookingContextProvider: React.FC = ({children}) => {
  const [text, setText] = useState('')
  const [filters, setFilters] = useState<
    {category: FILTERS; values: string[]; multiSelect: boolean}[]
  >([])
  const [selectedFilters, setSelectedFilters] = useState<
    {category: string; selectedValues: string[]}[]
  >([])
  const [todayBookingNumber, setTodayBookingNumber] = useState(0)
  const [upcomingBookingNumber, setUpcomingBookingNumber] = useState(0)
  const [pastBookingNumber, setPastBookingNumber] = useState(0)
  const [inProgressBookingNumber, setInProgressBookingNumber] = useState(0)
  const [permissions, setPermissions] = useState({
    createForOthers: false,
    write: false,
    delete: false,
    cancel: false,
    checkOut: false,
    checkIn: false,
  })
  const [images, setImages] = useState()

  const changeText = useCallback((text: string) => {
    setText(text)
  }, [])

  const changeTodayBookingNumber = useCallback((n: number) => {
    setTodayBookingNumber(n)
  }, [])

  const changeUpcomingBookingNumber = useCallback((n: number) => {
    setUpcomingBookingNumber(n)
  }, [])

  const changePastBookingNumber = useCallback((n: number) => {
    setPastBookingNumber(n)
  }, [])

  const changeInProgressBookingNumber = useCallback((n: number) => {
    setInProgressBookingNumber(n)
  }, [])

  const updatePermissions = useCallback(async () => {
    const createBookingForOthers = await LocalStorage.get(
      LOCAL_STORAGE.CREATE_BOOKING_FOR_OTHERS,
    )
    const bookingWrite = await LocalStorage.get(LOCAL_STORAGE.BOOKING_WRITE)
    const bookingDelete = await LocalStorage.get(LOCAL_STORAGE.BOOKING_DELETE)
    const bookingCancel = await LocalStorage.get(LOCAL_STORAGE.BOOKING_CANCEL)
    const vehicleCheckOut = await LocalStorage.get(
      LOCAL_STORAGE.VEHICLE_CHECK_OUT,
    )
    const vehicleCheckIn = await LocalStorage.get(
      LOCAL_STORAGE.VEHICLE_CHECK_IN,
    )

    const obj = {
      createForOthers: JSON.parse(createBookingForOthers),
      write: JSON.parse(bookingWrite),
      delete: JSON.parse(bookingDelete),
      cancel: JSON.parse(bookingCancel),
      checkOut: JSON.parse(vehicleCheckOut),
      checkIn: JSON.parse(vehicleCheckIn),
    }
    setPermissions(obj)
  }, [])
  const changeImages = useCallback(data => {
    setImages(data)
  }, [])

  return (
    <BookingContext.Provider
      value={{
        searchText: text,
        setSearchText: changeText,
        bookingFilters: filters,
        setBookingFilters: setFilters,
        activeFilters: selectedFilters,
        setActiveFilters: setSelectedFilters,
        todayBooking: todayBookingNumber,
        setTodayBooking: changeTodayBookingNumber,
        upcomingBooking: upcomingBookingNumber,
        setUpcomingBooking: changeUpcomingBookingNumber,
        pastBooking: pastBookingNumber,
        setPastBooking: changePastBookingNumber,
        permissions,
        setInProgressBooking: changeInProgressBookingNumber,
        inProgressBooking: inProgressBookingNumber,
        updatePermissions,
        vehicleImages: images,
        setVehicleImages: changeImages,
      }}>
      {children}
    </BookingContext.Provider>
  )
}
