import React from "react"
import { mixins } from "quick-n-dirty-react"
import UserForm from "./UserForm"

const style = {
    grid: {
        display: "grid",
        gridTemplateColumns: "465px 465px",
        gridColumnGap: "20px",
        gridRowGap: "10px", // extra 10 pixels additionally to the buttonLine
        paddingBottom: "15px", // spacing to list header
    },
}

class LocalUserForm extends UserForm {
    constructor(props) {
        super(props)
        this.updatePassword = this.updatePassword.bind(this)
        this.updatePermission = this.updatePermission.bind(this)
        this.save = this.save.bind(this)
    }

    componentDidMount() {
        if (this.props.user != null) {
            this.setState({
                permissions: this.props.user.permissions,
            })
        }
    }

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

    updatePassword() {
        this.props.userHandler
            .updateUserPassword(this.props.user._id || this.props.user.id, this.password.value)
            .then(updatedUser => {
                this.props.onFinish(updatedUser)
            })
            .catch(() => {
                console.log("Error updating user's password")
            })
    }

    save() {
        if (this.props.user) {
            // update permissions of user
            super.save()
        } else {
            // create new user
            const newUser = {
                username: this.username.value,
                password: this.password.value,
                permissions: this.state.permissions,
            }
            this.props.userHandler
                .createUser(newUser)
                .then(createdUser => {
                    this.props.onFinish(createdUser)
                })
                .catch(() => {
                    console.log("Error creating user")
                })
        }
    }

    render() {
        return (
            <div style={style.grid}>
                <div>
                    {this.props.user == null ? (
                        <div>
                            <label style={mixins.label} htmlFor="username">
                                Username
                            </label>
                            <input
                                type="text"
                                style={mixins.textInput}
                                ref={el => {
                                    this.username = el
                                }}
                                id="username"
                            />

                            <label style={mixins.label} htmlFor="password">
                                Password
                            </label>
                            <input
                                type="password"
                                style={mixins.textInput}
                                ref={el => {
                                    this.password = el
                                }}
                                id="password"
                            />
                        </div>
                    ) : null}
                    <label style={mixins.label}>Permissions</label>
                    <ul style={mixins.noList}>
                        {this.props.permissions.map(perm => (
                            <li key={perm}>
                                <label>
                                    <input
                                        type="checkbox"
                                        onChange={this.updatePermission(perm)}
                                        checked={this.state.permissions.indexOf(perm) !== -1}
                                    />{" "}
                                    {perm}
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
                {this.props.user != null ? (
                    <div>
                        <div>
                            <label style={mixins.label} htmlFor="new-password">
                                New Password
                            </label>
                            <input
                                type="password"
                                style={mixins.textInput}
                                ref={el => {
                                    this.password = el
                                }}
                                id="new-password"
                            />
                        </div>
                    </div>
                ) : (
                    <div />
                )}
                <div style={mixins.buttonLine}>
                    <button style={mixins.button} type="button" onClick={this.save}>
                        {this.props.user == null ? "Create" : "Update Permissions"}
                    </button>
                    <button style={mixins.inverseButton} type="button" onClick={this.cancel}>
                        Cancel
                    </button>
                </div>
                {this.props.user != null ? (
                    <div style={mixins.buttonLine}>
                        <button style={mixins.button} type="button" onClick={this.updatePassword}>
                            Update Password
                        </button>
                    </div>
                ) : null}
            </div>
        )
    }
}

export default LocalUserForm
