
export type UserType = {
    _id?: string,
    id?: string,
    apiKey?: string,
    permissions: string[],
    username?: string,
    password?: string,
    email?: string,
    profile?: UserProfileType,
}

export type UserProfileType = {
    [key in string]: any
}
