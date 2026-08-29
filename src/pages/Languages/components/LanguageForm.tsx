import { useEffect, useState, useRef, type ChangeEvent, type FormEvent } from 'react'
import { Code2, Upload, X, Save, ArrowLeft, Loader2, ImagePlus } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../../axios/api'
import Input from '../../../ui/Input'
import Button from '../../../ui/Button'
import { useNotification } from '../../../hooks/useNotification'
import Img from '../../../ui/Img'

function LanguageForm() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(false)
    const [name, setName] = useState('')
    const [isDragging, setIsDragging] = useState(false)

    // États pour l'image
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const { id } = useParams()
    const isEditMode = Boolean(id)
    const { addToast } = useNotification()

    const goBack = () => navigate(-1)

    // ✅ Ajouter une référence pour les previews
    const previewUrlRef = useRef<string | null>(null)

    // ✅ Mettre à jour la référence à chaque changement
    useEffect(() => {
        previewUrlRef.current = previewUrl
    }, [previewUrl])

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Vérifier le type de fichier
            if (!file.type.startsWith('image/')) {
                addToast('error', 'Erreur', 'Veuillez sélectionner une image valide')
                return
            }
            
            // Vérifier la taille (1MB max)
            if (file.size > 1 * 1024 * 1024) {
                addToast('error', 'Erreur', "L'image ne doit pas dépasser 1MB")
                return
            }

            // Nettoyer l'ancienne URL de preview
            setPreviewUrl(prev => {
                if (prev && prev.startsWith('blob:')) {
                    URL.revokeObjectURL(prev)
                }
                return URL.createObjectURL(file)
            })

            setImageFile(file)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file) {
            const changeEvent = {
                target: { files: [file] }
            } as unknown as ChangeEvent<HTMLInputElement>
            handleImageChange(changeEvent)
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
        if(!isEditMode) return
        
        const fetchDetailsLanguages = async () => {
            setLoadingData(true)
            try {
                const res = await api.get(`/langages/details/${id}`)
                if (!res.data.success) {
                    addToast('error', 'Erreur', res.data.message)
                    return
                }
                
                const languageData = res.data.language
                setName(languageData.name || '')
                
                // ✅ CORRECTION SIMPLE : Passer directement la string
                // Votre composant Img gère déjà le parsing JSON et les URLs Cloudinary
                if (languageData.icone) {
                    setPreviewUrl(languageData.icone)
                } else {
                    setPreviewUrl(null)
                }

                console.log('Langage chargé:', languageData) // Debug
                console.log('Icône brute:', languageData.icone) // Debug

            } catch (error) {
                console.error("Erreur: ", error)
                addToast('error', 'Erreur', 'Impossible de charger les détails')
            } finally {
                setLoadingData(false)
            }
        }

        fetchDetailsLanguages()
    }, [id, isEditMode, addToast])

    // ✅ Nettoyage avec la référence
    useEffect(() => {
        return () => {
            if (previewUrlRef.current?.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrlRef.current)
            }
        }
    }, [])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        if (!name.trim()) {
            addToast('error', 'Erreur', 'Le nom du langage est obligatoire')
            return
        }

        if (!isEditMode && !imageFile) {
            addToast('error', 'Erreur', "L'icône est obligatoire")
            return
        }

        setLoading(true)
        const formData = new FormData()
        formData.append('name', name.trim())
        if (imageFile) {
            formData.append('icone', imageFile)
        }

        try {
            const res = isEditMode 
                ? await api.put(`/langages/update/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                }) 
                : await api.post('/langages/add', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                
            if (res.data.success) {
                addToast('success', isEditMode ? 'Langage mis à jour' : 'Langage créé', 'Opération réussie !')
                setTimeout(() => navigate(-1), 500)
            } else {
                addToast('error', 'Erreur', res.data.message || "Impossible d'enregistrer")
            }
        } catch {
            addToast('error', 'Erreur', "Impossible d'enregistrer")
        } finally {
            setLoading(false)
        }
    }

    // État de chargement des données
    if (loadingData) {
        return (
            <section className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6 w-full h-full">
                <div className="flex flex-col items-center justify-center h-full min-h-75">
                    <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin text-indigo-600 mb-3" />
                    <p className="text-gray-500 text-sm md:text-base">Chargement des données...</p>
                </div>
            </section>
        )
    }

    return (
        <section className="bg-white rounded-xl md:rounded-2xl shadow-sm p-3 md:p-4 lg:p-5 w-full h-full">
            <Button
                onClick={goBack}
                className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 transition-colors mb-4 md:mb-6 text-xs md:text-sm font-medium w-fit"
            >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                Retour à la liste
            </Button>

            <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl overflow-hidden w-full max-w-2xl mx-auto shadow-sm">
                {/* Header */}
                <div className="p-4 md:p-6 border-b border-gray-50 bg-gray-50/30">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Code2 className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
                        {isEditMode ? 'Modifier le Langage' : 'Nouveau Langage'}
                    </h2>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">
                        {isEditMode ? 'Modifiez les informations du langage' : 'Ajoutez un nouveau langage ou une technologie'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
                    {/* Nom du Langage */}
                    <div className="space-y-2">
                        <label className="text-xs md:text-sm font-semibold text-gray-700">
                            Nom du langage / techno <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="text"
                            placeholder="ex: TypeScript, Python..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2.5 md:p-3 border rounded-lg md:rounded-[10px] border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm md:text-base transition-all"
                            required
                        />
                    </div>

                    {/* Zone d'upload d'icône */}
                    <div className="space-y-2">
                        <label className="text-xs md:text-sm font-semibold text-gray-700">
                            Icône (SVG ou PNG recommandé) {!isEditMode && <span className="text-red-500">*</span>}
                        </label>

                        <div 
                            className={`border-2 border-dashed rounded-xl md:rounded-2xl p-4 md:p-6 transition-all ${
                                isDragging 
                                    ? 'border-indigo-500 bg-indigo-50' 
                                    : 'border-gray-200 bg-gray-50 hover:border-indigo-300'
                            }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
                                {/* Aperçu */}
                                <div className="w-20 h-20 md:w-24 md:h-24 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center bg-white overflow-hidden relative group shrink-0">
                                    {previewUrl ? (
                                        <>
                                            {/* ✅ Utiliser Img au lieu de img */}
                                            <Img 
                                                src={previewUrl} 
                                                alt="Preview" 
                                                className="w-12 h-12 md:w-16 md:h-16 object-contain"
                                            />
                                            <Button
                                                type="button"
                                                onClick={clearImage}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                                                title="Supprimer l'image"
                                            >
                                                <X className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                            </Button>
                                        </>
                                    ) : (
                                        <ImagePlus className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
                                    )}
                                </div>

                                {/* Bouton de sélection */}
                                <div className="flex-1 w-full text-center sm:text-left">
                                    <label className="inline-flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 border border-gray-300 rounded-lg md:rounded-xl text-xs md:text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors w-full sm:w-auto justify-center">
                                        <Upload className="w-4 h-4 md:w-5 md:h-5" />
                                        Choisir un fichier
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                    <p className="text-[10px] md:text-xs text-gray-400 mt-2">
                                        Maximum 1 Mo. Format SVG idéal pour le web.
                                    </p>
                                    {isEditMode && !imageFile && (
                                        <p className="text-[10px] md:text-xs text-blue-500 mt-1">
                                            Laissez vide pour conserver l'icône actuelle
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Boutons Actions */}
                    <div className="pt-4 md:pt-6 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-gray-100">
                        <Button
                            type="button"
                            onClick={goBack}
                            className="w-full sm:w-auto px-6 py-2.5 text-xs md:text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg md:rounded-xl transition-colors"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto bg-indigo-600 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-lg md:rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                                    Enregistrement...
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
            </div>
        </section>
    )
}

export default LanguageForm