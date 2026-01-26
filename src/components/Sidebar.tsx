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
  Users2
} from "lucide-react"
import Button from "../ui/Button";

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Services", path: "/services", icon: <Briefcase size={20} /> },
    { name: "Categories", path: "/categories", icon: <ChartNoAxesGantt size={20} /> },
    { name: "Compétences", path: "/competances", icon: <Wrench size={20} /> },
    { name: "Languages", path: "/languages", icon: <Code size={20} /> },
    { name: "Projets", path: "/projets", icon: <Folder size={20} /> },
    { name: "Collaborateurs", path: "/collabs", icon: <Users size={20} /> },
    { name: "Utilisateurs", path: "/users", icon: <Users2 size={20} /> },
    { name: "Interessé", path: "/interests", icon: <CheckCheck size={20} /> },
    { name: "Feedbacks", path: "/feedbacks", icon: <ThumbsUp size={20} /> },
    { name: "Temoignages", path: "/reviews", icon: <Hand size={20} /> },
    { name: "Messages", path: "/messages", icon: <MessageSquare size={20} /> },
    { name: "Conversations", path: "/chats", icon: <Bot size={20} /> },
  ]

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/")
  }

  return (
    <section className="w-64 h-full bg-white rounded-xl flex flex-col justify-between">
      <div>
        {/* Header / Logo */}
        <div className="p-6 text-2xl font-black tracking-tighter border-b border-gray-100 text-black">
          MON<span className="text-blue-600">APP</span>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4">
          <ul className="space-y-2 h-140 overflow-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.name}>
                  <Button
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200
                      ${isActive
                        ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                        : "text-gray-600 hover:bg-gray-100 hover:text-black"
                      }`}
                  >
                    {item.icon}
                    {item.name}
                  </Button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Footer / Déconnexion */}
      <div className="p-4 border-t border-gray-100">
        <Button
          className="w-full flex items-center justify-center gap-2 p-3 text-gray-500 font-semibold hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          onClick={handleLogout}
        >
          <LogOut size={20} />
          Déconnexion
        </Button>
      </div>
    </section>
  );
}

export default Sidebar;