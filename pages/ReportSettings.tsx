import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../context/AppContext';
import { ReportBlock, StyleProperties, DataFieldKey, ReportBlockType, FindingLayout, ImageSize, ImagePosition, DataGridField, DataGridFieldPart, Settings as SettingsType } from '../types';
import { initialRequests, initialClients, initialCars, initialCarMakes, initialCarModels, initialInspectionTypes, initialEmployees, initialSettings } from '../constants';
import Icon from '../components/Icon';

const dataFieldLabels: Record<DataFieldKey, string> = {
    requestNumber: 'رقم التقرير', date: 'التاريخ', clientName: 'اسم العميل', clientPhone: 'رقم الهاتف',
    price: 'قيمة الفحص', make: 'الشركة', model: 'الموديل', year: 'سنة الصنع', plate: 'رقم اللوحة/الشاصي',
    inspectionType: 'نوع الفحص', employeeName: 'الفاحص المسؤول'
};


// Generic Input Control
const InputControl = ({ label, value, onChange, type = 'text', children, ...props }: any) => {
    const Component = type === 'textarea' ? 'textarea' : type === 'select' ? 'select' : 'input';
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <Component
                type={type}
                value={value}
                onChange={(e: any) => onChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm"
                {...props}
            >
                {children}
            </Component>
        </div>
    )
};

// Sub-component for the Properties Sidebar
const PropertiesPanel: React.FC<{
    block: ReportBlock;
    onUpdate: (updatedBlock: ReportBlock) => void;
    onBack: () => void;
}> = ({ block, onUpdate, onBack }) => {
    
    const { customFindingCategories } = useAppContext();

    const updateProperty = (key: string, value: any) => {
        onUpdate({ ...block, properties: { ...block.properties, [key]: value } });
    };

    const updateStyle = (key: keyof StyleProperties, value: any) => {
        onUpdate({
            ...block,
            properties: {
                ...block.properties,
                styles: { ...block.properties.styles, [key]: value }
            }
        });
    };
    
    const updateIconMapping = (index: number, field: 'value' | 'icon' | 'color', fieldValue: string) => {
        const newIconsByValue = [...(block.properties.iconsByValue || [])];
        newIconsByValue[index] = { ...newIconsByValue[index], [field]: fieldValue };
        updateProperty('iconsByValue', newIconsByValue);
    };

    const addIconMapping = () => {
        const newIconsByValue = [...(block.properties.iconsByValue || []), { value: '', icon: 'information-circle-solid', color: '#000000' }];
        updateProperty('iconsByValue', newIconsByValue);
    };

    const removeIconMapping = (index: number) => {
        const newIconsByValue = (block.properties.iconsByValue || []).filter((_, i) => i !== index);
        updateProperty('iconsByValue', newIconsByValue);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 pb-4 border-b mb-4">
                <button onClick={onBack} className="p-2 rounded-md hover:bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </button>
                <h3 className="text-lg font-bold text-gray-800">خصائص العنصر: {block.type}</h3>
            </div>
            <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                {/* Block-specific properties */}
                {(block.type === 'CUSTOM_TEXT' || block.type === 'SECTION_TITLE' || block.type === 'DISCLAIMER') &&
                    <InputControl label="النص" value={block.properties.text || ''} onChange={v => updateProperty('text', v)} type="textarea" />}
                {block.type === 'SPACER' &&
                    <InputControl label="الارتفاع (px)" value={block.properties.height || 16} onChange={v => updateProperty('height', Number(v))} type="number" />}
                
                {block.type === 'FINDINGS_SUMMARY' && (
                    <div className="space-y-4 p-2 bg-gray-50 rounded-md">
                        <InputControl label="عنوان الملخص" value={block.properties.summaryTitle || ''} onChange={(v: string) => updateProperty('summaryTitle', v)} />
                        <InputControl 
                            label="القيم الحرجة (مفصولة بفاصلة)" 
                            value={(block.properties.criticalValues || []).join(',')} 
                            onChange={(v: string) => updateProperty('criticalValues', v.split(',').map(s => s.trim()))}
                            type="textarea"
                            placeholder="تالف,يوجد,تحتاج تغيير"
                        />
                    </div>
                )}

                {block.type === 'FINDINGS_TABLE' && (
                    <div className="space-y-4">
                        <details open className="space-y-3 p-2 bg-gray-50 rounded-md">
                            <summary className="font-semibold cursor-pointer">إعدادات التخطيط</summary>
                            <InputControl label="تخطيط عرض النتائج" value={block.properties.findingLayout || 'table'} onChange={(v: FindingLayout) => updateProperty('findingLayout', v)} type="select">
                                <option value="table">جدول</option>
                                <option value="cards">بطاقات</option>
                            </InputControl>
                        </details>
                        
                        <details className="space-y-3 p-2 bg-gray-50 rounded-md">
                            <summary className="font-semibold cursor-pointer">إعدادات الصور</summary>
                             <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={block.properties.imageVisibility || false} onChange={e => updateProperty('imageVisibility', e.target.checked)} />
                                <span>إظهار الصور المرفقة بالملاحظات</span>
                            </label>
                            {block.properties.imageVisibility && (
                                <div className="space-y-3 border-t pt-2 mt-2">
                                     <InputControl label="حجم الصورة" value={block.properties.imageSize || 'medium'} onChange={(v: ImageSize) => updateProperty('imageSize', v)} type="select">
                                        <option value="small">صغير</option>
                                        <option value="medium">متوسط</option>
                                        <option value="large">كبير</option>
                                    </InputControl>
                                    <InputControl label="موضع الصورة" value={block.properties.imagePosition || 'top'} onChange={(v: ImagePosition) => updateProperty('imagePosition', v)} type="select">
                                        <option value="top">أعلى</option>
                                        <option value="bottom">أسفل</option>
                                        <option value="left">يسار</option>
                                        <option value="right">يمين</option>
                                    </InputControl>
                                </div>
                            )}
                        </details>
                        
                        <details className="space-y-3 p-2 bg-gray-50 rounded-md">
                            <summary className="font-semibold cursor-pointer">إعدادات الأيقونات</summary>
                             <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={block.properties.showFindingIcons || false} onChange={e => updateProperty('showFindingIcons', e.target.checked)} />
                                <span>إظهار أيقونات الحالة</span>
                            </label>
                             {block.properties.showFindingIcons && (
                                <div className="space-y-2 border-t pt-2 mt-2">
                                    <p className="text-xs text-gray-500">اربط قيمة الحالة بأيقونة ولون معين.</p>
                                    {block.properties.iconsByValue?.map((map, index) => (
                                        <div key={index} className="flex gap-2 items-center p-2 border rounded-md">
                                            <input type="text" placeholder="القيمة" value={map.value} onChange={e => updateIconMapping(index, 'value', e.target.value)} className="w-full p-1 border rounded" />
                                            <input type="text" placeholder="اسم الأيقونة" value={map.icon} onChange={e => updateIconMapping(index, 'icon', e.target.value)} className="w-full p-1 border rounded" />
                                            <input type="color" value={map.color} onChange={e => updateIconMapping(index, 'color', e.target.value)} className="p-0 h-8 w-8 border-none rounded" />
                                            <button onClick={() => removeIconMapping(index)} className="text-red-500"><Icon name="delete" className="w-4 h-4"/></button>
                                        </div>
                                    ))}
                                    <button onClick={addIconMapping} className="text-sm text-blue-600">+ إضافة ربط جديد</button>
                                </div>
                            )}
                        </details>
                    </div>
                )}
                
                {block.type === 'DATA_GRID' && (
                    <div className="space-y-3 p-2 bg-gray-50 rounded-md">
                         <InputControl 
                            label="ارتفاع الحاوية (px)" 
                            type="number" 
                            value={block.properties.containerHeight || 200} 
                            onChange={(v: string) => updateProperty('containerHeight', parseInt(v, 10))}
                         />
                    </div>
                )}
                <details className="p-2 bg-gray-50 rounded-md">
                    <summary className="font-semibold cursor-pointer">إعدادات التصميم المتقدمة</summary>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-2 border-t pt-2">
                        <InputControl label="لون الخط" type="color" value={block.properties.styles?.color || '#000000'} onChange={v => updateStyle('color', v)} />
                        <InputControl label="لون الخلفية" type="color" value={block.properties.styles?.backgroundColor || '#FFFFFF'} onChange={v => updateStyle('backgroundColor', v)} />
                        <InputControl label="حجم الخط (px, em, rem)" value={block.properties.styles?.fontSize || ''} onChange={v => updateStyle('fontSize', v)} />
                        <InputControl label="عائلة الخط" value={block.properties.styles?.fontFamily || ''} onChange={v => updateStyle('fontFamily', v)} />
                        <InputControl label="وزن الخط" value={block.properties.styles?.fontWeight || 'normal'} onChange={v => updateStyle('fontWeight', v)} type="select">
                            <option value="normal">عادي</option><option value="bold">عريض</option>
                        </InputControl>
                        <InputControl label="المحاذاة" value={block.properties.styles?.textAlign || 'right'} onChange={v => updateStyle('textAlign', v)} type="select">
                            <option value="right">يمين</option><option value="center">وسط</option><option value="left">يسار</option>
                        </InputControl>
                        <InputControl label="الهامش (margin)" value={block.properties.styles?.margin || ''} onChange={v => updateStyle('margin', v)} placeholder="e.g., 10px 0" />
                        <InputControl label="الحشو (padding)" value={block.properties.styles?.padding || ''} onChange={v => updateStyle('padding', v)} placeholder="e.g., 8px" />
                        <InputControl label="عرض الإطار (T R B L)" value={block.properties.styles?.borderWidth || ''} onChange={v => updateStyle('borderWidth', v)} placeholder="e.g., 0 0 1 0" />
                        <InputControl label="لون الإطار" type="color" value={block.properties.styles?.borderColor || '#000000'} onChange={v => updateStyle('borderColor', v)} />
                        <InputControl label="نمط الإطار" value={block.properties.styles?.borderStyle || 'none'} onChange={v => updateStyle('borderStyle', v)} type="select">
                            <option value="none">بدون</option><option value="solid">صلب</option><option value="dashed">متقطع</option><option value="dotted">منقط</option>
                        </InputControl>
                        <InputControl label="تدوير الزوايا (px)" value={block.properties.styles?.borderRadius || ''} onChange={v => updateStyle('borderRadius', v)} placeholder="e.g., 8" />
                    </div>
                </details>
            </div>
        </div>
    );
};

// Sub-component for the list of current blocks
const BlocksListPanel: React.FC<{
    template: ReportBlock[];
    setTemplate: React.Dispatch<React.SetStateAction<ReportBlock[]>>;
    onSelectBlock: (id: string) => void;
    selectedBlockId: string | null;
    showConfirmModal: (options: { title: string; message: string; onConfirm: () => void; }) => void;
}> = ({ template, setTemplate, onSelectBlock, selectedBlockId, showConfirmModal }) => {
    
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);
    
    const deleteBlock = (id: string) => {
        showConfirmModal({
            title: 'تأكيد حذف العنصر',
            message: 'هل أنت متأكد من حذف هذا العنصر من القالب؟',
            onConfirm: () => {
                setTemplate(template.filter(b => b.id !== id));
            }
        });
    };
    
    const handleDragSort = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        const newTemplate = [...template];
        const draggedItemContent = newTemplate.splice(dragItem.current, 1)[0];
        newTemplate.splice(dragOverItem.current, 0, draggedItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        setTemplate(newTemplate);
    };

    return (
        <div className="flex flex-col h-full">
            <h3 className="text-lg font-bold text-gray-800 pb-4 border-b mb-4">عناصر التقرير</h3>
            <div className="flex-grow overflow-y-auto space-y-2 pr-2">
                {template.map((block, index) => (
                    <div
                        key={block.id}
                        draggable
                        onDragStart={() => dragItem.current = index}
                        onDragEnter={() => dragOverItem.current = index}
                        onDragEnd={handleDragSort}
                        onDragOver={(e) => e.preventDefault()}
                        onClick={() => onSelectBlock(block.id)}
                        className={`flex items-center gap-2 p-2 border rounded-md cursor-grab active:cursor-grabbing ${selectedBlockId === block.id ? 'bg-blue-100 border-blue-400' : 'bg-white hover:bg-gray-50'}`}
                    >
                        <Icon name="move" className="w-5 h-5 text-gray-400" />
                        <span className="flex-grow font-medium text-sm text-gray-700">{block.type}</span>
                        <button onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }} className="text-red-500 p-1 rounded hover:bg-red-100" aria-label="Delete block"><Icon name="delete" className="w-4 h-4"/></button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// New Panel for Page Settings
const PageSettingsPanel: React.FC<{
    settings: SettingsType['reportPageSettings'];
    onChange: (newSettings: SettingsType['reportPageSettings']) => void;
}> = ({ settings, onChange }) => {
    const handleMarginChange = (margin: keyof typeof settings, value: string) => {
        onChange({ ...settings, [margin]: parseInt(value, 10) || 0 });
    };

    return (
        <div className="flex flex-col h-full">
            <h3 className="text-lg font-bold text-gray-800 pb-4 border-b mb-4">إعدادات الصفحة</h3>
            <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                <div className="p-2 bg-gray-50 rounded-md">
                    <p className="font-semibold text-sm mb-2">هوامش الصفحة (mm)</p>
                    <div className="grid grid-cols-2 gap-3">
                        <InputControl label="الأعلى" type="number" value={settings.marginTop} onChange={(v: string) => handleMarginChange('marginTop', v)} />
                        <InputControl label="الأسفل" type="number" value={settings.marginBottom} onChange={(v: string) => handleMarginChange('marginBottom', v)} />
                        <InputControl label="اليمين" type="number" value={settings.marginRight} onChange={(v: string) => handleMarginChange('marginRight', v)} />
                        <InputControl label="اليسار" type="number" value={settings.marginLeft} onChange={(v: string) => handleMarginChange('marginLeft', v)} />
                    </div>
                </div>
            </div>
        </div>
    );
};


// Sub-component for the top toolbar
const ToolsPanel: React.FC<{
    onAddBlock: (type: ReportBlockType) => void;
    onSave: () => void;
    onReset: () => void;
    onPreview: () => void;
    onToggleInspector: () => void;
}> = ({ onAddBlock, onSave, onReset, onPreview, onToggleInspector }) => {
    
    const blockTypes: { type: ReportBlockType; label: string; group: string }[] = [
        { type: 'DATA_GRID', label: 'بيانات الطلب', group: 'data' },
        { type: 'FINDINGS_TABLE', label: 'نتائج الفحص', group: 'data' },
        { type: 'FINDINGS_SUMMARY', label: 'ملخص النتائج', group: 'data' },
        { type: 'NOTES', label: 'ملاحظات', group: 'data' },
        { type: 'CUSTOM_TEXT', label: 'نص مخصص', group: 'design' },
        { type: 'SECTION_TITLE', label: 'عنوان قسم', group: 'design' },
        { type: 'SIGNATURES', label: 'تواقيع', group: 'design' },
        { type: 'IMAGE', label: 'صورة', group: 'design' },
        { type: 'DIVIDER', label: 'فاصل', group: 'layout' },
        { type: 'SPACER', label: 'مسافة', group: 'layout' },
        { type: 'PAGE_BREAK', label: 'فاصل صفحات', group: 'layout' },
    ];

    const renderGroup = (groupName: string, title: string, color: string) => (
         <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">{title}:</span>
            <div className="flex items-center gap-2">
                {blockTypes.filter(b => b.group === groupName).map(b => 
                    <button key={b.type} onClick={() => onAddBlock(b.type)} className={`text-sm p-2 rounded ${color}`}>
                        {b.label}
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="flex justify-between items-center w-full flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
                <button 
                    onClick={onToggleInspector} 
                    className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2 text-sm"
                    title="إخفاء/إظهار لوحة الخصائص"
                >
                    <Icon name="findings" className="w-5 h-5"/>
                    <span>اللوحة الجانبية</span>
                </button>
                <div className="h-6 w-px bg-gray-300"></div>
                {renderGroup('data', 'بيانات', 'bg-blue-100 hover:bg-blue-200')}
                <div className="h-6 w-px bg-gray-300"></div>
                {renderGroup('design', 'تصميم', 'bg-green-100 hover:bg-green-200')}
                <div className="h-6 w-px bg-gray-300"></div>
                {renderGroup('layout', 'تنسيق', 'bg-gray-200 hover:bg-gray-300')}
            </div>
             <div className="flex gap-2 flex-wrap">
                <button onClick={onPreview} className="bg-sky-500 text-white px-3 py-2 rounded-lg hover:bg-sky-600 flex items-center gap-1 text-sm"><Icon name="document-report" className="w-4 h-4"/> معاينة</button>
                <button onClick={onReset} className="bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600 flex items-center gap-1 text-sm"><Icon name="delete" className="w-4 h-4"/> استرجاع</button>
                <button onClick={onSave} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 font-bold text-sm"><Icon name="add" className="w-5 h-5"/> حفظ القالب</button>
            </div>
        </div>
    );
};


const ReportSettings: React.FC = () => {
    const { settings, setSettings, setPage, showConfirmModal, addNotification, customFindingCategories, predefinedFindings } = useAppContext();
    const [template, setTemplate] = useState<ReportBlock[]>(settings.reportTemplate);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [selectedGridField, setSelectedGridField] = useState<{ key: DataFieldKey | DataFieldKey[], part: 'label' | 'value' } | null>(null);
    const [isInspectorVisible, setIsInspectorVisible] = useState(true);
    const [inspectorTab, setInspectorTab] = useState<'blocks' | 'page'>('blocks');
    
    const [actionState, setActionState] = useState<{
        type: 'move' | 'resize';
        blockId: string;
        fieldKey?: DataFieldKey | DataFieldKey[];
        part?: 'label' | 'value';
        startX: number;
        startY: number;
        initialX: number;
        initialY: number;
        initialWidth: number;
        initialHeight: number;
    } | null>(null);

    // Ensure local state is updated if global settings change
    useEffect(() => {
        setTemplate(settings.reportTemplate);
    }, [settings.reportTemplate]);
    
    // Mouse move and up handlers for resizing/moving
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!actionState) return;

            const dx = e.clientX - actionState.startX;
            const dy = e.clientY - actionState.startY;

            setTemplate(prevTemplate => 
                prevTemplate.map(block => {
                    if (block.id !== actionState.blockId) return block;
                    
                    if (actionState.fieldKey && actionState.part) { // Field Part Action
                        const newGridFields = (block.properties.gridFields || []).map(field => {
                            if (JSON.stringify(field.key) !== JSON.stringify(actionState.fieldKey)) return field;
                            
                            const partName = actionState.part === 'label' ? 'labelPart' : 'valuePart';
                            const partToUpdate = field[partName];
                            let updatedPart: DataGridFieldPart;

                            if (actionState.type === 'move') {
                                updatedPart = {...partToUpdate, x: Math.round(actionState.initialX + dx), y: Math.round(actionState.initialY + dy) };
                            } else { // resize
                                updatedPart = {...partToUpdate, width: Math.max(20, Math.round(actionState.initialWidth + dx)), height: Math.max(20, Math.round(actionState.initialHeight + dy)) };
                            }

                            return {...field, [partName]: updatedPart };
                        });
                        return {...block, properties: {...block.properties, gridFields: newGridFields}};
                    } else if (actionState.type === 'resize') { // Container resize
                        const newHeight = Math.max(50, Math.round(actionState.initialHeight + dy));
                        return {...block, properties: {...block.properties, containerHeight: newHeight }};
                    }
                    return block;
                })
            );
        };

        const handleMouseUp = () => {
            setActionState(null);
        };

        if (actionState) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [actionState, setTemplate]);
    
    const handleSave = () => {
        setSettings(prev => ({ ...prev, reportTemplate: template }));
        addNotification({ title: 'نجاح', message: 'تم حفظ قالب التقرير بنجاح!', type: 'success' });
    };

    const handleReset = () => {
        showConfirmModal({
            title: 'استرجاع القالب الافتراضي',
            message: 'هل أنت متأكد من استرجاع القالب الافتراضي؟ ستفقد جميع التغييرات الحالية.',
            onConfirm: () => {
                const { reportTemplate: defaultTemplate } = initialSettings;
                setTemplate(defaultTemplate);
            }
        });
    }

    const handlePreview = () => {
        setSettings(prev => ({ ...prev, reportTemplate: template }));
        setPage('report-preview');
    };
    
    const updateBlock = (updatedBlock: ReportBlock) => {
        const newTemplate = template.map(b => b.id === updatedBlock.id ? updatedBlock : b);
        setTemplate(newTemplate);
    };
    
    const updateGridFieldPart = (blockId: string, fieldKey: DataFieldKey | DataFieldKey[], part: 'label' | 'value', updatedPart: DataGridFieldPart) => {
        setTemplate(prevTemplate => 
            prevTemplate.map(block => {
                if (block.id !== blockId) return block;
                const newGridFields = (block.properties.gridFields || []).map(field => {
                    if (JSON.stringify(field.key) !== JSON.stringify(fieldKey)) return field;
                    const partName = part === 'label' ? 'labelPart' : 'valuePart';
                    return { ...field, [partName]: updatedPart };
                });
                return {...block, properties: {...block.properties, gridFields: newGridFields }};
            })
        );
    };
    
    const toggleGridField = (blockId: string, fieldKey: DataFieldKey) => {
         setTemplate(prevTemplate => 
            prevTemplate.map(block => {
                if (block.id !== blockId) return block;
                const existingFields = block.properties.gridFields || [];
                const fieldExists = existingFields.some(f => f.key === fieldKey);
                
                let newGridFields;
                if(fieldExists) {
                    newGridFields = existingFields.filter(f => f.key !== fieldKey);
                } else {
                    const newField: DataGridField = {
                        key: fieldKey,
                        label: dataFieldLabels[fieldKey],
                        showLabel: true,
                        showValue: true,
                        labelPart: { x: 10, y: 10, width: 100, height: 40, styles: { fontWeight: 'bold' } },
                        valuePart: { x: 110, y: 10, width: 120, height: 40, styles: {} },
                    };
                    newGridFields = [...existingFields, newField];
                }
                return {...block, properties: {...block.properties, gridFields: newGridFields }};
            })
        );
    }

    const addBlock = (type: ReportBlockType) => {
        const newBlock: ReportBlock = {
            id: uuidv4(),
            type,
            properties: { 
                text: 'نص جديد', 
                height: 20, 
                numSignatures: 3, 
                signatureTitles:['الفني المسؤول', 'استلام العميل', 'مدير الفحص'], 
                noteType: 'general',
                findingLayout: 'table',
                imageVisibility: false,
                imageSize: 'medium',
                imagePosition: 'top',
                showFindingIcons: false,
                iconsByValue: [],
                summaryTitle: 'ملخص أهم الملاحظات',
                criticalValues: ['تالف', 'يوجد', 'يوجد تسريب', 'تحتاج تغيير', 'ممسوح', 'معجون'],
                styles: { textAlign: 'right', borderColor: '#000000' }
            }
        };

        if (type === 'DATA_GRID') {
            const defaultGrid = initialSettings.reportTemplate.find(b => b.type === 'DATA_GRID');
            newBlock.properties = {...newBlock.properties, ...defaultGrid?.properties };
        }
        setTemplate(prev => [...prev, newBlock]);
    };

    const handlePageSettingsChange = (newPageSettings: SettingsType['reportPageSettings']) => {
        setSettings(prev => ({ ...prev, reportPageSettings: newPageSettings }));
    };

    const selectedBlock = template.find(b => b.id === selectedBlockId);
    const selectedGridFieldData = selectedBlock?.properties.gridFields?.find(f => JSON.stringify(f.key) === JSON.stringify(selectedGridField?.key));
    const selectedPartData = selectedGridFieldData && selectedGridField ? selectedGridFieldData[selectedGridField.part === 'label' ? 'labelPart' : 'valuePart'] : null;
    
    const formatRequestDate = (dateString: string) => {
        const date = new Date(dateString);
        const h_utc = date.getUTCHours();
        const m_utc = date.getUTCMinutes();
        const period_utc = h_utc >= 12 ? 'pm' : 'am';
        const hour12_utc = h_utc % 12 || 12;
        const day_utc = date.getUTCDate();
        const month_utc = date.getUTCMonth() + 1;
        const year_utc = date.getUTCFullYear();
        return `${period_utc} ${hour12_utc}.${String(m_utc).padStart(2,'0')} ${day_utc}/${month_utc}/${year_utc}`;
    }

    // Sample data for preview
    const sampleRequest = initialRequests[0];
    const sampleClient = initialClients.find(c => c.id === sampleRequest.clientId)!;
    const sampleCar = initialCars.find(c => c.id === sampleRequest.carId)!;
    const sampleCarMake = initialCarMakes.find(m => m.id === sampleCar.makeId)!;
    const sampleCarModel = initialCarModels.find(m => m.id === sampleCar.modelId)!;
    const sampleInspectionType = initialInspectionTypes.find(i => i.id === sampleRequest.inspectionTypeId)!;
    const sampleEmployee = initialEmployees.find(e => e.id === sampleRequest.employeeId)!;
    const dataMap: Record<string, any> = {
        requestNumber: sampleRequest.requestNumber.toLocaleString('en-US', { useGrouping: false }),
        date: formatRequestDate(sampleRequest.createdAt),
        clientName: sampleClient.name, clientPhone: '050 123 4567',
        price: `${sampleRequest.price.toLocaleString('en-US', { useGrouping: false })} ريال`,
        make: sampleCarMake.nameAr, model: sampleCarModel.nameAr,
        year: sampleCar.year.toLocaleString('en-US', { useGrouping: false }), plate: sampleCar.plateNumber,
        inspectionType: sampleInspectionType.name, employeeName: sampleEmployee.name,
    };
     dataMap['make-model-year'] = `${sampleCarMake.nameAr} ${sampleCarModel.nameAr} ${sampleCar.year}`;

    const renderBlockPreview = (block: ReportBlock) => {
         const blockStyles: React.CSSProperties = {
            position: 'relative',
            ...block.properties.styles,
            width: block.properties.width ? `${block.properties.width}%` : 'auto',
            height: block.properties.height ? `${block.properties.height}px` : 'auto',
            borderWidth: block.properties.styles?.borderWidth ? block.properties.styles.borderWidth.split(' ').map(b => `${b}px`).join(' ') : undefined,
            borderRadius: block.properties.styles?.borderRadius ? `${block.properties.styles?.borderRadius}px`: undefined,
        };
        
        switch(block.type) {
            case 'PAGE_BREAK':
                return (
                    <div className="text-center text-gray-400 my-4 py-2 border-y-2 border-dashed border-gray-300 select-none">
                        --- فاصل صفحات ---
                    </div>
                );

            case 'DATA_GRID':
                return (
                    <div
                        style={{...blockStyles, height: `${block.properties.containerHeight || 200}px`, userSelect: 'none'}}
                        className="border border-dashed border-gray-400"
                        onMouseDown={() => setSelectedGridField(null)} // Deselect field on container click
                    >
                        {(block.properties.gridFields || []).map(field => (
                            <React.Fragment key={Array.isArray(field.key) ? field.key.join('-') : field.key}>
                               {field.showLabel && (
                                    <div
                                        onClick={(e) => { e.stopPropagation(); setSelectedBlockId(block.id); setSelectedGridField({key: field.key, part: 'label'}); }}
                                        onMouseDown={(e) => { e.stopPropagation(); setSelectedBlockId(block.id); setSelectedGridField({key: field.key, part: 'label'}); setActionState({ type: 'move', blockId: block.id, fieldKey: field.key, part: 'label', startX: e.clientX, startY: e.clientY, initialX: field.labelPart.x, initialY: field.labelPart.y, initialWidth: field.labelPart.width, initialHeight: field.labelPart.height }); }}
                                        style={{ position: 'absolute', left: field.labelPart.x, top: field.labelPart.y, width: field.labelPart.width, height: field.labelPart.height, ...field.labelPart.styles, cursor: 'move', boxSizing: 'border-box' }}
                                        className={`flex items-center p-1 border-2 ${JSON.stringify(selectedGridField?.key) === JSON.stringify(field.key) && selectedGridField?.part === 'label' ? 'border-blue-500 border-dashed' : 'border-transparent'}`}
                                    >
                                        <span className="select-none pointer-events-none">{field.label}</span>
                                        {JSON.stringify(selectedGridField?.key) === JSON.stringify(field.key) && selectedGridField?.part === 'label' && (
                                            <div onMouseDown={(e) => { e.stopPropagation(); setActionState({ type: 'resize', blockId: block.id, fieldKey: field.key, part: 'label', startX: e.clientX, startY: e.clientY, initialX: field.labelPart.x, initialY: field.labelPart.y, initialWidth: field.labelPart.width, initialHeight: field.labelPart.height }); }} className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-se-resize" />
                                        )}
                                    </div>
                               )}
                               {field.showValue && (
                                    <div
                                        onClick={(e) => { e.stopPropagation(); setSelectedBlockId(block.id); setSelectedGridField({key: field.key, part: 'value'}); }}
                                        onMouseDown={(e) => { e.stopPropagation(); setSelectedBlockId(block.id); setSelectedGridField({key: field.key, part: 'value'}); setActionState({ type: 'move', blockId: block.id, fieldKey: field.key, part: 'value', startX: e.clientX, startY: e.clientY, initialX: field.valuePart.x, initialY: field.valuePart.y, initialWidth: field.valuePart.width, initialHeight: field.valuePart.height }); }}
                                        style={{ position: 'absolute', left: field.valuePart.x, top: field.valuePart.y, width: field.valuePart.width, height: field.valuePart.height, ...field.valuePart.styles, cursor: 'move', boxSizing: 'border-box' }}
                                        className={`flex items-center p-1 border-2 ${JSON.stringify(selectedGridField?.key) === JSON.stringify(field.key) && selectedGridField?.part === 'value' ? 'border-blue-500 border-dashed' : 'border-transparent'}`}
                                    >
                                        <span className="select-none pointer-events-none">{Array.isArray(field.key) ? field.key.map(k => dataMap[k]).join(' ') : dataMap[field.key as DataFieldKey]}</span>
                                        {JSON.stringify(selectedGridField?.key) === JSON.stringify(field.key) && selectedGridField?.part === 'value' && (
                                            <div onMouseDown={(e) => { e.stopPropagation(); setActionState({ type: 'resize', blockId: block.id, fieldKey: field.key, part: 'value', startX: e.clientX, startY: e.clientY, initialX: field.valuePart.x, initialY: field.valuePart.y, initialWidth: field.valuePart.width, initialHeight: field.valuePart.height }); }} className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-se-resize" />
                                        )}
                                    </div>
                               )}
                            </React.Fragment>
                        ))}
                        {selectedBlockId === block.id && !selectedGridField && (
                            <div
                                onMouseDown={(e) => { e.stopPropagation(); setActionState({ type: 'resize', blockId: block.id, startX: e.clientX, startY: e.clientY, initialX: 0, initialY: 0, initialWidth: 0, initialHeight: block.properties.containerHeight || 200, }); }}
                                className="absolute left-1/2 -translate-x-1/2 w-24 h-4 -bottom-2 cursor-s-resize flex items-center justify-center group"
                            >
                                <div className="w-16 h-1.5 bg-gray-300 group-hover:bg-blue-500 rounded-full"></div>
                            </div>
                        )}
                    </div>
                );
             case 'HEADER':
                return (
                  <header className="flex justify-between items-center" style={blockStyles}>
                    <div>
                      {block.properties.showAppName && <h1 className="text-3xl font-bold">{settings.appName}</h1>}
                      <p className="text-lg font-semibold whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: block.properties.headerText?.replace(/\\n/g, '<br/>') || ''}}></p>
                    </div>
                    {block.properties.showLogo && settings.logoUrl && <img src={settings.logoUrl} alt="Logo" className="h-20" />}
                  </header>
                );
            case 'SPACER':
                return <div style={{ height: block.properties.height || 16, ...blockStyles }}></div>;
            default:
                 return <div style={blockStyles} className="p-2 border border-dashed border-gray-400">محتوى {block.type}</div>
        }
    }

    const GridFieldPartPropertiesPanel = () => {
        if (!selectedPartData || !selectedGridFieldData || !selectedGridField) return null;
        
        const updatePart = (updatedValues: Partial<DataGridFieldPart>) => {
            updateGridFieldPart(selectedBlock!.id, selectedGridField.key, selectedGridField.part, { ...selectedPartData, ...updatedValues });
        };
        const updateStyle = (styleKey: keyof StyleProperties, value: any) => {
            updatePart({ styles: { ...selectedPartData.styles, [styleKey]: value } });
        }

        return (
            <div className="flex flex-col h-full">
                 <div className="flex items-center gap-2 pb-4 border-b mb-4">
                    <button onClick={() => setSelectedGridField(null)} className="p-2 rounded-md hover:bg-gray-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </button>
                    <h3 className="text-lg font-bold text-gray-800">خصائص: {selectedGridField.part === 'label' ? selectedGridFieldData.label : 'القيمة'}</h3>
                </div>
                <div className="flex-grow overflow-y-auto space-y-3 pr-2">
                    <div className="grid grid-cols-2 gap-2">
                         <InputControl label="X" type="number" value={selectedPartData.x} onChange={(v: string) => updatePart({ x: parseInt(v, 10) || 0 })} />
                         <InputControl label="Y" type="number" value={selectedPartData.y} onChange={(v: string) => updatePart({ y: parseInt(v, 10) || 0 })} />
                         <InputControl label="Width" type="number" value={selectedPartData.width} onChange={(v: string) => updatePart({ width: parseInt(v, 10) || 100 })} />
                         <InputControl label="Height" type="number" value={selectedPartData.height} onChange={(v: string) => updatePart({ height: parseInt(v, 10) || 40 })} />
                    </div>
                    <details open className="p-2 bg-gray-50 rounded-md">
                         <summary className="font-semibold cursor-pointer text-sm">أنماط</summary>
                         <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-2 border-t pt-2">
                            <InputControl label="لون الخط" type="color" value={selectedPartData.styles.color || '#000000'} onChange={(v:string) => updateStyle('color', v)} />
                            <InputControl label="حجم الخط" value={selectedPartData.styles.fontSize || ''} onChange={(v:string) => updateStyle('fontSize', v)} />
                            <InputControl label="وزن الخط" value={selectedPartData.styles.fontWeight || 'normal'} onChange={(v: string) => updateStyle('fontWeight', v as 'normal' | 'bold')} type="select">
                                <option value="normal">عادي</option><option value="bold">عريض</option>
                            </InputControl>
                            <InputControl label="المحاذاة" value={selectedPartData.styles.textAlign || 'right'} onChange={(v: string) => updateStyle('textAlign', v as 'left' | 'center' | 'right')} type="select">
                                <option value="right">يمين</option><option value="center">وسط</option><option value="left">يسار</option>
                            </InputControl>
                         </div>
                    </details>
                </div>
            </div>
        )
    };
    
    const DataGridPropertiesPanel = () => (
        <div className="flex flex-col h-full">
             <div className="flex items-center gap-2 pb-4 border-b mb-4">
                <button onClick={() => setSelectedBlockId(null)} className="p-2 rounded-md hover:bg-gray-100">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </button>
                <h3 className="text-lg font-bold text-gray-800">خصائص: بيانات الطلب</h3>
            </div>
             <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                 <InputControl label="ارتفاع الحاوية (px)" type="number" value={selectedBlock?.properties.containerHeight || 200} onChange={(v:string) => updateBlock({...selectedBlock!, properties: {...selectedBlock!.properties, containerHeight: parseInt(v)}})} />
                 
                <div className="p-2 mt-2 bg-gray-50 rounded-md">
                    <label className="font-semibold text-sm block mb-2">لغة عرض اسم السيارة</label>
                    <div className="flex flex-col gap-2">
                        {(['ar', 'en', 'both'] as const).map(lang => {
                            const labels = { ar: 'العربية فقط', en: 'الإنجليزية فقط', both: 'العربية والإنجليزية' };
                            return (
                                <label key={lang} className="flex items-center p-2 rounded hover:bg-gray-100 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="carNameLanguage"
                                        value={lang}
                                        checked={(selectedBlock?.properties.carNameLanguage || 'ar') === lang}
                                        onChange={(e) => updateBlock({ ...selectedBlock!, properties: { ...selectedBlock!.properties, carNameLanguage: e.target.value as 'ar' | 'en' | 'both' }})}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <span className="ms-3 text-sm font-medium text-gray-700">{labels[lang]}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                 <div>
                    <label className="font-semibold block mb-2 text-sm">الحقول الظاهرة</label>
                    <div className="grid grid-cols-2 gap-2 border p-2 rounded-md bg-gray-50">
                        {Object.entries(dataFieldLabels).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-2 p-1 rounded hover:bg-gray-100 text-sm">
                                <input
                                    type="checkbox"
                                    checked={selectedBlock?.properties.gridFields?.some(f => f.key === key) || false}
                                    onChange={() => toggleGridField(selectedBlock!.id, key as DataFieldKey)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span>{label}</span>
                            </label>
                        ))}
                    </div>
                 </div>
                 <details className="p-2 bg-gray-50 rounded-md">
                    <summary className="font-semibold cursor-pointer text-sm">تصميم الحاوية</summary>
                     <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-2 border-t pt-2">
                        <InputControl label="لون الخلفية" type="color" value={selectedBlock?.properties.styles?.backgroundColor || '#FFFFFF'} onChange={(v: string) => updateBlock({...selectedBlock!, properties: {...selectedBlock!.properties, styles: {...selectedBlock!.properties.styles, backgroundColor: v}}})} />
                        <InputControl label="لون الإطار" type="color" value={selectedBlock?.properties.styles?.borderColor || '#DDDDDD'} onChange={(v: string) => updateBlock({...selectedBlock!, properties: {...selectedBlock!.properties, styles: {...selectedBlock!.properties.styles, borderColor: v}}})} />
                     </div>
                </details>
             </div>
        </div>
    );


    return (
        <div className="flex flex-col h-full" style={{ maxHeight: 'calc(100vh - 122px)'}}>
            {/* Top Toolbar */}
            <div className="bg-white p-3 shadow-md flex-shrink-0 border-b z-30">
                <ToolsPanel onAddBlock={addBlock} onSave={handleSave} onReset={handleReset} onPreview={handlePreview} onToggleInspector={() => setIsInspectorVisible(v => !v)} />
            </div>

            {/* Main Content Area */}
            <div className="flex-grow flex flex-row overflow-hidden bg-slate-200">
                {/* Inspector Panel (Sliding) */}
                <aside 
                    className={`
                        flex-shrink-0 bg-transparent overflow-hidden
                        transition-all duration-300 ease-in-out
                        ${isInspectorVisible ? 'w-[400px] p-6' : 'w-0 p-0'}
                    `}
                >
                    <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col h-full overflow-hidden">
                        {/* Inspector Tabs */}
                        <div className="flex-shrink-0 border-b mb-2">
                            <nav className="flex space-x-2">
                                <button onClick={() => setInspectorTab('blocks')} className={`px-4 py-2 text-sm font-medium rounded-t-md ${inspectorTab === 'blocks' ? 'bg-gray-100 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                                    العناصر
                                </button>
                                <button onClick={() => setInspectorTab('page')} className={`px-4 py-2 text-sm font-medium rounded-t-md ${inspectorTab === 'page' ? 'bg-gray-100 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                                    الصفحة
                                </button>
                            </nav>
                        </div>

                        <div className="flex-grow overflow-y-auto">
                             {inspectorTab === 'page' && (
                                <PageSettingsPanel settings={settings.reportPageSettings} onChange={handlePageSettingsChange} />
                            )}
                            {inspectorTab === 'blocks' && (
                                !selectedBlockId ? (
                                     <BlocksListPanel
                                        template={template}
                                        setTemplate={setTemplate}
                                        onSelectBlock={(id) => { setSelectedBlockId(id); setSelectedGridField(null); }}
                                        selectedBlockId={selectedBlockId}
                                        showConfirmModal={showConfirmModal}
                                    />
                                ) : selectedBlock?.type === 'DATA_GRID' ? (
                                    selectedGridField ? <GridFieldPartPropertiesPanel /> : <DataGridPropertiesPanel />
                                ) : (
                                    <PropertiesPanel
                                        block={selectedBlock!}
                                        onUpdate={updateBlock}
                                        onBack={() => setSelectedBlockId(null)}
                                    />
                                )
                            )}
                        </div>
                    </div>
                </aside>
                
                {/* Preview Canvas */}
                <main className="flex-grow overflow-y-auto flex justify-center p-6">
                    <div 
                        className="bg-white shadow-2xl space-y-4 font-sans flex-shrink-0 border border-gray-300"
                        style={{ 
                            width: '210mm', 
                            minHeight: '297mm',
                            padding: `${settings.reportPageSettings.marginTop}mm ${settings.reportPageSettings.marginRight}mm ${settings.reportPageSettings.marginBottom}mm ${settings.reportPageSettings.marginLeft}mm`,
                        }}
                        onClick={() => { setSelectedGridField(null); }}
                    >
                       {template.map(block => (
                           <div key={block.id} onClick={(e) => { e.stopPropagation(); setSelectedBlockId(block.id); setSelectedGridField(null); }}>
                               {renderBlockPreview(block)}
                           </div>
                       ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ReportSettings;