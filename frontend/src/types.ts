export type Profile = {
    profile_picture?: string | null
    created_at?: string
}

export type User = {
    username: string
    email?: string
    profile?: Profile
    followers_count?: number
    following_count?: number
    is_following?: boolean
}

export type Post = {
    id: number
    title: string
    content: string
    author_username: string
    author_profile_picture?: string | null
    published_at?: string
    like_count: number
    is_liked: boolean
}

export type Comment = {
    id: number
    author_username: string
    content: string
    created_at?: string
}
