import React, {useState, useCallback} from 'react'
import {StyleSheet, ScrollView, Alert} from 'react-native'
import {
  Text,
  Input,
  Layout,
  Button,
  Divider,
  useTheme,
  Radio,
  RadioGroup,
  CheckBox,
} from '@ui-kitten/components'
import {SafeAreaView} from '@components'

import STRINGS from './strings'
import {BookingsScreenProps} from 'types'
import {controller} from '@bookings'
import {odoMeterDeviation} from '@utility'

const BookingCheckOut: React.FC<BookingsScreenProps<'BookingCheckOut'>> = ({
  navigation,
  route,
}) => {
  const [notes, setNotes] = useState('')
  const [odoReading, setOdoReading] = useState('')
  const [selected, setSelected] = useState(1)
  const [checked, setChecked] = useState(false)
  const options = STRINGS.RADIO_OPTIONS
  const theme = useTheme()
  const [currentPage, setCurrentPage] = useState(route.params.checkList ? 0 : 1)
  const [selectedChecklistItems, setSelectedChecklistItems] = useState(
    route.params.checkList
      ? new Array(Object.values(route.params.checkList).length).fill(false)
      : new Array(0),
  )

  const showOdoConfirmationPrompt = useCallback(
    (deviation: number, callback: (param: boolean) => void) => {
      Alert.alert(
        STRINGS.REVIEW_ODOMETER_DEVIATION,
        STRINGS.DEVIATION_MESSAGE(deviation),
        [
          {text: STRINGS.BUTTON_CANCEL},
          {text: STRINGS.BUTTON_ACCEPT, onPress: () => callback(true)},
        ],
        {cancelable: false},
      )
    },
    [],
  )

  const postData = () => {
    if (route.params.checkList == undefined) {
      return undefined
    }
    var temp: any = {}
    const listKey = new Array(Object.keys(route.params.checkList))
    const listValue = new Array(Object.values(route.params.checkList))
    selectedChecklistItems.map((i, k) => {
      if (i === true) {
        temp[listKey[0][k]] = listValue[0][k]
      }
    })
    return temp
  }
  const onSavePress = useCallback(
    (flag?: boolean) => {
      if (!flag) {
        let deviationPercentage = odoMeterDeviation(
          Number(route.params.startOdoReading),
          Number(odoReading),
        )
        if (deviationPercentage >= 10 || deviationPercentage <= -10) {
          showOdoConfirmationPrompt(deviationPercentage, onSavePress)
          return
        }
      }
      let temp = postData()
      if (selected == 0) {
        controller.checkOut(route.params.eventEmitter, {
          bookingID: route.params.bookingID,
          notes,
          odoReading: Number(odoReading),
          checkListObj: temp,
        })
      } else {
        controller.checkOut(route.params.eventEmitter, {
          bookingID: route.params.bookingID,
          notes,
          checkListObj: temp,
          //odoReading: Number(odoReading),
        })
      }
      navigation.goBack()
    },
    [route, notes, odoReading, navigation, selected, selectedChecklistItems],
  )

  const renderPageZero = () => (
    <Layout style={styles.pageWrapper}>
      <Text style={{marginBottom: 8}}>{STRINGS.TITLE_CHECKLIST}</Text>
      {Object.values(route.params.checkList).map((i, k) => (
        <CheckBox
          style={styles.checkbox}
          checked={selectedChecklistItems[k]}
          onChange={() => {
            let temp = new Array(selectedChecklistItems.length)
            selectedChecklistItems.map((item, ind) => {
              temp[ind] = ind !== k ? item : !item
            })
            setSelectedChecklistItems(temp)
          }}>
          {() => <Text style={styles.checkListText}>{i as string}</Text>}
        </CheckBox>
      ))}
    </Layout>
  )

  const renderPageOne = () => (
    <Layout style={styles.pageWrapper}>
      <Text style={styles.headText}>
        {STRINGS.TEXT_ODOMETER_READING(route.params.startOdoReading)}
      </Text>
      <RadioGroup
        selectedIndex={selected}
        onChange={index => setSelected(index)}
        style={styles.radio}>
        {options.map(item => (
          <Radio>{item}</Radio>
        ))}
      </RadioGroup>
      {selected == 0 && (
        <Input
          style={styles.input}
          // maxLength={15}
          placeholder={STRINGS.PLACEHOLDER_START_ODO_READING}
          value={odoReading}
          label={
            odoReading.length > 0 ? STRINGS.PLACEHOLDER_START_ODO_READING : ''
          }
          onChangeText={text => setOdoReading(text)}
          keyboardType="decimal-pad"
        />
      )}
      <Input
        style={styles.input}
        placeholder={STRINGS.PLACEHOLDER_ADD_NOTES}
        multiline={true}
        textStyle={styles.notesWrapper}
        value={notes}
        onChangeText={text => setNotes(text)}
        autoCorrect={false}
      />
    </Layout>
  )
  const isNothingSelected = () => {
    let flag: boolean = true
    selectedChecklistItems.map(i => {
      if (i === true) {
        flag = false
      }
    })
    return flag
  }
  return (
    <SafeAreaView
      style={styles.safeAreaView}
      edges={['bottom', 'left', 'right']}>
      <Layout style={styles.container}>
        <ScrollView>
          <Text category="s1" style={styles.headerText}>
            {currentPage == 0
              ? STRINGS.LABEL_CHECKLIST
              : STRINGS.LABEL_CHECKOUT}
          </Text>
          <Divider
            style={[
              styles.divider,
              {backgroundColor: theme['color-primary-default']},
            ]}
          />
          {currentPage === 0 ? renderPageZero() : renderPageOne()}
          <Layout style={styles.buttonWrapper}>
            <Button
              style={styles.button}
              onPress={
                currentPage === 0
                  ? navigation.goBack
                  : () =>
                      route.params.checkList
                        ? setCurrentPage(0)
                        : navigation.goBack()
              }
              appearance="ghost">
              {currentPage === 0
                ? STRINGS.BUTTON_CANCEL
                : route.params.checkList
                ? STRINGS.BUTTON_BACK
                : STRINGS.BUTTON_CANCEL}
            </Button>
            <Button
              style={styles.button}
              onPress={
                currentPage === 0
                  ? () => setCurrentPage(1)
                  : () => onSavePress(selected != 0)
              }
              disabled={
                currentPage === 0
                  ? isNothingSelected()
                  : selected == 0
                  ? !odoReading
                  : false
              }>
              {currentPage === 0 ? STRINGS.BUTTON_NEXT : STRINGS.BUTTON_SAVE}
            </Button>
          </Layout>
        </ScrollView>
      </Layout>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  container: {
    marginHorizontal: 24,
    borderRadius: 8,
  },
  headerText: {
    marginBottom: 12,
    marginTop: 18,
    fontSize: 20,
    marginHorizontal: 12,
  },
  divider: {
    height: 2,
    marginBottom: 14,
  },
  notesWrapper: {
    minHeight: 70,
    maxHeight: 140,
  },
  input: {
    marginVertical: 6,
    marginHorizontal: 12,
  },
  buttonWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: 18,
    marginHorizontal: 12,
  },
  button: {
    marginStart: 8,
    minWidth: 90,
  },
  radio: {
    marginHorizontal: 12,
  },
  headText: {
    marginHorizontal: 12,
  },
  pageWrapper: {
    marginHorizontal: 12,
  },

  checkbox: {
    marginVertical: 6,
  },
  checkListText: {
    fontSize: 13,
    fontWeight: 'normal',
    marginLeft: 10,
    marginRight: 10,
  },
})

export default BookingCheckOut
