import {
  Client,
  CarMake,
  CarModel,
  Car,
  InspectionType,
  WorkshopRequest,
  RequestStatus,
  PaymentType,
  Employee,
  Broker,
  Settings,
  CustomFindingCategory,
  PredefinedFinding,
  ReportBlock,
} from './types';

export const initialClients: Client[] = [
    { id: 'client-1', name: '*', phone: '0505200833' },
    { id: 'client-2', name: 'سارة خالد', phone: '0557654321' },
    { id: 'client-3', name: 'فهد عبدالعزيز', phone: '0533445566' },
    { id: 'client-4', name: 'نورة سليمان', phone: '0544556677' },
    { id: 'client-5', name: 'يوسف إبراهيم', phone: '0566778899' },
    { id: 'client-6', name: 'فاطمة أحمد', phone: '0588990011' },
    { id: 'client-7', name: 'خالد الغامدي', phone: '0599001122' },
];

export const initialCarMakes: CarMake[] = [
    { id: 'make-1', nameAr: 'تويوتا', nameEn: 'Toyota' },
    { id: 'make-2', nameAr: 'هيونداي', nameEn: 'Hyundai' },
    { id: 'make-3', nameAr: 'فورد', nameEn: 'Ford' },
    { id: 'make-4', nameAr: 'نيسان', nameEn: 'Nissan' },
    { id: 'make-5', nameAr: 'مرسيدس-بنز', nameEn: 'Mercedes-Benz' },
    { id: 'make-6', nameAr: 'كيا', nameEn: 'KIA' },
    { id: 'make-honda', nameAr: 'هوندا', nameEn: 'Honda' },
];

export const initialCarModels: CarModel[] = [
    { id: 'model-1', makeId: 'make-1', nameAr: 'كامري', nameEn: 'Camry' },
    { id: 'model-2', makeId: 'make-1', nameAr: 'كورولا', nameEn: 'Corolla' },
    { id: 'model-13', makeId: 'make-1', nameAr: 'لاندكروزر', nameEn: 'Land Cruiser' },
    { id: 'model-3', makeId: 'make-2', nameAr: 'إلنترا', nameEn: 'Elantra' },
    { id: 'model-4', makeId: 'make-2', nameAr: 'أكسنت', nameEn: 'Accent' },
    { id: 'model-14', makeId: 'make-2', nameAr: 'توسان', nameEn: 'Tucson' },
    { id: 'model-5', makeId: 'make-3', nameAr: 'تورس', nameEn: 'Taurus' },
    { id: 'model-15', makeId: 'make-3', nameAr: 'إكسبلورر', nameEn: 'Explorer' },
    { id: 'model-6', makeId: 'make-4', nameAr: 'صني', nameEn: 'Sunny' },
    { id: 'model-7', makeId: 'make-4', nameAr: 'باترول', nameEn: 'Patrol' },
    { id: 'model-8', makeId: 'make-5', nameAr: 'الفئة E', nameEn: 'E-Class' },
    { id: 'model-9', makeId: 'make-5', nameAr: 'الفئة S', nameEn: 'S-Class' },
    { id: 'model-10', makeId: 'make-6', nameAr: 'ريو', nameEn: 'Rio' },
    { id: 'model-11', makeId: 'make-6', nameAr: 'سبورتاج', nameEn: 'Sportage' },
    { id: 'model-honda-accord', makeId: 'make-honda', nameAr: 'أكورد', nameEn: 'Accord' },
];

export const initialCars: Car[] = [
    { id: 'car-1', makeId: 'make-honda', modelId: 'model-honda-accord', year: 2021, plateNumber: 'LJR 2044' },
    { id: 'car-2', makeId: 'make-2', modelId: 'model-3', year: 2023, plateNumber: 'ح ك ل ٥٦٧٨' },
    { id: 'car-3', makeId: 'make-3', modelId: 'model-5', year: 2021, plateNumber: 'س ع د ٩٠١٢' },
    { id: 'car-4', makeId: 'make-4', modelId: 'model-7', year: 2024, plateNumber: 'م ط ر ٣٤٥٦' },
    { id: 'car-5', makeId: 'make-5', modelId: 'model-8', year: 2022, plateNumber: 'ق ن ف ٧٨٩٠' },
    { id: 'car-6', makeId: 'make-6', modelId: 'model-11', year: 2023, plateNumber: 'هـ و ي ١١٢٢' },
    { id: 'car-7', makeId: 'make-1', modelId: 'model-13', year: 2023, plateNumber: 'ر ك ب ٣٣٤٤' },
];

export const initialCustomFindingCategories: CustomFindingCategory[] = [
    { id: 'cat-1', name: 'البودي الخارجي' },
    { id: 'cat-2', name: 'المحرك' },
    { id: 'cat-3', name: 'نظام التعليق' },
    { id: 'cat-4', name: 'نظام الفرامل' },
    { id: 'cat-5', name: 'الإطارات' },
    { id: 'cat-6', name: 'الشاصيه' },
];

export const initialPredefinedFindings: PredefinedFinding[] = [
    { id: 'find-1', categoryId: 'cat-1', name: 'الصدام الأمامي', nameEn: 'Front Bumper', options: ['سليم', 'مرشوش', 'معجون', 'تالف'], referenceImage: 'https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png' },
    { id: 'find-2', categoryId: 'cat-1', name: 'الرفرف الأمامي يمين', nameEn: 'Front Right Fender', options: ['سليم', 'مرشوش', 'معجون', 'تالف'], referenceImage: 'https://i.imgur.com/g65a12B.png' },
    { id: 'find-10', categoryId: 'cat-1', name: 'السقف', nameEn: 'Roof', options: ['سليم', 'مرشوش', 'متأثر بضربات برد', 'تالف'] },
    { id: 'find-11', categoryId: 'cat-1', name: 'باب السائق', nameEn: 'Driver Door', options: ['سليم', 'مرشوش', 'معجون', 'تالف'] },
    { id: 'find-3', categoryId: 'cat-2', name: 'تهريب زيت المحرك', nameEn: 'Engine Oil Leak', options: ['لا يوجد', 'يوجد تسريب', 'يوجد ترشيح'] },
    { id: 'find-12', categoryId: 'cat-2', name: 'مستوى زيت المحرك', nameEn: 'Engine Oil Level', options: ['طبيعي', 'ناقص', 'زائد'] },
    { id: 'find-13', categoryId: 'cat-2', name: 'حالة البطارية', nameEn: 'Battery Condition', options: ['جيدة', 'ضعيفة', 'تالفة'] },
    { id: 'find-14', categoryId: 'cat-3', name: 'المساعدات الأمامية', nameEn: 'Front Shock Absorbers', options: ['جيدة', 'تحتاج تغيير', 'مهربة زيت'] },
    { id: 'find-15', categoryId: 'cat-3', name: 'المساعدات الخلفية', nameEn: 'Rear Shock Absorbers', options: ['جيدة', 'تحتاج تغيير', 'مهربة زيت'] },
    { id: 'find-4', categoryId: 'cat-4', name: 'فحص زيت الفرامل', nameEn: 'Brake Fluid Check', options: ['جيد', 'يحتاج تغيير'] },
    { id: 'find-5', categoryId: 'cat-4', name: 'حالة الهوبات', nameEn: 'Rotor Condition', options: ['جيدة', 'تحتاج خرط', 'تحتاج تغيير'] },
    { id: 'find-6', categoryId: 'cat-4', name: 'حالة الأقمشة', nameEn: 'Brake Pad Condition', options: ['جيدة', 'نصف عمر', 'تحتاج تغيير'] },
    { id: 'find-7', categoryId: 'cat-5', name: 'الإطار الأمامي يمين', nameEn: 'Front Right Tire', options: ['جديد', 'جيد', 'نصف عمر', 'ممسوح'] },
    { id: 'find-8', categoryId: 'cat-5', name: 'الإطار الخلفي يسار', nameEn: 'Rear Left Tire', options: ['جديد', 'جيد', 'نصف عمر', 'ممسوح'] },
    { id: 'find-9', categoryId: 'cat-6', name: 'ضربة شاصي أمامي', nameEn: 'Front Chassis Damage', options: ['لا يوجد', 'يوجد'] },
];

export const initialInspectionTypes: InspectionType[] = [
    { id: 'insp-1', name: 'Complete Diagnosis', price: 500, fields: [], findingCategoryIds: ['cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-5', 'cat-6'] },
    { id: 'insp-2', name: 'فحص كمبيوتر', price: 150, fields: [], findingCategoryIds: [] },
    { id: 'insp-3', name: 'فحص بودي وشاصيه', price: 250, fields: [], findingCategoryIds: ['cat-1', 'cat-6'] },
];

export const initialRequests: WorkshopRequest[] = [
    {
      id: 'req-1',
      requestNumber: 52377,
      clientId: 'client-1',
      carId: 'car-1',
      inspectionTypeId: 'insp-1',
      paymentType: PaymentType.Card,
      price: 500,
      status: RequestStatus.Completed,
      createdAt: '2025-10-23T18:46:00.000Z',
      employeeId: 'employee',
      inspectionData: {},
      generalNotes: [
        { id: 'gn-1', text: 'كهرباء ايرباك يسار مفصول + مقاومة في فيش حزام يسار' },
        { id: 'gn-2', text: 'تشيك نظام لمبة ايرباك' },
        { id: 'gn-3', text: 'ضربة على الكمر الأمامي مغير + ضربة على كفر يمين' },
        { id: 'gn-4', text: 'صاجة هوب يمين لا توجد' },
        { id: 'gn-5', text: 'ضربات اسفل البدي + كسر على البطانات' },
      ],
      categoryNotes: {
        'cat-2': [
          {
            id: 'cat-note-2',
            text: 'حالة المحرك نظيفة ولا توجد ترشيحات واضحة للزيت.',
            image: 'https://images.pexels.com/photos/4488651/pexels-photo-4488651.jpeg?auto=compress&cs=tinysrgb&w=600'
          }
        ],
      },
      structuredFindings: [
        { findingId: 'find-2', findingName: 'الرفرف الأمامي يمين', value: 'سليم', categoryId: 'cat-1' },
        { findingId: 'find-3', findingName: 'تهريب زيت المحرك', value: 'يوجد ترشيح', categoryId: 'cat-2' },
        { findingId: 'find-7', findingName: 'الإطار الأمامي يمين', value: 'جيد', categoryId: 'cat-5' }
      ]
    },
    {
      id: 'req-2',
      requestNumber: 1002,
      clientId: 'client-2',
      carId: 'car-2',
      inspectionTypeId: 'insp-3',
      paymentType: PaymentType.Unpaid,
      price: 250,
      status: RequestStatus.New,
      createdAt: new Date().toISOString(),
      employeeId: 'admin',
      inspectionData: {},
    },
    {
        id: 'req-3',
        requestNumber: 1003,
        clientId: 'client-3',
        carId: 'car-3',
        inspectionTypeId: 'insp-1',
        paymentType: PaymentType.Cash,
        price: 500,
        status: RequestStatus.Completed,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // yesterday
        employeeId: 'manager',
        inspectionData: {},
        generalNotes: [{id: 'gn-3', text: 'تم تغيير الإطارات حديثاً.'}],
        structuredFindings: [
            { findingId: 'find-1', findingName: 'الصدام الأمامي', value: 'سليم', categoryId: 'cat-1' },
            { findingId: 'find-3', findingName: 'تهريب زيت المحرك', value: 'لا يوجد', categoryId: 'cat-2' },
            { findingId: 'find-6', findingName: 'حالة الأقمشة', value: 'نصف عمر', categoryId: 'cat-4' },
            { findingId: 'find-7', findingName: 'الإطار الأمامي يمين', value: 'جديد', categoryId: 'cat-5' },
        ],
        broker: { id: 'broker-1', commission: 50 }
    },
    {
        id: 'req-4',
        requestNumber: 1004,
        clientId: 'client-4',
        carId: 'car-4',
        inspectionTypeId: 'insp-1',
        paymentType: PaymentType.Card,
        price: 500,
        status: RequestStatus.InProgress,
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        employeeId: 'employee',
        inspectionData: {},
        structuredFindings: [
            { findingId: 'find-1', findingName: 'الصدام الأمامي', value: 'مرشوش', categoryId: 'cat-1' },
        ]
    },
    {
        id: 'req-5',
        requestNumber: 1005,
        clientId: 'client-5',
        carId: 'car-5',
        inspectionTypeId: 'insp-2',
        paymentType: PaymentType.Unpaid,
        price: 150,
        status: RequestStatus.New,
        createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        employeeId: 'admin',
        inspectionData: {},
    },
    {
        id: 'req-6',
        requestNumber: 1006,
        clientId: 'client-6',
        carId: 'car-6',
        inspectionTypeId: 'insp-3',
        paymentType: PaymentType.Cash,
        price: 250,
        status: RequestStatus.Completed,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
        employeeId: 'manager',
        inspectionData: {},
        generalNotes: [{id: 'gn-6', text: 'مكيف السيارة ضعيف ويحتاج فحص فريون.'}],
        categoryNotes: { 'cat-1': [{id: 'cn-6-1', text: 'رش تجميلي للباب الخلفي الأيمن بدون حوادث.'}] },
        structuredFindings: [
            { findingId: 'find-1', findingName: 'الصدام الأمامي', value: 'سليم', categoryId: 'cat-1' },
            { findingId: 'find-9', findingName: 'ضربة شاصي أمامي', value: 'لا يوجد', categoryId: 'cat-6' }
        ]
    },
    {
        id: 'req-7',
        requestNumber: 1007,
        clientId: 'client-7',
        carId: 'car-7',
        inspectionTypeId: 'insp-1',
        paymentType: PaymentType.Card,
        price: 500,
        status: RequestStatus.Completed,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
        employeeId: 'employee',
        inspectionData: {},
        structuredFindings: [
            { findingId: 'find-1', findingName: 'الصدام الأمامي', value: 'تالف', categoryId: 'cat-1' },
            { findingId: 'find-2', findingName: 'الرفرف الأمامي يمين', value: 'معجون', categoryId: 'cat-1' },
            { findingId: 'find-3', findingName: 'تهريب زيت المحرك', value: 'يوجد تسريب', categoryId: 'cat-2' },
            { findingId: 'find-6', findingName: 'حالة الأقمشة', value: 'تحتاج تغيير', categoryId: 'cat-4' },
            { findingId: 'find-8', findingName: 'الإطار الخلفي يسار', value: 'ممسوح', categoryId: 'cat-5' },
            { findingId: 'find-9', findingName: 'ضربة شاصي أمامي', value: 'يوجد', categoryId: 'cat-6' }
        ],
        broker: { id: 'broker-1', commission: 70 }
    },
    {
        id: 'req-8',
        requestNumber: 1008,
        clientId: 'client-1',
        carId: 'car-2',
        inspectionTypeId: 'insp-1',
        paymentType: PaymentType.Unpaid,
        price: 450,
        status: RequestStatus.InProgress,
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
        employeeId: 'employee',
        inspectionData: {},
    },
    {
        id: 'req-9',
        requestNumber: 1009,
        clientId: 'client-3',
        carId: 'car-4',
        inspectionTypeId: 'insp-3',
        paymentType: PaymentType.Cash,
        price: 250,
        status: RequestStatus.Completed,
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
        employeeId: 'manager',
        inspectionData: {},
        generalNotes: [{id: 'gn-9', text: 'لا يوجد ملاحظات تذكر.'}],
        structuredFindings: [
             { findingId: 'find-1', findingName: 'الصدام الأمامي', value: 'سليم', categoryId: 'cat-1' },
             { findingId: 'find-11', findingName: 'باب السائق', value: 'سليم', categoryId: 'cat-1' },
             { findingId: 'find-9', findingName: 'ضربة شاصي أمامي', value: 'لا يوجد', categoryId: 'cat-6' }
        ]
    },
    {
        id: 'req-10',
        requestNumber: 1010,
        clientId: 'client-5',
        carId: 'car-6',
        inspectionTypeId: 'insp-1',
        paymentType: PaymentType.Card,
        price: 500,
        status: RequestStatus.Completed,
        createdAt: new Date(Date.now() - 86400000 * 12).toISOString(), // 12 days ago
        employeeId: 'admin',
        inspectionData: {},
        categoryNotes: { 'cat-5': [{id: 'cn-10-1', text: 'يُنصح بتغيير الإطارات خلال 6 أشهر.', image: 'https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png'}] },
        structuredFindings: [
            { findingId: 'find-3', findingName: 'تهريب زيت المحرك', value: 'لا يوجد', categoryId: 'cat-2' },
            { findingId: 'find-6', findingName: 'حالة الأقمشة', value: 'جيدة', categoryId: 'cat-4' },
            { findingId: 'find-7', findingName: 'الإطار الأمامي يمين', value: 'نصف عمر', categoryId: 'cat-5' },
        ]
    },
];

export const initialEmployees: Employee[] = [
    { 
      id: 'admin', 
      name: 'المدير العام', 
      isGeneralManager: true, 
      permissions: { canCreateRequests: true, canManageClients: true, canViewReports: true, canAccessSettings: true },
      username: 'admin', 
      password: 'admin123', 
      profilePictureUrl: '' 
    },
    { 
      id: 'manager', 
      name: 'مدير الوردية', 
      isGeneralManager: false,
      permissions: { canCreateRequests: true, canManageClients: true, canViewReports: true, canAccessSettings: false },
      username: 'manager', 
      password: 'manager123', 
      profilePictureUrl: '' 
    },
    { 
      id: 'employee', 
      name: 'موظف فحص', 
      isGeneralManager: false,
      permissions: { canCreateRequests: true, canManageClients: false, canViewReports: false, canAccessSettings: false },
      username: 'employee', 
      password: 'emp123', 
      profilePictureUrl: '' 
    },
];

export const initialBrokers: Broker[] = [
    { id: 'broker-1', brokerNumber: 1, name: 'سمسار الخير', phone: '0598765432', defaultCommission: 50, isActive: true },
    { id: 'broker-2', brokerNumber: 2, name: 'سمسار آخر', phone: '0512345678', defaultCommission: 75, isActive: false },
];


const defaultReportTemplate: ReportBlock[] = [
    {
        id: 'header-new',
        type: 'HEADER',
        properties: {
            showAppName: true,
            showLogo: true,
            headerText: 'تقرير فحص المركبة\nVehicle Inspection Report',
            styles: { textAlign: 'right', padding: '0 0 16px 0', borderWidth: '0 0 2 0', borderStyle: 'solid', borderColor: '#1E3A8A' }
        }
    },
    { id: 'spacer-1', type: 'SPACER', properties: { height: 20 } },
    {
        id: 'request-info-grid',
        type: 'DATA_GRID',
        properties: {
            title: 'معلومات التقرير والعميل',
            titleStyles: { fontSize: '18px', fontWeight: 'bold', color: '#1E3A8A', margin: '0 0 16px 0', padding: '0 0 8px 0', borderWidth: '0 0 1 0', borderStyle: 'solid', borderColor: '#D1D5DB' },
            containerHeight: 90,
            gridFields: [
                { key: 'requestNumber', label: 'رقم التقرير:', showLabel: true, showValue: true, labelPart: { x: 670, y: 0, width: 90, height: 25, styles: { textAlign: 'right', fontWeight: 'bold'} }, valuePart: { x: 500, y: 0, width: 170, height: 25, styles: { textAlign: 'right'} } },
                { key: 'date', label: 'التاريخ:', showLabel: true, showValue: true, labelPart: { x: 670, y: 30, width: 90, height: 25, styles: { textAlign: 'right', fontWeight: 'bold'} }, valuePart: { x: 450, y: 30, width: 220, height: 25, styles: { textAlign: 'right'} } },
                { key: 'employeeName', label: 'الفاحص:', showLabel: true, showValue: true, labelPart: { x: 670, y: 60, width: 90, height: 25, styles: { textAlign: 'right', fontWeight: 'bold'} }, valuePart: { x: 500, y: 60, width: 170, height: 25, styles: { textAlign: 'right'} } },
                { key: 'clientName', label: 'اسم العميل:', showLabel: true, showValue: true, labelPart: { x: 300, y: 0, width: 100, height: 25, styles: { textAlign: 'right', fontWeight: 'bold'} }, valuePart: { x: 50, y: 0, width: 250, height: 25, styles: { textAlign: 'right'} } },
                { key: 'clientPhone', label: 'رقم الهاتف:', showLabel: true, showValue: true, labelPart: { x: 300, y: 30, width: 100, height: 25, styles: { textAlign: 'right', fontWeight: 'bold'} }, valuePart: { x: 50, y: 30, width: 250, height: 25, styles: { textAlign: 'right'} } },
            ],
            styles: { borderWidth: '1', borderStyle: 'solid', borderColor: '#E5E7EB', padding: '16px', borderRadius: '8' }
        }
    },
    { id: 'spacer-2', type: 'SPACER', properties: { height: 20 } },
    {
        id: 'vehicle-info-grid',
        type: 'DATA_GRID',
        properties: {
            title: 'بيانات المركبة',
            titleStyles: { fontSize: '18px', fontWeight: 'bold', color: '#1E3A8A', margin: '0 0 16px 0', padding: '0 0 8px 0', borderWidth: '0 0 1 0', borderStyle: 'solid', borderColor: '#D1D5DB' },
            containerHeight: 60,
            carNameLanguage: 'both',
            gridFields: [
                { key: ['make', 'model', 'year'], label: 'المركبة:', showLabel: true, showValue: true, labelPart: { x: 650, y: 0, width: 110, height: 40, styles: { textAlign: 'right', fontWeight: 'bold'} }, valuePart: { x: 250, y: 0, width: 400, height: 40, styles: { textAlign: 'right'} } },
                { key: 'plate', label: 'اللوحة/الشاصي:', showLabel: true, showValue: true, labelPart: { x: 200, y: 0, width: 150, height: 40, styles: { textAlign: 'right', fontWeight: 'bold'} }, valuePart: { x: 10, y: 0, width: 190, height: 40, styles: { textAlign: 'right'} } },
            ],
            styles: { borderWidth: '1', borderStyle: 'solid', borderColor: '#E5E7EB', padding: '16px', borderRadius: '8' }
        }
    },
    { id: 'spacer-3', type: 'SPACER', properties: { height: 20 } },
    {
        id: 'findings-summary',
        type: 'FINDINGS_SUMMARY',
        properties: {
            summaryTitle: 'ملخص أهم الملاحظات',
            criticalValues: ['تالف', 'يوجد', 'يوجد تسريب', 'تحتاج تغيير', 'ممسوح', 'معجون']
        }
    },
    { id: 'spacer-4', type: 'SPACER', properties: { height: 10 } },
    {
        id: 'main-findings-table',
        type: 'FINDINGS_TABLE',
        properties: {
            findingCategoryId: 'ALL', 
            findingLayout: 'cards',
            imageVisibility: true,
            imageSize: 'medium',
            imagePosition: 'left',
            showFindingIcons: true,
            iconsByValue: [
                { value: 'سليم', icon: 'check-circle-solid', color: '#16A34A' },
                { value: 'جديد', icon: 'check-circle-solid', color: '#16A34A' },
                { value: 'جيدة', icon: 'check-circle-solid', color: '#16A34A' },
                { value: 'جيد', icon: 'check-circle-solid', color: '#16A34A' },
                { value: 'لا يوجد', icon: 'check-circle-solid', color: '#16A34A' },
                { value: 'طبيعي', icon: 'check-circle-solid', color: '#16A34A' },
                { value: 'تالف', icon: 'x-circle-solid', color: '#DC2626' },
                { value: 'تالفة', icon: 'x-circle-solid', color: '#DC2626' },
                { value: 'يوجد', icon: 'x-circle-solid', color: '#DC2626' },
                { value: 'يوجد تسريب', icon: 'x-circle-solid', color: '#DC2626' },
                { value: 'تحتاج تغيير', icon: 'x-circle-solid', color: '#DC2626' },
                { value: 'ممسوح', icon: 'x-circle-solid', color: '#DC2626' },
                { value: 'مرشوش', icon: 'exclamation-triangle-solid', color: '#F59E0B' },
                { value: 'معجون', icon: 'exclamation-triangle-solid', color: '#F59E0B' },
                { value: 'نصف عمر', icon: 'exclamation-triangle-solid', color: '#F59E0B' },
                { value: 'يوجد ترشيح', icon: 'exclamation-triangle-solid', color: '#F59E0B' },
                { value: 'ناقص', icon: 'exclamation-triangle-solid', color: '#F59E0B' },
                { value: 'ضعيفة', icon: 'exclamation-triangle-solid', color: '#F59E0B' },
            ],
            styles: { borderColor: '#E5E7EB' }
        }
    },
    { id: 'spacer-5', type: 'SPACER', properties: { height: 10 } },
    { id: 'page-break-1', type: 'PAGE_BREAK', properties: {} },
    { id: 'spacer-6', type: 'SPACER', properties: { height: 20 } },
    {
        id: 'general-notes-title',
        type: 'SECTION_TITLE',
        properties: { text: 'ملاحظات عامة', styles: { fontSize: '18px', fontWeight: 'bold', color: '#1E3A8A', margin: '0 0 8px 0' } }
    },
    {
        id: 'general-notes',
        type: 'NOTES',
        properties: {
            noteType: 'general',
            styles: { borderWidth: '1', borderStyle: 'solid', borderColor: '#E5E7EB', padding: '12px', borderRadius: '8' }
        }
    },
    { id: 'spacer-7', type: 'SPACER', properties: { height: 50 } },
    {
        id: 'signatures',
        type: 'SIGNATURES',
        properties: {
            numSignatures: 2,
            signatureTitles: ['توقيع الفاحص', 'توقيع العميل']
        }
    }
];

export const initialSettings: Settings = {
    appName: 'ورشة الفحص الفني',
    logoUrl: '',
    plateCharacters: [
        { ar: 'ا', en: 'A' }, { ar: 'ب', en: 'B' }, { ar: 'ح', en: 'J' }, { ar: 'د', en: 'D' },
        { ar: 'ر', en: 'R' }, { ar: 'س', en: 'S' }, { ar: 'ص', en: 'X' }, { ar: 'ط', en: 'T' },
        { ar: 'ع', en: 'E' }, { ar: 'ق', en: 'G' }, { ar: 'ك', en: 'K' }, { ar: 'ل', en: 'L' },
        { ar: 'م', en: 'Z' }, { ar: 'ن', en: 'N' }, { ar: 'هـ', en: 'H' }, { ar: 'و', en: 'U' },
        { ar: 'ى', en: 'V' },
    ],
    platePreviewSettings: {
        backgroundColor: '#FFFFFF',
        borderColor: '#000000',
        fontColor: '#000000',
        fontFamily: "'Courier New', monospace",
        fontSize: '32px',
        letterSpacing: '4px',
        separatorImageUrl: '',
        separatorWidth: 'auto',
        separatorHeight: '40px',
    },
    reportPageSettings: {
        marginTop: 20,
        marginRight: 20,
        marginBottom: 20,
        marginLeft: 20,
    },
    reportTemplate: defaultReportTemplate
};