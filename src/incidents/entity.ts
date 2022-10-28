import {BaseEntity} from '@react-native-granite/core'
import {IsNumber, IsString, IsBoolean, IsArray} from 'class-validator'
import {Type} from 'class-transformer'
import {AddressFeatures, DateTime} from '../bookings/entity'

export class IncidentResponse extends BaseEntity {
  @Type(() => Incident)
  readonly results?: Incident[]
  @IsNumber()
  readonly next_page?: number
  @IsNumber()
  readonly count?: number
}

export class Incident extends BaseEntity {
  @IsNumber()
  readonly pk?: number
  @IsString()
  readonly address?: string
  @Type(() => AddressFeatures)
  readonly address_features?: AddressFeatures
  @Type(() => DateTime)
  readonly created_at?: DateTime
  @IsString()
  readonly incident_sub_type?: string
  @Type(() => IncidentTag)
  readonly incident_tags?: IncidentTag[]
  @Type(() => IncidentType)
  readonly incident_type?: IncidentType
  @IsBoolean()
  readonly is_critical?: boolean
  @IsBoolean()
  readonly is_verified?: boolean
  @Type(() => ReportedBy)
  readonly reported_by?: ReportedBy
  @Type(() => DateTime)
  readonly reported_on?: DateTime
  @Type(() => Status)
  readonly status?: Status
  @Type(() => Vehicle)
  readonly vehicle?: Vehicle
  @Type(() => DateTime)
  readonly modified_at?: DateTime
  @Type(() => Booking)
  readonly booking?: Booking
}

export class Booking extends BaseEntity {
  @IsNumber()
  readonly pk?: number
}

export class IncidentTag extends BaseEntity {
  @IsString()
  readonly tag_data_type?: string
  @IsString()
  readonly tag_group_name?: string
  @IsArray()
  readonly tags?: string[]
}

export class IncidentType extends BaseEntity {
  @IsString()
  readonly name?: string
  @IsNumber()
  readonly pk?: number
  @IsString()
  readonly recipients?: string
}

export class ReportedBy extends BaseEntity {
  @IsString()
  readonly email?: string
  @IsString()
  readonly name?: string
  @IsString()
  readonly phone?: string
  @IsNumber()
  readonly pk?: number
}

export class Status extends BaseEntity {
  @IsNumber()
  readonly pk?: number
  @IsString()
  readonly status_name?: string
}

export class Vehicle extends BaseEntity {
  @IsString()
  readonly name?: string
  @IsString()
  readonly registrations_num?: string
  @IsNumber()
  readonly pk?: number
}

export class VehicleListResponse extends BaseEntity {
  @Type(() => Vehicle)
  readonly results?: Vehicle[]
}

export class IncidentTypeResponse extends BaseEntity {
  @Type(() => IncidentList)
  readonly results?: IncidentList[]
}

export class IncidentList extends BaseEntity {
  @IsNumber()
  readonly pk?: number
  @IsString()
  readonly name?: string
  @IsArray()
  readonly incident_sub_type?: string[]
}

export class DocumentResponse extends BaseEntity {
  @IsNumber()
  readonly next_page?: number
  @Type(() => GraniteDocument)
  readonly results?: GraniteDocument[]
}

export class GraniteDocument extends BaseEntity {
  @IsString()
  readonly document?: string
  @IsNumber()
  readonly pk?: number
}

export class NotesResponse extends BaseEntity {
  @IsNumber()
  readonly next_page?: number
  @Type(() => Note)
  readonly results?: Note[]
}

export class Note extends BaseEntity {
  @IsNumber()
  readonly pk?: number
  @IsString()
  readonly note?: string
  @IsString()
  readonly note_type?: string
  @Type(() => AddedBy)
  readonly added_by?: AddedBy
  @Type(() => DateTime)
  readonly created_at?: DateTime
}

export class AddedBy extends BaseEntity {
  @IsString()
  readonly first_name?: string
  @IsString()
  readonly last_name?: string
  @IsNumber()
  readonly pk?: number
}
