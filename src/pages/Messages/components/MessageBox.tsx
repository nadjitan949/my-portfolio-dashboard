import { Mail, Calendar, ArrowLeft, MessageSquareText, Loader2, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../../axios/api'
import { useNotification } from '../../../hooks/useNotification'

interface Message {
    id: number
    author: string
    email: string
    content: string
    createdAt: string
}

function MessageBox() {
    const [message, setMessages] = useState<Message | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const navigate = useNavigate()
    const { id } = useParams()
    const { addToast } = useNotification()

    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return "..."
        return new Date(dateStr).toLocaleString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const goBack = () => navigate(-1)

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true)
            setError('')
            try {
                const res = await api.get(`/messages/details/${id}`)
                if (!res.data.success) {
                    setError(res.data.message || 'Message introuvable')
                    addToast('error', 'Erreur', res.data.message || 'Message introuvable')
                    return
                }

                const data: Message = res.data.objectMessage || res.data.message
                setMessages(data)

            } catch (error) {
                console.error("Erreur: ", error)
                setError("Impossible de charger les détails du message")
                addToast('error', 'Erreur', 'Impossible de charger les détails')
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchDetails()
        }
    }, [id, addToast])

    // Obtenir les initiales
    const getInitials = (name: string) => {
        if (!name) return '?'
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .substring(0, 2)
            .toUpperCase()
    }

    // État de chargement
    if (loading) {
        return (
            <section className="max-w-4xl mx-auto mt-4 md:mt-8 h-full px-3 md:px-4">
                <div className="flex flex-col items-center justify-center py-16 md:py-24">
                    <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin text-indigo-600 mb-4" />
                    <p className="text-gray-500 text-sm md:text-base">Chargement du message...</p>
                </div>
            </section>
        )
    }

    // État d'erreur
    if (error && !message) {
        return (
            <section className="max-w-4xl mx-auto mt-4 md:mt-8 h-full px-3 md:px-4">
                <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-red-400" />
                    </div>
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Message introuvable</h2>
                    <p className="text-sm md:text-base text-gray-500 mb-6">{error || "Ce message n'existe pas."}</p>
                    <button 
                        onClick={goBack}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all inline-flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                        Retour à la liste
                    </button>
                </div>
            </section>
        )
    }

    return (
        <section className="max-w-4xl mx-auto mt-4 md:mt-8 h-full px-3 md:px-4">
            {/* Bouton Retour */}
            <button
                onClick={goBack}
                className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors mb-4 md:mb-6 font-medium text-sm w-fit"
            >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                Retour à la liste
            </button>

            <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
                {/* Header du Message */}
                <div className="p-4 md:p-6 lg:p-8 border-b border-gray-50 bg-gray-50/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center border-2 border-white shadow-sm shrink-0 font-bold text-lg md:text-xl uppercase">
                                {getInitials(message?.author || '')}
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-lg md:text-xl font-bold text-gray-900 truncate">
                                    {message?.author}
                                </h2>
                                <div className="flex items-center gap-1.5 md:gap-2 text-indigo-600 text-xs md:text-sm mt-0.5">
                                    <Mail className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                                    <span className="truncate">{message?.email}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-gray-400 text-xs md:text-sm bg-white px-3 md:px-4 py-2 rounded-lg md:rounded-full border border-gray-100 shadow-sm w-fit">
                            <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                            <span className="truncate">Reçu le {formatDate(message?.createdAt)}</span>
                        </div>
                    </div>
                </div>

                {/* Corps du Message */}
                <div className="p-4 md:p-8 lg:p-12 flex-1">
                    <div className="flex items-center gap-2 text-gray-400 mb-4 md:mb-6">
                        <MessageSquareText className="w-4 h-4 md:w-5 md:h-5" />
                        <span className="text-[10px] md:text-xs uppercase font-bold tracking-widest">Message</span>
                    </div>

                    <div className="prose prose-indigo max-w-none">
                        <p className="text-gray-700 leading-relaxed text-sm md:text-base lg:text-lg whitespace-pre-wrap wrap-break-words">
                            {message?.content || "Aucun contenu."}
                        </p>
                    </div>
                </div>

                {/* Footer décoratif */}
                <div className="mt-auto p-4 md:p-6 bg-gray-50/30 border-t border-gray-50 flex justify-center">
                    <span className="text-[10px] text-gray-300 uppercase tracking-[0.2em] font-medium italic">
                        Fin du message
                    </span>
                </div>
            </div>
        </section>
    )
}

export default MessageBox