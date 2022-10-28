import React from 'react'
import {TouchableOpacity} from 'react-native'
import {Layout, useStyleSheet, StyleService} from '@ui-kitten/components'
import {FloatingActionButtonProps} from 'types'

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  style,
  onPress,
  children,
}) => {
  const styles = useStyleSheet(fabStyles)

  return (
    <Layout style={[styles.container, style]}>
      <TouchableOpacity onPress={onPress}>{children}</TouchableOpacity>
    </Layout>
  )
}

const fabStyles = StyleService.create({
  container: {
    position: 'absolute',
    backgroundColor: 'color-primary-default',
    borderRadius: 12,
    padding: 8,
    bottom: 26,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    zIndex: 2,
    shadowColor: 'color-basic',
    shadowOpacity: 0.5,
    shadowOffset: {height: 5, width: 0},
  },
})

export {FloatingActionButton}
