import React, {useState, useEffect, useCallback, useContext} from 'react'
import {StyleSheet, ScrollView, Alert, Dimensions, View} from 'react-native'
import {
  Layout,
  Select,
  IndexPath,
  SelectItem,
  Input,
  Radio,
  RadioGroup,
  Text,
  Button,
  Spinner,
  Modal,
  Divider,
  useTheme,
  Datepicker,
} from '@ui-kitten/components'
import _ from 'lodash'
import {SafeAreaView, Tags, GoogleAutoComplete, CustomInput} from '@components'
import DateTime from './components/DateTime'
import MapView, {Marker} from 'react-native-maps'
import moment from 'moment'
import {EventEmitter} from '@react-native-granite/core'
import {AUTH_EVENTS, controller, entity} from '@accounts'
import {controller as bookingController} from '@bookings'
import {
  BOOKING_EVENTS,
  controller as BookingsController,
  entity as BookingsEntity,
} from '@bookings'

import STRINGS from './strings'
import {Address, BookingsScreenProps, RecurringType} from 'types'
import {
  generateTimeArray,
  timeConvert,
  getLocation,
  hasLocationPermission,
  requestLocationPermission,
} from '@utility'
import {GeoCoordinates} from 'react-native-geolocation-service'
import {AuthContext, BookingContext} from '@contexts'
import {color} from 'react-native-reanimated'
import {BusinessDays, Holiday, Setting, Timings} from 'accounts/entity'
import {DAYS_LIST} from '@constants'
import {DayView} from 'ui/screens/components/EventCalendar/DayView'

// Global constants
const eventEmitter = new EventEmitter()
const recurringTypes: {key: RecurringType; value: string}[] = [
  {key: 'Daily', value: STRINGS.RECURRING_TYPE_DAILY},
  {key: 'Weekly', value: STRINGS.RECURRING_TYPE_WEEKLY},
  {key: 'Monthly', value: STRINGS.RECURRING_TYPE_MONTHLY},
]
const datesOfMonth = STRINGS.DATES
const daysOfWeek = [
  STRINGS.MONDAY,
  STRINGS.TUESDAY,
  STRINGS.WEDNESDAY,
  STRINGS.THURSDAY,
  STRINGS.FRIDAY,
  STRINGS.SATURDAY,
  STRINGS.SUNDAY,
]

const AddNewBooking: React.FC<BookingsScreenProps<'AddNewBooking'>> = ({
  navigation,
  route,
}) => {
  const {licenseStatus} = useContext(AuthContext)
  const theme = useTheme()
  const {permissions} = useContext(BookingContext)

  const booking = route.params?.booking
  const [branches, setBranches] = useState<entity.Branch[]>([])
  const [selectedBranch, setSelectedBranch] = useState<IndexPath>()

  const [selectedRecurringType, setSelectedRecurringType] =
    useState<IndexPath>()
  const [radioIndex, setRadioIndex] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [permissionMessage, setPermissionMessage] = useState('')
  const [position, setPosition] = useState<GeoCoordinates>()
  const [inAppRequest, setInAppRequest] = useState(true)
  const [isRecuringDisabale, setIsRecuringDisabale] = useState(false)

  // const [startDate, setStartDate] = useState(
  //   moment(route.params?.booking?.start_datetime?.original).toDate(),
  // )
  // const [endDate, setEndDate] = useState(
  //   moment(route.params?.booking?.end_datetime?.original).toDate(),
  // )
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())

  const [endOnDate, setEndOnDate] = useState(new Date())
  const [now, setNow] = useState(new Date())
  const [date, setDate] = useState(new Date())
  const [bookingStartDate, setBookingStartDate] = useState(new Date())
  const [bookingEndDate, setBookingEndDate] = useState(new Date())
  const [selectedIndex, setSelectedIndex] = useState<IndexPath>()
  const [selectedEndTimeIndex, setSelectedEndTimeIndex] = useState<IndexPath>()
  const [holidayList, setHolidayList] = useState<Holiday[]>()
  const [holidaySettings, setHolidaySettings] = useState<Setting[]>([])
  const [workingDays, setWorkingDays] = useState<string[]>([])
  const [allowExpiredBookings, setallowExpiredBookings] = useState(false)

  const useDatepickerState = (initialDate = null) => {
    const [date, setDate] = React.useState(initialDate)
    return {date, onSelect: setDate}
  }
  const filterPickerState = useDatepickerState()

  let timeArray: string[] = generateTimeArray(15)

  const getDayName = (dayNum: number) => {
    switch (dayNum) {
      case 0:
        return 'Sunday'
      case 1:
        return 'Monday'
      case 2:
        return 'Tuesday'
      case 3:
        return 'Wednesday'
      case 4:
        return 'Thursday'
      case 5:
        return 'Friday'
      case 6:
        return 'Saturday'
      default:
        return 'Monday'
    }
  }
  const filter = (date: Date) => {
    let dayNumber = date.getDay()
    let isHoliday: boolean = false
    let isWeekend: boolean = date.getDay() == 0 || date.getDay() == 6
    if (holidaySettings[2].value === 'true') {
      let selDate = moment(date).format('DD/MM/YYYY')
      if (holidayList)
        holidayList?.map(item => {
          let temp = moment(item?.date?.formated).format('MM/DD/YYYY')
          if (selDate == temp) {
            isHoliday = true
          }
        })
    }
    return (
      workingDays.includes(DAYS_LIST[dayNumber]) &&
      !isHoliday &&
      (holidaySettings[1].value === 'true' ? !isWeekend : true)
    )
  }
  const formatAMPM = (date: Date) => {
    var hours: any = date.getHours()
    var minutes: any = date.getMinutes()
    var ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    hours = hours < 10 ? '0' + hours : hours
    // hours = hours ? hours : 12 // the hour '0' should be '12'
    if (hours == '00') {
      hours = '12'
    }
    minutes = minutes < 10 ? '0' + minutes : minutes
    if (minutes <= 15) {
      minutes = '00'
    } else if (minutes >= 15 && minutes <= 30) {
      minutes = '15'
    } else if (minutes >= 30 && minutes <= 45) {
      minutes = '30'
    } else {
      minutes = '45'
    }
    var strTime = hours + ':' + minutes + ' ' + ampm
    return strTime
  }
  const [currentTime, setCurrentTime] = React.useState('')
  const [currentTimeIndex, setCurrentTimeIndex] = React.useState(-1)
  const [currentDate, setCurrentDate] = React.useState(new Date())
  useEffect(() => {
    setCurrentTime(formatAMPM(new Date()))
    setCurrentTimeIndex(generateTimeArray(15).indexOf(currentTime))
  }, [currentTime, currentTimeIndex, currentDate])

  const filterTime = (time: string, start: boolean, makeDisable: boolean) => {
    // const currentTime = formatAMPM(new Date())
    if (makeDisable === true) {
      return true
    }
    if (holidaySettings.length > 0) {
      if (holidaySettings[3].value === 'true') {
        return false
      } else if (holidaySettings[4].value) {
        const allowedPk: string[] | undefined =
          holidaySettings[4].value?.split(',')
        allowedPk?.map(item => {
          if (
            selectedBranch?.row !== undefined
              ? branches[selectedBranch?.row as number]
              : 'x' == item
          ) {
            return false
          }
        })
      } else {
        if (selectedBranch?.row) {
          if (start) {
            let timeRage =
              branches[selectedBranch?.row as number].business_hours?.days?.[
                getDayName(bookingStartDate.getDay())
              ]
            let startTiming = moment(timeRage?.from_time as string, 'HH:mm a')
            let endTiming = moment(timeRage?.to_time as string, 'HH:mm a')
            let curTime = moment(time as string, 'HH:mm a')
            return !(curTime >= startTiming && curTime <= endTiming)
          } else {
            let timeRage =
              branches[selectedBranch?.row as number].business_hours?.days?.[
                getDayName(bookingEndDate.getDay())
              ]
            let startTiming = moment(timeRage?.from_time as string, 'HH:mm a')
            let endTiming = moment(timeRage?.to_time as string, 'HH:mm a')
            let curTime = moment(time as string, 'HH:mm a')
            return !(curTime >= startTiming && curTime <= endTiming)
          }
        }
      }
    }
  }

  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = React.useState<
    IndexPath[]
  >([])
  const [selectedDatesOfMonth, setSelectedDatesOfMonth] = React.useState<
    IndexPath[]
  >([])

  const [driverList, setDriverList] = useState<{name: string; pk: number}[]>([])
  const [selectedDriver, setSelectedDriver] = useState<IndexPath>()
  const [loadingDrivers, setLoadingDrivers] = useState(false)
  const [address, setAddress] = useState<Address>()
  const [isVerifingDriver, setIsVerifingDriver] = useState(false)
  const [navigate, setNavigate] = useState(false)
  const [driverBookings, setDriverBookings] = useState<
    BookingsEntity.Booking[]
  >([])
  const [driverError, setDriverError] = useState(false)

  const renderOption = (title: any, key: string) => (
    <SelectItem title={title} key={key} />
  )

  const returnWithPrompt = useCallback(
    (message: string, title: string = '') => {
      Alert.alert(
        title,
        message,
        [{text: STRINGS.BUTTON_OKAY, onPress: navigation.goBack}],
        {cancelable: false},
      )
    },
    [navigation],
  )

  useEffect(() => {
    // checkLocation()

    // Initialise Start and End date
    const minutesToAdd = 5 - (moment().minutes() % 5)
    const startTime = moment().add(minutesToAdd, 'minutes').toDate()
    const endTime = moment(startTime).add(1, 'hours').toDate()
    const dateToAdd = moment(startDate).add(1, 'day').toDate()
    const timeArr = generateTimeArray(15)
    setStartDate(startTime)
    setEndDate(endTime)
    setNow(startTime)
    setEndOnDate(dateToAdd)
  }, [])

  const getTagTitles: any = useCallback(() => {
    if (selectedRecurringType) {
      return recurringTypes[selectedRecurringType.row].key === 'Monthly'
        ? selectedDatesOfMonth?.map(value => datesOfMonth[value.row]) || []
        : selectedDaysOfWeek?.map(value => daysOfWeek[value.row]) || []
    }
    return []
  }, [selectedRecurringType, selectedDatesOfMonth, selectedDaysOfWeek])

  const prefillDaysAndDates = useCallback(() => {
    let weekIndex = moment(startDate).day()
    weekIndex -= 1
    if (weekIndex < 0) weekIndex = 6
    setSelectedDaysOfWeek([new IndexPath(weekIndex)])
    const dateIndex = moment(startDate).date() - 1
    setSelectedDatesOfMonth([new IndexPath(dateIndex)])
  }, [startDate])

  const onTagPress = useCallback(
    (title: string) => {
      if (selectedRecurringType) {
        const isMonthlyRecurring =
          recurringTypes[selectedRecurringType.row].key === 'Monthly'

        const index = (
          isMonthlyRecurring ? datesOfMonth : daysOfWeek
        ).findIndex(element => element === (isMonthlyRecurring ? title : title))

        const newList = (
          isMonthlyRecurring ? selectedDatesOfMonth : selectedDaysOfWeek
        ).filter(element => element.row !== index)

        isMonthlyRecurring
          ? setSelectedDatesOfMonth(newList)
          : setSelectedDaysOfWeek(newList)
        if (newList.length == 0) prefillDaysAndDates()
      }
    },
    [
      selectedRecurringType,
      selectedDatesOfMonth,
      selectedDaysOfWeek,
      prefillDaysAndDates,
    ],
  )

  const isSearchDisabled = useCallback(() => {
    // if (route.params?.booking) {
    //   return false
    // }
    if (!selectedBranch) return true
    if (!selectedIndex) return true
    if (!selectedEndTimeIndex) return true
    if (radioIndex === 0 && !selectedRecurringType) return true
    if (radioIndex === 0 && selectedRecurringType) {
      if (
        (recurringTypes[selectedRecurringType.row].key === 'Monthly' &&
          selectedDatesOfMonth.length < 1) ||
        (recurringTypes[selectedRecurringType.row].key === 'Weekly' &&
          selectedDaysOfWeek.length < 1)
      )
        return true
    }
    if (
      radioIndex === 0 &&
      startDate.toDateString() !== endDate.toDateString()
    ) {
      return true
    }
    if (!isRecuringDisabale && radioIndex === 0 && endOnDate <= endDate) {
      return true
    }

    if (!selectedDriver) return true
    return false
  }, [
    radioIndex,
    startDate,
    endDate,
    endOnDate,
    selectedRecurringType,
    selectedDatesOfMonth,
    selectedDaysOfWeek,
    selectedDriver,
    selectedBranch,
  ])

  const navigateToSearch = useCallback(() => {
    if (selectedDriver && selectedBranch) {
      navigation.navigate('SelectVehicle', {
        branch: branches[selectedBranch.row],
        startDate: startDate,
        endDate: endDate,
        endOnDate: endOnDate,
        isRecurring: radioIndex === 0,
        recurringType:
          selectedRecurringType &&
          recurringTypes[selectedRecurringType.row].key,
        datesOfMonth: selectedDatesOfMonth.map(date => datesOfMonth[date.row]),
        daysOfWeek: selectedDaysOfWeek.map(day => day.row),
        booking,
        driverPK: driverList[selectedDriver.row].pk,
        address,
      })
    }
  }, [
    navigation,
    branches,
    selectedBranch,
    startDate,
    endDate,
    endOnDate,
    radioIndex,
    selectedRecurringType,
    selectedDatesOfMonth,
    selectedDaysOfWeek,
    booking,
    selectedDriver,
    driverList,
    address,
  ])

  const verifyDriver = useCallback(() => {
    if (!permissions.createForOthers) {
      if (licenseStatus === 'Expired') {
        if (allowExpiredBookings) {
          setDriverError(true)
          return
        }
      }
    }
    if (selectedDriver) {
      console.info(startDate, endDate)
      BookingsController.verifyDriver(eventEmitter, {
        startDate,
        endDate,
        driverPK: driverList[selectedDriver.row].pk,
      })
    }
  }, [selectedDriver, startDate, endDate, driverList])

  useEffect(() => {
    if (navigate) {
      setNavigate(false)
      navigateToSearch()
    }
  }, [navigate, navigateToSearch])

  useEffect(() => {
    const subscription = eventEmitter.getObservable().subscribe(event => {
      switch (event.type) {
        case AUTH_EVENTS.LOAD_BRANCHES_START:
          setIsLoading(true)
          break
        case AUTH_EVENTS.LOAD_BRANCHES_SUCCESS:
          populateFields(event.data.branches)
          setBranches(event.data.branches)
          if (!permissions.createForOthers) {
            setDriverList([
              {
                name: booking
                  ? booking.driver?.name
                  : event.data.loggedInUser.name,
                pk: booking ? booking.driver?.pk : event.data.loggedInUser.pk,
              },
            ])
            setSelectedDriver(new IndexPath(0))
          } else {
            BookingsController.getDrivers(eventEmitter, {
              bookingID: booking?.pk,
              driverPK: booking?.driver?.pk ?? event.data.loggedInUser.pk,
            })
          }
          bookingController.allowBookingWithExpiredLicense(eventEmitter)
          break
        case AUTH_EVENTS.LOAD_BRANCHES_FAILURE:
          Alert.alert('', STRINGS.SOMETHING_WENT_WRONG)
          navigation.goBack()
          break

        case BOOKING_EVENTS.LOAD_DRIVERS_START:
          setLoadingDrivers(true)
          break
        case BOOKING_EVENTS.LOAD_DRIVERS_SUCCESS:
          setDriverList(event.data.drivers)
          if (_.isNumber(event.data.index))
            setSelectedDriver(new IndexPath(event.data.index))
          else setSelectedDriver(undefined)
          setLoadingDrivers(false)
          break
        case BOOKING_EVENTS.LOAD_DRIVERS_FAILURE:
          setLoadingDrivers(false)
          navigation.goBack()
          Alert.alert('', event.data || STRINGS.FAILED_TO_LOAD_DRIVERS)
          break

        case BOOKING_EVENTS.VERIFY_DRIVER_START:
          setIsVerifingDriver(true)
          break
        case BOOKING_EVENTS.VERIFY_DRIVER_SUCCESS:
          setIsVerifingDriver(false)
          if (event.data.bookings.length > 0) {
            // Selected Driver has bookings already
            setDriverBookings(event.data.bookings)
            if (booking) {
              if (event.data.bookings.length === 1) {
                if (event.data.bookings[0].pk === booking.pk) {
                  setNavigate(true)
                }
              }
            }
          } else {
            setNavigate(true)
          }
          break
        case BOOKING_EVENTS.VERIFY_DRIVER_FAILURE:
          setIsVerifingDriver(false)
          Alert.alert('', event.data || STRINGS.SOMETHING_WENT_WRONG)
          break
        case AUTH_EVENTS.LOAD_HOLIDAY_LIST_SUCCESS:
          setHolidayList(event.data)
          break
        case AUTH_EVENTS.LOAD_HOLIDAY_SETTINGS_SUCCESS:
          setHolidaySettings(event.data)
          break
        case BOOKING_EVENTS.GET_EXPIRED_LICENSE_SETTING_START:
          setIsLoading(true)
          break
        case BOOKING_EVENTS.GET_EXPIRED_LICENSE_SETTING_SUCCESS:
          setIsLoading(false)
          console.log('ALLOW EXPIRED LICENSE ------>', event.data)
          setallowExpiredBookings(event.data)
          break
        case BOOKING_EVENTS.GET_EXPIRED_LICENSE_SETTING_FAILURE:
          setIsLoading(false)
          Alert.alert('', STRINGS.SOMETHING_WENT_WRONG)
          navigation.goBack()
          break
      }
    })
    controller.getBranches(eventEmitter)
    controller.getHolidaySettings(eventEmitter)

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (booking) {
      navigation.setOptions({headerTitle: STRINGS.LABEL_EDIT_BOOKING})
    }
  }, [navigation])

  const populateFields = useCallback(
    (branches: entity.Branch[]) => {
      if (booking) {
        setIsRecuringDisabale(true)
        setAddress({
          name: booking.address,
          landmark: booking.address_features?.landmark,
          bounds: booking.address_features?.bounds,
          coords: {
            lat: booking.location?.coordinates?.[0],
            long: booking.location?.coordinates?.[1],
          },
        })

        const branchIndex = branches.findIndex(
          item => item.pk === booking.branch?.pk,
        )
        if (branchIndex > -1) setSelectedBranch(new IndexPath(branchIndex))

        const startTime = moment(booking.start_datetime?.original).toDate()
        setStartDate(startTime)

        const endTime = moment(booking.end_datetime?.original).toDate()
        setEndDate(endTime)

        if (booking.is_recurring) {
          setRadioIndex(0)
          switch (booking.recurring_pattern) {
            case 'daily':
              setSelectedRecurringType(new IndexPath(0))
              break
            case 'weekly':
              setSelectedRecurringType(new IndexPath(1))
              break
            case 'monthly':
              setSelectedRecurringType(new IndexPath(2))
              break
          }
          if (booking.recurring_pattern === 'weekly') {
            if (booking.days_of_week && booking.days_of_week.length > 0)
              setSelectedDaysOfWeek(
                booking.days_of_week?.map(index => new IndexPath(index)),
              )
          } else if (booking.recurring_pattern === 'monthly') {
            if (booking.dates_of_month && booking.dates_of_month.length > 0)
              setSelectedDatesOfMonth(
                booking.dates_of_month?.map(index => new IndexPath(index - 1)),
              )
          }
        }
      }
    },
    [booking],
  )

  const onStartDateChange = useCallback(
    (date: Date) => {
      if (moment(endDate).isBefore(moment(date))) {
        const newEndDate = moment(date).add(5, 'minutes').toDate()
        setEndDate(newEndDate)
      }
      setStartDate(date)
    },
    [endDate],
  )

  const onEndDateChange = useCallback((date: Date) => {
    setEndDate(date)
  }, [])

  const onEndOnDateChange = useCallback((date: Date) => {
    setEndOnDate(date)
  }, [])

  const onLocationDetailsChange = useCallback(
    (text: string) => {
      const temp = {...address}
      temp.landmark = text
      setAddress(temp)
    },
    [address],
  )

  const onAddressFocus = useCallback(async () => {
    try {
      const place = await GoogleAutoComplete.show()
      const temp = {...address}
      temp.name = place.address
      temp.bounds = {
        east: place.viewport.northEast.longitude,
        north: place.viewport.northEast.latitude,
        south: place.viewport.southWest.latitude,
        west: place.viewport.southWest.longitude,
      }
      temp.coords = {
        lat: place.coordinate.latitude,
        long: place.coordinate.longitude,
      }
      setAddress(temp)
    } catch (error) {
      console.log(error)
    }
  }, [address])

  const customDateFormat = (initailDay: string) => {
    if (initailDay.length == 1) {
      return '0' + initailDay
    } else {
      return initailDay
    }
  }

  if (isLoading)
    return (
      <Layout style={styles.loaderWrapper}>
        <Spinner />
      </Layout>
    )
  else
    return (
      <SafeAreaView
        style={styles.container}
        edges={['bottom', 'left', 'right']}>
        <ScrollView style={styles.scrollview}>
          <Text style={styles.titleText}>{STRINGS.LABEL_GENERAL_DETAILS}</Text>
          <MapView
            style={styles.map}
            region={{
              latitude:
                branches.length > 0 && selectedBranch
                  ? branches[selectedBranch.row].location?.coordinates?.[0] ??
                    0.1
                  : 0.1,
              longitude:
                branches.length > 0 && selectedBranch
                  ? branches[selectedBranch.row].location?.coordinates?.[1] ??
                    0.1
                  : 0.1,
              latitudeDelta: 0.005,
              longitudeDelta: 0.01,
            }}>
            {branches.length > 0 && selectedBranch ? (
              <Marker
                title={branches[selectedBranch.row].name}
                coordinate={{
                  latitude:
                    branches[selectedBranch.row].location?.coordinates?.[0] ??
                    0.1,
                  longitude:
                    branches[selectedBranch.row].location?.coordinates?.[1] ??
                    0.1,
                }}
              />
            ) : (
              <Marker
                coordinate={{
                  latitude: position?.latitude ?? 0.1,
                  longitude: position?.longitude ?? 0.1,
                }}
              />
            )}
            {address?.coords && (
              <Marker
                title={address.name}
                coordinate={{
                  latitude: address.coords.lat ?? 0.1,
                  longitude: address.coords.long ?? 0.1,
                }}
              />
            )}
          </MapView>
          <Select
            label={STRINGS.LABEL_BRANCH}
            placeholder={STRINGS.PLACEHOLDER_SELECT_BRANCH}
            style={[styles.dropdown, !selectedBranch && {marginBottom: 12}]}
            value={selectedBranch && branches[selectedBranch.row]?.name}
            selectedIndex={selectedBranch}
            onSelect={index => {
              controller.getHolidayList(
                eventEmitter,
                branches?.[(index as IndexPath).row]?.pk as number,
              )
              setWorkingDays(
                Object.keys(
                  JSON.parse(
                    JSON.stringify(
                      branches?.[(index as IndexPath).row]?.business_hours
                        ?.days,
                    ),
                  ),
                ),
              )
              setSelectedBranch(index as IndexPath)
            }}>
            {branches.map(branch =>
              renderOption(branch.name!!, String(branch.pk)),
            )}
          </Select>
          {selectedBranch && (
            <Text style={{marginBottom: 12}} category={'c2'}>
              {STRINGS.BUSINESS_HOURS(
                branches?.[selectedBranch?.row as number]?.business_hours
                  ?.type as string,
              )}
            </Text>
          )}
          <CustomInput
            label={STRINGS.LABEL_DESTINATION}
            placeholder={STRINGS.PLACEHOLDER_DESTINATION}
            value={address?.name ?? ''}
            style={styles.input}
            onPress={onAddressFocus}
          />
          {!_.isEmpty(address?.name) && (
            <Input
              label={STRINGS.LABEL_ADDITIONAL_LOCATION_DETAILS}
              placeholder={STRINGS.LABEL_ADDITIONAL_LOCATION_DETAILS}
              onChangeText={onLocationDetailsChange}
              style={styles.input}
              value={address?.landmark}
              autoCorrect={false}
            />
          )}
          <View style={styles.pickerContainer}>
            <Datepicker
              size={'large'}
              style={{flex: 0.5, marginRight: 5}}
              label={STRINGS.PICK_START_DATE}
              min={new Date()}
              max={
                new Date(
                  now.getFullYear(),
                  now.getMonth() +
                    (holidaySettings.length == 0
                      ? 12
                      : Number(holidaySettings[0].value)),
                  now.getDate(),
                )
              }
              filter={filter}
              {...filterPickerState}
              date={startDate}
              onSelect={nextDate => {
                if (selectedIndex) {
                  let dateString =
                    nextDate.getFullYear() +
                    '-' +
                    customDateFormat(String(nextDate.getMonth() + 1)) +
                    '-' +
                    customDateFormat(String(nextDate.getDate()))

                  let time = moment(timeArray[Number(selectedIndex) - 1], [
                    'h:mm A',
                  ]).format('HH:mm')
                  let timeAndDate = moment(dateString + ' ' + time)
                  setStartDate(timeAndDate.toDate())
                  console.info('START DATE -------->', startDate)
                } else {
                  setStartDate(nextDate)
                }
              }}
            />
            <Select
              label={STRINGS.SET_START_TIME}
              size={'large'}
              placeholder={STRINGS.SET_TIME}
              selectedIndex={selectedIndex}
              value={
                selectedIndex
                  ? timeArray[Number(selectedIndex?.row)]
                  : undefined
              }
              style={styles.timeDropdown}
              onSelect={index => {
                setSelectedIndex(index as IndexPath)
                let dateString =
                  startDate.getFullYear() +
                  '-' +
                  customDateFormat(String(startDate.getMonth() + 1)) +
                  '-' +
                  customDateFormat(String(startDate.getDate()))
                let time = moment(timeArray[Number(index as IndexPath) - 1], [
                  'h:mm A',
                ]).format('HH:mm')
                let timeAndDate = moment(dateString + ' ' + time)
                setStartDate(timeAndDate.toDate())
              }}>
              {generateTimeArray(15).map((item, index) => {
                var itemShouldNotDisplay = false
                if (
                  startDate.getDate() == currentDate.getDate() &&
                  index < currentTimeIndex + 1
                ) {
                  itemShouldNotDisplay = true
                }
                return (
                  <SelectItem
                    title={item}
                    disabled={filterTime(item, true, itemShouldNotDisplay)}
                  />
                )
              })}
            </Select>
          </View>
          <View style={styles.pickerContainer}>
            <Datepicker
              size={'large'}
              style={styles.timeDropdown}
              label={STRINGS.PICK_END_DATE}
              date={endDate}
              min={new Date()}
              max={
                new Date(
                  now.getFullYear(),
                  now.getMonth() +
                    (holidaySettings.length == 0
                      ? 12
                      : Number(holidaySettings[0].value)),
                  now.getDate(),
                )
              }
              filter={filter}
              onSelect={nextDate => {
                let dateString =
                  nextDate.getFullYear() +
                  '-' +
                  customDateFormat(String(nextDate.getMonth() + 1)) +
                  '-' +
                  customDateFormat(String(nextDate.getDate()))

                if (selectedEndTimeIndex) {
                  let time = moment(
                    timeArray[Number(selectedEndTimeIndex) - 1],
                    ['h:mm A'],
                  ).format('HH:mm')
                  let timeAndDate = moment(dateString + ' ' + time)
                  setEndDate(timeAndDate.toDate())
                  console.info(endDate)
                } else {
                  setEndDate(nextDate)
                }
              }}
            />
            <Select
              label={STRINGS.SET_END_TIME}
              size={'large'}
              placeholder={STRINGS.SET_TIME}
              selectedIndex={selectedEndTimeIndex}
              value={
                selectedEndTimeIndex
                  ? timeArray[Number(selectedEndTimeIndex?.row)]
                  : undefined
              }
              style={{flex: 0.5, marginLeft: 5}}
              onSelect={index => {
                setSelectedEndTimeIndex(index as IndexPath)
                let dateString =
                  endDate.getFullYear() +
                  '-' +
                  customDateFormat(String(endDate.getMonth() + 1)) +
                  '-' +
                  customDateFormat(String(endDate.getDate()))
                let time = moment(timeArray[Number(index as IndexPath) - 1], [
                  'h:mm A',
                ]).format('HH:mm')
                let timeAndDate = moment(dateString + ' ' + time)
                setEndDate(timeAndDate.toDate())
              }}>
              {timeArray.map((item, index) => {
                var itemShouldNotDisplay = false
                if (endDate.getDate() <= startDate.getDate()) {
                  itemShouldNotDisplay = true
                }
                return (
                  <SelectItem
                    title={item}
                    disabled={filterTime(item, false, itemShouldNotDisplay)}
                  />
                )
              })}
            </Select>
          </View>
          <Select
            label={STRINGS.LABEL_DRIVER}
            placeholder={STRINGS.PLACEHOLDER_SELECT_DRIVER}
            style={styles.dropdown}
            value={selectedDriver && driverList[selectedDriver.row].name}
            selectedIndex={selectedDriver}
            onSelect={index => setSelectedDriver(index as IndexPath)}
            accessoryLeft={() => {
              if (loadingDrivers) return <Spinner size="tiny" />
              return <></>
            }}
            disabled={!permissions.createForOthers || loadingDrivers}>
            {driverList.map(driver =>
              renderOption(driver.name, String(driver.pk)),
            )}
          </Select>
          {driverError && (
            <Text status={'danger'} style={{marginBottom: 12}} category={'c2'}>
              {STRINGS.LICENSE_EXPIRED}
            </Text>
          )}
          <Layout style={styles.radioViewWrapper}>
            <Text category="label" style={styles.radioLabel}>
              {STRINGS.LABEL_RECURRING}
            </Text>
            <RadioGroup
              style={styles.radioGroup}
              selectedIndex={radioIndex}
              onChange={index => setRadioIndex(index)}>
              <Radio disabled={isRecuringDisabale} style={styles.radio}>
                {STRINGS.RADIO_YES}
              </Radio>
              <Radio disabled={isRecuringDisabale} style={styles.radio}>
                {STRINGS.RADIO_NO}
              </Radio>
            </RadioGroup>
          </Layout>
          {radioIndex === 0 &&
            startDate.toDateString() !== endDate.toDateString() && (
              <Layout style={{flexDirection: 'row', marginEnd: 40}}>
                <Text style={styles.noteText}> {STRINGS.LABEL_NOTE}</Text>
                <Text style={styles.errorText}>
                  {STRINGS.ERROR_MESSAGE_RECURRING_FOOTER}
                </Text>
              </Layout>
            )}
          {radioIndex === 0 && (
            <Select
              disabled={isRecuringDisabale}
              style={styles.dropdown}
              label={STRINGS.LABEL_RECURRING_OPTIONS}
              placeholder={STRINGS.PLACEHOLDER_RECURRING_TYPE}
              value={
                selectedRecurringType &&
                recurringTypes[selectedRecurringType.row].value
              }
              selectedIndex={selectedRecurringType}
              onSelect={index => {
                setSelectedRecurringType(index as IndexPath)
                prefillDaysAndDates()
              }}>
              {recurringTypes.map(recurringType =>
                renderOption(recurringType.value, recurringType.key),
              )}
            </Select>
          )}
          {radioIndex === 0 &&
            selectedRecurringType &&
            recurringTypes[selectedRecurringType.row].key !== 'Daily' && (
              <>
                <Select
                  disabled={isRecuringDisabale}
                  multiSelect
                  style={styles.dropdown}
                  label={
                    recurringTypes[selectedRecurringType.row].key === 'Monthly'
                      ? STRINGS.LABEL_DATES_OF_MONTH
                      : STRINGS.LABEL_DAYS_OF_WEEK
                  }
                  placeholder={
                    recurringTypes[selectedRecurringType.row].key === 'Monthly'
                      ? STRINGS.LABEL_DATES_OF_MONTH
                      : STRINGS.LABEL_DAYS_OF_WEEK
                  }
                  value={
                    recurringTypes[selectedRecurringType.row].key === 'Monthly'
                      ? selectedDatesOfMonth
                          ?.map(value => datesOfMonth[value.row])
                          .join(', ')
                      : selectedDaysOfWeek
                          ?.map(value => daysOfWeek[value.row])
                          .join(', ')
                  }
                  selectedIndex={
                    recurringTypes[selectedRecurringType.row].key === 'Monthly'
                      ? selectedDatesOfMonth
                      : selectedDaysOfWeek
                  }
                  onSelect={index => {
                    recurringTypes[selectedRecurringType.row].key === 'Monthly'
                      ? setSelectedDatesOfMonth(index as IndexPath[])
                      : setSelectedDaysOfWeek(index as IndexPath[])
                  }}>
                  {recurringTypes[selectedRecurringType.row].key === 'Monthly'
                    ? datesOfMonth.map((day, index) =>
                        renderOption(day, String(index)),
                      )
                    : daysOfWeek.map(day => renderOption(day, day))}
                </Select>
                <Tags
                  tagTitles={getTagTitles()}
                  tagStyle={styles.tags}
                  editable={!isRecuringDisabale}
                  containerStyle={styles.tagsContainer}
                  onTagPress={onTagPress}
                />
              </>
            )}
          {!isRecuringDisabale && selectedRecurringType && radioIndex === 0 && (
            <>
              <DateTime
                dateLabel={STRINGS.LABEL_END_DATE}
                date={endOnDate}
                minDate={startDate}
                onDateChange={onEndOnDateChange}
                dateOnly={true}
              />
              {endOnDate <= endDate && (
                <Layout style={{flexDirection: 'row', marginEnd: 40}}>
                  <Text style={styles.noteText}> {STRINGS.LABEL_NOTE}</Text>
                  <Text style={styles.errorText}>
                    {STRINGS.ERROR_MESSAGE_ENDS_ON_FOOTER}
                  </Text>
                </Layout>
              )}
            </>
          )}
        </ScrollView>
        <Button
          style={styles.button}
          onPress={verifyDriver}
          disabled={isSearchDisabled() || isVerifingDriver}>
          {STRINGS.BUTTON_SEARCH}
        </Button>
        <Modal
          visible={booking ? false : driverBookings.length > 0}
          backdropStyle={styles.backdrop}>
          <Layout
            style={{
              borderRadius: 4,
              width: Dimensions.get('window').width - 24,
            }}>
            <Text category="s1" style={styles.headerText}>
              {STRINGS.LABEL_ERROR}
            </Text>
            <Divider
              style={[
                {backgroundColor: theme['color-primary-default']},
                styles.divider,
              ]}
            />
            <Layout style={styles.modalBodyWrapper}>
              <Text>{STRINGS.ERROR_MESSAGE_HEADER(driverBookings.length)}</Text>
              <ScrollView style={styles.modalScrollView}>
                {driverBookings.map((item, index) => (
                  <Layout
                    style={{
                      flexDirection: 'row',
                      marginVertical: 6,
                    }}
                    key={index}>
                    <Text category="s1">{`${index + 1}.`}</Text>
                    <Layout style={{marginStart: 4}}>
                      <Text>{`${STRINGS.LABEL_BOOKING_ID}: ${item.pk}`}</Text>
                      <Text>
                        {`${moment(item.start_datetime?.original).format(
                          'DD-MM-YYYY h:mm A',
                        )} - ${moment(item.end_datetime?.original).format(
                          'DD-MM-YYYY h:mm A',
                        )}`}
                      </Text>
                    </Layout>
                  </Layout>
                ))}
              </ScrollView>
              <Text style={{marginBottom: 12}}>
                {STRINGS.ERROR_MESSAGE_FOOTER}
              </Text>
              <Button onPress={() => setDriverBookings([])}>
                {STRINGS.BUTTON_OKAY}
              </Button>
            </Layout>
          </Layout>
        </Modal>
      </SafeAreaView>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  alertRecurring: {marginBottom: 12, color: 'red'},

  errorText: {
    marginBottom: 2,
    fontSize: 11,
    color: 'black',
    fontStyle: 'italic',
  },
  noteText: {
    marginBottom: 2,
    fontSize: 11,
    color: 'red',
  },
  titleText: {
    marginVertical: 12,
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollview: {
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  dropdown: {
    marginTop: 12,
  },
  radioViewWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  radioGroup: {
    flexDirection: 'row',
  },
  radio: {
    marginHorizontal: 12,
  },
  radioLabel: {
    color: 'grey',
  },
  button: {
    marginBottom: 12,
    marginHorizontal: 10,
  },
  map: {
    height: 200,
    marginBottom: 6,
  },
  loaderWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  permissionButton: {
    marginVertical: 12,
  },
  tagsContainer: {
    marginTop: 0,
  },
  tags: {
    padding: 8,
  },
  input: {
    marginBottom: 12,
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  headerText: {
    marginBottom: 12,
    marginTop: 18,
    fontSize: 20,
    marginHorizontal: 12,
  },
  divider: {
    height: 2,
    marginBottom: 14,
  },
  modalBodyWrapper: {
    marginBottom: 18,
    marginHorizontal: 12,
  },
  modalScrollView: {
    maxHeight: 150,
    marginVertical: 12,
  },
  picker: {
    flex: 1,
    margin: 2,
  },
  pickerContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timeDropdown: {flex: 0.5, marginLeft: 5},
})

export default AddNewBooking
