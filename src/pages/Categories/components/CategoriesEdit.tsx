import { useEffect, useState } from "react"
import {
    Save,
} from "lucide-react"
import Button from "../../../ui/Button"
import Input from "../../../ui/Input"
import api from "../../../axios/api"

interface CategoriesEditProps {
    id: number | null
}


function CategoriesEdit({ id }: CategoriesEditProps) {
    const [loading, setLoading] = useState(false)
    const [nom, setNom] = useState<string>("")
    const [icone, setIcone] = useState<string>("")

    useEffect(() => {

        const detailsCategory = async () => {
            try {

                const res = await api.get(`/categories/details/${id}`)
                if (!res.data.success) {
                    return alert(res.data.message)
                }

                setNom(res.data.category.name)
                setIcone(res.data.category.icone)

            } catch (error) {
                console.log("Erreur: ", error)
            }
        }

        detailsCategory()

    }, [id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {

            const res = await api.put(`/categories/update/${id}`,
                {
                    name: nom,
                    icone: icone
                }
            )

            if (!res.data.message) {
                return alert(res.data.message)
            }

            alert(res.data.message)

        } catch (error) {
            console.log("Erreur: ", error)
        }
    }

    return (
        <section className="w-250 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-5">
            {/* Header */}
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-800">Mise a jour Catégorie</h2>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
                {/* Champ Nom */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Nom de la catégorie
                    </label>
                    <Input
                        value={nom}
                        onChange={(e) => setNom(e.target.value)}
                        className="w-full p-2 px-5 border border-gray-300 rounded-[10px] focus:outline-1"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Icone
                    </label>

                    <Input
                        value={icone}
                        onChange={(e) => setIcone(e.target.value)}
                        className="w-full p-2 px-5 border border-gray-300 rounded-[10px] focus:outline-1"
                    />
                </div>

                {/* Footer / Bouton */}
                <div className="pt-6 border-t border-gray-50 flex justify-end">
                    <Button
                        type="submit"
                        disabled={loading || !nom}
                        className="flex items-center gap-2 px-10 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all disabled:opacity-50"
                    >
                        {loading ? "Création..." : (
                            <>
                                <Save size={18} />
                                Enregistrer
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </section>
    )
}

export default CategoriesEdit