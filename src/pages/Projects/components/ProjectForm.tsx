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
} from "lucide-react";
import Button from "../../../ui/Button"
import Input from "../../../ui/Input"
import api from "../../../axios/api";
import { useNavigate, useParams } from "react-router-dom"

function ProjectForm() {

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [type, setType] = useState("web")
    const [status, setStatus] = useState("terminate")
    const [live, setLive] = useState("")
    const [github, setGithub] = useState("")
    const [loading, setLoading] = useState(false)

    // États pour les listes (Tags)
    const [tools, setTools] = useState<string[]>([])
    const [currentTool, setCurrentTool] = useState("")
    const [collabTags, setCollabTags] = useState<string[]>([])
    const [currentTag, setCurrentTag] = useState("")

    const navigate = useNavigate()
    const params = useParams()
    const id = params.id
    const isEditMode = Boolean(id)

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
        if (currentTool && !tools.includes(currentTool)) {
            setTools([...tools, currentTool])
            setCurrentTool("")
        }
    }

    const addTag = () => {
        if (currentTag && !collabTags.includes(currentTag)) {
            setCollabTags([...collabTags, currentTag])
            setCurrentTag("")
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'computer' | 'tablet' | 'mobile') => {
        const file = e.target.files?.[0]
        if (file) {
            // On stocke le fichier pour l'upload futur
            setFiles(prev => ({ ...prev, [type]: file }))

            // On crée l'URL de prévisualisation
            const previewUrl = URL.createObjectURL(file)
            setPreviews(prev => ({ ...prev, [type]: previewUrl }))
        }
    };

    // Fonction pour supprimer une image sélectionnée
    const removeImage = (type: 'computer' | 'tablet' | 'mobile') => {
        setFiles(prev => ({ ...prev, [type]: null }))
        setPreviews(prev => ({ ...prev, [type]: "" }))
    }

    const removeTool = (index: number) => setTools(tools.filter((_, i) => i !== index))
    const removeTags = (index: number) => setCollabTags(collabTags.filter((_, i) => i !== index))

    useEffect(() => {
        if (!isEditMode) return
        const fetchDetailsProject = async () => {

            try {

                const res = await api.get(`/projects/details/${id}`)
                if (!res.data.success) return alert(res.data.message)

                const data = res.data.project

                setTitle(data.title)
                setDescription(data.description)
                setType(data.type)
                setStatus(data.status)
                setCollabTags(data.collabTags)
                setTools(data.tools)
                setGithub(data.github)
                setLive(data.live)
                setPreviews({
                    computer: data.computerView.url,
                    tablet: data.tabletteView.url,
                    mobile: data.mobileView.url

                })

            } catch (error) {
                console.log("Erreur: ", error)
            }

        }

        fetchDetailsProject()

    }, [id, isEditMode])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {

            const formData = new FormData()

            formData.append("title", title)
            formData.append("description", description)
            formData.append("type", type)
            formData.append("status", status)
            formData.append("live", live)
            formData.append("github", github)

            formData.append("tools", JSON.stringify(tools))
            formData.append("collabTags", JSON.stringify(collabTags))

            if (files.computer) formData.append("computerView", files.computer)
            if (files.tablet) formData.append("tabletteView", files.tablet)
            if (files.mobile) formData.append("mobileView", files.mobile)

            setLoading(true)

            const res = isEditMode ? await api.put(`/projects/update/${id}`, formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            ) : await api.post("/projects/add", formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            )

            if (!res.data.success) {
                return alert(res.data.message)
            }

            setLoading(false)
            alert(res.data.message)
            setTitle("")
            setDescription("")
            setLive("")
            setCollabTags([])
            setTools([])
            setGithub("")
            setPreviews({
                computer: "",
                tablet: "",
                mobile: ""
            })

        } catch (error) {
            setLoading(false)
            console.log("Erreur: ", error)
        }
    }

    return (
        <section className="w-full h-full bg-white rounded-xl overflow-y-auto">
            <form className="p-8 space-y-10" onSubmit={handleSubmit}>
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-6">

                    <div className="flex gap-5">

                        <Button type="button" onClick={goBack} className=" px-5 rounded-[10px] hover:bg-gray-100 cursor-pointer">
                            <ArrowLeft />
                        </Button>

                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Ajouter un Projet</h2>
                            <p className="text-sm text-gray-500">Remplissez les informations pour publier votre réalisation</p>
                        </div>
                    </div>
                    {isEditMode ? (
                        <Button className={` flex items-center gap-2 hover:shadow-xl text-white px-8 py-3 rounded-xl shadow-lg transition-all ${loading ? 'bg-indigo-300' : 'bg-indigo-600'}`}>
                            <Save size={20} /> {!loading ? ("Mettre à jour") : ("Mise à jour...")}
                        </Button>
                    ) : (
                        <Button className={` flex items-center gap-2 hover:shadow-xl text-white px-8 py-3 rounded-xl shadow-lg transition-all ${loading ? 'bg-indigo-300' : 'bg-indigo-600'}`}>
                            <Save size={20} /> {!loading ? ("Enregistrer le projet") : ("Enregistrement...")}
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* COLONNE GAUCHE : Infos Textes */}
                    <div className="space-y-6">
                        <div className="space-y-2 flex flex-col">
                            <label className="text-sm font-bold text-gray-700 uppercase">Titre du projet</label>
                            <Input placeholder="Ex: E-commerce App" value={title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} className="p-3 focus:outline-0 rounded-xl border border-gray-100 bg-gray-50" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 uppercase">Description</label>
                            <textarea
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-30"
                                placeholder="Décrivez votre projet en quelques lignes..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase">Type</label>
                                <Input className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg outline-none" value={type} onChange={(e) => setType(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase">Statut</label>
                                <select className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg outline-none" value={status} onChange={(e) => setStatus(e.target.value)}>
                                    <option value="terminate">Terminé</option>
                                    <option value="in-progress">En cours</option>
                                </select>
                            </div>
                        </div>

                        {/* Section Tags (Outils) */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-gray-700 uppercase">Outils & Techs</label>
                            <div className="flex gap-2">
                                <Input placeholder="Ajouter un outil (React, Node...)" value={currentTool} onChange={(e) => setCurrentTool(e.target.value)} className=" rounded-xl w-full px-3 focus:outline-0 bg-gray-50" />
                                <Button type="button" onClick={addTool} className="p-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors"><Plus size={20} /></Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {tools.map((tool, i) => (
                                    <span key={i} className="flex items-center gap-2 px-4 p-3 bg-indigo-50 text-indigo-600 rounded-[5px] text-sm font-bold">
                                        {tool} <X size={14} className="cursor-pointer" onClick={() => removeTool(i)} />
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-bold text-gray-700 uppercase">Collabs</label>
                            <div className="flex gap-2">
                                <Input placeholder="Ajouter un collaborateur" value={currentTag} onChange={(e) => setCurrentTag(e.target.value)} className=" rounded-xl w-full px-3 focus:outline-0 bg-gray-50" />
                                <Button type="button" onClick={addTag} className="p-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors"><Plus size={20} /></Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {collabTags.map((collab, i) => (
                                    <span key={i} className="flex items-center gap-2 px-4 p-3 bg-indigo-50 text-indigo-600 rounded-[5px] text-sm font-bold">
                                        {collab} <X size={14} className="cursor-pointer" onClick={() => removeTags(i)} />
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Liens du projet</h3>
                            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                                <LinkIcon size={20} className="text-gray-400" />
                                <input type="text" placeholder="URL Live" className="bg-transparent outline-none w-full text-sm" value={live} onChange={(e) => setLive(e.target.value)} />
                            </div>
                            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                                <Github size={20} className="text-gray-400" />
                                <input type="text" placeholder="URL Github" className="bg-transparent outline-none w-full text-sm" value={github} onChange={(e) => setGithub(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* COLONNE DROITE : Images */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                        {/* COLONNE DROITE : Images avec Preview */}
                        <div className="space-y-8">
                            <label className="text-sm font-bold text-gray-700 uppercase">Aperçus du projet</label>

                            {/* Computer Upload */}
                            <div className="space-y-3">
                                <p className="text-xs font-semibold text-gray-500 flex items-center justify-between">
                                    <span className="flex items-center gap-2"><Monitor size={14} /> Vue Ordinateur</span>
                                    {previews.computer && <button type="button" onClick={() => removeImage('computer')} className="text-red-500 hover:underline">Supprimer</button>}
                                </p>
                                <label className="group block w-full aspect-video bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl hover:border-indigo-400 transition-all cursor-pointer overflow-hidden relative">
                                    {previews.computer ? (
                                        <img src={previews.computer} className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-300" alt="Preview computer" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400 group-hover:text-indigo-500">
                                            <Plus size={32} />
                                            <span className="text-xs mt-2">Cliquer pour uploader (16:9)</span>
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'computer')} />
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                {/* Tablet Upload */}
                                <div className="space-y-3">
                                    <p className="text-xs font-semibold text-gray-500 flex items-center justify-between">
                                        <span className="flex items-center gap-2"><Tablet size={14} /> Tablette</span>
                                        {previews.tablet && <button type="button" onClick={() => removeImage('tablet')} className="text-red-500"><X size={14} /></button>}
                                    </p>
                                    <label className="group block w-full aspect-3/4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl hover:border-indigo-400 transition-all cursor-pointer overflow-hidden relative">
                                        {previews.tablet ? (
                                            <img src={previews.tablet} className="w-full h-full object-cover animate-in fade-in" alt="Preview tablet" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                                <Plus size={24} />
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'tablet')} />
                                    </label>
                                </div>

                                {/* Mobile Upload */}
                                <div className="space-y-3">
                                    <p className="text-xs font-semibold text-gray-500 flex items-center justify-between">
                                        <span className="flex items-center gap-2"><Smartphone size={14} /> Mobile</span>
                                        {previews.mobile && <Button type="button" onClick={() => removeImage('mobile')} className="text-red-500"><X size={14} /></Button>}
                                    </p>
                                    <label className="group block w-full aspect-9/16 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl hover:border-indigo-400 transition-all cursor-pointer overflow-hidden relative">
                                        {previews.mobile ? (
                                            <img src={previews.mobile} className="w-full h-full object-cover animate-in fade-in" alt="Preview mobile" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                                <Plus size={24} />
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'mobile')} />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </section>
    )
}

export default ProjectForm