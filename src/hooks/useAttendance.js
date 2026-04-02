import { useState, useCallback } from 'react';
import { ATTENDANCE_RECORDS } from '../services/mockData';

export function useAttendance() {
  const [records, setRecords] = useState(ATTENDANCE_RECORDS);

  const addRecord = useCallback((record) => {
    setRecords(prev => [...prev, record]);
  }, []);

  const updateRecord = useCallback((id, status) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  }, []);

  return { records, addRecord, updateRecord };
}