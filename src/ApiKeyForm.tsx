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
    deleteButton: {
        ...mixins.button,
        background: "#600",
        borderColor: "#600",
        marginLeft: "15px",
    },
    title: {
        color: "#600",
        fontSize: "20px",
        borderBottom: "1px solid #900",
    },
}

export interface ApiKeyFormProps {
    currentUser: UserType,
    apiPrefix?: string,
    mixins?: {
        [key in string]: React.CSSProperties
    },
    titleStyle?: React.CSSProperties,
}

interface ApiKeyFormState {
    currentKey: string,
}
interface NewKeyResponseType extends Response {
    apiKey: string,
}

class ApiKeyForm extends React.Component<ApiKeyFormProps, ApiKeyFormState> {

    private alert = React.createRef<NotificationBar>()

    constructor(props: ApiKeyFormProps) {
        super(props)
        this.state = {
            currentKey: "",
        }
        this.regenerate = this.regenerate.bind(this)
        this.revoke = this.revoke.bind(this)
        this.copyKey = this.copyKey.bind(this)
    }

    componentDidMount() {
        if (this.props.currentUser != null) {
            this.setState({
                currentKey: this.props.currentUser.apiKey || "",
            })
        }
    }

    copyKey() {
        // copy string
        const el = document.createElement("textarea")
        el.value = this.state.currentKey
        document.body.appendChild(el)
        el.select()
        document.execCommand("copy")
        document.body.removeChild(el)
        this.alert.current!.success("Key copied to clipboard.")
    }

    regenerate() {
        fetch(`${this.props.apiPrefix || "/api/user"}/key`, {
            headers: util.getAuthJsonHeader(),
            method: "POST",
        })
            .then(util.restHandler)
            .then(responseData => {
                this.alert.current!.success("New API key generated.")
                this.setState({
                    currentKey: (responseData as NewKeyResponseType).apiKey,
                })
            })
            .catch(() => {
                this.alert.current!.error("Error generating key.")
            })
    }

    revoke() {
        fetch(`${this.props.apiPrefix || "/api/user"}/key`, {
            method: "DELETE",
            headers: util.getAuthJsonHeader(),
        })
            .then(response => {
                this.alert.current!.success("Key Revoked")
                this.setState({
                    currentKey: "",
                })
            })
            .catch(() => {
                this.alert.current!.error("Error revoking key.")
            })
    }

    render() {
        const effectiveMixins = this.props.mixins || mixins
        const titleStyle = this.props.titleStyle || style.title

        return (
            <div style={style.form}>
                <NotificationBar ref={this.alert} />
                <h3 style={titleStyle}>API Key</h3>
                <input type="text" disabled defaultValue={this.state.currentKey} style={effectiveMixins.textInput} />
                {this.state.currentKey != null ? (
                    <div style={mixins.right}>
                        <span style={effectiveMixins.textLink} onClick={this.copyKey}>
                            Copy
                        </span>
                    </div>
                ) : null}
                <div style={effectiveMixins.buttonLine}>
                    <button type="button" style={effectiveMixins.button} onClick={this.regenerate}>
                        Create New Key
                    </button>
                    <button type="button" style={style.deleteButton} onClick={this.revoke}>
                        Revoke Key
                    </button>
                </div>
            </div>
        )
    }
}

export default ApiKeyForm
