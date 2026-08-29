import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, MessageSquare, Tag, Clock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import api from '../../../axios/api'
import Img from '../../../ui/Img'
import { useNotification } from '../../../hooks/useNotification'

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
        image: string
        description: string
        details: string
    }
}

function InterestDetails() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [interest, setInterest] = useState<Interest | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const { addToast } = useNotification()

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true)
            setError('')
            try {
                const res = await api.get(`/interests/details/${id}`)
                if (res.data.success) {
                    setInterest(res.data.interest)
                    // Marquer comme lu dès l'ouverture
                    if (!res.data.interest.isOpen) {
                        try {
                            await api.put(`/interests/read/${id}`)
                        } catch (error) {
                            console.error("Erreur lors du marquage comme lu:", error)
                        }
                    }
                } else {
                    setError(res.data.message || "Demande introuvable")
                }
            } catch (error) {
                console.error("Erreur:", error)
                setError("Impossible de charger les détails de la demande")
            } finally {
                setLoading(false)
            }
        }
        if (id) {
            fetchDetails()
        }
    }, [id, addToast])

    const formatDate = (dateStr: string) => {
        if (!dateStr) return ''
        return new Date(dateStr).toLocaleString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const goBack = () => navigate(-1)

    // État de chargement
    if (loading) {
        return (
            <section className="max-w-5xl mx-auto mt-4 md:mt-8 pb-12 px-3 md:px-4">
                <div className="flex flex-col items-center justify-center py-16 md:py-24">
                    <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin text-emerald-600 mb-4" />
                    <p className="text-gray-500 text-sm md:text-base">Chargement des détails...</p>
                </div>
            </section>
        )
    }

    // État d'erreur
    if (error && !interest) {
        return (
            <section className="max-w-5xl mx-auto mt-4 md:mt-8 pb-12 px-3 md:px-4">
                <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-red-400" />
                    </div>
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Demande introuvable</h2>
                    <p className="text-sm md:text-base text-gray-500 mb-6">{error || "Cette demande n'existe pas."}</p>
                    <button 
                        onClick={goBack}
                        className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all inline-flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour aux demandes
                    </button>
                </div>
            </section>
        )
    }

    return (
        <section className="max-w-5xl mx-auto mt-4 md:mt-8 pb-8 md:pb-12 px-3 md:px-4">
            {/* Navigation */}
            <button 
                onClick={goBack}
                className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition-colors mb-4 md:mb-6 font-medium text-sm w-fit"
            >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                Retour aux demandes
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-8">
                {/* Colonne de GAUCHE : Détails du Prospect */}
                <div className="lg:col-span-2 space-y-5 md:space-y-6">
                    <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4 md:p-6 border-b border-gray-50 bg-gray-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <h2 className="font-bold text-gray-800 flex items-center gap-2 text-sm md:text-base">
                                <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
                                Message du client
                            </h2>
                            <span className="text-[10px] md:text-xs text-gray-400 flex items-center gap-1 font-medium">
                                <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                Reçu le {interest && formatDate(interest.createdAt)}
                            </span>
                        </div>
                        
                        <div className="p-5 md:p-8">
                            <p className="text-gray-700 leading-relaxed text-base md:text-lg whitespace-pre-wrap italic wrap-break-words">
                                "{interest?.message}"
                            </p>
                        </div>
                        
                        <div className="p-4 md:p-6 bg-gray-50/50 border-t border-gray-50 flex flex-wrap gap-3 md:gap-4">
                            <div className="flex items-center gap-2 md:gap-3 bg-white px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl border border-gray-100 shadow-sm flex-1 sm:flex-none">
                                <div className={`p-2 rounded-lg ${
                                    interest?.media === 'email' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                                }`}>
                                    {interest?.media === 'email' ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">
                                        Contact via {interest?.media}
                                    </p>
                                    <p className="text-sm font-bold text-gray-800 truncate">{interest?.contact}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg md:rounded-xl">
                                {interest?.isOpen ? (
                                    <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        Demande ouverte
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Nouvelle demande
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Colonne de DROITE : Rappel du Service */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-sm overflow-hidden lg:sticky lg:top-8">
                        <div className="p-4 md:p-5 border-b border-gray-50 bg-gray-50/30">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Tag className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                Service Concerné
                            </h3>
                        </div>
                        
                        <div className="h-40 md:h-48 bg-gray-100 overflow-hidden">
                            {interest?.Service.image ? (
                                <Img 
                                    src={interest.Service.image} 
                                    alt={interest.Service.title} 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <Tag className="w-8 h-8 md:w-10 md:h-10" />
                                </div>
                            )}
                        </div>
                        
                        <div className="p-4 md:p-6">
                            <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-2 wrap-break-words">
                                {interest?.Service.title}
                            </h4>
                            {interest?.Service.description && (
                                <p className="text-sm text-gray-500 leading-relaxed wrap-break-words">
                                    {interest.Service.description}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default InterestDetails