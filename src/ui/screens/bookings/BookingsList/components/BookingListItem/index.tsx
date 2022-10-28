import React, {useCallback, useContext} from 'react'
import {StyleSheet, TouchableOpacity} from 'react-native'
import {
  Layout,
  Card,
  Icon,
  Text,
  useTheme,
  Divider,
} from '@ui-kitten/components'
import moment from 'moment'

import STRINGS from '../../strings'
import {BookingListItemProps} from 'types'
import {getBookingStatusColor} from '@utility'
import {BookingContext} from '@contexts'

const BookingListItem: React.FC<BookingListItemProps> = ({
  onCardPress,
  item,
  onEditPress,
  isEditable = true,
  onDeletePress,
}) => {
  const theme = useTheme()
  const {permissions} = useContext(BookingContext)

  const bookingDetails = useCallback(
    () =>
      [
        {title: STRINGS.ADDRESS, value: item.address},
        {
          title: STRINGS.START_DATE_TIME,
          value: moment(item.start_datetime?.original).format(
            'DD/MM/YYYY, hh:mm A',
          ),
        },
        {
          title: STRINGS.END_DATE_TIME,
          value: moment(item.end_datetime?.original).format(
            'DD/MM/YYYY, hh:mm A',
          ),
        },
        {
          title: STRINGS.MULTIBOOKING_ID,
          value: item?.multi_booking_id ? item?.multi_booking_id : STRINGS.NA,
        },
        {title: STRINGS.BRANCH, value: item.branch?.name},
        {
          title: STRINGS.REGISTRATION_NUMBER,
          value: item.vehicle?.registrations_num,
        },
        {title: STRINGS.DRIVER_NAME, value: item.driver?.name},
        {title: STRINGS.BOOKING_TYPE, value: item.booking_type},
        {title: STRINGS.COST_CENTRE, value: item.cost_centre?.name},
        {
          title:
            item?.status?.status_name !== 'Completed'
              ? STRINGS.ESTIMATED_COST
              : STRINGS.ACTUAL_COST,
          value:
            item?.status?.status_name !== 'Completed'
              ? item?.extra_data?.estimated_cost == undefined
                ? STRINGS.DEFAULT_EXPECTED_COST
                : STRINGS.DOLLAR(item?.extra_data?.estimated_cost)
              : STRINGS.DOLLAR(item?.extra_data?.actual_cost),
        },
      ].filter(
        item =>
          item.value && item.value !== 'undefined' && item.value !== 'null',
      ),
    [item],
  )

  const getBadgeColor = (isActive: boolean) =>
    isActive ? '#1D6392' : theme['background-alternative-color-1']

  const days = Math.floor(
    moment(item.end_datetime?.original).diff(
      item.start_datetime?.original,
      'hours',
    ) / 24,
  )

  const showEditIcon = useCallback(() => {
    let status = item.status?.status_name
    return (
      permissions.write &&
      isEditable &&
      status !== 'Completed' &&
      status !== 'Declined' &&
      status !== 'Cancelled' &&
      status !== 'In-Progress'
    )
  }, [item, isEditable])

  const showDeleteIcon = useCallback(() => {
    return permissions.delete && item.status?.status_name !== 'In-Progress'
  }, [item])

  return (
    <Card style={styles.card} onPress={onCardPress}>
      <Layout style={styles.headerOuterWrapper}>
        <Layout style={styles.headerLeftPortion}>
          <Layout>
            <Text category="s1" style={{fontSize: 18, fontWeight: 'bold'}}>
              {`${item.pk} ${item.vehicle?.name}`}
            </Text>
            <Layout style={styles.headerCaption}>
              <Layout
                style={[
                  styles.colorDot,
                  {
                    backgroundColor: getBookingStatusColor(
                      item.status?.status_name!!,
                    ),
                  },
                ]}
              />
              <Text category="c1">{item.status?.status_name}</Text>
            </Layout>
          </Layout>
        </Layout>
        <Layout style={styles.headerRightPortion}>
          {showEditIcon() && (
            <TouchableOpacity activeOpacity={0.7} onPress={onEditPress}>
              <Icon
                name="edit"
                fill={theme['color-primary-default']}
                style={styles.headerIcon}
              />
            </TouchableOpacity>
          )}
          {showDeleteIcon() && (
            <TouchableOpacity activeOpacity={0.7} onPress={onDeletePress}>
              <Icon
                name="trash"
                fill={theme['color-primary-default']}
                style={styles.headerIcon}
              />
            </TouchableOpacity>
          )}
        </Layout>
      </Layout>
      {bookingDetails().map(({title, value}) => renderDetails(title, value))}
      <Divider style={styles.divider} />
      <Layout style={styles.footerWrapper}>
        <Layout style={styles.badge}>
          <Icon
            name="moon"
            fill={getBadgeColor(item.is_overnight ?? false)}
            style={styles.badgeIcon}
          />
          <Text
            category="c1"
            style={{
              color: getBadgeColor(item.is_overnight ?? false),
            }}>
            {STRINGS.TEXT_OVERNIGHT}
          </Text>
        </Layout>
        <Layout style={styles.badge}>
          <Icon
            name="calendar"
            fill={getBadgeColor(days > 0)}
            style={styles.badgeIcon}
          />
          <Text
            category="c1"
            style={{
              color: getBadgeColor(days > 0),
            }}>
            {`${days} ${days > 1 ? STRINGS.DAYS : STRINGS.DAY}`}
          </Text>
        </Layout>
        <Layout style={styles.badge}>
          <Icon
            name="repeat"
            fill={getBadgeColor(item.is_recurring ?? false)}
            style={styles.badgeIcon}
          />
          <Text
            category="c1"
            style={{
              color: getBadgeColor(item.is_recurring ?? false),
            }}>
            {STRINGS.TEXT_RECURRING}
          </Text>
        </Layout>
      </Layout>
    </Card>
  )
}

const renderDetails = (label: string, value: any) => (
  <Layout style={styles.itemWrapper} key={label}>
    <Layout style={styles.itemLabel}>
      <Text category="s2" style={{flex: 1}}>
        {label}
      </Text>
      <Text category="s2" style={{paddingHorizontal: 12}}>
        :
      </Text>
    </Layout>
    <Layout style={[styles.itemLabel, {justifyContent: 'flex-start'}]}>
      <Text category="p2">{value}</Text>
    </Layout>
  </Layout>
)

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
  },
  headerIcon: {
    height: 24,
    width: 24,
    marginStart: 12,
  },
  headerOuterWrapper: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  headerLeftPortion: {
    flexDirection: 'row',
    flex: 1,
  },
  headerRightPortion: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerCaption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    height: 8,
    width: 8,
    borderRadius: 8,
    marginEnd: 4,
  },
  divider: {
    marginVertical: 6,
    height: 2,
  },
  footerWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 6,
  },
  badge: {
    alignItems: 'center',
    minWidth: 60,
  },
  badgeIcon: {
    height: 18,
    width: 18,
    marginBottom: 2,
  },
  itemWrapper: {
    flex: 1,
    flexDirection: 'row',
    marginVertical: 6,
  },
  itemLabel: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
})

export {BookingListItem}
