import React from "react"
import { UserType } from "./shared-types"

export interface ProfileManagerProps {
    user: UserType,
    profileManagerProps: {
        [key in string]: any
    }
}

class ProfileManager extends React.Component<ProfileManagerProps> {
    constructor(props: ProfileManagerProps) {
        super(props)
    }
    
    getProfile() {
        return null
    }

    render() {
        return null
    }
}

export default ProfileManager
