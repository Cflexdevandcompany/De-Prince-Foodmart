import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { setAdminAuthenticated } from '../../lib/adminAuth';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@deprincefoodmart.com');
  const [password, setPassword] = useState('ChangeMe123!');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setAdminAuthenticated(true);
    navigate('/admin');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-offwhite p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-brand-green">Admin Login</h1>
          <p className="mt-2 text-sm text-slate-600">Secure access to Deprince Foodmart</p>
        </div>

        <div className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <div className="mt-6">
          <Button type="submit" className="w-full">Sign in</Button>
        </div>
      </form>
    </div>
  );
}
