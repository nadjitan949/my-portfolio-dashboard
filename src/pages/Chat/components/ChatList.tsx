import { useEffect, useState } from 'react'
import {
    MessageCircle, Search, Clock, Bot, User,
    Hash,
    Trash2
} from 'lucide-react'
import api from '../../../axios/api'
import Button from '../../../ui/Button'

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
    const [refresh, setRefresh] = useState(false)


    const triggerRefresh = () => {
        setRefresh(true)
        setTimeout(() => {
            setRefresh(false);
        }, 5000)
    }

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const res = await api.get("/chatbox/all") // Adapte l'URL selon ton backend
                if (res.data.success) {
                    setSessions(res.data.chats)
                    // On sélectionne la première par défaut
                    if (res.data.sessions.length > 0) setSelectedSession(res.data.sessions[0])
                }
            } catch (error) {
                console.error("Erreur ChatList:", error)
            }
        }
        fetchChats()
    }, [refresh])


    const handleDelete = async (sessionId: string) => {
        try {

            const isConfirm = confirm("Vous allez supprimer cette conversation")
            if(!isConfirm) return

            const res = await api.delete(`/chatbox/delete/${sessionId}`)
            if(!res.data.success) return alert(res.data.message)

            alert(res.data.message)
            triggerRefresh()
            
        } catch (error) {
            console.log("Erreur: ", error)
        }
    }

    return (
        <section className="flex h-[calc(100vh-120px)] bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            {/* Barre latérale : Liste des Sessions */}
            <div className="w-1/3 border-r border-gray-50 flex flex-col bg-gray-50/30">
                <div className="p-6 border-b border-gray-50 bg-white">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <MessageCircle className="text-indigo-500" size={22} />
                        Conversations Orion
                    </h2>
                    <div className="relative mt-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Rechercher une session..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {sessions.map((session) => (
                        <div
                            key={session.sessionId}
                            className={`p-4 rounded-2xl cursor-pointer transition-all flex items-center justify-between border ${selectedSession?.sessionId === session.sessionId
                                ? 'bg-white border-indigo-100 shadow-sm'
                                : 'border-transparent hover:bg-white/60'
                                }`}
                        >
                            <div onClick={() => setSelectedSession(session)} className="w-full">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[10px] font-bold text-indigo-500 flex items-center gap-1 uppercase tracking-tighter">
                                        <Hash size={10} />
                                        {session.sessionId.substring(0, 8)}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-medium">
                                        {new Date(session.messages[0]?.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-sm font-bold text-gray-800 truncate">
                                    {session.messages[session.messages.length - 1]?.question}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {session.messages.length} messages échangés
                                </p>
                            </div>

                            <Button onClick={() => handleDelete(session.sessionId)} className=" p-1 rounded-xs text-red-500 hover:bg-red-50">
                                <Trash2 size={15} />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Zone de Chat : Détails de la session */}
            <div className="flex-1 flex flex-col bg-white">
                {selectedSession ? (
                    <>
                        {/* Header de la conversation */}
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <Bot size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Session {selectedSession.sessionId.substring(0, 8)}</h3>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <Clock size={12} />
                                        Dernière activité : {new Date(selectedSession.messages[selectedSession.messages.length - 1].createdAt).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50/20">
                            {selectedSession.messages.map((msg, idx) => (
                                <div key={idx} className="space-y-4">
                                    {/* Question Utilisateur */}
                                    <div className="flex items-start gap-4 max-w-[80%]">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                                            <User size={14} className="text-gray-600" />
                                        </div>
                                        <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
                                            <p className="text-sm text-gray-800">{msg.question}</p>
                                            <span className="text-[9px] text-gray-400 font-bold mt-2 block uppercase">Utilisateur</span>
                                        </div>
                                    </div>

                                    {/* Réponse Orion */}
                                    <div className="flex items-start gap-4 max-w-[80%] ml-auto flex-row-reverse">
                                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                                            <Bot size={14} className="text-white" />
                                        </div>
                                        <div className="bg-indigo-600 p-4 rounded-2xl rounded-tr-none text-white shadow-lg shadow-indigo-100">
                                            <div
                                                className="text-sm leading-relaxed"
                                                dangerouslySetInnerHTML={{ __html: msg.response }}
                                            />
                                            <span className="text-[9px] text-indigo-200 font-bold mt-2 block uppercase text-right">Orion AI</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
                        <MessageCircle size={48} className="opacity-20" />
                        <p className="text-sm">Sélectionnez une conversation pour voir les détails</p>
                    </div>
                )}
            </div>
        </section>
    )
}

export default ChatList