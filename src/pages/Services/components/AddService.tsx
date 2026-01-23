import { useEffect, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { ArrowLeft, ImagePlus, Save } from "lucide-react"
import ReactQuill from "react-quill-new"
import 'react-quill-new/dist/quill.snow.css'
import Button from "../../../ui/Button"
import { useNavigate, useParams } from "react-router-dom"
import Input from "../../../ui/Input"
import api from "../../../axios/api"

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

    const navigate = useNavigate()
    const params = useParams()
    const id = params.id

    const isEditMode = Boolean(id)


    const GoBack = () => navigate(-1)

    // Gestion des inputs textuels classiques
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Gestion de la prévisualisation de l'image
    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Nettoyer l'ancienne URL de preview pour éviter les fuites mémoire
            if (formData.preview) URL.revokeObjectURL(formData.preview)

            setFormData(prev => ({
                ...prev,
                image: file,
                preview: URL.createObjectURL(file)
            }))
        }
    }

    // Gestion de l'éditeur riche
    const handleEditorChange = (content: string) => {
        setFormData(prev => ({ ...prev, details: content }))
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
            }
        }

        DetailsService()
    }, [id, isEditMode])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setMessage("")

        const { nom, description, details, image } = formData

        if (!nom || !description || !details || !image) {
            setMessage("⚠️ Tous les champs sont obligatoires !")
            return
        }

        setLoading(true)
        try {
            const data = new FormData()
            data.append("title", nom)
            data.append("description", description)
            data.append("details", details)
            data.append("image", image)

            const res = isEditMode ? await api.put(`/services/update/${id}`, data, {
                headers: { "Content-Type": "multipart/form-data" },
            }) : await api.post("/services/add", data, {
                headers: { "Content-Type": "multipart/form-data" },
            })

            if (res.data.success) {
                setMessage("✅ Service créé avec succès !")
                setFormData({ nom: "", image: null, preview: "", description: "", details: "" })
            } else {
                setMessage(res.data.message || "Erreur lors de la création.")
            }
        } catch (error) {
            console.error(error)
            setMessage("❌ Erreur serveur, vérifiez la console.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="w-full h-full bg-white rounded-xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="p-6 flex justify-between items-center">
                <Button onClick={GoBack} className="cursor-pointer px-6 py-2 flex items-center gap-2">
                    <ArrowLeft size={18} />
                    Retour
                </Button>
                <div className="text-right">
                    <h2 className="text-xl font-black">Ajouter un nouveau service</h2>
                    <p className="text-sm text-gray-500">Remplissez les informations ci-dessous</p>
                </div>
            </div>

            {/* Message d'alerte */}
            {message && (
                <div className={`mx-8 mt-4 p-3 rounded-lg text-sm font-medium ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message}
                </div>
            )}

            <form className="p-8 space-y-8" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                    {/* Colonne gauche : Infos de base */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Nom du service</label>
                            <Input
                                name="nom"
                                type="text"
                                value={formData.nom}
                                placeholder="Ex: Développement Mobile"
                                className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Description courte</label>
                            <textarea
                                name="description"
                                placeholder="Résumé rapide du service..."
                                value={formData.description}
                                className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 focus:outline-none transition-all resize-none h-24"
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Image de couverture</label>
                            <div className="relative group border-2 border-dashed border-gray-200 rounded-2xl h-64 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer overflow-hidden">
                                {formData.preview ? (
                                    <img src={formData.preview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <ImagePlus size={40} className="text-gray-400 group-hover:text-blue-500" />
                                        <span className="text-sm text-gray-500 mt-2">Cliquez pour choisir une image</span>
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
                        <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Détails complets du service</label>
                        <div className="flex-1 min-h-75 border-2 border-gray-100 overflow-hidden focus-within:border-blue-500 transition-all">
                            <ReactQuill
                                theme="snow"
                                value={formData.details}
                                onChange={handleEditorChange}
                                placeholder="Rédigez ici le contenu détaillé..."
                                className=" h-full bg-white"
                            />
                        </div>

                        <div className="mt-4 flex justify-end">
                            {isEditMode ? (
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
                                >
                                    <Save size={20} />
                                    {loading ? "Mise à jour..." : "Mettre à jour le service"}
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
                                >
                                    <Save size={20} />
                                    {loading ? "Enregistrement..." : "Enregistrer le service"}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </section>
    )
}

export default AddService