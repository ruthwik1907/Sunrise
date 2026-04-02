import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db, auth, secondaryAuth, storage } from '../firebase';
import { 
  collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, 
  query, where, getDoc, addDoc, getDocs 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged 
} from 'firebase/auth';
import toast from 'react-hot-toast';
import { sendAppointmentConfirmationEmail, sendLabReportReadyEmail, sendPrescriptionReadyEmail } from '../services/emailService';

export type Role = 'patient' | 'doctor' | 'admin' | 'receptionist' | 'pharmacist' | 'lab_technician';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  avatar?: string;
  
  // Patient specific
  mrn?: string;
  dob?: string;
  gender?: 'male' | 'female' | 'other';
  bloodGroup?: string;
  address?: string;
  emergencyContact?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;

  // Doctor specific
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
  dayOfWeek: string; // 'Monday', 'Tuesday', etc.
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  slotDurationMinutes: number; // e.g., 30
  breakStart?: string;
  breakEnd?: string;
  isWorking?: boolean;
}

export interface Appointment {
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

export interface MedicalRecord {
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

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId: string;
  date: string;
  items: PrescriptionItem[];
  medications?: string; // Legacy field for backward compatibility
  notes?: string; // Doctor's notes
  status: 'pending' | 'dispensed';
  dispensedBy?: string;
  dispensedAt?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  amount: number;
  type: 'consultation' | 'lab_test' | 'medication' | 'procedure' | 'other';
}

export interface Invoice {
  id: string;
  patientId: string;
  appointmentId?: string;
  amount: number;
  date: string;
  dueDate: string;
  status: 'paid' | 'unpaid' | 'partial' | 'cancelled';
  description?: string; // Summary description
  items: InvoiceItem[];
  paymentMethod?: 'cash' | 'card' | 'upi' | 'insurance';
  transactionId?: string;
}

export interface LabRequest {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  date: string;
  testName: string;
  status: 'pending' | 'sample_collected' | 'completed';
  notes?: string;
}

export interface LabReport {
  id: string;
  labRequestId?: string;
  patientId: string;
  doctorId: string;
  technicianId?: string;
  date: string;
  testType: string;
  testName?: string; // For backward compatibility
  resultData?: string; // Could be JSON in real app
  results?: string; // New field for completed results
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

export interface Bed {
  id: string;
  roomNumber: string;
  bedNumber: string;
  type: 'general' | 'icu' | 'private' | 'semi_private';
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  patientId?: string;
  departmentId: string;
  notes?: string;
}

export interface Equipment {
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

export interface BedBooking {
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

export interface EquipmentBooking {
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
  isAuthReady: boolean;
  login: (email: string, password?: string, role?: Role) => Promise<User>;
  logout: () => Promise<void>;
  registerPatient: (data: Partial<User> & { password?: string }) => Promise<User>;
  createWalkInPatient: (data: Partial<User>) => Promise<User>;
  bookAppointment: (data: Omit<Appointment, 'id' | 'status'>) => Promise<void>;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => Promise<void>;
  addMedicalRecord: (data: Omit<MedicalRecord, 'id' | 'date'>) => Promise<void>;
  addPrescription: (data: Omit<Prescription, 'id' | 'date' | 'status'>) => Promise<void>;
  dispensePrescription: (id: string, pharmacistId: string) => Promise<void>;
  updatePrescriptionStatus: (id: string, status: Prescription['status']) => Promise<void>;
  addDoctor: (data: Partial<User> & { password?: string }) => Promise<void>;
  addReceptionist: (data: Partial<User> & { password?: string }) => Promise<void>;
  addPharmacist: (data: Partial<User> & { password?: string }) => Promise<void>;
  addLabTechnician: (data: Partial<User> & { password?: string }) => Promise<void>;
  addDepartment: (data: Omit<Department, 'id'>) => Promise<void>;
  createAppointment: (data: Omit<Appointment, 'id' | 'status'>) => Promise<void>;
  createLabReport: (data: Omit<LabReport, 'id' | 'date'>) => Promise<void>;
  generateInvoice: (data: Omit<Invoice, 'id' | 'status'>) => Promise<void>;
  payInvoice: (id: string, method: Invoice['paymentMethod'], transactionId?: string) => Promise<void>;
  sendMessage: (data: Omit<Message, 'id' | 'timestamp' | 'read'>) => Promise<void>;
  markMessageRead: (id: string) => Promise<void>;
  requestLabTest: (data: Omit<LabRequest, 'id' | 'date' | 'status'>) => Promise<void>;
  addLabReport: (data: Omit<LabReport, 'id' | 'date'>) => Promise<void>;
  updateLabReportStatus: (id: string, status: LabReport['status'], resultData?: string, technicianId?: string) => Promise<void>;
  createAdminUser: (data: Partial<User> & { password?: string }) => Promise<void>;
  updateAdminUser: (id: string, data: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  updateDoctorSchedule: (doctorId: string, schedules: Omit<DoctorSchedule, 'id'>[]) => Promise<void>;
  addBed: (data: Omit<Bed, 'id'>) => Promise<void>;
  updateBed: (id: string, data: Partial<Bed>) => Promise<void>;
  deleteBed: (id: string) => Promise<void>;
  addEquipment: (data: Omit<Equipment, 'id'>) => Promise<void>;
  updateEquipment: (id: string, data: Partial<Equipment>) => Promise<void>;
  deleteEquipment: (id: string) => Promise<void>;
  bookBed: (data: Omit<BedBooking, 'id'>) => Promise<void>;
  updateBedBooking: (id: string, data: Partial<BedBooking>) => Promise<void>;
  bookEquipment: (data: Omit<EquipmentBooking, 'id'>) => Promise<void>;
  updateEquipmentBooking: (id: string, data: Partial<EquipmentBooking>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  uploadLabReport: (file: File, patientId: string, doctorId: string, testName: string, labRequestId?: string) => Promise<void>;
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
  const [isAuthReady, setIsAuthReady] = useState(false);

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

    return () => {
      unsubUsers(); unsubDepts();
    };
  }, []);

  useEffect(() => {
    if (!isAuthReady || !currentUser) return;

    const unsubSchedules = onSnapshot(collection(db, 'doctorSchedules'), (snapshot) => {
      setDoctorSchedules(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DoctorSchedule)));
    });
    const unsubAppts = onSnapshot(collection(db, 'appointments'), (snapshot) => {
      setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment)));
    });
    const unsubRecords = onSnapshot(collection(db, 'medicalRecords'), (snapshot) => {
      setMedicalRecords(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MedicalRecord)));
    });
    const unsubPrescriptions = onSnapshot(collection(db, 'prescriptions'), (snapshot) => {
      setPrescriptions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prescription)));
    });
    const unsubInvoices = onSnapshot(collection(db, 'invoices'), (snapshot) => {
      setInvoices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice)));
    });
    const unsubLabReqs = onSnapshot(collection(db, 'labRequests'), (snapshot) => {
      setLabRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LabRequest)));
    });
    const unsubLabReps = onSnapshot(collection(db, 'labReports'), (snapshot) => {
      setLabReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LabReport)));
    });
    const unsubMessages = onSnapshot(collection(db, 'messages'), (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
    });
    const unsubBeds = onSnapshot(collection(db, 'beds'), (snapshot) => {
      setBeds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bed)));
    });
    const unsubEquipment = onSnapshot(collection(db, 'equipment'), (snapshot) => {
      setEquipment(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Equipment)));
    });
    const unsubBedBookings = onSnapshot(collection(db, 'bedBookings'), (snapshot) => {
      setBedBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BedBooking)));
    });
    const unsubEquipmentBookings = onSnapshot(collection(db, 'equipmentBookings'), (snapshot) => {
      setEquipmentBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EquipmentBooking)));
    });

    return () => {
      unsubSchedules(); unsubAppts();
      unsubRecords(); unsubPrescriptions(); unsubInvoices();
      unsubLabReqs(); unsubLabReps(); unsubMessages();
      unsubBeds(); unsubEquipment(); unsubBedBookings(); unsubEquipmentBookings();
    };
  }, [isAuthReady, currentUser]);

  const login = async (email: string, password?: string, role?: Role) => {
    try {
      const normalizedRole = role === 'labtechnician' ? 'lab_technician' : role;
      const result = await signInWithEmailAndPassword(auth, email, password || '123456');
      const user = result.user;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        const isAdminEmail = email === 'admin@hospital.com';
        // Only auto-create patients and admin accounts
        if (normalizedRole === 'patient' || isAdminEmail) {
          const newUser: User = {
            id: user.uid,
            name: user.displayName || email.split('@')[0],
            email: user.email || email,
            role: isAdminEmail ? 'admin' : (normalizedRole || 'patient'),
            avatar: user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
          };
          if (newUser.role === 'patient') {
            newUser.mrn = `MRN-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
          }
          await setDoc(doc(db, 'users', user.uid), newUser);
          setCurrentUser(newUser);
          return newUser;
        } else {
          // For staff roles, account must be created by admin first
          throw new Error(`Account not found. Please contact administrator to create your ${normalizedRole?.replace('_', ' ')} account.`);
        }
      } else {
        const existingUser = { id: userDoc.id, ...userDoc.data() } as User;

        // If login role is admin and Firestore role is stale, update it immediately.
        if (normalizedRole === 'admin' && existingUser.role !== 'admin') {
          await updateDoc(doc(db, 'users', existingUser.id), { role: 'admin' });
          existingUser.role = 'admin';
        }

        setCurrentUser(existingUser);
        return existingUser;
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please check your credentials or ensure you have enabled Email/Password authentication in Firebase.");
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  const registerPatient = async (data: Partial<User> & { password?: string }) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, data.email || '', data.password || '123456');
      const user = result.user;
      
      const isAdminEmail = data.email === 'admin@hospital.com';
      
      const newUser: User = {
        id: user.uid,
        name: data.name || user.displayName || (isAdminEmail ? 'Admin' : 'New Patient'),
        email: data.email || user.email || '',
        phone: data.phone,
        avatar: user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
        ...data,
        role: isAdminEmail ? 'admin' : 'patient', // Ensure role is not overwritten by ...data
      };
      
      if (!isAdminEmail) {
        newUser.mrn = `MRN-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      }
      
      // Remove password from the data saved to Firestore
      delete (newUser as any).password;
      
      await setDoc(doc(db, 'users', user.uid), newUser);
      setCurrentUser(newUser);
      return newUser;
    } catch (error: any) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const createWalkInPatient = async (data: Partial<User>) => {
    try {
      // Generate a unique ID for the walk-in patient
      const patientId = `walkin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newPatient: User = {
        id: patientId,
        name: data.name || 'Walk-in Patient',
        email: data.email || '',
        phone: data.phone || '',
        role: 'patient',
        avatar: `https://picsum.photos/seed/${patientId}/200/200`,
        mrn: `MRN-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        ...data,
      };
      
      await setDoc(doc(db, 'users', patientId), newPatient);
      return newPatient;
    } catch (error: any) {
      console.error("Walk-in patient creation failed:", error);
      throw error;
    }
  };

  const bookAppointment = async (data: Omit<Appointment, 'id' | 'status'>) => {
    try {
      const newApt = { ...data, status: 'pending' };
      await addDoc(collection(db, 'appointments'), newApt);
      
      // Try to send email notification
      const doctor = users.find(u => u.id === data.doctorId);
      const department = departments.find(d => d.id === data.departmentId);
      const patient = users.find(u => u.id === data.patientId);
      
      if (doctor && department && patient) {
        try {
          await sendAppointmentConfirmationEmail({
            patient_name: patient.name,
            patient_email: patient.email,
            doctor_name: doctor.name,
            department: department.name,
            date: data.date,
            time: data.time
          });
        } catch (emailError) {
          console.error("Could not send email, but appointment was booked:", emailError);
          // We don't throw here because the appointment was successfully booked
        }
      }
      
      toast.success('Appointment booked successfully!');
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error('Failed to book appointment. Please try again.');
      throw error;
    }
  };

  const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    await updateDoc(doc(db, 'appointments', id), { status });
  };

  const addMedicalRecord = async (data: Omit<MedicalRecord, 'id' | 'date'>) => {
    const newRecord = { ...data, date: new Date().toISOString().split('T')[0] };
    await addDoc(collection(db, 'medicalRecords'), newRecord);
  };

  const addPrescription = async (data: Omit<Prescription, 'id' | 'date' | 'status'>) => {
    const newRx = { ...data, date: new Date().toISOString().split('T')[0], status: 'pending' };
    await addDoc(collection(db, 'prescriptions'), newRx);

    // Send email notification
    const patient = users.find(u => u.id === data.patientId);
    const doctor = users.find(u => u.id === data.doctorId);
    if (patient && patient.email && doctor) {
      try {
        await sendPrescriptionReadyEmail({
          patient_name: patient.name,
          patient_email: patient.email,
          doctor_name: doctor.name,
          date: newRx.date
        });
      } catch (error) {
        console.error("Could not send prescription email:", error);
      }
    }
  };

  const dispensePrescription = async (id: string, pharmacistId: string) => {
    await updateDoc(doc(db, 'prescriptions', id), { 
      status: 'dispensed', 
      dispensedBy: pharmacistId, 
      dispensedAt: new Date().toISOString() 
    });
  };

  const updatePrescriptionStatus = async (id: string, status: 'pending' | 'dispensed', pharmacistId?: string) => {
    const updateData: any = { status };
    if (status === 'dispensed' && pharmacistId) {
      updateData.dispensedBy = pharmacistId;
      updateData.dispensedAt = new Date().toISOString();
    }
    await updateDoc(doc(db, 'prescriptions', id), updateData);
  };

  const createAppointment = async (data: Omit<Appointment, 'id'>) => {
    await addDoc(collection(db, 'appointments'), data);
  };

  const createLabReport = async (data: Omit<LabReport, 'id'>) => {
    await addDoc(collection(db, 'labReports'), data);
  };

  const updateLabReportStatus = async (id: string, status: 'pending' | 'completed', results?: string, technicianId?: string) => {
    const updateData: any = { status };
    if (status === 'completed' && results) {
      updateData.results = results;
      updateData.completedAt = new Date().toISOString();
      if (technicianId) {
        updateData.completedBy = technicianId;
      }
    }
    await updateDoc(doc(db, 'labReports', id), updateData);
  };

  const addDoctor = async (data: Partial<User> & { password?: string }) => {
    try {
      const result = await createUserWithEmailAndPassword(secondaryAuth, data.email || '', data.password || '123456');
      const user = result.user;
      
      const newDoc: User = {
        id: user.uid,
        name: data.name || 'New Doctor', 
        email: data.email || '', 
        role: 'doctor',
        departmentId: data.departmentId, 
        specialty: data.specialty, 
        avatar: `https://picsum.photos/seed/${user.uid}/200/200`,
      };
      
      await setDoc(doc(db, 'users', user.uid), newDoc);
      // Sign out the secondary auth so it doesn't interfere
      await signOut(secondaryAuth);
    } catch (error) {
      console.error("Doctor registration failed:", error);
      throw error;
    }
  };

  const addReceptionist = async (data: Partial<User> & { password?: string }) => {
    try {
      const result = await createUserWithEmailAndPassword(secondaryAuth, data.email || '', data.password || '123456');
      const user = result.user;
      
      const newReceptionist: User = {
        id: user.uid,
        name: data.name || 'New Receptionist', 
        email: data.email || '', 
        role: 'receptionist',
        phone: data.phone,
        avatar: `https://picsum.photos/seed/${user.uid}/200/200`,
      };
      
      await setDoc(doc(db, 'users', user.uid), newReceptionist);
      await signOut(secondaryAuth);
    } catch (error) {
      console.error("Receptionist registration failed:", error);
      throw error;
    }
  };

  const addPharmacist = async (data: Partial<User> & { password?: string }) => {
    try {
      const result = await createUserWithEmailAndPassword(secondaryAuth, data.email || '', data.password || '123456');
      const user = result.user;
      
      const newPharmacist: User = {
        id: user.uid,
        name: data.name || 'New Pharmacist', 
        email: data.email || '', 
        role: 'pharmacist',
        phone: data.phone,
        avatar: `https://picsum.photos/seed/${user.uid}/200/200`,
      };
      
      await setDoc(doc(db, 'users', user.uid), newPharmacist);
      await signOut(secondaryAuth);
    } catch (error) {
      console.error("Pharmacist registration failed:", error);
      throw error;
    }
  };

  const addLabTechnician = async (data: Partial<User> & { password?: string }) => {
    try {
      const result = await createUserWithEmailAndPassword(secondaryAuth, data.email || '', data.password || '123456');
      const user = result.user;
      
      const newLabTech: User = {
        id: user.uid,
        name: data.name || 'New Lab Technician', 
        email: data.email || '', 
        role: 'lab_technician',
        phone: data.phone,
        avatar: `https://picsum.photos/seed/${user.uid}/200/200`,
      };
      
      await setDoc(doc(db, 'users', user.uid), newLabTech);
      await signOut(secondaryAuth);
    } catch (error) {
      console.error("Lab Technician registration failed:", error);
      throw error;
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!currentUser) return;
    try {
      const storageRef = ref(storage, `avatars/${currentUser.id}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'users', currentUser.id), { avatar: url });
      setCurrentUser({ ...currentUser, avatar: url });
      toast.success('Profile picture updated!');
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error('Failed to upload profile picture.');
    }
  };

  const uploadLabReport = async (file: File, patientId: string, doctorId: string, testName: string, labRequestId?: string) => {
    try {
      const storageRef = ref(storage, `lab_reports/${patientId}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      const newReport: Omit<LabReport, 'id'> = {
        patientId,
        doctorId,
        testType: testName,
        testName,
        labRequestId: labRequestId || 'manual',
        date: new Date().toISOString().split('T')[0],
        status: 'completed',
        resultData: url
      };
      
      await addDoc(collection(db, 'labReports'), newReport);
      toast.success('Lab report uploaded successfully!');

      // Send email notification
      const patient = users.find(u => u.id === patientId);
      const doctor = users.find(u => u.id === doctorId);
      if (patient && patient.email && doctor) {
        try {
          await sendLabReportReadyEmail({
            patient_name: patient.name,
            patient_email: patient.email,
            doctor_name: doctor.name,
            test_name: testName,
            date: newReport.date
          });
        } catch (emailError) {
          console.error("Could not send lab report email:", emailError);
        }
      }
    } catch (error) {
      console.error("Error uploading lab report:", error);
      toast.error('Failed to upload lab report.');
      throw error;
    }
  };

  const addDepartment = async (data: Omit<Department, 'id'>) => {
    await addDoc(collection(db, 'departments'), data);
  };

  const generateInvoice = async (data: Omit<Invoice, 'id' | 'status'>) => {
    const newInvoice = { ...data, status: 'unpaid' };
    await addDoc(collection(db, 'invoices'), newInvoice);
  };

  const payInvoice = async (id: string, method: Invoice['paymentMethod'], transactionId?: string) => {
    await updateDoc(doc(db, 'invoices', id), { 
      status: 'paid', 
      paymentMethod: method, 
      transactionId 
    });
  };

  const sendMessage = async (data: Omit<Message, 'id' | 'timestamp' | 'read'>) => {
    const newMsg = { ...data, timestamp: new Date().toISOString(), read: false };
    await addDoc(collection(db, 'messages'), newMsg);
  };

  const markMessageRead = async (id: string) => {
    await updateDoc(doc(db, 'messages', id), { read: true });
  };

  const requestLabTest = async (data: Omit<LabRequest, 'id' | 'date' | 'status'>) => {
    const newReq = { ...data, date: new Date().toISOString().split('T')[0], status: 'pending' };
    await addDoc(collection(db, 'labRequests'), newReq);
  };

  const addLabReport = async (data: Omit<LabReport, 'id' | 'date'>) => {
    const newReport = { ...data, date: new Date().toISOString().split('T')[0] };
    await addDoc(collection(db, 'labReports'), newReport);
    if (data.labRequestId) {
      await updateDoc(doc(db, 'labRequests', data.labRequestId), { status: 'completed' });
    }
  };

  const createAdminUser = async (data: Partial<User> & { password?: string }) => {
    try {
      const result = await createUserWithEmailAndPassword(secondaryAuth, data.email || '', data.password || '123456');
      const user = result.user;
      
      const newUser: User = {
        id: user.uid,
        name: data.name || user.displayName || 'New Admin',
        email: data.email || user.email || '',
        role: 'admin',
        phone: data.phone,
        avatar: user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
        ...data
      };
      // Remove password from the data saved to Firestore
      delete (newUser as any).password;
      
      await setDoc(doc(db, 'users', user.uid), newUser);
      // Sign out the secondary auth so it doesn't interfere
      await signOut(secondaryAuth);
    } catch (error) {
      console.error("Admin registration failed:", error);
      alert("Admin registration failed. Please ensure you have enabled Email/Password authentication in Firebase.");
      throw error;
    }
  };

  const updateAdminUser = async (id: string, data: Partial<User>) => {
    await updateDoc(doc(db, 'users', id), data);
  };

  const deleteUser = async (id: string) => {
    await deleteDoc(doc(db, 'users', id));
  };

  const updateDoctorSchedule = async (doctorId: string, schedules: Omit<DoctorSchedule, 'id'>[]) => {
    // First, delete existing schedules for this doctor
    const existingSchedules = doctorSchedules.filter(s => s.doctorId === doctorId);
    for (const schedule of existingSchedules) {
      await deleteDoc(doc(db, 'doctorSchedules', schedule.id));
    }
    
    // Then add the new ones
    for (const schedule of schedules) {
      await addDoc(collection(db, 'doctorSchedules'), schedule);
    }
  };

  const addBed = async (data: Omit<Bed, 'id'>) => {
    try {
      await addDoc(collection(db, 'beds'), data);
    } catch (error) {
      console.error('Failed to add bed:', error);
      throw error;
    }
  };

  const updateBed = async (id: string, data: Partial<Bed>) => {
    try {
      await updateDoc(doc(db, 'beds', id), data);
    } catch (error) {
      console.error(`Failed to update bed ${id}:`, error);
      throw error;
    }
  };

  const deleteBed = async (id: string) => {
    await deleteDoc(doc(db, 'beds', id));
  };

  const addEquipment = async (data: Omit<Equipment, 'id'>) => {
    try {
      await addDoc(collection(db, 'equipment'), data);
    } catch (error) {
      console.error('Failed to add equipment:', error);
      throw error;
    }
  };

  const updateEquipment = async (id: string, data: Partial<Equipment>) => {
    try {
      await updateDoc(doc(db, 'equipment', id), data);
    } catch (error) {
      console.error(`Failed to update equipment ${id}:`, error);
      throw error;
    }
  };

  const deleteEquipment = async (id: string) => {
    await deleteDoc(doc(db, 'equipment', id));
  };

  const bookBed = async (data: Omit<BedBooking, 'id'>) => {
    await addDoc(collection(db, 'bedBookings'), data);
    // Update bed status to occupied
    await updateDoc(doc(db, 'beds', data.bedId), { status: 'occupied', patientId: data.patientId });
  };

  const updateBedBooking = async (id: string, data: Partial<BedBooking>) => {
    await updateDoc(doc(db, 'bedBookings', id), data);
    // If status is completed, free up the bed
    if (data.status === 'completed') {
      const booking = bedBookings.find(b => b.id === id);
      if (booking) {
        await updateDoc(doc(db, 'beds', booking.bedId), { status: 'available', patientId: undefined });
      }
    }
  };

  const bookEquipment = async (data: Omit<EquipmentBooking, 'id'>) => {
    await addDoc(collection(db, 'equipmentBookings'), data);
    // Update equipment status to in_use
    await updateDoc(doc(db, 'equipment', data.equipmentId), { status: 'in_use' });
  };

  const updateEquipmentBooking = async (id: string, data: Partial<EquipmentBooking>) => {
    await updateDoc(doc(db, 'equipmentBookings', id), data);
    // If status is completed, free up the equipment
    if (data.status === 'completed') {
      const booking = equipmentBookings.find(b => b.id === id);
      if (booking) {
        await updateDoc(doc(db, 'equipment', booking.equipmentId), { status: 'available' });
      }
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser, users, departments, doctorSchedules, appointments, medicalRecords, prescriptions, invoices, labRequests, labReports, messages, beds, equipment, bedBookings, equipmentBookings, isAuthReady,
      login, logout, registerPatient, bookAppointment, updateAppointmentStatus, addMedicalRecord,
      addPrescription, dispensePrescription, updatePrescriptionStatus, createAppointment, createLabReport, updateLabReportStatus,
      addDoctor, addReceptionist, addPharmacist, addLabTechnician, addDepartment, generateInvoice, payInvoice,
      sendMessage, markMessageRead, requestLabTest, addLabReport, 
      createAdminUser, updateAdminUser, deleteUser, updateDoctorSchedule, uploadAvatar, uploadLabReport,
      addBed, updateBed, deleteBed, addEquipment, updateEquipment, deleteEquipment,
      bookBed, updateBedBooking, bookEquipment, updateEquipmentBooking
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
