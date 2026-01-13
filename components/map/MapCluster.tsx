'use client';

import { useState, useRef, useEffect } from 'react';
// @ts-ignore
import Map, { Marker, NavigationControl, GeolocateControl, MapRef } from 'react-map-gl';
import { createClient } from '@/utils/supabase/client';
import { MapPin } from 'lucide-react';
// import 'mapbox-gl/dist/mapbox-gl.css'; // Add to global css if needed or here

interface ListingGeo {
    id: string;
    lat: number;
    lng: number;
    name: string;
    category: string;
    slug: string;
}

export default function MapCluster() {
    const mapRef = useRef<MapRef>(null);
    const [listings, setListings] = useState<ListingGeo[]>([]);
    const [viewState, setViewState] = useState({
        latitude: -37.8136, // Melbourne CBD
        longitude: 144.9631,
        zoom: 12
    });

    const supabase = createClient();

    const fetchListings = async () => {
        if (!mapRef.current) return;
        const bounds = mapRef.current.getMap().getBounds();
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();

        const { data, error } = await supabase
            .rpc('get_listings_in_view', {
                min_lat: sw.lat,
                min_lng: sw.lng,
                max_lat: ne.lat,
                max_lng: ne.lng
            });

        if (data && !error) {
            setListings(data);
        }
    };

    // Debounce fetch on move
    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchListings();
        }, 500);
        return () => clearTimeout(timeout);
    }, [viewState]);

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    if (!token) {
        return <div className="p-4 bg-amber-50 text-amber-800 rounded-lg">Mapbox Token Missing</div>;
    }

    return (
        <div className="h-[500px] w-full rounded-xl overflow-hidden border border-slate-200 relative">
            <Map
                {...viewState}
                ref={mapRef}
                onMove={(evt: any) => setViewState(evt.viewState)}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/streets-v11"
                mapboxAccessToken={token}
            >
                <NavigationControl position="top-right" />
                <GeolocateControl position="top-right" />

                {listings.map(l => (
                    <Marker 
                        key={l.id} 
                        latitude={l.lat} 
                        longitude={l.lng} 
                        anchor="bottom"
                    >
                        <div className="group relative flex flex-col items-center">
                            <div className="p-2 bg-white rounded-full shadow-lg border border-slate-100 hover:scale-110 transition-transform cursor-pointer">
                                <MapPin className="w-5 h-5 text-blue-600 fill-blue-100" />
                            </div>
                            <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none">
                                {l.name}
                            </div>
                        </div>
                    </Marker>
                ))}
            </Map>
        </div>
    );
}
