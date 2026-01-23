import { useEffect, useState } from 'react'
import { 
    Users, Star, Code2, 
     Mail, ExternalLink, 
    MessageSquare, Eye, X, Globe, Clock, Calendar,
    type LucideIcon
} from 'lucide-react'
import api from '../../axios/api'
import { useNavigate } from 'react-router-dom'

// Types
interface Message { 
    id: number; 
    author: string; 
    content: string; 
    createdAt: string; 
}

interface Visit {
    id: number
    ip: string
    userAgent?: string
    createdAt: string
}

interface DashboardStats {
    collabs: number
    messages: number
    reviews: string | number
    interests: number
    visits: number 
    visitsList: Visit[]
}

interface StatCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    color: string
    onClick: () => void
}

const StatCard = ({ title, value, icon: Icon, color, onClick }: StatCardProps) => (
    <div 
        onClick={onClick}
        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all group"
    >
        <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl transition-colors ${color} group-hover:scale-110 duration-300`}>
            <Icon size={24} />
        </div>
    </div>
)

function Dashboard() {
    const navigate = useNavigate()
    const [stats, setStats] = useState<DashboardStats>({
        collabs: 0, messages: 0, reviews: 0, interests: 0, visits: 0, visitsList: []
    })
    const [recentMessages, setRecentMessages] = useState<Message[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [visitsList, setVisitsList] = useState<Visit[] | null>(null)

    useEffect(() => {
        const timer = setInterval(() => setCurrentDate(new Date()), 60000)
        
        const fetchDashboardData = async () => {
            try {
                // Seulement deux appels : un pour les stats (incluant les visites) et un pour les messages
                const [statsRes, messagesRes] = await Promise.all([
                    api.get("/stats/all"),
                    api.get("/messages/all")
                ])

                if (statsRes.data.success) {
                    setStats(statsRes.data.stats)
                }
                if (messagesRes.data.success) {
                    setRecentMessages(messagesRes.data.messages.slice(0, 4))
                }
            } catch (error) {
                console.error("Erreur Dashboard:", error)
            }
        }

        fetchDashboardData()
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        const fetchVisits = async () => {
            try {

                const res = await api.get("/visits/all")
                if(!res.data.success) return alert(res.data.message)

                const data: Visit[] = res.data.visitsList
                setVisitsList(data)
                
            } catch (error) {
                console.log("Erreur: ", error)
            }
        }
        fetchVisits()
    }, [])

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
        })
    }

    return (
        <section className="space-y-8 relative">
            {/* Modal pour les Visites utilisant stats.visitsList */}
            {isModalOpen && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-[70%] max-h-[80vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b flex items-center justify-between bg-gray-50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Historique des visites</h3>
                                <p className="text-sm text-gray-500">{stats.visits} visites enregistrées</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="overflow-y-auto p-6 max-h-[60vh] w-300 divide-y divide-gray-100">
                            {visitsList && visitsList.length > 0 ? (
                                visitsList.map((visit) => (
                                    <div key={visit.id} className="py-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Globe size={18} /></div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{visit.ip}</p>
                                                <p className="text-xs text-gray-500">{visit.userAgent || 'Navigateur'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-1">
                                            <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                                                <Clock size={12} />
                                                {new Date(visit.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="text-[10px] text-gray-300 font-bold uppercase tracking-tighter">
                                                {formatDate(visit.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-10 text-center text-gray-400">Aucune donnée de visite disponible.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 mb-1 font-bold">
                        <Calendar size={16} />
                        <span className="text-xs uppercase tracking-widest">
                            {currentDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tableau de bord</h1>
                    <p className="text-gray-500">Aperçu global de votre portfolio.</p>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span>Système Actif</span>
                </div>
            </div>

            {/* Grille de Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard title="Visites" value={stats.visits} icon={Eye} color="bg-purple-50 text-purple-600" onClick={() => setIsModalOpen(true)} />
                <StatCard title="Collabs" value={stats.collabs} icon={Users} color="bg-blue-50 text-blue-600" onClick={() => navigate("/collabs")} />
                <StatCard title="Messages" value={stats.messages} icon={Mail} color="bg-indigo-50 text-indigo-600" onClick={() => navigate("/messages")} />
                <StatCard title="Avis" value={`${stats.reviews}/5`} icon={Star} color="bg-amber-50 text-amber-600" onClick={() => navigate("/reviews")} />
                <StatCard title="Prospects" value={stats.interests} icon={ExternalLink} color="bg-emerald-50 text-emerald-600" onClick={() => navigate("/interests")} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Messages Récents */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden h-full">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <MessageSquare size={18} className="text-indigo-500" />
                                Activité récente
                            </h3>
                            <button onClick={() => navigate("/messages")} className="text-xs text-indigo-600 font-bold px-3 py-1 hover:bg-indigo-50 rounded-lg transition-colors">VOIR TOUT</button>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {recentMessages.length > 0 ? recentMessages.map((msg) => (
                                <div key={msg.id} onClick={() => navigate(`/messages/details/${msg.id}`)} className="p-5 flex items-center gap-4 hover:bg-gray-50/80 transition-all cursor-pointer group">
                                    <div className="w-11 h-11 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-500 font-bold text-sm group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">{msg.author.charAt(0)}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <p className="text-sm font-bold text-gray-900">{msg.author}</p>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase">{formatDate(msg.createdAt)}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">{msg.content}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-10 text-center text-gray-400 text-sm">Aucun nouveau message.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Gestion Stack & Raccourcis */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-6 text-gray-800 font-bold"><Code2 size={20} className="text-indigo-600" /> Ma Stack</div>
                        <div className="grid grid-cols-2 gap-3">
                            {['Languages', 'Competances', 'Projets', 'Categories'].map(item => (
                                <button key={item} onClick={() => navigate(`/${item.toLowerCase()}`)} className="p-3 text-[11px] font-bold border border-gray-50 rounded-2xl hover:bg-indigo-600 hover:text-white hover:shadow-lg hover:shadow-indigo-100 transition-all">{item}</button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="bg-linear-to-br from-indigo-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="font-bold mb-2">Portfolio Pro</h4>
                            <p className="text-indigo-100 text-[11px] mb-5 leading-relaxed">Mettez à jour vos services pour améliorer votre taux de conversion.</p>
                            <button onClick={() => navigate("/services")} className="w-full py-3 bg-white text-indigo-600 rounded-2xl font-bold text-xs hover:scale-[1.02] transition-transform shadow-md">
                                Gérer les services
                            </button>
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Dashboard