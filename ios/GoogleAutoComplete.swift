//
//  GoogleAutoComplete.swift
//  TFM
//
//  Created by Shubham Singla on 22/09/21.
//

import Foundation
import React
import GooglePlaces

@objc(GoogleAutoComplete)
class GoogleAutoComplete: NSObject, GMSAutocompleteViewControllerDelegate {
  var resolveBlock: RCTPromiseResolveBlock!
  var rejectBlock: RCTPromiseRejectBlock!
  
  @objc func show(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock){
    resolveBlock = resolve
    rejectBlock =  reject
    
    DispatchQueue.main.async {
      let autocompleteController = GMSAutocompleteViewController()
      autocompleteController.delegate = self
      
      // Specify the place data types to return.
      let fields: GMSPlaceField = GMSPlaceField(rawValue: UInt(GMSPlaceField.name.rawValue) | UInt(GMSPlaceField.placeID.rawValue) | UInt(GMSPlaceField.viewport.rawValue) | UInt(GMSPlaceField.coordinate.rawValue) | UInt(GMSPlaceField.formattedAddress.rawValue))
      autocompleteController.placeFields = fields
      
      if let presenter = RCTPresentedViewController(){
        presenter.present(autocompleteController, animated: true, completion: nil)
      }else {
        self.rejectBlock("Error", "Unable to launch activity", nil)
      }
    }
  }
  
  // Handle the user's selection.
  func viewController(_ viewController: GMSAutocompleteViewController, didAutocompleteWith place: GMSPlace) {
    resolveBlock(["name":place.name ?? "","address":place.formattedAddress ?? "" ,"coordinate":["latitude":place.coordinate.latitude, "longitude":place.coordinate.longitude], "viewport":["northEast":["latitude":place.viewportInfo?.northEast.latitude ?? 0.0, "longitude":place.viewportInfo?.northEast.longitude ?? 0.0], "southWest":["latitude":place.viewportInfo?.southWest.latitude ?? 0.0, "longitude":place.viewportInfo?.southWest.longitude ?? 0.0]]])
    RCTPresentedViewController()?.dismiss(animated: true, completion: nil)
  }
  
  // Handle the error.
  func viewController(_ viewController: GMSAutocompleteViewController, didFailAutocompleteWithError error: Error) {
    rejectBlock("Error", error.localizedDescription, nil)
    RCTPresentedViewController()?.dismiss(animated: true, completion: nil)
  }
  
  // User canceled the operation.
  func wasCancelled(_ viewController: GMSAutocompleteViewController) {
    rejectBlock("Error", "User canceled the operation", nil)
    RCTPresentedViewController()?.dismiss(animated: true, completion: nil)
  }
  
  // Turn the network activity indicator on and off again.
  func didRequestAutocompletePredictions(_ viewController: GMSAutocompleteViewController) {
    UIApplication.shared.isNetworkActivityIndicatorVisible = true
  }
  
  func didUpdateAutocompletePredictions(_ viewController: GMSAutocompleteViewController) {
    UIApplication.shared.isNetworkActivityIndicatorVisible = false
  }
}
