import { ArrowLeft, Edit3, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import api from "../../../axios/api"
import Button from "../../../ui/Button"
import Img from "../../../ui/Img"

interface Service {
    id: number | null
    title: string | ""
    image: string | undefined
    description: string | ""
    details: string | ""
}

function ServiceDetails() {

    const [service, setService] = useState<Service | null>(null)
    const [messages, setMessage] = useState<string | "">("")

    const params = useParams()
    const id = params.id
    const navigate = useNavigate()

    const UpdateService = () => navigate(`/update-service/${id}`)

    useEffect(() => {
        const detailService = async () => {
            try {

                const res = await api.get(`/services/details/${id}`)
                if (!res.data.success) {
                    return setMessage(res.data.message)
                }

                const data: Service = res.data.service
                setService(data)

            } catch (error) {
                console.log("Erreur produite: ", error)
            }
        }

        detailService()

    }, [id])

    const handleDeleteService = async () => {
        try {

            const isConfirme = confirm("Tu vas supprimmer hein ?")
            if (!isConfirme) return

            const res = await api.delete(`/services/delete/${id}`)
            if (!res.data.success) {
                return setMessage(res.data.message)
            }

            alert(res.data.message)
            navigate(-1)

        } catch (error) {
            console.log("Erreur: ", error)
        }
    }

    return (
        <section className="w-full h-full bg-white rounded-xl overflow-hidden flex flex-col">

            {messages}

            {/* Barre d'actions supérieure */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors font-medium"
                >
                    <ArrowLeft size={20} />
                    Retour à la liste
                </button>

                <div className="flex gap-3">
                    <Button onClick={() => UpdateService()} className="p-2 border cursor-pointer border-black rounded-lg hover:bg-gray-100 transition-all">
                        <Edit3 size={18} />
                    </Button>
                    <Button onClick={() => handleDeleteService()} className="p-2 border cursor-pointer border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-all">
                        <Trash2 size={18} />
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">

                    {/* Colonne Gauche : Image et Résumé */}
                    <div className="space-y-6">
                        <div className="aspect-video w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                            <Img
                                src={service?.image}
                                alt={service?.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div>
                            <h1 className="text-3xl font-black text-black leading-tight">
                                {service?.title}
                            </h1>
                            <p className="text-xl text-blue-600 font-medium mt-2">
                                {service?.description}
                            </p>
                        </div>
                    </div>

                    {/* Colonne Droite : Détails complets */}
                    <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">
                            Description détaillée
                        </h2>
                        <div className="prose prose-blue max-w-none">
                            <div
                                className="text-gray-700 leading-relaxed text-lg break-words"
                                dangerouslySetInnerHTML={{ __html: service?.details || "" }}
                            />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

export default ServiceDetails;