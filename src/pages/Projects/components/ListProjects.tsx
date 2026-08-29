import { useEffect, useState, useMemo } from "react"
import {
    ExternalLink,
    Pencil,
    Plus,
    Trash2,
    Github,
    Monitor,
    Globe,
    Search,
    Grid3x3,
    List,
    FolderGit2
} from "lucide-react"
import api from "../../../axios/api"
import Button from "../../../ui/Button"
import { useNavigate } from "react-router-dom"
import Img from "../../../ui/Img"
import { useNotification } from "../../../hooks/useNotification"

interface Project {
    id: number
    title: string
    computerView: string
    collabTags: string[] | null
    tools: string[] | null
    desciption: string
    type: string
    status: string
    live: string | null
    github: string | null
}

function ListProjects() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [refresh, setRefresh] = useState(false)

    const navigate = useNavigate()
    const { addToast, showConfirm } = useNotification()

    const detailsProject = (id: number) => navigate(`/projets/${id}`)
    const addProject = () => navigate("/projets/add")
    const editProject = (id: number) => navigate(`/projets/update/${id}`)

    const triggerRefresh = () => {
        setRefresh(true)
        setTimeout(() => {
            setRefresh(false)
        }, 5000)
    }

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true)
            try {
                const res = await api.get("/projects/all")
                if (res.data.success) {
                    const formattedProjects = res.data.projects.map((project: Project) => ({
                        ...project,
                        tools: typeof project.tools === 'string' ? JSON.parse(project.tools) : project.tools,
                        collabTags: typeof project.collabTags === 'string' ? JSON.parse(project.collabTags) : project.collabTags
                    }))
                    setProjects(formattedProjects)
                } else {
                    addToast('error', 'Erreur', res.data.message || 'Impossible de charger les projets')
                }
            } catch (error) {
                console.error("Erreur:", error)
                addToast('error', 'Erreur', 'Impossible de charger les projets')
            } finally {
                setLoading(false)
            }
        }
        fetchProjects()
    }, [refresh, addToast])

    const handleDelete = (id: number, title: string) => {
        showConfirm(
            "Supprimer le projet", 
            `Voulez-vous vraiment supprimer le projet "${title}" ? Cette action est irréversible.`, 
            async () => {
                try {
                    const res = await api.delete(`/projects/delete/${id}`)
                    if (res.data.success) {
                        addToast('success', 'Projet supprimé', 'Le projet a été supprimé avec succès')
                        triggerRefresh()
                    } else {
                        addToast('error', 'Erreur', res.data.message || 'Impossible de supprimer')
                    }
                } catch {
                    addToast('error', 'Erreur', 'Impossible de supprimer le projet')
                }
            },
            {
                confirmText: 'Supprimer',
                cancelText: 'Annuler',
                type: 'danger'
            }
        )
    }

    // Filtrer les projets
    const filteredProjects = useMemo(() => {
        return projects.filter(project => {
            const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  project.type.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesStatus = statusFilter === 'all' || project.status === statusFilter
            return matchesSearch && matchesStatus
        })
    }, [projects, searchTerm, statusFilter])

    // Obtenir les statuts uniques
    const statuses = useMemo(() => {
        const uniqueStatuses = new Set(projects.map(project => project.status))
        return Array.from(uniqueStatuses)
    }, [projects])

    // Obtenir la couleur du statut
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'terminé':
            case 'termine':
                return 'bg-emerald-100 text-emerald-700'
            case 'en cours':
                return 'bg-blue-100 text-blue-700'
            case 'en pause':
                return 'bg-amber-100 text-amber-700'
            case 'abandonné':
            case 'abandonne':
                return 'bg-red-100 text-red-700'
            default:
                return 'bg-gray-100 text-gray-700'
        }
    }

    return (
        <section className="w-full overflow-hidden bg-white rounded-xl md:rounded-2xl shadow-sm">
            {/* Header */}
            <div className="p-4 md:p-5 lg:p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gray-50/50">
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex w-10 h-10 md:w-12 md:h-12 bg-indigo-50 rounded-xl items-center justify-center">
                        <FolderGit2 className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-gray-800">Mes Projets</h2>
                        <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                            Liste de vos réalisations ({projects.length} au total)
                        </p>
                    </div>
                </div>
                
                <Button
                    onClick={addProject}
                    className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 md:px-5 py-2.5 rounded-lg md:rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 w-full sm:w-auto"
                >
                    <Plus className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden md:inline">Nouveau projet</span>
                    <span className="md:hidden">Ajouter</span>
                </Button>
            </div>

            {/* Barre d'outils */}
            <div className="flex flex-col sm:flex-row gap-3 p-3 md:p-4 border-b border-gray-100">
                {/* Recherche */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Rechercher un projet..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg md:rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                </div>

                {/* Filtre par statut */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 border border-gray-200 rounded-lg md:rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white cursor-pointer"
                >
                    <option value="all">Tous les statuts</option>
                    {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>

                {/* Toggle vue */}
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        title="Vue grille"
                    >
                        <Grid3x3 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        title="Vue liste"
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* État de chargement */}
            {loading ? (
                <div className="p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="p-4 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-16 h-10 bg-gray-200 rounded animate-pulse" />
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                                        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                                    </div>
                                </div>
                                <div className="h-3 bg-gray-200 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
            ) : filteredProjects.length > 0 ? (
                <>
                    {/* Vue grille */}
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 p-4 md:p-6">
                            {filteredProjects.map((project) => (
                                <div
                                    key={project.id}
                                    className="group rounded-xl md:rounded-2xl border border-gray-100 bg-white hover:border-indigo-200 hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden"
                                >
                                    {/* Image */}
                                    <div 
                                        className="h-40 md:h-48 overflow-hidden cursor-pointer relative bg-gray-50"
                                        onClick={() => detailsProject(project.id)}
                                    >
                                        {project.computerView ? (
                                            <Img 
                                                src={project.computerView} 
                                                alt={project.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <Monitor className="w-8 h-8 md:w-10 md:h-10" />
                                            </div>
                                        )}
                                        {/* Overlay au survol */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-sm font-medium px-4 py-2 rounded-lg">
                                                Voir les détails
                                            </span>
                                        </div>
                                    </div>

                                    {/* Contenu */}
                                    <div className="p-4 md:p-5 flex flex-col flex-1">
                                        <h3 
                                            className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors text-sm md:text-base cursor-pointer truncate"
                                            onClick={() => detailsProject(project.id)}
                                        >
                                            {project.title}
                                        </h3>
                                        
                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                            <span className="text-xs font-bold text-indigo-600 uppercase flex items-center gap-1">
                                                <Globe className="w-3 h-3" />
                                                {project.type}
                                            </span>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium ${getStatusColor(project.status)}`}>
                                                {project.status}
                                            </span>
                                        </div>

                                        {/* Outils */}
                                        {project.tools && project.tools.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-3">
                                                {project.tools.slice(0, 4).map((tool, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-gray-100 text-[10px] rounded text-gray-600 font-medium">
                                                        {tool}
                                                    </span>
                                                ))}
                                                {project.tools.length > 4 && (
                                                    <span className="px-2 py-0.5 bg-gray-100 text-[10px] rounded text-gray-400">
                                                        +{project.tools.length - 4}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Collabs */}
                                        {project.collabTags && project.collabTags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {project.collabTags.slice(0, 3).map((tag, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 mt-auto pt-3 md:pt-4 border-t border-gray-100">
                                            {project.live && (
                                                <a 
                                                    href={project.live} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                                                    title="Voir le site"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                            {project.github && (
                                                <a 
                                                    href={project.github} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="p-2 text-gray-400 hover:text-black transition-colors"
                                                    title="Voir le code"
                                                >
                                                    <Github className="w-4 h-4" />
                                                </a>
                                            )}
                                            <div className="flex-1" />
                                            <Button 
                                                onClick={() => editProject(project.id)} 
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Modifier"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button 
                                                onClick={() => handleDelete(project.id, project.title)} 
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Vue liste */
                        <div className="space-y-2 p-3 md:p-4">
                            {filteredProjects.map((project) => (
                                <div
                                    key={project.id}
                                    className="group flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border border-gray-100 bg-white hover:border-indigo-200 hover:shadow-sm transition-all"
                                >
                                    {/* Image et titre */}
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div 
                                            className="w-16 h-10 rounded-md overflow-hidden bg-gray-100 border border-gray-200 shrink-0 cursor-pointer"
                                            onClick={() => detailsProject(project.id)}
                                        >
                                            {project.computerView ? (
                                                <Img src={project.computerView} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <Monitor className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 
                                                className="font-bold text-gray-700 group-hover:text-indigo-600 transition-colors text-sm md:text-base truncate cursor-pointer"
                                                onClick={() => detailsProject(project.id)}
                                            >
                                                {project.title}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                <span className="text-xs font-bold text-indigo-600 uppercase flex items-center gap-1">
                                                    <Globe className="w-3 h-3" />
                                                    {project.type}
                                                </span>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(project.status)}`}>
                                                    {project.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Outils */}
                                    {project.tools && project.tools.length > 0 && (
                                        <div className="hidden md:flex flex-wrap gap-1 max-w-[200px]">
                                            {project.tools.slice(0, 3).map((tool, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-gray-100 text-[10px] rounded text-gray-600 font-medium">
                                                    {tool}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-1.5 md:gap-2 shrink-0">
                                        {project.live && (
                                            <a 
                                                href={project.live} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                title="Voir le site"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}
                                        {project.github && (
                                            <a 
                                                href={project.github} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-all"
                                                title="Voir le code"
                                            >
                                                <Github className="w-4 h-4" />
                                            </a>
                                        )}
                                        <Button 
                                            onClick={() => editProject(project.id)} 
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            title="Modifier"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button 
                                            onClick={() => handleDelete(project.id, project.title)} 
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            title="Supprimer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                /* État vide */
                <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center p-4">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        {searchTerm || statusFilter !== 'all' ? (
                            <Search className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
                        ) : (
                            <FolderGit2 className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
                        )}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-700 mb-2">
                        {searchTerm || statusFilter !== 'all' ? 'Aucun projet trouvé' : 'Aucun projet'}
                    </h3>
                    <p className="text-sm md:text-base text-gray-500 mb-6 max-w-md">
                        {searchTerm || statusFilter !== 'all' 
                            ? 'Aucun résultat ne correspond à vos critères de recherche.'
                            : 'Commencez par ajouter votre premier projet.'}
                    </p>
                    {!searchTerm && statusFilter === 'all' && (
                        <Button 
                            onClick={addProject}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-medium"
                        >
                            <Plus className="w-4 h-4 md:w-5 md:h-5" />
                            Ajouter un projet
                        </Button>
                    )}
                </div>
            )}
        </section>
    )
}

export default ListProjects