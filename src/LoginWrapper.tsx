import React from "react"
import LoginForm from "./LoginForm"
import LoginCheck from "./LoginCheck"
import { UserType } from "./shared-types"

export interface LoginWrapperProps {
    setUser: (user: UserType | null) => void,
    apiPrefix?: string,
    mixins: {
        [key in string]: React.CSSProperties
    },
    children: React.ReactNode,
}
interface LoginWrapperState {
    currentUser?: UserType | null,
    firstCheckDone: boolean,
}

class LoginWrapper extends React.Component<LoginWrapperProps, LoginWrapperState> {
    constructor(props: LoginWrapperProps) {
        super(props)
        this.state = {
            currentUser: null,
            firstCheckDone: false,
        }

        this.setUser = this.setUser.bind(this)
    }

    setUser(user: UserType | null) {
        // notify parent
        if (this.props.setUser != null && typeof this.props.setUser === "function") {
            this.props.setUser(user)
        }
        this.setState({
            currentUser: user,
            firstCheckDone: true,
        })
    }

    render() {
        const apiPrefix = this.props.apiPrefix || "/api/user"
        if (this.state.firstCheckDone === false) {
            return <div><LoginCheck setUser={this.setUser} apiPrefix={apiPrefix} /></div>
        }

        if (this.state.currentUser == null) {
            return (
                <div>
                    <LoginForm setUser={this.setUser} apiPrefix={apiPrefix} mixins={this.props.mixins} titleStyle={this.props.titleStyle} />
                </div>
            )
        }

        return <div>{this.props.children}</div>
    }
}

export default LoginWrapper
