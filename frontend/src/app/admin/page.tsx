'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  getAllUsers,
  updateUser,
  deleteUser,
  getAllPositions,
  updatePosition,
  deletePosition,
  getOrganizationalChart,
  getAllPositionsFlat,
  updatePositionParent,
} from '@/lib/api';
import UserFormModal from '@/components/UserFormModal';
import PositionFormModal from '@/components/PositionFormModal';
import OrgChart from '@/components/OrgChart';
import PositionHierarchyManager from '@/components/PositionHierarchyManager';
import InteractiveOrgChart from '@/components/InteractiveOrgChart';

interface User {
  id: string;
  employeeId: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'HR' | 'ADMIN';
  isActive: boolean;
  position?: {
    id: string;
    title: string;
  };
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export default function AdminPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'positions' | 'org-chart'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [orgChart, setOrgChart] = useState<any[]>([]);
  const [flatPositions, setFlatPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showPositionForm, setShowPositionForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingPosition, setEditingPosition] = useState<any | null>(null);

  // Check if user is admin
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            دسترسی غیرمجاز
          </h2>
          <p className="text-gray-600 mb-6">
            شما دسترسی لازم برای مشاهده این صفحه را ندارید.
          </p>
          <Link
            href="/dashboard"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            بازگشت به داشبورد
          </Link>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [usersData, positionsData, orgChartData, flatPositionsData] = await Promise.all([
        getAllUsers(),
        getAllPositions(),
        getOrganizationalChart(),
        getAllPositionsFlat(),
      ]);
      setUsers(usersData);
      setPositions(positionsData);
      setOrgChart(orgChartData);
      setFlatPositions(flatPositionsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این کاربر را حذف کنید؟')) return;

    try {
      await deleteUser(userId);
      await loadData();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('خطا در حذف کاربر');
    }
  };


  const handleDeletePosition = async (positionId: string) => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این سمت را حذف کنید؟')) return;

    try {
      await deletePosition(positionId);
      await loadData();
    } catch (error) {
      console.error('Error deleting position:', error);
      alert('خطا در حذف سمت');
    }
  };

  const handlePositionReorder = async (positionId: string, newParentId: string | null) => {
    try {
      await updatePositionParent(positionId, newParentId);
      await loadData(true);
    } catch (error) {
      console.error('Error reordering position:', error);
    }
  };

  const handleCleanupInvalidPositions = async () => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید رکوردهای نامعتبر سمت‌ها را پاک کنید؟')) return;

    try {
      const response = await fetch('/api/auth/admin/debug/cleanup-invalid-positions', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('خطا در پاکسازی');
      }

      const result = await response.json();
      alert(result.message);
      await loadData();
    } catch (error) {
      console.error('Error cleaning up positions:', error);
      alert('خطا در پاکسازی رکوردهای نامعتبر');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                پنل مدیریت ادمین
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                خوش آمدید، {user.firstName}
              </span>
              <Link
                href="/dashboard"
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                داشبورد
              </Link>
              <button
                onClick={logout}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                خروج
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                مدیریت کاربران ({users.length})
              </button>
              <button
                onClick={() => setActiveTab('positions')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'positions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                مدیریت سمت‌ها ({positions.length})
              </button>
              <button
                onClick={() => setActiveTab('org-chart')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'org-chart'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                چارت سازمانی
              </button>
            </nav>
          </div>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  لیست کاربران
                </h3>
                <button
                  onClick={() => {
                    setEditingUser(null);
                    setShowUserForm(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  افزودن کاربر جدید
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        کد پرسنلی
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        نام کاربری
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        نام و نام خانوادگی
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        نقش
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        سمت
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        عملیات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.employeeId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'ADMIN'
                            ? 'bg-red-100 text-red-800'
                            : user.role === 'MANAGER'
                              ? 'bg-blue-100 text-blue-800'
                              : user.role === 'HR'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                            {user.role === 'ADMIN' ? 'مدیر سیستم' :
                              user.role === 'MANAGER' ? 'مدیر' :
                                user.role === 'HR' ? 'منابع انسانی' : 'کارمند'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.position?.title || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setShowUserForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            ویرایش
                          </button>
                          {user.role !== 'ADMIN' && (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              حذف
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}


        {/* Positions Tab */}
        {activeTab === 'positions' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  لیست سمت‌ها
                </h3>
                <div className="flex space-x-2 space-x-reverse">
                  <button
                    onClick={handleCleanupInvalidPositions}
                    className="bg-orange-600 text-white px-3 py-2 rounded-md hover:bg-orange-700 text-sm"
                    title="پاکسازی رکوردهای نامعتبر"
                  >
                    🧹 پاکسازی
                  </button>
                  <button
                    onClick={() => {
                      setEditingPosition(null);
                      setShowPositionForm(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    افزودن سمت جدید
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        عنوان سمت
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        سمت بالادستی
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        تعداد پرسنل
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        عملیات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {positions.map((position: any) => (
                      <tr key={position.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {position.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {position.parentPosition?.title || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {position.employees?.length || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setEditingPosition(position);
                              setShowPositionForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            ویرایش
                          </button>
                          <button
                            onClick={() => handleDeletePosition(position.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            حذف
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Org Chart Tab */}
        {activeTab === 'org-chart' && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Active Personnel Card */}
                  <div className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110 duration-500"></div>
                    <div className="relative flex items-center justify-between">
                      <div>
                        <p className="text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">پرسنل فعال</p>
                        <h4 className="text-4xl font-black text-slate-800">
                          {users.filter(u => u.isActive && u.position).length}
                          <span className="text-lg text-slate-400 font-medium mr-2">نفر</span>
                        </h4>
                      </div>
                      <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:rotate-12 transition-transform duration-300">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Total Positions Card */}
                  <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110 duration-500"></div>
                    <div className="relative flex items-center justify-between">
                      <div>
                        <p className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">کل سمت‌ها</p>
                        <h4 className="text-4xl font-black text-slate-800">
                          {positions.filter(p => p.isActive).length}
                          <span className="text-lg text-slate-400 font-medium mr-2">جایگاه</span>
                        </h4>
                      </div>
                      <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:rotate-12 transition-transform duration-300">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Empty Positions Card */}
                  <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110 duration-500"></div>
                    <div className="relative flex items-center justify-between">
                      <div>
                        <p className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">سمت‌های خالی</p>
                        <h4 className="text-4xl font-black text-slate-800">
                          {positions.filter(p => p.isActive && !users.some(u => u.isActive && u.position?.id === p.id)).length}
                          <span className="text-lg text-slate-400 font-medium mr-2">جایگاه</span>
                        </h4>
                      </div>
                      <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/30 group-hover:rotate-12 transition-transform duration-300">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                    نمای درختی سازمان
                  </h3>
                </div>
                <div className="flex space-x-2 space-x-reverse">
                  <button
                    onClick={() => loadData()}
                    className="group flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm hover:shadow-md"
                    title="به‌روزرسانی"
                  >
                    <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-xs font-bold">به‌روزرسانی</span>
                  </button>
                </div>
              </div>

              {orgChart.length > 0 ? (
                <InteractiveOrgChart
                  data={orgChart}
                  onReorder={handlePositionReorder}
                />
              ) : (
                <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <div className="text-4xl mb-4">🏢</div>
                  <h3 className="text-gray-900 font-medium">هنوز سمتی تعریف نشده است</h3>
                  <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">
                    برای شروع، از تب "مدیریت سمت‌ها" اولین سمت (مثلاً مدیرعامل) را تعریف کنید.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Form Modal */}
        {showUserForm && (
          <UserFormModal
            user={editingUser}
            users={users}
            positions={positions}
            onClose={() => {
              setShowUserForm(false);
              setEditingUser(null);
            }}
            onSave={loadData}
          />
        )}

        {/* Position Form Modal */}
        {showPositionForm && (
          <PositionFormModal
            position={editingPosition}
            positions={positions}
            onClose={() => {
              setShowPositionForm(false);
              setEditingPosition(null);
            }}
            onSave={loadData}
          />
        )}
      </main>
    </div>
  );
}


