import { useContext } from 'react';
import { QRSessionContext } from '../context/QRSessionContext';

export function useQRSession() {
  const ctx = useContext(QRSessionContext);
  if (!ctx) throw new Error('useQRSession must be used inside QRSessionProvider');
  return ctx;
}