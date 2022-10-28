import moment from 'moment'

/**
 * Function responsible for providing list of past years
 * @param value number of past years to return
 * @returns array of years
 */
function getLastYears(value: number) {
  const currentYear = moment().year()
  let array: string[] = []
  for (let i = currentYear; i > currentYear - value; i--) {
    array.push(String(i))
  }
  return array.reverse()
}

/**
 * function responsible for generating the time array
 * @param interval number to provide the time gap between successive time
 * @returns array of timestamps
 */
const generateTimeArray = (interval: number) => {
  let times = []
  let totalTime = 0
  let meridian = [' AM', ' PM']

  for (let i = 0; totalTime < 24 * 60; i++) {
    let hh = Math.floor(totalTime / 60)
    let mm = totalTime % 60
    times[i] =
      ('0' + (hh % 12)).slice(-2) +
      ':' +
      ('0' + mm).slice(-2) +
      meridian[Math.floor(hh / 12)]
    if (times[i].includes('00:')) {
      times[i] = '12' + times[i].slice(times[i].indexOf(':'))
    }
    totalTime = totalTime + interval
  }
  let timeA = times.slice(times.indexOf('08:00 AM'))
  let timeB = times.slice(0, times.indexOf('08:00 AM'))
  return timeA.concat(timeB)
}

//function to convert 24 hour format into 12 hour format
function timeConvert(time: any) {
  time = String(time).match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [
    time,
  ]
  if (time.length > 1) {
    time = time.slice(1)
    time[5] = +time[0] < 12 ? ' AM' : ' PM'
    time[0] = +time[0] % 12 || 12
  }
  return time.join('')
}

export {getLastYears, generateTimeArray, timeConvert}
