import "../styles/globals.css";
import { SessionProvider } from "next-auth/react";
import Head from "next/head";
import SiteHeader from "../components/SiteHeader";
import Footer from "../components/Footer";

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <SiteHeader />
      <Component {...pageProps} />
      <Footer />
    </SessionProvider>
  );
}
