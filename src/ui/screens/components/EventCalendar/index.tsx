import React, {useState, useEffect, useCallback} from 'react'
import {TouchableOpacity, Dimensions} from 'react-native'
import {
  Icon,
  useTheme,
  Layout,
  Text,
  useStyleSheet,
  StyleService,
  Spinner,
} from '@ui-kitten/components'
import _ from 'lodash'
import moment from 'moment'
import DateTimePickerModal from 'react-native-modal-datetime-picker'

import {DayView} from './DayView'
import {MonthView} from './MonthView'
import {CalendarEventMonthly, EventCalendarProps} from 'types'
import {produceSingleDayEvents} from './Packer'

const {width} = Dimensions.get('window')

const EventCalendar = ({
  date,
  onDateChange,
  format24h = false,
  scrollToFirst = true,
  showWeekly = false,
  formatHeader = 'DD MMM, YYYY',
  onEventPress = () => {},
  events,
  isLoading,
}: EventCalendarProps) => {
  const theme = useTheme()
  const styles = useStyleSheet(themedStyles)
  const [datePickerVisible, setDatePickerVisible] = useState(false)
  const [processedEvents, setProcessedEvents] = useState<
    CalendarEventMonthly[] | null
  >(null)

  const triggerDateChange = useCallback(() => {
    onDateChange(date)
  }, [onDateChange, date])

  useEffect(() => {
    setProcessedEvents(null)
    triggerDateChange()
  }, [showWeekly])

  useEffect(() => {
    if (events === null) return
    const data = produceSingleDayEvents(events)
    setProcessedEvents(data)
  }, [events])

  const handleConfirm = useCallback(
    (newDate: Date) => {
      setDatePickerVisible(false)
      setProcessedEvents(null)
      onDateChange(newDate)
    },
    [onDateChange],
  )

  const showDatePicker = useCallback(() => {
    if (!isLoading) setDatePickerVisible(true)
  }, [isLoading])

  const hideDatePicker = useCallback(() => {
    setDatePickerVisible(false)
  }, [])

  const getEvents = useCallback(() => {
    return _.filter(processedEvents, event => {
      const eventStartTime = moment(event.start)
      return (
        eventStartTime >=
          moment(date)
            .clone()
            .startOf(showWeekly ? 'week' : 'day') &&
        eventStartTime <=
          moment(date)
            .clone()
            .endOf(showWeekly ? 'week' : 'day')
      )
    })
  }, [processedEvents, date, showWeekly])

  const renderCalendar = () => {
    return showWeekly ? (
      <MonthView
        format24h={format24h}
        onEventPress={onEventPress}
        events={getEvents()}
        width={width}
      />
    ) : (
      <DayView
        format24h={format24h}
        onEventPress={onEventPress}
        events={getEvents()}
        width={width}
        scrollToFirst={scrollToFirst}
      />
    )
  }

  const renderSpinner = () => (
    <Layout style={styles.loaderWrapper}>
      <Spinner />
    </Layout>
  )

  return (
    <Layout style={[styles.container, {width}]}>
      <Layout style={styles.headerWrapper}>
        <TouchableOpacity
          style={styles.header}
          activeOpacity={0.8}
          onPress={showDatePicker}>
          <Text numberOfLines={1}>
            {showWeekly
              ? `${moment(date)
                  .startOf('week')
                  .format(formatHeader)} - ${moment(date)
                  .endOf('week')
                  .format(formatHeader)}`
              : moment(date).format(formatHeader)}
          </Text>
          <Icon
            name="arrow-down"
            style={styles.dropdown}
            fill={theme['background-alternative-color-1']}
          />
        </TouchableOpacity>
      </Layout>
      {isLoading || processedEvents === null
        ? renderSpinner()
        : renderCalendar()}
      <DateTimePickerModal
        isVisible={datePickerVisible}
        date={date}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </Layout>
  )
}

const themedStyles = StyleService.create({
  container: {
    flex: 1,
  },
  headerWrapper: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginVertical: 6,
  },
  header: {
    flexDirection: 'row',
    borderWidth: 1,
    alignItems: 'center',
    padding: 10,
    borderRadius: 4,
    justifyContent: 'space-between',
    borderColor: 'background-basic-color-4',
    flexGrow: 0.2,
  },
  dropdown: {
    width: 15,
    height: 15,
  },
  loaderWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export {EventCalendar}
