import { useState } from "react"
import styled from "styled-components"
import { Eye, EyeSlash } from "react-bootstrap-icons"

import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"

import { colors, screen_width } from "../style"

const Container = styled.div`
    height: 100vh;
    max-width: ${screen_width.mobile};
    width: 100%;
    margin: 0 auto;
    display: flex;
    align-items: center;
`

const Tabs = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;
`

const Login = styled.p`
    color: ${colors.white};
    font-size: 20px;
    font-weight: 700;
`

const InputWrapper = styled.div`
    position: relative;
    width: 100%;
`

const Input = styled.input`
    width: 100%;
    font-size: 18px;
    padding: 12px 20px;
    border-radius: 32px;
    background: ${colors.dark};
    outline: none;
    color: ${colors.white};

    /* Keep styling when browser autofills the field (Chrome / Safari) */
    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus,
    &:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0px 1000px ${colors.dark} inset !important;
        box-shadow: 0 0 0px 1000px ${colors.dark} inset !important;
        -webkit-text-fill-color: ${colors.white} !important;
        transition: background-color 5000s ease-in-out 0s;
    }

    /* Firefox autofill */
    &:-moz-autofill {
        box-shadow: 0 0 0px 1000px ${colors.dark} inset !important;
        -moz-text-fill-color: ${colors.white} !important;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`

const TogglePasswordIcon = styled.button`
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    color: ${colors.grayPink};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;

    &:hover {
        color: ${colors.white};
    }

    svg {
        font-size: 18px;
    }
`

const Logon = styled.p`
    color: ${colors.white};
    font-size: 16px;
    font-weight: 100;
    text-align: center;

    span {
        text-decoration: underline;
        color: ${colors.pink};
        cursor: pointer;

        &:hover {
            color: ${colors.darkPink};
        }
    }
`

const Button = styled.button`
    width: 100%;
    font-size: 18px;
    padding: 12px 0;
    border-radius: 32px;
    background: ${colors.pink};
    outline: none;
    color: ${colors.black};
    cursor: pointer;
    margin-top: 32px;

    &:hover {
        background: ${colors.darkPink};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`

const ErrorSpan = styled.span`
    color: ${colors.pink};
    font-size: 14px;
    font-weight: 400;
`

const Auth = () => {
    const { login, register } = useAuth()
    const { showToast } = useToast()
    const [isLogin, setIsLogin] = useState(true)

    function formatCPF(value: string) {
        return value
            .replace(/\D/g, "")             // remove non-digit characters
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1-$2")
            .slice(0, 14)                    // limit to 14 characters
    }

     // states login
    const [usernameLogin, setUsernameLogin] = useState("")
    const [passwordLogin, setPasswordLogin] = useState("")
    const [showPasswordLogin, setShowPasswordLogin] = useState(false)
    
    const [loginLoading, setLoginLoading] = useState(false)

    const [loginError, setLoginError] = useState(false)

    // states register
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [cpf, setCpf] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    const [registerLoading, setRegisterLoading] = useState(false)

    const [registerError, setRegisterError] = useState("")
    const [usernameError, setUsernameError] = useState("")
    const [emailError, setEmailError] = useState("")
    const [cpfError, setCpfError] = useState("")
    const [passwordError, setPasswordError] = useState("")

    // LOGIN
    async function handleLogin() {
        if (loginLoading) return
        setLoginLoading(true)
        try {
            const success = await login(usernameLogin, passwordLogin)
            if (!success) {
                setLoginError(true)
                return
            }
            window.location.href = "/"
        } catch (error) {
            setLoginError(true)
        } finally {
            setLoginLoading(false)
        }
    }

    // REGISTER
    async function handleRegister() {
        // clear previous errors
        setRegisterError("")
        setUsernameError("")
        setEmailError("")
        setCpfError("")
        setPasswordError("")

        // client-side validations
        const usernamePattern = /^[a-zA-Z0-9_]{4,15}$/
        if (!usernamePattern.test(username.trim())) {
            setUsernameError("O nome de usuário deve ter 4-15 caracteres e conter apenas letras, números e underscore")
            return
        }

        const cpfPattern = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
        if (!cpfPattern.test(cpf)) {
            setCpfError("CPF deve estar no formato: 123.456.789-00")
            return
        }

        if (password !== confirmPassword) {
            setRegisterError("As senhas não coincidem")
            return
        }

        if (registerLoading) return
        setRegisterLoading(true)

        try {
            await register({
                username,
                email,
                cpf,
                password,
                password_confirm: confirmPassword
            })

            showToast("Conta criada com sucesso!", "success")
            window.location.href = "/"
        } catch (err: any) {
            // Parse backend validation response
            const status = err?.response?.status
            const data = err?.response?.data

            // Try to parse backend validation response (Django REST framework style)
            if (status === 401) {
                setRegisterError('Unauthorized (401) — check backend permissions or authentication')
                return
            }

            if (data) {
                // username errors
                if (data.username && Array.isArray(data.username)) {
                    setUsernameError(data.username.join(' '))
                }

                // email errors
                if (data.email && Array.isArray(data.email)) {
                    setEmailError(data.email.join(' '))
                }

                // cpf errors
                if (data.cpf && Array.isArray(data.cpf)) {
                    setCpfError(data.cpf.join(' '))
                }

                // password errors
                if (data.password && Array.isArray(data.password)) {
                    setPasswordError(data.password.join(' '))
                }

                // fallback: non_field_errors or detail
                if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
                    setRegisterError(data.non_field_errors.join(' '))
                } else if (typeof data.detail === 'string') {
                    setRegisterError(data.detail)
                }
                return
            }

            setRegisterError('Erro ao cadastrar')
        } finally {
            setRegisterLoading(false)
        }
    }

    return (
        <Container>
            { isLogin &&
                <Tabs>
                    <Login>Entrar:</Login>
                    <Input placeholder="usuário/email" disabled={loginLoading} onChange={e => setUsernameLogin(e.target.value)} />
                    <InputWrapper>
                        <Input 
                            placeholder="senha" 
                            type={showPasswordLogin ? "text" : "password"}
                            disabled={loginLoading} 
                            onChange={e => setPasswordLogin(e.target.value)} 
                        />
                        <TogglePasswordIcon 
                            type="button"
                            onClick={() => setShowPasswordLogin(!showPasswordLogin)}
                        >
                            {showPasswordLogin ? <EyeSlash /> : <Eye />}
                        </TogglePasswordIcon>
                    </InputWrapper>
                    <Logon>não possuí uma conta? <span onClick={() => setIsLogin(false)}>cadastrar</span></Logon>
                    { loginError &&
                        <ErrorSpan>Usuário ou senha incorretos</ErrorSpan>
                    }
                    <Button disabled={loginLoading} onClick={handleLogin} >{loginLoading ? 'Carregando...' : 'Entrar'}</Button>
                </Tabs>
            }
            { !isLogin &&
                <Tabs>
                    <Login>Cadastrar:</Login>
                    <Input placeholder="usuário" disabled={registerLoading} onChange={e => { setUsername(e.target.value); if (usernameError) setUsernameError("") }} />
                    <Input placeholder="email" disabled={registerLoading} onChange={e => { setEmail(e.target.value); if (emailError) setEmailError("") }} />
                    <Input placeholder="CPF" value={cpf} disabled={registerLoading} onChange={e => { setCpf(formatCPF(e.target.value)); if (cpfError) setCpfError("") }} />
                    <InputWrapper>
                        <Input 
                            placeholder="senha" 
                            type={showPassword ? "text" : "password"}
                            disabled={registerLoading} 
                            onChange={e => { setPassword(e.target.value); if (passwordError) setPasswordError("") }} 
                        />
                        <TogglePasswordIcon 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeSlash /> : <Eye />}
                        </TogglePasswordIcon>
                    </InputWrapper>
                    <InputWrapper>
                        <Input 
                            placeholder="confirmar senha" 
                            type={showPassword ? "text" : "password"}
                            disabled={registerLoading} 
                            onChange={e => setConfirmPassword(e.target.value)} 
                        />
                        <TogglePasswordIcon 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeSlash /> : <Eye />}
                        </TogglePasswordIcon>
                    </InputWrapper>
                    { (usernameError || emailError || cpfError || passwordError || registerError) && (
                        <ErrorSpan>{usernameError || emailError || cpfError || passwordError || registerError}</ErrorSpan>
                    ) }
                    <Logon>já possuí uma conta? <span onClick={() => setIsLogin(true)}>entrar</span></Logon>
                    <Button disabled={registerLoading} onClick={handleRegister}>{registerLoading ? 'Carregando...' : 'Cadastrar'}</Button>
                </Tabs>
            }
        </Container>
    )
}
export default Auth