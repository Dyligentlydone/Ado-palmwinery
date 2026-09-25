import { useEffect, useState } from 'react';
import { Trash2, MailOpen, Mail } from 'lucide-react';
import { adminAPI } from '../../services/api';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchMessages = () => {
    setLoading(true);
    adminAPI.getMessages()
      .then(r => setMessages(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMessages(); }, []);

  const handleOpen = async (m: ContactMessage) => {
    setExpandedId(expandedId === m.id ? null : m.id);
    if (!m.isRead) {
      try {
        await adminAPI.markMessageRead(m.id, true);
        setMessages(prev => prev.map(x => x.id === m.id ? { ...x, isRead: true } : x));
      } catch (err) {
        console.error('Mark read failed:', err);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    try {
      await adminAPI.deleteMessage(id);
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const unread = messages.filter(m => !m.isRead).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        {unread > 0 && (
          <span className="text-sm bg-primary-50 text-primary-700 font-medium px-3 py-1 rounded-full">
            {unread} unread
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-lg h-16 animate-pulse" />)}
        </div>
      ) : messages.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No messages yet</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
          {messages.map(m => (
            <div key={m.id}>
              <button
                onClick={() => handleOpen(m)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-4"
              >
                <span className={m.isRead ? 'text-gray-300' : 'text-primary-600'}>
                  {m.isRead ? <MailOpen size={18} /> : <Mail size={18} />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${m.isRead ? 'text-gray-600' : 'font-semibold text-gray-900'}`}>
                    {m.name} — {m.subject || '(no subject)'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{m.email}</p>
                </div>
                <span className="text-xs text-gray-400 shrink-0">
                  {new Date(m.createdAt).toLocaleDateString()}
                </span>
              </button>
              {expandedId === m.id && (
                <div className="px-4 pb-4 pl-11">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-4">
                    {m.message}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <a href={`mailto:${m.email}`} className="text-xs text-primary-600 font-medium hover:underline">
                      Reply via email →
                    </a>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="flex items-center gap-1 text-xs text-red-600 hover:underline"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
