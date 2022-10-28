import React, {useContext, useCallback, useEffect, useState} from 'react'
import {StyleSheet, TouchableOpacity} from 'react-native'
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
  Layout,
  useTheme,
} from '@ui-kitten/components'

import IncidentListScreen from '../screens/incidents/IncidentList'
import {SafeAreaView} from '@components'
import {IncidentTabsParamList} from 'types'
import {EventEmitter} from '@react-native-granite/core'
import STRINGS from './strings'
import {IncidentContext} from '@contexts'
import {INCIDENT_EVENTS, controller} from '@incidents'
import {useNavigation} from '@react-navigation/native'

// Global Constants
const TopTab = createMaterialTopTabNavigator<IncidentTabsParamList>()
const eventEmitter = new EventEmitter()

// Global Variables
let timerID: number | null = null

function IncidentTabs() {
  const theme = useTheme()
  const navigation = useNavigation()

  const {
    searchText,
    setSearchText,
    incidentFilters,
    setIncidentFilters,
    activeFilters,
    setActiveFilters,
    openIncident,
    historicalIncident,
  } = useContext(IncidentContext)

  const [filtersVisible, setFiltersVisible] = useState(
    incidentFilters.length > 1,
  )

  const updateSearchText = useCallback((text: string) => {
    if (timerID) clearTimeout(timerID)

    timerID = setTimeout(() => {
      setSearchText(text)
    }, 500)
  }, [])

  useEffect(() => {
    const subscription = eventEmitter.getObservable().subscribe(event => {
      switch (event.type) {
        case INCIDENT_EVENTS.LOAD_INCIDENT_FILTERS_START:
          setFiltersVisible(false)
          break
        case INCIDENT_EVENTS.LOAD_INCIDENT_FILTERS_SUCCESS:
          setIncidentFilters(event.data)
          setFiltersVisible(true)
          break
        case INCIDENT_EVENTS.LOAD_INCIDENT_FILTERS_FAILURE:
          setFiltersVisible(false)
          break
      }
    })

    if (incidentFilters.length < 1) controller.getIncidentFilters(eventEmitter)
    return () => subscription.unsubscribe()
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
        filters: incidentFilters,
        selectedFilters: activeFilters,
        onApply: applyFilters,
      },
    })
  }, [incidentFilters, activeFilters, navigation, applyFilters])

  const CustomTopTabs = ({navigation, state}: MaterialTopTabBarProps) => (
    <>
      <SafeAreaView
        style={{backgroundColor: theme['color-primary-default']}}
        edges={['top', 'left', 'right']}>
        <TopNavigation
          alignment="center"
          title={evaProps => (
            <Text
              {...evaProps}
              style={{color: 'white', fontSize: 18}}
              category="s1">
              {STRINGS.LABEL_INCIDENTS}
            </Text>
          )}
          accessoryRight={() => {
            if (filtersVisible)
              return (
                <TouchableOpacity activeOpacity={0.7} onPress={onFilterPress}>
                  <Icon name="funnel" fill="white" style={styles.filterIcon} />
                </TouchableOpacity>
              )
            return <></>
          }}
          style={{backgroundColor: theme['color-primary-default']}}
        />
      </SafeAreaView>
      <Layout style={{paddingTop: 12}}>
        <Input
          defaultValue={searchText}
          onChangeText={updateSearchText}
          style={styles.searchWrapper}
          placeholder={STRINGS.SEARCH_INCIDENTS}
          accessoryRight={props => (
            <Icon
              {...props}
              name="search-outline"
              fill={theme['color-primary-default']}
            />
          )}
          autoCorrect={false}
        />
        <TabBar
          selectedIndex={state.index}
          style={styles.tabWrapper}
          onSelect={index => navigation.navigate(state.routeNames[index])}>
          <Tab title={STRINGS.OPEN_TITLE(openIncident)} />
          <Tab title={STRINGS.HISTORICAL_TITLE(historicalIncident)} />
        </TabBar>
      </Layout>
    </>
  )

  return (
    <TopTab.Navigator tabBar={CustomTopTabs} backBehavior="initialRoute">
      <TopTab.Screen name="Open" component={IncidentListScreen} />
      <TopTab.Screen name="Historical" component={IncidentListScreen} />
    </TopTab.Navigator>
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
    marginEnd: 8,
  },
})

export default IncidentTabs
