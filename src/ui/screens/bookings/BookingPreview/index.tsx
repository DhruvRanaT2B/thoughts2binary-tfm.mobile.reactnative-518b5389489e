import React, {useState, useCallback, useEffect} from 'react'
import {
  ScrollView,
  Alert,
  TouchableOpacity,
  Dimensions,
  Linking,
} from 'react-native'
import {WebView} from 'react-native-webview'
import {
  Layout,
  Text,
  Card,
  CheckBox,
  Button,
  Modal,
  useStyleSheet,
  StyleService,
  Icon,
  useTheme,
  Spinner,
  Divider,
} from '@ui-kitten/components'
import _ from 'lodash'

import {SafeAreaView} from '@components'
import VehicleListItem from '../SelectVehicle/components/VehicleListItem'
import STRINGS from './strings'
import {BookingsScreenProps} from 'types'
import {EventEmitter} from '@react-native-granite/core'
import SuccessIcon from '@images/SuccessIcon.svg'
import {BOOKING_EVENTS, controller, entity} from '@bookings'
import moment from 'moment'

// Global constants
const eventEmitter = new EventEmitter()
const injectedJavaScript =
  "const meta = document.createElement('meta'); meta.setAttribute('content', 'initial-scale=1.1'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta);"

const BookingPreview: React.FC<BookingsScreenProps<'BookingPreview'>> = ({
  navigation,
  route,
}) => {
  const {
    branch,
    startDate,
    endDate,
    endOnDate,
    isRecurring,
    recurringType,
    daysOfWeek,
    datesOfMonth,
    vehicle,
    costCentre,
    bookingType,
    purpose,
    bookingID: existingBookingID,
    driverPK,
    bookingTags,
    address,
  } = route.params

  const theme = useTheme()
  const styles = useStyleSheet(themedStyles)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [bookingID, setBookingID] = useState(0)
  const [needsApproval, setNeedsApproval] = useState(true)
  const [bookingCost, setBookingCost] = useState('')
  const [tncModalVisible, setTncModalVisible] = useState(false)
  const [tnc, setTnc] = useState<entity.TermsAndConditions | null>(null)

  useEffect(() => {
    const subscription = eventEmitter.getObservable().subscribe(event => {
      switch (event.type) {
        case BOOKING_EVENTS.CREATE_BOOKING_START:
          setIsLoading(true)
          break
        case BOOKING_EVENTS.CREATE_BOOKING_SUCCESS:
          setIsLoading(false)
          setBookingID(event.data.id)
          setNeedsApproval(event.data.needsApproval)
          if (existingBookingID) {
            Alert.alert(
              '',
              STRINGS.BOOKING_UPDATE_MESSAGE,
              [
                {
                  text: STRINGS.BUTTON_OKAY,
                  onPress: onOkPress,
                },
              ],
              {cancelable: false},
            )
          } else setModalVisible(true)
          break
        case BOOKING_EVENTS.CREATE_BOOKING_FAILURE:
          setIsLoading(false)
          Alert.alert(
            '',
            event.data || STRINGS.SOMETHING_WENT_WRONG,
            [
              {
                text: STRINGS.BUTTON_OKAY,
                onPress: () => navigation.navigate('Dashboard'),
              },
            ],
            {cancelable: false},
          )
          break
        case BOOKING_EVENTS.GET_BOOKING_COST_SUCCESS:
          setIsLoading(false)
          setBookingCost(event?.data?.estimated_cost)
          break
        case BOOKING_EVENTS.GET_BOOKING_COST_FAILURE:
          Alert.alert('', STRINGS.SOMETHING_WENT_WRONG)
          navigation.goBack()
          break
        case BOOKING_EVENTS.GET_TNC_START:
          setIsLoading(true)
          break
        case BOOKING_EVENTS.GET_TNC_SUCCESS:
          setTnc(event.data)
          if (route.params.vehicle?.cost_model?.name !== '') {
            controller.getCostDetails(
              eventEmitter,
              Number(vehicle?.pk),
              route.params.startDate,
              route.params.endDate,
              0,
            )
          } else {
            setIsLoading(false)
          }
          break
        case BOOKING_EVENTS.GET_TNC_FAILURE:
          Alert.alert('', STRINGS.SOMETHING_WENT_WRONG)
          navigation.goBack()
          break
      }
    })
    controller.getTnc(eventEmitter)
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (existingBookingID)
      navigation.setOptions({headerTitle: STRINGS.LABEL_EDIT_BOOKING})
  }, [navigation])

  const vehicleDetails = useCallback(
    () =>
      [
        {
          title: STRINGS.LABEL_PICK_UP_LOCATION,
          value: String(branch.name),
        },
        {
          title: STRINGS.LABEL_DROP_LOCATION,
          value: String(address?.name),
        },
        {
          title: STRINGS.LABEL_COST_CENTRE,
          value: String(costCentre?.name),
        },
        {
          title: STRINGS.LABEL_START_DATE_TIME,
          value: moment(startDate).format('DD/MM/YYYY, hh:mm A'),
        },
        {
          title: STRINGS.LABEL_END_DATE_TIME,
          value: moment(endDate).format('DD/MM/YYYY, hh:mm A'),
        },
        {
          title: STRINGS.LABEL_PURPOSE_OF_TRIP,
          value: String(purpose),
        },
        {
          title: STRINGS.LABEL_RECURRING,
          value: `${
            isRecurring
              ? STRINGS.LABEL_YES + ', ' + recurringType
              : STRINGS.LABEL_NO
          }`,
          iconName: 'info',
        },
        {
          title: STRINGS.LABEL_ENDS_ON,
          value: `${
            isRecurring && !existingBookingID
              ? moment(endOnDate).format('DD/MM/YYYY')
              : STRINGS.LABEL_NA
          }`,
        },
        {
          title: STRINGS.LABEL_ODOMETER,
          value: String(vehicle.odometer_reading),
        },
        {
          title: STRINGS.ESTIMATED_COST,
          value:
            bookingCost == ''
              ? STRINGS.DEFAULT_EXPECTED_COST
              : STRINGS.DOLLAR(bookingCost),
        },
      ].filter(
        item =>
          item.value && item.value !== 'undefined' && item.value !== 'null',
      ),

    [bookingCost],
  )

  const onConfirmPress = () => {
    controller.createBooking(eventEmitter, {
      address,
      bookingType,
      branchID: Number(branch.pk),
      costCentreID: costCentre?.pk,
      costCentreName: costCentre?.name,
      datesOfMonth,
      daysOfWeek,
      endDate,
      endOnDate,
      isRecurring,
      recurringPattern: recurringType,
      startDate,
      vehicleID: Number(vehicle.pk),
      purposeOfTrip: purpose,
      bookingID: existingBookingID,
      driverID: driverPK,
      bookingTags,
      estimatedCost:
        bookingCost == STRINGS.DEFAULT_EXPECTED_COST ? '' : bookingCost,
    })
  }

  const onOkPress = () => {
    setModalVisible(false)
    // @ts-ignore
    navigation.reset({index: 0, routes: [{name: 'App'}]})
  }

  const renderDetails = (title: string, value: string, iconName?: string) => (
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
        {!_.isEmpty(iconName) && (
          <Icon
            name={iconName}
            style={styles.icon}
            fill={theme['color-primary-default']}
          />
        )}
      </Layout>
    </Layout>
  )
  const openUrl = () => {
    Linking.openURL(tnc?.link!)
  }

  const onTermsAndCondPress = () => {
    if (tnc?.preferredType == 'LINK') {
      openUrl()
    } else {
      setTncModalVisible(true)
    }
  }

  if (isLoading)
    return (
      <SafeAreaView
        style={styles.loaderContainer}
        edges={['bottom', 'left', 'right']}>
        <Spinner />
      </SafeAreaView>
    )

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView style={styles.scrollview}>
        <Text style={styles.titleText}>{STRINGS.LABEL_CONFIRM_BOOKING}</Text>
        <Card style={styles.card}>
          <Text status="primary">{STRINGS.BOOKING_DETAILS}</Text>
          <Layout style={styles.detailsWrapper}>
            {vehicleDetails().map(({title, value}) =>
              renderDetails(title, value),
            )}
          </Layout>
        </Card>
        <VehicleListItem showHeaderLabel={true} data={vehicle} />
        <Layout style={styles.hyperlinkWrapper}>
          <CheckBox
            checked={termsAccepted}
            onChange={isChecked => setTermsAccepted(isChecked)}
          />
          <TouchableOpacity onPress={onTermsAndCondPress}>
            <Text style={styles.hyperlink}>
              {STRINGS.TEXT_TERMS_AND_CONDITIONS}
            </Text>
          </TouchableOpacity>
        </Layout>
      </ScrollView>
      <Modal visible={tncModalVisible} backdropStyle={styles.backdrop}>
        <Layout
          style={{
            borderRadius: 8,
            width: Dimensions.get('window').width - 100,
          }}>
          <Text category="s1" style={styles.modalHeaderText}>
            {STRINGS.REVIEW_TERMS}
          </Text>
          <Divider
            style={[
              {backgroundColor: theme['color-primary-default']},
              styles.divider,
            ]}
          />
          <Layout style={styles.modalWrapper}>
            <Layout
              style={{
                flex: 1,
                maxHeight: Dimensions.get('window').height - 200,
                height: 200,
                width: Dimensions.get('window').width - 100,
              }}>
              <WebView
                scalesPageToFit={false}
                style={{flex: 1, width: Dimensions.get('window').width - 100}}
                originWhitelist={['*']}
                source={{html: tnc?.content!}}
                startInLoadingState={true}
                javaScriptEnabled={true}
                injectedJavaScript={injectedJavaScript}
                onMessage={() => {}}
                renderLoading={() => (
                  <Layout style={styles.loaderWrapper}>
                    <Spinner />
                  </Layout>
                )}
              />
            </Layout>
            <Button
              style={styles.tncButton}
              onPress={() => setTncModalVisible(false)}
              disabled={false}>
              {STRINGS.BUTTON_MODAL_OKAY}
            </Button>
          </Layout>
        </Layout>
      </Modal>
      <Button
        style={styles.button}
        onPress={onConfirmPress}
        disabled={!termsAccepted || isLoading}>
        {STRINGS.BUTTON_CONFIRM}
      </Button>
      <Modal visible={modalVisible} backdropStyle={styles.backdrop}>
        <Layout style={styles.modalWrapper}>
          <SuccessIcon />
          <Text
            category="s1"
            style={[styles.modalHeaderText, {marginTop: 6, marginBottom: 24}]}>
            {STRINGS.BOOKING_SUCCESS_HEADER}
          </Text>
          <Text style={styles.modalHeaderText}>
            {`${STRINGS.TEXT_BOOKING_ID} ${bookingID}`}
          </Text>
          {needsApproval && (
            <Text style={styles.modalText}>
              {STRINGS.BOOKING_SUCCESS_MESSAGE}
            </Text>
          )}
          <Button style={styles.modalButton} onPress={onOkPress}>
            {STRINGS.BUTTON_OKAY}
          </Button>
        </Layout>
      </Modal>
    </SafeAreaView>
  )
}

const themedStyles = StyleService.create({
  container: {
    flex: 1,
  },
  scrollview: {
    paddingHorizontal: 10,
  },
  titleText: {
    marginTop: 12,
    marginBottom: 18,
    fontSize: 18,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 12,
  },
  detailsWrapper: {
    marginTop: 12,
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
  icon: {
    height: 18,
    width: 18,
    marginHorizontal: 6,
  },
  text: {
    marginVertical: 4,
  },
  hyperlinkWrapper: {
    flexDirection: 'row',
    marginVertical: 8,
    paddingVertical: 6,
  },
  hyperlink: {
    marginHorizontal: 8,
    textDecorationLine: 'underline',
  },
  button: {
    marginBottom: 12,
    marginHorizontal: 10,
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalWrapper: {
    marginHorizontal: 24,
    paddingHorizontal: 12,
    paddingVertical: 18,
    borderRadius: 4,
    alignItems: 'center',
  },
  modalButton: {
    marginTop: 24,
    paddingHorizontal: 32,
  },
  modalHeaderText: {
    marginBottom: 12,
    marginTop: 18,
    fontSize: 20,
    marginHorizontal: 12,
  },
  modalText: {
    textAlign: 'center',
    marginVertical: 6,
  },
  loaderWrapper: {
    margin: 20,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderContainer: {
    flex: 1,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tncButton: {
    marginTop: 12,
    marginHorizontal: 10,
    borderRadius: 4,
  },
  divider: {
    height: 2,
  },
})

export default BookingPreview
