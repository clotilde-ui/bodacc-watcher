"use client";

import { useState, useEffect, useCallback } from "react";

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

// ─── Composant principal ───────────────────────────────────────────────────
export default function Dashboard() {
  const [tab, setTab] = useState("companies"); // "companies" | "logs"

  // ── État entreprises ──
  const [companies, setCompanies] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);

  // ── Filtres ──
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  // ── Import ──
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState(null); // { type: "success"|"error", text }

  // ── Logs ──
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // ── Chargement des entreprises ──
  const fetchCompanies = useCallback(async (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p });
    if (search) params.set("search", search);
    if (region) params.set("region", region);
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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, region, dateDebut, dateFin]);

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

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCompanies(1);
  };

  const resetFilters = () => {
    setSearch("");
    setRegion("");
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Recherche texte */}
                <div className="relative sm:col-span-2 lg:col-span-1">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <IconSearch />
                  </div>
                  <input
                    type="text"
                    placeholder="Société, SIREN, ville…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Région */}
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Toutes les régions</option>
                  {regions.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>

                {/* Dates */}
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateDebut}
                    onChange={(e) => setDateDebut(e.target.value)}
                    title="Date de début"
                    className="flex-1 py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    value={dateFin}
                    onChange={(e) => setDateFin(e.target.value)}
                    title="Date de fin"
                    className="flex-1 py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Boutons */}
                <div className="flex gap-2">
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <span>{total.toLocaleString("fr-FR")} résultats — page {page}/{totalPages}</span>
                    <div className="flex gap-2">
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
                    </div>
                  </div>
                )}
              </>
            )}
          </>
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

      <footer className="text-center text-xs text-gray-400 py-6">
        Source : <a href="https://bodacc-datadila.opendatasoft.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">BODACC – données ouvertes</a>
        {" · "}Cron automatique : lundi–vendredi à 8h
      </footer>
    </div>
  );
}
