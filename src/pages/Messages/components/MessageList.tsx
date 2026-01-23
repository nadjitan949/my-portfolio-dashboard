import { Mail, Trash2, User, Clock, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../../../axios/api'
import { useNavigate } from 'react-router-dom'
import Button from '../../../ui/Button'

interface Message {
    id: number
    author: string
    email: string
    content: string
    isOpened: boolean
    createdAt: string
    updatedAt: string
}

function MessageList() {

    const [messages, setMessages] = useState<Message[] | null>(null)
    const [refresh, setRefresh] = useState(false)

    const navigate = useNavigate()
    const handleView = (id: number) => navigate(`/messages/details/${id}`)

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const triggerRefresh = () => {
        setRefresh(true);
        setTimeout(() => {
            setRefresh(false);
        }, 5000); // 5000 ms = 5 secondes
    }

    useEffect(() => {
        const fetchMessages = async () => {
            try {

                const res = await api.get("/messages/all")
                if (!res.data.success) return alert(res.data.message)

                const data: Message[] = res.data.messages
                setMessages(data)

            } catch (error) {
                console.log("Erreur: ", error)
            }
        }
        fetchMessages()
    }, [refresh])

    const handleDelete = async (id: number) => {
        try {

            const isConfirm = confirm("Tu peux supprimer suppimer un jour tu vas oublier oublier tu peux supprimer supprimer on vas t'attraper")
            if(!isConfirm) return

            const res = await api.delete(`/messages/delete/${id}`)
            if(!res.data.success) return alert(res.data.message)
            
            alert(res.data.message)
            triggerRefresh()
            
        } catch (error) {
            console.log("Erreur: ", error)
        }
    }

    return (
        <section className="w-full bg-white border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <Mail size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Boîte de réception</h2>
                        <p className="text-xs text-gray-500">{messages?.length} message(s) reçu(s)</p>
                    </div>
                </div>
            </div>

            {/* Liste des Messages */}
            <div className="divide-y divide-gray-100">
                {messages?.map((msg) => (
                    <div
                        onClick={() => {
                            handleView(msg.id)
                        }}
                        key={msg.id}
                        className={`p-4 md:p-6 transition-all cursor-pointer group flex items-start gap-4 ${msg.isOpened ? 'hover:bg-gray-50' : 'bg-blue-50'}`}
                    >
                        {/* Avatar Cercle */}
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0 border border-gray-200 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                            <User size={24} />
                        </div>

                        {/* Contenu */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-1">
                                <div className="flex items-center justify-center">
                                    <h3 className="font-bold text-gray-900 truncate pr-4">{msg.author}</h3>
                                    {!msg.isOpened && (<div className='w-3 h-3 bg-blue-500 rounded-full'></div>) }
                                </div>
                                <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1 shrink-0">
                                    <Clock size={12} />
                                    {formatDate(msg.createdAt)}
                                </span>
                            </div>

                            <p className="text-xs text-blue-600 font-medium mb-2">{msg.email}</p>

                            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                {msg.content}
                            </p>
                        </div>

                        {/* Actions & Indicateur */}
                        <div className="flex flex-col items-end justify-between self-stretch pl-2">
                            <Button
                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleDelete(msg.id)
                                }}
                            >
                                <Trash2 size={18} />
                            </Button>
                            <ChevronRight size={20} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                ))}
            </div>

            {/* État vide */}
            {messages?.length === 0 && (
                <div className="p-20 text-center text-gray-400">
                    <Mail size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Votre boîte de réception est vide.</p>
                </div>
            )}
        </section>
    )
}

export default MessageList