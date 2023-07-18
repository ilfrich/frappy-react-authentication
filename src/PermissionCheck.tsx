import React from "react"
import { mixins } from "quick-n-dirty-react"
import { UserType } from "./shared-types"

export interface PermissionCheckProps {
    showError?: boolean,
    currentUser?: UserType,
    requiredPermissions?: string[],
    permission?: [],
    children: React.ReactNode
}

const PermissionCheck = (props: PermissionCheckProps) => {
    // determine default content (default = null)
    const noPermContent = props.showError ? <div style={mixins.red}>You do not have access.</div> : null

    // user is not logged in
    if (props.currentUser == null) {
        return noPermContent
    }

    // @deprecated requiredPermission
    const permissionProps = props.requiredPermissions || props.permission

    // no perm required, user is logged in, show content
    if (permissionProps == null) {
        return props.children
    }

    // compile required permissions
    const permissions: string[] = []

    if (typeof permissionProps === "string") {
        // single permission
        permissions.push(permissionProps)
    } else {
        // array
        permissionProps.forEach(perm => {
            permissions.push(perm)
        })
    }

    // user has no permissions
    if (props.currentUser.permissions == null && permissions.length > 0) {
        return noPermContent
    }

    // check permissions
    let hasAllPermissions = true
    permissions.forEach(perm => {
        if (props.currentUser!.permissions.indexOf(perm) === -1) {
            hasAllPermissions = false
        }
    })

    // final output depending on if the user has all required permissions
    return hasAllPermissions ? props.children : noPermContent
}

export default PermissionCheck
