import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { UserPlus, Briefcase, Link, ArrowLeft, Save } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../../axios/api'
import Input from '../../../ui/Input'
import Button from '../../../ui/Button'

interface Collaborator {
    id: number
    fullname: string
    jobTitle: string
    link: string
}


function CollabsForm() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [fullname, setFullname] = useState('')
    const [jobTitle, setJobTitle] = useState('')
    const [link, setLink] = useState('')

    const { id } = useParams()
    const isEditMode = Boolean(id)

    useEffect(() => {
        if (!isEditMode) return
        const fetchDetails = async () => {
            try {

                const res = await api.get(`/collabs/details/${id}`)
                if (!res.data.success) return alert(res.data.message)
                const data: Collaborator = res.data.collab
                setFullname(data.fullname)
                setJobTitle(data.jobTitle)
                setLink(data.link)

            } catch (error) {
                console.log("Erreur: ", error)
            }
        }

        fetchDetails()

    }, [id, isEditMode])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = isEditMode ? await api.put(`/collabs/update/${id}`, {
                fullname,
                jobTitle,
                link
            }) : await api.post("/collabs/add", {
                fullname,
                jobTitle,
                link
            })

            if (res.data.success) {
                alert(res.data.message)
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout:", error)
            alert("Une erreur est survenue.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="w-full h-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            {/* Header du Formulaire */}
            <div className="p-6 bg-gray-50 border-b flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Ajouter un Collaborateur</h2>
                    <p className="text-sm text-gray-500">Créez un nouveau profil pour votre équipe.</p>
                </div>
                <Button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
                >
                    <ArrowLeft size={18} />
                    <span>Retour</span>
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 max-w-2xl mx-auto space-y-6">
                {/* Champ Nom Complet */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <UserPlus size={16} className="text-indigo-500" />
                        Nom complet
                    </label>
                    <Input
                        type="text"
                        placeholder="ex: Jonathan Doe"
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                        className="w-full border border-gray-100 p-3 rounded-[5px] focus:outline-1 focus:outline-blue-500"
                        required
                    />
                </div>

                {/* Champ Poste / Job Title */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Briefcase size={16} className="text-indigo-500" />
                        Intitulé du poste
                    </label>
                    <Input
                        type="text"
                        placeholder="ex: Développeur React / Designer"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="w-full border border-gray-100 p-3 rounded-[5px] focus:outline-1 focus:outline-blue-500"
                        required
                    />
                </div>

                {/* Champ Lien Profil */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Link size={16} className="text-indigo-500" />
                        Lien du profil (LinkedIn / Portfolio)
                    </label>
                    <Input
                        type="url"
                        placeholder="https://..."
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        className="w-full border border-gray-100 p-3 rounded-[5px] focus:outline-1 focus:outline-blue-500"
                        required
                    />
                </div>

                {/* Boutons d'action */}
                <div className="flex items-center gap-4 pt-6 border-t border-gray-100 mt-8">
                    <Button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex-1 border border-gray-200 py-3 rounded-[5px]"
                    >
                        Annuler
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-indigo-600 text-white flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-md py-3 rounded-[5px]"
                    >
                        {loading ? (
                            "Enregistrement..."
                        ) : (
                            <>
                                <Save size={18} />
                                {isEditMode ? "Mettre à jour" : "Enregistrer le collaborateur"}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </section>
    )
}

export default CollabsForm