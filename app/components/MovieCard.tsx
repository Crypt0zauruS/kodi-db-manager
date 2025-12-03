'use client';

import { useEffect, useRef, useState } from 'react';
import { Movie } from '../lib/tauri';
import { Film } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  onClick: () => void;
}

export function MovieCard({ movie, onClick }: MovieCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const year = movie.c07 || movie.premiered?.split('-')[0] || 'N/A';

  const getPosterUrl = (thumbs?: string) => {
    if (!thumbs) return null;
    const match = thumbs.match(/<thumb[^>]*>([^<]+)<\/thumb>/);
    return match ? match[1] : null;
  };

  const posterUrl = getPosterUrl(movie.c08);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className="group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg hover:scale-105 cursor-pointer"
    >
      <div className="aspect-[2/3] relative bg-muted">
        {isVisible && posterUrl ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <img
              src={posterUrl}
              alt={movie.c00}
              className={`object-cover w-full h-full transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
            />
          </>
        ) : !isVisible ? (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Film className="w-16 h-16 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="p-4">
        <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
          {movie.c00}
        </h3>
        <p className="text-sm text-muted-foreground">{year}</p>
      </div>
    </div>
  );
}
