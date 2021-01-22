const LoginWrapper = require("./dist/LoginWrapper")
const Logout = require("./dist/Logout")
const UserManager = require("./dist/UserManager")
const PermissionCheck = require("./dist/PermissionCheck")
const LoginCheck = require("./dist/LoginCheck")
const LoginForm = require("./dist/LoginForm")
const ChangePassword = require("./dist/ChangePassword")
const ApiKeyForm = require("./dist/ApiKeyForm")
const ProfileManager = require("./dist/ProfileManager")
const UserHandler = require("./dist/UserHandler")

module.exports = {
    LoginWrapper: LoginWrapper.default,
    Logout: Logout.default,
    UserManager: UserManager.default,
    PermissionCheck: PermissionCheck.default,
    LoginForm: LoginForm.default,
    LoginCheck: LoginCheck.default,
    ChangePassword: ChangePassword.default,
    ApiKeyForm: ApiKeyForm.default,
    ProfileManager: ProfileManager.default,
    UserHandler: UserHandler.default,
}
