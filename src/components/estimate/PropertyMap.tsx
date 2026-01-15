import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '@/lib/utils';
import { MapPin, Loader2 } from 'lucide-react';

// Fix for default marker icon in leaflet with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface PropertyMapProps {
  postcode: string;
  address?: string;
  className?: string;
}

interface Coordinates {
  lat: number;
  lng: number;
}

// Component to recenter map when coordinates change
function MapRecenter({ coords }: { coords: Coordinates }) {
  const map = useMap();
  useEffect(() => {
    map.setView([coords.lat, coords.lng], 17);
  }, [coords, map]);
  return null;
}

export function PropertyMap({ postcode, address, className }: PropertyMapProps) {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!postcode) {
      setIsLoading(false);
      setError(true);
      return;
    }

    const fetchCoordinates = async () => {
      setIsLoading(true);
      setError(false);
      
      try {
        // Use Nominatim (OpenStreetMap geocoding) - free, no API key needed
        const searchQuery = address 
          ? `${address}, ${postcode}, UK` 
          : `${postcode}, UK`;
        
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
          {
            headers: {
              'User-Agent': 'CosyEstimate/1.0',
            },
          }
        );
        
        if (!response.ok) throw new Error('Geocoding failed');
        
        const data = await response.json();
        
        if (data && data.length > 0) {
          setCoords({
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
          });
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Geocoding error:', err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoordinates();
  }, [postcode, address]);

  // Custom purple marker
  const customIcon = useMemo(() => new L.DivIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, hsl(263, 70%, 50%), hsl(263, 70%, 40%));
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(109, 40, 217, 0.4);
      ">
        <div style="
          width: 10px;
          height: 10px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  }), []);

  if (isLoading) {
    return (
      <div className={cn(
        'rounded-xl bg-muted/50 flex items-center justify-center',
        className
      )}>
        <div className="text-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Finding your home...</p>
        </div>
      </div>
    );
  }

  if (error || !coords) {
    return (
      <div className={cn(
        'rounded-xl bg-muted/30 border border-border flex items-center justify-center',
        className
      )}>
        <div className="text-center py-6 px-4">
          <MapPin className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">
            {postcode || 'Location preview unavailable'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-xl overflow-hidden border border-border shadow-sm', className)}>
      <MapContainer
        center={[coords.lat, coords.lng]}
        zoom={17}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        zoomControl={false}
        attributionControl={false}
        style={{ height: '100%', width: '100%', minHeight: '120px' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[coords.lat, coords.lng]} icon={customIcon} />
        <MapRecenter coords={coords} />
      </MapContainer>
      
      {/* Address overlay */}
      <div className="bg-card/95 backdrop-blur-sm px-3 py-2 border-t border-border">
        <p className="text-xs text-muted-foreground truncate">
          📍 {address || postcode}
        </p>
      </div>
    </div>
  );
}
