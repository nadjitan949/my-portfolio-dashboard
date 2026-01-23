import { Plus, Star, Trash2, MessageSquare, Calendar, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../axios/api'
import Button from '../../../ui/Button'

interface Review {
    id: number
    author: string
    rating: number
    content: string
    createdAt: string
    updatedAt: string
}

function ReviewList() {

    const [reviews, setReviews] = useState<Review[] | null>(null)
    const [refresh, setRefresh] = useState(false)

    const navigate = useNavigate()
    const handleAdd = () => navigate("reviews/add")

    const triggerRefresh = () => {
        setRefresh(true);
        setTimeout(() => {
            setRefresh(false);
        }, 5000); // 5000 ms = 5 secondes
    };

    useEffect(() => {
        const fetchReviews = async () => {
            try {

                const res = await api.get("/reviews/all")
                if(!res.data.success) return alert(res.data.message)

                const data: Review[] = res.data.reviews
                setReviews(data)

            } catch (error) {
                console.log("Erreur: ", error)
            }
        }

        fetchReviews()
    }, [refresh])

    const handleDelete = async (id: number) => {
        try {

            const isConfirm = confirm("Supprimer supprimer")
            if(!isConfirm) return

            const res = await api.delete(`/reviews/delete/${id}`)
            if(!res.data.success) return alert(res.data.message)

            alert(res.data.message)
            triggerRefresh()
            
        } catch (error) {
            console.log("Erreur: ", error)
        }
    }

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        size={14}
                        className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}
                    />
                ))}
            </div>
        )
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    return (
        <section className="w-full bg-white overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                        <MessageSquare size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Avis & Commentaires</h2>
                        <p className="text-xs text-gray-500">Gérez les retours d'expérience.</p>
                    </div>
                </div>
                <Button
                    onClick={() => handleAdd()}
                    className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                >
                    <Plus size={18} />
                    Ajouter un avis
                </Button>
            </div>

            {/* Liste des commentaires */}
            <div className="divide-y divide-gray-100">
                {reviews?.map((review) => (
                    <div key={review.id} className="p-6 hover:bg-gray-50/50 transition-colors group">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">

                            <div className="flex gap-4">
                                {/* Avatar Initial */}
                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                                    {review.author.charAt(0)}
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-gray-900">{review.author}</span>
                                        <span className="text-gray-300">|</span>
                                        {renderStars(review.rating)}
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {review.content}
                                    </p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={12} />
                                            {formatDate(review.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 self-end md:self-start opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button onClick={() => handleDelete(review.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                    <Trash2 size={18} />
                                </Button>
                            </div>

                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {reviews?.length === 0 && (
                <div className="p-20 text-center">
                    <User className="mx-auto text-gray-200 mb-4" size={48} />
                    <p className="text-gray-400 text-sm">Aucun commentaire pour le moment.</p>
                </div>
            )}
        </section>
    )
}

export default ReviewList