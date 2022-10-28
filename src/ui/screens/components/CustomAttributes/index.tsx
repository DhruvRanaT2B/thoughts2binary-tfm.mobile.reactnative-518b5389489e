import React, {useState, useCallback, useEffect} from 'react'
import {StyleSheet, TouchableOpacity} from 'react-native'
import {
  Layout,
  Spinner,
  Toggle,
  Select,
  Input,
  Icon,
  useTheme,
  Tooltip,
  Text,
  SelectItem,
  IndexPath,
} from '@ui-kitten/components'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import moment from 'moment'
import _ from 'lodash'
import {CustomAttributesProps} from 'types'

interface DataType {
  description: string
  is_mandatory: boolean
  pk: number
  show_tooltip: boolean
  tag_data_type: string
  tag_group_name: string
  tags: string[]
  selectedTags: string[]
}

const CustomAttributes: React.FC<CustomAttributesProps> = ({
  attributes,
  selectedAttributes,
  isEditable = false,
  validate = false,
  onChange,
}) => {
  const theme = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  const [toolTipID, setToolTipID] = useState(-1)
  const [data, setData] = useState<DataType[]>([])
  const [dateTimePickerVisible, setDateTimePickerVisible] = useState(false)
  const [dateAttr, setDateAttr] = useState<DataType>()

  useEffect(() => {
    // Prepare Data
    const temp: DataType[] = []

    attributes.forEach(attribute => {
      const selectedAttr = selectedAttributes.filter(
        item => item.tag_group_name === attribute.tag_group_name,
      )
      const getDefault = (): string[] => {
        switch (attribute.tag_data_type) {
          case 'toggle':
            return attribute.tags ?? ['false']
          case 'free_text_field':
            return attribute.tags ?? ['']
          case 'counter':
            return attribute.tags ?? ['0']
          default:
            return []
        }
      }

      const obj = {
        description: attribute.description ?? '',
        is_mandatory: attribute.is_mandatory ?? false,
        pk: attribute.pk ?? 0,
        show_tooltip: attribute.show_tooltip ?? false,
        tag_data_type: attribute.tag_data_type ?? 'free_text_field',
        tag_group_name: attribute.tag_group_name ?? '',
        tags: attribute.tags ?? [''],
        selectedTags: _.isEmpty(selectedAttr[0]?.tags)
          ? getDefault()
          : selectedAttr[0].tags!!,
      }
      temp.push(obj)
    })
    setData(temp)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    let temp = data.map(item => ({
      tag_data_type: item.tag_data_type,
      tag_group_name: item.tag_group_name,
      tags: item.selectedTags,
    }))
    //@ts-ignore
    onChange(temp)
  }, [data, onChange])

  const renderOption = useCallback(
    (title: string, key: string) => <SelectItem title={title} key={key} />,
    [],
  )

  const onToggleChange = useCallback(
    (attribute: DataType, checked: boolean) => {
      const temp = [...data]
      temp.forEach(item => {
        if (item.pk === attribute.pk) {
          attribute.selectedTags = [String(checked)]
        }
      })
      setData(temp)
    },
    [data],
  )

  const getSelectedIndex = useCallback(
    (attribute: DataType): IndexPath | undefined => {
      if (attribute.selectedTags.length > 0) {
        const index = attribute.tags.findIndex(
          item => item === attribute.selectedTags[0],
        )
        if (index > -1) return new IndexPath(index)
      }
    },
    [],
  )

  const onSelect = useCallback(
    (attribute: DataType, index: IndexPath) => {
      const temp = [...data]
      temp.forEach(item => {
        if (item.pk === attribute.pk) {
          attribute.selectedTags = [attribute.tags[index.row]]
        }
      })
      setData(temp)
    },
    [data],
  )

  const getMultiSelectedIndex = useCallback(
    (attribute: DataType): IndexPath[] | undefined => {
      if (attribute.selectedTags.length > 0) {
        const indices = attribute.selectedTags
          .map(tag => attribute.tags.findIndex(item => item === tag))
          .filter(item => item > -1)
        const indexPaths = indices.map(index => new IndexPath(index))
        return indexPaths
      }
    },
    [],
  )

  const onMultiSelect = useCallback(
    (attribute: DataType, index: IndexPath[]) => {
      const temp = [...data]
      temp.forEach(item => {
        if (item.pk === attribute.pk) {
          attribute.selectedTags = index.map(el => attribute.tags[el.row])
        }
      })
      setData(temp)
    },
    [data],
  )

  const onChangeText = useCallback(
    (attribute: DataType, text: string) => {
      const temp = [...data]
      temp.forEach(item => {
        if (item.pk === attribute.pk) {
          attribute.selectedTags = [text]
        }
      })
      setData(temp)
    },
    [data],
  )

  const closeDatePicker = useCallback(() => {
    setDateTimePickerVisible(false)
  }, [])

  const handleConfirm = useCallback(
    (date: Date) => {
      setDateTimePickerVisible(false)
      if (dateAttr) {
        const temp = [...data]
        temp.forEach(item => {
          if (item.pk === dateAttr.pk) {
            dateAttr.selectedTags = [moment(date).format('YYYY-MM-DD')]
          }
        })
        setDateAttr(undefined)
        setData(temp)
      }
    },
    [data, dateAttr],
  )

  const resetToolTipID = useCallback(() => {
    setToolTipID(-1)
  }, [])

  const renderInfoIcon = useCallback(
    (attribute: DataType) => {
      if (attribute.show_tooltip)
        return (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setToolTipID(attribute.pk)}>
            <Tooltip
              anchor={() => (
                <Icon
                  name="info"
                  style={styles.infoIcon}
                  fill={theme['color-primary-default']}
                />
              )}
              placement="top"
              onBackdropPress={resetToolTipID}
              visible={toolTipID === attribute.pk}>
              {attribute.description}
            </Tooltip>
          </TouchableOpacity>
        )
    },
    [resetToolTipID, toolTipID],
  )

  const getLabel = useCallback((attribute: DataType) => {
    return `${
      attribute.is_mandatory
        ? attribute.tag_group_name + '*'
        : attribute.tag_group_name
    }`
  }, [])

  if (isLoading || data.length < 1)
    return (
      <Layout style={styles.loaderWrapper}>
        <Spinner />
      </Layout>
    )

  return (
    <>
      {data.map(attributeDetail => {
        switch (attributeDetail.tag_data_type) {
          case 'toggle':
            return (
              <Layout style={styles.toggleWrapper}>
                <Layout style={{alignItems: 'flex-start'}}>
                  <Text
                    category="label"
                    appearance="hint"
                    style={{marginBottom: 4}}>
                    {getLabel(attributeDetail)}
                  </Text>
                  <Toggle
                    disabled={!isEditable}
                    checked={
                      attributeDetail.selectedTags.length > 0
                        ? attributeDetail.selectedTags[0] === 'true'
                        : false
                    }
                    onChange={checked =>
                      onToggleChange(attributeDetail, checked)
                    }
                  />
                </Layout>
                {renderInfoIcon(attributeDetail)}
              </Layout>
            )
          case 'textselect':
            return (
              <Layout style={styles.inputWrapper}>
                <Select
                  style={{flex: 1}}
                  disabled={!isEditable}
                  label={getLabel(attributeDetail)}
                  value={
                    attributeDetail.selectedTags.length > 0
                      ? attributeDetail.selectedTags[0]
                      : ''
                  }
                  onSelect={index =>
                    onSelect(attributeDetail, index as IndexPath)
                  }
                  selectedIndex={getSelectedIndex(attributeDetail)}
                  caption={
                    validate &&
                    attributeDetail.is_mandatory &&
                    getSelectedIndex(attributeDetail) === undefined
                      ? `${attributeDetail.tag_group_name} is a required field`
                      : ''
                  }
                  status={
                    validate &&
                    attributeDetail.is_mandatory &&
                    getSelectedIndex(attributeDetail) === undefined
                      ? 'danger'
                      : 'basic'
                  }>
                  {attributeDetail.tags.map(tag => renderOption(tag, tag))}
                </Select>
                {renderInfoIcon(attributeDetail)}
              </Layout>
            )
          case 'multitextselect':
            return (
              <Layout style={styles.inputWrapper}>
                <Select
                  style={{flex: 1}}
                  disabled={!isEditable}
                  multiSelect
                  label={getLabel(attributeDetail)}
                  value={
                    attributeDetail.selectedTags.length > 0
                      ? attributeDetail.selectedTags.join(', ')
                      : ''
                  }
                  onSelect={index =>
                    onMultiSelect(attributeDetail, index as IndexPath[])
                  }
                  caption={
                    validate &&
                    attributeDetail.is_mandatory &&
                    getMultiSelectedIndex(attributeDetail) === undefined
                      ? `${attributeDetail.tag_group_name} is a required field`
                      : ''
                  }
                  status={
                    validate &&
                    attributeDetail.is_mandatory &&
                    getMultiSelectedIndex(attributeDetail) === undefined
                      ? 'danger'
                      : 'basic'
                  }
                  selectedIndex={getMultiSelectedIndex(attributeDetail)}>
                  {attributeDetail.tags.map(tag => renderOption(tag, tag))}
                </Select>
                {renderInfoIcon(attributeDetail)}
              </Layout>
            )
          case 'free_text_field':
            return (
              <Layout style={styles.inputWrapper}>
                <Input
                  style={{flex: 1}}
                  disabled={!isEditable}
                  label={getLabel(attributeDetail)}
                  defaultValue={
                    attributeDetail.selectedTags.length > 0
                      ? attributeDetail.selectedTags[0]
                      : ''
                  }
                  autoCorrect={false}
                  caption={
                    validate &&
                    attributeDetail.is_mandatory &&
                    (attributeDetail.selectedTags[0] === undefined ||
                      attributeDetail.selectedTags[0] === '')
                      ? `${attributeDetail.tag_group_name} is a required field`
                      : ''
                  }
                  status={
                    validate &&
                    attributeDetail.is_mandatory &&
                    (attributeDetail.selectedTags[0] === undefined ||
                      attributeDetail.selectedTags[0] === '')
                      ? 'danger'
                      : 'basic'
                  }
                  onChangeText={text => onChangeText(attributeDetail, text)}
                />
                {renderInfoIcon(attributeDetail)}
              </Layout>
            )
          case 'date':
            return (
              <Layout style={styles.inputWrapper}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={{flex: 1}}
                  onPress={() => {
                    if (isEditable) {
                      setDateAttr(attributeDetail)
                      setDateTimePickerVisible(true)
                    }
                  }}>
                  <Text
                    category="label"
                    appearance="hint"
                    style={{marginBottom: 4}}>
                    {getLabel(attributeDetail)}
                  </Text>
                  <Layout
                    style={[
                      styles.dateWrapper,
                      {
                        borderColor:
                          validate &&
                          attributeDetail.is_mandatory &&
                          attributeDetail.selectedTags[0] === undefined
                            ? 'red'
                            : 'silver',
                      },
                    ]}>
                    <Text numberOfLines={1} style={{flex: 1}}>
                      {attributeDetail.selectedTags.length > 0
                        ? moment(attributeDetail.selectedTags[0]).format(
                            'DD/MM/YYYY',
                          )
                        : ''}
                    </Text>
                    <Icon
                      name="calendar"
                      style={styles.infoIcon}
                      fill={theme['color-primary-default']}
                    />
                  </Layout>
                  {validate &&
                    attributeDetail.is_mandatory &&
                    attributeDetail.selectedTags[0] === undefined && (
                      <Text status="danger" category="c1">
                        {`${attributeDetail.tag_group_name} is a required field`}
                      </Text>
                    )}
                </TouchableOpacity>
                {renderInfoIcon(attributeDetail)}
              </Layout>
            )
          case 'counter':
            return (
              <Layout style={styles.inputWrapper}>
                <Input
                  style={{flex: 1}}
                  disabled={!isEditable}
                  label={getLabel(attributeDetail)}
                  defaultValue={
                    attributeDetail.selectedTags.length > 0
                      ? attributeDetail.selectedTags[0]
                      : ''
                  }
                  autoCorrect={false}
                  keyboardType="numeric"
                  caption={
                    validate &&
                    attributeDetail.is_mandatory &&
                    (attributeDetail.selectedTags[0] === undefined ||
                      attributeDetail.selectedTags[0] === '')
                      ? `${attributeDetail.tag_group_name} is a required field`
                      : ''
                  }
                  status={
                    validate &&
                    attributeDetail.is_mandatory &&
                    (attributeDetail.selectedTags[0] === undefined ||
                      attributeDetail.selectedTags[0] === '')
                      ? 'danger'
                      : 'basic'
                  }
                  onChangeText={text => onChangeText(attributeDetail, text)}
                />
                {renderInfoIcon(attributeDetail)}
              </Layout>
            )
        }
      })}
      <DateTimePickerModal
        isVisible={dateTimePickerVisible}
        date={
          _.isEmpty(dateAttr?.selectedTags)
            ? new Date()
            : moment(dateAttr?.selectedTags[0]).toDate()
        }
        mode="date"
        onConfirm={handleConfirm}
        onCancel={closeDatePicker}
      />
    </>
  )
}

const styles = StyleSheet.create({
  loaderWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  infoIcon: {
    height: 18,
    width: 18,
    marginStart: 6,
  },
  dateWrapper: {
    height: 40,
    borderWidth: 0.5,
    borderRadius: 4,
    backgroundColor: 'whitesmoke',
    paddingVertical: 8,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
})

export {CustomAttributes}
