import { useEffect, useMemo, useState } from "react"

import api from "../api"
import { Post } from "../types"

type FeedTab = 'for-you' | 'following'

type UsePostsFeedResult = {
    posts: Post[]
    loading: boolean
    error: string | null
    refresh: () => Promise<void>
    filteredPosts: Post[]
}

const usePostsFeed = (activeTab: FeedTab, followingUsers: string[]) => {
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchPosts = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await api.get<Post[]>("posts/")
            setPosts(response.data)
        } catch (err: any) {
            setError(err?.response?.data?.detail || "Erro ao carregar posts")
            setPosts([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPosts()
    }, [])

    const filteredPosts = useMemo(() => {
        if (activeTab === 'following') {
            return posts.filter(post => followingUsers.includes(post.author_username))
        }
        return posts
    }, [activeTab, posts, followingUsers])

    return {
        posts,
        filteredPosts,
        loading,
        error,
        refresh: fetchPosts,
    } as UsePostsFeedResult
}

export default usePostsFeed
