// Applies the saved theme before the first paint, so a visitor who chose the
// light theme never sees a flash of the dark default.
//
// Matches design-reference/app.js: same storage key ("fa-theme"), same
// default ("dark"), same attribute (html[data-theme]). It runs as a plain
// inline script in <head>, before React loads.
export const THEME_STORAGE_KEY = "fa-theme";

const script = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
