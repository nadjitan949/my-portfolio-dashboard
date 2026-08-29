import { ArrowLeft, Edit3, Info, Trash2, Loader2, Award, FolderOpen, Calendar, BarChart3 } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import api from "../../../axios/api"
import Button from "../../../ui/Button"
import Img from "../../../ui/Img"
import { useNotification } from "../../../hooks/useNotification"

interface Skills {
    id: number
    name: string
    image: string
    level: string
    description: string
    categoryId: number
    createdAt?: string
}

interface Category {
    id: number
    name: string
    icone: string
}

function SkillsDetails() {
    const [skill, setSkill] = useState<Skills | null>(null)
    const [loading, setLoading] = useState(true)
    const [categorie, setCategories] = useState<Category | null>(null)
    const [error, setError] = useState<string>("")

    const { id } = useParams()
    const navigate = useNavigate()
    const { addToast, showConfirm } = useNotification()

    const goBack = () => navigate(-1)
    
    // ✅ Correction : Route de mise à jour
    const handleEdit = () => navigate(`/competances/update/${id}`)

    useEffect(() => {
        const fetchSkillDetail = async () => {
            setLoading(true)
            setError("")
            try {
                const res = await api.get(`/skills/details/${id}`)
                if (res.data.success) {
                    setSkill(res.data.skill)
                } else {
                    setError(res.data.message || "Compétence introuvable")
                    addToast('error', 'Erreur', res.data.message || 'Impossible de charger la compétence')
                }
            } catch (error) {
                console.error("Erreur: ", error)
                setError("Impossible de charger les détails de la compétence")
                addToast('error', 'Erreur', 'Impossible de charger la compétence')
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchSkillDetail()
        }
    }, [id])

    useEffect(() => {
        if (!skill?.categoryId) return

        const fetchCategories = async () => {
            try {
                const res = await api.get(`/categories/details/${skill.categoryId}`)
                if (res.data.success) {
                    setCategories(res.data.category)
                }
            } catch (error) {
                console.error("Erreur: ", error)
            }
        }

        fetchCategories()
    }, [skill?.categoryId])

    const handleDelete = () => {
        showConfirm(
            "Supprimer la compétence",
            `Voulez-vous vraiment supprimer la compétence "${skill?.name}" ? Cette action est irréversible.`,
            async () => {
                try {
                    // ✅ Correction : Utiliser la bonne route API
                    const res = await api.delete(`/skills/destroy/${id}`) // ou `/skills/delete/${id}` selon votre backend
                    
                    if (res.data.success) {
                        addToast('success', 'Compétence supprimée', 'La compétence a été supprimée avec succès')
                        // ✅ Redirection vers la liste après suppression
                        setTimeout(() => navigate('/competances'), 500)
                    } else {
                        addToast('error', 'Erreur', res.data.message || 'Impossible de supprimer')
                    }
                } catch (error) {
                    console.error("Erreur lors de la suppression: ", error)
                    addToast('error', 'Erreur', 'Impossible de supprimer la compétence')
                }
            },
            {
                confirmText: 'Supprimer',
                cancelText: 'Annuler',
                type: 'danger'
            }
        )
    }

    // Obtenir la couleur selon le niveau
    const getLevelColor = (level?: string) => {
        switch (level?.toLowerCase()) {
            case 'debutant':
            case 'débutant':
                return 'bg-blue-100 text-blue-700'
            case 'intermediaire':
            case 'intermédiaire':
                return 'bg-yellow-100 text-yellow-700'
            case 'avance':
            case 'avancé':
                return 'bg-green-100 text-green-700'
            case 'expert':
                return 'bg-purple-100 text-purple-700'
            default:
                return 'bg-gray-100 text-gray-700'
        }
    }

    // Formater la date
    const formatDate = (date?: string) => {
        if (!date) return ''
        return new Date(date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    // État de chargement
    if (loading) {
        return (
            <section className="w-full h-full bg-white rounded-xl md:rounded-2xl shadow-sm overflow-hidden flex items-center justify-center">
                <div className="text-center p-8">
                    <Loader2 size={40} className="animate-spin text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Chargement des détails...</p>
                </div>
            </section>
        )
    }

    // État d'erreur
    if (error && !skill) {
        return (
            <section className="w-full h-full bg-white rounded-xl md:rounded-2xl shadow-sm overflow-hidden flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Award size={32} className="text-red-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Compétence introuvable</h2>
                    <p className="text-gray-500 mb-6">{error || "Cette compétence n'existe pas ou a été supprimée."}</p>
                    <Button 
                        onClick={goBack}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all inline-flex items-center gap-2"
                    >
                        <ArrowLeft size={18} />
                        Retour à la liste
                    </Button>
                </div>
            </section>
        )
    }

    return (
        <section className="w-full h-full bg-white rounded-xl md:rounded-2xl shadow-sm overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 md:p-6 bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                <button
                    onClick={goBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors font-medium"
                >
                    <ArrowLeft size={18} md:size={20} />
                    <span className="hidden sm:inline">Retour à la liste</span>
                    <span className="sm:hidden">Retour</span>
                </button>
                
                <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
                    <Button 
                        onClick={handleEdit} 
                        className="flex-1 sm:flex-none p-2 md:p-2.5 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg md:rounded-xl transition-colors flex items-center justify-center gap-2"
                        title="Modifier la compétence"
                    >
                        <Edit3 size={16} md:size={20} />
                        <span className="hidden md:inline text-sm font-medium">Modifier</span>
                    </Button>
                    <Button 
                        onClick={handleDelete} 
                        className="flex-1 sm:flex-none p-2 md:p-2.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg md:rounded-xl transition-colors flex items-center justify-center gap-2"
                        title="Supprimer la compétence"
                    >
                        <Trash2 size={16} md:size={20} />
                        <span className="hidden md:inline text-sm font-medium">Supprimer</span>
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="p-4 md:p-8 lg:p-12 flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-12">
                    {/* Gauche : Image */}
                    <div className="w-full lg:w-1/3 flex flex-col items-center">
                        <div className="w-full max-w-[200px] md:max-w-[250px] aspect-square bg-slate-50 border-2 border-dashed border-gray-200 rounded-xl md:rounded-2xl flex items-center justify-center p-4 md:p-6 mb-4 overflow-hidden">
                            {skill?.image ? (
                                <Img 
                                    src={skill.image} 
                                    alt={skill.name} 
                                    className="max-w-full max-h-full object-contain" 
                                />
                            ) : (
                                <div className="text-gray-300 text-center uppercase font-bold text-3xl md:text-4xl">
                                    {skill?.name.substring(0, 2)}
                                </div>
                            )}
                        </div>
                        
                        <span className={`px-4 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-bold tracking-wide uppercase ${getLevelColor(skill?.level)}`}>
                            {skill?.level || 'Non défini'}
                        </span>

                        {skill?.createdAt && (
                            <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                                <Calendar size={12} />
                                Créé le {formatDate(skill.createdAt)}
                            </p>
                        )}
                    </div>

                    {/* Droite : Contenu */}
                    <div className="w-full lg:w-2/3 space-y-5 md:space-y-8">
                        <div>
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3 break-words">
                                {skill?.name}
                            </h1>
                            
                            <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">
                                    {categorie?.icone ? (
                                        <div dangerouslySetInnerHTML={{ __html: categorie.icone }} className="text-lg" />
                                    ) : (
                                        <FolderOpen size={16} />
                                    )}
                                    <span className="font-medium text-sm md:text-base">
                                        {categorie?.name || 'Catégorie non définie'}
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                                    <BarChart3 size={14} />
                                    <span className="text-sm font-medium capitalize">
                                        {skill?.level || 'Niveau non défini'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 md:p-6 rounded-xl md:rounded-2xl border-l-4 border-indigo-500">
                            <h3 className="flex items-center gap-2 text-gray-500 text-xs md:text-sm font-bold uppercase mb-2 md:mb-3">
                                <Info size={14} md:size={16} /> 
                                Description
                            </h3>
                            <p className="text-gray-700 text-sm md:text-base lg:text-lg leading-relaxed break-words">
                                {skill?.description || "Aucune description disponible."}
                            </p>
                        </div>

                        {/* Informations supplémentaires */}
                        {skill?.id && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                <div className="bg-gray-50 p-3 md:p-4 rounded-lg md:rounded-xl">
                                    <p className="text-xs text-gray-400 font-semibold uppercase mb-1">ID de la compétence</p>
                                    <p className="text-sm md:text-base font-medium text-gray-700">#{skill.id}</p>
                                </div>
                                <div className="bg-gray-50 p-3 md:p-4 rounded-lg md:rounded-xl">
                                    <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Catégorie ID</p>
                                    <p className="text-sm md:text-base font-medium text-gray-700">#{skill.categoryId || 'N/A'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default SkillsDetails