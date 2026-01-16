
import { LendingRecord, EmailPayload } from "../types";
import { isExactlyOneBusinessDayBefore, isExactlyOneBusinessDayAfter } from "../utils/holidayUtils";
import { sendReminderEmail } from "./emailService";

/**
 * サーバーサイド・バッチ処理のコアロジック。
 * データベースからアクティブな貸出レコードを抽出し、祝日を考慮してリマインドを送る。
 */
export const processReminders = async (records: LendingRecord[]): Promise<{ updatedRecords: LendingRecord[], sentCount: number }> => {
  let sentCount = 0;
  const updatedRecords = [...records];

  for (let i = 0; i < updatedRecords.length; i++) {
    const record = updatedRecords[i];
    if (record.status !== 'active') continue;

    const isBefore = isExactlyOneBusinessDayBefore(record.expectedReturnDate);
    const isAfter = isExactlyOneBusinessDayAfter(record.expectedReturnDate);

    let type: '1day_before' | '1day_after' | null = null;
    if (isBefore && !record.remindersSent.includes('1day_before')) type = '1day_before';
    else if (isAfter && !record.remindersSent.includes('1day_after')) type = '1day_after';

    if (type) {
      const greeting = `${record.userName} 様\n\nお疲れ様です。ICTです。\n\n`;
      
      const payload: EmailPayload = {
        to: record.userEmail,
        type: type,
        subject: type === '1day_before' ? '【KASANE】返却予定日の1営業日前リマインド' : '【KASANE】至急：返却期限超過のお知らせ（1営業日経過）',
        body: type === '1day_before' 
          ? `${greeting}返却予定日の1営業日前となりました。\n返却予定日に返せるよう端末と充電器の確認をしてください。\nまた、ログインした場合は必ずログアウトを行い、ダウンロードしたアプリなどは必ず削除してください。\n※なお返却予定日を延長される場合は返却予定日の変更を行ってください。`
          : `${greeting}返却予定日を1営業日過ぎております。\nこの後も利用される方が控えておりますので、必ず本日中に返却願います。\nなお返却が難しい場合は、返却予定日を返却可能な日付に変更してください。`
      };

      const success = await sendReminderEmail(payload);
      if (success) {
        updatedRecords[i] = {
          ...record,
          remindersSent: [...record.remindersSent, type]
        };
        sentCount++;
      }
    }
  }

  return { updatedRecords, sentCount };
};
