import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  Wrench,
  MessageSquare,
  LogOut,
  Folder,
  ChartNoAxesGantt,
  Users,
  Code,
  ThumbsUp,
  Hand,
  Bot,
  CheckCheck,
  Users2,
  FileText,
  Image
} from "lucide-react"
import { useNotification } from "../hooks/useNotification"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { showConfirm } = useNotification()

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Services", path: "/services", icon: <Briefcase size={18} /> },
    { name: "Catégories", path: "/categories", icon: <ChartNoAxesGantt size={18} /> },
    { name: "Compétences", path: "/competances", icon: <Wrench size={18} /> },
    { name: "Langages", path: "/languages", icon: <Code size={18} /> },
    { name: "Projets", path: "/projets", icon: <Folder size={18} /> },
    { name: "Collaborateurs", path: "/collabs", icon: <Users size={18} /> },
    { name: "CV & Docs", path: "/cv", icon: <FileText size={18} /> },
    { name: "Background", path: "/background", icon: <Image size={18} /> },
    { name: "Utilisateurs", path: "/users", icon: <Users2 size={18} /> },
    { name: "Intéressés", path: "/interests", icon: <CheckCheck size={18} /> },
    { name: "Feedbacks", path: "/feedbacks", icon: <ThumbsUp size={18} /> },
    { name: "Témoignages", path: "/reviews", icon: <Hand size={18} /> },
    { name: "Messages", path: "/messages", icon: <MessageSquare size={18} /> },
    { name: "Conversations", path: "/chats", icon: <Bot size={18} /> },
  ]

  const handleLogout = () => {
    showConfirm("Déconnexion", "Voulez-vous vraiment vous déconnecter ?", () => {
      localStorage.removeItem("token")
      navigate("/")
    })
  }

  const handleNavigate = (path: string) => {
    navigate(path)
    onClose()
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-700/50 shrink-0">
          <span className="text-xl font-black text-white tracking-tight">
            N<span className="text-indigo-400">DEV</span>
          </span>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <LogOut size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                    ${isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                >
                  <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {item.icon}
                  </span>
                  {item.name}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-700/50 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;