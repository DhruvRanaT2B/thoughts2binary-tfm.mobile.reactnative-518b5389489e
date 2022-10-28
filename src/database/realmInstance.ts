import {UserSchema} from './schema'

export const currentShema = {
  schema: [UserSchema],
  migration: (oldRealm: any, newRealm: any) => {
    //Migration code goes here...
  },
}
