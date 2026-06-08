import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { STRINGS, t as tFn } from "@/i18n/strings";

const LanguageContext = createContext({ lang: "en", setLang: () => {}, t: (k) => k });

const STORAGE_KEY = "ar.lang";

function detectInitial() {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "id") return stored;
  const nav = (window.navigator && window.navigator.language) || "en";
  return nav.toLowerCase().startsWith("id") ? "id" : "en";
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => detectInitial());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
    } catch {
      /* ignore */
    }
  }, [lang]);

  const setLang = useCallback((next) => {
    if (next === "en" || next === "id") setLangState(next);
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((p) => (p === "en" ? "id" : "en"));
  }, []);

  const t = useCallback((key) => tFn(key, lang), [lang]);

  const value = useMemo(
    () => ({ lang, setLang, toggleLang, t, strings: STRINGS }),
    [lang, setLang, toggleLang, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLang = () => useContext(LanguageContext);
