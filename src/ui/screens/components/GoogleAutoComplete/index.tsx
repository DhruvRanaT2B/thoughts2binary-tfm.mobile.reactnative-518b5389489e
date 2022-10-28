import {NativeModules} from 'react-native'
import {AutoComplete} from 'types'

const {GoogleAutoComplete: RawGoogleAutoComplete} = NativeModules

const GoogleAutoComplete: AutoComplete = RawGoogleAutoComplete
export {GoogleAutoComplete}
