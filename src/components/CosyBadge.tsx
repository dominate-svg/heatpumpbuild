import cosyBadge from '@/assets/cosy-badge.png';

interface CosyBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CosyBadge({ size = 'md', className = '' }: CosyBadgeProps) {
  const sizeClasses = {
    sm: 'h-10',
    md: 'h-14',
    lg: 'h-20',
  };

  return (
    <img 
      src={cosyBadge} 
      alt="Octopus Trusted Partner - Cosy Accredited Installer" 
      className={`${sizeClasses[size]} w-auto object-contain ${className}`}
    />
  );
}
