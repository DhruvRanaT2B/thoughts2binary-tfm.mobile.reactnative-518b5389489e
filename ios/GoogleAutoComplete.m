//
//  GoogleAutoComplete.m
//  TFM
//
//  Created by Shubham Singla on 22/09/21.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(GoogleAutoComplete, NSObject)

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

RCT_EXTERN_METHOD(show: (RCTPromiseResolveBlock) resolve
rejecter: (RCTPromiseRejectBlock) reject
)

@end
