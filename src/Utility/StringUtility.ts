function isValidEmail(email: string): Boolean {
  const emailPattern =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return email.length > 0 && emailPattern.test(email)
}

/**
 * Function responsible for giving back range of numbers(strings)
 * @param startNumber Start Range
 * @param endNumber End Range
 * @returns List of numbers(strings)
 */
const getStringNumbers = (startNumber: number, endNumber: number) => {
  let array: string[] = []
  for (let i = startNumber; i <= endNumber; i++) {
    array.push(String(i))
  }
  return array
}

/**
 * Function to check whether a password contains atleast 6 characters, one capital letter and one number
 * @param password password to check
 * @returns Boolean indicating whether a password is valid or not
 */
const isValidPassword = (password: string) => {
  if (password.length < 6) return false
  const numbers = password.match(/[0-9]/g)
  if (numbers === null) return false
  const upperCaseLetters = password.match(/[A-Z]/g)
  if (upperCaseLetters === null) return false
  return true
}

/**
 * Function to encode an array of strings in a format which can be used in query params
 * @param array array of strings
 * @returns string
 */
const encodeArray = (array: string[] = []) => {
  let str = '['
  for (let i = 0; i < array.length; i++) {
    str += `"${array[i]}"`
    if (i != array.length - 1) {
      str += ','
    }
  }
  str += ']'
  return str
}

/**
 * Function to encode an array of strings in a format which can be used in query params of the exclude_status_names
 * @param array array of strings
 * @returns string
 */
const encodeExcludeArray = (array: string[] = []) => {
  let str = '['
  for (let i = 0; i < array.length; i++) {
    str += `'${array[i]}'`
    if (i != array.length - 1) {
      str += ','
    }
  }
  str += ']'
  return str
}

export {
  isValidEmail,
  getStringNumbers,
  isValidPassword,
  encodeArray,
  encodeExcludeArray,
}
