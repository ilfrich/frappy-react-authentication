import React from "react"
import { mixins, NotificationBar } from "quick-n-dirty-react"
import { util } from "quick-n-dirty-utils"
import { UserType } from "./shared-types"

const style = {
    form: {
        margin: "auto",
        width: "300px",
        background: "#eee",
        padding: "50px",
        borderRadius: "10px",
    },
    title: {
        color: "#600",
        fontSize: "20px",
        borderBottom: "1px solid #900",
    },
}

export interface ChangePasswordProps {
    apiPrefix?: string,
    currentUser: UserType,
    mixins: {
        [key in string]: React.CSSProperties
    }
    titleStyle?: React.CSSProperties,
}
interface ChangePasswordState {
    passwordChanged: boolean,
}

class ChangePassword extends React.Component<ChangePasswordProps, ChangePasswordState> {

    private oldPassword = React.createRef<HTMLInputElement>()
    private newPassword1 = React.createRef<HTMLInputElement>()
    private newPassword2 = React.createRef<HTMLInputElement>()
    private alert = React.createRef<NotificationBar>()

    constructor(props: ChangePasswordProps) {
        super(props)
        this.state = {
            passwordChanged: false,
        }
        this.changePassword = this.changePassword.bind(this)
    }

    changePassword() {
        const endpoint = `${this.props.apiPrefix || "/api/user"}/password`
        if (this.newPassword1.current!.value !== this.newPassword2.current!.value) {
            this.alert.current!.error("New passwords don't match!")
            this.newPassword1.current!.value = ""
            this.newPassword2.current!.value = ""
            return
        }

        if (this.oldPassword.current!.value === this.newPassword1.current!.value) {
            this.alert.current!.error("New and old password are the same!")
            return
        }

        fetch(endpoint, {
            method: "POST",
            headers: util.getAuthJsonHeader(),
            body: JSON.stringify({
                oldPassword: this.oldPassword.current!.value,
                newPassword: this.newPassword1.current!.value,
            }),
        })
            .then(res => {
                if (res.status === 403) {
                    // old password didn't match
                    this.alert.current!.error("Old password is incorrect!")
                    this.oldPassword.current!.value = ""
                    return null
                }

                return util.restHandler(res)
            })
            .then(response => {
                if (response != null) {
                    // success
                    this.alert.current!.success("Password changed.")
                    this.setState({
                        passwordChanged: true,
                    })
                }
            })
    }

    render() {
        if (this.props.currentUser == null) {
            return null
        }

        const effectiveMixins = this.props.mixins || mixins
        const titleStyle = this.props.titleStyle || {}

        return (
            <div style={style.form}>
                <NotificationBar
                    ref={this.alert}
                />
                <h3 style={{ ...style.title, ...titleStyle }}>Change Password</h3>
                {this.state.passwordChanged ? (
                    <div>Password changed</div>
                ) : (
                    <div>
                        <label style={effectiveMixins.label} htmlFor="oldpw">
                            Old Password
                        </label>
                        <input
                            type="password"
                            style={effectiveMixins.textInput}
                            ref={this.oldPassword}
                            id="oldpw"
                        />

                        <label style={effectiveMixins.label} htmlFor="newpw1">
                            New Password
                        </label>
                        <input
                            type="password"
                            style={effectiveMixins.textInput}
                            ref={this.newPassword1}
                            id="newpw1"
                        />

                        <label style={effectiveMixins.label} htmlFor="newpw2">
                            Repeat New Password
                        </label>
                        <input
                            type="password"
                            style={effectiveMixins.textInput}
                            ref={this.newPassword2}
                            id="newpw2"
                        />

                        <div style={effectiveMixins.buttonLine}>
                            <button style={effectiveMixins.button} onClick={this.changePassword} type="button">
                                Change Password
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )
    }
}

export default ChangePassword
