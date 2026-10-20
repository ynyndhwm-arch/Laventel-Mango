import React, { useState, useMemo } from "react";
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

// تهيئة فايربيس (عبر مكتبات الـ CDN المضافة في index.html)
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = typeof firebase !== 'undefined' ? firebase.auth() : null;
const db = typeof firebase !== 'undefined' ? firebase.firestore() : null;

// دوال المصادقة وقاعدة البيانات
function loginWithGoogle() {
  if (!auth) return;
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      const userInfoEl = document.getElementById('user-info');
      if (userInfoEl) userInfoEl.innerText = `مرحباً، ${user.displayName}`;
      alert(`أهلاً بك يا ${user.displayName} تم تسجيل دخولك بنجاح!`);
    })
    .catch((error) => {
      console.error("خطأ في تسجيل الدخول:", error);
      alert("فشل تسجيل الدخول، تأكد من إعدادات المصادقة.");
    });
}

function addMangaToFirestore() {
  if (!db) return;
  const titleInput = document.getElementById('manga-title');
  const descInput = document.getElementById('manga-desc');
  
  if (!titleInput || !titleInput.value) {
    alert("الرجاء إدخال عنوان المانغا على الأقل!");
    return;
  }

  const title = titleInput.value;
  const description = descInput ? descInput.value : '';

  db.collection("mangas").add({
    title: title,
    description: description,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
    alert("تمت إضافة المانغا بنجاح إلى قاعدة البيانات السحابية!");
    titleInput.value = '';
    if (descInput) descInput.value = '';
  })
  .catch((error) => {
    console.error("خطأ أثناء الإضافة: ", error);
    alert("حدث خطأ أثناء حفظ البيانات.");
  });
}

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------
const GENRES = ["أكشن", "خيال", "رومانسية", "رعب", "مغامرة", "دراما", "كوميديا"];

const COVER_PALETTES = [
  ["#7A1F2B", "#2A0D12"],
  ["#1F3B4D", "#0A1620"],
  ["#4B3B78", "#1A1230"],
  ["#3D5A2C", "#12200C"],
  ["#8A5A21", "#2B1A05"],
  ["#6B2440", "#210B14"],
  ["#22515A", "#081A1D"],
  ["#5A3921", "#1C1006"],
];

const TITLES = [
  { title: "سيف الفجر", genre: "أكشن", ch: 142, rating: 4.8, hot: true },
  { title: "ظل التنين الأخير", genre: "خيال", ch: 88, rating: 4.6, hot: true },
  { title: "همسات القمر", genre: "رومانسية", ch: 54, rating: 4.9, hot: false },
  { title: "صائد الأرواح", genre: "رعب", ch: 71, rating: 4.5, hot: true },
  { title: "طريق الألف خطوة", genre: "مغامرة", ch: 210, rating: 4.7, hot: false },
  { title: "قلب من حديد", genre: "دراما", ch: 33, rating: 4.4, hot: false },
  { title: "مملكة الرماد", genre: "خيال", ch: 96, rating: 4.8, hot: true },
  { title: "ضحكة الغراب", genre: "كوميديا", ch: 60, rating: 4.3, hot: false },
  { title: "نجمة الشمال", genre: "مغامرة", ch: 122, rating: 4.6, hot: false },
  { title: "العاصفة الحمراء", genre: "أكشن", ch: 175, rating: 4.9, hot: true },
  { title: "بيت الأشباح السبعة", genre: "رعب", ch: 40, rating: 4.2, hot: false },
  { title: "زهور الشتاء", genre: "رومانسية", ch: 29, rating: 4.7, hot: false },
];

const MANGAS = TITLES.map((t, i) => ({
  id: i + 1,
  ...t,
  palette: COVER_PALETTES[i % COVER_PALETTES.length],
  synopsis:
    "في عالمٍ يتصارع فيه الضوء والظل، يخوض بطلنا رحلة محفوفة بالمخاطر بحثًا عن حقيقة ماضيه، وسط تحالفات هشّة وأعداء لا يرحمون. كل فصل يكشف طبقة جديدة من هذا العالم الغامض.",
  author: "استوديو حبر",
  status: i % 3 === 0 ? "مكتملة" : "مستمرة",
}));

function CoverArt({ palette, seed = 0, className = "" }) {
  const [c1, c2] = palette;
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(160deg, ${c1} 0%, ${c2} 100%)`,
      }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 2px, transparent 2px, transparent 14px)",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 90,
          height: 90,
          right: -20 + (seed % 3) * 10,
          top: -20 + (seed % 4) * 8,
          background: "rgba(255,255,255,0.10)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-1/2"
        style={{
          background: `linear-gradient(0deg, ${c2}CC 0%, transparent 100%)`,
        }}
      />
    </div>
  );
}

function HankoBadge({ children }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full text-[10px] font-bold px-2 py-0.5 text-[#F0E9DC] shadow-sm"
      style={{ background: "#B3331D", letterSpacing: "0.02em" }}
    >
      {children}
    </span>
  );
}

export default function App() {
  const [view, setView] = useState("home");
  const [activeManga, setActiveManga] = useState(null);
  const [activeChapter, setActiveChapter] = useState(1);
  const [favorites, setFavorites] = useState(() => new Set([1, 4, 10]));
  const [query, setQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState(null);

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
    <div
      dir="rtl"
      className="min-h-screen w-full flex flex-col"
      style={{
        background: "#17140F",
        color: "#F0E9DC",
        fontFamily: "'IBM Plex Sans Arabic', 'Noto Sans Arabic', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Rakkas&display=swap');
        .font-display { font-family: 'Rakkas', 'IBM Plex Sans Arabic', serif; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #3a332a; border-radius: 3px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* قسم تسجيل الدخول السريع في الأعلى */}
      <div style={{ background: "#201B14", padding: "10px", textAlign: "center", borderBottom: "1px solid #3a332a" }}>
        <button 
          onClick={loginWithGoogle}
          style={{ background: "#4285F4", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "12px" }}
        >
          تسجيل الدخول بـ Google
        </button>
        <span id="user-info" style={{ margin: "0 10px", fontSize: "12px" }}>غير مسجل دخول</span>
      </div>

      {view === "reader" && activeManga ? (
        <ReaderView
          manga={activeManga}
          chapter={activeChapter}
          setChapter={setActiveChapter}
          onExit={() => setView("manga")}
        />
      ) : (
        <>
          <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
            {view === "home" && (
              <HomeView
                onOpenManga={openManga}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                setGenreFilter={setGenreFilter}
                setView={setView}
              />
            )}
            {view === "search" && (
              <SearchView
                query={query}
                setQuery={setQuery}
                genreFilter={genreFilter}
                setGenreFilter={setGenreFilter}
                results={filteredResults}
                onOpenManga={openManga}
              />
            )}
            {view === "library" && (
              <LibraryView
                favorites={favorites}
                onOpenManga={openManga}
                toggleFavorite={toggleFavorite}
              />
            )}
            {view === "manga" && activeManga && (
              <MangaDetailView
                manga={activeManga}
                isFav={favorites.has(activeManga.id)}
                toggleFavorite={toggleFavorite}
                onBack={() => setView("home")}
                onRead={(ch) => openReader(activeManga, ch)}
              />
            )}
          </main>
          <BottomNav view={view} setView={setView} />
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Home
// ---------------------------------------------------------------------------
function HomeView({ onOpenManga, favorites, toggleFavorite, setGenreFilter, setView }) {
  const featured = MANGAS[0];
  const trending = MANGAS.filter((m) => m.hot);
  const latest = [...MANGAS].sort((a, b) => b.ch - a.ch).slice(0, 6);

  return (
    <div>
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <div>
          <p className="text-xs opacity-60">مرحباً بعودتك</p>
          <h1 className="font-display text-2xl leading-none mt-1">قارئ الحبر</h1>
        </div>
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "#2A241C" }}
        >
          <Bell size={17} />
        </button>
      </div>

      <div className="px-4">
        <button
          onClick={() => onOpenManga(featured)}
          className="relative w-full h-44 rounded-2xl overflow-hidden text-right block"
        >
          <CoverArt palette={featured.palette} seed={1} className="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <div className="absolute bottom-0 right-0 p-4 w-full">
            <HankoBadge>الأكثر رواجاً</HankoBadge>
            <h2 className="font-display text-2xl mt-2">{featured.title}</h2>
            <p className="text-xs opacity-80 mt-1">
              {featured.genre} · {featured.ch} فصل
            </p>
          </div>
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 mt-4">
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => {
              setGenreFilter(g);
              setView("search");
            }}
            className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium"
            style={{ background: "#2A241C", color: "#E4D9C4" }}
          >
            {g}
          </button>
        ))}
      </div>

      <Section title="الأكثر قراءة الآن" icon={<Flame size={15} style={{ color: "#C1440E" }} />}>
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-4">
          {trending.map((m) => (
            <MangaCard
              key={m.id}
              manga={m}
              onOpen={() => onOpenManga(m)}
              isFav={favorites.has(m.id)}
              toggleFavorite={() => toggleFavorite(m.id)}
            />
          ))}
        </div>
      </Section>

      {/* نموذج إضافة مانغا إلى فايربيس */}
      <div className="px-4 mt-6">
        <div style={{ background: "#201B14", padding: "15px", borderRadius: "12px", border: "1px solid #3a332a" }}>
          <h3 className="text-sm font-bold mb-2">إضافة مانغا جديدة للقاعدة السحابية</h3>
          <input type="text" id="manga-title" placeholder="عنوان المانغا" style={{ width: "100%", padding: "8px", marginBottom: "8px", background: "#17140F", border: "1px solid #3a332a", color: "#fff", borderRadius: "6px", fontSize: "12px" }} /><br />
          <textarea id="manga-desc" placeholder="وصف القصة" style={{ width: "100%", padding: "8px", marginBottom: "8px", background: "#17140F", border: "1px solid #3a332a", color: "#fff", borderRadius: "6px", fontSize: "12px" }}></textarea><br />
          <button onClick={addMangaToFirestore} style={{ padding: "6px 12px", background: "#28a745", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>حفظ ونشر</button>
        </div>
      </div>

      <Section title="تحديثات جديدة" icon={<Clock size={15} style={{ color: "#C1440E" }} />}>
        <div className="flex flex-col gap-2 px-4">
          {latest.map((m) => (
            <button
              key={m.id}
              onClick={() => onOpenManga(m)}
              className="flex items-center gap-3 rounded-xl p-2 text-right"
              style={{ background: "#201B14" }}
            >
              <CoverArt palette={m.palette} seed={m.id} className="w-12 h-16 rounded-lg shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{m.title}</p>
                <p className="text-xs opacity-60 mt-0.5">
                  الفصل {m.ch} · {m.genre}
                </p>
              </div>
              <ChevronLeft size={16} className="opacity-50" />
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-1.5 px-4 mb-3">
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
        {manga.hot && (
          <div className="absolute top-1.5 right-1.5">
            <HankoBadge>جديد</HankoBadge>
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite();
          }}
          className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.45)" }}
        >
          <Heart
            size={12}
            style={{ fill: isFav ? "#C1440E" : "none", color: isFav ? "#C1440E" : "#F0E9DC" }}
          />
        </button>
        <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5">
          <Star size={10} style={{ color: "#E3B34C", fill: "#E3B34C" }} />
          <span className="text-[10px] font-medium">{manga.rating}</span>
        </div>
      </button>
      <p className="text-xs font-semibold mt-1.5 truncate">{manga.title}</p>
      <p className="text-[10px] opacity-55">{manga.genre}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------
function SearchView({ query, setQuery, genreFilter, setGenreFilter, results, onOpenManga }) {
  return (
    <div className="px-4 pt-5">
      <h1 className="font-display text-2xl mb-3">تصفّح المانجا</h1>
      <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: "#221D16" }}>
        <Search size={16} className="opacity-60" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن قصة، بطل، أو عالم..."
          className="bg-transparent outline-none flex-1 text-sm placeholder:opacity-50"
        />
        {query && (
          <button onClick={() => setQuery("")}>
            <X size={14} className="opacity-60" />
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mt-3">
        <button
          onClick={() => setGenreFilter(null)}
          className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{
            background: !genreFilter ? "#C1440E" : "#2A241C",
            color: !genreFilter ? "#17140F" : "#E4D9C4",
          }}
        >
          الكل
        </button>
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => setGenreFilter(g)}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: genreFilter === g ? "#C1440E" : "#2A241C",
              color: genreFilter === g ? "#17140F" : "#E4D9C4",
            }}
          >
            {g}
          </button>
        ))}
      </div>

      <p className="text-xs opacity-50 mt-4 mb-2">{results.length} نتيجة</p>
      <div className="grid grid-cols-3 gap-3">
        {results.map((m) => (
          <button key={m.id} onClick={() => onOpenManga(m)} className="text-right">
            <CoverArt palette={m.palette} seed={m.id} className="w-full h-32 rounded-lg" />
            <p className="text-xs font-semibold mt-1.5 truncate">{m.title}</p>
            <p className="text-[10px] opacity-55">{m.ch} فصل</p>
          </button>
        ))}
        {results.length === 0 && (
          <p className="col-span-3 text-center text-sm opacity-50 mt-10">
            لا توجد نتائج مطابقة لبحثك
          </p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Library
// ---------------------------------------------------------------------------
function LibraryView({ favorites, onOpenManga, toggleFavorite }) {
  const list = MANGAS.filter((m) => favorites.has(m.id));
  return (
    <div className="px-4 pt-5">
      <h1 className="font-display text-2xl mb-1">مكتبتي</h1>
      <p className="text-xs opacity-55 mb-4">القصص المحفوظة للمتابعة لاحقاً</p>

      {list.length === 0 ? (
        <div className="text-center mt-16">
          <Bookmark size={32} className="opacity-30 mx-auto mb-3" />
          <p className="text-sm opacity-60">مكتبتك فارغة حالياً</p>
          <p className="text-xs opacity-40 mt-1">اضغط على أيقونة القلب لحفظ أي قصة هنا</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {list.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3 rounded-xl p-2"
              style={{ background: "#201B14" }}
            >
              <button onClick={() => onOpenManga(m)} className="shrink-0">
                <CoverArt palette={m.palette} seed={m.id} className="w-12 h-16 rounded-lg" />
              </button>
              <button onClick={() => onOpenManga(m)} className="flex-1 min-w-0 text-right">
                <p className="text-sm font-semibold truncate">{m.title}</p>
                <p className="text-xs opacity-60 mt-0.5">حتى الفصل {m.ch}</p>
              </button>
              <button
                onClick={() => toggleFavorite(m.id)}
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "#2A241C" }}
              >
                <Heart size={13} style={{ fill: "#C1440E", color: "#C1440E" }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Manga detail
// ---------------------------------------------------------------------------
function MangaDetailView({ manga, isFav, toggleFavorite, onBack, onRead }) {
  const chapters = Array.from({ length: Math.min(manga.ch, 20) }, (_, i) => manga.ch - i);

  return (
    <div>
      <div className="relative h-56">
        <CoverArt palette={manga.palette} seed={manga.id} className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#17140F] via-black/30 to-black/20" />
        <button
          onClick={onBack}
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.4)" }}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="px-4 -mt-10 relative">
        <div className="flex items-end gap-3">
          <CoverArt
            palette={manga.palette}
            seed={manga.id}
            className="w-24 h-32 rounded-xl border-2 shrink-0"
          />
          <div className="pb-1 min-w-0">
            <h1 className="font-display text-xl leading-tight">{manga.title}</h1>
            <p className="text-xs opacity-60 mt-1">{manga.author}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4 text-xs">
          <span className="flex items-center gap-1">
            <Star size={13} style={{ color: "#E3B34C", fill: "#E3B34C" }} />
            {manga.rating}
          </span>
          <span className="opacity-60">{manga.genre}</span>
          <span
            className="px-2 py-0.5 rounded-full"
            style={{
              background: manga.status === "مكتملة" ? "#2C4A3A" : "#3A2E1A",
              color: manga.status === "مكتملة" ? "#8FD9B3" : "#E3B34C",
              fontSize: "10px",
            }}
          >
            {manga.status}
          </span>
        </div>

        <p className="text-sm opacity-75 leading-relaxed mt-4">{manga.synopsis}</p>

        <div className="flex gap-2 mt-5">
          <button
            onClick={() => onRead(manga.ch)}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold"
            style={{ background: "#C1440E", color: "#17140F" }}
          >
            <BookOpen size={16} />
            ابدأ القراءة
          </button>
          <button
            onClick={() => toggleFavorite(manga.id)}
            className="w-12 rounded-xl flex items-center justify-center"
            style={{ background: "#201B14" }}
          >
            <Heart size={18} style={{ fill: isFav ? "#C1440E" : "none", color: isFav ? "#C1440E" : "#F0E9DC" }} />
          </button>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-bold mb-3">الفصول الأخيرة</h3>
          <div className="flex flex-col gap-2">
            {chapters.map((ch) => (
              <button
                key={ch}
                onClick={() => onRead(ch)}
                className="flex items-center justify-between p-3 rounded-xl text-xs"
                style={{ background: "#201B14" }}
              >
                <span>الفصل {ch}</span>
                <ChevronLeft size5={14} className="opacity-50" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reader View
// ---------------------------------------------------------------------------
function ReaderView({ manga, chapter, setChapter, onExit }) {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between px-4 py-3" style={{ background: "#201B14" }}>
        <button onClick={onExit} className="flex items-center gap-1 text-xs">
          <ChevronRight size={16} /> العودة
        </button>
        <span className="text-xs font-bold">{manga.title} - الفصل {chapter}</span>
        <div style={{ width: 40 }} />
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center opacity-60 text-sm">
          محاكاة قراءة الفصل {chapter}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bottom Navigation
// ---------------------------------------------------------------------------
function BottomNav({ view, setView }) {
  return (
    <div
      className="fixed bottom-0 inset-x-0 flex justify-around items-center py-3 border-t"
      style={{ background: "#17140F", borderColor: "#2A241C" }}
    >
      <button
        onClick={() => setView("home")}
        className={`flex flex-col items-center gap-1 text-xs ${view === "home" ? "opacity-150" : "opacity-50"}`}
        style={{ color: view === "home" ? "#C1440E" : "#F0E9DC" }}
      >
        <Home size={20} />
        <span>الرئيسية</span>
      </button>
      <button
        onClick={() => setView("search")}
        className={`flex flex-col items-center gap-1 text-xs ${view === "search" ? "opacity-150" : "opacity-50"}`}
        style={{ color: view === "search" ? "#C1440E" : "#F0E9DC" }}
      >
        <Search size={20} />
        <span>بحث</span>
      </button>
      <button
        onClick={() => setView("library")}
        className={`flex flex-col items-center gap-1 text-xs ${view === "library" ? "opacity-150" : "opacity-50"}`}
        style={{ color: view === "library" ? "#C1440E" : "#F0E9DC" }}
      >
        <Bookmark size={20} />
        <span>مكتبتي</span>
      </button>
    </div>
  );
}
