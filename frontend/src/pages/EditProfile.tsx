import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import api from "../api"
import { useAuth } from "../context/AuthContext"
import { resolveProfilePicture } from "../utils/profile"
import { colors, screen_width } from "../style"

const Container = styled.div`
    height: 100vh;
    max-width: ${screen_width.mobile};
    width: 100%;
    margin: 0 auto;
    position: relative;
    padding: 16px;
`

const Header = styled.h1`
    color: ${colors.white};
    font-size: 24px;
    margin-bottom: 24px;
    text-align: center;
`

const Section = styled.div`
    margin-bottom: 32px;
`

const SectionTitle = styled.h2`
    color: ${colors.white};
    font-size: 18px;
    margin-bottom: 16px;
`

const ProfilePictureSection = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
`

const ProfilePicturePreview = styled.img`
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
`

const FileInput = styled.input`
    display: none;
`

const FileInputLabel = styled.label`
    padding: 8px 16px;
    background: ${colors.pink};
    color: ${colors.white};
    border-radius: 20px;
    cursor: pointer;
    font-weight: 600;

    &:hover {
        background: ${colors.darkPink};
    }
`

const FormGroup = styled.div`
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
`

const Label = styled.label`
    color: ${colors.white};
    font-size: 14px;
    font-weight: 600;
`

const Input = styled.input`
    width: 100%;
    font-size: 16px;
    padding: 12px;
    border-radius: 24px;
    background: ${colors.dark};
    outline: none;
    color: ${colors.white};
    border: 1px solid ${colors.dark};

    &:focus {
        border-color: ${colors.pink};
    }

    &::placeholder {
        color: ${colors.dark};
    }
`

const ButtonGroup = styled.div`
    display: flex;
    gap: 12px;
    margin-top: 24px;
`

const Button = styled.button`
    flex: 1;
    padding: 12px 16px;
    border-radius: 24px;
    border: 2px solid ${colors.white};
    color: ${colors.white};
    background: none;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: 0.2s;

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    &:hover:not(:disabled) {
        background: ${colors.white};
        color: ${colors.black};
    }
`

const ErrorMessage = styled.p`
    color: ${colors.pink};
    font-size: 14px;
    margin-bottom: 16px;
`

const SuccessMessage = styled.p`
    color: #51cf66;
    font-size: 14px;
    margin-bottom: 16px;
`

const EditProfile = () => {
    const navigate = useNavigate()
    const { user, refreshUser, profilePicture: storedProfilePicture } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    // Profile data
    const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null)
    const [profilePicturePreview, setProfilePicturePreview] = useState<string>("")
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")

    // Password change fields
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPasswordSection, setShowPasswordSection] = useState(false)

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true)
            try {
                await refreshUser()
                setUsername(user?.username || "")
                setEmail(user?.email || "")
                setProfilePicturePreview(resolveProfilePicture(user?.profile?.profile_picture || storedProfilePicture))
            } catch (err: any) {
                setError("Erro ao carregar perfil")
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [refreshUser, user?.username, user?.email, user?.profile?.profile_picture])

    const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setProfilePictureFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setProfilePicturePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSaveProfilePicture = async () => {
        if (!profilePictureFile) {
            setError("Selecione uma imagem")
            return
        }

        setSaving(true)
        setError(null)
        setSuccess(null)

        try {
            const formData = new FormData()
            formData.append("profile_picture", profilePictureFile)

            await api.post("accounts/auth/update-profile-picture/", formData)

            setSuccess("Foto de perfil atualizada com sucesso!")
            setProfilePictureFile(null)

            // Fetch updated profile to get the new picture URL
            try {
                const updatedProfile = await api.get("accounts/auth/me/")
                const pic = resolveProfilePicture(updatedProfile.data.profile?.profile_picture)
                setProfilePicturePreview(pic)
                await refreshUser()
            } catch (err) {
                // Silently fail - profile picture was updated successfully
            }
        } catch (err: any) {
            setError(
                err?.response?.data?.detail ||
                "Erro ao atualizar foto de perfil"
            )
        } finally {
            setSaving(false)
        }
    }

    const handleSaveUsername = async () => {
        if (!username.trim()) {
            setError("Nome de usuário não pode estar vazio")
            return
        }

        setSaving(true)
        setError(null)
        setSuccess(null)

        try {
            const response = await api.post("accounts/auth/update-username/", { username })
            setSuccess("Nome de usuário atualizado com sucesso!")
            await refreshUser()
        } catch (err: any) {
            setError(
                err?.response?.data?.detail ||
                "Erro ao atualizar nome de usuário"
            )
        } finally {
            setSaving(false)
        }
    }

    const handleSaveEmailAndPassword = async () => {
        setError(null)
        setSuccess(null)

        if (!currentPassword) {
            setError("Insira sua senha atual para fazer alterações")
            return
        }

        if (email && !email.includes("@")) {
            setError("Email inválido")
            return
        }

        if (newPassword || confirmPassword) {
            if (!newPassword || !confirmPassword) {
                setError("Insira e confirme a nova senha")
                return
            }

            if (newPassword !== confirmPassword) {
                setError("As senhas não coincidem")
                return
            }

            if (newPassword.length < 6) {
                setError("A senha deve ter no mínimo 6 caracteres")
                return
            }
        }

        setSaving(true)

        try {
            const payload: any = {
                current_password: currentPassword,
            }

            if (email) {
                payload.email = email
            }

            if (newPassword) {
                payload.new_password = newPassword
            }

            await api.post("accounts/auth/update-email-password/", payload)

            setSuccess("Email e/ou senha atualizados com sucesso!")
            await refreshUser()
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
            setShowPasswordSection(false)
        } catch (err: any) {
            setError(
                err?.response?.data?.detail ||
                "Erro ao atualizar email e/ou senha"
            )
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <Container>
                <p style={{ color: colors.white }}>Carregando perfil...</p>
            </Container>
        )
    }

    return (
        <Container>
            <Header>Editar Perfil</Header>

            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}

            {/* Profile Picture Section */}
            <Section>
                <SectionTitle>Foto de Perfil</SectionTitle>
                <ProfilePictureSection>
                    <ProfilePicturePreview
                        src={profilePicturePreview}
                        alt="Profile"
                    />
                    <FileInputLabel htmlFor="profile-picture-input">
                        Escolher Imagem
                    </FileInputLabel>
                    <FileInput
                        id="profile-picture-input"
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                    />
                    {profilePictureFile && (
                        <Button
                            onClick={handleSaveProfilePicture}
                            disabled={saving}
                        >
                            {saving ? "Salvando..." : "Salvar Foto"}
                        </Button>
                    )}
                </ProfilePictureSection>
            </Section>

            {/* Username Section */}
            <Section>
                <SectionTitle>Nome de Usuário</SectionTitle>
                <FormGroup>
                    <Input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Nome de usuário"
                    />
                </FormGroup>
                <Button
                    onClick={handleSaveUsername}
                    disabled={saving}
                >
                    {saving ? "Salvando..." : "Salvar Nome de Usuário"}
                </Button>
            </Section>

            {/* Email and Password Section */}
            <Section>
                <SectionTitle>Email e Senha</SectionTitle>
                {!showPasswordSection ? (
                    <Button
                        onClick={() => setShowPasswordSection(true)}
                        
                    >
                        Editar Email e Senha
                    </Button>
                ) : (
                    <>
                        <FormGroup>
                            <Label>Senha Atual *</Label>
                            <Input
                                type="password"
                                value={currentPassword}
                                onChange={(e) =>
                                    setCurrentPassword(e.target.value)
                                }
                                placeholder="Digite sua senha atual"
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Digite seu novo email"
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label>Nova Senha (deixe em branco para não alterar)</Label>
                            <Input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Nova senha"
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label>Confirmar Nova Senha</Label>
                            <Input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                placeholder="Confirmar nova senha"
                            />
                        </FormGroup>

                        <ButtonGroup>
                            <Button
                                
                                onClick={() => {
                                    setShowPasswordSection(false)
                                    setCurrentPassword("")
                                    setNewPassword("")
                                    setConfirmPassword("")
                                    setError(null)
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSaveEmailAndPassword}
                                disabled={saving}
                            >
                                {saving ? "Salvando..." : "Salvar"}
                            </Button>
                        </ButtonGroup>
                    </>
                )}
            </Section>
        </Container>
    )
}

export default EditProfile
