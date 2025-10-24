import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { Client } from '../types.ts';
import { v4 as uuidv4 } from 'uuid';
import Modal from '../components/Modal.tsx';
import Icon from '../components/Icon.tsx';

const ClientsManagement: React.FC = () => {
    const { clients, setClients, addClient, showConfirmModal, addNotification } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentClient, setCurrentClient] = useState<Partial<Client>>({});
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredClients = useMemo(() => {
        return clients.filter(client =>
            client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.phone.includes(searchTerm)
        );
    }, [clients, searchTerm]);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\s/g, '');
        const digits = rawValue.replace(/\D/g, '').slice(0, 10);
        let formatted = digits;

        if (digits.length > 6) {
            formatted = `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
        } else if (digits.length > 3) {
            formatted = `${digits.slice(0, 3)} ${digits.slice(3)}`;
        }

        setCurrentClient({ ...currentClient, phone: formatted });
    };

    const handleAdd = () => {
        setCurrentClient({});
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleEdit = (client: Client) => {
        const formattedPhone = client.phone && client.phone.length === 10 
            ? `${client.phone.slice(0, 3)} ${client.phone.slice(3, 6)} ${client.phone.slice(6)}`
            : client.phone;
        setCurrentClient({...client, phone: formattedPhone});
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        showConfirmModal({
            title: 'تأكيد الحذف',
            message: 'هل أنت متأكد من حذف هذا العميل؟ لا يمكن التراجع عن هذا الإجراء.',
            onConfirm: () => {
                setClients(clients.filter(client => client.id !== id));
            }
        });
    };

    const handleSave = () => {
        const cleanedPhone = (currentClient.phone || '').replace(/\D/g, '');

        if (!currentClient.name?.trim() || !cleanedPhone) {
            addNotification({ title: 'بيانات ناقصة', message: 'الرجاء إدخال اسم ورقم هاتف العميل.', type: 'error' });
            return;
        }

        if (cleanedPhone.length !== 10) {
            addNotification({ title: 'خطأ في الإدخال', message: 'رقم الهاتف يجب أن يتكون من 10 أرقام.', type: 'error' });
            return;
        }
        
        const clientToSave = { ...currentClient, phone: cleanedPhone };

        if (isEditing) {
            setClients(clients.map(client => client.id === clientToSave.id ? clientToSave as Client : client));
        } else {
            addClient({ ...clientToSave, id: uuidv4() } as Client);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="p-4 bg-white rounded-xl shadow-lg flex justify-between items-center">
                <input
                    type="text"
                    placeholder="ابحث بالاسم أو رقم الهاتف..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md w-1/3 shadow-sm focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center font-semibold shadow-md hover:shadow-lg transition-transform hover:scale-105">
                    <Icon name="add" className="w-5 h-5 me-2" />
                    إضافة عميل جديد
                </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-4 font-semibold">الاسم</th>
                                <th className="p-4 font-semibold">رقم الهاتف</th>
                                <th className="p-4 font-semibold">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClients.map(client => {
                                const formattedPhone = client.phone && client.phone.length === 10 
                                    ? `${client.phone.slice(0, 3)} ${client.phone.slice(3, 6)} ${client.phone.slice(6)}`
                                    : client.phone;
                                return (
                                <tr key={client.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4">{client.name}</td>
                                    <td className="p-4" style={{direction: 'ltr', textAlign: 'right'}}>{formattedPhone}</td>
                                    <td className="p-4 flex items-center gap-4">
                                        <button onClick={() => handleEdit(client)} className="text-yellow-500 hover:text-yellow-700 p-1"><Icon name="edit" className="w-6 h-6"/></button>
                                        <button onClick={() => handleDelete(client.id)} className="text-red-500 hover:text-red-700 p-1"><Icon name="delete" className="w-6 h-6"/></button>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? 'تعديل عميل' : 'إضافة عميل جديد'}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">اسم العميل</label>
                        <input
                            type="text"
                            value={currentClient.name || ''}
                            onChange={e => setCurrentClient({ ...currentClient, name: e.target.value })}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">رقم الهاتف</label>
                        <input
                            type="tel"
                            value={currentClient.phone || ''}
                            onChange={handlePhoneChange}
                            placeholder="05X XXX XXXX"
                            maxLength={12}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                            style={{direction: 'ltr', textAlign: 'right'}}
                        />
                    </div>
                    <div className="flex justify-end pt-4 gap-2">
                        <button onClick={() => setIsModalOpen(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 font-semibold">إلغاء</button>
                        <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-semibold">حفظ</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ClientsManagement;