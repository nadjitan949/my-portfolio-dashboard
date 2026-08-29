import { ArrowLeft, Edit3, Trash2, Calendar, Tag, Loader2, AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import api from "../../../axios/api"
import Button from "../../../ui/Button"
import Img from "../../../ui/Img"
import { useNotification } from "../../../hooks/useNotification"

interface Service {
    id: number | null
    title: string | ""
    image: string | undefined
    description: string | ""
    details: string | ""
    createdAt?: string
    updatedAt?: string
}

function ServiceDetails() {
    const [service, setService] = useState<Service | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string>("")

    const params = useParams()
    const id = params.id
    const navigate = useNavigate()
    const { addToast, showConfirm } = useNotification()

    const UpdateService = () => navigate(`/update-service/${id}`)
    const goBack = () => navigate(-1)

    useEffect(() => {
        const detailService = async () => {
            setLoading(true)
            setError("")
            try {
                const res = await api.get(`/services/details/${id}`)
                if (!res.data.success) {
                    setError(res.data.message || "Service introuvable")
                    addToast('error', 'Erreur', res.data.message || 'Service introuvable')
                    return
                }
                const data: Service = res.data.service
                setService(data)
            } catch (error) {
                console.error("Erreur produite: ", error)
                setError("Impossible de charger les détails du service")
                addToast('error', 'Erreur', 'Impossible de charger les détails du service')
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            detailService()
        }
    }, [id, addToast])

    const handleDeleteService = () => {
        showConfirm(
            "Supprimer le service", 
            "Voulez-vous vraiment supprimer ce service ? Cette action est irréversible.", 
            async () => {
                try {
                    const res = await api.delete(`/services/delete/${id}`)
                    if (res.data.success) {
                        addToast('success', 'Service supprimé', 'Le service a été supprimé avec succès')
                        setTimeout(() => navigate(-1), 500)
                    } else {
                        addToast('error', 'Erreur', res.data.message || 'Impossible de supprimer')
                    }
                } catch {
                    addToast('error', 'Erreur', 'Impossible de supprimer le service')
                }
            },
            {
                confirmText: 'Supprimer définitivement',
                cancelText: 'Annuler',
                type: 'danger'
            }
        )
    }

    // Formater la date
    const formatDate = (date?: string) => {
        if (!date) return ''
        return new Date(date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    // État de chargement
    if (loading) {
        return (
            <section className="w-full h-full min-h-[400px] bg-white rounded-xl md:rounded-2xl shadow-sm overflow-hidden flex items-center justify-center">
                <div className="text-center p-6 md:p-8">
                    <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin text-blue-600 mx-auto mb-3 md:mb-4" />
                    <p className="text-sm md:text-base text-gray-500 font-medium">Chargement du service...</p>
                </div>
            </section>
        )
    }

    // État d'erreur
    if (error && !service) {
        return (
            <section className="w-full h-full min-h-[400px] bg-white rounded-xl md:rounded-2xl shadow-sm overflow-hidden flex flex-col items-center justify-center p-4 md:p-8">
                <div className="text-center max-w-md w-full">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                        <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-red-400" />
                    </div>
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Service introuvable</h2>
                    <p className="text-sm md:text-base text-gray-500 mb-4 md:mb-6">{error || "Ce service n'existe pas ou a été supprimé."}</p>
                    <Button 
                        onClick={goBack}
                        className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all inline-flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                        Retour à la liste
                    </Button>
                </div>
            </section>
        )
    }

    return (
        <section className="w-full h-full bg-white rounded-xl md:rounded-2xl shadow-sm overflow-hidden flex flex-col">
            {/* Barre d'actions supérieure */}
            <div className="p-3 md:p-4 lg:p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-white sticky top-0 z-10 shadow-sm">
                <button
                    onClick={goBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium w-fit py-1.5"
                >
                    <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden sm:inline text-sm md:text-base">Retour à la liste</span>
                    <span className="sm:hidden text-sm">Retour</span>
                </button>

                <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
                    <Button 
                        onClick={UpdateService} 
                        className="flex-1 sm:flex-none p-2 md:p-2.5 border cursor-pointer border-gray-300 rounded-lg md:rounded-xl hover:bg-gray-100 hover:border-gray-400 transition-all flex items-center justify-center gap-2"
                        title="Modifier le service"
                    >
                        <Edit3 className="w-4 h-4 md:w-5 md:h-5" />
                        <span className="hidden md:inline text-sm font-medium">Modifier</span>
                    </Button>
                    <Button 
                        onClick={handleDeleteService} 
                        className="flex-1 sm:flex-none p-2 md:p-2.5 border cursor-pointer border-red-200 text-red-600 rounded-lg md:rounded-xl hover:bg-red-50 hover:border-red-300 transition-all flex items-center justify-center gap-2"
                        title="Supprimer le service"
                    >
                        <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                        <span className="hidden md:inline text-sm font-medium">Supprimer</span>
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 p-4 md:p-6 lg:p-8">
                    {/* Colonne Gauche : Image et Résumé */}
                    <div className="space-y-4 md:space-y-6">
                        <div className="relative aspect-video w-full rounded-xl md:rounded-2xl overflow-hidden border border-gray-200 shadow-sm group bg-gray-50">
                            {service?.image ? (
                                <Img
                                    src={service.image}
                                    alt={service?.title || 'Image du service'}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <Tag className="w-12 h-12 md:w-16 md:h-16" />
                                </div>
                            )}
                            {service?.createdAt && (
                                <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3 bg-black/50 backdrop-blur-sm text-white text-[10px] md:text-xs px-2 md:px-3 py-1 md:py-1.5 rounded-lg flex items-center gap-1.5 md:gap-2">
                                    <Calendar className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                    <span className="truncate">Créé le {formatDate(service.createdAt)}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 md:space-y-3">
                            {service?.title && (
                                <div className="flex items-start gap-2 md:gap-3">
                                    <Tag className="w-4 h-4 md:w-5 md:h-5 text-blue-600 mt-1 shrink-0" />
                                    <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-black leading-tight break-words">
                                        {service.title}
                                    </h1>
                                </div>
                            )}
                            {service?.description && (
                                <p className="text-sm md:text-base lg:text-lg text-blue-600 font-medium leading-relaxed break-words">
                                    {service.description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Colonne Droite : Détails complets */}
                    <div className="bg-gray-50 rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 border border-gray-100">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 md:mb-6 pb-3 md:pb-4 border-b border-gray-200 gap-2">
                            <h2 className="text-xs md:text-sm font-bold uppercase tracking-widest text-gray-400">
                                Description détaillée
                            </h2>
                            {service?.updatedAt && (
                                <span className="text-[10px] md:text-xs text-gray-400 flex items-center gap-1">
                                    <Calendar className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                    <span className="truncate">Mis à jour le {formatDate(service.updatedAt)}</span>
                                </span>
                            )}
                        </div>
                        <div className="prose prose-blue max-w-none">
                            <div
                                className="text-gray-700 leading-relaxed text-sm md:text-base lg:text-lg break-words [&_img]:max-w-full [&_img]:h-auto [&_a]:text-blue-600 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h1]:text-xl md:text-2xl [&_h1]:font-bold [&_h1]:mb-3 md:mb-4 [&_h2]:text-lg md:text-xl [&_h2]:font-bold [&_h2]:mb-2 md:mb-3 [&_h3]:text-base md:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_p]:mb-3 md:mb-4 [&_pre]:overflow-x-auto [&_pre]:max-w-full [&_table]:max-w-full [&_table]:overflow-x-auto"
                                dangerouslySetInnerHTML={{ __html: service?.details || "<p>Aucune description détaillée disponible.</p>" }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ServiceDetails