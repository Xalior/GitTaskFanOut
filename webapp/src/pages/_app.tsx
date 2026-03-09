import { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import "@/styles/theme.scss";

export default function App({ Component, pageProps }: AppProps) {
  const [hasCustomTheme, setHasCustomTheme] = useState(false);

  useEffect(() => {
    fetch("/api/theme.css", { method: "HEAD" }).then((res) => {
      if (res.ok) setHasCustomTheme(true);
    });
  }, []);

  return (
    <>
      {hasCustomTheme && (
        <Head>
          <link rel="stylesheet" href="/api/theme.css" />
        </Head>
      )}
      <Component {...pageProps} />
    </>
  );
}
