'use client';

import { useState, useEffect } from 'react';
import { Survey, SurveyResponse } from '@/types/survey';
import { getActiveSurveys, getSurveyById, submitSurveyResponse, getCommentCount } from '@/lib/api';
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
  const [commentCount, setCommentCount] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const active = await getActiveSurveys();
        setSurveys(active);
        try {
          const cnt = await getCommentCount();
          setCommentCount(cnt);
        } catch (e) {
          setCommentCount(null);
        }
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

  <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10">
    <div className="container max-w-7xl mx-auto px-4">

      {/* ===== Header ===== */}
      <header className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
        <div className="flex items-center gap-4">
          <img
            src="/logo.png"
            alt="EmadAra Logo"
            className="h-14 w-auto"
          />
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              پورتال نظرسنجی شرکت عمادآرا
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              سامانه ثبت بازخورد و نظرات کارکنان
            </p>
          </div>
        </div>
      </header>

      {/* ===== Main Layout ===== */}
      <main className="grid lg:grid-cols-3 gap-8">

        {/* ===== Message Card ===== */}
        <section className="lg:col-span-2 bg-white rounded-2xl p-10 shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            همکاران گرامی و عزیز،
          </h2>

          <div className="space-y-5 text-gray-700 text-lg leading-8">
            <p>
              موفقیت سازمان ما مرهون تلاش، تعهد و خلاقیت ارزشمند شماست.
              برای اینکه بتوانیم محیط کاری بهتر، فرآیندهای کارآمدتر و
              رضایت بیشتری ایجاد کنیم، به شنیدن صدای واقعی شما نیاز داریم؛
              حتی اگر انتقاد یا پیشنهادی باشد که مطرح‌کردن آن در جلسات
              عادی دشوار است.
            </p>

            <p>
              این صفحه به‌طور ویژه برای شما طراحی شده است تا بتوانید
              به صورت کاملاً ناشناس و بدون هیچ نگرانی از شناسایی،
              هر نظر، انتقاد سازنده یا پیشنهاد خلاقانه‌ای را با ما
              در میان بگذارید.
            </p>

            <p>
              تمامی نظرات با دقت و جدیت بررسی می‌شوند و در صورت امکان،
              اقدامات لازم جهت بهبود شرایط انجام خواهد شد.
              صدای شما برای ما ارزشمند است و می‌تواند نقش مهمی
              در ساختن آینده‌ای بهتر برای سازمان داشته باشد.
            </p>

            <p className="font-medium">
              از همراهی، صداقت و مشارکت ارزشمند شما صمیمانه سپاسگزاریم.
            </p>
          </div>

          {/* Divider */}
          <div className="my-10 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

          {/* Signature */}
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">با احترام</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              هادی حریری
            </p>
            <p className="text-base text-gray-600 mt-1">
              مدیرعامل شرکت عمادآرا پخش تهران
            </p>
          </div>
        </section>

        {/* ===== Sidebar ===== */}
        <aside className="lg:col-span-1">
          <div className="space-y-6 sticky top-6">

            <section className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">درباره سامانه</h3>
              <p className="text-sm text-gray-600 mt-3 leading-6">
                بازخوردها به‌صورت کاملاً ناشناس ذخیره می‌شوند.
                هیچ اطلاعات هویتی ثبت نخواهد شد.
              </p>

              <p className="mt-4 text-sm text-green-600 font-medium">
                تعداد نظرات ثبت‌شده: {commentCount === null ? '—' : commentCount}
              </p>

              <p className="text-xs text-gray-500 mt-2 leading-5">
                نظرات کاربران به صورت عمومی نمایش داده نمی‌شود؛
                تنها مدیرعامل امکان مشاهده آن‌ها را دارد.
              </p>
            </section>

            <section className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              <CommentForm />
            </section>

          </div>
        </aside>
      </main>

      {/* ===== Other Views ===== */}
      {viewState === 'survey' && selectedSurvey && (
        <div className="mt-10">
          <SurveyForm
            survey={selectedSurvey}
            onSubmit={handleSubmitSurvey}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {viewState === 'results' && surveyResults && (
        <div className="mt-10">
          <SurveyResults results={surveyResults} />
        </div>
      )}

      {viewState === 'success' && (
        <div className="mt-10">
          <div className="bg-white rounded-2xl p-10 shadow-lg text-center max-w-xl mx-auto">
            <div className="text-green-600 text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              با تشکر از شما
            </h2>
            <p className="text-gray-600 mb-6">
              نظر شما با موفقیت ثبت شد و با دقت بررسی خواهد شد.
            </p>
            <button
              onClick={handleBackToList}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
            >
              بازگشت به صفحه اصلی
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
);}
