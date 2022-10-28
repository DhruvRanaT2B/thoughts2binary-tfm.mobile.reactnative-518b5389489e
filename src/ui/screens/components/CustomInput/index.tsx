import React from 'react'
import {TouchableOpacity} from 'react-native'
import {Text, Layout, useStyleSheet, StyleService} from '@ui-kitten/components'
import {CustomInputProps} from 'types'

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  caption = '',
  placeholder = '',
  value,
  accessoryRight,
  onPress,
  style,
}) => {
  const styles = useStyleSheet(themedStyles)
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      style={[{flex: 1}, style]}>
      {label && (
        <Text category="label" style={styles.label}>
          {label}
        </Text>
      )}
      <Layout
        style={[styles.body, caption ? styles.colorDanger : styles.colorGrey]}>
        <Text
          numberOfLines={1}
          style={{flex: 1}}
          appearance={value.length > 0 ? 'default' : 'hint'}>
          {value.length > 0 ? value : placeholder}
        </Text>
        {accessoryRight}
      </Layout>
      {caption.length > 0 && (
        <Text category="c1" style={styles.caption}>
          {caption}
        </Text>
      )}
    </TouchableOpacity>
  )
}

const themedStyles = StyleService.create({
  label: {
    color: 'grey',
    marginBottom: 4,
  },
  caption: {
    color: 'color-danger-500',
    marginTop: 2,
  },
  body: {
    height: 40,
    backgroundColor: 'background-basic-color-3',
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorGrey: {
    borderColor: 'lightgrey',
  },
  colorDanger: {
    borderColor: 'color-danger-500',
  },
})

export {CustomInput}
