import { Plus, Edit2, Trash2, Code2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../../../axios/api'
import Button from '../../../ui/Button'
import { useNavigate } from 'react-router-dom'
import Img from '../../../ui/Img'

interface Language {
  id: number
  name: string
  icone: string | undefined
}

function LanguagesList() {

  const [languages, setLanguages] = useState<Language[] | null>(null)
  const [refresh, setRefresh] = useState(false)

  const navigate = useNavigate()

  const handleAdd = () => navigate("/languages/add")
  const handleEdit = (id: number) => navigate(`/languages/update/${id}`)

  const triggerRefresh = () => {
    setRefresh(true);
    setTimeout(() => {
      setRefresh(false);
    }, 5000)
  }

  useEffect(() => {
    const fetchLanguages = async () => {
      try {

        const res = await api.get("/langages/all")
        if (!res.data.success) return alert(res.data.message)

        const data: Language[] = res.data.languages
        setLanguages(data)

      } catch (error) {
        console.log("Erreur: ", error)
      }
    }

    fetchLanguages()
  }, [refresh])

  const handleDelete = async (id: number) => {
    try {

      const isConfirm = confirm("Vous allez supprimmer")
      if (!isConfirm) return

      const res = await api.delete(`/langages/delete/${id}`)
      if (!res.data.success) return alert(res.data.message)
      alert(res.data.message)
      triggerRefresh()

    } catch (error) {
      console.log("Erreur: ", error)
    }
  }

  return (
    <section className="w-full bg-white rounded-xloverflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
            <Code2 size={20} />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Langages & Tech</h2>
        </div>
        <Button onClick={handleAdd} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all">
          <Plus size={18} />
          Ajouter
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 text-gray-400 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Icône</th>
              <th className="px-6 py-4 font-semibold">Nom du langage</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {languages?.map((lang) => (
              <tr key={lang.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="w-10 h-10 p-2 bg-white border border-gray-100 rounded-lg shadow-sm">
                    <Img
                      src={lang.icone}
                      alt={lang.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-gray-700">{lang.name}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <Button onClick={() => handleEdit(lang.id)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all">
                      <Edit2 size={16} />
                    </Button>
                    <Button onClick={() => handleDelete(lang.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {languages?.length === 0 && (
        <div className="p-10 text-center text-gray-400 text-sm">
          Aucun langage répertorié.
        </div>
      )}
    </section>
  )
}

export default LanguagesList