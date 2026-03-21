import { useState } from 'react';
import { Toaster } from 'sonner';
import ExamsView from './ExamsView';
import QuestionsView from './QuestionsView';
import WrongQuestionsView from './WrongQuestionsView';
import ShareView from './ShareView';
import AnalyticsView from './AnalyticsView';

type View = 'exams' | 'questions' | 'wrong' | 'share' | 'analytics';

const SUBJECTS = [
  { name: '数据结构与算法', count: 218, color: 'bg-blue-500' },
  { name: '操作系统', count: 176, color: 'bg-purple-500' },
  { name: '计算机网络', count: 154, color: 'bg-green-500' },
  { name: '数据库系统', count: 143, color: 'bg-orange-500' },
  { name: '计算机组成原理', count: 132, color: 'bg-red-500' },
  { name: '编译原理', count: 98, color: 'bg-cyan-500' },
  { name: '软件工程', count: 87, color: 'bg-yellow-500' },
  { name: '离散数学', count: 76, color: 'bg-pink-500' },
  { name: '人工智能', count: 65, color: 'bg-indigo-500' },
];

const NAV_ITEMS: { id: View; label: string; icon: string; badge?: string; badgeColor?: string }[] = [
  {
    id: 'exams',
    label: '全部试卷',
    icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
    badge: '1,284',
    badgeColor: 'bg-white/20 text-white',
  },
  {
    id: 'questions',
    label: '题目库',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    badge: '32,610',
    badgeColor: 'bg-slate-100 text-slate-500',
  },
  {
    id: 'wrong',
    label: '错题本',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    badge: '23',
    badgeColor: 'bg-yellow-50 text-amber-600',
  },
  {
    id: 'share',
    label: '分享协作',
    icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z',
  },
  {
    id: 'analytics',
    label: '数据分析',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
];

const PAGE_TITLES: Record<View, { title: string; desc: string }> = {
  exams: { title: '全部试卷', desc: '管理、搜索和整理您的所有试卷资源' },
  questions: { title: '题目库', desc: '浏览、搜索和管理所有拆分的题目条目' },
  wrong: { title: '错题本', desc: '查看和复习标记为错误的题目' },
  share: { title: '分享协作', desc: '与同事共享试卷资源，实现团队协作' },
  analytics: { title: '数据分析', desc: '查看试卷管理统计数据和趋势分析' },
};

export default function Index() {
  const [currentView, setCurrentView] = useState<View>('exams');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');

  const page = PAGE_TITLES[currentView];

  const handleNavClick = (view: View) => {
    setCurrentView(view);
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Toaster position="top-right" richColors />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full z-40 w-64 bg-white border-r border-slate-200 flex flex-col overflow-y-auto
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm tracking-tight leading-tight">试卷整理系统</p>
            <p className="text-xs text-slate-400">ExamOrganizer Pro</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-0.5">
          <p className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-widest">主菜单</p>
          {NAV_ITEMS.map(item => {
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                    active ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-100 text-slate-500'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Subject categories */}
          <div className="pt-5 pb-2">
            <p className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-widest">科目分类</p>
          </div>
          {SUBJECTS.map(subject => (
            <button
              key={subject.name}
              onClick={() => handleNavClick('exams')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-900 text-sm transition-all duration-200"
            >
              <span className={`w-2.5 h-2.5 rounded-full ${subject.color} flex-shrink-0`} />
              <span className="truncate">{subject.name}</span>
              <span className="ml-auto text-xs text-slate-400 flex-shrink-0">{subject.count}</span>
            </button>
          ))}
        </nav>

        {/* User profile */}
        <div className="px-4 py-4 border-t border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              李
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">璟延 李</p>
              <p className="text-xs text-slate-400 truncate">教师账户</p>
            </div>
            <button className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 transition-colors" aria-label="设置">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200">
          <div className="flex items-center justify-between h-14 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 flex-1">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1.5 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
                aria-label="菜单"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Search */}
              <div className="relative flex-1 max-w-lg">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="搜索试卷、题目、知识点..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              {/* Notification */}
              <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors" aria-label="通知">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* Upload button */}
              <button
                onClick={() => setCurrentView('exams')}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-all duration-200 hover:-translate-y-px shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="hidden sm:inline">上传试卷</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-7">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{page.title}</h1>
            <p className="text-sm text-slate-500 mt-1">{page.desc}</p>
          </div>

          {currentView === 'exams' && <ExamsView />}
          {currentView === 'questions' && <QuestionsView />}
          {currentView === 'wrong' && <WrongQuestionsView />}
          {currentView === 'share' && <ShareView />}
          {currentView === 'analytics' && <AnalyticsView />}
        </main>
      </div>
    </div>
  );
}
