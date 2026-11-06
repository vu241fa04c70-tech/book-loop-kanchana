import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  Users,
  Heart,
  Plus,
  Send,
  Calendar,
  BookOpen,
  Tag,
  Search,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function CommunityPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('discussions'); // 'discussions' | 'clubs'

  // Discussions state
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    category: 'Discussion',
    tags: '',
    content: ''
  });
  const [submittingPost, setSubmittingPost] = useState(false);

  // Active comments state
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [postComments, setPostComments] = useState({});
  const [commentInput, setCommentInput] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Book Clubs state
  const [clubs, setClubs] = useState([]);
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [isCreateClubOpen, setIsCreateClubOpen] = useState(false);
  const [newClub, setNewClub] = useState({
    name: '',
    description: '',
    category: 'Computer Science',
    currentBookTitle: '',
    currentBookAuthor: '',
    meetingSchedule: 'Bi-weekly on Saturdays at 4:00 PM',
    readingGoal: 'Read 1 book per month'
  });
  const [submittingClub, setSubmittingClub] = useState(false);

  useEffect(() => {
    fetchPosts();
    fetchClubs();
  }, [categoryFilter]);

  const fetchPosts = async () => {
    setLoadingPosts(true);
    try {
      const params = {};
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (searchTerm) params.search = searchTerm;
      const res = await axios.get(`${API_BASE}/api/community/posts`, { params });
      if (res.data.success) {
        setPosts(res.data.posts || []);
      }
    } catch (err) {
      console.error('Failed to load community posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchClubs = async () => {
    setLoadingClubs(true);
    try {
      const res = await axios.get(`${API_BASE}/api/book-clubs`);
      if (res.data.success) {
        setClubs(res.data.clubs || []);
      }
    } catch (err) {
      console.error('Failed to load book clubs:', err);
    } finally {
      setLoadingClubs(false);
    }
  };

  const handleLike = async (postId) => {
    if (!user) {
      showToast('Please log in to like posts', 'info');
      return;
    }
    try {
      const res = await axios.post(
        `${API_BASE}/api/community/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      if (res.data.success) {
        setPosts((prev) =>
          prev.map((p) => {
            if (p._id === postId) {
              return {
                ...p,
                likesCount: res.data.likesCount,
                likes: res.data.hasLiked
                  ? [...(p.likes || []), user._id]
                  : (p.likes || []).filter((id) => id !== user._id)
              };
            }
            return p;
          })
        );
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update like', 'error');
    }
  };

  const toggleComments = async (postId) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
      return;
    }
    setExpandedPostId(postId);
    if (!postComments[postId]) {
      try {
        const res = await axios.get(`${API_BASE}/api/community/posts/${postId}`);
        if (res.data.success && res.data.comments) {
          setPostComments((prev) => ({ ...prev, [postId]: res.data.comments }));
        }
      } catch (err) {
        console.error('Error fetching comments:', err);
      }
    }
  };

  const handleAddComment = async (postId) => {
    if (!user) {
      showToast('Please log in to comment', 'info');
      return;
    }
    if (!commentInput.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await axios.post(
        `${API_BASE}/api/community/posts/${postId}/comments`,
        { content: commentInput.trim() },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      if (res.data.success) {
        showToast('Comment posted!', 'success');
        setCommentInput('');
        setPostComments((prev) => ({
          ...prev,
          [postId]: [...(prev[postId] || []), res.data.comment]
        }));
        setPosts((prev) =>
          prev.map((p) => (p._id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p))
        );
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to post comment', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please log in to publish a post', 'info');
      return;
    }
    if (!newPost.title.trim() || !newPost.content.trim()) {
      showToast('Please provide a title and content', 'error');
      return;
    }

    setSubmittingPost(true);
    try {
      const tagsArray = newPost.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const res = await axios.post(
        `${API_BASE}/api/community/posts`,
        { ...newPost, tags: tagsArray },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      if (res.data.success) {
        showToast('Post published to the BookLoop Community!', 'success');
        setIsCreatePostOpen(false);
        setNewPost({ title: '', category: 'Discussion', tags: '', content: '' });
        fetchPosts();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create post', 'error');
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleToggleJoinClub = async (clubId) => {
    if (!user) {
      showToast('Please log in to join reading clubs', 'info');
      return;
    }
    try {
      const res = await axios.post(
        `${API_BASE}/api/book-clubs/${clubId}/join`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      if (res.data.success) {
        showToast(res.data.message, 'success');
        fetchClubs();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update membership', 'error');
    }
  };

  const handleCreateClub = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please log in to start a club', 'info');
      return;
    }
    if (!newClub.name.trim() || !newClub.description.trim()) {
      showToast('Please fill in club name and description', 'error');
      return;
    }

    setSubmittingClub(true);
    try {
      const payload = {
        name: newClub.name,
        description: newClub.description,
        category: newClub.category,
        meetingSchedule: newClub.meetingSchedule,
        readingGoal: newClub.readingGoal,
        currentBook: {
          title: newClub.currentBookTitle,
          author: newClub.currentBookAuthor
        }
      };
      const res = await axios.post(`${API_BASE}/api/book-clubs`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.data.success) {
        showToast('Reading Club created!', 'success');
        setIsCreateClubOpen(false);
        setNewClub({
          name: '',
          description: '',
          category: 'Computer Science',
          currentBookTitle: '',
          currentBookAuthor: '',
          meetingSchedule: 'Bi-weekly on Saturdays at 4:00 PM',
          readingGoal: 'Read 1 book per month'
        });
        fetchClubs();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create reading club', 'error');
    } finally {
      setSubmittingClub(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-navy via-slate-800 to-navy rounded-3xl p-8 sm:p-10 text-white shadow-xl mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold tracking-wide uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Reader Community & Circles
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
              BookLoop Community Hub
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
              Connect with fellow university readers, share textbook reviews, organize campus study groups, and discover peer reading clubs.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsCreatePostOpen(true)}
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all text-sm"
              >
                <Plus className="w-4 h-4" /> Start a Discussion
              </button>
              <button
                onClick={() => setIsCreateClubOpen(true)}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-2.5 rounded-xl border border-white/20 backdrop-blur-sm transition-all text-sm"
              >
                <Users className="w-4 h-4" /> Start a Reading Club
              </button>
            </div>
          </div>
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 mb-8 bg-white rounded-2xl p-1.5 shadow-sm">
          <button
            onClick={() => setActiveTab('discussions')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all ${
              activeTab === 'discussions'
                ? 'bg-navy text-white shadow-md'
                : 'text-slate-600 hover:text-navy hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Discussions & Recommendations ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('clubs')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all ${
              activeTab === 'clubs'
                ? 'bg-navy text-white shadow-md'
                : 'text-slate-600 hover:text-navy hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            Campus Reading Clubs ({clubs.length})
          </button>
        </div>

        {/* TAB 1: DISCUSSIONS */}
        {activeTab === 'discussions' && (
          <div>
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div className="flex flex-wrap items-center gap-2">
                {['All', 'Discussion', 'Recommendation', 'Review', 'Study Group', 'Question'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      categoryFilter === cat
                        ? 'bg-accent text-white shadow-sm'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchPosts()}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            {loadingPosts ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 animate-pulse">
                    <div className="h-5 bg-slate-200 rounded w-1/3 mb-3"></div>
                    <div className="h-4 bg-slate-100 rounded w-full mb-2"></div>
                    <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800 mb-1">No discussions in this topic yet</h3>
                <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
                  Be the first reader to start a discussion, share a book review, or ask for textbook recommendations.
                </p>
                <button
                  onClick={() => setIsCreatePostOpen(true)}
                  className="bg-accent text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-accent/90"
                >
                  Create Discussion Post
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => {
                  const hasLiked = user && (post.likes || []).includes(user._id);
                  const isExpanded = expandedPostId === post._id;
                  const comments = postComments[post._id] || [];

                  return (
                    <div
                      key={post._id}
                      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 transition-all hover:shadow-md"
                    >
                      {/* Post Header */}
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              post.author?.profileImage ||
                              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                            }
                            alt={post.author?.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <Link
                              to={`/users/${post.author?._id}`}
                              className="font-bold text-slate-900 text-sm hover:text-accent flex items-center gap-1.5"
                            >
                              {post.author?.name || 'Reader'}
                              {post.author?.isVerified && (
                                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" title="Verified Student" />
                              )}
                            </Link>
                            <p className="text-xs text-slate-500">
                              {post.author?.college || 'University Community'} •{' '}
                              {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                          {post.category}
                        </span>
                      </div>

                      {/* Title & Body */}
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">{post.title}</h3>
                      <p className="text-slate-700 text-sm leading-relaxed mb-4 whitespace-pre-line">
                        {post.content}
                      </p>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {post.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1"
                            >
                              <Tag className="w-2.5 h-2.5" /> #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleLike(post._id)}
                            className={`flex items-center gap-1.5 font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                              hasLiked
                                ? 'text-red-500 bg-red-50'
                                : 'text-slate-600 hover:text-red-500 hover:bg-slate-50'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
                            {post.likesCount || 0} Likes
                          </button>
                          <button
                            onClick={() => toggleComments(post._id)}
                            className="flex items-center gap-1.5 font-semibold px-2.5 py-1 rounded-lg text-slate-600 hover:text-navy hover:bg-slate-50 transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />
                            {post.commentsCount || 0} Comments
                          </button>
                        </div>
                        <button
                          onClick={() => toggleComments(post._id)}
                          className="text-accent hover:underline font-semibold"
                        >
                          {isExpanded ? 'Hide comments' : 'Join conversation'}
                        </button>
                      </div>

                      {/* Comments Drawer */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/60 -mx-6 -mb-6 p-6 rounded-b-2xl">
                          <div className="space-y-3 mb-4">
                            {comments.length === 0 ? (
                              <p className="text-xs text-slate-500 text-center py-2">
                                No comments yet. Be the first to reply!
                              </p>
                            ) : (
                              comments.map((c) => (
                                <div key={c._id} className="bg-white p-3 rounded-xl border border-slate-200">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-xs text-slate-800">
                                      {c.author?.name || 'Reader'}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-700 leading-normal">{c.content}</p>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Add comment input */}
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Write a constructive reply..."
                              value={commentInput}
                              onChange={(e) => setCommentInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                              className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                            <button
                              disabled={submittingComment || !commentInput.trim()}
                              onClick={() => handleAddComment(post._id)}
                              className="bg-navy hover:bg-navy/90 text-white p-2 rounded-xl disabled:opacity-50 transition-colors"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: READING CLUBS */}
        {activeTab === 'clubs' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Active Campus Circles</h2>
                <p className="text-xs text-slate-500">Join structured reading goals, schedules, and group discussions.</p>
              </div>
              <button
                onClick={() => setIsCreateClubOpen(true)}
                className="bg-accent text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-accent/90 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> New Club
              </button>
            </div>

            {loadingClubs ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((n) => (
                  <div key={n} className="bg-white rounded-3xl p-6 border border-slate-200 animate-pulse h-64" />
                ))}
              </div>
            ) : clubs.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800 mb-1">No reading clubs found</h3>
                <p className="text-slate-500 text-sm mb-4">Start a campus club to read textbooks or novels together.</p>
                <button
                  onClick={() => setIsCreateClubOpen(true)}
                  className="bg-accent text-white px-5 py-2.5 rounded-xl text-sm font-semibold"
                >
                  Create the First Club
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {clubs.map((club) => {
                  const isMember = user && (club.members || []).some((m) => (m._id || m).toString() === user._id.toString());

                  return (
                    <div
                      key={club._id}
                      className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <span className="text-[11px] font-bold text-accent uppercase tracking-wider bg-orange-50 px-2.5 py-0.5 rounded-md border border-orange-100">
                              {club.category}
                            </span>
                            <h3 className="text-lg font-extrabold text-slate-900 mt-2 mb-1">{club.name}</h3>
                          </div>
                          <span className="flex items-center gap-1 text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                            <Users className="w-3.5 h-3.5" /> {club.membersCount || club.members?.length || 1}
                          </span>
                        </div>

                        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                          {club.description}
                        </p>

                        {/* Current Book Badge */}
                        {club.currentBook?.title && (
                          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 mb-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                              Currently Reading
                            </span>
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-accent flex-shrink-0" />
                              <div className="text-xs">
                                <span className="font-bold text-slate-800">{club.currentBook.title}</span>
                                {club.currentBook.author && (
                                  <span className="text-slate-500"> by {club.currentBook.author}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Schedule & Goals */}
                        <div className="space-y-1.5 text-xs text-slate-600">
                          {club.meetingSchedule && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{club.meetingSchedule}</span>
                            </div>
                          )}
                          {club.readingGoal && (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-3.5 h-3.5 text-slate-400" />
                              <span>{club.readingGoal}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          Started by {club.creator?.name || 'Reader'}
                        </span>
                        <button
                          onClick={() => handleToggleJoinClub(club._id)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            isMember
                              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                              : 'bg-navy text-white hover:bg-navy/90 shadow-sm'
                          }`}
                        >
                          {isMember ? 'Joined (Leave)' : 'Join Club'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* MODAL 1: CREATE POST */}
        {isCreatePostOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in duration-200">
              <h3 className="text-xl font-bold text-slate-900 mb-1">Start a Community Discussion</h3>
              <p className="text-xs text-slate-500 mb-4">
                Share a question, study tip, book review, or recommendation with fellow students.
              </p>

              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Best reference books for Data Structures & Algorithms?"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-accent focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                    <select
                      value={newPost.category}
                      onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-accent focus:outline-none bg-white"
                    >
                      <option value="Discussion">Discussion</option>
                      <option value="Recommendation">Recommendation</option>
                      <option value="Review">Book Review</option>
                      <option value="Study Group">Study Group</option>
                      <option value="Question">Question</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tags (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. CS, Algorithms, Stanford"
                      value={newPost.tags}
                      onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-accent focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Content *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Write your thoughts or questions here..."
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-accent focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsCreatePostOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingPost}
                    className="bg-accent hover:bg-accent/90 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
                  >
                    {submittingPost ? 'Publishing...' : 'Publish Post'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: CREATE CLUB */}
        {isCreateClubOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in duration-200">
              <h3 className="text-xl font-bold text-slate-900 mb-1">Start a Campus Reading Club</h3>
              <p className="text-xs text-slate-500 mb-4">
                Bring fellow students together with a shared reading schedule and goals.
              </p>

              <form onSubmit={handleCreateClub} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Club Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Berkeley Systems & AI Readers"
                    value={newClub.name}
                    onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-accent focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                    <select
                      value={newClub.category}
                      onChange={(e) => setNewClub({ ...newClub, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-accent focus:outline-none bg-white"
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Literature">Literature</option>
                      <option value="Competitive Exam">Competitive Exam</option>
                      <option value="General Fiction">General Fiction</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Current Book Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Clean Architecture"
                      value={newClub.currentBookTitle}
                      onChange={(e) => setNewClub({ ...newClub, currentBookTitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-accent focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Meeting Schedule</label>
                  <input
                    type="text"
                    placeholder="e.g. Every Saturday 5:00 PM at Campus Library"
                    value={newClub.meetingSchedule}
                    onChange={(e) => setNewClub({ ...newClub, meetingSchedule: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Club Description *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="What will members read and discuss?"
                    value={newClub.description}
                    onChange={(e) => setNewClub({ ...newClub, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-accent focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateClubOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingClub}
                    className="bg-navy hover:bg-navy/90 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
                  >
                    {submittingClub ? 'Creating...' : 'Create Club'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
