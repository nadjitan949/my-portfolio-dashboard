import { Mail, Phone, MessageSquare, Calendar, Trash2, Eye, ExternalLink } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../../../axios/api'
import { useNavigate } from 'react-router-dom'
import Button from '../../../ui/Button'
import Img from '../../../ui/Img'

interface Service {
    id: number
    title: string
    image: string
}

interface Interest {
    id: number
    media: string
    contact: string
    message: string
    isOpen: boolean
    createdAt: string
    Service: Service
}

function InterestList() {
    const [interests, setInterests] = useState<Interest[] | null>(null)
    const navigate = useNavigate()

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    useEffect(() => {
        const fetchInterests = async () => {
            try {
                const res = await api.get("/interests/all")
                if (res.data.success) setInterests(res.data.interests)
            } catch (error) {
                console.log("Erreur: ", error)
            }
        }
        fetchInterests()
    }, [])

    const handleDelete = async (id: number) => {
        try {

            const isConfirm = confirm("Tu veux supprimer ?")
            if(!isConfirm) return

            const res = await api.delete(`/interests/delete/${id}`)
            if(!res.data.success) return alert(res.data.message)
            
            alert(res.data.message)
            
        } catch (error) {
            console.log("Erreur: ", error)
        }
    }

    return (
        <section className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-50 bg-gray-50/30">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                        <ExternalLink size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Demandes de services</h2>
                        <p className="text-xs text-gray-500">{interests?.length || 0} prospect(s) intéressé(s)</p>
                    </div>
                </div>
            </div>

            {/* Liste */}
            <div className="divide-y divide-gray-100">
                {interests?.map((item) => (
                    <div 
                        key={item.id}
                        className={`p-5 flex flex-col lg:flex-row lg:items-center gap-6 transition-all hover:bg-gray-50 group ${!item.isOpen ? 'bg-emerald-50/30' : ''}`}
                    >
                        {/* Info Client & Media */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`p-2 rounded-full ${item.media === 'email' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                    {item.media === 'email' ? <Mail size={16} /> : <Phone size={16} />}
                                </div>
                                <span className="font-bold text-gray-900 truncate">{item.contact}</span>
                                {!item.isOpen && (
                                    <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full uppercase">Nouveau</span>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-1 italic">"{item.message}"</p>
                            <div className="flex items-center gap-4 mt-3 text-[11px] text-gray-400">
                                <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(item.createdAt)}</span>
                                <span className="flex items-center gap-1"><MessageSquare size={12} /> Via {item.media}</span>
                            </div>
                        </div>

                        {/* Badge Service Intéressé */}
                        <div className="shrink-0 flex items-center gap-3 bg-white border border-gray-200 p-2 rounded-xl shadow-sm lg:w-64">
                            <Img 
                                src={item.Service.image} 
                                alt={item.Service.title} 
                                className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div className="min-w-0">
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Service demandé</p>
                                <p className="text-sm font-bold text-gray-800 truncate">{item.Service.title}</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 lg:ml-4">
                            <Button 
                                onClick={() => navigate(`/interests/details/${item.id}`)}
                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                title="Voir les détails"
                            >
                                <Eye size={20} />
                            </Button>
                            <Button 
                                onClick={() => handleDelete(item.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Supprimer"
                            >
                                <Trash2 size={20} />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {interests?.length === 0 && (
                <div className="p-20 text-center text-gray-400">
                    <p>Aucune demande d'intérêt pour le moment.</p>
                </div>
            )}
        </section>
    )
}

export default InterestList