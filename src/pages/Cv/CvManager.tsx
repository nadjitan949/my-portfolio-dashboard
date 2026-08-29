import { useEffect, useState, useRef, useCallback } from 'react'
import { FileText, Upload, Download, Trash2, File, X, Check, Loader2 } from 'lucide-react'
import api from '../../axios/api'
import { useNotification } from '../../hooks/useNotification'
import axios from 'axios'

interface CvData {
  id: number
  url: string
  path: string
  filename: string
  createdAt: string
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 Mo

function CvManager() {
  const [currentCv, setCurrentCv] = useState<CvData | null>(null)
  const [currentCvPreviewUrl, setCurrentCvPreviewUrl] = useState<string>('')
  const [loadingCurrentPreview, setLoadingCurrentPreview] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addToast, showConfirm } = useNotification()

  const fetchCv = useCallback(async () => {
    setFetching(true)
    try {
      const res = await api.get('/cv/expose')
      if (res.data.success) {
        setCurrentCv(res.data.lastCv)
      }
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined
      if (status === 404) {
        setCurrentCv(null)
      } else {
        addToast('error', 'Erreur', 'Impossible de charger le CV')
      }
    } finally {
      setFetching(false)
    }
  }, [addToast])

  useEffect(() => { fetchCv() }, [fetchCv])

  // Charge la prévisualisation du CV actuellement enregistré
  useEffect(() => {
    let objectUrl = ''
    const loadCurrentPreview = async () => {
      if (!currentCv) {
        setCurrentCvPreviewUrl('')
        return
      }
      setLoadingCurrentPreview(true)
      try {
        const res = await api.get('/cv/download', { responseType: 'blob' })
        objectUrl = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
        setCurrentCvPreviewUrl(objectUrl)
      } catch {
        setCurrentCvPreviewUrl('')
      } finally {
        setLoadingCurrentPreview(false)
      }
    }
    loadCurrentPreview()
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [currentCv?.id, addToast])

  // Nettoyage des URLs blob au démontage
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      if (currentCvPreviewUrl) URL.revokeObjectURL(currentCvPreviewUrl)
    }
  }, [previewUrl, currentCvPreviewUrl])

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    
    // Vérifier le type
    if (file.type !== 'application/pdf') {
      addToast('error', 'Format invalide', 'Seuls les fichiers PDF sont acceptés')
      return
    }
    
    // Vérifier la taille
    if (file.size > MAX_FILE_SIZE) {
      addToast('error', 'Fichier trop volumineux', 'La taille maximale autorisée est de 10 Mo')
      return
    }
    
    // Nettoyer l'ancienne preview
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    
    setPreviewFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleUploadConfirm = async () => {
    if (!previewFile) return
    
    setLoading(true)
    const formData = new FormData()
    formData.append('cv', previewFile)
    
    try {
      const res = await api.post('/cv/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      if (res.data.success) {
        addToast('success', 'CV uploadé', 'Le fichier a été ajouté avec succès')
        cancelPreview()
        fetchCv()
      } else {
        addToast('error', 'Erreur', res.data.message || "Échec de l'upload")
      }
    } catch {
      addToast('error', 'Erreur', "Impossible d'uploader le fichier")
    } finally {
      setLoading(false)
    }
  }

  const cancelPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewFile(null)
    setPreviewUrl('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDelete = () => {
    if (!currentCv) return
    
    showConfirm(
      'Supprimer le CV', 
      `Voulez-vous vraiment supprimer "${currentCv.filename}" ? Cette action est irréversible.`, 
      async () => {
        try {
          const res = await api.delete(`/cv/delete/${currentCv.id}`)
          if (res.data.success) {
            addToast('success', 'Supprimé', 'Le CV a été supprimé')
            setCurrentCv(null)
            setCurrentCvPreviewUrl('')
          } else {
            addToast('error', 'Erreur', res.data.message || 'Impossible de supprimer')
          }
        } catch {
          addToast('error', 'Erreur', 'Impossible de supprimer le fichier')
        }
      },
      {
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        type: 'danger'
      }
    )
  }

  const handleDownload = async () => {
    try {
      const res = await api.get('/cv/download', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', currentCv?.filename || 'CV.pdf')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      addToast('success', 'Téléchargement', 'Le CV a été téléchargé')
    } catch {
      addToast('error', 'Erreur', 'Impossible de télécharger le fichier')
    }
  }

  // Formater la date
  const formatDate = (date?: string) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  // Formater la taille
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="animate-fade-in max-w-5xl mx-auto p-3 md:p-4 lg:p-6">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
          CV & Documents
        </h2>
        <p className="text-xs md:text-sm text-gray-500 mt-1">Gérez votre CV professionnel</p>
      </div>

      {/* Modal de prévisualisation */}
      {previewFile && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-3 md:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={cancelPreview} />
          <div className="animate-scale-in relative bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 md:p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm md:text-base">Prévisualisation</h3>
              <button onClick={cancelPreview} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-4 md:p-5">
              <div className="bg-gray-50 rounded-lg md:rounded-xl p-3 md:p-4 mb-4 flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-lg md:rounded-xl flex items-center justify-center shrink-0">
                  <File className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm md:text-base truncate">{previewFile.name}</p>
                  <p className="text-xs md:text-sm text-gray-500">{formatFileSize(previewFile.size)}</p>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg md:rounded-xl overflow-hidden h-64 md:h-96">
                <iframe src={previewUrl} className="w-full h-full" title="PDF Preview" />
              </div>
            </div>
            
            <div className="p-4 md:p-5 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-2 md:gap-3">
              <button 
                onClick={cancelPreview} 
                className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg md:rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleUploadConfirm} 
                disabled={loading} 
                className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg md:rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Upload...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 md:w-5 md:h-5" />
                    Valider l'upload
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zone d'upload */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files) }}
        className={`mb-4 md:mb-6 border-2 border-dashed rounded-xl md:rounded-2xl p-6 md:p-10 text-center transition-all cursor-pointer ${
          dragOver 
            ? 'border-indigo-400 bg-indigo-50 scale-[1.01]' 
            : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50'
        }`}
      >
        <input 
          ref={fileInputRef} 
          type="file" 
          accept=".pdf,application/pdf" 
          className="hidden" 
          onChange={(e) => handleFileSelect(e.target.files)} 
        />
        <Upload className={`w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 ${dragOver ? 'text-indigo-500' : 'text-gray-300'}`} />
        <p className="text-sm md:text-base font-medium text-gray-700">
          {dragOver ? 'Déposez le fichier ici...' : 'Cliquez ou glissez-déposez un PDF'}
        </p>
        <p className="text-xs md:text-sm text-gray-400 mt-2">Format PDF uniquement • Max 10 Mo</p>
        <p className="text-xs text-gray-400 mt-1">(remplace le CV existant s'il y en a un)</p>
      </div>

      <h3 className="text-xs md:text-sm font-bold text-gray-700 mb-2 md:mb-3">CV actuellement enregistré</h3>

      {/* État de chargement */}
      {fetching ? (
        <div className="bg-white rounded-xl p-4 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-200 rounded-lg" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        </div>
      ) : currentCv ? (
        <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="p-3 md:p-4 flex items-center gap-3 md:gap-4 border-b border-gray-50">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
              <File className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-semibold text-gray-900 truncate">{currentCv.filename}</p>
              <p className="text-[10px] md:text-xs text-gray-400">
                {formatDate(currentCv.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button 
                onClick={handleDownload} 
                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" 
                title="Télécharger"
              >
                <Download className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button 
                onClick={handleDelete} 
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
          
          <div className="p-3 md:p-4">
            {loadingCurrentPreview ? (
              <div className="h-64 md:h-96 flex items-center justify-center bg-gray-50 rounded-xl">
                <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin text-indigo-500" />
              </div>
            ) : currentCvPreviewUrl ? (
              <div className="border border-gray-200 rounded-lg md:rounded-xl overflow-hidden h-64 md:h-96">
                <iframe src={currentCvPreviewUrl} className="w-full h-full" title="Aperçu CV actuel" />
              </div>
            ) : (
              <div className="h-32 md:h-40 flex items-center justify-center bg-gray-50 rounded-lg md:rounded-xl text-xs md:text-sm text-gray-400">
                Impossible de charger l'aperçu
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-10 md:p-16 text-center">
          <FileText className="w-10 h-10 md:w-12 md:h-12 mx-auto text-gray-200 mb-3 md:mb-4" />
          <p className="text-sm md:text-base text-gray-500 font-medium">Aucun CV uploadé</p>
          <p className="text-xs md:text-sm text-gray-400 mt-1">Ajoutez votre CV pour commencer</p>
        </div>
      )}
    </div>
  )
}

export default CvManager