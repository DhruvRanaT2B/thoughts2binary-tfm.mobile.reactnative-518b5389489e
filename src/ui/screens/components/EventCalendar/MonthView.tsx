import React, {useState, useCallback} from 'react'
import {TouchableOpacity, ScrollView} from 'react-native'
import {
  Layout,
  Text,
  StyleService,
  useStyleSheet,
  Divider,
} from '@ui-kitten/components'
import moment from 'moment'

import {CalendarEventMonthly, MonthViewProps} from 'types'
import {processMonthEvents} from './Packer'

// Global Constants
const formatDuration = 'Do MMM'

const MonthView = ({
  onEventPress,
  events,
  format24h,
  width,
}: MonthViewProps) => {
  const styles = useStyleSheet(themedStyles)
  const formatTime = format24h ? 'HH:mm' : 'hh:mm A'

  const [data, setData] = useState<CalendarEventMonthly[][][]>([])

  React.useEffect(() => {
    if (events.length > 0) {
      const processedData = processMonthEvents(events)
      setData(processedData)
    } else setData([])
  }, [events])

  const renderBadge = useCallback((date: string) => {
    const isSameDay = moment(date).isSame(new Date(), 'day')
    return (
      <Layout style={styles.badgeWrapper}>
        <Layout
          style={[styles.badge, isSameDay ? null : {backgroundColor: 'white'}]}>
          <Text
            appearance={isSameDay ? 'alternative' : 'default'}
            style={styles.badgeDateText}>
            {moment(date).format('D')}
          </Text>
        </Layout>
        <Text status={isSameDay ? 'primary' : 'basic'} category="s2">
          {moment(date).format('ddd')}
        </Text>
      </Layout>
    )
  }, [])

  if (data.length <= 0)
    return (
      <Layout style={[styles.emptyViewWrapper, {width}]}>
        <Text>No Data Available</Text>
      </Layout>
    )

  return (
    <ScrollView style={{width}}>
      {data.map((dayList, i) => (
        <Layout style={styles.dayContainer} key={i}>
          <Layout style={{flexDirection: 'row'}}>
            {renderBadge(dayList[0]?.[0]?.start)}
            <Layout style={{flex: 1}}>
              {dayList.map((events, j) => {
                let recentMargin = 0
                return (
                  <Layout
                    style={styles.eventContainer}
                    key={String(i) + String(j)}>
                    {events.map((event, index, allEvents) => {
                      const customStyle: any = {}
                      if (event.color) customStyle['borderColor'] = event.color
                      if (allEvents.length > 1) customStyle['height'] = 120
                      let marginTop = 0

                      if (index > 0) {
                        let minutesDiff = moment(event.start).diff(
                          moment(allEvents[index - 1].start),
                          'minutes',
                        )
                        minutesDiff =
                          (minutesDiff /
                            moment(allEvents[index - 1].end).diff(
                              moment(allEvents[index - 1].start),
                              'minutes',
                            )) *
                          100
                        marginTop = (minutesDiff / 100) * 120
                        if (marginTop > 120) marginTop = 120
                      }
                      customStyle['marginTop'] = marginTop + recentMargin
                      recentMargin = customStyle.marginTop

                      return (
                        <TouchableOpacity
                          activeOpacity={0.8}
                          key={String(i) + String(j) + String(index)}
                          style={{flex: 1}}
                          onPress={() =>
                            onEventPress({
                              id: event.id,
                              color: event.color,
                              start: event.start,
                              end: event.end,
                              title: event.title,
                              summary: event.summary,
                            })
                          }>
                          {
                            <Layout style={[styles.event, customStyle]}>
                              {event.title && (
                                <Text
                                  style={[
                                    styles.eventText,
                                    event.color ? {color: event.color} : null,
                                  ]}
                                  numberOfLines={
                                    allEvents.length > 2 ? 1 : undefined
                                  }>
                                  {event.title}
                                </Text>
                              )}
                              <Text
                                style={[
                                  styles.eventText,
                                  event.color ? {color: event.color} : null,
                                ]}
                                category="p2"
                                numberOfLines={
                                  allEvents.length > 2 ? 2 : undefined
                                }>
                                {event.summary}
                              </Text>
                              <Text
                                style={[
                                  styles.eventTimes,
                                  event.color ? {color: event.color} : null,
                                ]}
                                category="p2"
                                numberOfLines={3}>
                                {moment(event.start).format(formatTime)} -{' '}
                                {moment(event.end).format(formatTime)}
                              </Text>
                              {event.multipleDays && (
                                <Layout style={styles.multiDaysContainer}>
                                  <Text
                                    style={[
                                      styles.eventText,
                                      {textAlign: 'right'},
                                      event.color ? {color: event.color} : null,
                                    ]}
                                    category="p2">
                                    {moment(event.startsFrom).format(
                                      formatDuration,
                                    )}{' '}
                                    -{' '}
                                    {moment(event.endsOn).format(
                                      formatDuration,
                                    )}
                                  </Text>
                                </Layout>
                              )}
                            </Layout>
                          }
                        </TouchableOpacity>
                      )
                    })}
                  </Layout>
                )
              })}
            </Layout>
          </Layout>
          <Divider style={styles.divider} />
        </Layout>
      ))}
    </ScrollView>
  )
}

const themedStyles = StyleService.create({
  emptyViewWrapper: {
    alignItems: 'center',
    marginVertical: 12,
  },
  dayContainer: {
    margin: 6,
  },
  divider: {
    marginTop: 18,
    height: 2,
  },
  eventContainer: {
    flexDirection: 'row',
    flex: 1,
    marginVertical: 2,
  },
  event: {
    borderRadius: 4,
    borderWidth: 1,
    padding: 8,
    flex: 1,
    maxHeight: 150,
    overflow: 'hidden',
    borderColor: 'color-primary-default',
  },
  eventText: {
    marginVertical: 3,
    color: 'color-primary-default',
  },
  eventTimes: {
    marginTop: 3,
    color: 'color-primary-default',
  },
  badgeWrapper: {
    alignItems: 'center',
    marginEnd: 12,
    marginStart: 6,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 40,
    borderColor: 'color-primary-default',
    backgroundColor: 'color-primary-default',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  badgeDateText: {
    fontSize: 18,
  },
  multiDaysContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
})

export {MonthView}
