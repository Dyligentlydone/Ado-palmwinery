import ChangePassword from '../../components/ChangePassword';
import { useAuth } from '../../context/AuthContext';

export default function AdminSettings() {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
      <p className="text-sm text-gray-500 mb-6">Signed in as {user?.email}</p>
      <ChangePassword />
    </div>
  );
}
