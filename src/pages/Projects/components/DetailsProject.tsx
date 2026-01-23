import { useEffect, useState } from "react"
import {
    ArrowLeft,
    Monitor,
    Smartphone,
    Tablet,
    Calendar,
    Tag,
    Wrench,
    Pencil,
    Trash,
    Link
} from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import api from "../../../axios/api"
import Button from "../../../ui/Button"

interface Image {
    url: string
    public_id: string
}


interface Project {
    id: number;
    title: string;
    computerView: Image | null
    tabletteView: Image | null
    mobileView: Image | null
    collabTags: string[] | null
    tools: string[] | null
    description: string | ""
    type: string | ""
    status: string | ""
    live: string | null
    github: string | null
    createdAt: string | null
}

function DetalsProject() {
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)

    const params = useParams()
    const id = params.id
    const navigate = useNavigate()

    const goBack = () => navigate(-1)
    const editProject = (id: number) => navigate(`/projets/update/${id}`)

    useEffect(() => {
        const detailsProject = async () => {
            try {

                const res = await api.get(`/projects/details/${id}`)
                if(!res.data.success){
                    return alert(res.data.message)
                }

                const data: Project = res.data.project
                setSelectedProject(data)
                
            } catch (error) {
                console.log("Erreur: ", error)
            }
        }

        detailsProject()
    }, [id])

    const handleDelete = async () => {
        try {

            const isConfirm = confirm("Tu vas supprimmer hein")
            if (!isConfirm) return

            const res = await api.delete(`/projects/delete/${id}`)
            if (!res.data.success) return alert(res.data.message)
            alert(res.data.message)

            goBack()

        } catch (error) {
            console.log("Erreur: ", error)
        }
    }

    return (
        <main className="w-full h-full bg-white rounded-xl overflow-auto">

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header du Détail */}
                <div className="p-6 border-b border-gray-50 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
                    <div className="flex items-center gap-4">
                        <Button
                        onClick={goBack}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </Button>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{selectedProject?.title}</h2>
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                                <Calendar size={14} /> Créé le {selectedProject?.createdAt}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        {selectedProject?.github && (
                            <Button onClick={() => editProject(selectedProject.id)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-all text-sm font-medium">
                                <Pencil size={18} />
                            </Button>
                        )}
                        {selectedProject?.live && (
                            <Button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 cursor-pointer transition-all text-sm font-medium shadow-lg shadow-indigo-100">
                                <Trash size={18} /> 
                            </Button>
                        )}
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* COLONNE GAUCHE : Description et Tags */}
                    <div className="lg:col-span-1 space-y-8">
                        <section>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">À propos du projet</h3>
                            <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                                {selectedProject?.description}
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Wrench size={14} /> Technologies utilisées
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {selectedProject?.tools?.map((tool, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold">
                                        {tool}
                                    </span>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Tag size={14} /> Tags
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {selectedProject?.collabTags?.map((tag, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-semibold uppercase">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Link size={14} /> Liens
                            </h3>
                            <div className="flex flex-wrap gap-2">

                                <div className=" px-4 py-2 rounded-[5px] bg-gray-50">
                                    <span className="font-medium text-[12px] text-gray-600">{selectedProject?.github}</span>
                                </div>

                                <div className=" px-4 py-2 rounded-[5px] bg-gray-50">
                                    <span className="font-medium text-[12px] text-gray-600">{selectedProject?.live}</span>
                                </div>
                                
                            </div>
                        </section>
                    </div>

                    {/* COLONNE DROITE : Visualisation (Multi-Device) */}
                    <div className="lg:col-span-2 space-y-10">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Monitor size={14} /> Aperçus multi-supports
                        </h3>

                        {/* Layout des images */}
                        <div className="space-y-6">
                            {/* Ordinateur */}
                            <div className="relative group">
                                <p className="text-[10px] font-bold text-gray-400 mb-2 flex items-center gap-1 uppercase">Desktop View</p>
                                <div className="rounded-xl border-4 border-gray-800 bg-gray-800 shadow-2xl overflow-hidden aspect-video">
                                    {selectedProject?.computerView ? (
                                        <img src={selectedProject.computerView.url} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 italic">Aucun aperçu desktop</div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Tablette */}
                                <div className="relative">
                                    <p className="text-[10px] font-bold text-gray-400 mb-2 flex items-center gap-1 uppercase"><Tablet size={12} /> Tablet View</p>
                                    <div className="rounded-xl border-[6px] border-gray-800 bg-gray-800 shadow-xl overflow-hidden aspect-3/4">
                                        {selectedProject?.tabletteView ? (
                                            <img src={selectedProject.tabletteView.url} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">N/A</div>
                                        )}
                                    </div>
                                </div>

                                {/* Mobile */}
                                <div className="relative">
                                    <p className="text-[10px] font-bold text-gray-400 mb-2 flex items-center gap-1 uppercase"><Smartphone size={12} /> Mobile View</p>
                                    <div className="w-3/4 mx-auto rounded-4xl border-[6px] border-gray-800 bg-gray-800 shadow-xl overflow-hidden aspect-9/19">
                                        {selectedProject?.mobileView ? (
                                            <img src={selectedProject.mobileView.url} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">N/A</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default DetalsProject