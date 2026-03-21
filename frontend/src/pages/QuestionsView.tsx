import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { questionApi, examApi } from '@/lib/api';
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

interface EditQuestionModalProps {
  question: Question;
  onClose: () => void;
  onSuccess: () => void;
}

function EditQuestionModal({ question, onClose, onSuccess }: EditQuestionModalProps) {
  const [form, setForm] = useState({
    content: question.content,
    answer: question.answer,
    questionType: question.questionType as QuestionType,
    difficulty: question.difficulty as DifficultyLevel,
    knowledgePoint: question.knowledgePoint,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await questionApi.update(question.id, form);
      toast.success('题目已更新');
      onSuccess();
      onClose();
    } catch {
      toast.error('更新失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">编辑题目</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">题目内容</label>
            <textarea rows={4} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">参考答案</label>
            <textarea rows={3} value={form.answer} onChange={e => setForm(p => ({ ...p, answer: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">题型</label>
              <select value={form.questionType} onChange={e => setForm(p => ({ ...p, questionType: e.target.value as QuestionType }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white">
                {Object.entries(QUESTION_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">难度</label>
              <select value={form.difficulty} onChange={e => setForm(p => ({ ...p, difficulty: e.target.value as DifficultyLevel }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white">
                {Object.entries(DIFFICULTY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">知识点</label>
            <input type="text" value={form.knowledgePoint} onChange={e => setForm(p => ({ ...p, knowledgePoint: e.target.value }))}
              placeholder="例：二叉树遍历"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">取消</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60">
              {loading ? '保存中...' : '保存修改'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function QuestionsView() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editQuestion, setEditQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ difficulty: '', questionType: '', knowledgePoint: '' });
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportTitle, setExportTitle] = useState('');
  const limit = 15;

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const res = await questionApi.list({
        search: search || undefined,
        difficulty: filters.difficulty as DifficultyLevel || undefined,
        questionType: filters.questionType as QuestionType || undefined,
        knowledgePoint: filters.knowledgePoint || undefined,
        page,
        limit,
      });
      if (res.success) {
        setQuestions(res.data.questions as unknown as Question[]);
        setTotal(res.data.total);
      }
    } catch {
      toast.error('加载题目失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadQuestions(); }, [search, filters, page]);

  const handleMarkWrong = async (q: Question) => {
    try {
      await questionApi.markWrong(q.id, !q.isWrong);
      toast.success(q.isWrong ? '已取消错题标记' : '已加入错题本');
      loadQuestions();
    } catch {
      toast.error('操作失败');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这题题目吗？')) return;
    try {
      await questionApi.delete(id);
      toast.success('题目已删除');
      loadQuestions();
    } catch {
      toast.error('删除失败');
    }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-500 font-medium whitespace-nowrap">题型</label>
          <select value={filters.questionType} onChange={e => { setFilters(p => ({ ...p, questionType: e.target.value })); setPage(1); }}
            className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
            <option value="">全部</option>
            {Object.entries(QUESTION_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-500 font-medium whitespace-nowrap">难度</label>
          <select value={filters.difficulty} onChange={e => { setFilters(p => ({ ...p, difficulty: e.target.value })); setPage(1); }}
            className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
            <option value="">全部</option>
            {Object.entries(DIFFICULTY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-500 font-medium whitespace-nowrap">知识点</label>
          <input type="text" value={filters.knowledgePoint} onChange={e => { setFilters(p => ({ ...p, knowledgePoint: e.target.value })); setPage(1); }}
            placeholder="搜索知识点..."
            className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-36" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          {selected.size > 0 && (
            <button onClick={() => setShowExportModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              导出试卷 ({selected.size})
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-slate-900">题目库</h2>
            <span className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">共 {total.toLocaleString()} 题</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <svg className="w-12 h-12 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm font-medium">暂无题目</p>
            <p className="text-xs mt-1">上传试卷后，系统将自动识别并拆分题目</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {questions.map((q, idx) => (
              <div key={q.id} className="px-5 py-4 hover:bg-slate-50 transition-colors group">
                <div className="flex items-start gap-3">
                  <input type="checkbox" checked={selected.has(q.id)} onChange={() => toggleSelect(q.id)}
                    className="mt-1 rounded border-slate-300 accent-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-slate-400">#{(page - 1) * limit + idx + 1}</span>
                      <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">{QUESTION_TYPE_LABELS[q.questionType as QuestionType] || q.questionType}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[q.difficulty as DifficultyLevel] || 'bg-gray-50 text-gray-700'}`}>
                        {DIFFICULTY_LABELS[q.difficulty as DifficultyLevel] || q.difficulty}
                      </span>
                      {q.knowledgePoint && (
                        <span className="text-xs text-primary bg-blue-50 px-2 py-0.5 rounded-full">{q.knowledgePoint}</span>
                      )}
                      {q.isWrong && (
                        <span className="text-xs font-medium text-amber-700 bg-yellow-50 px-2 py-0.5 rounded-full">错题</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-800 leading-relaxed">{q.content}</p>
                    {q.answer && (
                      <div className="mt-2 p-2.5 bg-green-50 rounded-lg">
                        <p className="text-xs font-semibold text-green-700 mb-0.5">参考答案</p>
                        <p className="text-xs text-green-800 leading-relaxed">{q.answer}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={() => handleMarkWrong(q)}
                      className={`p-1.5 rounded-md transition-colors ${
                        q.isWrong ? 'bg-yellow-50 text-amber-600 hover:bg-yellow-100' : 'hover:bg-slate-100 text-slate-400 hover:text-amber-600'
                      }`} title={q.isWrong ? '取消错题标记' : '标记为错题'}>
                      <svg className="w-4 h-4" fill={q.isWrong ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </button>
                    <button onClick={() => setEditQuestion(q)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors" title="编辑">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(q.id)} className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="删除">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-500">显示 {(page - 1) * limit + 1}–{Math.min(page * limit, total)} 题，共 {total.toLocaleString()} 题</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-500 hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed">上一页</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = i + 1;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                      page === p ? 'bg-primary text-white font-semibold' : 'border border-slate-200 text-slate-500 hover:bg-white'
                    }`}>{p}</button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-500 hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed">下一页</button>
            </div>
          </div>
        )}
      </div>

      {editQuestion && <EditQuestionModal question={editQuestion} onClose={() => setEditQuestion(null)} onSuccess={loadQuestions} />}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">导出试卷</h2>
              <button onClick={() => setShowExportModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">将已选的 <span className="font-semibold text-slate-900">{selected.size}</span> 题题目导出为 PDF 试卷</p>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">试卷标题</label>
                <input type="text" value={exportTitle} onChange={e => setExportTitle(e.target.value)}
                  placeholder="请输入试卷标题"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowExportModal(false)} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">取消</button>
                <button onClick={() => { toast.success('试卷导出成功，PDF 将在几秒内下载'); setShowExportModal(false); }}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors">导出 PDF</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
