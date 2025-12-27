'use client';

import { useState } from 'react';
import { createPosition, updatePosition } from '@/lib/api';

interface PositionFormModalProps {
  position?: any;
  positions: any[];
  onClose: () => void;
  onSave: () => void;
}

export default function PositionFormModal({ position, positions, onClose, onSave }: PositionFormModalProps) {
  const [formData, setFormData] = useState({
    title: position?.title || '',
    description: position?.description || '',
    parentPositionId: position?.parentPositionId || '',
    order: position?.order || 0,
    isAggregate: position?.isAggregate || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Remove parentPositionId if it's empty to avoid sending empty strings
      const submitData = {
        ...formData,
        parentPositionId: formData.parentPositionId || undefined,
      };

      if (position) {
        await updatePosition(position.id, submitData);
      } else {
        await createPosition(submitData);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving position:', error);
      alert('خطا در ذخیره سمت');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {position ? 'ویرایش سمت' : 'افزودن سمت جدید'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                عنوان سمت
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="مثل: مدیر فروش، کارشناس مالی"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                توضیحات (اختیاری)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="توضیحات درباره وظایف این سمت"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                سمت بالادستی
              </label>
              <select
                value={formData.parentPositionId}
                onChange={(e) => setFormData({ ...formData, parentPositionId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">بدون بالادستی</option>
                {positions
                  .filter((p: any) => p.id !== position?.id)
                  .map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ترتیب نمایش
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isAggregate"
                checked={formData.isAggregate}
                onChange={(e) => setFormData({ ...formData, isAggregate: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isAggregate" className="mr-2 block text-sm text-gray-900 font-bold">
                سمت تجمیعی (امکان تخصیص بیش از یک نفر)
              </label>
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
                {position ? 'به‌روزرسانی' : 'ذخیره'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
