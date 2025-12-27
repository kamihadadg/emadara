'use client';

import { useState, useRef } from 'react';
import { createUser, updateUser, uploadProfileImage, API_BASE_URL } from '@/lib/api';
import { User } from '@/contexts/AuthContext';

const getFullImageUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('data:')) return path; // handle base64 previews
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

interface UserFormModalProps {
  user?: User | null;
  users: User[];
  positions: any[];
  onClose: () => void;
  onSave: () => void;
}

export default function UserFormModal({ user, users, positions, onClose, onSave }: UserFormModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(user?.profileImageUrl ? getFullImageUrl(user.profileImageUrl) : null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: user?.employeeId || '',
    username: user?.username || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    password: '',
    positionId: user?.position?.id || '',
    managerId: user?.manager?.id || '',
    role: user?.role || 'EMPLOYEE',
    profileImageUrl: user?.profileImageUrl || '',
  });

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        alert('حجم فایل نباید بیشتر از 2 مگابایت باشد');
        return;
      }

      // Validate file type
      if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) {
        alert('فقط فایل‌های تصویری (JPG, PNG, GIF) مجاز هستند');
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Auto-assign manager when position changes
  const handlePositionChange = (positionId: string) => {
    setFormData(prev => ({ ...prev, positionId }));

    if (positionId) {
      // Find the selected position
      const selectedPosition = positions.find((p: any) => p.id === positionId);

      if (selectedPosition) {
        // Auto-assign manager if position has parent
        if (selectedPosition.parentPositionId) {
          // Find parent position and its employees (potential managers)
          const parentPosition = positions.find((p: any) => p.id === selectedPosition.parentPositionId);
          if (parentPosition && parentPosition.employees && parentPosition.employees.length > 0) {
            // Auto-assign the first employee of parent position as manager
            const autoManagerId = parentPosition.employees[0].id;
            setFormData(prev => ({ ...prev, managerId: autoManagerId }));
          }
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let profileImageUrl = formData.profileImageUrl;

      // Upload image if selected
      if (selectedFile) {
        setUploading(true);
        try {
          const uploadResult = await uploadProfileImage(selectedFile);
          profileImageUrl = uploadResult.fileUrl;
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          alert('خطا در آپلود تصویر');
          return;
        } finally {
          setUploading(false);
        }
      }

      const submitData = {
        ...formData,
        profileImageUrl,
      };

      if (user) {
        await updateUser(user.id, submitData);
      } else {
        await createUser(submitData);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('خطا در ذخیره کاربر');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {user ? 'ویرایش کاربر' : 'افزودن کاربر جدید'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                کد پرسنلی
              </label>
              <input
                type="text"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                نام کاربری
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  نام
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  نام خانوادگی
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            {!user && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رمز عبور
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required={!user}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                سمت سازمانی
              </label>
              <select
                value={formData.positionId}
                onChange={(e) => handlePositionChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">انتخاب سمت</option>
                {positions.map((pos: any) => (
                  <option key={pos.id} value={pos.id}>
                    {pos.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                عکس پروفایل (اختیاری)
              </label>

              {/* Image Preview */}
              {imagePreview && (
                <div className="mb-3">
                  <img
                    src={imagePreview}
                    alt="پیش نمایش"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                  />
                </div>
              )}

              {/* File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />

              <div className="text-xs text-gray-500 mt-1">
                <p>• حداکثر حجم فایل: ۲ مگابایت</p>
                <p>• فرمت‌های مجاز: JPG, PNG, GIF</p>
                {uploading && <p className="text-blue-600">در حال آپلود...</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                مدیر
              </label>
              <select
                value={formData.managerId}
                onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">انتخاب مدیر</option>
                {users
                  .filter((u: User) => u.role === 'MANAGER' || u.role === 'ADMIN')
                  .map((u: User) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                نقش
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'EMPLOYEE' | 'MANAGER' | 'HR' | 'ADMIN' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="EMPLOYEE">کارمند</option>
                <option value="MANAGER">مدیر</option>
                <option value="HR">منابع انسانی</option>
                <option value="ADMIN">مدیر سیستم</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {user ? 'به‌روزرسانی' : 'ذخیره'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
