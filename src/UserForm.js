import React from "react"
import { mixins } from "quick-n-dirty-react"

const style = {
    option: {
        ...mixins.textLink,
        ...mixins.clickable,
        marginRight: "10px",
    },
}

/**
 * Row element inside the user list.
 *
 * After the user presses the save button, the update user permissions endpoint
 * will be called. On successful completion, the `onFinish` handler will be
 * called with the new or updated user as payload.
 */
class UserForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            permissions: [],
            currentUsername: "",
            currentPassword: "",
        }
        this.updatePermission = this.updatePermission.bind(this)
        this.save = this.save.bind(this)
        this.cancel = this.cancel.bind(this)
    }

    componentDidMount() {
        const { user } = this.props
        if (user != null) {
            // initialise the state of this component in edit mode
            user.permissions.forEach(perm => {
                this.updatePermission(perm)()
            })
        }
    }

    /**
     * Used by the initialisation in edit mode and when selecting/deselecting
     * checkboxes for permissions. A total list of permissions will be managed
     * in the components state and used on save.
     * @param {string} permission - string representation of a permission - e.g. `READ`
     * @returns {function} event handler to toggle the provided permission
     */
    updatePermission(permission) {
        return () => {
            this.setState(oldState => {
                const { permissions } = oldState
                const index = permissions.indexOf(permission)
                if (index === -1) {
                    // not selected, add
                    permissions.push(permission)
                } else {
                    // already selected, remove
                    permissions.splice(index, 1)
                }
                return {
                    ...oldState,
                    permissions,
                }
            })
        }
    }

    // when the user presses the save icon, either update or create a user
    save() {
        const { user, onFinish } = this.props
        const { permissions } = this.state
        // update existing permissions
        this.props.userHandler
            .updatePermissions(user._id || user.id, permissions)
            .then(updatedUser => {
                // call parent handler with updated user
                onFinish(updatedUser)
            })
            .catch(err => {
                console.error("Error updating user", err)
            })
    }

    cancel() {
        const { user, onFinish } = this.props
        onFinish(user)
    }

    render() {
        const { user } = this.props
        const { permissions } = this.state
        return [
            <div key="username">{user.email || user.username}</div>,
            <div key="permissions">
                <ul style={mixins.noList}>
                    {this.props.allPermissions.map(permission => (
                        <li key={permission}>
                            <label>
                                <input
                                    type="checkbox"
                                    onChange={this.updatePermission(permission)}
                                    checked={permissions.indexOf(permission) !== -1}
                                />{" "}
                                {permission}
                            </label>
                        </li>
                    ))}
                </ul>
            </div>,
            <div key="options">
                <span style={style.option} onClick={this.save}>
                    Save
                </span>
                <span style={style.option} onClick={this.cancel}>
                    Cancel
                </span>
            </div>,
        ]
    }
}

export default UserForm
