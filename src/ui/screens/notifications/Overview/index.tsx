import React, {useState, useEffect, useCallback} from 'react'
import {StyleSheet, TouchableOpacity} from 'react-native'
import {
  Layout,
  List,
  Spinner,
  Text,
  TopNavigation,
  useTheme,
  Icon,
} from '@ui-kitten/components'

import {NotificationsScreenProps} from 'types'
import ListItem from './components/ListItem'
import {controller, NOTIFICATION_EVENTS, entity} from '@notifications'
import {EventEmitter} from '@react-native-granite/core'
import {SafeAreaView} from '@components'
import STRINGS from '../strings'

// Global constants
const eventEmitter = new EventEmitter()

const NotificationsOverview: React.FC<
  NotificationsScreenProps<'NotificationOverview'>
> = () => {
  const theme = useTheme()
  const [notifications, setNotifications] = useState<entity.Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isPaging, setIsPaging] = useState(false)
  const [nextPage, setNextPage] = useState<null | number>(null)

  useEffect(() => {
    const subscription = eventEmitter.getObservable().subscribe(event => {
      switch (event.type) {
        case NOTIFICATION_EVENTS.LOAD_NOTIFICATION_LIST_START:
          setIsLoading(true)
          break
        case NOTIFICATION_EVENTS.LOAD_NOTIFICATION_LIST_SUCCESS:
          setIsLoading(false)
          setIsRefreshing(false)
          setIsPaging(false)
          setNextPage(event.data.nextPage)
          setNotifications(event.data.list)
          break
        case NOTIFICATION_EVENTS.LOAD_NOTIFICATION_LIST_FAILURE:
          setIsLoading(false)
          setIsRefreshing(false)
          setIsPaging(false)
          setNextPage(null)
          setNotifications([])
          break
      }
    })
    controller.getNotifications(eventEmitter, {
      pageNumber: 1,
      currentList: notifications,
    })

    return () => subscription.unsubscribe()
  }, [])

  const ItemSeparator = useCallback(
    () => <Layout style={styles.separator} />,
    [],
  )

  const ListFooter = useCallback(
    () =>
      isPaging ? (
        <Layout style={styles.footerLoaderContainer}>
          <Spinner />
        </Layout>
      ) : null,
    [isPaging],
  )

  const onEndReached = useCallback(() => {
    if (nextPage) {
      setIsPaging(true)
      controller.getNotifications(eventEmitter, {
        pageNumber: nextPage,
        currentList: notifications,
      })
    }
  }, [nextPage, notifications])

  const onRefresh = useCallback(() => {
    setIsRefreshing(true)
    controller.getNotifications(eventEmitter, {
      pageNumber: 1,
      currentList: notifications,
    })
  }, [notifications])

  const ListEmptyComponent = useCallback(() => {
    return (
      <Text status="primary" style={{textAlign: 'center'}} category="s1">
        {' '}
        {STRINGS.NO_NOTIFICATIONS}
      </Text>
    )
  }, [])

  return (
    <SafeAreaView
      style={[
        styles.safeAreaView,
        {backgroundColor: theme['color-primary-default']},
      ]}
      edges={['top', 'left', 'right']}>
      <TopNavigation
        alignment="center"
        title={evaProps => (
          <Text
            {...evaProps}
            style={{color: 'white', fontSize: 18}}
            category="s1">
            {STRINGS.LABEL_NOTIFICATIONS}
          </Text>
        )}
        accessoryRight={() => (
          <TouchableOpacity activeOpacity={0.7} onPress={onRefresh}>
            <Icon
              style={styles.refreshIcon}
              fill="white"
              name="refresh-outline"
            />
          </TouchableOpacity>
        )}
        style={{backgroundColor: theme['color-primary-default']}}
      />
      {isLoading && !isPaging && !isRefreshing ? (
        <Layout style={styles.loaderWrapper}>
          <Spinner />
        </Layout>
      ) : (
        <Layout style={styles.listContainer}>
          <List
            data={notifications}
            style={styles.list}
            keyExtractor={(item: entity.Notification) => String(item.pk)}
            renderItem={({item}: {item: entity.Notification}) => (
              <ListItem
                title={String(item.verb)}
                date={String(item.created_at?.original)}
              />
            )}
            ItemSeparatorComponent={ItemSeparator}
            ListFooterComponent={ListFooter}
            onEndReachedThreshold={0.5}
            onEndReached={onEndReached}
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            ListEmptyComponent={ListEmptyComponent}
            contentContainerStyle={
              notifications.length < 1 && styles.emptyComponentContainer
            }
          />
        </Layout>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
  loaderWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flex: 1,
    paddingTop: 12,
  },
  list: {
    paddingHorizontal: 10,
    backgroundColor: 'transparent',
  },
  separator: {
    height: 10,
  },
  footerLoaderContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  emptyComponentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshIcon: {
    height: 24,
    width: 24,
  },
})

export default NotificationsOverview
