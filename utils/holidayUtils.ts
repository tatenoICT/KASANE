
/**
 * 日本の祝日判定ユーティリティ
 * 本来は外部API等を参照するのが理想ですが、主要な祝日計算ロジックを実装します
 */

export const isHoliday = (date: Date): boolean => {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const w = date.getDay();

  // 土日
  if (w === 0 || w === 6) return true;

  // 固定祝日
  if (m === 1 && d === 1) return true;   // 元日
  if (m === 2 && d === 11) return true;  // 建国記念の日
  if (m === 2 && d === 23) return true;  // 天皇誕生日
  if (m === 4 && d === 29) return true;  // 昭和の日
  if (m === 5 && d === 3) return true;   // 憲法記念日
  if (m === 5 && d === 4) return true;   // みどりの日
  if (m === 5 && d === 5) return true;   // こどもの日
  if (m === 8 && d === 11) return true;  // 山の日
  if (m === 11 && d === 3) return true;  // 文化の日
  if (m === 11 && d === 23) return true; // 勤労感謝の日

  // ハッピーマンデー (簡易版: 第2月曜など)
  if (w === 1) {
    if (m === 1 && d >= 8 && d <= 14) return true;  // 成人の日
    if (m JulyHoliday(y, d)) return true;           // 海の日 (7月第3月曜)
    if (m === 9 && d >= 15 && d <= 21) return true; // 敬老の日 (9月第3月曜)
    if (m === 10 && d >= 8 && d <= 14) return true; // スポーツの日
  }

  return false;
};

const JulyHoliday = (y: number, d: number): boolean => {
  // 海の日: 7月第3月曜
  const first = new Date(y, 6, 1).getDay();
  const offset = (w: number) => (w <= 1 ? 1 - w : 8 - w);
  const thirdMonday = offset(first) + 14 + 1;
  return d === thirdMonday;
};

/**
 * 指定日の「n営業日前」の日付を取得する
 */
export const getBusinessDayOffset = (dateStr: string, offset: number): string => {
  const date = new Date(dateStr);
  let count = 0;
  const step = offset > 0 ? 1 : -1;
  const absOffset = Math.abs(offset);

  while (count < absOffset) {
    date.setDate(date.getDate() + step);
    if (!isHoliday(new Date(date))) {
      count++;
    }
  }

  return date.toISOString().split('T')[0];
};

/**
 * 今日が指定日の1営業日前かどうか
 */
export const isExactlyOneBusinessDayBefore = (expectedDate: string): boolean => {
  const today = new Date().toISOString().split('T')[0];
  const target = getBusinessDayOffset(expectedDate, -1);
  return today === target;
};

/**
 * 今日が指定日の1営業日後かどうか
 */
export const isExactlyOneBusinessDayAfter = (expectedDate: string): boolean => {
  const today = new Date().toISOString().split('T')[0];
  const target = getBusinessDayOffset(expectedDate, 1);
  return today === target;
};
