import Dexie, { type Table } from 'dexie';
import type { Student, FeePayment } from '../types';

export class TuitionManagerDB extends Dexie {
  students!: Table<Student, number>;
  payments!: Table<FeePayment, number>;

  constructor() {
    super('TuitionManagerDB');
    this.version(1).stores({
      students: '++id, name, phone, admissionDate, standard, batch, active, createdAt',
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
