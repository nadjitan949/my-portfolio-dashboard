import { Mail, Phone, MessageSquare, Calendar, Trash2, Eye, ExternalLink, Search, Inbox, CheckCircle2 } from 'lucide-react'
import { useEffect, useState, useMemo, useCallback } from 'react'
import api from '../../../axios/api'
import { useNavigate } from 'react-router-dom'
import Button from '../../../ui/Button'
import Img from '../../../ui/Img'
import { useNotification } from '../../../hooks/useNotification'

interface Service {
    id: number
    title: string
    image: string
}

interface Interest {
    id: number
    media: string
    contact: string
    message: string
    isOpen: boolean
    createdAt: string
    Service: Service
}

function InterestList() {
    const [interests, setInterests] = useState<Interest[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterOpen, setFilterOpen] = useState<'all' | 'new' | 'opened'>('all')
    const navigate = useNavigate()
    const { addToast, showConfirm } = useNotification()

    const formatDate = (dateStr: string) => {
        if (!dateStr) return ''
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const fetchInterests = useCallback(async () => {
        setLoading(true)
        try {
            const res = await api.get("/interests/all")
            if (res.data.success) {
                setInterests(res.data.interests || [])
            } else {
                addToast('error', 'Erreur', res.data.message || 'Impossible de charger les demandes')
            }
        } catch (error) {
            console.error("Erreur: ", error)
            addToast('error', 'Erreur', 'Impossible de charger les demandes')
        } finally {
            setLoading(false)
        }
    }, [addToast])

    useEffect(() => {
        fetchInterests()
    }, [fetchInterests])

    const handleDelete = (id: number, contact: string) => {
        showConfirm(
            "Supprimer la demande", 
            `Voulez-vous vraiment supprimer la demande de "${contact}" ? Cette action est irréversible.`, 
            async () => {
                try {
                    const res = await api.delete(`/interests/delete/${id}`)
                    if (res.data.success) {
                        addToast('success', 'Demande supprimée', 'La demande a été supprimée avec succès')
                        setInterests(prev => prev.filter(i => i.id !== id))
                    } else {
                        addToast('error', 'Erreur', res.data.message || 'Impossible de supprimer')
                    }
                } catch {
                    addToast('error', 'Erreur', 'Impossible de supprimer la demande')
                }
            },
            {
                confirmText: 'Supprimer',
                cancelText: 'Annuler',
                type: 'danger'
            }
        )
    }

    // Filtrer les demandes
    const filteredInterests = useMemo(() => {
        return interests.filter(item => {
            const matchesSearch = 
                item.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.Service?.title?.toLowerCase().includes(searchTerm.toLowerCase())
            
            const matchesFilter = 
                filterOpen === 'all' ? true :
                filterOpen === 'new' ? !item.isOpen :
                item.isOpen
            
            return matchesSearch && matchesFilter
        })
    }, [interests, searchTerm, filterOpen])

    // Compter les nouvelles demandes
    const newCount = useMemo(() => {
        return interests.filter(i => !i.isOpen).length
    }, [interests])

    return (
        <section className="w-full bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-4 md:p-5 lg:p-6 border-b border-gray-50 bg-gray-50/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 md:p-2.5 bg-emerald-100 text-emerald-600 rounded-lg md:rounded-xl">
                            <ExternalLink className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg md:text-xl font-bold text-gray-800">Demandes de services</h2>
                            <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                                {interests.length} prospect(s) intéressé(s)
                                {newCount > 0 && (
                                    <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] md:text-xs font-bold rounded-full">
                                        {newCount} nouveau(x)
                                    </span>
                                )}
                            </p>
                        </div>
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
                        placeholder="Rechercher par contact, message ou service..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg md:rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    />
                </div>

                {/* Filtres */}
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
                    {([
                        { value: 'all', label: 'Toutes' },
                        { value: 'new', label: 'Nouvelles' },
                        { value: 'opened', label: 'Ouvertes' }
                    ] as const).map(f => (
                        <button
                            key={f.value}
                            onClick={() => setFilterOpen(f.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                                filterOpen === f.value 
                                    ? 'bg-white shadow-sm text-emerald-600' 
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
                <div className="p-6 md:p-8">
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="p-4 rounded-xl border border-gray-100 animate-pulse">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                                    </div>
                                </div>
                                <div className="h-3 bg-gray-200 rounded w-2/3" />
                            </div>
                        ))}
                    </div>
                </div>
            ) : filteredInterests.length > 0 ? (
                /* Liste */
                <div className="divide-y divide-gray-100">
                    {filteredInterests.map((item) => (
                        <div 
                            key={item.id}
                            className={`p-4 md:p-5 flex flex-col lg:flex-row lg:items-center gap-4 md:gap-6 transition-all hover:bg-gray-50 group ${
                                !item.isOpen ? 'bg-emerald-50/30' : ''
                            }`}
                        >
                            {/* Info Client & Media */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap">
                                    <div className={`p-2 rounded-full shrink-0 ${
                                        item.media === 'email' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                                    }`}>
                                        {item.media === 'email' ? <Mail className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Phone className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                                    </div>
                                    <span className="font-bold text-gray-900 text-sm md:text-base truncate">{item.contact}</span>
                                    {!item.isOpen && (
                                        <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full uppercase flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Nouveau
                                        </span>
                                    )}
                                </div>
                                
                                <p className="text-sm text-gray-600 line-clamp-1 italic wrap-break-words">
                                    "{item.message}"
                                </p>
                                
                                <div className="flex items-center gap-3 md:gap-4 mt-2 md:mt-3 text-[10px] md:text-xs text-gray-400 flex-wrap">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> {formatDate(item.createdAt)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MessageSquare className="w-3 h-3" /> Via {item.media}
                                    </span>
                                </div>
                            </div>

                            {/* Badge Service Intéressé */}
                            {item.Service && (
                                <div className="shrink-0 flex items-center gap-2 md:gap-3 bg-white border border-gray-200 p-2 md:p-2.5 rounded-lg md:rounded-xl shadow-sm w-full lg:w-64">
                                    <Img 
                                        src={item.Service.image} 
                                        alt={item.Service.title} 
                                        className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover shrink-0"
                                    />
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Service demandé</p>
                                        <p className="text-xs md:text-sm font-bold text-gray-800 truncate">{item.Service.title}</p>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2 lg:ml-4 shrink-0">
                                <Button 
                                    onClick={() => navigate(`/interests/details/${item.id}`)}
                                    className="p-2 md:p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                    title="Voir les détails"
                                >
                                    <Eye className="w-4 h-4 md:w-5 md:h-5" />
                                </Button>
                                <Button 
                                    onClick={() => handleDelete(item.id, item.contact)}
                                    className="p-2 md:p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                    title="Supprimer"
                                >
                                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-16 md:py-20 text-center p-4">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        {searchTerm || filterOpen !== 'all' ? (
                            <Search className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
                        ) : (
                            <Inbox className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
                        )}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-700 mb-2">
                        {searchTerm || filterOpen !== 'all' ? 'Aucune demande trouvée' : 'Aucune demande'}
                    </h3>
                    <p className="text-sm md:text-base text-gray-500 max-w-md">
                        {searchTerm || filterOpen !== 'all' 
                            ? 'Aucun résultat ne correspond à vos critères de recherche.'
                            : "Aucune demande d'intérêt pour le moment."}
                    </p>
                </div>
            )}
        </section>
    )
}

export default InterestList