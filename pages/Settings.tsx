import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Settings as SettingsType, SettingsPage, CustomFindingCategory } from '../types';
import Icon from '../components/Icon';
import { v4 as uuidv4 } from 'uuid';
import Modal from '../components/Modal';

// Import sub-pages
import CarsManagement from './CarsManagement';
import InspectionsManagement from './InspectionsManagement';
import BrokersManagement from './BrokersManagement';
import EmployeesManagement from './EmployeesManagement';
import FindingsManagement from './FindingsManagement';
import ReportSettings from './ReportSettings';

// Component for General Settings
const GeneralSettings: React.FC = () => {
    const { settings, setSettings, addNotification } = useAppContext();
    const [currentSettings, setCurrentSettings] = useState<SettingsType>(settings);
    
    useEffect(() => {
        setCurrentSettings(settings);
    }, [settings]);

    const handleSave = async () => {
        await setSettings(currentSettings);
        addNotification({ title: 'نجاح', message: 'تم حفظ الإعدادات بنجاح!', type: 'success' });
    };
    
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCurrentSettings({...currentSettings, logoUrl: reader.result as string});
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-8">
            <div className="border-b pb-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-700">الإعدادات العامة</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">اسم البرنامج</label>
                        <input
                            type="text"
                            value={currentSettings.appName}
                            onChange={e => setCurrentSettings({ ...currentSettings, appName: e.target.value })}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700">شعار البرنامج</label>
                         <div className="mt-1 flex items-center gap-4">
                            {currentSettings.logoUrl && <img src={currentSettings.logoUrl} alt="logo" className="h-12 border p-1 rounded-md" />}
                            <input type="file" onChange={handleLogoChange} accept="image/*" className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                         </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-end pt-6">
                <button onClick={handleSave} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-bold shadow-md hover:shadow-lg transition-transform hover:scale-105">
                    حفظ الإعدادات
                </button>
            </div>
        </div>
    );
};

// Component for Plate Characters Settings
const PlateCharactersSettings: React.FC = () => {
    const { settings, setSettings, addNotification } = useAppContext();
    const [currentSettings, setCurrentSettings] = useState<SettingsType>(settings);

    useEffect(() => {
        setCurrentSettings(settings);
    }, [settings]);

    const handleSave = async () => {
        await setSettings(currentSettings);
        addNotification({ title: 'نجاح', message: 'تم حفظ الإعدادات بنجاح!', type: 'success' });
    };
    
    const handlePlateCharChange = (index: number, key: 'ar' | 'en', value: string) => {
        setCurrentSettings(prev => {
           const updatedChars = [...prev.plateCharacters];
           updatedChars[index] = { ...updatedChars[index], [key]: value };
           return {...prev, plateCharacters: updatedChars};
        });
    };
    
    const addPlateChar = () => {
        setCurrentSettings(prev => ({
            ...prev,
            plateCharacters: [...prev.plateCharacters, { ar: '', en: '' }],
        }));
    }

    const removePlateChar = (index: number) => {
        setCurrentSettings(prev => ({
            ...prev,
            plateCharacters: prev.plateCharacters.filter((_, i) => i !== index),
        }));
    }


    return (
         <div className="space-y-8">
            <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-700">إعدادات لوحة السيارة</h3>
                <p className="text-sm text-gray-500 mb-4">هنا يمكنك تحديد الأحرف المسموح بها وتحويلها بين العربية والإنجليزية.</p>
                <div className="grid grid-cols-4 gap-2 font-bold text-center border-b pb-2">
                    <span>عربي</span>
                    <span>إنجليزي (كابيتال)</span>
                    <span></span>
                    <span/>
                </div>
                <div className="max-h-96 overflow-y-auto">
                    {currentSettings.plateCharacters.map((char, index) => (
                        <div key={index} className="grid grid-cols-4 gap-2 items-center mt-2">
                            <input type="text" value={char.ar} onChange={e => handlePlateCharChange(index, 'ar', e.target.value)} className="p-2 border border-gray-300 rounded-md text-center shadow-sm focus:ring-2 focus:ring-blue-500" />
                            <input type="text" value={char.en} onChange={e => handlePlateCharChange(index, 'en', e.target.value.toUpperCase())} className="p-2 border border-gray-300 rounded-md text-center shadow-sm focus:ring-2 focus:ring-blue-500" />
                            <div/>
                            <button onClick={() => removePlateChar(index)} className="text-red-500 p-2 rounded-md hover:bg-red-100 justify-self-center"><Icon name="delete"/></button>
                        </div>
                    ))}
                </div>
                <button onClick={addPlateChar} className="mt-4 text-blue-600 font-semibold text-sm flex items-center"><Icon name="add" className="w-4 h-4 me-1"/>إضافة حرف</button>
            </div>

            <div className="flex justify-end pt-6 border-t mt-6">
                <button onClick={handleSave} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-bold shadow-md hover:shadow-lg transition-transform hover:scale-105">
                    حفظ الإعدادات
                </button>
            </div>
        </div>
    );
}

// New component for Plate Preview Settings
const PlatePreviewSettings: React.FC = () => {
    const { settings, setSettings, addNotification } = useAppContext();
    const [currentSettings, setCurrentSettings] = useState<SettingsType['platePreviewSettings']>(settings.platePreviewSettings);

    useEffect(() => {
        setCurrentSettings(settings.platePreviewSettings);
    }, [settings.platePreviewSettings]);

    const handleSave = async () => {
        await setSettings({ ...settings, platePreviewSettings: currentSettings });
        addNotification({ title: 'نجاح', message: 'تم حفظ الإعدادات بنجاح!', type: 'success' });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCurrentSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSeparatorImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCurrentSettings(prev => ({ ...prev, separatorImageUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };


    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-700">إعدادات معاينة لوحة السيارة</h3>
                <p className="text-sm text-gray-500 mb-6">تحكم في شكل ومظهر مربع معاينة لوحة السيارة الذي يظهر في صفحة إنشاء طلب جديد.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Colors */}
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">لون الخلفية</label>
                        <input type="color" name="backgroundColor" value={currentSettings.backgroundColor} onChange={handleChange} className="w-12 h-10 p-1 border border-gray-300 rounded-md" />
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">لون الإطار</label>
                        <input type="color" name="borderColor" value={currentSettings.borderColor} onChange={handleChange} className="w-12 h-10 p-1 border border-gray-300 rounded-md" />
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">لون الخط</label>
                        <input type="color" name="fontColor" value={currentSettings.fontColor} onChange={handleChange} className="w-12 h-10 p-1 border border-gray-300 rounded-md" />
                    </div>

                    {/* Font Settings */}
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">اسم الخط (Font Family)</label>
                        <input type="text" name="fontFamily" placeholder="e.g., Arial, 'Courier New', monospace" value={currentSettings.fontFamily} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">حجم الخط (مع الوحدة)</label>
                        <input type="text" name="fontSize" placeholder="e.g., 32px or 2rem" value={currentSettings.fontSize} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">المسافة بين الأحرف (مع الوحدة)</label>
                        <input type="text" name="letterSpacing" placeholder="e.g., 4px or 0.25rem" value={currentSettings.letterSpacing} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500" />
                    </div>
                     {/* Separator Image */}
                    <div className="col-span-1 md:col-span-2 border-t pt-4 mt-2 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">فاصل اللوحة (صورة اختيارية)</label>
                            <div className="mt-2 flex items-center gap-4">
                                <input type="file" id="separator-upload" className="hidden" accept="image/*" onChange={handleSeparatorImageChange} />
                                <label htmlFor="separator-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    تحميل صورة
                                </label>
                                {currentSettings.separatorImageUrl && (
                                    <div className="relative">
                                        <img src={currentSettings.separatorImageUrl} alt="فاصل" className="h-12 border p-1 rounded-md" />
                                        <button
                                            onClick={() => setCurrentSettings(prev => ({ ...prev, separatorImageUrl: '' }))}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0 h-5 w-5 flex items-center justify-center text-xs"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">عرض الفاصل (e.g., 20px, auto)</label>
                                <input type="text" name="separatorWidth" placeholder="auto" value={currentSettings.separatorWidth || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ارتفاع الفاصل (e.g., 40px)</label>
                                <input type="text" name="separatorHeight" placeholder="40px" value={currentSettings.separatorHeight || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 border-t pt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">معاينة حية</p>
                    <div className="max-w-sm mx-auto">
                        <div 
                            className="flex items-center justify-evenly border-2 rounded-md h-20 p-2"
                            style={{
                                backgroundColor: currentSettings.backgroundColor,
                                borderColor: currentSettings.borderColor,
                            }}
                        >
                            <span 
                                className="font-bold" 
                                style={{
                                    color: currentSettings.fontColor,
                                    fontFamily: currentSettings.fontFamily,
                                    fontSize: currentSettings.fontSize,
                                    letterSpacing: currentSettings.letterSpacing,
                                    direction: 'rtl'
                                }}
                            >
                                ب ب ب
                            </span>
                            {currentSettings.separatorImageUrl ? (
                                <img
                                    src={currentSettings.separatorImageUrl}
                                    alt="فاصل"
                                    className="object-contain"
                                    style={{
                                        width: currentSettings.separatorWidth,
                                        height: currentSettings.separatorHeight,
                                    }}
                                />
                            ) : (
                                <div style={{backgroundColor: currentSettings.borderColor}} className="w-px h-10"></div>
                            )}
                             <span 
                                className="font-bold" 
                                style={{
                                    color: currentSettings.fontColor,
                                    fontFamily: currentSettings.fontFamily,
                                    fontSize: currentSettings.fontSize,
                                    letterSpacing: currentSettings.letterSpacing,
                                    direction: 'ltr'
                                }}
                            >
                                9 8 7 6
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-6 border-t mt-6">
                 <button onClick={handleSave} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-bold shadow-md hover:shadow-lg transition-transform hover:scale-105">
                    حفظ الإعدادات
                </button>
            </div>
        </div>
    );
}

// This component contains the sub-tabs for Inspection Types and dynamic Finding Categories
const InspectionSettingsTabs: React.FC = () => {
    const { customFindingCategories, setCustomFindingCategories, setPredefinedFindings, showConfirmModal, addNotification } = useAppContext();
    const [activeTab, setActiveTab] = useState<string>('types');
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<Partial<CustomFindingCategory>>({});
    const [isEditingCategory, setIsEditingCategory] = useState(false);
    
    useEffect(() => {
        const activeCategoryExists = customFindingCategories.some(cat => cat.id === activeTab);
        
        if (activeTab !== 'types' && !activeCategoryExists) {
            const fallbackTab = customFindingCategories.length > 0 ? customFindingCategories[0].id : 'types';
            setActiveTab(fallbackTab);
        }
    }, [customFindingCategories, activeTab]);

    const handleAddCategory = () => {
        setCurrentCategory({ name: '' });
        setIsEditingCategory(false);
        setIsCategoryModalOpen(true);
    };

    const handleEditCategory = (category: CustomFindingCategory) => {
        setCurrentCategory(category);
        setIsEditingCategory(true);
        setIsCategoryModalOpen(true);
    };

    const handleDeleteCategory = (categoryId: string) => {
        showConfirmModal({
            title: 'تأكيد حذف التبويب',
            message: 'هل أنت متأكد من حذف هذا التبويب وكل البيانات المرتبطة به؟',
            onConfirm: () => {
                setCustomFindingCategories(prev => prev.filter(c => c.id !== categoryId));
                setPredefinedFindings(prev => prev.filter(f => f.categoryId !== categoryId));
            }
        });
    };
    
    const handleSaveCategory = () => {
        if (!currentCategory.name?.trim()) {
            addNotification({ title: 'بيانات ناقصة', message: 'الرجاء إدخال اسم التبويب.', type: 'error' });
            return;
        }
        if (isEditingCategory) {
            setCustomFindingCategories(prev => prev.map(c => c.id === currentCategory.id ? currentCategory as CustomFindingCategory : c));
        } else {
            const newCategory = { id: uuidv4(), name: currentCategory.name.trim() };
            setCustomFindingCategories(prev => [...prev, newCategory]);
            setActiveTab(newCategory.id);
        }
        setIsCategoryModalOpen(false);
    };

    const renderContent = () => {
        if (activeTab === 'types') {
            return <InspectionsManagement />;
        }
        const category = customFindingCategories.find(c => c.id === activeTab);
        if (category) {
            return <FindingsManagement categoryId={category.id} categoryName={category.name} />;
        }
        return null;
    };

    const getTabClasses = (tabId: string) => 
        `flex items-center rounded-md transition-colors duration-200 ${
            activeTab === tabId ? 'bg-blue-100' : 'hover:bg-gray-100'
        }`;

    const getTabButtonClasses = (tabId: string) =>
        `px-4 py-2 text-sm font-medium focus:outline-none ${
            activeTab === tabId ? 'text-blue-700' : 'text-gray-600'
        }`;
        
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg overflow-x-auto">
                <nav className="flex space-x-1 rtl:space-x-reverse flex-shrink-0" aria-label="Inspection Sub-tabs">
                    <div className={getTabClasses('types')}>
                        <button onClick={() => setActiveTab('types')} className={getTabButtonClasses('types')}>
                            أنواع الفحص
                        </button>
                    </div>
                    {customFindingCategories.map(cat => (
                        <div key={cat.id} className={getTabClasses(cat.id)}>
                            <button onClick={() => setActiveTab(cat.id)} className={getTabButtonClasses(cat.id)}>
                                {cat.name}
                            </button>
                            <div className="flex items-center pe-2">
                                <button onClick={() => handleEditCategory(cat)} className="text-gray-400 hover:text-blue-600 p-1"><Icon name="edit" className="w-4 h-4"/></button>
                                <button onClick={() => handleDeleteCategory(cat.id)} className="text-gray-400 hover:text-red-600 p-1"><Icon name="delete" className="w-4 h-4"/></button>
                            </div>
                        </div>
                    ))}
                </nav>
                <button onClick={handleAddCategory} className="ms-2 flex-shrink-0 text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-full p-1 focus:outline-none">
                    <Icon name="add" className="w-5 h-5"/>
                </button>
            </div>
            <div>
                {renderContent()}
            </div>
            <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title={isEditingCategory ? 'تعديل تبويب' : 'إضافة تبويب جديد'}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">اسم التبويب</label>
                        <input type="text" value={currentCategory.name || ''} onChange={e => setCurrentCategory({ ...currentCategory, name: e.target.value })} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500" autoFocus />
                    </div>
                    <div className="flex justify-end pt-4">
                        <button onClick={handleSaveCategory} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">حفظ</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

// Component for Request Settings
const RequestSettings: React.FC = () => {
    type RequestSettingsTab = 'cars' | 'inspection-settings' | 'plate-characters' | 'plate-preview';
    const [activeTab, setActiveTab] = useState<RequestSettingsTab>('cars');

    const content = useMemo(() => {
        switch (activeTab) {
            case 'cars': return <CarsManagement />;
            case 'inspection-settings': return <InspectionSettingsTabs />;
            case 'plate-characters': return <PlateCharactersSettings />;
            case 'plate-preview': return <PlatePreviewSettings />;
            default: return <CarsManagement />;
        }
    }, [activeTab]);

    const tabButtonClasses = (tabName: RequestSettingsTab) => 
        `${activeTab === tabName ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-lg`;

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8 rtl:space-x-reverse -mb-px overflow-x-auto" aria-label="Tabs">
                    <button onClick={() => setActiveTab('cars')} className={tabButtonClasses('cars')}>السيارات</button>
                    <button onClick={() => setActiveTab('inspection-settings')} className={tabButtonClasses('inspection-settings')}>إعدادات الفحص</button>
                    <button onClick={() => setActiveTab('plate-characters')} className={tabButtonClasses('plate-characters')}>أحرف اللوحة</button>
                    <button onClick={() => setActiveTab('plate-preview')} className={tabButtonClasses('plate-preview')}>معاينة اللوحة</button>
                </nav>
            </div>
            <div>
                {content}
            </div>
        </div>
    );
};


// Main Settings component
const Settings: React.FC = () => {
    const { settingsPage, setSettingsPage } = useAppContext();

    const settingsMenu = [
        { id: 'general', name: 'إعدادات عامة', icon: 'settings' },
        { id: 'request', name: 'إعدادات الطلب', icon: 'fill' },
        { id: 'report-template', name: 'قالب التقرير', icon: 'document-report' },
        { id: 'brokers', name: 'السماسرة', icon: 'broker' },
        { id: 'employees', name: 'الموظفين', icon: 'employee' },
    ];

    const renderSettingsPage = () => {
        switch (settingsPage) {
            case 'general': return <GeneralSettings />;
            case 'request': return <RequestSettings />;
            case 'report-template': return <ReportSettings />;
            case 'brokers': return <BrokersManagement />;
            case 'employees': return <EmployeesManagement />;
            default: return <GeneralSettings />;
        }
    };

    const activeMenuItem = settingsMenu.find(item => item.id === settingsPage);
    const activePageTitle = activeMenuItem ? activeMenuItem.name : '';

    return (
        <div className="md:grid md:grid-cols-12 gap-6">
            {/* Sidebar Navigation */}
            <aside className="md:col-span-3 lg:col-span-3">
                <div className="bg-white rounded-xl shadow-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 px-2">الأقسام</h3>
                    <nav className="space-y-1">
                    {settingsMenu.map(item => (
                        <a
                            key={item.id}
                            href="#"
                            onClick={(e) => { e.preventDefault(); setSettingsPage(item.id as SettingsPage); }}
                            className={`flex items-center p-3 rounded-md text-md transition-colors ${
                                settingsPage === item.id ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <Icon name={item.icon} className="w-5 h-5 me-3" />
                            {item.name}
                        </a>
                    ))}
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main className="md:col-span-9 lg:col-span-9">
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                    {renderSettingsPage()}
                </div>
            </main>
        </div>
    );
};

export default Settings;