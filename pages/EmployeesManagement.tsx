import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Employee } from '../types';
import { v4 as uuidv4 } from 'uuid';
import Modal from '../components/Modal';
import Icon from '../components/Icon';

const EmployeesManagement: React.FC = () => {
    const { employees, setEmployees, authUser, showConfirmModal, addNotification } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState<Partial<Employee>>({});
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (currentEmployee.isGeneralManager) {
            setCurrentEmployee(e => ({
                ...e,
                permissions: {
                    canCreateRequests: true,
                    canManageClients: true,
                    canViewReports: true,
                    canAccessSettings: true,
                }
            }));
        }
    }, [currentEmployee.isGeneralManager]);

    const handleAdd = () => {
        setCurrentEmployee({ 
            name: '', 
            username: '', 
            password: '', 
            profilePictureUrl: '',
            isGeneralManager: false,
            permissions: { canCreateRequests: true, canManageClients: false, canViewReports: false, canAccessSettings: false }
        });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleEdit = (employee: Employee) => {
        // Create a copy and clear the password for security in the form
        const employeeToEdit = { ...employee, password: '' };
        setCurrentEmployee(employeeToEdit);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        const employeeToDelete = employees.find(e => e.id === id);
        if (employeeToDelete?.isGeneralManager) {
            const generalManagers = employees.filter(e => e.isGeneralManager);
            if (generalManagers.length <= 1) {
                addNotification({ title: 'خطأ', message: 'لا يمكن حذف المدير العام الوحيد في النظام.', type: 'error' });
                return;
            }
        }
        showConfirmModal({
            title: 'تأكيد الحذف',
            message: 'هل أنت متأكد من حذف هذا الموظف؟',
            onConfirm: () => {
                setEmployees(employees.filter(e => e.id !== id));
            }
        });
    };
    
    const handleSave = () => {
        if (!currentEmployee.name?.trim() || !currentEmployee.username?.trim()) {
            addNotification({ title: 'بيانات ناقصة', message: 'الرجاء إدخال اسم الموظف واسم المستخدم.', type: 'error' });
            return;
        }

        if (!isEditing && !currentEmployee.password?.trim()) {
            addNotification({ title: 'بيانات ناقصة', message: 'الرجاء إدخال كلمة المرور للموظف الجديد.', type: 'error' });
            return;
        }

        const employeeToSave = { ...currentEmployee };

        if (isEditing) {
            if (!employeeToSave.password) {
                const originalEmployee = employees.find(e => e.id === employeeToSave.id);
                employeeToSave.password = originalEmployee?.password;
            }
            setEmployees(employees.map(e => e.id === employeeToSave.id ? employeeToSave as Employee : e));
        } else {
            setEmployees([...employees, { ...employeeToSave, id: uuidv4() } as Employee]);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                    <Icon name="add" className="w-5 h-5 me-2" />
                    إضافة موظف جديد
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3">الاسم</th>
                            <th className="p-3">اسم المستخدم</th>
                            <th className="p-3">الصلاحيات</th>
                            <th className="p-3">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map(employee => (
                            <tr key={employee.id} className="border-b">
                                <td className="p-3">{employee.name} {employee.isGeneralManager && <span className="text-xs text-blue-600 font-bold">(مدير عام)</span>}</td>
                                <td className="p-3 font-mono">{employee.username}</td>
                                <td className="p-3 text-sm">
                                    {employee.permissions && <ul className="list-disc list-inside">
                                        {employee.permissions.canCreateRequests && <li>إدارة الطلبات</li>}
                                        {employee.permissions.canManageClients && <li>إدارة العملاء</li>}
                                        {employee.permissions.canViewReports && <li>عرض التقارير</li>}
                                        {employee.permissions.canAccessSettings && <li>الوصول للإعدادات</li>}
                                    </ul>}
                                </td>
                                <td className="p-3 flex items-center gap-4">
                                    <button onClick={() => handleEdit(employee)} className="text-yellow-500"><Icon name="edit"/></button>
                                    {authUser?.id !== employee.id && (
                                        <button onClick={() => handleDelete(employee.id)} className="text-red-500"><Icon name="delete"/></button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? 'تعديل موظف' : 'إضافة موظف جديد'}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">اسم الموظف</label>
                        <input type="text" value={currentEmployee.name || ''} onChange={e => setCurrentEmployee({ ...currentEmployee, name: e.target.value })} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">اسم المستخدم</label>
                        <input type="text" value={currentEmployee.username || ''} onChange={e => setCurrentEmployee({ ...currentEmployee, username: e.target.value })} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">كلمة المرور {isEditing && '(اتركها فارغة لعدم التغيير)'}</label>
                        <input type="password" value={currentEmployee.password || ''} onChange={e => setCurrentEmployee({ ...currentEmployee, password: e.target.value })} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">الصلاحيات</label>
                        <div className="mt-2 space-y-2">
                             <label className="flex items-center">
                                <input type="checkbox" checked={currentEmployee.isGeneralManager || false} onChange={e => setCurrentEmployee({ ...currentEmployee, isGeneralManager: e.target.checked })} />
                                <span className="ms-2">مدير عام (كافة الصلاحيات)</span>
                            </label>
                            {!currentEmployee.isGeneralManager && (
                                <div className="ps-4 border-s-2 space-y-1">
                                    <label className="flex items-center">
                                        <input type="checkbox" checked={currentEmployee.permissions?.canCreateRequests || false} onChange={e => setCurrentEmployee({ ...currentEmployee, permissions: { ...currentEmployee.permissions!, canCreateRequests: e.target.checked } })} />
                                        <span className="ms-2">إنشاء وتعبئة الطلبات</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input type="checkbox" checked={currentEmployee.permissions?.canManageClients || false} onChange={e => setCurrentEmployee({ ...currentEmployee, permissions: { ...currentEmployee.permissions!, canManageClients: e.target.checked } })} />
                                        <span className="ms-2">إدارة العملاء</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input type="checkbox" checked={currentEmployee.permissions?.canViewReports || false} onChange={e => setCurrentEmployee({ ...currentEmployee, permissions: { ...currentEmployee.permissions!, canViewReports: e.target.checked } })} />
                                        <span className="ms-2">عرض التقارير</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input type="checkbox" checked={currentEmployee.permissions?.canAccessSettings || false} onChange={e => setCurrentEmployee({ ...currentEmployee, permissions: { ...currentEmployee.permissions!, canAccessSettings: e.target.checked } })} />
                                        <span className="ms-2">الوصول للإعدادات</span>
                                    </label>
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

export default EmployeesManagement;
