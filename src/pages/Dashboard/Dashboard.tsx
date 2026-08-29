import { useEffect, useState, useCallback } from 'react'
import {
    Users, Star, Code2,
    Mail, MessageSquare,
    type LucideIcon,
    Trash2,
    X,
    Clock,
    Globe,
    Calendar,
    Eye,
    Loader2,
} from 'lucide-react'
import api from '../../axios/api'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '../../hooks/useNotification'
import Button from '../../ui/Button'

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
    bgColor: string
    onClick: () => void
}

const StatCard = ({ title, value, icon: Icon, color, bgColor, onClick }: StatCardProps) => (
    <div
        onClick={onClick}
        className="bg-white p-3 md:p-5 rounded-xl md:rounded-2xl border border-gray-100 flex items-center justify-between cursor-pointer hover:shadow-lg hover:border-indigo-100 transition-all duration-300 group"
    >
        <div className="min-w-0">
            <p className="text-[10px] md:text-xs font-medium text-gray-400 uppercase tracking-wider mb-1 truncate">
                {title}
            </p>
            <h3 className="text-lg md:text-2xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className={`p-2 md:p-3 rounded-lg md:rounded-xl ${bgColor} group-hover:scale-110 transition-transform duration-300 shrink-0`}>
            <Icon className={`w-4 h-4 md:w-5 md:h-5 ${color}`} />
        </div>
    </div>
)

function Dashboard() {
    const navigate = useNavigate()
    const { addToast, showConfirm } = useNotification()
    const [stats, setStats] = useState<DashboardStats>({
        collabs: 0, messages: 0, reviews: 0, interests: 0, visits: 0, visitsList: []
    })
    const [recentMessages, setRecentMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [visitsList, setVisitsList] = useState<Visit[]>([])
    const [loadingVisits, setLoadingVisits] = useState(false)
    const [refresh, setRefresh] = useState(false)

    const triggerRefresh = () => {
        setRefresh(true)
        setTimeout(() => {
            setRefresh(false)
        }, 5000)
    }

    const fetchDashboardData = useCallback(async () => {
        setLoading(true)
        try {
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
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        const timer = setInterval(() => setCurrentDate(new Date()), 60000)
        fetchDashboardData()
        return () => clearInterval(timer)
    }, [fetchDashboardData])

    const fetchVisits = useCallback(async () => {
        setLoadingVisits(true)
        try {
            const res = await api.get("/visits/all")
            if (res.data.success) {
                setVisitsList(res.data.visitsList || res.data.visits || [])
            }
        } catch (error) {
            console.error("Erreur visites:", error)
        } finally {
            setLoadingVisits(false)
        }
    }, [])

    useEffect(() => {
        if (isModalOpen) {
            fetchVisits()
        }
    }, [isModalOpen, refresh, fetchVisits])

    const formatDate = (dateString: string) => {
        if (!dateString) return ''
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
        })
    }

    const formatTime = (dateString: string) => {
        if (!dateString) return ''
        return new Date(dateString).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const deleteVisits = (id: number) => {
        showConfirm(
            "Supprimer la visite", 
            "Voulez-vous vraiment supprimer cette visite ?", 
            async () => {
                try {
                    const res = await api.delete(`/visits/delete/${id}`)
                    if (res.data.success) {
                        addToast('success', 'Visite supprimée', 'La visite a été supprimée avec succès')
                        triggerRefresh()
                    } else {
                        addToast('error', 'Erreur', res.data.message || 'Impossible de supprimer')
                    }
                } catch {
                    addToast('error', 'Erreur', "La visite n'a pas été supprimée")
                }
            },
            {
                confirmText: 'Supprimer',
                cancelText: 'Annuler',
                type: 'danger'
            }
        )
    }

    const deleteAllVisits = () => {
        if (!visitsList || visitsList.length === 0) return
        
        showConfirm(
            "Tout supprimer", 
            `Voulez-vous supprimer les ${visitsList.length} visites ? Cette action est irréversible.`, 
            async () => {
                try {
                    await Promise.all(visitsList.map(visit => api.delete(`/visits/delete/${visit.id}`)))
                    addToast('success', 'Toutes les visites supprimées', 'Historique vidé avec succès')
                    triggerRefresh()
                } catch {
                    addToast('error', 'Erreur', "Certaines visites n'ont pas pu être supprimées")
                    triggerRefresh()
                }
            },
            {
                confirmText: 'Tout supprimer',
                cancelText: 'Annuler',
                type: 'danger'
            }
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin text-indigo-600" />
            </div>
        )
    }

    return (
        <section className="space-y-5 md:space-y-6 lg:space-y-8 relative p-3 md:p-4 lg:p-6">
            {/* Modal pour les Visites */}
            {isModalOpen && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-3 md:p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-xl md:rounded-2xl lg:rounded-3xl w-full max-w-2xl max-h-[85vh] md:max-h-[80vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50">
                            <div>
                                <h3 className="text-lg md:text-xl font-bold text-gray-900">Historique des visites</h3>
                                <p className="text-xs md:text-sm text-gray-500">{stats.visits} visites enregistrées</p>
                            </div>
                            <div className='flex items-center justify-center gap-2'>
                                <Button 
                                    onClick={deleteAllVisits} 
                                    className="p-2 px-3 md:px-4 hover:bg-red-100 text-red-500 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                                >
                                    <span className='text-xs md:text-sm font-medium hidden sm:inline'>Vider la liste</span>
                                    <Trash2 className="w-4 h-4" />
                                </Button>

                                <Button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                    <X className="w-4 h-4 md:w-5 md:h-5" />
                                </Button>
                            </div>
                        </div>
                        
                        <div className="overflow-y-auto p-4 md:p-6 max-h-[60vh] md:max-h-[55vh] divide-y divide-gray-100">
                            {loadingVisits ? (
                                <div className="flex items-center justify-center py-10">
                                    <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin text-indigo-600" />
                                </div>
                            ) : visitsList && visitsList.length > 0 ? (
                                visitsList.map((visit) => (
                                    <div key={visit.id} className="py-3 md:py-4 flex items-center justify-between gap-2 md:gap-4">
                                        <div className="flex items-center gap-2.5 md:gap-4 min-w-0 flex-1">
                                            <div className="p-1.5 md:p-2 bg-purple-50 text-purple-600 rounded-lg shrink-0">
                                                <Globe className="w-4 h-4 md:w-5 md:h-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs md:text-sm font-bold text-gray-800 truncate">{visit.ip}</p>
                                                <p className="text-[10px] md:text-xs text-gray-500 truncate">{visit.userAgent || 'Navigateur'}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="text-right flex flex-col items-end gap-0.5 md:gap-1 shrink-0">
                                            <span className="text-[10px] md:text-xs font-medium text-gray-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatTime(visit.createdAt)}
                                            </span>
                                            <span className="text-[9px] md:text-[10px] text-gray-300 font-bold uppercase tracking-tighter">
                                                {formatDate(visit.createdAt)}
                                            </span>
                                        </div>

                                        <Button 
                                            onClick={() => deleteVisits(visit.id)} 
                                            className='p-1.5 rounded-lg text-red-500 hover:bg-red-100 shrink-0'
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 md:p-10 text-center text-gray-400 text-sm">
                                    Aucune donnée de visite disponible.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 mb-1 font-bold">
                        <Calendar className="w-4 h-4" />
                        <span className="text-[10px] md:text-xs uppercase tracking-widest">
                            {currentDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Tableau de bord</h1>
                    <p className="text-xs md:text-sm text-gray-500">Aperçu global de votre portfolio.</p>
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-emerald-100 shadow-sm w-fit">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span>Système Actif</span>
                </div>
            </div>

            {/* Grille de Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
                <StatCard title="Visites" value={stats.visits} icon={Eye} color="text-purple-600" bgColor="bg-purple-50" onClick={() => setIsModalOpen(true)} />
                <StatCard title="Collabs" value={stats.collabs} icon={Users} color="text-blue-600" bgColor="bg-blue-50" onClick={() => navigate("/collabs")} />
                <StatCard title="Messages" value={stats.messages} icon={Mail} color="text-indigo-600" bgColor="bg-indigo-50" onClick={() => navigate("/messages")} />
                <StatCard title="Avis" value={`${stats.reviews}/5`} icon={Star} color="text-amber-600" bgColor="bg-amber-50" onClick={() => navigate("/reviews")} />
                <StatCard title="Prospects" value={stats.interests} icon={MessageSquare} color="text-emerald-600" bgColor="bg-emerald-50" onClick={() => navigate("/interests")} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-8">
                {/* Messages Récents */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl md:rounded-2xl lg:rounded-3xl border border-gray-100 shadow-sm overflow-hidden h-full">
                        <div className="p-4 md:p-6 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm md:text-base">
                                <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-indigo-500" />
                                Activité récente
                            </h3>
                            <button 
                                onClick={() => navigate("/messages")} 
                                className="text-[10px] md:text-xs text-indigo-600 font-bold px-2 md:px-3 py-1 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                                VOIR TOUT
                            </button>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {recentMessages.length > 0 ? recentMessages.map((msg) => (
                                <div 
                                    key={msg.id} 
                                    onClick={() => navigate(`/messages/details/${msg.id}`)} 
                                    className="p-3 md:p-5 flex items-center gap-3 md:gap-4 hover:bg-gray-50/80 transition-all cursor-pointer group"
                                >
                                    <div className="w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-2xl bg-gray-50 flex items-center justify-center text-gray-500 font-bold text-xs md:text-sm group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors shrink-0">
                                        {msg.author.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-0.5 gap-2">
                                            <p className="text-xs md:text-sm font-bold text-gray-900 truncate">{msg.author}</p>
                                            <span className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase shrink-0">{formatDate(msg.createdAt)}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">{msg.content}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-8 md:p-10 text-center text-gray-400 text-sm">
                                    Aucun nouveau message.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Gestion Stack & Raccourcis */}
                <div className="space-y-5 md:space-y-6">
                    <div className="bg-white rounded-xl md:rounded-2xl lg:rounded-3xl border border-gray-100 shadow-sm p-4 md:p-6">
                        <div className="flex items-center gap-2 mb-4 md:mb-6 text-gray-800 font-bold text-sm md:text-base">
                            <Code2 className="w-5 h-5 text-indigo-600" /> 
                            Ma Stack
                        </div>
                        <div className="grid grid-cols-2 gap-2 md:gap-3">
                            {['Languages', 'Competances', 'Projets', 'Categories'].map(item => (
                                <button 
                                    key={item} 
                                    onClick={() => navigate(`/${item.toLowerCase()}`)} 
                                    className="p-2.5 md:p-3 text-[10px] md:text-[11px] font-bold border border-gray-50 rounded-lg md:rounded-2xl hover:bg-indigo-600 hover:text-white hover:shadow-lg hover:shadow-indigo-100 transition-all"
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-linear-to-br from-indigo-600 to-indigo-700 rounded-xl md:rounded-2xl lg:rounded-3xl p-4 md:p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="font-bold mb-2 text-sm md:text-base">Portfolio Pro</h4>
                            <p className="text-indigo-100 text-[10px] md:text-[11px] mb-4 md:mb-5 leading-relaxed">
                                Mettez à jour vos services pour améliorer votre taux de conversion.
                            </p>
                            <button 
                                onClick={() => navigate("/services")} 
                                className="w-full py-2.5 md:py-3 bg-white text-indigo-600 rounded-lg md:rounded-2xl font-bold text-xs hover:scale-[1.02] transition-transform shadow-md"
                            >
                                Gérer les services
                            </button>
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-20 h-20 md:w-24 md:h-24 bg-white/10 rounded-full blur-2xl"></div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Dashboard