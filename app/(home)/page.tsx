import Header from '@/components/layout/Header';
import Hero from '@/components/home/Hero';
import Directory from '@/components/home/Directory';
import Marketplace from '@/components/home/Marketplace';
import InfoDock from '@/components/home/InfoDock';
import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Directory />
        <Marketplace />
        <InfoDock />
      </main>
      <Footer />
    </>
  );
}