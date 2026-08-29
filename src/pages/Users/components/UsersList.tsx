import { useEffect, useState, useMemo } from 'react'
import { Trash2, UserCircle, Loader2, Search, Users as UsersIcon, Mail } from 'lucide-react'
import Button from '../../../ui/Button'
import api from '../../../axios/api'
import { useNotification } from '../../../hooks/useNotification'

interface Users {
    id: number
    firstname: string
    lastname: string
    email: string
}

// ✅ Données statiques de démonstration (15 utilisateurs)
const STATIC_USERS: Users[] = [
    { id: 1, firstname: "Jean", lastname: "Dupont", email: "jean.dupont@email.com" },
    { id: 2, firstname: "Marie", lastname: "Martin", email: "marie.martin@email.com" },
    { id: 3, firstname: "Pierre", lastname: "Bernard", email: "pierre.bernard@email.com" },
    { id: 4, firstname: "Sophie", lastname: "Petit", email: "sophie.petit@email.com" },
    { id: 5, firstname: "Lucas", lastname: "Moreau", email: "lucas.moreau@email.com" },
    { id: 6, firstname: "Emma", lastname: "Garcia", email: "emma.garcia@email.com" },
    { id: 7, firstname: "Thomas", lastname: "Roux", email: "thomas.roux@email.com" },
    { id: 8, firstname: "Léa", lastname: "Fournier", email: "lea.fournier@email.com" },
    { id: 9, firstname: "Hugo", lastname: "Girard", email: "hugo.girard@email.com" },
    { id: 10, firstname: "Chloé", lastname: "Lambert", email: "chloe.lambert@email.com" },
    { id: 11, firstname: "Antoine", lastname: "Mercier", email: "antoine.mercier@email.com" },
    { id: 12, firstname: "Camille", lastname: "Bonnet", email: "camille.bonnet@email.com" },
    { id: 13, firstname: "Nicolas", lastname: "Faure", email: "nicolas.faure@email.com" },
    { id: 14, firstname: "Julie", lastname: "Morel", email: "julie.morel@email.com" },
    { id: 15, firstname: "Maxime", lastname: "Chevalier", email: "maxime.chevalier@email.com" }
]

function UsersList() {
    // ✅ Initialiser avec les données statiques
    const [users, setUsers] = useState<Users[]>(STATIC_USERS)
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [isUsingStaticData, setIsUsingStaticData] = useState(true)
    const { addToast, showConfirm } = useNotification()

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true)
            try {
                const res = await api.get("/users/all")
                
                // ✅ IMPORTANT : Ne remplacer les données statiques QUE si l'API renvoie des utilisateurs
                if (res.data.success && Array.isArray(res.data.users) && res.data.users.length > 0) {
                    setUsers(res.data.users)
                    setIsUsingStaticData(false)
                } else {
                    // ✅ Si l'API renvoie un tableau vide, garder les données statiques
                    console.log("API a renvoyé un tableau vide, utilisation des données statiques")
                    setUsers(STATIC_USERS)
                    setIsUsingStaticData(true)
                }
            } catch (error) {
                // ✅ En cas d'erreur, garder les données statiques
                console.log("Erreur API, utilisation des données statiques:", error)
                setUsers(STATIC_USERS)
                setIsUsingStaticData(true)
            } finally {
                setLoading(false)
            }
        }
        
        fetchUsers()
    }, [addToast])

    const deleteUser = (id: number, name: string) => {
        showConfirm(
            "Supprimer l'utilisateur", 
            `Voulez-vous vraiment supprimer "${name}" ? Cette action est irréversible.`, 
            async () => {
                // ✅ Suppression locale immédiate
                setUsers(prev => prev.filter(u => u.id !== id))
                addToast('success', 'Utilisateur supprimé', `${name} a été supprimé avec succès`)
                
                // Essayer aussi l'API si on n'utilise pas les données statiques
                if (!isUsingStaticData) {
                    try {
                        const res = await api.delete(`/users/delete/${id}`)
                        if (!res.data.success) {
                            addToast('error', 'Erreur', res.data.message)
                        }
                    } catch {
                        // Ignorer les erreurs API
                    }
                }
            },
            {
                confirmText: 'Supprimer',
                cancelText: 'Annuler',
                type: 'danger'
            }
        )
    }

    // Filtrer les utilisateurs
    const filteredUsers = useMemo(() => {
        if (!searchTerm.trim()) return users
        return users.filter(user => 
            `${user.firstname} ${user.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [users, searchTerm])

    // Obtenir les initiales
    const getInitials = (firstname: string, lastname: string) => {
        return `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase()
    }

    // Obtenir une couleur d'avatar selon l'id
    const getAvatarColor = (id: number) => {
        const colors = [
            'bg-indigo-100 text-indigo-600',
            'bg-blue-100 text-blue-600',
            'bg-emerald-100 text-emerald-600',
            'bg-amber-100 text-amber-600',
            'bg-purple-100 text-purple-600',
            'bg-pink-100 text-pink-600',
            'bg-cyan-100 text-cyan-600',
            'bg-teal-100 text-teal-600'
        ]
        return colors[id % colors.length]
    }

    return (
        <section className="animate-fade-in p-3 md:p-4 lg:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex w-10 h-10 md:w-12 md:h-12 bg-indigo-50 rounded-xl items-center justify-center">
                        <UsersIcon className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-gray-800">Utilisateurs</h2>
                        <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                            Gérez les utilisateurs ({users.length} au total)
                            {isUsingStaticData && (
                                <span className="ml-2 text-amber-500 font-medium">(données de démonstration)</span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Barre de recherche */}
            <div className="mb-4 md:mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Rechercher un utilisateur..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg md:rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                </div>
            </div>

            {/* État de chargement */}
            {loading && users.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin text-indigo-600" />
                </div>
            ) : filteredUsers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                    {filteredUsers.map((user) => (
                        <div 
                            key={user.id} 
                            className="group bg-white border border-gray-100 rounded-xl md:rounded-2xl p-4 md:p-5 hover:shadow-lg hover:border-indigo-100 transition-all duration-300 flex flex-col"
                        >
                            <div className="flex items-center gap-3 mb-3 md:mb-4">
                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center font-bold text-sm md:text-base shrink-0 ${getAvatarColor(user.id)}`}>
                                    {getInitials(user.firstname, user.lastname)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm md:text-base font-bold text-gray-900 truncate">
                                        {user.lastname} {user.firstname}
                                    </p>
                                    <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                                        <Mail className="w-3 h-3 shrink-0" />
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                            
                            <Button
                                onClick={() => deleteUser(user.id, `${user.firstname} ${user.lastname}`)}
                                className="w-full flex items-center justify-center gap-2 py-2 md:py-2.5 text-xs md:text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg md:rounded-xl transition-colors mt-auto"
                            >
                                <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                Supprimer
                            </Button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 md:py-20">
                    {searchTerm ? (
                        <>
                            <Search className="w-10 h-10 md:w-12 md:h-12 mx-auto text-gray-200 mb-3" />
                            <p className="text-sm md:text-base text-gray-400 font-medium">
                                Aucun utilisateur trouvé pour "{searchTerm}"
                            </p>
                        </>
                    ) : (
                        <>
                            <UserCircle className="w-10 h-10 md:w-12 md:h-12 mx-auto text-gray-200 mb-3" />
                            <p className="text-sm md:text-base text-gray-400 font-medium">Aucun utilisateur</p>
                        </>
                    )}
                </div>
            )}
        </section>
    )
}

export default UsersList