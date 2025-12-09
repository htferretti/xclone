import { useState, useEffect } from "react"
import styled from "styled-components"
import { useNavigate } from "react-router-dom"

import api from "../api"
import { colors, screen_width } from "../style"
import ActionButton from "../components/ActionButton"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import { DEFAULT_PROFILE_PICTURE } from "../constants"

const Container = styled.div`
    height: 100vh;
    max-width: ${screen_width.mobile};
    width: 100%;
    margin: 0 auto;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;

    div {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
`

const ProfilePicture = styled.img`
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
`

const Title = styled.input`
    width: 100%;
    font-size: 16px;
    padding: 12px 16px;
    margin: 16px 0;
    border-radius: 32px;
    background: ${colors.dark};
    outline: none;
    color: ${colors.white};
`

const Content = styled.textarea`
    width: 100%;
    height: calc(100vh - 200px);
    font-size: 16px;
    padding: 16px;
    border-radius: 16px;
    background: ${colors.dark};
    outline: none;
    color: ${colors.white};
    resize: vertical;
`
const NewPost = () => {
        const navigate = useNavigate()
        const { user, profilePicture, isAuthenticated } = useAuth()
        const { showToast } = useToast()
        const [postTitle, setPostTitle] = useState("")
        const [postContent, setPostContent] = useState("")
        const [loading, setLoading] = useState(false)

        const profileUser = user?.username || ""
        const profilePictureUrl = profilePicture || DEFAULT_PROFILE_PICTURE

        useEffect(() => {
                if (!isAuthenticated) {
                        navigate("/auth")
                }
        }, [isAuthenticated, navigate])

    const handlePublish = async () => {
        // Require both title and content
        if (!postTitle || !postTitle.trim()) {
            showToast('O título é obrigatório', 'error')
            return
        }
        if (!postContent || !postContent.trim()) {
            showToast('O conteúdo é obrigatório', 'error')
            return
        }

        if (loading) return
        setLoading(true)
        try {
            const payload = { title: postTitle.trim(), content: postContent.trim() }
            await api.post('posts/', payload)
            navigate(-1)
        } catch (err: any) {
            showToast(err?.response?.data?.detail || 'Erro ao publicar', 'error')
        } finally {
            setLoading(false)
        }
    }

  return (
    <Container>
        <div>
            <ProfilePicture src={profilePictureUrl} alt={profileUser} onClick={() => navigate("/")} />
            <ActionButton color="pink" onClick={handlePublish} disabled={loading || !postTitle.trim() || !postContent.trim()}>{loading ? 'Publicando...' : 'Publicar'}</ActionButton>
        </div>
        <Title 
            placeholder="Título"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
        />
        <Content 
            placeholder="O que você quer compartilhar?"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
        />
    </Container>
  )
}
export default NewPost