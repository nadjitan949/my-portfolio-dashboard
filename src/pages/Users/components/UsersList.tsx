import { useEffect, useState } from 'react'
import Button from '../../../ui/Button'
import api from '../../../axios/api'

interface Users {
    id: number
    firstname: string
    lastname: string
    email: string
}

function UsersList() {
    const [users, setUsers] = useState<Users[] | null>(null)

    useEffect(() => {

        const fetchUsers = async () => {
            try {

                const res = await api.get("/users/all")
                if (!res.data.success) alert(res.data.message)

                const data: Users[] = res.data.users
                setUsers(data)

            } catch (error) {
                console.log("Erreur: ", error)
            }
        }

        fetchUsers()

    }, [])

    const deleteUser = async (id: number) => {

        try {

            const isConfirm = confirm("Tu vas le supprimmr")
            if(!isConfirm) return

            const res = await api.delete(`/users/delete/${id}`)
            if(!res.data.success) return alert(res.data.message)

            alert(res.data.message)
            
        } catch (error) {
            console.log("Erreur: ", error)
        }
        
    }

    return (
        <section className="p-6 bg-white min-h-screen w-full">
            {/* Header large */}
            <div className="w-full mb-8">
                <h2 className="text-3xl font-black text-blue-500 uppercase tracking-tight">
                    Gestion Utilisateurs
                </h2>
                <div className="h-1 w-20 bg-blue-500 mt-2"></div>
            </div>

            {/* Grille qui utilise tout l'espace */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
                {users?.map((user) => (
                    <div
                        key={user.id}
                        className="group border border-gray-100 bg-white p-5 rounded-lg shadow-sm hover:border-blue-500 transition-all flex flex-col justify-between"
                    >
                        <div className="mb-4">
                            <p className="text-blue-500 font-bold text-xs uppercase tracking-widest mb-1">Utilisateur</p>
                            <p className="text-xl font-bold text-gray-900 truncate">
                                {user.lastname} {user.firstname}
                            </p>
                            <p className="text-gray-400 text-sm truncate">{user.email}</p>
                        </div>

                        <Button
                            onClick={() => deleteUser(user.id)}
                            className="w-full bg-red-500  hover:bg-red-600 text-white font-bold py-2 rounded-md transition-colors"
                        >
                            SUPPRIMER
                        </Button>
                    </div>
                ))}
            </div>

            {users?.length === 0 && (
                <div className="w-full text-center py-40 border-2 border-dashed border-gray-100 rounded-xl">
                    <p className="text-gray-300 text-2xl font-bold">LISTE VIDE</p>
                </div>
            )}
        </section>
    );
}

export default UsersList;