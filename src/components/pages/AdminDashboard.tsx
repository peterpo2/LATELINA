import React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import AdminPanel from '../admin/AdminPanel';

const AdminDashboard: React.FC = () => {
  const { isAuthenticated, isAdmin, isStaff, isLoading } = useAuth();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-100">
        <div className="flex items-center space-x-3 rounded-2xl bg-white px-6 py-4 shadow">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
          <span className="text-sm font-medium text-slate-600">{t('admin.loading')}</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (!isAdmin && !isStaff)) {
    return <Navigate to="/" replace />;
  }

  return <AdminPanel variant="page" />;
};

export default AdminDashboard;
