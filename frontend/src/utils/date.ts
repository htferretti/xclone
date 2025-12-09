export const formatDateTime = (value?: string) => {
    if (!value) return ""
    const date = new Date(value)
    return date.toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    })
}

export const formatDate = (value?: string) => {
    if (!value) return ""
    const date = new Date(value)
    return date.toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "long",
        day: "numeric"
    })
}
