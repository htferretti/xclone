type StorageKey = 'access' | 'refresh' | 'username' | 'profile_picture'

export const getItem = (key: StorageKey): string | null => {
    try {
        return localStorage.getItem(key)
    } catch (err) {
        console.error('Failed to read localStorage', err)
        return null
    }
}

export const setItem = (key: StorageKey, value: string) => {
    try {
        localStorage.setItem(key, value)
    } catch (err) {
        console.error('Failed to write localStorage', err)
    }
}

export const removeItem = (key: StorageKey) => {
    try {
        localStorage.removeItem(key)
    } catch (err) {
        console.error('Failed to remove localStorage key', err)
    }
}

export const clearAuthStorage = () => {
    ;(['access', 'refresh', 'username', 'profile_picture'] as StorageKey[]).forEach(removeItem)
}
