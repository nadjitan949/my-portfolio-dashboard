import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { MessageSquare, User, Briefcase, Image as ImageIcon, Save, ArrowLeft, X, Loader2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../../axios/api'
import Input from '../../../ui/Input'
import Button from '../../../ui/Button'
import Img from '../../../ui/Img'
import { useNotification } from '../../../hooks/useNotification'

function FeedbacksForm() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(false)

    const [author, setAuthor] = useState('')
    const [jobTitle, setJobTitle] = useState('')
    const [content, setContent] = useState('')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [errors, setErrors] = useState<{ author?: string; jobTitle?: string; content?: string }>({})

    const { id } = useParams()
    const isEditMode = Boolean(id)
    const { addToast } = useNotification()

    const goBack = () => navigate(-1)

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Vérifier le type
            if (!file.type.startsWith('image/')) {
                addToast('error', 'Erreur', 'Veuillez sélectionner une image valide')
                return
            }
            
            // Vérifier la taille (2MB max)
            if (file.size > 2 * 1024 * 1024) {
                addToast('error', 'Erreur', "L'image ne doit pas dépasser 2MB")
                return
            }

            // Nettoyer l'ancienne URL blob
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl)
            }

            setImageFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const clearImage = () => {
        if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl)
        }
        setImageFile(null)
        setPreviewUrl(null)
    }

    useEffect(() => {
        if (!isEditMode) return

        const fetchDetailsFeedbacks = async () => {
            setLoadingData(true)
            try {
                const res = await api.get(`/feedbacks/details/${id}`)
                if (!res.data.success) {
                    addToast('error', 'Erreur', res.data.message)
                    return
                }
                setAuthor(res.data.feedback.author || '')
                setJobTitle(res.data.feedback.jobTitle || '')
                setContent(res.data.feedback.content || '')
                
                // Gérer l'image existante
                const imageUrl = res.data.feedback.image
                if (imageUrl) {
                    if (typeof imageUrl === 'string') {
                        const fullUrl = imageUrl.startsWith('http') 
                            ? imageUrl 
                            : `${api.defaults.baseURL || ''}${imageUrl}`
                        setPreviewUrl(fullUrl)
                    } else if (imageUrl.url) {
                        const fullUrl = imageUrl.url.startsWith('http') 
                            ? imageUrl.url 
                            : `${api.defaults.baseURL || ''}${imageUrl.url}`
                        setPreviewUrl(fullUrl)
                    }
                }

            } catch (error) {
                console.error("Erreur: ", error)
                addToast('error', 'Erreur', 'Impossible de charger les détails')
            } finally {
                setLoadingData(false)
            }
        }

        fetchDetailsFeedbacks()
    }, [id, isEditMode, addToast])

    // Nettoyage des URLs blob au démontage
    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl)
            }
        }
    }, [previewUrl])

    const validateForm = () => {
        const newErrors: { author?: string; jobTitle?: string; content?: string } = {}
        
        if (!author.trim()) {
            newErrors.author = "Le nom de l'auteur est obligatoire"
        } else if (author.trim().length < 2) {
            newErrors.author = "Le nom doit contenir au moins 2 caractères"
        }
        
        if (!jobTitle.trim()) {
            newErrors.jobTitle = "Le poste est obligatoire"
        }
        
        if (!content.trim()) {
            newErrors.content = "Le message est obligatoire"
        } else if (content.trim().length < 10) {
            newErrors.content = "Le message doit contenir au moins 10 caractères"
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
            const formData = new FormData()
            formData.append('author', author.trim())
            formData.append('jobTitle', jobTitle.trim())
            formData.append('content', content.trim())
            if (imageFile) formData.append('image', imageFile)

            const res = isEditMode 
                ? await api.put(`/feedbacks/update/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                }) 
                : await api.post('/feedbacks/add', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })

            if (res.data.success) {
                addToast('success', isEditMode ? 'Feedback mis à jour' : 'Feedback créé', 'Opération réussie !')
                setTimeout(() => navigate('/feedbacks'), 500)
            } else {
                addToast('error', 'Erreur', res.data.message || "Impossible d'enregistrer")
            }
        } catch {
            addToast('error', 'Erreur', "Impossible d'enregistrer")
        } finally {
            setLoading(false)
        }
    }

    // État de chargement
    if (loadingData) {
        return (
            <section className="bg-white h-full rounded-xl md:rounded-2xl shadow-sm p-4 md:p-5 mx-auto mt-4 md:mt-8">
                <div className="flex flex-col items-center justify-center h-full min-h-75">
                    <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin text-indigo-600 mb-3 md:mb-4" />
                    <p className="text-gray-500 text-sm md:text-base">Chargement des données...</p>
                </div>
            </section>
        )
    }

    return (
        <section className="bg-white h-full rounded-xl md:rounded-2xl shadow-sm p-3 md:p-4 lg:p-5 mx-auto mt-4 md:mt-8 max-w-4xl">
            {/* Navigation */}
            <button
                onClick={goBack}
                className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 transition-colors mb-4 md:mb-6 text-xs md:text-sm font-medium w-fit"
            >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                Retour aux témoignages
            </button>

            <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="p-4 md:p-6 border-b border-gray-50 bg-gray-50/30">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                        <MessageSquare className="text-indigo-600 w-5 h-5 md:w-6 md:h-6" />
                        {isEditMode ? 'Modifier le Témoignage' : 'Nouveau Témoignage'}
                    </h2>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">
                        {isEditMode ? 'Modifiez les informations du témoignage' : 'Ajoutez un nouveau témoignage client'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-4 md:p-6 lg:p-8 space-y-5 md:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {/* Auteur */}
                        <div className="space-y-2">
                            <label className="text-xs md:text-sm font-semibold text-gray-700">
                                Nom du client / auteur <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                                <Input
                                    type="text"
                                    placeholder="ex: Client de l'agence A"
                                    value={author}
                                    onChange={(e) => {
                                        setAuthor(e.target.value)
                                        if (errors.author) setErrors(prev => ({ ...prev, author: undefined }))
                                    }}
                                    className={`pl-9 md:pl-10 p-2.5 md:p-3 w-full border rounded-lg md:rounded-[10px] focus:outline-none focus:ring-2 transition-all text-sm md:text-base ${
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

                        {/* Job Title */}
                        <div className="space-y-2">
                            <label className="text-xs md:text-sm font-semibold text-gray-700">
                                Poste / Rôle <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                                <Input
                                    type="text"
                                    placeholder="ex: Manager"
                                    value={jobTitle}
                                    onChange={(e) => {
                                        setJobTitle(e.target.value)
                                        if (errors.jobTitle) setErrors(prev => ({ ...prev, jobTitle: undefined }))
                                    }}
                                    className={`pl-9 md:pl-10 p-2.5 md:p-3 w-full border rounded-lg md:rounded-[10px] focus:outline-none focus:ring-2 transition-all text-sm md:text-base ${
                                        errors.jobTitle 
                                            ? 'border-red-300 focus:ring-red-500/20' 
                                            : 'border-gray-200 focus:ring-indigo-500/20 focus:border-indigo-500'
                                    }`}
                                    required
                                />
                            </div>
                            {errors.jobTitle && (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                    <X className="w-3 h-3" />
                                    {errors.jobTitle}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Contenu du feedback */}
                    <div className="space-y-2">
                        <label className="text-xs md:text-sm font-semibold text-gray-700">
                            Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            placeholder="Écrivez le témoignage ici..."
                            value={content}
                            onChange={(e) => {
                                setContent(e.target.value)
                                if (errors.content) setErrors(prev => ({ ...prev, content: undefined }))
                            }}
                            rows={5}
                            className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none text-sm md:text-base ${
                                errors.content 
                                    ? 'border-red-300 focus:ring-red-500/20' 
                                    : 'border-gray-200'
                            }`}
                            required
                        ></textarea>
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

                    {/* Upload Photo de l'auteur */}
                    <div className="space-y-2">
                        <label className="text-xs md:text-sm font-semibold text-gray-700">
                            Photo de l'auteur <span className="text-xs font-normal text-gray-400">(Optionnel)</span>
                        </label>
                        <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group shrink-0">
                                {previewUrl ? (
                                    <>
                                        <Img src={previewUrl} alt="Auteur" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={clearImage}
                                            className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Supprimer la photo"
                                        >
                                            <X className="w-4 h-4 md:w-5 md:h-5" />
                                        </button>
                                    </>
                                ) : (
                                    <ImageIcon className="w-6 h-6 md:w-8 md:h-8 text-gray-300" />
                                )}
                            </div>
                            <label className="cursor-pointer bg-white border border-gray-300 px-4 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all text-center">
                                Parcourir...
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handleImageChange} 
                                />
                            </label>
                            {previewUrl && (
                                <button
                                    type="button"
                                    onClick={clearImage}
                                    className="text-xs text-red-500 hover:text-red-600 font-medium"
                                >
                                    Supprimer la photo
                                </button>
                            )}
                        </div>
                        <p className="text-[10px] md:text-xs text-gray-400">
                            PNG, JPG jusqu'à 2MB
                        </p>
                    </div>

                    {/* Boutons Actions */}
                    <div className="pt-4 md:pt-6 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={goBack}
                            className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg md:rounded-xl transition-colors"
                        >
                            Annuler
                        </button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto bg-indigo-600 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-lg md:rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                                    Envoi...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 md:w-5 md:h-5" />
                                    {isEditMode ? "Mettre à jour" : "Enregistrer l'avis"}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </section>
    )
}

export default FeedbacksForm