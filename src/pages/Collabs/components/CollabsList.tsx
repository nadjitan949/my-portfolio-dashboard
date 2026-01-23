import { UserCircle, Plus, Edit3, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../ui/Button'
import { useEffect, useState } from 'react'
import api from '../../../axios/api'

interface Collaborator {
    id: number
    fullname: string
    jobTitle: string
    link: string
}

function CollabsList() {
    
    const [collaborators, setCollaborators] = useState<Collaborator[] | null>(null)
    const [refresh, setRefresh] = useState<boolean>(false)

    const navigate = useNavigate()
    
    const handleAdd = () => navigate("/collabs/add")
    const handleEdit = (id: number) => navigate(`/collabs/update/${id}`)
    
    const triggerRefresh = () => {
        setRefresh(true)
        setTimeout(() => {
            setRefresh(false)
        }, 5000)
    }

    const handleDelete = async (id: number) => {
        try {

            const isConfirm = confirm("Tu vas supprimer même")
            if(!isConfirm) return

            const res = await api.delete(`/collabs/delete/${id}`)
            if(!res.data.success) return alert(res.data.message)
            alert(res.data.message)
        
            triggerRefresh()
            
        } catch (error) {
            console.log("Erreur: ", error)
        }
    }


    useEffect(() => {
        const fetchCollabs = async () => {
            try {

                const res = await api.get("/collabs/all")
                const data: Collaborator[] = res.data.collabs
                setCollaborators(data)
                
            } catch (error) {
                console.log("Erreur: ", error)
            }
        }

        fetchCollabs()
    }, [refresh])

    return (
        <section className="w-full h-full bg-white">
            {/* Header avec bouton Ajouter */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Collaborateurs</h2>
                    <p className="text-sm text-gray-500">Gérez les membres de votre équipe</p>
                </div>
                <Button 
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm font-medium"
                >
                    <Plus size={18} />
                    Ajouter
                </Button>
            </div>

            {/* Grille des collaborateurs */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {collaborators?.map((collab) => (
                    <div 
                        key={collab.id} 
                        className="group relative border border-gray-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-md transition-all bg-white"
                    >
                        <div className="flex flex-col items-center">
                            {/* Avatar */}
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                <UserCircle size={40} strokeWidth={1.5} />
                            </div>

                            {/* Textes */}
                            <h3 className="font-bold text-gray-900 text-center line-clamp-1">{collab.fullname}</h3>
                            <p className="text-sm text-indigo-600 font-medium mb-5">{collab.jobTitle}</p>

                            {/* Actions */}
                            <div className="flex w-full gap-2 pt-4">
                                <Button 
                                    onClick={() => handleEdit(collab.id)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                >
                                    <Edit3 size={16} />
                                    Modifier
                                </Button>
                                <Button 
                                    onClick={() => handleDelete(collab.id)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                    Supprimer
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {collaborators?.length === 0 && (
                <div className="p-20 text-center text-gray-400">
                    Aucun collaborateur trouvé.
                </div>
            )}
        </section>
    );
}

export default CollabsList;