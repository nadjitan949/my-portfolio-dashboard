import { useState, type FormEvent } from 'react'
import { Star, MessageSquare, User, Save, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../../axios/api'
import Input from '../../../ui/Input'
import Button from '../../../ui/Button'

function ReviewAdd() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    // États du formulaire
    const [author, setAuthor] = useState('')
    const [rating, setRating] = useState(0)
    const [hover, setHover] = useState(0) // Pour l'effet de survol des étoiles
    const [content, setContent] = useState('')

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (rating === 0) return alert("Veuillez donner une note")

        setLoading(true)
        try {
            const res = await api.post('/reviews/add', {
                author,
                rating,
                content
            })
            if (res.data.success) navigate('/reviews')
        } catch (error) {
            console.error("Erreur:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="max-w-2xl mx-auto mt-10">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 transition-colors mb-6 text-sm font-medium"
            >
                <ArrowLeft size={16} />
                Retour aux avis
            </button>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/30">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Star className="text-amber-500 fill-amber-500" size={22} />
                        Laisser un avis
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">

                    {/* Nom de l'auteur */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Votre nom</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <Input
                                type="text"
                                placeholder="ex: Bob"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                className="px-10 p-3 border border-gray-100 focus:outline-0 rounded-[5px] w-full"
                                required
                            />
                        </div>
                    </div>

                    {/* Système de Rating (Étoiles) */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 block">Note globale</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Button
                                    key={star}
                                    type="button"
                                    className="transition-transform hover:scale-110 focus:outline-none"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                >
                                    <Star
                                        size={32}
                                        className={`transition-colors ${star <= (hover || rating)
                                                ? "fill-amber-400 text-amber-400"
                                                : "text-gray-200"
                                            }`}
                                    />
                                </Button>
                            ))}
                            <span className="ml-2 text-sm font-bold text-amber-600 self-center">
                                {rating > 0 ? `${rating} / 5` : ""}
                            </span>
                        </div>
                    </div>

                    {/* Commentaire */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Votre commentaire</label>
                        <div className="relative">
                            <MessageSquare className="absolute left-3 top-3 text-gray-400" size={18} />
                            <textarea
                                placeholder="Partagez votre expérience..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={4}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                                required
                            ></textarea>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-6 flex items-center justify-end gap-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Annuler
                        </button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-gray-900 text-white px-8 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-black shadow-md disabled:opacity-50"
                        >
                            {loading ? "Envoi..." : <><Save size={18} /> Publier l'avis</>}
                        </Button>
                    </div>
                </form>
            </div>
        </section>
    )
}

export default ReviewAdd