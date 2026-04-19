import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Mail, Lock, User, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

type RoleTab = 'admin' | 'student';

export const Login = () => {
  const [selectedRole, setSelectedRole] = useState<RoleTab>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Build the login identifier
    let loginEmail = email.trim();

    // If student role and they typed a roll number (not an email), convert it
    if (selectedRole === 'student' && !loginEmail.includes('@')) {
      loginEmail = `${loginEmail.toLowerCase()}@sis.edu`;
    }

    try {
      await login(loginEmail, password);
      // Navigate based on the role returned by the server (stored in context)
      const stored = localStorage.getItem('sis_user');
      if (stored) {
        const user = JSON.parse(stored);
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      }
    } catch {
      // error is already set in AuthContext
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-start/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-primary-end/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10 animate-scale-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-primary-gradient bg-clip-text text-transparent mb-2">SIS Portal</h1>
          <p className="text-gray-400">Sign in to your account</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">

            {/* Role Toggle */}
            <div className="flex p-1 bg-background/50 rounded-lg">
              <button
                type="button"
                onClick={() => { setSelectedRole('student'); setEmail(''); setPassword(''); }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all",
                  selectedRole === 'student' ? 'bg-student-accent/20 text-student-accent shadow-sm' : 'text-gray-400 hover:text-white'
                )}
              >
                <User className="w-4 h-4" />
                Student
              </button>
              <button
                type="button"
                onClick={() => { setSelectedRole('admin'); setEmail(''); setPassword(''); }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all",
                  selectedRole === 'admin' ? 'bg-admin-accent/20 text-admin-accent shadow-sm' : 'text-gray-400 hover:text-white'
                )}
              >
                <Shield className="w-4 h-4" />
                Admin
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  {selectedRole === 'admin' ? 'Email Address' : 'Roll Number / Email'}
                </label>
                <Input
                  type="text"
                  placeholder={selectedRole === 'admin' ? "admin@sis.edu" : "e.g. 24071A0501"}
                  icon={<Mail className="w-5 h-5" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  icon={<Lock className="w-5 h-5" />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-600 bg-background text-primary-start focus:ring-primary-start" />
                <span className="text-gray-400 group-hover:text-gray-300 transition-colors">Remember me</span>
              </label>
              <a href="#" className="text-primary-end hover:text-primary-start transition-colors">Forgot password?</a>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full transition-all duration-300",
                selectedRole === 'student' ? "bg-student-accent hover:bg-student-accent/90" : "bg-admin-accent hover:bg-admin-accent/90"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                `Sign in as ${selectedRole === 'admin' ? 'Administrator' : 'Student'}`
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
