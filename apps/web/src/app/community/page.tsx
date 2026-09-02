'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, MessageSquare, Flame, Share2, Image as ImageIcon, Smile, Hash, AlertTriangle, Send, MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type UserProfile = {
  career?: string;
  avatar_url?: string;
};

type User = {
  first_name: string;
  last_name: string;
  profile?: UserProfile;
};

type Comment = {
  id: string;
  content?: string;
  media_url?: string;
  created_at: string;
  user: User;
};

type Post = {
  id: string;
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
  const { isAuthenticated, token } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Reaction Tooltip State
  const [hoveredPostReaction, setHoveredPostReaction] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const url = activeCategory === 'ALL' 
        ? 'http://localhost:3001/api/v1/community/posts'
        : `http://localhost:3001/api/v1/community/posts?category=${activeCategory}`;
      
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(url, { headers });
      if (res.ok) {
        const json = await res.json();
        setPosts(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeCategory, token]);

  const handleCreatePost = async () => {
    if (!isAuthenticated) return alert('Debes iniciar sesión para publicar');
    if (!newTitle || !newDescription) return alert('El título y descripción son obligatorios');

    try {
      const res = await fetch('http://localhost:3001/api/v1/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          category: newCategory,
          title: newTitle,
          description: newDescription,
          media_url: newMediaUrl || undefined
        })
      });

      if (res.ok) {
        setNewTitle('');
        setNewDescription('');
        setNewMediaUrl('');
        setIsPosting(false);
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
    }
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

    try {
      await fetch(`http://localhost:3001/api/v1/community/posts/${postId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateComment = async (postId: string) => {
    if (!isAuthenticated) return alert('Debes iniciar sesión para comentar');
    if (!newCommentContent.trim() && !newCommentMediaUrl.trim()) return alert('Debes ingresar texto o una imagen');

    try {
      const res = await fetch(`http://localhost:3001/api/v1/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          content: newCommentContent || undefined,
          media_url: newCommentMediaUrl || undefined
        })
      });

      if (res.ok) {
        const json = await res.json();
        const comment = json.data;
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              _count: { comments: p._count.comments + 1 },
              comments: [...p.comments, comment]
            };
          }
          return p;
        }));
        setNewCommentContent('');
        setNewCommentMediaUrl('');
        setShowCommentMediaInput(null);
      }
    } catch (err) {
      console.error(err);
    }
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
              setIsPosting(!isPosting)
            }}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(230,57,70,0.3)] hover:scale-105 transition-transform"
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
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
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
                    U
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

                <div className="flex items-center gap-2 text-sm">
                  <ImageIcon className="w-4 h-4 text-[#8E92A4]" />
                  <input 
                    type="url" 
                    value={newMediaUrl}
                    onChange={e => setNewMediaUrl(e.target.value)}
                    placeholder="Pegar link de Imagen / GIF (Tenor, Giphy, etc.)"
                    className="flex-1 bg-white/5 rounded-lg px-3 py-1.5 border border-white/5 text-white focus:outline-none focus:border-white/20"
                  />
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
                    <button onClick={() => setIsPosting(false)} className="px-4 py-2 text-xs font-bold text-[#8E92A4] hover:text-white transition-colors">Cancelar</button>
                    <button onClick={handleCreatePost} className="btn-primary px-5 py-2 text-sm rounded-lg hover:scale-105 transition-transform">Publicar</button>
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
              className="w-full bg-[#15161E] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#E63946]/50 focus:ring-1 focus:ring-[#E63946]/50 transition-all shadow-inner"
            />
          </div>

          {/* FEED */}
          <div className="space-y-5">
            {loading ? (
              <div className="text-center py-10 text-[#8E92A4] animate-pulse">Cargando el feed...</div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-10 text-[#8E92A4]">No hay posts en esta categoría. ¡Sé el primero!</div>
            ) : (
              filteredPosts.map(post => {
                
                // Aggregate total reactions
                const totalReactions = Object.values(post.reactionCounts).reduce((a,b) => a+b, 0);
                // Get top 3 reactions for preview
                const topReactions = Object.entries(post.reactionCounts)
                  .filter(([_, count]) => count > 0)
                  .sort((a,b) => b[1] - a[1])
                  .slice(0, 3)
                  .map(([type]) => REACTIONS.find(r => r.type === type)?.emoji);

                const currentUserReaction = post.userReaction ? REACTIONS.find(r => r.type === post.userReaction) : null;

                return (
                  <div key={post.id} className="arena-card p-5 group transition-colors glass-panel border-white/5 relative">
                    
                    {/* Meta */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#E63946] to-[#457B9D] flex items-center justify-center font-bold text-white text-xs">
                        {post.user.first_name[0]}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">
                            {post.user.first_name} {post.user.last_name}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-[#A8DADC] border border-white/10 hidden sm:inline-block">
                            {post.user.profile?.career || 'Competidor'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-[#5A5E73]">
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{post.category}</span>
                        </div>
                      </div>
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
                        <span className="text-xs text-[#8E92A4]">{totalReactions}</span>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex items-center justify-between text-[#8E92A4] border-t border-white/10 pt-2 mt-2">
                      <div 
                        className="relative"
                        onMouseEnter={() => setHoveredPostReaction(post.id)}
                        onMouseLeave={() => setHoveredPostReaction(null)}
                      >
                        {/* Reactions Hover Panel */}
                        {hoveredPostReaction === post.id && (
                          <div className="absolute bottom-full left-0 pb-2 z-50">
                            <div className="bg-[#1C1D27] border border-white/10 rounded-full py-1.5 px-3 flex items-center gap-2 shadow-xl animate-in slide-in-from-bottom-2 fade-in">
                              {REACTIONS.map(reaction => (
                                <button
                                  key={reaction.type}
                                  onClick={() => handleReact(post.id, reaction.type)}
                                  className="text-2xl hover:scale-125 transition-transform origin-bottom"
                                  title={reaction.label}
                                >
                                  {reaction.emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <button 
                          onClick={() => handleReact(post.id, 'LIKE')} // Default click acts as a generic like
                          className={`flex items-center gap-2 text-xs font-bold hover:bg-white/5 px-3 py-2 rounded-lg transition-colors ${currentUserReaction ? 'text-[#E63946]' : ''}`}
                        >
                          {currentUserReaction ? (
                            <span className="text-base">{currentUserReaction.emoji}</span>
                          ) : (
                            <Smile className="w-5 h-5" />
                          )}
                          <span className="hidden sm:inline-block">
                            {currentUserReaction ? currentUserReaction.label : 'Reaccionar'}
                          </span>
                        </button>
                      </div>

                      <button 
                        onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)}
                        className="flex items-center gap-2 text-xs font-semibold hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg transition-colors"
                      >
                        <MessageSquare className="w-5 h-5" />
                        {post._count.comments} Respuestas
                      </button>
                      <button className="flex items-center gap-2 text-xs font-semibold hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg transition-colors">
                        <Share2 className="w-5 h-5" />
                        <span className="hidden sm:inline-block">Compartir</span>
                      </button>
                    </div>

                    {/* Comments Section */}
                    {activeCommentPost === post.id && (
                      <div className="mt-4 pt-4 border-t border-white/10 space-y-4 animate-in fade-in slide-in-from-top-2">
                        {/* Existing Comments */}
                        <div className="space-y-4">
                          {post.comments.map(c => (
                            <div key={c.id} className="flex gap-3 text-sm">
                              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                {c.user.first_name[0]}
                              </div>
                              <div className="flex-1">
                                <div className="bg-white/5 p-3 rounded-2xl rounded-tl-sm border border-white/5 w-max max-w-full">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-white text-xs">{c.user.first_name}</span>
                                    <span className="text-[10px] text-[#5A5E73]">{new Date(c.created_at).toLocaleDateString()}</span>
                                  </div>
                                  {c.content && <p className="text-[#A8DADC] text-xs leading-relaxed whitespace-pre-wrap">{c.content}</p>}
                                </div>
                                {/* Comment Image/GIF */}
                                {c.media_url && (
                                  <div className="mt-2 rounded-xl overflow-hidden border border-white/5 bg-black/30 max-w-xs">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={c.media_url} alt="Comment Media" className="w-full object-contain" />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Add Comment */}
                        {isAuthenticated && (
                          <div className="flex gap-3 mt-4 items-start">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-1">
                              U
                            </div>
                            <div className="flex-1 flex flex-col gap-2">
                              <div className="flex gap-2 items-center bg-[#1C1D27] border border-white/10 rounded-2xl rounded-tl-sm px-3 py-2 focus-within:border-[#E63946]/50">
                                <input 
                                  type="text"
                                  value={newCommentContent}
                                  onChange={e => setNewCommentContent(e.target.value)}
                                  placeholder="Escribe una respuesta..."
                                  className="flex-1 bg-transparent text-sm text-white focus:outline-none placeholder:text-[#8E92A4]"
                                />
                                <button 
                                  onClick={() => setShowCommentMediaInput(showCommentMediaInput === post.id ? null : post.id)}
                                  className={`p-1.5 rounded-full transition-colors ${showCommentMediaInput === post.id ? 'bg-[#E63946] text-white' : 'text-[#8E92A4] hover:bg-white/10 hover:text-white'}`}
                                >
                                  <ImageIcon className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleCreateComment(post.id)}
                                  className="text-[#E63946] p-1.5 rounded-full hover:bg-white/10 transition-colors"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              </div>
                              
                              {/* Media Input for Comment */}
                              {showCommentMediaInput === post.id && (
                                <div className="flex items-center gap-2 animate-in slide-in-from-top-1 fade-in">
                                  <input 
                                    type="url"
                                    value={newCommentMediaUrl}
                                    onChange={e => setNewCommentMediaUrl(e.target.value)}
                                    placeholder="Pegar link de imagen/GIF..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
