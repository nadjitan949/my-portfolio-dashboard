import {
    useEffect,
    useState,
    useRef,
    type FormEvent,
} from 'react'

import {
    X,
    Save,
    Award,
    AlignLeft,
    Loader2,
    ArrowLeft,
    ImagePlus,
    FolderOpen,
    BarChart3,
} from 'lucide-react'

import api from '../../../axios/api'
import Input from '../../../ui/Input'
import Button from '../../../ui/Button'
import { useNavigate, useParams } from 'react-router-dom'
import { useNotification } from '../../../hooks/useNotification'
import Img from '../../../ui/Img'

interface Category {
    id: number
    name: string
}

interface Skills {
    id: number
    name: string
    image: string
    level: string
    description: string
    categoryId: number
}

function SkillsForm() {
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(false)

    const [name, setName] = useState('')
    const [level, setLevel] = useState('debutant')
    const [description, setDescription] = useState('')

    const [imageFile, setImageFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategory, setSelectedCategory] = useState<number>(0)

    const [isDragging, setIsDragging] = useState(false)

    const [errors, setErrors] = useState<{
        name?: string
        category?: string
    }>({})

    const fileInputRef = useRef<HTMLInputElement>(null)
    const previewUrlRef = useRef<string | null>(null)

    const navigate = useNavigate()
    const { addToast } = useNotification()

    const { id } = useParams()
    const isEditMode = Boolean(id)

    const goBack = () => {
        navigate(-1)
    }

    // Mettre à jour la référence à chaque changement
    useEffect(() => {
        previewUrlRef.current = previewUrl
    }, [previewUrl])

    // =========================================================
    // Traiter une image sélectionnée
    // =========================================================
    const processImageFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            addToast('error', 'Erreur', 'Veuillez sélectionner une image valide')
            return
        }

        if (file.size > 2 * 1024 * 1024) {
            addToast('error', 'Erreur', "L'image ne doit pas dépasser 2MB")
            return
        }

        setPreviewUrl((currentUrl) => {
            if (currentUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(currentUrl)
            }
            return URL.createObjectURL(file)
        })

        setImageFile(file)
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        processImageFile(file)
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        const file = e.dataTransfer.files?.[0]
        if (file) {
            processImageFile(file)
        }
    }

    const clearImage = () => {
        if (previewUrl?.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl)
        }
        setImageFile(null)
        setPreviewUrl(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    // =========================================================
    // Charger les détails de la compétence en mode édition
    // =========================================================
    useEffect(() => {
        if (!isEditMode || !id) return

        const fetchDetailsSkills = async () => {
            setLoadingData(true)

            try {
                const res = await api.get(`/skills/details/${id}`)

                if (!res.data.success) {
                    addToast('error', 'Erreur', res.data.message || 'Impossible de charger la compétence')
                    return
                }

                const data: Skills = res.data.skill

                console.log('Données reçues :', data)
                console.log('Image reçue :', data.image)

                setName(data.name || '')
                setLevel(data.level || 'debutant')
                setDescription(data.description || '')
                setSelectedCategory(data.categoryId || 0)

                // ✅ Passer directement la string à previewUrl
                if (data.image) {
                    setPreviewUrl(data.image)
                } else {
                    setPreviewUrl(null)
                }

            } catch (error) {
                console.error('Erreur lors du chargement de la compétence :', error)
                addToast('error', 'Erreur', 'Impossible de charger les détails')
            } finally {
                setLoadingData(false)
            }
        }

        fetchDetailsSkills()
    }, [id, isEditMode, addToast])

    // =========================================================
    // Charger les catégories
    // =========================================================
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('/categories/all')

                if (!res.data.success) {
                    addToast('error', 'Erreur', res.data.message || 'Impossible de charger les catégories')
                    return
                }

                const data: Category[] = res.data.categories || []
                setCategories(data)
            } catch (error) {
                console.error('Erreur lors du chargement des catégories :', error)
                addToast('error', 'Erreur', 'Impossible de charger les catégories')
            }
        }

        fetchCategories()
    }, [addToast])

    // =========================================================
    // Nettoyer les blob URLs au démontage
    // =========================================================
    useEffect(() => {
        return () => {
            if (previewUrlRef.current?.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrlRef.current)
            }
        }
    }, [])

    // =========================================================
    // Validation
    // =========================================================
    const validateForm = () => {
        const newErrors: { name?: string; category?: string } = {}

        if (!name.trim()) {
            newErrors.name = 'Le nom de la compétence est obligatoire'
        } else if (name.trim().length < 2) {
            newErrors.name = 'Le nom doit contenir au moins 2 caractères'
        }

        if (!selectedCategory) {
            newErrors.category = 'Veuillez sélectionner une catégorie'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // =========================================================
    // Soumission du formulaire
    // =========================================================
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            addToast('error', 'Erreur', 'Veuillez corriger les erreurs du formulaire')
            return
        }

        setLoading(true)

        try {
            const formData = new FormData()
            formData.append('name', name.trim())
            formData.append('level', level)
            formData.append('description', description.trim())
            formData.append('categoryId', selectedCategory.toString())

            if (imageFile) {
                formData.append('image', imageFile)
            }

            let res

            if (isEditMode) {
                res = await api.put(`/skills/update/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
            } else {
                res = await api.post('/skills/add', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
            }

            if (res.data.success) {
                addToast('success', isEditMode ? 'Compétence mise à jour' : 'Compétence créée', 'Opération réussie !')
                setTimeout(() => {
                    navigate('/competances')
                }, 500)
            } else {
                addToast('error', 'Erreur', res.data.message || "Erreur lors de l'enregistrement")
            }
        } catch (error) {
            console.error("Erreur lors de l'enregistrement :", error)
            addToast('error', 'Erreur', "Impossible d'enregistrer la compétence")
        } finally {
            setLoading(false)
        }
    }

    // =========================================================
    // État de chargement
    // =========================================================
    if (loadingData) {
        return (
            <section className="w-full bg-white rounded-xl md:rounded-2xl shadow-sm overflow-hidden">
                <div className="p-8 md:p-12 flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin text-indigo-600 mb-4" />
                    <p className="text-gray-500">Chargement des données...</p>
                </div>
            </section>
        )
    }

    const displayImageUrl = previewUrl

    // =========================================================
    // RENDER
    // =========================================================
    return (
        <section className="w-full bg-white rounded-xl md:rounded-2xl shadow-sm overflow-hidden">
            {/* HEADER */}
            <div className="p-4 md:p-6 bg-gray-50 border-b border-gray-100">
                <button
                    type="button"
                    onClick={goBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors mb-3 md:mb-4"
                >
                    <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="text-sm font-medium">Retour</span>
                </button>

                <h2 className="text-lg md:text-xl font-bold text-gray-800">
                    {isEditMode ? 'Modifier la compétence' : 'Ajouter une nouvelle compétence'}
                </h2>

                <p className="text-xs md:text-sm text-gray-500 mt-1">
                    Remplissez les informations pour enrichir votre portfolio.
                </p>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="p-4 md:p-6 lg:p-8 space-y-5 md:space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    {/* COLONNE GAUCHE */}
                    <div className="space-y-4 md:space-y-5">
                        {/* Nom */}
                        <div>
                            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5">
                                Nom de la compétence <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                                <Input
                                    type="text"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value)
                                        if (errors.name) {
                                            setErrors((prev) => ({ ...prev, name: undefined }))
                                        }
                                    }}
                                    placeholder="ex: React, Node.js..."
                                    className={`w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm md:text-base ${
                                        errors.name ? 'border-red-300 focus:ring-red-500/20' : 'border-gray-200'
                                    }`}
                                    required
                                />
                            </div>
                            {errors.name && (
                                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                    <X className="w-3 h-3" />
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Niveau */}
                        <div>
                            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5">
                                Niveau <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <BarChart3 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                                <select
                                    value={level}
                                    onChange={(e) => setLevel(e.target.value)}
                                    className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 border border-gray-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer text-sm md:text-base"
                                >
                                    <option value="debutant">Débutant</option>
                                    <option value="intermediaire">Intermédiaire</option>
                                    <option value="avance">Avancé</option>
                                    <option value="maitrise">Maîtrise</option>
                                    <option value="expert">Expert</option>
                                </select>
                            </div>
                        </div>

                        {/* Catégorie */}
                        <div>
                            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5">
                                Catégorie <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => {
                                        setSelectedCategory(Number(e.target.value))
                                        if (errors.category) {
                                            setErrors((prev) => ({ ...prev, category: undefined }))
                                        }
                                    }}
                                    className={`w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer text-sm md:text-base ${
                                        errors.category ? 'border-red-300 focus:ring-red-500/20' : 'border-gray-200'
                                    }`}
                                >
                                    <option value={0}>Sélectionner une catégorie</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {errors.category && (
                                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                    <X className="w-3 h-3" />
                                    {errors.category}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5">
                                Description
                            </label>
                            <div className="relative">
                                <AlignLeft className="absolute left-3 top-3 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 border border-gray-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm md:text-base resize-none"
                                    placeholder="Décrivez brièvement votre expérience..."
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1 text-right">
                                {description.length} caractères
                            </p>
                        </div>
                    </div>

                    {/* COLONNE DROITE : IMAGE */}
                    <div className="flex flex-col">
                        <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5">
                            Image de la compétence
                        </label>

                        <div
                            className={`flex-1 min-h-50 md:min-h-62.5 lg:min-h-75 flex flex-col items-center justify-center border-2 border-dashed rounded-xl md:rounded-2xl transition-all relative ${
                                isDragging
                                    ? 'border-indigo-500 bg-indigo-50'
                                    : displayImageUrl
                                        ? 'border-gray-200 bg-gray-50'
                                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-indigo-300'
                            }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            {displayImageUrl ? (
                                <div className="relative w-full h-full min-h-50 md:min-h-62.5 lg:min-h-75 flex items-center justify-center p-4">
                                    <Img
                                        src={displayImageUrl}
                                        alt="Preview"
                                        className="w-full h-full max-h-70 rounded-lg shadow-md object-contain"
                                    />

                                    <Button
                                        type="button"
                                        onClick={clearImage}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 md:p-2 hover:bg-red-600 shadow-lg transition-colors"
                                        title="Supprimer l'image"
                                    >
                                        <X className="w-4 h-4 md:w-5 md:h-5" />
                                    </Button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full min-h-50 md:min-h-62.5 lg:min-h-75 p-4">
                                    <div className="bg-white p-3 md:p-4 rounded-full shadow-sm mb-2 md:mb-3">
                                        <ImagePlus className="text-indigo-600 w-6 h-6 md:w-8 md:h-8" />
                                    </div>

                                    <span className="text-xs md:text-sm font-medium text-gray-700 text-center">
                                        Cliquez ou glissez-déposez une image
                                    </span>

                                    <span className="text-[10px] md:text-xs text-gray-400 mt-1 text-center">
                                        PNG, JPG ou SVG (max. 2MB)
                                    </span>

                                    <Input
                                        ref={fileInputRef}
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            )}
                        </div>
                    </div>
                </div>

                {/* BOUTONS */}
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-4 md:pt-6 border-t border-gray-100">
                    <Button
                        type="button"
                        onClick={goBack}
                        className="px-6 py-2.5 md:py-3 border border-gray-200 rounded-lg md:rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-sm md:text-base w-full sm:w-auto"
                    >
                        Annuler
                    </Button>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-lg md:rounded-xl hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base w-full sm:w-auto"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                                Envoi en cours...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 md:w-5 md:h-5" />
                                {isEditMode ? 'Mettre à jour' : 'Enregistrer'}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </section>
    )
}

export default SkillsForm