import "../styles/globals.css";
import { SessionProvider } from "next-auth/react";
import Head from "next/head";
import SiteHeader from "../components/SiteHeader";
import Footer from "../components/Footer";

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <SiteHeader />
      <Component {...pageProps} />
      <Footer />
    </SessionProvider>
  );
}
