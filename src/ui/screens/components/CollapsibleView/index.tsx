import React, {useState} from 'react'
import {TouchableOpacity, StyleSheet} from 'react-native'
import {Layout, Text, Icon, useTheme} from '@ui-kitten/components'
import {CollapsibleViewProps} from 'types'

const CollapsibleView: React.FC<CollapsibleViewProps> = ({
  label,
  expand = false,
  body,
  headerColour,
}) => {
  const theme = useTheme()
  const [isExpanded, setIsExpanded] = useState(expand)

  return (
    <Layout style={styles.container}>
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}>
        <Layout
          style={[
            styles.header,
            {
              borderBottomStartRadius: isExpanded ? 0 : 4,
              borderBottomEndRadius: isExpanded ? 0 : 4,
              backgroundColor: headerColour ?? theme['color-primary-default'],
            },
          ]}>
          <Text appearance="alternative" category="p1">
            {label}
          </Text>
          <Icon
            name={isExpanded ? 'arrow-up' : 'arrow-down'}
            style={styles.icon}
            fill="white"
          />
        </Layout>
      </TouchableOpacity>
      {isExpanded && <Layout style={styles.body}>{body}</Layout>}
    </Layout>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderTopStartRadius: 4,
    borderTopEndRadius: 4,
  },
  icon: {
    height: 16,
    width: 16,
  },
  body: {
    padding: 12,
    borderColor: 'grey',
    borderStartWidth: 1,
    borderEndWidth: 1,
    borderBottomWidth: 1,
    borderBottomStartRadius: 4,
    borderBottomEndRadius: 4,
  },
})

export {CollapsibleView}
