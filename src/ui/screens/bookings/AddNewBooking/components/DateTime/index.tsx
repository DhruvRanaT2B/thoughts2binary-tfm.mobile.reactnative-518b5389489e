import React, {useState} from 'react'
import {TouchableOpacity} from 'react-native'
import {Layout, Text, StyleService, useStyleSheet} from '@ui-kitten/components'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import moment from 'moment'

import {DateTimeProps} from 'types'
import Calendar from '@images/Calendar.svg'
import Clock from '@images/Clock.svg'

// Global Variables
let dateTimePickerMode: 'date' | 'time' = 'date'

function DateTime({
  date = new Date(),
  onDateChange,
  dateLabel,
  timeLabel,
  datePattern = 'D MMM yyyy dddd',
  timePattern = 'hh:mm A',
  minDate,
  minuteInterval = 1,
  dateOnly,
}: DateTimeProps) {
  const styles = useStyleSheet(themedstyles)

  const [dateTimePickerVisible, setDateTimePickerVisible] = useState(false)

  const handleConfirm = (date: Date) => {
    setDateTimePickerVisible(false)
    if (minDate) {
      if (date < minDate) date = minDate
    }
    onDateChange(date)
  }

  const DateContainer = () => (
    <Layout style={[{flex: 1}]}>
      {dateLabel && (
        <Text category="label" style={styles.label}>
          {dateLabel}
        </Text>
      )}
      <TouchableOpacity
        style={styles.dateTimeOuterWrapper}
        activeOpacity={0.6}
        onPress={() => {
          dateTimePickerMode = 'date'
          setDateTimePickerVisible(true)
        }}>
        <Layout style={styles.dateWrapper}>
          <Text style={styles.text}>{moment(date).format(datePattern)}</Text>
        </Layout>

        <Layout style={styles.iconWrapper}>
          <Calendar color="grey" height={18} width={18} />
        </Layout>
      </TouchableOpacity>
    </Layout>
  )
  const TimeContainer = () => (
    <Layout style={{marginStart: 12, flex: 1}}>
      {timeLabel && (
        <Text category="label" style={styles.label}>
          {timeLabel}
        </Text>
      )}
      <TouchableOpacity
        style={styles.dateTimeOuterWrapper}
        activeOpacity={0.6}
        onPress={() => {
          dateTimePickerMode = 'time'
          setDateTimePickerVisible(true)
        }}>
        <Layout style={styles.dateWrapper}>
          <Text style={styles.text}>{moment(date).format(timePattern)}</Text>
        </Layout>
        <Layout style={styles.iconWrapper}>
          <Clock color="grey" height={18} width={18} />
        </Layout>
      </TouchableOpacity>
    </Layout>
  )

  return (
    <Layout style={styles.outerWrapper}>
      <DateContainer />
      {!dateOnly && <TimeContainer />}
      <DateTimePickerModal
        isVisible={dateTimePickerVisible}
        headerTextIOS={
          dateTimePickerMode === 'time' ? 'Pick a time' : 'Pick a date'
        }
        date={date}
        mode={dateTimePickerMode}
        onConfirm={handleConfirm}
        onCancel={() => setDateTimePickerVisible(false)}
        minimumDate={minDate}
        minuteInterval={minuteInterval}
      />
    </Layout>
  )
}

const themedstyles = StyleService.create({
  outerWrapper: {
    flex: 1,
    flexDirection: 'row',
    marginVertical: 6,
  },
  label: {
    color: 'grey',
    marginBottom: 6,
  },
  dateTimeOuterWrapper: {
    flex: 1,
    borderWidth: 0.5,
    flexDirection: 'row',
    borderRadius: 4,
    borderColor: 'grey',
  },
  dateWrapper: {
    flex: 4,
    padding: 10,
    borderTopStartRadius: 4,
    borderBottomStartRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'background-basic-color-3',
  },
  text: {
    textAlign: 'center',
  },
  iconWrapper: {
    flex: 1,
    padding: 10,
    borderTopEndRadius: 4,
    borderBottomEndRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'background-basic-color-3',
  },
})

export default DateTime
