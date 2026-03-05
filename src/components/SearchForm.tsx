import { useState, type FormEvent } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface SearchFormProps {
  onSearch: (song: string, singer: string, keywords: string) => void;
  isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [song, setSong] = useState('');
  const [singer, setSinger] = useState('');
  const [keywords, setKeywords] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (song && singer) {
      onSearch(song, singer, keywords);
    }
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit} 
      className="w-full max-w-md mx-auto space-y-4 p-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-xl"
    >
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-white/60 font-medium ml-1">Song Name</label>
        <input
          type="text"
          value={song}
          onChange={(e) => setSong(e.target.value)}
          placeholder="e.g. Blinding Lights"
          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
          required
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-white/60 font-medium ml-1">Singer Name</label>
        <input
          type="text"
          value={singer}
          onChange={(e) => setSinger(e.target.value)}
          placeholder="e.g. The Weeknd"
          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-white/60 font-medium ml-1">Keywords (Optional)</label>
        <input
          type="text"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="e.g. live, acoustic, lyrics"
          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/20"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Search className="w-5 h-5" />
            <span>Search YouTube</span>
          </>
        )}
      </button>
    </motion.form>
  );
}
