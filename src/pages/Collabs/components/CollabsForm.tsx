import { useEffect, useState } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import { UserPlus, Briefcase, Link, ArrowLeft, Save, Loader2, X } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../../axios/api'
import Input from '../../../ui/Input'
import Button from '../../../ui/Button'
import { useNotification } from '../../../hooks/useNotification'

interface Collaborator {
    id: number
    fullname: string
    jobTitle: string
    link: string
}

function CollabsForm() {
    const navigate = useNavigate()
    const { addToast } = useNotification()
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(false)
    const [fullname, setFullname] = useState('')
    const [jobTitle, setJobTitle] = useState('')
    const [link, setLink] = useState('')
    const [errors, setErrors] = useState<{ fullname?: string; jobTitle?: string; link?: string }>({})

    const { id } = useParams()
    const isEditMode = Boolean(id)

    const goBack = () => navigate(-1)

    useEffect(() => {
        if (!isEditMode) return
        
        const fetchDetails = async () => {
            setLoadingData(true)
            try {
                const res = await api.get(`/collabs/details/${id}`)
                if (!res.data.success) {
                    addToast('error', 'Erreur', res.data.message)
                    return
                }
                const data: Collaborator = res.data.collab
                setFullname(data.fullname || '')
                setJobTitle(data.jobTitle || '')
                setLink(data.link || '')

            } catch (error) {
                console.error("Erreur: ", error)
                addToast('error', 'Erreur', 'Impossible de charger les détails')
            } finally {
                setLoadingData(false)
            }
        }

        fetchDetails()
    }, [id, isEditMode, addToast])

    // Validation en temps réel
    const validateField = (field: 'fullname' | 'jobTitle' | 'link', value: string) => {
        const newErrors = { ...errors }
        
        if (field === 'fullname') {
            if (!value.trim()) {
                newErrors.fullname = "Le nom complet est obligatoire"
            } else if (value.trim().length < 3) {
                newErrors.fullname = "Le nom doit contenir au moins 3 caractères"
            } else {
                delete newErrors.fullname
            }
        }
        
        if (field === 'jobTitle') {
            if (!value.trim()) {
                newErrors.jobTitle = "L'intitulé du poste est obligatoire"
            } else if (value.trim().length < 2) {
                newErrors.jobTitle = "L'intitulé doit contenir au moins 2 caractères"
            } else {
                delete newErrors.jobTitle
            }
        }
        
        if (field === 'link') {
            if (value && !/^https?:\/\/.+/.test(value)) {
                newErrors.link = "Le lien doit commencer par http:// ou https://"
            } else {
                delete newErrors.link
            }
        }
        
        setErrors(newErrors)
    }

    const handleFullnameChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setFullname(value)
        validateField('fullname', value)
    }

    const handleJobTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setJobTitle(value)
        validateField('jobTitle', value)
    }

    const handleLinkChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setLink(value)
        validateField('link', value)
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        
        // Validation finale
        const finalErrors: { fullname?: string; jobTitle?: string; link?: string } = {}
        
        if (!fullname.trim()) {
            finalErrors.fullname = "Le nom complet est obligatoire"
        } else if (fullname.trim().length < 3) {
            finalErrors.fullname = "Le nom doit contenir au moins 3 caractères"
        }
        
        if (!jobTitle.trim()) {
            finalErrors.jobTitle = "L'intitulé du poste est obligatoire"
        }
        
        if (link && !/^https?:\/\/.+/.test(link)) {
            finalErrors.link = "Le lien doit commencer par http:// ou https://"
        }
        
        if (Object.keys(finalErrors).length > 0) {
            setErrors(finalErrors)
            return
        }

        setLoading(true)
        try {
            const res = isEditMode 
                ? await api.put(`/collabs/update/${id}`, {
                    fullname: fullname.trim(),
                    jobTitle: jobTitle.trim(),
                    link: link.trim()
                }) 
                : await api.post("/collabs/add", {
                    fullname: fullname.trim(),
                    jobTitle: jobTitle.trim(),
                    link: link.trim()
                })

            if (res.data.success) {
                addToast('success', isEditMode ? 'Collaborateur mis à jour' : 'Collaborateur créé', 'Opération réussie !')
                setTimeout(() => navigate('/collabs'), 500)
            } else {
                addToast('error', 'Erreur', res.data.message || "Une erreur est survenue")
            }
        } catch {
            addToast('error', 'Erreur', "Une erreur est survenue")
        } finally {
            setLoading(false)
        }
    }

    const handleReset = () => {
        setFullname('')
        setJobTitle('')
        setLink('')
        setErrors({})
    }

    // État de chargement
    if (loadingData) {
        return (
            <section className="w-full h-full bg-white rounded-xl md:rounded-2xl shadow-sm overflow-hidden flex items-center justify-center">
                <div className="text-center p-8">
                    <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin text-indigo-600 mx-auto mb-3 md:mb-4" />
                    <p className="text-sm md:text-base text-gray-500">Chargement des données...</p>
                </div>
            </section>
        )
    }

    return (
        <section className="w-full h-full bg-white rounded-xl md:rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            {/* Header du Formulaire */}
            <div className="p-4 md:p-6 bg-gray-50 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex w-10 h-10 md:w-12 md:h-12 bg-indigo-50 rounded-xl items-center justify-center">
                        <UserPlus className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-gray-800">
                            {isEditMode ? 'Modifier le Collaborateur' : 'Ajouter un Collaborateur'}
                        </h2>
                        <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                            {isEditMode ? 'Modifiez les informations du collaborateur' : 'Créez un nouveau profil pour votre équipe.'}
                        </p>
                    </div>
                </div>
                <Button
                    onClick={goBack}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 w-full sm:w-auto justify-center"
                >
                    <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden sm:inline">Retour</span>
                    <span className="sm:hidden">Retour à la liste</span>
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 md:p-6 lg:p-8 max-w-2xl mx-auto space-y-5 md:space-y-6">
                {/* Champ Nom Complet */}
                <div className="space-y-2">
                    <label className="text-xs md:text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <UserPlus className="w-4 h-4 md:w-5 md:h-5 text-indigo-500" />
                        Nom complet <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="text"
                        placeholder="ex: Jonathan Doe"
                        value={fullname}
                        onChange={handleFullnameChange}
                        className={`w-full border p-2.5 md:p-3 rounded-lg md:rounded-[10px] focus:outline-none focus:ring-2 transition-all text-sm md:text-base ${
                            errors.fullname 
                                ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                                : 'border-gray-200 focus:ring-indigo-500/20 focus:border-indigo-500'
                        }`}
                        required
                    />
                    {errors.fullname && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                            <X className="w-3 h-3" />
                            {errors.fullname}
                        </p>
                    )}
                </div>

                {/* Champ Poste / Job Title */}
                <div className="space-y-2">
                    <label className="text-xs md:text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 md:w-5 md:h-5 text-indigo-500" />
                        Intitulé du poste <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="text"
                        placeholder="ex: Développeur React / Designer"
                        value={jobTitle}
                        onChange={handleJobTitleChange}
                        className={`w-full border p-2.5 md:p-3 rounded-lg md:rounded-[10px] focus:outline-none focus:ring-2 transition-all text-sm md:text-base ${
                            errors.jobTitle 
                                ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                                : 'border-gray-200 focus:ring-indigo-500/20 focus:border-indigo-500'
                        }`}
                        required
                    />
                    {errors.jobTitle && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                            <X className="w-3 h-3" />
                            {errors.jobTitle}
                        </p>
                    )}
                </div>

                {/* Champ Lien Profil */}
                <div className="space-y-2">
                    <label className="text-xs md:text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Link className="w-4 h-4 md:w-5 md:h-5 text-indigo-500" />
                        Lien du profil (LinkedIn / Portfolio) <span className="text-xs font-normal text-gray-400">(optionnel)</span>
                    </label>
                    <Input
                        type="url"
                        placeholder="https://..."
                        value={link}
                        onChange={handleLinkChange}
                        className={`w-full border p-2.5 md:p-3 rounded-lg md:rounded-[10px] focus:outline-none focus:ring-2 transition-all text-sm md:text-base ${
                            errors.link 
                                ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                                : 'border-gray-200 focus:ring-indigo-500/20 focus:border-indigo-500'
                        }`}
                    />
                    {errors.link ? (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                            <X className="w-3 h-3" />
                            {errors.link}
                        </p>
                    ) : (
                        <p className="text-xs text-gray-400">
                            Format attendu : https://linkedin.com/in/...
                        </p>
                    )}
                </div>

                {/* Boutons d'action */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-5 md:pt-6 border-t border-gray-100 mt-6 md:mt-8">
                    <Button
                        type="button"
                        onClick={goBack}
                        className="w-full sm:w-auto flex-1 sm:flex-none px-6 py-2.5 md:py-3 border border-gray-200 rounded-lg md:rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-sm md:text-base"
                    >
                        Annuler
                    </Button>
                    
                    {(fullname || jobTitle || link) && !isEditMode && (
                        <Button
                            type="button"
                            onClick={handleReset}
                            className="w-full sm:w-auto flex-1 sm:flex-none px-6 py-2.5 md:py-3 border border-gray-200 rounded-lg md:rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-sm md:text-base"
                        >
                            Réinitialiser
                        </Button>
                    )}
                    
                    <Button
                        type="submit"
                        disabled={loading || Object.keys(errors).length > 0}
                        className="w-full sm:w-auto flex-1 sm:flex-none bg-indigo-600 text-white flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-md py-2.5 md:py-3 px-6 md:px-8 rounded-lg md:rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                                Enregistrement...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 md:w-5 md:h-5" />
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