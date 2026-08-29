import { useEffect, useState, useMemo, useCallback } from 'react'
import {
    MessageCircle, Search, Clock, Bot, User,
    Hash, Trash2, ArrowLeft, Inbox
} from 'lucide-react'
import api from '../../../axios/api'
import Button from '../../../ui/Button'
import { useNotification } from '../../../hooks/useNotification'

interface ChatMessage {
    question: string
    response: string
    createdAt: string
}

interface ChatSession {
    sessionId: string
    messages: ChatMessage[]
}

function ChatList() {
    const [sessions, setSessions] = useState<ChatSession[]>([])
    const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null)
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showMobileChat, setShowMobileChat] = useState(false)
    const [refresh, setRefresh] = useState(false)
    const { addToast, showConfirm } = useNotification()

    const triggerRefresh = () => {
        setRefresh(true)
        setTimeout(() => {
            setRefresh(false)
        }, 5000)
    }

    const fetchChats = useCallback(async () => {
        setLoading(true)
        try {
            const res = await api.get("/chatbox/all")
            console.log("Réponse API complète:", res.data) // Debug
            
            if (res.data.success) {
                // ✅ CORRECTION : Vérifier les deux formats possibles
                const chatData = res.data.sessions || res.data.chats || res.data.conversations || []
                
                console.log("Sessions chargées:", chatData) // Debug
                
                setSessions(chatData)
                
                // Sélectionner la première session si disponible
                if (chatData.length > 0) {
                    setSelectedSession(chatData[0])
                }
            } else {
                addToast('error', 'Erreur', res.data.message || 'Impossible de charger les conversations')
            }
        } catch (error) {
            console.error("Erreur ChatList:", error)
            addToast('error', 'Erreur', 'Impossible de charger les conversations')
        } finally {
            setLoading(false)
        }
    }, [addToast])

    useEffect(() => {
        fetchChats()
    }, [fetchChats, refresh])

    const handleDelete = (sessionId: string) => {
        showConfirm(
            "Supprimer la conversation", 
            "Voulez-vous vraiment supprimer cette conversation ? Cette action est irréversible.", 
            async () => {
                try {
                    const res = await api.delete(`/chatbox/delete/${sessionId}`)
                    if (res.data.success) {
                        addToast('success', 'Conversation supprimée', 'La conversation a été supprimée avec succès')
                        if (selectedSession?.sessionId === sessionId) {
                            setSelectedSession(null)
                        }
                        triggerRefresh()
                    } else {
                        addToast('error', 'Erreur', res.data.message || 'Impossible de supprimer')
                    }
                } catch {
                    addToast('error', 'Erreur', 'Impossible de supprimer la conversation')
                }
            },
            {
                confirmText: 'Supprimer',
                cancelText: 'Annuler',
                type: 'danger'
            }
        )
    }

    // Filtrer les sessions
    const filteredSessions = useMemo(() => {
        if (!searchTerm.trim()) return sessions
        return sessions.filter(session => 
            session.sessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            session.messages?.some(msg => 
                msg.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                msg.response?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        )
    }, [sessions, searchTerm])

    // Formater la date
    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return ''
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short'
        })
    }

    // Formater l'heure
    const formatTime = (dateStr: string | undefined) => {
        if (!dateStr) return ''
        return new Date(dateStr).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const handleSessionClick = (session: ChatSession) => {
        setSelectedSession(session)
        setShowMobileChat(true)
    }

    const handleBackToList = () => {
        setShowMobileChat(false)
    }

    return (
        <section className="flex h-[calc(100vh-120px)] bg-white rounded-xl md:rounded-2xl xl:rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            {/* Barre latérale : Liste des Sessions */}
            <div className={`${showMobileChat ? 'hidden lg:flex' : 'flex'} w-full lg:w-95 xl:w-1/3 border-r border-gray-50 flex-col bg-gray-50/30`}>
                <div className="p-4 md:p-5 lg:p-6 border-b border-gray-50 bg-white">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                        <MessageCircle className="text-indigo-500 w-5 h-5 md:w-6 md:h-6" />
                        Conversations Orion
                    </h2>
                    <div className="relative mt-3 md:mt-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Rechercher une session..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 md:py-2.5 bg-gray-100 border-none rounded-lg md:rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2">
                    {loading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="p-4 rounded-xl bg-white animate-pulse">
                                    <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
                                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                                </div>
                            ))}
                        </div>
                    ) : filteredSessions.length > 0 ? (
                        filteredSessions.map((session) => (
                            <div
                                key={session.sessionId}
                                className={`p-3 md:p-4 rounded-xl md:rounded-2xl cursor-pointer transition-all flex items-center justify-between border ${
                                    selectedSession?.sessionId === session.sessionId
                                        ? 'bg-white border-indigo-100 shadow-sm'
                                        : 'border-transparent hover:bg-white/60'
                                }`}
                            >
                                <div onClick={() => handleSessionClick(session)} className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1 gap-2">
                                        <span className="text-[10px] font-bold text-indigo-500 flex items-center gap-1 uppercase tracking-tighter">
                                            <Hash className="w-2.5 h-2.5" />
                                            {session.sessionId?.substring(0, 8) || 'Session'}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-medium shrink-0">
                                            {formatDate(session.messages?.[0]?.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-xs md:text-sm font-bold text-gray-800 truncate">
                                        {session.messages?.[session.messages.length - 1]?.question || 'Nouvelle conversation'}
                                    </p>
                                    <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">
                                        {session.messages?.length || 0} messages échangés
                                    </p>
                                </div>

                                <Button 
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleDelete(session.sessionId)
                                    }} 
                                    className="ml-2 p-1.5 rounded-lg text-red-500 hover:bg-red-50 shrink-0"
                                    title="Supprimer"
                                >
                                    <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                </Button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            <p className="text-sm">Aucune conversation trouvée</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Zone de Chat : Détails de la session */}
            <div className={`${showMobileChat ? 'flex' : 'hidden'} lg:flex flex-1 flex-col bg-white`}>
                {selectedSession ? (
                    <>
                        {/* Header de la conversation */}
                        <div className="p-4 md:p-5 lg:p-6 border-b border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-3 md:gap-4 min-w-0">
                                <button 
                                    onClick={handleBackToList}
                                    className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                                >
                                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                                </button>
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                    <Bot className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-gray-900 text-sm md:text-base truncate">
                                        Session {selectedSession.sessionId?.substring(0, 8) || ''}
                                    </h3>
                                    <p className="text-[10px] md:text-xs text-gray-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        <span className="truncate">
                                            Dernière activité : {formatTime(selectedSession.messages?.[selectedSession.messages.length - 1]?.createdAt)}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-3 md:p-5 lg:p-8 space-y-5 md:space-y-8 bg-gray-50/20">
                            {selectedSession.messages?.map((msg, idx) => (
                                <div key={idx} className="space-y-3 md:space-y-4">
                                    {/* Question Utilisateur */}
                                    <div className="flex items-start gap-2.5 md:gap-4 w-full lg:max-w-[80%]">
                                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                                            <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
                                        </div>
                                        <div className="bg-white p-3 md:p-4 rounded-xl md:rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex-1 min-w-0">
                                            <p className="text-xs md:text-sm text-gray-800 wrap-break-words">{msg.question}</p>
                                            <span className="text-[8px] md:text-[9px] text-gray-400 font-bold mt-1.5 md:mt-2 block uppercase">
                                                Utilisateur
                                            </span>
                                        </div>
                                    </div>

                                    {/* Réponse Orion */}
                                    <div className="flex items-start gap-2.5 md:gap-4 w-full lg:max-w-[80%] ml-auto flex-row-reverse">
                                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                                            <Bot className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                                        </div>
                                        <div className="bg-indigo-600 p-3 md:p-4 rounded-xl md:rounded-2xl rounded-tr-none text-white shadow-lg shadow-indigo-100 flex-1 min-w-0">
                                            <div
                                                className="text-xs md:text-sm leading-relaxed wrap-break-words [&_a]:text-indigo-200 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_p]:mb-2 [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-bold [&_h3]:text-sm [&_h3]:font-semibold [&_img]:max-w-full [&_img]:h-auto [&_pre]:overflow-x-auto [&_pre]:bg-indigo-700 [&_pre]:p-3 [&_pre]:rounded-lg [&_code]:text-xs"
                                                dangerouslySetInnerHTML={{ __html: msg.response || '' }}
                                            />
                                            <span className="text-[8px] md:text-[9px] text-indigo-200 font-bold mt-1.5 md:mt-2 block uppercase text-right">
                                                Orion AI
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3 md:gap-4 p-4">
                        <Inbox className="w-10 h-10 md:w-12 md:h-12 opacity-20" />
                        <p className="text-sm md:text-base">Sélectionnez une conversation pour voir les détails</p>
                    </div>
                )}
            </div>
        </section>
    )
}

export default ChatList