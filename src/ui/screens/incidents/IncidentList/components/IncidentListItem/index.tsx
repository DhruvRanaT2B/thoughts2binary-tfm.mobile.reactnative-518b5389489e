import React, {useCallback} from 'react'
import {StyleSheet, TouchableOpacity} from 'react-native'
import {Layout, Text} from '@ui-kitten/components'
import moment from 'moment'
import {STRINGS} from '../../strings'
import {IncidentListItemProps} from 'types'
import {getIncidentStatusColor} from '@utility'

const IncidentListItem: React.FC<IncidentListItemProps> = ({
  item,
  onCardPress,
}) => {
  const incidentDetails = useCallback(
    () =>
      [
        {title: STRINGS.LABEL_VEHICLE_NAME, value: item.vehicle?.name},
        {
          title: STRINGS.LABEL_TYPE,
          value: item.incident_type?.name,
        },
        {
          title: STRINGS.LABEL_SUB_TYPE,
          value: item.incident_sub_type,
        },
        {
          title: STRINGS.LABEL_ADDRESS,
          value: item.address,
        },
        {
          title: STRINGS.LABEL_ADDITIONAL_LOCATION_DETAILS,
          value: item.address_features?.landmark,
        },
        {
          title: STRINGS.LABEL_REPORTED_ON,
          value: moment(item.reported_on?.original).format(
            'DD/MM/YYYY, hh:mm A',
          ),
        },
        {title: STRINGS.LABEL_REPORTED_BY, value: item.reported_by?.name},
        {
          title: STRINGS.LABEL_LAST_UPDATED_ON,
          value: moment(item.modified_at?.original).format(
            'DD/MM/YYYY, hh:mm A',
          ),
        },
      ].filter(
        item =>
          item.value && item.value !== 'undefined' && item.value !== 'null',
      ),
    [item],
  )

  return (
    <TouchableOpacity onPress={onCardPress} activeOpacity={0.7}>
      <Layout style={styles.card}>
        <Layout style={styles.headerOuterWrapper}>
          <Layout style={styles.headerLeftPortion}>
            <Layout>
              <Text category="s1" style={{fontSize: 18, fontWeight: 'bold'}}>
                {`${item.pk} - ${item.vehicle?.name}`}
              </Text>
              <Layout style={styles.headerCaption}>
                <Layout
                  style={[
                    styles.colorDot,
                    {
                      backgroundColor: getIncidentStatusColor(
                        item.status?.status_name!!,
                      ),
                    },
                  ]}
                />
                <Text category="c1">{item.status?.status_name}</Text>
              </Layout>
            </Layout>
          </Layout>
          {item.is_critical && (
            <Layout>
              <Layout style={styles.badge}>
                <Text style={styles.badgeText} category="s2">
                  {STRINGS.LABEL_CRITICAL}
                </Text>
              </Layout>
            </Layout>
          )}
        </Layout>
        <Layout style={styles.detailsWrapper}>
          {incidentDetails().map(({title, value}) =>
            renderDetails(title, value),
          )}
        </Layout>
      </Layout>
    </TouchableOpacity>
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
    borderColor: 'lightgray',
    borderRadius: 4,
  },
  headerOuterWrapper: {
    flexDirection: 'row',
    marginBottom: 12,
    justifyContent: 'space-between',
    paddingStart: 22,
    paddingTop: 12,
  },
  headerLeftPortion: {
    flex: 1,
    flexDirection: 'row',
    paddingEnd: 22,
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
  detailsWrapper: {
    paddingHorizontal: 22,
    paddingBottom: 8,
  },
  badge: {
    backgroundColor: '#C00A27',
    borderTopStartRadius: 4,
    borderBottomStartRadius: 4,
  },
  badgeText: {
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
})

export {IncidentListItem}
