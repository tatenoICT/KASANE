
export const isOneBusinessDayBefore = (targetDateStr: string): boolean => {
  if (!targetDateStr) return false;
  
  const targetDate = new Date(targetDateStr);
  const today = new Date();
  
  // 時刻をリセット
  targetDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  // 1日前の日付を取得
  const oneDayBefore = new Date(targetDate);
  oneDayBefore.setDate(targetDate.getDate() - 1);

  // もし1日前が日曜日なら金曜日に（2日前）
  if (oneDayBefore.getDay() === 0) {
    oneDayBefore.setDate(oneDayBefore.getDate() - 2);
  }
  // もし1日前が土曜日なら金曜日に（1日前）
  else if (oneDayBefore.getDay() === 6) {
    oneDayBefore.setDate(oneDayBefore.getDate() - 1);
  }

  return today.getTime() === oneDayBefore.getTime();
};

export const isOverdue = (targetDateStr: string): boolean => {
  if (!targetDateStr) return false;
  const targetDate = new Date(targetDateStr);
  const today = new Date();
  targetDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return today.getTime() > targetDate.getTime();
};
