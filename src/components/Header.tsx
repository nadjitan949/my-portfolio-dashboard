import { Bell, UserCircle } from "lucide-react";

function Header() {
  return (
    <header className="w-full bg-white h-20 rounded-xl px-6 flex items-center justify-between shadow-sm">
      
      {/* 1. Barre de Recherche ou Titre de Section */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md">
          
        </div>
      </div>

      {/* 2. Actions Droite (Notifications + Profil) */}
      <div className="flex items-center gap-6">
        
        {/* Notifications */}
        <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <Bell size={22} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>
        </button>

        {/* Séparateur Vertical */}
        <div className="h-8 w-px bg-gray-200"></div>

        {/* Profil Utilisateur */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-black group-hover:text-blue-600 transition-colors">Alex Dupont</p>
            <p className="text-xs text-gray-500">Administrateur</p>
          </div>
          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white group-hover:bg-blue-600 transition-colors">
            <UserCircle size={28} />
          </div>
        </div>

      </div>
    </header>
  );
}

export default Header