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

interface Category {
    id: number
    name: string
}

interface ImageData {
    url: string
    public_id: string
}

interface Skills {
    id: number
    name: string
    image: ImageData | string
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

    const navigate = useNavigate()
    const { addToast } = useNotification()

    const { id } = useParams()
    const isEditMode = Boolean(id)

    const goBack = () => {
        navigate(-1)
    }

    // =========================================================
    // Construire l'URL de l'image reçue par l'API
    // =========================================================
    const getImageUrl = (
        image: ImageData | string | undefined
    ): string => {
        if (!image) {
            return ''
        }

        if (typeof image === 'string') {
            return image
        }

        return image.url || ''
    }

    // =========================================================
    // Transformer une URL relative en URL complète
    // =========================================================
    const getStaticUrl = (path: string): string => {
        if (!path) {
            return ''
        }

        // URL déjà complète
        if (/^https?:\/\//i.test(path)) {
            return path
        }

        const baseURL = api.defaults.baseURL || window.location.origin

        try {
            const origin = new URL(baseURL).origin

            // /uploads/image.png
            if (path.startsWith('/')) {
                return `${origin}${path}`
            }

            // uploads/image.png
            return `${origin}/${path}`
        } catch (error) {
            console.error(
                "Impossible de construire l'URL de l'image :",
                error
            )

            return path.startsWith('/')
                ? path
                : `/${path}`
        }
    }

    // =========================================================
    // Traiter une image sélectionnée
    // =========================================================
    const processImageFile = (file: File) => {
        // Vérifier le type
        if (!file.type.startsWith('image/')) {
            addToast(
                'error',
                'Erreur',
                'Veuillez sélectionner une image valide'
            )
            return
        }

        // Vérifier la taille
        if (file.size > 2 * 1024 * 1024) {
            addToast(
                'error',
                'Erreur',
                "L'image ne doit pas dépasser 2MB"
            )
            return
        }

        // Supprimer l'ancien blob si nécessaire
        setPreviewUrl((currentUrl) => {
            if (currentUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(currentUrl)
            }

            return URL.createObjectURL(file)
        })

        setImageFile(file)
    }

    // =========================================================
    // Sélection depuis input file
    // =========================================================
    const handleImageChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0]

        if (!file) {
            return
        }

        processImageFile(file)
    }

    // =========================================================
    // Drag & Drop
    // =========================================================
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

    // =========================================================
    // Supprimer l'image
    // =========================================================
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
        if (!isEditMode || !id) {
            return
        }

        const fetchDetailsSkills = async () => {
            setLoadingData(true)

            try {
                const res = await api.get(`/skills/details/${id}`)

                if (!res.data.success) {
                    addToast(
                        'error',
                        'Erreur',
                        res.data.message || 'Impossible de charger la compétence'
                    )
                    return
                }

                const data: Skills = res.data.skill

                console.log('Données reçues :', data)
                console.log('Image reçue :', data.image)

                // Remplir les champs
                setName(data.name || '')
                setLevel(data.level || 'debutant')
                setDescription(data.description || '')
                setSelectedCategory(data.categoryId || 0)

                // ============================
                // IMAGE EXISTANTE
                // ============================
                const imageUrl = getImageUrl(data.image)

                console.log('Image URL brute :', imageUrl)

                if (imageUrl) {
                    const fullUrl = getStaticUrl(imageUrl)

                    console.log('Image URL finale :', fullUrl)

                    setPreviewUrl(fullUrl)
                } else {
                    setPreviewUrl(null)

                    console.log(
                        "Aucune image n'a été reçue pour cette compétence"
                    )
                }
            } catch (error) {
                console.error(
                    'Erreur lors du chargement de la compétence :',
                    error
                )

                addToast(
                    'error',
                    'Erreur',
                    'Impossible de charger les détails'
                )
            } finally {
                setLoadingData(false)
            }
        }

        fetchDetailsSkills()
    }, [id, isEditMode, addToast]) // ✅ Correction : addToast ajouté

    // =========================================================
    // Charger les catégories
    // =========================================================
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('/categories/all')

                if (!res.data.success) {
                    addToast(
                        'error',
                        'Erreur',
                        res.data.message || 'Impossible de charger les catégories'
                    )
                    return
                }

                const data: Category[] = res.data.categories || []

                setCategories(data)
            } catch (error) {
                console.error(
                    'Erreur lors du chargement des catégories :',
                    error
                )

                addToast(
                    'error',
                    'Erreur',
                    'Impossible de charger les catégories'
                )
            }
        }

        fetchCategories()
    }, [addToast]) // ✅ Correction : addToast ajouté

    // =========================================================
    // Nettoyer les blob URLs au démontage / changement
    // =========================================================
    useEffect(() => {
        return () => {
            if (previewUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl)
            }
        }
    }, [previewUrl])

    // =========================================================
    // Validation
    // =========================================================
    const validateForm = () => {
        const newErrors: {
            name?: string
            category?: string
        } = {}

        if (!name.trim()) {
            newErrors.name =
                'Le nom de la compétence est obligatoire'
        } else if (name.trim().length < 2) {
            newErrors.name =
                'Le nom doit contenir au moins 2 caractères'
        }

        if (!selectedCategory) {
            newErrors.category =
                'Veuillez sélectionner une catégorie'
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
            addToast(
                'error',
                'Erreur',
                'Veuillez corriger les erreurs du formulaire'
            )
            return
        }

        setLoading(true)

        try {
            const formData = new FormData()

            formData.append('name', name.trim())
            formData.append('level', level)
            formData.append(
                'description',
                description.trim()
            )
            formData.append(
                'categoryId',
                selectedCategory.toString()
            )

            // Ajouter uniquement une nouvelle image
            if (imageFile) {
                formData.append('image', imageFile)
            }

            let res

            if (isEditMode) {
                res = await api.put(
                    `/skills/update/${id}`,
                    formData,
                    {
                        headers: {
                            'Content-Type':
                                'multipart/form-data',
                        },
                    }
                )
            } else {
                res = await api.post(
                    '/skills/add',
                    formData,
                    {
                        headers: {
                            'Content-Type':
                                'multipart/form-data',
                        },
                    }
                )
            }

            if (res.data.success) {
                addToast(
                    'success',
                    isEditMode
                        ? 'Compétence mise à jour'
                        : 'Compétence créée',
                    'Opération réussie !'
                )

                setTimeout(() => {
                    navigate('/competances')
                }, 500)
            } else {
                addToast(
                    'error',
                    'Erreur',
                    res.data.message ||
                        "Erreur lors de l'enregistrement"
                )
            }
        } catch (error) {
            console.error(
                "Erreur lors de l'enregistrement :",
                error
            )

            addToast(
                'error',
                'Erreur',
                "Impossible d'enregistrer la compétence"
            )
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
                    {/* ✅ Correction : Utiliser className au lieu de size */}
                    <Loader2
                        className="w-8 h-8 md:w-10 md:h-10 animate-spin text-indigo-600 mb-4"
                    />

                    <p className="text-gray-500">
                        Chargement des données...
                    </p>
                </div>
            </section>
        )
    }

    // =========================================================
    // Image à afficher
    // =========================================================
    const displayImageUrl = previewUrl

    // =========================================================
    // RENDER
    // =========================================================
    return (
        <section className="w-full bg-white rounded-xl md:rounded-2xl shadow-sm overflow-hidden">

            {/* =====================================================
                HEADER
            ====================================================== */}
            <div className="p-4 md:p-6 bg-gray-50 border-b border-gray-100">
                <button
                    type="button"
                    onClick={goBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors mb-3 md:mb-4"
                >
                    {/* ✅ Correction */}
                    <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />

                    <span className="text-sm font-medium">
                        Retour
                    </span>
                </button>

                <h2 className="text-lg md:text-xl font-bold text-gray-800">
                    {isEditMode
                        ? 'Modifier la compétence'
                        : 'Ajouter une nouvelle compétence'}
                </h2>

                <p className="text-xs md:text-sm text-gray-500 mt-1">
                    Remplissez les informations pour enrichir
                    votre portfolio.
                </p>
            </div>

            {/* =====================================================
                FORM
            ====================================================== */}
            <form
                onSubmit={handleSubmit}
                className="p-4 md:p-6 lg:p-8 space-y-5 md:space-y-6"
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">

                    {/* =================================================
                        COLONNE GAUCHE
                    ================================================== */}
                    <div className="space-y-4 md:space-y-5">

                        {/* Nom */}
                        <div>
                            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5">
                                Nom de la compétence{' '}
                                <span className="text-red-500">
                                    *
                                </span>
                            </label>

                            <div className="relative">
                                {/* ✅ Correction */}
                                <Award
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5"
                                />

                                <Input
                                    type="text"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value)

                                        if (errors.name) {
                                            setErrors((prev) => ({
                                                ...prev,
                                                name: undefined,
                                            }))
                                        }
                                    }}
                                    placeholder="ex: React, Node.js..."
                                    className={`w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm md:text-base ${
                                        errors.name
                                            ? 'border-red-300 focus:ring-red-500/20'
                                            : 'border-gray-200'
                                    }`}
                                    required
                                />
                            </div>

                            {errors.name && (
                                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                    {/* ✅ Correction */}
                                    <X className="w-3 h-3" />

                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Niveau */}
                        <div>
                            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5">
                                Niveau{' '}
                                <span className="text-red-500">
                                    *
                                </span>
                            </label>

                            <div className="relative">
                                {/* ✅ Correction */}
                                <BarChart3
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5"
                                />

                                <select
                                    value={level}
                                    onChange={(e) =>
                                        setLevel(
                                            e.target.value
                                        )
                                    }
                                    className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 border border-gray-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer text-sm md:text-base"
                                >
                                    <option value="debutant">
                                        Débutant
                                    </option>

                                    <option value="intermediaire">
                                        Intermédiaire
                                    </option>

                                    <option value="avance">
                                        Avancé
                                    </option>

                                    <option value="maitrise">
                                        Maîtrise
                                    </option>

                                    <option value="expert">
                                        Expert
                                    </option>
                                </select>
                            </div>
                        </div>

                        {/* Catégorie */}
                        <div>
                            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5">
                                Catégorie{' '}
                                <span className="text-red-500">
                                    *
                                </span>
                            </label>

                            <div className="relative">
                                {/* ✅ Correction */}
                                <FolderOpen
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5"
                                />

                                <select
                                    value={selectedCategory}
                                    onChange={(e) => {
                                        setSelectedCategory(
                                            Number(
                                                e.target.value
                                            )
                                        )

                                        if (errors.category) {
                                            setErrors((prev) => ({
                                                ...prev,
                                                category:
                                                    undefined,
                                            }))
                                        }
                                    }}
                                    className={`w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer text-sm md:text-base ${
                                        errors.category
                                            ? 'border-red-300 focus:ring-red-500/20'
                                            : 'border-gray-200'
                                    }`}
                                >
                                    <option value={0}>
                                        Sélectionner une catégorie
                                    </option>

                                    {categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {errors.category && (
                                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                    {/* ✅ Correction */}
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
                                {/* ✅ Correction */}
                                <AlignLeft
                                    className="absolute left-3 top-3 text-gray-400 w-4 h-4 md:w-5 md:h-5"
                                />

                                <textarea
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(
                                            e.target.value
                                        )
                                    }
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

                    {/* =================================================
                        COLONNE DROITE : IMAGE
                    ================================================== */}
                    <div className="flex flex-col">

                        <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5">
                            Image de la compétence
                        </label>

                        <div
                            className={`flex-1 min-h-[200px] md:min-h-[250px] lg:min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed rounded-xl md:rounded-2xl transition-all relative ${
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
                                <div className="relative w-full h-full min-h-[200px] md:min-h-[250px] lg:min-h-[300px] flex items-center justify-center p-4">

                                    <img
                                        src={displayImageUrl}
                                        alt="Preview"
                                        className="w-full h-full max-h-[280px] rounded-lg shadow-md object-contain"
                                        onError={(e) => {
                                            console.error(
                                                "Impossible de charger l'image :",
                                                displayImageUrl
                                            )

                                            e.currentTarget.style.display =
                                                'none'
                                        }}
                                    />

                                    {/* Bouton supprimer */}
                                    <Button
                                        type="button"
                                        onClick={clearImage}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 md:p-2 hover:bg-red-600 shadow-lg transition-colors"
                                        title="Supprimer l'image"
                                    >
                                        {/* ✅ Correction */}
                                        <X className="w-4 h-4 md:w-5 md:h-5" />
                                    </Button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full min-h-[200px] md:min-h-[250px] lg:min-h-[300px] p-4">

                                    <div className="bg-white p-3 md:p-4 rounded-full shadow-sm mb-2 md:mb-3">
                                        {/* ✅ Correction */}
                                        <ImagePlus
                                            className="text-indigo-600 w-6 h-6 md:w-8 md:h-8"
                                        />
                                    </div>

                                    <span className="text-xs md:text-sm font-medium text-gray-700 text-center">
                                        Cliquez ou
                                        glissez-déposez une
                                        image
                                    </span>

                                    <span className="text-[10px] md:text-xs text-gray-400 mt-1 text-center">
                                        PNG, JPG ou SVG
                                        (max. 2MB)
                                    </span>

                                    <Input
                                        ref={fileInputRef}
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={
                                            handleImageChange
                                        }
                                    />
                                </label>
                            )}
                        </div>
                    </div>
                </div>

                {/* =====================================================
                    BOUTONS
                ====================================================== */}
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
                                {/* ✅ Correction */}
                                <Loader2
                                    className="w-4 h-4 md:w-5 md:h-5 animate-spin"
                                />

                                Envoi en cours...
                            </>
                        ) : (
                            <>
                                {/* ✅ Correction */}
                                <Save className="w-4 h-4 md:w-5 md:h-5" />

                                {isEditMode
                                    ? 'Mettre à jour'
                                    : 'Enregistrer'}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </section>
    )
}

export default SkillsForm