import { DEFAULT_PROFILE_PICTURE } from "../constants"

export const resolveProfilePicture = (url?: string | null) => {
    // Return the URL if it's valid (not null, undefined, or empty string)
    if (url && url.trim().length > 0) {
        return url
    }
    // Otherwise return the default SVG placeholder
    return DEFAULT_PROFILE_PICTURE
}
