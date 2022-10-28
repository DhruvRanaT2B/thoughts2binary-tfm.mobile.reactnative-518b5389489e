import React, {useCallback, useEffect, useState, useContext} from 'react'
import {StyleSheet, ScrollView, Alert, Image} from 'react-native'
import {
  Layout,
  Text,
  useTheme,
  Icon,
  TopNavigation,
  Divider,
  Spinner,
  Button,
} from '@ui-kitten/components'
import Swiper from 'react-native-swiper'
import _ from 'lodash'
import moment from 'moment'

import STRINGS from './strings'
import {CollapsibleView, SafeAreaView, Tags} from '@components'
import {DashboardTabsProps} from 'types'
import {GraniteApp, LocalStorage} from '@react-native-granite/core'
import {EventEmitter} from '@react-native-granite/core'
import {AUTH_EVENTS, controller, entity} from '@accounts'
import {AuthContext} from '@contexts'
import {LOCAL_STORAGE} from '@constants'
import CookieManager from '@react-native-cookies/cookies'

// Global Constants
const eventEmitter = new EventEmitter()

const MyProfile: React.FC<DashboardTabsProps<'MyProfile'>> = ({navigation}) => {
  const theme = useTheme()
  const {setProfileImage, setLicenseStatus} = useContext(AuthContext)
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<entity.ProfileResponse>()
  const [retry, setRetry] = useState(false)
  const [pendingApproval, setPendingApproval] = useState(0)
  const [approved, setApproved] = useState(0)
  const [inProgress, setInProgress] = useState(0)
  const [needRefresh, setNeedRefresh] = useState(false)

  const onLogoutPress = useCallback(() => {
    Alert.alert(
      '',
      STRINGS.LOGOUT_PROMPT,
      [
        {text: STRINGS.BUTTON_NO},
        {
          text: STRINGS.BUTTON_YES,
          onPress: async () => {
            await CookieManager.clearAll(true)
              .then(success => {
                console.log('CookieManager.clearAll =>', success)
              })
              .catch(error => {
                console.log('CookieManager.clearAll Failed ->', error)
              })

            let previousState = await controller.getRememberMeState()
            await GraniteApp.logout()
            LocalStorage.set(LOCAL_STORAGE.REMEMBER_ME, String(previousState))
            navigation.replace('SplashScreen')
          },
        },
      ],
      {cancelable: false},
    )
  }, [navigation])

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (needRefresh) {
        setNeedRefresh(false)
        controller.getProfile(eventEmitter)
      }
    })

    return unsubscribe
  }, [needRefresh])

  useEffect(() => {
    const subscription = eventEmitter.getObservable().subscribe(event => {
      switch (event.type) {
        case AUTH_EVENTS.LOAD_PROFILE_START:
          setIsLoading(true)
          setRetry(false)
          break
        case AUTH_EVENTS.LOAD_PROFILE_SUCCESS:
          setProfile(event.data)
          setProfileImage(event.data.user?.profile_image ?? '')
          setLicenseStatus(event.data.employees_extension?.license_status ?? '')
          controller.getReport(eventEmitter)
          break
        case AUTH_EVENTS.LOAD_PROFILE_FAILURE:
          setIsLoading(false)
          setRetry(true)
          break

        case AUTH_EVENTS.LOAD_REPORT_START:
          setIsLoading(true)
          setRetry(false)
          break
        case AUTH_EVENTS.LOAD_REPORT_SUCCESS:
          event.data.forEach((report: entity.Report) => {
            switch (report.status_name) {
              case 'Pending Approval':
                setPendingApproval(report.status_count ?? 0)
                break
              case 'Approved':
                setApproved(report.status_count ?? 0)
                break
              case 'In-Progress':
                setInProgress(report.status_count ?? 0)
                break
            }
          })
          setIsLoading(false)
          break
        case AUTH_EVENTS.LOAD_REPORT_FAILURE:
          setIsLoading(false)
          setRetry(true)
          break
      }
    })

    controller.getProfile(eventEmitter)
    return () => subscription.unsubscribe()
  }, [])

  const onRetry = useCallback(() => {
    controller.getProfile(eventEmitter)
  }, [])

  const badgeData = useCallback(
    () => [
      {title: STRINGS.BADGE_APPROVED, value: approved, color: '#00B900'},
      {title: STRINGS.BADGE_IN_PROGRESS, value: inProgress, color: '#ECD322'},
      {title: STRINGS.BADGE_PENDING, value: pendingApproval, color: '#8F8F8F'},
    ],
    [approved, inProgress, pendingApproval],
  )

  const generalDetailsFooter = useCallback(
    () => (
      <>
        <Divider style={styles.divider} />
        <Layout style={styles.badgeContainer}>
          {badgeData().map(badge => (
            <Layout style={{alignItems: 'center'}} key={badge.title}>
              <Layout style={[styles.badge, {backgroundColor: badge.color}]}>
                <Text numberOfLines={1} style={{color: 'white'}}>
                  {badge.value}
                </Text>
              </Layout>
              <Text style={{fontSize: 10}}>{badge.title}</Text>
            </Layout>
          ))}
        </Layout>
      </>
    ),
    [badgeData],
  )

  const renderDetails = useCallback(
    (array: {title: string; value?: string; tags?: string[]}[]) =>
      array.map(({title, value, tags}) => (
        <Layout style={styles.itemWrapper} key={title}>
          <Layout style={styles.itemLabel}>
            <Text category="s2" style={{flex: 1}}>
              {title}
            </Text>
            <Text category="s2" style={{paddingHorizontal: 12}}>
              :
            </Text>
          </Layout>
          {!_.isEmpty(value) && (
            <Layout style={[styles.itemLabel, {justifyContent: 'flex-start'}]}>
              <Text category="p2">{value}</Text>
            </Layout>
          )}
          {tags && (
            <Layout style={{flex: 1}}>
              <Tags
                tagTitles={tags}
                backgroundColor="#EEEEEE"
                textColor="#505050"
                scrollable={false}
              />
            </Layout>
          )}
        </Layout>
      )),
    [],
  )

  const generalDetails = useCallback(() => {
    const array: {title: string; value?: string; tags?: string[]}[] = [
      {
        title: STRINGS.EMPLOYEE_NUMBER,
        value: profile?.employee_id ? profile?.employee_id : 'NA',
      },
      {
        title: STRINGS.CONTACT_NUMBER,
        value: profile?.user?.phone ? profile?.user?.phone : 'NA',
      },
      {
        title: STRINGS.EMAIL_ID,
        value: profile?.user?.email ? profile?.user?.email : 'NA',
      },
      {
        title: STRINGS.BRANCH,
        value: profile?.employees_extension?.branch?.name
          ? profile?.employees_extension?.branch?.name
          : 'NA',
      },
      {
        title: STRINGS.DEPARTMENT,
        value: _.isEmpty(profile?.employees_extension?.departments)
          ? 'NA'
          : profile?.employees_extension?.departments
              ?.map(item => item.name)
              .join(', '),
      },
      {
        title: STRINGS.DEFAULT_COST_CENTRE,
        value: profile?.employees_extension?.cost_centre?.name
          ? profile?.employees_extension?.cost_centre?.name
          : 'NA',
      },
    ]

    if (
      profile?.employees_extension?.associated_tags &&
      profile?.employees_extension?.associated_tags.length > 0
    )
      array.push({
        title: STRINGS.ASSOCIATED_TAGS,
        tags: profile?.employees_extension?.associated_tags,
      })

    return (
      <>
        {renderDetails(array)}
        {generalDetailsFooter()}
      </>
    )
  }, [profile, renderDetails, generalDetailsFooter])

  const customAttributes = useCallback(() => {
    const array: {title: string; value: string}[] = []
    profile?.employees_extension?.user_tags?.forEach(tag => {
      array.push({title: tag.tag_group_name!!, value: tag.tags?.join(', ')!!})
    })

    return renderDetails(array)
  }, [profile, renderDetails])

  const licenseDetails = useCallback(() => {
    const array = [
      {
        title: STRINGS.LICENSE_NUMBER,
        value: profile?.employees_extension?.license_number
          ? profile?.employees_extension?.license_number
          : 'NA',
      },
      {
        title: STRINGS.LICENSE_EXPIRY_DATE,
        value: profile?.employees_extension?.license_valid_upto?.original
          ? moment(
              profile?.employees_extension?.license_valid_upto.original,
            ).format('DD/MM/YYYY')
          : 'NA',
      },
      {
        title: STRINGS.LICENSE_CLASS,
        value: profile?.employees_extension?.license_class?.join(', ')
          ? profile?.employees_extension?.license_class?.join(', ')
          : 'NA',
      },
      {
        title: STRINGS.COUNTRY_OF_ISSUE,
        value: profile?.employees_extension?.license_country_of_issue
          ? profile?.employees_extension?.license_country_of_issue
          : 'NA',
      },
      {
        title: STRINGS.DAYS_BEFORE_EXPIRY,
        value:
          profile?.employees_extension?.lic_exp_remind_before_days?.toString()
            ? profile?.employees_extension?.lic_exp_remind_before_days?.toString()
            : 'NA',
      },
      {
        title: STRINGS.REMINDER_RECIPIENTS,
        value: _.isEmpty(
          profile?.employees_extension?.lic_exp_reminder_recipients,
        )
          ? 'NA'
          : profile?.employees_extension?.lic_exp_reminder_recipients
              ?.map(item => item.name)
              .join(', '),
      },
      {
        title: STRINGS.LICENSE_STATUS,
        value: profile?.employees_extension?.license_status
          ? profile?.employees_extension?.license_status
          : 'NA',
      },
    ]

    return (
      <>
        {!_.isEmpty(profile?.employees_extension?.license_front_image) && (
          <Swiper
            style={styles.swiperHeight}
            horizontal
            activeDotColor={theme['color-primary-default']}>
            <Image
              source={{
                uri: profile?.employees_extension?.license_front_image,
              }}
              resizeMode="contain"
              style={styles.swiperHeight}
            />
            {!_.isEmpty(profile?.employees_extension?.license_back_image) && (
              <Image
                source={{uri: profile?.employees_extension?.license_back_image}}
                style={styles.swiperHeight}
                resizeMode="contain"
              />
            )}
          </Swiper>
        )}
        {renderDetails(array)}
      </>
    )
  }, [profile, renderDetails])

  const onEditPress = useCallback(() => {
    setNeedRefresh(true)
    // @ts-ignore
    navigation.navigate('ProfileStack', {
      screen: 'ProfileEdit',
      params: {
        userProfile: profile,
      },
    })
  }, [navigation, profile])

  return (
    <SafeAreaView
      style={[
        styles.container,
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
            {STRINGS.LABEL_PROFILE}
          </Text>
        )}
        accessoryRight={() => (
          <Layout style={styles.headerIconWrapper}>
            {isLoading || retry ? null : (
              <Icon
                name="edit"
                style={styles.headerIcon}
                fill="white"
                onPress={onEditPress}
              />
            )}
            <Icon
              name="log-out"
              style={styles.headerIcon}
              fill="white"
              onPress={onLogoutPress}
            />
          </Layout>
        )}
        style={{backgroundColor: theme['color-primary-default']}}
      />
      {isLoading || retry ? (
        <SafeAreaView style={styles.loaderWrapper} edges={['left', 'right']}>
          {isLoading ? (
            <Spinner />
          ) : (
            <>
              <Text status="primary" category="s1">
                {STRINGS.UNABLE_TO_LOAD_PROFILE}
              </Text>
              <Button style={styles.retryButton} onPress={onRetry}>
                {STRINGS.BUTTON_RETRY}
              </Button>
            </>
          )}
        </SafeAreaView>
      ) : (
        <Layout style={{flex: 1}}>
          <ScrollView style={styles.scrollView}>
            <Layout style={styles.profileHeader}>
              {profile?.user?.profile_image ? (
                <Image
                  source={{uri: profile?.user?.profile_image}}
                  style={[
                    styles.profileImage,
                    {borderColor: theme['color-primary-default']},
                  ]}
                />
              ) : (
                <Layout
                  style={[
                    styles.profileImagePlaceholder,
                    {borderColor: theme['color-primary-default']},
                  ]}>
                  <Image
                    source={require('@images/user_icon.png')}
                    resizeMode="contain"
                    style={styles.avatar}
                  />
                </Layout>
              )}
              <Text style={[styles.profileText, {fontSize: 22}]} category="s1">
                {profile?.name}
              </Text>
              <Text style={styles.profileText} appearance="hint">
                {profile?.role?.name}
              </Text>
            </Layout>
            <CollapsibleView
              label={STRINGS.TITLE_GENERAL}
              body={generalDetails()}
              expand={true}
            />
            <CollapsibleView
              label={STRINGS.TITLE_LICENSE_DETAIL}
              body={licenseDetails()}
            />
            {!_.isEmpty(profile?.employees_extension?.user_tags) && (
              <CollapsibleView
                label={STRINGS.LABEL_CUSTOM_ATTRIBUTES}
                body={customAttributes()}
              />
            )}
          </ScrollView>
        </Layout>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    marginTop: 30,
    marginBottom: 18,
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 100,
    backgroundColor: 'lightgrey',
    borderWidth: 2,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 100,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    marginTop: 4,
    textAlign: 'center',
  },
  scrollView: {
    paddingHorizontal: 10,
  },
  headerIcon: {
    height: 24,
    width: 24,
    marginEnd: 12,
  },
  divider: {
    marginBottom: 18,
  },
  badgeContainer: {
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 40,
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemWrapper: {
    flex: 1,
    flexDirection: 'row',
    marginVertical: 6,
  },
  itemLabel: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerIconWrapper: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  loaderWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButton: {
    marginVertical: 12,
  },
  avatar: {
    width: 32,
    height: 32,
  },
  swiperHeight: {
    height: 150,
  },
})

export default MyProfile
