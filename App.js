import React, { useState } from "react";

export default function App() {
  const [mangas, setMangas] = useState([
    { id: 1, title: "سيف الفجر", genre: "أكشن", ch: 142 },
    { id: 2, title: "ظل التنين الأخير", genre: "خيال", ch: 88 }
  ]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const handleAdd = () => {
    if (!title) {
      alert("الرجاء كتابة العنوان!");
      return;
    }
    setMangas([...mangas, { id: Date.now(), title, genre: "جديد", ch: 1 }]);
    setTitle("");
    setDesc("");
    alert("تمت الإضافة بنجاح!");
  };

  return (
    <div dir="rtl" style={{ background: "#17140F", color: "#F0E9DC", minHeight: "100vh", padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center", color: "#C1440E", fontSize: "28px" }}>مانغا ليبراكس - Manga Liberax</h1>
      
      {/* قسم إضافة مانغا */}
      <div style={{ background: "#201B14", padding: "15px", borderRadius: "12px", maxWidth: "400px", margin: "20px auto", border: "1px solid #3a332a" }}>
        <h3 style={{ marginBottom: "10px", fontSize: "16px" }}>إضافة عمل جديد</h3>
        <input 
          type="text" 
          placeholder="عنوان المانغا" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          style={{ width: "100%", padding: "8px", marginBottom: "10px", background: "#17140F", border: "1px solid #444", color: "#fff", borderRadius: "6px" }}
        />
        <textarea 
          placeholder="وصف القصة" 
          value={desc} 
          onChange={(e) => setDesc(e.target.value)} 
          style={{ width: "100%", padding: "8px", marginBottom: "10px", background: "#17140F", border: "1px solid #444", color: "#fff", borderRadius: "6px" }}
        ></textarea>
        <button 
          onClick={handleAdd} 
          style={{ width: "100%", padding: "10px", background: "#C1440E", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
        >
          نشر العمل
        </button>
      </div>

      {/* قائمة المانغا */}
      <div style={{ maxWidth: "400px", margin: "20px auto" }}>
        <h3 style={{ marginBottom: "10px" }}>قائمة المانغا المتاحة</h3>
        {mangas.map((m) => (
          <div key={m.id} style={{ background: "#201B14", padding: "12px", borderRadius: "8px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h4 style={{ margin: 0, fontSize: "14px" }}>{m.title}</h4>
              <span style={{ fontSize: "11px", opacity: 0.6 }}>{m.genre} · {m.ch} فصل</span>
            </div>
            <button style={{ background: "#3a332a", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "4px", fontSize: "11px" }}>قراءة</button>
          </div>
        ))}
      </div>
    </div>
  );
}
