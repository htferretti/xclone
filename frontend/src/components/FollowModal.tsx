import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"
import { X } from "react-bootstrap-icons"

import api from "../api"
import { colors } from "../style"

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`

const Modal = styled.div`
    background: ${colors.black};
    border: 1px solid ${colors.grayPink};
    border-radius: 16px;
    width: 90%;
    max-width: 400px;
    max-height: 70vh;
    display: flex;
    flex-direction: column;
`

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid ${colors.grayPink};
`

const Title = styled.h2`
    color: ${colors.white};
    font-size: 18px;
    font-weight: 600;
`

const CloseButton = styled.button`
    background: transparent;
    border: none;
    color: ${colors.white};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;

    &:hover {
        color: ${colors.pink};
    }

    svg {
        font-size: 24px;
    }
`

const UserList = styled.div`
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
`

const UserItem = styled.div`
    color: ${colors.white};
    font-size: 16px;
    padding: 8px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
        background: ${colors.dark};
        color: ${colors.pink};
    }
`

const LoadingText = styled.p`
    color: ${colors.grayPink};
    text-align: center;
    padding: 16px;
`

const EmptyText = styled.p`
    color: ${colors.grayPink};
    text-align: center;
    padding: 16px;
`

type FollowModalProps = {
    username: string
    type: 'followers' | 'following'
    onClose: () => void
}

const FollowModal = ({ username, type, onClose }: FollowModalProps) => {
    const navigate = useNavigate()
    const [users, setUsers] = useState<string[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true)
            try {
                const endpoint = type === 'followers' 
                    ? `accounts/auth/user-followers/?username=${username}`
                    : `accounts/auth/user-following/?username=${username}`
                
                const response = await api.get(endpoint)
                setUsers(response.data[type] || [])
            } catch (err) {
                setUsers([])
            } finally {
                setLoading(false)
            }
        }

        fetchUsers()
    }, [username, type])

    const handleUserClick = (clickedUsername: string) => {
        navigate(`/${clickedUsername}`)
        onClose()
    }

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    return (
        <Overlay onClick={handleOverlayClick}>
            <Modal>
                <Header>
                    <Title>{type === 'followers' ? 'Seguidores' : 'Seguindo'}</Title>
                    <CloseButton onClick={onClose}>
                        <X />
                    </CloseButton>
                </Header>
                <UserList>
                    {loading ? (
                        <LoadingText>Carregando...</LoadingText>
                    ) : users.length > 0 ? (
                        users.map(user => (
                            <UserItem key={user} onClick={() => handleUserClick(user)}>
                                @{user}
                            </UserItem>
                        ))
                    ) : (
                        <EmptyText>
                            {type === 'followers' ? 'Nenhum seguidor ainda' : 'Não está seguindo ninguém'}
                        </EmptyText>
                    )}
                </UserList>
            </Modal>
        </Overlay>
    )
}

export default FollowModal
