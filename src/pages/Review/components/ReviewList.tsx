import { Plus, Star, Trash2, MessageSquare, Calendar, User, Search } from 'lucide-react'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../axios/api'
import Button from '../../../ui/Button'
import { useNotification } from '../../../hooks/useNotification'

interface Review {
    id: number
    author: string
    rating: number
    content: string
    createdAt: string
    updatedAt: string
}

function ReviewList() {
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterRating, setFilterRating] = useState<number | 'all'>('all')
    const [refresh, setRefresh] = useState(false)

    const navigate = useNavigate()
    const { addToast, showConfirm } = useNotification()
    
    const handleAdd = () => navigate("/reviews/add")

    const triggerRefresh = () => {
        setRefresh(true)
        setTimeout(() => {
            setRefresh(false)
        }, 5000)
    }

    const fetchReviews = useCallback(async () => {
        setLoading(true)
        try {
            const res = await api.get("/reviews/all")
            if (res.data.success) {
                setReviews(res.data.reviews || [])
            } else {
                addToast('error', 'Erreur', res.data.message || 'Impossible de charger les avis')
            }
        } catch (error) {
            console.error("Erreur: ", error)
            addToast('error', 'Erreur', 'Impossible de charger les avis')
        } finally {
            setLoading(false)
        }
    }, [addToast])

    useEffect(() => {
        fetchReviews()
    }, [fetchReviews, refresh])

    const handleDelete = (id: number, author: string) => {
        showConfirm(
            "Supprimer l'avis", 
            `Voulez-vous vraiment supprimer l'avis de "${author}" ? Cette action est irréversible.`, 
            async () => {
                try {
                    const res = await api.delete(`/reviews/delete/${id}`)
                    if (res.data.success) {
                        addToast('success', 'Avis supprimé', "L'avis a été supprimé avec succès")
                        triggerRefresh()
                    } else {
                        addToast('error', 'Erreur', res.data.message || 'Impossible de supprimer')
                    }
                } catch {
                    addToast('error', 'Erreur', "Impossible de supprimer l'avis")
                }
            },
            {
                confirmText: 'Supprimer',
                cancelText: 'Annuler',
                type: 'danger'
            }
        )
    }

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`w-3.5 h-3.5 md:w-4 md:h-4 ${
                            i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"
                        }`}
                    />
                ))}
            </div>
        )
    }

    const formatDate = (dateStr: string) => {
        if (!dateStr) return ''
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    // Filtrer les avis
    const filteredReviews = useMemo(() => {
        return reviews.filter(review => {
            const matchesSearch = 
                review.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                review.content.toLowerCase().includes(searchTerm.toLowerCase())
            
            const matchesRating = filterRating === 'all' || review.rating === filterRating
            
            return matchesSearch && matchesRating
        })
    }, [reviews, searchTerm, filterRating])

    // Calculer la note moyenne
    const averageRating = useMemo(() => {
        if (reviews.length === 0) return 0
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
        return (sum / reviews.length).toFixed(1)
    }, [reviews])

    // Obtenir la couleur de l'avatar
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
        <section className="w-full bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-4 md:p-5 lg:p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gray-50/30">
                <div className="flex items-center gap-3">
                    <div className="p-2 md:p-2.5 bg-amber-100 text-amber-600 rounded-lg md:rounded-xl shrink-0">
                        <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-gray-800">Avis & Commentaires</h2>
                        <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                            Gérez les retours d'expérience ({reviews.length} au total)
                            {Number(averageRating) > 0 && (
                                <span className="ml-2 inline-flex items-center gap-1 text-amber-500">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    {averageRating}/5
                                </span>
                            )}
                        </p>
                    </div>
                </div>
                
                <Button
                    onClick={handleAdd}
                    className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white px-4 md:px-5 py-2.5 rounded-lg md:rounded-xl text-sm font-semibold transition-all shadow-lg shadow-gray-200 w-full sm:w-auto"
                >
                    <Plus className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden sm:inline">Ajouter un avis</span>
                    <span className="sm:hidden">Ajouter</span>
                </Button>
            </div>

            {/* Barre d'outils */}
            <div className="flex flex-col sm:flex-row gap-3 p-3 md:p-4 border-b border-gray-100">
                {/* Recherche */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Rechercher un avis..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg md:rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                    />
                </div>

                {/* Filtre par note */}
                <select
                    value={filterRating}
                    onChange={(e) => setFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="px-4 py-2.5 border border-gray-200 rounded-lg md:rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none bg-white cursor-pointer"
                >
                    <option value="all">Toutes les notes</option>
                    <option value={5}>5 étoiles</option>
                    <option value={4}>4 étoiles</option>
                    <option value={3}>3 étoiles</option>
                    <option value={2}>2 étoiles</option>
                    <option value={1}>1 étoile</option>
                </select>
            </div>

            {/* État de chargement */}
            {loading ? (
                <div className="p-4 md:p-6 space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="p-4 md:p-6 rounded-xl border border-gray-100 animate-pulse">
                            <div className="flex gap-3 md:gap-4">
                                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                                    <div className="h-3 bg-gray-200 rounded w-full" />
                                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredReviews.length > 0 ? (
                /* Liste des commentaires */
                <div className="divide-y divide-gray-100">
                    {filteredReviews.map((review) => (
                        <div key={review.id} className="p-4 md:p-6 hover:bg-gray-50/50 transition-colors group">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 md:gap-4">
                                <div className="flex gap-3 md:gap-4 flex-1 min-w-0">
                                    {/* Avatar Initial */}
                                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm md:text-base shrink-0 ${getAvatarColor(review.id)}`}>
                                        {review.author.charAt(0).toUpperCase()}
                                    </div>

                                    <div className="space-y-1 md:space-y-2 flex-1 min-w-0">
                                        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                                            <span className="font-bold text-gray-900 text-sm md:text-base truncate">
                                                {review.author}
                                            </span>
                                            <span className="text-gray-300 hidden sm:inline">|</span>
                                            {renderStars(review.rating)}
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed wrap-break-words">
                                            {review.content}
                                        </p>
                                        <div className="flex items-center gap-3 md:gap-4 mt-1.5 md:mt-2 text-xs text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(review.createdAt)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                {review.author}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 self-end md:self-start opacity-100 xl:opacity-0 xl:group-hover:opacity-100 transition-opacity shrink-0">
                                    <Button 
                                        onClick={() => handleDelete(review.id, review.author)} 
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        title="Supprimer"
                                    >
                                        <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
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
                        {searchTerm || filterRating !== 'all' ? (
                            <Search className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
                        ) : (
                            <User className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
                        )}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-700 mb-2">
                        {searchTerm || filterRating !== 'all' ? 'Aucun avis trouvé' : 'Aucun commentaire'}
                    </h3>
                    <p className="text-sm md:text-base text-gray-500 mb-6 max-w-md">
                        {searchTerm || filterRating !== 'all' 
                            ? 'Aucun résultat ne correspond à vos critères de recherche.'
                            : 'Aucun commentaire pour le moment.'}
                    </p>
                    {!searchTerm && filterRating === 'all' && (
                        <Button 
                            onClick={handleAdd}
                            className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-black transition-colors font-medium"
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

export default ReviewList