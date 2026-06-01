import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import type { UpdateProfileRequest } from '../types/auth.types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, fetchUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    fullName: user?.fullName || '',
    location: user?.location || '',
    title: user?.title || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsLoading(true);
      await authService.updateProfile(formData);
      
      // Refresh user data
      await fetchUser();
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
      // TODO: Show error message to user
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof UpdateProfileRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            Chỉnh sửa thông tin
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Họ và tên
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                placeholder="Nhập họ và tên"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Vị trí
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                placeholder="Nhập vị trí (VD: Hà Nội, TP.HCM)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Chức danh
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                placeholder="Nhập chức danh (VD: Senior Developer)"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang lưu...
                </>
              ) : (
                'Lưu thay đổi'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};