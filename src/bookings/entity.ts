import {BaseEntity} from '@react-native-granite/core'
import {IsNumber, IsString, IsBoolean, IsArray} from 'class-validator'
import {Type} from 'class-transformer'

export class BookingsResponse extends BaseEntity {
  @Type(() => Booking)
  readonly results?: Booking[]
  @IsNumber()
  readonly next_page?: number
  @IsNumber()
  readonly count?: number
}

export class Cost extends BaseEntity {
  @IsString()
  readonly estimated_cost?: string
  @IsString()
  readonly actual_cost?: string
}

export class Booking extends BaseEntity {
  @IsNumber()
  readonly pk?: number
  @Type(() => Vehicle)
  readonly vehicle?: Vehicle
  @Type(() => Driver)
  readonly driver?: Driver
  @Type(() => Cost)
  readonly extra_data?: Cost
  @Type(() => Status)
  readonly status?: Status
  @IsString()
  readonly purpose_of_trip?: string
  @IsString()
  readonly booking_type?: string
  @Type(() => CostCentre)
  readonly cost_centre?: CostCentre
  @IsString()
  readonly recurring_pattern?: string
  @IsString()
  readonly multi_booking_id?: string
  @IsBoolean()
  readonly is_recurring?: boolean
  @IsString()
  readonly start_datetime?: DateTime
  @IsString()
  readonly end_datetime?: DateTime
  @IsString()
  readonly ends_on?: DateTime
  @IsString()
  readonly address?: string
  @Type(() => Location)
  readonly location?: Location
  @IsBoolean()
  readonly is_overnight?: boolean
  @IsBoolean()
  readonly is_active?: boolean
  @Type(() => CreatedBy)
  readonly created_by?: CreatedBy
  @IsArray()
  readonly days_of_week?: number[]
  @IsArray()
  readonly dates_of_month?: number[]
  @Type(() => Branch)
  readonly branch?: Branch
  @Type(() => BookingTag)
  readonly booking_tags?: BookingTag[]
  @Type(() => AddressFeatures)
  readonly address_features?: AddressFeatures
  @Type(() => Destination)
  readonly destination?: Destination
}

export class Destination extends BaseEntity {
  @IsString()
  readonly name?: String
}

export class AddressFeatures extends BaseEntity {
  @Type(() => AddressBounds)
  readonly bounds?: AddressBounds
  @IsString()
  readonly landmark?: string
}

export class AddressBounds extends BaseEntity {
  @IsNumber()
  readonly east?: number
  @IsNumber()
  readonly north?: number
  @IsNumber()
  readonly south?: number
  @IsNumber()
  readonly west?: number
}

export class BookingTag extends BaseEntity {
  @IsString()
  readonly tag_data_type?: string
  @IsString()
  readonly tag_group_name?: string
  @IsArray()
  readonly tags?: string[]
}

export class DateTime extends BaseEntity {
  @IsString()
  readonly formated?: string
  @IsString()
  readonly original?: string
}

export class CostModel extends BaseEntity {
  @IsString()
  readonly name?: string
  @IsNumber()
  readonly pk?: number
}

export class BookingCost extends BaseEntity {
  @IsString()
  readonly estimated_cost?: string
  @IsString()
  readonly fee_per_km?: string
}

export class Vehicle extends BaseEntity {
  @IsNumber()
  readonly pk?: number
  @IsString()
  readonly name?: string
  @IsString()
  readonly odometer?: string
  @IsString()
  readonly registrations_num?: string
  @IsString()
  readonly vehicle_class?: string
  @Type(() => Branch)
  readonly branch?: Branch
  @IsString()
  readonly vin?: string
  @IsNumber()
  readonly doors?: number
  @IsNumber()
  readonly seats?: number
  @IsNumber()
  readonly year?: number
  @IsString()
  readonly body_type?: string
  @IsString()
  readonly fuel_type?: string
  @IsString()
  readonly license_type?: string
  @IsArray()
  readonly images?: string[]
  @IsString()
  readonly make?: string
  @IsString()
  readonly model?: string
  @IsString()
  readonly cost_model?: string
}

class Branch extends BaseEntity {
  @IsString()
  readonly name?: string
  @IsNumber()
  readonly pk?: number
  @Type(() => Location)
  readonly location?: Location
}

export class Location extends BaseEntity {
  @IsString()
  readonly type?: string
  @IsArray()
  readonly coordinates?: [number, number]
}

class Driver extends BaseEntity {
  @IsNumber()
  readonly pk?: number
  @Type(() => CostCentre)
  readonly cost_centre?: CostCentre
  @IsString()
  readonly phone?: string
  @IsString()
  readonly email?: string
  @IsString()
  readonly name?: string
}

export class CostCentre extends BaseEntity {
  @IsString()
  readonly name?: string
  @IsNumber()
  readonly pk?: number
}

export class PurposeOfTrip extends BaseEntity {
  @IsString()
  readonly name?: string
  @IsNumber()
  readonly pk?: number
}

class Status extends BaseEntity {
  @IsString()
  readonly status_name?: string
  @IsNumber()
  readonly pk?: number
}

class CreatedBy extends BaseEntity {
  @IsString()
  readonly name?: string
  @IsString()
  readonly email?: string
  @IsString()
  readonly phone?: string
  @IsString()
  readonly cost_centre?: string
  @IsNumber()
  readonly pk?: number
}

export class VehicleResponse extends BaseEntity {
  @Type(() => BookingVehicle)
  readonly results?: BookingVehicle[]
  @IsNumber()
  readonly next_page?: number
}

export class BookingVehicle extends BaseEntity {
  @IsNumber()
  readonly pk?: number
  @IsString()
  readonly name?: string
  @IsNumber()
  readonly odometer_reading?: number
  @IsString()
  readonly registrations_num?: string
  @IsString()
  readonly vehicle_class?: string
  @Type(() => Branch)
  readonly branch?: Branch
  @IsString()
  readonly vin?: string
  @IsNumber()
  readonly doors?: number
  @IsNumber()
  readonly seats?: number
  @IsNumber()
  readonly year?: number
  @IsString()
  readonly body_type?: string
  @IsString()
  readonly fuel_type?: string
  @IsString()
  readonly license_type?: string
  @Type(() => CostCentre)
  readonly cost_centre?: CostCentre
  @IsString()
  readonly color?: string
  @IsArray()
  readonly images?: string[]
  @IsString()
  readonly make?: string
  @IsString()
  readonly model?: string
  @Type(() => CostModel)
  readonly cost_model?: CostModel
}

export class CostCentreResponse extends BaseEntity {
  @Type(() => CostCentre)
  readonly results?: CostCentre[]
}

export class PurposeOfTripResponse extends BaseEntity {
  @Type(() => PurposeOfTrip)
  readonly results?: PurposeOfTrip[]
}

export class ConfigMasterResponse extends BaseEntity {
  @Type(() => ConfigMaster)
  readonly results?: ConfigMaster[]
}

export class ConfigMaster extends BaseEntity {
  @IsArray()
  readonly possible_values?: string[]
}

export class TermsAndConditions extends BaseEntity {
  @IsString()
  readonly content?: string
  @IsString()
  readonly preferredType?: string
  @IsString()
  readonly link?: string
}

export class SettingsResponse extends BaseEntity {
  @Type(() => Setting)
  readonly results?: Setting[]
}

export class Setting extends BaseEntity {
  @IsNumber()
  readonly pk?: number
  @IsString()
  readonly value?: string
  @IsString()
  readonly entity_name?: string
  @IsString()
  readonly document?: string
}

export class ImagePathResponse extends BaseEntity {
  @Type(() => ImagePathFields)
  readonly fields?: ImagePathFields
  @IsString()
  readonly url?: string
}

export class ImagePathFields extends BaseEntity {
  @IsString()
  readonly AWSAccessKeyId?: string
  @IsString()
  readonly acl?: string
  @IsString()
  readonly key?: string
  @IsString()
  readonly policy?: string
  @IsString()
  readonly signature?: string
}

export class IncidentsResponse extends BaseEntity {
  @Type(() => Incident)
  readonly results?: Incident[]
}

export class Incident extends BaseEntity {
  @IsNumber()
  readonly pk?: number
  @IsString()
  readonly name?: string
  @IsArray()
  readonly incident_sub_type?: string[]
}

export class BookingTripResponse extends BaseEntity {
  @Type(() => BookingTrip)
  readonly results?: BookingTrip[]
}

export class BookingTrip extends BaseEntity {
  @IsNumber()
  readonly pk?: number
  @IsString()
  readonly start_odometer_reading?: string
}

export class StatusResponse extends BaseEntity {
  @IsNumber()
  readonly next_page?: number
  @Type(() => Status)
  readonly results?: Status[]
}

export class CreateBookingResponse extends BaseEntity {
  @IsNumber()
  readonly pk?: number
  @Type(() => Status)
  readonly status?: Status
}

export class DriverResponse extends BaseEntity {
  @Type(() => Driver)
  readonly results?: Driver[]
}

export class TagResponse extends BaseEntity {
  @IsNumber()
  readonly next_page?: number
  @Type(() => Tag)
  readonly results?: Tag[]
}

export class Tag extends BaseEntity {
  @IsString()
  readonly description?: string
  @IsBoolean()
  readonly is_active?: boolean
  @IsBoolean()
  readonly is_mandatory?: boolean
  @IsNumber()
  readonly pk?: number
  @IsBoolean()
  readonly show_tooltip?: boolean
  @IsString()
  readonly tag_data_type?: string
  @IsString()
  readonly tag_group_name?: string
  @IsString()
  readonly tag_type?: string
  @IsArray()
  readonly tags?: string[]
}
