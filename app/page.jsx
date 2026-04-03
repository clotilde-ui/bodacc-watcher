"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ─── Icônes SVG légères ────────────────────────────────────────────────────
const IconRefresh = ({ spin }) => (
  <svg className={`w-4 h-4 ${spin ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const IconBuilding = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const IconLog = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const IconSearch = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const IconLink = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const IconDownload = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const IconBookmark = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

const IconTrash = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const IconList = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

// ─── Multi-select dropdown ────────────────────────────────────────────────
function MultiSelect({ options, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (val) => {
    onChange(value.includes(val) ? value.filter((v) => v !== val) : [...value, val]);
  };

  const label =
    value.length === 0 ? placeholder :
    value.length === 1 ? value[0] :
    `${value.length} sélectionnés`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-2 px-3 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
      >
        <span className={`truncate ${value.length === 0 ? "text-gray-400" : "text-gray-900"}`}>{label}</span>
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
          {options.length === 0 && (
            <p className="px-3 py-2 text-xs text-gray-400">Aucune option</p>
          )}
          {options.map((opt) => (
            <label key={opt} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={value.includes(opt)}
                onChange={() => toggle(opt)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="truncate">{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Badge statut import ───────────────────────────────────────────────────
function StatusBadge({ status }) {
  const styles = {
    success: "bg-green-100 text-green-800",
    partial: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    running: "bg-blue-100 text-blue-800",
  };
  const labels = {
    success: "✓ Succès",
    partial: "⚠ Partiel",
    error: "✗ Erreur",
    running: "⏳ En cours",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-600"}`}>
      {labels[status] || status}
    </span>
  );
}

// ─── Formater une date ISO en lisible ─────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}
function fmtDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Tableau entreprises réutilisable ─────────────────────────────────────
function CompaniesTable({ companies }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Date</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Société</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">SIREN</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Forme juridique</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Nouvelle adresse</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Région</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Activité</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Lien</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {companies.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(c.date_parution)}</td>
                <td className="px-4 py-3 font-medium text-gray-900 max-w-xs">
                  <div className="truncate" title={c.denomination}>{c.denomination || "—"}</div>
                </td>
                <td className="px-4 py-3 text-gray-500 font-mono whitespace-nowrap">{c.siren || "—"}</td>
                <td className="px-4 py-3 text-gray-500 max-w-[140px]">
                  <div className="truncate text-xs" title={c.forme_juridique}>{c.forme_juridique || "—"}</div>
                </td>
                <td className="px-4 py-3 text-gray-700 max-w-xs">
                  <div className="truncate text-xs" title={c.adresse_complete}>
                    {c.adresse_complete || [c.cp, c.ville].filter(Boolean).join(" ") || "—"}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{c.region || "—"}</td>
                <td className="px-4 py-3 text-gray-500 max-w-[160px]">
                  <div className="truncate text-xs" title={c.activite}>{c.activite || "—"}</div>
                </td>
                <td className="px-4 py-3 text-center">
                  {c.lien && c.lien !== "https://www.bodacc.fr" ? (
                    <a
                      href={c.lien}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs"
                    >
                      <IconLink />
                      BODACC
                    </a>
                  ) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Composant principal ───────────────────────────────────────────────────
export default function Dashboard() {
  const [tab, setTab] = useState("companies"); // "companies" | "logs"

  // ── État entreprises ──
  const [companies, setCompanies] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [regions, setRegions] = useState([]);
  const [formesJuridiques, setFormesJuridiques] = useState([]);
  const [famillesAvis, setFamillesAvis] = useState([]);
  const [loading, setLoading] = useState(false);

  // ── Filtres ──
  const [formeJuridique, setFormeJuridique] = useState([]);
  const [capital, setCapital] = useState("");
  const [descriptif, setDescriptif] = useState("");
  const [motCle, setMotCle] = useState("");
  const [ville, setVille] = useState("");
  const [departement, setDepartement] = useState("");
  const [region, setRegion] = useState([]);
  const [familleAvis, setFamilleAvis] = useState([]);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  // ── Import ──
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState(null); // { type: "success"|"error", text }

  // ── Logs ──
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // ── Listes sauvegardées ──
  const [savedLists, setSavedLists] = useState([]);
  const [listsLoading, setListsLoading] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveListName, setSaveListName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null); // { type, text }
  const [activeList, setActiveList] = useState(null); // { id, name, companies, total, page, totalPages }
  const [listPage, setListPage] = useState(1);
  const [listLoading, setListLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // ── Chargement des entreprises ──
  const fetchCompanies = useCallback(async (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p });
    if (formeJuridique.length) params.set("formeJuridique", formeJuridique.join(","));
    if (capital) params.set("capital", capital);
    if (descriptif) params.set("descriptif", descriptif);
    if (motCle) params.set("motCle", motCle);
    if (ville) params.set("ville", ville);
    if (departement) params.set("departement", departement);
    if (region.length) params.set("region", region.join(","));
    if (familleAvis.length) params.set("familleAvis", familleAvis.join(","));
    if (dateDebut) params.set("dateDebut", dateDebut);
    if (dateFin) params.set("dateFin", dateFin);


    try {
      const res = await fetch(`/api/companies?${params}`);
      const data = await res.json();
      setCompanies(data.companies || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
      if (data.regions) setRegions(data.regions);
      if (data.formesJuridiques) setFormesJuridiques(data.formesJuridiques);
      if (data.famillesAvis) setFamillesAvis(data.famillesAvis);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [formeJuridique, capital, descriptif, motCle, ville, departement, region, familleAvis, dateDebut, dateFin]);

  // ── Chargement des logs ──
  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await fetch("/api/logs");
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies(1);
  }, []);

  useEffect(() => {
    if (tab === "logs") fetchLogs();
    if (tab === "lists") fetchSavedLists();
  }, [tab]);

  // ── Import manuel ──
  const lancerImport = async () => {
    setImporting(true);
    setImportMsg(null);
    try {
      const res = await fetch("/api/import", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setImportMsg({
          type: "success",
          text: `✓ Import terminé : ${data.totalAjoutes} nouvelle${data.totalAjoutes > 1 ? "s" : ""} entrée${data.totalAjoutes > 1 ? "s" : ""} ajoutée${data.totalAjoutes > 1 ? "s" : ""}.`,
        });
        fetchCompanies(1);
        if (tab === "logs") fetchLogs();
      } else {
        setImportMsg({ type: "error", text: `✗ Erreur : ${data.error}` });
      }
    } catch (e) {
      setImportMsg({ type: "error", text: `✗ Erreur réseau : ${e.message}` });
    } finally {
      setImporting(false);
    }
  };

  // ── Helpers filtres → query string ──
  const buildFilterParams = () => {
    const params = new URLSearchParams();
    if (formeJuridique.length) params.set("formeJuridique", formeJuridique.join(","));
    if (capital) params.set("capital", capital);
    if (descriptif) params.set("descriptif", descriptif);
    if (motCle) params.set("motCle", motCle);
    if (ville) params.set("ville", ville);
    if (departement) params.set("departement", departement);
    if (region.length) params.set("region", region.join(","));
    if (familleAvis.length) params.set("familleAvis", familleAvis.join(","));
    if (dateDebut) params.set("dateDebut", dateDebut);
    if (dateFin) params.set("dateFin", dateFin);
    return params;
  };

  // ── Export CSV ──
  const exportCsv = async (listId = null) => {
    setExporting(true);
    try {
      const params = listId ? new URLSearchParams({ listId }) : buildFilterParams();
      const res = await fetch(`/api/export?${params}`);
      if (!res.ok) throw new Error("Erreur lors de l'export");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = listId
        ? `liste-${listId}-${new Date().toISOString().slice(0, 10)}.csv`
        : `bodacc-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  // ── Listes sauvegardées ──
  const fetchSavedLists = async () => {
    setListsLoading(true);
    try {
      const res = await fetch("/api/lists");
      const data = await res.json();
      setSavedLists(data.lists || []);
    } catch (e) {
      console.error(e);
    } finally {
      setListsLoading(false);
    }
  };

  const saveCurrentList = async () => {
    if (!saveListName.trim()) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: saveListName,
          filters: {
            formeJuridique,
            capital,
            descriptif,
            motCle,
            ville,
            departement,
            region,
            familleAvis,
            dateDebut,
            dateFin,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveMsg({ type: "success", text: `✓ Liste "${saveListName}" sauvegardée (${data.count} entreprises).` });
        setSaveListName("");
        fetchSavedLists();
        setTimeout(() => { setSaveModalOpen(false); setSaveMsg(null); }, 2000);
      } else {
        setSaveMsg({ type: "error", text: `✗ ${data.error}` });
      }
    } catch (e) {
      setSaveMsg({ type: "error", text: `✗ Erreur réseau : ${e.message}` });
    } finally {
      setSaving(false);
    }
  };

  const deleteList = async (id) => {
    try {
      await fetch(`/api/lists/${id}`, { method: "DELETE" });
      setSavedLists((prev) => prev.filter((l) => l.id !== id));
      if (activeList?.id === id) setActiveList(null);
    } catch (e) {
      console.error(e);
    }
  };

  const openList = async (listId, p = 1) => {
    setListLoading(true);
    try {
      const res = await fetch(`/api/lists/${listId}?page=${p}`);
      const data = await res.json();
      setActiveList({
        id: listId,
        name: data.list?.name || "",
        companies: data.companies || [],
        total: data.total || 0,
        page: data.page || 1,
        totalPages: data.totalPages || 1,
      });
      setListPage(data.page || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setListLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCompanies(1);
  };

  const resetFilters = () => {
    setFormeJuridique([]);
    setCapital("");
    setDescriptif("");
    setMotCle("");
    setVille("");
    setDepartement("");
    setRegion([]);
    setFamilleAvis([]);
    setDateDebut("");
    setDateFin("");
    setTimeout(() => fetchCompanies(1), 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── En-tête ── */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">📋 BODACC Watcher</h1>
            <p className="text-sm text-gray-500 mt-0.5">Transferts de siège social — Secteur privé France métropolitaine</p>
          </div>

          <div className="flex items-center gap-3">
            {importMsg && (
              <span className={`text-sm px-3 py-1.5 rounded-md ${importMsg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {importMsg.text}
              </span>
            )}
            <button
              onClick={lancerImport}
              disabled={importing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <IconRefresh spin={importing} />
              {importing ? "Import en cours…" : "Lancer un import"}
            </button>
          </div>
        </div>

        {/* ── Onglets ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 border-t border-gray-100">
          {[
            { id: "companies", label: "Entreprises", icon: <IconBuilding /> },
            { id: "lists", label: "Listes sauvegardées", icon: <IconList /> },
            { id: "logs", label: "Historique des imports", icon: <IconLog /> },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.icon}
              {t.label}
              {t.id === "companies" && total > 0 && (
                <span className="ml-1 bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full">
                  {total.toLocaleString("fr-FR")}
                </span>
              )}
              {t.id === "lists" && savedLists.length > 0 && (
                <span className="ml-1 bg-purple-100 text-purple-700 text-xs px-1.5 py-0.5 rounded-full">
                  {savedLists.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* ══════════════════ ONGLET ENTREPRISES ══════════════════ */}
        {tab === "companies" && (
          <>
            {/* Filtres */}
            <form onSubmit={handleSearch} className="bg-white rounded-xl border border-gray-200 p-4 mb-5 shadow-sm">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {/* Forme juridique */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Forme juridique</label>
                  <MultiSelect
                    options={formesJuridiques}
                    value={formeJuridique}
                    onChange={setFormeJuridique}
                    placeholder="Toutes"
                  />
                </div>

                {/* Capital */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Capital</label>
                  <input
                    type="text"
                    placeholder="ex. 10 000"
                    value={capital}
                    onChange={(e) => setCapital(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Descriptif */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Descriptif</label>
                  <input
                    type="text"
                    placeholder="Mot clé dans le descriptif"
                    value={descriptif}
                    onChange={(e) => setDescriptif(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Modif – mot clé */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Modif – mot clé</label>
                  <input
                    type="text"
                    placeholder="ex. transfert, siège…"
                    value={motCle}
                    onChange={(e) => setMotCle(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Ville */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Ville</label>
                  <input
                    type="text"
                    placeholder="Paris, Lyon…"
                    value={ville}
                    onChange={(e) => setVille(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Département */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Département</label>
                  <input
                    type="text"
                    placeholder="Seine-Saint-Denis…"
                    value={departement}
                    onChange={(e) => setDepartement(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Région */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Région</label>
                  <MultiSelect
                    options={regions}
                    value={region}
                    onChange={setRegion}
                    placeholder="Toutes les régions"
                  />
                </div>

                {/* Famille avis */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Famille avis</label>
                  <MultiSelect
                    options={famillesAvis}
                    value={familleAvis}
                    onChange={setFamilleAvis}
                    placeholder="Toutes"
                  />
                </div>

                {/* Date parution début */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Date parution (début)</label>
                  <input
                    type="date"
                    value={dateDebut}
                    onChange={(e) => setDateDebut(e.target.value)}
                    className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Date parution fin */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Date parution (fin)</label>
                  <input
                    type="date"
                    value={dateFin}
                    onChange={(e) => setDateFin(e.target.value)}
                    className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Boutons */}
                <div className="flex items-end gap-2 col-span-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Rechercher
                  </button>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="py-2 px-3 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </form>

            {/* Résultats */}
            {loading ? (
              <div className="flex items-center justify-center py-16 text-gray-400">
                <IconRefresh spin />
                <span className="ml-2 text-sm">Chargement…</span>
              </div>
            ) : companies.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-4xl mb-3">🏢</p>
                <p className="font-medium">Aucune entreprise trouvée</p>
                <p className="text-sm mt-1">Lancez un premier import ou ajustez les filtres.</p>
              </div>
            ) : (
              <>
                {/* Tableau */}
                <CompaniesTable companies={companies} />

                {/* Barre d'actions + pagination */}
                <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-gray-500">
                  <span>{total.toLocaleString("fr-FR")} résultat{total > 1 ? "s" : ""}{totalPages > 1 ? ` — page ${page}/${totalPages}` : ""}</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Boutons actions */}
                    <button
                      onClick={() => exportCsv()}
                      disabled={exporting || total === 0}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors text-gray-600"
                    >
                      <IconDownload />
                      {exporting ? "Export…" : "Exporter CSV"}
                    </button>
                    <button
                      onClick={() => { setSaveModalOpen(true); setSaveMsg(null); }}
                      disabled={total === 0}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-purple-300 rounded-lg hover:bg-purple-50 disabled:opacity-40 transition-colors text-purple-600"
                    >
                      <IconBookmark />
                      Sauvegarder la liste
                    </button>
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <>
                        <button
                          onClick={() => { fetchCompanies(page - 1); }}
                          disabled={page <= 1}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                        >
                          ← Précédent
                        </button>
                        <button
                          onClick={() => { fetchCompanies(page + 1); }}
                          disabled={page >= totalPages}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                        >
                          Suivant →
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ══════════════════ ONGLET LISTES SAUVEGARDÉES ══════════════════ */}
        {tab === "lists" && (
          <div>
            {activeList ? (
              /* ── Vue détail d'une liste ── */
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveList(null)}
                      className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                      ← Retour aux listes
                    </button>
                    <h2 className="font-semibold text-gray-800">{activeList.name}</h2>
                    <span className="text-xs text-gray-400">{activeList.total.toLocaleString("fr-FR")} entreprise{activeList.total > 1 ? "s" : ""}</span>
                  </div>
                  <button
                    onClick={() => exportCsv(activeList.id)}
                    disabled={exporting}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors text-gray-600"
                  >
                    <IconDownload />
                    {exporting ? "Export…" : "Exporter CSV"}
                  </button>
                </div>
                {listLoading ? (
                  <div className="flex items-center justify-center py-16 text-gray-400">
                    <IconRefresh spin />
                    <span className="ml-2 text-sm">Chargement…</span>
                  </div>
                ) : (
                  <>
                    <CompaniesTable companies={activeList.companies} />
                    {activeList.totalPages > 1 && (
                      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                        <span>{activeList.total.toLocaleString("fr-FR")} résultats — page {activeList.page}/{activeList.totalPages}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openList(activeList.id, activeList.page - 1)}
                            disabled={activeList.page <= 1}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                          >
                            ← Précédent
                          </button>
                          <button
                            onClick={() => openList(activeList.id, activeList.page + 1)}
                            disabled={activeList.page >= activeList.totalPages}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                          >
                            Suivant →
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              /* ── Vue liste des listes ── */
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-800">Listes sauvegardées</h2>
                  <button
                    onClick={fetchSavedLists}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
                  >
                    <IconRefresh spin={listsLoading} />
                    Rafraîchir
                  </button>
                </div>
                {listsLoading ? (
                  <div className="flex items-center justify-center py-12 text-gray-400">
                    <IconRefresh spin />
                    <span className="ml-2 text-sm">Chargement…</span>
                  </div>
                ) : savedLists.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-3xl mb-2">📋</p>
                    <p className="text-sm">Aucune liste sauvegardée.</p>
                    <p className="text-xs mt-1">Utilisez le bouton "Sauvegarder la liste" dans l'onglet Entreprises.</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">Nom</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">Entreprises</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">Créée le</th>
                        <th className="px-5 py-3 font-semibold text-gray-600 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {savedLists.map((l) => (
                        <tr key={l.id} className="hover:bg-gray-50">
                          <td className="px-5 py-3 font-medium text-gray-800">
                            <button
                              onClick={() => openList(l.id)}
                              className="text-blue-600 hover:underline text-left"
                            >
                              {l.name}
                            </button>
                          </td>
                          <td className="px-5 py-3 text-gray-500">{l.company_count.toLocaleString("fr-FR")}</td>
                          <td className="px-5 py-3 text-gray-400 whitespace-nowrap">{fmtDateTime(l.created_at)}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => exportCsv(l.id)}
                                disabled={exporting}
                                title="Exporter en CSV"
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-40"
                              >
                                <IconDownload />
                              </button>
                              <button
                                onClick={() => deleteList(l.id)}
                                title="Supprimer la liste"
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <IconTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════ ONGLET LOGS ══════════════════ */}
        {tab === "logs" && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Historique des 20 derniers imports</h2>
              <button
                onClick={fetchLogs}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
              >
                <IconRefresh spin={logsLoading} />
                Rafraîchir
              </button>
            </div>

            {logsLoading ? (
              <div className="flex items-center justify-center py-12 text-gray-400">
                <IconRefresh spin />
                <span className="ml-2 text-sm">Chargement…</span>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-3xl mb-2">📭</p>
                <p className="text-sm">Aucun import effectué pour l'instant.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Démarré le</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Terminé le</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Statut</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Ajouts</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Détail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{fmtDateTime(log.started_at)}</td>
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{fmtDateTime(log.finished_at)}</td>
                      <td className="px-5 py-3"><StatusBadge status={log.status} /></td>
                      <td className="px-5 py-3 font-medium text-gray-800">
                        {log.records_added != null ? `+${log.records_added}` : "—"}
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-xs max-w-xs truncate" title={log.error_message}>
                        {log.error_message || (log.status === "success" ? "OK" : "—")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>

      {/* ── Modal sauvegarder la liste ── */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sauvegarder la liste</h3>
            <p className="text-sm text-gray-500 mb-4">
              {total.toLocaleString("fr-FR")} entreprise{total > 1 ? "s" : ""} correspondant aux filtres actuels seront sauvegardées.
            </p>
            <input
              type="text"
              placeholder="Nom de la liste…"
              value={saveListName}
              onChange={(e) => setSaveListName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveCurrentList(); }}
              autoFocus
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3"
            />
            {saveMsg && (
              <p className={`text-sm mb-3 ${saveMsg.type === "success" ? "text-green-600" : "text-red-600"}`}>
                {saveMsg.text}
              </p>
            )}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setSaveModalOpen(false); setSaveListName(""); setSaveMsg(null); }}
                className="px-4 py-2 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={saveCurrentList}
                disabled={saving || !saveListName.trim()}
                className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-lg transition-colors"
              >
                {saving ? "Sauvegarde…" : "Sauvegarder"}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="text-center text-xs text-gray-400 py-6">
        Source : <a href="https://bodacc-datadila.opendatasoft.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">BODACC – données ouvertes</a>
        {" · "}Cron automatique : lundi–vendredi à 8h
      </footer>
    </div>
  );
}
