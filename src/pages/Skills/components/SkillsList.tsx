// Note : J'utilise des classes Tailwind pour le style, ajuste selon ton CSS
import { Plus, Eye, Edit, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import Skills from '../Skills'
import api from '../../../axios/api'
import { useNavigate } from 'react-router-dom'
import Button from '../../../ui/Button'
import Img from '../../../ui/Img'

interface Skills {
    id: number
    name: string
    image: string
    level: string
    description: string
    categoryId: number
}

function SkillsList() {

    const [skillsData, setSkillsData] = useState<Skills[] | null>(null)
    const [refresh, setRefresh] = useState<boolean>(false)

    const navigate = useNavigate()

    const handleAdd = () => navigate("/competances/add")
    const handleView = (id: number) => navigate(`/competances/${id}`)
    const handleEdit = (id: number) => navigate(`/competances/update/${id}`)

    const triggerRefresh = () => {
        setRefresh(true)
        setTimeout(() => {
            setRefresh(false)
        }, 5000)
    }

    const handleDelete = async (id: number) => {
        try {

            const isConfirm = confirm("Vous êtes sur le point de supprimmer comme ça")
            if (!isConfirm) return

            const res = await api.delete(`/skills/delete/${id}`)
            if (!res.data.success) return alert(res.data.message)
            alert(res.data.message)
            triggerRefresh()

        } catch (error) {
            console.log("Erreur: ", error)
        }
    }

    useEffect(() => {
        const fetchSkills = async () => {
            try {

                const res = await api.get("/skills/all")
                if (!res.data.success) return alert(res.data.message)

                const data: Skills[] = res.data.skills
                setSkillsData(data)

            } catch (error) {
                console.log("Erreur: ", error)
            }
        }
        fetchSkills()
    }, [refresh])

    return (
        <>
            <div className="p-6">
                {/* Header avec bouton Ajouter */}
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold">Mes Compétences</h2>
                    <Button
                        onClick={handleAdd}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <Plus size={18} />
                        Ajouter une nouvelle compétence
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {skillsData?.map((skill) => (
                        <div key={skill.id} className=" rounded-xl p-4 shadow-sm bg-white hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gray-50 rounded-lg p-2">
                                        {skill.image ? (
                                            <Img src={skill.image} alt={skill.name} className="w-full h-full object-contain" />
                                        ) : (
                                            <div className="text-gray-400 text-[10px] text-center">No Image</div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg leading-tight">{skill.name}</h3>
                                        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">{skill.level}</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                                {skill.description}
                            </p>

                            {/* Barre de boutons d'action */}
                            <div className="flex items-center gap-2 pt-4 border-t">
                                <Button
                                    onClick={() => handleView(skill.id)}
                                    className="flex-1 flex justify-center items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-md text-sm transition-colors"
                                    title="Voir détails"
                                >
                                    <Eye size={16} /> <span className="hidden sm:inline">Voir</span>
                                </Button>
                                <Button
                                    onClick={() => handleEdit(skill.id)}
                                    className="flex-1 flex justify-center items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-md text-sm transition-colors"
                                    title="Modifier"
                                >
                                    <Edit size={16} /> <span className="hidden sm:inline">Modifier</span>
                                </Button>
                                <Button
                                    onClick={() => handleDelete(skill.id)}
                                    className="flex-1 flex justify-center items-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 py-2 rounded-md text-sm transition-colors"
                                    title="Supprimer"
                                >
                                    <Trash2 size={16} /> <span className="hidden sm:inline">Supprimer</span>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

export default SkillsList