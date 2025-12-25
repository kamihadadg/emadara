'use client';

import { useState, useEffect } from 'react';

interface Comment {
  id: string;
  name?: string;
  message: string;
  createdAt: string;
}

export default function CommentForm() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('comments');
      if (raw) setComments(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('comments', JSON.stringify(comments));
    } catch (e) {}
  }, [comments]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const c: Comment = {
      id: String(Date.now()),
      name: name.trim() || 'ناشناس',
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };

    setComments((s) => [c, ...s]);
    setMessage('');
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold mb-3">ارسال نظر</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm text-gray-700 mb-1">نام (اختیاری)</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="نام خود را وارد کنید یا خالی بگذارید"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">نظر شما</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="نظر یا پیشنهاد خود را اینجا بنویسید..."
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={!message.trim()}
          >
            ارسال نظر
          </button>
        </div>
      </form>

      <div className="mt-6">
        <h4 className="font-medium text-gray-700 mb-2">نظرات اخیر</h4>
        <div className="space-y-3">
          {comments.length === 0 && (
            <p className="text-sm text-gray-500 italic">هنوز نظری ثبت نشده است.</p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="border rounded-md p-3 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">{c.name}</div>
                <div className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString('fa-IR')}</div>
              </div>
              <div className="text-gray-800">{c.message}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
