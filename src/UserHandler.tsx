import { util } from "quick-n-dirty-utils"
import { UserProfileType, UserType } from "./shared-types"

export interface UserListResponseType {
    users: UserType[],
    total: number,
}

class UserHandler {

    private apiPrefix: string

    constructor(apiPrefix: string = "/api/user/users") {
        this.apiPrefix = apiPrefix
    }

    updateUserProfile(userId: string, updatedProfile: UserProfileType): Promise<UserType> {
        return fetch(`${this.apiPrefix}/${userId}/profile`, {
            method: "POST",
            headers: util.getAuthJsonHeader(),
            body: JSON.stringify(updatedProfile),
        }).then(util.restHandler)
    }

    deleteUser(userId: string) {
        return fetch(`${this.apiPrefix}/${userId}`, {
            method: "DELETE",
            headers: util.getAuthJsonHeader(),
        }).then(util.restHandler)
    }

    getAllUsers(page?: number): Promise<UserListResponseType> {
        return fetch(`${this.apiPrefix}?page=${page || 0}`, {
            headers: util.getAuthJsonHeader(),
        }).then(util.restHandler)
    }

    updatePermissions(userId: string | undefined, newPermissions: string[]): Promise<UserType> {
        return fetch(`${this.apiPrefix}/${userId}/permissions`, {
            method: "POST",
            headers: util.getAuthJsonHeader(),
            body: JSON.stringify({ permissions: newPermissions }),
        }).then(util.restHandler)
    }

    createUserRequest(newUser: UserType) {
        return fetch(this.apiPrefix, {
            method: "POST",
            headers: util.getAuthJsonHeader(),
            body: JSON.stringify(newUser),
        })
    }

    createUser(newUser: UserType): Promise<UserType> {
        return this.createUserRequest(newUser).then(util.restHandler)
    }

    updateUserPassword(userId: string | undefined, newPassword: string): Promise<UserType> {
        return fetch(`${this.apiPrefix}/${userId}/password`, {
            method: "POST",
            headers: util.getAuthJsonHeader(),
            body: JSON.stringify({
                password: newPassword,
            }),
        }).then(util.restHandler)
    }
}

export default UserHandler
