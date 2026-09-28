import React, { useState, useEffect } from 'react';
import { CommentItem, ReporterApplication } from '../types';
import { db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { 
  MessageSquare, 
  Heart, 
  Reply, 
  Trash2, 
  Send, 
  LogIn, 
  ShieldAlert, 
  ShieldCheck, 
  User, 
  CornerDownRight, 
  Clock, 
  AlertCircle
} from 'lucide-react';

interface ArticleCommentsSectionProps {
  articleId: string;
  articleTitle: string;
  loggedInReporter: ReporterApplication | null;
  isAdminLoggedIn: boolean;
  onNavigateLogin: () => void;
  onSuccessToast?: (msg: string) => void;
}

export const ArticleCommentsSection: React.FC<ArticleCommentsSectionProps> = ({
  articleId,
  articleTitle,
  loggedInReporter,
  isAdminLoggedIn,
  onNavigateLogin,
  onSuccessToast,
}) => {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [readerName, setReaderName] = useState('');

  // Determine current active user identity
  const currentUserId = isAdminLoggedIn
    ? 'admin-ddn'
    : loggedInReporter
    ? loggedInReporter.id
    : readerName.trim()
    ? `reader-${readerName.trim().toLowerCase().replace(/\s+/g, '-')}`
    : null;

  const currentUserName = isAdminLoggedIn
    ? 'एडमिन डेस्क (Editorial Desk)'
    : loggedInReporter
    ? loggedInReporter.fullName
    : readerName.trim() || 'पाठक';

  const currentUserRole: 'admin' | 'reporter' | 'reader' = isAdminLoggedIn
    ? 'admin'
    : loggedInReporter
    ? 'reporter'
    : 'reader';

  const currentUserPhoto = isAdminLoggedIn
    ? undefined
    : loggedInReporter
    ? loggedInReporter.photoUrl
    : undefined;

  // Real-time Firestore comments listener
  useEffect(() => {
    if (!articleId) return;

    try {
      const q = query(
        collection(db, 'comments'),
        where('articleId', '==', articleId)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const loaded: CommentItem[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<CommentItem, 'id'>),
        }));

        // Sort comments: oldest first or newest first
        loaded.sort((a, b) => a.createdAt - b.createdAt);
        setComments(loaded);
      }, (err) => {
        console.error('Comments snapshot error:', err);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up comments listener:', err);
    }
  }, [articleId]);

  // Handle posting top-level comment
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    // Must have user identity
    if (!isAdminLoggedIn && !loggedInReporter && !readerName.trim()) {
      alert('कृपया टिप्पणी करने के लिए अपना नाम लिखें या लॉगिन करें।');
      return;
    }

    setSubmitting(true);
    try {
      const commentPayload: Omit<CommentItem, 'id'> = {
        articleId,
        authorId: currentUserId || `user-${Date.now()}`,
        authorName: currentUserName,
        authorRole: currentUserRole,
        authorPhotoUrl: currentUserPhoto,
        authorDistrict: loggedInReporter?.district,
        content: newCommentText.trim(),
        likes: 0,
        likedBy: [],
        parentId: null,
        createdAt: Date.now(),
      };

      await addDoc(collection(db, 'comments'), commentPayload);
      setNewCommentText('');
      if (onSuccessToast) onSuccessToast('आपकी टिप्पणी सफलतापूर्वक पोस्ट हो गई!');
    } catch (err: any) {
      console.error('Error posting comment:', err);
      alert('टिप्पणी पोस्ट करने में त्रुटि: ' + (err.message || 'पुनः प्रयास करें'));
    } finally {
      setSubmitting(false);
    }
  };

  // Handle posting reply
  const handlePostReply = async (parentId: string) => {
    if (!replyText.trim()) return;

    if (!isAdminLoggedIn && !loggedInReporter && !readerName.trim()) {
      alert('कृपया जवाब देने के लिए अपना नाम लिखें या लॉगिन करें।');
      return;
    }

    setSubmitting(true);
    try {
      const replyPayload: Omit<CommentItem, 'id'> = {
        articleId,
        authorId: currentUserId || `user-${Date.now()}`,
        authorName: currentUserName,
        authorRole: currentUserRole,
        authorPhotoUrl: currentUserPhoto,
        authorDistrict: loggedInReporter?.district,
        content: replyText.trim(),
        likes: 0,
        likedBy: [],
        parentId,
        createdAt: Date.now(),
      };

      await addDoc(collection(db, 'comments'), replyPayload);
      setReplyText('');
      setReplyingToId(null);
      if (onSuccessToast) onSuccessToast('आपका जवाब प्रेषित किया गया!');
    } catch (err: any) {
      console.error('Error posting reply:', err);
      alert('जवाब पोस्ट करने में त्रुटि: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle toggle like
  const handleToggleLike = async (comment: CommentItem) => {
    const voterId = currentUserId || 'anonymous-reader';
    const isLiked = comment.likedBy?.includes(voterId);

    const updatedLikedBy = isLiked
      ? (comment.likedBy || []).filter((id) => id !== voterId)
      : [...(comment.likedBy || []), voterId];

    const updatedLikes = isLiked
      ? Math.max(0, (comment.likes || 1) - 1)
      : (comment.likes || 0) + 1;

    try {
      await updateDoc(doc(db, 'comments', comment.id), {
        likes: updatedLikes,
        likedBy: updatedLikedBy,
      });
    } catch (err) {
      console.error('Error updating like:', err);
    }
  };

  // Admin moderation: Delete inappropriate comment or reply
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('एडमिन: क्या आप निश्चित रूप से इस अनुचित टिप्पणी को हटाना चाहते हैं?')) return;

    try {
      await deleteDoc(doc(db, 'comments', commentId));
      if (onSuccessToast) onSuccessToast('एडमिन द्वारा टिप्पणी हटा दी गई।');
    } catch (err: any) {
      alert('हटाने में त्रुटि: ' + err.message);
    }
  };

  // Separate top-level comments and replies
  const topLevelComments = comments.filter((c) => !c.parentId);
  const getReplies = (parentId: string) => comments.filter((c) => c.parentId === parentId);

  return (
    <div className="mt-10 pt-8 border-t-2 border-red-700/20">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-3 mb-6">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-red-100 text-red-700 rounded-xl">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 flex items-center space-x-2">
              <span>पाठक प्रतिक्रिया एवं विचार (Reader Comments)</span>
              <span className="bg-red-700 text-white text-xs px-2 py-0.5 rounded-full font-bold font-mono">
                {comments.length}
              </span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              सभ्य और मर्यादित विचार साझा करें। अनुचित सामग्री एडमिन द्वारा हटाई जा सकती है।
            </p>
          </div>
        </div>

        {/* User Status / Login Prompt */}
        <div className="flex items-center space-x-2 text-xs">
          {isAdminLoggedIn ? (
            <span className="inline-flex items-center space-x-1 bg-red-900 text-white px-3 py-1 rounded-full font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-yellow-300" />
              <span>चीफ एडमिन (Moderator Active)</span>
            </span>
          ) : loggedInReporter ? (
            <span className="inline-flex items-center space-x-1 bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold border border-green-200">
              <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
              <span>संवाददाता: {loggedInReporter.fullName}</span>
            </span>
          ) : (
            <button
              onClick={onNavigateLogin}
              className="inline-flex items-center space-x-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-700 text-gray-700 px-3 py-1.5 rounded-lg font-bold border border-gray-200 transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>संवाददाता / एडमिन लॉगिन</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Moderation Notice */}
      {isAdminLoggedIn && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-900 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-red-700 flex-shrink-0" />
            <span>
              <strong>एडमिन मॉडरेशन मोड सक्रिय:</strong> आपके पास किसी भी अनुचित या भ्रामक टिप्पणी को हटाने का विशेषाधिकार है।
            </span>
          </div>
        </div>
      )}

      {/* Post New Comment Box */}
      <div className="bg-gray-50/80 rounded-2xl p-4 sm:p-5 border border-gray-200 mb-8">
        <form onSubmit={handlePostComment} className="space-y-3">
          {/* If not logged in as admin or reporter, allow reader to enter their verified name */}
          {!isAdminLoggedIn && !loggedInReporter && (
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <input
                  type="text"
                  required
                  value={readerName}
                  onChange={(e) => setReaderName(e.target.value)}
                  placeholder="अपना शुभ नाम लिखें (उदा. राहुल कुमार)... *"
                  className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-600 focus:outline-none bg-white font-medium"
                />
              </div>
              <div className="text-[11px] text-gray-500 self-center">
                (या आधिकारिक पहचान हेतु <button type="button" onClick={onNavigateLogin} className="text-red-700 font-bold underline">लॉगिन करें</button>)
              </div>
            </div>
          )}

          <div className="relative">
            <textarea
              rows={3}
              required
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="इस खबर पर अपने मर्यादित विचार या प्रतिक्रिया साझा करें..."
              className="w-full px-4 py-3 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-600 focus:outline-none bg-white leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-gray-400">
              टिप्पणी पोस्ट करते समय पत्रकारिता मर्यादा का ध्यान रखें।
            </span>
            <button
              type="submit"
              disabled={submitting || !newCommentText.trim()}
              className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold shadow transition flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'पोस्ट हो रहा है...' : 'टिप्पणी पोस्ट करें'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {topLevelComments.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200">
            <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-gray-600">इस समाचार पर अभी तक कोई टिप्पणी नहीं है।</p>
            <p className="text-[11px] text-gray-400 mt-0.5">सबसे पहले अपने विचार साझा करने वाले बनें!</p>
          </div>
        ) : (
          topLevelComments.map((comment) => {
            const replies = getReplies(comment.id);
            const isLiked = comment.likedBy?.includes(currentUserId || 'anonymous-reader');

            return (
              <div
                key={comment.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-sm transition hover:border-gray-300"
              >
                {/* Author Info */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs border border-red-200 flex-shrink-0">
                      {comment.authorPhotoUrl ? (
                        <img
                          src={comment.authorPhotoUrl}
                          alt={comment.authorName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{comment.authorName.charAt(0)}</span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs sm:text-sm text-gray-900">
                          {comment.authorName}
                        </span>

                        {comment.authorRole === 'admin' ? (
                          <span className="bg-red-700 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center">
                            <ShieldCheck className="w-3 h-3 mr-0.5" /> एडमिन
                          </span>
                        ) : comment.authorRole === 'reporter' ? (
                          <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200">
                            अधिकृत संवाददाता
                          </span>
                        ) : null}

                        {comment.authorDistrict && (
                          <span className="text-[10px] text-gray-500 hidden sm:inline">
                            • {comment.authorDistrict}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 text-[10px] text-gray-400 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(comment.createdAt).toLocaleString('hi-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Admin Delete Action */}
                  {isAdminLoggedIn && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      title="अनुचित टिप्पणी हटाएं (Admin Delete)"
                      className="p-1.5 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Comment Body */}
                <p className="text-xs sm:text-sm text-gray-800 leading-relaxed pl-12 whitespace-pre-line mb-3">
                  {comment.content}
                </p>

                {/* Actions Bar: Like & Reply */}
                <div className="flex items-center space-x-4 pl-12 text-xs text-gray-500 pt-1 border-t border-gray-100">
                  <button
                    onClick={() => handleToggleLike(comment)}
                    className={`flex items-center space-x-1.5 px-2 py-1 rounded-lg transition font-medium ${
                      isLiked
                        ? 'text-red-600 bg-red-50 font-bold'
                        : 'hover:text-red-600 hover:bg-gray-100'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-600' : ''}`} />
                    <span>{comment.likes || 0} पसंद</span>
                  </button>

                  <button
                    onClick={() => {
                      setReplyingToId(replyingToId === comment.id ? null : comment.id);
                      setReplyText('');
                    }}
                    className="flex items-center space-x-1 px-2 py-1 rounded-lg hover:text-red-700 hover:bg-gray-100 transition font-medium"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    <span>जवाब दें (Reply)</span>
                  </button>
                </div>

                {/* Reply Form */}
                {replyingToId === comment.id && (
                  <div className="mt-3 ml-12 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center space-x-1 text-[11px] font-bold text-gray-600 mb-1.5">
                      <CornerDownRight className="w-3 h-3 text-red-600" />
                      <span>{comment.authorName} को जवाब दे रहे हैं:</span>
                    </div>

                    {!isAdminLoggedIn && !loggedInReporter && !readerName.trim() && (
                      <input
                        type="text"
                        required
                        value={readerName}
                        onChange={(e) => setReaderName(e.target.value)}
                        placeholder="आपका नाम... *"
                        className="w-full mb-2 px-3 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                      />
                    )}

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="अपना जवाब लिखें..."
                        className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 bg-white"
                      />
                      <button
                        onClick={() => handlePostReply(comment.id)}
                        disabled={submitting || !replyText.trim()}
                        className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
                      >
                        भेजें
                      </button>
                    </div>
                  </div>
                )}

                {/* Replies Thread */}
                {replies.length > 0 && (
                  <div className="mt-3 ml-12 space-y-2.5 pt-2 border-t border-gray-100">
                    {replies.map((reply) => {
                      const isReplyLiked = reply.likedBy?.includes(currentUserId || 'anonymous-reader');
                      return (
                        <div
                          key={reply.id}
                          className="bg-gray-50/70 p-3 rounded-xl border border-gray-200/80"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-xs text-gray-900">
                                {reply.authorName}
                              </span>
                              {reply.authorRole === 'admin' ? (
                                <span className="bg-red-700 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                                  एडमिन
                                </span>
                              ) : reply.authorRole === 'reporter' ? (
                                <span className="bg-green-100 text-green-800 text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                                  संवाददाता
                                </span>
                              ) : null}
                              <span className="text-[10px] text-gray-400">
                                • {new Date(reply.createdAt).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            {isAdminLoggedIn && (
                              <button
                                onClick={() => handleDeleteComment(reply.id)}
                                title="जवाब हटाएं (Admin Delete)"
                                className="text-gray-400 hover:text-red-700 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <p className="text-xs text-gray-800 leading-relaxed mb-1.5">
                            {reply.content}
                          </p>

                          <div className="flex items-center space-x-3 text-[11px] text-gray-500">
                            <button
                              onClick={() => handleToggleLike(reply)}
                              className={`flex items-center space-x-1 ${
                                isReplyLiked ? 'text-red-600 font-bold' : 'hover:text-red-600'
                              }`}
                            >
                              <Heart className={`w-3 h-3 ${isReplyLiked ? 'fill-red-600' : ''}`} />
                              <span>{reply.likes || 0}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
