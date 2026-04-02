import { format, subDays, isWeekend } from 'date-fns';

export const formatDate     = (d) => format(new Date(d), 'dd MMM yyyy');
export const formatDateTime = (d) => format(new Date(d), 'dd MMM yyyy, hh:mm a');
export const today          = () => format(new Date(), 'yyyy-MM-dd');
export const getLast30WorkingDays = () => {
  const days = [];
  for (let i = 30; i >= 0; i--) {
    const d = subDays(new Date(), i);
    if (!isWeekend(d)) days.push(format(d, 'yyyy-MM-dd'));
  }
  return days;
};