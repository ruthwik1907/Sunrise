import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db, auth, secondaryAuth, storage } from '../firebase';
import { 
  collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, 
  query, where, getDoc, addDoc, getDocs, runTransaction 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged 
} from 'firebase/auth';
import toast from 'react-hot-toast';
import { sendAppointmentConfirmationEmail, sendLabReportReadyEmail, sendPrescriptionReadyEmail } from '../services/emailService';

export type Role = 'patient' | 'doctor' | 'admin' | 'receptionist' | 'pharmacist' | 'lab_technician';

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
  action: 'create' | 'update' | 'delete' | 'restore' | 'login' | 'logout';
  collection: string;
  docId: string;
  performerId: string;
  performerName: string;
  performerRole: string;
  timestamp: string;
  details?: string;
  oldData?: any;
  newData?: any;
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
  specialty?: string;
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

export interface Appointment extends BaseMetadata {
  id: string;
  patientId: string;
  doctorId: string;
  departmentId: string;
  date: string;
  time: string;
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
  medicationName: string;
  dosage: string;
  route: string;
  frequency: string;
  durationDays: number;
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
  amount: number;
  type: 'consultation' | 'lab_test' | 'medication' | 'procedure' | 'other';
  taxRate: number;
  taxAmount: number;
  hsnSacCode?: string;
}

export interface Invoice extends BaseMetadata {
  id: string;
  patientId: string;
  appointmentId?: string;
  amount: number;
  subtotal: number;
  totalTaxAmount: number;
  date: string;
  dueDate: string;
  status: 'paid' | 'unpaid' | 'partial' | 'cancelled';
  description?: string;
  items: InvoiceItem[];
  paymentMethod?: 'cash' | 'card' | 'upi' | 'insurance';
  transactionId?: string;
  gstNumber?: string;
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
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  notes?: string;
}

export interface BedBooking extends BaseMetadata {
  id: string;
  bedId: string;
  patientId: string;
  doctorId: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'cancelled';
  reason: string;
  notes?: string;
}

export interface EquipmentBooking extends BaseMetadata {
  id: string;
  equipmentId: string;
  patientId: string;
  doctorId: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'cancelled';
  purpose: string;
  notes?: string;
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

export interface PharmacyBill extends BaseMetadata {
  id: string;
  billId: string;
  patientName: string;
  patientId?: string;
  medicines: PharmacyBillMedicine[];
  subtotal: number;
  gst: number;
  totalAmount: number;
  status: "generated";
}

export interface AdminInvoice extends BaseMetadata {
  id: string;
  billId: string;
  totalAmount: number;
  department: "pharmacy";
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  departments: Department[];
  doctorSchedules: DoctorSchedule[];
  appointments: Appointment[];
  medicalRecords: MedicalRecord[];
  prescriptions: Prescription[];
  invoices: Invoice[];
  labRequests: LabRequest[];
  labReports: LabReport[];
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
  createAppointment: (data: Omit<Appointment, 'id'>) => Promise<void>;
  createLabReport: (data: Omit<LabReport, 'id'>) => Promise<void>;
  generateInvoice: (data: Omit<Invoice, 'id' | 'status' | 'amount' | 'subtotal' | 'totalTaxAmount' | keyof BaseMetadata> & { items: Omit<InvoiceItem, 'id' | 'taxAmount'>[] }) => Promise<void>;
  payInvoice: (id: string, method: Invoice['paymentMethod'], transactionId?: string) => Promise<void>;
  sendMessage: (data: Omit<Message, 'id' | 'timestamp' | 'read'>) => Promise<void>;
  markMessageRead: (id: string) => Promise<void>;
  requestLabTest: (data: Omit<LabRequest, 'id' | 'date' | 'status' | keyof BaseMetadata>) => Promise<void>;
  addLabReport: (data: Omit<LabReport, 'id' | 'date' | keyof BaseMetadata>) => Promise<void>;
  updateLabReportStatus: (id: string, status: LabReport['status'], results?: string, technicianId?: string) => Promise<void>;
  createAdminUser: (data: Partial<User> & { password?: string }) => Promise<void>;
  updateAdminUser: (id: string, data: Partial<User>) => Promise<void>;
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
  generatePharmacyBill: (billData: Omit<PharmacyBill, 'id' | 'billId' | 'status' | keyof BaseMetadata>) => Promise<void>;
  softDeleteDoc: (collectionName: string, id: string) => Promise<void>;
  recordAuditLog: (action: AuditLog['action'], collectionName: string, docId: string, details?: string, oldData?: any, newData?: any) => Promise<void>;
  withCreateMetadata: (data: any) => any;
  withUpdateMetadata: (data: any) => any;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctorSchedules, setDoctorSchedules] = useState<DoctorSchedule[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [labRequests, setLabRequests] = useState<LabRequest[]>([]);
  const [labReports, setLabReports] = useState<LabReport[]>([]);
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

  const withCreateMetadata = (data: any) => {
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

  const withUpdateMetadata = (data: any) => {
    return {
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser?.id || 'system',
    };
  };

  const recordAuditLog = async (
    action: AuditLog['action'],
    collectionName: string,
    docId: string,
    details?: string,
    oldData?: any,
    newData?: any
  ) => {
    try {
      const logRef = doc(collection(db, 'auditLogs'));
      const log: AuditLog = {
        id: logRef.id,
        action,
        collection: collectionName,
        docId,
        performerId: currentUser?.id || 'system',
        performerName: currentUser?.name || 'System Auto',
        performerRole: currentUser?.role || 'system',
        timestamp: new Date().toISOString(),
        details,
        oldData: oldData ? JSON.parse(JSON.stringify(oldData)) : null,
        newData: newData ? JSON.parse(JSON.stringify(newData)) : null,
      };
      await setDoc(logRef, log);
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
      toast.success('Successfully deleted');
    } catch (error: any) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete');
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

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
    });
    const unsubDepts = onSnapshot(collection(db, 'departments'), (snapshot) => {
      setDepartments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Department)));
    });
    return () => { unsubUsers(); unsubDepts(); };
  }, []);

  useEffect(() => {
    if (!isAuthReady || !currentUser) return;

    const queryOptions = where('deleted', '!=', true);

    const subs = [
      onSnapshot(collection(db, 'doctorSchedules'), snap => setDoctorSchedules(snap.docs.map(d => ({ id: d.id, ...d.data() } as DoctorSchedule)))),
      onSnapshot(query(collection(db, 'appointments'), queryOptions), snap => setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment)))),
      onSnapshot(query(collection(db, 'medicalRecords'), queryOptions), snap => setMedicalRecords(snap.docs.map(d => ({ id: d.id, ...d.data() } as MedicalRecord)))),
      onSnapshot(query(collection(db, 'prescriptions'), queryOptions), snap => setPrescriptions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Prescription)))),
      onSnapshot(query(collection(db, 'invoices'), queryOptions), snap => setInvoices(snap.docs.map(d => ({ id: d.id, ...d.data() } as Invoice)))),
      onSnapshot(query(collection(db, 'labRequests'), queryOptions), snap => setLabRequests(snap.docs.map(d => ({ id: d.id, ...d.data() } as LabRequest)))),
      onSnapshot(query(collection(db, 'labReports'), queryOptions), snap => setLabReports(snap.docs.map(d => ({ id: d.id, ...d.data() } as LabReport)))),
      onSnapshot(collection(db, 'messages'), snap => setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message)))),
      onSnapshot(query(collection(db, 'beds'), queryOptions), snap => setBeds(snap.docs.map(d => ({ id: d.id, ...d.data() } as Bed)))),
      onSnapshot(query(collection(db, 'equipment'), queryOptions), snap => setEquipment(snap.docs.map(d => ({ id: d.id, ...d.data() } as Equipment)))),
      onSnapshot(query(collection(db, 'bedBookings'), queryOptions), snap => setBedBookings(snap.docs.map(d => ({ id: d.id, ...d.data() } as BedBooking)))),
      onSnapshot(query(collection(db, 'equipmentBookings'), queryOptions), snap => setEquipmentBookings(snap.docs.map(d => ({ id: d.id, ...d.data() } as EquipmentBooking)))),
      onSnapshot(query(collection(db, 'inventory'), queryOptions), snap => setInventory(snap.docs.map(d => ({ id: d.id, ...d.data() } as InventoryItem)))),
      onSnapshot(query(collection(db, 'auditLogs')), snap => setAuditLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as AuditLog))), error => console.warn('Audit logs permission issue:', error)),
      onSnapshot(doc(db, 'settings', 'general'), snap => {
        if (snap.exists()) setHospitalSettings(snap.data() as HospitalSettings);
      })
    ];

    return () => subs.forEach(unsub => unsub());
  }, [isAuthReady, currentUser]);

  const login = async (email: string, password?: string, role?: Role) => {
    try {
      const normalizedRole = role === 'labtechnician' ? 'lab_technician' : role;
      const result = await signInWithEmailAndPassword(auth, email, password || '123456');
      const user = result.user;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        const isAdminEmail = email === 'admin@hospital.com';
        if (normalizedRole === 'patient' || isAdminEmail) {
          const newUser: User = withCreateMetadata({
            id: user.uid,
            name: user.displayName || email.split('@')[0],
            email: user.email || email,
            role: isAdminEmail ? 'admin' : (normalizedRole || 'patient'),
            status: 'active',
            avatar: `https://picsum.photos/seed/${user.uid}/200/200`,
          });
          if (newUser.role === 'patient') {
            newUser.mrn = `MRN-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
          }
          await setDoc(doc(db, 'users', user.uid), newUser);
          setCurrentUser(newUser);
          return newUser;
        } else {
          throw new Error('Account not found. Contact administrator.');
        }
      } else {
        const userData = { id: userDoc.id, ...userDoc.data() } as User;
        setCurrentUser(userData);
        return userData;
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  const registerPatient = async (data: Partial<User> & { password?: string }) => {
    const result = await createUserWithEmailAndPassword(auth, data.email || '', data.password || '123456');
    const user = result.user;
    const patient: User = withCreateMetadata({
      id: user.uid,
      name: data.name || 'New Patient',
      email: data.email || '',
      role: 'patient',
      status: 'active',
      mrn: `MRN-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      ...data
    });
    delete (patient as any).password;
    await setDoc(doc(db, 'users', user.uid), patient);
    await recordAuditLog('create', 'users', user.uid, `Registered patient ${patient.name}`, null, patient);
    return patient;
  };

  const createWalkInPatient = async (data: Partial<User>) => {
    const id = doc(collection(db, 'users')).id;
    const patient: User = withCreateMetadata({
      id,
      name: data.name || 'Walk-in',
      email: data.email || '',
      role: 'patient',
      status: 'active',
      mrn: `MRN-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
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

  const addDoctor = async (data: Partial<User> & { password?: string }) => {
    const res = await createUserWithEmailAndPassword(secondaryAuth, data.email || '', data.password || '123456');
    const doctor: User = withCreateMetadata({
      id: res.user.uid,
      name: data.name || 'Doctor',
      email: data.email || '',
      role: 'doctor',
      status: 'active',
      ...data
    });
    await setDoc(doc(db, 'users', res.user.uid), doctor);
    await recordAuditLog('create', 'users', res.user.uid, `Added doctor ${doctor.name}`, null, doctor);
    await signOut(secondaryAuth);
  };

  const addReceptionist = async (data: Partial<User> & { password?: string }) => {
    const res = await createUserWithEmailAndPassword(secondaryAuth, data.email || '', data.password || '123456');
    const user: User = withCreateMetadata({
      id: res.user.uid,
      name: data.name || 'Receptionist',
      email: data.email || '',
      role: 'receptionist',
      status: 'active',
      ...data
    });
    await setDoc(doc(db, 'users', res.user.uid), user);
    await signOut(secondaryAuth);
  };

  const addPharmacist = async (data: Partial<User> & { password?: string }) => {
    const res = await createUserWithEmailAndPassword(secondaryAuth, data.email || '', data.password || '123456');
    const user: User = withCreateMetadata({
      id: res.user.uid,
      name: data.name || 'Pharmacist',
      email: data.email || '',
      role: 'pharmacist',
      status: 'active',
      ...data
    });
    await setDoc(doc(db, 'users', res.user.uid), user);
    await signOut(secondaryAuth);
  };

  const addLabTechnician = async (data: Partial<User> & { password?: string }) => {
    const res = await createUserWithEmailAndPassword(secondaryAuth, data.email || '', data.password || '123456');
    const user: User = withCreateMetadata({
      id: res.user.uid,
      name: data.name || 'Technician',
      email: data.email || '',
      role: 'lab_technician',
      status: 'active',
      ...data
    });
    await setDoc(doc(db, 'users', res.user.uid), user);
    await signOut(secondaryAuth);
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

  const createAdminUser = async (data: Partial<User> & { password?: string }) => {
    const res = await createUserWithEmailAndPassword(secondaryAuth, data.email || '', data.password || '123456');
    const admin: User = withCreateMetadata({
      id: res.user.uid,
      name: data.name || 'Admin',
      email: data.email || '',
      role: 'admin',
      status: 'active',
      ...data
    });
    await setDoc(doc(db, 'users', res.user.uid), admin);
    await signOut(secondaryAuth);
  };

  const updateAdminUser = async (id: string, data: Partial<User>) => {
    await updateDoc(doc(db, 'users', id), withUpdateMetadata(data));
  };

  const deleteUser = async (id: string) => {
    await softDeleteDoc('users', id);
  };

  const updateDoctorSchedule = async (doctorId: string, schedules: Omit<DoctorSchedule, 'id'>[]) => {
    const existing = doctorSchedules.filter(s => s.doctorId === doctorId);
    for (const s of existing) await deleteDoc(doc(db, 'doctorSchedules', s.id));
    for (const s of schedules) {
      const ref = doc(collection(db, 'doctorSchedules'));
      await setDoc(ref, { id: ref.id, ...s });
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
    const book = withCreateMetadata({ id: ref.id, ...data, status: 'active' });
    await setDoc(ref, book);
    await updateDoc(doc(db, 'beds', data.bedId), { status: 'occupied', patientId: data.patientId });
  };

  const updateBedBooking = async (id: string, data: Partial<BedBooking>) => {
    await updateDoc(doc(db, 'bedBookings', id), withUpdateMetadata(data));
    if (data.status === 'completed') {
      const b = bedBookings.find(i => i.id === id);
      if (b) await updateDoc(doc(db, 'beds', b.bedId), { status: 'available', patientId: undefined });
    }
  };

  const bookEquipment = async (data: Omit<EquipmentBooking, 'id' | keyof BaseMetadata>) => {
    const ref = doc(collection(db, 'equipmentBookings'));
    const book = withCreateMetadata({ id: ref.id, ...data, status: 'active' });
    await setDoc(ref, book);
    await updateDoc(doc(db, 'equipment', data.equipmentId), { status: 'in_use' });
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

  const updateHospitalSettings = async (data: Partial<HospitalSettings>) => {
    await setDoc(doc(db, 'settings', 'general'), data, { merge: true });
    toast.success('Settings updated');
  };

  const generatePharmacyBill = async (data: Omit<PharmacyBill, 'id' | 'billId' | 'status' | keyof BaseMetadata>) => {
    if (!currentUser) throw new Error('Not logged in');
    const billRef = doc(collection(db, 'bills'));
    const billId = `BILL-${Date.now()}`;
    const bill = withCreateMetadata({ id: billRef.id, billId, ...data, status: 'generated' });
    await runTransaction(db, async (tx) => {
      tx.set(billRef, bill);
      const invRef = doc(collection(db, 'adminInvoices'));
      tx.set(invRef, withCreateMetadata({ id: invRef.id, billId: billRef.id, totalAmount: data.totalAmount, department: 'pharmacy' }));
    });
    toast.success('Bill generated');
  };

  return (
    <AppContext.Provider value={{
      currentUser, users, departments, doctorSchedules, appointments, medicalRecords, prescriptions, invoices, labRequests, labReports, messages, beds, equipment, bedBookings, equipmentBookings, inventory, bills, adminInvoices, hospitalSettings, auditLogs, isAuthReady,
      login, logout, registerPatient, createWalkInPatient, bookAppointment, updateAppointmentStatus, addMedicalRecord, addPrescription, dispensePrescription, updatePrescriptionStatus, addDoctor, addReceptionist, addPharmacist, addLabTechnician, addDepartment, createAppointment, createLabReport, generateInvoice, payInvoice, sendMessage, markMessageRead, requestLabTest, addLabReport, updateLabReportStatus, createAdminUser, updateAdminUser, deleteUser, updateDoctorSchedule, addBed, updateBed, deleteBed, addEquipment, updateEquipment, deleteEquipment, bookBed, updateBedBooking, bookEquipment, updateEquipmentBooking, uploadAvatar, uploadLabReport, addInventoryItem, updateInventoryItem, deleteInventoryItem, updateHospitalSettings, generatePharmacyBill, softDeleteDoc, recordAuditLog, withCreateMetadata, withUpdateMetadata
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
