import { ArrowLeft, Edit3, Info, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import api from "../../../axios/api"
import Button from "../../../ui/Button"

interface Image {
    url: string
    public_id: string
}

interface Skills {
    id: number
    name: string
    image: Image
    level: string
    description: string
    categoryId: number
}

interface Category {
    id: number
    name: string
    icone: string
}

function SkillsDetails() {
    const [skill, setSkill] = useState<Skills | null>(null);
    const [loading, setLoading] = useState(true)
    const [categorie, setCategories] = useState<Category | null>(null)

    const { id } = useParams()
    const navigate = useNavigate()

    const goBack = () => navigate(-1)

    useEffect(() => {
        const fetchSkillDetail = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/skills/details/${id}`)
                if (res.data.success) {
                    setSkill(res.data.skill)
                } else {
                    alert(res.data.message)
                }
            } catch (error) {
                console.error("Erreur: ", error)
            } finally {
                setLoading(false)
            }
        };

        fetchSkillDetail()
    }, [id])

    useEffect(() => {
        const fetchCategories = async () => {
            try {

                const res = await api.get(`/categories/details/${skill?.categoryId}`)
                if(!res.data.success) return alert(res.data.message)

                setCategories(res.data.category)
                
            } catch (error) {
                console.log("Erreur: ", error)
            }
        }

        fetchCategories()

    }, [skill?.categoryId])

    if (loading) {
        return <div className="p-10 text-center font-medium">Chargement des détails...</div>;
    }

    if (!skill) {
        return <div className="p-10 text-center text-red-500">Compétence introuvable.</div>;
    }

    return (
        <section className=" w-full h-full bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-gray-50">
                <Button onClick={goBack} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors">
                    <ArrowLeft size={20} />
                    <span className="font-medium">Retour à la liste</span>
                </Button>
                <div className="flex gap-3">
                    <Button className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"><Edit3 size={22} /></Button>
                    <Button className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={22} /></Button>
                </div>
            </div>

            <div className="p-8 md:p-12 flex flex-col md:flex-row gap-12">
                {/* Gauche : Image */}
                <div className="w-full md:w-1/3 flex flex-col items-center">
                    <div className="w-48 h-48 bg-slate-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center p-6 mb-4">
                        {/* Protection supplémentaire sur skill.image */}
                        {skill.image?.url ? (
                            <img 
                                src={skill.image.url} 
                                alt={skill.name} 
                                className="max-w-full max-h-full object-contain" 
                            />
                        ) : (
                            <div className="text-gray-300 text-center uppercase font-bold text-4xl">
                                {skill.name.substring(0, 2)}
                            </div>
                        )}
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase ${
                        skill.level === 'avance' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                        {skill.level}
                    </span>
                </div>

                {/* Droite : Contenu */}
                <div className="w-full md:w-2/3 space-y-8">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{skill.name}</h1>
                        <div className="flex items-center gap-2 text-indigo-600">
                            {categorie?.icone}
                            <span className="font-medium"> {categorie?.name} </span>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl border-l-4 border-indigo-500">
                        <h3 className="flex items-center gap-2 text-gray-500 text-sm font-bold uppercase mb-2">
                            <Info size={16} /> Description
                        </h3>
                        <p className="text-gray-700 text-lg leading-relaxed">
                            {skill.description || "Aucune description disponible."}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default SkillsDetails