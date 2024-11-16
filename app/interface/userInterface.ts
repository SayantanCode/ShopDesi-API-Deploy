export default interface Iuser {
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
    phone: string,
    address: string,
    avatar: string,
    role: string,
    isVerified: boolean,
    isDeleted: boolean,
    isActive: boolean
}