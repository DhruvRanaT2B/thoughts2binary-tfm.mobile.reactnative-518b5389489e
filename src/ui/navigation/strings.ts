const STRINGS = {
  LABEL_ADD_NEW_BOOKING: 'Add New Booking',
  LABEL_BACK: 'Back',
  LABEL_BOOKINGS: 'Bookings',
  LABEL_FILTER: 'Filter',
  MENU_ITEM_LIST_VIEW: 'List',
  MENU_ITEM_WEEK_VIEW: 'Calendar - Week',
  MENU_ITEM_DAILY_VIEW: 'Calendar - Daily',
  SEARCH_BOOKINGS: 'Search Bookings',
  LABEL_INCIDENT_DETAILS: 'Incident Details',
  LABEL_INCIDENTS: 'Incidents',
  SEARCH_INCIDENTS: 'Search Incidents',
  LABEL_EDIT_PROFILE: 'Edit Profile',
  LABEL_EMAIL_VERIFICATION: 'Email Verification',
  TODAY_TITLE: `Today`,
  UPCOMING_TITLE: `Upcoming`,
  PAST_TITLE: `Past`,
  OPEN_TITLE: (incidentNumber: number) => `Open (${incidentNumber})`,

  HISTORICAL_TITLE: (incidentNumber: number) =>
    `Historical (${incidentNumber})`,
  IN_PROGRESS_TITLE: 'In-Progress',
}

export default STRINGS
