import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const LoginPage: React.FC = () => {
    const { login, settings } = useAppContext();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!login(username, password)) {
            setError('اسم المستخدم أو كلمة المرور غير صحيحة.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-xl w-full max-w-sm">
                <div className="text-center mb-6">
                    {settings.logoUrl && <img src={settings.logoUrl} alt="Logo" className="mx-auto h-16 mb-4" />}
                    <h1 className="text-2xl font-bold text-gray-800">{settings.appName}</h1>
                    <p className="text-gray-500">الرجاء تسجيل الدخول للمتابعة</p>
                </div>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium text-gray-700"
                        >
                            اسم المستخدم
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700"
                        >
                            كلمة المرور
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            تسجيل الدخول
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-xs text-gray-500 text-center">
                    <p>المستخدمون الافتراضيون:</p>
                    <p>مدير عام (صلاحيات كاملة): admin / admin123</p>
                    <p>مدير (تقارير وإدارة عملاء): manager / manager123</p>
                    <p>موظف (طلبات فقط): employee / emp123</p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;