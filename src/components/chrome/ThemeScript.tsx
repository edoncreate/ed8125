const script = `try{var t=localStorage.getItem('ed8125-theme');document.documentElement.dataset.theme=(t==='light'||t==='dark')?t:'dark'}catch(e){document.documentElement.dataset.theme='dark'}document.documentElement.classList.add('js')`;

/** Applies the saved theme before first paint and marks JS as available. */
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
