import React from 'react'
import {StyleSheet} from 'react-native'
import {Layout, Card, Text} from '@ui-kitten/components'
import moment from 'moment'

const ListItem = ({title, date}: {title: string; date: string}) => {
  return (
    <Card style={styles.card}>
      <Text>{title}</Text>
      <Layout style={styles.footerWrapper}>
        <Text style={styles.footerText} category="c1" appearance="hint">
          {moment(date).format('DD/MM/YYYY, hh:mm A')}
        </Text>
      </Layout>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 4,
  },
  footerWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  footerText: {
    marginStart: 6,
    fontStyle: 'italic',
  },
})

export default ListItem
