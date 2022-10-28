const STRINGS = {
  BUTTON_CANCEL: 'CANCEL',
  BUTTON_SAVE: 'SAVE',
  BUTTON_NEXT: 'NEXT',
  BUTTON_BACK: 'BACK',
  PLACEHOLDER_ADD_NOTES: 'Add Notes',
  LABEL_CHECKIN: 'Drop Off',
  LABEL_CHECKLIST: 'Drop off Checklist',
  LABEL_LOG_INCIDENT: 'Log Incident / Issues',
  PLACEHOLDER_END_ODO_READING: 'End Odometer Reading (Kms)',
  INCIDENT_CHECKBOX_TITLE: 'Do you want to log any incident?',
  PLACEHOLDER_ENTER_INCIDENT_LOCATION: 'Enter Incident Location*',
  ERROR_INCIDENT_LOCATION: 'Incident location is a required field',
  LABEL_TYPE_OF_INCIDENT: 'Type of Incident*',
  LABEL_ADDITIONAL_LOCATION_DETAILS: 'Additional Location Details',
  TITLE_CHECKLIST: 'Please select the checklist items to allow you to proceed',
  ERROR_TYPE_OF_INCIDENT: 'Type of Incident is a required field',
  LABEL_SUB_TYPE_OF_INCIDENT: 'Subtype of Incident',
  TITLE_ISSUE_CRITICAL: 'Is this incident/issue critical?',
  PICK_DATE: 'Pick Date',
  PICK_TIME: 'Pick Time',
  REVIEW_ODOMETER_DEVIATION: 'Review Odometer Deviation',
  DEVIATION_MESSAGE: (deviation: number) =>
    `Your odometer deviation of ${deviation}% has exceeded the configured tolerance level of ±10%. Do you want to proceed?`,
  BUTTON_ACCEPT: 'ACCEPT',
  RADIO_OPTIONS: [
    'Update Odometer',
    'Odometer reading is matching',
    'Unsure, leave reading as is',
  ],
  TEXT_ODOMETER_READING: (reading: number) =>
    `Odometer Reading is ${reading} kms.`,
  LABEL_CUSTOM_ATTRIBUTES: 'Other Details',
  ERROR_ODOMETER: 'Odometer reading is not in the acceptable range',
}

export default STRINGS
