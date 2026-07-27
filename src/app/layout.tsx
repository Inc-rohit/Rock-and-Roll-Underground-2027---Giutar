import localFont from 'next/font/local'
import { Bebas_Neue, Anton, Oswald } from "next/font/google";

import "./app.css";
import Header from '@/components/Header';
import ViewCanvas from '@/components/ViewCanvas';
import Footer from '@/components/Footer';
import PageBackdrop from '@/components/concert/PageBackdrop';
import AudioPlayer from '@/components/AudioPlayer';
import ConnectWithUs from '@/components/ConnectWithUs';
import BackToTop from '@/components/BackToTop';
import ScrollGuide from '@/components/ScrollGuide';


const alpino = localFont({
  src: "../../public/fonts/Alpino-Variable.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-alpino",
});

// Music-event / gig-poster display faces (self-hosted by Next).
const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-bebas", display: "swap" });
const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap" });
const oswald = Oswald({ weight: ["500", "700"], subsets: ["latin"], variable: "--font-oswald", display: "swap" });


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${alpino.variable} ${bebas.variable} ${anton.variable} ${oswald.variable}`}>
      <body className='overflow-x-hidden bg-black'>
        <PageBackdrop />
        <AudioPlayer />
        <Header />
        <main>
          {children}
          <ViewCanvas />
        </main>
        <ConnectWithUs />
        <Footer />
        <ScrollGuide />
        <BackToTop />
      </body>
    </html>
  );
}
