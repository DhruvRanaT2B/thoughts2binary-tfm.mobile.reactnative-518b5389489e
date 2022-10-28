import React, {createContext, useState, useCallback} from 'react'

export const AuthContext = createContext({
  profileImage: '',
  setProfileImage: (image: string) => {},
  licenseStatus: '',
  setLicenseStatus: (status: string) => {},
  employeeID: '',
  setEmployeeID: (id: string) => {},
  userRole: '',
  setUserRole: (role: string) => {},
})

export const AuthContextProvider: React.FC = ({children}) => {
  const [image, setImage] = useState('')
  const [status, setStatus] = useState('')
  const [ID, setID] = useState('')
  const [role, setRole] = useState('')

  const changeImage = useCallback((data: string) => {
    setImage(data)
  }, [])

  const changeStatus = useCallback((data: string) => {
    setStatus(data)
  }, [])
  const changeID = useCallback((data: string) => {
    setID(data)
  }, [])

  const changeRole = useCallback((data: string) => {
    setRole(data)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        profileImage: image,
        setProfileImage: changeImage,
        licenseStatus: status,
        setLicenseStatus: changeStatus,
        employeeID: ID,
        setEmployeeID: changeID,
        userRole: role,
        setUserRole: changeRole,
      }}>
      {children}
    </AuthContext.Provider>
  )
}
