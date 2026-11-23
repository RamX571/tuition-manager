import Dexie, { type Table } from 'dexie';
import type { Student, FeePayment } from '../types';

export class TuitionManagerDB extends Dexie {
  students!: Table<Student, number>;
  payments!: Table<FeePayment, number>;

  constructor() {
    super('TuitionManagerDB');
    this.version(2).stores({
      students: '++id, name, admissionDate, active, createdAt',
      payments: '++id, studentId, paymentDate, receiptNumber, createdAt'
    });
  }
}

export const db = new TuitionManagerDB();

/**
 * Clear all records from the database
 */
export async function clearAllData(): Promise<void> {
  await db.students.clear();
  await db.payments.clear();
}

/**
 * Automatically purge any legacy demo students and associated payments
 */
export async function purgeOldDemoData(): Promise<void> {
  try {
    const demoNames = ['Aarav Sharma', 'Priya Verma', 'Rohan Gupta'];
    const demoStudents = await db.students
      .filter(s => demoNames.includes(s.name))
      .toArray();

    for (const s of demoStudents) {
      if (s.id) {
        await db.students.delete(s.id);
        await db.payments.where('studentId').equals(s.id).delete();
      }
    }
  } catch (err) {
    console.warn('Error purging old demo data:', err);
  }
}
