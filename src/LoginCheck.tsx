import React from "react"
import { util } from "quick-n-dirty-utils"
import { UserType } from "./shared-types"

const loginStates = {
    noToken: 0,
    invalidToken: 1,
    loggedIn: 2,
}

const style = {
    authMessage: {
        margin: "auto",
        marginTop: "200px",
        marginLeft: "40%",
        textAlign: "center" as const,
        width: "10%",
        fontSize: "24px",
        color: "#eee",
        position: "static" as const,
    },
}

export interface LoginCheckProps {
    apiPrefix?: string,
    setUser: (user: UserType | null) => void
}
interface LoginCheckState {
    firstCheckDone: boolean
}

class LoginCheck extends React.Component<LoginCheckProps, LoginCheckState> {

    private abort: boolean = false
    
    constructor(props: LoginCheckProps) {
        super(props)
        this.state = {
            firstCheckDone: false,
        }

        this.finish = this.finish.bind(this)
    }

    componentDidMount() {
        // perform login check
        const authHeader = util.getAuthJsonHeader()
        if (authHeader.Authorization == null) {
            // no auth token available, not logged in
            this.finish(null)
            return
        }

        const loginCheckEndpoint = this.props.apiPrefix || "/api/user"

        // check auth status and fetch user
        fetch(loginCheckEndpoint, {
            headers: authHeader,
        })
            .then(res => {
                if (res.status === 401) {
                    return {
                        loginState: loginStates.invalidToken,
                        user: null,
                    }
                }
                return res.json()
            })
            .then(response => {
                if (response.loginState != null) {
                    return response
                }
                return {
                    loginState: loginStates.loggedIn,
                    user: response,
                }
            })
            .then(loginOutcome => {
                this.finish(loginOutcome.user)
            })
    }

    componentWillUnmount() {
        this.abort = true
    }

    finish(user: UserType | null) {
        if (this.abort === false) {
            this.abort = true
            this.setState({
                firstCheckDone: true,
            })
            this.props.setUser(user)
        }
    }

    render() {
        if (this.state.firstCheckDone === false) {
            return <div style={style.authMessage}>Authenticating...</div>
        }
        return null
    }
}

export default LoginCheck
