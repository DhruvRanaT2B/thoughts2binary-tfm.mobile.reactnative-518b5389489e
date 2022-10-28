import {BaseEntity} from '@react-native-granite/core'
import {IsString, IsNumber, IsArray, IsBoolean} from 'class-validator'
import {Type} from 'class-transformer'
import {
  BookingTag,
  CostCentre,
  DateTime,
  ImagePathResponse,
  Location,
} from '../bookings/entity'

export class User extends BaseEntity {
  @IsNumber()
  readonly pk?: number
  @IsString()
  readonly first_name?: string
  @IsString()
  readonly last_name?: string
  @IsString()
  readonly email?: string
  @IsString()
  readonly phone?: string
  @IsString()
  readonly country_code?: string
  @IsString()
  readonly profile_image?: string
}

export class SSOResponse extends BaseEntity {
  @IsString()
  readonly url?: string
  @IsString()
  readonly message?: string
}

export class LoginResponse extends BaseEntity {
  @IsString()
  readonly access_token?: string

  @IsNumber()
  readonly expires_in?: number

  @IsString()
  readonly token_type?: string

  @IsNumber()
  readonly user_id?: number
}

export class ProfileResponse extends BaseEntity {
  @IsNumber()
  readonly pk?: number

  @IsString()
  readonly name?: string

  @IsString()
  readonly employee_id?: string

  @IsNumber()
  readonly organisation?: number

  @Type(() => Status)
  readonly status?: Status

  @Type(() => Role)
  readonly role?: Role

  @Type(() => EmployeeExtension)
  readonly employees_extension?: EmployeeExtension

  @Type(() => User)
  readonly user?: User

  @IsBoolean()
  readonly is_active?: boolean
}

class Status extends BaseEntity {
  @IsNumber()
  readonly pk?: number
  @IsString()
  readonly name?: string
}

class Role extends BaseEntity {
  @IsNumber()
  readonly pk?: number
  @IsString()
  readonly name?: string
}

class EmployeeExtension extends BaseEntity {
  @IsNumber()
  readonly pk?: number
  @Type(() => Branch)
  readonly branch?: Branch
  @IsArray()
  readonly departments?: Department[]
  @Type(() => CostCentre)
  readonly cost_centre?: CostCentre
  @IsString()
  readonly license_number?: string
  @IsArray()
  readonly license_class?: string[]
  @IsString()
  readonly license_country_of_issue?: string
  @IsString()
  readonly license_valid_upto?: DateTime
  @IsString()
  readonly license_front_image?: string
  @IsString()
  readonly license_back_image?: string
  @IsBoolean()
  readonly license_exp_reminder?: boolean
  @IsNumber()
  readonly lic_exp_remind_before_days?: number
  @Type(() => LicenseExpiryReminderRecipients)
  readonly lic_exp_reminder_recipients?: LicenseExpiryReminderRecipients[]
  @IsString()
  readonly license_status?: string
  @IsString()
  readonly date_of_birth?: DateTime
  @IsArray()
  readonly associated_tags?: string[]
  @Type(() => BookingTag)
  readonly user_tags?: BookingTag[]
}

export class Department extends BaseEntity {
  @IsNumber()
  readonly pk?: number
  @IsString()
  readonly name?: string
}

export class LicenseExpiryReminderRecipients extends BaseEntity {
  @IsString()
  readonly email?: string
  @IsNumber()
  readonly pk?: number
  @IsString()
  readonly name?: string
}

export class BranchResponse extends BaseEntity {
  @Type(() => Branch)
  readonly results?: Branch[]

  @IsNumber()
  readonly count?: number
}

export class Holiday extends BaseEntity {
  @IsString()
  readonly name?: string
  @Type(() => DateTime)
  readonly date?: DateTime
  @Type(() => Timings)
  readonly opening_hours?: Timings
}

export class HolidayList extends BaseEntity {
  @IsNumber()
  readonly count?: number
  @Type(() => Holiday)
  readonly results?: Holiday[]
}

export class Setting extends BaseEntity {
  @IsNumber()
  readonly pk?: number
  @IsString()
  readonly setting_key?: string
  @IsString()
  readonly value?: string
}

export class SettingsResponse extends BaseEntity {
  @Type(() => Setting)
  readonly results?: Setting[]
}

export class Timings extends BaseEntity {
  @IsString()
  readonly from_time?: String

  @IsString()
  readonly to_time?: String
}

export class BusinessDays extends BaseEntity {
  @Type(() => Timings)
  readonly Monday?: Timings

  @Type(() => Timings)
  readonly Tuesday?: Timings

  @Type(() => Timings)
  readonly Wednesday?: Timings

  @Type(() => Timings)
  readonly Thursday?: Timings

  @Type(() => Timings)
  readonly Friday?: Timings

  @Type(() => Timings)
  readonly Saturday?: Timings

  @Type(() => Timings)
  readonly Sunday?: Timings
}

export class BusinessHours extends BaseEntity {
  @Type(() => BusinessDays)
  readonly days?: BusinessDays

  @IsString()
  readonly type?: String
}

export class Branch extends BaseEntity {
  @IsNumber()
  readonly pk?: number

  @IsString()
  readonly name?: string

  @IsString()
  readonly address?: string

  @Type(() => Location)
  readonly location?: Location

  @Type(() => BusinessHours)
  readonly business_hours?: BusinessHours
}

export class ReportResponse extends BaseEntity {
  @Type(() => Report)
  readonly results?: Report[]
}

export class Report extends BaseEntity {
  @IsString()
  readonly status_name?: string
  @IsNumber()
  readonly status_count?: number
}

export class UploadProfileImageResponse extends BaseEntity {
  readonly result?: ImagePathResponse
}

export class DisplayPriorityResponse extends BaseEntity {
  @Type(() => DisplayPriority)
  readonly results?: DisplayPriority[]
}

export class DisplayPriority extends BaseEntity {
  @IsNumber()
  readonly pk?: number
  @IsString()
  readonly value?: string
}

export class PermissionResponse extends BaseEntity {
  @Type(() => Permission)
  readonly results?: Permission[]
}

export class Permission extends BaseEntity {
  @IsNumber()
  readonly pk?: number
  @IsString()
  readonly name?: string
}

export class EmployeeSearchResponse extends BaseEntity {
  @IsNumber()
  readonly next_page?: number
  @Type(() => Employee)
  readonly results?: Employee[]
}

export class Employee extends BaseEntity {
  @IsString()
  readonly email?: string
  @IsNumber()
  readonly pk?: number
  @IsString()
  readonly name?: string
  @Type(() => Role)
  readonly role?: Role
}
