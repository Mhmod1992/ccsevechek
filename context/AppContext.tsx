import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Page, SettingsPage, Client, CarMake, CarModel, Car, InspectionType, WorkshopRequest, Employee, Broker, Settings, CustomFindingCategory, PredefinedFinding, DataFieldKey, DataGridField, Notification } from '../types.ts';
import { initialClients, initialCarMakes, initialCarModels, initialCars, initialInspectionTypes, initialRequests, initialEmployees, initialBrokers, initialSettings, initialCustomFindingCategories, initialPredefinedFindings } from '../constants.ts';
import useLocalStorage from '../hooks/useLocalStorage.ts';
import { v4 as uuidv4 } from 'uuid';

// A deep merge utility to ensure settings from localStorage are hydrated with new defaults
function isObject(item: any) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

function mergeDeep(target: any, source: any) {
    let output = { ...target };
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target))
                    Object.assign(output, { [key]: source[key] });
                else
                    output[key] = mergeDeep(target[key], source[key]);
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
}

interface ConfirmModalOptions {
    title: string;
    message: string;
    onConfirm: () => void;
}

interface AppContextType {
  page: Page;
  setPage: (page: Page) => void;
  settingsPage: SettingsPage;
  setSettingsPage: (page: SettingsPage) => void;
  selectedRequestId: string | null;
  setSelectedRequestId: (id: string | null) => void;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  addClient: (client: Client) => void;
  carMakes: CarMake[];
  setCarMakes: React.Dispatch<React.SetStateAction<CarMake[]>>;
  carModels: CarModel[];
  setCarModels: React.Dispatch<React.SetStateAction<CarModel[]>>;
  cars: Car[];
  setCars: React.Dispatch<React.SetStateAction<Car[]>>;
  inspectionTypes: InspectionType[];
  setInspectionTypes: React.Dispatch<React.SetStateAction<InspectionType[]>>;
  requests: WorkshopRequest[];
  setRequests: React.Dispatch<React.SetStateAction<WorkshopRequest[]>>;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  brokers: Broker[];
  setBrokers: React.Dispatch<React.SetStateAction<Broker[]>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  customFindingCategories: CustomFindingCategory[];
  setCustomFindingCategories: React.Dispatch<React.SetStateAction<CustomFindingCategory[]>>;
  predefinedFindings: PredefinedFinding[];
  setPredefinedFindings: React.Dispatch<React.SetStateAction<PredefinedFinding[]>>;
  authUser: Employee | null;
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  showConfirmModal: (options: ConfirmModalOptions) => void;
  hideConfirmModal: () => void;
  confirmModal: {
    isOpen: boolean;
    options: ConfirmModalOptions | null;
  };
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const dataFieldLabels: Record<DataFieldKey, string> = {
    requestNumber: 'رقم التقرير', date: 'التاريخ', clientName: 'اسم العميل', clientPhone: 'رقم الهاتف',
    price: 'قيمة الفحص', make: 'الشركة', model: 'الموديل', year: 'سنة الصنع', plate: 'رقم اللوحة/الشاصي',
    inspectionType: 'نوع الفحص', employeeName: 'الفاحص المسؤول'
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [page, setPage] = useState<Page>('dashboard');
  const [settingsPage, setSettingsPage] = useState<SettingsPage>('general');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const [clients, setClients] = useLocalStorage<Client[]>('clients', initialClients);
  const [carMakes, setCarMakes] = useLocalStorage<CarMake[]>('carMakes', initialCarMakes);
  const [carModels, setCarModels] = useLocalStorage<CarModel[]>('carModels', initialCarModels);
  const [cars, setCars] = useLocalStorage<Car[]>('cars', initialCars);
  const [inspectionTypes, setInspectionTypes] = useLocalStorage<InspectionType[]>('inspectionTypes', initialInspectionTypes);
  const [requests, setRequests] = useLocalStorage<WorkshopRequest[]>('requests', initialRequests);
  const [employees, setEmployees] = useLocalStorage<Employee[]>('employees', initialEmployees);
  const [brokers, setBrokers] = useLocalStorage<Broker[]>('brokers', initialBrokers);
  const [settings, setSettings] = useLocalStorage<Settings>('settings', initialSettings);
  const [customFindingCategories, setCustomFindingCategories] = useLocalStorage<CustomFindingCategory[]>('customFindingCategories', initialCustomFindingCategories);
  const [predefinedFindings, setPredefinedFindings] = useLocalStorage<PredefinedFinding[]>('predefinedFindings', initialPredefinedFindings);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; options: ConfirmModalOptions | null }>({
    isOpen: false,
    options: null,
  });

  const showConfirmModal = (options: ConfirmModalOptions) => {
    setConfirmModal({ isOpen: true, options });
  };

  const hideConfirmModal = () => {
    setConfirmModal({ isOpen: false, options: null });
  };

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = uuidv4();
    setNotifications(prev => [...prev, { id, ...notification }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };


  // Automatically "login" as the general manager since the login screen is removed.
  const [authUser, setAuthUser] = useState<Employee | null>(employees.find(e => e.isGeneralManager) || employees[0]);

  // Data migration for employees from role-based to permission-based
  useEffect(() => {
    // Check if the first employee has the old 'role' property and not the new 'isGeneralManager'
    const needsMigration = employees.length > 0 && employees.some(e => e.hasOwnProperty('role') && !e.hasOwnProperty('isGeneralManager'));

    if (needsMigration) {
      console.log("Migrating employee data structure...");
      const migratedEmployees = employees.map((e: any) => {
        if (e.hasOwnProperty('role')) {
          const isGM = e.role === 'مدير عام';
          const canViewReports = e.role === 'مدير عام' || e.role === 'مدير';
          const canAccessSettings = e.role === 'مدير عام';
          
          const { role, ...rest } = e; // remove old role property
          
          return {
            ...rest,
            isGeneralManager: isGM,
            permissions: {
              canCreateRequests: true, // Default to true for backward compatibility
              canViewReports,
              canAccessSettings
            }
          };
        }
        return e;
      });
      setEmployees(migratedEmployees as Employee[]);
    }
  }, [employees, setEmployees]);

  // Data migration for adding canManageClients permission
  useEffect(() => {
    const needsMigration = employees.length > 0 && employees.some(e => e.permissions && !e.permissions.hasOwnProperty('canManageClients'));

    if (needsMigration) {
      console.log("Migrating employee data to include 'canManageClients' permission...");
      const migratedEmployees = employees.map(e => {
        if (e.permissions && !e.permissions.hasOwnProperty('canManageClients')) {
          return {
            ...e,
            permissions: {
              ...e.permissions,
              // Default to true for existing users to avoid breaking their workflow.
              // Admin can later restrict this permission.
              canManageClients: true,
            }
          };
        }
        return e;
      });
      setEmployees(migratedEmployees);
    }
  }, [employees, setEmployees]);
  
  // Data migration for report template from column-based to free-form grid
  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem('settings') || 'null');
    if (savedSettings && savedSettings.reportTemplate) {
        // First migration: From simple array of keys to object with position
        const needsMigration1 = savedSettings.reportTemplate.some(
            (block: any) => block.type === 'DATA_GRID' && block.properties.hasOwnProperty('fields')
        );

        if (needsMigration1) {
            console.log("Migrating report template DATA_GRID to new free-form structure...");
            savedSettings.reportTemplate = savedSettings.reportTemplate.map((block: any) => {
                if (block.type === 'DATA_GRID' && block.properties.hasOwnProperty('fields')) {
                    const oldFields = block.properties.fields as DataFieldKey[];
                    const numColumns = block.properties.numberOfColumns || 2;
                    const containerWidth = 780;
                    const colWidth = containerWidth / numColumns;
                    const rowHeight = 40;
                    const horizontalPadding = 10;
                    const verticalPadding = 10;

                    const newGridFields: Omit<DataGridField, 'labelPart' | 'valuePart'>[] = oldFields.map((fieldKey, index) => {
                        const rowIndex = Math.floor(index / numColumns);
                        const colIndex = index % numColumns;
                        return {
                            key: fieldKey,
                            label: dataFieldLabels[fieldKey] || fieldKey,
                            showLabel: true,
                            showValue: true,
                            x: (colIndex * colWidth) + horizontalPadding,
                            y: (rowIndex * (rowHeight + verticalPadding)) + verticalPadding,
                            width: colWidth - (2 * horizontalPadding),
                            height: rowHeight,
                            styles: { fontWeight: 'normal' }
                        };
                    });
                    
                    delete block.properties.fields;
                    delete block.properties.numberOfColumns;
                    block.properties.gridFields = newGridFields;
                    block.properties.containerHeight = Math.ceil(oldFields.length / numColumns) * (rowHeight + verticalPadding) + verticalPadding;
                }
                return block;
            });
        }
        
        // Second migration: From single field object to separate label/value parts
        const needsMigration2 = savedSettings.reportTemplate.some(
            (block: any) => block.type === 'DATA_GRID' && block.properties.gridFields && block.properties.gridFields.length > 0 && !block.properties.gridFields[0].hasOwnProperty('labelPart')
        );

        if (needsMigration2) {
            console.log("Migrating DATA_GRID fields to new label/value part structure...");
            savedSettings.reportTemplate = savedSettings.reportTemplate.map((block: any) => {
                if (block.type === 'DATA_GRID' && block.properties.gridFields) {
                    const newGridFields = block.properties.gridFields.map((oldField: any) => {
                        const labelWidth = Math.round(oldField.width * 0.45);
                        const valueWidth = oldField.width - labelWidth;
                        return {
                            key: oldField.key,
                            label: oldField.label,
                            showLabel: true,
                            showValue: true,
                            labelPart: {
                                x: oldField.x,
                                y: oldField.y,
                                width: labelWidth,
                                height: oldField.height,
                                styles: { ...oldField.styles, fontWeight: 'bold' }
                            },
                            valuePart: {
                                x: oldField.x + labelWidth + 5,
                                y: oldField.y,
                                width: valueWidth - 5,
                                height: oldField.height,
                                styles: { ...oldField.styles, fontWeight: 'normal' }
                            }
                        };
                    });
                    block.properties.gridFields = newGridFields;
                }
                return block;
            });
        }
        
        if (needsMigration1 || needsMigration2) {
            setSettings(prev => ({...prev, reportTemplate: savedSettings.reportTemplate}));
        }
    }
  }, []); // Run once on mount
  
  // Data migration for car language setting in report template
  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem('settings') || 'null');
    if (!savedSettings || !savedSettings.reportTemplate) return;

    let needsMigration = false;
    const migratedTemplate = savedSettings.reportTemplate.map((block: any) => {
        if (block.type === 'DATA_GRID' && block.properties && block.properties.hasOwnProperty('displaySecondaryLanguage')) {
            needsMigration = true;
            const newProperties = { ...block.properties };
            
            newProperties.carNameLanguage = newProperties.displaySecondaryLanguage ? 'both' : 'ar';
            delete newProperties.displaySecondaryLanguage;
            
            return { ...block, properties: newProperties };
        }
        return block;
    });
    
    if (needsMigration) {
        console.log("Migrating DATA_GRID from 'displaySecondaryLanguage' to 'carNameLanguage'...");
        setSettings(prev => ({...prev, reportTemplate: migratedTemplate}));
    }
  }, []); // Run once on mount

  // Data migration for report page settings
  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem('settings') || 'null');
    if (savedSettings && !savedSettings.hasOwnProperty('reportPageSettings')) {
        console.log("Migrating settings to include 'reportPageSettings'...");
        setSettings(prev => ({
            ...prev,
            reportPageSettings: {
                marginTop: 20,
                marginRight: 20,
                marginBottom: 20,
                marginLeft: 20,
            }
        }));
    }
  }, []); // Run once on mount

  const login = (username: string, password?: string): boolean => {
    const user = employees.find(e => e.username === username && e.password === password);
    if (user) {
      setAuthUser(user);
      setPage('dashboard'); // Redirect to dashboard on successful login
      return true;
    }
    return false;
  };

  const logout = () => {
    // This function is now obsolete as there is no logout functionality.
  };

  const addClient = (client: Client) => {
    setClients(prev => [...prev, client]);
  }

   // One-time hydration effect to merge new settings properties into existing user data
   useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem('settings') || 'null');
    if (savedSettings) {
        const mergedSettings = mergeDeep(initialSettings, savedSettings);
        // Only update if the merged version is different from the one currently in state
        // to avoid unnecessary re-renders and potential loops.
        if (JSON.stringify(mergedSettings) !== JSON.stringify(settings)) {
            setSettings(mergedSettings);
        }
    }
   }, []); // Empty array ensures this runs only once on mount.


  const value: AppContextType = {
    page,
    setPage,
    settingsPage,
    setSettingsPage,
    selectedRequestId,
    setSelectedRequestId,
    clients,
    setClients,
    addClient,
    carMakes,
    setCarMakes,
    carModels,
    setCarModels,
    cars,
    setCars,
    inspectionTypes,
    setInspectionTypes,
    requests,
    setRequests,
    employees,
    setEmployees,
    brokers,
    setBrokers,
    settings,
    setSettings,
    customFindingCategories,
    setCustomFindingCategories,
    predefinedFindings,
    setPredefinedFindings,
    authUser,
    login,
    logout,
    showConfirmModal,
    hideConfirmModal,
    confirmModal,
    notifications,
    addNotification,
    removeNotification,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};