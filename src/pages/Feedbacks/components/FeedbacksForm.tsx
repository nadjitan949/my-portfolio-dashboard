import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { MessageSquare, User, Briefcase, Image as ImageIcon, Save, ArrowLeft, X } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../../axios/api'
import Input from '../../../ui/Input'
import Button from '../../../ui/Button'

function FeedbacksForm() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    const [author, setAuthor] = useState('')
    const [jobTitle, setJobTitle] = useState('')
    const [content, setContent] = useState('')
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

    useEffect(() => {
        if (!isEditMode) return

        const fetchDetailsFeedbacks = async () => {
            try {

                const res = await api.get(`/feedbacks/details/${id}`)
                if (!res.data.success) return alert(res.data.message)
                setAuthor(res.data.feedback.author)
                setJobTitle(res.data.feedback.jobTitle)
                setContent(res.data.feedback.content)
                setPreviewUrl(res.data.feedback.image.url)

            } catch (error) {
                console.log("Erreur: ", error)
            }
        }

        fetchDetailsFeedbacks()
    }, [id, isEditMode])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const formData = new FormData()
            formData.append('author', author)
            formData.append('jobTitle', jobTitle)
            formData.append('content', content)
            if (imageFile) formData.append('image', imageFile)

            const res = isEditMode ? await api.put(`/feedbacks/update/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            }) : await api.post('/feedbacks/add', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            if (!res.data.success) return alert(res.data.message)
            alert(res.data.message)
            if (res.data.success) navigate('/feedbacks')
        } catch (error) {
            console.error("Erreur:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="bg-white h-full rounded-xl p-5 mx-auto mt-8">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 transition-colors mb-6 text-sm font-medium"
            >
                <ArrowLeft size={16} />
                Retour aux témoignages
            </button>

            <div className="bg-white rounded-2xl border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/30">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <MessageSquare className="text-indigo-600" size={22} />
                        Nouveau Témoignage
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Auteur */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Nom du client / auteur</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <Input
                                    type="text"
                                    placeholder="ex: Client de l'agence A"
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                    className="px-10 p-3 w-full border border-gray-100 focus:outline-1 rounded-[5px] "
                                    required
                                />
                            </div>
                        </div>

                        {/* Job Title */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Poste / Rôle</label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <Input
                                    type="text"
                                    placeholder="ex: Manager"
                                    value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                    className=" px-10 p-3 w-full border border-gray-100 focus:outline-1 rounded-[5px] "
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contenu du feedback */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Message</label>
                        <textarea
                            placeholder="Écrivez le témoignage ici..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={5}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                            required
                        ></textarea>
                    </div>

                    {/* Upload Photo de l'auteur */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Photo de l'auteur (Optionnel)</label>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group">
                                {previewUrl ? (
                                    <>
                                        <img src={previewUrl} alt="Auteur" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => { setPreviewUrl(null); setImageFile(null) }}
                                            className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={16} />
                                        </button>
                                    </>
                                ) : (
                                    <ImageIcon size={24} className="text-gray-300" />
                                )}
                            </div>
                            <label className="cursor-pointer bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
                                Parcourir...
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                        </div>
                    </div>

                    {/* Boutons Actions */}
                    <div className="pt-6 flex items-center justify-end gap-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            Annuler
                        </button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 text-white px-8 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-indigo-700 shadow-md disabled:opacity-50"
                        >
                            {loading ? "Envoi..." : <><Save size={18} /> Enregistrer l'avis</>}
                        </Button>
                    </div>
                </form>
            </div>
        </section>
    )
}

export default FeedbacksForm