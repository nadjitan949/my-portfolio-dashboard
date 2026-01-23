import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Code2, Upload, X, Save, ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../../axios/api'
import Input from '../../../ui/Input'
import Button from '../../../ui/Button'

function LanguageForm() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState('')

    // États pour l'image
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const { id } = useParams()
    const isEditMode = Boolean(id)

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const clearImage = () => {
        setImageFile(null)
        setPreviewUrl(null)
    }

    useEffect(() => {
        if(!isEditMode) return
        const fetchDetailsLanguages = async () => {
            try {

                const res = await api.get(`/langages/details/${id}`)
                if (!res.data.success) return alert(res.data.message)
                setName(res.data.language.name)
                setPreviewUrl(res.data.language.icone.url)

            } catch (error) {
                console.log("Erreur: ", error)
            }
        }

        fetchDetailsLanguages()
    }, [id, isEditMode])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        setLoading(true)
        const formData = new FormData()
        formData.append('name', name)
        if (imageFile) {
            formData.append('icone', imageFile)
        }

        try {
            const res = isEditMode ? await api.put(`/langages/update/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            }) : await api.post('/langages/add', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            if (!res.data.success) alert(res.data.message)
            alert(res.data.message)

            navigate(-1)
        } catch (error) {
            console.error("Erreur:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="bg-white rounded-xl p-5 w-full h-full">
            <Button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 transition-colors mb-6 text-sm font-medium"
            >
                <ArrowLeft size={16} />
                Retour à la liste
            </Button>

            <div className="bg-white border m-auto w-[50%] border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/30">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Code2 className="text-indigo-600" size={24} />
                        Nouveau Langage
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Nom du Langage */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Nom du langage / techno</label>
                        <Input
                            type="text"
                            placeholder="ex: TypeScript, Python..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 border rounded-[5px] border-gray-200 focus:outline-1 focus:border-blue-500"
                            required
                        />
                    </div>

                    {/* Zone d'upload d'icône */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Icône (SVG ou PNG recommandé)</label>

                        <div className="flex items-center gap-6">
                            {/* Aperçu */}
                            <div className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center bg-gray-50 overflow-hidden relative group">
                                {previewUrl ? (
                                    <>
                                        <img src={previewUrl} alt="Preview" className="w-16 h-16 object-contain" />
                                        <Button
                                            type="button"
                                            onClick={clearImage}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                        >
                                            <X size={14} />
                                        </Button>
                                    </>
                                ) : (
                                    <Code2 size={32} className="text-gray-300" />
                                )}
                            </div>

                            {/* Bouton de sélection */}
                            <div className="flex-1">
                                <label className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors">
                                    <Upload size={16} />
                                    Choisir un fichier
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </label>
                                <p className="text-xs text-gray-400 mt-2">Maximum 1 Mo. Format SVG idéal pour le web.</p>
                            </div>
                        </div>
                    </div>

                    {/* Boutons Actions */}
                    <div className="pt-6 flex items-center justify-end gap-4 border-t border-gray-100">
                        <Button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 text-white px-8 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-indigo-700 shadow-sm disabled:opacity-50"
                        >
                            {loading ? "Chargement..." : <><Save size={18} /> Enregistrer</>}
                        </Button>
                    </div>
                </form>
            </div>
        </section>
    )
}

export default LanguageForm