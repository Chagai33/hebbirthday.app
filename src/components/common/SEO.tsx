import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

export const SEO: React.FC = () => {
  const location = useLocation();
  const baseUrl = 'https://hebbirthday.app';

  // Clean pathname (keep it simple for now, can be expanded for trailing slashes if needed)
  // Ensures we don't have double slashes if pathname starts with / and baseUrl ends with /
  const canonicalUrl = `${baseUrl}${location.pathname === '/' ? '' : location.pathname}`;

  return (
    <Helmet>
      <link rel="canonical" href={canonicalUrl} />
    </Helmet>
  );
};
