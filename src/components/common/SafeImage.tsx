import React, { useState } from 'react';
import { normalizeImageUrl, handleImageError, DEFAULT_FALLBACK_IMAGE } from '../../utils/imageUrl';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  fallbackIndex?: number;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt = '',
  className = '',
  fallbackSrc = DEFAULT_FALLBACK_IMAGE,
  fallbackIndex = 0,
  onError,
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);
  const resolvedSrc = hasError ? fallbackSrc : normalizeImageUrl(src, fallbackIndex);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError) {
      setHasError(true);
    }
    handleImageError(e, fallbackSrc);
    if (onError) {
      onError(e);
    }
  };

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      onError={handleError}
      {...rest}
    />
  );
};
