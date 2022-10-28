import React, {useCallback, useState, useEffect, useContext} from 'react'
import {StyleSheet} from 'react-native'
import {Layout, List, Spinner, Text} from '@ui-kitten/components'

import {IncidentListItem} from './components/IncidentListItem'
import {EventEmitter} from '@react-native-granite/core'
import {STRINGS} from './strings'
import {IncidentTabsProps} from 'types'
import {entity, controller, INCIDENT_EVENTS} from '@incidents'
import {AuthContext, IncidentContext} from '@contexts'
import {FILTERS} from '@constants'

const OpenIncidents: React.FC<IncidentTabsProps<'Open'>> = ({
  navigation,
  route,
}) => {
  const {searchText, activeFilters, setOpenIncident, setHistoricalIncident} =
    useContext(IncidentContext)

  const {employeeID, userRole} = useContext(AuthContext)

  const [incidents, setIncidents] = useState<entity.Incident[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isPaging, setIsPaging] = useState(false)
  const [nextPage, setNextPage] = useState<null | number>(null)
  const [eventEmitter] = useState(new EventEmitter())
  const [lastSearch, setLastSearch] = useState(searchText)
  const [isSearching, setIsSearching] = useState(false)
  const [lastActiveFilters, setLastActiveFilters] = useState(activeFilters)

  useEffect(() => {
    const subscription = eventEmitter.getObservable().subscribe(event => {
      switch (event.type) {
        case INCIDENT_EVENTS.LOAD_INCIDENT_LIST_START:
          setIsLoading(true)
          break
        case INCIDENT_EVENTS.LOAD_INCIDENT_LIST_SUCCESS:
          setIsLoading(false)
          setIsRefreshing(false)
          setIsPaging(false)
          setIsSearching(false)
          if (route.name === 'Open') {
            setOpenIncident(event.data.count)
          } else {
            setHistoricalIncident(event.data.count)
          }
          setNextPage(event.data.nextPage)
          setIncidents(event.data.list)
          break
        case INCIDENT_EVENTS.LOAD_INCIDENT_LIST_FAILURE:
          setIsLoading(false)
          setIsRefreshing(false)
          setIsPaging(false)
          setIsSearching(false)
          setNextPage(null)
          setIncidents([])
          if (route.name === 'Open') {
            setOpenIncident(0)
          } else {
            setHistoricalIncident(0)
          }
          break
      }
    })
    controller.getIncidents(eventEmitter, {
      currentList: [],
      pageNumber: 1,
      incidentStatus: route.name === 'Open' ? '!Completed' : 'Completed',
      search: searchText,
      incidentType: activeFilters.filter(
        item => item.category === FILTERS.INCIDENT_TYPE,
      )[0]?.selectedValues,
      incidentSubType: activeFilters.filter(
        item => item.category === FILTERS.INCIDENT_SUB_TYPE,
      )[0]?.selectedValues,
      isCritical: activeFilters
        .filter(item => item.category === FILTERS.IS_CRITICAL)[0]
        ?.selectedValues.join(),
      isVerified: activeFilters
        .filter(item => item.category === FILTERS.IS_VERIFIED)[0]
        ?.selectedValues.join(),
      vehicleName: activeFilters.filter(
        item => item.category === FILTERS.VEHICLE_NAME,
      )[0]?.selectedValues,
      employeeId: userRole === 'Driver' ? employeeID : undefined,
    })

    return () => subscription.unsubscribe()
  }, [])

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
      ) : null,
    [isPaging],
  )

  const onEndReached = useCallback(() => {
    if (nextPage) {
      setIsPaging(true)
      controller.getIncidents(eventEmitter, {
        pageNumber: nextPage,
        currentList: incidents,
        incidentStatus: route.name === 'Open' ? '!Completed' : 'Completed',
        search: lastSearch,
        incidentType: lastActiveFilters.filter(
          item => item.category === FILTERS.INCIDENT_TYPE,
        )[0]?.selectedValues,
        incidentSubType: lastActiveFilters.filter(
          item => item.category === FILTERS.INCIDENT_SUB_TYPE,
        )[0]?.selectedValues,
        isCritical: lastActiveFilters
          .filter(item => item.category === FILTERS.IS_CRITICAL)[0]
          ?.selectedValues.join(),
        isVerified: lastActiveFilters
          .filter(item => item.category === FILTERS.IS_VERIFIED)[0]
          ?.selectedValues.join(),
        vehicleName: lastActiveFilters.filter(
          item => item.category === FILTERS.VEHICLE_NAME,
        )[0]?.selectedValues,
        employeeId: userRole === 'Driver' ? employeeID : undefined,
      })
    }
  }, [eventEmitter, nextPage, incidents, route, lastSearch, lastActiveFilters])

  const onRefresh = useCallback(() => {
    setIsRefreshing(true)
    controller.getIncidents(eventEmitter, {
      pageNumber: 1,
      currentList: incidents,
      incidentStatus: route.name === 'Open' ? '!Completed' : 'Completed',
      search: lastSearch,
      incidentType: lastActiveFilters.filter(
        item => item.category === FILTERS.INCIDENT_TYPE,
      )[0]?.selectedValues,
      incidentSubType: lastActiveFilters.filter(
        item => item.category === FILTERS.INCIDENT_SUB_TYPE,
      )[0]?.selectedValues,
      isCritical: lastActiveFilters
        .filter(item => item.category === FILTERS.IS_CRITICAL)[0]
        ?.selectedValues.join(),
      isVerified: lastActiveFilters
        .filter(item => item.category === FILTERS.IS_VERIFIED)[0]
        ?.selectedValues.join(),
      vehicleName: lastActiveFilters.filter(
        item => item.category === FILTERS.VEHICLE_NAME,
      )[0]?.selectedValues,
      employeeId: userRole === 'Driver' ? employeeID : undefined,
    })
  }, [eventEmitter, incidents, route, lastSearch, lastActiveFilters])

  useEffect(() => {
    if (searchText !== lastSearch || activeFilters !== lastActiveFilters) {
      setLastActiveFilters(activeFilters)
      setLastSearch(searchText)
      setIsSearching(true)
      controller.getIncidents(eventEmitter, {
        pageNumber: 1,
        currentList: [],
        search: searchText,
        incidentStatus: route.name === 'Open' ? '!Completed' : 'Completed',
        incidentType: activeFilters.filter(
          item => item.category === FILTERS.INCIDENT_TYPE,
        )[0]?.selectedValues,
        incidentSubType: activeFilters.filter(
          item => item.category === FILTERS.INCIDENT_SUB_TYPE,
        )[0]?.selectedValues,
        isCritical: activeFilters
          .filter(item => item.category === FILTERS.IS_CRITICAL)[0]
          ?.selectedValues.join(),
        isVerified: activeFilters
          .filter(item => item.category === FILTERS.IS_VERIFIED)[0]
          ?.selectedValues.join(),
        vehicleName: activeFilters.filter(
          item => item.category === FILTERS.VEHICLE_NAME,
        )[0]?.selectedValues,
        employeeId: userRole === 'Driver' ? employeeID : undefined,
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

  const ListEmptyComponent = useCallback(() => {
    return (
      <Text status="primary" style={{textAlign: 'center'}} category="s1">
        {' '}
        {STRINGS.LABEL_NO_INCIDENTS}
      </Text>
    )
  }, [])

  if ((isLoading || isSearching) && !isPaging && !isRefreshing)
    return (
      <Layout style={styles.loaderWrapper}>
        <Spinner />
      </Layout>
    )

  return (
    <Layout style={styles.container}>
      <List
        data={incidents}
        style={styles.list}
        keyExtractor={(item: entity.Incident) => String(item.pk)}
        renderItem={({item}: {item: entity.Incident}) => (
          <IncidentListItem
            item={item}
            onCardPress={() =>
              // @ts-ignore
              navigation.navigate('IncidentStack', {
                screen: 'IncidentDetails',
                params: {id: item.pk},
              })
            }
          />
        )}
        ItemSeparatorComponent={ItemSeparator}
        ListFooterComponent={ListFooter}
        onEndReachedThreshold={0.5}
        onEndReached={onEndReached}
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={
          incidents.length < 1 && styles.emptyComponentContainer
        }
      />
    </Layout>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 12,
  },
  list: {
    backgroundColor: 'transparent',
    paddingHorizontal: 10,
  },
  separator: {
    height: 10,
  },
  loaderWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLoaderContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  emptyComponentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default OpenIncidents
