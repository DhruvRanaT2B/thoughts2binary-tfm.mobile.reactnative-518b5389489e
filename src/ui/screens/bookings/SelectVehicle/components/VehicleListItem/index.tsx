import React, {useState, useCallback, useContext} from 'react'
import {StyleSheet, TouchableOpacity, Image} from 'react-native'
import {Layout, Button, Text, Icon, useTheme} from '@ui-kitten/components'
import Swiper from 'react-native-swiper'
import _ from 'lodash'

import STRINGS from '../../strings'
import {VehicleListItemProps} from 'types'
import Color from '@images/Color.svg'
import Doors from '@images/Doors.svg'
import Fuel from '@images/Fuel.svg'
import License from '@images/License.svg'
import Seats from '@images/Seats.svg'
import {entity} from '@bookings'
import {BookingContext} from '@contexts'
import Carousel from 'react-native-snap-carousel'

function VehicleListItem({
  onSelectPress,
  showHeaderLabel = false,
  headerTitle = 'Vehicle Details',
  data,
  driver,
  highlight = false,
}: VehicleListItemProps) {
  const theme = useTheme()
  const {vehicleImages} = useContext(BookingContext)
  const [detailsVisible, setDetailsVisible] = useState(false)
  const images: string[] | undefined = !!data.images
    ? data.images
    : vehicleImages
  const [imageUri, setImageUri] = useState(images?.[0])
  const isCarousel = React.useRef(null)

  const vehicleDetails = useCallback(
    () =>
      [
        {title: STRINGS.DRIVER, value: driver?.name},
        {title: STRINGS.EMAIL, value: driver?.email},
        {
          title: STRINGS.VIN,
          value: data.vin,
        },
        {
          title: STRINGS.BRANCH,
          value: data.branch?.name,
        },
        {
          title: STRINGS.REGISTRATION_NUMBER,
          value: data.registrations_num,
        },
        {title: STRINGS.MAKE, value: data.make},
        {title: STRINGS.MODEL, value: data.model},
        {title: STRINGS.BODY_TYPE, value: data.body_type},
        {title: STRINGS.LABEL_COST_CENTRE, value: data.cost_centre?.name},
        {title: STRINGS.YEAR, value: data.year},
      ].filter(
        item =>
          item.value && item.value !== 'undefined' && item.value !== 'null',
      ),
    [driver, data],
  )

  const renderDetails = (title: string, value: any) => (
    <Layout style={styles.itemWrapper} key={title}>
      <Layout style={styles.itemTitle}>
        <Text category="s2" style={{flex: 1}}>
          {title}
        </Text>
        <Text category="s2" style={{paddingHorizontal: 12}}>
          :
        </Text>
      </Layout>
      <Layout style={styles.itemValue}>
        <Text category="p2">{value}</Text>
      </Layout>
    </Layout>
  )

  return (
    <Layout style={styles.card} level={highlight ? '4' : '1'}>
      {showHeaderLabel && (
        <Text status="primary" style={{marginBottom: 12}}>
          {headerTitle}
        </Text>
      )}
      <Layout style={styles.header}>
        <Layout style={{flex: 1, backgroundColor: 'transparent'}}>
          <Text category="h6" status="primary" style={{fontWeight: 'bold'}}>
            {`${data.year} ${data.name} ${data.body_type}`}
          </Text>
          <Text category="c1" style={{marginTop: 4}}>
            {STRINGS.LISTITEM_ODO_HEADING}:{' '}
            {(data as entity.BookingVehicle).odometer_reading?.toString() ??
              (data as entity.Vehicle).odometer!!}
          </Text>
        </Layout>
        {onSelectPress && (
          <Layout style={styles.buttonWrapper}>
            <Button style={styles.button} onPress={onSelectPress}>
              {highlight
                ? STRINGS.LISTITEM_BUTTON_SELECTED
                : STRINGS.LISTITEM_BUTTON_SELECT}
            </Button>
          </Layout>
        )}
      </Layout>
      <Layout style={styles.bodyWrapper}>
        {Array.isArray(images) && images.length > 0 ? (
          <Layout>
            {/* <Swiper
              showsButtons={true}
              buttonWrapperStyle={styles.swiperButton}
              style={styles.image}
              onIndexChanged={item => {
                setImageUri(images[item])
              }}
              activeDotColor={theme['color-primary-default']}>
              {images.map((image: string) => (
                <Image
                  key={image}
                  style={styles.image}
                  resizeMode="contain"
                />
              ))}
            </Swiper> */}
            <Carousel
              ref={isCarousel}
              data={images}
              useScrollView={true}
              renderItem={image => (
                <Image
                  source={{uri: image.item}}
                  style={styles.image}
                  resizeMode="contain"
                />
              )}
              sliderWidth={150}
              itemWidth={140}
            />
          </Layout>
        ) : (
          <Image
            source={require('@images/Car.png')}
            style={styles.image}
            resizeMode="contain"
          />
        )}
        <Layout style={styles.attributesContainer}>
          {_.isNumber(data.seats) && (
            <Layout style={styles.attributeWrapper}>
              <Seats height={12} width={12} />
              <Text style={styles.attributeText} category="c1">
                {`${data.seats} ${STRINGS.SEATER}`}
              </Text>
            </Layout>
          )}
          {!_.isEmpty(data.fuel_type) && (
            <Layout style={styles.attributeWrapper}>
              <Fuel height={12} width={12} />
              <Text style={styles.attributeText} category="c1">
                {`${data.fuel_type} ${STRINGS.FUEL}`}
              </Text>
            </Layout>
          )}
          {_.isNumber(data.doors) && (
            <Layout style={styles.attributeWrapper}>
              <Doors height={12} width={12} />
              <Text style={styles.attributeText} category="c1">
                {`${data.doors} ${STRINGS.DOORS}`}
              </Text>
            </Layout>
          )}
          {!_.isEmpty(data.license_type) && (
            <Layout style={styles.attributeWrapper}>
              <License height={12} width={12} />
              <Text style={styles.attributeText} category="c1">
                {`${data.license_type} ${STRINGS.LICENSE}`}
              </Text>
            </Layout>
          )}
          {!_.isEmpty(data.color) && (
            <Layout style={styles.attributeWrapper}>
              <Color height={12} width={12} />
              <Text style={styles.attributeText} category="c1">
                {`${data.color} ${STRINGS.COLOR}`}
              </Text>
            </Layout>
          )}
        </Layout>
      </Layout>
      {detailsVisible && (
        <Layout style={styles.detailsWrapper}>
          {vehicleDetails().map(({title, value}) =>
            renderDetails(title, value),
          )}
        </Layout>
      )}
      <Layout style={styles.showHideSection}>
        <TouchableOpacity
          onPress={() => setDetailsVisible(!detailsVisible)}
          activeOpacity={0.6}
          style={styles.showHide}>
          <Text
            category="c1"
            status="primary"
            style={{
              textAlign: 'center',
              textDecorationLine: 'underline',
            }}>
            {detailsVisible
              ? STRINGS.LISTITEM_HIDE_DETAILS
              : STRINGS.LISTITEM_SHOW_DETAILS}
          </Text>
          <Icon
            name={
              detailsVisible ? 'chevron-up-outline' : 'chevron-down-outline'
            }
            style={styles.chevron}
            fill={theme['color-primary-default']}
          />
        </TouchableOpacity>
      </Layout>
    </Layout>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 4,
    borderColor: 'lightgrey',
    padding: 18,
  },
  header: {
    flexDirection: 'row',
    flex: 1,
    backgroundColor: 'transparent',
  },
  bodyWrapper: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  detailsWrapper: {
    marginTop: 12,
    backgroundColor: 'transparent',
  },
  image: {
    height: 90,
    width: 140,
    borderRadius: 4,
  },
  attributesContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'transparent',
    justifyContent: 'space-evenly',
  },
  attributeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    marginEnd: 4,
    backgroundColor: 'transparent',
  },
  attributeText: {
    marginStart: 4,
  },
  itemWrapper: {
    flex: 1,
    flexDirection: 'row',
    marginVertical: 6,
    backgroundColor: 'transparent',
  },
  itemTitle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  itemValue: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  chevron: {
    height: 24,
    width: 24,
  },
  buttonWrapper: {
    justifyContent: 'center',
    marginStart: 6,
    backgroundColor: 'transparent',
  },
  button: {
    paddingHorizontal: 12,
  },
  showHideSection: {
    marginTop: 6,
    alignItems: 'flex-end',
    backgroundColor: 'transparent',
  },
  showHide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swiperButton: {
    justifyContent: 'space-between',
  },
})

export default VehicleListItem
