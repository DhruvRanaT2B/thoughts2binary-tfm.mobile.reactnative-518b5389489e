const STRINGS = {
  PLACEHOLDER_ADD_NOTES: 'Add Notes',
  BUTTON_CANCEL: 'CANCEL',
  BUTTON_SAVE: 'SAVE',
  BUTTON_ACCEPT: 'ACCEPT',
  BUTTON_BACK: 'BACK',
  BUTTON_NEXT: 'NEXT',
  LABEL_CHECKOUT: 'Pick Up',
  LABEL_CHECKLIST: 'Pick Up Checklist',
  TITLE_CHECKLIST: 'Please select the checklist items to allow you to proceed',
  PLACEHOLDER_START_ODO_READING: 'Start Odometer Reading (Kms)',
  RADIO_OPTIONS: [
    'Update Odometer',
    'Odometer reading is matching',
    'Unsure, leave reading as is',
  ],
  TEXT_ODOMETER_READING: (reading: number) =>
    `Odometer Reading is ${reading} kms.`,
  INCIDENT_CHECKBOX_TITLE: 'Do you want to log any incident?',
  REVIEW_ODOMETER_DEVIATION: 'Review Odometer Deviation',
  DEVIATION_MESSAGE: (deviation: number) =>
    `Your odometer deviation of ${deviation}% has exceeded the configured tolerance level of ±10%. Do you want to proceed?`,
}

export default STRINGS
