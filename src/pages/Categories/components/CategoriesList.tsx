import {
    MoreHorizontal,
    Pencil,
    Trash2
} from "lucide-react";
import { useEffect, useState } from "react"
import api from "../../../axios/api"
import Button from "../../../ui/Button"
import CategoriesAdd from "./CategoriesAdd"
import CategoriesEdit from "./CategoriesEdit"

interface Categories {
    id: number,
    name: string,
    icone: string
}

function CategoriesList() {
    const [categories, setCategories] = useState<Categories[] | null>(null)
    const [message, setMessage] = useState<string | "">("")
    const [showForm, setShowForm] = useState<boolean>(false)
    const [showEdit, setShowEdit] = useState<boolean>(false)
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
    const [refresh, setRefresh] = useState(false)

    const triggerRefresh = () => {
        setRefresh(true);
        setTimeout(() => {
            setRefresh(false);
        }, 5000); // 5000 ms = 5 secondes
    };

    useEffect(() => {

        const fetchCategories = async () => {
            try {

                const res = await api.get("/categories/all")
                if (!res.data.success) {
                    return setMessage(res.data.message)
                }

                const data: Categories[] = res.data.categories
                setCategories(data)

            } catch (error) {
                console.log("Erreur: ", error)
            }
        }

        fetchCategories()

    }, [refresh])

    const handleDelete = async (id: number) => {
        try {

            const isConfirm = confirm("Tu vas supprimmer ça hein")
            if(!isConfirm) return

            const res = await api.delete(`/categories/delete/${id}`)
            if(!res.data.success){
                return alert(res.data.message)
            }

            alert(res.data.message)
            triggerRefresh()
            
        } catch (error) {
            console.log("Erreur: ", error)
        }
    }


    return (
        <section className="p-6 bg-white border-b border-gray-100">
            {/* Header de la section */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Catégories</h2>
                    <p className="text-sm text-gray-500">Gérez les thématiques de vos services</p>
                </div>
                <Button onClick={() => setShowForm(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                    Ajouter une catégorie
                </Button>
            </div>

            {message}

            {/* Grille des catégories */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories?.map((cat) => (
                    <div
                        key={cat.id}
                        className="group relative p-5 rounded-2xl border border-gray-100 bg-white hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-50/50 transition-all duration-300"
                    >
                        <div className="flex flex-col items-center text-center gap-4">
                            {/* Icône avec fond coloré dynamique */}
                            <div
                                className="p-4 rounded-xl group-hover:scale-110 transition-transform duration-300 text-3xl text-blue-500"
                                dangerouslySetInnerHTML={{ __html: cat.icone }}
                            />

                            <h3 className="font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">
                                {cat.name}
                            </h3>
                        </div>

                        {/* Actions au survol (Petits boutons Modifier/Supprimer) */}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button onClick={() => {
                                setShowEdit(true)
                                setSelectedCategory(cat.id)
                            }} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors">
                                <Pencil size={14} />
                            </Button>
                            <Button onClick={() => handleDelete(cat.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                                <Trash2 size={14} />
                            </Button>
                        </div>
                    </div>
                ))}

                {/* Bouton "Voir plus" style carte */}
                <Button className="p-5 rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-indigo-300 hover:text-indigo-400 transition-all cursor-pointer">
                    <MoreHorizontal size={24} />
                    <span className="text-sm font-medium">Voir tout</span>
                </Button>


            </div>

            {showForm && (
                <Button onClick={() => setShowForm(false)} className="px-5 py-2 cursor-pointer mt-5 bg-blue-500 hover:bg-blue-600 text-white rounded-[10px]">
                    Fermer
                </Button>
            )}
            {showEdit && (
                <Button onClick={() => setShowEdit(false)} className="px-5 py-2 cursor-pointer mt-5 bg-blue-500 hover:bg-blue-600 text-white rounded-[10px]">
                    Fermer
                </Button>
            )}

            {showForm && (<CategoriesAdd />)}
            {showEdit && (<CategoriesEdit id={selectedCategory} />)}
        </section>
    )
}

export default CategoriesList