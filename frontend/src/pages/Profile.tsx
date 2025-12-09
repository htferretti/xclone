import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import styled from "styled-components"

import api from "../api"

import NewPost from "../components/PlusButton"
import Post from "../components/Post"
import FollowModal from "../components/FollowModal"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import useProfileData from "../hooks/useProfileData"
import { formatDate } from "../utils/date"
import { DEFAULT_PROFILE_PICTURE } from "../constants"

import { colors, screen_width } from "../style"
import ActionButton from "../components/ActionButton"

const Container = styled.div`
    height: 100vh;
    max-width: ${screen_width.mobile};
    width: 100%;
    margin: 0 auto;
    position: relative;
`

const Account = styled.div`
    display: flex;
    justify-content: space-between;
    padding-top: 16px;
`

const ProfilePicture = styled.img`
    width: 90px;
    height: 90px;
    border-radius: 50%;
    object-fit: cover;
`

const Username = styled.h1`
    color: ${colors.white};
    margin-top: 8px;
    font-size: 20px;
`

const Member = styled.p`
    color: ${colors.grayPink};
    font-size: 14px;
    margin: 12px 0 4px 0;
`

const FollowersFollowing = styled.div`
    display: flex;
    gap: 16px;
`

const Follow = styled.a`
    color: ${colors.grayPink};
    font-size: 14px;
    cursor: pointer;

    b {
        color: ${colors.white};
    }

    &:hover {
        color: ${colors.pink};
        
        b {
            color: ${colors.pink};
        }
    }
`

const Right = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;

    a {
        color: ${colors.pink};
        margin-top: 6px;
        cursor: pointer;
        font-weight: 600;

        &:hover {
            color: ${colors.darkPink};
        }
    }
`

const Posts = styled.div`
    margin-top: 24px;
`

const PostOption = styled.div`
    display: flex;
    justify-content: space-around;
    border-bottom: 1px solid ${colors.grayPink};

    button {
        width: 100%;
        background: transparent;
        color: ${colors.white};
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        border-bottom: 3px solid transparent;
        padding-bottom: 8px;

        &.active {
            border-color: ${colors.pink};
        }
    }
`

const ZeroPost = styled.p`
    color: ${colors.grayPink};
    text-align: center;
    margin-top: 32px;
`

const Profile = () => {
    const { username } = useParams()
    const navigate = useNavigate()
    const { user: currentUser, isAuthenticated, logout } = useAuth()
    const { showToast } = useToast()
    const isOwner = currentUser?.username === username
    const { profileUser, isFollowing, profilePictureUrl, loading, error, refetch, setProfileUser, setIsFollowing } = useProfileData(username, isOwner)
    const [followLoading, setFollowLoading] = useState(false)
    const [posts, setPosts] = useState<any[]>([])
    const [likedPosts, setLikedPosts] = useState<any[]>([])
    const [activeTab, setActiveTab] = useState<'posts' | 'likes'>('posts')
    const [showFollowModal, setShowFollowModal] = useState<'followers' | 'following' | null>(null)

    useEffect(() => {
        if (!username) return

        const fetchPosts = async () => {
            try {
                const response = await api.get(`posts/user/${username}/`)
                setPosts(response.data)
            } catch (err: any) {
                setPosts([])
            }
        }

        fetchPosts()
    }, [username])

    // Fetch liked posts when owner and on likes tab
    useEffect(() => {
        if (!isOwner || activeTab !== 'likes') return

        const fetchLikedPosts = async () => {
            try {
                const response = await api.get("posts/liked/")
                setLikedPosts(response.data)
            } catch (err: any) {
                setLikedPosts([])
            }
        }

        fetchLikedPosts()
    }, [isOwner, activeTab])

    const handleFollow = async () => {
        if (!username || followLoading) return
        setFollowLoading(true)
        
        try {
            await api.post("accounts/auth/follow/", { username })
            setIsFollowing(true)
            // Update followers count
            if (profileUser) {
                setProfileUser({
                    ...profileUser,
                    followers_count: (profileUser.followers_count || 0) + 1
                })
            }
        } catch (err: any) {
            showToast(err?.response?.data?.detail || "Erro ao seguir usuário", "error")
        } finally {
            setFollowLoading(false)
        }
    }

    const handleUnfollow = async () => {
        if (!username || followLoading) return
        setFollowLoading(true)
        
        try {
            await api.post("accounts/auth/unfollow/", { username })
            setIsFollowing(false)
            // Update followers count
            if (profileUser) {
                setProfileUser({
                    ...profileUser,
                    followers_count: Math.max(0, (profileUser.followers_count || 1) - 1)
                })
            }
        } catch (err: any) {
            showToast(err?.response?.data?.detail || "Erro ao deixar de seguir usuário", "error")
        } finally {
            setFollowLoading(false)
        }
    }

    const handleLogout = () => {
        logout()
        navigate("/")
    }

    if (loading) {
        return <Container><p style={{ color: colors.white }}>Carregando perfil...</p></Container>
    }

    if (error) {
        return <Container><p style={{ color: colors.white }}>{error}</p></Container>
    }

    if (!profileUser) {
        return <Container><p style={{ color: colors.white }}>Perfil não encontrado</p></Container>
    }

    const displayPicture = profilePictureUrl || DEFAULT_PROFILE_PICTURE
    const joinedDate = formatDate(profileUser.profile?.created_at)

    return (
        <Container>
            { isAuthenticated && <NewPost /> }
            <Account>
                <div>
                    <ProfilePicture src={displayPicture} alt={profileUser.username} />
                    <Username>{profileUser.username}</Username>
                    <Member>Membro desde {joinedDate}</Member>
                    <FollowersFollowing>
                        <Follow onClick={() => setShowFollowModal('following')}>
                            <b>{profileUser.following_count ?? 0}</b> Seguindo
                        </Follow>
                        <Follow onClick={() => setShowFollowModal('followers')}>
                            <b>{profileUser.followers_count ?? 0}</b> Seguidores
                        </Follow>
                    </FollowersFollowing>
                </div>

                { isOwner && (
                    <Right>
                        <ActionButton
                            onClick={() => navigate("/edit-profile")}
                            color="transparent">
                            Editar Perfil
                        </ActionButton>
                        <a onClick={handleLogout}>Sair</a>
                    </Right>
                )}
                { !isOwner && isAuthenticated && (
                    <Right>
                        {isFollowing ? (
                            <ActionButton 
                                onClick={handleUnfollow}
                                color="transparent"
                            >
                                {followLoading ? "Carregando..." : "Deixar de Seguir"}
                            </ActionButton>
                        ) : (
                            <ActionButton 
                                onClick={handleFollow}
                                color="transparent"
                            >
                                {followLoading ? "Carregando..." : "Seguir"}
                            </ActionButton>
                        )}
                    </Right>
                )}
            </Account>
            <Posts>
                <PostOption>
                    <button className={activeTab === 'posts' ? 'active' : ''} onClick={() => setActiveTab('posts')}>Publicações</button>
                    { isOwner && <button className={activeTab === 'likes' ? 'active' : ''} onClick={() => setActiveTab('likes')}>Curtidas</button>}
                </PostOption>
                { 
                    activeTab === 'posts' && (
                        posts && posts.length > 0 ? (
                            posts.map((post: any) => (
                                <Post key={post.id} id={post.id} title={post.title} content={post.content} author_username={post.author_username} author_pic={post.author_profile_picture} published_at={post.published_at} like_count={post.like_count} is_liked={post.is_liked} />
                            ))
                        ) : (
                            <ZeroPost>Nenhuma publicação para mostrar.</ZeroPost>
                        )
                    )
                }
                {
                    activeTab === 'likes' && isOwner && (
                        likedPosts && likedPosts.length > 0 ? (
                            likedPosts.map((post: any) => (
                                <Post key={post.id} id={post.id} title={post.title} content={post.content} author_username={post.author_username} author_pic={post.author_profile_picture} published_at={post.published_at} like_count={post.like_count} is_liked={post.is_liked} onUnlike={(id) => setLikedPosts(prev => prev.filter(p => p.id !== id))} />
                            ))
                        ) : (
                            <ZeroPost>Você ainda não curtiu nenhum post.</ZeroPost>
                        )
                    )
                }
            </Posts>
            {showFollowModal && username && (
                <FollowModal 
                    username={username} 
                    type={showFollowModal} 
                    onClose={() => setShowFollowModal(null)}
                />
            )}
        </Container>
    )
}

export default Profile