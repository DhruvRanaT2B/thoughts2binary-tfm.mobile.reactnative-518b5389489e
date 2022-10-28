import React, {useState, useEffect, useCallback} from 'react'
import {StyleSheet, TouchableOpacity} from 'react-native'
import {
  Layout,
  Spinner,
  List,
  Text,
  Icon,
  Button,
  Select,
  IndexPath,
  SelectItem,
} from '@ui-kitten/components'

import VehicleListItem from './components/VehicleListItem'
import STRINGS from './strings'
import {BookingsScreenProps} from 'types'
import NoBookingsAvailable from '@images/NoBookingsAvailable.svg'
import {EventEmitter} from '@react-native-granite/core'
import {BOOKING_EVENTS, controller, entity} from '@bookings'
import {SafeAreaView} from '@components'
import {FILTERS} from '@constants'
import {controller as AccountsController, AUTH_EVENTS} from '@accounts'

// Global constants
const eventEmitter = new EventEmitter()

const SORT_OPTIONS: {label: string; value: string}[] = [
  {label: STRINGS.SORT_ODO_ASC, value: 'odometer_reading'},
  {label: STRINGS.SORT_ODO_DESC, value: '-odometer_reading'},
  {label: STRINGS.SORT_NAME_ASC, value: 'name'},
  {label: STRINGS.SORT_NAME_DESC, value: '-name'},
]

const SelectVehicle: React.FC<BookingsScreenProps<'SelectVehicle'>> = ({
  navigation,
  route,
}) => {
  const {startDate, endDate, endOnDate, booking, driverPK, branch} =
    route.params
  const [isLoading, setIsLoading] = useState(true)
  const [vehicles, setVehicles] = useState<entity.BookingVehicle[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isPaging, setIsPaging] = useState(false)
  const [nextPage, setNextPage] = useState<null | number>(null)
  const [filtersVisible, setFiltersVisible] = useState(false)
  const [filters, setFilters] = useState<
    {category: FILTERS; values: string[]; multiSelect: boolean}[]
  >([])
  const [selectedFilters, setSelectedFilters] = useState<
    {category: string; selectedValues: string[]}[]
  >([])
  const [selectedVehicleID, setSelectedVehicleID] = useState(
    booking?.vehicle?.pk,
  )
  const [showSortBy, setShowSortBy] = useState(false)
  const [selectedSortOption, setSelectedSortOption] = useState<IndexPath>()

  useEffect(() => {
    if (booking) {
      navigation.setOptions({headerTitle: STRINGS.LABEL_EDIT_BOOKING})
    }
  }, [navigation])

  const applyFilters = useCallback(
    (data: {category: string; selectedValues: string[]}[]) => {
      setSelectedFilters(data)
      controller.getVehicles(eventEmitter, {
        pageNumber: 1,
        currentList: vehicles,
        bookingID: booking?.pk,
        startDate,
        endDate,
        driverID: driverPK,
        branchID: branch.pk!!,
        vehicleClass: data.filter(
          item => item.category === FILTERS.VEHICLE_CLASS,
        )[0]?.selectedValues,
        bodyType: data.filter(item => item.category === FILTERS.BODY_TYPE)[0]
          ?.selectedValues,
        costCentre: data.filter(
          item => item.category === FILTERS.COST_CENTRE,
        )[0]?.selectedValues,
        fuelType: data.filter(item => item.category === FILTERS.FUEL_TYPE)[0]
          ?.selectedValues,
        grade: data.filter(item => item.category === FILTERS.GRADE)[0]
          ?.selectedValues,
        seats: data.filter(item => item.category === FILTERS.SEATS)[0]
          ?.selectedValues,
        doors: data.filter(item => item.category === FILTERS.DOORS)[0]
          ?.selectedValues,
        year: data.filter(item => item.category === FILTERS.YEAR)[0]
          ?.selectedValues,
        odoReading: data
          .filter(item => item.category === FILTERS.ODOMETER)[0]
          ?.selectedValues.join(),
        ordering:
          selectedSortOption && SORT_OPTIONS[selectedSortOption.row].value,
      })
    },
    [vehicles, selectedSortOption],
  )

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        if (filtersVisible)
          return (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate('VehicleFilters', {
                  filters,
                  selectedFilters,
                  onApply: applyFilters,
                })
              }>
              <Icon
                name="options-2-outline"
                style={styles.filterIcon}
                fill="white"
              />
            </TouchableOpacity>
          )
      },
    })
  }, [filtersVisible, filters, selectedFilters, applyFilters])

  useEffect(() => {
    const subscription = eventEmitter.getObservable().subscribe(event => {
      switch (event.type) {
        case BOOKING_EVENTS.LOAD_VEHICLE_START:
          setIsLoading(true)
          break
        case BOOKING_EVENTS.LOAD_VEHICLE_SUCCESS:
          setIsLoading(false)
          setIsRefreshing(false)
          setIsPaging(false)
          setNextPage(event.data.nextPage)
          setVehicles(event.data.list)
          break
        case BOOKING_EVENTS.LOAD_VEHICLE_FAILURE:
          setIsLoading(false)
          setIsRefreshing(false)
          setIsPaging(false)
          setNextPage(null)
          setVehicles([])
          break

        case BOOKING_EVENTS.LOAD_VEHICLE_FILTERS_START:
          setFiltersVisible(false)
          break
        case BOOKING_EVENTS.LOAD_VEHICLE_FILTERS_SUCCESS:
          setFilters(event.data)
          setFiltersVisible(true)
          break
        case BOOKING_EVENTS.LOAD_VEHICLE_FILTERS_FAILURE:
          setFiltersVisible(false)
          break

        case AUTH_EVENTS.LOAD_DISPLAY_PRIORITY_START:
          break
        case AUTH_EVENTS.LOAD_DISPLAY_PRIORITY_SUCCESS:
          if (event.data && event.data.value === 'Manual') setShowSortBy(true)
          break
        case AUTH_EVENTS.LOAD_DISPLAY_PRIORITY_FAILURE:
          break
      }
    })

    controller.getVehicles(eventEmitter, {
      pageNumber: 1,
      currentList: vehicles,
      bookingID: booking?.pk,
      startDate,
      endDate,
      driverID: driverPK,
      branchID: branch.pk!!,
    })
    controller.getVehicleFilters(eventEmitter)
    AccountsController.getDisplayPriority(eventEmitter)
    return () => subscription.unsubscribe()
  }, [])

  const ItemSeparator = useCallback(
    () => <Layout style={styles.separator} />,
    [],
  )

  const renderOption = useCallback(
    (title: string, key: string) => <SelectItem title={title} key={key} />,
    [],
  )

  const ListFooterComponent = useCallback(
    () =>
      isPaging ? (
        <Layout style={styles.footerLoaderContainer}>
          <Spinner />
        </Layout>
      ) : null,
    [isPaging],
  )

  const onEndReached = useCallback(() => {
    if (nextPage) {
      setIsPaging(true)
      controller.getVehicles(eventEmitter, {
        pageNumber: nextPage,
        currentList: vehicles,
        bookingID: booking?.pk,
        startDate,
        endDate,
        driverID: driverPK,
        branchID: branch.pk!!,
        vehicleClass: selectedFilters.filter(
          item => item.category === FILTERS.VEHICLE_CLASS,
        )[0]?.selectedValues,
        bodyType: selectedFilters.filter(
          item => item.category === FILTERS.BODY_TYPE,
        )[0]?.selectedValues,
        costCentre: selectedFilters.filter(
          item => item.category === FILTERS.COST_CENTRE,
        )[0]?.selectedValues,
        fuelType: selectedFilters.filter(
          item => item.category === FILTERS.FUEL_TYPE,
        )[0]?.selectedValues,
        grade: selectedFilters.filter(
          item => item.category === FILTERS.GRADE,
        )[0]?.selectedValues,
        seats: selectedFilters.filter(
          item => item.category === FILTERS.SEATS,
        )[0]?.selectedValues,
        doors: selectedFilters.filter(
          item => item.category === FILTERS.DOORS,
        )[0]?.selectedValues,
        year: selectedFilters.filter(item => item.category === FILTERS.YEAR)[0]
          ?.selectedValues,
        odoReading: selectedFilters
          .filter(item => item.category === FILTERS.ODOMETER)[0]
          ?.selectedValues.join(),
        ordering:
          selectedSortOption && SORT_OPTIONS[selectedSortOption.row].value,
      })
    }
  }, [nextPage, vehicles, selectedFilters, selectedSortOption])
  // ordering,
  // isRecurring,
  // endsOn,
  // recurringPattern,
  // daysOfWeek,
  // datesOfMonth,
  const onRefresh = useCallback(
    (sortIndex?: IndexPath) => {
      setIsRefreshing(true)
      controller.getVehicles(eventEmitter, {
        pageNumber: 1,
        currentList: vehicles,
        bookingID: booking?.pk,
        startDate,
        endDate,
        driverID: driverPK,
        branchID: branch.pk!!,
        vehicleClass: selectedFilters.filter(
          item => item.category === FILTERS.VEHICLE_CLASS,
        )[0]?.selectedValues,
        bodyType: selectedFilters.filter(
          item => item.category === FILTERS.BODY_TYPE,
        )[0]?.selectedValues,
        costCentre: selectedFilters.filter(
          item => item.category === FILTERS.COST_CENTRE,
        )[0]?.selectedValues,
        fuelType: selectedFilters.filter(
          item => item.category === FILTERS.FUEL_TYPE,
        )[0]?.selectedValues,
        grade: selectedFilters.filter(
          item => item.category === FILTERS.GRADE,
        )[0]?.selectedValues,
        seats: selectedFilters.filter(
          item => item.category === FILTERS.SEATS,
        )[0]?.selectedValues,
        doors: selectedFilters.filter(
          item => item.category === FILTERS.DOORS,
        )[0]?.selectedValues,
        year: selectedFilters.filter(item => item.category === FILTERS.YEAR)[0]
          ?.selectedValues,
        odoReading: selectedFilters
          .filter(item => item.category === FILTERS.ODOMETER)[0]
          ?.selectedValues.join(),
        ordering: sortIndex
          ? SORT_OPTIONS[sortIndex.row].value
          : selectedSortOption
          ? SORT_OPTIONS[selectedSortOption.row].value
          : undefined,
        isRecurring: route.params.isRecurring,
        endsOn: route.params.endOnDate,
        recurringPattern: route.params.recurringType,
        daysOfWeek:
          route.params.recurringType === 'Weekly'
            ? route.params.daysOfWeek
            : undefined,
        datesOfMonth:
          route.params.recurringType === 'Monthly'
            ? route.params.datesOfMonth
            : undefined,
      })
    },
    [vehicles, selectedFilters, selectedSortOption],
  )

  const ListHeaderComponent = useCallback(
    () => (
      <>
        <Text style={styles.titleText}>{STRINGS.LABEL_SELECT_VEHICLE}</Text>
        {showSortBy && (
          <Select
            size="small"
            style={styles.select}
            placeholder={STRINGS.PLACEHOLDER_SORT_BY}
            value={
              selectedSortOption && SORT_OPTIONS[selectedSortOption.row].label
            }
            selectedIndex={selectedSortOption}
            onSelect={index => {
              setSelectedSortOption(index as IndexPath)
              onRefresh(index as IndexPath)
            }}>
            {SORT_OPTIONS.map(item => renderOption(item.label, item.label))}
          </Select>
        )}
      </>
    ),
    [selectedSortOption, renderOption, showSortBy, onRefresh],
  )

  const ListEmptyComponent = useCallback(() => {
    return (
      <Layout style={styles.imageContainer}>
        <NoBookingsAvailable height={150} width={150} />
        <Text style={styles.noVehicle} category="c1" appearance="hint">
          {STRINGS.NO_VEHICLES_FOUND_1}{' '}
        </Text>
      </Layout>
    )
  }, [])

  const renderItem = useCallback(
    ({item}: {item: entity.BookingVehicle}) => (
      <VehicleListItem
        onSelectPress={() => {
          setSelectedVehicleID(item.pk)
          navigation.navigate('SelectBookingPurpose', {
            ...route.params,
            vehicle: item,
          })
        }}
        data={item}
        highlight={selectedVehicleID === item.pk}
      />
    ),
    [navigation, route, selectedVehicleID],
  )

  const onNextPress = useCallback(() => {
    navigation.navigate('SelectBookingPurpose', {
      ...route.params,
      vehicle: vehicles.filter(vehicle => vehicle.pk === selectedVehicleID)[0],
    })
  }, [navigation, route, selectedVehicleID, vehicles])

  if (isLoading && !isPaging && !isRefreshing)
    return (
      <SafeAreaView
        style={styles.loaderContainer}
        edges={['bottom', 'left', 'right']}>
        <Spinner />
      </SafeAreaView>
    )

  return (
    <SafeAreaView style={{flex: 1}} edges={['bottom', 'left', 'right']}>
      <List
        data={vehicles}
        style={styles.list}
        renderItem={renderItem}
        keyExtractor={(item: entity.BookingVehicle) => String(item.pk)}
        ItemSeparatorComponent={ItemSeparator}
        ListFooterComponent={ListFooterComponent}
        onEndReachedThreshold={0.5}
        contentContainerStyle={
          vehicles.length < 1 && styles.emptyComponentContainer
        }
        onEndReached={onEndReached}
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={ListEmptyComponent}
        ListHeaderComponent={ListHeaderComponent}
      />
      {selectedVehicleID &&
        vehicles.filter(vehicle => vehicle.pk === selectedVehicleID)[0] && (
          <Button style={styles.button} onPress={onNextPress}>
            {STRINGS.BUTTON_NEXT}
          </Button>
        )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  loaderContainer: {
    flex: 1,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  titleText: {
    marginVertical: 12,
    fontSize: 18,
    fontWeight: 'bold',
  },
  list: {
    backgroundColor: 'transparent',
    paddingHorizontal: 10,
  },
  separator: {
    height: 20,
  },
  filterIcon: {
    height: 24,
    width: 24,
    marginEnd: 8,
  },
  noVehicle: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 18,
  },
  footerLoaderContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  emptyComponentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  button: {
    marginBottom: 12,
    marginHorizontal: 10,
  },
  select: {
    marginBottom: 12,
  },
})

export default SelectVehicle
