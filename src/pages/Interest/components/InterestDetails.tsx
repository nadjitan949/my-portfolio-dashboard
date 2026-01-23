import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, MessageSquare, Tag, Layout, Clock } from 'lucide-react'
import api from '../../../axios/api'

interface Interest {
    id: number
    media: string
    contact: string
    message: string
    isOpen: boolean
    createdAt: string
    Service: {
        id: number
        title: string
        image: { url: string }
        description: string
        details: string
    }
}

function InterestDetails() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [interest, setInterest] = useState<Interest | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await api.get(`/interests/details/${id}`)
                if (res.data.success) {
                    setInterest(res.data.interest)
                    // On marque comme lu dès l'ouverture
                    if (!res.data.interest.isOpen) {
                        api.put(`/interests/read/${id}`)
                    }
                }
            } catch (error) {
                console.error("Erreur:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchDetails()
    }, [id])

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) return <div className="p-10 text-center text-gray-400">Chargement...</div>
    if (!interest) return <div className="p-10 text-center text-red-500">Demande introuvable.</div>

    return (
        <section className="max-w-5xl mx-auto mt-8 pb-12">
            {/* Navigation */}
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition-colors mb-6 font-medium text-sm"
            >
                <ArrowLeft size={18} />
                Retour aux demandes
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Colonne de GAUCHE : Détails du Prospect */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                            <h2 className="font-bold text-gray-800 flex items-center gap-2">
                                <MessageSquare size={18} className="text-emerald-500" />
                                Message du client
                            </h2>
                            <span className="text-[11px] text-gray-400 flex items-center gap-1 font-medium">
                                <Clock size={14} />
                                Reçu le {formatDate(interest.createdAt)}
                            </span>
                        </div>
                        <div className="p-8">
                            <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap italic">
                                "{interest.message}"
                            </p>
                        </div>
                        <div className="p-6 bg-gray-50/50 border-t border-gray-50 flex flex-wrap gap-4">
                            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    {interest.media === 'email' ? <Mail size={16} /> : <Phone size={16} />}
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Contact via {interest.media}</p>
                                    <p className="text-sm font-bold text-gray-800">{interest.contact}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Colonne de DROITE : Rappel du Service */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-8">
                        <div className="p-4 border-b border-gray-50 bg-gray-50/30">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Tag size={14} />
                                Service Concerné
                            </h3>
                        </div>
                        <img 
                            src={interest.Service.image.url} 
                            alt={interest.Service.title} 
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-6">
                            <h4 className="text-xl font-bold text-gray-900 mb-2">{interest.Service.title}</h4>
                            <p className="text-sm text-gray-500 mb-4">{interest.Service.description}</p>
                            
                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                <div className="flex items-start gap-3">
                                    <Layout size={16} className="text-gray-400 mt-1" />
                                    <div>
                                        <p className="text-[11px] font-bold text-gray-400 uppercase">Technologies</p>
                                        <p className="text-sm text-gray-700 font-medium">{interest.Service.details}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    )
}

export default InterestDetails