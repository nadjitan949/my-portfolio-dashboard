import React, { useEffect, useState } from "react";
import {
    Save,
    X,
    Plus,
    Monitor,
    Smartphone,
    Tablet,
    Link as LinkIcon,
    Github,
    ArrowLeft,
    Loader2,
} from "lucide-react";
import Button from "../../../ui/Button"
import Input from "../../../ui/Input"
import api from "../../../axios/api";
import { useNavigate, useParams } from "react-router-dom"
import Img from "../../../ui/Img";
import { useNotification } from "../../../hooks/useNotification";

function ProjectForm() {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [type, setType] = useState("web")
    const [status, setStatus] = useState("Terminé")
    const [live, setLive] = useState("")
    const [github, setGithub] = useState("")
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(false)

    // États pour les listes (Tags)
    const [tools, setTools] = useState<string[]>([])
    const [currentTool, setCurrentTool] = useState("")
    const [collabTags, setCollabTags] = useState<string[]>([])
    const [currentTag, setCurrentTag] = useState("")

    const navigate = useNavigate()
    const params = useParams()
    const id = params.id
    const isEditMode = Boolean(id)
    const { addToast } = useNotification()

    const goBack = () => navigate(-1)

    const [files, setFiles] = useState<{ [key: string]: File | null }>({
        computer: null,
        tablet: null,
        mobile: null
    });

    // États pour les images (Previews)
    const [previews, setPreviews] = useState({
        computer: "",
        tablet: "",
        mobile: ""
    })

    // Fonctions pour gérer les tags
    const addTool = () => {
        const tool = currentTool.trim()
        if (tool && !tools.includes(tool)) {
            setTools([...tools, tool])
            setCurrentTool("")
        }
    }

    const addTag = () => {
        const tag = currentTag.trim()
        if (tag && !collabTags.includes(tag)) {
            setCollabTags([...collabTags, tag])
            setCurrentTag("")
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'computer' | 'tablet' | 'mobile') => {
        const file = e.target.files?.[0]
        if (file) {
            // Vérifier le type
            if (!file.type.startsWith('image/')) {
                addToast('error', 'Erreur', 'Veuillez sélectionner une image valide')
                return
            }
            
            // Vérifier la taille (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                addToast('error', 'Erreur', "L'image ne doit pas dépasser 5MB")
                return
            }

            // Nettoyer l'ancienne URL
            setPreviews(prev => {
                if (prev[type].startsWith('blob:')) {
                    URL.revokeObjectURL(prev[type])
                }
                return { ...prev, [type]: URL.createObjectURL(file) }
            })

            setFiles(prev => ({ ...prev, [type]: file }))
        }
    }

    const removeImage = (type: 'computer' | 'tablet' | 'mobile') => {
        setPreviews(prev => {
            if (prev[type].startsWith('blob:')) {
                URL.revokeObjectURL(prev[type])
            }
            return { ...prev, [type]: "" }
        })
        setFiles(prev => ({ ...prev, [type]: null }))
    }

    const removeTool = (index: number) => setTools(tools.filter((_, i) => i !== index))
    const removeTags = (index: number) => setCollabTags(collabTags.filter((_, i) => i !== index))

    useEffect(() => {
        if (!isEditMode) return
        
        const fetchDetailsProject = async () => {
            setLoadingData(true)
            try {
                const res = await api.get(`/projects/details/${id}`)
                if (!res.data.success) {
                    addToast('error', 'Erreur', res.data.message)
                    return
                }

                const data = res.data.project

                setTitle(data.title || "")
                setDescription(data.description || data.desciption || "")
                setType(data.type || "web")
                setStatus(data.status || "Terminé")
                setGithub(data.github || "")
                setLive(data.live || "")

                // Désérialisation des tags
                setCollabTags(
                    typeof data.collabTags === 'string'
                        ? JSON.parse(data.collabTags)
                        : (data.collabTags || [])
                )
                setTools(
                    typeof data.tools === 'string'
                        ? JSON.parse(data.tools)
                        : (data.tools || [])
                )

                // Gérer les URLs des images
                const getFullUrl = (url: string) => {
                    if (!url) return ""
                    if (url.startsWith('http')) return url
                    const base = api.defaults.baseURL || ''
                    try {
                        const origin = new URL(base).origin
                        return `${origin}${url}`
                    } catch {
                        return url
                    }
                }

                setPreviews({
                    computer: getFullUrl(data.computerView || ""),
                    tablet: getFullUrl(data.tabletteView || ""),
                    mobile: getFullUrl(data.mobileView || "")
                })

            } catch (error) {
                console.error("Erreur: ", error)
                addToast('error', 'Erreur', 'Impossible de charger les détails')
            } finally {
                setLoadingData(false)
            }
        }

        fetchDetailsProject()
    }, [id, isEditMode, addToast])

    // Nettoyage des URLs blob
    useEffect(() => {
        return () => {
            Object.values(previews).forEach(url => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url)
                }
            })
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (!title.trim()) {
            addToast('error', 'Erreur', 'Le titre du projet est obligatoire')
            return
        }

        setLoading(true)
        try {
            const formData = new FormData()

            formData.append("title", title.trim())
            formData.append("description", description.trim())
            formData.append("type", type)
            formData.append("status", status)
            formData.append("live", live.trim())
            formData.append("github", github.trim())

            formData.append("tools", JSON.stringify(tools))
            formData.append("collabTags", JSON.stringify(collabTags))

            if (files.computer) formData.append("computerView", files.computer)
            if (files.tablet) formData.append("tabletteView", files.tablet)
            if (files.mobile) formData.append("mobileView", files.mobile)

            const res = isEditMode 
                ? await api.put(`/projects/update/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                }) 
                : await api.post("/projects/add", formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })

            if (res.data.success) {
                addToast('success', isEditMode ? 'Projet mis à jour' : 'Projet créé', 'Opération réussie !')
                setTimeout(() => navigate('/projets'), 500)
            } else {
                addToast('error', 'Erreur', res.data.message || "Erreur lors de l'enregistrement")
            }
        } catch (error) {
            console.error("Erreur: ", error)
            addToast('error', 'Erreur', "Impossible d'enregistrer le projet")
        } finally {
            setLoading(false)
        }
    }

    // État de chargement
    if (loadingData) {
        return (
            <section className="w-full h-full bg-white rounded-xl md:rounded-2xl shadow-sm overflow-hidden">
                <div className="flex flex-col items-center justify-center h-full min-h-100 p-8">
                    <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin text-indigo-600 mb-4" />
                    <p className="text-gray-500">Chargement des données...</p>
                </div>
            </section>
        )
    }

    return (
        <section className="w-full h-full bg-white rounded-xl md:rounded-2xl shadow-sm overflow-y-auto">
            <form className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8" onSubmit={handleSubmit}>
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-4 md:pb-6">
                    <div className="flex items-center gap-3 md:gap-5">
                        <Button 
                            type="button" 
                            onClick={goBack} 
                            className="p-2 md:p-2.5 rounded-lg md:rounded-xl hover:bg-gray-100 cursor-pointer shrink-0"
                        >
                            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                        </Button>

                        <div>
                            <h2 className="text-lg md:text-2xl font-bold text-gray-800">
                                {isEditMode ? 'Modifier le Projet' : 'Ajouter un Projet'}
                            </h2>
                            <p className="text-xs md:text-sm text-gray-500 mt-1">
                                Remplissez les informations pour publier votre réalisation
                            </p>
                        </div>
                    </div>
                    
                    <Button 
                        type="submit"
                        disabled={loading}
                        className={`flex items-center justify-center gap-2 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-lg md:rounded-xl shadow-lg transition-all w-full sm:w-auto ${
                            loading ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl'
                        }`}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                                {isEditMode ? "Mise à jour..." : "Enregistrement..."}
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 md:w-5 md:h-5" />
                                {isEditMode ? "Mettre à jour" : "Enregistrer le projet"}
                            </>
                        )}
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12">
                    {/* COLONNE GAUCHE : Infos Textes */}
                    <div className="space-y-5 md:space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs md:text-sm font-bold text-gray-700 uppercase">
                                Titre du projet <span className="text-red-500">*</span>
                            </label>
                            <Input 
                                placeholder="Ex: E-commerce App" 
                                value={title} 
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} 
                                className="p-3 focus:outline-none rounded-lg md:rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full text-sm md:text-base transition-all" 
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs md:text-sm font-bold text-gray-700 uppercase">Description</label>
                            <textarea
                                className="w-full p-3 md:p-4 bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-25 md:min-h-30 text-sm md:text-base transition-all"
                                placeholder="Décrivez votre projet en quelques lignes..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs md:text-sm font-bold text-gray-700 uppercase">Type</label>
                                <Input 
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl outline-none text-sm md:text-base focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                                    value={type} 
                                    onChange={(e) => setType(e.target.value)} 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs md:text-sm font-bold text-gray-700 uppercase">Statut</label>
                                <select 
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl outline-none text-sm md:text-base focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer transition-all" 
                                    value={status} 
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    <option value="Terminé">Terminé</option>
                                    <option value="En cours">En cours</option>
                                    <option value="En pause">En pause</option>
                                    <option value="Abandonné">Abandonné</option>
                                </select>
                            </div>
                        </div>

                        {/* Section Tags (Outils) */}
                        <div className="space-y-3">
                            <label className="text-xs md:text-sm font-bold text-gray-700 uppercase">Outils & Techs</label>
                            <div className="flex gap-2">
                                <Input 
                                    placeholder="Ajouter un outil (React, Node...)" 
                                    value={currentTool} 
                                    onChange={(e) => setCurrentTool(e.target.value)} 
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                            addTool()
                                        }
                                    }}
                                    className="rounded-lg md:rounded-xl w-full px-3 py-2.5 focus:outline-none bg-gray-50 border border-gray-200 text-sm md:text-base" 
                                />
                                <Button 
                                    type="button" 
                                    onClick={addTool} 
                                    className="p-2.5 md:p-3 bg-blue-500 hover:bg-blue-600 rounded-lg md:rounded-xl text-white transition-colors shrink-0"
                                >
                                    <Plus className="w-4 h-4 md:w-5 md:h-5" />
                                </Button>
                            </div>
                            {tools.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {tools.map((tool, i) => (
                                        <span key={i} className="flex items-center gap-2 px-3 md:px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs md:text-sm font-bold">
                                            {tool} 
                                            <X className="w-3 h-3 md:w-3.5 md:h-3.5 cursor-pointer hover:text-red-500 transition-colors" onClick={() => removeTool(i)} />
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs md:text-sm font-bold text-gray-700 uppercase">Collabs</label>
                            <div className="flex gap-2">
                                <Input 
                                    placeholder="Ajouter un collaborateur" 
                                    value={currentTag} 
                                    onChange={(e) => setCurrentTag(e.target.value)} 
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                            addTag()
                                        }
                                    }}
                                    className="rounded-lg md:rounded-xl w-full px-3 py-2.5 focus:outline-none bg-gray-50 border border-gray-200 text-sm md:text-base" 
                                />
                                <Button 
                                    type="button" 
                                    onClick={addTag} 
                                    className="p-2.5 md:p-3 bg-blue-500 hover:bg-blue-600 rounded-lg md:rounded-xl text-white transition-colors shrink-0"
                                >
                                    <Plus className="w-4 h-4 md:w-5 md:h-5" />
                                </Button>
                            </div>
                            {collabTags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {collabTags.map((collab, i) => (
                                        <span key={i} className="flex items-center gap-2 px-3 md:px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs md:text-sm font-bold">
                                            {collab} 
                                            <X className="w-3 h-3 md:w-3.5 md:h-3.5 cursor-pointer hover:text-red-500 transition-colors" onClick={() => removeTags(i)} />
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-3 md:space-y-4 pt-2 md:pt-4">
                            <h3 className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest">Liens du projet</h3>
                            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg md:rounded-xl">
                                <LinkIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-400 shrink-0" />
                                <input 
                                    type="url" 
                                    placeholder="URL Live" 
                                    className="bg-transparent outline-none w-full text-sm md:text-base" 
                                    value={live} 
                                    onChange={(e) => setLive(e.target.value)} 
                                />
                            </div>
                            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg md:rounded-xl">
                                <Github className="w-4 h-4 md:w-5 md:h-5 text-gray-400 shrink-0" />
                                <input 
                                    type="url" 
                                    placeholder="URL Github" 
                                    className="bg-transparent outline-none w-full text-sm md:text-base" 
                                    value={github} 
                                    onChange={(e) => setGithub(e.target.value)} 
                                />
                            </div>
                        </div>
                    </div>

                    {/* COLONNE DROITE : Images */}
                    <div className="space-y-6 md:space-y-8">
                        <label className="text-xs md:text-sm font-bold text-gray-700 uppercase">Aperçus du projet</label>

                        {/* Computer Upload */}
                        <div className="space-y-3">
                            <p className="text-xs font-semibold text-gray-500 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Monitor className="w-3.5 h-3.5 md:w-4 md:h-4" /> 
                                    Vue Ordinateur
                                </span>
                                {previews.computer && (
                                    <button type="button" onClick={() => removeImage('computer')} className="text-red-500 hover:text-red-600 text-xs font-medium">
                                        Supprimer
                                    </button>
                                )}
                            </p>
                            <label className="group block w-full aspect-video bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl md:rounded-2xl hover:border-indigo-400 transition-all cursor-pointer overflow-hidden relative">
                                {previews.computer ? (
                                    <Img src={previews.computer} className="w-full h-full object-cover" alt="Preview computer" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400 group-hover:text-indigo-500">
                                        <Plus className="w-6 h-6 md:w-8 md:h-8" />
                                        <span className="text-xs mt-2">Cliquer pour uploader (16:9)</span>
                                    </div>
                                )}
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'computer')} />
                            </label>
                        </div>

                        <div className="grid grid-cols-2 gap-4 md:gap-6">
                            {/* Tablet Upload */}
                            <div className="space-y-3">
                                <p className="text-xs font-semibold text-gray-500 flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <Tablet className="w-3.5 h-3.5 md:w-4 md:h-4" /> 
                                        Tablette
                                    </span>
                                    {previews.tablet && (
                                        <button type="button" onClick={() => removeImage('tablet')} className="text-red-500 hover:text-red-600">
                                            <X className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                        </button>
                                    )}
                                </p>
                                <label className="group block w-full aspect-3/4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl md:rounded-2xl hover:border-indigo-400 transition-all cursor-pointer overflow-hidden relative">
                                    {previews.tablet ? (
                                        <Img src={previews.tablet} className="w-full h-full object-cover" alt="Preview tablet" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400 group-hover:text-indigo-500">
                                            <Plus className="w-5 h-5 md:w-6 md:h-6" />
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'tablet')} />
                                </label>
                            </div>

                            {/* Mobile Upload */}
                            <div className="space-y-3">
                                <p className="text-xs font-semibold text-gray-500 flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <Smartphone className="w-3.5 h-3.5 md:w-4 md:h-4" /> 
                                        Mobile
                                    </span>
                                    {previews.mobile && (
                                        <button type="button" onClick={() => removeImage('mobile')} className="text-red-500 hover:text-red-600">
                                            <X className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                        </button>
                                    )}
                                </p>
                                <label className="group block w-full aspect-9/16 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl md:rounded-2xl hover:border-indigo-400 transition-all cursor-pointer overflow-hidden relative">
                                    {previews.mobile ? (
                                        <Img src={previews.mobile} className="w-full h-full object-cover" alt="Preview mobile" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400 group-hover:text-indigo-500">
                                            <Plus className="w-5 h-5 md:w-6 md:h-6" />
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'mobile')} />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </section>
    )
}

export default ProjectForm