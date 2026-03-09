import { Html, Head, Main, NextScript } from "next/document";

const themeInitScript = `
(function() {
  try {
    var m = document.cookie.match(/(^|; )gtfo-theme=([^;]+)/);
    var v = m ? decodeURIComponent(m[2]) : null;
    var theme;
    if (v === "light" || v === "dark") {
      theme = v;
    } else {
      theme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    document.documentElement.setAttribute("data-bs-theme", theme);
  } catch(e) {}
})();
`;

export default function Document() {
  return (
    <Html suppressHydrationWarning>
      <Head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
