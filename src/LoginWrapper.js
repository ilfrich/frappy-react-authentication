import React from "react"
import LoginForm from "./LoginForm"
import LoginCheck from "./LoginCheck"

class LoginWrapper extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            currentUser: null,
            firstCheckDone: false,
        }

        this.setUser = this.setUser.bind(this)
    }

    setUser(user) {
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
