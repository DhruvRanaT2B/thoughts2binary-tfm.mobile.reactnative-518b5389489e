import React, {useEffect, useState, useCallback, useContext} from 'react'
import {StyleSheet} from 'react-native'
import {Icon} from '@ui-kitten/components'
import {useNavigation} from '@react-navigation/native'

import {EventCalendar, FloatingActionButton} from '@components'
import {BookingsListCalendarProps, CalendarEvent} from 'types'
import {EventEmitter} from '@react-native-granite/core'
import {BOOKING_EVENTS, controller} from '@bookings'
import {BookingContext} from '@contexts'
import {FILTERS} from '@constants'

// Global Constants
const eventEmitter = new EventEmitter()

const BookingsListCalendar: React.FC<BookingsListCalendarProps> = ({
  showWeekly,
}) => {
  const {searchText, activeFilters} = useContext(BookingContext)
  const [events, setEvents] = useState<CalendarEvent[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [date, setDate] = useState(new Date())
  const [lastSearch, setLastSearch] = useState(searchText)
  const [lastActiveFilters, setLastActiveFilters] = useState(activeFilters)

  const navigation = useNavigation()

  useEffect(() => {
    const subscription = eventEmitter.getObservable().subscribe(event => {
      switch (event.type) {
        case BOOKING_EVENTS.LOAD_BOOKING_LIST_START:
          setIsLoading(true)
          break
        case BOOKING_EVENTS.LOAD_BOOKING_LIST_SUCCESS:
          setIsLoading(false)
          setEvents(event.data)
          break
        case BOOKING_EVENTS.LOAD_BOOKING_LIST_FAILURE:
          setIsLoading(false)
          setEvents([])
          break
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (lastSearch !== searchText || activeFilters !== lastActiveFilters) {
      setLastSearch(searchText)
      setLastActiveFilters(activeFilters)
      controller.getCalendarBookings(eventEmitter, {
        date,
        showWeekly,
        search: searchText,
        bookingType: activeFilters.filter(
          item => item.category === FILTERS.BOOKING_TYPE,
        )[0]?.selectedValues,
        status: activeFilters.filter(
          item => item.category === FILTERS.STATUS,
        )[0]?.selectedValues,
        branch: activeFilters.filter(
          item => item.category === FILTERS.BRANCH,
        )[0]?.selectedValues,
        purposeOfTrip: activeFilters.filter(
          item => item.category === FILTERS.PURPOSE_OF_TRIP,
        )[0]?.selectedValues,
        costCentre: activeFilters.filter(
          item => item.category === FILTERS.COST_CENTRE,
        )[0]?.selectedValues,
      })
    }
  }, [
    lastSearch,
    searchText,
    showWeekly,
    date,
    activeFilters,
    lastActiveFilters,
  ])

  const onDateChange = useCallback(
    (calendarDate: Date) => {
      setDate(calendarDate)
      controller.getCalendarBookings(eventEmitter, {
        date: calendarDate,
        showWeekly,
        search: searchText,
        bookingType: activeFilters.filter(
          item => item.category === FILTERS.BOOKING_TYPE,
        )[0]?.selectedValues,
        status: activeFilters.filter(
          item => item.category === FILTERS.STATUS,
        )[0]?.selectedValues,
        branch: activeFilters.filter(
          item => item.category === FILTERS.BRANCH,
        )[0]?.selectedValues,
        purposeOfTrip: activeFilters.filter(
          item => item.category === FILTERS.PURPOSE_OF_TRIP,
        )[0]?.selectedValues,
        costCentre: activeFilters.filter(
          item => item.category === FILTERS.COST_CENTRE,
        )[0]?.selectedValues,
      })
    },
    [showWeekly, searchText, activeFilters],
  )

  const onEventPress = useCallback(
    (event: CalendarEvent) => {
      navigation.navigate('BookingsStack', {
        screen: 'BookingDetail',
        params: {bookingID: event.id},
      })
    },
    [navigation],
  )

  const onFabPress = useCallback(() => {
    navigation.navigate('BookingsStack')
  }, [navigation])

  return (
    <>
      <EventCalendar
        date={date}
        onDateChange={onDateChange}
        events={events}
        showWeekly={showWeekly}
        isLoading={isLoading}
        onEventPress={onEventPress}
      />
      <FloatingActionButton style={styles.fab} onPress={onFabPress}>
        <Icon name="plus-outline" fill="white" style={styles.fabIcon} />
      </FloatingActionButton>
    </>
  )
}

const styles = StyleSheet.create({
  fab: {
    alignSelf: 'flex-end',
    end: 16,
    bottom: 16,
    borderRadius: 32,
  },
  fabIcon: {
    width: 32,
    height: 32,
    margin: 4,
  },
})

export default BookingsListCalendar
