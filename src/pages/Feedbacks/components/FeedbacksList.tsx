import { Plus, Quote, Trash2, Edit2, Calendar, Search, MessageSquareQuote } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../ui/Button'
import { useEffect, useState, useMemo, useCallback } from 'react'
import api from '../../../axios/api'
import Img from '../../../ui/Img'
import { useNotification } from '../../../hooks/useNotification'

interface Feedback {
    id: number
    author: string
    jobTitle: string
    content: string
    image: string | null
    createdAt: string
    updatedAt: string
}

function FeedbacksList() {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [refresh, setRefresh] = useState(false)

    const navigate = useNavigate()
    const { addToast, showConfirm } = useNotification()

    const handleAdd = () => navigate("/feedbacks/add")
    const handleEdit = (id: number) => navigate(`/feedbacks/update/${id}`)

    const triggerRefresh = () => {
        setRefresh(true)
        setTimeout(() => {
            setRefresh(false)
        }, 5000)
    }

    const fetchFeedbacks = useCallback(async () => {
        setLoading(true)
        try {
            const res = await api.get("/feedbacks/all")
            if (res.data.success) {
                setFeedbacks(res.data.feedbacks || [])
            } else {
                addToast('error', 'Erreur', res.data.message || 'Impossible de charger les feedbacks')
            }
        } catch (error) {
            console.error("Erreur: ", error)
            addToast('error', 'Erreur', 'Impossible de charger les feedbacks')
        } finally {
            setLoading(false)
        }
    }, [addToast])

    useEffect(() => {
        fetchFeedbacks()
    }, [fetchFeedbacks, refresh])

    const formatDate = (dateStr: string) => {
        if (!dateStr) return ''
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    const handleDelete = (id: number, author: string) => {
        showConfirm(
            "Supprimer le feedback", 
            `Voulez-vous vraiment supprimer le feedback de "${author}" ? Cette action est irréversible.`, 
            async () => {
                try {
                    const res = await api.delete(`/feedbacks/delete/${id}`)
                    if (res.data.success) {
                        addToast('success', 'Feedback supprimé', 'Le feedback a été supprimé avec succès')
                        triggerRefresh()
                    } else {
                        addToast('error', 'Erreur', res.data.message || 'Impossible de supprimer')
                    }
                } catch {
                    addToast('error', 'Erreur', 'Impossible de supprimer le feedback')
                }
            },
            {
                confirmText: 'Supprimer',
                cancelText: 'Annuler',
                type: 'danger'
            }
        )
    }

    // Filtrer les feedbacks
    const filteredFeedbacks = useMemo(() => {
        if (!searchTerm.trim()) return feedbacks
        return feedbacks.filter(fb => 
            fb.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fb.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fb.content.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [feedbacks, searchTerm])

    // Obtenir les initiales
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .substring(0, 2)
            .toUpperCase()
    }

    // Obtenir une couleur d'avatar
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
        <section className="w-full bg-white rounded-xl md:rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 md:p-5 lg:p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gray-50/50">
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex w-10 h-10 md:w-12 md:h-12 bg-indigo-50 rounded-xl items-center justify-center">
                        <MessageSquareQuote className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-gray-800">Témoignages & Feedbacks</h2>
                        <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                            Ce que les clients pensent de vos services ({feedbacks.length} au total)
                        </p>
                    </div>
                </div>
                
                <Button
                    onClick={handleAdd}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 md:px-5 py-2.5 rounded-lg md:rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-100 w-full sm:w-auto"
                >
                    <Plus className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden sm:inline">Ajouter un avis</span>
                    <span className="sm:hidden">Ajouter</span>
                </Button>
            </div>

            {/* Barre de recherche */}
            <div className="p-3 md:p-4 border-b border-gray-100">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Rechercher un feedback..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg md:rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                </div>
            </div>

            {/* État de chargement */}
            {loading ? (
                <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-5 md:p-6 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
                            <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                            <div className="h-3 bg-gray-200 rounded w-2/3 mb-6" />
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                                <div className="flex-1">
                                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                                    <div className="h-2 bg-gray-200 rounded w-1/3" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredFeedbacks.length > 0 ? (
                /* Grille de feedbacks */
                <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {filteredFeedbacks.map((fb) => (
                        <div 
                            key={fb.id} 
                            className="relative group bg-white border border-gray-200 rounded-xl md:rounded-2xl p-5 md:p-6 hover:shadow-lg hover:border-indigo-200 transition-all flex flex-col"
                        >
                            {/* Icône de citation en fond */}
                            <Quote className="absolute top-3 right-3 md:top-4 md:right-4 text-indigo-50 group-hover:text-indigo-100 transition-colors w-8 h-8 md:w-10 md:h-10" />

                            {/* Contenu du message */}
                            <div className="flex-1 mb-5 md:mb-6">
                                <p className="text-sm md:text-base text-gray-600 italic leading-relaxed relative z-10 wrap-break-words line-clamp-4">
                                    "{fb.content}"
                                </p>
                            </div>

                            {/* Pied de carte : Auteur */}
                            <div className="flex items-center gap-2.5 md:gap-3 pt-3 md:pt-4 border-t border-gray-100">
                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm md:text-base font-bold overflow-hidden border border-gray-200 shrink-0 ${getAvatarColor(fb.id)}`}>
                                    {fb.image ? (
                                        <Img src={fb.image} alt={fb.author} className="w-full h-full object-cover" />
                                    ) : (
                                        getInitials(fb.author)
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm md:text-base font-bold text-gray-900 truncate">{fb.author}</h4>
                                    <p className="text-xs md:text-sm text-indigo-600 font-medium truncate">{fb.jobTitle}</p>
                                </div>
                            </div>

                            {/* Date et Actions rapides */}
                            <div className="mt-3 md:mt-4 flex items-center justify-between text-gray-400">
                                <div className="flex items-center gap-1.5 text-[10px] md:text-xs uppercase tracking-wider font-semibold">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(fb.createdAt)}
                                </div>
                                <div className="flex gap-1 opacity-100 xl:opacity-0 xl:group-hover:opacity-100 transition-opacity">
                                    <Button 
                                        onClick={() => handleEdit(fb.id)} 
                                        className="p-1.5 md:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Modifier"
                                    >
                                        <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    </Button>
                                    <Button 
                                        onClick={() => handleDelete(fb.id, fb.author)} 
                                        className="p-1.5 md:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Supprimer"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* État vide */
                <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center p-4">
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-50 rounded-full flex items-center justify-center mb-3 md:mb-4">
                        {searchTerm ? (
                            <Search className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
                        ) : (
                            <MessageSquareQuote className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
                        )}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-700 mb-2">
                        {searchTerm ? 'Aucun feedback trouvé' : 'Aucun feedback'}
                    </h3>
                    <p className="text-sm md:text-base text-gray-500 mb-6 max-w-md">
                        {searchTerm 
                            ? `Aucun résultat pour "${searchTerm}". Essayez avec un autre terme.`
                            : 'Aucun feedback enregistré pour le moment.'}
                    </p>
                    {!searchTerm && (
                        <Button 
                            onClick={handleAdd}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-medium"
                        >
                            <Plus className="w-4 h-4 md:w-5 md:h-5" />
                            Ajouter un avis
                        </Button>
                    )}
                </div>
            )}
        </section>
    )
}

export default FeedbacksList