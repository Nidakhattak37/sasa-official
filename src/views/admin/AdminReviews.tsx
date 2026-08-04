import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Review } from '../../types';
import { Star, CheckCircle, XCircle, Trash2, MessageSquareReply, X } from 'lucide-react';

export const AdminReviews: React.FC = () => {
  const { reviews, updateReviewStatus, addAdminReply, deleteReview } = useApp();

  const [replyingReview, setReplyingReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingReview || !replyText) return;
    addAdminReply(replyingReview.id, replyText);
    setReplyingReview(null);
    setReplyText('');
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      <div className="border-b border-[#EAE4DC] pb-4">
        <h2 className="font-serif text-2xl font-bold text-[#222]">Customer Review Moderation</h2>
        <p className="text-xs text-gray-500">Approve user feedback, reply directly to patrons, and purge inappropriate posts.</p>
      </div>

      <div className="bg-white border border-[#EAE4DC] rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#FAFAFA] text-[#222] border-b border-[#EAE4DC] font-bold uppercase tracking-wider text-[11px]">
              <th className="p-3">Product</th>
              <th className="p-3">Patron Name</th>
              <th className="p-3">Rating</th>
              <th className="p-3">Feedback Comment</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Moderation Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2F2F2]">
            {reviews.map(r => (
              <tr key={r.id} className="hover:bg-[#FAFAFA]">
                <td className="p-3 font-semibold text-[#222]">{r.productName}</td>
                <td className="p-3">
                  <strong className="block text-[#222]">{r.customerName}</strong>
                  <span className="text-[10px] text-gray-400">{r.customerEmail}</span>
                </td>
                <td className="p-3 font-bold text-[#D4AF37]">⭐ {r.rating}/5</td>
                <td className="p-3 text-gray-700 italic max-w-xs">
                  "{r.comment}"
                  {r.adminReply && (
                    <div className="mt-1 p-2 bg-[#F5F1EC] rounded text-[11px] not-italic text-[#222]">
                      <strong>SASA Response:</strong> {r.adminReply}
                    </div>
                  )}
                </td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    r.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {r.status}
                  </span>
                </td>
                <td className="p-3 text-right space-x-1">
                  {r.status === 'Pending' && (
                    <button
                      onClick={() => updateReviewStatus(r.id, 'Approved')}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                      title="Approve Review"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setReplyingReview(r);
                      setReplyText(r.adminReply || '');
                    }}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                    title="Reply to Patron"
                  >
                    <MessageSquareReply className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteReview(r.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    title="Delete Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {replyingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif text-lg font-bold text-[#222]">Reply to Patron Review</h3>
              <button onClick={() => setReplyingReview(null)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendReply} className="space-y-3 text-xs">
              <div className="p-3 bg-[#FAFAFA] rounded border text-gray-600 italic">
                "{replyingReview.comment}"
              </div>

              <div>
                <label className="block font-semibold mb-1">Official SASA Response</label>
                <textarea
                  rows={3}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Thank you for your valuable feedback..."
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReplyingReview(null)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#222] text-white font-semibold rounded hover:bg-[#9E8055]"
                >
                  Publish Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
