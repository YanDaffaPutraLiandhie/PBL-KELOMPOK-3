import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/Navbar"; // Import Navbar yang baru dibuat

export default function App({ 
  Component, 
  pageProps: { session, ...pageProps } 
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <Navbar /> {/* Taruh di sini agar muncul di paling atas */}
      <Component {...pageProps} />
    </SessionProvider>
  );
}