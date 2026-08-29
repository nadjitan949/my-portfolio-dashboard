import { useState, type FormEvent } from 'react'
import { Star, MessageSquare, User, Save, ArrowLeft, Loader2, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../../axios/api'
import Input from '../../../ui/Input'
import Button from '../../../ui/Button'
import { useNotification } from '../../../hooks/useNotification'

function ReviewAdd() {
    const navigate = useNavigate()
    const { addToast } = useNotification()
    const [loading, setLoading] = useState(false)

    const [author, setAuthor] = useState('')
    const [rating, setRating] = useState(0)
    const [hover, setHover] = useState(0)
    const [content, setContent] = useState('')
    const [errors, setErrors] = useState<{ author?: string; rating?: string; content?: string }>({})

    const goBack = () => navigate(-1)

    const validateForm = () => {
        const newErrors: { author?: string; rating?: string; content?: string } = {}
        
        if (!author.trim()) {
            newErrors.author = "Votre nom est obligatoire"
        } else if (author.trim().length < 2) {
            newErrors.author = "Le nom doit contenir au moins 2 caractères"
        }
        
        if (rating === 0) {
            newErrors.rating = "Veuillez donner une note"
        }
        
        if (!content.trim()) {
            newErrors.content = "Votre commentaire est obligatoire"
        } else if (content.trim().length < 10) {
            newErrors.content = "Le commentaire doit contenir au moins 10 caractères"
        }
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        
        if (!validateForm()) {
            addToast('error', 'Erreur', 'Veuillez corriger les erreurs du formulaire')
            return
        }

        setLoading(true)
        try {
            const res = await api.post('/reviews/add', {
                author: author.trim(),
                rating,
                content: content.trim()
            })
            
            if (res.data.success) {
                addToast('success', 'Avis publié', 'Votre avis a été publié avec succès')
                setTimeout(() => navigate('/reviews'), 500)
            } else {
                addToast('error', 'Erreur', res.data.message || "Impossible de publier l'avis")
            }
        } catch (error) {
            console.error("Erreur:", error)
            addToast('error', 'Erreur', "Impossible de publier l'avis")
        } finally {
            setLoading(false)
        }
    }

    const handleRatingClick = (star: number) => {
        setRating(star)
        if (errors.rating) setErrors(prev => ({ ...prev, rating: undefined }))
    }

    return (
        <section className="max-w-2xl mx-auto mt-4 md:mt-8 lg:mt-10 px-3 md:px-4">
            {/* Navigation */}
            <button
                onClick={goBack}
                className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 transition-colors mb-4 md:mb-6 text-xs md:text-sm font-medium w-fit"
            >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                Retour aux avis
            </button>

            <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="p-4 md:p-6 border-b border-gray-50 bg-gray-50/30">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Star className="text-amber-500 fill-amber-500 w-5 h-5 md:w-6 md:h-6" />
                        Laisser un avis
                    </h2>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">
                        Partagez votre expérience avec nous
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-4 md:p-6 lg:p-8 space-y-5 md:space-y-6">
                    {/* Nom de l'auteur */}
                    <div className="space-y-2">
                        <label className="text-xs md:text-sm font-semibold text-gray-700">
                            Votre nom <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                            <Input
                                type="text"
                                placeholder="ex: Bob"
                                value={author}
                                onChange={(e) => {
                                    setAuthor(e.target.value)
                                    if (errors.author) setErrors(prev => ({ ...prev, author: undefined }))
                                }}
                                className={`pl-9 md:pl-10 p-2.5 md:p-3 border rounded-lg md:rounded-[10px] focus:outline-none focus:ring-2 transition-all text-sm md:text-base w-full ${
                                    errors.author 
                                        ? 'border-red-300 focus:ring-red-500/20' 
                                        : 'border-gray-200 focus:ring-indigo-500/20 focus:border-indigo-500'
                                }`}
                                required
                            />
                        </div>
                        {errors.author && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                                <X className="w-3 h-3" />
                                {errors.author}
                            </p>
                        )}
                    </div>

                    {/* Système de Rating (Étoiles) */}
                    <div className="space-y-2 md:space-y-3">
                        <label className="text-xs md:text-sm font-semibold text-gray-700 block">
                            Note globale <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Button
                                    key={star}
                                    type="button"
                                    className="transition-transform hover:scale-110 focus:outline-none p-1"
                                    onClick={() => handleRatingClick(star)}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                >
                                    <Star
                                        className={`w-7 h-7 md:w-8 md:h-8 transition-colors ${
                                            star <= (hover || rating)
                                                ? "fill-amber-400 text-amber-400"
                                                : "text-gray-200"
                                        }`}
                                    />
                                </Button>
                            ))}
                            <span className="ml-1 md:ml-2 text-sm md:text-base font-bold text-amber-600 self-center">
                                {rating > 0 ? `${rating} / 5` : ""}
                            </span>
                        </div>
                        {errors.rating && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                                <X className="w-3 h-3" />
                                {errors.rating}
                            </p>
                        )}
                    </div>

                    {/* Commentaire */}
                    <div className="space-y-2">
                        <label className="text-xs md:text-sm font-semibold text-gray-700">
                            Votre commentaire <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <MessageSquare className="absolute left-3 top-3 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                            <textarea
                                placeholder="Partagez votre expérience..."
                                value={content}
                                onChange={(e) => {
                                    setContent(e.target.value)
                                    if (errors.content) setErrors(prev => ({ ...prev, content: undefined }))
                                }}
                                rows={4}
                                className={`w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none text-sm md:text-base ${
                                    errors.content 
                                        ? 'border-red-300 focus:ring-red-500/20' 
                                        : 'border-gray-200'
                                }`}
                                required
                            ></textarea>
                        </div>
                        <div className="flex justify-between items-center">
                            {errors.content ? (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                    <X className="w-3 h-3" />
                                    {errors.content}
                                </p>
                            ) : (
                                <p className="text-xs text-gray-400">
                                    Minimum 10 caractères
                                </p>
                            )}
                            <span className="text-xs text-gray-400">
                                {content.length} caractères
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 md:pt-6 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={goBack}
                            className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg md:rounded-xl transition-colors"
                        >
                            Annuler
                        </button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto bg-gray-900 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-lg md:rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-black shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                                    Envoi...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 md:w-5 md:h-5" />
                                    Publier l'avis
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </section>
    )
}

export default ReviewAdd