import { Plus, ExternalLink } from "lucide-react"
import Button from "../../../ui/Button"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import api from "../../../axios/api"
import Img from "../../../ui/Img"


interface Service {
    id: number
    title: string
    image: string
    desciption: string
    details: string
}

function ServiceList() {

    const [services, setServices] = useState<Service[] | null>(null)
    const [messages, setMessages] = useState<string | "">("")
    const [refresh, setRefresh] = useState(false)

    const navigate = useNavigate()
    const DetailService = (id: number) => navigate(`/services/${id}`)
    const AddService = () => navigate("/add-service")
    const UpdateService = (id: number) => navigate(`/update-service/${id}`)

    const triggerRefresh = () => {
        setRefresh(true);
        setTimeout(() => {
            setRefresh(false);
        }, 5000); // 5000 ms = 5 secondes
    }

    useEffect(() => {
        const allServices = async () => {

            try {

                const res = await api.get("/services/all")
                if (!res.data.success) {
                    return setMessages(res.data.message)
                }

                const data: Service[] = res.data.services
                setServices(data)

            } catch (error) {
                console.log("Une erreur s'est produite: ", error)
            }

        }

        allServices()

    }, [refresh])

    const handleDeleteService = async (id: number) => {
        try {

            const isConfirme = confirm("Tu vas supprimmer hein ?")
            if(!isConfirme) return

            const res = await api.delete(`/services/delete/${id}`)
            if(!res.data.success){
                return setMessages(res.data.message)
            }

            alert(res.data.message)
            triggerRefresh()
            
        } catch (error) {
            console.log("Erreur: ", error)
        }
    }

    return (
        <section className="w-full flex flex-col gap-6 p-2">
            {/* Header de la section avec bouton Ajouter */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-black">Mes Services</h2>
                    <p className="text-gray-500 text-sm">Gérez les services que vous proposez.</p>
                </div>

                <Button onClick={AddService} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300 font-medium">
                    <Plus size={20} />
                    Ajouter un service
                </Button>
            </div>

            {messages}

            {/* Grille de services */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-h-160 overflow-y-auto">
                {services?.map((service) => (
                    <div
                        key={service.id}
                        className="group border-black rounded-2xl overflow-hidden bg-white shadow hover:shadow-xl transition-all duration-300"
                    >
                        {/* Image du service */}
                        <div className="h-48 overflow-hidden">
                            <Img
                                src={service.image}
                                alt={service.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>

                        {/* Contenu */}
                        <div className="p-5">
                            <h3 className="text-lg font-bold text-black group-hover:text-blue-600 transition-colors">
                                {service.title}
                            </h3>
                            <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                                {service.desciption}
                            </p>

                            <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center">
                                <Button onClick={() => DetailService(service.id)} className="text-sm font-semibold text-blue-500 hover:text-blue-600 flex items-center gap-1 transition-colors">
                                    Détails <ExternalLink size={14} />
                                </Button>
                                <div className="flex gap-2">
                                    <Button onClick={() => handleDeleteService(service.id)} className="text-xs px-2 py-1 border border-red-500 rounded hover:bg-red-500 text-red-500 hover:text-white transition-colors">Suppimmer</Button>
                                    <Button onClick={() => UpdateService(service.id)} className="text-xs px-2 py-1 border border-blue-500 rounded hover:bg-blue-500 text-blue-500 hover:text-white transition-colors">Modifier</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default ServiceList;