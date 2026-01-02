import Header from '@/components/layout/Header';
import Hero from '@/components/home/Hero';
import Directory from '@/components/home/Directory';
import Marketplace from '@/components/home/Marketplace';
import InfoDock from '@/components/home/InfoDock';
import Footer from '@/components/layout/Footer';
import BottomNavBar from '@/components/layout/BottomNavBar';

export default function Home() {
  return (
    <>
      <Header />
      <main className="pb-16">
        <Hero />
        <Directory />
        <Marketplace />
        <InfoDock />
      </main>
      <Footer />
      <BottomNavBar />
    </>
  );
}