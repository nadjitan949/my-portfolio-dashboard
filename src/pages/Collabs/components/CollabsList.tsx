import { Plus, Edit3, Trash2, Loader2, Search, Users, Mail, Briefcase } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../ui/Button'
import { useEffect, useState, useMemo, useCallback } from 'react'
import api from '../../../axios/api'
import { useNotification } from '../../../hooks/useNotification'
import Img from '../../../ui/Img'

interface Collaborator {
    id: number
    fullname: string
    jobTitle: string
    link: string
    image: string | null
}

function CollabsList() {
    const [collaborators, setCollaborators] = useState<Collaborator[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [refresh, setRefresh] = useState(false)

    const navigate = useNavigate()
    const { addToast, showConfirm } = useNotification()

    const handleAdd = () => navigate("/collabs/add")
    const handleEdit = (id: number) => navigate(`/collabs/update/${id}`)

    const triggerRefresh = () => {
        setRefresh(prev => !prev)
    }

    const fetchCollabs = useCallback(async () => {
        setLoading(true)
        try {
            const res = await api.get("/collabs/all")
            if (res.data.success) {
                setCollaborators(res.data.collabs || [])
            } else {
                addToast('error', 'Erreur', res.data.message || 'Impossible de charger les collaborateurs')
            }
        } catch (error) {
            console.error("Erreur API:", error)
            addToast('error', 'Erreur', 'Impossible de charger les collaborateurs')
        } finally {
            setLoading(false)
        }
    }, [addToast])

    useEffect(() => {
        fetchCollabs()
    }, [fetchCollabs, refresh])

    const handleDelete = (id: number, name: string) => {
        showConfirm(
            "Supprimer le collaborateur",
            `Voulez-vous vraiment supprimer "${name}" ? Cette action est irréversible.`,
            async () => {
                try {
                    const res = await api.delete(`/collabs/delete/${id}`)
                    if (res.data.success) {
                        addToast('success', 'Collaborateur supprimé', `${name} a été supprimé avec succès`)
                        triggerRefresh()
                    } else {
                        addToast('error', 'Erreur', res.data.message || 'Impossible de supprimer')
                    }
                } catch {
                    addToast('error', 'Erreur', 'Impossible de supprimer le collaborateur')
                }
            },
            {
                confirmText: 'Supprimer',
                cancelText: 'Annuler',
                type: 'danger'
            }
        )
    }

    const filteredCollaborators = useMemo(() => {
        if (!searchTerm.trim()) return collaborators
        return collaborators.filter(collab =>
            collab.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            collab.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [collaborators, searchTerm])

    const getInitials = (fullname: string) => {
        return fullname
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .substring(0, 2)
            .toUpperCase()
    }

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
        <section className="w-full h-full bg-white rounded-xl md:rounded-2xl shadow-sm">
            {/* Header */}
            <div className="p-4 md:p-5 lg:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gray-50/50">
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex w-10 h-10 md:w-12 md:h-12 bg-indigo-50 rounded-xl items-center justify-center">
                        <Users className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-gray-800">Collaborateurs</h2>
                        <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                            Gérez les membres de votre équipe ({collaborators.length} au total)
                        </p>
                    </div>
                </div>

                <Button
                    onClick={handleAdd}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 md:px-5 py-2.5 rounded-lg md:rounded-xl transition-all shadow-lg shadow-indigo-100 font-medium w-full sm:w-auto"
                >
                    <Plus className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden sm:inline">Ajouter</span>
                    <span className="sm:hidden">Ajouter un collaborateur</span>
                </Button>
            </div>

            {/* Barre de recherche */}
            <div className="p-3 md:p-4 border-b border-gray-100">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Rechercher un collaborateur..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg md:rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                </div>
            </div>

            {/* État de chargement */}
            {loading ? (
                <div className="p-6 md:p-8 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin text-indigo-600" />
                </div>
            ) : filteredCollaborators.length > 0 ? (
                <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {filteredCollaborators.map((collab) => (
                        <div
                            key={collab.id}
                            className="group relative border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-5 hover:border-indigo-300 hover:shadow-lg transition-all bg-white flex flex-col"
                        >
                            <div className="flex flex-col items-center flex-1">
                                {/* Avatar avec image ou initiales */}
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden mb-3 flex items-center justify-center shrink-0">
                                    {collab.image ? (
                                        <Img
                                            src={collab.image}
                                            alt={collab.fullname}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className={`w-full h-full rounded-full flex items-center justify-center font-bold text-lg md:text-xl ${getAvatarColor(collab.id)}`}>
                                            {getInitials(collab.fullname)}
                                        </div>
                                    )}
                                </div>

                                <h3 className="font-bold text-gray-900 text-center text-sm md:text-base line-clamp-1">
                                    {collab.fullname}
                                </h3>
                                <p className="text-xs md:text-sm text-indigo-600 font-medium mb-2 md:mb-3 flex items-center gap-1">
                                    <Briefcase className="w-3 h-3 md:w-3.5 md:h-3.5 shrink-0" />
                                    {collab.jobTitle}
                                </p>

                                {collab.link && (
                                    <a
                                        href={collab.link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs text-gray-400 hover:text-indigo-600 transition-colors mb-3 flex items-center gap-1 truncate max-w-full"
                                    >
                                        <Mail className="w-3 h-3 shrink-0" />
                                        <span className="truncate">{collab.link.replace(/^https?:\/\//, '')}</span>
                                    </a>
                                )}

                                <div className="flex w-full gap-2 mt-auto pt-3 md:pt-4 border-t border-gray-100">
                                    <Button
                                        onClick={() => handleEdit(collab.id)}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs md:text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                    >
                                        <Edit3 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                        Modifier
                                    </Button>
                                    <Button
                                        onClick={() => handleDelete(collab.id, collab.fullname)}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs md:text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                        Supprimer
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center p-4">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        {searchTerm ? (
                            <Search className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
                        ) : (
                            <Users className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
                        )}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-700 mb-2">
                        {searchTerm ? 'Aucun collaborateur trouvé' : 'Aucun collaborateur'}
                    </h3>
                    <p className="text-sm md:text-base text-gray-500 mb-6 max-w-md">
                        {searchTerm
                            ? `Aucun résultat pour "${searchTerm}". Essayez avec un autre terme.`
                            : 'Commencez par ajouter votre premier collaborateur.'}
                    </p>
                    {!searchTerm && (
                        <Button
                            onClick={handleAdd}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-medium"
                        >
                            <Plus className="w-4 h-4 md:w-5 md:h-5" />
                            Ajouter un collaborateur
                        </Button>
                    )}
                </div>
            )}
        </section>
    )
}

export default CollabsList