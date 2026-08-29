import { Mail, Trash2, Clock, ChevronRight, Search, Inbox } from 'lucide-react'
import { useEffect, useState, useMemo, useCallback } from 'react'
import api from '../../../axios/api'
import { useNavigate } from 'react-router-dom'
import Button from '../../../ui/Button'
import { useNotification } from '../../../hooks/useNotification'

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
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read'>('all')
    const [refresh, setRefresh] = useState(false)

    const navigate = useNavigate()
    const { addToast, showConfirm } = useNotification()
    const handleView = (id: number) => navigate(`/messages/details/${id}`)

    const formatDate = (dateStr: string) => {
        if (!dateStr) return ''
        const date = new Date(dateStr)
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const triggerRefresh = () => {
        setRefresh(true)
        setTimeout(() => {
            setRefresh(false)
        }, 5000)
    }

    const fetchMessages = useCallback(async () => {
        setLoading(true)
        try {
            const res = await api.get("/messages/all")
            if (res.data.success) {
                setMessages(res.data.messages || [])
            } else {
                addToast('error', 'Erreur', res.data.message || 'Impossible de charger les messages')
            }
        } catch (error) {
            console.error("Erreur: ", error)
            addToast('error', 'Erreur', 'Impossible de charger les messages')
        } finally {
            setLoading(false)
        }
    }, [addToast])

    useEffect(() => {
        fetchMessages()
    }, [fetchMessages, refresh])

    const handleDelete = (id: number, author: string) => {
        showConfirm(
            "Supprimer le message", 
            `Voulez-vous vraiment supprimer le message de "${author}" ? Cette action est irréversible.`, 
            async () => {
                try {
                    const res = await api.delete(`/messages/delete/${id}`)
                    if (res.data.success) {
                        addToast('success', 'Message supprimé', 'Le message a été supprimé avec succès')
                        triggerRefresh()
                    } else {
                        addToast('error', 'Erreur', res.data.message || 'Impossible de supprimer')
                    }
                } catch {
                    addToast('error', 'Erreur', 'Impossible de supprimer le message')
                }
            },
            {
                confirmText: 'Supprimer',
                cancelText: 'Annuler',
                type: 'danger'
            }
        )
    }

    // Filtrer les messages
    const filteredMessages = useMemo(() => {
        return messages.filter(msg => {
            const matchesSearch = 
                msg.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                msg.content.toLowerCase().includes(searchTerm.toLowerCase())
            
            const matchesFilter = 
                filterStatus === 'all' ? true :
                filterStatus === 'unread' ? !msg.isOpened :
                msg.isOpened
            
            return matchesSearch && matchesFilter
        })
    }, [messages, searchTerm, filterStatus])

    // Compter les messages non lus
    const unreadCount = useMemo(() => {
        return messages.filter(m => !m.isOpened).length
    }, [messages])

    // Obtenir les initiales
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .substring(0, 2)
            .toUpperCase()
    }

    // Obtenir une couleur d'avatar
    const getAvatarColor = (id: number) => {
        const colors = [
            'bg-blue-100 text-blue-600',
            'bg-indigo-100 text-indigo-600',
            'bg-emerald-100 text-emerald-600',
            'bg-amber-100 text-amber-600',
            'bg-purple-100 text-purple-600',
            'bg-pink-100 text-pink-600',
            'bg-cyan-100 text-cyan-600',
            'bg-teal-100 text-teal-600'
        ]
        return colors[id % colors.length]
    }

    return (
        <section className="w-full bg-white border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-4 md:p-5 lg:p-6 border-b border-gray-50 bg-gray-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 md:p-2.5 bg-blue-100 text-blue-600 rounded-lg md:rounded-xl shrink-0">
                        <Inbox className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-gray-800">Boîte de réception</h2>
                        <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                            {messages.length} message(s) reçu(s)
                            {unreadCount > 0 && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] md:text-xs font-semibold">
                                    {unreadCount} non lu(s)
                                </span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Barre d'outils */}
            <div className="flex flex-col sm:flex-row gap-3 p-3 md:p-4 border-b border-gray-100">
                {/* Recherche */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Rechercher un message..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg md:rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                </div>

                {/* Filtres */}
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
                    {([
                        { value: 'all', label: 'Tous' },
                        { value: 'unread', label: 'Non lus' },
                        { value: 'read', label: 'Lus' }
                    ] as const).map(f => (
                        <button
                            key={f.value}
                            onClick={() => setFilterStatus(f.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                                filterStatus === f.value 
                                    ? 'bg-white shadow-sm text-blue-600' 
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* État de chargement */}
            {loading ? (
                <div className="p-4 md:p-6 space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="p-4 rounded-xl border border-gray-100 animate-pulse">
                            <div className="flex gap-3 md:gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredMessages.length > 0 ? (
                /* Liste des Messages */
                <div className="divide-y divide-gray-100">
                    {filteredMessages.map((msg) => (
                        <div
                            onClick={() => handleView(msg.id)}
                            key={msg.id}
                            className={`p-3 md:p-4 lg:p-6 transition-all cursor-pointer group flex items-start gap-3 md:gap-4 ${
                                msg.isOpened ? 'hover:bg-gray-50' : 'bg-blue-50/50 hover:bg-blue-50'
                            }`}
                        >
                            {/* Avatar Cercle */}
                            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm md:text-base shrink-0 border border-gray-200 group-hover:scale-105 transition-all ${getAvatarColor(msg.id)}`}>
                                {getInitials(msg.author)}
                            </div>

                            {/* Contenu */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-2 mb-1">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <h3 className="font-bold text-gray-900 text-sm md:text-base truncate">
                                            {msg.author}
                                        </h3>
                                        {!msg.isOpened && (
                                            <span className="w-2 h-2 md:w-2.5 md:h-2.5 bg-blue-500 rounded-full shrink-0 animate-pulse" />
                                        )}
                                    </div>
                                    <span className="text-[10px] md:text-xs font-medium text-gray-400 flex items-center gap-1 shrink-0">
                                        <Clock className="w-3 h-3" />
                                        {formatDate(msg.createdAt)}
                                    </span>
                                </div>

                                <p className="text-xs md:text-sm text-blue-600 font-medium mb-1.5 md:mb-2 truncate">
                                    {msg.email}
                                </p>

                                <p className="text-xs md:text-sm text-gray-600 line-clamp-2 leading-relaxed wrap-break-words">
                                    {msg.content}
                                </p>
                            </div>

                            {/* Actions & Indicateur */}
                            <div className="flex flex-col items-end justify-between self-stretch pl-1 md:pl-2 shrink-0">
                                <Button
                                    className="p-1.5 md:p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-100 xl:opacity-0 xl:group-hover:opacity-100"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleDelete(msg.id, msg.author)
                                    }}
                                    title="Supprimer"
                                >
                                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                                </Button>
                                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-300 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* État vide */
                <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center p-4">
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-50 rounded-full flex items-center justify-center mb-3 md:mb-4">
                        {searchTerm || filterStatus !== 'all' ? (
                            <Search className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
                        ) : (
                            <Mail className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
                        )}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-700 mb-2">
                        {searchTerm || filterStatus !== 'all' ? 'Aucun message trouvé' : 'Boîte de réception vide'}
                    </h3>
                    <p className="text-sm md:text-base text-gray-500 max-w-md">
                        {searchTerm || filterStatus !== 'all' 
                            ? 'Aucun résultat ne correspond à vos critères de recherche.'
                            : 'Votre boîte de réception est vide.'}
                    </p>
                </div>
            )}
        </section>
    )
}

export default MessageList