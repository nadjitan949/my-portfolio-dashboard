import { Plus, Edit2, Trash2, Code2, Search, Grid3x3, List } from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'
import api from '../../../axios/api'
import Button from '../../../ui/Button'
import { useNavigate } from 'react-router-dom'
import Img from '../../../ui/Img'
import { useNotification } from '../../../hooks/useNotification'

interface Language {
  id: number
  name: string
  icone: string | undefined
}

function LanguagesList() {
  const [languages, setLanguages] = useState<Language[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [refresh, setRefresh] = useState(false)

  const navigate = useNavigate()
  const { addToast, showConfirm } = useNotification()

  const handleAdd = () => navigate("/languages/add")
  const handleEdit = (id: number) => navigate(`/languages/update/${id}`)

  const triggerRefresh = () => {
    setRefresh(true)
    setTimeout(() => {
      setRefresh(false)
    }, 5000)
  }

  useEffect(() => {
    const fetchLanguages = async () => {
      setLoading(true)
      try {
        const res = await api.get("/langages/all")
        if (res.data.success) {
          setLanguages(res.data.languages || [])
        } else {
          addToast('error', 'Erreur', res.data.message || 'Impossible de charger les langages')
        }
      } catch (error) {
        console.error("Erreur: ", error)
        addToast('error', 'Erreur', 'Impossible de charger les langages')
      } finally {
        setLoading(false)
      }
    }
    fetchLanguages()
  }, [refresh, addToast])

  const handleDelete = (id: number, name: string) => {
    showConfirm(
      "Supprimer le langage", 
      `Voulez-vous vraiment supprimer le langage "${name}" ? Cette action est irréversible.`, 
      async () => {
        try {
          const res = await api.delete(`/langages/delete/${id}`)
          if (res.data.success) {
            addToast('success', 'Langage supprimé', 'Le langage a été supprimé avec succès')
            triggerRefresh()
          } else {
            addToast('error', 'Erreur', res.data.message || 'Impossible de supprimer')
          }
        } catch {
          addToast('error', 'Erreur', 'Impossible de supprimer le langage')
        }
      },
      {
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        type: 'danger'
      }
    )
  }

  // Filtrer les langages
  const filteredLanguages = useMemo(() => {
    if (!searchTerm.trim()) return languages
    return languages.filter(lang => 
      lang.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [languages, searchTerm])

  return (
    <section className="w-full bg-white rounded-xl md:rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 md:p-2.5 bg-indigo-100 text-indigo-600 rounded-lg md:rounded-xl">
            <Code2 className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-800">Langages & Tech</h2>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">
              Gérez vos langages et technologies ({languages.length} au total)
            </p>
          </div>
        </div>
        
        <Button 
          onClick={handleAdd} 
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 md:px-5 py-2.5 rounded-lg md:rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-100 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">Ajouter</span>
          <span className="sm:hidden">Ajouter un langage</span>
        </Button>
      </div>

      {/* Barre d'outils */}
      <div className="flex flex-col sm:flex-row gap-3 p-3 md:p-4 border-b border-gray-100">
        {/* Recherche */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher un langage..."
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
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            title="Vue liste"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* État de chargement */}
      {loading ? (
        <div className="p-6 md:p-8">
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg">
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : filteredLanguages.length > 0 ? (
        <>
          {/* Vue grille */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 p-4 md:p-6">
              {filteredLanguages.map((lang) => (
                <div
                  key={lang.id}
                  className="group relative p-4 md:p-5 rounded-xl md:rounded-2xl border border-gray-100 bg-white hover:border-indigo-200 hover:shadow-md transition-all duration-300 flex flex-col items-center"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-xl flex items-center justify-center p-3 mb-3 overflow-hidden">
                    {lang.icone ? (
                      <Img
                        src={lang.icone}
                        alt={lang.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Code2 className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors text-xs md:text-sm text-center truncate w-full">
                    {lang.name}
                  </h3>

                  {/* Actions au survol */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      onClick={() => handleEdit(lang.id)} 
                      className="p-1.5 md:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all bg-white shadow-sm"
                      title="Modifier"
                    >
                      <Edit2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                    </Button>
                    <Button 
                      onClick={() => handleDelete(lang.id, lang.name)} 
                      className="p-1.5 md:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all bg-white shadow-sm"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                    </Button>
                  </div>

                  {/* Actions visibles sur mobile */}
                  <div className="sm:hidden absolute bottom-2 right-2 flex gap-1">
                    <Button 
                      onClick={() => handleEdit(lang.id)} 
                      className="p-1.5 text-blue-600 bg-blue-50 rounded-md"
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button 
                      onClick={() => handleDelete(lang.id, lang.name)} 
                      className="p-1.5 text-red-600 bg-red-50 rounded-md"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Vue liste */
            <div className="space-y-2 p-3 md:p-4">
              {filteredLanguages.map((lang) => (
                <div
                  key={lang.id}
                  className="group flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border border-gray-100 bg-white hover:border-indigo-200 hover:shadow-sm transition-all"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-lg flex items-center justify-center p-2 shrink-0 overflow-hidden">
                    {lang.icone ? (
                      <Img
                        src={lang.icone}
                        alt={lang.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Code2 className="w-5 h-5 md:w-6 md:h-6 text-gray-300" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors text-sm md:text-base truncate">
                      {lang.name}
                    </h3>
                    <p className="text-xs text-gray-400">
                      ID: {lang.id}
                    </p>
                  </div>

                  <div className="flex gap-1.5 md:gap-2 shrink-0">
                    <Button 
                      onClick={() => handleEdit(lang.id)} 
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Modifier"
                    >
                      <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </Button>
                    <Button 
                      onClick={() => handleDelete(lang.id, lang.name)} 
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Supprimer"
                    >
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
        <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center p-4">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            {searchTerm ? (
              <Search className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
            ) : (
              <Code2 className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
            )}
          </div>
          <h3 className="text-lg md:text-xl font-bold text-gray-700 mb-2">
            {searchTerm ? 'Aucun langage trouvé' : 'Aucun langage répertorié'}
          </h3>
          <p className="text-sm md:text-base text-gray-500 mb-6 max-w-md">
            {searchTerm 
              ? `Aucun résultat pour "${searchTerm}". Essayez avec un autre terme.`
              : 'Commencez par ajouter votre premier langage ou technologie.'}
          </p>
          {!searchTerm && (
            <Button 
              onClick={handleAdd}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
              Ajouter un langage
            </Button>
          )}
        </div>
      )}
    </section>
  )
}

export default LanguagesList