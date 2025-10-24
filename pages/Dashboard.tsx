
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { RequestStatus } from '../types';
import Icon from '../components/Icon';

const StatCard: React.FC<{ title: string; value: number; icon: string; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg flex items-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl">
    <div className={`p-4 rounded-full me-4 ${color}`}>
      <Icon name={icon} className="w-8 h-8 text-white" />
    </div>
    <div>
      <p className="text-gray-500 text-lg font-semibold">{title}</p>
      <p className="text-4xl font-bold text-gray-800">{value.toLocaleString('en-US', { useGrouping: false })}</p>
    </div>
  </div>
);


const Dashboard: React.FC = () => {
  const { requests, clients, cars } = useAppContext();

  const newRequests = requests.filter(r => r.status === RequestStatus.New).length;
  const completedRequests = requests.filter(r => r.status === RequestStatus.Completed).length;

  return (
    <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="إجمالي الطلبات" value={requests.length} icon="requests" color="bg-blue-500" />
        <StatCard title="الطلبات الجديدة" value={newRequests} icon="add" color="bg-yellow-500" />
        <StatCard title="الطلبات المكتملة" value={completedRequests} icon="cars" color="bg-green-500" />
        <StatCard title="إجمالي العملاء" value={clients.length} icon="clients" color="bg-indigo-500" />
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">أحدث 5 طلبات</h3>
            <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-4 font-semibold">#</th>
                            <th className="p-4 font-semibold">العميل</th>
                            <th className="p-4 font-semibold">السيارة</th>
                            <th className="p-4 font-semibold">الحالة</th>
                            <th className="p-4 font-semibold">التاريخ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.slice(0,5).map(req => {
                            const client = clients.find(c => c.id === req.clientId);
                            const car = cars.find(c => c.id === req.carId);
                            return (
                                <tr key={req.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4">{req.requestNumber.toLocaleString('en-US', { useGrouping: false })}</td>
                                    <td className="p-4">{client?.name}</td>
                                    <td className="p-4">{car?.plateNumber}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${req.status === RequestStatus.Completed ? 'bg-green-100 text-green-800' : req.status === RequestStatus.New ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="p-4">{new Date(req.createdAt).toLocaleDateString('ar-SA', { numberingSystem: 'latn' })}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                  </table>
            </div>
        </div>
    </div>
  );
};

export default Dashboard;