import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { MapPin, Loader2 } from 'lucide-react';

interface PropertyMapProps {
  postcode: string;
  address?: string;
  className?: string;
}

interface Coordinates {
  lat: number;
  lng: number;
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

  // Use OpenStreetMap static embed - no library needed
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - 0.002},${coords.lat - 0.001},${coords.lng + 0.002},${coords.lat + 0.001}&layer=mapnik&marker=${coords.lat},${coords.lng}`;

  return (
    <div className={cn('rounded-xl overflow-hidden border border-border shadow-sm', className)}>
      <div className="relative w-full h-full min-h-[120px]">
        <iframe
          src={embedUrl}
          className="w-full h-full min-h-[120px] border-0"
          loading="lazy"
          referrerPolicy="no-referrer"
          title="Property location map"
        />
      </div>
      
      {/* Address overlay */}
      <div className="bg-card/95 backdrop-blur-sm px-3 py-2 border-t border-border">
        <p className="text-xs text-muted-foreground truncate">
          📍 {address || postcode}
        </p>
      </div>
    </div>
  );
}
