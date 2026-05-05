import { useEffect, useState } from "react";

import { AppShell } from "./components/AppShell";
import { Dashboard } from "./pages/Dashboard";
import { ReportPage } from "./pages/ReportPage";
import { TemplatePage } from "./pages/TemplatePage";
import type { PageKey } from "./types";

const pageSet = new Set<PageKey>(["dashboard", "report", "template"]);

function getPageFromHash(): PageKey {
  const raw = window.location.hash.replace("#/", "") as PageKey;
  return pageSet.has(raw) ? raw : "dashboard";
}

export default function App() {
  const [activePage, setActivePage] = useState<PageKey>(getPageFromHash);

  useEffect(() => {
    const handleHashChange = () => setActivePage(getPageFromHash());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  function navigate(page: PageKey) {
    window.location.hash = `/${page}`;
    setActivePage(page);
  }

  return (
    <AppShell activePage={activePage} onNavigate={navigate}>
      {activePage === "dashboard" ? <Dashboard onNavigate={navigate} /> : null}
      {activePage === "report" ? <ReportPage /> : null}
      {activePage === "template" ? <TemplatePage /> : null}
    </AppShell>
  );
}

