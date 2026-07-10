"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "../../../components/admin/AdminContext";

export default function LanguagesPage() {
  const { languages, isAuthenticated, addLanguage, updateLanguage, removeLanguage } = useAdmin();
  const router = useRouter();

  const [langCode, setLangCode] = useState("");
  const [langName, setLangName] = useState("");
  const [langFlag, setLangFlag] = useState("\uD83C\uDDEC\uD83C\uDDE7");
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.push("/admin/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const handleCreateLanguage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!langCode.trim() || !langName.trim()) return;
    addLanguage({
      code: langCode.toLowerCase().trim(),
      name: langName.trim(),
      flag: langFlag,
      isActive: true,
      isDefault: false,
    });
    setLangCode("");
    setLangName("");
    setShowAddForm(false);
  };

  const handleToggleActive = (id: number, currentActive: boolean) => {
    updateLanguage(id, { isActive: !currentActive });
  };

  const handleSetDefault = (id: number) => {
    languages.forEach((lang) => {
      updateLanguage(lang.id, lang.id === id ? { isDefault: true, isActive: true } : { isDefault: false });
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">{"C\u1ea5u h\u00ecnh \u0110a ng\u00f4n ng\u1eef"}</h2>
          <p className="text-xs text-slate-500 mt-1">
            {"B\u1eadt/t\u1eaft c\u00e1c ng\u00f4n ng\u1eef hi\u1ec3n th\u1ecb ngo\u00e0i website. Ng\u00f4n ng\u1eef b\u1ecb t\u1eaft s\u1ebd kh\u00f4ng xu\u1ea5t hi\u1ec7n trong n\u00fat chuy\u1ec3n ng\u00f4n ng\u1eef."}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all self-start sm:self-center"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {showAddForm ? "H\u1ee7y" : "Th\u00eam ng\u00f4n ng\u1eef"}
        </button>
      </section>

      {showAddForm && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm max-w-lg">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">{"\u0110\u0103ng k\u00fd ng\u00f4n ng\u1eef m\u1edbi"}</h3>
          <form onSubmit={handleCreateLanguage} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">{"M\u00e3 (Code)"}</label>
                <input
                  type="text"
                  required
                  value={langCode}
                  onChange={(e) => setLangCode(e.target.value)}
                  placeholder="fr, ja, ko"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">{"T\u00ean ng\u00f4n ng\u1eef"}</label>
                <input
                  type="text"
                  required
                  value={langName}
                  onChange={(e) => setLangName(e.target.value)}
                  placeholder="English, Fran\u00e7ais, Ti\u1ebfng H\u00e0n"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">{"Emoji l\u00e1 c\u1edd"}</label>
              <select
                value={langFlag}
                onChange={(e) => setLangFlag(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
              >
                <option value="\uD83C\uDDFB\uD83C\uDDF3">{"\uD83C\uDDFB\uD83C\uDDF3 Vi\u1ec7t Nam (VI)"}</option>
                <option value="\uD83C\uDDEC\uD83C\uDDE7">{"\uD83C\uDDEC\uD83C\uDDE7 Anh (EN)"}</option>
                <option value="\uD83C\uDDE8\uD83C\uDDF3">{"\uD83C\uDDE8\uD83C\uDDF3 Trung Qu\u1ed1c (ZH)"}</option>
                <option value="\uD83C\uDDEF\uD83C\uDDF5">{"\uD83C\uDDEF\uD83C\uDDF5 Nh\u1eadt B\u1ea3n (JA)"}</option>
                <option value="\uD83C\uDDF0\uD83C\uDDF7">{"\uD83C\uDDF0\uD83C\uDDF7 H\u00e0n Qu\u1ed1c (KO)"}</option>
                <option value="\uD83C\uDDEB\uD83C\uDDF7">{"\uD83C\uDDEB\uD83C\uDDF7 Ph\u00e1p (FR)"}</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">
                {"H\u1ee7y"}
              </button>
              <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/10 transition-all">
                {"L\u01b0u ng\u00f4n ng\u1eef"}
              </button>
            </div>
          </form>
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {languages.map((lang) => (
          <div
            key={lang.id}
            className={`bg-white rounded-2xl border p-5 shadow-sm transition-all flex flex-col justify-between h-44 ${lang.isActive ? "border-slate-100" : "border-slate-200/50 bg-slate-50/50"}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl select-none">{lang.flag}</span>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{lang.name}</h4>
                  <span className="text-xs text-slate-400 uppercase font-mono">{lang.code}</span>
                </div>
              </div>
              {lang.isDefault ? (
                <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase">{"M\u1eb7c \u0111\u1ecbnh"}</span>
              ) : (
                <button onClick={() => handleSetDefault(lang.id)} className="px-2 py-0.5 bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-100 text-slate-400 hover:text-emerald-700 text-[10px] font-black rounded-full uppercase transition-colors">
                  {"Ghim m\u1eb7c \u0111\u1ecbnh"}
                </button>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-extrabold block">{"Tr\u1ea1ng th\u00e1i hi\u1ec3n th\u1ecb"}</span>
                <span className={`text-xs font-bold ${lang.isActive ? "text-emerald-600" : "text-slate-400"}`}>{lang.isActive ? "\u0110ang hi\u1ec3n th\u1ecb" : "\u0110\u00e3 t\u1eaft"}</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleActive(lang.id, lang.isActive)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${lang.isActive ? "bg-emerald-600 justify-end" : "bg-slate-300 justify-start"}`}
                  aria-label={lang.isActive ? "T\u1eaft hi\u1ec3n th\u1ecb" : "B\u1eadt hi\u1ec3n th\u1ecb"}
                >
                  <span className="bg-white w-4 h-4 rounded-full shadow-md transition-all" />
                </button>

                {!lang.isDefault && (
                  <button
                    onClick={() => {
                      if (confirm(`X\u00f3a ng\u00f4n ng\u1eef ${lang.name}?`)) removeLanguage(lang.id);
                    }}
                    className="p-1 text-slate-300 hover:text-rose-600 transition-colors"
                    aria-label="X\u00f3a"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}