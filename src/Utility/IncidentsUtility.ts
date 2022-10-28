/**
 * Function used to get a colour on the basis of incident status
 * @param status Incident status
 * @returns Status colour
 */
function getIncidentStatusColor(status: string): string {
  let color = '#000000'
  switch (status) {
    case 'Completed':
      color = '#14892C'
      break
    case 'Open':
      color = '#C00A27'
      break
    case 'In progress':
      color = '#e8b021'
      break
    case 'On-Hold':
      color = '#7a7a7a'
      break
  }
  return color
}

/**
 * Function used to get a colour on the basis of note status
 * @param status Note status
 * @returns Status colour
 */
function getNoteStatusColor(status: string): string {
  let color = '#FFFFFF'
  switch (status) {
    case 'ALERT':
      color = '#f2dada'
      break
    case 'INFO':
      color = '#eafafe'
      break
    case 'WARNING':
      color = '#fdf6dc'
      break
  }
  return color
}

export {getIncidentStatusColor, getNoteStatusColor}
