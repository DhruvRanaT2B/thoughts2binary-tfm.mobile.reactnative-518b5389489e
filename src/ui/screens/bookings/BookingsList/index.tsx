import React, {useEffect, useState, useCallback, useContext} from 'react'
import {Alert, StyleSheet} from 'react-native'
import {Layout, Button, Text, List, Icon, Spinner} from '@ui-kitten/components'

import STRINGS from './strings'
import {BookingListType, DashboardTabsProps} from 'types'
import NoBooking from '@images/NoBookings.svg'
import {FloatingActionButton} from '@components'
import {BookingListItem} from './components/BookingListItem'
import {EventEmitter} from '@react-native-granite/core'
import {BOOKING_EVENTS, controller, entity} from '@bookings'
import {AUTH_EVENTS, controller as AccountsController} from '@accounts'
import {AuthContext, BookingContext} from '@contexts'
import moment from 'moment'
import {FILTERS} from '@constants'

const BookingsList: React.FC<DashboardTabsProps<'Bookings'>> = ({
  navigation,
  route,
}) => {
  const {
    searchText,
    activeFilters,
    setTodayBooking,
    setUpcomingBooking,
    setPastBooking,
    setInProgressBooking,
  } = useContext(BookingContext)

  const [bookings, setBookings] = useState<entity.Booking[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isPaging, setIsPaging] = useState(false)
  const [nextPage, setNextPage] = useState<null | number>(null)
  const [eventEmitter] = useState(new EventEmitter())
  const [lastSearch, setLastSearch] = useState(searchText)
  const [lastActiveFilters, setLastActiveFilters] = useState(activeFilters)
  const [isSearching, setIsSearching] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const {setLicenseStatus} = useContext(AuthContext)

  const ItemSeparator = useCallback(
    () => <Layout style={styles.separator} />,
    [],
  )
  const ListFooter = useCallback(
    () =>
      isPaging ? (
        <Layout style={styles.footerLoaderContainer}>
          <Spinner />
        </Layout>
      ) : (
        <Layout style={styles.emptyBlock} />
      ),
    [isPaging],
  )

  const ListEmptyComponent = useCallback(
    () => (
      <>
        <NoBooking height={140} width={140} />
        <Text>{STRINGS.TEXT_NO_BOOKINGS}</Text>
        <Button onPress={onFabPress} style={styles.button}>
          {STRINGS.BUTTON_BOOK_NOW}
        </Button>
      </>
    ),
    [],
  )

  const onEndReached = useCallback(() => {
    if (nextPage) {
      setIsPaging(true)
      controller.getBookings(eventEmitter, {
        bookingCategory: route.name as BookingListType,
        pageNumber: nextPage,
        currentList: bookings,
        search: lastSearch,
        bookingType: lastActiveFilters.filter(
          item => item.category === FILTERS.BOOKING_TYPE,
        )[0]?.selectedValues,
        status: lastActiveFilters.filter(
          item => item.category === FILTERS.STATUS,
        )[0]?.selectedValues,
        branch: lastActiveFilters.filter(
          item => item.category === FILTERS.BRANCH,
        )[0]?.selectedValues,
        purposeOfTrip: lastActiveFilters.filter(
          item => item.category === FILTERS.PURPOSE_OF_TRIP,
        )[0]?.selectedValues,
        costCentre: lastActiveFilters.filter(
          item => item.category === FILTERS.COST_CENTRE,
        )[0]?.selectedValues,
      })
    }
  }, [nextPage, eventEmitter, route, bookings, lastSearch, lastActiveFilters])

  const onRefresh = useCallback(() => {
    setIsRefreshing(true)
    controller.getBookings(eventEmitter, {
      bookingCategory: route.name as BookingListType,
      pageNumber: 1,
      currentList: bookings,
      search: lastSearch,
      bookingType: lastActiveFilters.filter(
        item => item.category === FILTERS.BOOKING_TYPE,
      )[0]?.selectedValues,
      status: lastActiveFilters.filter(
        item => item.category === FILTERS.STATUS,
      )[0]?.selectedValues,
      branch: lastActiveFilters.filter(
        item => item.category === FILTERS.BRANCH,
      )[0]?.selectedValues,
      purposeOfTrip: lastActiveFilters.filter(
        item => item.category === FILTERS.PURPOSE_OF_TRIP,
      )[0]?.selectedValues,
      costCentre: lastActiveFilters.filter(
        item => item.category === FILTERS.COST_CENTRE,
      )[0]?.selectedValues,
    })
  }, [eventEmitter, route, bookings, lastSearch, lastActiveFilters])

  useEffect(() => {
    if (searchText !== lastSearch || activeFilters !== lastActiveFilters) {
      setLastActiveFilters(activeFilters)
      setLastSearch(searchText)
      setIsSearching(true)
      controller.getBookings(eventEmitter, {
        bookingCategory: route.name as BookingListType,
        pageNumber: 1,
        currentList: [],
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
    searchText,
    lastSearch,
    eventEmitter,
    route,
    activeFilters,
    lastActiveFilters,
  ])

  useEffect(() => {
    const subscription = eventEmitter.getObservable().subscribe(event => {
      switch (event.type) {
        case BOOKING_EVENTS.LOAD_BOOKING_LIST_START:
          setIsLoading(true)
          break
        case BOOKING_EVENTS.LOAD_BOOKING_LIST_SUCCESS:
          setIsLoading(false)
          setIsRefreshing(false)
          setIsPaging(false)
          setIsSearching(false)
          switch (route.name as BookingListType) {
            case 'Today':
              setTodayBooking(event.data.count)
              break
            case 'Upcoming':
              setUpcomingBooking(event.data.count)
              break
            case 'Past':
              setPastBooking(event.data.count)
              break
            case 'In-Progress':
              setInProgressBooking(event.data.count)
              break
          }
          setNextPage(event.data.nextPage)
          setBookings(event.data.list)
          break
        case BOOKING_EVENTS.LOAD_BOOKING_LIST_FAILURE:
          setIsLoading(false)
          setIsRefreshing(false)
          setIsPaging(false)
          setIsSearching(false)
          setNextPage(null)
          setBookings([])
          switch (route.name as BookingListType) {
            case 'Today':
              setTodayBooking(0)
              break
            case 'Upcoming':
              setUpcomingBooking(0)
              break
            case 'Past':
              setPastBooking(0)
              break
            case 'In-Progress':
              setInProgressBooking(0)
              break
          }
          break

        case BOOKING_EVENTS.DELETE_BOOKING_START:
          setIsDeleting(true)
          break
        case BOOKING_EVENTS.DELETE_BOOKING_SUCCESS:
          setIsDeleting(false)
          break
        case BOOKING_EVENTS.DELETE_BOOKING_FAILURE:
          setIsDeleting(false)
          Alert.alert('', event.data || STRINGS.SOMETHING_WENT_WRONG)
          break
        case AUTH_EVENTS.LOAD_PROFILE_SUCCESS:
          setLicenseStatus(event.data.employees_extension?.license_status ?? '')
          break
      }
    })
    controller.getBookings(eventEmitter, {
      bookingCategory: route.name as BookingListType,
      pageNumber: 1,
      currentList: bookings,
      search: searchText,
      bookingType: activeFilters.filter(
        item => item.category === FILTERS.BOOKING_TYPE,
      )[0]?.selectedValues,
      status: activeFilters.filter(item => item.category === FILTERS.STATUS)[0]
        ?.selectedValues,
      branch: activeFilters.filter(item => item.category === FILTERS.BRANCH)[0]
        ?.selectedValues,
      purposeOfTrip: activeFilters.filter(
        item => item.category === FILTERS.PURPOSE_OF_TRIP,
      )[0]?.selectedValues,
      costCentre: activeFilters.filter(
        item => item.category === FILTERS.COST_CENTRE,
      )[0]?.selectedValues,
    })

    if ((route.name as BookingListType) === 'Today') {
      AccountsController.getProfile(eventEmitter)
    }

    return () => subscription.unsubscribe()
  }, [])

  const onFabPress = useCallback(
    // @ts-ignore
    () => navigation.navigate('BookingsStack', {screen: 'AddNewBooking'}),
    [navigation],
  )

  const onCardPress = useCallback(
    (item: entity.Booking) => {
      //@ts-ignore
      navigation.navigate('BookingsStack', {
        screen: 'BookingDetail',
        params: {bookingID: item.pk},
      })
    },
    [navigation],
  )

  const onEditPress = useCallback(
    (item: entity.Booking) => {
      let difference = moment(item.start_datetime?.original).diff(
        moment(),
        'minutes',
      )
      if (difference >= 0) {
        // @ts-ignore
        navigation.navigate('BookingsStack', {
          screen: 'AddNewBooking',
          params: {booking: item},
        })
      } else Alert.alert('', STRINGS.EDIT_NOT_ALLOWED)
    },
    [navigation],
  )

  const onDeletePress = useCallback(
    (item: entity.Booking) => {
      Alert.alert(STRINGS.DELETE_BOOKING_TITLE, STRINGS.ARE_YOU_SURE, [
        {text: STRINGS.BUTTON_NO},
        {
          text: STRINGS.BUTTON_YES,
          onPress: async () => {
            await controller.deleteBooking(eventEmitter, item.pk!!)
            onRefresh()
          },
        },
      ])
    },
    [onRefresh],
  )

  if ((bookings.length < 1 && isLoading) || isSearching || isDeleting)
    return (
      <Layout style={styles.container}>
        <Spinner />
      </Layout>
    )
  else
    return (
      <Layout style={styles.listContainer}>
        <List
          data={bookings}
          style={styles.list}
          keyExtractor={(item: entity.Booking) => String(item.pk)}
          renderItem={({item}) => (
            <BookingListItem
              item={item}
              onCardPress={() => onCardPress(item)}
              onEditPress={() => onEditPress(item)}
              isEditable={(route.name as BookingListType) !== 'Past'}
              onDeletePress={() => onDeletePress(item)}
            />
          )}
          ItemSeparatorComponent={ItemSeparator}
          ListFooterComponent={ListFooter}
          onEndReachedThreshold={0.5}
          onEndReached={onEndReached}
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={ListEmptyComponent}
          contentContainerStyle={bookings.length < 1 && styles.container}
        />
        {bookings.length > 0 && (
          <FloatingActionButton style={styles.fab} onPress={onFabPress}>
            <Icon name="plus-outline" fill="white" style={styles.fabIcon} />
          </FloatingActionButton>
        )}
      </Layout>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    marginTop: 40,
    paddingHorizontal: 18,
  },
  list: {
    backgroundColor: 'transparent',
    paddingHorizontal: 10,
  },
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
  separator: {
    height: 10,
  },
  emptyBlock: {
    marginBottom: 100,
  },
  listContainer: {
    flex: 1,
    paddingTop: 12,
  },
  footerLoaderContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
})

export default BookingsList
