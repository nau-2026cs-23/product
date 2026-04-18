import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { questionApi } from '@/lib/api';
import type { Question, QuestionType, DifficultyLevel } from '@shared/types/api';

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  single_choice: '单选题',
  multiple_choice: '多选题',
  fill_blank: '填空题',
  short_answer: '简答题',
  essay: '论述题',
};

const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  easy: 'bg-green-50 text-green-700',
  medium: 'bg-yellow-50 text-amber-700',
  hard: 'bg-red-50 text-red-700',
};

export default function WrongQuestionsView() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const limit = 15;

  const loadWrongQuestions = async () => {
    setLoading(true);
    try {
      const res = await questionApi.wrong(page, limit);
      if (res.success) {
        setQuestions(res.data.questions as unknown as Question[]);
        setTotal(res.data.total);
      }
    } catch {
      toast.error('加载错题本失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadWrongQuestions(); }, [page]);

  const handleRemoveWrong = async (q: Question) => {
    try {
      await questionApi.markWrong(q.id, false);
      toast.success('已从错题本移除');
      loadWrongQuestions();
    } catch {
      toast.error('操作失败');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="w-9 h-9 rounded-lg bg-yellow-50 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-slate-900">{total}</p>
          <p className="text-xs font-medium text-slate-500 mt-0.5">错题总数</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {questions.filter(q => (q.wrongCount || 0) >= 3).length}
          </p>
          <p className="text-xs font-medium text-slate-500 mt-0.5">高频错题 (≥ 3次)</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {[...new Set(questions.map(q => q.knowledgePoint).filter(Boolean))].length}
          </p>
          <p className="text-xs font-medium text-slate-500 mt-0.5">涉及知识点</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-slate-900">错题本</h2>
            <span className="text-xs text-amber-700 bg-yellow-50 border border-yellow-100 px-2 py-0.5 rounded-full font-medium">待复习 {total} 题</span>
          </div>
          {total > 0 && (
            <button
              onClick={() => { toast.success('已导出错题本 PDF'); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              导出错题本
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-slate-500">错题本为空</p>
            <p className="text-xs mt-1 text-slate-400">在题目库中标记错题，将自动添加到此处</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {questions.map((q, idx) => (
              <div key={q.id} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-slate-400">#{(page - 1) * limit + idx + 1}</span>
                      <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                        {QUESTION_TYPE_LABELS[q.questionType as QuestionType] || q.questionType}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[q.difficulty as DifficultyLevel] || 'bg-gray-50 text-gray-700'}`}>
                        {DIFFICULTY_LABELS[q.difficulty as DifficultyLevel] || q.difficulty}
                      </span>
                      {q.knowledgePoint && (
                        <span className="text-xs text-primary bg-blue-50 px-2 py-0.5 rounded-full">{q.knowledgePoint}</span>
                      )}
                      {(q.wrongCount || 0) >= 3 && (
                        <span className="text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full">高频错题</span>
                      )}
                      <span className="text-xs text-slate-400">错误 {q.wrongCount || 1} 次</span>
                    </div>
                    <p className="text-sm text-slate-800 leading-relaxed">{q.content}</p>

                    {expandedId === q.id && q.answer && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <p className="text-xs font-semibold text-green-700 mb-1">参考答案</p>
                        <p className="text-xs text-green-800 leading-relaxed">{q.answer}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-2">
                      {q.answer && (
                        <button
                          onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                          className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
                          {expandedId === q.id ? '收起答案' : '查看答案'}
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveWrong(q)}
                        className="text-xs text-slate-400 hover:text-red-500 font-medium transition-colors">
                        移出错题本
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-500">显示 {(page - 1) * limit + 1}–{Math.min(page * limit, total)} 题，共 {total} 题</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-500 hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed">上一页</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-500 hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed">下一页</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
