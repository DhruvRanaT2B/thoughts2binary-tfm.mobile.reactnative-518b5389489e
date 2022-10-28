import React from 'react'
import {
  SafeAreaView as RawSafeAreaView,
  NativeSafeAreaViewProps,
} from 'react-native-safe-area-context'
import {Layout} from '@ui-kitten/components'

const SafeAreaView: React.FC<NativeSafeAreaViewProps> = props => {
  return (
    <Layout {...props}>
      <RawSafeAreaView {...props}>{props.children}</RawSafeAreaView>
    </Layout>
  )
}

export {SafeAreaView}
