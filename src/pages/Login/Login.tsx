import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react'
import api from '../../axios/api' // Assure-toi que le chemin est correct
import Button from '../../ui/Button'

function Login() {
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {

            const response = await api.post('/me/login', formData)
            if (!response.data.success) return setError(response.data.message)
            localStorage.setItem("token", response.data.token)
            navigate("/dashboard")

        } catch (error) {
            console.log("Erreur: ", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#f8fafc] overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-60"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100 rounded-full blur-[120px] opacity-60"></div>

            <div className="relative w-full max-w-112.5 p-4 animate-in fade-in zoom-in duration-500">
                {/* Logo / Icone */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 flex items-center justify-center text-white mb-4 rotate-3">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Portal</h1>
                    <p className="text-gray-500 text-sm mt-2">Connectez-vous pour gérer votre portfolio</p>
                </div>

                {/* Carte de Formulaire */}
                <div className="bg-white/80 backdrop-blur-xl p-8 rounded-4xl border border-white shadow-2xl shadow-gray-200/50">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Champ Email */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Email professionnel</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                <input
                                    type="email"
                                    required
                                    placeholder="nom@exemple.com"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-sm"
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Champ Mot de passe */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Mot de passe</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-sm"
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <Button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </Button>
                            </div>
                        </div>

                        {/* Message d'erreur */}
                        {error && (
                            <div className="bg-red-50 text-red-600 text-xs font-bold p-4 rounded-xl border border-red-100 animate-shake">
                                {error}
                            </div>
                        )}

                        {/* Bouton Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Se connecter</span>
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer du formulaire */}
                    <div className="mt-8 pt-6 border-t border-gray-50 text-center">
                        <button
                            onClick={() => navigate('/forgot-password')}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                            Mot de passe oublié ?
                        </button>
                    </div>
                </div>

                <p className="text-center mt-8 text-gray-400 text-xs font-medium">
                    &copy; 2026 Admin Dashboard &bull; Sécurisé par SSL
                </p>
            </div>
        </section>
    )
}

export default Login