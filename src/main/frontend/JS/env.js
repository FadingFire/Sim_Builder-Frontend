

export const someFunction = () => {
    const DATABASE_LOCAL_URL = "http://127.0.0.1:5000/scene"
    const DATABASE_PROD_URL = "https://example.com"
    return {DATABASE_LOCAL_URL, DATABASE_PROD_URL}
}