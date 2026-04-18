import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { examApi, questionApi } from '@/lib/api';

const SUBJECT_COLORS = [
  { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-700' },
  { bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-700' },
  { bg: 'bg-green-500', light: 'bg-green-50', text: 'text-green-700' },
  { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-700' },
  { bg: 'bg-red-500', light: 'bg-red-50', text: 'text-red-700' },
  { bg: 'bg-cyan-500', light: 'bg-cyan-50', text: 'text-cyan-700' },
  { bg: 'bg-yellow-500', light: 'bg-yellow-50', text: 'text-yellow-700' },
  { bg: 'bg-pink-500', light: 'bg-pink-50', text: 'text-pink-700' },
  { bg: 'bg-indigo-500', light: 'bg-indigo-50', text: 'text-indigo-700' },
];

interface SubjectStat {
  subject: string;
  examCount: number;
  questionCount: number;
  color: typeof SUBJECT_COLORS[0];
}

export default function AnalyticsView() {
  const [stats, setStats] = useState({
    total: 0, recognized: 0, processing: 0, failed: 0, totalQuestions: 0, subjectMap: {} as Record<string, number>,
  });
  const [wrongTotal, setWrongTotal] = useState(0);
  const [questionStats, setQuestionStats] = useState({
    total: 0,
    wrongCount: 0,
    difficultyStats: {} as Record<string, number>,
    typeStats: {} as Record<string, number>,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [statsRes, wrongRes, questionStatsRes] = await Promise.all([
          examApi.stats(),
          questionApi.wrong(1, 1),
          questionApi.stats(),
        ]);
        if (statsRes.success) setStats(statsRes.data);
        if (wrongRes.success) setWrongTotal(wrongRes.data.total);
        if (questionStatsRes.success) setQuestionStats(questionStatsRes.data);
      } catch {
        toast.error('加载数据失败');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const subjectStats: SubjectStat[] = Object.entries(stats.subjectMap)
    .map(([subject, examCount], i) => ({
      subject,
      examCount,
      questionCount: Math.round(examCount * 25),
      color: SUBJECT_COLORS[i % SUBJECT_COLORS.length],
    }))
    .sort((a, b) => b.examCount - a.examCount);

  const maxExamCount = Math.max(...subjectStats.map(s => s.examCount), 1);

  const recognitionRate = stats.total > 0 ? Math.round((stats.recognized / stats.total) * 100) : 0;

  const kpiCards = [
    {
      label: '试卷总数', value: stats.total.toLocaleString(),
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      iconBg: 'bg-blue-50', iconColor: 'text-primary',
      sub: `已识别 ${stats.recognized} 份`, subColor: 'text-green-600',
    },
    {
      label: '题目总数', value: stats.totalQuestions.toLocaleString(),
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      iconBg: 'bg-purple-50', iconColor: 'text-purple-600',
      sub: `识别准确率 ${recognitionRate}%`, subColor: recognitionRate >= 90 ? 'text-green-600' : 'text-amber-600',
    },
    {
      label: '错题记录', value: wrongTotal.toLocaleString(),
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      iconBg: 'bg-yellow-50', iconColor: 'text-amber-600',
      sub: '待复习题目', subColor: 'text-amber-600',
    },
    {
      label: '识别失败', value: stats.failed.toLocaleString(),
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      iconBg: 'bg-red-50', iconColor: 'text-red-500',
      sub: '需要重新识别', subColor: 'text-red-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpiCards.map((card, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
            <div className="mb-3">
              <div className={`w-9 h-9 rounded-lg ${card.iconBg} flex items-center justify-center`}>
                <svg className={`w-5 h-5 ${card.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">{card.value}</p>
            <p className="text-xs font-medium text-slate-500 mt-0.5">{card.label}</p>
            <p className={`text-xs mt-2 font-medium ${card.subColor}`}>{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: '题目总数', value: questionStats.total.toLocaleString(),
            icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
            iconBg: 'bg-purple-50', iconColor: 'text-purple-600',
            sub: '所有科目题目', subColor: 'text-slate-600',
          },
          {
            label: '错题数量', value: questionStats.wrongCount.toLocaleString(),
            icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
            iconBg: 'bg-yellow-50', iconColor: 'text-amber-600',
            sub: '标记的错题', subColor: 'text-amber-600',
          },
          {
            label: '题型种类', value: Object.keys(questionStats.typeStats).length.toLocaleString(),
            icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
            iconBg: 'bg-green-50', iconColor: 'text-green-600',
            sub: '不同题型数量', subColor: 'text-green-600',
          },
          {
            label: '难度分布', value: Object.keys(questionStats.difficultyStats).length.toLocaleString(),
            icon: 'M13 10V3L4 14h7v7l9-11h-7z',
            iconBg: 'bg-blue-50', iconColor: 'text-blue-600',
            sub: '不同难度等级', subColor: 'text-blue-600',
          },
        ].map((card, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
            <div className="mb-3">
              <div className={`w-9 h-9 rounded-lg ${card.iconBg} flex items-center justify-center`}>
                <svg className={`w-5 h-5 ${card.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">{card.value}</p>
            <p className="text-xs font-medium text-slate-500 mt-0.5">{card.label}</p>
            <p className={`text-xs mt-2 font-medium ${card.subColor}`}>{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject distribution */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">科目分布</h2>
            <p className="text-xs text-slate-400 mt-0.5">各科目试卷数量占比</p>
          </div>
          <div className="p-5">
            {subjectStats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <p className="text-sm">暂无数据</p>
              </div>
            ) : (
              <div className="space-y-3">
                {subjectStats.map((s, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${s.color.bg} flex-shrink-0`} />
                        <span className="text-sm text-slate-700 font-medium">{s.subject}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">{s.examCount} 份</span>
                        <span className="text-xs font-semibold text-slate-700">{Math.round((s.examCount / stats.total) * 100)}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${s.color.bg} rounded-full transition-all duration-500`}
                        style={{ width: `${(s.examCount / maxExamCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recognition status */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">OCR 识别状态</h2>
            <p className="text-xs text-slate-400 mt-0.5">试卷识别处理情况</p>
          </div>
          <div className="p-5">
            {stats.total === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <p className="text-sm">暂无数据</p>
              </div>
            ) : (
              <>
                {/* Donut-like visual */}
                <div className="flex items-center justify-center mb-6">
                  <div className="relative w-32 h-32">
                    <svg viewBox="0 0 36 36" className="w-32 h-32 -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#22c55e" strokeWidth="3"
                        strokeDasharray={`${(stats.recognized / stats.total) * 100} 100`}
                        strokeLinecap="round" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f59e0b" strokeWidth="3"
                        strokeDasharray={`${(stats.processing / stats.total) * 100} 100`}
                        strokeDashoffset={`${-((stats.recognized / stats.total) * 100)}`}
                        strokeLinecap="round" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#ef4444" strokeWidth="3"
                        strokeDasharray={`${(stats.failed / stats.total) * 100} 100`}
                        strokeDashoffset={`${-(((stats.recognized + stats.processing) / stats.total) * 100)}`}
                        strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-2xl font-bold text-slate-900">{recognitionRate}%</p>
                      <p className="text-xs text-slate-400">准确率</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { label: '已识别', count: stats.recognized, color: 'bg-green-500', textColor: 'text-green-700' },
                    { label: '识别中', count: stats.processing, color: 'bg-amber-500', textColor: 'text-amber-700' },
                    { label: '识别失败', count: stats.failed, color: 'bg-red-500', textColor: 'text-red-700' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                        <span className="text-sm text-slate-600">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${item.textColor}`}>{item.count}</span>
                        <span className="text-xs text-slate-400">({Math.round((item.count / stats.total) * 100)}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Question difficulty distribution */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">题目难度分布</h2>
            <p className="text-xs text-slate-400 mt-0.5">不同难度级别的题目数量</p>
          </div>
          <div className="p-5">
            {Object.keys(questionStats.difficultyStats).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <p className="text-sm">暂无数据</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(questionStats.difficultyStats)
                  .sort((a, b) => b[1] - a[1])
                  .map(([difficulty, count], i) => {
                    const maxCount = Math.max(...Object.values(questionStats.difficultyStats));
                    const difficultyColors = {
                      easy: 'bg-green-500',
                      medium: 'bg-amber-500',
                      hard: 'bg-red-500',
                    };
                    const difficultyLabels = {
                      easy: '简单',
                      medium: '中等',
                      hard: '困难',
                    };
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${difficultyColors[difficulty as keyof typeof difficultyColors] || 'bg-slate-500'} flex-shrink-0`} />
                            <span className="text-sm text-slate-700 font-medium">{difficultyLabels[difficulty as keyof typeof difficultyLabels] || difficulty}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-400">{count} 题</span>
                            <span className="text-xs font-semibold text-slate-700">{Math.round((count / questionStats.total) * 100)}%</span>
                          </div>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${difficultyColors[difficulty as keyof typeof difficultyColors] || 'bg-slate-500'} rounded-full transition-all duration-500`}
                            style={{ width: `${(count / maxCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* Question type distribution */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">题目类型分布</h2>
            <p className="text-xs text-slate-400 mt-0.5">不同题型的题目数量</p>
          </div>
          <div className="p-5">
            {Object.keys(questionStats.typeStats).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <p className="text-sm">暂无数据</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(questionStats.typeStats)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count], i) => {
                    const maxCount = Math.max(...Object.values(questionStats.typeStats));
                    const typeColors = [
                      'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500',
                      'bg-red-500', 'bg-cyan-500', 'bg-yellow-500', 'bg-pink-500',
                    ];
                    const typeLabels = {
                      single_choice: '单选题',
                      multiple_choice: '多选题',
                      true_false: '判断题',
                      short_answer: '简答题',
                      essay: '论述题',
                    };
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${typeColors[i % typeColors.length]} flex-shrink-0`} />
                            <span className="text-sm text-slate-700 font-medium">{typeLabels[type as keyof typeof typeLabels] || type}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-400">{count} 题</span>
                            <span className="text-xs font-semibold text-slate-700">{Math.round((count / questionStats.total) * 100)}%</span>
                          </div>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${typeColors[i % typeColors.length]} rounded-full transition-all duration-500`}
                            style={{ width: `${(count / maxCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* Monthly trend (static demo) */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm lg:col-span-2">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">上传趋势</h2>
            <p className="text-xs text-slate-400 mt-0.5">近 6 个月试卷上传量</p>
          </div>
          <div className="p-5">
            <div className="flex items-end gap-3 h-32">
              {[
                { month: '10月', count: 42 },
                { month: '11月', count: 58 },
                { month: '12月', count: 35 },
                { month: '1月', count: 67 },
                { month: '2月', count: 89 },
                { month: '3月', count: stats.total > 0 ? Math.min(stats.total, 120) : 48 },
              ].map((item, i, arr) => {
                const maxCount = Math.max(...arr.map(a => a.count));
                const heightPct = (item.count / maxCount) * 100;
                const isLast = i === arr.length - 1;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-semibold text-slate-600">{item.count}</span>
                    <div className="w-full rounded-t-md transition-all duration-500" style={{ height: `${heightPct}%`, backgroundColor: isLast ? 'oklch(0.45 0.18 264)' : '#e2e8f0' }} />
                    <span className="text-xs text-slate-400">{item.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
