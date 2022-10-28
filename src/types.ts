import {StackNavigationProp} from '@react-navigation/stack'
import {CompositeNavigationProp, RouteProp} from '@react-navigation/native'
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs'
import {MaterialTopTabNavigationProp} from '@react-navigation/material-top-tabs'
import {TextStyle, ViewProps, ViewStyle} from 'react-native'
import React from 'react'
import {entity as BookingsEntity} from '@bookings'
import {entity as AccountsEntity} from '@accounts'
import {entity as IncidentsEntity} from '@incidents'
import {FILTERS} from '@constants'
import {EventEmitter} from '@react-native-granite/core'
import {Booking} from 'bookings/entity'

export type RootStackParamList = {
  SplashScreen: undefined
  Auth: undefined
  App: undefined
}

export type RootScreenProps<T extends keyof RootStackParamList> = {
  route: RouteProp<RootStackParamList, T>
  navigation: StackNavigationProp<RootStackParamList, T>
}

export type AuthStackParamList = {
  Login: undefined
  Signup: undefined
  ForgotPassword: undefined
  SingleSignOn: undefined
}

export type AuthScreenProps<T extends keyof AuthStackParamList> = {
  route: RouteProp<AuthStackParamList, T>
  navigation: CompositeNavigationProp<
    StackNavigationProp<AuthStackParamList, T>,
    StackNavigationProp<RootStackParamList>
  >
}

export type AppStackParamList = {
  Dashboard: undefined
  BookingsStack: undefined
  IncidentStack: undefined
  ProfileStack: undefined
}

export type AppScreenProps<T extends keyof AppStackParamList> = {
  route: RouteProp<AppStackParamList, T>
  navigation: CompositeNavigationProp<
    StackNavigationProp<AppStackParamList, T>,
    StackNavigationProp<RootStackParamList>
  >
}

export type DashboardTabsParamList = {
  Bookings: undefined
  Notifications: undefined
  Incidents: undefined
  MyProfile: undefined
}

export type DashboardTabsProps<T extends keyof DashboardTabsParamList> = {
  route: RouteProp<DashboardTabsParamList, T>
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<DashboardTabsParamList, T>,
    CompositeNavigationProp<
      StackNavigationProp<AppStackParamList, 'Dashboard'>,
      StackNavigationProp<RootStackParamList>
    >
  >
}

export type BookingsListCalendarProps = {
  showWeekly: boolean
}

export type IncidentTabsParamList = {
  Open: undefined
  Historical: undefined
}

export type IncidentTabsProps<T extends keyof IncidentTabsParamList> = {
  route: RouteProp<IncidentTabsParamList, T>
  navigation: CompositeNavigationProp<
    MaterialTopTabNavigationProp<IncidentTabsParamList, T>,
    CompositeNavigationProp<
      BottomTabNavigationProp<DashboardTabsParamList, 'Incidents'>,
      CompositeNavigationProp<
        StackNavigationProp<AppStackParamList, 'Dashboard'>,
        StackNavigationProp<RootStackParamList>
      >
    >
  >
}

export type NotificationsStackParamList = {
  NotificationOverview: undefined
}

export type NotificationsScreenProps<
  T extends keyof NotificationsStackParamList,
> = {
  route: RouteProp<NotificationsStackParamList, T>
  navigation: CompositeNavigationProp<
    StackNavigationProp<NotificationsStackParamList, T>,
    CompositeNavigationProp<
      BottomTabNavigationProp<DashboardTabsParamList, 'Notifications'>,
      CompositeNavigationProp<
        StackNavigationProp<AppStackParamList, 'Dashboard'>,
        StackNavigationProp<RootStackParamList>
      >
    >
  >
}

export type DateTimeProps = {
  date?: Date
  onDateChange: (date: Date) => void
  dateLabel?: string
  timeLabel?: string
  datePattern?: string
  timePattern?: string
  minDate?: Date
  minuteInterval?: 1 | 2 | 3 | 4 | 5 | 6 | 10 | 12 | 15 | 20 | 30
  dateOnly?: boolean
}

export type BookingsStackParamList = {
  AddNewBooking: {booking?: BookingsEntity.Booking}
  SelectVehicle: {
    booking?: BookingsEntity.Booking
    branch: AccountsEntity.Branch
    startDate: Date
    endDate: Date
    endOnDate?: Date
    isRecurring: boolean
    recurringType?: RecurringType
    daysOfWeek?: number[]
    datesOfMonth?: number[]
    driverPK: number
    address?: Address
  }
  SelectBookingPurpose: {
    booking?: BookingsEntity.Booking
    branch: AccountsEntity.Branch
    startDate: Date
    endDate: Date
    endOnDate?: Date
    isRecurring: boolean
    recurringType?: RecurringType
    daysOfWeek?: number[]
    datesOfMonth?: number[]
    vehicle: BookingsEntity.BookingVehicle
    driverPK: number
    address?: Address
  }
  BookingPreview: {
    branch: AccountsEntity.Branch
    startDate: Date
    endDate: Date
    endOnDate?: Date
    isRecurring: boolean
    recurringType?: RecurringType
    daysOfWeek?: number[]
    datesOfMonth?: number[]
    vehicle: BookingsEntity.BookingVehicle
    costCentre?: BookingsEntity.CostCentre
    bookingType?: string
    purpose?: string
    bookingID?: number
    driverPK: number
    bookingTags: BookingsEntity.BookingTag[]
    address?: Address
  }
  BookingDetail: {bookingID: number}
  VehicleFilters: {
    filters: {
      category: FILTERS
      values: string[]
      multiSelect: boolean
    }[]
    selectedFilters: {category: string; selectedValues: string[]}[]
    onApply: (param: {category: string; selectedValues: string[]}[]) => void
  }
  BookingCheckIn: {
    eventEmitter: EventEmitter
    bookingID: number
    incidents: BookingsEntity.Incident[]
    bookingTripID: number
    vehicleID: number
    startOdoReading: number
    customAttributes: BookingsEntity.Tag[]
    checkList?: any
  }
  BookingCheckOut: {
    eventEmitter: EventEmitter
    bookingID: number
    startOdoReading: number
    checkList?: any
  }
  BookingExtend: {
    eventEmitter: EventEmitter
    booking: Booking
  }
}

export type BookingsScreenProps<T extends keyof BookingsStackParamList> = {
  route: RouteProp<BookingsStackParamList, T>
  navigation: CompositeNavigationProp<
    StackNavigationProp<BookingsStackParamList, T>,
    CompositeNavigationProp<
      StackNavigationProp<AppStackParamList, 'BookingsStack'>,
      StackNavigationProp<RootStackParamList>
    >
  >
}

export type IncidentStackParamList = {
  IncidentDetails: {id: number}
}

export type IncidentScreenProps<T extends keyof IncidentStackParamList> = {
  route: RouteProp<IncidentStackParamList, T>
  navigation: CompositeNavigationProp<
    StackNavigationProp<IncidentStackParamList, T>,
    CompositeNavigationProp<
      StackNavigationProp<AppStackParamList, 'IncidentStack'>,
      StackNavigationProp<RootStackParamList>
    >
  >
}

export type ProfileStackParamList = {
  ProfileEdit: {
    userProfile: AccountsEntity.ProfileResponse
  }
  VerificationScreen: {
    email: string
    password: string
  }
}

export type ProfileScreenProps<T extends keyof ProfileStackParamList> = {
  route: RouteProp<ProfileStackParamList, T>
  navigation: CompositeNavigationProp<
    StackNavigationProp<ProfileStackParamList, T>,
    CompositeNavigationProp<
      StackNavigationProp<AppStackParamList, 'ProfileStack'>,
      StackNavigationProp<RootStackParamList>
    >
  >
}

export interface FloatingActionButtonProps extends ViewProps {
  onPress?: () => void
}

export type FilterVehicleProps = {isVisible: boolean; onClose: () => void}

export type VehicleListItemProps = {
  onSelectPress?: () => void
  showHeaderLabel?: Boolean
  data: BookingsEntity.BookingVehicle | BookingsEntity.Vehicle
  driver?: {email: string; name: string}
  headerTitle?: string
  highlight?: boolean
}

export type BookingListItemProps = {
  onCardPress?: () => void
  item: BookingsEntity.Booking
  onEditPress?: () => void
  isEditable?: boolean
  onDeletePress?: () => void
}

export type ImagePickerProps = {
  maxPhotos?: number
  onImageChange: (value: ImageFile[]) => void
  cameraEnabled?: boolean
  imagePickerButton?: (color: string) => React.ReactNode
  cameraButton?: (color: string) => React.ReactNode
  images: ImageFile[]
}

export type IncidentListItemProps = {
  item: IncidentsEntity.Incident
  onCardPress?: () => void
}

export type CollapsibleViewProps = {
  label: string
  expand?: boolean
  body: React.ReactNode
  headerColour?: string
}

export interface TagsProps {
  tagTitles: string[]
  scrollable?: boolean
  editable?: boolean
  onTagPress?: (tagTitle: string) => void
  backgroundColor?: string
  textColor?: string
  containerStyle?: ViewStyle
  tagStyle?: ViewStyle
}

export type CalendarEvent = {
  id: number
  color: string
  start: string
  end: string
  title?: string
  summary: string
}

export type CalendarEventWithDimens = {
  id: number
  color: string
  start: string
  end: string
  title?: string
  summary: string
  top: number
  height: number
  width: number
  left: number
}

export type CalendarEventMonthly = {
  id: number
  color: string
  start: string
  end: string
  title?: string
  summary: string
  multipleDays?: boolean
  startsFrom?: string
  endsOn?: string
}

export type EventCalendarProps = {
  date: Date
  onDateChange: (date: Date) => void
  format24h?: boolean
  scrollToFirst?: boolean
  formatHeader?: string
  onEventPress?: (arg: CalendarEvent) => void
  events: CalendarEvent[] | null
  showWeekly?: boolean
  isLoading: boolean
}

export type DayViewProps = {
  scrollToFirst: boolean
  format24h: boolean
  width: number
  onEventPress: (arg: CalendarEvent) => void
  events: CalendarEventMonthly[]
}

export type MonthViewProps = {
  format24h: boolean
  width: number
  onEventPress: (arg: CalendarEvent) => void
  events: CalendarEventMonthly[]
}

export type CustomInputProps = {
  label?: string
  caption?: string
  placeholder?: string
  value: string
  accessoryRight?: React.ReactNode
  onPress?: () => void
  style?: ViewStyle
}

export type BookingListType = 'Today' | 'Upcoming' | 'Past' | 'In-Progress'

export type PermissionStatus = {
  isGranted: boolean
  inAppRequestable: boolean
  isAvailable: boolean
}

export type RequestPermissionResponse<T extends boolean> = T extends true
  ? PermissionStatus
  : undefined

export type RecurringType = 'Daily' | 'Weekly' | 'Monthly'

export interface ImageFile {
  name: string
  uri: string
  type: string
}

export type OTPInputProps = {
  OTP: string[]
  setOTP: (param: string[]) => void
  autoFocus?: boolean
  error?: string
  errorStyle?: TextStyle
}

export interface CustomAttributesProps {
  attributes: BookingsEntity.Tag[]
  selectedAttributes: BookingsEntity.BookingTag[]
  isEditable?: boolean
  validate?: boolean
  onChange: (selectedValues: BookingsEntity.BookingTag[]) => void
}

export type NotesListItemProps = {
  item: IncidentsEntity.Note
}

export interface Address {
  name?: string
  landmark?: string
  bounds?: {
    east?: number
    north?: number
    south?: number
    west?: number
  }
  coords?: {
    lat?: number
    long?: number
  }
}

export type Place = {
  name: string
  address: string
  coordinate: {latitude: number; longitude: number}
  viewport: {
    northEast: {latitude: number; longitude: number}
    southWest: {latitude: number; longitude: number}
  }
}

export type AutoComplete = {
  show: () => Promise<Place>
}
