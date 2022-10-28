import React, {useState, useContext, useCallback, useEffect} from 'react'
import {StyleSheet, StatusBar, TouchableOpacity} from 'react-native'
import {
  createMaterialTopTabNavigator,
  MaterialTopTabBarProps,
} from '@react-navigation/material-top-tabs'
import {
  TabBar,
  Tab,
  TopNavigation,
  Input,
  Icon,
  Text,
  OverflowMenu,
  MenuItem,
  TopNavigationAction,
  IndexPath,
  Layout,
  useTheme,
} from '@ui-kitten/components'

import BookingsListScreen from '../screens/bookings/BookingsList'
import BookingsListCalendarScreen from '../screens/bookings/BookingsListCalendar'
import {SafeAreaView} from '@components'
import STRINGS from './strings'
import {BookingContext} from '@contexts'
import {EventEmitter} from '@react-native-granite/core'
import {BOOKING_EVENTS, controller} from '@bookings'
import {useNavigation} from '@react-navigation/native'

// Global Constants
const TopTab = createMaterialTopTabNavigator()
const eventEmitter = new EventEmitter()

// Global Variables
let timerID: number | null = null

function BookingsTabs() {
  const theme = useTheme()
  const navigation = useNavigation()

  const {
    setSearchText,
    searchText,
    bookingFilters,
    setBookingFilters,
    activeFilters,
    setActiveFilters,
    todayBooking,
    upcomingBooking,
    pastBooking,
    inProgressBooking,
  } = useContext(BookingContext)

  const [menuVisible, setMenuVisible] = useState(false)
  const [focussedTab, setFocussedTab] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<IndexPath>(
    new IndexPath(0),
  )
  const [filtersVisible, setFiltersVisible] = useState(
    bookingFilters.length > 1,
  )

  useEffect(() => {
    const subscription = eventEmitter.getObservable().subscribe(event => {
      switch (event.type) {
        case BOOKING_EVENTS.LOAD_BOOKING_FILTERS_START:
          setFiltersVisible(false)
          break
        case BOOKING_EVENTS.LOAD_BOOKING_FILTERS_SUCCESS:
          setBookingFilters(event.data)
          setFiltersVisible(true)
          break
        case BOOKING_EVENTS.LOAD_BOOKING_FILTERS_FAILURE:
          setFiltersVisible(false)
          break
      }
    })

    if (bookingFilters.length < 1) controller.getBookingFilters(eventEmitter)
    return () => subscription.unsubscribe()
  }, [])

  const toggleMenu = () => {
    setMenuVisible(!menuVisible)
  }

  const renderMenuAction = () => (
    <TopNavigationAction
      icon={props => <Icon {...props} name="more-vertical" fill="white" />}
      onPress={toggleMenu}
    />
  )

  const updateSearchText = useCallback((text: string) => {
    if (timerID) clearTimeout(timerID)

    timerID = setTimeout(() => {
      setSearchText(text)
    }, 500)
  }, [])

  const applyFilters = useCallback(
    (data: {category: string; selectedValues: string[]}[]) => {
      setActiveFilters(data)
    },
    [setActiveFilters],
  )

  const onFilterPress = useCallback(() => {
    navigation.navigate('BookingsStack', {
      screen: 'VehicleFilters',
      params: {
        filters: bookingFilters,
        selectedFilters: activeFilters,
        onApply: applyFilters,
      },
    })
  }, [bookingFilters, activeFilters, navigation, applyFilters])

  const renderOverflowMenuAction = () => (
    <>
      {filtersVisible && (
        <TouchableOpacity activeOpacity={0.7} onPress={onFilterPress}>
          <Icon name="funnel" fill="white" style={styles.filterIcon} />
        </TouchableOpacity>
      )}
      <OverflowMenu
        anchor={renderMenuAction}
        visible={menuVisible}
        onBackdropPress={toggleMenu}
        selectedIndex={selectedIndex}
        onSelect={index => {
          setSelectedIndex(index)
          toggleMenu()
        }}>
        <MenuItem title={STRINGS.MENU_ITEM_LIST_VIEW} />
        <MenuItem title={STRINGS.MENU_ITEM_WEEK_VIEW} />
        <MenuItem title={STRINGS.MENU_ITEM_DAILY_VIEW} />
      </OverflowMenu>
    </>
  )

  const TabView = (count: number, text: string, tabNumber?: number) => (
    <Layout style={styles.topTabTextContainer}>
      <Text
        category="p2"
        style={[
          styles.topTabText,
          focussedTab == tabNumber
            ? {color: theme['color-primary-default']}
            : {color: 'grey'},
        ]}>
        {text}
      </Text>
      <Text
        category="c1"
        style={[
          styles.topTabText,
          focussedTab == tabNumber
            ? {color: theme['color-primary-default']}
            : {color: 'grey'},
        ]}>{`(${count})`}</Text>
    </Layout>
  )

  const changeTabColor = (tabNumber: number) => {}

  const CustomTopTabs = ({navigation, state}: MaterialTopTabBarProps) => (
    <Layout>
      <TabBar
        selectedIndex={state.index}
        style={styles.tabWrapper}
        onSelect={index => {
          setFocussedTab(index)
          navigation.navigate(state.routeNames[index])
        }}>
        <Tab title={TabView(todayBooking, STRINGS.TODAY_TITLE, 0)} />
        <Tab title={TabView(upcomingBooking, STRINGS.UPCOMING_TITLE, 1)} />
        <Tab title={TabView(pastBooking, STRINGS.PAST_TITLE, 2)} />
        <Tab title={TabView(inProgressBooking, STRINGS.IN_PROGRESS_TITLE, 3)} />
      </TabBar>
    </Layout>
  )

  return (
    <>
      <SafeAreaView
        style={{backgroundColor: theme['color-primary-default']}}
        edges={['top', 'left', 'right']}>
        <StatusBar
          backgroundColor={theme['color-primary-default']}
          barStyle="light-content"
        />
        <TopNavigation
          alignment="center"
          title={evaProps => (
            <Text
              {...evaProps}
              style={{color: 'white', fontSize: 18}}
              category="s1">
              {STRINGS.LABEL_BOOKINGS}
            </Text>
          )}
          accessoryRight={renderOverflowMenuAction}
          style={{backgroundColor: theme['color-primary-default']}}
        />
      </SafeAreaView>
      <Layout style={{paddingTop: 12}}>
        <Input
          defaultValue={searchText}
          style={styles.searchWrapper}
          placeholder={STRINGS.SEARCH_BOOKINGS}
          onChangeText={updateSearchText}
          accessoryRight={props => (
            <Icon
              {...props}
              name="search-outline"
              fill={theme['color-primary-default']}
            />
          )}
          autoCorrect={false}
        />
      </Layout>
      {selectedIndex.row >= 1 ? (
        <BookingsListCalendarScreen showWeekly={selectedIndex.row === 1} />
      ) : (
        <TopTab.Navigator tabBar={CustomTopTabs} backBehavior="initialRoute">
          <TopTab.Screen name="Today" component={BookingsListScreen} />
          <TopTab.Screen name="Upcoming" component={BookingsListScreen} />
          <TopTab.Screen name="Past" component={BookingsListScreen} />
          <TopTab.Screen name="In-Progress" component={BookingsListScreen} />
        </TopTab.Navigator>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  tabWrapper: {
    paddingVertical: 8,
  },
  searchWrapper: {
    marginHorizontal: 12,
    marginBottom: 6,
    borderRadius: 8,
  },
  filterIcon: {
    height: 24,
    width: 24,
  },
  topTabTextContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  topTabText: {
    alignSelf: 'center',
    fontWeight: 'bold',
  },
  topTabCount: {
    alignSelf: 'center',
  },
})

export default BookingsTabs
