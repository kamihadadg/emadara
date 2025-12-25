'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getAdminComments, CommentItem } from '@/lib/api';

export default function AdminDashboard() {
  const [secret, setSecret] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoading(true);

    try {
      const data = await getAdminComments(secret, 500);
      setComments(data || []);
      setIsAuthenticated(true);
    } catch (err) {
      setLoginError('رمز عبور نادرست است');
      setSecret('');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSecret('');
    setComments([]);
    setError(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">داشبورد مدیریت</h1>
          <p className="text-sm text-gray-600 text-center mb-6">برای دسترسی به نظرات، رمز عبور را وارد کنید</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">رمز عبور</label>
              <input
                type="password"
                value={secret}
                onChange={(e) => {
                  setSecret(e.target.value);
                  setLoginError(null);
                }}
                placeholder="رمز عبور را وارد کنید"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{loginError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={!secret.trim() || loading}
              className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'در حال بررسی...' : 'ورود'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <Link href="/" className="text-sm text-blue-600 hover:text-blue-700 block text-center">
              بازگشت به صفحه اصلی
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">داشبورد مدیریت</h1>
            <p className="text-gray-600 mt-1">مشاهده و مدیریت نظرات کاربران</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            خروج
          </button>
        </header>

        {/* Stats Card */}
        <section className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">تعداد کل نظرات</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{comments.length}</p>
              </div>
              <div className="text-4xl">💬</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">نظرات شناسایی‌شده</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {comments.filter((c) => c.name && c.name !== 'ناشناس').length}
                </p>
              </div>
              <div className="text-4xl">👤</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">نظرات ناشناس</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  {comments.filter((c) => !c.name || c.name === 'ناشناس').length}
                </p>
              </div>
              <div className="text-4xl">🔒</div>
            </div>
          </div>
        </section>

        {/* Comments List */}
        <section className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">لیست نظرات</h2>

          {comments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">هنوز هیچ نظری ثبت نشده است</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment, idx) => (
                <div
                  key={comment.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {comment.name || 'ناشناس'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleString('fa-IR')}
                        </p>
                      </div>
                    </div>
                    {!comment.name || comment.name === 'ناشناس' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        ناشناس
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        شناسایی‌شده
                      </span>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 mt-3">
                    <p className="text-gray-800 whitespace-pre-wrap">{comment.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    </div>
  );
}
