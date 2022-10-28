import React, {useState, useEffect, useCallback} from 'react'
import {StyleSheet, Alert, Image} from 'react-native'
import {
  Layout,
  Text,
  Input,
  Spinner,
  Divider,
  Select,
  IndexPath,
  SelectItem,
  Button,
  List,
} from '@ui-kitten/components'
import moment from 'moment'
import _ from 'lodash'

import {SafeAreaView} from '@components'
import STRINGS from './strings'
import {EventEmitter} from '@react-native-granite/core'
import {entity, controller, INCIDENT_EVENTS} from '@incidents'
import {IncidentScreenProps} from 'types'
import {getIncidentStatusColor} from '@utility'
import {NotesListItem} from './components/NotesListItem'

// Global constants
const eventEmitter = new EventEmitter()
const noteTypes = [STRINGS.TYPE_INFO, STRINGS.TYPE_ALERT, STRINGS.TYPE_WARNING]

const IncidentDetails: React.FC<IncidentScreenProps<'IncidentDetails'>> = ({
  navigation,
  route,
}) => {
  const {id} = route.params

  const [isLoading, setIsLoading] = useState(true)
  const [incident, setIncident] = useState<entity.Incident>()
  const [images, setImages] = useState<entity.GraniteDocument[]>([])
  const [comment, setComment] = useState('')
  const [selectedType, setSelectedType] = useState<IndexPath>()
  const [buttonDisabled, setButtonDisabled] = useState(false)
  const [notes, setNotes] = useState<entity.Note[]>([])
  const [isPaging, setIsPaging] = useState(false)
  const [nextPage, setNextPage] = useState<null | number>(null)

  useEffect(() => {
    const subscription = eventEmitter.getObservable().subscribe(event => {
      switch (event.type) {
        case INCIDENT_EVENTS.LOAD_INCIDENT_START:
          setIsLoading(true)
          break
        case INCIDENT_EVENTS.LOAD_INCIDENT_SUCCESS:
          setIncident(event.data.incident)
          setImages(event.data.images)
          setIsLoading(false)
          break
        case INCIDENT_EVENTS.LOAD_INCIDENT_FAILURE:
          Alert.alert('', event.data || STRINGS.SOMETHING_WENT_WRONG)
          navigation.goBack()
          break

        case INCIDENT_EVENTS.POST_NOTE_START:
          setButtonDisabled(true)
          break
        case INCIDENT_EVENTS.POST_NOTE_SUCCESS:
          setComment('')
          setSelectedType(undefined)
          setButtonDisabled(false)
          Alert.alert('', STRINGS.NOTE_SAVED_SUCCESSFULLY)
          controller.getNotes(eventEmitter, {
            pageNumber: 1,
            currentList: [],
            incidentID: id,
          })
          controller.getIncident(eventEmitter, {incidentID: id})
          break
        case INCIDENT_EVENTS.POST_NOTE_FAILURE:
          Alert.alert('', event.data || STRINGS.SOMETHING_WENT_WRONG)
          setButtonDisabled(false)
          break

        case INCIDENT_EVENTS.LOAD_NOTES_START:
          break
        case INCIDENT_EVENTS.LOAD_NOTES_SUCCESS:
          setIsPaging(false)
          setNextPage(event.data.nextPage)
          setNotes(event.data.list)
          break
        case INCIDENT_EVENTS.LOAD_NOTES_FAILURE:
          setIsPaging(false)
          setNextPage(null)
          setNotes([])
          break
      }
    })

    controller.getIncident(eventEmitter, {incidentID: id})
    controller.getNotes(eventEmitter, {
      pageNumber: 1,
      currentList: [],
      incidentID: id,
    })
    return () => subscription.unsubscribe()
  }, [])

  const incidentDetails = useCallback(
    () =>
      [
        {title: STRINGS.LABEL_STATUS, value: incident?.status?.status_name},
        {title: STRINGS.LABEL_VEHICLE_NAME, value: incident?.vehicle?.name},
        {
          title: STRINGS.LABEL_VEHICLE_REGISTRATION_NUMBER,
          value: incident?.vehicle?.registrations_num,
        },
        {
          title: STRINGS.LABEL_TYPE,
          value: incident?.incident_type?.name,
        },
        {
          title: STRINGS.LABEL_SUB_TYPE,
          value: incident?.incident_sub_type,
        },
        {
          title: STRINGS.LABEL_ADDRESS,
          value: incident?.address,
        },
        {
          title: STRINGS.LABEL_ADDITIONAL_LOCATION_DETAILS,
          value: incident?.address_features?.landmark,
        },
        {
          title: STRINGS.LABEL_REPORTED_ON,
          value: moment(incident?.reported_on?.original).format(
            'DD/MM/YYYY, hh:mm A',
          ),
        },
        {title: STRINGS.LABEL_REPORTED_BY, value: incident?.reported_by?.name},
        {
          title: STRINGS.LABEL_REPORTER_CONTACT,
          value: incident?.reported_by?.phone,
        },
        {
          title: STRINGS.LABEL_LAST_UPDATED_ON,
          value: moment(incident?.modified_at?.original).format(
            'DD/MM/YYYY, hh:mm A',
          ),
        },
        {title: STRINGS.LABEL_BOOKING_ID, value: incident?.booking?.pk ?? 'NA'},
      ].filter(
        item =>
          item.value && item.value !== 'undefined' && item.value !== 'null',
      ),
    [incident],
  )

  const customAttributes = useCallback((attributes: entity.IncidentTag[]) => {
    const array: {title: string; value: string}[] = []
    attributes.forEach(tag => {
      array.push({
        title: tag.tag_group_name!!,
        value: Array.isArray(tag.tags)
          ? tag.tags?.join(', ')!!
          : tag.tags ?? '',
      })
    })

    return array
  }, [])

  const renderOption = useCallback(
    (title: string, key: string) => <SelectItem title={title} key={key} />,
    [],
  )

  const onAddNotePress = useCallback(() => {
    if (selectedType)
      controller.addNote(eventEmitter, {
        incidentID: id,
        note: comment,
        noteType: noteTypes[selectedType.row],
      })
  }, [comment, selectedType])

  const listHeader = () => (
    <Layout>
      <Layout style={styles.headerOuterWrapper}>
        <Layout style={styles.headerLeftPortion}>
          <Layout>
            <Text category="s1" style={{fontSize: 18, fontWeight: 'bold'}}>
              {`${incident?.pk} - ${incident?.vehicle?.name}`}
            </Text>
            <Layout style={styles.headerCaption}>
              <Layout
                style={[
                  styles.colorDot,
                  {
                    backgroundColor: getIncidentStatusColor(
                      incident?.status?.status_name!!,
                    ),
                  },
                ]}
              />
              <Text category="c1">{incident?.status?.status_name}</Text>
            </Layout>
          </Layout>
        </Layout>
      </Layout>
      <Layout style={styles.detailsWrapper}>
        {incidentDetails().map(({title, value}) => renderDetails(title, value))}
      </Layout>
      {!_.isEmpty(incident?.incident_tags) && (
        <>
          <Text status="primary" category="s1">
            {STRINGS.LABEL_CUSTOM_ATTRIBUTES}
          </Text>
          {customAttributes(incident?.incident_tags || []).map(
            ({title, value}) => renderDetails(title, value),
          )}
        </>
      )}
      <Divider style={styles.divider} />
      {!_.isEmpty(images) && (
        <Layout style={styles.imageHolder}>
          {images.map(imageFile => (
            <Image style={styles.image} source={{uri: imageFile.document}} />
          ))}
        </Layout>
      )}
      <Select
        label={STRINGS.LABEL_TYPE_OF_NOTE}
        style={styles.dropdown}
        placeholder={STRINGS.PLACEHOLDER_TYPE_OF_NOTE}
        value={selectedType && noteTypes[selectedType.row]}
        selectedIndex={selectedType}
        onSelect={index => {
          setSelectedType(index as IndexPath)
        }}>
        {noteTypes.map((value, index) => renderOption(value, String(index)))}
      </Select>
      <Input
        placeholder={STRINGS.PLACEHOLDER_COMMENT}
        value={comment}
        onChangeText={text => setComment(text)}
        style={styles.input}
        multiline={true}
        textStyle={styles.commentContainer}
        autoCorrect={false}
      />
      <Button
        style={styles.button}
        disabled={comment.length < 1 || !selectedType || buttonDisabled}
        onPress={onAddNotePress}>
        {STRINGS.BUTTON_ADD_NOTE}
      </Button>
    </Layout>
  )

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
      ) : (
        <Layout style={styles.separator} />
      ),
    [isPaging],
  )

  const onEndReached = useCallback(() => {
    if (nextPage) {
      setIsPaging(true)
      controller.getNotes(eventEmitter, {
        pageNumber: nextPage,
        currentList: notes,
        incidentID: id,
      })
    }
  }, [nextPage, notes, route])

  if (isLoading)
    return (
      <Layout style={styles.loaderWrapper}>
        <Spinner />
      </Layout>
    )

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Layout
        style={{
          height: 14,
          backgroundColor: getIncidentStatusColor(
            incident?.status?.status_name!!,
          ),
        }}
      />

      <List
        ListHeaderComponent={listHeader()}
        style={styles.list}
        data={notes}
        keyExtractor={(item: entity.Note) => String(item.pk)}
        renderItem={({item}) => <NotesListItem item={item} />}
        ItemSeparatorComponent={ItemSeparator}
        ListFooterComponent={ListFooter}
        onEndReachedThreshold={0.5}
        onEndReached={onEndReached}
      />
    </SafeAreaView>
  )
}

const renderDetails = (label: string, value: any) => (
  <Layout style={styles.itemWrapper} key={label}>
    <Layout style={styles.itemLabel}>
      <Text category="s2" style={{flex: 1}}>
        {label}
      </Text>
      <Text category="s2" style={{paddingHorizontal: 12}}>
        :
      </Text>
    </Layout>
    <Layout style={[styles.itemLabel, {justifyContent: 'flex-start'}]}>
      <Text category="p2">{value}</Text>
    </Layout>
  </Layout>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
  },
  input: {
    marginTop: 16,
    marginBottom: 8,
  },
  commentContainer: {
    minHeight: 80,
    maxHeight: 160,
  },
  loaderWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerOuterWrapper: {
    flexDirection: 'row',
    marginBottom: 12,
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  headerLeftPortion: {
    flex: 1,
    flexDirection: 'row',
    paddingEnd: 22,
  },
  headerCaption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    height: 8,
    width: 8,
    borderRadius: 8,
    marginEnd: 4,
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
  detailsWrapper: {
    paddingBottom: 8,
  },
  divider: {
    marginVertical: 6,
    height: 2,
  },
  imageHolder: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginVertical: 8,
  },
  image: {
    height: 50,
    width: 50,
    borderRadius: 4,
    marginTop: 6,
    marginEnd: 6,
    backgroundColor: 'whitesmoke',
  },
  dropdown: {
    marginTop: 6,
  },
  separator: {
    height: 10,
  },
  button: {
    alignSelf: 'flex-end',
    marginBottom: 18,
  },
  footerLoaderContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
})

export default IncidentDetails
