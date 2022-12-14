const STRINGS = {
  LABEL_GENERAL_DETAILS: 'General Details',
  LABEL_BRANCH: 'Branch *',
  LABEL_DESTINATION: 'Destination',
  PLACEHOLDER_DESTINATION: 'Destination (Optional)',
  LABEL_ADDITIONAL_LOCATION_DETAILS: 'Additional Location Details',
  LABEL_DRIVER: 'Driver *',
  LABEL_RECURRING: 'Recurring *',
  PLACEHOLDER_RECURRING_TYPE: 'Recurring Type',
  LABEL_RECURRING_OPTIONS: 'Recurring Options *',
  RADIO_YES: 'Yes',
  RADIO_NO: 'No',
  BUTTON_SEARCH: 'SEARCH VEHICLES',
  LABEL_PICKUP_DATE: 'Pickup Date *',
  LABEL_PICKUP_TIME: 'Pickup Time *',
  LABEL_RETURN_DATE: 'Return Date *',
  LABEL_END_DATE: 'Ends On *',
  LABEL_RETURN_TIME: 'Return Time *',
  ERROR_GETTING_LOCATION:
    'Sorry! We are having trouble in getting your location',
  NEED_LOCATION_PERMISSION:
    'Creating or editing a booking needs access to your location. Please grant location permisssion to continue.',
  BUTTON_OKAY: 'Okay',
  GRANT_PERMISSION: 'Grant permision',
  SOMETHING_WENT_WRONG: 'Oops! Something went wrong.',
  RECURRING_TYPE_DAILY: 'Daily',
  RECURRING_TYPE_WEEKLY: 'Weekly',
  RECURRING_TYPE_MONTHLY: 'Monthly',
  LABEL_DAYS_OF_WEEK: 'Days of Week *',
  LABEL_DATES_OF_MONTH: 'Dates of Month *',
  SUNDAY: 'Sunday',
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
  LABEL_EDIT_BOOKING: 'Edit Booking',
  PLACEHOLDER_SELECT_DRIVER: 'Select a driver',
  PLACEHOLDER_SELECT_BRANCH: 'Select a branch',
  FAILED_TO_LOAD_DRIVERS: 'Failed to load drivers',
  ERROR_MESSAGE_ENDS_ON_FOOTER: 'Ends On must be greater than Start Date',
  ERROR_MESSAGE_RECURRING_FOOTER:
    'To create recurring booking, the booking start date and end date should be same',
  LABEL_NOTE: 'Note *: ',
  LABEL_ERROR: 'Error',
  ERROR_MESSAGE_HEADER: (num: number) =>
    `Driver can't be added because he is being associated with ${num} booking(s).`,
  ERROR_MESSAGE_FOOTER:
    'In order to add/edit this booking please update existing start date/time and end date/time.',
  LABEL_BOOKING_ID: 'Booking ID',
  DATES: [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
  ],
  BUSINESS_HOURS: (hours: String) => `Business Hours: ${hours}`,
  PICK_START_DATE: 'Pick start date',
  PICK_END_DATE: 'Set end date',
  SET_START_TIME: 'Set start time',
  SET_END_TIME: 'Set end time',
  SET_TIME: 'Set Time',
  LICENSE_EXPIRED: "Driver's license is expired",
}

export default STRINGS
