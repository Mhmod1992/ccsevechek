import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useAppContext } from '../context/AppContext';
import { ReportBlock, DataFieldKey, PredefinedFinding, DataGridField, DataGridFieldPart } from '../types';
// Fix: Import 'initialSettings' from constants to fix an undefined variable error.
import { initialRequests, initialClients, initialCars, initialCarMakes, initialCarModels, initialInspectionTypes, initialEmployees, initialSettings } from '../constants';
import Icon from '../components/Icon';

// تحسين: فصل الأيقونات إلى مكون منفصل
// Fix: Use React.ComponentType for the value type to correctly handle memoized components.
const IconLib: Record<string, React.ComponentType<{ className: string; color?: string }>> = {
    'check-circle-solid': memo(({ className, color }: { className: string, color?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill={color || 'currentColor'} className={className}>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
    )),
    'x-circle-solid': memo(({ className, color }: { className: string, color?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill={color || 'currentColor'} className={className}>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
    )),
    'exclamation-triangle-solid': memo(({ className, color }: { className: string, color?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill={color || 'currentColor'} className={className}>
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
    )),
};
IconLib['check-circle-solid'].displayName = 'CheckCircleSolid';
IconLib['x-circle-solid'].displayName = 'XCircleSolid';
IconLib['exclamation-triangle-solid'].displayName = 'ExclamationTriangleSolid';

// تحسين: مكون منفصل لعرض حقل الشبكة
const GridField = memo(({ 
    field, 
    value, 
}: {
    field: DataGridField;
    value: string;
}) => {
    return (
        <>
            {field.showLabel && (
                <div
                    style={{
                        position: 'absolute',
                        left: `${field.labelPart.x}px`,
                        top: `${field.labelPart.y}px`,
                        width: `${field.labelPart.width}px`,
                        height: `${field.labelPart.height}px`,
                        ...field.labelPart.styles,
                        boxSizing: 'border-box'
                    }}
                    className="flex items-center p-1"
                >
                    <span className="select-none pointer-events-none">{field.label}</span>
                </div>
            )}
            {field.showValue && (
                <div
                    style={{
                        position: 'absolute',
                        left: `${field.valuePart.x}px`,
                        top: `${field.valuePart.y}px`,
                        width: `${field.valuePart.width}px`,
                        height: `${field.valuePart.height}px`,
                        ...field.valuePart.styles,
                        boxSizing: 'border-box'
                    }}
                    className="flex items-center p-1"
                >
                    <span className="select-none pointer-events-none">{value}</span>
                </div>
            )}
        </>
    );
});

GridField.displayName = 'GridField';

// تحسين: مكون منفصل لعرض كتلة البيانات
const DataGridBlock = memo(({ 
    block, 
    dataMap
}: {
    block: ReportBlock;
    dataMap: Record<string, any>;
}) => {

    const titleStyles: React.CSSProperties = {
        ...block.properties.titleStyles,
        borderWidth: block.properties.titleStyles?.borderWidth ? block.properties.titleStyles.borderWidth.split(' ').map(b => `${b}px`).join(' ') : undefined,
    };

    return (
        <div 
            style={{
                ...block.properties.styles,
                userSelect: 'none'
            }}
        >
            {block.properties.title && <h2 style={titleStyles}>{block.properties.title}</h2>}
            <div 
                style={{
                    position: 'relative',
                    height: `${block.properties.containerHeight || 200}px`,
                }}
            >
                {(block.properties.gridFields || []).map(field => {
                    let value;
                    const lang = block.properties.carNameLanguage || 'ar';
                    
                    if (Array.isArray(field.key)) {
                        value = dataMap[field.key.join('-')];
                    } else {
                        value = dataMap[field.key];
                    }

                    return (
                        <GridField
                            key={Array.isArray(field.key) ? field.key.join('-') : field.key}
                            field={field}
                            value={value}
                        />
                    );
                })}
            </div>
        </div>
    );
});

DataGridBlock.displayName = 'DataGridBlock';

const ReportPreviewPage: React.FC = () => {
    const { settings, setSettings, setPage, setSettingsPage, customFindingCategories, predefinedFindings, requests, selectedRequestId } = useAppContext();
    
    // Use the actual selected request for the preview, falling back to sample data if none selected
    const { request, client, car, carMake, carModel, inspectionType, employee } = useMemo(() => {
        const currentRequest = requests.find(r => r.id === selectedRequestId);
        if (currentRequest) {
            return {
                request: currentRequest,
                client: initialClients.find(c => c.id === currentRequest.clientId)!,
                car: initialCars.find(c => c.id === currentRequest.carId)!,
                carMake: initialCarMakes.find(m => m.id === initialCars.find(c => c.id === currentRequest.carId)!.makeId)!,
                carModel: initialCarModels.find(m => m.id === initialCars.find(c => c.id === currentRequest.carId)!.modelId)!,
                inspectionType: initialInspectionTypes.find(i => i.id === currentRequest.inspectionTypeId)!,
                employee: initialEmployees.find(e => e.id === currentRequest.employeeId)!
            };
        }
        // Fallback to sample data
        const sampleRequest = initialRequests[0];
        return {
            request: sampleRequest,
            client: initialClients.find(c => c.id === sampleRequest.clientId)!,
            car: initialCars.find(c => c.id === sampleRequest.carId)!,
            carMake: initialCarMakes.find(m => m.id === initialCars.find(c => c.id === sampleRequest.carId)!.makeId)!,
            carModel: initialCarModels.find(m => m.id === initialCars.find(c => c.id === sampleRequest.carId)!.modelId)!,
            inspectionType: initialInspectionTypes.find(i => i.id === sampleRequest.inspectionTypeId)!,
            employee: initialEmployees.find(e => e.id === sampleRequest.employeeId)!
        };
    }, [selectedRequestId, requests]);

    const template = settings.reportTemplate;
    const { reportPageSettings } = settings;

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
    };

    // تحسين: استخدام useMemo لخريطة البيانات
    const dataMap = useMemo(() => {
        const formattedPhone = client.phone && client.phone.length === 10
            ? `${client.phone.slice(0, 3)} ${client.phone.slice(3, 6)} ${client.phone.slice(6)}`
            : client.phone;
        
        const baseMap: Record<string, any> = {
            requestNumber: request.requestNumber.toLocaleString('en-US', { useGrouping: false }),
            date: formatRequestDate(request.createdAt),
            clientName: client.name,
            clientPhone: formattedPhone,
            price: `${request.price.toLocaleString('en-US', { useGrouping: false })} ريال`,
            make: carMake.nameAr,
            model: carModel.nameAr,
            year: car.year.toLocaleString('en-US', { useGrouping: false }),
            plate: car.plateNumber,
            inspectionType: inspectionType.name,
            employeeName: employee.name,
        };

        // إضافة القيم المركبة
        baseMap['make-model-year'] = `${carMake.nameAr} ${carModel.nameAr} ${car.year}`;
        
        return baseMap;
    }, [request, client, car, carMake, carModel, inspectionType, employee]);

    const handleBack = useCallback(() => {
        setPage('fill-request');
    }, [setPage]);

    const handlePrint = useCallback(() => {
        window.print();
    }, []);
    
    const handleGoToSettings = useCallback(() => {
        setSettingsPage('report-template');
        setPage('settings');
    }, [setSettingsPage, setPage]);

    // تحسين: فصل useEffect للمتغيرات CSS
    useEffect(() => {
        document.documentElement.style.setProperty('--page-margin-top', `${reportPageSettings.marginTop}mm`);
        document.documentElement.style.setProperty('--page-margin-right', `${reportPageSettings.marginRight}mm`);
        document.documentElement.style.setProperty('--page-margin-bottom', `${reportPageSettings.marginBottom}mm`);
        document.documentElement.style.setProperty('--page-margin-left', `${reportPageSettings.marginLeft}mm`);

        return () => {
            document.documentElement.style.removeProperty('--page-margin-top');
            document.documentElement.style.removeProperty('--page-margin-right');
            document.documentElement.style.removeProperty('--page-margin-bottom');
            document.documentElement.style.removeProperty('--page-margin-left');
        };
    }, [reportPageSettings]);

    // تحسين: دالة العرض الرئيسية مع memoization
    const renderBlockPreview = useCallback((block: ReportBlock) => {
        const styles: React.CSSProperties = {
            ...block.properties.styles,
            width: block.properties.width ? `${block.properties.width}%` : 'auto',
            height: block.properties.height ? `${block.properties.height}px` : 'auto',
            borderWidth: block.properties.styles?.borderWidth ? 
                block.properties.styles.borderWidth.split(' ').map(b => `${b}px`).join(' ') : undefined,
            borderRadius: block.properties.styles?.borderRadius ? 
                `${block.properties.styles?.borderRadius}px` : undefined
        };

        switch (block.type) {
          case 'HEADER':
            return (
              <header className="flex justify-between items-center" style={styles}>
                <div>
                  {block.properties.showAppName && <h1 className="text-3xl font-bold">{settings.appName}</h1>}
                  <p className="text-lg font-semibold whitespace-pre-wrap">{block.properties.headerText?.replace(/\\n/g, '\n')}</p>
                </div>
                {block.properties.showLogo && settings.logoUrl && <img src={settings.logoUrl} alt="Logo" className="h-20" />}
              </header>
            );
          case 'DATA_GRID':
            const titleStyles: React.CSSProperties = {
                ...block.properties.titleStyles,
                borderWidth: block.properties.titleStyles?.borderWidth ? block.properties.titleStyles.borderWidth.split(' ').map(b => `${b}px`).join(' ') : undefined,
            };
            return (
                 <section style={styles}>
                    {block.properties.title && <h2 style={titleStyles}>{block.properties.title}</h2>}
                    <div 
                        style={{
                            position: 'relative',
                            height: `${block.properties.containerHeight || 200}px`,
                        }}
                    >
                        {(block.properties.gridFields || []).map(field => {
                            let value;
                            const lang = block.properties.carNameLanguage || 'ar';
                            
                            if (Array.isArray(field.key)) {
                                value = dataMap['make-model-year']
                            } else {
                                value = dataMap[field.key];
                            }

                            return (
                                <GridField
                                    key={Array.isArray(field.key) ? field.key.join('-') : field.key}
                                    field={field}
                                    value={value}
                                />
                            );
                        })}
                    </div>
                </section>
            );
          case 'SECTION_TITLE':
            return <h2 className="text-xl font-bold" style={styles}>{block.properties.text}</h2>;
          case 'FINDINGS_SUMMARY': {
            const { summaryTitle = 'ملخص أهم الملاحظات', criticalValues = [] } = block.properties;
            const criticalFindings = (request.structuredFindings || []).filter(finding =>
                criticalValues.includes(finding.value)
            );

            if (criticalFindings.length === 0) {
                return null;
            }
            
            return (
                <section style={{...styles, breakInside: 'avoid', border: '2px solid #EF4444', backgroundColor: '#FEF2F2', padding: '12px', borderRadius: '8px'}}>
                    <div className="flex items-center gap-2 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" style={{color: '#DC2626'}} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <h2 className="text-xl font-bold" style={{color: '#991B1B'}}>{summaryTitle}</h2>
                    </div>
                    <ul className="grid grid-cols-2 gap-x-4 gap-y-1" style={{color: '#B91C1C'}}>
                        {criticalFindings.map(finding => (
                            <li key={finding.findingId}>
                                <span className="font-semibold">{finding.findingName}:</span> {finding.value}
                            </li>
                        ))}
                    </ul>
                </section>
            );
          }
          case 'FINDINGS_TABLE': {
            const categoriesToRender = block.properties.findingCategoryId === 'ALL'
              ? customFindingCategories.filter(c => inspectionType.findingCategoryIds.includes(c.id))
              : customFindingCategories.filter(c => c.id === block.properties.findingCategoryId);

            const { findingLayout = 'table', imageVisibility = false, imageSize = 'medium', imagePosition = 'top', showFindingIcons, iconsByValue } = block.properties;

            return (
                <section style={{ breakInside: 'avoid' }}>
                    {categoriesToRender.map(category => {
                        const findingsForCategory = request.structuredFindings?.filter(f => f.categoryId === category.id) || [];
                        const notesForCategory = request.categoryNotes?.[category.id] || [];
                        if (findingsForCategory.length === 0 && notesForCategory.length === 0) return null;
                        
                        return (
                            <div key={category.id} className="mb-4" style={{breakInside: 'avoid'}}>
                                <h3 className="text-xl font-bold bg-gray-200 p-2 mb-4 border-y border-black">{category.name}</h3>
                                {findingLayout === 'cards' ? (
                                    <div className="flex flex-wrap justify-start gap-3">
                                        {findingsForCategory.map(finding => {
                                            const predefinedFinding = predefinedFindings.find(pf => pf.id === finding.findingId);
                                            const imageUrl = predefinedFinding?.referenceImage;
                                            const iconMap = iconsByValue?.find(i => i.value === finding.value);
                                            const statusColor = iconMap?.color || '#3B82F6'; // default blue
                                            const statusBgColor = `${statusColor}20`; // Add alpha

                                            return (
                                                <div key={finding.findingId} className="rounded-lg text-center p-2 flex flex-col items-center bg-white shadow" style={{ border: `1px solid ${styles.borderColor || '#E5E7EB'}`, breakInside: 'avoid', width: '160px' }}>
                                                    <div className="w-full h-28 flex items-center justify-center mb-2 bg-gray-50 rounded-md" style={{border: `1px solid ${styles.borderColor || '#E5E7EB'}`}}>
                                                        {imageVisibility && imageUrl ? (
                                                            <img src={imageUrl} alt={finding.findingName} className="w-full h-full object-contain p-1" />
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                        )}
                                                    </div>
                                                    <p className="font-semibold text-sm leading-tight mt-1 flex-grow flex items-center justify-center" style={{minHeight: '40px'}}>{finding.findingName}</p>
                                                    <p className="font-bold text-base mt-auto px-3 py-1 rounded-md w-full" style={{ color: statusColor, backgroundColor: statusBgColor }}>{finding.value}</p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : ( // Table layout
                                     <table className="w-full border-collapse text-base mb-4" style={{ border: `1px solid ${styles.borderColor || '#AAAAAA'}` }}>
                                        <thead>
                                            <tr>
                                                {showFindingIcons && <th className="p-2 w-8" style={{ border: `1px solid ${styles.borderColor || '#AAAAAA'}` }}></th>}
                                                <th className="p-2 text-right font-bold w-2/3" style={{ border: `1px solid ${styles.borderColor || '#AAAAAA'}` }}>البند</th>
                                                <th className="p-2 text-right font-bold w-1/3" style={{ border: `1px solid ${styles.borderColor || '#AAAAAA'}` }}>الحالة</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {findingsForCategory.map((finding) => {
                                                const iconMap = iconsByValue?.find(i => i.value === finding.value);
                                                const IconComponent = iconMap ? IconLib[iconMap.icon as keyof typeof IconLib] : null;
                                                return (
                                                    <tr key={finding.findingId}>
                                                        {showFindingIcons && (
                                                            <td className="p-2 text-center" style={{ border: `1px solid ${styles.borderColor || '#AAAAAA'}` }}>
                                                                {IconComponent && <IconComponent className="w-5 h-5 mx-auto" color={iconMap?.color} />}
                                                            </td>
                                                        )}
                                                        <td className="p-2" style={{ border: `1px solid ${styles.borderColor || '#AAAAAA'}` }}>{finding.findingName}</td>
                                                        <td className="p-2 font-semibold" style={{ border: `1px solid ${styles.borderColor || '#AAAAAA'}` }}>{finding.value}</td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                )}
                                {notesForCategory.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-md font-bold underline mb-2">ملاحظات {category.name}:</h4>
                                        <div className="space-y-3">
                                            {notesForCategory.map(note => {
                                                const imageSizeClass = { small: 'w-24', medium: 'w-40', large: 'w-64'}[imageSize];
                                                const positionClasses = {
                                                    top: 'flex-col',
                                                    bottom: 'flex-col-reverse',
                                                    left: 'flex-row gap-4 items-start',
                                                    right: 'flex-row-reverse gap-4 items-start'
                                                };
                                                return (
                                                    <div key={note.id} className={`flex ${positionClasses[imagePosition]} bg-gray-50 p-2 border rounded`} style={{ borderColor: styles.borderColor, breakInside: 'avoid' }}>
                                                        <p className="font-semibold flex-grow">{note.text}</p>
                                                        {imageVisibility && note.image && (
                                                            <img src={note.image} alt="صورة الملاحظة" className={`mt-2 border p-1 rounded object-contain flex-shrink-0 ${imageSizeClass}`} style={{ borderColor: styles.borderColor }} />
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                            </div>
                        );
                    })}
                </section>
            );
          }
          case 'NOTES':
            const notes = block.properties.noteType === 'general' ? request.generalNotes : request.categoryNotes?.[block.properties.noteType!];
            if (!notes || notes.length === 0) return null;
            return (
              <section style={{...styles, breakInside: 'avoid'}}>
                <div className="space-y-1 text-sm">
                  {notes.map((note) => (
                    <div key={note.id} className="flex items-start" style={{direction: 'rtl'}}>
                        <span className="font-semibold me-2 mt-px text-gray-600">+</span>
                        <div className="flex-1">
                            <p className="font-semibold text-gray-800">{note.text}</p>
                            {note.image && <img src={note.image} alt="صورة الملاحظة" className="mt-2 max-w-xs border p-1 rounded" style={{ borderColor: styles.borderColor }} />}
                        </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          case 'DISCLAIMER':
          case 'CUSTOM_TEXT':
            return <p style={styles} className="whitespace-pre-wrap">{block.properties.text?.replace(/\\n/g, '\n')}</p>;
          case 'SPACER':
            return <div style={{ height: block.properties.height || 16 }}></div>;
          case 'DIVIDER':
            return <hr style={{...styles, height: '1px', backgroundColor: styles.borderColor || '#000000', border: 'none'}} />;
          case 'SIGNATURES':
            const titles = block.properties.signatureTitles || [];
            const signatureCount = block.properties.numSignatures || 1;
            return (
              <footer style={{...styles, breakInside: 'avoid'}}>
                <div className="flex justify-around items-start text-sm pt-8">
                  {Array.from({ length: signatureCount }).map((_, i) => (
                    <div key={i} className="text-center">
                      <p className="font-bold">{titles[i] || `توقيع ${i + 1}`}</p>
                      <p className="mt-12">_________________________</p>
                    </div>
                  ))}
                </div>
              </footer>
            );
          case 'IMAGE':
              return <img src={block.properties.imageUrl} style={styles} alt="report element"/>
          case 'PAGE_BREAK':
              return <div className="page-break-element"></div>;
          default:
            return null;
        }
    // Fix: Remove undefined 'sampleData' from dependency array.
    }, [settings, request, dataMap, customFindingCategories, inspectionType, predefinedFindings]);

    return (
        <div className="bg-slate-100 min-h-screen flex flex-col">
            <div className="no-print p-4 bg-white shadow-md flex justify-center items-center gap-4 sticky top-0 z-10 flex-shrink-0">
                <p className="text-xl font-bold text-gray-800">معاينة التقرير</p>
                <button 
                    onClick={handleBack} 
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center font-semibold"
                >
                    <Icon name="back" className="w-5 h-5 me-2" />
                    العودة للتعبئة
                </button>
                <button onClick={handleGoToSettings} className="bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600 flex items-center gap-1 text-sm"><Icon name="edit" className="w-4 h-4"/> تعديل القالب</button>
                <button 
                    onClick={handlePrint} 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center font-semibold"
                >
                    <Icon name="print" className="w-5 h-5 me-2" />
                    طباعة
                </button>
            </div>
            
            <div className="flex-grow overflow-auto py-8">
                <div 
                    className="bg-white shadow-2xl mx-auto p-8 font-sans report-preview-container relative print-area"
                    style={{ 
                        width: '210mm', 
                        minHeight: '297mm', 
                        padding: `${reportPageSettings.marginTop}mm ${reportPageSettings.marginRight}mm ${reportPageSettings.marginBottom}mm ${reportPageSettings.marginLeft}mm`,
                        paddingBottom: '50px' 
                    }}
                >
                    <div className="report-body space-y-4">
                        {template.map(block => (
                            <div key={block.id}>
                                {renderBlockPreview(block)}
                            </div>
                        ))}
                    </div>
                    
                    <div className="no-print absolute bottom-4 left-0 right-0 text-center text-xs text-gray-500">
                        صفحة ١
                    </div>
                    
                    <div className="page-footer-placeholder" style={{ display: 'none' }}>
                        <span className="page-footer-number"></span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(ReportPreviewPage);
