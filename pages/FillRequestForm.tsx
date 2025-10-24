import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { WorkshopRequest, RequestStatus, StructuredFinding, PredefinedFinding, Note } from '../types.ts';
import { v4 as uuidv4 } from 'uuid';
import PrintDraft from '../components/PrintDraft.tsx';
import Icon from '../components/Icon.tsx';
import Modal from '../components/Modal.tsx';

const FillRequestForm: React.FC = () => {
    const { 
        selectedRequestId, requests, setRequests, clients, cars, carMakes, 
        carModels, inspectionTypes, setPage, settings, predefinedFindings, customFindingCategories,
        setSelectedRequestId, addNotification
    } = useAppContext();

    const request = requests.find(r => r.id === selectedRequestId);
    const [generalNotes, setGeneralNotes] = useState<Note[]>([]);
    const [structuredFindings, setStructuredFindings] = useState<StructuredFinding[]>([]);
    const [categoryNotes, setCategoryNotes] = useState<Record<string, Note[]>>({});
    
    // State for new notes inputs
    const [newGeneralNote, setNewGeneralNote] = useState({ text: '', image: null as string | null });
    const [newCategoryNote, setNewCategoryNote] = useState({ text: '', image: null as string | null });

    // State for the new batch finding modal
    const [isFindingModalOpen, setIsFindingModalOpen] = useState(false);
    const [selectedFindingsInModal, setSelectedFindingsInModal] = useState<Set<string>>(new Set());
    
    // State for editing a note modal
    const [isEditNoteModalOpen, setIsEditNoteModalOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<{ note: Note; categoryId: string | 'general' } | null>(null);
    const [modalNoteData, setModalNoteData] = useState<{ text: string; image: string | null }>({ text: '', image: null });
    
    // State for image preview modal
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);


    const printRef = useRef<HTMLDivElement>(null);
    
    const inspectionType = useMemo(() => request ? inspectionTypes.find(i => i.id === request.inspectionTypeId) : undefined, [request, inspectionTypes]);
    
    const visibleFindingCategories = useMemo(() => {
        const visibleIds = inspectionType?.findingCategoryIds || [];
        return customFindingCategories.filter(c => visibleIds.includes(c.id));
    }, [inspectionType, customFindingCategories]);

    const [activeFindingTabId, setActiveFindingTabId] = useState<string | null>(null);

    useEffect(() => {
        const activeCategoryExists = visibleFindingCategories.some(cat => cat.id === activeFindingTabId);
        if (visibleFindingCategories.length > 0) {
            if (!activeFindingTabId || !activeCategoryExists) {
                setActiveFindingTabId(visibleFindingCategories[0].id);
            }
        } else {
            setActiveFindingTabId(null);
        }
    }, [visibleFindingCategories, activeFindingTabId]);

    useEffect(() => {
        if (request) {
            setGeneralNotes(request.generalNotes || []);
            setStructuredFindings(request.structuredFindings || []);
            setCategoryNotes(request.categoryNotes || {});
        }
    }, [request]);

    if (!request) {
        return <div className="p-6">الرجاء اختيار طلب أولاً. <button onClick={() => setPage('requests')} className="text-blue-600">العودة للطلبات</button></div>;
    }

    const client = clients.find(c => c.id === request.clientId);
    const car = cars.find(c => c.id === request.carId);
    const carModel = carModels.find(m => m.id === car?.modelId);
    const carMake = carMakes.find(m => m.id === car?.makeId);
    const formattedPhone = client?.phone && client.phone.length === 10 
        ? `${client.phone.slice(0, 3)} ${client.phone.slice(3, 6)} ${client.phone.slice(6)}`
        : client?.phone;

    const fileToBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<{ text: string, image: string | null }>>) => {
        const file = e.target.files?.[0];
        if (file) {
            const base64 = await fileToBase64(file);
            setter(prev => ({ ...prev, image: base64 }));
        }
        e.target.value = ''; // Allow re-uploading the same file
    };
    
    const handleAddGeneralNote = () => {
        if (newGeneralNote.text.trim()) {
            const noteToAdd: Note = {
                id: uuidv4(),
                text: newGeneralNote.text.trim(),
                image: newGeneralNote.image || undefined,
            };
            setGeneralNotes(prev => [...prev, noteToAdd]);
            setNewGeneralNote({ text: '', image: null });
        }
    };

    const handleRemoveGeneralNote = (idToRemove: string) => {
        setGeneralNotes(prev => prev.filter(note => note.id !== idToRemove));
    };
    
    const handleAddCategoryNote = (categoryId: string | null) => {
        if (newCategoryNote.text.trim() && categoryId) {
            const noteToAdd: Note = {
                id: uuidv4(),
                text: newCategoryNote.text.trim(),
                image: newCategoryNote.image || undefined,
            };
            setCategoryNotes(prev => {
                const currentNotes = prev[categoryId] || [];
                return { ...prev, [categoryId]: [...currentNotes, noteToAdd] };
            });
            setNewCategoryNote({ text: '', image: null });
        }
    };

    const handleRemoveCategoryNote = (categoryId: string | null, idToRemove: string) => {
        if (categoryId) {
            setCategoryNotes(prev => ({
                ...prev,
                [categoryId]: (prev[categoryId] || []).filter(note => note.id !== idToRemove)
            }));
        }
    };
    
    const openEditNoteModal = (note: Note, categoryId: string | 'general') => {
        setEditingNote({ note, categoryId });
        setModalNoteData({ text: note.text, image: note.image || null });
        setIsEditNoteModalOpen(true);
    };
    
    const handleSaveEditedNote = () => {
        if (!editingNote) return;
        const { note, categoryId } = editingNote;
        const updatedNote: Note = {
            ...note,
            text: modalNoteData.text,
            image: modalNoteData.image || undefined
        };
        
        if (categoryId === 'general') {
            setGeneralNotes(prev => prev.map(n => n.id === note.id ? updatedNote : n));
        } else {
            setCategoryNotes(prev => ({
                ...prev,
                [categoryId]: prev[categoryId].map(n => n.id === note.id ? updatedNote : n)
            }));
        }
        
        setIsEditNoteModalOpen(false);
        setEditingNote(null);
    };
    
    const openImagePreview = (imageUrl: string) => {
        setPreviewImageUrl(imageUrl);
        setIsPreviewModalOpen(true);
    };

    const handleSave = async () => {
        setRequests(prev => prev.map(r => {
            if (r.id === request.id) {
                return { ...r, generalNotes, structuredFindings, categoryNotes };
            }
            return r;
        }));
        addNotification({ title: 'نجاح', message: 'تم حفظ البيانات بنجاح.', type: 'success' });
    };

    const handleComplete = async () => {
        setRequests(prev => prev.map(r => {
            if (r.id === request.id) {
                return { ...r, generalNotes, structuredFindings, categoryNotes, status: RequestStatus.Completed };
            }
            return r;
        }));
        addNotification({ title: 'نجاح', message: 'تم تحديد الطلب كمكتمل بنجاح.', type: 'success' });
        setPage('requests');
    };
    
    const handlePrint = () => {
        // The print CSS in index.html will handle showing the correct content.
        window.print();
    };
    
    const handleTabSwitch = (categoryId: string) => {
        setActiveFindingTabId(categoryId);
        setNewCategoryNote({ text: '', image: null });
    };
    
    const handleModalFindingToggle = (findingId: string) => {
        setSelectedFindingsInModal(prev => {
            const newSet = new Set(prev);
            if (newSet.has(findingId)) {
                newSet.delete(findingId);
            } else {
                newSet.add(findingId);
            }
            return newSet;
        });
    };

    const handleAddSelectedFindings = () => {
        const findingsToAdd = predefinedFindings.filter(f => selectedFindingsInModal.has(f.id));
        
        const newStructuredFindings: StructuredFinding[] = findingsToAdd.map(finding => ({
            findingId: finding.id,
            findingName: finding.name,
            value: '',
            categoryId: finding.categoryId,
        }));

        setStructuredFindings(prev => [...prev, ...newStructuredFindings]);
        setIsFindingModalOpen(false);
    };

    const handleFindingValueChange = (findingId: string, newValue: string) => {
        setStructuredFindings(prev => 
            prev.map(sf => 
                sf.findingId === findingId ? { ...sf, value: newValue } : sf
            )
        );
    };
     const handleRemoveFinding = (findingId: string) => {
        setStructuredFindings(prev => prev.filter(sf => sf.findingId !== findingId));
    };

    const renderStructuredFindings = () => {
        if (visibleFindingCategories.length === 0 || !activeFindingTabId) return null;
        
        const activeCategory = customFindingCategories.find(c => c.id === activeFindingTabId);
        const currentCategoryNotes = categoryNotes[activeFindingTabId] || [];

        const allFindingsForCategory = predefinedFindings.filter(f => f.categoryId === activeFindingTabId);
        const addedFindings = structuredFindings.filter(sf => sf.categoryId === activeFindingTabId);
        const availableFindings = allFindingsForCategory.filter(
            af => !addedFindings.some(sf => sf.findingId === af.id)
        );

        return (
            <div>
                 <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8 rtl:space-x-reverse" aria-label="Finding Tabs">
                        {visibleFindingCategories.map(category => (
                            <button
                                key={category.id}
                                onClick={() => handleTabSwitch(category.id)}
                                className={`${activeFindingTabId === category.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-lg focus:outline-none`}
                                aria-current={activeFindingTabId === category.id ? 'page' : undefined}
                            >
                                {category.name}
                            </button>
                        ))}
                    </nav>
                </div>
                
                <div className="p-4 border rounded-md bg-gray-50 mb-6 flex justify-between items-center">
                    <h4 className="font-medium text-gray-800">إضافة بنود للفحص</h4>
                    <button
                        onClick={() => {
                            setSelectedFindingsInModal(new Set());
                            setIsFindingModalOpen(true);
                        }}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center justify-center"
                    >
                        <Icon name="add" className="w-5 h-5 me-2" />
                        اختيار بنود
                    </button>
                </div>

                <h4 className="text-lg font-semibold mb-2 text-gray-700">البنود المضافة</h4>
                <div className="space-y-4">
                     {addedFindings.length > 0 ? (
                        <table className="w-full border-collapse border border-gray-300">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border border-gray-300 p-2 text-right font-medium">البند</th>
                                    <th className="border border-gray-300 p-2 text-right font-medium">الحالة</th>
                                    <th className="border border-gray-300 p-2 text-center w-24 font-medium">إجراء</th>
                                </tr>
                            </thead>
                            <tbody>
                                {addedFindings.map(finding => (
                                    <tr key={finding.findingId}>
                                        <td className="border border-gray-300 p-2">{finding.findingName}</td>
                                        <td className="border border-gray-300 p-1">
                                            <input
                                                type="text"
                                                value={finding.value}
                                                onChange={(e) => handleFindingValueChange(finding.findingId, e.target.value)}
                                                className="w-full p-1 border border-transparent focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md"
                                                placeholder="أدخل الحالة..."
                                            />
                                        </td>
                                        <td className="border border-gray-300 p-2 text-center">
                                            <button
                                                onClick={() => handleRemoveFinding(finding.findingId)}
                                                className="text-red-500 hover:text-red-700 p-1"
                                                aria-label={`حذف ${finding.findingName}`}
                                            >
                                                <Icon name="delete" className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center text-gray-500 p-4 border rounded-md">لم يتم إضافة أي بنود لهذا التبويب بعد.</p>
                    )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                    <h4 className="text-lg font-semibold mb-2 text-gray-700">ملاحظات على {activeCategory?.name}</h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                        {currentCategoryNotes.length > 0 && (
                            <ul className="space-y-2 mb-4">
                                {currentCategoryNotes.map((note) => (
                                    <li key={note.id} className="flex justify-between items-center bg-white p-2 border rounded-md gap-2">
                                        <div className="flex items-center gap-3 flex-grow">
                                            {note.image && <img src={note.image} alt="صورة ملاحظة" className="w-12 h-12 object-cover rounded-md cursor-pointer" onClick={() => openImagePreview(note.image!)} />}
                                            <span className="flex-grow">{note.text}</span>
                                        </div>
                                        <div className="flex-shrink-0 flex items-center gap-2">
                                            <button onClick={() => openEditNoteModal(note, activeFindingTabId)} className="text-yellow-500 hover:text-yellow-700 p-1"><Icon name="edit" className="w-5 h-5" /></button>
                                            <button onClick={() => handleRemoveCategoryNote(activeFindingTabId, note.id)} className="text-red-500 hover:text-red-700 p-1"><Icon name="delete" className="w-5 h-5" /></button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                         <div className="flex flex-col sm:flex-row gap-2">
                             <input 
                                type="text" 
                                placeholder={`أضف ملاحظة جديدة لـ ${activeCategory?.name}...`} 
                                value={newCategoryNote.text} 
                                onChange={e => setNewCategoryNote(prev => ({ ...prev, text: e.target.value }))} 
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddCategoryNote(activeFindingTabId);
                                    }
                                }}
                                className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500" 
                            />
                             <div className="flex-shrink-0 flex items-center gap-2">
                                <label className="cursor-pointer bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300 flex items-center">
                                    <input type="file" className="hidden" accept="image/*" onChange={e => handleImageChange(e, setNewCategoryNote)} />
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 me-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <span>صورة</span>
                                </label>
                                {newCategoryNote.image && <div className="relative"><img src={newCategoryNote.image} className="h-10 w-10 object-cover rounded cursor-pointer" onClick={() => openImagePreview(newCategoryNote.image!)} /><button onClick={() => setNewCategoryNote(p => ({...p, image: null}))} className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">&times;</button></div>}
                                <button onClick={() => handleAddCategoryNote(activeFindingTabId)} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">إضافة</button>
                            </div>
                        </div>
                    </div>
                </div>
                 <Modal isOpen={isFindingModalOpen} onClose={() => setIsFindingModalOpen(false)} title={`اختيار بنود لـ ${activeCategory?.name}`}>
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto p-1 border rounded-md bg-gray-50">
                        {availableFindings.map(finding => (
                            <label key={finding.id} className="flex items-center p-3 hover:bg-gray-100 rounded-md cursor-pointer">
                                <input type="checkbox" checked={selectedFindingsInModal.has(finding.id)} onChange={() => handleModalFindingToggle(finding.id)} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <span className="ms-3 text-gray-700 font-medium">{finding.name}</span>
                                {finding.referenceImage && <img src={finding.referenceImage} alt={finding.name} className="h-10 w-10 object-cover rounded-md ms-auto" />}
                            </label>
                        ))}
                        {availableFindings.length === 0 && ( <p className="text-center text-gray-500 p-4"> تم إضافة جميع البنود المتاحة لهذا التبويب. </p> )}
                    </div>
                    <div className="flex justify-end pt-4 mt-4 border-t gap-2">
                        <button onClick={() => setIsFindingModalOpen(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">إلغاء</button>
                        <button onClick={handleAddSelectedFindings} disabled={selectedFindingsInModal.size === 0} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-green-300"> إضافة ({selectedFindingsInModal.size}) بنود </button>
                    </div>
                </Modal>
            </div>
        )
    };
    
    return (
        <div className="space-y-6">
            <div className="bg-white p-8 rounded-xl shadow-lg mb-6">
                 <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">معلومات الطلب (غير قابلة للتعديل)</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-lg">
                    <p><strong>العميل:</strong> {client?.name}</p>
                    <p><strong>الهاتف:</strong> <span style={{direction: 'ltr', display: 'inline-block'}}>{formattedPhone}</span></p>
                    <p><strong>السيارة:</strong> {carMake?.nameAr} {carModel?.nameAr} {carModel?.category && `(${carModel.category})`}</p>
                    <p><strong>اللوحة:</strong> {car?.plateNumber}</p>
                    <p><strong>سنة الصنع:</strong> {car?.year?.toLocaleString('en-US', { useGrouping: false })}</p>
                    <p><strong>نوع الفحص:</strong> <span className="font-bold">{inspectionType?.name}</span></p>
                    <p><strong>قيمة الفحص:</strong> <span className="font-bold text-blue-600">{request.price.toLocaleString('en-US', { useGrouping: false })} ريال</span></p>
                 </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
                {(visibleFindingCategories.length > 0) ? renderStructuredFindings() : <div className="text-center p-4 text-gray-500">نوع الفحص هذا لا يحتوي على أي تبويبات فحص مهيأة.</div>}
                
                <div className={visibleFindingCategories.length > 0 ? "mt-8 pt-6 border-t" : ""}>
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">ملاحظات عامة على الفحص</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                        {generalNotes.length > 0 && (
                            <ul className="space-y-2 mb-4">
                                {generalNotes.map((note) => (
                                    <li key={note.id} className="flex justify-between items-center bg-white p-2 border rounded-md gap-2">
                                        <div className="flex items-center gap-3 flex-grow">
                                            {note.image && <img src={note.image} alt="صورة ملاحظة" className="w-12 h-12 object-cover rounded-md cursor-pointer" onClick={() => openImagePreview(note.image!)} />}
                                            <span className="flex-grow">{note.text}</span>
                                        </div>
                                        <div className="flex-shrink-0 flex items-center gap-2">
                                            <button onClick={() => openEditNoteModal(note, 'general')} className="text-yellow-500 hover:text-yellow-700 p-1"><Icon name="edit" className="w-5 h-5" /></button>
                                            <button onClick={() => handleRemoveGeneralNote(note.id)} className="text-red-500 hover:text-red-700 p-1"><Icon name="delete" className="w-5 h-5" /></button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input 
                                type="text" 
                                placeholder="أضف ملاحظة جديدة..." 
                                value={newGeneralNote.text} 
                                onChange={e => setNewGeneralNote(prev => ({ ...prev, text: e.target.value }))}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddGeneralNote();
                                    }
                                }}
                                className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500" 
                            />
                            <div className="flex-shrink-0 flex items-center gap-2">
                                <label className="cursor-pointer bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300 flex items-center">
                                    <input type="file" className="hidden" accept="image/*" onChange={e => handleImageChange(e, setNewGeneralNote)} />
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 me-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <span>صورة</span>
                                </label>
                                {newGeneralNote.image && <div className="relative"><img src={newGeneralNote.image} className="h-10 w-10 object-cover rounded cursor-pointer" onClick={() => openImagePreview(newGeneralNote.image!)} /><button onClick={() => setNewGeneralNote(p => ({...p, image: null}))} className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">&times;</button></div>}
                                <button onClick={handleAddGeneralNote} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">إضافة</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-8 mt-6 border-t gap-4 flex-wrap">
                    <button onClick={() => { setSelectedRequestId(request.id); setPage('print-report'); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center font-semibold shadow-md"><Icon name="document-report" className="w-5 h-5 me-2"/> معاينة وتعديل التقرير</button>
                    <button onClick={handlePrint} className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 flex items-center font-semibold shadow-md"><Icon name="print" className="w-5 h-5 me-2"/> طباعة مسودة</button>
                    <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-bold shadow-md">حفظ مؤقت</button>
                    <button onClick={handleComplete} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-bold shadow-md">تحديد كمكتمل</button>
                </div>
            </div>

             <Modal isOpen={isEditNoteModalOpen} onClose={() => setIsEditNoteModalOpen(false)} title="تعديل الملاحظة">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">نص الملاحظة</label>
                        <textarea value={modalNoteData.text} onChange={e => setModalNoteData(prev => ({ ...prev, text: e.target.value }))} rows={4} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">الصورة المرفقة</label>
                        <div className="mt-1 flex items-center gap-4">
                            <label className="cursor-pointer bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300 flex items-center">
                                <input type="file" className="hidden" accept="image/*" onChange={e => handleImageChange(e, setModalNoteData)} />
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 me-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <span>تغيير الصورة</span>
                            </label>
                            {modalNoteData.image && (
                                <div className="relative">
                                    <img src={modalNoteData.image} alt="معاينة" className="h-16 w-16 object-cover rounded border cursor-pointer" onClick={() => openImagePreview(modalNoteData.image!)} />
                                    <button onClick={() => setModalNoteData(p => ({ ...p, image: null }))} className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">&times;</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end pt-4 mt-4 border-t gap-2">
                    <button onClick={() => setIsEditNoteModalOpen(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">إلغاء</button>
                    <button onClick={handleSaveEditedNote} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">حفظ التعديلات</button>
                </div>
            </Modal>
            
            <Modal isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} title="معاينة الصورة">
                <div className="flex justify-center items-center p-4">
                    {previewImageUrl && <img src={previewImageUrl} alt="معاينة مكبرة" className="max-w-full max-h-[80vh] object-contain rounded-lg" />}
                </div>
            </Modal>

            {request && client && car && carMake && carModel && inspectionType &&
                <PrintDraft 
                    ref={printRef}
                    request={{...request, generalNotes, structuredFindings, categoryNotes}}
                    client={client}
                    car={car}
                    carMake={carMake}
                    carModel={carModel}
                    inspectionType={inspectionType}
                    price={request.price}
                    appName={settings.appName}
                    logoUrl={settings.logoUrl}
                    customFindingCategories={customFindingCategories}
                />
            }
        </div>
    );
};

export default FillRequestForm;