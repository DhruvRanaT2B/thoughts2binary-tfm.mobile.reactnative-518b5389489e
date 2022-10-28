import moment from 'moment'
import {CalendarEventMonthly, CalendarEventWithDimens} from 'types'

const CALENDER_HEIGHT = 2400
const offset = CALENDER_HEIGHT / 24

function buildEvent(col: CalendarEventMonthly, left: number, width: number) {
  let column = col as CalendarEventWithDimens
  const startTime = moment(column.start)
  const endTime = column.end
    ? moment(column.end)
    : startTime.clone().add(1, 'hour')
  const diffHours = startTime.diff(
    startTime.clone().startOf('day'),
    'hours',
    true,
  )

  column.top = diffHours * offset
  column.height = endTime.diff(startTime, 'hours', true) * offset
  column.width = width
  column.left = left
  return column
}

function collision(a: CalendarEventMonthly, b: CalendarEventMonthly) {
  return a.end > b.start && a.start < b.end
}

function expand(
  ev: CalendarEventMonthly,
  column: number,
  columns: CalendarEventMonthly[][],
) {
  var colSpan = 1

  for (var i = column + 1; i < columns.length; i++) {
    var col = columns[i]
    for (var j = 0; j < col.length; j++) {
      var ev1 = col[j]
      if (collision(ev, ev1)) {
        return colSpan
      }
    }
    colSpan++
  }

  return colSpan
}

function pack(
  columns: CalendarEventMonthly[][],
  width: number,
  calculatedEvents: CalendarEventWithDimens[],
) {
  var colLength = columns.length

  for (var i = 0; i < colLength; i++) {
    var col = columns[i]
    for (var j = 0; j < col.length; j++) {
      var colSpan = expand(col[j], i, columns)
      var L = (i / colLength) * width
      var W = (width * colSpan) / colLength - 10

      calculatedEvents.push(buildEvent(col[j], L, W))
    }
  }
}

function populateEvents(events: CalendarEventMonthly[], screenWidth: number) {
  let lastEnd: string | null = null
  let columns: CalendarEventMonthly[][] = []
  let calculatedEvents: CalendarEventWithDimens[] = []

  events = events
    .map((ev, index) => ({...ev, index: index}))
    .sort(function (a, b) {
      if (a.start < b.start) return -1
      if (a.start > b.start) return 1
      if (a.end < b.end) return -1
      if (a.end > b.end) return 1
      return 0
    })

  events.forEach(function (ev, index) {
    if (lastEnd !== null && ev.start >= lastEnd) {
      pack(columns, screenWidth, calculatedEvents)
      columns = []
      lastEnd = null
    }

    var placed = false
    for (var i = 0; i < columns.length; i++) {
      var col = columns[i]
      if (!collision(col[col.length - 1], ev)) {
        col.push(ev)
        placed = true
        break
      }
    }

    if (!placed) {
      columns.push([ev])
    }

    if (lastEnd === null || ev.end > lastEnd) {
      lastEnd = ev.end
    }
  })

  if (columns.length > 0) {
    pack(columns, screenWidth, calculatedEvents)
  }
  return calculatedEvents
}
/**
 *
 * @param events Array of CalendarEventMonthly
 * @returns Three-dimensional CalendarEventMonthly array (list of overlapping or non-overlapping
 * events of a particular month uniquely distinguished by day)
 */
function processMonthEvents(events: CalendarEventMonthly[]) {
  // Sort events on the basis of start-time
  events.sort((a, b) => {
    if (a.start < b.start) return -1
    if (a.start > b.start) return 1
    return 0
  })

  // Club events on the basis of day of month
  const dayList: CalendarEventMonthly[][] = []
  let day = moment(events[0].start)

  let tempArray: CalendarEventMonthly[] = []
  for (let i = 0; i < events.length; i++) {
    if (!moment(events[i].start).isSame(day, 'day')) {
      day = moment(events[i].start)
      dayList.push(tempArray)
      tempArray = []
    }
    tempArray.push(events[i])
  }
  if (tempArray.length > 0) dayList.push(tempArray)

  /**
   * array[i] will give the list of events in a particular day
   * array[i][i] will give the list of overlapping events
   * array[i][i][i] will give the event itself
   */
  const array: CalendarEventMonthly[][][] = []
  for (let i = 0; i < dayList.length; i++) {
    const eventList = dayList[i]
    const tempArray2: CalendarEventMonthly[][] = []
    tempArray = []
    let startDate = eventList[0].start
    let endDate = eventList[0].end

    for (let j = 0; j < eventList.length; j++) {
      const event = eventList[j]
      if (
        !(event.start >= startDate && event.start < endDate) &&
        tempArray.length > 0
      ) {
        tempArray2.push(tempArray)
        tempArray = []
        startDate = event.start
        endDate = event.end
      } else endDate = event.end > endDate ? event.end : endDate
      tempArray.push(event)
      // startDate = event.start
    }
    if (tempArray.length > 0) tempArray2.push(tempArray)
    array.push(tempArray2)
  }
  return array
}

/**
 * Takes an array of events and converts every multiple days events into single day event
 * @param events Array of CalendarEvent
 * @returns Array of CalendarEvent
 */
function produceSingleDayEvents(events: CalendarEventMonthly[]) {
  const _events: CalendarEventMonthly[] = []
  events.forEach(event => {
    if (moment(event.start).isSame(moment(event.end), 'day')) {
      _events.push(event)
      return
    }
    const e: CalendarEventMonthly[] = [event]
    splitIntoDay(e)
    e.forEach(item => _events.push(item))
  })
  return _events
}

/**
 * Takes a single event in an array and if that event is a multiple days event
 * then creates single day events and append them to the same array
 * @param events Array of CalendarEvent
 * @returns Array of CalendarEvent
 */
function splitIntoDay(events: CalendarEventMonthly[]) {
  const firstEvent = events[0]
  const startDay = moment(events[events.length - 1].start)
  const endDay = moment(events[events.length - 1].end)
  if (moment(startDay).isSame(endDay, 'day')) return
  const eventToBreak = events.pop()
  if (eventToBreak) {
    const endDate = eventToBreak.end
    const nextDate = moment(eventToBreak.start).add(1, 'days').toISOString()

    eventToBreak.end = moment(eventToBreak.start).endOf('day').toISOString()
    eventToBreak.multipleDays = true
    eventToBreak.startsFrom = firstEvent.start
    eventToBreak.endsOn = endDate

    const nextEvent: CalendarEventMonthly = {
      id: eventToBreak.id,
      color: eventToBreak.color,
      title: eventToBreak.title,
      summary: eventToBreak.summary,
      start: moment(nextDate).startOf('day').toISOString(),
      end: endDate,
      multipleDays: true,
      startsFrom: firstEvent.start,
      endsOn: endDate,
    }

    events.push(eventToBreak)
    events.push(nextEvent)
    splitIntoDay(events)
  }
}

export {populateEvents, processMonthEvents, produceSingleDayEvents}
