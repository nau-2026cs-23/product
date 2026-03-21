import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { examApi } from '@/lib/api';
import type { Exam, ExamStatus } from '@shared/types/api';

const SUBJECTS = [
  '数据结构与算法', '操作系统', '计算机网络', '数据库系统',
  '计算机组成原理', '编译原理', '软件工程', '离散数学', '人工智能',
];
const SEMESTERS = ['大一上', '大一下', '大二上', '大二下', '大三上', '大三下', '大四上'];
const YEARS = [2026, 2025, 2024, 2023, 2022];

const SUBJECT_COLORS: Record<string, string> = {
  '数据结构与算法': 'bg-blue-50 text-blue-700',
  '操作系统': 'bg-purple-50 text-purple-700',
  '计算机网络': 'bg-green-50 text-green-700',
  '数据库系统': 'bg-orange-50 text-orange-700',
  '计算机组成原理': 'bg-red-50 text-red-700',
  '编译原理': 'bg-cyan-50 text-cyan-700',
  '软件工程': 'bg-yellow-50 text-yellow-700',
  '离散数学': 'bg-pink-50 text-pink-700',
  '人工智能': 'bg-indigo-50 text-indigo-700',
};

const SUBJECT_DOT: Record<string, string> = {
  '数据结构与算法': 'bg-blue-500',
  '操作系统': 'bg-purple-500',
  '计算机网络': 'bg-green-500',
  '数据库系统': 'bg-orange-500',
  '计算机组成原理': 'bg-red-500',
  '编译原理': 'bg-cyan-500',
  '软件工程': 'bg-yellow-500',
  '离散数学': 'bg-pink-500',
  '人工智能': 'bg-indigo-500',
};

function StatusBadge({ status }: { status: ExamStatus }) {
  if (status === 'recognized') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        已识别
      </span>
    );
  }
  if (status === 'processing') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-yellow-50 px-2.5 py-1 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        识别中
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50 px-2.5 py-1 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
      识别失败
    </span>
  );
}

function SubjectBadge({ subject }: { subject: string }) {
  const cls = SUBJECT_COLORS[subject] || 'bg-gray-50 text-gray-700';
  const dot = SUBJECT_DOT[subject] || 'bg-gray-500';
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {subject}
    </span>
  );
}

interface UploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function UploadModal({ onClose, onSuccess }: UploadModalProps) {
  const [form, setForm] = useState({
    title: '', subject: '', grade: '', year: new Date().getFullYear(), semester: '', fileType: 'pdf' as const,
  });
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files).filter(f =>
      ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(f.type)
    );
    setFiles(prev => [...prev, ...dropped].slice(0, 20));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selected].slice(0, 20));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.subject) {
      toast.error('请填写试卷名称和科目');
      return;
    }
    setLoading(true);
    try {
      const fileType = files[0]?.type === 'application/pdf' ? 'pdf' :
        files[0]?.type === 'image/png' ? 'png' : 'jpg';
      await examApi.create({
        title: form.title,
        subject: form.subject,
        grade: form.grade,
        year: form.year,
        semester: form.semester,
        fileType: fileType as 'pdf' | 'jpg' | 'png',
        fileSize: files.reduce((s, f) => s + f.size, 0),
        filePath: files[0]?.name || '',
      });
      toast.success('试卷上传成功', { description: '系统正在进行OCR识别，请稍候' });
      onSuccess();
      onClose();
    } catch {
      toast.error('上传失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">上传试卷</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              dragging ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/40 hover:bg-primary/[0.02]'
            }`}
          >
            <input ref={fileRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileChange} />
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-700">
              拖拽文件到此处，或 <span className="text-primary">点击选择</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">支持 PDF、JPG、PNG · 最多20份 · 单文件最大50MB</p>
            {files.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
                {files.map((f, i) => (
                  <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{f.name}</span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">试卷名称 *</label>
            <input
              type="text" required
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="例：2026年数据结构期末考试卷"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">科目 *</label>
              <select
                required value={form.subject}
                onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
              >
                <option value="">请选择科目</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">年份</label>
              <select
                value={form.year}
                onChange={e => setForm(p => ({ ...p, year: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
              >
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">学期</label>
              <select
                value={form.semester}
                onChange={e => setForm(p => ({ ...p, semester: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
              >
                <option value="">请选择学期</option>
                {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">年级</label>
              <input
                type="text"
                value={form.grade}
                onChange={e => setForm(p => ({ ...p, grade: e.target.value }))}
                placeholder="例：大二"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              取消
            </button>
            <button
              type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {loading ? '上传中...' : '确认上传'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface EditModalProps {
  exam: Exam;
  onClose: () => void;
  onSuccess: () => void;
}

function EditModal({ exam, onClose, onSuccess }: EditModalProps) {
  const [form, setForm] = useState({
    title: exam.title,
    subject: exam.subject,
    grade: exam.grade,
    year: exam.year,
    semester: exam.semester,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await examApi.update(exam.id, form);
      toast.success('试卷信息已更新');
      onSuccess();
      onClose();
    } catch {
      toast.error('更新失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">编辑试卷信息</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">试卷名称</label>
            <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">科目</label>
              <select value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white">
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">年份</label>
              <select value={form.year} onChange={e => setForm(p => ({ ...p, year: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white">
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">学期</label>
              <select value={form.semester} onChange={e => setForm(p => ({ ...p, semester: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white">
                <option value="">请选择</option>
                {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">年级</label>
              <input type="text" value={form.grade} onChange={e => setForm(p => ({ ...p, grade: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
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

export default function ExamsView() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [editExam, setEditExam] = useState<Exam | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ subject: '', semester: '', year: '', status: '' });
  const [stats, setStats] = useState({ total: 0, totalQuestions: 0, wrongCount: 0, shared: 0 });
  const limit = 10;

  const loadExams = async () => {
    setLoading(true);
    try {
      const res = await examApi.list({
        search: search || undefined,
        subject: filters.subject || undefined,
        semester: filters.semester || undefined,
        year: filters.year ? parseInt(filters.year) : undefined,
        status: filters.status as 'recognized' | 'processing' | 'failed' | undefined,
        page,
        limit,
      });
      if (res.success) {
        setExams(res.data.exams as unknown as Exam[]);
        setTotal(res.data.total);
      }
    } catch {
      toast.error('加载试卷列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await examApi.stats();
      if (res.success) {
        setStats({
          total: res.data.total,
          totalQuestions: res.data.totalQuestions,
          wrongCount: 0,
          shared: 0,
        });
      }
    } catch { /* ignore */ }
  };

  useEffect(() => { loadExams(); }, [search, filters, page]);
  useEffect(() => { loadStats(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这份试卷吗？')) return;
    try {
      await examApi.delete(id);
      toast.success('试卷已删除');
      loadExams();
      loadStats();
    } catch {
      toast.error('删除失败');
    }
  };

  const handleRetry = async (id: string) => {
    try {
      await examApi.update(id, { status: 'processing' });
      toast.success('已重新提交识别');
      loadExams();
    } catch {
      toast.error('操作失败');
    }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === exams.length) setSelected(new Set());
    else setSelected(new Set(exams.map(e => e.id)));
  };

  const totalPages = Math.ceil(total / limit);

  const statCards = [
    { label: '试卷总数', value: stats.total.toLocaleString(), icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', iconBg: 'bg-blue-50', iconColor: 'text-primary', sub: '本月新增 48 份', subColor: 'text-green-600' },
    { label: '题目总数', value: stats.totalQuestions.toLocaleString(), icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', iconBg: 'bg-purple-50', iconColor: 'text-purple-600', sub: '识别准确率 92%', subColor: 'text-green-600' },
    { label: '错题记录', value: '156', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', iconBg: 'bg-yellow-50', iconColor: 'text-amber-600', sub: '待复习 23 题', subColor: 'text-amber-600' },
    { label: '共享资源', value: '89', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', iconBg: 'bg-green-50', iconColor: 'text-green-600', sub: '来自 12 位同事', subColor: 'text-slate-400' },
  ];

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, i) => (
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

      {/* Upload drop zone */}
      <div
        onClick={() => setShowUpload(true)}
        className="mb-6 border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-primary/40 hover:bg-primary/[0.02] transition-all duration-300 cursor-pointer group"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary/[0.08] flex items-center justify-center group-hover:bg-primary/[0.15] transition-colors">
            <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">拖拽文件到此处，或 <span className="text-primary underline underline-offset-2">点击上传</span></p>
            <p className="text-xs text-slate-400 mt-1.5">支持 PDF、JPG、PNG 格式 · 单次最多上传 20 份 · 最大 50MB</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {['PDF', 'JPG / PNG'].map(t => (
              <span key={t} className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full">{t}</span>
            ))}
            <span className="inline-flex items-center gap-1 text-xs text-primary bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full font-medium">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              OCR 自动识别
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-500 font-medium whitespace-nowrap">科目</label>
          <select value={filters.subject} onChange={e => { setFilters(p => ({ ...p, subject: e.target.value })); setPage(1); }}
            className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
            <option value="">全部</option>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-500 font-medium whitespace-nowrap">学期</label>
          <select value={filters.semester} onChange={e => { setFilters(p => ({ ...p, semester: e.target.value })); setPage(1); }}
            className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
            <option value="">全部</option>
            {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-500 font-medium whitespace-nowrap">年份</label>
          <select value={filters.year} onChange={e => { setFilters(p => ({ ...p, year: e.target.value })); setPage(1); }}
            className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
            <option value="">全部</option>
            {YEARS.map(y => <option key={y} value={String(y)}>{y}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-500 font-medium whitespace-nowrap">状态</label>
          <select value={filters.status} onChange={e => { setFilters(p => ({ ...p, status: e.target.value })); setPage(1); }}
            className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
            <option value="">全部</option>
            <option value="recognized">已识别</option>
            <option value="processing">识别中</option>
            <option value="failed">识别失败</option>
          </select>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {selected.size > 0 && (
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              批量导出 ({selected.size})
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-slate-900">最近上传</h2>
            <span className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">共 {total.toLocaleString()} 份</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : exams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <svg className="w-12 h-12 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm font-medium">暂无试卷</p>
            <p className="text-xs mt-1">点击上方区域上传您的第一份试卷</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 w-10">
                    <input type="checkbox" checked={selected.size === exams.length && exams.length > 0} onChange={toggleAll}
                      className="rounded border-slate-300 accent-primary" />
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">试卷名称</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">科目</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">学期</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">题目数</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">上传时间</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">状态</th>
                  <th className="px-5 py-3 w-28" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exams.map(exam => (
                  <tr key={exam.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-5 py-4">
                      <input type="checkbox" checked={selected.has(exam.id)} onChange={() => toggleSelect(exam.id)}
                        className="rounded border-slate-300 accent-primary" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${exam.fileType === 'pdf' ? 'bg-red-50' : 'bg-blue-50'}`}>
                          <svg className={`w-4 h-4 ${exam.fileType === 'pdf' ? 'text-red-500' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {exam.fileType === 'pdf'
                              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            }
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm leading-tight">{exam.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{exam.fileType.toUpperCase()} · {(exam.fileSize / 1024 / 1024).toFixed(1)} MB</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <SubjectBadge subject={exam.subject} />
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell text-sm text-slate-500">{exam.semester || '—'}</td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-sm font-medium text-slate-900">{exam.questionCount}</span>
                      <span className="text-xs text-slate-400 ml-1">题</span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell text-sm text-slate-500">
                      {new Date(exam.uploadedAt).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={exam.status as ExamStatus} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditExam(exam)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors" title="编辑">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        {exam.status === 'failed' && (
                          <button onClick={() => handleRetry(exam.id)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors" title="重新识别">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                          </button>
                        )}
                        <button onClick={() => handleDelete(exam.id)} className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="删除">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-500">显示 {(page - 1) * limit + 1}–{Math.min(page * limit, total)} 条，共 {total.toLocaleString()} 条</p>
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

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onSuccess={() => { loadExams(); loadStats(); }} />}
      {editExam && <EditModal exam={editExam} onClose={() => setEditExam(null)} onSuccess={loadExams} />}
    </div>
  );
}
