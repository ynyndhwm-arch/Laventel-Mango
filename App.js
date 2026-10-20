import React, { useState, useEffect, useMemo } from "react";
import {
  Home,
  Search,
  BookOpen,
  Heart,
  Star,
  Download,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Bell,
  Flame,
  Clock,
  X,
  Menu,
  MessageSquare,
  Maximize2,
  List
} from "lucide-react";

// ---------------------------------------------------------------------------
// إعدادات فايربيس
// ---------------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyDVdOHqunjNfIf1AazorLsPljQeJAAv0JY",
  authDomain: "manga-liberax.firebaseapp.com",
  projectId: "manga-liberax",
  storageBucket: "manga-liberax.firebasestorage.app",
  messagingSenderId: "445555220064",
  appId: "1:445555220064:web:15e8ed1e039e8c794a2d05",
  measurementId: "G-BGCGLKTG2N"
};

if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = typeof firebase !== 'undefined' ? firebase.auth() : null;
const db = typeof firebase !== 'undefined' ? firebase.firestore() : null;

function loginWithGoogle() {
  if (!auth) return;
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then((result) => {
      alert(`أهلاً بك يا ${result.user.displayName}! تم تسجيل الدخول.`);
    })
    .catch((error) => console.error("خطأ تسجيل الدخول:", error));
}

function addMangaToFirestore() {
  if (!db) return;
  const titleInput = document.getElementById('manga-title');
  const descInput = document.getElementById('manga-desc');
  
  if (!titleInput || !titleInput.value) {
    alert("الرجاء إدخال عنوان المانغا!");
    return;
  }

  db.collection("mangas").add({
    title: titleInput.value,
    description: descInput ? descInput.value : '',
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
    alert("تم النشر بنجاح على قاعدة البيانات السحابية!");
    titleInput.value = '';
    if (descInput) descInput.value = '';
  })
  .catch((error) => console.error("خطأ أثناء الإضافة: ", error));
}

// ---------------------------------------------------------------------------
// Sample Data
// ---------------------------------------------------------------------------
const GENRES = ["أكشن", "خيال", "رومانسية", "رعب", "مغامرة", "دراما", "كوميديا"];

const COVER_PALETTES = [
  ["#7A1F2B", "#2A0D12"],
  ["#1F3B4D", "#0A1620"],
  ["#4B3B78", "#1A1230"],
  ["#3D5A2C", "#12200C"],
  ["#8A5A21", "#2B1A05"],
  ["#6B2440", "#210B14"],
];

const TITLES = [
  { title: "سيف الفجر", genre: "أكشن", ch: 142, rating: 4.8, hot: true },
  { title: "ظل التنين الأخير", genre: "خيال", ch: 88, rating: 4.6, hot: true },
  { title: "همسات القمر", genre: "رومانسية", ch: 54, rating: 4.9, hot: false },
  { title: "صائد الأرواح", genre: "رعب", ch: 71, rating: 4.5, hot: true },
  { title: "طريق الألف خطوة", genre: "مغامرة", ch: 210, rating: 4.7, hot: false },
  { title: "العاصفة الحمراء", genre: "أكشن", ch: 175, rating: 4.9, hot: true },
];

const MANGAS = TITLES.map((t, i) => ({
  id: i + 1,
  ...t,
  palette: COVER_PALETTES[i % COVER_PALETTES.length],
  synopsis: "رحلة ملحمية في عالم صراع القوى والغموض، مليئة بالأحداث المشوقة والشخصيات الاستثنائية.",
  author: "استوديو مانغا ليبراكس",
  status: i % 2 === 0 ? "مستمرة" : "مكتملة",
}));

function CoverArt({ palette, seed = 0, className = "" }) {
  const [c1, c2] = palette;
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: `linear-gradient(160deg, ${c1} 0%, ${c2} 100%)` }}>
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "repeating-linear-gradient(115deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 2px, transparent 2px, transparent 14px)" }} />
      <div className="absolute rounded-full" style={{ width: 90, height: 90, right: -20 + (seed % 3) * 10, top: -20 + (seed % 4) * 8, background: "rgba(255,255,255,0.10)" }} />
      <div className="absolute inset-x-0 bottom-0 h-1/2" style={{ background: `linear-gradient(0deg, ${c2}CC 0%, transparent 100%)` }} />
    </div>
  );
}

function HankoBadge({ children }) {
  return (
    <span className="inline-flex items-center justify-center rounded-full text-[10px] font-bold px-2 py-0.5 text-[#F0E9DC] shadow-sm" style={{ background: "#B3331D", letterSpacing: "0.02em" }}>
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main App Component
// ---------------------------------------------------------------------------
export default function App() {
  const [view, setView] = useState("home");
  const [activeManga, setActiveManga] = useState(null);
  const [activeChapter, setActiveChapter] = useState(1);
  const [favorites, setFavorites] = useState(() => new Set([1, 4]));
  const [query, setQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (auth) {
      const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
      return () => unsubscribe();
    }
  }, []);

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const openManga = (m) => {
    setActiveManga(m);
    setView("manga");
  };

  const openReader = (m, ch) => {
    setActiveManga(m);
    setActiveChapter(ch);
    setView("reader");
  };

  const filteredResults = useMemo(() => {
    return MANGAS.filter((m) => {
      const matchesQuery = m.title.toLowerCase().includes(query.trim().toLowerCase());
      const matchesGenre = !genreFilter || m.genre === genreFilter;
      return matchesQuery && matchesGenre;
    });
  }, [query, genreFilter]);

  return (
    <div dir="rtl" className="min-h-screen w-full flex flex-col" style={{ background: "#17140F", color: "#F0E9DC", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Rakkas&display=swap');
        .font-display { font-family: 'Rakkas', serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* شريط تسجيل الدخول العلوي الاحترافي */}
      <div className="flex items-center justify-between px-4 py-2 border-b" style={{ background: "#201B14", borderColor: "#2A241C" }}>
        <div className="flex items-center gap-2">
          <span className="font-display text-lg text-[#C1440E]">مانغا ليبراكس</span>
        </div>
        {user ? (
          <div className="flex items-center gap-2 text-xs">
            <span>مرحباً، {user.displayName}</span>
            <button onClick={() => auth.signOut()} className="px-2 py-1 rounded bg-red-900/40 text-red-300 text-[10px]">خروج</button>
          </div>
        ) : (
          <button onClick={loginWithGoogle} className="px-3 py-1 rounded-full font-bold text-xs" style={{ background: "#C1440E", color: "#17140F" }}>
            تسجيل الدخول
          </button>
        )}
      </div>

      {view === "reader" && activeManga ? (
        <ReaderView manga={activeManga} chapter={activeChapter} setChapter={setActiveChapter} onExit={() => setView("manga")} />
      ) : (
        <>
          <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
            {view === "home" && <HomeView onOpenManga={openManga} favorites={favorites} toggleFavorite={toggleFavorite} setGenreFilter={setGenreFilter} setView={setView} />}
            {view === "search" && <SearchView query={query} setQuery={setQuery} genreFilter={genreFilter} setGenreFilter={setGenreFilter} results={filteredResults} onOpenManga={openManga} />}
            {view === "library" && <LibraryView favorites={favorites} onOpenManga={openManga} toggleFavorite={toggleFavorite} />}
            {view === "manga" && activeManga && <MangaDetailView manga={activeManga} isFav={favorites.has(activeManga.id)} toggleFavorite={toggleFavorite} onBack={() => setView("home")} onRead={(ch) => openReader(activeManga, ch)} />}
          </main>
          <BottomNav view={view} setView={setView} />
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Home View
// ---------------------------------------------------------------------------
function HomeView({ onOpenManga, favorites, toggleFavorite, setGenreFilter, setView }) {
  const featured = MANGAS[0];

  return (
    <div>
      <div className="px-4 pt-4">
        <button onClick={() => onOpenManga(featured)} className="relative w-full h-48 rounded-2xl overflow-hidden text-right block">
          <CoverArt palette={featured.palette} seed={1} className="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          <div className="absolute bottom-0 right-0 p-4 w-full">
            <HankoBadge>مميزة اليوم</HankoBadge>
            <h2 className="font-display text-2xl mt-1">{featured.title}</h2>
            <p className="text-xs opacity-80 mt-1">{featured.genre} · {featured.ch} فصل</p>
          </div>
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 mt-4">
        {GENRES.map((g) => (
          <button key={g} onClick={() => { setGenreFilter(g); setView("search"); }} className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium" style={{ background: "#2A241C", color: "#E4D9C4" }}>
            {g}
          </button>
        ))}
      </div>

      <Section title="الأكثر قراءة" icon={<Flame size={15} style={{ color: "#C1440E" }} />}>
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-4">
          {MANGAS.map((m) => (
            <MangaCard key={m.id} manga={m} onOpen={() => onOpenManga(m)} isFav={favorites.has(m.id)} toggleFavorite={() => toggleFavorite(m.id)} />
          ))}
        </div>
      </Section>

      {/* قسم النشر السريع لقاعدة البيانات */}
      <div className="px-4 mt-6">
        <div style={{ background: "#201B14", padding: "12px", borderRadius: "12px", border: "1px solid #2A241C" }}>
          <h3 className="text-xs font-bold mb-2 text-[#C1440E]">إضافة عمل جديد (Firestore)</h3>
          <input type="text" id="manga-title" placeholder="اسم المانغا" style={{ width: "100%", padding: "6px", marginBottom: "6px", background: "#17140F", border: "1px solid #3a332a", color: "#fff", borderRadius: "6px", fontSize: "12px" }} />
          <textarea id="manga-desc" placeholder="الوصف" style={{ width: "100%", padding: "6px", marginBottom: "6px", background: "#17140F", border: "1px solid #3a332a", color: "#fff", borderRadius: "6px", fontSize: "12px" }}></textarea>
          <button onClick={addMangaToFirestore} className="w-full py-1.5 rounded font-bold text-xs" style={{ background: "#28a745", color: "#fff" }}>نشر</button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="mt-5">
      <div className="flex items-center gap-1.5 px-4 mb-2">
        {icon}
        <h3 className="text-sm font-bold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function MangaCard({ manga, onOpen, isFav, toggleFavorite }) {
  return (
    <div className="w-28 shrink-0">
      <button onClick={onOpen} className="relative block w-28 h-40 rounded-xl overflow-hidden">
        <CoverArt palette={manga.palette} seed={manga.id} className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <button onClick={(e) => { e.stopPropagation(); toggleFavorite(); }} className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
          <Heart size={12} style={{ fill: isFav ? "#C1440E" : "none", color: isFav ? "#C1440E" : "#F0E9DC" }} />
        </button>
      </button>
      <p className="text-xs font-semibold mt-1 truncate">{manga.title}</p>
      <p className="text-[10px] opacity-50">{manga.genre}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Search View
// ---------------------------------------------------------------------------
function SearchView({ query, setQuery, genreFilter, setGenreFilter, results, onOpenManga }) {
  return (
    <div className="px-4 pt-4">
      <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "#221D16" }}>
        <Search size={16} className="opacity-60" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث عن مانغا..." className="bg-transparent outline-none flex-1 text-xs placeholder:opacity-50" />
        {query && <button onClick={() => setQuery("")}><X size={14} className="opacity-60" /></button>}
      </div>
      <div className="grid grid-cols-3 gap-3 mt-4">
        {results.map((m) => (
          <button key={m.id} onClick={() => onOpenManga(m)} className="text-right">
            <CoverArt palette={m.palette} seed={m.id} className="w-full h-32 rounded-lg" />
            <p className="text-xs font-semibold mt-1 truncate">{m.title}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Library View
// ---------------------------------------------------------------------------
function LibraryView({ favorites, onOpenManga, toggleFavorite }) {
  const list = MANGAS.filter((m) => favorites.has(m.id));
  return (
    <div className="px-4 pt-4">
      <h1 className="font-display text-xl mb-3">مكتبتي المحفوظة</h1>
      <div className="flex flex-col gap-2">
        {list.map((m) => (
          <div key={m.id} className="flex items-center gap-3 rounded-xl p-2" style={{ background: "#201B14" }}>
            <button onClick={() => onOpenManga(m)}><CoverArt palette={m.palette} seed={m.id} className="w-12 h-16 rounded-lg shrink-0" /></button>
            <div className="flex-1 min-w-0 text-right">
              <p className="text-sm font-semibold truncate">{m.title}</p>
              <p className="text-xs opacity-50">{m.genre}</p>
            </div>
            <button onClick={() => toggleFavorite(m.id)}><Heart size={16} style={{ fill: "#C1440E", color: "#C1440E" }} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Manga Detail View
// ---------------------------------------------------------------------------
function MangaDetailView({ manga, isFav, toggleFavorite, onBack, onRead }) {
  const chapters = Array.from({ length: 10 }, (_, i) => 10 - i);
  return (
    <div className="px-4 pt-4">
      <button onClick={onBack} className="flex items-center gap-1 text-xs mb-3 opacity-70"><ChevronRight size={16} /> العودة</button>
      <div className="flex gap-3">
        <CoverArt palette={manga.palette} seed={manga.id} className="w-24 h-36 rounded-xl shrink-0" />
        <div>
          <h1 className="font-display text-xl">{manga.title}</h1>
          <p className="text-xs opacity-60 mt-1">{manga.author}</p>
          <p className="text-xs mt-2 text-[#C1440E] font-bold">{manga.status}</p>
          <button onClick={() => onRead(1)} className="mt-3 px-4 py-2 rounded-xl text-xs font-bold" style={{ background: "#C1440E", color: "#17140F" }}>
            ابدأ القراءة
          </button>
        </div>
      </div>
      <div className="mt-6">
        <h3 className="text-sm font-bold mb-2">قائمة الفصول</h3>
        <div className="flex flex-col gap-1.5">
          {chapters.map((ch) => (
            <button key={ch} onClick={() => onRead(ch)} className="flex items-center justify-between p-2.5 rounded-lg text-xs" style={{ background: "#201B14" }}>
              <span>الفصل {ch}</span>
              <ChevronLeft size={14} className="opacity-50" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Advanced Reader View (قارئ فصول احترافي)
// ---------------------------------------------------------------------------
function ReaderView({ manga, chapter, setChapter, onExit }) {
  return (
    <div className="flex flex-col h-screen" style={{ background: "#0D0B08" }}>
      {/* شريط التحكم بقارئ الفصول */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ background: "#17140F", borderColor: "#2A241C" }}>
        <button onClick={onExit} className="flex items-center gap-1 text-xs text-amber-500 font-bold"><ChevronRight size={16} /> خروج</button>
        <span className="text-xs font-bold">{manga.title} - الفصل {chapter}</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setChapter(Math.max(1, chapter - 1))} className="p-1 rounded bg-[#201B14]"><ChevronRight size={14} /></button>
          <span className="text-xs opacity-60">{chapter}</span>
          <button onClick={() => setChapter(chapter + 1)} className="p-1 rounded bg-[#201B14]"><ChevronLeft size={14} /></button>
        </div>
      </div>

      {/* منطقة التصفح والعرض */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center gap-4">
        <div className="w-full max-w-md h-96 rounded-xl flex items-center justify-center border border-dashed border-zinc-800 text-center p-4" style={{ background: "#120F0C" }}>
          <div>
            <BookOpen size={36} className="mx-auto opacity-30 mb-2 text-[#C1440E]" />
            <p className="text-sm font-bold">صفحة المانغا (الفصل {chapter})</p>
            <p className="text-xs opacity-50 mt-1">يتم جلب الصور مباشرة من السيرفر المربوط بـ Firestore</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bottom Nav
// ---------------------------------------------------------------------------
function BottomNav({ view, setView }) {
  return (
    <div className="fixed bottom-0 inset-x-0 flex justify-around items-center py-2.5 border-t" style={{ background: "#17140F", borderColor: "#2A241C" }}>
      <button onClick={() => setView("home")} className={`flex flex-col items-center text-[10px] ${view === "home" ? "text-[#C1440E]" : "opacity-50"}`}>
        <Home size={18} /><span>الرئيسية</span>
      </button>
      <button onClick={() => setView("search")} className={`flex flex-col items-center text-[10px] ${view === "search" ? "text-[#C1440E]" : "opacity-50"}`}>
        <Search size={18} /><span>البحث</span>
      </button>
      <button onClick={() => setView("library")} className={`flex flex-col items-center text-[10px] ${view === "library" ? "text-[#C1440E]" : "opacity-50"}`}>
        <Bookmark size={18} /><span>مكتبتي</span>
      </button>
    </div>
  );
}
