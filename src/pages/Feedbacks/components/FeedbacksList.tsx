import { Plus, Quote, Trash2, Edit2, User, Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../ui/Button'
import { useEffect, useState } from 'react'
import api from '../../../axios/api'

interface Image {
    url: string,
    public_id: string
}

interface Feedback {
    id: number
    author: string
    jobTitle: string
    content: string
    image: Image | null
    createdAt: string
    updatedAt: string
}

function FeedbacksList() {

    const [feedbacks, setFeedbacks] = useState<Feedback[] | null>(null)
    const [refresh, setRefresh] = useState(false)

    const navigate = useNavigate()

    const handleAdd = () => navigate("/feedbacks/add")
    const handleEdit = (id: number) => navigate(`/feedbacks/update/${id}`)

    const triggerRefresh = () => {
        setRefresh(true)
        setTimeout(() => {
            setRefresh(false);
        }, 5000)
    }

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {

                const res = await api.get("/feedbacks/all")
                if (!res.data.message) return alert(res.data.message)

                const data: Feedback[] = res.data.feedbacks
                setFeedbacks(data)

            } catch (error) {
                console.log("Erreur: ", error)
            }
        }
        fetchFeedbacks()
    }, [refresh])

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    const handleDelete = async (id: number) => {
        try {

            const isConfirm = confirm("Tu est entrain de supprimer comme ça")
            if(!isConfirm) return

            const res = await api.delete(`/feedbacks/delete/${id}`)
            if(!res.data.success) return alert(res.data.message)

            alert(res.data.message)
            triggerRefresh()
            
        } catch (error) {
            console.log("Erreur: ", error)
        }
    }

    return (
        <section className="w-full bg-white rounded-xl border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Témoignages & Feedbacks</h2>
                    <p className="text-sm text-gray-500">Ce que les clients pensent de vos collaborateurs.</p>
                </div>
                <Button
                    onClick={() => handleAdd()}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm"
                >
                    <Plus size={18} />
                    Ajouter un avis
                </Button>
            </div>

            {/* Grille de feedbacks */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {feedbacks?.map((fb) => (
                    <div key={fb.id} className="relative group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-indigo-200 transition-all flex flex-col">
                        {/* Icône de citation en fond */}
                        <Quote className="absolute top-4 right-4 text-indigo-50/50 group-hover:text-indigo-100 transition-colors" size={40} />

                        {/* Contenu du message */}
                        <div className="flex-1 mb-6">
                            <p className="text-gray-600 italic leading-relaxed relative z-10">
                                "{fb.content}"
                            </p>
                        </div>

                        {/* Pied de carte : Auteur */}
                        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden border border-gray-200">
                                {fb.image ? (
                                    <img src={fb.image.url} alt={fb.author} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={24} />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-gray-900 truncate">{fb.author}</h4>
                                <p className="text-xs text-indigo-600 font-medium">{fb.jobTitle}</p>
                            </div>
                        </div>

                        {/* Date et Actions rapides */}
                        <div className="mt-4 flex items-center justify-between text-gray-400">
                            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold">
                                <Calendar size={12} />
                                {formatDate(fb.createdAt)}
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button onClick={() => handleEdit(fb.id)} className="p-1.5 hover:text-blue-600 transition-colors">
                                    <Edit2 size={16} />
                                </Button>
                                <Button onClick={() => handleDelete(fb.id)} className="p-1.5 hover:text-red-600 transition-colors">
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Si aucun feedback */}
            {feedbacks?.length === 0 && (
                <div className="py-20 text-center text-gray-400">
                    <p>Aucun feedback enregistré pour le moment.</p>
                </div>
            )}
        </section>
    )
}

export default FeedbacksList