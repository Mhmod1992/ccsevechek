import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { CarMake, CarModel } from '../types';
import { v4 as uuidv4 } from 'uuid';
import Modal from '../components/Modal';
import Icon from '../components/Icon';

const CarsManagement: React.FC = () => {
    const { carMakes, setCarMakes, carModels, setCarModels, showConfirmModal, addNotification } = useAppContext();
    const [activeTab, setActiveTab] = useState<'makes' | 'models'>('makes');

    // Make state
    const [isMakeModalOpen, setIsMakeModalOpen] = useState(false);
    const [currentMake, setCurrentMake] = useState<Partial<CarMake>>({});
    const [isEditingMake, setIsEditingMake] = useState(false);
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
    const [batchInput, setBatchInput] = useState('');

    // Model state
    const [isModelModalOpen, setIsModelModalOpen] = useState(false);
    const [currentModel, setCurrentModel] = useState<Partial<CarModel>>({ makeId: carMakes[0]?.id });
    const [isEditingModel, setIsEditingModel] = useState(false);
    const [isModelBatchModalOpen, setIsModelBatchModalOpen] = useState(false);
    const [modelBatchInput, setModelBatchInput] = useState('');
    const [batchSelectedMakeId, setBatchSelectedMakeId] = useState<string>('');

    // Make Handlers
    const handleAddMake = () => {
        setCurrentMake({ nameAr: '', nameEn: '' });
        setIsEditingMake(false);
        setIsMakeModalOpen(true);
    };
    const handleOpenBatchAdd = () => {
        setBatchInput('');
        setIsBatchModalOpen(true);
    };
    const handleEditMake = (make: CarMake) => {
        setCurrentMake(make);
        setIsEditingMake(true);
        setIsMakeModalOpen(true);
    };
    const handleDeleteMake = (id: string) => {
        showConfirmModal({
            title: 'تأكيد الحذف',
            message: 'سيتم حذف جميع الموديلات المرتبطة بهذه الشركة. هل أنت متأكد؟',
            onConfirm: () => {
                setCarMakes(carMakes.filter(m => m.id !== id));
                setCarModels(carModels.filter(m => m.makeId !== id));
            }
        });
    };
    const handleSaveMake = () => {
        if (!currentMake.nameAr?.trim() || !currentMake.nameEn?.trim()) {
            addNotification({ title: 'بيانات ناقصة', message: 'الرجاء إدخال الاسمين العربي والإنجليزي.', type: 'error' });
            return;
        }
        if (isEditingMake) {
            setCarMakes(carMakes.map(m => m.id === currentMake.id ? currentMake as CarMake : m));
        } else {
            const isDuplicate = carMakes.some(m => m.nameEn?.toLowerCase() === currentMake.nameEn!.toLowerCase());
            if (isDuplicate) {
                addNotification({ title: 'بيانات مكررة', message: 'الشركة بالاسم الإنجليزي هذا موجودة بالفعل.', type: 'error' });
                return;
            }
            setCarMakes([...carMakes, { ...currentMake, id: uuidv4() } as CarMake]);
        }
        setIsMakeModalOpen(false);
    };

    const handleSaveBatchMakes = () => {
        const lines = batchInput.split('\n').filter(line => line.trim() !== '');
        const newMakes: CarMake[] = [];
        const existingNamesEn = new Set(carMakes.map(m => m.nameEn.toLowerCase()));

        for (const line of lines) {
            const parts = line.split(',');
            if (parts.length !== 2) {
                addNotification({ title: 'خطأ في التنسيق', message: `تنسيق خاطئ في السطر: "${line}".\nالرجاء استخدام التنسيق: الاسم بالعربي, الاسم بالانجليزي`, type: 'error' });
                return;
            }
            const nameAr = parts[0].trim();
            const nameEn = parts[1].trim();

            if (!nameAr || !nameEn) {
                addNotification({ title: 'بيانات ناقصة', message: `أسماء فارغة في السطر: "${line}".`, type: 'error' });
                return;
            }

            if (existingNamesEn.has(nameEn.toLowerCase())) {
                console.warn(`Skipping duplicate make: ${nameEn}`);
                continue;
            }

            newMakes.push({ id: uuidv4(), nameAr, nameEn });
            existingNamesEn.add(nameEn.toLowerCase());
        }

        setCarMakes(prev => [...prev, ...newMakes]);
        setIsBatchModalOpen(false);
    };

    // Model Handlers
    const handleAddModel = () => {
        setCurrentModel({ makeId: carMakes[0]?.id || '', nameAr: '', nameEn: '', category: '' });
        setIsEditingModel(false);
        setIsModelModalOpen(true);
    };
    const handleEditModel = (model: CarModel) => {
        setCurrentModel(model);
        setIsEditingModel(true);
        setIsModelModalOpen(true);
    };
    const handleDeleteModel = (id: string) => {
        showConfirmModal({
            title: 'تأكيد الحذف',
            message: 'هل أنت متأكد من حذف هذا الموديل؟',
            onConfirm: () => {
                setCarModels(carModels.filter(m => m.id !== id));
            }
        });
    };
    const handleSaveModel = () => {
        if (!currentModel.nameAr?.trim() || !currentModel.nameEn?.trim()) {
            addNotification({ title: 'بيانات ناقصة', message: 'الرجاء إدخال الاسمين العربي والإنجليزي للموديل.', type: 'error' });
            return;
        }
        if (isEditingModel) {
            setCarModels(carModels.map(m => m.id === currentModel.id ? currentModel as CarModel : m));
        } else {
            setCarModels([...carModels, { ...currentModel, id: uuidv4() } as CarModel]);
        }
        setIsModelModalOpen(false);
    };
    const handleOpenModelBatchAdd = () => {
        setModelBatchInput('');
        setBatchSelectedMakeId('');
        setIsModelBatchModalOpen(true);
    };

    const handleSaveBatchModels = () => {
        if (!batchSelectedMakeId) {
            addNotification({ title: 'خطأ', message: 'الرجاء اختيار شركة أولاً.', type: 'error' });
            return;
        }

        const lines = modelBatchInput.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) {
            addNotification({ title: 'خطأ', message: 'الرجاء إدخال موديل واحد على الأقل.', type: 'error' });
            return;
        }
        
        const newModels: CarModel[] = [];
        const existingModels = new Set(carModels
            .filter(m => m.makeId === batchSelectedMakeId)
            .map(m => m.nameEn.toLowerCase())
        );
        const selectedMake = carMakes.find(m => m.id === batchSelectedMakeId);


        for (const line of lines) {
            const parts = line.split(',');
            if (parts.length < 2) {
                 addNotification({ title: 'خطأ في التنسيق', message: `تنسيق خاطئ في السطر: "${line}".\nالرجاء استخدام التنسيق: الاسم بالعربي, الاسم بالإنجليزي, الفئة (اختياري)`, type: 'error' });
                return;
            }
            const nameAr = parts[0]?.trim();
            const nameEn = parts[1]?.trim();
            const category = parts[2]?.trim() || undefined;

            if (!nameAr || !nameEn) {
                addNotification({ title: 'بيانات ناقصة', message: `الأسماء فارغة في السطر: "${line}".`, type: 'error' });
                return;
            }

            if (existingModels.has(nameEn.toLowerCase())) {
                console.warn(`Skipping duplicate model: ${nameEn} for make ${selectedMake?.nameAr}`);
                continue;
            }

            newModels.push({ 
                id: uuidv4(), 
                makeId: batchSelectedMakeId, 
                nameAr,
                nameEn,
                category,
            });
            existingModels.add(nameEn.toLowerCase());
        }

        setCarModels(prev => [...prev, ...newModels]);
        setIsModelBatchModalOpen(false);
    };


    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('makes')} className={`${activeTab === 'makes' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-lg`}>إدارة الشركات</button>
                    <button onClick={() => setActiveTab('models')} className={`${activeTab === 'models' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-lg`}>إدارة الموديلات</button>
                </nav>
            </div>

            {activeTab === 'makes' && (
                <div>
                    <div className="flex justify-end mb-4 gap-2">
                        <button onClick={handleOpenBatchAdd} className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 flex items-center">
                            <Icon name="add" className="w-5 h-5 me-2" />
                            إضافة دفعة واحدة
                        </button>
                        <button onClick={handleAddMake} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                            <Icon name="add" className="w-5 h-5 me-2" />
                            إضافة شركة
                        </button>
                    </div>
                    <div>
                        <table className="w-full text-right">
                           <thead className="bg-gray-100"><tr><th className="p-3">الاسم (عربي)</th><th className="p-3">الاسم (إنجليزي)</th><th className="p-3">إجراءات</th></tr></thead>
                           <tbody>
                               {carMakes.map(make => (
                                   <tr key={make.id} className="border-b">
                                       <td className="p-3">{make.nameAr}</td>
                                       <td className="p-3">{make.nameEn}</td>
                                       <td className="p-3 flex items-center gap-4">
                                          <button onClick={() => handleEditMake(make)} className="text-yellow-500"><Icon name="edit"/></button>
                                          <button onClick={() => handleDeleteMake(make.id)} className="text-red-500"><Icon name="delete"/></button>
                                       </td>
                                   </tr>
                               ))}
                           </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'models' && (
                <div>
                    <div className="flex justify-end mb-4 gap-2">
                        <button onClick={handleOpenModelBatchAdd} className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 flex items-center">
                            <Icon name="add" className="w-5 h-5 me-2" />
                            إضافة دفعة واحدة
                        </button>
                        <button onClick={handleAddModel} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                            <Icon name="add" className="w-5 h-5 me-2" />
                            إضافة موديل جديد
                        </button>
                    </div>
                    <div>
                        <table className="w-full text-right">
                           <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-3">الاسم (عربي)</th>
                                    <th className="p-3">الاسم (انجليزي)</th>
                                    <th className="p-3">الفئة</th>
                                    <th className="p-3">الشركة</th>
                                    <th className="p-3">إجراءات</th>
                                </tr>
                            </thead>
                           <tbody>
                               {carModels.map(model => (
                                   <tr key={model.id} className="border-b">
                                       <td className="p-3">{model.nameAr}</td>
                                       <td className="p-3">{model.nameEn}</td>
                                       <td className="p-3">{model.category || '-'}</td>
                                       <td className="p-3">{carMakes.find(m => m.id === model.makeId)?.nameAr}</td>
                                       <td className="p-3 flex items-center gap-4">
                                          <button onClick={() => handleEditModel(model)} className="text-yellow-500"><Icon name="edit"/></button>
                                          <button onClick={() => handleDeleteModel(model.id)} className="text-red-500"><Icon name="delete"/></button>
                                       </td>
                                   </tr>
                               ))}
                           </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Modal isOpen={isBatchModalOpen} onClose={() => setIsBatchModalOpen(false)} title="إضافة دفعة واحدة من الشركات">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">أدخل كل شركة في سطر جديد بالتنسيق التالي:</label>
                        <p className="text-sm text-gray-500 my-2 bg-gray-100 p-2 rounded-md">الاسم بالعربي, الاسم بالانجليزي</p>
                        <textarea 
                            value={batchInput} 
                            onChange={e => setBatchInput(e.target.value)}
                            rows={10}
                            placeholder={`تويوتا,Toyota\nهيونداي,Hyundai`}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                            style={{direction: 'ltr', textAlign: 'right'}}
                        />
                    </div>
                    <div className="flex justify-end pt-4"><button onClick={handleSaveBatchMakes} className="bg-green-600 text-white px-4 py-2 rounded-md">حفظ الكل</button></div>
                </div>
            </Modal>
            
            <Modal isOpen={isModelBatchModalOpen} onClose={() => setIsModelBatchModalOpen(false)} title="إضافة دفعة واحدة من الموديلات">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">1. اختر الشركة</label>
                        <select
                            value={batchSelectedMakeId}
                            onChange={e => setBatchSelectedMakeId(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white"
                        >
                            <option value="" disabled>-- الرجاء اختيار شركة --</option>
                            {carMakes.map(make => (
                                <option key={make.id} value={make.id}>{make.nameAr} ({make.nameEn})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700">2. أدخل الموديلات (كل موديل في سطر)</label>
                        <p className="text-sm text-gray-500 my-2 bg-gray-100 p-2 rounded-md">الاسم بالعربي, الاسم بالإنجليزي, الفئة (اختياري)</p>
                        <textarea 
                            value={modelBatchInput} 
                            onChange={e => setModelBatchInput(e.target.value)}
                            rows={10}
                            placeholder={`كامري,Camry,Sedan\nراف فور,Rav4,SUV\nكورولا,Corolla`}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                            disabled={!batchSelectedMakeId}
                            style={{direction: 'ltr', textAlign: 'right'}}
                        />
                    </div>
                    <div className="flex justify-end pt-4">
                        <button 
                            onClick={handleSaveBatchModels} 
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
                            disabled={!batchSelectedMakeId || modelBatchInput.trim() === ''}
                        >
                            حفظ الكل
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isMakeModalOpen} onClose={() => setIsMakeModalOpen(false)} title={isEditingMake ? 'تعديل شركة' : 'إضافة شركة جديدة'}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">الاسم (عربي)</label>
                        <input type="text" value={currentMake.nameAr || ''} onChange={e => setCurrentMake({...currentMake, nameAr: e.target.value})} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">الاسم (إنجليزي)</label>
                        <input type="text" value={currentMake.nameEn || ''} onChange={e => setCurrentMake({...currentMake, nameEn: e.target.value})} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div className="flex justify-end pt-4"><button onClick={handleSaveMake} className="bg-green-600 text-white px-4 py-2 rounded-md">حفظ</button></div>
                </div>
            </Modal>

            <Modal isOpen={isModelModalOpen} onClose={() => setIsModelModalOpen(false)} title={isEditingModel ? 'تعديل موديل' : 'إضافة موديل جديد'}>
                <div className="space-y-4">
                    <div>
                        <label>الشركة</label>
                        <select value={currentModel.makeId} onChange={e => setCurrentModel({...currentModel, makeId: e.target.value})} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                            <option value="">اختر شركة</option>
                            {carMakes.map(m => <option key={m.id} value={m.id}>{m.nameAr}</option>)}
                        </select>
                    </div>
                    <div>
                        <label>الاسم (عربي)</label>
                        <input type="text" value={currentModel.nameAr || ''} onChange={e => setCurrentModel({...currentModel, nameAr: e.target.value})} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                     <div>
                        <label>الاسم (إنجليزي)</label>
                        <input type="text" value={currentModel.nameEn || ''} onChange={e => setCurrentModel({...currentModel, nameEn: e.target.value})} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label>الفئة (اختياري)</label>
                        <input type="text" value={currentModel.category || ''} onChange={e => setCurrentModel({...currentModel, category: e.target.value})} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div className="flex justify-end pt-4"><button onClick={handleSaveModel} className="bg-green-600 text-white px-4 py-2 rounded-md">حفظ</button></div>
                </div>
            </Modal>
        </div>
    );
};

export default CarsManagement;