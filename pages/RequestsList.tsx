
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { RequestStatus, Employee } from '../types';
import Icon from '../components/Icon';

const RequestsList: React.FC = () => {
    const { requests, clients, cars, carMakes, carModels, employees, setPage, setSelectedRequestId, authUser } = useAppContext();
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [filterEmployee, setFilterEmployee] = useState<string>('All');
    const [filterDate, setFilterDate] = useState<string>('');
    const [filterMake, setFilterMake] = useState<string>('All');
    const [filterModel, setFilterModel] = useState<string>('All');

    const baseRequests = useMemo(() => {
        if (authUser && !authUser.isGeneralManager && !authUser.permissions.canViewReports) {
            // Basic employee: only show non-completed requests
            return requests.filter(r => r.status !== RequestStatus.Completed);
        }
        // Admins and managers can see all requests
        return requests;
    }, [requests, authUser]);


    const filteredRequests = useMemo(() => {
        return baseRequests.filter(req => {
            const statusMatch = filterStatus === 'All' || req.status === filterStatus;
            const employeeMatch = filterEmployee === 'All' || req.employeeId === filterEmployee;
            const dateMatch = !filterDate || new Date(req.createdAt).toISOString().startsWith(filterDate);

            const car = cars.find(c => c.id === req.carId);
            const makeMatch = filterMake === 'All' || (car && car.makeId === filterMake);
            const modelMatch = filterModel === 'All' || (car && car.modelId === filterModel);

            return statusMatch && employeeMatch && dateMatch && makeMatch && modelMatch;
        });
    }, [baseRequests, cars, filterStatus, filterEmployee, filterDate, filterMake, filterModel]);

    const handleFillRequest = (id: string) => {
        setSelectedRequestId(id);
        setPage('fill-request');
    };

    const handleMakeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterMake(e.target.value);
        setFilterModel('All'); // Reset model filter when make changes
    };

    const isBasicEmployee = authUser && !authUser.isGeneralManager && !authUser.permissions.canViewReports;


    return (
        <div className="space-y-6">
            <div className="p-6 bg-white rounded-xl shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">فلترة بالحالة</label>
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500">
                            <option value="All">الكل</option>
                            {Object.values(RequestStatus).filter(s => !(isBasicEmployee && s === RequestStatus.Completed)).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">فلترة بالموظف</label>
                        <select value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500">
                            <option value="All">الكل</option>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">فلترة بالشركة</label>
                        <select value={filterMake} onChange={handleMakeChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500">
                            <option value="All">الكل</option>
                            {carMakes.map(m => <option key={m.id} value={m.id}>{m.nameAr}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">فلترة بالموديل</label>
                        <select value={filterModel} onChange={e => setFilterModel(e.target.value)} disabled={filterMake === 'All'} className="mt-1 block w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500">
                            <option value="All">الكل</option>
                            {carModels.filter(m => m.makeId === filterMake).map(m => <option key={m.id} value={m.id}>{m.nameAr}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">فلترة بالتاريخ</label>
                        <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-4 font-semibold">#</th>
                                <th className="p-4 font-semibold">العميل</th>
                                <th className="p-4 font-semibold">السيارة</th>
                                <th className="p-4 font-semibold">السعر</th>
                                <th className="p-4 font-semibold">الحالة</th>
                                <th className="p-4 font-semibold">التاريخ</th>
                                <th className="p-4 font-semibold">الموظف</th>
                                <th className="p-4 font-semibold">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.map(req => {
                                const client = clients.find(c => c.id === req.clientId);
                                const car = cars.find(c => c.id === req.carId);
                                const carModel = carModels.find(m => m.id === car?.modelId);
                                const carMake = carMakes.find(m => m.id === car?.makeId);
                                const employee = employees.find(e => e.id === req.employeeId);
                                const isCompleted = req.status === RequestStatus.Completed;

                                return (
                                    <tr key={req.id} className="border-b hover:bg-gray-50">
                                        <td className="p-4">{req.requestNumber.toLocaleString('en-US', { useGrouping: false })}</td>
                                        <td className="p-4">{client?.name || 'N/A'}</td>
                                        <td className="p-4">{carMake?.nameAr} {carModel?.nameAr} {carModel?.category && `(${carModel.category})`} ({car?.plateNumber})</td>
                                        <td className="p-4 font-semibold">{req.price.toLocaleString('en-US', { useGrouping: false })} ريال</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${req.status === RequestStatus.Completed ? 'bg-green-100 text-green-800' : req.status === RequestStatus.New ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="p-4">{new Date(req.createdAt).toLocaleDateString('ar-SA', { numberingSystem: 'latn' })}</td>
                                        <td className="p-4">{employee?.name || 'N/A'}</td>
                                        <td className="p-4">
                                            <button 
                                                onClick={() => handleFillRequest(req.id)} 
                                                className="text-blue-600 hover:text-blue-800 flex items-center disabled:text-gray-400 disabled:cursor-not-allowed font-semibold"
                                                disabled={isBasicEmployee && isCompleted}
                                            >
                                                <Icon name="fill" className="w-5 h-5 me-1" />
                                                تعبئة/عرض
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RequestsList;