import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react"

import api from "../api"
import { DEFAULT_PROFILE_PICTURE } from "../constants"
import { User } from "../types"
import { resolveProfilePicture } from "../utils/profile"
import { clearAuthStorage, getItem, setItem } from "../utils/storage"

type AuthContextValue = {
    user: User | null
    profilePicture: string
    isAuthenticated: boolean
    loading: boolean
    login: (username: string, password: string) => Promise<boolean>
    register: (payload: RegisterPayload) => Promise<boolean>
    refreshUser: () => Promise<void>
    logout: () => void
}

type RegisterPayload = {
    username: string
    email: string
    cpf: string
    password: string
    password_confirm: string
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [profilePicture, setProfilePicture] = useState<string>(getItem("profile_picture") || DEFAULT_PROFILE_PICTURE)
    const [loading, setLoading] = useState(true)

    const setSession = useCallback((access: string, refresh: string, userData: User) => {
        setItem("access", access)
        setItem("refresh", refresh)
        if (userData.username) setItem("username", userData.username)
        const picUrl = resolveProfilePicture(userData.profile?.profile_picture)
        setItem("profile_picture", picUrl)
        setUser(userData)
        setProfilePicture(picUrl)
    }, [])

    const logout = useCallback(() => {
        clearAuthStorage()
        setUser(null)
        setProfilePicture(DEFAULT_PROFILE_PICTURE)
    }, [])

    const refreshUser = useCallback(async () => {
        const token = getItem("access")
        if (!token) {
            setUser(null)
            setProfilePicture(DEFAULT_PROFILE_PICTURE)
            setLoading(false)
            return
        }

        try {
            const res = await api.get("accounts/auth/me/")
            const fetchedUser: User = res.data
            setUser(fetchedUser)
            const picUrl = resolveProfilePicture(fetchedUser.profile?.profile_picture)
            setProfilePicture(picUrl)
            setItem("profile_picture", picUrl)
            setItem("username", fetchedUser.username)
        } catch (err) {
            logout()
        } finally {
            setLoading(false)
        }
    }, [logout])

    useEffect(() => {
        refreshUser()
    }, [refreshUser])

    const login = useCallback(async (username: string, password: string) => {
        try {
            const res = await api.post("accounts/auth/login/", { username, password })
            setSession(res.data.access, res.data.refresh, res.data.user)
            return true
        } catch (err) {
            logout()
            return false
        }
    }, [logout, setSession])

    const register = useCallback(async (payload: RegisterPayload) => {
        try {
            const res = await api.post("accounts/auth/register/", payload)
            setSession(res.data.access, res.data.refresh, res.data.user)
            return true
        } catch (err) {
            logout()
            throw err
        }
    }, [logout, setSession])

    const value = useMemo<AuthContextValue>(() => ({
        user,
        profilePicture,
        isAuthenticated: Boolean(user),
        loading,
        login,
        register,
        refreshUser,
        logout
    }), [user, profilePicture, loading, login, register, refreshUser, logout])

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
    return ctx
}

export default AuthProvider
