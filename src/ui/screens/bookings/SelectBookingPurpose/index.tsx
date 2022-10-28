import React, {useState, useEffect, useCallback} from 'react'
import {StyleSheet, ScrollView, Alert} from 'react-native'
import {
  Select,
  IndexPath,
  SelectItem,
  Button,
  Text,
  Spinner,
} from '@ui-kitten/components'

import STRINGS from './strings'
import _ from 'lodash'
import {SafeAreaView, CustomAttributes} from '@components'
import {BookingsScreenProps} from 'types'
import {EventEmitter} from '@react-native-granite/core'
import {BOOKING_EVENTS, controller, entity} from '@bookings'

// Global constants
const eventEmitter = new EventEmitter()

const SelectBookingPurpose: React.FC<
  BookingsScreenProps<'SelectBookingPurpose'>
> = ({navigation, route}) => {
  const {
    booking,
    branch,
    startDate,
    endDate,
    endOnDate,
    isRecurring,
    recurringType,
    daysOfWeek,
    datesOfMonth,
    vehicle,
    driverPK,
    address,
  } = route.params
  const [selectedPurpose, setSelectedPurpose] = useState<IndexPath>()
  const [selectedBookingType, setSelectedBookingType] = useState<IndexPath>()
  const [selectedCostCentre, setSelectedCostCentre] = useState<IndexPath>()

  const [isLoading, setIsLoading] = useState(true)
  const [purpose, setPurpose] = useState<string[]>([])
  const [bookingType, setBookingType] = useState<string[]>([])
  const [costCentre, setCostCentre] = useState<entity.CostCentre[]>([])

  const [isPurposeMandatory, setIsPurposeMandatory] = useState(false)
  const [isBookingTypeMandatory, setIsBookingTypeMandatory] = useState(false)
  const [isCostCentreMandatory, setIsCostCentreMandatory] = useState(false)

  const [potError, setPotError] = useState('')
  const [costCentreError, setCostCentreError] = useState('')
  const [bookingTypeError, setBookingTypeError] = useState('')

  const [customAttributes, setCustomAttributes] = useState<entity.Tag[]>([])
  const [selectedAttributes, setSelectedAttributes] = useState<
    entity.BookingTag[]
  >(booking?.booking_tags ?? [])
  const [validateCustomFields, setValidateCustomFields] = useState(false)

  useEffect(() => {
    const subscription = eventEmitter.getObservable().subscribe(event => {
      switch (event.type) {
        case BOOKING_EVENTS.LOAD_BOOKING_PURPOSE_START:
          setIsLoading(true)
          break
        case BOOKING_EVENTS.LOAD_BOOKING_PURPOSE_SUCCESS:
          populateFields(
            event.data.costCentres,
            event.data.pots,
            event.data.bookingTypes,
            event.data.costCentreID,
          )
          setPurpose(event.data.pots)
          setIsPurposeMandatory(event.data.isPOTMandatory)

          setBookingType(event.data.bookingTypes)
          setIsBookingTypeMandatory(event.data.isBookingTypeMandatory)

          setCostCentre(event.data.costCentres)
          setIsCostCentreMandatory(event.data.isCostCentreMandatory)

          setCustomAttributes(event.data.bookingTags)
          setIsLoading(false)
          break
        case BOOKING_EVENTS.LOAD_BOOKING_PURPOSE_FAILURE:
          Alert.alert('', STRINGS.SOMETHING_WENT_WRONG)
          navigation.goBack()
          break
      }
    })
    controller.getBookingPurpose(eventEmitter)

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (booking) {
      navigation.setOptions({headerTitle: STRINGS.LABEL_EDIT_BOOKING})
    }
  }, [navigation])

  const populateFields = useCallback(
    (
      costCentres: entity.CostCentre[],
      pots: string[],
      bookingTypes: string[],
      userCostCentre: number,
    ) => {
      // Pre fill cost centre with user's cost centre
      const index = costCentres.findIndex(item => item.pk === userCostCentre)
      if (index > -1) setSelectedCostCentre(new IndexPath(index))

      if (booking) {
        const {cost_centre, purpose_of_trip, booking_type} = booking

        if (cost_centre) {
          const index = costCentres.findIndex(
            item => item.pk === cost_centre.pk,
          )
          if (index > -1) setSelectedCostCentre(new IndexPath(index))
        }
        if (purpose_of_trip) {
          const index = pots.findIndex(item => item === purpose_of_trip)
          if (index > -1) setSelectedPurpose(new IndexPath(index))
        }
        if (booking_type) {
          const index = bookingTypes.findIndex(item => item === booking_type)
          if (index > -1) setSelectedBookingType(new IndexPath(index))
        }
      }
    },
    [],
  )

  const renderOption = useCallback(
    (title: string, key: string) => <SelectItem title={title} key={key} />,
    [],
  )

  const openBookingPreview = useCallback(() => {
    setValidateCustomFields(true)
    let flag = 0
    if (isPurposeMandatory && !selectedPurpose) {
      flag++
      setPotError(STRINGS.EMPTY_POT)
    } else setPotError('')
    if (isCostCentreMandatory && !selectedCostCentre) {
      flag++
      setCostCentreError(STRINGS.EMPTY_COST_CENTRE)
    } else setCostCentreError('')
    if (isBookingTypeMandatory && !selectedBookingType) {
      flag++
      setBookingTypeError(STRINGS.EMPTY_BOOKING_TYPE)
    } else setBookingTypeError('')

    if (customAttributes.length > 0) {
      customAttributes.forEach(attr => {
        if (attr.is_mandatory) {
          let value = selectedAttributes.filter(
            item => item.tag_group_name === attr.tag_group_name,
          )
          if (value.length < 1) flag++
          else if (_.isEmpty(value[0].tags) || value[0].tags?.[0] === '') flag++
        }
      })
    }

    if (flag === 0) {
      navigation.navigate('BookingPreview', {
        branch,
        startDate,
        endDate,
        endOnDate,
        isRecurring,
        recurringType,
        daysOfWeek,
        datesOfMonth,
        vehicle,
        driverPK,
        costCentre: selectedCostCentre
          ? costCentre[selectedCostCentre.row]
          : undefined,
        bookingType: selectedBookingType
          ? bookingType[selectedBookingType.row]
          : undefined,
        purpose: selectedPurpose ? purpose[selectedPurpose.row] : undefined,
        bookingID: booking?.pk,
        bookingTags: selectedAttributes,
        address,
      })
    }
  }, [
    navigation,
    route,
    selectedCostCentre,
    selectedPurpose,
    selectedBookingType,
    isPurposeMandatory,
    isCostCentreMandatory,
    isBookingTypeMandatory,
    customAttributes,
    selectedAttributes,
  ])

  const onSelectedAttributesChange = useCallback(
    (attr: entity.BookingTag[]) => {
      setSelectedAttributes(attr)
    },
    [],
  )

  if (isLoading)
    return (
      <SafeAreaView
        style={styles.loaderWrapper}
        edges={['bottom', 'left', 'right']}>
        <Spinner />
      </SafeAreaView>
    )

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView style={styles.scrollview}>
        <Text style={styles.titleText}>{STRINGS.LABEL_ADDITIONAL_DETAILS}</Text>
        <Select
          label={`${STRINGS.LABEL_PURPOSE_OF_TRIP}${
            isPurposeMandatory ? '*' : ''
          }`}
          style={styles.dropdown}
          placeholder={STRINGS.PLACEHOLDER_PURPOSE_OF_TRIP}
          value={selectedPurpose && purpose[selectedPurpose.row]}
          selectedIndex={selectedPurpose}
          caption={potError}
          status={potError ? 'danger' : 'basic'}
          onSelect={index => {
            setSelectedPurpose(index as IndexPath)
            setPotError('')
          }}>
          {purpose.map((value, index) => renderOption(value, String(index)))}
        </Select>
        <Select
          label={`${STRINGS.LABEL_BOOKING_TYPE}${
            isBookingTypeMandatory ? '*' : ''
          }`}
          style={styles.dropdown}
          placeholder={STRINGS.PLACEHOLDER_BOOKING_TYPE}
          value={selectedBookingType && bookingType[selectedBookingType.row]}
          selectedIndex={selectedBookingType}
          caption={bookingTypeError}
          status={bookingTypeError ? 'danger' : 'basic'}
          onSelect={index => {
            setSelectedBookingType(index as IndexPath)
            setBookingTypeError('')
          }}>
          {bookingType.map((value, index) =>
            renderOption(value, String(index)),
          )}
        </Select>
        <Select
          label={`${STRINGS.LABEL_COST_CENTRE}${
            isCostCentreMandatory ? '*' : ''
          }`}
          style={styles.dropdown}
          placeholder={STRINGS.PLACEHOLDER_COST_CENTRE}
          value={selectedCostCentre && costCentre[selectedCostCentre.row].name}
          selectedIndex={selectedCostCentre}
          caption={costCentreError}
          status={costCentreError ? 'danger' : 'basic'}
          onSelect={index => {
            setSelectedCostCentre(index as IndexPath)
            setCostCentreError('')
          }}>
          {costCentre.map((value, index) =>
            renderOption(value.name!!, String(index)),
          )}
        </Select>
        {customAttributes.length > 0 && (
          <>
            <Text status="primary" category="h6" style={{marginVertical: 8}}>
              {STRINGS.LABEL_CUSTOM_ATTRIBUTES}
            </Text>
            <CustomAttributes
              attributes={customAttributes}
              selectedAttributes={selectedAttributes}
              isEditable
              validate={validateCustomFields}
              onChange={onSelectedAttributesChange}
            />
          </>
        )}
      </ScrollView>
      <Button style={styles.button} onPress={openBookingPreview}>
        {STRINGS.BUTTON_NEXT}
      </Button>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleText: {
    marginVertical: 12,
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollview: {
    paddingHorizontal: 10,
  },
  dropdown: {
    marginVertical: 12,
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
})

export default SelectBookingPurpose
