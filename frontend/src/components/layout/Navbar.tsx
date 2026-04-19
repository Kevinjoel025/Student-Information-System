import { useAuth } from '../../contexts/AuthContext';
import { Search, UserCircle } from 'lucide-react';

export const Navbar = () => {
  const { user, role } = useAuth();

  return (
    <header className="h-20 border-b border-white/10 bg-card/50 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-96 hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="w-full bg-background/50 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-start/50 text-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-white">{user?.name || (role === 'admin' ? 'Admin User' : 'Student User')}</p>
          <p className="text-xs text-gray-400 capitalize">{role}</p>
        </div>
        <UserCircle className="w-10 h-10 text-gray-400" />
      </div>
    </header>
  );
};
