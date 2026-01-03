import { Hero } from '@/components/home/Hero';
import { Directory } from '@/components/home/Directory';
import { Marketplace } from '@/components/home/Marketplace';
import { InfoDock } from '@/components/home/InfoDock';
import { getListings } from '@/lib/listings';

export const revalidate = 300; // 5 minutes

export default async function Home() {
  const listings = await getListings();

  return (
    <>
      <main className="pb-16">
        <Hero />
        <Directory listings={listings} />
        <Marketplace />
        <InfoDock />
      </main>
    </>
  );
}