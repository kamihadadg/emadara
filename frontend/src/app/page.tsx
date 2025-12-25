'use client';

import { useState, useEffect } from 'react';
import { Survey, SurveyResponse } from '@/types/survey';
import { getActiveSurveys, getSurveyById, submitSurveyResponse } from '@/lib/api';
import SurveyForm from '@/components/SurveyForm';
import SurveyResults from '@/components/SurveyResults';
import CommentForm from '@/components/CommentForm';

type ViewState = 'list' | 'survey' | 'results' | 'success';

export default function Home() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [surveyResults, setSurveyResults] = useState<any>(null);
  const [viewState, setViewState] = useState<ViewState>('list');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const active = await getActiveSurveys();
        setSurveys(active);
      } catch (e) {
        setError('خطا در بارگذاری نظرسنجی‌ها');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleTakeSurvey = async (surveyId: string) => {
    try {
      setLoading(true);
      const survey = await getSurveyById(surveyId);
      setSelectedSurvey(survey);
      setViewState('survey');
    } catch (e) {
      setError('خطا در بارگذاری نظرسنجی');
    } finally {
      setLoading(false);
    }
  };

  const handleViewResults = async (surveyId: string) => {
    try {
      setLoading(true);
      const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + `/surveys/${surveyId}/results`;
      const url = new URL(base);
      if (isAdminView) url.searchParams.set('includeUsers', 'true');
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setSurveyResults(data);
      setViewState('results');
    } catch (e) {
      setError('خطا در بارگذاری نتایج');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSurvey = async (response: SurveyResponse) => {
    try {
      setIsSubmitting(true);
      await submitSurveyResponse(response);
      setViewState('success');
    } catch (e) {
      setError('خطا در ارسال پاسخ‌ها');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToList = () => {
    setSelectedSurvey(null);
    setSurveyResults(null);
    setViewState('list');
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">خطا</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={handleBackToList} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            بازگشت به صفحه اصلی
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">پورتال شرکت</h1>
            <p className="text-sm text-gray-600">نظرسنجی و بازخورد کارکنان</p>
          </div>

          <nav className="flex items-center gap-3">
            <button onClick={handleBackToList} className="px-3 py-2 text-sm rounded-md hover:bg-gray-100">خانه</button>
            <button onClick={() => setViewState('list')} className="px-3 py-2 text-sm rounded-md hover:bg-gray-100">نظرسنجی‌ها</button>
            <button 
              onClick={() => selectedSurvey ? handleViewResults(selectedSurvey.id) : null} 
              disabled={!selectedSurvey} 
              className={`px-3 py-2 text-sm rounded-md ${selectedSurvey ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`}
            >
              نتایج
            </button>
            <label className="flex items-center gap-2 text-sm text-gray-600 ml-4">
              <input type="checkbox" checked={isAdminView} onChange={(e) => setIsAdminView(e.target.checked)} className="w-4 h-4" />
              نمایش اطلاعات کاربران (Admin)
            </label>
          </nav>
        </header>

        <main className="grid lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 bg-white rounded-xl p-8 shadow-md">
            <h2 className="text-2xl font-bold mb-2">نظرسنجی‌ها</h2>
            <p className="text-gray-600 mb-6">نظرات و پاسخ‌های خود را ثبت و نتایج را مشاهده کنید.</p>

            <div className="grid gap-6 md:grid-cols-2">
              {surveys.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">نظرسنجی فعالی یافت نشد</h3>
                  <p className="text-gray-600">در حال حاضر هیچ نظرسنجی فعالی وجود ندارد.</p>
                </div>
              ) : (
                surveys.map((survey) => (
                  <div key={survey.id} className="bg-gray-50 rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold mb-2">{survey.title}</h3>
                    {survey.description && <p className="text-sm text-gray-600 mb-3">{survey.description}</p>}
                    <div className="flex gap-2">
                      <button onClick={() => handleTakeSurvey(survey.id)} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        شرکت در نظرسنجی
                      </button>
                      <button onClick={() => handleViewResults(survey.id)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                        مشاهده نتایج
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <aside className="lg:col-span-1">
            <div className="space-y-6 sticky top-6">
              <section className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold">درباره</h3>
                <p className="text-sm text-gray-600 mt-2">بازخوردها به‌صورت ناشناس ذخیره می‌شوند. می‌توانید نظر خود را در فرم زیر ثبت کنید.</p>
              </section>

              <section>
                <CommentForm />
              </section>
            </div>
          </aside>
        </main>

        {/* render other views */}
        {viewState === 'survey' && selectedSurvey && (
          <div className="mt-8">
            <SurveyForm survey={selectedSurvey} onSubmit={handleSubmitSurvey} isSubmitting={isSubmitting} />
          </div>
        )}

        {viewState === 'results' && surveyResults && (
          <div className="mt-8">
            <SurveyResults results={surveyResults} />
          </div>
        )}

        {viewState === 'success' && (
          <div className="mt-8">
            <div className="bg-white rounded-xl p-8 shadow-md text-center">
              <div className="text-green-600 text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">با تشکر از شما!</h2>
              <p className="text-gray-600 mb-6">پاسخ‌های شما با موفقیت ثبت شد.</p>
              <button onClick={handleBackToList} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                بازگشت به صفحه اصلی
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
