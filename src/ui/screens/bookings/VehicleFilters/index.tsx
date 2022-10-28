import React, {useState, useCallback} from 'react'
import {StyleSheet, TouchableOpacity} from 'react-native'
import {
  Layout,
  Button,
  Text,
  CheckBox,
  Divider,
  RadioGroup,
  Radio,
  Icon,
  List,
} from '@ui-kitten/components'
import {BookingsScreenProps} from 'types'

import {SafeAreaView} from '@components'
import STRINGS from './strings'
import {useEffect} from 'react'
import {FILTERS} from '@constants'

const VehicleFilters: React.FC<BookingsScreenProps<'VehicleFilters'>> = ({
  navigation,
  route,
}) => {
  const {filters, selectedFilters, onApply} = route.params
  const [selectedValues, setSelectedValues] =
    useState<{category: string; selectedValues: string[]}[]>(selectedFilters)

  useEffect(() => {
    navigation.setOptions({
      headerBackTitleVisible: false,
      headerLeft: ({tintColor}) => (
        <TouchableOpacity activeOpacity={0.7} onPress={navigation.goBack}>
          <Icon
            name="close-outline"
            fill={tintColor}
            style={{height: 24, width: 24, marginStart: 8}}
          />
        </TouchableOpacity>
      ),
      headerRight: ({tintColor}) => (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            onApply([])
            navigation.goBack()
          }}>
          <Text
            style={{
              color: tintColor,
              textDecorationLine: 'underline',
              marginEnd: 8,
            }}>
            {STRINGS.LABEL_RESET_ALL}
          </Text>
        </TouchableOpacity>
      ),
    })
  }, [navigation, onApply])

  const isChecked = useCallback(
    (category: string, value: string) => {
      let isSelected = false
      selectedValues.forEach(data => {
        if (data.category === category && data.selectedValues.includes(value))
          isSelected = true
      })
      return isSelected
    },
    [selectedValues],
  )

  const onCheckboxPress = useCallback(
    (category: string, value: string, isSelected: boolean) => {
      const newSelectedValues = [...selectedValues]
      let obj = newSelectedValues.filter(data => data.category === category)[0]
      if (obj) {
        let newValues = obj.selectedValues.filter(item => item !== value)
        if (isSelected) newValues.push(value)
        obj.selectedValues = newValues
      } else if (isSelected) {
        newSelectedValues.push({category, selectedValues: [value]})
      }
      setSelectedValues(newSelectedValues)
    },
    [selectedValues],
  )

  const onRadioPress = useCallback(
    (category: string, value: string, isSelected: boolean) => {
      const newSelectedValues = [...selectedValues]
      let obj = newSelectedValues.filter(data => data.category === category)[0]
      const newValues = []
      if (isSelected) newValues.push(value)

      if (obj) {
        obj.selectedValues = newValues
      } else {
        newSelectedValues.push({category, selectedValues: newValues})
      }
      setSelectedValues(newSelectedValues)
    },
    [selectedValues],
  )

  const onApplyPress = useCallback(() => {
    onApply(selectedValues)
    navigation.goBack()
  }, [navigation, selectedValues])

  const prepareCheckBoxes = useCallback(
    (category: string, values: string[]) => {
      const checkBoxes = []
      for (let i = 0; i < values.length; i++) {
        const currentItem = values[i]
        const nextItem = values[i + 1]
        if (i % 2 == 0) {
          checkBoxes.push(
            <Layout style={styles.checkBoxRow}>
              <Layout style={{flex: 1}}>
                <CheckBox
                  style={{paddingEnd: 8}}
                  checked={isChecked(category, currentItem)}
                  onChange={value => {
                    onCheckboxPress(category, currentItem, value)
                  }}>
                  {currentItem}
                </CheckBox>
              </Layout>
              {nextItem && (
                <Layout style={{flex: 1}}>
                  <CheckBox
                    checked={isChecked(category, nextItem)}
                    onChange={value => {
                      onCheckboxPress(category, nextItem, value)
                    }}>
                    {nextItem}
                  </CheckBox>
                </Layout>
              )}
            </Layout>,
          )
        }
      }
      return checkBoxes
    },
    [isChecked, onCheckboxPress],
  )

  const prepareRadioButtons = useCallback(
    (category: string, values: string[]) => {
      const radioButtons = []
      for (let i = 0; i < values.length; i++) {
        const currentItem = values[i]
        const nextItem = values[i + 1]
        if (i % 2 == 0) {
          radioButtons.push(
            <Layout style={styles.checkBoxRow}>
              <Layout style={{flex: 1}}>
                <Radio
                  style={{paddingEnd: 8}}
                  checked={isChecked(category, currentItem)}
                  onChange={isChecked => {
                    onRadioPress(category, currentItem, isChecked)
                  }}>
                  {currentItem}
                </Radio>
              </Layout>
              {nextItem && (
                <Layout style={{flex: 1}}>
                  <Radio
                    checked={isChecked(category, nextItem)}
                    onChange={isChecked => {
                      onRadioPress(category, nextItem, isChecked)
                    }}>
                    {nextItem}
                  </Radio>
                </Layout>
              )}
            </Layout>,
          )
        }
      }
      return <RadioGroup>{radioButtons}</RadioGroup>
    },
    [isChecked, onRadioPress],
  )

  const renderFilters = useCallback(
    ({
      item,
    }: {
      item: {category: FILTERS; values: string[]; multiSelect: boolean}
    }) => (
      <Layout>
        <Text style={styles.label} category="s1">
          {item.category}
        </Text>
        {item.multiSelect
          ? prepareCheckBoxes(item.category, item.values)
          : prepareRadioButtons(item.category, item.values)}
      </Layout>
    ),
    [prepareCheckBoxes, prepareRadioButtons],
  )

  const divider = useCallback(() => <Divider style={styles.divider} />, [])

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <List
        style={styles.list}
        data={filters}
        renderItem={renderFilters}
        ItemSeparatorComponent={divider}
      />
      <Button style={styles.button} onPress={onApplyPress}>
        {STRINGS.BUTTON_APPLY}
      </Button>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: 'transparent',
  },
  label: {
    marginTop: 18,
    marginBottom: 8,
  },
  checkBoxRow: {
    flex: 1,
    flexDirection: 'row',
    marginVertical: 6,
  },
  divider: {
    marginTop: 6,
    height: 2,
  },
  button: {
    marginBottom: 12,
    marginHorizontal: 10,
  },
})

export default VehicleFilters
