import "../styles/globals.css";
import { SessionProvider } from "next-auth/react";
import Head from "next/head";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />
      <Component {...pageProps} />
      <Footer />
    </SessionProvider>
  );
}