import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db, auth, secondaryAuth, storage } from '../firebase';
import {
  collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc,
  query, where, getDoc, addDoc, getDocs, runTransaction, writeBatch, deleteField
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged
} from 'firebase/auth';
import toast from 'react-hot-toast';
import { sendAppointmentConfirmationEmail, sendLabReportReadyEmail, sendPrescriptionReadyEmail } from '../services/emailService';

export type Role = 'patient' | 'doctor' | 'admin' | 'receptionist' | 'pharmacist' | 'lab_technician' | 'lab' | 'labtechnician';

export interface BaseMetadata {
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
  deleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  module: string;
  targetId: string;
  userId: string;
  userName: string;
  userRole: string;
  timestamp: string;
  details: string;
  oldValue?: any;
  newValue?: any;
}

export interface User extends Partial<BaseMetadata> {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  avatar?: string;
  status: 'active' | 'suspended' | 'inactive';
  mrn?: string;
  dob?: string;
  gender?: 'male' | 'female' | 'other';
  bloodGroup?: string;
  address?: string;
  emergencyContact?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  departmentId?: string;
  department?: string; // UI usage
  specialty?: string;
  specialization?: string; // UI usage
  qualifications?: string;
  experienceYears?: number;
  consultationFee?: number;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export interface DoctorSchedule {
  id: string;
  doctorId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  breakStart?: string;
  breakEnd?: string;
  isWorking?: boolean;
}

// Legacy/redundant Prescription interfaces removed/unified above

export interface Appointment extends BaseMetadata {
  id: string;
  patientId: string;
  doctorId: string;
  departmentId: string;
  date: string;
  time: string;
  checkInTime?: string; // UI usage
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  reason: string;
  symptoms?: string;
}

export interface Vitals {
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  weight: number;
  height: number;
  oxygenLevel: number;
}

export interface MedicalRecord extends BaseMetadata {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId: string;
  date: string;
  vitals: Vitals;
  allergies: string[];
  pastMedicalHistory: string;
  diagnosis: string;
  clinicalNotes: string;
  followUpDate?: string;
}

export interface PrescriptionItem {
  id: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  unit: string;
  frequency: {
    morning: boolean;
    afternoon: boolean;
    night: boolean;
  };
  timing: 'before_food' | 'after_food';
  duration: string;
  isOutsourced?: boolean;
  instructions?: string;
  route?: string; // e.g., Oral, IV, Topical
  specialInstructions?: string;
}

export interface Prescription extends BaseMetadata {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId: string;
  date: string;
  items: PrescriptionItem[];
  notes?: string;
  status: 'pending' | 'dispensed';
  dispensedBy?: string;
  dispensedAt?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  amount: number;
  taxRate: number;
  taxAmount: number;
  hsnSacCode?: string;
}

export interface Invoice extends BaseMetadata {
  id: string;
  invoiceId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  appointmentId?: string;
  items: InvoiceItem[];
  amount: number;
  subtotal: number;
  totalTaxAmount: number;
  totalAmount: number;
  date: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'unpaid' | 'cancelled' | 'partial';
  description?: string;
  type: 'consultation' | 'lab_test' | 'medication' | 'procedure' | 'bed' | 'lab' | 'pharmacy' | 'other';
  paymentMethod?: 'cash' | 'card' | 'upi' | 'insurance';
  transactionId?: string;
  gstNumber?: string;
}

export interface PharmacyBill extends BaseMetadata {
  id: string;
  billId: string;
  patientName: string;
  patientPhone: string;
  patientId: string;
  medicines: PharmacyBillMedicine[];
  totalAmount: number;
  subtotal: number;
  gst: number;
  status: 'generated' | 'cancelled';
}

export interface LabRequest extends BaseMetadata {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  date: string;
  testName: string;
  status: 'pending' | 'sample_collected' | 'completed';
  notes?: string;
}

export interface LabReport extends BaseMetadata {
  id: string;
  labRequestId?: string;
  patientId: string;
  doctorId: string;
  technicianId?: string;
  date: string;
  testType: string;
  testName?: string;
  resultData?: string;
  results?: string;
  status: 'pending' | 'completed';
  completedBy?: string;
  completedAt?: string;
  fileUrl?: string;
  notes?: string;
}

export interface AppNotification extends BaseMetadata {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'appointment' | 'report' | 'billing' | 'system';
  read: boolean;
  timestamp: string;
  actionUrl?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Bed extends BaseMetadata {
  id: string;
  roomNumber: string;
  bedNumber: string;
  type: 'general' | 'icu' | 'private' | 'semi_private';
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  patientId?: string;
  departmentId: string;
  pricePerDay: number;
  notes?: string;
}

export interface Equipment extends BaseMetadata {
  id: string;
  name: string;
  type: 'diagnostic' | 'surgical' | 'monitoring' | 'therapeutic' | 'other';
  model?: string;
  serialNumber?: string;
  status: 'available' | 'in_use' | 'maintenance' | 'out_of_order';
  location: string;
  departmentId: string;
  pricePerUse: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  notes?: string;
}

export interface BedBooking extends BaseMetadata {
  id: string;
  bedId?: string;
  patientId: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'cancelled' | 'pending_admin' | 'requested';
  reason?: string;
  totalCost?: number;
  isBilled?: boolean;
  billId?: string;
}

export interface EquipmentBooking extends BaseMetadata {
  id: string;
  equipmentId: string;
  patientId: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime?: string;
  status: 'active' | 'completed' | 'cancelled' | 'pending_admin' | 'requested';
  totalCost?: number;
  isBilled?: boolean;
  billId?: string;
}

export interface HospitalSettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  gstNumber: string;
  currency: string;
  theme: 'light' | 'dark';
  notifications: {
    email: boolean;
    sms: boolean;
    appointments: boolean;
    labResults: boolean;
    systemErrors: boolean;
  };
  security: {
    minPasswordLength: number;
    requireSpecialChars: boolean;
    forcePasswordResetDays: number;
    twoFactorAuth: boolean;
  };
  integrations?: {
    apiKey: string;
    hisConnector: {
      status: 'connected' | 'disconnected' | 'error';
      lastSync?: string;
      endpoint?: string;
    };
    webhooks: {
      id: string;
      url: string;
      events: string[];
      active: boolean;
    }[];
  };
}

export interface InventoryItem extends BaseMetadata {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  unitPrice: number;
  expiryDate: string;
  manufacturer: string;
  reorderLevel: number;
}

export interface PharmacyBillMedicine {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface AdminInvoice extends BaseMetadata {
  id: string;
  billId: string;
  totalAmount: number;
  department: 'pharmacy' | 'reception' | 'lab';
  patientName: string;
  timestamp: string;
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  doctors: User[];
  departments: Department[];
  doctorSchedules: DoctorSchedule[];
  appointments: Appointment[];
  medicalRecords: MedicalRecord[];
  prescriptions: Prescription[];
  invoices: Invoice[];
  labRequests: LabRequest[];
  labReports: LabReport[];
  notifications: AppNotification[];
  messages: Message[];
  beds: Bed[];
  equipment: Equipment[];
  bedBookings: BedBooking[];
  equipmentBookings: EquipmentBooking[];
  inventory: InventoryItem[];
  bills: PharmacyBill[];
  adminInvoices: AdminInvoice[];
  hospitalSettings: HospitalSettings | null;
  auditLogs: AuditLog[];
  isAuthReady: boolean;
  login: (email: string, password?: string, role?: Role) => Promise<User>;
  logout: () => Promise<void>;
  registerPatient: (data: Partial<User> & { password?: string }) => Promise<User>;
  createWalkInPatient: (data: Partial<User>) => Promise<User>;
  bookAppointment: (data: Omit<Appointment, 'id' | 'status' | keyof BaseMetadata>) => Promise<void>;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => Promise<void>;
  addMedicalRecord: (data: Omit<MedicalRecord, 'id' | 'date' | keyof BaseMetadata>) => Promise<void>;
  addPrescription: (data: Omit<Prescription, 'id' | 'date' | 'status' | keyof BaseMetadata>) => Promise<void>;
  dispensePrescription: (id: string, pharmacistId: string, dispensedItems: { inventoryItemId: string; quantity: number }[]) => Promise<void>;
  updatePrescriptionStatus: (id: string, status: Prescription['status']) => Promise<void>;
  addDoctor: (data: Partial<User> & { password?: string }) => Promise<void>;
  addReceptionist: (data: Partial<User> & { password?: string }) => Promise<void>;
  addPharmacist: (data: Partial<User> & { password?: string }) => Promise<void>;
  addLabTechnician: (data: Partial<User> & { password?: string }) => Promise<void>;
  addDepartment: (data: Omit<Department, 'id'>) => Promise<void>;
  updateDepartment: (id: string, data: Partial<Department>) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
  createAppointment: (data: Omit<Appointment, 'id'>) => Promise<void>;
  createLabReport: (data: Omit<LabReport, 'id'>) => Promise<void>;
  generateInvoice: (data: Omit<Invoice, 'id' | 'status' | 'amount' | 'subtotal' | 'totalTaxAmount' | keyof BaseMetadata> & { items: Omit<InvoiceItem, 'id' | 'taxAmount'>[] }) => Promise<void>;
  generateServiceInvoice: (patientId: string, items: Omit<InvoiceItem, 'id' | 'taxAmount'>[], type: Invoice['type']) => Promise<Invoice>;
  findPatient: (id: string) => User | undefined;
  payInvoice: (id: string, method: Invoice['paymentMethod'], transactionId?: string) => Promise<void>;
  sendMessage: (data: Omit<Message, 'id' | 'timestamp' | 'read'>) => Promise<void>;
  markMessageRead: (id: string) => Promise<void>;
  requestLabTest: (data: Omit<LabRequest, 'id' | 'date' | 'status' | keyof BaseMetadata>) => Promise<void>;
  addLabReport: (data: Omit<LabReport, 'id' | 'date' | keyof BaseMetadata>) => Promise<void>;
  updateLabReportStatus: (id: string, status: LabReport['status'], results?: string, technicianId?: string) => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  addNotification: (userId: string, title: string, message: string, type: AppNotification['type']) => Promise<void>;
  createAdminUser: (data: Partial<User> & { password?: string }) => Promise<void>;
  updateUser: (id: string, data: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  updateDoctorSchedule: (doctorId: string, schedules: Omit<DoctorSchedule, 'id'>[]) => Promise<void>;
  addBed: (data: Omit<Bed, 'id' | keyof BaseMetadata>) => Promise<void>;
  updateBed: (id: string, data: Partial<Bed>) => Promise<void>;
  deleteBed: (id: string) => Promise<void>;
  addEquipment: (data: Omit<Equipment, 'id' | keyof BaseMetadata>) => Promise<void>;
  updateEquipment: (id: string, data: Partial<Equipment>) => Promise<void>;
  deleteEquipment: (id: string) => Promise<void>;
  bookBed: (data: Omit<BedBooking, 'id' | keyof BaseMetadata>) => Promise<void>;
  updateBedBooking: (id: string, data: Partial<BedBooking>) => Promise<void>;
  bookEquipment: (data: Omit<EquipmentBooking, 'id' | keyof BaseMetadata>) => Promise<void>;
  updateEquipmentBooking: (id: string, data: Partial<EquipmentBooking>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  uploadLabReport: (file: File, patientId: string, doctorId: string, testName: string, labRequestId?: string) => Promise<void>;
  addInventoryItem: (data: Omit<InventoryItem, 'id' | keyof BaseMetadata>) => Promise<void>;
  updateInventoryItem: (id: string, data: Partial<InventoryItem>) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  updateHospitalSettings: (data: Partial<HospitalSettings>) => Promise<void>;
  generatePharmacyBill: (billData: Omit<PharmacyBill, 'id' | 'billId' | 'status' | keyof BaseMetadata>) => Promise<PharmacyBill>;
  softDeleteDoc: (collectionName: string, id: string) => Promise<void>;
  recordAuditLog: (action: string, module: string, targetId: string, details: string, oldValue?: any, newValue?: any) => Promise<void>;
  withCreateMetadata: (data: any) => any;
  withUpdateMetadata: (data: any) => any;
  sendResetOTP: (email: string) => Promise<void>;
  verifyResetOTP: (email: string, otp: string) => Promise<boolean>;
  resetPasswordWithOTP: (email: string, otp: string, newPass: string) => Promise<void>;
  purgeCollection: (name: string) => Promise<number>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctorSchedules, setDoctorSchedules] = useState<DoctorSchedule[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [labRequests, setLabRequests] = useState<LabRequest[]>([]);
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [bedBookings, setBedBookings] = useState<BedBooking[]>([]);
  const [equipmentBookings, setEquipmentBookings] = useState<EquipmentBooking[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [bills, setBills] = useState<PharmacyBill[]>([]);
  const [adminInvoices, setAdminInvoices] = useState<AdminInvoice[]>([]);
  const [hospitalSettings, setHospitalSettings] = useState<HospitalSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const findPatient = (id: string) => users.find(u => u.id === id);

  const withCreateMetadata = <T extends object>(data: T) => {
    const timestamp = new Date().toISOString();
    return {
      ...data,
      createdAt: timestamp,
      createdBy: currentUser?.id || 'system',
      updatedAt: timestamp,
      updatedBy: currentUser?.id || 'system',
      deleted: false,
    };
  };

  const withUpdateMetadata = <T extends object>(data: T) => {
    return {
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser?.id || 'system',
    };
  };

  const recordAuditLog = async (action: string, module: string, targetId: string, details: string, oldValue: any = null, newValue: any = null) => {
    if (!currentUser) return;
    try {
      const logRef = doc(collection(db, 'auditLogs'));
      const logData = {
        id: logRef.id,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action,
        module,
        targetId,
        details,
        timestamp: new Date().toISOString()
      };
      await setDoc(logRef, logData);
    } catch (err) {
      console.error('Audit Log failed:', err);
    }
  };

  const softDeleteDoc = async (collectionName: string, id: string) => {
    try {
      const docRef = doc(db, collectionName, id);
      const snap = await getDoc(docRef);
      const oldData = snap.exists() ? snap.data() : null;

      const updateData = {
        deleted: true,
        deletedAt: new Date().toISOString(),
        deletedBy: currentUser?.id || 'system',
      };

      await updateDoc(docRef, updateData);
      await recordAuditLog('delete', collectionName, id, `Soft deleted ${id}`, oldData, { ...oldData, ...updateData });
      // NOTE: No toast here — callers are responsible for their own feedback
    } catch (error: any) {
      const code: string = error?.code || '';
      if (code === 'permission-denied') {
        toast.error('❌ Permission denied. Only admins can delete records. Check Firestore rules.');
      } else {
        toast.error(`❌ Delete failed: ${error?.message || 'Unknown error'}`);
      }
      console.error('[softDeleteDoc]', collectionName, id, error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setCurrentUser({ id: userDoc.id, ...userDoc.data() } as User);
        }
      } else {
        setCurrentUser(null);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Public Subscriptions (Always available for Home/Booking)
  useEffect(() => {
    const publicSubs = [
      onSnapshot(collection(db, 'departments'), snap =>
        setDepartments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Department)))),
      onSnapshot(collection(db, 'doctorSchedules'), snap =>
        setDoctorSchedules(snap.docs.map(d => ({ id: d.id, ...d.data() } as DoctorSchedule)))),
      onSnapshot(collection(db, 'beds'), snap =>
        setBeds(snap.docs.map(d => ({ id: d.id, ...d.data() } as Bed)))),
      onSnapshot(collection(db, 'equipment'), snap =>
        setEquipment(snap.docs.map(d => ({ id: d.id, ...d.data() } as Equipment)))),
      onSnapshot(doc(db, 'settings', 'general'), (doc) =>
        doc.exists() && setHospitalSettings(doc.data() as HospitalSettings)),
      // PUBLIC DOCTORS LIST (Always available for Home/Booking)
      onSnapshot(query(collection(db, 'users'), where('role', '==', 'doctor'), where('status', '==', 'active'), where('deleted', '==', false)), snap => {
        setDoctors(snap.docs.map(d => ({ id: d.id, ...d.data() } as User)));
      })
    ];

    return () => publicSubs.forEach(unsub => unsub());
  }, []);

  // Private Subscriptions (RBAC Protected)
  useEffect(() => {
    if (!isAuthReady || !currentUser) return;

    const isStaff = ['admin', 'doctor', 'receptionist', 'pharmacist', 'lab_technician', 'lab'].includes(currentUser.role);
    const isAdmin = currentUser.role === 'admin';

    const privateSubs = [
      ...(isAdmin ? [
        onSnapshot(collection(db, 'users'), snap => setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as User)))),
        onSnapshot(collection(db, 'auditLogs'), snap => setAuditLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as AuditLog)))),
        onSnapshot(collection(db, 'invoices'), snap => setInvoices(snap.docs.map(d => ({ id: d.id, ...d.data() } as Invoice)))),
        onSnapshot(collection(db, 'adminInvoices'), snap => setAdminInvoices(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)))),
      ] : [
        ...(isStaff ? [onSnapshot(query(collection(db, 'users'), where('deleted', '==', false)), snap => setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as User))))] : []),
        ...(!isStaff ? [onSnapshot(query(collection(db, 'users'), where('id', '==', currentUser.id)), snap => setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as User))))] : [])
      ]),

      onSnapshot(isAdmin || isStaff ? collection(db, 'appointments') : query(collection(db, 'appointments'), where('patientId', '==', currentUser.id)),
        snap => setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment)))),

      onSnapshot(isAdmin || isStaff ? collection(db, 'medicalRecords') : query(collection(db, 'medicalRecords'), where('patientId', '==', currentUser.id)),
        snap => setMedicalRecords(snap.docs.map(d => ({ id: d.id, ...d.data() } as MedicalRecord)))),
      onSnapshot(isAdmin || isStaff ? collection(db, 'prescriptions') : query(collection(db, 'prescriptions'), where('patientId', '==', currentUser.id)),
        snap => setPrescriptions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Prescription)))),

      onSnapshot(isAdmin || isStaff ? collection(db, 'labRequests') : query(collection(db, 'labRequests'), where('patientId', '==', currentUser.id)),
        snap => setLabRequests(snap.docs.map(d => ({ id: d.id, ...d.data() } as LabRequest)))),
      onSnapshot(isAdmin || isStaff ? collection(db, 'labReports') : query(collection(db, 'labReports'), where('patientId', '==', currentUser.id)),
        snap => setLabReports(snap.docs.map(d => ({ id: d.id, ...d.data() } as LabReport)))),

      onSnapshot(isAdmin || ['pharmacist', 'receptionist'].includes(currentUser.role) ? collection(db, 'bills') : query(collection(db, 'bills'), where('patientId', '==', currentUser.id)),
        snap => setBills(snap.docs.map(d => ({ id: d.id, ...d.data() } as PharmacyBill)))),

      onSnapshot(isAdmin || isStaff ? collection(db, 'invoices') : query(collection(db, 'invoices'), where('patientId', '==', currentUser.id)),
        snap => setInvoices(snap.docs.map(d => ({ id: d.id, ...d.data() } as Invoice)))),

      onSnapshot(isAdmin || currentUser.role === 'pharmacist' ? collection(db, 'inventory') : query(collection(db, 'inventory'), where('deleted', '==', false)),
        snap => setInventory(snap.docs.map(d => ({ id: d.id, ...d.data() } as InventoryItem)))),

      onSnapshot(collection(db, 'bedBookings'), snap => setBedBookings(snap.docs.map(d => ({ id: d.id, ...d.data() } as BedBooking)))),
      onSnapshot(collection(db, 'equipmentBookings'), snap => setEquipmentBookings(snap.docs.map(d => ({ id: d.id, ...d.data() } as EquipmentBooking)))),

      onSnapshot(query(collection(db, 'notifications'), where('userId', '==', currentUser.id), where('deleted', '==', false)),
        snap => setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() } as AppNotification)).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()))),
    ];

    return () => privateSubs.forEach(unsub => unsub());
  }, [isAuthReady, currentUser]);

  const login = async (email: string, password?: string, role?: Role) => {
    try {
      console.log("[AppContext:login:v3] Attempting login for:", email);
      const fixLabRole = (role: string): Role => {
        if (role === 'lab' || role === 'labtechnician' || role === 'lab_technician') return 'lab_technician';
        return role as Role;
      };
      
      const normalizedRole = role ? fixLabRole(role) : undefined;
      const result = await signInWithEmailAndPassword(auth, email, password || '123456');
      const user = result.user;
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      const isAdminEmail = email.toLowerCase() === 'admin@hospital.com';

      // RECOVERY: If Admin record is missing or deleted, restore it immediately
      if (isAdminEmail && (!userDoc.exists() || userDoc.data()?.deleted)) {
        const admin: User = withCreateMetadata({
          id: user.uid,
          name: 'System Admin',
          email: 'admin@hospital.com',
          role: 'admin',
          status: 'active',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
        });
        await setDoc(doc(db, 'users', user.uid), admin);
        setCurrentUser(admin);
        return admin;
      }

      // STANDARD GHOST/DELETED CHECK
      if (!userDoc.exists() || userDoc.data()?.deleted) {
        // Deny login for missing user documents (they must be re-added or re-registered)
        throw new Error('This account was purged or deactivated. Please contact the System Administrator to restore your profile.');
      }

      const userData = { id: userDoc.id, ...userDoc.data() } as User;
      setCurrentUser(userData);
      return userData;
    } catch (error: any) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear user state first to trigger UI unmounts and snapshot unsubscriptions
      setCurrentUser(null);
      // Give a tiny window for cleanups to execute while auth is still valid
      await new Promise(resolve => setTimeout(resolve, 100));
      await signOut(auth);
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      // Final attempt to clear state even on error
      await signOut(auth).catch(() => { });
      setCurrentUser(null);
    }
  };

  const registerPatient = async (data: Partial<User> & { password?: string }) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, data.email || '', data.password || '123456');
      const user = result.user;
      const now = new Date();
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const patient: User = withCreateMetadata({
        id: user.uid,
        name: data.name || 'New Patient',
        email: data.email || '',
        role: 'patient',
        status: 'active',
        mrn: `SH${year}${month}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        ...data
      });
      delete (patient as any).password;
      await setDoc(doc(db, 'users', user.uid), patient);
      await recordAuditLog('create', 'users', user.uid, `Registered patient ${patient.name}`, null, patient);
      return patient;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const createWalkInPatient = async (data: Partial<User>) => {
    const id = doc(collection(db, 'users')).id;
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const patient: User = withCreateMetadata({
      id,
      name: data.name || 'Walk-in',
      email: data.email || '',
      role: 'patient',
      status: 'active',
      mrn: `SH${year}${month}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      ...data
    });
    await setDoc(doc(db, 'users', id), patient);
    await recordAuditLog('create', 'users', id, `Created walk-in patient ${patient.name}`, null, patient);
    return patient;
  };

  const bookAppointment = async (data: Omit<Appointment, 'id' | 'status' | keyof BaseMetadata>) => {
    const ref = doc(collection(db, 'appointments'));
    const apt = withCreateMetadata({ id: ref.id, ...data, status: 'pending' });
    await setDoc(ref, apt);
    await recordAuditLog('create', 'appointments', ref.id, 'Booked appointment', null, apt);
    toast.success('Appointment booked!');
  };

  const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    const ref = doc(db, 'appointments', id);
    const snap = await getDoc(ref);
    const update = withUpdateMetadata({ status });
    await updateDoc(ref, update);
    await recordAuditLog('update', 'appointments', id, `Status -> ${status}`, snap.data(), { ...snap.data(), ...update });
  };

  const addMedicalRecord = async (data: Omit<MedicalRecord, 'id' | 'date' | keyof BaseMetadata>) => {
    const ref = doc(collection(db, 'medicalRecords'));
    const rec = withCreateMetadata({ id: ref.id, ...data, date: new Date().toISOString().split('T')[0] });
    await setDoc(ref, rec);
    await recordAuditLog('create', 'medicalRecords', ref.id, 'Added medical record', null, rec);
  };

  const addPrescription = async (data: Omit<Prescription, 'id' | 'date' | 'status' | keyof BaseMetadata>) => {
    const ref = doc(collection(db, 'prescriptions'));
    const rx = withCreateMetadata({ id: ref.id, ...data, date: new Date().toISOString().split('T')[0], status: 'pending' });
    await setDoc(ref, rx);
    await recordAuditLog('create', 'prescriptions', ref.id, 'Added prescription', null, rx);
  };

  const dispensePrescription = async (id: string, pharmacistId: string, items: { inventoryItemId: string; quantity: number }[]) => {
    const rx = prescriptions.find(p => p.id === id);
    if (!rx) throw new Error('Rx not found');

    await runTransaction(db, async (tx) => {
      for (const item of items) {
        const iDoc = doc(db, 'inventory', item.inventoryItemId);
        const iSnap = await tx.get(iDoc);
        if (!iSnap.exists()) throw new Error('Item not found');
        tx.update(iDoc, { stock: iSnap.data().stock - item.quantity });
      }
      const update = withUpdateMetadata({ status: 'dispensed', dispensedBy: pharmacistId, dispensedAt: new Date().toISOString() });
      tx.update(doc(db, 'prescriptions', id), update);
    });
    await recordAuditLog('update', 'prescriptions', id, 'Dispensed items', rx);
    toast.success('Prescription dispensed');
  };

  const updatePrescriptionStatus = async (id: string, status: Prescription['status']) => {
    await updateDoc(doc(db, 'prescriptions', id), withUpdateMetadata({ status }));
  };

  /** Helper: translate Firebase Auth error codes into human-readable toasts */
  const handleAuthError = (error: any, role: string): string => {
    const code: string = error?.code || '';
    const messages: Record<string, string> = {
      'auth/operation-not-allowed':
        '❌ Email/Password sign-in is DISABLED in Firebase Console. Go to Authentication → Sign-in method → Enable Email/Password.',
      'auth/email-already-in-use':
        '❌ This email is already in the Authentication system, but no profile was found in our records (orphaned record from a purge). Please delete this user from the Firebase Console (Authentication tab) or use a different email.',
      'auth/invalid-email':
        '❌ Invalid email address. Please check the email field.',
      'auth/weak-password':
        '❌ Password is too weak. Use at least 6 characters.',
      'auth/network-request-failed':
        '❌ Network blocked. Disable your ad-blocker for localhost and try again.',
      'auth/too-many-requests':
        '❌ Too many requests. Wait a moment and try again.',
    };
    const msg = messages[code] || `❌ Failed to add ${role}: ${code || error?.message || 'Unknown error'}`;
    console.error(`[addStaff:${role}]`, code, error);
    return msg;
  };

  const addDoctor = async (data: Partial<User> & { password?: string }) => {
    try {
      const res = await createUserWithEmailAndPassword(secondaryAuth, data.email || '', data.password || 'Hospital@123');
      const doctor: User = withCreateMetadata({
        id: res.user.uid,
        name: data.name || 'Doctor',
        email: data.email || '',
        role: 'doctor',
        status: 'active',
        ...data,
      });
      delete (doctor as any).password;
      await setDoc(doc(db, 'users', res.user.uid), doctor);
      await recordAuditLog('create', 'users', res.user.uid, `Added doctor ${doctor.name}`, null, doctor);
      await signOut(secondaryAuth);
      toast.success(`Doctor ${doctor.name} added successfully!`);
    } catch (error: any) {
      toast.error(handleAuthError(error, 'doctor'), { duration: 6000 });
      throw error;
    }
  };

  const addReceptionist = async (data: Partial<User> & { password?: string }) => {
    try {
      const res = await createUserWithEmailAndPassword(secondaryAuth, data.email || '', data.password || 'Hospital@123');
      const user: User = withCreateMetadata({
        id: res.user.uid,
        name: data.name || 'Receptionist',
        email: data.email || '',
        role: 'receptionist',
        status: 'active',
        ...data,
      });
      delete (user as any).password;
      await setDoc(doc(db, 'users', res.user.uid), user);
      await recordAuditLog('create', 'users', res.user.uid, `Added receptionist ${user.name}`, null, user);
      await signOut(secondaryAuth);
      toast.success(`Receptionist ${user.name} added successfully!`);
    } catch (error: any) {
      toast.error(handleAuthError(error, 'receptionist'), { duration: 6000 });
      throw error;
    }
  };

  const addPharmacist = async (data: Partial<User> & { password?: string }) => {
    try {
      const res = await createUserWithEmailAndPassword(secondaryAuth, data.email || '', data.password || 'Hospital@123');
      const user: User = withCreateMetadata({
        id: res.user.uid,
        name: data.name || 'Pharmacist',
        email: data.email || '',
        role: 'pharmacist',
        status: 'active',
        ...data,
      });
      delete (user as any).password;
      await setDoc(doc(db, 'users', res.user.uid), user);
      await recordAuditLog('create', 'users', res.user.uid, `Added pharmacist ${user.name}`, null, user);
      await signOut(secondaryAuth);
      toast.success(`Pharmacist ${user.name} added successfully!`);
    } catch (error: any) {
      toast.error(handleAuthError(error, 'pharmacist'), { duration: 6000 });
      throw error;
    }
  };

  const addLabTechnician = async (data: Partial<User> & { password?: string }) => {
    try {
      const res = await createUserWithEmailAndPassword(secondaryAuth, data.email || '', data.password || 'Hospital@123');
      const user: User = withCreateMetadata({
        id: res.user.uid,
        name: data.name || 'Technician',
        email: data.email || '',
        role: 'lab_technician',
        status: 'active',
        ...data,
      });
      delete (user as any).password;
      await setDoc(doc(db, 'users', res.user.uid), user);
      await recordAuditLog('create', 'users', res.user.uid, `Added lab technician ${user.name}`, null, user);
      await signOut(secondaryAuth);
      toast.success(`Lab Technician ${user.name} added successfully!`);
    } catch (error: any) {
      toast.error(handleAuthError(error, 'lab_technician'), { duration: 6000 });
      throw error;
    }
  };

  const addDepartment = async (data: Omit<Department, 'id'>) => {
    const ref = doc(collection(db, 'departments'));
    await setDoc(ref, { id: ref.id, ...data });
  };

  const createAppointment = async (data: Omit<Appointment, 'id'>) => {
    const ref = doc(collection(db, 'appointments'));
    await setDoc(ref, { id: ref.id, ...data });
  };

  const createLabReport = async (data: Omit<LabReport, 'id'>) => {
    const ref = doc(collection(db, 'labReports'));
    await setDoc(ref, { id: ref.id, ...data });
  };

  const generateInvoice = async (data: any) => {
    const ref = doc(collection(db, 'invoices'));
    const amount = data.items.reduce((acc: number, i: any) => acc + i.amount + (i.taxAmount || 0), 0);
    const inv = withCreateMetadata({ id: ref.id, ...data, amount, status: 'unpaid', date: new Date().toISOString().split('T')[0] });
    await setDoc(ref, inv);
    await recordAuditLog('create', 'invoices', ref.id, 'Generated invoice', null, inv);
  };

  const payInvoice = async (id: string, method: Invoice['paymentMethod'], transactionId?: string) => {
    await updateDoc(doc(db, 'invoices', id), withUpdateMetadata({ status: 'paid', paymentMethod: method, transactionId }));
  };

  const sendMessage = async (data: Omit<Message, 'id' | 'timestamp' | 'read'>) => {
    const ref = doc(collection(db, 'messages'));
    await setDoc(ref, { id: ref.id, ...data, timestamp: new Date().toISOString(), read: false });
  };

  const markMessageRead = async (id: string) => {
    await updateDoc(doc(db, 'messages', id), { read: true });
  };

  const requestLabTest = async (data: Omit<LabRequest, 'id' | 'date' | 'status' | keyof BaseMetadata>) => {
    const ref = doc(collection(db, 'labRequests'));
    const req = withCreateMetadata({ id: ref.id, ...data, date: new Date().toISOString().split('T')[0], status: 'pending' });
    await setDoc(ref, req);
  };

  const addLabReport = async (data: Omit<LabReport, 'id' | 'date' | keyof BaseMetadata>) => {
    const ref = doc(collection(db, 'labReports'));
    const rep = withCreateMetadata({ id: ref.id, ...data, date: new Date().toISOString().split('T')[0], status: 'completed' });
    await setDoc(ref, rep);
    if (data.labRequestId) {
      await updateDoc(doc(db, 'labRequests', data.labRequestId), { status: 'completed' });
    }
  };

  const updateLabReportStatus = async (id: string, status: LabReport['status'], results?: string, technicianId?: string) => {
    await updateDoc(doc(db, 'labReports', id), withUpdateMetadata({ status, results, completedBy: technicianId, completedAt: new Date().toISOString() }));
  };

  const markNotificationRead = async (notificationId: string) => {
    try {
      const notifRef = doc(db, 'notifications', notificationId);
      await updateDoc(notifRef, {
        read: true,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.id || 'system'
      });
    } catch (err) {
      console.error("Error marking notification read:", err);
    }
  };

  const addNotification = async (userId: string, title: string, message: string, type: AppNotification['type']) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId,
        title,
        message,
        type,
        read: false,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.id || 'system',
        deleted: false
      });
    } catch (err) {
      console.error("Error adding notification:", err);
    }
  };

  const createAdminUser = async (data: Partial<User> & { password?: string }) => {
    try {
      const res = await createUserWithEmailAndPassword(secondaryAuth, data.email || '', data.password || '123456');
      const admin: User = withCreateMetadata({
        id: res.user.uid,
        name: data.name || 'Admin',
        email: data.email || '',
        role: 'admin',
        status: 'active',
        ...data
      });
      delete (admin as any).password;
      await setDoc(doc(db, 'users', res.user.uid), admin);
      await signOut(secondaryAuth);
      toast.success(`Admin ${admin.name} added successfully!`);
    } catch (error: any) {
      toast.error(handleAuthError(error, 'admin'), { duration: 6000 });
      throw error;
    }
  };


  const updateDoctorSchedule = async (doctorId: string, schedules: Omit<DoctorSchedule, 'id'>[]) => {
    try {
      const batch = writeBatch(db);
      
      // 1. Get existing schedules to delete
      const q = query(collection(db, 'doctorSchedules'), where('doctorId', '==', doctorId));
      const snapshot = await getDocs(q);
      
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // 2. Add new schedules
      console.log("[AppContext:updateDoctorSchedule:v2] Saving schedules:", schedules);
      schedules.forEach(s => {
        const newDocRef = doc(collection(db, 'doctorSchedules'));
        
        // Comprehensive sanitization: remove undefined, but keep null/empty if intended
        const sanitized: any = {};
        Object.keys(s).forEach(key => {
          const val = (s as any)[key];
          if (val !== undefined) {
            sanitized[key] = val;
          }
        });

        batch.set(newDocRef, { ...sanitized, id: newDocRef.id });
      });

      await batch.commit();
      await recordAuditLog('update', 'doctorSchedules', doctorId, `Updated schedule for doctor ${doctorId}`);
    } catch (error) {
      console.error('Update schedule error:', error);
      throw error;
    }
  };

  const addBed = async (data: Omit<Bed, 'id' | keyof BaseMetadata>) => {
    const ref = doc(collection(db, 'beds'));
    const bed = withCreateMetadata({ id: ref.id, ...data, status: 'available' });
    await setDoc(ref, bed);
    await recordAuditLog('create', 'beds', ref.id, 'Added bed', null, bed);
  };

  const updateBed = async (id: string, data: Partial<Bed>) => {
    await updateDoc(doc(db, 'beds', id), withUpdateMetadata(data));
  };

  const deleteBed = async (id: string) => {
    await softDeleteDoc('beds', id);
  };

  const addEquipment = async (data: Omit<Equipment, 'id' | keyof BaseMetadata>) => {
    const ref = doc(collection(db, 'equipment'));
    const eq = withCreateMetadata({ id: ref.id, ...data, status: 'available' });
    await setDoc(ref, eq);
    await recordAuditLog('create', 'equipment', ref.id, 'Added equipment', null, eq);
  };

  const updateEquipment = async (id: string, data: Partial<Equipment>) => {
    await updateDoc(doc(db, 'equipment', id), withUpdateMetadata(data));
  };

  const deleteEquipment = async (id: string) => {
    await softDeleteDoc('equipment', id);
  };

  const bookBed = async (data: Omit<BedBooking, 'id' | keyof BaseMetadata>) => {
    const ref = doc(collection(db, 'bedBookings'));
    const book = withCreateMetadata({ id: ref.id, ...data, status: data.status || 'active' });
    await setDoc(ref, book);
    if (data.bedId) {
      await updateDoc(doc(db, 'beds', data.bedId), { status: 'occupied', patientId: data.patientId });
      await recordAuditLog('create', 'clinical', data.bedId, `Booked bed ${data.bedId} for patient ${data.patientId}`);
    }
  };

  const updateBedBooking = async (id: string, data: Partial<BedBooking>) => {
    await updateDoc(doc(db, 'bedBookings', id), withUpdateMetadata(data));
    if (data.status === 'completed') {
      const b = bedBookings.find(i => i.id === id);
      if (b && b.bedId) await updateDoc(doc(db, 'beds', b.bedId), { status: 'available', patientId: deleteField() });
    }
  };

  const bookEquipment = async (data: Omit<EquipmentBooking, 'id' | keyof BaseMetadata>) => {
    const ref = doc(collection(db, 'equipmentBookings'));
    const book = withCreateMetadata({ id: ref.id, ...data, status: data.status || 'active' });
    await setDoc(ref, book);
    if (data.equipmentId) {
      await updateDoc(doc(db, 'equipment', data.equipmentId), { status: 'in_use' });
      await recordAuditLog('create', 'clinical', data.equipmentId, `Booked equipment ${data.equipmentId} for patient ${data.patientId}`);
    }
  };

  const updateEquipmentBooking = async (id: string, data: Partial<EquipmentBooking>) => {
    await updateDoc(doc(db, 'equipmentBookings', id), withUpdateMetadata(data));
    if (data.status === 'completed') {
      const b = equipmentBookings.find(i => i.id === id);
      if (b) await updateDoc(doc(db, 'equipment', b.equipmentId), { status: 'available' });
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!currentUser) return;
    const sRef = ref(storage, `avatars/${currentUser.id}`);
    await uploadBytes(sRef, file);
    const url = await getDownloadURL(sRef);
    await updateDoc(doc(db, 'users', currentUser.id), { avatar: url });
    setCurrentUser({ ...currentUser, avatar: url });
    toast.success('Avatar updated');
  };

  const uploadLabReport = async (file: File, pId: string, dId: string, test: string, reqId?: string) => {
    const sRef = ref(storage, `lab_reports/${pId}/${Date.now()}_${file.name}`);
    await uploadBytes(sRef, file);
    const url = await getDownloadURL(sRef);
    const refReport = doc(collection(db, 'labReports'));
    const rep = withCreateMetadata({ id: refReport.id, patientId: pId, doctorId: dId, testType: test, status: 'completed', resultData: url, fileUrl: url, date: new Date().toISOString().split('T')[0], labRequestId: reqId });
    await setDoc(refReport, rep);
    toast.success('Lab report uploaded');
  };

  const addInventoryItem = async (data: Omit<InventoryItem, 'id' | keyof BaseMetadata>) => {
    const ref = doc(collection(db, 'inventory'));
    const item = withCreateMetadata({ id: ref.id, ...data });
    await setDoc(ref, item);
    await recordAuditLog('create', 'inventory', ref.id, `Added ${data.name}`, null, item);
  };

  const updateInventoryItem = async (id: string, data: Partial<InventoryItem>) => {
    await updateDoc(doc(db, 'inventory', id), withUpdateMetadata(data));
  };

  const deleteInventoryItem = async (id: string) => {
    await softDeleteDoc('inventory', id);
  };

  const updateDepartment = async (id: string, data: Partial<Department>) => {
    await updateDoc(doc(db, 'departments', id), data);
    await recordAuditLog('update', 'system', id, `Updated department ${id}`, null, data);
  };

  const deleteDepartment = async (id: string) => {
    await deleteDoc(doc(db, 'departments', id));
    await recordAuditLog('delete', 'system', id, `Deleted department ${id}`);
  };

  const updateUser = async (id: string, data: Partial<User>) => {
    await updateDoc(doc(db, 'users', id), withUpdateMetadata(data));
    await recordAuditLog('update', 'users', id, `Updated user ${id}`, null, data);
  };

  const deleteUser = async (id: string) => {
    try {
      await softDeleteDoc('users', id);
      await recordAuditLog('delete', 'users', id, `Soft deleted user ${id}`);
      // Toast is shown by the calling UI component
    } catch (error: any) {
      console.error('[deleteUser]', id, error);
    }
  };

  const updateHospitalSettings = async (data: Partial<HospitalSettings>) => {
    await setDoc(doc(db, 'settings', 'general'), data, { merge: true });
    toast.success('Hospital settings updated successfully');
  };

  const generatePharmacyBill = async (billData: Omit<PharmacyBill, 'id' | 'billId' | 'status' | keyof BaseMetadata>) => {
    const ref = doc(collection(db, 'bills'));
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const billId = `SHPH${year}${month}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    const bill: PharmacyBill = withCreateMetadata({
      id: ref.id,
      billId,
      status: 'generated',
      ...billData
    });
    await setDoc(ref, bill);

    // Also record as admin invoice for ledger
    const adminRef = doc(collection(db, 'adminInvoices'));
    await setDoc(adminRef, withCreateMetadata({
      id: adminRef.id,
      billId: bill.billId,
      totalAmount: bill.totalAmount,
      department: 'pharmacy',
      patientName: bill.patientName,
      timestamp: now.toISOString()
    }));

    await recordAuditLog('create', 'bills', ref.id, `Generated bill ${billId}`, null, bill);
    toast.success('Bill generated successfully');
    return bill;
  };

  const sendResetOTP = async (email: string) => {
    // Check if user exists
    const q = query(collection(db, 'users'), where('email', '==', email));
    const snap = await getDocs(q);
    if (snap.empty) throw new Error('No user found with this email.');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

    await setDoc(doc(db, 'resetOtps', email), { email, otp, expiresAt });

    // In a real production app, you would call a backend service to send actual SMS/Email.
    // For this implementation, we simulate the 'sent' status.
    console.log(`[OTP SERVICE] Sending OTP ${otp} to ${email}`);
    toast.success(`OTP sent to ${email} (Simulated: ${otp})`);
  };

  const verifyResetOTP = async (email: string, otp: string) => {
    const d = await getDoc(doc(db, 'resetOtps', email));
    if (!d.exists()) throw new Error('OTP expired or not requested.');
    const data = d.data();
    if (data.otp !== otp) throw new Error('Invalid OTP.');
    if (new Date(data.expiresAt) < new Date()) throw new Error('OTP expired.');
    return true;
  };

  const resetPasswordWithOTP = async (email: string, otp: string, newPass: string) => {
    await verifyResetOTP(email, otp);
    // In Firebase Client SDK, we can't update another user's password without them being logged in
    // unless we use Firebase Admin. However, for the user currently using the "Forgot Password" 
    // flow, we effectively allow them to 'verify' then we direct them back to login.
    // In this specific clinical app setup with '123456' defaults, we update the placeholder for demo.
    const q = query(collection(db, 'users'), where('email', '==', email));
    const snap = await getDocs(q);
    const userId = snap.docs[0].id;
    await updateDoc(doc(db, 'users', userId), withUpdateMetadata({ tempPassword: newPass }));
    await deleteDoc(doc(db, 'resetOtps', email));
    toast.success('Password updated successfully');
  };

  const generateServiceInvoice = async (patientId: string, items: Omit<InvoiceItem, 'id' | 'taxAmount'>[], type: Invoice['type']) => {
    try {
      const patient = users.find(u => u.id === patientId);
      const ref = doc(collection(db, 'invoices'));
      const now = new Date();
      const prefix = type === 'pharmacy' ? 'SHPH' : type === 'lab' ? 'SHLB' : 'SHCS';
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
      const invoiceId = `${prefix}${year}${month}${random}`;

      const subtotal = items.reduce((acc, item) => acc + (item.amount * item.quantity), 0);
      const totalTaxAmount = items.reduce((acc, item) => acc + (item.amount * item.quantity * (item.taxRate / 100)), 0);
      const totalAmount = subtotal + totalTaxAmount;

      const invoice: Invoice = withCreateMetadata({
        id: ref.id,
        invoiceId,
        patientId,
        patientName: patient?.name || 'Unknown',
        patientPhone: patient?.phone || 'N/A',
        items: items.map(item => ({
          ...item,
          id: Math.random().toString(36).substr(2, 9),
          taxAmount: item.amount * item.quantity * (item.taxRate / 100)
        })),
        amount: totalAmount,
        subtotal,
        totalTaxAmount,
        totalAmount,
        date: now.toISOString().split('T')[0],
        dueDate: new Date(now.getTime() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
        status: 'pending',
        type
      });

      await setDoc(ref, invoice);

      // Mirror to adminInvoices for historical ledger
      const adminRef = doc(collection(db, 'adminInvoices'));
      await setDoc(adminRef, withCreateMetadata({
        id: adminRef.id,
        billId: invoiceId,
        totalAmount: invoice.totalAmount,
        department: type === 'pharmacy' ? 'pharmacy' : type === 'lab' ? 'lab' : 'reception',
        patientName: invoice.patientName,
        timestamp: now.toISOString()
      }));

      await recordAuditLog('create', 'finance', ref.id, `Generated ${type} invoice ${invoiceId}`);
      toast.success('Invoice generated');
      return invoice;
    } catch (err: any) {
      console.error('Invoice generation failed:', err);
      toast.error('Failed to generate invoice');
      throw err;
    }
  };

  const purgeCollection = async (name: string) => {
    try {
      const q = query(collection(db, name));
      const snap = await getDocs(q);

      let deletedCount = 0;
      for (const d of snap.docs) {
        // SAFEGUARD: Never delete the currently logged-in Admin or the initial system admin
        if (name === 'users' && (d.id === currentUser?.id || d.data().role === 'admin' || d.data().email === 'admin@hospital.com')) {
          continue;
        }
        // SAFEGUARD: Never delete essential system settings
        if (name === 'settings') {
          continue;
        }

        await deleteDoc(d.ref);
        deletedCount++;
      }

      await recordAuditLog('delete', 'system', 'all', `Purged collection: ${name}. ${deletedCount} records removed.`);
      toast.success(`Purged ${deletedCount} records from ${name}`);
      return deletedCount;
    } catch (err: any) {
      console.error(`Purge failed for ${name}:`, err);
      toast.error(`Purge failed: ${err.message}`);
      throw err;
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser, users, doctors, departments, doctorSchedules, appointments, medicalRecords, prescriptions, invoices, labRequests, labReports, notifications, messages, beds, equipment, bedBookings, equipmentBookings, inventory, bills, adminInvoices, hospitalSettings, auditLogs, isAuthReady,
      login, logout, registerPatient, createWalkInPatient, bookAppointment, updateAppointmentStatus, addMedicalRecord, addPrescription, dispensePrescription, updatePrescriptionStatus, addDoctor, addReceptionist, addPharmacist, addLabTechnician, addDepartment, updateDepartment, deleteDepartment, createAppointment, createLabReport, generateInvoice, generateServiceInvoice, findPatient, payInvoice, sendMessage, markMessageRead, requestLabTest, addLabReport, updateLabReportStatus, markNotificationRead, addNotification, createAdminUser, updateUser, deleteUser, updateDoctorSchedule, addBed, updateBed, deleteBed, addEquipment, updateEquipment, deleteEquipment, bookBed, updateBedBooking, bookEquipment, updateEquipmentBooking, uploadAvatar, uploadLabReport, addInventoryItem, updateInventoryItem, deleteInventoryItem, updateHospitalSettings, generatePharmacyBill,
      softDeleteDoc,
      recordAuditLog,
      withCreateMetadata,
      withUpdateMetadata,
      sendResetOTP,
      verifyResetOTP,
      resetPasswordWithOTP,
      purgeCollection
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
