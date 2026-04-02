import { useState, useCallback, createContext } from 'react';

export const QRSessionContext = createContext(null);

const ALL_STUDENTS = [
  { id:'s1',  name:'Aanchal Mishra',              rollNo:'24CE1001', class:'CE-A1', avatar:'AM' },
  { id:'s2',  name:'Aaron Pravin Henry',           rollNo:'24CE1002', class:'CE-A1', avatar:'AP' },
  { id:'s3',  name:'Aayan Azeem Kanjiani',         rollNo:'24CE1003', class:'CE-A1', avatar:'AA' },
  { id:'s4',  name:'Aayush Shibu',                 rollNo:'24CE1004', class:'CE-A1', avatar:'AS' },
  { id:'s5',  name:'Varun Sanjay Adagale',         rollNo:'24CE1005', class:'CE-A1', avatar:'VA' },
  { id:'s6',  name:'Adhav Parth Ashok',            rollNo:'24CE1006', class:'CE-A1', avatar:'AP' },
  { id:'s7',  name:'Aditi Ashish Gandre',          rollNo:'24CE1007', class:'CE-A1', avatar:'AG' },
  { id:'s8',  name:'Aditi Pintu Rai',              rollNo:'24CE1008', class:'CE-A1', avatar:'AR' },
  { id:'s9',  name:'Aditi Pradeep Bhagat',         rollNo:'24CE1009', class:'CE-A1', avatar:'AB' },
  { id:'s10', name:'Aditi Vaibhav Bhosle',         rollNo:'24CE1010', class:'CE-A1', avatar:'AB' },
  { id:'s11', name:'Aditya Pandit',                rollNo:'24CE1011', class:'CE-A1', avatar:'AP' },
  { id:'s12', name:'Aditya Sachin Sonavane',       rollNo:'24CE1012', class:'CE-A1', avatar:'AS' },
  { id:'s13', name:'Durva Alshi',                  rollNo:'24CE1013', class:'CE-A1', avatar:'DA' },
  { id:'s14', name:'Anahita Vinay Bhatnagar',      rollNo:'24CE1014', class:'CE-A1', avatar:'AB' },
  { id:'s15', name:'Anunay Singh Bagri',           rollNo:'24CE1015', class:'CE-A1', avatar:'AB' },
  { id:'s16', name:'Anurag Govind Sharma',         rollNo:'24CE1016', class:'CE-A1', avatar:'AG' },
  { id:'s17', name:'Anusha Singh',                 rollNo:'24CE1017', class:'CE-A1', avatar:'AS' },
  { id:'s18', name:'Arjun Asthana',                rollNo:'24CE1018', class:'CE-A1', avatar:'AA' },
  { id:'s19', name:'Arnav Ajay Mishra',            rollNo:'24CE1019', class:'CE-A1', avatar:'AM' },
  { id:'s20', name:'Arpit Prakash Singh',          rollNo:'24CE1020', class:'CE-A1', avatar:'AP' },
  { id:'s21', name:'Aryaman Kudada',               rollNo:'24CE1021', class:'CE-A2', avatar:'AK' },
  { id:'s22', name:'Ashwin Sundram',               rollNo:'24CE1024', class:'CE-A2', avatar:'AS' },
  { id:'s23', name:'Atharv Kiran Bhoir',           rollNo:'24CE1025', class:'CE-A2', avatar:'AB' },
  { id:'s24', name:'Atharva Sanjay Sawant',        rollNo:'24CE1026', class:'CE-A2', avatar:'AS' },
  { id:'s25', name:'Atharva Avhad',                rollNo:'24CE1027', class:'CE-A2', avatar:'AA' },
  { id:'s26', name:'Amey Mangesh Bagwe',           rollNo:'24CE1028', class:'CE-A2', avatar:'AM' },
  { id:'s27', name:'Amruta Barde',                 rollNo:'24CE1029', class:'CE-A2', avatar:'AB' },
  { id:'s28', name:'Tarandip Singh Basson',        rollNo:'24CE1030', class:'CE-A2', avatar:'TS' },
  { id:'s29', name:'Arya Nitin Bhagwat',           rollNo:'24CE1031', class:'CE-A2', avatar:'AB' },
  { id:'s30', name:'Bhakti Tulshiram Gadge',       rollNo:'24CE1032', class:'CE-A2', avatar:'BG' },
  { id:'s31', name:'Bhatt Nandini Nileshkumar',    rollNo:'24CE1034', class:'CE-A2', avatar:'BN' },
  { id:'s32', name:'Shubham Sudhir Bhoir',         rollNo:'24CE1035', class:'CE-A2', avatar:'SB' },
  { id:'s33', name:'Bhupali Prashant Patil',       rollNo:'24CE1037', class:'CE-A2', avatar:'BP' },
  { id:'s34', name:'Diksha Bhuyan',                rollNo:'24CE1038', class:'CE-A2', avatar:'DB' },
  { id:'s35', name:'Adeeb Fahim Bijle',            rollNo:'24CE1039', class:'CE-A2', avatar:'AB' },
  { id:'s36', name:'Rishi Chandel',                rollNo:'24CE1040', class:'CE-A2', avatar:'RC' },
  { id:'s37', name:'Ishan Vijay Chaubey',          rollNo:'24CE1041', class:'CE-A2', avatar:'IC' },
  { id:'s38', name:'Chaurasiya Krish Omprakash',   rollNo:'24CE1042', class:'CE-A2', avatar:'CK' },
  { id:'s39', name:'Chinmay Vinayak Cheulkar',     rollNo:'24CE1043', class:'CE-A3', avatar:'CC' },
  { id:'s40', name:'Anish Hemraj Chitnis',         rollNo:'24CE1044', class:'CE-A3', avatar:'AC' },
  { id:'s41', name:'Aaryan Karan Choube',          rollNo:'24CE1045', class:'CE-A3', avatar:'AC' },
  { id:'s42', name:'Sanika Rangnath Choudhari',    rollNo:'24CE1046', class:'CE-A3', avatar:'SC' },
  { id:'s43', name:'Somansh Rakesh Dafade',        rollNo:'24CE1047', class:'CE-A3', avatar:'SD' },
  { id:'s44', name:'Saurav Uttamrao Deore',        rollNo:'24CE1050', class:'CE-A3', avatar:'SD' },
  { id:'s45', name:'Aryesh Aniket Deshmukh',       rollNo:'24CE1051', class:'CE-A3', avatar:'AD' },
  { id:'s46', name:'Devashish Bobby',              rollNo:'24CE1052', class:'CE-A3', avatar:'DB' },
  { id:'s47', name:'Devendranath Ravinath Tiwari', rollNo:'24CE1053', class:'CE-A3', avatar:'DT' },
  { id:'s48', name:'Devireddy Bharadwaja Reddy',   rollNo:'24CE1054', class:'CE-A3', avatar:'DR' },
  { id:'s49', name:'Dharmi Jain',                  rollNo:'24CE1055', class:'CE-A3', avatar:'DJ' },
  { id:'s50', name:'Dhruvi Dinesh Hegde',          rollNo:'24CE1056', class:'CE-A3', avatar:'DH' },
  { id:'s51', name:'Sherwin Dsouza',               rollNo:'24CE1057', class:'CE-A3', avatar:'SD' },
  { id:'s52', name:'Atharva Birendranath Dubey',   rollNo:'24CE1058', class:'CE-A3', avatar:'AD' },
  { id:'s53', name:'Dhruv Ambika Prasad Dubey',    rollNo:'24CE1059', class:'CE-A3', avatar:'DD' },
  { id:'s54', name:'Sujal Narendraprasad Dubey',   rollNo:'24CE1060', class:'CE-A3', avatar:'SD' },
  { id:'s55', name:'Eshan Arya',                   rollNo:'24CE1061', class:'CE-A3', avatar:'EA' },
  { id:'s56', name:'Chris Augustine Fernandes',    rollNo:'24CE1062', class:'CE-A3', avatar:'CF' },
  { id:'s57', name:'Gandhi Raj Sandesh',           rollNo:'24CE1063', class:'CE-A3', avatar:'GR' },
  { id:'s58', name:'Gandre Paras Abhay',           rollNo:'24CE1064', class:'CE-A3', avatar:'GP' },
  { id:'s59', name:'Atharva Narendra Gharat',      rollNo:'24CE1065', class:'CE-A3', avatar:'AG' },
];

export function QRSessionProvider({ children }) {
  const [activeSession,  setActiveSession]  = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [qrRecords,      setQrRecords]      = useState([]);

  const generatePIN = () => String(Math.floor(1000 + Math.random() * 9000));

  const startSession = useCallback((sessionData) => {
    const pin = generatePIN();
    // CE-ALL = all 59 students, otherwise filter by class
    const classStudents = sessionData.class === 'CE-ALL'
      ? ALL_STUDENTS
      : ALL_STUDENTS.filter(u => u.class === sessionData.class);
    setActiveSession({
      ...sessionData,
      pin,
      liveList:   [],
      absentList: classStudents,
      startedAt:  Date.now(),
    });
  }, []);

  const endSession = useCallback(() => {
    setActiveSession(prev => {
      if (prev) {
        setSessionHistory(h => [{
          ...prev,
          endedAt:            Date.now(),
          endedAtFormatted:   new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }),
          endedDateFormatted: new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }),
        }, ...h]);
      }
      return null;
    });
  }, []);

  const markPresent = useCallback((student, sessionId, subjectId, subjectName) => {
    const now  = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
    const date = new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
    setActiveSession(prev => {
      if (!prev || prev.sessionId !== sessionId) return prev;
      if (prev.liveList.find(s => s.id === student.id)) return prev;
      return {
        ...prev,
        liveList:   [...prev.liveList, { ...student, time: now }],
        absentList: prev.absentList.filter(s => s.id !== student.id),
      };
    });
    setQrRecords(prev => {
      if (prev.find(r => r.studentId === student.id && r.sessionId === sessionId)) return prev;
      return [{ id:'r-'+Date.now(), studentId:student.id, subjectId, subjectName, date, time:now, sessionId }, ...prev];
    });
  }, []);

  return (
    <QRSessionContext.Provider value={{
      activeSession, setActiveSession,
      startSession, endSession,
      markPresent,
      sessionHistory,
      qrRecords, setQrRecords,
    }}>
      {children}
    </QRSessionContext.Provider>
  );
}