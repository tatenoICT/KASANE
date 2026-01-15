
export const isOneBusinessDayBefore = (targetDateStr: string): boolean => {
  if (!targetDateStr) return false;
  
  const targetDate = new Date(targetDateStr);
  const today = new Date();
  
  // 時刻をリセット
  targetDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  // 1営業日前の日付を計算
  const oneBusinessDayBefore = new Date(targetDate);
  oneBusinessDayBefore.setDate(targetDate.getDate() - 1);

  // 土日の場合は金曜日に調整
  if (oneBusinessDayBefore.getDay() === 0) { // 日曜
    oneBusinessDayBefore.setDate(oneBusinessDayBefore.getDate() - 2);
  } else if (oneBusinessDayBefore.getDay() === 6) { // 土曜
    oneBusinessDayBefore.setDate(oneBusinessDayBefore.getDate() - 1);
  }

  return today.getTime() === oneBusinessDayBefore.getTime();
};

export const isOneBusinessDayAfter = (targetDateStr: string): boolean => {
  if (!targetDateStr) return false;
  
  const targetDate = new Date(targetDateStr);
  const today = new Date();
  
  // 時刻をリセット
  targetDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  // 1営業日後の日付を計算
  const oneBusinessDayAfter = new Date(targetDate);
  oneBusinessDayAfter.setDate(targetDate.getDate() + 1);

  // 土日の場合は月曜日に調整
  if (oneBusinessDayAfter.getDay() === 6) { // 土曜
    oneBusinessDayAfter.setDate(oneBusinessDayAfter.getDate() + 2);
  } else if (oneBusinessDayAfter.getDay() === 0) { // 日曜
    oneBusinessDayAfter.setDate(oneBusinessDayAfter.getDate() + 1);
  }

  return today.getTime() === oneBusinessDayAfter.getTime();
};

export const isOverdue = (targetDateStr: string): boolean => {
  if (!targetDateStr) return false;
  const targetDate = new Date(targetDateStr);
  const today = new Date();
  targetDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return today.getTime() > targetDate.getTime();
};

export const isOneWeekOverdue = (targetDateStr: string): boolean => {
  if (!targetDateStr) return false;
  const targetDate = new Date(targetDateStr);
  const today = new Date();
  targetDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - targetDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 7;
};
