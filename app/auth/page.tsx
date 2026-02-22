"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Droplets, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register, isAuthenticated } = useAuth();
   const router = useRouter();
  const { toast } = useToast();

  if (isAuthenticated) {
    router.replace("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = isLogin
        ? await login(email, password)
        : await register(email, password, name);

      if (success) {
        toast({
          title: isLogin ? "Login Berhasil" : "Registrasi Berhasil",
          description: "Selamat datang di AquaMonitor!",
        });

        router.push("/dashboard");
      } else {
        toast({
          title: "Error",
          description: isLogin
            ? "Email atau password salah"
            : "Gagal melakukan registrasi",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Terjadi kesalahan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        
        <div className="relative z-10 flex flex-col justify-center px-16 text-sidebar-foreground">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Droplets className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">AquaMonitor</h1>
              <p className="text-sidebar-foreground/70">Water Quality System</p>
            </div>
          </div>

          <h2 className="font-display text-4xl font-bold mb-6 leading-tight">
            Monitoring Kualitas Air<br />
            <span className="text-gradient">Real-Time & Akurat</span>
          </h2>
          
          <p className="text-lg text-sidebar-foreground/70 max-w-md mb-8">
            Pantau pH, suhu, kekeruhan, dan ketinggian air secara real-time dengan dashboard yang intuitif dan data yang akurat.
          </p>

          <div className="flex gap-8">
            <div className="text-center">
              <p className="font-display text-3xl font-bold text-primary">4+</p>
              <p className="text-sm text-sidebar-foreground/60">Sensor Aktif</p>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl font-bold text-primary">24/7</p>
              <p className="text-sm text-sidebar-foreground/60">Monitoring</p>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl font-bold text-primary">99%</p>
              <p className="text-sm text-sidebar-foreground/60">Akurasi</p>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-accent/10 blur-3xl" />
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Droplets className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="font-display text-xl font-bold">AquaMonitor</h1>
          </div>

          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            {isLogin ? 'Selamat Datang Kembali' : 'Buat Akun Baru'}
          </h2>
          <p className="text-muted-foreground mb-8">
            {isLogin 
              ? 'Masuk ke akun Anda untuk melanjutkan' 
              : 'Daftar untuk mulai monitoring kualitas air'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 h-12"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium gradient-primary hover:opacity-90 transition-opacity"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Loading...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {isLogin ? 'Masuk' : 'Daftar'}
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-primary font-medium hover:underline"
              >
                {isLogin ? 'Daftar' : 'Masuk'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
