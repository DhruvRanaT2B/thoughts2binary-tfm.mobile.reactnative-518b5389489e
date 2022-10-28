import React from 'react'
import {StyleSheet, ScrollView} from 'react-native'
import {Layout, Text, useTheme, Icon} from '@ui-kitten/components'
import {TagsProps} from 'types'

const Tags: React.FC<TagsProps> = ({
  tagTitles,
  containerStyle,
  scrollable = true,
  editable = false,
  onTagPress = () => {},
  backgroundColor,
  textColor,
  tagStyle,
}) => {
  const theme = useTheme()

  const tagsHolder = () => (
    <Layout
      style={{flexWrap: scrollable ? undefined : 'wrap', flexDirection: 'row'}}>
      {tagTitles.map(title => (
        <Layout
          style={[
            styles.tag,
            {
              backgroundColor:
                backgroundColor ?? theme['color-primary-default'],
            },
            tagStyle,
          ]}>
          <Text style={{color: textColor ?? 'white'}} category="c1">
            {title}
          </Text>
          {editable && (
            <Icon
              name="close-outline"
              style={styles.icon}
              fill="white"
              onPress={() => onTagPress(title)}
            />
          )}
        </Layout>
      ))}
    </Layout>
  )
  return scrollable ? (
    <ScrollView
      horizontal={true}
      style={[styles.scrollview, containerStyle]}
      showsHorizontalScrollIndicator={false}>
      {tagsHolder()}
    </ScrollView>
  ) : (
    tagsHolder()
  )
}

const styles = StyleSheet.create({
  scrollview: {
    marginVertical: 12,
  },
  tag: {
    flexDirection: 'row',
    padding: 6,
    borderRadius: 8,
    marginEnd: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  icon: {
    width: 18,
    height: 18,
    marginStart: 6,
  },
})

export {Tags}
