import React from "react"
import util from "quick-n-dirty-utils"

const style = {
    clickable: {
        cursor: "pointer",
        display: "inline-block",
    },
}

class Logout extends React.Component {
    constructor(props) {
        super(props)
        this.logout = this.logout.bind(this)
    }

    logout() {
        const apiPrefix = this.props.apiPrefix || "/api/user"
        fetch(`${apiPrefix}/login`, {
            method: "DELETE",
            headers: util.getAuthJsonHeader(),
        }).then(() => {
            // delete session storage token
            util.logout()

            // reload page to render login form again
            if (this.props.redirect != null) {
                location.href = this.props.redirect
            } else {
                location.reload()
            }
            
        })
    }

    render() {
        return (
            <div onClick={this.logout} style={style.clickable}>
                {this.props.children}
            </div>
        )
    }
}

export default Logout
