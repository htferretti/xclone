import axios from "axios"

import { clearAuthStorage, getItem, setItem } from "./utils/storage"

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api/"
const TOKEN_REFRESH_URL = `${API_URL.replace('/api/', '')}/api/token/refresh/`

const api = axios.create({
    baseURL: API_URL,
})

let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })
    failedQueue = []
}

// Add JWT token to requests EXCEPT login/register endpoints
api.interceptors.request.use((config) => {
    const token = getItem("access")
    
    // Don't add token to login/register endpoints (they are AllowAny)
    const url = config.url || ""
    const isAuthEndpoint = url.includes("accounts/auth/login/") || url.includes("accounts/auth/register/")
    
    if (token && !isAuthEndpoint) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Handle 401 errors (unauthorized/expired token) with automatic refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`
                    return api(originalRequest)
                }).catch(err => Promise.reject(err))
            }

            originalRequest._retry = true
            isRefreshing = true

            const refreshToken = getItem("refresh")
            if (!refreshToken) {
                clearAuthStorage()
                isRefreshing = false
                return Promise.reject(error)
            }

            try {
                // Try to refresh the access token
                const response = await axios.post(TOKEN_REFRESH_URL, {
                    refresh: refreshToken
                })

                const newAccessToken = response.data.access
                const newRefreshToken = response.data.refresh || refreshToken
                
                setItem("access", newAccessToken)
                setItem("refresh", newRefreshToken)
                
                api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
                
                processQueue(null, newAccessToken)
                isRefreshing = false
                
                return api(originalRequest)
            } catch (refreshError) {
                processQueue(refreshError, null)
                clearAuthStorage()
                isRefreshing = false
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

export default api