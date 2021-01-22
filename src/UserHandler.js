import util from "quick-n-dirty-utils"

class UserHandler {
    constructor(apiPrefix = "/api/user/users") {
        this.apiPrefix = apiPrefix
    }

    updateUserProfile(userId, updatedProfile) {
        return fetch(`${this.apiPrefix}/${userId}/profile`, {
            method: "POST",
            headers: util.getAuthJsonHeader(),
            body: JSON.stringify(updatedProfile),
        }).then(util.restHandler)
    }

    deleteUser(userId) {
        return fetch(`${this.apiPrefix}/${userId}`, {
            method: "DELETE",
            headers: util.getAuthJsonHeader(),
        }).then(util.restHandler)
    }

    getAllUsers(page) {
        return fetch(`${this.apiPrefix}?page=${page || 0}`, {
            headers: util.getAuthJsonHeader(),
        }).then(util.restHandler)
    }

    updatePermissions(userId, newPermissions) {
        return fetch(`${this.apiPrefix}/${userId}/permissions`, {
            method: "POST",
            headers: util.getAuthJsonHeader(),
            body: JSON.stringify({ permissions: newPermissions }),
        }).then(util.restHandler)
    }

    createUserRequest(newUser) {
        return fetch(this.apiPrefix, {
            method: "POST",
            headers: util.getAuthJsonHeader(),
            body: JSON.stringify(newUser),
        })
    }

    createUser(newUser) {
        return this.createUserRequest(newUser).then(util.restHandler)
    }

    updateUserPassword(userId, newPassword) {
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
