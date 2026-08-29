import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import axios from 'axios'
import {
  Briefcase, GraduationCap, Plus, Trash2, Upload, X, Pencil, Eye,
  MapPin, Calendar, ExternalLink, FileBadge2, Building2
} from 'lucide-react'
import api from '../../axios/api'
import { useNotification } from '../../hooks/useNotification'
import Img from '../../ui/Img'

type BackgroundType = 'work' | 'school'


interface Background {
  id: number
  type: BackgroundType
  title: string
  organization: string
  location: string
  period: string
  description: string
  logo?: string,
  skills?: string[] | null
  certifLink?: string | null
  website?: string | null
  createdAt?: string
}

interface FormState {
  type: BackgroundType
  title: string
  organization: string
  location: string
  period: string
  description: string
  skills: string // saisi comme "React, Node.js, TypeScript"
  website: string
}

const EMPTY_FORM: FormState = {
  type: 'work',
  title: '',
  organization: '',
  location: '',
  period: '',
  description: '',
  skills: '',
  website: ''
}

// Normalise skills quelle que soit sa forme réelle en base (tableau, string JSON, null, etc.)
function normalizeSkills(skills: unknown): string[] {
  if (Array.isArray(skills)) return skills.filter((s): s is string => typeof s === 'string')
  if (typeof skills === 'string') {
    try {
      const parsed = JSON.parse(skills)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      // pas du JSON valide : on tente un split par virgule en dernier recours
      return skills.split(',').map(s => s.trim()).filter(Boolean)
    }
  }
  return []
}

function BackgroundManager() {
  const [backgrounds, setBackgrounds] = useState<Background[]>([])
  const [fetching, setFetching] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | BackgroundType>('all')

  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [certifFile, setCertifFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [certifFileName, setCertifFileName] = useState('')

  const [viewingBg, setViewingBg] = useState<Background | null>(null)

  const { addToast, showConfirm } = useNotification()

   const fetchBackgrounds = useCallback(async () => {
    setFetching(true)
    try {
      const res = await api.get('/background/all')
      if (res.data.success) {
        setBackgrounds(res.data.backgrounds || [])
      }
    } catch {
      addToast('error', 'Erreur', 'Impossible de charger les parcours')
    } finally {
      setFetching(false)
    }
  }, [addToast])

  useEffect(() => { fetchBackgrounds() }, [fetchBackgrounds])

  // Reconstruit une URL absolue pour les fichiers stockés localement (certifLink)
  const getStaticUrl = (relativePath?: string | null) => {
    if (!relativePath) return ''
    if (relativePath.startsWith('http')) return relativePath
    const base = api.defaults.baseURL || ''
    try {
      const origin = new URL(base).origin
      return `${origin}${relativePath}`
    } catch {
      return relativePath
    }
  }

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setLogoFile(null)
    setCertifFile(null)
    setLogoPreview('')
    setCertifFileName('')
    setEditingId(null)
  }

  const openCreateForm = () => {
    resetForm()
    setShowForm(true)
  }

  const openEditForm = (bg: Background) => {
    setForm({
      type: bg.type,
      title: bg.title,
      organization: bg.organization,
      location: bg.location,
      period: bg.period,
      description: bg.description,
      skills: normalizeSkills(bg.skills).join(', '),
      website: bg.website || ''
    })
    setLogoPreview(bg.logo || '')
    setCertifFileName(bg.certifLink ? 'Certificat existant' : '')
    setLogoFile(null)
    setCertifFile(null)
    setEditingId(bg.id)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    resetForm()
  }

  const handleLogoChange = (f?: File) => {
    if (!f) return
    setLogoFile(f)
    setLogoPreview(URL.createObjectURL(f))
  }

  const handleCertifChange = (f?: File) => {
    if (!f) return
    setCertifFile(f)
    setCertifFileName(f.name)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!editingId && !logoFile) {
      addToast('error', 'Logo requis', 'Un logo est obligatoire pour créer un parcours')
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append('type', form.type)
    formData.append('title', form.title)
    formData.append('organization', form.organization)
    formData.append('location', form.location)
    formData.append('period', form.period)
    formData.append('description', form.description)
    formData.append('website', form.website)

    const skillsArray = form.skills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
    formData.append('skills', JSON.stringify(skillsArray))

    if (logoFile) formData.append('logo', logoFile)
    if (certifFile) formData.append('certifFile', certifFile)

    try {
      const res = editingId
        ? await api.put(`/background/update/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        : await api.post('/background/add', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })

      if (res.data.success) {
        addToast('success', editingId ? 'Modifié' : 'Ajouté', `Le parcours a été ${editingId ? 'modifié' : 'ajouté'}`)
        closeForm()
        fetchBackgrounds()
      } else {
        addToast('error', 'Erreur', res.data.message)
      }
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined
      addToast('error', 'Erreur', message || "Impossible d'enregistrer le parcours")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (id: number) => {
    showConfirm('Supprimer', 'Voulez-vous vraiment supprimer ce parcours ?', async () => {
      try {
        const res = await api.delete(`/background/destroy/${id}`)
        if (res.data.success) {
          addToast('success', 'Supprimé', 'Le parcours a été supprimé')
          fetchBackgrounds()
        } else {
          addToast('error', 'Erreur', res.data.message)
        }
      } catch {
        addToast('error', 'Erreur', 'Impossible de supprimer')
      }
    })
  }

  const filteredBackgrounds = useMemo(() => {
    const sorted = [...backgrounds].sort((a, b) => b.id - a.id)
    if (filter === 'all') return sorted
    return sorted.filter(bg => bg.type === filter)
  }, [backgrounds, filter])

  return (
    <div className="animate-fade-in mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 size={22} className="text-indigo-600" />
            Parcours
          </h2>
          <p className="text-sm text-gray-500 mt-1">Expériences professionnelles et formations</p>
        </div>
        <button
          onClick={showForm ? closeForm : openCreateForm}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? 'Annuler' : 'Ajouter'}
        </button>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-6">
        {(['all', 'work', 'school'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${filter === f ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
              }`}
          >
            {f === 'all' ? 'Tous' : f === 'work' ? 'Expériences' : 'Formations'}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="animate-scale-in bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-5">{editingId ? 'Modifier le parcours' : 'Nouveau parcours'}</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Logo *</label>
                <label className="block w-full aspect-square border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-indigo-300 transition-colors overflow-hidden relative bg-gray-50">
                  {logoPreview ? (
                    <Img src={logoPreview} className="w-full h-full object-contain p-3" alt="Logo" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <Upload size={28} />
                      <span className="text-xs mt-2 text-center px-2">Logo</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleLogoChange(e.target.files?.[0])}
                  />
                </label>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Type *</label>
                    <div className="flex gap-2">
                      {(['work', 'school'] as const).map(t => (
                        <button
                          type="button"
                          key={t}
                          onClick={() => setForm(prev => ({ ...prev, type: t }))}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${form.type === t
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                          {t === 'work' ? <Briefcase size={16} /> : <GraduationCap size={16} />}
                          {t === 'work' ? 'Travail' : 'École'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Période *</label>
                    <input
                      required
                      value={form.period}
                      onChange={(e) => setForm(prev => ({ ...prev, period: e.target.value }))}
                      placeholder="2022 - 2024"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Titre *</label>
                  <input
                    required
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Développeur Fullstack"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Organisation *</label>
                    <input
                      required
                      value={form.organization}
                      onChange={(e) => setForm(prev => ({ ...prev, organization: e.target.value }))}
                      placeholder="Nom de l'entreprise / école"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Lieu *</label>
                    <input
                      required
                      value={form.location}
                      onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Lomé, Togo"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Décrivez vos missions ou votre formation..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Compétences</label>
                <input
                  value={form.skills}
                  onChange={(e) => setForm(prev => ({ ...prev, skills: e.target.value }))}
                  placeholder="React, Node.js, TypeScript"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                />
                <p className="text-xs text-gray-400 mt-1">Séparez les compétences par des virgules</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Site web</label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => setForm(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Certificat (optionnel)</label>
              <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-indigo-300 transition-colors bg-gray-50">
                <FileBadge2 size={20} className="text-gray-400" />
                <span className="text-sm text-gray-600 truncate">
                  {certifFileName || 'Choisir un fichier (PDF ou image)'}
                </span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => handleCertifChange(e.target.files?.[0])}
                />
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={closeForm} className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                Annuler
              </button>
              <button type="submit" disabled={loading} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors">
                {loading ? 'Enregistrement...' : editingId ? 'Mettre à jour' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal de détails */}
      {viewingBg && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm" onClick={() => setViewingBg(null)} />
          <div className="animate-scale-in relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Détails du parcours</h3>
              <button onClick={() => setViewingBg(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-auto p-6 space-y-5">
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {viewingBg.logo ? (
                    <Img src={viewingBg.logo} className="w-full h-full object-contain p-2" alt={viewingBg.organization} />
                  ) : (
                    <Building2 size={26} className="text-gray-300" />
                  )}
                </div>
                <div>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full mb-1 ${viewingBg.type === 'work' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                    {viewingBg.type === 'work' ? <Briefcase size={12} /> : <GraduationCap size={12} />}
                    {viewingBg.type === 'work' ? 'Expérience' : 'Formation'}
                  </span>
                  <h4 className="text-lg font-bold text-gray-900">{viewingBg.title}</h4>
                  <p className="text-sm text-gray-500">{viewingBg.organization}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5"><Calendar size={14} /> {viewingBg.period}</span>
                <span className="flex items-center gap-1.5"><MapPin size={14} /> {viewingBg.location}</span>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Description</p>
                <p className="text-sm text-gray-700 whitespace-pre-line">{viewingBg.description}</p>
              </div>

              {normalizeSkills(viewingBg.skills).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Compétences</p>
                  <div className="flex flex-wrap gap-1.5">
                    {normalizeSkills(viewingBg.skills).map((skill, i) => (
                      <span key={i} className="text-xs font-medium px-2.5 py-1 bg-gray-50 text-gray-600 rounded-lg border border-gray-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-4 pt-2 border-t border-gray-50">
                {viewingBg.website && (
                  <a href={viewingBg.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-indigo-600 hover:underline">
                    <ExternalLink size={14} /> Site web
                  </a>
                )}
                {viewingBg.certifLink && (
                  <a href={getStaticUrl(viewingBg.certifLink)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-indigo-600 hover:underline">
                    <FileBadge2 size={14} /> Voir le certificat
                  </a>
                )}
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => { setViewingBg(null); openEditForm(viewingBg) }}
                className="px-5 py-2.5 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors flex items-center gap-2"
              >
                <Pencil size={16} /> Modifier
              </button>
              <button onClick={() => setViewingBg(null)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {fetching ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-2xl h-40 animate-pulse" />)}
        </div>
      ) : filteredBackgrounds.length > 0 ? (
        <div className="space-y-4">
          {filteredBackgrounds.map(bg => (
            <div
              key={bg.id}
              className={`bg-white rounded-2xl border-l-4 border border-gray-100 overflow-hidden group hover:shadow-lg transition-all duration-300 ${bg.type === 'work' ? 'border-l-indigo-500' : 'border-l-emerald-500'
                }`}
            >
              <div className="p-5 flex gap-4">
                <div
                  onClick={() => setViewingBg(bg)}
                  className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden cursor-pointer"
                >
                  {bg.logo ? (
                    <Img src={bg.logo} className="w-full h-full object-contain p-1.5" alt={bg.organization} />
                  ) : (
                    <Building2 size={22} className="text-gray-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="cursor-pointer" onClick={() => setViewingBg(bg)}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${bg.type === 'work' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                          {bg.type === 'work' ? <Briefcase size={12} /> : <GraduationCap size={12} />}
                          {bg.type === 'work' ? 'Expérience' : 'Formation'}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900">{bg.title}</h4>
                      <p className="text-sm text-gray-500">{bg.organization}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-100 xl:opacity-0 xl:group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => setViewingBg(bg)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Voir les détails">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => openEditForm(bg)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Modifier">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(bg.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {bg.period}</span>
                    <span className="flex items-center gap-1"><MapPin size={12} /> {bg.location}</span>
                    {bg.website && (
                      <a href={bg.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-500 hover:underline" onClick={(e) => e.stopPropagation()}>
                        <ExternalLink size={12} /> Site web
                      </a>
                    )}
                    {bg.certifLink && (
                      <a href={getStaticUrl(bg.certifLink)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-500 hover:underline" onClick={(e) => e.stopPropagation()}>
                        <FileBadge2 size={12} /> Certificat
                      </a>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mt-3 whitespace-pre-line line-clamp-2">{bg.description}</p>

                  {normalizeSkills(bg.skills).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {normalizeSkills(bg.skills).slice(0, 6).map((skill, i) => (
                        <span key={i} className="text-xs font-medium px-2.5 py-1 bg-gray-50 text-gray-600 rounded-lg border border-gray-100">
                          {skill}
                        </span>
                      ))}
                      {normalizeSkills(bg.skills).length > 6 && (
                        <span className="text-xs font-medium px-2.5 py-1 text-gray-400">
                          +{normalizeSkills(bg.skills).length - 6}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Building2 size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-500 font-medium">Aucun parcours enregistré</p>
          <p className="text-sm text-gray-400 mt-1">Ajoutez vos expériences et formations</p>
        </div>
      )}
    </div>
  )
}

export default BackgroundManager