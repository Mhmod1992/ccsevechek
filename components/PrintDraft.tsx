
import React from 'react';
// Fix: Removed unused 'InspectionResult' which was not defined in types.
import { WorkshopRequest, Client, Car, CarMake, CarModel, InspectionType, CustomFindingCategory } from '../types';

interface PrintDraftProps {
  request: WorkshopRequest;
  client: Client;
  car: Car;
  carMake: CarMake;
  carModel: CarModel;
  inspectionType: InspectionType;
  price: number;
  appName: string;
  logoUrl: string;
  customFindingCategories: CustomFindingCategory[];
}

const PrintDraft = React.forwardRef<HTMLDivElement, PrintDraftProps>(({ request, client, car, carMake, carModel, inspectionType, price, appName, logoUrl, customFindingCategories }, ref) => {
  const formattedPhone = client.phone && client.phone.length === 10 
    ? `${client.phone.slice(0, 3)} ${client.phone.slice(3, 6)} ${client.phone.slice(6)}`
    : client.phone;

  return (
    <div ref={ref} className="p-8 bg-white text-black font-sans hidden print-area">
        <header className="flex justify-between items-center border-b-2 border-black pb-4">
            <div>
                <h1 className="text-3xl font-bold">{appName}</h1>
                <p className="text-md">مسودة طلب فحص</p>
            </div>
            {logoUrl && <img src={logoUrl} alt="Logo" className="h-16" />}
        </header>

        <section className="my-6">
            <div className="grid grid-cols-2 gap-4 text-lg">
                <div className="border border-black p-2"><strong>رقم الطلب:</strong> {request.requestNumber.toLocaleString('en-US', { useGrouping: false })}</div>
                <div className="border border-black p-2"><strong>التاريخ:</strong> {new Date(request.createdAt).toLocaleDateString('ar-SA', { numberingSystem: 'latn' })}</div>
                <div className="border border-black p-2"><strong>اسم العميل:</strong> {client.name}</div>
                <div className="border border-black p-2"><strong>رقم الهاتف:</strong> <span style={{direction: 'ltr', display: 'inline-block'}}>{formattedPhone}</span></div>
                <div className="border border-black p-2 col-span-2"><strong>قيمة الفحص:</strong> {price.toLocaleString('en-US', { useGrouping: false })} ريال</div>
            </div>
        </section>

        <section className="my-6">
            <h2 className="text-2xl font-bold border-b border-black mb-4 pb-2">بيانات السيارة</h2>
            <div className="grid grid-cols-2 gap-4 text-lg">
                <div className="border border-black p-2"><strong>الشركة:</strong> {carMake.nameAr}</div>
                <div className="border border-black p-2"><strong>الموديل:</strong> {carModel.nameAr}</div>
                <div className="border border-black p-2"><strong>سنة الصنع:</strong> {car.year.toLocaleString('en-US', { useGrouping: false })}</div>
                <div className="border border-black p-2"><strong>رقم اللوحة:</strong> {car.plateNumber}</div>
            </div>
        </section>

        <section className="my-6">
            <h2 className="text-2xl font-bold border-b border-black mb-4 pb-2">تفاصيل الفحص: {inspectionType.name}</h2>
        </section>

        {(inspectionType.findingCategoryIds || []).map(categoryId => {
            const category = customFindingCategories.find(c => c.id === categoryId);
            if (!category) return null;

            const findingsForCategory = request.structuredFindings?.filter(f => f.categoryId === categoryId) || [];
            const notesForCategory = request.categoryNotes?.[categoryId] || [];

            if (findingsForCategory.length === 0 && notesForCategory.length === 0) {
                return null; // Don't render empty categories
            }

            return (
                <section key={categoryId} className="my-6" style={{ breakInside: 'avoid' }}>
                    <h3 className="text-xl font-bold bg-gray-200 p-2 mb-4 border-y border-black">{category.name}</h3>
                    
                    {findingsForCategory.length > 0 && (
                        <table className="w-full border-collapse border border-black text-lg mb-4">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border border-black p-2 text-right font-bold w-2/3">البند</th>
                                    <th className="border border-black p-2 text-right font-bold w-1/3">الحالة</th>
                                </tr>
                            </thead>
                            <tbody>
                                {findingsForCategory.map((finding, index) => (
                                    <tr key={index}>
                                        <td className="border border-black p-2">{finding.findingName}</td>
                                        <td className="border border-black p-2">{finding.value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {notesForCategory.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-lg font-bold underline">ملاحظات {category.name}:</h4>
                             <ul className="list-disc list-inside space-y-4 text-lg bg-gray-50 p-3 border">
                                {notesForCategory.map((note) => (
                                    <li key={note.id} style={{ breakInside: 'avoid' }}>
                                        <p className="font-semibold">{note.text}</p>
                                        {note.image && <img src={note.image} alt="صورة الملاحظة" className="mt-2 max-w-xs border p-1 rounded" />}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </section>
            );
        })}

        {request.generalNotes && request.generalNotes.length > 0 && (
            <section className="my-6" style={{ breakInside: 'avoid' }}>
                <h2 className="text-2xl font-bold border-b border-black mb-4 pb-2">ملاحظات عامة</h2>
                <ul className="list-disc list-inside space-y-4 text-lg">
                    {request.generalNotes.map((note) => (
                        <li key={note.id} style={{ breakInside: 'avoid' }}>
                            <p className="font-semibold">{note.text}</p>
                            {note.image && <img src={note.image} alt="صورة الملاحظة" className="mt-2 max-w-xs border p-1 rounded" />}
                        </li>
                    ))}
                </ul>
            </section>
        )}

        <footer className="mt-12 pt-4 border-t-2 border-black text-center">
            <p>هذه الوثيقة هي مسودة أولية ولا تتضمن النتائج النهائية.</p>
            <p className="mt-2">توقيع الفني: _________________________</p>
        </footer>
    </div>
  );
});

export default PrintDraft;
