import { DEFAULT_PROFILE_PICTURE } from "../constants"

export const resolveProfilePicture = (url?: string | null) => {
    if (url && url.trim().length > 0) return url
    return DEFAULT_PROFILE_PICTURE
}
