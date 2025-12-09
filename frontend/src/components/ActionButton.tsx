import styled from "styled-components"
import { colors } from "../style"

const Button = styled.button<{ $color?: string }>`
    padding: 10px 20px;
    border-radius: 20px;
    cursor: pointer;
    font-weight: 600;
    border: 2px solid ${props => props.$color === 'pink' ? colors.pink : colors.white};
    background: ${props => props.$color === 'pink' ? colors.pink : 'transparent'};
    color: ${props => props.$color === 'pink' ? colors.black : colors.white};

    &:hover {
        ${props => props.$color === 'pink'
            ? `background: ${colors.darkPink}; color: ${colors.black}; border-color: ${colors.darkPink};`
            : `background: ${colors.white}; color: ${colors.black};`
        }
    }
`

type Props = {
    onClick?: () => void;
    children?: React.ReactNode;
    color?: 'transparent' | 'pink';
    disabled?: boolean;
}

const ActionButton = ({ onClick, children, color, disabled }: Props) => {
    return (
        <Button onClick={onClick} $color={color} disabled={disabled}>
            {children}
        </Button>
    )
}

export default ActionButton