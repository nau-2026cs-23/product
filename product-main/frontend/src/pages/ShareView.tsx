import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { shareApi, examApi } from '@/lib/api';
import type { SharedResource, Exam } from '@shared/types/api';

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

interface ShareModalProps {
  exams: Exam[];
  onClose: () => void;
  onSuccess: () => void;
}

function ShareModal({ exams, onClose, onSuccess }: ShareModalProps) {
  const [selectedExamId, setSelectedExamId] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamId) { toast.error('请选择要分享的试卷'); return; }
    setLoading(true);
    try {
      await shareApi.create({
        resourceType: 'exam',
        resourceId: selectedExamId,
        description,
      });
      toast.success('分享成功！同事可以查看该试卷');
      onSuccess();
      onClose();
    } catch {
      toast.error('分享失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">分享试卷</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">选择试卷</label>
            <select value={selectedExamId} onChange={e => setSelectedExamId(e.target.value)} required
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white">
              <option value="">请选择试卷</option>
              {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">分享说明（可选）</label>
            <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)}
              placeholder="为这份试卷添加说明..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">取消</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60">
              {loading ? '分享中...' : '确认分享'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ShareView() {
  const [shares, setShares] = useState<SharedResource[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sharesRes, examsRes] = await Promise.all([
        shareApi.list(),
        examApi.list({ limit: 100 }),
      ]);
      if (sharesRes.success) setShares(sharesRes.data as unknown as SharedResource[]);
      if (examsRes.success) setExams(examsRes.data.exams as unknown as Exam[]);
    } catch {
      toast.error('加载分享资源失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('确定要取消分享吗？')) return;
    try {
      await shareApi.delete(id);
      toast.success('已取消分享');
      loadData();
    } catch {
      toast.error('操作失败');
    }
  };

  const colleagues = [
    { name: '张明', role: '数学教师', avatar: '张', shared: 12, color: 'bg-blue-500' },
    { name: '王芳', role: '英语教师', avatar: '王', shared: 8, color: 'bg-purple-500' },
    { name: '刘强', role: '物理教师', avatar: '刘', shared: 15, color: 'bg-green-500' },
    { name: '陈静', role: '化学教师', avatar: '陈', shared: 6, color: 'bg-orange-500' },
  ];

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-slate-900">{shares.length}</p>
          <p className="text-xs font-medium text-slate-500 mt-0.5">已分享资源</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-slate-900">{colleagues.length}</p>
          <p className="text-xs font-medium text-slate-500 mt-0.5">协作同事</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-slate-900">{exams.filter(e => e.isShared).length}</p>
          <p className="text-xs font-medium text-slate-500 mt-0.5">已共享试卷</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shared resources list */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold text-slate-900">共享资源</h2>
                <span className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">{shares.length} 份</span>
              </div>
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                分享试卷
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : shares.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <svg className="w-12 h-12 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <p className="text-sm font-medium">暂无共享资源</p>
                <p className="text-xs mt-1">点击《分享试卷》开始与同事协作</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {shares.map(share => {
                  const exam = exams.find(e => e.id === share.resourceId);
                  const subject = exam?.subject || '';
                  const subjectCls = SUBJECT_COLORS[subject] || 'bg-gray-50 text-gray-700';
                  return (
                    <div key={share.id} className="px-5 py-4 hover:bg-slate-50 transition-colors group">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 leading-tight">{exam?.title || '未知试卷'}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            {subject && <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${subjectCls}`}>{subject}</span>}
                            <span className="text-xs text-slate-400">分享人: {share.sharedByName}</span>
                            <span className="text-xs text-slate-400">{new Date(share.sharedAt).toLocaleDateString('zh-CN')}</span>
                          </div>
                          {share.description && (
                            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{share.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleDelete(share.id)}
                            className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="取消分享">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Colleagues panel */}
        <div>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">协作同事</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {colleagues.map((c, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                  <div className={`w-9 h-9 rounded-full ${c.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                    {c.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{c.shared}</p>
                    <p className="text-xs text-slate-400">共享</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-slate-100">
              <button
                onClick={() => toast.info('邀请功能即将上线')}
                className="w-full px-4 py-2 text-sm font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors">
                + 邀请同事
              </button>
            </div>
          </div>
        </div>
      </div>

      {showShareModal && <ShareModal exams={exams} onClose={() => setShowShareModal(false)} onSuccess={loadData} />}
    </div>
  );
}
