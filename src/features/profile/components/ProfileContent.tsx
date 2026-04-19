import React from 'react';
import { 
  Grid, 
  Clapperboard, 
  UserSquare2,
  Video,
  PlusSquare,
  Camera,
  Upload
} from 'lucide-react';

interface ProfileContentProps {
  posts: any[];
  activeTab: string;
}

export default function ProfileContent({ posts, activeTab }: ProfileContentProps) {
  return (
    <div className="flex flex-col">
      {/* Content Area */}
      {activeTab === 'posts' && (
        <div className="grid grid-cols-3 gap-0.5">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="aspect-square bg-[var(--bg-main)] relative group overflow-hidden">
                <img 
                  src={post.url || post.imageUrl} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                  alt={`Post ${post.id}`}
                />
              </div>
            ))
          ) : (
            <div className="col-span-3 py-20 flex flex-col items-center justify-center text-[var(--text-secondary)]">
              <div className="w-16 h-16 rounded-full border-2 border-[var(--text-secondary)] flex items-center justify-center mb-4">
                <Camera size={32} />
              </div>
              <p className="text-sm font-bold">No reels yet</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'tagged' && (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--text-secondary)]">
          <UserSquare2 size={48} strokeWidth={1.5} />
          <p className="mt-4 text-[11px] font-bold uppercase tracking-widest">No tagged content</p>
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--text-secondary)]">
          <Upload size={48} strokeWidth={1.5} />
          <p className="mt-4 text-[11px] font-bold uppercase tracking-widest">No uploads yet</p>
        </div>
      )}
    </div>
  );
}
