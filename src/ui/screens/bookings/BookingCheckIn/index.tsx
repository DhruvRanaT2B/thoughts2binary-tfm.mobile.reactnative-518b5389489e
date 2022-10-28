import React, {useState, useCallback, useEffect} from 'react'
import {
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native'
import {
  Text,
  Input,
  Layout,
  Button,
  CheckBox,
  Select,
  IndexPath,
  SelectItem,
  Divider,
  useTheme,
  Radio,
  RadioGroup,
} from '@ui-kitten/components'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import moment from 'moment'
import {controller, entity} from '@bookings'
import _ from 'lodash'

import STRINGS from './strings'
import {Address, BookingsScreenProps, ImageFile} from 'types'
import {
  ImagePicker,
  CustomAttributes,
  GoogleAutoComplete,
  CustomInput,
  SafeAreaView,
} from '@components'
import Calendar from '@images/Calendar.svg'
import Clock from '@images/Clock.svg'
import {odoMeterDeviation} from '@utility'

// Global Constants
const DATE_PATTERN = 'D MMM, yyyy'
const TIME_PATTERN = 'hh:mm A'

// Global Variables
let dateTimePickerMode: 'date' | 'time' = 'date'

const BookingCheckIn: React.FC<BookingsScreenProps<'BookingCheckIn'>> = ({
  navigation,
  route,
}) => {
  const theme = useTheme()

  const [odoReading, setOdoReading] = useState('')
  const [odoError, setOdoError] = useState('')
  const [notes, setNotes] = useState('')
  const [locationError, setLocationError] = useState('')
  const [logIncident, setLogIncident] = useState(false)
  const [incidentCritical, setIncidentCritical] = useState(false)
  const [selectedIncidentType, setSelectedIncidentType] = useState<IndexPath>()
  const [selectedIncidentSubType, setSelectedIncidentSubType] =
    useState<IndexPath>()
  const [dateTimePickerVisible, setDateTimePickerVisible] = useState(false)
  const [date, setDate] = useState(new Date())
  const [now, setNow] = useState(new Date())
  const [currentPage, setCurrentPage] = useState(route.params.checkList ? 0 : 1)
  const [images, setImages] = useState<ImageFile[]>([])
  const [selectedAttributes, setSelectedAttributes] = useState<
    entity.BookingTag[]
  >([])
  const [validateCustomFields, setValidateCustomFields] = useState(false)
  const [incidentTypeError, setIncidentTypeError] = useState('')
  const [incidentAddress, setIncidentAddress] = useState<Address>()
  const [selectedChecklistItems, setSelectedChecklistItems] = useState(
    route.params.checkList
      ? new Array(Object.values(route.params.checkList).length).fill(false)
      : new Array(0),
  )
  const [selected, setSelected] = useState(1)

  const renderOption = (title: string) => <SelectItem title={title} />

  const handleConfirm = useCallback(
    (date: Date) => {
      console.log('A date has been picked: ', date)
      setDateTimePickerVisible(false)
      if (moment(date).isBefore(moment(now))) setDate(date)
      else setDate(now)
    },
    [now],
  )

  const onCancelPress = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  const showOdoConfirmationPrompt = useCallback(
    (deviation: number, callback: (param: boolean) => void) => {
      Alert.alert(
        STRINGS.REVIEW_ODOMETER_DEVIATION,
        STRINGS.DEVIATION_MESSAGE(deviation),
        [
          {text: STRINGS.BUTTON_CANCEL},
          {text: STRINGS.BUTTON_ACCEPT, onPress: () => callback(true)},
        ],
        {cancelable: false},
      )
    },
    [],
  )

  const postData = () => {
    if (route.params.checkList == undefined) {
      return undefined
    }
    var temp: any = {}
    const listKey = new Array(Object.keys(route.params.checkList))
    const listValue = new Array(Object.values(route.params.checkList))
    selectedChecklistItems.map((i, k) => {
      if (i === true) {
        temp[listKey[0][k]] = listValue[0][k]
      }
    })
    return temp
  }

  const onCheckInPress = useCallback(
    (byPassOdo?: boolean) => {
      let odoValue =
        selected == 0 ? Number(odoReading) : route.params.startOdoReading
      if (!byPassOdo) {
        let deviationPercentage = odoMeterDeviation(
          route.params.startOdoReading,
          Number(odoReading),
        )
        if (deviationPercentage >= 10 || deviationPercentage <= -10) {
          showOdoConfirmationPrompt(deviationPercentage, onCheckInPress)
          return
        }
      }

      let temp = postData()
      controller.checkIn(route.params.eventEmitter, {
        bookingID: route.params.bookingID,
        notes,
        odoReading: odoValue,
        isOdoUpdated: !byPassOdo,
        checkListObj: temp,
      })
      navigation.goBack()
    },
    [
      route,
      notes,
      odoReading,
      navigation,
      showOdoConfirmationPrompt,
      selected,
      selectedChecklistItems,
    ],
  )

  const onLogIncidentPress = useCallback(
    (odoSet?: boolean) => {
      setValidateCustomFields(true)
      let flag = 0
      if (!selectedIncidentType) {
        flag++
        setIncidentTypeError(STRINGS.ERROR_TYPE_OF_INCIDENT)
      }

      if (!incidentAddress) {
        flag++
        setLocationError(STRINGS.ERROR_INCIDENT_LOCATION)
      }

      if (route.params.customAttributes.length > 0) {
        route.params.customAttributes.forEach(attr => {
          if (attr.is_mandatory) {
            let value = selectedAttributes.filter(
              item => item.tag_group_name === attr.tag_group_name,
            )
            if (value.length < 1) flag++
            else if (_.isEmpty(value[0].tags) || value[0].tags?.[0] === '')
              flag++
          }
        })
      }

      let temp = postData()
      if (flag === 0 && selectedIncidentType && incidentAddress) {
        controller.logIncident(route.params.eventEmitter, {
          bookingID: route.params.bookingID,
          notes,
          odoReading: odoSet
            ? Number(odoReading)
            : Number(route.params.startOdoReading),
          address: incidentAddress,
          incidentSubType: selectedIncidentSubType
            ? route.params.incidents[selectedIncidentType.row]
                .incident_sub_type?.[selectedIncidentSubType.row] ?? ''
            : '',
          incidentID: route.params.incidents[selectedIncidentType.row].pk!!,
          isCritical: incidentCritical,
          reportedOn: date,
          vehicleID: route.params.vehicleID,
          bookingTripID: route.params.bookingTripID,
          images,
          incidentTags: selectedAttributes,
          checkListObj: temp,
          isOdoUpdated: odoSet,
        })
        navigation.goBack()
      }
    },
    [
      route,
      notes,
      odoReading,
      selectedIncidentType,
      incidentCritical,
      date,
      selectedIncidentSubType,
      images,
      selectedAttributes,
      incidentAddress,
      selectedChecklistItems,
    ],
  )

  const onNextPress = useCallback(
    (byPassOdo?: boolean) => {
      if (!byPassOdo) {
        let deviationPercentage = odoMeterDeviation(
          route.params.startOdoReading,
          Number(odoReading),
        )
        if (deviationPercentage >= 10 || deviationPercentage <= -10) {
          showOdoConfirmationPrompt(deviationPercentage, onNextPress)
          return
        }
      }

      setCurrentPage(2)
    },
    [route, odoReading, showOdoConfirmationPrompt],
  )

  const onBackPress = useCallback(() => {
    setCurrentPage(currentPage - 1)
  }, [currentPage])

  useEffect(() => {
    // Initialise date
    const minutesToSubtract = moment().minutes() % 15
    const newDate = moment().subtract(minutesToSubtract, 'minutes').toDate()
    setDate(newDate)
    setNow(newDate)
  }, [])

  const onSelectedAttributesChange = useCallback(
    (attr: entity.BookingTag[]) => {
      setSelectedAttributes(attr)
    },
    [],
  )

  const onAddressFocus = useCallback(async () => {
    try {
      const place = await GoogleAutoComplete.show()
      const temp = {...incidentAddress}
      temp.name = place.address
      temp.bounds = {
        east: place.viewport.northEast.longitude,
        north: place.viewport.northEast.latitude,
        south: place.viewport.southWest.latitude,
        west: place.viewport.southWest.longitude,
      }
      temp.coords = {
        lat: place.coordinate.latitude,
        long: place.coordinate.longitude,
      }
      setIncidentAddress(temp)
      setLocationError('')
    } catch (error) {
      console.log(error)
    }
  }, [incidentAddress])

  const onLocationDetailsChange = useCallback(
    (text: string) => {
      const temp = {...incidentAddress}
      temp.landmark = text
      setIncidentAddress(temp)
    },
    [incidentAddress],
  )

  const DateAndTimeSection = () => (
    <>
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
    </>
  )

  const renderPageTwo = () => (
    <Layout style={styles.pageWrapper}>
      <Select
        style={styles.select}
        label={STRINGS.LABEL_TYPE_OF_INCIDENT}
        placeholder={STRINGS.LABEL_TYPE_OF_INCIDENT}
        value={
          selectedIncidentType &&
          route.params.incidents[selectedIncidentType.row].name
        }
        selectedIndex={selectedIncidentType}
        onSelect={index => {
          setSelectedIncidentSubType(undefined)
          setSelectedIncidentType(index as IndexPath)
          setIncidentTypeError('')
        }}
        caption={incidentTypeError}
        status={incidentTypeError ? 'danger' : 'basic'}>
        {route.params.incidents.map(incident =>
          renderOption(String(incident.name)),
        )}
      </Select>
      {selectedIncidentType &&
        route.params.incidents[selectedIncidentType.row]?.incident_sub_type &&
        // @ts-ignore
        route.params.incidents[selectedIncidentType.row].incident_sub_type
          ?.length > 0 && (
          <Select
            style={styles.select}
            label={STRINGS.LABEL_SUB_TYPE_OF_INCIDENT}
            placeholder={STRINGS.LABEL_SUB_TYPE_OF_INCIDENT}
            value={
              selectedIncidentSubType &&
              route.params.incidents[selectedIncidentType.row]
                .incident_sub_type?.[selectedIncidentSubType.row]
            }
            selectedIndex={selectedIncidentSubType}
            onSelect={index => setSelectedIncidentSubType(index as IndexPath)}>
            {route.params.incidents[
              selectedIncidentType.row
            ].incident_sub_type?.map(renderOption)}
          </Select>
        )}
      <CheckBox
        style={styles.checkbox}
        checked={incidentCritical}
        onChange={() => setIncidentCritical(!incidentCritical)}>
        {STRINGS.TITLE_ISSUE_CRITICAL}
      </CheckBox>
      <CustomInput
        style={styles.select}
        label={STRINGS.PLACEHOLDER_ENTER_INCIDENT_LOCATION}
        placeholder={STRINGS.PLACEHOLDER_ENTER_INCIDENT_LOCATION}
        value={incidentAddress?.name ?? ''}
        caption={locationError}
        onPress={onAddressFocus}
      />
      {!_.isEmpty(incidentAddress?.name) && (
        <Input
          label={STRINGS.LABEL_ADDITIONAL_LOCATION_DETAILS}
          placeholder={STRINGS.LABEL_ADDITIONAL_LOCATION_DETAILS}
          onChangeText={onLocationDetailsChange}
          style={styles.input}
          value={incidentAddress?.landmark}
          autoCorrect={false}
        />
      )}
      <DateAndTimeSection />
      {route.params.customAttributes.length > 0 && (
        <>
          <Text status="primary" category="s1" style={{marginVertical: 8}}>
            {STRINGS.LABEL_CUSTOM_ATTRIBUTES}
          </Text>
          <CustomAttributes
            attributes={route.params.customAttributes}
            selectedAttributes={selectedAttributes}
            isEditable
            validate={validateCustomFields}
            onChange={onSelectedAttributesChange}
          />
        </>
      )}
      <ImagePicker
        onImageChange={images => {
          setImages(images)
        }}
        images={images}
      />
    </Layout>
  )

  const renderPageOne = () => (
    <Layout style={styles.pageWrapper}>
      <Text>
        {STRINGS.TEXT_ODOMETER_READING(Number(route.params.startOdoReading))}
      </Text>
      <RadioGroup
        selectedIndex={selected}
        onChange={index => setSelected(index)}>
        {STRINGS.RADIO_OPTIONS.map(item => (
          <Radio>{item}</Radio>
        ))}
      </RadioGroup>
      {selected == 0 && (
        <Input
          style={styles.input}
          // maxLength={15}
          placeholder={STRINGS.PLACEHOLDER_END_ODO_READING}
          value={odoReading}
          label={
            odoReading.length > 0 ? STRINGS.PLACEHOLDER_END_ODO_READING : ''
          }
          onChangeText={text => {
            setOdoReading(text)
            // Odo reading difference should not be greater than 6 digits
            if (
              text &&
              Math.abs(Number(text) - route.params.startOdoReading) >= 100000
            )
              setOdoError(STRINGS.ERROR_ODOMETER)
            else setOdoError('')
          }}
          caption={odoError}
          status={odoError ? 'danger' : 'basic'}
          keyboardType="decimal-pad"
        />
      )}
      <CheckBox
        style={styles.checkbox}
        checked={logIncident}
        onChange={() => setLogIncident(!logIncident)}>
        {STRINGS.INCIDENT_CHECKBOX_TITLE}
      </CheckBox>
      <Input
        style={styles.input}
        placeholder={STRINGS.PLACEHOLDER_ADD_NOTES}
        multiline={true}
        textStyle={styles.notesWrapper}
        value={notes}
        onChangeText={text => setNotes(text)}
      />
    </Layout>
  )

  const renderPageZero = () => (
    <Layout style={styles.pageWrapper}>
      <Text style={{marginBottom: 8}}>{STRINGS.TITLE_CHECKLIST}</Text>
      {Object.values(route.params.checkList).map((i, k) => (
        <CheckBox
          style={styles.checkbox}
          checked={selectedChecklistItems[k]}
          onChange={() => {
            let temp = new Array(selectedChecklistItems.length)
            selectedChecklistItems.map((item, ind) => {
              temp[ind] = ind !== k ? item : !item
            })
            setSelectedChecklistItems(temp)
          }}>
          {() => <Text style={styles.checkListText}>{i as string}</Text>}
        </CheckBox>
      ))}
    </Layout>
  )
  const isNothingSelected = () => {
    let flag: boolean = true
    selectedChecklistItems.map(i => {
      if (i === true) {
        flag = false
      }
    })
    return flag
  }
  return (
    <SafeAreaView
      style={styles.safeAreaView}
      edges={['bottom', 'left', 'right']}>
      <Layout style={styles.container}>
        <ScrollView>
          <Text category="s1" style={styles.headerText}>
            {currentPage === 1
              ? STRINGS.LABEL_CHECKIN
              : currentPage === 0
              ? STRINGS.LABEL_CHECKLIST
              : STRINGS.LABEL_LOG_INCIDENT}
          </Text>
          <Divider
            style={[
              {backgroundColor: theme['color-primary-default']},
              styles.divider,
            ]}
          />
          {currentPage === 0
            ? renderPageZero()
            : currentPage === 1
            ? renderPageOne()
            : renderPageTwo()}
          <Layout
            style={
              currentPage == 0 ? styles.buttonWrapper2 : styles.buttonWrapper
            }>
            <Button
              style={currentPage == 0 ? styles.button2 : styles.button}
              onPress={
                currentPage === 0
                  ? onCancelPress
                  : !route.params.checkList && currentPage === 1
                  ? onCancelPress
                  : onBackPress
              }>
              {currentPage === 0
                ? STRINGS.BUTTON_CANCEL
                : !route.params.checkList && currentPage === 1
                ? STRINGS.BUTTON_CANCEL
                : STRINGS.BUTTON_BACK}
            </Button>
            {currentPage != 0 && (
              <Button
                style={styles.button}
                disabled={
                  currentPage === 0
                    ? true
                    : currentPage === 1
                    ? logIncident ||
                      (selected == 0 && odoError.length > 0) ||
                      (selected == 0 && !odoReading)
                    : false
                }
                onPress={
                  currentPage === 1
                    ? () => {
                        onCheckInPress(selected != 0)
                      }
                    : onCancelPress
                }>
                {currentPage === 1 || currentPage === 0
                  ? STRINGS.BUTTON_SAVE
                  : STRINGS.BUTTON_CANCEL}
              </Button>
            )}
            <Button
              style={currentPage == 0 ? styles.button2 : styles.button}
              disabled={
                currentPage === 1
                  ? !logIncident ||
                    (selected == 0 && odoError.length > 0) ||
                    (selected == 0 && !odoReading)
                  : currentPage === 0
                  ? isNothingSelected()
                  : false
              }
              onPress={
                currentPage === 1
                  ? () => onNextPress(selected != 0)
                  : currentPage === 0
                  ? () => {
                      setCurrentPage(1)
                    }
                  : () => onLogIncidentPress(selected == 0)
              }>
              {currentPage === 1 || currentPage === 0
                ? STRINGS.BUTTON_NEXT
                : STRINGS.BUTTON_SAVE}
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
        mode={dateTimePickerMode}
        onConfirm={handleConfirm}
        maximumDate={now}
        minuteInterval={15}
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
    maxHeight: Dimensions.get('window').height / 1.5,
  },
  pageWrapper: {
    marginHorizontal: 12,
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
  input: {
    marginVertical: 6,
  },
  notesWrapper: {
    minHeight: 70,
    maxHeight: 140,
  },
  select: {
    marginVertical: 8,
  },
  checkbox: {
    marginVertical: 6,
  },
  buttonWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 18,
    marginHorizontal: 12,
  },
  buttonWrapper2: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginVertical: 18,
    marginHorizontal: 12,
  },
  button: {
    minWidth: 90,
  },
  button2: {
    minWidth: 90,
    marginStart: 8,
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
  checkListText: {
    fontSize: 13,
    fontWeight: 'normal',
    marginLeft: 10,
    marginRight: 10,
  },
})

export default BookingCheckIn
