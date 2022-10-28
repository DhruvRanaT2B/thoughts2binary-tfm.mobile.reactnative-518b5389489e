import React from 'react'
import {
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native'
import {Layout, Icon, useTheme} from '@ui-kitten/components'
import {launchCamera, launchImageLibrary} from 'react-native-image-picker'
import {ImagePickerProps} from 'types'

// Constants
const TEN_MEGA_BYTES = 10 * 1024 * 1024

const ImagePicker = ({
  maxPhotos = 5,
  onImageChange,
  cameraEnabled = true,
  imagePickerButton,
  cameraButton,
  images,
}: ImagePickerProps) => {
  const theme = useTheme()
  const buttonColor =
    images.length < maxPhotos || maxPhotos === 1
      ? theme['color-primary-default']
      : 'grey'

  React.useEffect(() => {
    onImageChange(images)
  }, [images])

  const removeImage = (imageIndex: number) => {
    let collection = [...images]
    collection[imageIndex] = null
    collection = collection.filter(item => item != null)
    onImageChange(collection)
  }

  const onImagePickerPress = () => {
    launchImageLibrary({mediaType: 'photo', quality: 0.7}, response => {
      console.log('Image Picker Response ->', response)
      if (response.errorCode) {
        Alert.alert('', response.errorCode)
        return
      }

      if (response.assets && response.assets[0]?.fileSize) {
        if (response.assets[0].fileSize > TEN_MEGA_BYTES) {
          Alert.alert('', 'Image size too large')
          return
        }
        const obj = {
          uri: String(
            Platform.OS === 'android'
              ? response.assets[0].uri
              : response.assets[0].uri?.replace('file://', ''),
          ),
          type: String(response.assets[0].type),
          name:
            response.assets[0].fileName ??
            `image_${response.assets[0].height}${response.assets[0].width}.${
              response.assets[0].type?.split('/')[1] ?? 'png'
            }`,
        }

        if (maxPhotos === 1) onImageChange([obj])
        else onImageChange([...images, obj])
      }
    })
  }

  const onCameraPress = () => {
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.7,
      },
      response => {
        console.log('Camera response ->', response)
        if (response.errorCode) {
          Alert.alert('', response.errorCode)
          return
        }
        if (response.assets && response.assets[0]?.fileSize) {
          const obj = {
            uri: String(
              Platform.OS === 'android'
                ? response.assets[0].uri
                : response.assets[0].uri?.replace('file://', ''),
            ),
            type: String(response.assets[0].type),
            name:
              response.assets[0].fileName ??
              `image_${response.assets[0].height}${response.assets[0].width}.${
                response.assets[0].type?.split('/')[1] ?? 'png'
              }`,
          }

          if (maxPhotos === 1) onImageChange([obj])
          else onImageChange([...images, obj])
        }
      },
    )
  }
  return (
    <Layout style={styles.imageHolder}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() =>
          images.length < maxPhotos || maxPhotos === 1
            ? onImagePickerPress()
            : null
        }>
        {imagePickerButton ? (
          imagePickerButton(buttonColor)
        ) : (
          <Icon name="image-outline" style={styles.icon} fill={buttonColor} />
        )}
      </TouchableOpacity>
      {cameraEnabled && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            images.length < maxPhotos || maxPhotos === 1
              ? onCameraPress()
              : null
          }>
          {cameraButton ? (
            cameraButton(buttonColor)
          ) : (
            <Icon
              name="camera-outline"
              style={styles.icon}
              fill={buttonColor}
            />
          )}
        </TouchableOpacity>
      )}
      {images.map((imageFile, index) => (
        <Layout style={styles.imageWrapper}>
          <TouchableOpacity activeOpacity={0.7}>
            <ImageBackground
              style={styles.image}
              source={{uri: imageFile.uri}}
              imageStyle={styles.imageBackground}
            />
          </TouchableOpacity>
          {maxPhotos > 1 && (
            <Icon
              name="close-circle"
              fill={theme['background-alternative-color-1']}
              onPress={() => removeImage(index)}
              style={styles.closeIcon}
            />
          )}
        </Layout>
      ))}
    </Layout>
  )
}

const styles = StyleSheet.create({
  imageHolder: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginVertical: 8,
  },
  icon: {
    height: 32,
    width: 32,
    marginEnd: 15,
    padding: 6,
  },
  imageWrapper: {
    flexDirection: 'row',
  },
  imageBackground: {
    borderRadius: 4,
    backgroundColor: 'whitesmoke',
  },
  image: {
    height: 50,
    width: 50,
    borderRadius: 4,
    marginTop: 6,
  },
  closeIcon: {
    position: 'relative',
    height: 18,
    width: 18,
    end: 8,
  },
})

export {ImagePicker}
