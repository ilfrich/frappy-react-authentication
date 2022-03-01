# React Authentication Module

React Pages and Components to Facilitate Authentication and User Management

1. [Login and Authentication](#login-and-authentication)
    1. [Login-Protected Page Section](#login-protected-page-section)
    2. [Login Form Only](#login-form-only)
    3. [Logout](#logout)
    4. [Change Password](#change-password)
2. [Login and Permission Check](#permission-and-login-check)
    1. [Permission Check](#permission-check)
    2. [Login Check](#login-check)
3. [User Management](#user-management)
    1. [User Profiles](#user-profiles)
4. [API Keys](#api-keys)
5. [API Endpoints](#api-endpoints)
    1. [UserHandler](#userhandler)

This package is a counterpart to the following server-side packages and uses the endpoints provided by those packages:

- [`@frappy/node-authentication`](https://github.com/ilfrich/frappy-node-authentication) (NodeJS)
- [`frappyflaskauth`](https://github.com/ilfrich/frappy-flask-authentication) (Python)

## Login and Authentication

### Login-Protected Page Section 

Simply wrap your application entry point in the `LoginWrapper` component provided by this package.
This will perform an authentication check to the API and if successful render the `children` of the component. If the 
authentication check fails, the login form will be rendered.

```javascript
import React from "react"
import { LoginWrapper } from "@frappy/react-authentication"

class MyPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            currentUser: null,
        }
        this.receiveUser = this.receiveUser.bind(this)    
    }
    
    receiveUser(user) {
        this.setState({
            currentUser: user,
        })
    }   

    render() {
        return (
            <LoginWrapper setUser={this.receiveUser}>
                <div>Put your app content / component here</div>
            </LoginWrapper>
        )
    }
}

render(<MyPage/>, document.getElementById("root"))
```

You can obviously put the `LoginWrapper` at any level of your application (e.g. to just protect certain areas).

**Properties**

- `setUser` - default `null` - function to receive the logged in user, either after the initial auth check, if the user
 is already authenticated or after successful login
- `apiPrefix` - default `/api/user` - endpoint used for authentication check and login (login endpoint uses
 `${apiPrefix}/login`)
 - `mixins` - default [`quick-n-dirty-react/mixins`](https://github.com/ilfrich/quick-n-dirty-react#css-mixins) - mixins
 user to style the `textInput`, form `label` and `button`.
- `titleStyle` - default to red, bold title font - an override for the style of the form title "Login"
 
### Login Form Only
 
If you only need authentication for specific areas, you can simply use the `LoginForm` itself and embed it into your 
page:

```javascript
import React from "react"
import { LoginForm } from "@frappy/react-authentication"

class MyPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentUser: null
        }       
        this.setUser = this.setUser.bind(this)
    }
    
    setUser(user) {
        this.setState({
            currentUser: user,
        })
    }   

    render() {
        return (
            <div>
                <LoginForm setUser={this.setUser} apiPrefix="/api/user" />
            </div>        
        )            
    }   
}
```

**Properties**

- `setUser` - a function to handle the incoming user object, if authentication is successful
- `apiPrefix` - default `/api/user` - the prefix for the `/login` endpoint, default will result in 
 `POST /api/user/login`
 - `mixins` - default [`quick-n-dirty-react/mixins`](https://github.com/ilfrich/quick-n-dirty-react#css-mixins) - mixins
 user to style the `textInput`, form `label` and `button`.
- `titleStyle` - default to red, bold title font - an override for the style of the form title "Login"
 
### Logout

This package also provides a logout component, which facilitates the log out. The content (e.g. an icon or text) needs
to be provided by you. A click on it will call the logout endpoint, delete the browser session token and reload the 
page:

```javascript
import React from "react"
import { Logout } from "@frappy/react-authentication"

const Header = props => (
    <div>
        <Logout>Log me out</Logout>
    </div>
)
```

**Properties**

- `apiPrefix` - default `/api/user` - will result in logout REST call: `DELETE /api/user/login`
- `redirect` - defaults to current URL - will redirect to the provided URL after logout.

### Change Password

The package provides a simple change password form, where the user needs to provide the current password and 
set the new password (twice for confirmation and to avoid typos). The component ties into the change password
endpoints provided by `frappyflaskauth` (Python) or `@frappy/node-authentication` (Node).

```javascript
import React from "react"
import { ChangePassword } from "@frappy/react-authentication"

const UserManagementPage = props => (
    <div>
        <ChangePassword currentUser={props.currentUser} />
    </div>
)
```

**Properties**

- `currentUser` - the currently logged in user (as provided by the `LoginForm` or `LoginWrapper`)
- `apiPrefix` - default `/api/user` - the prefix for the change password API call
- `mixins` - default [`quick-n-dirty-react/mixins`](https://github.com/ilfrich/quick-n-dirty-react#css-mixins) - mixins
 user to style the `textInput`, form `label` and `button`.
- `titleStyle` - default to red, bold title font - an override for the style of the form title "Change Password"

## Permission and Login Check

### Permission Check

If you have a section of the page that requires special permissions, you can protect it like this:

```javascript
import React from "react"
import { PermissionCheck } from "@frappy/react-authentication"

const MyProtectedComponent = props => (
    <PermissionCheck currentUser={props.currentUser} requiredPermissions="control" showError>
        <div>Protected content that is only shown, if the user has "control" permission</div>
    </PermissionCheck>
)
```

**Properties**

- `currentUser` - the currently logged in user (permission check checks the `currentUser.permissions` array)
- `requiredPermissions` - default `null` - there are 3 ways to configure this: 
    - if you omit the parameter, the user simply has to be authenticated (`currentUser` is not `null`)
    - you can provide a single required permission as a string or
    - you can provide multiple permissions as array
- `showError` - default `false` - if the user fails the permission / login check an error message will be shown 
 informing the user that they do not have access to the content.

### Login Check
 
The `LoginCheck` can also be used standalone to use an existing auth token (stored in the browser's `sessionStorage`) to
check whether that auth token is valid and fetch the associated user from the API.

The usage is equivalent to the usage of the `LoginForm` (see [Login Form Only](#login-form-only)):

```javascript
import { LoginCheck } from "@frappy/react-authentication"

class MyComponent extends React.Component {
    ...
    render() {
        return (
            <div>
                <LoginCheck setUser={this.setUser} />
                Some more content that is displayed regardless of login check success.
            </div>
        )
          
    } 
}
```

The `setUser` method will receive `null`, if the user is not logged in (no auth token in `browserStorage` or auth token 
 invalid / expired)
 
**Properties**

- `setUser` - handler for receiving logged in user or null after the check is completed
- `apiPrefix` - default `/api/user` - endpoint to check for the auth status

## User Management

The `UserManager` can directly be embedded into your Router declarations. The component will check the user permissions.
The `currentUser` is the user received from the `LoginWrapper` and can provide a `permissions` array with desired
administrative permission (see properties below for details)

```javascript
import React from "react"
import { Switch, Route } from "react-route"
import { UserManager } from "@frappy/react-authentication"

const RouterComponent = props => (
    <Switch>
        <Route path="/admin/users" exact component={() => <UserManager currentUser={props.currentUser}/>} />
        ... other routes
    </Switch>
)
```

**Properties**

- `currentUser` - required - a user object containing a `permissions` array with the admin permission. The component 
 will only be rendered, if the admin permission is available
- `adminPermission` - default `admin` - required permission (see above) to render the component. If the permission is
 not available within the `currentUser.permissions`, an error message about missing permissions will be returned.
- `apiPrefix` - default `/api/user/users` - base endpoint for all user management operations. Administrative endpoints 
 will effectively be: `/api/user/users` to retrieve users, and `/api/user/users/:userId` for user specific operations.
- `permissions` - default `[]` - list of other permissions (beside the admin permission) that will be available in the 
 system
- `profileManager` - default `null` - see [User Profiles](#user-profiles)

### User Profiles

You can integrate a profile manager into the `UserManager` by providing a React component class as property 
 `profileManager`.
 
**Example of integration:**

```javascript
import MyCustomReactComponent from "./MyCustomReactComponent"

...
<UserManager ... profileManager={MyCustomReactComponent} profileManagerProps={{ 
    some: {
        custom: "parameters",
        or: "payload",
    },
}} />
...
```

Additional properties can be passed in using the property `profileManagerProps`, which will be handed down to your 
 custom class as `profileManagerProps`.
 
**Example of custom profile manager**

```
import React from "react"

class MyCustomReactComponent extends React.Component {
    getProfile() {
        return {
            name: this.formElement.value
        }   
    }   

    render() {
        console.log("Profile manager properties passed in from the user manager", this.props.profileManagerProps)
        return (
            <div><input type="text" ref={el => { this.formElement = el }} defaultValue={this.props.user.profile.name} /></div>
        )        
    }
}
```

You can render any content in the `render` method, where you can use `this.props.user` to access the user to be edited.
 Additionally, your class must provide a `getProfile` method, which returns a JSON object. This is used by the user 
 manager to extract the profile information from the form.

In the example above, if we have a user, with `user.profile.name = "frappy"`, the form would show a text input with 
 "frappy" as default value. If you change it to "foobar" and press "save", the `getProfile` method would return 
 `{ name: "foobar" }` which would be used as new `user.profile`, so that `user.profile.name = "foobar"`. 

## API Keys

Frappy also supports API keys, which can be used to authenticate against endpoints using a permanent non-expiring API 
 key. This requires the server-side to enable API keys (Node: `apiKeys: true`, Python: `api_keys: True` to pass in as 
 option for the user endpoint registration).

To manage and fetch the API key on an individual user basis, you can use the `<ApiKeyForm />` React component and make
 it accessible for each logged in user. This form allows the user to create or revoke an API key or fetch it to be used
 in a program.
 
```javascript
import React from "react"
import { Switch, Route } from "react-route"
import { ApiKeyForm } from "@frappy/react-authentication"

const RouterComponent = props => (
    <Switch>
        <Route path="/user/api-key" exact component={() => <ApiKeyForm currentUser={props.currentUser}/>} />
        ... other routes
    </Switch>
)
```

**Properties**

- `currentUser` - required - a user object for which the API key will be managed.
- `mixins` - default [`quick-n-dirty-react/mixins`](https://github.com/ilfrich/quick-n-dirty-react#css-mixins) - mixins
 user to style the `textInput`, form `label` and `button`.
- `titleStyle` - default to red, bold title font - an override for the style of the form title "API Key"

## API Endpoints

The following assumes the default prefix `/api/user`. URL parameter are prefixed with `:`

- GET `/api/user` - authentication check
- POST `/api/user/login` - performs authentication check with `username` and `password` in the body
- DELETE `/api/user/login`

**User Management Endpoints**

- POST `/api/user/users/:userId/permissions` - updates the user's permissions with `permissions` array in the body.
- DELETE `/api/user/users/:userId` - deletes the given user
- POST `/api/user/users` - creates a new local user, with `username`, `password` and `permissions` in the body.
- POST `/api/user/users/:userId/profile` - updates the user's profile with the provided body (full JSON body will be 
 used)
 
### UserHandler
 
Administrative functions can be performed using the `UserHandler` helper class:

```javascript
import { UserHandler } from "@frappy/react-authentication"

const handler = new UserHandler()  // allows for one parameter for apiPrefix - default: "/api/user/users"
handler.updatePermissions(userId, ["admin", "view"]).then(updatedUser => {
    console.log("Updated user with new permissions:", updatedUser)
})
handler.updateUserProfile(userId, { foo: "bar" }).then(updatedUser => { ... })
```

**Methods**

- `updateUserProfile(userId, profile)` - to update a user profile, returns the updated user when the promise resolves.
- `deleteUser(userId)` - purges a user from the database
- `getAllUsers(page)` - returns a list of all users when the promise resolves (requested page given servers page size)
- `updatePermissions(userId, permissions)` - sets new permissions for the provided user and returns the updated user 
 when the promise resolves. 
- `createUserRequest(newUser)` - runs a request for creating a new user and returns the promise with the response object
- `createUser(newUser)` - calls `createUserRequest` and also handles the REST response, in case no special error 
 handling is needed.
- `updateUserPassword` - updates *another* user's password, requires admin privileges on the server-side.
