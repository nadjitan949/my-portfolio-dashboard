import { Navigate, Outlet } from "react-router-dom"
import { useEffect, useState } from "react"
import api from "../axios/api"

const ProtectedRoute = () => {
    const [isAuth, setIsAuth] = useState<boolean | null>(null)

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token")

            if (!token) {
                setIsAuth(false)
                return
            }

            try {
                const res = await api.post("/verify/token")
                setIsAuth(res.data.success === true)
            } catch (error) {
                setIsAuth(false)
                console.log(error)
            }
        }

        checkAuth()
    }, [])

    if (isAuth === null) {
        return <div className="p-6 text-center">Chargement...</div>
    }

    if (!isAuth) {
        return <Navigate to="/" replace />
    }

    return <Outlet />
}

export default ProtectedRoute
