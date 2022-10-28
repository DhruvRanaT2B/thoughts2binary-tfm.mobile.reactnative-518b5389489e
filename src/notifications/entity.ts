import {BaseEntity} from '@react-native-granite/core'
import {IsNumber, IsString, IsBoolean} from 'class-validator'
import {Type} from 'class-transformer'
import {DateTime} from '../bookings/entity'

export class NotificationsResponse extends BaseEntity {
  @Type(() => Notification)
  readonly results?: Notification[]
  @IsNumber()
  readonly next_page?: number
}

export class Notification extends BaseEntity {
  @IsString()
  readonly created_at?: DateTime
  @IsNumber()
  readonly event_id?: number
  @IsBoolean()
  readonly is_read?: boolean
  @IsNumber()
  readonly pk?: number
  @IsString()
  readonly verb?: string
}
