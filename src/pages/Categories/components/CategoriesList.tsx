import {
    Pencil,
    Trash2,
    Plus,
    X,
    FolderOpen,
    Search,
    Grid3x3,
    List
} from "lucide-react";
import { useEffect, useState, useMemo, useRef } from "react"
import api from "../../../axios/api"
import Button from "../../../ui/Button"
import CategoriesAdd from "./CategoriesAdd"
import CategoriesEdit from "./CategoriesEdit"
import { useNotification } from "../../../hooks/useNotification"

interface Categories {
    id: number,
    name: string,
    icone: string
}

function CategoriesList() {
    const [categories, setCategories] = useState<Categories[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [showForm, setShowForm] = useState<boolean>(false)
    const [showEdit, setShowEdit] = useState<boolean>(false)
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [refresh, setRefresh] = useState(false)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const formRef = useRef<HTMLDivElement>(null)
    const editRef = useRef<HTMLDivElement>(null)
    const { addToast, showConfirm } = useNotification()

    const triggerRefresh = () => {
        setRefresh(true);
        setTimeout(() => {
            setRefresh(false);
        }, 5000);
    };

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true)
            try {
                const res = await api.get("/categories/all")
                if (!res.data.success) {
                    addToast('error', 'Erreur', res.data.message || 'Impossible de charger les catégories')
                    return
                }
                const data: Categories[] = res.data.categories
                setCategories(data)
            } catch (error) {
                console.error("Erreur: ", error)
                addToast('error', 'Erreur', 'Impossible de charger les catégories')
            } finally {
                setLoading(false)
            }
        }

        fetchCategories()
    }, [refresh, addToast]) // ✅ Ajouter addToast

    // Filtrer les catégories
    const filteredCategories = useMemo(() => {
        if (!searchTerm.trim()) return categories
        return categories.filter(cat => 
            cat.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [categories, searchTerm])

    // Scroll vers le formulaire quand il s'ouvre
    useEffect(() => {
        if (showForm && formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
        if (showEdit && editRef.current) {
            editRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }, [showForm, showEdit])

    const handleDelete = (id: number, name: string) => {
        showConfirm(
            "Supprimer la catégorie", 
            `Voulez-vous vraiment supprimer la catégorie "${name}" ? Cette action est irréversible.`, 
            async () => {
                try {
                    const res = await api.delete(`/categories/delete/${id}`)
                    if (res.data.success) {
                        addToast('success', 'Catégorie supprimée', 'La catégorie a été supprimée avec succès')
                        triggerRefresh()
                    } else {
                        addToast('error', 'Erreur', res.data.message || 'Impossible de supprimer')
                    }
                } catch {
                    addToast('error', 'Erreur', 'Impossible de supprimer la catégorie')
                }
            },
            {
                confirmText: 'Supprimer',
                cancelText: 'Annuler',
                type: 'danger'
            }
        )
    }

    const handleEdit = (id: number) => {
        setSelectedCategory(id)
        setShowEdit(true)
        setShowForm(false)
    }

    const handleAdd = () => {
        setShowForm(true)
        setShowEdit(false)
    }

    const closeForm = () => {
        setShowForm(false)
    }

    const closeEdit = () => {
        setShowEdit(false)
        setSelectedCategory(null)
    }

    return (
        <section className="p-3 md:p-4 lg:p-6 bg-white rounded-xl md:rounded-2xl border border-gray-100">
            {/* Header de la section */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4 md:mb-6">
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex w-10 h-10 md:w-12 md:h-12 bg-indigo-50 rounded-xl items-center justify-center">
                        {/* ✅ Correction */}
                        <FolderOpen className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-gray-800">Catégories</h2>
                        <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                            Gérez les thématiques de vos services ({categories.length} au total)
                        </p>
                    </div>
                </div>
                
                <Button 
                    onClick={handleAdd} 
                    className="flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg md:rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 w-full sm:w-auto"
                >
                    {/* ✅ Correction */}
                    <Plus className="w-4 h-4 md:w-5 md:h-5" />
                    Ajouter une catégorie
                </Button>
            </div>

            {/* Barre d'outils */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4 md:mb-6">
                {/* Recherche */}
                <div className="relative flex-1">
                    {/* ✅ Correction */}
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Rechercher une catégorie..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg md:rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                </div>

                {/* Toggle vue */}
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        title="Vue grille"
                    >
                        {/* ✅ Correction */}
                        <Grid3x3 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        title="Vue liste"
                    >
                        {/* ✅ Correction */}
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* État de chargement */}
            {loading ? (
                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'} gap-4`}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="p-5 rounded-2xl border border-gray-100 bg-white">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-gray-200 rounded-xl animate-pulse" />
                                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredCategories.length > 0 ? (
                <>
                    {/* Vue grille */}
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                            {filteredCategories.map((cat) => (
                                <div
                                    key={cat.id}
                                    className="group relative p-3 md:p-5 rounded-xl md:rounded-2xl border border-gray-100 bg-white hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-50/50 transition-all duration-300"
                                >
                                    <div className="flex flex-col items-center text-center gap-2 md:gap-4">
                                        {/* Icône avec fond coloré dynamique */}
                                        <div className="p-3 md:p-4 rounded-lg md:rounded-xl bg-gray-50 group-hover:bg-indigo-50 group-hover:scale-110 transition-all duration-300 text-2xl md:text-3xl text-blue-500 w-full flex items-center justify-center min-h-15 md:min-h-20 overflow-hidden">
                                            {cat.icone ? (
                                                <div dangerouslySetInnerHTML={{ __html: cat.icone }} />
                                            ) : (
                                                // ✅ Correction
                                                <FolderOpen className="w-6 h-6 md:w-8 md:h-8 text-gray-300" />
                                            )}
                                        </div>

                                        <h3 className="font-bold text-gray-700 group-hover:text-indigo-600 transition-colors text-xs md:text-sm line-clamp-2">
                                            {cat.name}
                                        </h3>
                                    </div>

                                    {/* Actions au survol */}
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button 
                                            onClick={() => handleEdit(cat.id)} 
                                            className="p-1.5 md:p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors bg-white shadow-sm"
                                            title="Modifier"
                                        >
                                            {/* ✅ Correction */}
                                            <Pencil className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                        </Button>
                                        <Button 
                                            onClick={() => handleDelete(cat.id, cat.name)} 
                                            className="p-1.5 md:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors bg-white shadow-sm"
                                            title="Supprimer"
                                        >
                                            {/* ✅ Correction */}
                                            <Trash2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                        </Button>
                                    </div>

                                    {/* Actions visibles sur mobile */}
                                    <div className="sm:hidden absolute bottom-2 right-2 flex gap-1">
                                        <Button 
                                            onClick={() => handleEdit(cat.id)} 
                                            className="p-1.5 text-indigo-600 bg-indigo-50 rounded-md"
                                        >
                                            {/* ✅ Correction */}
                                            <Pencil className="w-3 h-3" />
                                        </Button>
                                        <Button 
                                            onClick={() => handleDelete(cat.id, cat.name)} 
                                            className="p-1.5 text-red-600 bg-red-50 rounded-md"
                                        >
                                            {/* ✅ Correction */}
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Vue liste */
                        <div className="space-y-2">
                            {filteredCategories.map((cat) => (
                                <div
                                    key={cat.id}
                                    className="group flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border border-gray-100 bg-white hover:border-indigo-200 hover:shadow-sm transition-all duration-300"
                                >
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gray-50 group-hover:bg-indigo-50 flex items-center justify-center shrink-0 overflow-hidden">
                                        {cat.icone ? (
                                            <div dangerouslySetInnerHTML={{ __html: cat.icone }} className="text-xl md:text-2xl" />
                                        ) : (
                                            // ✅ Correction
                                            <FolderOpen className="w-5 h-5 md:w-6 md:h-6 text-gray-300" />
                                        )}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-700 group-hover:text-indigo-600 transition-colors text-sm md:text-base truncate">
                                            {cat.name}
                                        </h3>
                                        <p className="text-xs text-gray-400">
                                            ID: {cat.id}
                                        </p>
                                    </div>

                                    <div className="flex gap-2 shrink-0">
                                        <Button 
                                            onClick={() => handleEdit(cat.id)} 
                                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            title="Modifier"
                                        >
                                            {/* ✅ Correction */}
                                            <Pencil className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                        </Button>
                                        <Button 
                                            onClick={() => handleDelete(cat.id, cat.name)} 
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Supprimer"
                                        >
                                            {/* ✅ Correction */}
                                            <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                /* État vide */
                <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        {searchTerm ? (
                            // ✅ Correction
                            <Search className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
                        ) : (
                            // ✅ Correction
                            <FolderOpen className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
                        )}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-700 mb-2">
                        {searchTerm ? 'Aucune catégorie trouvée' : 'Aucune catégorie'}
                    </h3>
                    <p className="text-sm md:text-base text-gray-500 mb-6 max-w-md px-4">
                        {searchTerm 
                            ? `Aucun résultat pour "${searchTerm}". Essayez avec un autre terme.`
                            : 'Commencez par ajouter votre première catégorie.'}
                    </p>
                    {!searchTerm && (
                        <Button 
                            onClick={handleAdd}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-medium"
                        >
                            {/* ✅ Correction */}
                            <Plus className="w-4 h-4 md:w-5 md:h-5" />
                            Ajouter une catégorie
                        </Button>
                    )}
                </div>
            )}

            {/* Formulaire d'ajout */}
            {showForm && (
                <div ref={formRef} className="mt-6 md:mt-8">
                    <div className="flex justify-end mb-3">
                        <Button 
                            onClick={closeForm} 
                            className="px-4 py-2 cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg flex items-center gap-2 text-sm transition-colors"
                        >
                            {/* ✅ Correction */}
                            <X className="w-3.5 h-3.5" />
                            Fermer
                        </Button>
                    </div>
                    <CategoriesAdd />
                </div>
            )}

            {/* Formulaire d'édition */}
            {showEdit && selectedCategory && (
                <div ref={editRef} className="mt-6 md:mt-8">
                    <div className="flex justify-end mb-3">
                        <Button 
                            onClick={closeEdit} 
                            className="px-4 py-2 cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg flex items-center gap-2 text-sm transition-colors"
                        >
                            {/* ✅ Correction */}
                            <X className="w-3.5 h-3.5" />
                            Fermer
                        </Button>
                    </div>
                    <CategoriesEdit id={selectedCategory} />
                </div>
            )}
        </section>
    )
}

export default CategoriesList