import { createGlobalStyle } from "styled-components"

export const colors = {
    black: '#000',
    white: '#c9c9c9',
    dark: '#3f4549ff',
    grayPink: '#6a5e67ff',
    pink: '#DB0098',
    darkPink: '#a61079ff'
}

export const screen_width = {
    notebook: '1440px',
    tablet: '1024px',
    mobile: '428px'
}

export const GlobalStyle = createGlobalStyle`
    * {
        padding: 0;
        margin: 0;
        box-sizing: border-box;
        border: none;
        text-decoration: none;
        list-style: none;
        font-family: Roboto;
        transition: 0.2s;
    }    

    body, html {
        width: 100%;
        height: 100%;
        background: ${colors.black};
    }
`