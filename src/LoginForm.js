import React from "react"
import { mixins } from "quick-n-dirty-react"
import util from "quick-n-dirty-utils"

const style = {
    loginForm: {
        margin: "auto",
        width: "300px",
        marginTop: "150px",
        background: "#eee",
        padding: "50px",
        borderRadius: "10px",
    },
    title: {
        color: "#600",
        fontSize: "20px",
        borderBottom: "1px solid #900",
    },
    error: {
        padding: "5px",
        borderRadius: "5px",
        border: "1px solid #fcc",
        background: "#fcc",
        marginBottom: "10px",
    },
}

const errorStates = {
    invalidCredentials: "Invalid Username / Password",
    serverError: "Error during authentication",
}

class LoginForm extends React.Component {
    constructor(props) {
        super(props)
        this.performLogin = this.performLogin.bind(this)
        this.checkEnter = this.checkEnter.bind(this)

        this.state = {
            loginOutcome: null,
            loggingIn: false,
        }
    }

    componentDidMount() {
        this.username.focus()
    }

    performLogin() {
        this.setState({
            loginOutcome: null,
            loggingIn: true,
        })
        const loginPrefix = this.props.apiPrefix || "/api/user"

        fetch(`${loginPrefix}/login`, {
            method: "POST",
            headers: util.getJsonHeader(),
            body: JSON.stringify({
                username: this.username.value,
                password: this.password.value,
            }),
        })
            .then(res => {
                let outcome = null
                if (res.status === 401) {
                    // auth failed
                    outcome = errorStates.invalidCredentials
                } else if (res.status >= 400) {
                    // server error
                    outcome = errorStates.serverError
                }
                if (outcome == null) {
                    return res.json()
                }
                this.setState({
                    loginOutcome: outcome,
                    loggingIn: false,
                })
                return null
            })
            .then(loginResponse => {
                if (loginResponse == null) {
                    // already handled
                    return
                }
                // set user token in sessionStorage
                util.setAuthToken(loginResponse.token)
                // return user object to parent
                this.props.setUser(loginResponse.user)
            })
            .catch(() => {
                this.setState({
                    loggingIn: false,
                })
            })
    }

    checkEnter(e) {
        // if it's enter, attempt log in
        if (e.which === 13) {
            this.performLogin()
        }
    }

    render() {
        const effectiveMixins = this.props.mixins || mixins
        const titleStyle = this.props.titleStyle || style.title
        return (
            <div style={style.loginForm}>
                <h3 style={titleStyle}>Login</h3>
                {this.state.loginOutcome != null ? <div style={style.error}>{this.state.loginOutcome}</div> : null}
                <div>
                    <input
                        type="text"
                        style={effectiveMixins.textInput}
                        ref={e => {
                            this.username = e
                        }}
                        placeholder="Username"
                    />
                    <input
                        type="password"
                        style={effectiveMixins.textInput}
                        ref={e => {
                            this.password = e
                        }}
                        onKeyPress={this.checkEnter}
                        placeholder="Password"
                    />
                </div>
                <div style={effectiveMixins.buttonLine}>
                    {this.state.loggingIn === true ? (
                        <button type="button" style={effectiveMixins.inverseButton}>
                            Authenticating ...
                        </button>
                    ) : (
                        <button type="button" style={effectiveMixins.button} onClick={this.performLogin}>
                            Login
                        </button>
                    )}
                </div>
            </div>
        )
    }
}

export default LoginForm
