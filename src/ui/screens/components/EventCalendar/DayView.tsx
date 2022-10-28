import React, {useState, useRef} from 'react'
import {ScrollView, TouchableOpacity} from 'react-native'
import {
  Layout,
  Text,
  useTheme,
  StyleService,
  useStyleSheet,
} from '@ui-kitten/components'
import moment from 'moment'
import _ from 'lodash'

import {populateEvents} from './Packer'
import {CalendarEvent, CalendarEventWithDimens, DayViewProps} from 'types'

const LEFT_MARGIN = 59
const CALENDER_HEIGHT = 2400
const TEXT_LINE_HEIGHT = 17

function range(from: number, to: number) {
  return Array.from(Array(to), (_, i) => from + i)
}

const DayView = ({
  scrollToFirst,
  format24h,
  width,
  onEventPress,
  events,
}: DayViewProps) => {
  const theme = useTheme()
  const scrollRef = useRef<ScrollView>(null)
  const [packedEvents, setPackedEvents] = useState<CalendarEventWithDimens[]>(
    [],
  )

  const styles = useStyleSheet(themedStyles)

  React.useEffect(() => {
    const w = width - LEFT_MARGIN
    const packedEvents = populateEvents(events, w)
    let initPosition = _.min(_.map(packedEvents, 'top')) - CALENDER_HEIGHT / 24
    initPosition = initPosition < 0 ? 0 : initPosition
    setPackedEvents(packedEvents)
    scrollToFirst && scrollToFirstItem(initPosition)
  }, [events])

  React.useEffect(() => {
    const w = width - LEFT_MARGIN
    const packedEvents = populateEvents(events, w)
    setPackedEvents(packedEvents)
  }, [events, width])

  const scrollToFirstItem = (position: number) => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current?.scrollTo({
          x: 0,
          y: position,
          animated: true,
        })
      }
    }, 1)
  }

  const renderRedLine = () => {
    if (
      !packedEvents[0] ||
      !moment(packedEvents[0].start).isSame(new Date(), 'day')
    )
      return null
    const offset = CALENDER_HEIGHT / 24
    const timeNowHour = moment().hour()
    const timeNowMin = moment().minutes()
    return (
      <Layout
        key={`timeNow`}
        style={[
          styles.lineNow,
          {
            top: offset * timeNowHour + (offset * timeNowMin) / 60,
            width: width - 20,
          },
        ]}
      />
    )
  }

  const renderLines = () => {
    const offset = CALENDER_HEIGHT / 24

    return range(0, 25).map((item, i) => {
      let timeText
      if (i === 0) {
        timeText = ``
      } else if (i < 12) {
        timeText = !format24h ? `${i} AM` : i
      } else if (i === 12) {
        timeText = !format24h ? `${i} PM` : i
      } else if (i === 24) {
        timeText = !format24h ? `12 AM` : 0
      } else {
        timeText = !format24h ? `${i - 12} PM` : i
      }
      return [
        <Text
          key={`timeLabel${i}`}
          style={[styles.timeLabel, {top: offset * i - 6}]}
          status="primary"
          category="c1">
          {timeText}
        </Text>,
        i === 0 ? null : (
          <Layout
            key={`line${i}`}
            style={[styles.line, {top: offset * i, width: width - 20}]}
          />
        ),
        <Layout
          key={`lineHalf${i}`}
          style={[styles.line, {top: offset * (i + 0.5), width: width - 20}]}
        />,
      ]
    })
  }

  const onEventTapped = (event: CalendarEvent) => {
    onEventPress({
      id: event.id,
      color: event.color,
      start: event.start,
      end: event.end,
      title: event.title,
      summary: event.summary,
    })
  }

  const renderEvents = () =>
    packedEvents.map((event, i) => {
      // Fixing the number of lines for the event title makes this calculation easier.
      // However it would make sense to overflow the title to a new line if needed
      const numberOfLines = Math.floor(event.height / TEXT_LINE_HEIGHT)
      const formatTime = format24h ? 'HH:mm' : 'hh:mm A'
      return (
        <Layout
          key={i}
          style={[
            styles.event,
            {
              marginLeft: LEFT_MARGIN,
              left: event.left,
              height: event.height,
              width: event.width,
              top: event.top,
              borderColor: event.color || theme['color-primary-default'],
            },
          ]}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={{
              minHeight: 25,
              height: event.height,
              width: event.width,
            }}
            onPress={() => onEventTapped(event)}>
            {event.title && (
              <Text
                numberOfLines={1}
                style={[
                  styles.eventTitle,
                  {color: event.color || theme['color-primary-default']},
                ]}>
                {event.title}
              </Text>
            )}
            <Text
              numberOfLines={1}
              style={[
                styles.eventSummary,
                {color: event.color || theme['color-primary-default']},
              ]}
              category="p2">
              {event.summary || ' '}
            </Text>
            <Text
              style={[
                styles.eventTimes,
                {color: event.color || theme['color-primary-default']},
              ]}
              numberOfLines={1}
              category="p2">
              {moment(event.start).format(formatTime)} -{' '}
              {moment(event.end).format(formatTime)}
            </Text>
          </TouchableOpacity>
        </Layout>
      )
    })

  return (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={[styles.contentStyle, {width}]}>
      {renderLines()}
      {renderEvents()}
      {renderRedLine()}
    </ScrollView>
  )
}

const themedStyles = StyleService.create({
  event: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 4,
    paddingStart: 12,
    minHeight: 25,
    flex: 1,
    paddingTop: 5,
    paddingBottom: 0,
    flexDirection: 'column',
    alignItems: 'flex-start',
    overflow: 'hidden',
  },
  eventTitle: {
    minHeight: 15,
  },
  eventSummary: {
    flexWrap: 'wrap',
  },
  eventTimes: {
    marginTop: 3,
    flexWrap: 'wrap',
  },
  contentStyle: {
    height: CALENDER_HEIGHT + 10,
  },
  lineNow: {
    height: 1,
    position: 'absolute',
    left: 49,
    backgroundColor: 'color-danger-default',
  },
  timeLabel: {
    position: 'absolute',
    left: 15,
  },
  line: {
    height: 1,
    position: 'absolute',
    left: 49,
    opacity: 0.4,
    backgroundColor: 'color-primary-default',
  },
})

export {DayView}
