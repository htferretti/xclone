import styled from "styled-components"
import { useNavigate } from "react-router-dom"
import { Plus } from "react-bootstrap-icons"

import { colors } from "../style"

const Button = styled.button`
    position: fixed;
    bottom: 16px;
    right: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: ${colors.pink};
    cursor: pointer;
    
    svg {
        font-size: 48px;
        color: ${colors.black};
    }
`

const NewPost = () => {
  const navigate = useNavigate()

  return (
    <Button onClick={() => navigate("/new-post")}>
        <Plus />
    </Button>
  )
}
export default NewPost