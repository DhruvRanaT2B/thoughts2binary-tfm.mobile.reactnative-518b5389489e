import React, {useCallback, useEffect, useState, useContext} from 'react'
import {StyleSheet, ScrollView, Alert} from 'react-native'
import {
  Layout,
  Text,
  Card,
  useTheme,
  Button,
  Icon,
  Spinner,
} from '@ui-kitten/components'
import moment from 'moment'
import _ from 'lodash'

import STRINGS from './strings'
import {BookingsScreenProps} from 'types'
import {SafeAreaView} from '@components'
import VehicleListItem from '../SelectVehicle/components/VehicleListItem'
import {getBookingStatusColor} from '@utility'
import {EventEmitter} from '@react-native-granite/core'
import {BOOKING_EVENTS, controller, entity} from '@bookings'
import {BookingContext} from '@contexts'
import {Booking, Setting} from 'bookings/entity'

// Global constants
const eventEmitter = new EventEmitter()

const BookingDetails: React.FC<BookingsScreenProps<'BookingDetail'>> = ({
  navigation,
  route,
}) => {
  const {permissions, setVehicleImages} = useContext(BookingContext)
  const {bookingID} = route.params
  const theme = useTheme()
  const [booking, setBooking] = useState<entity.Booking>()
  const [isLoading, setIsLoading] = useState(true)
  const [isButtonDisabled, setIsButtonDisabled] = useState(false)
  const [incidents, setIncidents] = useState<entity.Incident[]>([])
  const [bookingTrip, setBookingTrip] = useState<entity.BookingTrip>()
  const [customAttributes, setCustomAttributes] = useState<entity.Tag[]>([])
  const [checklist, setChecklist] = useState()
  const [extendBooking, setExtendBooking] = useState('false')

  const onCheckOutPress = useCallback(() => {
    navigation.navigate('BookingCheckOut', {
      eventEmitter,
      bookingID: booking?.pk!!,
      startOdoReading: Number(booking?.vehicle?.odometer),
      checkList: checklist,
    })
  }, [navigation, booking, checklist])

  const onCheckInPress = useCallback(() => {
    if (bookingTrip) {
      navigation.navigate('BookingCheckIn', {
        eventEmitter,
        bookingID: booking?.pk!!,
        incidents,
        bookingTripID: Number(bookingTrip.pk),
        vehicleID: booking?.vehicle?.pk!!,
        startOdoReading: Number(bookingTrip.start_odometer_reading),
        customAttributes,
        checkList: checklist,
      })
    }
  }, [navigation, booking, incidents, bookingTrip, customAttributes, checklist])

  const onEditPress = useCallback(() => {
    let difference = moment(booking?.start_datetime?.original).diff(
      moment(),
      'minutes',
    )
    if (difference >= 0) navigation.navigate('AddNewBooking', {booking})
    else Alert.alert('', STRINGS.EDIT_NOT_ALLOWED)
  }, [booking, navigation])

  const onCancelBookingPress = useCallback(() => {
    Alert.alert(
      '',
      STRINGS.CANCEL_BOOKING_CONFIRMATION_MESSAGE,
      [
        {text: STRINGS.BUTTON_NO},
        {
          text: STRINGS.BUTTON_YES,
          onPress: () => controller.cancelBooking(eventEmitter, bookingID),
        },
      ],
      {cancelable: false},
    )
  }, [])

  useEffect(() => {
    const subscription = eventEmitter.getObservable().subscribe(event => {
      switch (event.type) {
        case BOOKING_EVENTS.LOAD_BOOKING_START:
          setIsLoading(true)
          break
        case BOOKING_EVENTS.LOAD_BOOKING_SUCCESS:
          controller.getContentTypes(
            eventEmitter,
            Number((event.data as Booking).vehicle?.pk),
          )
          setBooking(event.data)
          controller.getCheckLists(
            eventEmitter,
            event.data.status['status_name'],
          )
          controller.loadBookingExtensions(eventEmitter)
          break
        case BOOKING_EVENTS.LOAD_BOOKING_FAILURE:
          Alert.alert('', STRINGS.ERROR_LOADING_BOOKING)
          navigation.goBack()
          break

        case BOOKING_EVENTS.CHECK_OUT_START:
          setIsButtonDisabled(true)
          break
        case BOOKING_EVENTS.CHECK_OUT_SUCCESS:
          setIsButtonDisabled(false)
          Alert.alert(
            '',
            STRINGS.CHECK_OUT_SUCCESS,
            [
              {
                text: STRINGS.BUTTON_OKAY,
                onPress: () =>
                  // @ts-ignore
                  navigation.reset({index: 0, routes: [{name: 'App'}]}),
              },
            ],
            {cancelable: false},
          )
          break
        case BOOKING_EVENTS.CHECK_OUT_FAILURE:
          setIsButtonDisabled(false)
          Alert.alert(
            '',
            event.data || STRINGS.REQUEST_FAILED,
            [
              {
                text: STRINGS.BUTTON_OKAY,
                onPress: () =>
                  // @ts-ignore
                  navigation.reset({index: 0, routes: [{name: 'App'}]}),
              },
            ],
            {cancelable: false},
          )
          break

        case BOOKING_EVENTS.CHECK_IN_START:
          setIsButtonDisabled(true)
          break
        case BOOKING_EVENTS.CHECK_IN_SUCCESS:
          setIsButtonDisabled(false)
          Alert.alert(
            '',
            STRINGS.CHECK_IN_SUCCESS,
            [
              {
                text: STRINGS.BUTTON_OKAY,
                onPress: () =>
                  // @ts-ignore
                  navigation.reset({index: 0, routes: [{name: 'App'}]}),
              },
            ],
            {cancelable: false},
          )
          break
        case BOOKING_EVENTS.CHECK_IN_FAILURE:
          setIsButtonDisabled(false)
          Alert.alert(
            '',
            event.data || STRINGS.REQUEST_FAILED,
            [
              {
                text: STRINGS.BUTTON_OKAY,
                onPress: () =>
                  // @ts-ignore
                  navigation.reset({index: 0, routes: [{name: 'App'}]}),
              },
            ],
            {cancelable: false},
          )
          break

        case BOOKING_EVENTS.LOG_INCIDENT_START:
          setIsButtonDisabled(true)
          break
        case BOOKING_EVENTS.LOG_INCIDENT_SUCCESS:
          setIsButtonDisabled(false)
          Alert.alert(
            '',
            STRINGS.CHECK_IN_SUCCESS,
            [
              {
                text: STRINGS.BUTTON_OKAY,
                onPress: () =>
                  // @ts-ignore
                  navigation.reset({index: 0, routes: [{name: 'App'}]}),
              },
            ],
            {cancelable: false},
          )
          break
        case BOOKING_EVENTS.LOG_INCIDENT_FAILURE:
          setIsButtonDisabled(false)
          Alert.alert(
            '',
            event.data || STRINGS.REQUEST_FAILED,
            [
              {
                text: STRINGS.BUTTON_OKAY,
                onPress: () =>
                  // @ts-ignore
                  navigation.reset({index: 0, routes: [{name: 'App'}]}),
              },
            ],
            {cancelable: false},
          )
          break

        case BOOKING_EVENTS.LOAD_INCIDENTS_START:
          break
        case BOOKING_EVENTS.LOAD_INCIDENTS_SUCCESS:
          setIncidents(event.data.incidents)
          setCustomAttributes(event.data.tags)
          break
        case BOOKING_EVENTS.LOAD_INCIDENTS_FAILURE:
          break

        case BOOKING_EVENTS.LOAD_BOOKING_TRIP_START:
          break
        case BOOKING_EVENTS.LOAD_BOOKING_TRIP_SUCCESS:
          setBookingTrip(event.data)
          break
        case BOOKING_EVENTS.LOAD_BOOKING_TRIP_FAILURE:
          break

        case BOOKING_EVENTS.CANCEL_BOOKING_START:
          setIsButtonDisabled(true)
          break
        case BOOKING_EVENTS.CANCEL_BOOKING_SUCCESS:
          setIsButtonDisabled(false)
          Alert.alert(
            '',
            STRINGS.CANCEL_BOOKING_SUCCESS,
            [
              {
                text: STRINGS.BUTTON_OKAY,
                onPress: () =>
                  // @ts-ignore
                  navigation.reset({index: 0, routes: [{name: 'App'}]}),
              },
            ],
            {cancelable: false},
          )
          break
        case BOOKING_EVENTS.CANCEL_BOOKING_FAILURE:
          setIsButtonDisabled(false)
          Alert.alert(
            '',
            event.data || STRINGS.REQUEST_FAILED,
            [
              {
                text: STRINGS.BUTTON_OKAY,
                onPress: () =>
                  // @ts-ignore
                  navigation.reset({index: 0, routes: [{name: 'App'}]}),
              },
            ],
            {cancelable: false},
          )
          break
        case BOOKING_EVENTS.SHOW_CHECKLIST_SUCCESS:
          setIsLoading(false)
          // setShowCheck(event.data[0].value)
          // console.log(showCheck)
          // console.log(event.data[0].value)
          //setShowCheck(event.data)
          setChecklist(event.data)
          break
        case BOOKING_EVENTS.SHOW_CHECKLIST_FAILURE:
          Alert.alert('', STRINGS.ERROR_LOADING_BOOKING)
          navigation.goBack()
          break
        case BOOKING_EVENTS.POST_CHECKLIST_FAILURE:
          setIsButtonDisabled(false)
          Alert.alert(
            '',
            event.data || STRINGS.REQUEST_FAILED,
            [
              {
                text: STRINGS.BUTTON_OKAY,
                onPress: () =>
                  // @ts-ignore
                  navigation.reset({index: 0, routes: [{name: 'App'}]}),
              },
            ],
            {cancelable: false},
          )
          break
        case BOOKING_EVENTS.LOAD_EXTENSION_SUCCESS:
          setExtendBooking(event.data)
          break
        case BOOKING_EVENTS.LOAD_EXTENSION_FAILURE:
          Alert.alert('', STRINGS.ERROR_LOADING_BOOKING)
          navigation.goBack()
          break
        case BOOKING_EVENTS.EXTEND_BOOKING_START:
          setIsButtonDisabled(true)
          break
        case BOOKING_EVENTS.EXTEND_BOOKING_SUCCESS:
          setIsButtonDisabled(true)
          Alert.alert(
            '',
            STRINGS.EXTEND_SUCCESS,
            [
              {
                text: STRINGS.BUTTON_OKAY,
                onPress: () =>
                  // @ts-ignore
                  navigation.reset({index: 0, routes: [{name: 'App'}]}),
              },
            ],
            {cancelable: false},
          )
          break
        case BOOKING_EVENTS.EXTEND_BOOKING_FAILURE:
          setIsButtonDisabled(false)
          Alert.alert(
            '',
            event.data || STRINGS.REQUEST_FAILED,
            [
              {
                text: STRINGS.BUTTON_OKAY,
                onPress: () =>
                  // @ts-ignore
                  navigation.goBack(),
              },
            ],
            {cancelable: false},
          )
          break
        case BOOKING_EVENTS.GET_CONTENT_TYPE_SUCCESS:
          setVehicleImages(event.data as string[])
          break
        case BOOKING_EVENTS.GET_CONTENT_TYPE_FAILURE:
          setIsButtonDisabled(false)
          Alert.alert(
            '',
            event.data || STRINGS.REQUEST_FAILED,
            [
              {
                text: STRINGS.BUTTON_OKAY,
                onPress: () =>
                  // @ts-ignore
                  navigation.goBack(),
              },
            ],
            {cancelable: false},
          )
          break
      }
    })

    controller.getBookingWithID(eventEmitter, bookingID)
    controller.getIncidents(eventEmitter)
    controller.getBookingTrip(eventEmitter, bookingID)
    return () => subscription.unsubscribe()
  }, [])

  const bookingDetails = useCallback(
    () =>
      [
        {title: STRINGS.PICK_UP_LOCATION, value: 'null'},
        {title: STRINGS.DROP_LOCATION, value: 'null'},
        {
          title: STRINGS.START_DATE_TIME,
          value: moment(booking?.start_datetime?.original).format(
            'DD/MM/YYYY, hh:mm A',
          ),
        },
        {
          title: STRINGS.END_DATE_TIME,
          value: moment(booking?.end_datetime?.original).format(
            'DD/MM/YYYY, hh:mm A',
          ),
        },
        {
          title: STRINGS.COST_CENTRE,
          value: String(booking?.cost_centre?.name),
        },
        {
          title:
            booking?.status?.status_name !== 'Completed'
              ? STRINGS.ESTIMATED_COST
              : STRINGS.ACTUAL_COST,
          value:
            booking?.status?.status_name !== 'Completed'
              ? booking?.extra_data?.estimated_cost == undefined
                ? STRINGS.DEFAULT_EXPECTED_COST
                : STRINGS.DOLLAR(booking?.extra_data?.estimated_cost)
              : STRINGS.DOLLAR(booking?.extra_data?.actual_cost),
        },
        {
          title: STRINGS.PURPOSE_OF_TRIP,
          value: String(booking?.purpose_of_trip),
        },
        // {
        //   title: STRINGS.RECURRING,
        //   value: booking?.is_recurring ? STRINGS.YES : STRINGS.NO,
        // },
        {
          title: STRINGS.MULTIBOOKING_ID,
          value: booking?.multi_booking_id
            ? booking?.multi_booking_id
            : STRINGS.NA,
        },
        {title: STRINGS.ODOMETER, value: String(booking?.vehicle?.odometer)},
        {
          title: STRINGS.OVERNIGHT,
          value: booking?.is_overnight ? STRINGS.YES : STRINGS.NO,
        },
        {
          title: STRINGS.NUMBER_OF_DAYS,
          value: Math.floor(
            moment(booking?.end_datetime?.original).diff(
              booking?.start_datetime?.original,
              'hours',
            ) / 24,
          ).toString(),
        },
      ].filter(
        item =>
          item.value && item.value !== 'undefined' && item.value !== 'null',
      ),
    [booking],
  )

  const renderDetails = (title: string, value: any, iconName?: string) => (
    <Layout style={styles.itemWrapper} key={title}>
      <Layout style={styles.itemTitle}>
        <Text category="s2" style={{flex: 1}}>
          {title}
        </Text>
        <Text category="s2" style={{paddingHorizontal: 12}}>
          :
        </Text>
      </Layout>
      <Layout style={[styles.itemTitle, {justifyContent: 'flex-start'}]}>
        <Text category="p2">{value}</Text>
        {!_.isEmpty(iconName) && (
          <Icon
            name={iconName}
            style={styles.icon}
            fill={theme['color-primary-default']}
          />
        )}
      </Layout>
    </Layout>
  )

  const isEndTimeCrossed = useCallback(() => {
    let end = moment(booking?.end_datetime?.original).toDate()
    let cur = moment().toDate()
    return moment(end).isBefore(cur)
  }, [booking])

  const isEditable = useCallback(() => {
    let status = booking?.status?.status_name
    let difference = moment(booking?.start_datetime?.original).diff(
      moment(),
      'minutes',
    )
    return (
      permissions.write &&
      status !== 'Completed' &&
      status !== 'Declined' &&
      status !== 'Cancelled' &&
      status !== 'In-Progress' &&
      difference >= 0
    )
  }, [booking, permissions])

  if (isLoading)
    return (
      <Layout style={styles.loaderWrapper}>
        <Spinner />
      </Layout>
    )

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView style={styles.scrollview}>
        <Layout style={styles.headerWrapper}>
          <Layout style={styles.headerLeftPortion}>
            <Layout>
              <Text category="s1" style={{fontSize: 18, fontWeight: 'bold'}}>
                {`${booking?.pk} ${booking?.vehicle?.name}`}
              </Text>
              <Layout style={styles.headerCaption}>
                <Layout
                  style={[
                    styles.colorDot,
                    {
                      backgroundColor: getBookingStatusColor(
                        booking?.status?.status_name!!,
                      ),
                    },
                  ]}
                />
                <Text category="c1">{booking?.status?.status_name}</Text>
              </Layout>
            </Layout>
          </Layout>
          <Layout style={styles.headerRightPortion}>
            {isEditable() && (
              <Icon
                name="edit"
                fill={theme['color-primary-default']}
                style={styles.headerIcon}
                onPress={onEditPress}
              />
            )}
          </Layout>
        </Layout>
        <Card style={styles.card}>
          <Text status="primary">{STRINGS.BOOKING_DETAILS}</Text>
          <Layout style={styles.detailsWrapper}>
            {bookingDetails().map(({title, value}) =>
              renderDetails(title, value),
            )}
          </Layout>
        </Card>
        {booking?.vehicle && (
          <VehicleListItem
            showHeaderLabel={true}
            data={booking.vehicle}
            driver={{
              email: booking.driver?.email ?? 'NA',
              name: booking.driver?.name ?? 'NA',
            }}
          />
        )}
      </ScrollView>
      {booking?.status?.status_name === 'Approved' && (
        <Layout style={styles.buttonWrapper}>
          {permissions.cancel && (
            <Button
              style={styles.cancelBooking}
              onPress={onCancelBookingPress}
              disabled={isButtonDisabled}>
              {STRINGS.BUTTON_CANCEL_BOOKING}
            </Button>
          )}
          {permissions.checkOut && (
            <Button
              style={{flex: 1}}
              onPress={onCheckOutPress}
              disabled={isButtonDisabled}>
              {STRINGS.BUTTON_CHECK_OUT}
            </Button>
          )}
        </Layout>
      )}
      {booking?.status?.status_name === 'In-Progress' && permissions.checkIn && (
        <Layout
          style={
            extendBooking === 'true' && isEndTimeCrossed()
              ? styles.buttonWrapper
              : undefined
          }>
          {extendBooking === 'true' && isEndTimeCrossed() && (
            <Button
              style={styles.cancelBooking}
              onPress={() => {
                navigation.navigate('BookingExtend', {
                  eventEmitter,
                  booking: booking,
                })
              }}
              disabled={
                isButtonDisabled || incidents.length < 1 || !bookingTrip
              }>
              {STRINGS.BUTTON_EXTEND}
            </Button>
          )}
          <Button
            style={
              extendBooking === 'true' && isEndTimeCrossed()
                ? styles.cancelBooking
                : styles.button
            }
            onPress={onCheckInPress}
            disabled={isButtonDisabled || incidents.length < 1 || !bookingTrip}>
            {STRINGS.BUTTON_CHECK_IN}
          </Button>
        </Layout>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollview: {
    paddingHorizontal: 10,
  },
  headerIcon: {
    height: 24,
    width: 24,
    marginStart: 12,
  },
  headerWrapper: {
    flexDirection: 'row',
    marginVertical: 12,
  },
  headerLeftPortion: {
    flexDirection: 'row',
    flex: 1,
  },
  headerRightPortion: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerCaption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    height: 8,
    width: 8,
    borderRadius: 8,
    marginEnd: 4,
  },
  card: {
    marginBottom: 12,
  },
  detailsWrapper: {
    marginTop: 12,
  },
  itemWrapper: {
    flex: 1,
    flexDirection: 'row',
    marginVertical: 6,
  },
  itemTitle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  icon: {
    height: 18,
    width: 18,
    marginHorizontal: 6,
  },
  buttonWrapper: {
    marginBottom: 12,
    marginHorizontal: 10,
    flexDirection: 'row',
  },
  button: {
    marginBottom: 12,
    marginHorizontal: 10,
  },
  loaderWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBooking: {
    flex: 1,
    marginEnd: 6,
  },
})

export default BookingDetails
