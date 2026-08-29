import { Plus, Eye, Edit, Trash2, Search, Award, Grid3x3, List } from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'
import api from '../../../axios/api'
import { useNavigate } from 'react-router-dom'
import Button from '../../../ui/Button'
import Img from '../../../ui/Img'
import { useNotification } from '../../../hooks/useNotification'

interface Skills {
    id: number
    name: string
    image: string
    level: string
    description: string
    categoryId: number
}

function SkillsList() {
    const [skillsData, setSkillsData] = useState<Skills[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [levelFilter, setLevelFilter] = useState<string>("all")
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [refresh, setRefresh] = useState<boolean>(false)

    const navigate = useNavigate()
    const { addToast, showConfirm } = useNotification()

    const handleAdd = () => navigate("/competances/add")
    const handleView = (id: number) => navigate(`/competances/${id}`)
    const handleEdit = (id: number) => navigate(`/competances/update/${id}`)

    const triggerRefresh = () => {
        setRefresh(true)
        setTimeout(() => {
            setRefresh(false)
        }, 5000)
    }

    const handleDelete = (id: number, name: string) => {
        showConfirm(
            "Supprimer la compétence", 
            `Voulez-vous vraiment supprimer la compétence "${name}" ? Cette action est irréversible.`, 
            async () => {
                try {
                    const res = await api.delete(`/skills/delete/${id}`)
                    if (res.data.success) {
                        addToast('success', 'Compétence supprimée', 'La compétence a été supprimée avec succès')
                        triggerRefresh()
                    } else {
                        addToast('error', 'Erreur', res.data.message || 'Impossible de supprimer')
                    }
                } catch {
                    addToast('error', 'Erreur', 'Impossible de supprimer la compétence')
                }
            },
            {
                confirmText: 'Supprimer',
                cancelText: 'Annuler',
                type: 'danger'
            }
        )
    }

    useEffect(() => {
        const fetchSkills = async () => {
            setLoading(true)
            try {
                const res = await api.get("/skills/all")
                if (res.data.success) {
                    setSkillsData(res.data.skills || [])
                } else {
                    addToast('error', 'Erreur', res.data.message || 'Impossible de charger les compétences')
                }
            } catch (error) {
                console.error("Erreur: ", error)
                addToast('error', 'Erreur', 'Impossible de charger les compétences')
            } finally {
                setLoading(false)
            }
        }
        fetchSkills()
    }, [refresh, addToast]) // ✅ Correction : addToast ajouté

    // Filtrer les compétences
    const filteredSkills = useMemo(() => {
        return skillsData.filter(skill => {
            const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  skill.description?.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesLevel = levelFilter === 'all' || skill.level.toLowerCase() === levelFilter.toLowerCase()
            return matchesSearch && matchesLevel
        })
    }, [skillsData, searchTerm, levelFilter])

    // Obtenir les niveaux uniques pour le filtre
    const levels = useMemo(() => {
        const uniqueLevels = new Set(skillsData.map(skill => skill.level))
        return Array.from(uniqueLevels)
    }, [skillsData])

    // Obtenir la couleur selon le niveau
    const getLevelColor = (level?: string) => {
        switch (level?.toLowerCase()) {
            case 'debutant':
            case 'débutant':
                return 'bg-blue-100 text-blue-700'
            case 'intermediaire':
            case 'intermédiaire':
                return 'bg-yellow-100 text-yellow-700'
            case 'avance':
            case 'avancé':
                return 'bg-green-100 text-green-700'
            case 'maitrise':
            case 'maîtrise':
                return 'bg-purple-100 text-purple-700'
            case 'expert':
                return 'bg-red-100 text-red-700'
            default:
                return 'bg-gray-100 text-gray-700'
        }
    }

    // Tronquer le texte
    const truncateText = (text: string, maxLength: number = 100) => {
        if (!text || text.length <= maxLength) return text
        return text.substring(0, maxLength) + '...'
    }

    return (
        <div className="p-3 md:p-4 lg:p-6">
            {/* Header avec bouton Ajouter */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4 md:mb-6">
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex w-10 h-10 md:w-12 md:h-12 bg-green-50 rounded-xl items-center justify-center">
                        {/* ✅ Correction */}
                        <Award className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                    </div>
                    <div>
                        <h2 className="text-lg md:text-2xl font-bold text-gray-800">Mes Compétences</h2>
                        <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                            Gérez vos compétences ({skillsData.length} au total)
                        </p>
                    </div>
                </div>
                
                <Button
                    onClick={handleAdd}
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 md:px-5 py-2.5 rounded-lg md:rounded-xl transition-colors shadow-lg shadow-green-100 w-full sm:w-auto"
                >
                    {/* ✅ Correction */}
                    <Plus className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden md:inline">Ajouter une nouvelle compétence</span>
                    <span className="md:hidden">Ajouter</span>
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
                        placeholder="Rechercher une compétence..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg md:rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                    />
                </div>

                {/* Filtre par niveau */}
                <select
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                    className="px-4 py-2.5 border border-gray-200 rounded-lg md:rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none bg-white cursor-pointer"
                >
                    <option value="all">Tous les niveaux</option>
                    {levels.map(level => (
                        <option key={level} value={level}>
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                        </option>
                    ))}
                </select>

                {/* Toggle vue */}
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                        title="Vue grille"
                    >
                        {/* ✅ Correction */}
                        <Grid3x3 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                        title="Vue liste"
                    >
                        {/* ✅ Correction */}
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* État de chargement */}
            {loading ? (
                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4 md:gap-6`}>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="rounded-xl p-4 shadow-sm bg-white">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 bg-gray-200 rounded-lg animate-pulse" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                                </div>
                            </div>
                            <div className="h-3 bg-gray-200 rounded animate-pulse mb-4" />
                            <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
                        </div>
                    ))}
                </div>
            ) : filteredSkills.length > 0 ? (
                <>
                    {/* Vue grille */}
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {filteredSkills.map((skill) => (
                                <div key={skill.id} className="group rounded-xl md:rounded-2xl p-4 md:p-5 shadow-sm bg-white hover:shadow-md transition-all border border-gray-100 flex flex-col">
                                    <div className="flex items-start justify-between mb-3 md:mb-4">
                                        <div className="flex items-center gap-3 md:gap-4 min-w-0">
                                            <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-50 rounded-lg p-2 shrink-0 overflow-hidden">
                                                {skill.image ? (
                                                    <Img src={skill.image} alt={skill.name} className="w-full h-full object-contain" />
                                                ) : (
                                                    <div className="text-gray-400 text-[10px] text-center flex items-center justify-center h-full">
                                                        {/* ✅ Correction */}
                                                        <Award className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-base md:text-lg leading-tight truncate">
                                                    {skill.name}
                                                </h3>
                                                <span className={`inline-block text-[10px] md:text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 ${getLevelColor(skill.level)}`}>
                                                    {skill.level}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 text-xs md:text-sm mb-4 line-clamp-2 flex-1">
                                        {truncateText(skill.description, 80)}
                                    </p>

                                    {/* Barre de boutons d'action */}
                                    <div className="flex items-center gap-1.5 md:gap-2 pt-3 md:pt-4 border-t border-gray-100">
                                        <Button
                                            onClick={() => handleView(skill.id)}
                                            className="flex-1 flex justify-center items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-md md:rounded-lg text-xs md:text-sm transition-colors"
                                            title="Voir détails"
                                        >
                                            {/* ✅ Correction */}
                                            <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" /> 
                                            <span className="hidden sm:inline">Voir</span>
                                        </Button>
                                        <Button
                                            onClick={() => handleEdit(skill.id)}
                                            className="flex-1 flex justify-center items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-md md:rounded-lg text-xs md:text-sm transition-colors"
                                            title="Modifier"
                                        >
                                            {/* ✅ Correction */}
                                            <Edit className="w-3.5 h-3.5 md:w-4 md:h-4" /> 
                                            <span className="hidden sm:inline">Modifier</span>
                                        </Button>
                                        <Button
                                            onClick={() => handleDelete(skill.id, skill.name)}
                                            className="flex-1 flex justify-center items-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 py-2 rounded-md md:rounded-lg text-xs md:text-sm transition-colors"
                                            title="Supprimer"
                                        >
                                            {/* ✅ Correction */}
                                            <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" /> 
                                            <span className="hidden sm:inline">Supprimer</span>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Vue liste */
                        <div className="space-y-2 md:space-y-3">
                            {filteredSkills.map((skill) => (
                                <div key={skill.id} className="group flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border border-gray-100 bg-white hover:border-green-200 hover:shadow-sm transition-all">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-lg p-1.5 md:p-2 shrink-0 overflow-hidden">
                                        {skill.image ? (
                                            <Img src={skill.image} alt={skill.name} className="w-full h-full object-contain" />
                                        ) : (
                                            // ✅ Correction
                                            <Award className="w-5 h-5 md:w-6 md:h-6 text-gray-300" />
                                        )}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-bold text-gray-800 text-sm md:text-base truncate">
                                                {skill.name}
                                            </h3>
                                            <span className={`text-[10px] md:text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${getLevelColor(skill.level)}`}>
                                                {skill.level}
                                            </span>
                                        </div>
                                        <p className="text-xs md:text-sm text-gray-500 truncate mt-0.5">
                                            {truncateText(skill.description, 60)}
                                        </p>
                                    </div>

                                    <div className="flex gap-1.5 md:gap-2 shrink-0">
                                        <Button
                                            onClick={() => handleView(skill.id)}
                                            className="p-1.5 md:p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                            title="Voir détails"
                                        >
                                            {/* ✅ Correction */}
                                            <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                        </Button>
                                        <Button
                                            onClick={() => handleEdit(skill.id)}
                                            className="p-1.5 md:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Modifier"
                                        >
                                            {/* ✅ Correction */}
                                            <Edit className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                        </Button>
                                        <Button
                                            onClick={() => handleDelete(skill.id, skill.name)}
                                            className="p-1.5 md:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                        {searchTerm || levelFilter !== 'all' ? (
                            // ✅ Correction
                            <Search className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
                        ) : (
                            // ✅ Correction
                            <Award className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
                        )}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-700 mb-2">
                        {searchTerm || levelFilter !== 'all' ? 'Aucune compétence trouvée' : 'Aucune compétence'}
                    </h3>
                    <p className="text-sm md:text-base text-gray-500 mb-6 max-w-md px-4">
                        {searchTerm || levelFilter !== 'all' 
                            ? 'Aucun résultat ne correspond à vos critères de recherche.'
                            : 'Commencez par ajouter votre première compétence.'}
                    </p>
                    {!searchTerm && levelFilter === 'all' && (
                        <Button 
                            onClick={handleAdd}
                            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors font-medium"
                        >
                            {/* ✅ Correction */}
                            <Plus className="w-4 h-4 md:w-5 md:h-5" />
                            Ajouter une compétence
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}

export default SkillsList