import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"
import { PersonFill } from "react-bootstrap-icons"

import NewPost from "../components/PlusButton"
import Post from "../components/Post"
import usePostsFeed from "../hooks/usePostsFeed"
import { useAuth } from "../context/AuthContext"
import { DEFAULT_PROFILE_PICTURE } from "../constants"

import api from "../api"
import { colors, screen_width } from "../style"

const Container = styled.div`
    height: 100vh;
    max-width: ${screen_width.mobile};
    width: 100%;
    margin: 0 auto;
    position: relative;
`

const Header = styled.header`
    height: 64px;
    display: flex;
    align-items: center;

    svg {
        font-size: 32px;
        cursor: pointer;
        color: ${colors.white};

        &:hover {
            color: ${colors.grayPink};
        }
    }
`

const ProfilePic = styled.img`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    cursor: pointer;

    &:hover {
        opacity: 0.8;
    }
`

const SearchBar = styled.input`
    width: 100%;
    height: 40px;
    font-size: 18px;
    padding: 0 20px;
    margin-left: 16px;
    border-radius: 20px;
    background: ${colors.grayPink};
    outline: none;
    color: ${colors.white};

    &:hover {
        background: ${colors.dark};
    }
`

const Feed = styled.div`
    margin-top: 24px;
`

const FeedOption = styled.div`
    display: flex;
    
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

const Home = () => {
    const navigate = useNavigate()
    const { isAuthenticated, user, profilePicture, refreshUser } = useAuth()
    const [activeTab, setActiveTab] = useState<'for-you' | 'following'>('for-you')
    const [followingUsers, setFollowingUsers] = useState<string[]>([])

    // Keep auth data fresh (profile picture/username)
    useEffect(() => {
        refreshUser()
    }, [refreshUser])

    // Fetch current user's following list when logged in
    useEffect(() => {
        if (!isAuthenticated) {
            setFollowingUsers([])
            return
        }

        const fetchFollowing = async () => {
            try {
                const response = await api.get("accounts/auth/following/")
                setFollowingUsers(response.data.following || [])
            } catch (err: any) {
                setFollowingUsers([])
            }
        }

        fetchFollowing()
    }, [isAuthenticated])

    const { filteredPosts, loading: loadingPosts, error: postsError } = usePostsFeed(activeTab, followingUsers)

    return (
        <Container>
            { isAuthenticated && <NewPost /> }
            <Header>
                {isAuthenticated && user?.username ? (
                    <ProfilePic 
                        src={profilePicture || DEFAULT_PROFILE_PICTURE}
                        alt={user.username}
                        onClick={() => navigate(`/${user.username}`)}
                    />
                ) : (
                    <PersonFill onClick={() => navigate("/auth")} />
                )}
            </Header>
            <Feed>
                <FeedOption>
                    <button 
                        className={activeTab === 'for-you' ? 'active' : ''}
                        onClick={() => setActiveTab('for-you')}
                    >
                        Para você
                    </button>
                    {isAuthenticated && (
                        <button 
                            className={activeTab === 'following' ? 'active' : ''}
                            onClick={() => setActiveTab('following')}
                        >
                            Seguindo
                        </button>
                    )}
                </FeedOption>
                {loadingPosts ? (
                    <p style={{ color: colors.white, padding: '16px', textAlign: 'center' }}>Carregando posts...</p>
                ) : postsError ? (
                    <p style={{ color: colors.pink, padding: '16px', textAlign: 'center' }}>{postsError}</p>
                ) : (() => {
                    return filteredPosts && filteredPosts.length > 0 ? (
                        filteredPosts.map((post: any) => (
                            <Post
                                key={post.id}
                                id={post.id}
                                title={post.title}
                                content={post.content}
                                author_username={post.author_username}
                                author_pic={post.author_profile_picture}
                                published_at={post.published_at}
                                like_count={post.like_count}
                                is_liked={post.is_liked}
                            />
                        ))
                    ) : (
                        <p style={{ color: colors.grayPink, padding: '16px', textAlign: 'center' }}>Nenhum post para mostrar.</p>
                    )
                })()}
            </Feed>
        </Container>
    )
}

export default Home