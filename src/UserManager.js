import React from "react"
import util from "quick-n-dirty-utils"
import { mixins, Popup } from "quick-n-dirty-react"
import UserForm from "./UserForm"
import LocalUserForm from "./LocalUserForm"
import UserHandler from "./UserHandler"

const style = {
    table: {
        display: "grid",
        gridTemplateColumns: "400px 400px 150px",
        gridRowGap: "10px",
    },
    listHeader: {
        fontSize: "12px",
        fontWeight: "600",
        borderBottom: "1px solid #333",
        padding: "8px",
        background: "#ccc",
    },
    option: {
        ...mixins.textLink,
        ...mixins.clickable,
        marginRight: "10px",
    },
    editProfile: {
        ...mixins.textLink,
        fontSize: "12px",
        paddingLeft: "8px",
    },
    editProfileHeader: {
        width: "934px",
    },
    pagingBarStart: {
        ...mixins.smallFont,
        borderTop: "1px solid #ccc",
        paddingTop: "5px",
    },
    pagingBar: {
        ...mixins.right,
        ...mixins.smallFont,
        gridColumnStart: 2,
        gridColumnEnd: 4,
        borderTop: "1px solid #ccc",
        paddingTop: "5px",
    },
    page: current => ({
        ...mixins.clickable,
        ...(current ? {} : mixins.textLink),
        paddingLeft: "4px",
        paddingRight: "4px",
    }),
}

class UserManager extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            // map from _id => user object
            userList: null,
            totalUsers: 0,
            // userId of currently edited user or true (in new user mode)
            editUser: null,
            deleteUser: null,
            // a user object or null
            editProfile: null,
            currentPage: 0,
            pageSize: 0,
        }
        this.editUser = this.editUser.bind(this)
        this.finishEdit = this.finishEdit.bind(this)
        this.deleteUser = this.deleteUser.bind(this)
        this.askDeleteUser = this.askDeleteUser.bind(this)
        this.getAllPermissions = this.getAllPermissions.bind(this)
        this.checkPermission = this.checkPermission.bind(this)
        this.editProfile = this.editProfile.bind(this)
        this.updateProfile = this.updateProfile.bind(this)
        this.setPage = this.setPage.bind(this)

        this.userHandler = new UserHandler(this.props.apiPrefix || "/api/user/users")
    }

    componentDidMount() {
        if (!this.checkPermission()) {
            return
        }
        this.setPage(0)() // this will load the first page of users
    }

    getAllPermissions() {
        const adminPermissions = this.props.adminPermission || "admin"
        const allPermissions = this.props.permissions || []

        if (allPermissions.indexOf(adminPermissions) === -1) {
            allPermissions.push(adminPermissions)
        }
        return allPermissions
    }

    setPage(page) {
        return () => {
            this.setState({
                currentPage: page,
            })
            // fetch users and set userList state of component
            this.userHandler
                .getAllUsers(page)
                .then(response => {
                    // from list to map (for easier updates)
                    const userList = {}
                    response.users.forEach(user => {
                        userList[user._id || user.id] = user
                    })
                    this.setState(oldState => ({
                        totalUsers: response.total,
                        userList,
                        pageSize:
                            oldState.pageSize < Object.keys(userList).length
                                ? Object.keys(userList).length
                                : oldState.pageSize,
                    }))
                })
                .catch(err => {
                    console.error("error fetching users", err)
                })
        }
    }

    checkPermission() {
        const adminPermission = this.props.adminPermission || "admin"
        if (this.props.currentUser == null || this.props.currentUser.permissions.indexOf(adminPermission) === -1) {
            return false
        }
        return true
    }

    /**
     * Triggers the deletion process of a user, which will render a popup asking for confirmation to delete the user.
     * @param {string|null} userId - the id of a user or null if the operation should be cancelled.
     * @returns {function} an event handler
     */
    askDeleteUser(userId) {
        return () => {
            this.setState({
                deleteUser: userId,
            })
        }
    }

    /**
     * Directly deletes a user from the database. The user ID will be determined from the current state of the component
     * and set by the askDeleteUser method.
     */
    deleteUser() {
        const { deleteUser } = this.state
        this.userHandler.deleteUser(deleteUser).then(() => {
            // also clean the user from the local state
            this.setState(oldState => {
                const { userList } = oldState
                delete userList[deleteUser]
                return {
                    ...oldState,
                    userList,
                    totalUsers: oldState.totalUsers - 1,
                    deleteUser: null,
                    editProfile: null,
                    editUser: null,
                }
            })
        })
    }

    /**
     * Sets the userId as the current edit user.
     * @param {string|boolean} userId - can be an _id for edit or boolean (true) for new user
     * @returns {Function} an event handler for each row in the user list
     */
    editUser(userId) {
        return () => {
            this.setState(
                {
                    editUser: null,
                    editProfile: null,
                },
                () => {
                    this.setState({
                        editUser: userId,
                    })
                }
            )
        }
    }

    /**
     * Sets the user as the current edit profile user. This will open the profile manager and pass this user into it.
     * @param {object} user - a user object
     * @returns {function} an event handler that updates the state setting the editProfile
     */
    editProfile(user) {
        return () => {
            this.setState(
                {
                    editUser: null,
                    editProfile: null,
                },
                () => {
                    this.setState({
                        editProfile: user,
                    })
                }
            )
        }
    }

    updateProfile() {
        if (this.profileManager == null) {
            console.warn("No profile manager provided, can't update profile.")
            return
        }
        if (this.profileManager.getProfile == null) {
            console.warn("Your profile manager class doesn't provide a 'getProfile()' method.")
            return
        }
        const profile = this.profileManager.getProfile()
        if (profile == null) {
            console.warn("Your profile manager's 'getProfile()' method returned null.")
            return
        }
        const userId = this.state.editProfile._id || this.state.editProfile.id
        this.userHandler.updateUserProfile(userId, profile).then(updatedProfile => {
            this.setState(oldState => {
                const { userList } = oldState
                userList[userId].profile = updatedProfile.profile
                return {
                    ...oldState,
                    userList,
                    editProfile: null,
                }
            })
        })
    }

    /**
     * After the UserForm is done editing (either saving permissions or creating
     * new user), this handler will be called to integrate the new/updated user
     * into the userList of this component.
     * @param {string|object} user - the new or updated user profile, or a user's _id in case of
     * delete
     */
    finishEdit(user) {
        this.setState(oldState => {
            const { userList } = oldState
            let { totalUsers, pageSize } = oldState
            // just a user ID, for delete operation
            if (user != null) {
                if (typeof user === "string") {
                    // user deleted
                    delete userList[user]
                } else {
                    // update or new user
                    const userId = user._id || user.id
                    if (userList[userId] == null) {
                        if (pageSize === Object.keys(userList).length) {
                            pageSize += 1
                        }
                        totalUsers += 1
                    }
                    userList[userId] = user
                }
            }
            return {
                ...userList,
                pageSize,
                totalUsers,
                editUser: null,
            }
        })
    }

    render() {
        if (!this.checkPermission()) {
            return <div style={mixins.red}>You do not have access.</div>
        }
        const { userList, editUser } = this.state
        if (userList == null) {
            return <div>Loading Users</div>
        }

        const ProfileManager = this.props.profileManager
        return (
            <div>
                {this.state.editProfile != null && ProfileManager != null ? (
                    <div>
                        <div style={{ ...style.listHeader, ...style.editProfileHeader }}>
                            Updating profile of {this.state.editProfile.username || this.state.editProfile.email}
                        </div>
                        <div style={mixins.vSpacer(15)} />
                        <ProfileManager
                            user={this.state.editProfile}
                            profileManagerProps={this.props.profileManagerProps}
                            ref={el => {
                                this.profileManager = el
                            }}
                        />
                        <div style={mixins.vSpacer(15)} />
                        <div style={mixins.buttonRow}>
                            <button style={mixins.button} type="button" onClick={this.updateProfile}>
                                Update Profile
                            </button>
                            <button style={mixins.inverseButton} type="button" onClick={this.editProfile(null)}>
                                Cancel
                            </button>
                        </div>
                        <div style={mixins.vSpacer(15)} />
                    </div>
                ) : null}
                {editUser != null ? (
                    <LocalUserForm
                        user={this.state.userList[editUser]}
                        userHandler={this.userHandler}
                        permissions={this.getAllPermissions()}
                        onFinish={this.finishEdit}
                    />
                ) : null}
                <div style={style.table}>
                    <div style={style.listHeader}>Username</div>
                    <div style={style.listHeader}>Permissions</div>
                    <div style={style.listHeader}>Options</div>
                    {Object.values(userList).map(user => [
                        <div key="username">
                            {user.email || user.username}
                            {ProfileManager != null ? (
                                <span style={style.editProfile} onClick={this.editProfile(user)}>
                                    Edit Profile
                                </span>
                            ) : null}
                        </div>,
                        <div key="permission">{user.permissions.sort().join(", ")}</div>,
                        <div key="options">
                            <span onClick={this.editUser(user._id || user.id)} style={style.option}>
                                Edit
                            </span>
                            <span onClick={this.askDeleteUser(user._id || user.id)} style={style.option}>
                                Delete
                            </span>
                        </div>,
                    ])}
                    <div style={style.pagingBarStart}>Users: {this.state.totalUsers}</div>
                    <div style={style.pagingBar}>
                        {this.state.totalUsers > this.state.pageSize ? (
                            <span>
                                Page:
                                {util.range(1, Math.ceil(this.state.totalUsers / this.state.pageSize)).map(page => (
                                    <span
                                        style={style.page(this.state.currentPage === page - 1)}
                                        onClick={this.setPage(page - 1)}
                                        key={page}
                                    >
                                        {page}
                                    </span>
                                ))}
                            </span>
                        ) : null}
                    </div>

                    {this.state.deleteUser != null ? (
                        <Popup
                            title="Delete User"
                            yes={this.deleteUser}
                            no={this.askDeleteUser(null)}
                            cancel={this.askDeleteUser(null)}
                        >
                            Are you sure you want to delete this user (this action is irreversible)?
                        </Popup>
                    ) : null}
                </div>

                <div style={mixins.buttonLine}>
                    <button type="button" style={mixins.button} onClick={this.editUser("new")}>
                        Create User
                    </button>
                </div>
            </div>
        )
    }
}

export default UserManager
