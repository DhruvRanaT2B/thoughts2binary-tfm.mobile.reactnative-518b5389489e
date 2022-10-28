import {Database, DbGateway} from '@react-native-granite/core'
import {UserSchema} from '../database/schema'
import {currentShema} from '../database/realmInstance'
import {classToPlain} from 'class-transformer'
import {User} from './entity'
class DatabaseGateway implements DbGateway {
  schemName = UserSchema.name
  currentShema = currentShema

  saveUser = async (user: User) => {
    const data = classToPlain(user)
    await Database.dbCreateOrUpdate(this, data).catch(error => {
      console.error(error)
    })
  }
}

export default new DatabaseGateway()
