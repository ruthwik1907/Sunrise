/// <reference types="vite/client" />
import emailjs from '@emailjs/browser';

// To use this service, you need to create an account at https://www.emailjs.com/
// 1. Create a service (e.g., Gmail)
// 2. Create an email template with variables like {{patient_name}}, {{doctor_name}}, {{date}}, {{time}}, {{department}}
// 3. Get your Public Key from Account -> API Keys
// 4. Update the IDs below or set them in your .env file

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'default_service';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'default_template';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'default_public_key';

export interface AppointmentEmailParams {
  patient_name: string;
  patient_email: string;
  doctor_name: string;
  department: string;
  date: string;
  time: string;
}

export interface LabReportEmailParams {
  patient_name: string;
  patient_email: string;
  doctor_name: string;
  test_name: string;
  date: string;
}

export interface PrescriptionEmailParams {
  patient_name: string;
  patient_email: string;
  doctor_name: string;
  date: string;
}

export const sendAppointmentConfirmationEmail = async (params: AppointmentEmailParams) => {
  // If keys are not configured, we just log it to simulate the email sending
  if (EMAILJS_SERVICE_ID === 'default_service') {
    console.log('📧 [Email Simulation] Appointment Confirmation Email would be sent with:', params);
    console.log('To enable real emails, configure your EmailJS credentials in .env');
    return Promise.resolve(true);
  }

  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_email: params.patient_email,
        patient_name: params.patient_name,
        doctor_name: params.doctor_name,
        department: params.department,
        date: params.date,
        time: params.time,
      },
      EMAILJS_PUBLIC_KEY
    );
    return response.status === 200;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};

export const sendLabReportReadyEmail = async (params: LabReportEmailParams) => {
  if (EMAILJS_SERVICE_ID === 'default_service') {
    console.log('📧 [Email Simulation] Lab Report Ready Email would be sent with:', params);
    return Promise.resolve(true);
  }

  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_LAB_TEMPLATE_ID || 'default_lab_template',
      {
        to_email: params.patient_email,
        patient_name: params.patient_name,
        doctor_name: params.doctor_name,
        test_name: params.test_name,
        date: params.date,
      },
      EMAILJS_PUBLIC_KEY
    );
    return response.status === 200;
  } catch (error) {
    console.error('Failed to send lab report email:', error);
    throw error;
  }
};

export const sendPrescriptionReadyEmail = async (params: PrescriptionEmailParams) => {
  if (EMAILJS_SERVICE_ID === 'default_service') {
    console.log('📧 [Email Simulation] Prescription Ready Email would be sent with:', params);
    return Promise.resolve(true);
  }

  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_RX_TEMPLATE_ID || 'default_rx_template',
      {
        to_email: params.patient_email,
        patient_name: params.patient_name,
        doctor_name: params.doctor_name,
        date: params.date,
      },
      EMAILJS_PUBLIC_KEY
    );
    return response.status === 200;
  } catch (error) {
    console.error('Failed to send prescription email:', error);
    throw error;
  }
};
