import { useEffect, useState } from "react"
import {
    ExternalLink,
    Pencil,
    Plus,
    Trash2,
    Github,
    Monitor,
    Globe
} from "lucide-react"
import api from "../../../axios/api"
import Button from "../../../ui/Button"
import { useNavigate } from "react-router-dom"

interface Project {
    id: number
    title: string
    computerView: { url: string } | null
    collabTags: string[] | null
    tools: string[] | null
    desciption: string // Attention à la typo dans ton JSON (desciption)
    type: string
    status: string
    live: string | null
    github: string | null
}

function ListProjects() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [refresh, setRefresh] = useState(false)

    const navigate = useNavigate()

    const detailsProject = (id: number) => navigate(`/projets/${id}`)
    const addProject = () => navigate("/projets/add")
    const editProject = (id: number) => navigate(`/projets/update/${id}`)

    const triggerRefresh = () => {
        setRefresh(true);
        setTimeout(() => {
            setRefresh(false);
        }, 5000); // 5000 ms = 5 secondes
    };

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await api.get("/projects/all")
                if (res.data.success) {
                    setProjects(res.data.projects)
                }
            } catch (error) {
                console.error("Erreur:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchProjects()
    }, [refresh])

    const handleDelete = async (id: number) => {
        try {

            const isConfirm = confirm("Tu vas supprimmer hein")
            if (!isConfirm) return

            const res = await api.delete(`/projects/delete/${id}`)
            if (!res.data.success) return alert(res.data.message)
            alert(res.data.message)

            triggerRefresh()

        } catch (error) {
            console.log("Erreur: ", error)
        }
    }

    return (
        <section className="w-full overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Mes Projets</h2>
                    <p className="text-sm text-gray-500">Liste de vos réalisations ({projects.length})</p>
                </div>
                <Button
                    onClick={() => addProject()}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-black transition-all"
                >
                    <Plus size={18} />
                    Nouveau projet
                </Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Projet</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Type & Outils</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Collabs</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Statut</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">Chargement...</td></tr>
                        ) : (
                            projects.map((project) => (
                                <tr key={project.id} className="hover:bg-gray-50/50 transition-colors group">
                                    {/* Titre et Image */}
                                    <td className="px-6 py-4 cursor-pointer" onClick={() => detailsProject(project.id)}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-10 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                                                {project.computerView ? (
                                                    <img src={project.computerView.url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300"><Monitor size={16} /></div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-700">{project.title}</span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Type et Tools */}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-2">
                                            <span className="text-xs font-bold text-indigo-600 uppercase flex items-center gap-1">
                                                <Globe size={12} /> {project.type}
                                            </span>
                                            <div className="flex flex-wrap gap-1">
                                                {project.tools?.map((tool, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-gray-100 text-[10px] rounded text-gray-600 font-medium">
                                                        {tool}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Collab Tags */}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {project.collabTags?.map((tag, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </td>

                                    {/* Statut */}
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${project.status === "terminate"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-amber-100 text-amber-700"
                                            }`}>
                                            {project.status === "terminate" ? "Terminé" : "En cours"}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {project.live && (
                                                <a href={project.live} target="_blank" className="p-2 text-gray-400 hover:text-indigo-600"><ExternalLink size={16} /></a>
                                            )}
                                            {project.github && (
                                                <a href={project.github} target="_blank" className="p-2 text-gray-400 hover:text-black"><Github size={16} /></a>
                                            )}
                                            <div className="w-px h-4 bg-gray-200 my-auto mx-1"></div>
                                            <Button onClick={() => editProject(project.id)} className="p-2 text-gray-400 hover:text-blue-600"><Pencil size={18} /></Button>
                                            <Button onClick={() => handleDelete(project.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={18} /></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    )
}

export default ListProjects