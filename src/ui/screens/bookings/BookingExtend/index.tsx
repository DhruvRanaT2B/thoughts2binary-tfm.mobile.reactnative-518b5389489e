import React, {useCallback, useEffect, useState} from 'react'
import {Layout, Text, Divider, useTheme, Button} from '@ui-kitten/components'
import {SafeAreaView} from 'react-native-safe-area-context'
import {StyleSheet, TouchableOpacity, ScrollView} from 'react-native'
import {BookingsScreenProps} from 'types'
import STRINGS from './strings'
import moment from 'moment'

import DateTimePickerModal from 'react-native-modal-datetime-picker'

import Calendar from '@images/Calendar.svg'
import Clock from '@images/Clock.svg'
import {controller} from '../../../../bookings/'

// Global Constants
const DATE_PATTERN = 'D MMM, yyyy'
const TIME_PATTERN = 'hh:mm A'

// Global Variables
let dateTimePickerMode: 'date' | 'time' = 'date'

const BookingExtend: React.FC<BookingsScreenProps<'BookingExtend'>> = ({
  navigation,
  route,
}) => {
  const theme = useTheme()
  const [dateTimePickerVisible, setDateTimePickerVisible] = useState(false)
  const [date, setDate] = useState(new Date())
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    // Initialise date
    const minutesToSubtract = moment().minutes() % 15
    const newDate = moment().subtract(minutesToSubtract, 'minutes').toDate()
    setDate(newDate)
    setNow(newDate)
  }, [])

  const bookingDetails = useCallback(() => {
    return [
      {title: STRINGS.DRIVER_NAME, value: route.params.booking.driver?.name},
      {
        title: STRINGS.DESTINATION,
        value:
          route.params.booking.destination?.name === ''
            ? STRINGS.NA
            : route.params.booking.destination?.name,
      },
      {
        title: STRINGS.START_DATE_TIME,
        value: moment(route.params.booking?.start_datetime?.original).format(
          'DD/MM/YYYY, hh:mm A',
        ),
      },
      {title: STRINGS.BRANCH, value: route.params.booking.branch?.name},
    ]
  }, [route.params.booking])

  const renderDetails = (title: string, value: any) => (
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
      </Layout>
    </Layout>
  )

  const DateAndTimeSection = () => (
    <Layout>
      <TouchableOpacity
        style={styles.dateOuterWrapper}
        activeOpacity={0.6}
        onPress={() => {
          dateTimePickerMode = 'date'
          setDateTimePickerVisible(true)
        }}>
        <Layout
          style={[
            styles.dateWrapper,
            {backgroundColor: theme['background-basic-color-3']},
          ]}>
          <Text style={styles.text}>{moment(date).format(DATE_PATTERN)}</Text>
        </Layout>
        <Layout
          style={[
            styles.dateIconWrapper,
            {backgroundColor: theme['background-basic-color-3']},
          ]}>
          <Calendar color="grey" height={18} width={18} />
        </Layout>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.dateOuterWrapper}
        activeOpacity={0.6}
        onPress={() => {
          dateTimePickerMode = 'time'
          setDateTimePickerVisible(true)
        }}>
        <Layout
          style={[
            styles.dateWrapper,
            {backgroundColor: theme['background-basic-color-3']},
          ]}>
          <Text style={styles.text}>{moment(date).format(TIME_PATTERN)}</Text>
        </Layout>
        <Layout
          style={[
            styles.dateIconWrapper,
            {backgroundColor: theme['background-basic-color-3']},
          ]}>
          <Clock color="grey" height={18} width={18} />
        </Layout>
      </TouchableOpacity>
    </Layout>
  )

  const handleConfirm = useCallback(
    (date: Date) => {
      console.log('A date has been picked: ', date)
      setDateTimePickerVisible(false)
      setDate(date)
    },
    [now],
  )

  const submitPress = () => {
    navigation.goBack()
    controller.extendBooking(
      route.params.eventEmitter,
      Number(route.params.booking.pk),
      moment(route.params.booking.start_datetime?.original).toDate(),
      date,
    )
  }

  return (
    <SafeAreaView
      style={styles.safeAreaView}
      edges={['bottom', 'left', 'right']}>
      <Layout style={styles.container}>
        <ScrollView>
          <Text category="s1" style={styles.headerText}>
            {STRINGS.LABEL_EXTEND_BOOKING}
          </Text>
          <Divider
            style={[
              styles.divider,
              {backgroundColor: theme['color-primary-default']},
            ]}
          />
          <Layout style={styles.detailsWrapper}>
            {bookingDetails().map(({title, value}) =>
              renderDetails(title, value),
            )}
            <DateAndTimeSection />
          </Layout>
          <Layout style={styles.buttonWrapper}>
            <Button
              style={styles.button}
              disabled={false}
              onPress={() => {
                navigation.goBack()
              }}
              appearance="ghost">
              {STRINGS.BUTTON_CANCEL}
            </Button>
            <Button
              style={styles.button}
              disabled={false}
              onPress={submitPress}>
              {STRINGS.BUTTON_SUBMIT}
            </Button>
          </Layout>
        </ScrollView>
      </Layout>
      <DateTimePickerModal
        isVisible={dateTimePickerVisible}
        headerTextIOS={
          dateTimePickerMode === 'time' ? STRINGS.PICK_TIME : STRINGS.PICK_DATE
        }
        date={date}
        minimumDate={now}
        mode={dateTimePickerMode}
        onConfirm={handleConfirm}
        minuteInterval={5}
        onCancel={() => setDateTimePickerVisible(false)}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  container: {
    marginHorizontal: 24,
    borderRadius: 8,
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
  buttonWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: 10,
  },
  button: {
    marginRight: 12,
    marginVertical: 12,
    minWidth: 90,
  },
  pageWrapper: {
    marginHorizontal: 12,
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
  detailsWrapper: {
    marginHorizontal: 12,
  },
  dateOuterWrapper: {
    flex: 1,
    borderWidth: 0.5,
    flexDirection: 'row',
    borderRadius: 4,
    borderColor: 'grey',
    marginVertical: 8,
  },
  dateWrapper: {
    flex: 4,
    padding: 10,
    marginBottom: 2,
    borderTopStartRadius: 4,
    borderBottomStartRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
  },
  dateIconWrapper: {
    flex: 1,
    padding: 10,
    borderTopEndRadius: 4,
    borderBottomEndRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default BookingExtend
