import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { PredefinedFinding } from '../types';
import { v4 as uuidv4 } from 'uuid';
import Modal from '../components/Modal';
import Icon from '../components/Icon';

interface FindingsManagementProps {
    categoryId: string;
    categoryName: string;
}

const FindingsManagement: React.FC<FindingsManagementProps> = ({ categoryId, categoryName }) => {
    const { predefinedFindings, setPredefinedFindings, showConfirmModal, addNotification } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentFinding, setCurrentFinding] = useState<Partial<PredefinedFinding>>({});
    const [isEditing, setIsEditing] = useState(false);

    const categoryFindings = useMemo(() => {
        return predefinedFindings.filter(f => f.categoryId === categoryId);
    }, [predefinedFindings, categoryId]);

    const handleAdd = () => {
        setCurrentFinding({ name: '', options: [], categoryId: categoryId });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleEdit = (finding: PredefinedFinding) => {
        setCurrentFinding(JSON.parse(JSON.stringify(finding))); // Deep copy
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        showConfirmModal({
            title: 'تأكيد الحذف',
            message: 'هل أنت متأكد من حذف هذا البند؟',
            onConfirm: () => {
                setPredefinedFindings(predefinedFindings.filter(f => f.id !== id));
            }
        });
    };

    const handleSave = () => {
        if (!currentFinding.name?.trim()) {
            addNotification({ title: 'بيانات ناقصة', message: 'الرجاء إدخال اسم البند.', type: 'error' });
            return;
        }

        const findingData = {
            ...currentFinding,
            categoryId, // Ensure categoryId is set correctly
        };

        if (isEditing) {
            setPredefinedFindings(predefinedFindings.map(f => f.id === findingData.id ? findingData as PredefinedFinding : f));
        } else {
            setPredefinedFindings([...predefinedFindings, { ...findingData, id: uuidv4() } as PredefinedFinding]);
        }
        setIsModalOpen(false);
    };

    const handleOptionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const options = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
        setCurrentFinding({ ...currentFinding, options });
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCurrentFinding({ ...currentFinding, referenceImage: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setCurrentFinding({ ...currentFinding, referenceImage: '' });
    };


    return (
        <div className="space-y-6">
            <div className="flex justify-end mb-4">
                 <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                    <Icon name="add" className="w-5 h-5 me-2" />
                    إضافة بند جديد
                </button>
            </div>
            <div>
                 <table className="w-full text-right">
                    <thead className="bg-gray-100"><tr>
                        <th className="p-3">اسم البند</th>
                        <th className="p-3">صورة توضيحية</th>
                        <th className="p-3">الحالات المتاحة</th>
                        <th className="p-3">إجراءات</th>
                    </tr></thead>
                    <tbody>
                        {categoryFindings.map(finding => (
                            <tr key={finding.id} className="border-b">
                                <td className="p-3">{finding.name}</td>
                                <td className="p-3">
                                    {finding.referenceImage && (
                                        <img src={finding.referenceImage} alt={finding.name} className="h-12 w-12 object-cover rounded-md border" />
                                    )}
                                </td>
                                <td className="p-3">{finding.options.join('، ')}</td>
                                <td className="p-3 flex items-center gap-4">
                                    <button onClick={() => handleEdit(finding)} className="text-yellow-500"><Icon name="edit"/></button>
                                    <button onClick={() => handleDelete(finding.id)} className="text-red-500"><Icon name="delete"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`${isEditing ? 'تعديل' : 'إضافة'} بند في "${categoryName}"`}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">اسم البند</label>
                        <input type="text" value={currentFinding.name || ''} onChange={e => setCurrentFinding({ ...currentFinding, name: e.target.value })} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">الحالات (مفصولة بفاصلة ,)</label>
                        <input type="text" placeholder="مثال: سليم, مصبوغ, تالف" value={currentFinding.options?.join(',') || ''} onChange={handleOptionsChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">صورة توضيحية (اختياري)</label>
                        <div className="mt-1 flex items-center gap-4">
                            <input
                                type="file"
                                id={`finding-image-upload-${currentFinding.id || 'new'}`}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                             <label 
                                htmlFor={`finding-image-upload-${currentFinding.id || 'new'}`} 
                                className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 me-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                <span>رفع صورة</span>
                            </label>
                            {currentFinding.referenceImage && (
                                <div className="relative">
                                    <img src={currentFinding.referenceImage} alt="preview" className="h-12 w-12 object-cover rounded border"/>
                                    <button onClick={removeImage} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0 h-4 w-4 flex items-center justify-center text-xs">&times;</button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end pt-4"><button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded-md">حفظ</button></div>
                </div>
            </Modal>
        </div>
    );
};

export default FindingsManagement;