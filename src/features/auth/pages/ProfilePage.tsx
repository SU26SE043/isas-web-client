import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../stores/authStore';
import { usePermissions } from '../hooks/usePermissions';
import { getRoleDisplayName, getPermissionDisplayName } from '../utils/rolePermissions';
import { EditProfileModal } from '../components/EditProfileModal';
import { useLanguage } from '../../../shared/languages';

export const ProfilePage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const { userPermissions } = usePermissions();
  const { t } = useLanguage();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleEditSuccess = () => {
    // Modal sẽ tự động refresh user data và đóng
    console.log('Profile updated successfully');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pine"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('profile.userNotFound')}</h2>
          <p className="text-slate-600">{t('profile.pleaseLoginAgain')}</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\//g, '.');
  };

  const shortenId = (id: string) => {
    if (!id || id.length < 12) return id;
    return `${id.substring(0, 8)}...${id.substring(id.length - 4)}`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F1F5F9] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-pine text-white flex flex-col shrink-0 min-h-[calc(100vh-80px)] border-t border-white/10">
        <div className="p-6 pb-2">
          <p className="text-[10px] font-bold text-white/60 tracking-wider uppercase">
            {user.role}
          </p>
        </div>

        <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm bg-milk text-pine font-bold shadow-sm cursor-pointer">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {t('profile.navProfile')}
          </div>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer text-left"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {t('profile.logout')}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 py-12 flex justify-center items-start overflow-y-auto">
        {/* Outer Wrapper */}
        <div className="bg-[#F8FAFC] p-4 md:p-6 lg:p-8 rounded-[2rem] shadow-sm max-w-5xl w-full mx-6 flex flex-col xl:flex-row gap-4 lg:gap-6">
          
          {/* Left Column (Main Info & Account Info) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex-1 p-6 lg:p-8">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8 relative">
               <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center text-4xl font-bold shrink-0">
                     {getInitials(user.fullName)}
                  </div>
                  <div>
                     <h1 className="text-2xl font-bold text-slate-900 mb-1">{user.fullName}</h1>
                     <p className="text-slate-500 text-sm">{user.email}</p>
                  </div>
               </div>
               <button 
                  onClick={() => setIsEditModalOpen(true)} 
                  className="flex items-center px-4 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap self-start md:absolute md:top-0 md:right-0"
               >
                  <svg className="w-3.5 h-3.5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                  </svg>
                  {t('profile.editProfile')}
               </button>
            </div>

            <hr className="border-slate-100 mb-8" />

            {/* Account Info */}
            <div>
               <h2 className="text-lg font-bold text-slate-900 mb-6">{t('profile.accountInfo')}</h2>
               
               <div className="flex flex-col">
                  {/* ID */}
                  <div className="flex justify-between items-center py-4 border-b border-slate-100">
                     <div className="flex items-center text-slate-700">
                        <svg className="w-5 h-5 mr-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                           <circle cx="12" cy="12" r="10"></circle>
                           <circle cx="12" cy="10" r="3"></circle>
                           <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path>
                        </svg>
                        <span className="text-sm font-medium">{t('profile.accountId')}</span>
                     </div>
                     <div className="flex items-center text-slate-900 font-mono text-sm">
                        {shortenId(user.id)}
                        {isCopied ? (
                           <span className="ml-2 text-pine text-xs font-medium flex items-center bg-pine/10 px-2 py-0.5 rounded">
                              <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                 <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                              {t('profile.copied')}
                           </span>
                        ) : (
                           <button onClick={() => copyToClipboard(user.id)} className="ml-2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                 <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                 <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                              </svg>
                           </button>
                        )}
                     </div>
                  </div>
                  
                  {/* Role */}
                  <div className="flex justify-between items-center py-4 border-b border-slate-100">
                     <div className="flex items-center text-slate-700">
                        <svg className="w-5 h-5 mr-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                           <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                           <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span className="text-sm font-medium">{t('profile.role')}</span>
                     </div>
                     <div className="flex items-center">
                        <span className="text-slate-400 mr-2">--</span>
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-500`}>
                           {getRoleDisplayName(user.role) || t('profile.noRole')}
                        </span>
                     </div>
                  </div>

                  {/* Date */}
                  <div className="flex justify-between items-center pt-4">
                     <div className="flex items-center text-slate-700">
                        <svg className="w-5 h-5 mr-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                           <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                           <line x1="16" y1="2" x2="16" y2="6"></line>
                           <line x1="8" y1="2" x2="8" y2="6"></line>
                           <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span className="text-sm font-medium">{t('profile.createdAt')}</span>
                     </div>
                     <div className="text-slate-900 text-sm font-medium">
                        {formatDate(user.createdAt)}
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Right Column (Additional Info & Permissions) */}
          <div className="w-full xl:w-[400px] flex flex-col gap-4 lg:gap-6">
             {/* Additional Info */}
             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8">
                <h2 className="text-lg font-bold text-slate-900 mb-6">{t('profile.additionalInfo')}</h2>
                <div className="flex flex-col">
                   <div className="flex justify-between items-center py-4 border-b border-slate-100">
                      <span className="text-sm font-medium text-slate-700">{t('profile.location')}</span>
                      <div className="flex items-center text-slate-400 text-sm cursor-pointer hover:text-slate-600 transition-colors" onClick={() => setIsEditModalOpen(true)}>
                         {user.location || t('profile.notUpdated')}
                         <svg className="w-3.5 h-3.5 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                         </svg>
                      </div>
                   </div>
                   <div className="flex justify-between items-center pt-4">
                      <span className="text-sm font-medium text-slate-700">{t('profile.title')}</span>
                      <div className="flex items-center text-slate-400 text-sm cursor-pointer hover:text-slate-600 transition-colors" onClick={() => setIsEditModalOpen(true)}>
                         {user.title || t('profile.notUpdated')}
                         <svg className="w-3.5 h-3.5 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                         </svg>
                      </div>
                   </div>
                </div>
             </div>

             {/* Permissions */}
             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8 flex-1 flex flex-col">
                <h2 className="text-lg font-bold text-slate-900 mb-6">{t('profile.permissions')}</h2>
                
                {userPermissions && userPermissions.length > 0 ? (
                  <div className="space-y-3">
                    {userPermissions.map((permission) => (
                      <div key={permission} className="flex items-center px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <svg className="w-4 h-4 text-pine mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-slate-700 font-medium">
                          {getPermissionDisplayName(permission)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                     <svg className="w-12 h-12 text-slate-300 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                     </svg>
                     <p className="text-sm text-slate-400 max-w-[200px]">{t('profile.noPermissions')}</p>
                  </div>
                )}
             </div>
          </div>

        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};