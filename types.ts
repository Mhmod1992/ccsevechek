

export interface Notification {
  id: string;
  type: 'success' | 'error';
  title: string;
  message: string;
}

export type Page = 'dashboard' | 'requests' | 'new-request' | 'fill-request' | 'print-report' | 'report-preview' | 'clients' | 'reports' | 'settings';
export type SettingsPage = 'general' | 'request' | 'brokers' | 'employees' | 'report-template';

export enum RequestStatus {
  New = 'جديد',
  InProgress = 'قيد التنفيذ',
  Completed = 'مكتمل',
}

export enum PaymentType {
  Unpaid = 'لم يدفع',
  Card = 'بطاقة',
  Cash = 'كاش',
}

export interface Client {
  id: string;
  name: string;
  phone: string;
}

export interface CarMake {
  id: string;
  nameAr: string;
  nameEn: string;
}

export interface CarModel {
  id: string;
  makeId: string;
  nameAr: string;
  nameEn: string;
  category?: string;
}

export interface Car {
  id: string;
  makeId: string;
  modelId: string;
  year: number;
  plateNumber: string;
}

export interface Note {
    id: string;
    text: string;
    image?: string;
}

export interface StructuredFinding {
    findingId: string;
    findingName: string;

    value: string;
    categoryId: string;
}

export interface WorkshopRequest {
  id: string;
  requestNumber: number;
  clientId: string;
  carId: string;
  inspectionTypeId: string;
  paymentType: PaymentType;
  price: number;
  status: RequestStatus;
  createdAt: string;
  employeeId: string;
  inspectionData: Record<string, any>;
  generalNotes?: Note[];
  structuredFindings?: StructuredFinding[];
  categoryNotes?: Record<string, Note[]>;
  broker?: {
    id: string;
    commission: number;
  };
}

export interface EmployeePermissions {
  canCreateRequests: boolean;
  canManageClients: boolean;
  canViewReports: boolean;
  canAccessSettings: boolean;
}

export interface Employee {
  id: string;
  name: string;
  isGeneralManager: boolean;
  permissions: EmployeePermissions;
  username: string;
  password?: string;
  profilePictureUrl?: string;
}


export interface Broker {
  id: string;
  brokerNumber: number;
  name: string;
  phone: string;
  defaultCommission: number;
  isActive: boolean;
}

export interface CustomFindingCategory {
    id: string;
    name: string;
}

export interface PredefinedFinding {
    id: string;
    categoryId: string;
    name: string;
    nameEn: string;
    options: string[];
    referenceImage?: string;
}

export interface InspectionType {
  id: string;
  name: string;
  price: number;
  fields: any[];
  findingCategoryIds: string[];
}

// NEW types for the report builder
export interface StyleProperties {
  color?: string;
  backgroundColor?: string;
  fontSize?: string; // e.g., '16px'
  fontWeight?: 'normal' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
  fontFamily?: string;
  padding?: string; // e.g., '8px'
  margin?: string;
  borderWidth?: string; // e.g., '1px' or '0 0 2px 0'
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  borderColor?: string;
  borderRadius?: string; // e.g., '8px'
}

export type ReportBlockType =
  | 'HEADER'
  | 'SPACER'
  | 'DATA_GRID'
  | 'SECTION_TITLE'
  | 'FINDINGS_TABLE'
  | 'FINDINGS_SUMMARY'
  | 'NOTES'
  | 'DISCLAIMER'
  | 'SIGNATURES'
  | 'CUSTOM_TEXT'
  | 'IMAGE'
  | 'DIVIDER'
  | 'PAGE_BREAK';

export type DataFieldKey = 'requestNumber' | 'date' | 'clientName' | 'clientPhone' | 'price' | 'make' | 'model' | 'year' | 'plate' | 'inspectionType' | 'employeeName';

export type FindingLayout = 'table' | 'cards';
export type ImagePosition = 'top' | 'bottom' | 'left' | 'right';
export type ImageSize = 'small' | 'medium' | 'large';

export interface DataGridFieldPart {
    x: number;
    y: number;
    width: number;
    height: number;
    styles: StyleProperties;
}

export interface DataGridField {
    key: DataFieldKey | DataFieldKey[];
    label: string; // The text of the label
    showLabel: boolean;
    showValue: boolean;
    labelPart: DataGridFieldPart;
    valuePart: DataGridFieldPart;
}

export interface ReportBlock {
  id: string;
  type: ReportBlockType;
  properties: {
    // Common properties
    styles?: StyleProperties;
    width?: number; // width in %
    height?: number; // height in px (for blocks with dynamic height)

    // Type-specific properties
    text?: string; // For SECTION_TITLE, CUSTOM_TEXT, DISCLAIMER
    // height for SPACER is now in the main height property
    imageUrl?: string; // For IMAGE
    
    // DATA_GRID (New free-form structure)
    title?: string;
    titleStyles?: StyleProperties;
    containerHeight?: number; // in pixels
    gridFields?: DataGridField[];
    carNameLanguage?: 'ar' | 'en' | 'both';

    noteType?: 'general' | string; // 'general' or a categoryId for NOTES
    numSignatures?: 1 | 2 | 3; // for SIGNATURES
    signatureTitles?: [string, string?, string?]; // for SIGNATURES
    
    // FINDINGS_TABLE (Enhanced)
    findingCategoryId?: 'ALL' | string; 
    findingLayout?: FindingLayout;
    imageVisibility?: boolean;
    imageSize?: ImageSize;
    imagePosition?: ImagePosition;
    showFindingIcons?: boolean;
    iconsByValue?: { value: string; icon: string; color: string; }[];

    // FINDINGS_SUMMARY
    summaryTitle?: string;
    criticalValues?: string[];
    
    // HEADER
    headerText?: string;
    showLogo?: boolean;
    showAppName?: boolean;
    footerText?: string;
  };
}

export interface Settings {
  appName: string;
  logoUrl: string;
  plateCharacters: { ar: string; en: string }[];
  platePreviewSettings: {
    backgroundColor: string;
    borderColor: string;
    fontColor: string;
    fontFamily: string;
    fontSize: string;
    letterSpacing: string;
    separatorImageUrl: string;
    separatorWidth: string;
    separatorHeight: string;
  };
  reportPageSettings: {
    marginTop: number; // in mm
    marginRight: number; // in mm
    marginBottom: number; // in mm
    marginLeft: number; // in mm
  };
  reportTemplate: ReportBlock[];
}