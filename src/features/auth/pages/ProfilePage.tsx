import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { useLanguage } from '../../../shared/languages';
import { getRoleDisplayName, getRoleColor, getPermissionDisplayName } from '../utils/rolePermissions';
import { EditProfileModal } from '../components/EditProfileModal';

export const ProfilePage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { userPermissions } = usePermissions();
  const { t } = useLanguage();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditSuccess = () => {
    // Modal sẽ tự động refresh user data và đóng
    console.log('Profile updated successfully');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Không tìm thấy thông tin người dùng</h2>
          <p className="text-slate-600">Vui lòng đăng nhập lại</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-green to-brand-green/80 px-8 py-12">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user.fullName
                  .split(' ')
                  .map(word => word.charAt(0))
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{user.fullName}</h1>
                <p className="text-white/90 text-lg">{user.title || 'Chưa cập nhật chức danh'}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Thông tin cá nhân */}
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Thông tin cá nhân</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Họ và tên
                    </label>
                    <div className="px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
                      {user.fullName}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email
                    </label>
                    <div className="px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
                      {user.email}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Vị trí
                    </label>
                    <div className="px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
                      {user.location || 'Chưa cập nhật'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Chức danh
                    </label>
                    <div className="px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
                      {user.title || 'Chưa cập nhật'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông tin tài khoản */}
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Thông tin tài khoản</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      ID tài khoản
                    </label>
                    <div className="px-4 py-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-sm">
                      {user.id}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Vai trò
                    </label>
                    <div className="px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {getRoleDisplayName(user.role)}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Ngày tạo tài khoản
                    </label>
                    <div className="px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
                      {formatDate(user.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="w-full bg-brand-green text-white py-3 px-4 rounded-lg hover:bg-brand-green/90 transition-colors font-medium"
                  >
                    Chỉnh sửa thông tin
                  </button>
                </div>
              </div>

              {/* Quyền hạn */}
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Quyền hạn</h2>
                <div className="space-y-3">
                  {userPermissions.length > 0 ? (
                    userPermissions.map((permission) => (
                      <div
                        key={permission}
                        className="flex items-center px-3 py-2 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-green-800 font-medium">
                          {getPermissionDisplayName(permission)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-500 text-sm">
                      Không có quyền hạn nào
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};