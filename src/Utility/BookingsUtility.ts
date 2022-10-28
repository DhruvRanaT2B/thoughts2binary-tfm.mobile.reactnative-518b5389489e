/**
 * Function used to get a colour on the basis of booking status
 * @param status Booking status
 * @returns Status colour
 */
function getBookingStatusColor(status: string): string {
  let color = '#000000'
  switch (status) {
    case 'Completed':
      color = '#5daf16'
      break
    case 'Approved':
      color = '#439688'
      break
    case 'Declined':
      color = '#b83424'
      break
    case 'Cancelled':
      color = '#ed4736'
      break
    case 'In-Progress':
      color = '#DDC200'
      break
    case 'Pending Approval':
      color = '#7a7a7a'
      break
  }
  return color
}

/**
 * Function used to calculate odometer deviation in percentage
 * @param startOdoReading Start odometer reading
 * @param endOdoReading End odometer reading
 * @returns deviation (in percentage)
 */
function odoMeterDeviation(startOdoReading: number, endOdoReading: number) {
  let deviation = ((endOdoReading - startOdoReading) / startOdoReading) * 100
  return Math.round(deviation * 100) / 100
}

export {getBookingStatusColor, odoMeterDeviation}
