export interface InstructorType {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  specializations: string[];
  hourlyRate: number;
  maxStudents: number;
  status: string;
  notes?: string;
  matricule: string;
  fonction: string;
  birthDate: string;
  birthPlace: string;
  document: string;
  photo: string;
} 