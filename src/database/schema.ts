export const UserSchema = {
  name: 'User',
  primaryKey: 'id',
  properties: {
    id: {type: 'int'},
    email: {type: 'string'},
    name: {type: 'string'},
    phone: {type: 'string'},
    profile_picture: {type: 'string'},
  },
}
