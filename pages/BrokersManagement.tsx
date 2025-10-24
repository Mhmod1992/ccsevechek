import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { Broker } from '../types.ts';
import { v4 as uuidv4 } from 'uuid';
import Modal from '../components/Modal.tsx';
import Icon from '../components/Icon.tsx';

const BrokersManagement: React.FC = () => {
    const { brokers, setBrokers, showConfirmModal, addNotification } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBroker, setCurrentBroker] = useState<Partial<Broker>>({});
    const [isEditing, setIsEditing] = useState(false);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\s/g, '');
        const digits = rawValue.replace(/\D/g, '').slice(0, 10);
        let formatted = digits;

        if (digits.length > 6) {
            formatted = `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
        } else if (digits.length > 3) {
            formatted = `${digits.slice(0, 3)} ${digits.slice(3)}`;
        }

        setCurrentBroker({ ...currentBroker, phone: formatted });
    };

    const handleAdd = () => {
        setCurrentBroker({ name: '', defaultCommission: 0, phone: '' });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleEdit = (broker: Broker) => {
        const formattedPhone = broker.phone && broker.phone.length === 10 
            ? `${broker.phone.slice(0, 3)} ${broker.phone.slice(3, 6)} ${broker.phone.slice(6)}`
            : broker.phone;
        setCurrentBroker({...broker, phone: formattedPhone});
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        showConfirmModal({
            title: 'تأكيد الحذف',
            message: 'هل أنت متأكد من حذف هذا السمسار؟',
            onConfirm: () => {
                setBrokers(brokers.filter(broker => broker.id !== id));
            }
        });
    };

    const handleSave = () => {
        const cleanedPhone = (currentBroker.phone || '').replace(/\D/g, '');

        if (!currentBroker.name?.trim()) {
            addNotification({ title: 'بيانات ناقصة', message: 'الرجاء إدخال اسم السمسار.', type: 'error' });
            return;
        }

        if (cleanedPhone.length !== 10) {
            addNotification({ title: 'خطأ في الإدخال', message: 'رقم الهاتف يجب أن يتكون من 10 أرقام.', type: 'error' });
            return;
        }
        
        const brokerToSave = { ...currentBroker, phone: cleanedPhone };

        if (isEditing) {
            setBrokers(brokers.map(broker => broker.id === brokerToSave.id ? brokerToSave as Broker : broker));
        } else {
            const nextBrokerNumber = brokers.length > 0 ? Math.max(...brokers.map(b => b.brokerNumber)) + 1 : 1;
            setBrokers([...brokers, { 
                ...brokerToSave, 
                id: uuidv4(),
                brokerNumber: nextBrokerNumber,
                isActive: true
            } as Broker]);
        }
        setIsModalOpen(false);
    };
    
    const handleToggleStatus = (id: string) => {
        setBrokers(brokers.map(b => 
            b.id === id ? { ...b, isActive: !b.isActive } : b
        ));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                 <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                    <Icon name="add" className="w-5 h-5 me-2" />
                    إضافة سمسار جديد
                </button>
            </div>
            <div className="overflow-x-auto">
                 <table className="w-full text-right">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3">#</th>
                            <th className="p-3">الاسم</th>
                            <th className="p-3">رقم الهاتف</th>
                            <th className="p-3">العمولة الافتراضية</th>
                            <th className="p-3">الحالة</th>
                            <th className="p-3">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {brokers.map(broker => {
                            const formattedPhone = broker.phone && broker.phone.length === 10 
                                ? `${broker.phone.slice(0, 3)} ${broker.phone.slice(3, 6)} ${broker.phone.slice(6)}`
                                : broker.phone;
                            return (
                                <tr key={broker.id} className="border-b">
                                    <td className="p-3 font-mono">{broker.brokerNumber.toLocaleString('en-US', {useGrouping: false})}</td>
                                    <td className="p-3">{broker.name}</td>
                                    <td className="p-3" style={{direction: 'ltr', textAlign: 'right'}}>{formattedPhone}</td>
                                    <td className="p-3">{broker.defaultCommission.toLocaleString('en-US', { useGrouping: false })}</td>
                                    <td className="p-3">
                                        <label className="switch">
                                            <input type="checkbox" checked={broker.isActive} onChange={() => handleToggleStatus(broker.id)} />
                                            <span className="slider round"></span>
                                        </label>
                                    </td>
                                    <td className="p-3 flex items-center gap-4">
                                        <button onClick={() => handleEdit(broker)} className="text-yellow-500"><Icon name="edit"/></button>
                                        <button onClick={() => handleDelete(broker.id)} className="text-red-500"><Icon name="delete"/></button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                 </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? 'تعديل سمسار' : 'إضافة سمسار جديد'}>
                <div className="space-y-4">
                    {isEditing && currentBroker.brokerNumber && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">الرقم التسلسلي</label>
                            <input type="text" value={currentBroker.brokerNumber} disabled className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100" />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">اسم السمسار</label>
                        <input type="text" value={currentBroker.name || ''} onChange={e => setCurrentBroker({ ...currentBroker, name: e.target.value })} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">رقم الهاتف</label>
                        <input
                            type="tel"
                            value={currentBroker.phone || ''}
                            onChange={handlePhoneChange}
                            placeholder="05X XXX XXXX"
                            maxLength={12}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                            style={{direction: 'ltr', textAlign: 'right'}}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">العمولة الافتراضية</label>
                        <input type="number" value={currentBroker.defaultCommission || 0} onChange={e => setCurrentBroker({ ...currentBroker, defaultCommission: Number(e.target.value) })} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div className="flex justify-end pt-4"><button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded-md">حفظ</button></div>
                </div>
            </Modal>
        </div>
    );
};

export default BrokersManagement;