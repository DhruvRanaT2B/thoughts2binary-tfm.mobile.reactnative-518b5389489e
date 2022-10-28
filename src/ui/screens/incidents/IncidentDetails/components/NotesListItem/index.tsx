import React from 'react'
import {StyleSheet} from 'react-native'
import {Layout, Text} from '@ui-kitten/components'
import {NotesListItemProps} from 'types'
import moment from 'moment'

import {getNoteStatusColor} from '@utility'

const NotesListItem: React.FC<NotesListItemProps> = ({item}) => {
  return (
    <Layout
      style={[
        {
          backgroundColor: getNoteStatusColor(item.note_type!!),
        },
        styles.container,
      ]}>
      <Text>{item.note}</Text>
      <Layout style={styles.footerContainer}>
        <Text
          category="c1"
          style={{
            marginEnd: 8,
          }}>
          {`${item.added_by?.first_name} ${item.added_by?.last_name}`}
        </Text>
        <Text category="c1">
          {moment(item.created_at?.original).format('DD/MM/YYYY, hh:mm A')}
        </Text>
      </Layout>
    </Layout>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 4,
  },
  footerContainer: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
    marginTop: 6,
  },
})

export {NotesListItem}
