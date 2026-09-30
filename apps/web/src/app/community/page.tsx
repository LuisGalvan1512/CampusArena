'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Plus, 
  MessageSquare, 
  Flame, 
  Share2, 
  Image as ImageIcon, 
  Smile, 
  Hash, 
  AlertTriangle, 
  Send, 
  MoreHorizontal,
  Trash2,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Reply,
  Upload,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { uploadCommunityMedia } from '@/lib/storage';

type UserProfile = {
  nickname?: string;
  career?: string;
  avatar_url?: string;
};

function capitalizeWords(str?: string | null): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

type User = {
  id?: string;
  first_name: string;
  last_name: string;
  role?: string;
  avatar_url?: string | null;
  profile?: UserProfile;
};

type Comment = {
  id: string;
  parent_id?: string | null;
  content?: string;
  media_url?: string;
  created_at: string;
  user: User;
  reactionCounts?: Record<string, number>;
  userReaction?: string | null;
  replies?: Comment[];
};

type Post = {
  id: string;
  user_id?: string;
  category: string;
  title: string;
  description: string;
  media_url?: string;
  created_at: string;
  user: User;
  comments: Comment[];
  _count: { comments: number };
  reactionCounts: Record<string, number>;
  userReaction: string | null;
};

const CATEGORIES = [
  { id: 'ALL', name: 'Populares', icon: Flame },
  { id: 'Chacota', name: 'Chacota', icon: Smile },
  { id: 'CV', name: 'Pon tu CV', icon: Hash },
  { id: 'Tec', name: 'Cosas de Tec', icon: AlertTriangle }
];

const REACTIONS = [
  { type: 'LIKE', emoji: '👍', label: 'Me gusta' },
  { type: 'HAHA', emoji: '😂', label: 'Me divierte' },
  { type: 'WOW', emoji: '😮', label: 'Me asombra' },
  { type: 'SAD', emoji: '😢', label: 'Me entristece' },
  { type: 'ANGRY', emoji: '😡', label: 'Me enoja' },
];

export default function CommunityPage() {
  const { user, isAuthenticated, isAdmin, isOrganizer } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // New Post Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newCategory, setNewCategory] = useState('Chacota');

  // Comments State
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [newCommentMediaUrl, setNewCommentMediaUrl] = useState('');
  const [showCommentMediaInput, setShowCommentMediaInput] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ postId: string; parentId: string; userName: string } | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const commentInputRef = useRef<HTMLInputElement | null>(null);

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  // Reaction Tooltip State
  const [hoveredPostReaction, setHoveredPostReaction] = useState<string | null>(null);
  const [hoveredCommentReaction, setHoveredCommentReaction] = useState<string | null>(null);
  const postHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const commentHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Local Image Upload State
  const [uploadingPostMedia, setUploadingPostMedia] = useState(false);
  const [uploadingCommentMedia, setUploadingCommentMedia] = useState<string | null>(null);
  const postFileInputRef = useRef<HTMLInputElement | null>(null);
  const commentFileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePostFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPostMedia(true);
    try {
      const { url, error } = await uploadCommunityMedia(file, user?.id);
      if (error || !url) {
        alert(error || 'No se pudo procesar la imagen seleccionada.');
      } else {
        setNewMediaUrl(url);
      }
    } catch (err: any) {
      alert(err.message || 'Error al subir la imagen local');
    } finally {
      setUploadingPostMedia(false);
      e.target.value = '';
    }
  };

  const handleCommentFileSelected = async (e: React.ChangeEvent<HTMLInputElement>, postId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCommentMedia(postId);
    try {
      const { url, error } = await uploadCommunityMedia(file, user?.id);
      if (error || !url) {
        alert(error || 'No se pudo procesar la imagen.');
      } else {
        setNewCommentMediaUrl(url);
        setShowCommentMediaInput(postId);
      }
    } catch (err: any) {
      alert(err.message || 'Error al subir la imagen');
    } finally {
      setUploadingCommentMedia(null);
      e.target.value = '';
    }
  };

  const handleMouseEnterPostReaction = (postId: string) => {
    if (postHoverTimeoutRef.current) clearTimeout(postHoverTimeoutRef.current);
    setHoveredPostReaction(postId);
  };

  const handleMouseLeavePostReaction = () => {
    if (postHoverTimeoutRef.current) clearTimeout(postHoverTimeoutRef.current);
    postHoverTimeoutRef.current = setTimeout(() => {
      setHoveredPostReaction(null);
    }, 250);
  };

  const handleMouseEnterCommentReaction = (commentId: string) => {
    if (commentHoverTimeoutRef.current) clearTimeout(commentHoverTimeoutRef.current);
    setHoveredCommentReaction(commentId);
  };

  const handleMouseLeaveCommentReaction = () => {
    if (commentHoverTimeoutRef.current) clearTimeout(commentHoverTimeoutRef.current);
    commentHoverTimeoutRef.current = setTimeout(() => {
      setHoveredCommentReaction(null);
    }, 250);
  };

  const fetchPosts = async (targetPage = 1, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const queryParams = new URLSearchParams({
        page: String(targetPage),
        limit: '10',
      });
      if (activeCategory !== 'ALL') {
        queryParams.set('category', activeCategory);
      }

      const res = await api.get(`/community/posts?${queryParams.toString()}`);
      if (res.success && res.data) {
        const rawItems = Array.isArray(res.data) ? res.data : (res.data.items || []);
        const more = Boolean(res.data.hasMore);

        if (isLoadMore) {
          setPosts(prev => [...prev, ...rawItems]);
        } else {
          setPosts(rawItems);
        }
        setPage(targetPage);
        setHasMore(more);
      }
    } catch (err) {
      console.error('Error al cargar posts de la comunidad:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPosts(1, false);
  }, [activeCategory]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchPosts(page + 1, true);
    }
  };

  const handleCreatePost = async () => {
    if (!isAuthenticated) return alert('Debes iniciar sesión para publicar');
    if (!newTitle.trim() || !newDescription.trim()) return alert('El título y la descripción son obligatorios');

    try {
      const res = await api.post('/community/posts', {
        category: newCategory,
        title: newTitle.trim(),
        description: newDescription.trim(),
        media_url: newMediaUrl.trim() || undefined,
      });

      if (res.success) {
        setNewTitle('');
        setNewDescription('');
        setNewMediaUrl('');
        setIsPosting(false);
        fetchPosts(1, false);
      } else {
        alert(res.error?.message || 'Error al publicar.');
      }
    } catch (err: any) {
      alert(err.message || 'Error de conexión');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta publicación indebida? Esta acción no se puede deshacer.')) {
      return;
    }

    setActionLoading(postId);
    try {
      const res = await api.delete(`/community/posts/${postId}`);
      if (res.success) {
        setPosts(prev => prev.filter(p => p.id !== postId));
      } else {
        alert(res.error?.message || 'No se pudo eliminar la publicación.');
      }
    } catch (err: any) {
      alert(err.message || 'Error de conexión al eliminar publicación.');
    } finally {
      setActionLoading(null);
    }
  };

  const canDeletePost = (post: Post) => {
    if (!isAuthenticated) return false;
    const isGlobalAdmin = isAdmin || isOrganizer || user?.role === 'ADMIN' || user?.role === 'ORGANIZER';
    const isAuthor = Boolean(user?.id && (post.user_id === user.id || post.user?.id === user.id));
    return isGlobalAdmin || isAuthor;
  };

  const handleReact = async (postId: string, type: string) => {
    if (!isAuthenticated) return alert('Debes iniciar sesión para reaccionar');
    
    // Optimistic Update
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const newReactionCounts = { ...p.reactionCounts };
        
        // If user already had a reaction, decrement it
        if (p.userReaction) {
          newReactionCounts[p.userReaction] = Math.max(0, (newReactionCounts[p.userReaction] || 1) - 1);
        }

        // If clicking the same reaction, it removes it
        if (p.userReaction === type) {
          return { ...p, userReaction: null, reactionCounts: newReactionCounts };
        }

        // Otherwise, add the new reaction
        newReactionCounts[type] = (newReactionCounts[type] || 0) + 1;
        return { ...p, userReaction: type, reactionCounts: newReactionCounts };
      }
      return p;
    }));
    setHoveredPostReaction(null);

    await api.post(`/community/posts/${postId}/react`, { type });
  };

  const handleCreateComment = async (postId: string) => {
    if (!isAuthenticated) return alert('Debes iniciar sesión para comentar');
    if (!newCommentContent.trim() && !newCommentMediaUrl.trim()) return alert('Debes ingresar texto o una imagen');

    const payload: any = {
      content: newCommentContent.trim() || undefined,
      media_url: newCommentMediaUrl.trim() || undefined,
    };
    if (replyingTo && replyingTo.postId === postId && replyingTo.parentId) {
      payload.parent_id = replyingTo.parentId;
    }

    const res = await api.post(`/community/posts/${postId}/comments`, payload);

    if (res.success && res.data) {
      const comment: Comment = res.data;
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          if (comment.parent_id) {
            const updatedComments = p.comments.map(c => {
              if (c.id === comment.parent_id) {
                return {
                  ...c,
                  replies: [...(c.replies || []), comment],
                };
              }
              return c;
            });
            return {
              ...p,
              _count: { comments: p._count.comments + 1 },
              comments: updatedComments,
            };
          } else {
            return {
              ...p,
              _count: { comments: p._count.comments + 1 },
              comments: [...p.comments, { ...comment, replies: [] }],
            };
          }
        }
        return p;
      }));

      if (comment.parent_id) {
        setExpandedReplies(prev => ({ ...prev, [comment.parent_id!]: true }));
      }

      setNewCommentContent('');
      setNewCommentMediaUrl('');
      setShowCommentMediaInput(null);
      setReplyingTo(null);
    } else {
      alert(res.error?.message || 'Error al enviar comentario');
    }
  };

  const handleReactComment = async (postId: string, commentId: string, type: string) => {
    if (!isAuthenticated) return alert('Debes iniciar sesión para reaccionar');

    // Optimistic Update for comments & nested replies
    const updateCommentList = (list: Comment[]): Comment[] => {
      return list.map(c => {
        let updatedC = { ...c };
        if (c.id === commentId) {
          const newCounts = { ...(c.reactionCounts || {}) };
          if (c.userReaction) {
            newCounts[c.userReaction] = Math.max(0, (newCounts[c.userReaction] || 1) - 1);
          }
          if (c.userReaction === type) {
            updatedC = { ...updatedC, userReaction: null, reactionCounts: newCounts };
          } else {
            newCounts[type] = (newCounts[type] || 0) + 1;
            updatedC = { ...updatedC, userReaction: type, reactionCounts: newCounts };
          }
        }
        if (c.replies && c.replies.length > 0) {
          updatedC.replies = updateCommentList(c.replies);
        }
        return updatedC;
      });
    };

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: updateCommentList(p.comments),
        };
      }
      return p;
    }));
    setHoveredCommentReaction(null);

    await api.post(`/community/comments/${commentId}/react`, { type });
  };

  const handleReplyComment = (postId: string, rootCommentId: string, targetUser: User) => {
    setActiveCommentPost(postId);
    const targetNickname = targetUser.profile?.nickname || capitalizeWords(targetUser.first_name);
    setReplyingTo({ 
      postId, 
      parentId: rootCommentId, 
      userName: targetNickname,
    });
    setExpandedReplies(prev => ({ ...prev, [rootCommentId]: true }));
    const mention = `@${targetNickname} `;
    setNewCommentContent(prev => {
      if (prev.includes(mention)) return prev;
      return prev ? `${prev} ${mention}` : mention;
    });
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 50);
  };

  const renderCommentContent = (text?: string) => {
    if (!text) return null;
    const words = text.split(/(\s+)/);
    return words.map((word, idx) => {
      if (word.startsWith('@') && word.length > 1) {
        return (
          <span key={idx} className="font-bold text-amber-400 bg-amber-500/15 px-1 py-0.5 rounded mr-0.5 inline-block">
            {word}
          </span>
        );
      }
      return word;
    });
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0B0C10] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 flex flex-col lg:flex-row gap-8">
        
        {/* SIDEBAR (Desktop) */}
        <div className="lg:w-64 shrink-0 space-y-6">
          <button 
            onClick={() => {
              if(!isAuthenticated) return alert('Debes iniciar sesión primero');
              setIsPosting(!isPosting);
            }}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(230,57,70,0.3)] hover:scale-105 transition-transform cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Crear Post
          </button>

          <div className="arena-card p-4 glass-panel border-white/5">
            <h3 className="text-xs font-bold text-[#8E92A4] uppercase tracking-wider mb-3 px-2">Categorías</h3>
            <div className="space-y-1">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-white/10 text-white shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]' 
                        : 'text-[#8E92A4] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#E63946]' : ''}`} />
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* MAIN FEED */}
        <div className="flex-1 max-w-2xl space-y-6">
          
          {/* Create Post Input */}
          {isPosting && (
            <div className="arena-card p-5 animate-in slide-in-from-top-4 fade-in glass-panel border-[#E63946]/30">
              <div className="flex flex-col gap-4">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#E63946] to-[#457B9D] flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-lg">
                    {user?.first_name?.[0] || 'U'}
                  </div>
                  <input 
                    type="text" 
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="Título interesante..." 
                    className="w-full bg-transparent border-b border-white/10 pb-2 text-white font-bold text-lg focus:outline-none focus:border-[#E63946] transition-colors placeholder:text-white/20"
                  />
                </div>
                
                <textarea 
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="¿Qué está pasando en el campus?"
                  className="w-full bg-transparent border-none text-[#A8DADC] text-sm focus:outline-none resize-none h-20 placeholder:text-white/20"
                />

                {/* Image / Media Input Area */}
                <div className="space-y-2">
                  <input 
                    type="file"
                    ref={postFileInputRef}
                    accept="image/*"
                    onChange={handlePostFileSelected}
                    className="hidden"
                  />

                  {newMediaUrl ? (
                    <div className="rounded-xl overflow-hidden border border-white/10 bg-black/60 p-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-3 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={newMediaUrl} 
                          alt="Previsualización" 
                          className="w-14 h-14 object-cover rounded-lg border border-white/10 shrink-0" 
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            Imagen adjuntada
                          </span>
                          <span className="text-[11px] text-[#8E92A4] truncate">
                            {newMediaUrl.startsWith('data:') ? 'Imagen local cargada' : newMediaUrl}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNewMediaUrl('')}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-[#8E92A4] hover:text-red-400 transition-colors ml-2 shrink-0 cursor-pointer"
                        title="Quitar imagen"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <button
                        type="button"
                        disabled={uploadingPostMedia}
                        onClick={() => postFileInputRef.current?.click()}
                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 transition-all text-xs font-bold cursor-pointer shrink-0"
                      >
                        {uploadingPostMedia ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E63946]" />
                            <span>Subiendo imagen...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5 text-[#A8DADC]" />
                            <span>Subir desde tu equipo</span>
                          </>
                        )}
                      </button>

                      <div className="flex-1 flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/5 text-white text-xs">
                        <ImageIcon className="w-3.5 h-3.5 text-[#8E92A4] shrink-0" />
                        <input 
                          type="url" 
                          value={newMediaUrl}
                          onChange={e => setNewMediaUrl(e.target.value)}
                          placeholder="O pegar enlace web (GIF de Tenor, Giphy, etc.)..."
                          className="w-full bg-transparent text-xs text-white focus:outline-none placeholder:text-white/25"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#8E92A4]">Categoría:</span>
                    <select 
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                      className="bg-white/5 text-white text-xs rounded-lg px-2 py-1 border border-white/10 focus:outline-none"
                    >
                      {CATEGORIES.filter(c => c.id !== 'ALL').map(c => (
                        <option key={c.id} value={c.id} className="bg-[#1C1D27]">{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setIsPosting(false)} className="px-4 py-2 text-xs font-bold text-[#8E92A4] hover:text-white transition-colors cursor-pointer">Cancelar</button>
                    <button onClick={handleCreatePost} className="btn-primary px-5 py-2 text-sm rounded-lg hover:scale-105 transition-transform cursor-pointer">Publicar</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8E92A4] group-focus-within:text-[#E63946] transition-colors" />
            <input 
              type="text"
              placeholder="Buscar discusiones, equipos o memes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#15161E] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#E63946]/50 focus:ring-1 focus:ring-[#E63946]/50 transition-all shadow-inner text-sm"
            />
          </div>

          {/* FEED */}
          <div className="space-y-5">
            {loading ? (
              <div className="text-center py-12 text-[#8E92A4] flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#E63946]" />
                <span>Cargando el feed comunitario...</span>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-12 text-[#8E92A4] arena-card p-8">
                No hay posts en esta categoría. ¡Sé el primero en compartir algo con la comunidad!
              </div>
            ) : (
              filteredPosts.map(post => {
                // Aggregate total reactions
                const totalReactions = Object.values(post.reactionCounts || {}).reduce((a,b) => a+b, 0);
                // Get top 3 reactions for preview
                const topReactions = Object.entries(post.reactionCounts || {})
                  .filter(([_, count]) => count > 0)
                  .sort((a,b) => b[1] - a[1])
                  .slice(0, 3)
                  .map(([type]) => REACTIONS.find(r => r.type === type)?.emoji);

                const currentUserReaction = post.userReaction ? REACTIONS.find(r => r.type === post.userReaction) : null;
                const canDelete = canDeletePost(post);

                return (
                  <div key={post.id} className="arena-card p-5 group transition-colors glass-panel border-white/5 relative">
                    
                    {/* Meta Header with Delete Button */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <Link 
                          href={`/profile/${post.user_id || post.user?.id || ''}`}
                          className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#E63946] to-[#457B9D] flex items-center justify-center font-bold text-white text-xs hover:opacity-80 transition-opacity shrink-0 overflow-hidden"
                          title="Ver perfil y medallero"
                        >
                          {post.user?.avatar_url || post.user?.profile?.avatar_url ? (
                            <img src={post.user?.avatar_url || post.user?.profile?.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            (post.user?.profile?.nickname || post.user?.first_name || 'U')[0].toUpperCase()
                          )}
                        </Link>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link 
                              href={`/profile/${post.user_id || post.user?.id || ''}`}
                              className="text-sm font-black text-white hover:text-[#E63946] transition-colors"
                              title="Ver perfil y medallero"
                            >
                              {post.user.profile?.nickname || capitalizeWords(post.user.first_name)}
                            </Link>
                            {post.user.role === 'ADMIN' && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                                👑 Admin
                              </span>
                            )}
                            <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-[#A8DADC] border border-white/10 hidden sm:inline-block">
                              {post.user.profile?.career || 'Competidor'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-[#8E92A4]">
                            <span className="font-semibold text-[#A8DADC]/90">
                              {capitalizeWords(`${post.user.first_name} ${post.user.last_name}`)}
                            </span>
                            <span>•</span>
                            <span className="text-[10px] text-[#5A5E73]">{new Date(post.created_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="text-[#A8DADC] font-semibold text-[10px]">{post.category}</span>
                          </div>
                        </div>
                      </div>

                      {/* Admin / Author Delete Action */}
                      {canDelete && (
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          disabled={actionLoading === post.id}
                          className="p-1.5 rounded-lg text-[#8E92A4] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Eliminar publicación indebida"
                        >
                          {actionLoading === post.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold text-white mb-2 leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-[#8E92A4] text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                      {post.description}
                    </p>

                    {/* Image/GIF */}
                    {post.media_url && (
                      <div className="mb-4 rounded-xl overflow-hidden border border-white/5 bg-black/50 max-h-[400px]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={post.media_url} alt="Media" className="w-full h-full object-contain" />
                      </div>
                    )}

                    {/* Reactions Summary */}
                    {totalReactions > 0 && (
                      <div className="flex items-center gap-2 mb-3 px-1">
                        <div className="flex -space-x-1">
                          {topReactions.map((emoji, idx) => (
                            <span key={idx} className="w-5 h-5 rounded-full bg-[#1C1D27] flex items-center justify-center text-xs border border-white/10 relative z-10">
                              {emoji}
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-[#8E92A4] font-medium">
                          {totalReactions} {totalReactions === 1 ? 'reacción' : 'reacciones'}
                        </span>
                      </div>
                    )}

                    {/* Actions Toolbar */}
                    <div className="flex items-center justify-between border-t border-white/5 pt-3 text-sm text-[#8E92A4]">
                      
                      {/* React Button with Popover */}
                      {/* React Button with Popover (Fixed Hover Bridge & Debounce) */}
                      <div 
                        className="relative"
                        onMouseEnter={() => handleMouseEnterPostReaction(post.id)}
                        onMouseLeave={handleMouseLeavePostReaction}
                      >
                        <button 
                          onClick={() => handleReact(post.id, 'LIKE')}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer ${
                            currentUserReaction ? 'text-[#E63946] font-bold' : ''
                          }`}
                        >
                          <span className="text-base">{currentUserReaction ? currentUserReaction.emoji : '👍'}</span>
                          <span>{currentUserReaction ? currentUserReaction.label : 'Reaccionar'}</span>
                        </button>

                        {/* Floating Reactions Bar with Invisible Hover Bridge */}
                        {hoveredPostReaction === post.id && (
                          <div 
                            className="absolute bottom-full left-0 mb-1.5 p-1.5 bg-[#15161E] border border-white/10 rounded-full flex gap-1 shadow-2xl z-20 animate-in fade-in zoom-in-95 before:absolute before:-bottom-3 before:left-0 before:right-0 before:h-4 before:content-['']"
                            onMouseEnter={() => {
                              if (postHoverTimeoutRef.current) clearTimeout(postHoverTimeoutRef.current);
                            }}
                            onMouseLeave={handleMouseLeavePostReaction}
                          >
                            {REACTIONS.map(reaction => (
                              <button
                                key={reaction.type}
                                onClick={() => handleReact(post.id, reaction.type)}
                                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-lg hover:scale-125 transition-transform cursor-pointer"
                                title={reaction.label}
                              >
                                {reaction.emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Comment Toggle Button */}
                      <button 
                        onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{post._count?.comments || 0} Comentarios</span>
                      </button>

                      {/* Share Button */}
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          alert('Enlace copiado al portapapeles');
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <Share2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Compartir</span>
                      </button>
                    </div>

                    {/* COMMENTS SECTION */}
                    {activeCommentPost === post.id && (
                      <div className="mt-4 pt-4 border-t border-white/5 space-y-4 animate-in fade-in">
                        
                        {/* New Comment Input with Replying Badge */}
                        <div className="space-y-2">
                          {replyingTo && replyingTo.postId === post.id && (
                            <div className="flex items-center justify-between text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20 px-3 py-1.5 rounded-lg animate-in fade-in">
                              <div className="flex items-center gap-1.5">
                                <Reply className="w-3.5 h-3.5 text-amber-400" />
                                <span>Respondiendo a <strong>@{replyingTo.userName}</strong></span>
                              </div>
                              <button 
                                onClick={() => setReplyingTo(null)}
                                className="text-[#8E92A4] hover:text-white font-bold ml-2 cursor-pointer text-xs"
                                title="Cancelar respuesta"
                              >
                                ✕
                              </button>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <input 
                              ref={commentInputRef}
                              type="text" 
                              value={newCommentContent}
                              onChange={e => setNewCommentContent(e.target.value)}
                              placeholder={replyingTo && replyingTo.postId === post.id ? `Respondiendo a @${replyingTo.userName}...` : "Escribe un comentario..."}
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleCreateComment(post.id);
                              }}
                              className="flex-1 bg-white/5 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#E63946]/50 border border-white/5"
                            />

                            {/* Local Image upload button for comments */}
                            <input 
                              type="file"
                              id={`comment-file-input-${post.id}`}
                              accept="image/*"
                              className="hidden"
                              onChange={e => handleCommentFileSelected(e, post.id)}
                            />
                            <button
                              type="button"
                              disabled={uploadingCommentMedia === post.id}
                              onClick={() => document.getElementById(`comment-file-input-${post.id}`)?.click()}
                              className="p-2 rounded-xl border border-white/10 text-[#8E92A4] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                              title="Subir foto desde tu equipo"
                            >
                              {uploadingCommentMedia === post.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-[#E63946]" />
                              ) : (
                                <Upload className="w-4 h-4 text-[#A8DADC]" />
                              )}
                            </button>

                            <button 
                              onClick={() => setShowCommentMediaInput(showCommentMediaInput === post.id ? null : post.id)}
                              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                                showCommentMediaInput === post.id ? 'bg-[#E63946] border-[#E63946] text-white' : 'border-white/10 text-[#8E92A4] hover:bg-white/5'
                              }`}
                              title="Pegar link de Imagen/GIF web"
                            >
                              <ImageIcon className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleCreateComment(post.id)}
                              className="btn-primary p-2.5 rounded-xl flex items-center justify-center cursor-pointer"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Media Preview / URL Input for comments */}
                          {newCommentMediaUrl && showCommentMediaInput === post.id && (
                            <div className="flex items-center justify-between p-2 bg-white/5 rounded-xl border border-white/10 animate-in fade-in">
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={newCommentMediaUrl} alt="Attached" className="w-10 h-10 object-cover rounded-lg border border-white/10 shrink-0" />
                                <span className="text-[11px] text-white font-medium truncate">
                                  {newCommentMediaUrl.startsWith('data:') ? 'Foto local adjunta' : newCommentMediaUrl}
                                </span>
                              </div>
                              <button 
                                type="button"
                                onClick={() => setNewCommentMediaUrl('')}
                                className="p-1 rounded-lg text-[#8E92A4] hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                                title="Quitar imagen"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}

                          {showCommentMediaInput === post.id && !newCommentMediaUrl && (
                            <input 
                              type="url" 
                              value={newCommentMediaUrl}
                              onChange={e => setNewCommentMediaUrl(e.target.value)}
                              placeholder="O pegar link de Imagen o GIF (Tenor/Giphy)..."
                              className="w-full bg-white/5 rounded-xl px-4 py-2 text-xs text-white focus:outline-none border border-white/5"
                            />
                          )}
                        </div>

                        {/* Comments List */}
                        <div className="space-y-3">
                          {post.comments?.map(comment => {
                            const cReactions = comment.reactionCounts || {};
                            const cTotalReactions = Object.values(cReactions).reduce((a, b) => a + b, 0);
                            const cTopReactions = Object.entries(cReactions)
                              .filter(([, count]) => count > 0)
                              .sort((a, b) => b[1] - a[1])
                              .slice(0, 3)
                              .map(([type]) => REACTIONS.find(r => r.type === type)?.emoji);
                            const currentCommentReaction = comment.userReaction ? REACTIONS.find(r => r.type === comment.userReaction) : null;

                            return (
                              <div key={comment.id} className="flex gap-2.5 items-start text-xs">
                                <Link
                                  href={`/profile/${comment.user?.id || ''}`}
                                  className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#E63946] to-[#457B9D] flex items-center justify-center font-bold text-white text-[10px] shrink-0 mt-0.5 hover:opacity-80 transition-opacity overflow-hidden"
                                  title="Ver perfil y medallero"
                                >
                                  {comment.user?.avatar_url || comment.user?.profile?.avatar_url ? (
                                    <img src={comment.user?.avatar_url || comment.user?.profile?.avatar_url} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    (comment.user?.profile?.nickname || comment.user?.first_name || 'U')[0].toUpperCase()
                                  )}
                                </Link>
                                <div className="flex-1 bg-white/5 rounded-xl p-3 border border-white/5 space-y-1">
                                  <div className="flex items-start justify-between mb-1">
                                    <div>
                                      <Link
                                        href={`/profile/${comment.user?.id || ''}`}
                                        className="font-bold text-white hover:text-[#E63946] transition-colors text-xs"
                                        title="Ver perfil y medallero"
                                      >
                                        {comment.user.profile?.nickname || capitalizeWords(comment.user?.first_name)}
                                      </Link>
                                      <span className="text-[10px] text-[#A8DADC]/80 font-medium block">
                                        {capitalizeWords(`${comment.user?.first_name} ${comment.user?.last_name}`)}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-[#5A5E73]">{new Date(comment.created_at).toLocaleDateString()}</span>
                                  </div>

                                  {comment.content && (
                                    <p className="text-[#8E92A4] leading-relaxed">
                                      {renderCommentContent(comment.content)}
                                    </p>
                                  )}

                                  {comment.media_url && (
                                    <div className="mt-2 rounded-lg overflow-hidden border border-white/5 max-h-48 bg-black/40">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img src={comment.media_url} alt="Media comment" className="w-full h-full object-contain" />
                                    </div>
                                  )}

                                  {/* Comment Action Footer: Reactions & Reply */}
                                  <div className="flex items-center justify-between pt-1.5 mt-2 border-t border-white/5 text-[11px] text-[#8E92A4]">
                                    <div className="flex items-center gap-2">
                                      {/* Reactions Counter for Comment */}
                                      {cTotalReactions > 0 && (
                                        <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
                                          <div className="flex -space-x-1">
                                            {cTopReactions.map((emoji, idx) => (
                                              <span key={idx} className="text-xs">{emoji}</span>
                                            ))}
                                          </div>
                                          <span className="text-[10px] font-mono text-white/80">{cTotalReactions}</span>
                                        </div>
                                      )}

                                      {/* Comment React Button with Popover */}
                                      <div 
                                        className="relative"
                                        onMouseEnter={() => handleMouseEnterCommentReaction(comment.id)}
                                        onMouseLeave={handleMouseLeaveCommentReaction}
                                      >
                                        <button
                                          onClick={() => handleReactComment(post.id, comment.id, 'LIKE')}
                                          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer ${
                                            currentCommentReaction ? 'text-[#E63946] font-bold' : 'hover:text-white'
                                          }`}
                                        >
                                          <Smile className="w-3.5 h-3.5" />
                                          <span>{currentCommentReaction ? currentCommentReaction.emoji : 'Reaccionar'}</span>
                                        </button>

                                        {/* Floating Reactions Bar for Comment */}
                                        {hoveredCommentReaction === comment.id && (
                                          <div 
                                            className="absolute bottom-full left-0 mb-1.5 p-1 bg-[#15161E] border border-white/10 rounded-full flex gap-1 shadow-2xl z-20 animate-in fade-in zoom-in-95 before:absolute before:-bottom-3 before:left-0 before:right-0 before:h-4 before:content-['']"
                                            onMouseEnter={() => {
                                              if (commentHoverTimeoutRef.current) clearTimeout(commentHoverTimeoutRef.current);
                                            }}
                                            onMouseLeave={handleMouseLeaveCommentReaction}
                                          >
                                            {REACTIONS.map(reaction => (
                                              <button
                                                key={reaction.type}
                                                onClick={() => handleReactComment(post.id, comment.id, reaction.type)}
                                                className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-base hover:scale-125 transition-transform cursor-pointer"
                                                title={reaction.label}
                                              >
                                                {reaction.emoji}
                                              </button>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Reply Button */}
                                    <button
                                      onClick={() => handleReplyComment(post.id, comment.id, comment.user)}
                                      className="flex items-center gap-1 text-[#8E92A4] hover:text-white transition-colors cursor-pointer px-2 py-0.5 rounded-lg hover:bg-white/5"
                                      title={`Responder a ${comment.user?.first_name}`}
                                    >
                                      <Reply className="w-3.5 h-3.5" />
                                      <span>Responder</span>
                                    </button>
                                  </div>

                                  {/* Toggle Threads Button (Instagram Style) */}
                                  {comment.replies && comment.replies.length > 0 && (
                                    <div className="pt-2 pl-0.5">
                                      <button
                                        onClick={() => toggleReplies(comment.id)}
                                        className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#8E92A4] hover:text-white transition-colors cursor-pointer group"
                                      >
                                        <span className="w-6 h-[1.5px] bg-white/20 group-hover:bg-white/50 transition-colors" />
                                        <span>
                                          {expandedReplies[comment.id]
                                            ? 'Ocultar respuestas'
                                            : `Ver ${comment.replies.length} ${comment.replies.length === 1 ? 'respuesta' : 'respuestas'}`}
                                        </span>
                                      </button>
                                    </div>
                                  )}

                                  {/* Nested Replies List (1-Level Instagram Thread) */}
                                  {expandedReplies[comment.id] && comment.replies && comment.replies.length > 0 && (
                                    <div className="pl-4 ml-1 border-l-2 border-white/10 space-y-2 mt-2.5 animate-in fade-in">
                                      {comment.replies.map(reply => {
                                        const rReactions = reply.reactionCounts || {};
                                        const rTotalReactions = Object.values(rReactions).reduce((a, b) => a + b, 0);
                                        const rTopReactions = Object.entries(rReactions)
                                          .filter(([, count]) => count > 0)
                                          .sort((a, b) => b[1] - a[1])
                                          .slice(0, 3)
                                          .map(([type]) => REACTIONS.find(r => r.type === type)?.emoji);
                                        const currentReplyReaction = reply.userReaction ? REACTIONS.find(r => r.type === reply.userReaction) : null;

                                        return (
                                          <div key={reply.id} className="flex gap-2 items-start text-xs">
                                            <Link
                                              href={`/profile/${reply.user?.id || ''}`}
                                              className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#E63946] to-[#457B9D] flex items-center justify-center font-bold text-white text-[9px] shrink-0 mt-0.5 hover:opacity-80 transition-opacity overflow-hidden"
                                              title="Ver perfil y medallero"
                                            >
                                              {reply.user?.avatar_url || reply.user?.profile?.avatar_url ? (
                                                <img src={reply.user?.avatar_url || reply.user?.profile?.avatar_url} alt="" className="w-full h-full object-cover" />
                                              ) : (
                                                (reply.user?.profile?.nickname || reply.user?.first_name || 'U')[0].toUpperCase()
                                              )}
                                            </Link>
                                            <div className="flex-1 bg-white/[0.04] rounded-xl p-2.5 border border-white/5 space-y-1">
                                              <div className="flex items-start justify-between mb-1">
                                                <div>
                                                  <Link
                                                    href={`/profile/${reply.user?.id || ''}`}
                                                    className="font-bold text-white hover:text-[#E63946] transition-colors text-[11px]"
                                                    title="Ver perfil y medallero"
                                                  >
                                                    {reply.user.profile?.nickname || capitalizeWords(reply.user?.first_name)}
                                                  </Link>
                                                  <span className="text-[9px] text-[#A8DADC]/80 font-medium block">
                                                    {capitalizeWords(`${reply.user?.first_name} ${reply.user?.last_name}`)}
                                                  </span>
                                                </div>
                                                <span className="text-[9px] text-[#5A5E73]">{new Date(reply.created_at).toLocaleDateString()}</span>
                                              </div>

                                              {reply.content && (
                                                <p className="text-[#8E92A4] leading-relaxed text-[11px]">
                                                  {renderCommentContent(reply.content)}
                                                </p>
                                              )}

                                              {reply.media_url && (
                                                <div className="mt-1.5 rounded-lg overflow-hidden border border-white/5 max-h-40 bg-black/40">
                                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                                  <img src={reply.media_url} alt="Media comment" className="w-full h-full object-contain" />
                                                </div>
                                              )}

                                              {/* Reply Action Footer: Reactions & Reply */}
                                              <div className="flex items-center justify-between pt-1 mt-1.5 border-t border-white/5 text-[10px] text-[#8E92A4]">
                                                <div className="flex items-center gap-1.5">
                                                  {rTotalReactions > 0 && (
                                                    <div className="flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded-full border border-white/10">
                                                      <div className="flex -space-x-1">
                                                        {rTopReactions.map((emoji, idx) => (
                                                          <span key={idx} className="text-[10px]">{emoji}</span>
                                                        ))}
                                                      </div>
                                                      <span className="text-[9px] font-mono text-white/80">{rTotalReactions}</span>
                                                    </div>
                                                  )}

                                                  {/* Reply React Button with Popover */}
                                                  <div 
                                                    className="relative"
                                                    onMouseEnter={() => handleMouseEnterCommentReaction(reply.id)}
                                                    onMouseLeave={handleMouseLeaveCommentReaction}
                                                  >
                                                    <button
                                                      onClick={() => handleReactComment(post.id, reply.id, 'LIKE')}
                                                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer ${
                                                        currentReplyReaction ? 'text-[#E63946] font-bold' : 'hover:text-white'
                                                      }`}
                                                    >
                                                      <Smile className="w-3 h-3" />
                                                      <span>{currentReplyReaction ? currentReplyReaction.emoji : 'Reaccionar'}</span>
                                                    </button>

                                                    {hoveredCommentReaction === reply.id && (
                                                      <div 
                                                        className="absolute bottom-full left-0 mb-1.5 p-1 bg-[#15161E] border border-white/10 rounded-full flex gap-1 shadow-2xl z-20 animate-in fade-in zoom-in-95 before:absolute before:-bottom-3 before:left-0 before:right-0 before:h-4 before:content-['']"
                                                        onMouseEnter={() => {
                                                          if (commentHoverTimeoutRef.current) clearTimeout(commentHoverTimeoutRef.current);
                                                        }}
                                                        onMouseLeave={handleMouseLeaveCommentReaction}
                                                      >
                                                        {REACTIONS.map(reaction => (
                                                          <button
                                                            key={reaction.type}
                                                            onClick={() => handleReactComment(post.id, reply.id, reaction.type)}
                                                            className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center text-sm hover:scale-125 transition-transform cursor-pointer"
                                                            title={reaction.label}
                                                          >
                                                            {reaction.emoji}
                                                          </button>
                                                        ))}
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>

                                                {/* Responder a esta respuesta (mantiene comment.id como root parent y etiqueta al usuario) */}
                                                <button
                                                  onClick={() => handleReplyComment(post.id, comment.id, reply.user)}
                                                  className="flex items-center gap-1 text-[#8E92A4] hover:text-white transition-colors cursor-pointer px-1.5 py-0.5 rounded-lg hover:bg-white/5"
                                                  title={`Responder a ${reply.user?.first_name}`}
                                                >
                                                  <Reply className="w-3 h-3" />
                                                  <span>Responder</span>
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
                            );
                          })}
                        </div>

                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>

          {/* PAGINATION / LOAD MORE */}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="btn-secondary px-6 py-3 text-xs font-bold flex items-center justify-center gap-2 mx-auto cursor-pointer disabled:opacity-50 hover:bg-white/10 transition-all shadow-lg"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#E63946]" />
                    <span>Cargando más publicaciones...</span>
                  </>
                ) : (
                  <span>Cargar más publicaciones</span>
                )}
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
