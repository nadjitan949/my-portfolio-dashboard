import { useState } from "react"
import type { FormEvent, ChangeEvent } from "react"
import { Save, FolderPlus, Type, Image as ImageIcon, Loader2, X } from "lucide-react"
import Button from "../../../ui/Button"
import Input from "../../../ui/Input"
import api from "../../../axios/api"
import { useNotification } from "../../../hooks/useNotification"

function CategoriesAdd() {
    const [loading, setLoading] = useState(false)
    const [nom, setNom] = useState<string>("")
    const [icone, setIcone] = useState<string>("")
    const [errors, setErrors] = useState<{ nom?: string; icone?: string }>({})
    const { addToast } = useNotification()

    // Validation en temps réel
    const validateField = (field: 'nom' | 'icone', value: string) => {
        const newErrors = { ...errors }
        
        if (field === 'nom') {
            if (!value.trim()) {
                newErrors.nom = "Le nom de la catégorie est obligatoire"
            } else if (value.trim().length < 3) {
                newErrors.nom = "Le nom doit contenir au moins 3 caractères"
            } else if (value.trim().length > 50) {
                newErrors.nom = "Le nom ne doit pas dépasser 50 caractères"
            } else {
                delete newErrors.nom
            }
        }
        
        if (field === 'icone') {
            if (value && !/^[a-zA-Z0-9-_]+$/.test(value)) {
                newErrors.icone = "L'icône ne doit contenir que des lettres, chiffres, tirets et underscores"
            } else {
                delete newErrors.icone
            }
        }
        
        setErrors(newErrors)
    }

    const handleNomChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setNom(value)
        validateField('nom', value)
    }

    const handleIconeChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setIcone(value)
        validateField('icone', value)
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        
        // Validation finale
        const finalErrors: { nom?: string; icone?: string } = {}
        if (!nom.trim()) {
            finalErrors.nom = "Le nom de la catégorie est obligatoire"
        } else if (nom.trim().length < 3) {
            finalErrors.nom = "Le nom doit contenir au moins 3 caractères"
        }
        
        if (icone && !/^[a-zA-Z0-9-_]+$/.test(icone)) {
            finalErrors.icone = "L'icône ne doit contenir que des lettres, chiffres, tirets et underscores"
        }
        
        if (Object.keys(finalErrors).length > 0) {
            setErrors(finalErrors)
            return
        }

        setLoading(true)
        try {
            const res = await api.post("/categories/add", {
                name: nom.trim(),
                icone: icone.trim() || undefined
            })

            if (res.data.success) {
                addToast('success', 'Catégorie créée', 'La catégorie a été créée avec succès')
                setNom("")
                setIcone("")
                setErrors({})
            } else {
                addToast('error', 'Erreur', res.data.message || 'Impossible de créer la catégorie')
            }
        } catch {
            addToast('error', 'Erreur', 'Impossible de créer la catégorie')
        } finally {
            setLoading(false)
        }
    }

    const handleReset = () => {
        setNom("")
        setIcone("")
        setErrors({})
    }

    return (
        <section className="w-full max-w-2xl mx-auto bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-2 md:mt-5">
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-gray-50/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                        {/* ✅ Correction : Utiliser w-* et h-* au lieu de size */}
                        <FolderPlus className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-gray-800">
                            Nouvelle Catégorie
                        </h2>
                        <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                            Créez une nouvelle catégorie pour vos services
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 md:p-6 lg:p-8 space-y-5 md:space-y-6">
                {/* Champ Nom */}
                <div className="space-y-2">
                    <label className="text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                        {/* ✅ Correction : Utiliser w-* et h-* */}
                        <Type className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
                        Nom de la catégorie
                        <span className="text-red-500">*</span>
                    </label>
                    <Input
                        value={nom}
                        onChange={handleNomChange}
                        placeholder="Ex: Développement Web"
                        className={`w-full p-2.5 md:p-3 px-4 md:px-5 border rounded-lg md:rounded-[10px] focus:outline-none focus:ring-2 transition-all text-sm md:text-base ${
                            errors.nom 
                                ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                                : 'border-gray-300 focus:ring-indigo-500/20 focus:border-indigo-500'
                        }`}
                        maxLength={50}
                    />
                    <div className="flex justify-between items-center">
                        {errors.nom ? (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                                {/* ✅ Correction */}
                                <X className="w-3 h-3" />
                                {errors.nom}
                            </p>
                        ) : (
                            <p className="text-xs text-gray-400">
                                Le nom doit contenir entre 3 et 50 caractères
                            </p>
                        )}
                        <span className="text-xs text-gray-400 shrink-0 ml-2">
                            {nom.length}/50
                        </span>
                    </div>
                </div>

                {/* Champ Icône */}
                <div className="space-y-2">
                    <label className="text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                        {/* ✅ Correction */}
                        <ImageIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
                        Icône
                        <span className="text-xs font-normal text-gray-400 normal-case">(optionnel)</span>
                    </label>
                    <Input
                        value={icone}
                        onChange={handleIconeChange}
                        placeholder="Ex: code, design, marketing"
                        className={`w-full p-2.5 md:p-3 px-4 md:px-5 border rounded-lg md:rounded-[10px] focus:outline-none focus:ring-2 transition-all text-sm md:text-base ${
                            errors.icone 
                                ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                                : 'border-gray-300 focus:ring-indigo-500/20 focus:border-indigo-500'
                        }`}
                    />
                    <div className="flex justify-between items-center">
                        {errors.icone ? (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                                {/* ✅ Correction */}
                                <X className="w-3 h-3" />
                                {errors.icone}
                            </p>
                        ) : (
                            <p className="text-xs text-gray-400">
                                Nom de l'icône Lucide (sans l'extension)
                            </p>
                        )}
                        {icone && !errors.icone && (
                            <span className="text-xs text-green-500 shrink-0 ml-2">
                                ✓ Icône valide
                            </span>
                        )}
                    </div>
                </div>

                {/* Aperçu */}
                {(nom || icone) && (
                    <div className="bg-gray-50 rounded-lg md:rounded-xl p-3 md:p-4 border border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            Aperçu
                        </p>
                        <div className="flex items-center gap-3">
                            {icone ? (
                                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                                    <span className="text-indigo-600 font-bold text-sm">
                                        {icone.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            ) : (
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <span className="text-gray-400 text-sm">?</span>
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-semibold text-gray-800">
                                    {nom || "Nom de la catégorie"}
                                </p>
                                {icone && (
                                    <p className="text-xs text-gray-500">
                                        Icône : {icone}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer / Boutons */}
                <div className="pt-4 md:pt-6 border-t border-gray-50 flex flex-col sm:flex-row gap-3 sm:justify-end">
                    {(nom || icone) && (
                        <Button
                            type="button"
                            onClick={handleReset}
                            className="px-4 md:px-6 py-2.5 md:py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 font-semibold rounded-lg md:rounded-xl transition-all text-sm md:text-base"
                        >
                            Réinitialiser
                        </Button>
                    )}
                    
                    <Button
                        type="submit"
                        disabled={loading || !nom.trim() || Object.keys(errors).length > 0}
                        className="flex items-center justify-center gap-2 px-6 md:px-10 py-2.5 md:py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg md:rounded-xl shadow-lg shadow-indigo-100 transition-all text-sm md:text-base"
                    >
                        {loading ? (
                            <>
                                {/* ✅ Correction */}
                                <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                                Création...
                            </>
                        ) : (
                            <>
                                {/* ✅ Correction */}
                                <Save className="w-4 h-4 md:w-5 md:h-5" />
                                Enregistrer
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </section>
    )
}

export default CategoriesAdd