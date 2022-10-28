package com.thoughts2binary.tfm

import android.app.Activity
import android.content.Intent
import com.facebook.react.bridge.*
import com.google.android.libraries.places.api.model.Place
import com.google.android.libraries.places.widget.Autocomplete
import com.google.android.libraries.places.widget.AutocompleteActivity
import com.google.android.libraries.places.widget.model.AutocompleteActivityMode

class GoogleAutoComplete(val reactContext: ReactApplicationContext?) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {
    private val AUTOCOMPLETE_REQUEST_CODE = 1
    private lateinit var promise: Promise

    override fun getName(): String {
        return "GoogleAutoComplete"
    }

    override fun initialize() {
        super.initialize()
        reactContext?.addActivityEventListener(this)
    }

    override fun invalidate() {
        super.invalidate()
        reactContext?.removeActivityEventListener(this)
    }

    @ReactMethod
    fun show(promise: Promise) {
        this.promise = promise
        // Set the fields to specify which types of place data to
        // return after the user has made a selection.
        val fields = listOf(
            Place.Field.ID,
            Place.Field.NAME,
            Place.Field.VIEWPORT,
            Place.Field.LAT_LNG,
            Place.Field.ADDRESS
        )

        // Start the autocomplete intent.
        val intent = Autocomplete.IntentBuilder(AutocompleteActivityMode.OVERLAY, fields)
            .build(reactApplicationContext)

        if (currentActivity != null) {
            currentActivity?.startActivityForResult(intent, AUTOCOMPLETE_REQUEST_CODE, null)
        } else {
            this.promise.reject("Error", "Unable to launch activity")
        }
    }

    override fun onActivityResult(
        activity: Activity?,
        requestCode: Int,
        resultCode: Int,
        data: Intent?
    ) {
        if (requestCode == AUTOCOMPLETE_REQUEST_CODE) {
            when (resultCode) {
                Activity.RESULT_OK -> {
                    data?.let {
                        val place = Autocomplete.getPlaceFromIntent(data)
                        val map = Arguments.createMap()
                        map.putString("name", place.name ?: "")
                        map.putString("address", place.address ?: "")

                        val coordinateMap = Arguments.createMap()
                        coordinateMap.putDouble("latitude", place.latLng?.latitude ?: 0.0)
                        coordinateMap.putDouble("longitude", place.latLng?.longitude ?: 0.0)
                        map.putMap("coordinate", coordinateMap)

                        val northEastMap = Arguments.createMap()
                        val northEastLatLong = Arguments.createMap()
                        northEastLatLong.putDouble(
                            "latitude", place.viewport?.northeast?.latitude
                                ?: 0.0
                        )
                        northEastLatLong.putDouble(
                            "longitude", place.viewport?.northeast?.longitude
                                ?: 0.0
                        )
                        northEastMap.putMap("northEast", northEastLatLong)

                        val southWestMap = Arguments.createMap()
                        val southWestLatLong = Arguments.createMap()
                        southWestLatLong.putDouble(
                            "latitude", place.viewport?.southwest?.latitude
                                ?: 0.0
                        )
                        southWestLatLong.putDouble(
                            "longitude", place.viewport?.southwest?.longitude
                                ?: 0.0
                        )
                        southWestMap.putMap("southWest", southWestLatLong)

                        northEastMap.merge(southWestMap)

                        map.putMap("viewport", northEastMap)
                        this.promise.resolve(map)
                    }
                }
                AutocompleteActivity.RESULT_ERROR -> {
                    this.promise.reject("Error", "Something went wrong")
                }
                Activity.RESULT_CANCELED -> {
                    // The user canceled the operation.
                    this.promise.reject("Error", "User canceled the operation")
                }
            }
            return
        }
    }

    override fun onNewIntent(intent: Intent?) {}
}