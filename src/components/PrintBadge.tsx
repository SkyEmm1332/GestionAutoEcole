import React, { useState } from 'react';
import InstructorBadgeSVG from './InstructorBadgeSVG';
import { InstructorType } from '../types/instructor';
import { BadgeService } from '../services/badgeService';

interface PrintBadgeProps {
  instructor: InstructorType;
}

const PrintBadge: React.FC<PrintBadgeProps> = ({ instructor }) => {
  const [open, setOpen] = useState(false);

  const handlePrint = () => {
    try {
      BadgeService.downloadBadgePDF(instructor);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
    }
  };

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        style={{
          backgroundColor: '#d69e2e',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold',
          marginTop: '20px'
        }}
      >
        📄 Imprimer le badge
      </button>
      {open && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: 24,
            borderRadius: 8,
            boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <InstructorBadgeSVG />
            <div style={{ marginTop: 24, display: 'flex', gap: 16 }}>
              <button
                onClick={handlePrint}
                style={{
                  backgroundColor: '#d69e2e',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                🖨️ Imprimer
              </button>
              <button
                onClick={() => setOpen(false)}
                style={{
                  backgroundColor: '#eee',
                  color: '#333',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ✖ Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrintBadge; 