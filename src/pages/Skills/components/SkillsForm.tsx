import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Upload, X, Save, Award, AlignLeft } from 'lucide-react'
import api from '../../../axios/api'
import Input from '../../../ui/Input'
import Button from '../../../ui/Button'
import { useNavigate, useParams } from 'react-router-dom'

interface Category {
    id: number
    name: string
}

interface Image {
    url: string
    public_id: string
}

interface Skills {
    id: number
    name: string
    image: Image
    level: string
    description: string
    categoryId: number
}

function SkillsForm() {
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState('')
    const [level, setLevel] = useState('debutant')
    const [description, setDescription] = useState('')

    const [imageFile, setImageFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [categorie, setCategories] = useState<Category[] | null>(null)
    const [selectedCategory, setSelectedCategory] = useState<number>(0)

    const navigate = useNavigate()
    const goBack = () => navigate(-1)

    const { id } = useParams()
    const isEditMode = Boolean(id)

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file);
            const url = URL.createObjectURL(file)
            setPreviewUrl(url);
        }
    };

    const clearImage = () => {
        setImageFile(null)
        setPreviewUrl(null)
    }

    useEffect(() => {
        if (!isEditMode) return
        const fetchDetalsSkills = async () => {
            try {

                const res = await api.get(`/skills/details/${id}`)
                if (!res.data.success) return alert(res.data.message)

                const data: Skills = res.data.skill

                setName(data.name)
                setLevel(data.level)
                setDescription(data.description)
                setPreviewUrl(data.image.url)
                setSelectedCategory(data.categoryId)

            } catch (error) {
                console.log("Erreur", error)
            }
        }

        fetchDetalsSkills()
    }, [id, isEditMode])

    useEffect(() => {
        const fetchCategories = async () => {
            try {

                const res = await api.get("/categories/all")
                if (!res.data.success) return alert(res.data.success)
                const data: Category[] = res.data.categories

                setCategories(data)

            } catch (error) {
                console.log("Erreur: ", error)
            }
        }

        fetchCategories()
    }, [])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = isEditMode ? await api.put(`/skills/update/${id}`, {
                name: name,
                level: level,
                description: description,
                image: imageFile,
                categoryId: selectedCategory
            }, {
                headers: { 'Content-Type': 'multipart/form-data' }
            }) : await api.post('/skills/add', {
                name: name,
                level: level,
                description: description,
                image: imageFile,
                categoryId: selectedCategory
            }, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            if (res.data.success) {
                alert(res.data.message)
            }

        } catch (error) {
            console.error("Erreur lors de l'ajout:", error)
        } finally {
            setLoading(false)
        }
    };

    return (
        <section className=" w-full h-full bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 bg-gray-50">
                <h2 className="text-xl font-bold text-gray-800">Ajouter une nouvelle compétence</h2>
                <p className="text-sm text-gray-500">Remplissez les informations pour enrichir votre portfolio.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Colonne de gauche : Champs texte */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Nom de la compétence</label>
                            <div className="relative">
                                <Award className="absolute left-3 top-3 text-gray-400" size={18} />
                                <Input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="ex: React, Node.js..."
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Niveau</label>
                            <select
                                value={level}
                                onChange={(e) => setLevel(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer"
                            >
                                <option value="debutant">Débutant</option>
                                <option value="intermediaire">Intermédiaire</option>
                                <option value="avance">Avancé</option>
                                <option value="maitrise">Maîtrise</option>
                                <option value="expert">Expert</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Catégorie</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(Number(e.target.value))}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer"
                            >
                                <option value="">Selectionner</option>
                                {categorie?.map((c) => (
                                    <option key={c.id} value={c.id}> {c.name} </option>
                                ))}

                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                            <div className="relative">
                                <AlignLeft className="absolute left-3 top-3 text-gray-400" size={18} />
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="Décrivez brièvement votre expérience..."
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Colonne de droite : Upload d'image */}
                    <div className="flex flex-col items-center w-75 h-75 justify-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors relative">
                        {previewUrl ? (
                            <div className="relative w-full h-full flex items-center justify-center">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-full h-full rounded-lg shadow-md object-contain"
                                />
                                <Button
                                    type="button"
                                    onClick={clearImage}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-lg"
                                >
                                    <X size={20} />
                                </Button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center cursor-pointer w-full h-64">
                                <div className="bg-white p-4 rounded-full shadow-sm mb-3">
                                    <Upload className="text-indigo-600" size={32} />
                                </div>
                                <span className="text-sm font-medium text-gray-700">Cliquez pour uploader le logo</span>
                                <span className="text-xs text-gray-400 mt-1">PNG, JPG ou SVG (max. 2MB)</span>
                                <Input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </label>
                        )}
                    </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex justify-end gap-4 pt-6 border-t">
                    <Button
                        type="button"
                        onClick={goBack}
                        className="px-6 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        Annuler
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-2 rounded-lg hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50"
                    >
                        {loading ? "Envoi en cours..." : <><Save size={18} /> {isEditMode ? "Mettre à jour": "Enregistrer"} </>}
                    </Button>
                </div>
            </form>
        </section>
    );
}

export default SkillsForm;