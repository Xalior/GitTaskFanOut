import type { AppProps } from "next/app";
import Head from "next/head";
import "@/styles/theme.scss";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="stylesheet" href="/api/theme.css" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
