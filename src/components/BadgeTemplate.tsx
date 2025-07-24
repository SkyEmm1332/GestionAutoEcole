import React from 'react';

interface BadgeTemplateProps {
  instructorName: string;
  function: string;
  phone: string;
  email: string;
  photoUrl?: string;
  logoUrl?: string;
}

const BadgeTemplate: React.FC<BadgeTemplateProps> = ({
  instructorName,
  function: instructorFunction,
  phone,
  email,
  photoUrl,
  logoUrl
}) => {
  return (
    <svg width="142" height="241" viewBox="0 0 141.732 240.945" xmlns="http://www.w3.org/2000/svg">
      {/* Fond blanc principal */}
      <rect width="141.732" height="240.945" fill="#FFFFFF"/>
      
      {/* Bande jaune moutarde en haut */}
      <rect x="0" y="0" width="141.732" height="22.78" fill="#FFB02A"/>
      
      {/* Bande jaune moutarde en bas */}
      <path fill="#FFB02A" d="M0,218.165 L141.732,218.165 L141.732,240.945 L0,240.945 Z"/>
      
      {/* Cercle central pour logo/photo */}
      <circle cx="70.866" cy="137.819" r="18" fill="#00457F"/>
      
      {/* Logo placeholder ou image */}
      {logoUrl && (
        <>
          <defs>
            <clipPath id="logoClip">
              <circle cx="70.866" cy="137.819" r="18"/>
            </clipPath>
          </defs>
          <image href={logoUrl} x="52.866" y="119.819" width="36" height="36" clipPath="url(#logoClip)"/>
        </>
      )}
      
      {/* Nom de l'instructeur en bleu */}
      <text x="70.866" y="182.475" textAnchor="middle" fill="#00457F" fontSize="17.8" fontFamily="Arial, sans-serif" fontWeight="bold">
        {instructorName}
      </text>
      
      {/* Fonction en bleu */}
      <text x="70.866" y="193.334" textAnchor="middle" fill="#00457F" fontSize="8.3" fontFamily="Arial, sans-serif">
        {instructorFunction}
      </text>
      
      {/* Informations de contact */}
      <text x="70.866" y="211.854" textAnchor="middle" fill="#00457F" fontSize="6.1" fontFamily="Arial, sans-serif">
        <tspan x="70.866" dy="0">ID : {phone}</tspan>
        <tspan x="70.866" dy="9">Join Date : {email}</tspan>
      </text>
      
      {/* Éléments décoratifs */}
      <rect x="21.52" y="142.14" width="8.406" height="8.406" fill="#FFB02A"/>
      <rect x="29.892" y="150.51" width="8.406" height="8.407" fill="#00457F"/>
      <rect x="4.779" y="142.14" width="8.406" height="8.406" fill="#00457F"/>
      <rect x="13.149" y="150.51" width="8.406" height="8.407" fill="#FFB02A"/>
      
      {/* Logo DRIVING SCHOOL */}
      <text x="70.866" y="31.664" textAnchor="middle" fill="#00457F" fontSize="4.1" fontFamily="Arial, sans-serif" fontWeight="bold">
        DRIVING SCHOOL
      </text>
    </svg>
  );
};

export default BadgeTemplate; 