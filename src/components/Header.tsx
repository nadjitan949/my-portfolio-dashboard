import { Bell, Menu, Search } from "lucide-react";
import { useLocation } from "react-router-dom";

interface HeaderProps {
  onMenuToggle: () => void
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/services': 'Services',
  '/categories': 'Catégories',
  '/competances': 'Compétences',
  '/languages': 'Langages',
  '/projets': 'Projets',
  '/collabs': 'Collaborateurs',
  '/cv': 'CV & Documents',
  '/background': 'Background',
  '/users': 'Utilisateurs',
  '/interests': 'Intéressés',
  '/feedbacks': 'Feedbacks',
  '/reviews': 'Témoignages',
  '/messages': 'Messages',
  '/chats': 'Conversations',
}

function Header({ onMenuToggle }: HeaderProps) {
  const location = useLocation()
  const currentTitle = Object.keys(pageTitles).find(key => location.pathname.startsWith(key) && key !== '/') 
    ? pageTitles[Object.keys(pageTitles).find(key => location.pathname.startsWith(key) && key !== '/') || '']
    : pageTitles[location.pathname] || 'Dashboard'

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={onMenuToggle} className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Menu size={22} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-900">{currentTitle}</h1>
          <p className="text-xs text-gray-400 hidden sm:block">Bienvenue, Nadjitan</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center bg-gray-50 rounded-lg px-3 py-2 gap-2 w-64 border border-gray-100 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <Search size={16} className="text-gray-400" />
          <input type="text" placeholder="Rechercher..." className="bg-transparent text-sm text-gray-700 outline-none w-full placeholder:text-gray-400" />
        </div>

        <button className="relative p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full animate-pulse-dot" />
        </button>

        <div className="flex items-center gap-2 pl-3 border-l border-gray-100">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            NB
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header