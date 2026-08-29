import { Plus, Edit3, Trash2, Loader2, Search, Users, Mail, Briefcase } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../ui/Button'
import { useEffect, useState, useMemo } from 'react'
import api from '../../../axios/api'
import { useNotification } from '../../../hooks/useNotification'

interface Collaborator {
    id: number
    fullname: string
    jobTitle: string
    link: string
}

// ✅ Données statiques de démonstration
const STATIC_COLLABORATORS: Collaborator[] = [
    { id: 1, fullname: "Jean Dupont", jobTitle: "Développeur Frontend", link: "https://github.com/jeandupont" },
    { id: 2, fullname: "Marie Martin", jobTitle: "Développeuse Backend", link: "https://github.com/mariemartin" },
    { id: 3, fullname: "Pierre Bernard", jobTitle: "Designer UI/UX", link: "https://dribbble.com/pierrebernard" },
    { id: 4, fullname: "Sophie Petit", jobTitle: "Chef de Projet", link: "https://linkedin.com/in/sophiepetit" },
    { id: 5, fullname: "Lucas Moreau", jobTitle: "Développeur Fullstack", link: "https://github.com/lucasmoreau" },
    { id: 6, fullname: "Emma Garcia", jobTitle: "Data Scientist", link: "https://github.com/emmagarcia" },
    { id: 7, fullname: "Thomas Roux", jobTitle: "DevOps Engineer", link: "https://github.com/thomasroux" },
    { id: 8, fullname: "Léa Fournier", jobTitle: "Product Manager", link: "https://linkedin.com/in/leafournier" },
    { id: 9, fullname: "Hugo Girard", jobTitle: "Développeur Mobile", link: "https://github.com/hugogirard" },
    { id: 10, fullname: "Chloé Lambert", jobTitle: "UX Researcher", link: "https://linkedin.com/in/chloelambert" },
    { id: 11, fullname: "Antoine Mercier", jobTitle: "Architecte Logiciel", link: "https://github.com/antoinemercier" },
    { id: 12, fullname: "Camille Bonnet", jobTitle: "Développeuse Frontend", link: "https://github.com/camillebonnet" },
    { id: 13, fullname: "Nicolas Faure", jobTitle: "Ingénieur QA", link: "https://linkedin.com/in/nicolasfaure" },
    { id: 14, fullname: "Julie Morel", jobTitle: "Développeuse Backend", link: "https://github.com/juliemorel" },
    { id: 15, fullname: "Maxime Chevalier", jobTitle: "Tech Lead", link: "https://github.com/maximechevalier" }
]

function CollabsList() {
    const [collaborators, setCollaborators] = useState<Collaborator[]>(STATIC_COLLABORATORS) // ✅ Utiliser les données statiques par défaut
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [refresh, setRefresh] = useState<boolean>(false)

    const navigate = useNavigate()
    const { addToast, showConfirm } = useNotification()
    
    const handleAdd = () => navigate("/collabs/add")
    const handleEdit = (id: number) => navigate(`/collabs/update/${id}`)
    
    const triggerRefresh = () => {
        setRefresh(true)
        setTimeout(() => {
            setRefresh(false)
        }, 5000)
    }

    const handleDelete = (id: number, name: string) => {
        showConfirm(
            "Supprimer le collaborateur", 
            `Voulez-vous vraiment supprimer "${name}" ? Cette action est irréversible.`, 
            async () => {
                try {
                    // Pour la démo, on supprime localement
                    setCollaborators(prev => prev.filter(c => c.id !== id))
                    addToast('success', 'Collaborateur supprimé', `${name} a été supprimé avec succès`)
                    
                    // Essayer aussi l'API si elle existe
                    try {
                        const res = await api.delete(`/collabs/delete/${id}`)
                        if (res.data.success) {
                            triggerRefresh()
                        }
                    } catch {
                        // Ignorer les erreurs API pour la démo
                    }
                } catch {
                    addToast('error', 'Erreur', 'Impossible de supprimer')
                }
            },
            {
                confirmText: 'Supprimer',
                cancelText: 'Annuler',
                type: 'danger'
            }
        )
    }

    useEffect(() => {
        const fetchCollabs = async () => {
            setLoading(true)
            try {
                const res = await api.get("/collabs/all")
                if (res.data.success && res.data.collabs && res.data.collabs.length > 0) {
                    const data: Collaborator[] = res.data.collabs
                    setCollaborators(data)
                }
                // Si l'API ne renvoie rien, on garde les données statiques
            } catch (error) {
                console.log("Erreur API, utilisation des données statiques:", error)
                // On garde les données statiques en cas d'erreur
            } finally {
                setLoading(false)
            }
        }

        // Essayer de charger depuis l'API, sinon garder les statiques
        fetchCollabs()
    }, [refresh, addToast])

    // Filtrer les collaborateurs
    const filteredCollaborators = useMemo(() => {
        if (!searchTerm.trim()) return collaborators
        return collaborators.filter(collab => 
            collab.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            collab.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [collaborators, searchTerm])

    // Obtenir les initiales
    const getInitials = (fullname: string) => {
        return fullname
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .substring(0, 2)
            .toUpperCase()
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
        <section className="w-full h-full bg-white rounded-xl md:rounded-2xl shadow-sm overflow-hidden">
            {/* Header avec bouton Ajouter */}
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
            {loading && collaborators.length === 0 ? (
                <div className="p-6 md:p-8">
                    <div className="flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                </div>
            ) : filteredCollaborators.length > 0 ? (
                /* Grille des collaborateurs */
                <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {filteredCollaborators.map((collab) => (
                        <div 
                            key={collab.id} 
                            className="group relative border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-5 hover:border-indigo-300 hover:shadow-lg transition-all bg-white flex flex-col"
                        >
                            <div className="flex flex-col items-center flex-1">
                                {/* Avatar avec initiales */}
                                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-3 font-bold text-lg md:text-xl transition-all group-hover:scale-110 ${getAvatarColor(collab.id)}`}>
                                    {getInitials(collab.fullname)}
                                </div>

                                {/* Textes */}
                                <h3 className="font-bold text-gray-900 text-center text-sm md:text-base line-clamp-1">
                                    {collab.fullname}
                                </h3>
                                <p className="text-xs md:text-sm text-indigo-600 font-medium mb-3 md:mb-4 flex items-center gap-1">
                                    <Briefcase className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                    {collab.jobTitle}
                                </p>

                                {/* Lien */}
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

                                {/* Actions */}
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
                /* État vide */
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