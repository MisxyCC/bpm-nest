import { PrismaClient } from '@prisma/client/extension';
import { Writable } from 'stream';

export class PrismaLogStream extends Writable {
  private prisma: PrismaClient;
  private buffer: any[] = []; // ถังพักข้อมูล
  private batchSize: number = 100; // ขนาดถัง (บันทึกเมื่อครบ 100 รายการ)
  private flushInterval: number = 1000; // หรือบันทึกทุกๆ 1 วินาที
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.prisma = new PrismaClient();

    // ตั้งเวลาให้เคลียร์ถังทุกๆ x วินาที (ป้องกัน Log ค้างในถังถ้านานๆ มาที)
    this.timer = setInterval(() => this.flush(), this.flushInterval);
  }

  _write(chunk: any, encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
    const logString: string = chunk.toString();
    process.stdout.write(logString);

    try {
      const logData = JSON.parse(logString);
      // แปลงข้อมูลแล้วโยนใส่ถัง (ยังไม่บันทึกทันที)
      this.buffer.push({
        level: this.getLevelLabel(logData.level),
        message: logData.msg || '',
        context: logData.context || null,
        reqId: logData.reqId || null,
        timestamp: new Date(logData.time || Date.now()),
        rawJson: logString,
      });
      // ถ้าถังเต็ม ให้บันทึกทันที
      if (this.buffer.length >= this.batchSize) {
        this.flush();
      }

      callback(); // บอก Pino ว่ารับของแล้ว (ทำได้เร็วมากเพราะแค่ push ใส่ array)
    } catch (error) {
        console.error('Error parsing log chunk:', error);
        callback();
    }
  }
  // ฟังก์ชันเทกระจาด (บันทึกลง DB ทีเดียว)
  private async flush() {
    if (this.buffer.length === 0) {
        return;
    }
    const currentBatch = [...this.buffer];
    this.buffer = [];

    try {
        await this.prisma.backendlog.createMany({
            data: currentBatch,
        });
    } catch (error) {
        console.error("Failed to save batch logs: ", error);
    }
  }
  
  // เมื่อ Stream ถูกทำลาย (เช่น ปิดแอป) ให้บันทึกของที่ค้างอยู่ให้หมด
  _final(callback: (error?: Error | null) => void): void {
      if (this.timer) clearInterval(this.timer);
      this.flush().then(() => callback());
  }

  private getLevelLabel(level: number): string {
    if (level >= 50) return 'error';
    if (level >= 40) return 'warn';
    if (level >= 30) return 'info';
    return 'debug';
  }
}
