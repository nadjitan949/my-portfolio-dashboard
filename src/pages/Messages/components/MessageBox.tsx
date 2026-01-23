import { Mail, Calendar, ArrowLeft, MessageSquareText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../../axios/api'

interface Message {
    id: number
    author: string
    email: string
    content: string
    createdAt: string
}

function MessageBox() {

    const [message, setMessages] = useState<Message | null>(null)

    const navigate = useNavigate()
    const { id } = useParams()

    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return "..."; // Sécurité si la date n'est pas encore là
        return new Date(dateStr).toLocaleString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    useEffect(() => {
        const fetchDetails = async () => {
            try {

                const res = await api.get(`/messages/details/${id}`)
                if (!res.data.success) return alert(res.data.message)

                const data: Message = res.data.objectMessage
                setMessages(data)

            } catch (error) {
                console.log("Erreur: ", error)
            }
        }

        fetchDetails()
    }, [id])

    return (
        <section className="max-w-4xl mx-auto mt-8 h-full">
            {/* Bouton Retour */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors mb-6 font-medium text-sm"
            >
                <ArrowLeft size={18} />
                Retour à la liste
            </button>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">

                {/* Header du Message */}
                <div className="p-8 border-b border-gray-50 bg-gray-50/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center border-2 border-white shadow-sm shrink-0 font-bold text-xl uppercase">
                                {message?.author.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{message?.author}</h2>
                                <div className="flex items-center gap-2 text-indigo-600 text-sm">
                                    <Mail size={14} />
                                    <span>{message?.email}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-gray-400 text-sm bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                            <Calendar size={16} />
                            <span>Reçu le {formatDate(message?.createdAt)}</span>
                        </div>
                    </div>
                </div>

                {/* Corps du Message */}
                <div className="p-8 md:p-12">
                    <div className="flex items-center gap-2 text-gray-400 mb-6">
                        <MessageSquareText size={18} />
                        <span className="text-xs uppercase font-bold tracking-widest">Message</span>
                    </div>

                    <div className="prose prose-indigo max-w-none">
                        <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
                            {message?.content}
                        </p>
                    </div>
                </div>

                {/* Footer décoratif - Juste pour fermer visuellement la box */}
                <div className="mt-auto p-6 bg-gray-50/30 border-t border-gray-50 flex justify-center">
                    <span className="text-[10px] text-gray-300 uppercase tracking-[0.2em] font-medium italic">
                        Fin du message
                    </span>
                </div>
            </div>
        </section>
    )
}

export default MessageBox