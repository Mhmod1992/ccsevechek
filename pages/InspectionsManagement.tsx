import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { InspectionType } from '../types.ts';
import { v4 as uuidv4 } from 'uuid';
import Modal from '../components/Modal.tsx';
import Icon from '../components/Icon.tsx';

const InspectionsManagement: React.FC = () => {
    const { inspectionTypes, setInspectionTypes, customFindingCategories, showConfirmModal, addNotification } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentInspection, setCurrentInspection] = useState<Partial<InspectionType>>({ fields: [], findingCategoryIds: [] });
    const [isEditing, setIsEditing] = useState(false);

    const handleAdd = () => {
        setCurrentInspection({ name: '', price: 0, fields: [], findingCategoryIds: [] });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleEdit = (inspection: InspectionType) => {
        setCurrentInspection(JSON.parse(JSON.stringify(inspection))); // Deep copy
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        showConfirmModal({
            title: 'تأكيد الحذف',
            message: 'هل أنت متأكد من حذف نوع الفحص هذا؟',
            onConfirm: () => {
                setInspectionTypes(inspectionTypes.filter(i => i.id !== id));
            }
        });
    };

    const handleSave = () => {
        if (!currentInspection.name || currentInspection.price === undefined) {
            addNotification({ title: 'بيانات ناقصة', message: 'الرجاء تعبئة اسم الفحص والسعر.', type: 'error' });
            return;
        }
        if (isEditing) {
            setInspectionTypes(inspectionTypes.map(i => i.id === currentInspection.id ? currentInspection as InspectionType : i));
        } else {
            setInspectionTypes([...inspectionTypes, { ...currentInspection, id: uuidv4() } as InspectionType]);
        }
        setIsModalOpen(false);
    };

    const handleCategoryToggle = (categoryId: string) => {
        setCurrentInspection(prev => {
            const currentIds = prev.findingCategoryIds || [];
            const newIds = currentIds.includes(categoryId)
                ? currentIds.filter(id => id !== categoryId)
                : [...currentIds, categoryId];
            return { ...prev, findingCategoryIds: newIds };
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <div className="flex justify-end mb-4">
                    <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                        <Icon name="add" className="w-5 h-5 me-2" />
                        إضافة نوع فحص جديد
                    </button>
                </div>
                 <table className="w-full text-right">
                    <thead className="bg-gray-100"><tr><th className="p-3">اسم الفحص</th><th className="p-3">السعر</th><th className="p-3">عدد التبويبات</th><th className="p-3">إجراءات</th></tr></thead>
                    <tbody>
                        {inspectionTypes.map(type => (
                            <tr key={type.id} className="border-b">
                                <td className="p-3">{type.name}</td>
                                <td className="p-3">{type.price.toLocaleString('en-US', { useGrouping: false })} ريال</td>
                                <td className="p-3">{(type.findingCategoryIds?.length || 0).toLocaleString('en-US', { useGrouping: false })}</td>
                                <td className="p-3 flex items-center gap-4">
                                    <button onClick={() => handleEdit(type)} className="text-yellow-500"><Icon name="edit"/></button>
                                    <button onClick={() => handleDelete(type.id)} className="text-red-500"><Icon name="delete"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>

                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? 'تعديل نوع الفحص' : 'إضافة نوع فحص جديد'}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="font-bold">اسم الفحص</label>
                                <input type="text" value={currentInspection.name || ''} onChange={e => setCurrentInspection({ ...currentInspection, name: e.target.value })} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label className="font-bold">السعر</label>
                                <input type="number" value={currentInspection.price || 0} onChange={e => setCurrentInspection({ ...currentInspection, price: Number(e.target.value) })} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                            </div>
                        </div>
                        <h4 className="font-bold pt-4 border-t">التبويبات المضمنة في هذا الفحص</h4>
                        <div className="space-y-2 max-h-[50vh] overflow-y-auto p-1 border rounded-md bg-gray-50">
                            {customFindingCategories.map(category => (
                                <label key={category.id} className="flex items-center p-3 hover:bg-gray-100 rounded-md cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={currentInspection.findingCategoryIds?.includes(category.id) || false}
                                        onChange={() => handleCategoryToggle(category.id)}
                                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ms-3 text-gray-700 font-medium">{category.name}</span>
                                </label>
                            ))}
                            {customFindingCategories.length === 0 && (
                                <p className="text-center text-gray-500 p-4">
                                    لا توجد تبويبات فحص مهيأة. الرجاء إضافتها أولاً من تبويب "إعدادات الفحص".
                                </p>
                            )}
                        </div>
                        <div className="flex justify-end pt-4"><button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded-md">حفظ</button></div>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default InspectionsManagement;