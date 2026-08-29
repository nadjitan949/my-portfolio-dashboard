import { useEffect, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { ArrowLeft, ImagePlus, Save, Loader2 } from "lucide-react"
import ReactQuill from "react-quill-new"
import 'react-quill-new/dist/quill.snow.css'
import Button from "../../../ui/Button"
import { useNavigate, useParams } from "react-router-dom"
import Input from "../../../ui/Input"
import api from "../../../axios/api"
import { useNotification } from "../../../hooks/useNotification"

interface ServiceForm {
    nom: string
    image: File | null
    preview: string
    description: string
    details: string
}

interface Image {
    url: string
    public_id: string
}

interface Service {
    id: number
    title: string
    image: Image
    description: string
    details: string
}

function AddService() {
    const [formData, setFormData] = useState<ServiceForm>({
        nom: "",
        image: null,
        preview: "",
        description: "",
        details: ""
    })

    const [message, setMessage] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)
    const [isDragging, setIsDragging] = useState<boolean>(false)

    const navigate = useNavigate()
    const params = useParams()
    const id = params.id
    const { addToast } = useNotification()

    const isEditMode = Boolean(id)

    const GoBack = () => navigate(-1)

    // Gestion des inputs textuels classiques
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (message) setMessage("")
    }

    // Gestion de la prévisualisation de l'image
    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Vérifier le type de fichier
            if (!file.type.startsWith('image/')) {
                setMessage("⚠️ Veuillez sélectionner une image valide !")
                return
            }
            
            // Vérifier la taille (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setMessage("⚠️ L'image ne doit pas dépasser 5MB !")
                return
            }

            // Nettoyer l'ancienne URL de preview pour éviter les fuites mémoire
            if (formData.preview && formData.preview.startsWith('blob:')) {
                URL.revokeObjectURL(formData.preview)
            }

            setFormData(prev => ({
                ...prev,
                image: file,
                preview: URL.createObjectURL(file)
            }))
            setMessage("")
        }
    }

    // Gestion du drag & drop
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

    // Gestion de l'éditeur riche
    const handleEditorChange = (content: string) => {
        setFormData(prev => ({ ...prev, details: content }))
        if (message) setMessage("")
    }

    useEffect(() => {
        if (!isEditMode) return

        const DetailsService = async () => {
            try {
                const res = await api.get(`/services/details/${id}`)
                if (!res.data.success) {
                    return setMessage(res.data.message)
                }

                const service: Service = res.data.service
                setFormData({
                    nom: service.title || "",
                    image: null,
                    preview: service.image?.url || "",
                    description: service.description || "",
                    details: service.details || ""
                })

            } catch (error) {
                console.log("Erreur: ", error)
                setMessage("❌ Impossible de charger les détails du service")
            }
        }

        DetailsService()
    }, [id, isEditMode, addToast]) // ✅ Correction : addToast ajouté

    // Nettoyage de la preview lors du démontage
    useEffect(() => {
        return () => {
            if (formData.preview && formData.preview.startsWith('blob:')) {
                URL.revokeObjectURL(formData.preview)
            }
        }
    }, [])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setMessage("")

        const { nom, description, details, image } = formData

        // Validation
        if (!nom.trim()) {
            setMessage("⚠️ Le nom du service est obligatoire !")
            return
        }
        if (!description.trim()) {
            setMessage("⚠️ La description courte est obligatoire !")
            return
        }
        if (!details || details === '<p><br></p>') {
            setMessage("⚠️ Les détails complets sont obligatoires !")
            return
        }
        if (!isEditMode && !image) {
            setMessage("⚠️ L'image de couverture est obligatoire !")
            return
        }

        setLoading(true)
        try {
            const data = new FormData()
            data.append("title", nom)
            data.append("description", description)
            data.append("details", details)
            if (image) data.append("image", image)

            const res = isEditMode 
                ? await api.put(`/services/update/${id}`, data, {
                    headers: { "Content-Type": "multipart/form-data" },
                }) 
                : await api.post("/services/add", data, {
                    headers: { "Content-Type": "multipart/form-data" },
                })

            if (res.data.success) {
                addToast('success', isEditMode ? 'Service modifié' : 'Service créé', 'Opération réussie !')
                if (!isEditMode) {
                    setFormData({ nom: "", image: null, preview: "", description: "", details: "" })
                }
            } else {
                setMessage(res.data.message || "Erreur lors de l'opération.")
            }
        } catch (error) {
            console.error(error)
            setMessage("❌ Erreur serveur, vérifiez la console.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="w-full h-full bg-white rounded-xl md:rounded-2xl shadow-sm">
            {/* Header */}
            <div className="p-4 md:p-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-gray-50">
                <Button 
                    onClick={GoBack} 
                    className="cursor-pointer px-4 md:px-6 py-2 flex items-center gap-2 w-fit bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all"
                >
                    {/* ✅ Correction */}
                    <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden sm:inline">Retour</span>
                </Button>
                <div className="md:text-right">
                    <h2 className="text-lg md:text-xl font-black">
                        {isEditMode ? "Modifier ce service" : "Ajouter un nouveau service"}
                    </h2>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">
                        Remplissez les informations ci-dessous
                    </p>
                </div>
            </div>

            {/* Message d'alerte */}
            {message && (
                <div className={`mx-4 md:mx-8 mt-4 p-3 md:p-4 rounded-lg text-xs md:text-sm font-medium flex items-start gap-2 ${
                    message.includes('✅') 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                    <span className="flex-1">{message}</span>
                    <button 
                        onClick={() => setMessage("")} 
                        className="shrink-0 hover:opacity-70 transition-opacity"
                    >
                        ✕
                    </button>
                </div>
            )}

            <form className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
                    {/* Colonne gauche : Infos de base */}
                    <div className="space-y-5 md:space-y-6">
                        <div>
                            <label className="block text-xs md:text-sm font-bold mb-2 uppercase tracking-wide text-gray-700">
                                Nom du service
                            </label>
                            <Input
                                name="nom"
                                type="text"
                                value={formData.nom}
                                placeholder="Ex: Développement Mobile"
                                className="w-full p-3 md:p-3.5 border-2 border-gray-100 rounded-xl focus:border-blue-500 focus:outline-none transition-all text-sm md:text-base"
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-xs md:text-sm font-bold mb-2 uppercase tracking-wide text-gray-700">
                                Description courte
                            </label>
                            <textarea
                                name="description"
                                placeholder="Résumé rapide du service..."
                                value={formData.description}
                                className="w-full p-3 md:p-3.5 border-2 border-gray-100 rounded-xl focus:border-blue-500 focus:outline-none transition-all resize-none h-24 md:h-28 text-sm md:text-base"
                                onChange={handleChange}
                                maxLength={200}
                            ></textarea>
                            <p className="text-xs text-gray-400 mt-1 text-right">
                                {formData.description.length}/200 caractères
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs md:text-sm font-bold mb-2 uppercase tracking-wide text-gray-700">
                                Image de couverture
                            </label>
                            <div 
                                className={`relative group border-2 border-dashed rounded-2xl h-56 md:h-64 lg:h-72 flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden ${
                                    isDragging 
                                        ? 'border-blue-500 bg-blue-50' 
                                        : formData.preview 
                                            ? 'border-gray-200 bg-gray-50' 
                                            : 'border-gray-300 bg-gray-50 hover:bg-blue-50 hover:border-blue-300'
                                }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                {formData.preview ? (
                                    <>
                                        <img 
                                            src={formData.preview} 
                                            alt="Preview" 
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white text-sm font-medium bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                                                Changer l'image
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* ✅ Correction */}
                                        <ImagePlus className="w-8 h-8 md:w-10 md:h-10 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                        <span className="text-xs md:text-sm text-gray-500 mt-2 text-center px-4">
                                            Cliquez ou glissez-déposez une image
                                        </span>
                                        <span className="text-[10px] md:text-xs text-gray-400 mt-1">
                                            PNG, JPG jusqu'à 5MB
                                        </span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={handleImageChange}
                                    accept="image/*"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Colonne droite : Éditeur riche */}
                    <div className="flex flex-col gap-2">
                        <label className="block text-xs md:text-sm font-bold mb-2 uppercase tracking-wide text-gray-700">
                            Détails complets du service
                        </label>
                        <div className="flex-1 min-h-75 md:min-h-100 border-2 border-gray-100 rounded-xl overflow-hidden focus-within:border-blue-500 transition-all bg-white">
                            <ReactQuill
                                theme="snow"
                                value={formData.details}
                                onChange={handleEditorChange}
                                placeholder="Rédigez ici le contenu détaillé..."
                                className="h-full bg-white"
                                modules={{
                                    toolbar: [
                                        [{ 'header': [1, 2, 3, false] }],
                                        ['bold', 'italic', 'underline', 'strike'],
                                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                        [{ 'color': [] }, { 'background': [] }],
                                        ['link', 'image'],
                                        ['clean']
                                    ]
                                }}
                            />
                        </div>

                        <div className="mt-4 md:mt-6 flex justify-end">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                            >
                                {loading ? (
                                    <>
                                        {/* ✅ Correction */}
                                        <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                                        {isEditMode ? "Mise à jour..." : "Enregistrement..."}
                                    </>
                                ) : (
                                    <>
                                        {/* ✅ Correction */}
                                        <Save className="w-4 h-4 md:w-5 md:h-5" />
                                        {isEditMode ? "Mettre à jour le service" : "Enregistrer le service"}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </section>
    )
}

export default AddService