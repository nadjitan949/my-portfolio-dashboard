import { Plus, ExternalLink, Edit3, Trash2, Eye, Loader2, Briefcase, Search } from "lucide-react"
import Button from "../../../ui/Button"
import { useNavigate } from "react-router-dom"
import { useEffect, useState, useMemo } from "react"
import api from "../../../axios/api"
import Img from "../../../ui/Img"
import { useNotification } from "../../../hooks/useNotification"

interface Service {
    id: number
    title: string
    image: string
    description: string
    details: string
}

function ServiceList() {
    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [refresh, setRefresh] = useState(false)

    const navigate = useNavigate()
    const { addToast, showConfirm } = useNotification()

    const DetailService = (id: number) => navigate(`/services/${id}`)
    const AddService = () => navigate("/add-service")
    const UpdateService = (id: number) => navigate(`/update-service/${id}`)

    const triggerRefresh = () => {
        setRefresh(true)
        setTimeout(() => {
            setRefresh(false)
        }, 5000)
    }

    useEffect(() => {
        const allServices = async () => {
            setLoading(true)
            try {
                const res = await api.get("/services/all")
                if (!res.data.success) {
                    addToast('error', 'Erreur', res.data.message || 'Impossible de charger les services')
                    return
                }
                const data: Service[] = res.data.services
                setServices(data)
            } catch (error) {
                console.error("Une erreur s'est produite: ", error)
                addToast('error', 'Erreur', 'Impossible de charger les services')
            } finally {
                setLoading(false)
            }
        }

        allServices()
    }, [refresh])

    const handleDeleteService = (id: number, title: string) => {
        showConfirm(
            "Supprimer le service",
            `Voulez-vous vraiment supprimer le service "${title}" ? Cette action est irréversible.`,
            async () => {
                try {
                    const res = await api.delete(`/services/delete/${id}`)
                    if (res.data.success) {
                        addToast('success', 'Service supprimé', 'Le service a été supprimé avec succès')
                        triggerRefresh()
                    } else {
                        addToast('error', 'Erreur', res.data.message || 'Impossible de supprimer')
                    }
                } catch {
                    addToast('error', 'Erreur', 'Impossible de supprimer le service')
                }
            },
            {
                confirmText: 'Supprimer',
                cancelText: 'Annuler',
                type: 'danger'
            }
        )
    }

    // Filtrer les services selon la recherche
    const filteredServices = useMemo(() => {
        if (!searchTerm.trim()) return services
        return services.filter(service => 
            service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [services, searchTerm])

    // Tronquer le texte
    const truncateText = (text: string, maxLength: number = 80) => {
        if (!text || text.length <= maxLength) return text
        return text.substring(0, maxLength) + '...'
    }

    return (
        <section className="w-full flex flex-col gap-4 md:gap-6 p-2 md:p-4 lg:p-6">
            {/* Header de la section avec bouton Ajouter */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex w-12 h-12 bg-blue-50 rounded-xl items-center justify-center">
                        <Briefcase size={24} className="text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-black">Mes Services</h2>
                        <p className="text-gray-500 text-xs md:text-sm mt-1">
                            Gérez les services que vous proposez ({services.length} au total)
                        </p>
                    </div>
                </div>

                <Button 
                    onClick={AddService} 
                    className="flex items-center justify-center gap-2 bg-blue-500 text-white px-4 md:px-5 py-2.5 md:py-3 rounded-lg md:rounded-xl hover:bg-blue-600 transition-all duration-300 font-medium shadow-lg shadow-blue-100 hover:shadow-blue-200 w-full sm:w-auto"
                >
                    <Plus size={18} md:size={20} />
                    <span className="hidden sm:inline">Ajouter un service</span>
                    <span className="sm:hidden">Ajouter</span>
                </Button>
            </div>

            {/* Barre de recherche */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Rechercher un service..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 md:py-3 border border-gray-200 rounded-lg md:rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white"
                />
            </div>

            {/* État de chargement */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden bg-white">
                            <div className="h-48 bg-gray-200 animate-pulse" />
                            <div className="p-5 space-y-3">
                                <div className="h-5 bg-gray-200 rounded animate-pulse" />
                                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredServices.length > 0 ? (
                /* Grille de services */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {filteredServices.map((service) => (
                        <div
                            key={service.id}
                            className="group border border-gray-200 rounded-xl md:rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                        >
                            {/* Image du service */}
                            <div 
                                className="h-40 md:h-48 overflow-hidden cursor-pointer relative"
                                onClick={() => DetailService(service.id)}
                            >
                                <Img
                                    src={service.image}
                                    alt={service.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                {/* Overlay au survol */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2">
                                        <Eye size={16} />
                                        Voir les détails
                                    </span>
                                </div>
                            </div>

                            {/* Contenu */}
                            <div className="p-4 md:p-5 flex flex-col flex-1">
                                <h3 
                                    className="text-base md:text-lg font-bold text-black group-hover:text-blue-600 transition-colors cursor-pointer line-clamp-2"
                                    onClick={() => DetailService(service.id)}
                                >
                                    {service.title}
                                </h3>
                                <p className="text-gray-600 text-xs md:text-sm mt-2 leading-relaxed line-clamp-3 flex-1">
                                    {truncateText(service.description || service.desciption || '')}
                                </p>

                                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3">
                                    <Button 
                                        onClick={() => DetailService(service.id)} 
                                        className="text-xs md:text-sm font-semibold text-blue-500 hover:text-blue-600 flex items-center gap-1 transition-colors w-fit"
                                    >
                                        Voir les détails <ExternalLink size={12} md:size={14} />
                                    </Button>
                                    
                                    <div className="flex gap-2">
                                        <Button 
                                            onClick={() => UpdateService(service.id)} 
                                            className="flex-1 text-xs px-3 py-2 border border-blue-500 rounded-lg hover:bg-blue-500 text-blue-500 hover:text-white transition-all duration-200 flex items-center justify-center gap-1"
                                        >
                                            <Edit3 size={12} />
                                            Modifier
                                        </Button>
                                        <Button 
                                            onClick={() => handleDeleteService(service.id, service.title)} 
                                            className="flex-1 text-xs px-3 py-2 border border-red-500 rounded-lg hover:bg-red-500 text-red-500 hover:text-white transition-all duration-200 flex items-center justify-center gap-1"
                                        >
                                            <Trash2 size={12} />
                                            Supprimer
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* État vide */
                <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        {searchTerm ? (
                            <Search size={32} md:size={40} className="text-gray-300" />
                        ) : (
                            <Briefcase size={32} md:size={40} className="text-gray-300" />
                        )}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-700 mb-2">
                        {searchTerm ? 'Aucun service trouvé' : 'Aucun service enregistré'}
                    </h3>
                    <p className="text-sm md:text-base text-gray-500 mb-6 max-w-md px-4">
                        {searchTerm 
                            ? `Aucun résultat pour "${searchTerm}". Essayez avec un autre terme.`
                            : 'Commencez par ajouter votre premier service pour le proposer à vos clients.'}
                    </p>
                    {!searchTerm && (
                        <Button 
                            onClick={AddService}
                            className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors font-medium"
                        >
                            <Plus size={18} />
                            Ajouter un service
                        </Button>
                    )}
                </div>
            )}
        </section>
    )
}

export default ServiceList