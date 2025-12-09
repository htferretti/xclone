import { useCallback, useEffect, useState } from "react"

import api from "../api"
import { DEFAULT_PROFILE_PICTURE } from "../constants"
import { User } from "../types"
import { resolveProfilePicture } from "../utils/profile"

type ProfileResult = {
    profileUser: User | null
    isFollowing: boolean
    profilePictureUrl: string
    loading: boolean
    error: string | null
    refetch: () => Promise<void>
    setProfileUser: React.Dispatch<React.SetStateAction<User | null>>
    setIsFollowing: React.Dispatch<React.SetStateAction<boolean>>
}

const useProfileData = (username?: string, isOwner?: boolean): ProfileResult => {
    const [profileUser, setProfileUser] = useState<User | null>(null)
    const [isFollowing, setIsFollowing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchProfile = useCallback(async () => {
        if (!username && !isOwner) return
        setLoading(true)
        setError(null)
        try {
            const endpoint = isOwner ? "accounts/auth/me/" : `accounts/auth/profile/?username=${username}`
            const response = await api.get<User>(endpoint)
            const data = response.data
            setProfileUser(data)
            setIsFollowing(Boolean((data as any).is_following))
        } catch (err: any) {
            // If owner fails (token expired), fallback to public endpoint when username exists
            if (isOwner && username && err?.response?.status === 401) {
                try {
                    const publicResponse = await api.get<User>(`accounts/auth/profile/?username=${username}`)
                    const data = publicResponse.data
                    setProfileUser(data)
                    setIsFollowing(Boolean((data as any).is_following))
                } catch (fallbackErr: any) {
                    setError(fallbackErr?.response?.data?.detail || "Erro ao carregar perfil")
                    setProfileUser(null)
                }
            } else {
                setError(err?.response?.data?.detail || "Erro ao carregar perfil")
                setProfileUser(null)
            }
        } finally {
            setLoading(false)
        }
    }, [isOwner, username])

    useEffect(() => {
        fetchProfile()
    }, [fetchProfile])

    const profilePictureUrl = resolveProfilePicture(profileUser?.profile?.profile_picture) || DEFAULT_PROFILE_PICTURE

    return {
        profileUser,
        isFollowing,
        profilePictureUrl,
        loading,
        error,
        refetch: fetchProfile,
        setProfileUser,
        setIsFollowing
    }
}

export default useProfileData
