import { useEffect, useState } from "react"
import {
    ArrowLeft,
    Monitor,
    Smartphone,
    Tablet,
    Calendar,
    Tag,
    Wrench,
    Pencil,
    Trash,
    Link,
    Loader2,
    Github,
    ExternalLink,
    AlertCircle
} from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import api from "../../../axios/api"
import Button from "../../../ui/Button"
import Img from "../../../ui/Img"
import { useNotification } from "../../../hooks/useNotification"

interface Project {
    id: number;
    title: string;
    computerView: string | null
    tabletteView: string | null
    mobileView: string | null
    collabTags: string[] | null
    tools: string[] | null
    description: string | ""
    type: string | ""
    status: string | ""
    live: string | null
    github: string | null
    createdAt: string | null
}

function DetalsProject() {
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const params = useParams()
    const id = params.id
    const navigate = useNavigate()
    const { addToast, showConfirm } = useNotification()

    const goBack = () => navigate(-1)
    const editProject = (id: number) => navigate(`/projets/update/${id}`)

    // Formater la date
    const formatDate = (date?: string | null) => {
        if (!date) return ''
        return new Date(date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    // Construire l'URL complète
    const getFullUrl = (url: string | null) => {
        if (!url) return ''
        if (url.startsWith('http')) return url
        const base = api.defaults.baseURL || ''
        try {
            const origin = new URL(base).origin
            return `${origin}${url}`
        } catch {
            return url
        }
    }

    useEffect(() => {
        const detailsProject = async () => {
            setLoading(true)
            setError("")
            try {
                const res = await api.get(`/projects/details/${id}`)
                
                if (!res.data.success) {
                    setError(res.data.message || "Projet introuvable")
                    addToast('error', 'Erreur', res.data.message || 'Projet introuvable')
                    return
                }

                const rawData = res.data.project
                
                // Nettoyage des données
                const formattedData: Project = {
                    ...rawData,
                    tools: typeof rawData.tools === 'string' 
                        ? JSON.parse(rawData.tools) 
                        : rawData.tools,
                    collabTags: typeof rawData.collabTags === 'string' 
                        ? JSON.parse(rawData.collabTags) 
                        : rawData.collabTags
                }

                setSelectedProject(formattedData)
                
            } catch (error) {
                console.error("Erreur: ", error)
                setError("Impossible de charger les détails du projet")
                addToast('error', 'Erreur', 'Impossible de charger les détails')
            } finally {
                setLoading(false)
            }
        }

        if (id) detailsProject()
    }, [id, addToast])

    const handleDelete = () => {
        showConfirm(
            "Supprimer le projet", 
            `Voulez-vous vraiment supprimer le projet "${selectedProject?.title}" ? Cette action est irréversible.`, 
            async () => {
                try {
                    const res = await api.delete(`/projects/delete/${id}`)
                    if (res.data.success) {
                        addToast('success', 'Projet supprimé', 'Le projet a été supprimé avec succès')
                        setTimeout(() => navigate('/projets'), 500)
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

    // État de chargement
    if (loading) {
        return (
            <main className="w-full h-full bg-white rounded-xl md:rounded-2xl shadow-sm overflow-hidden flex items-center justify-center">
                <div className="text-center p-8">
                    <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin text-indigo-600 mx-auto mb-3 md:mb-4" />
                    <p className="text-sm md:text-base text-gray-500 font-medium">Chargement du projet...</p>
                </div>
            </main>
        )
    }

    // État d'erreur
    if (error && !selectedProject) {
        return (
            <main className="w-full h-full bg-white rounded-xl md:rounded-2xl shadow-sm overflow-hidden flex items-center justify-center p-4 md:p-8">
                <div className="text-center max-w-md w-full">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                        <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-red-400" />
                    </div>
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Projet introuvable</h2>
                    <p className="text-sm md:text-base text-gray-500 mb-4 md:mb-6">{error || "Ce projet n'existe pas ou a été supprimé."}</p>
                    <Button 
                        onClick={goBack}
                        className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all inline-flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                        Retour à la liste
                    </Button>
                </div>
            </main>
        )
    }

    return (
        <main className="w-full h-full bg-white rounded-xl md:rounded-2xl shadow-sm overflow-auto">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header du Détail */}
                <div className="p-4 md:p-5 lg:p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 bg-white/80 backdrop-blur-md z-10">
                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                        <Button
                            onClick={goBack}
                            className="p-2 md:p-2.5 hover:bg-gray-100 rounded-full transition-colors shrink-0"
                        >
                            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                        </Button>
                        <div className="min-w-0">
                            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800 truncate">
                                {selectedProject?.title}
                            </h2>
                            <p className="text-xs md:text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                                <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5 shrink-0" /> 
                                <span className="truncate">Créé le {formatDate(selectedProject?.createdAt)}</span>
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
                        <Button 
                            onClick={() => editProject(selectedProject!.id)} 
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2 border border-gray-200 rounded-lg md:rounded-xl cursor-pointer hover:bg-gray-50 transition-all text-sm font-medium"
                            title="Modifier le projet"
                        >
                            <Pencil className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="hidden md:inline">Modifier</span>
                        </Button>
                        <Button 
                            onClick={handleDelete} 
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-red-500 text-white rounded-lg md:rounded-xl hover:bg-red-600 cursor-pointer transition-all text-sm font-medium shadow-lg shadow-red-100"
                            title="Supprimer le projet"
                        >
                            <Trash className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="hidden md:inline">Supprimer</span>
                        </Button>
                    </div>
                </div>

                <div className="p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
                    {/* COLONNE GAUCHE : Description et Tags */}
                    <div className="lg:col-span-1 space-y-6 md:space-y-8">
                        <section>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 md:mb-4">À propos du projet</h3>
                            <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm md:text-base wrap-break-words">
                                {selectedProject?.description || "Aucune description disponible."}
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 md:mb-4 flex items-center gap-2">
                                <Wrench className="w-3.5 h-3.5 md:w-4 md:h-4" /> 
                                Technologies utilisées
                            </h3>
                            {selectedProject?.tools && selectedProject.tools.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {selectedProject.tools.map((tool, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs md:text-sm font-semibold">
                                            {tool}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400">Aucune technologie spécifiée</p>
                            )}
                        </section>

                        <section>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 md:mb-4 flex items-center gap-2">
                                <Tag className="w-3.5 h-3.5 md:w-4 md:h-4" /> 
                                Tags
                            </h3>
                            {selectedProject?.collabTags && selectedProject.collabTags.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {selectedProject.collabTags.map((tag, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs md:text-sm font-semibold uppercase">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400">Aucun tag</p>
                            )}
                        </section>

                        <section>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 md:mb-4 flex items-center gap-2">
                                <Link className="w-3.5 h-3.5 md:w-4 md:h-4" /> 
                                Liens
                            </h3>
                            <div className="space-y-2">
                                {selectedProject?.github && (
                                    <a 
                                        href={selectedProject.github} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-600 break-all"
                                    >
                                        <Github className="w-4 h-4 shrink-0" />
                                        <span className="truncate">{selectedProject.github}</span>
                                        <ExternalLink className="w-3 h-3 shrink-0 ml-auto" />
                                    </a>
                                )}
                                {selectedProject?.live && (
                                    <a 
                                        href={selectedProject.live} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-600 break-all"
                                    >
                                        <ExternalLink className="w-4 h-4 shrink-0" />
                                        <span className="truncate">{selectedProject.live}</span>
                                    </a>
                                )}
                                {!selectedProject?.github && !selectedProject?.live && (
                                    <p className="text-sm text-gray-400">Aucun lien disponible</p>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* COLONNE DROITE : Visualisation (Multi-Device) */}
                    <div className="lg:col-span-2 space-y-6 md:space-y-8">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Monitor className="w-3.5 h-3.5 md:w-4 md:h-4" /> 
                            Aperçus multi-supports
                        </h3>

                        <div className="space-y-5 md:space-y-6">
                            {/* Ordinateur */}
                            <div className="relative group">
                                <p className="text-[10px] md:text-xs font-bold text-gray-400 mb-2 flex items-center gap-1 uppercase">
                                    <Monitor className="w-3 h-3" /> Desktop View
                                </p>
                                <div className="rounded-lg md:rounded-xl border-4 border-gray-800 bg-gray-800 shadow-xl md:shadow-2xl overflow-hidden aspect-video">
                                    {selectedProject?.computerView ? (
                                        <Img src={getFullUrl(selectedProject.computerView)} className="w-full h-full object-cover" alt="Vue desktop" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 italic text-sm md:text-base">
                                            Aucun aperçu desktop
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                                {/* Tablette */}
                                <div className="relative">
                                    <p className="text-[10px] md:text-xs font-bold text-gray-400 mb-2 flex items-center gap-1 uppercase">
                                        <Tablet className="w-3 h-3" /> Tablet View
                                    </p>
                                    <div className="rounded-lg md:rounded-xl border-4 md:border-[6px] border-gray-800 bg-gray-800 shadow-lg md:shadow-xl overflow-hidden aspect-3/4 max-w-75 mx-auto w-full">
                                        {selectedProject?.tabletteView ? (
                                            <Img src={getFullUrl(selectedProject.tabletteView)} className="w-full h-full object-cover" alt="Vue tablette" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs md:text-sm">
                                                N/A
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Mobile */}
                                <div className="relative">
                                    <p className="text-[10px] md:text-xs font-bold text-gray-400 mb-2 flex items-center gap-1 uppercase">
                                        <Smartphone className="w-3 h-3" /> Mobile View
                                    </p>
                                    <div className="rounded-2xl md:rounded-3xl border-4 md:border-[6px] border-gray-800 bg-gray-800 shadow-lg md:shadow-xl overflow-hidden aspect-9/19 max-w-50 mx-auto w-full">
                                        {selectedProject?.mobileView ? (
                                            <Img src={getFullUrl(selectedProject.mobileView)} className="w-full h-full object-cover" alt="Vue mobile" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs md:text-sm">
                                                N/A
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default DetalsProject