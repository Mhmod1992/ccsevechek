import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { v4 as uuidv4 } from 'uuid';
import { Client, Car, CarMake, CarModel, WorkshopRequest, PaymentType, RequestStatus } from '../types';
import Modal from '../components/Modal';
import PrintDraft from '../components/PrintDraft';
import Icon from '../components/Icon';

const NewRequestForm: React.FC = () => {
    const {
        setPage, requests, setRequests, clients, setClients, cars, setCars,
        carMakes, carModels, inspectionTypes, brokers, employees, settings, customFindingCategories,
        addNotification
    } = useAppContext();

    // Form state
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [carMakeId, setCarMakeId] = useState('');
    const [carModelId, setCarModelId] = useState('');
    const [carYear, setCarYear] = useState(new Date().getFullYear());
    const [plateChars, setPlateChars] = useState('');
    const [plateNums, setPlateNums] = useState('');
    const [inspectionTypeId, setInspectionTypeId] = useState(inspectionTypes[0]?.id || '');
    const [inspectionPrice, setInspectionPrice] = useState(inspectionTypes[0]?.price || 0);
    const [paymentType, setPaymentType] = useState<PaymentType>(PaymentType.Unpaid);
    const [useBroker, setUseBroker] = useState(false);
    const [brokerId, setBrokerId] = useState('');
    const [brokerCommission, setBrokerCommission] = useState(0);
    
    // New state for chassis number toggle
    const [useChassisNumber, setUseChassisNumber] = useState(false);
    const [chassisNumber, setChassisNumber] = useState('');

    // State for searchable car make dropdown
    const [carMakeSearchTerm, setCarMakeSearchTerm] = useState('');
    const [isMakeDropdownOpen, setIsMakeDropdownOpen] = useState(false);
    const makeDropdownRef = useRef<HTMLDivElement>(null);
    
    // State for searchable car model dropdown
    const [carModelSearchTerm, setCarModelSearchTerm] = useState('');
    const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
    const modelDropdownRef = useRef<HTMLDivElement>(null);
    const [activeModelIndex, setActiveModelIndex] = useState(-1);
    const modelListRef = useRef<HTMLUListElement>(null);
    
    const modelInputRef = useRef<HTMLInputElement>(null);
    const carYearRef = useRef<HTMLInputElement>(null);


    // Success modal state
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [newRequest, setNewRequest] = useState<WorkshopRequest | null>(null);
    const printRef = useRef<HTMLDivElement>(null);
    
    const filteredCarMakes = useMemo(() => {
        const term = carMakeSearchTerm.toLowerCase().trim();
        if (!term) {
            return carMakes;
        }
        return carMakes.filter(make =>
            make.nameAr.toLowerCase().includes(term) ||
            make.nameEn.toLowerCase().includes(term)
        );
    }, [carMakeSearchTerm, carMakes]);

    const filteredCarModels = useMemo(() => {
        if (!carMakeId) {
            return [];
        }
        const term = carModelSearchTerm.toLowerCase().trim();
        const modelsForMake = carModels.filter(model => model.makeId === carMakeId);
        if (!term) {
            return modelsForMake;
        }
        return modelsForMake.filter(model =>
            model.nameAr.toLowerCase().includes(term) ||
            model.nameEn.toLowerCase().includes(term)
        );
    }, [carModelSearchTerm, carModels, carMakeId]);

    // Click outside handler for car make dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (makeDropdownRef.current && !makeDropdownRef.current.contains(event.target as Node)) {
                setIsMakeDropdownOpen(false);
                const selectedMake = carMakes.find(m => m.id === carMakeId);
                setCarMakeSearchTerm(selectedMake ? selectedMake.nameAr : '');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [carMakeId, carMakes]);
    
    // Click outside handler for car model dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
                setIsModelDropdownOpen(false);
                setActiveModelIndex(-1);
                const selectedModel = carModels.find(m => m.id === carModelId);
                setCarModelSearchTerm(selectedModel ? selectedModel.nameAr : '');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [carModelId, carModels]);

    useEffect(() => {
        const selectedType = inspectionTypes.find(i => i.id === inspectionTypeId);
        if (selectedType) {
            setInspectionPrice(selectedType.price);
        }
    }, [inspectionTypeId, inspectionTypes]);

    // Scroll active model into view
    useEffect(() => {
        if (activeModelIndex < 0 || !modelListRef.current) return;
        const listElement = modelListRef.current;
        const activeItem = listElement.children[activeModelIndex] as HTMLLIElement;
        if (activeItem) {
            activeItem.scrollIntoView({ block: 'nearest' });
        }
    }, [activeModelIndex]);

    const getNextRequestNumber = () => {
        if (requests.length === 0) return 1001;
        const maxNum = Math.max(...requests.map(r => r.requestNumber));
        return maxNum + 1;
    };
    
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\s/g, ''); // remove spaces to handle backspace correctly
        const digits = rawValue.replace(/\D/g, '').slice(0, 10);
        let formatted = digits;

        if (digits.length > 6) {
            formatted = `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
        } else if (digits.length > 3) {
            formatted = `${digits.slice(0, 3)} ${digits.slice(3)}`;
        }
        
        setClientPhone(formatted);
    };

    // Performance Optimization: Memoize the allowed characters set
    const allowedPlateChars = useMemo(() => {
        const { plateCharacters } = settings;
        const allowed = new Set<string>();
        plateCharacters.forEach(pc => {
            for(const char of pc.ar) { allowed.add(char); }
            for(const char of pc.en) {
                allowed.add(char.toLowerCase());
                allowed.add(char.toUpperCase());
            }
        });
        return allowed;
    }, [settings.plateCharacters]);

    const handlePlateCharChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        
        let filteredValue = '';
        for (const char of value) {
            if (allowedPlateChars.has(char) || char === ' ') {
                filteredValue += char;
            }
        }

        const formatted = filteredValue.replace(/\s/g, '').split('').join(' ');
        setPlateChars(formatted.toUpperCase());
    };
    
    const convertPlateToEnglish = (arabicPlate: string): string => {
        if (!arabicPlate) return '';
        const arToEnMap = Object.fromEntries(settings.plateCharacters.map(pc => [pc.ar, pc.en]));
        // Create a regex from all keys, sorted by length descending to handle multi-char keys first
        const regex = new RegExp(Object.keys(arToEnMap).sort((a, b) => b.length - a.length).join('|'), 'g');
        const inputWithoutSpaces = arabicPlate.replace(/\s/g, '');
        return inputWithoutSpaces.replace(regex, (match) => (arToEnMap[match] || match).toUpperCase());
    };

    const convertPlateToArabic = (englishPlate: string): string => {
        if (!englishPlate) return '';
        const enToArMap = Object.fromEntries(settings.plateCharacters.map(pc => [pc.en.toUpperCase(), pc.ar]));
        // Create a regex from all keys, sorted by length descending
        const regex = new RegExp(Object.keys(enToArMap).sort((a, b) => b.length - a.length).join('|'), 'gi');
        const inputWithoutSpaces = englishPlate.replace(/\s/g, '');
        return inputWithoutSpaces.replace(regex, (match) => enToArMap[match.toUpperCase()] || match);
    };

    const handleSelectModel = (model: CarModel) => {
        setCarModelId(model.id);
        setCarModelSearchTerm(model.nameAr);
        setIsModelDropdownOpen(false);
        setActiveModelIndex(-1);
    };

    const handleMakeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (isMakeDropdownOpen && e.key === 'Tab' && !e.shiftKey) {
            if (filteredCarMakes.length > 0) {
                e.preventDefault();
                const makeToSelect = filteredCarMakes[0];
                setCarMakeId(makeToSelect.id);
                setCarModelId('');
                setCarMakeSearchTerm(makeToSelect.nameAr);
                setCarModelSearchTerm('');
                setIsMakeDropdownOpen(false);
                modelInputRef.current?.focus();
            }
        }
    };

    const handleModelKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (isModelDropdownOpen) {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setActiveModelIndex(prev => (prev >= filteredCarModels.length - 1 ? 0 : prev + 1));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setActiveModelIndex(prev => (prev <= 0 ? filteredCarModels.length - 1 : prev - 1));
                    break;
                case 'Enter':
                case 'Tab':
                    if (!e.shiftKey) {
                        let modelToSelect: CarModel | undefined;
                        if (activeModelIndex >= 0 && activeModelIndex < filteredCarModels.length) {
                            modelToSelect = filteredCarModels[activeModelIndex];
                        } else if (filteredCarModels.length > 0) {
                            modelToSelect = filteredCarModels[0];
                        }

                        if (modelToSelect) {
                            e.preventDefault();
                            handleSelectModel(modelToSelect);
                            carYearRef.current?.focus();
                        }
                    }
                    break;
                case 'Escape':
                    setIsModelDropdownOpen(false);
                    setActiveModelIndex(-1);
                    break;
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const cleanedPhone = clientPhone.replace(/\D/g, '');
        if (cleanedPhone.length !== 10) {
            addNotification({ title: 'خطأ في الإدخال', message: 'رقم الهاتف يجب أن يتكون من 10 أرقام.', type: 'error' });
            return;
        }

        // 1. Create or find client
        let client = clients.find(c => c.phone === cleanedPhone);
        if (!client) {
            client = { id: uuidv4(), name: clientName, phone: cleanedPhone };
            setClients(prev => [...prev, client]);
        }
        
        // 2. Create car
        const plateNumber = useChassisNumber 
            ? `شاصي ${chassisNumber}` 
            : (() => {
                const containsArabic = /[\u0600-\u06FF]/.test(plateChars);
                const arabicCharsWithSpaces = containsArabic 
                    ? plateChars 
                    : plateChars.split(' ').map(char => convertPlateToArabic(char)).join(' ');
                return `${arabicCharsWithSpaces} ${plateNums}`;
            })();

        const car: Car = {
            id: uuidv4(),
            makeId: carMakeId,
            modelId: carModelId,
            year: carYear,
            plateNumber
        };
        setCars(prev => [...prev, car]);

        // 3. Create request
        const request: WorkshopRequest = {
            id: uuidv4(),
            requestNumber: getNextRequestNumber(),
            clientId: client.id,
            carId: car.id,
            inspectionTypeId,
            paymentType,
            price: inspectionPrice,
            status: RequestStatus.New,
            createdAt: new Date().toISOString(),
            employeeId: 'employee', // Assuming logged in employee
            inspectionData: {},
        };

        if (useBroker && brokerId) {
            request.broker = { id: brokerId, commission: brokerCommission };
        }

        setRequests(prev => [...prev, request].sort((a,b) => b.requestNumber - a.requestNumber));
        setNewRequest(request);
        setIsSuccessModalOpen(true);
    };
    
    const handlePrint = () => {
        // The print CSS in index.html will handle showing the correct content.
        window.print();
    };
    
    const resetForm = () => {
        setClientName('');
        setClientPhone('');
        setCarMakeId('');
        setCarModelId('');
        setCarMakeSearchTerm('');
        setCarModelSearchTerm('');
        setCarYear(new Date().getFullYear());
        setPlateChars('');
        setPlateNums('');
        const firstInspectionType = inspectionTypes[0];
        setInspectionTypeId(firstInspectionType?.id || '');
        setInspectionPrice(firstInspectionType?.price || 0);
        setPaymentType(PaymentType.Unpaid);
        setUseBroker(false);
        setBrokerId('');
        setBrokerCommission(0);
        setUseChassisNumber(false);
        setChassisNumber('');
        setIsSuccessModalOpen(false);
        setNewRequest(null);
    }
    
    const selectedCarMake = carMakes.find(m => m.id === carMakeId);
    const selectedCarModel = carModels.find(m => m.id === carModelId);
    const selectedInspectionType = inspectionTypes.find(i => i.id === inspectionTypeId);
    const clientForPrint = clients.find(c => c.id === newRequest?.clientId);
    const carForPrint = cars.find(c => c.id === newRequest?.carId);

    const containsArabic = /[\u0600-\u06FF]/.test(plateChars);
    const arabicPreviewChars = containsArabic ? plateChars : convertPlateToArabic(plateChars);
    const englishPreviewChars = containsArabic ? convertPlateToEnglish(plateChars) : plateChars;
    
    // Format numbers with spaces for preview
    const formattedPlateNumsPreview = plateNums.split('').join(' ');

    // Format characters with spaces for preview
    const spacedArabicPreview = arabicPreviewChars.replace(/\s/g, '').split('').join(' ');
    // Reverse the English characters for LTR display to match Saudi plate style
    const spacedEnglishPreview = englishPreviewChars.replace(/\s/g, '').toUpperCase().split('').reverse().join(' ');

    const { platePreviewSettings } = settings;

    const adjustedFontSize = useMemo(() => {
        const baseSizeStr = platePreviewSettings.fontSize || '32px';
        const baseSize = parseFloat(baseSizeStr);
        const unit = baseSizeStr.replace(/[0-9.]/g, '');

        if (isNaN(baseSize)) {
            return baseSizeStr; // Fallback if parsing fails
        }

        const totalChars = plateChars.replace(/\s/g, '').length + plateNums.length;
        const maxCharsWithoutScaling = 5; 
        let scale = 1.0;

        if (totalChars > maxCharsWithoutScaling) {
            const reductionPerChar = 0.15; // 15% reduction per character over the limit
            const charsOver = totalChars - maxCharsWithoutScaling;
            scale = 1.0 - (charsOver * reductionPerChar);
        }
        
        // Ensure the scale doesn't go below a certain minimum
        const finalScale = Math.max(scale, 0.6);
        const newSize = baseSize * finalScale;

        return `${newSize}${unit}`;

    }, [plateChars, plateNums, platePreviewSettings.fontSize]);

    const previewContainerStyle = {
        backgroundColor: platePreviewSettings.backgroundColor,
        borderColor: platePreviewSettings.borderColor,
    };

    const previewTextStyle = {
        color: platePreviewSettings.fontColor,
        fontFamily: platePreviewSettings.fontFamily,
        fontSize: adjustedFontSize,
        letterSpacing: platePreviewSettings.letterSpacing,
    };

    const separatorImageStyle = {
        width: platePreviewSettings.separatorWidth,
        height: platePreviewSettings.separatorHeight,
    };

    const activeBrokers = brokers.filter(b => b.isActive);

    return (
      <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit}>
              <div className="space-y-8">
                  {/* Client Info Card */}
                  <div className="bg-white p-8 rounded-xl shadow-lg transition-shadow hover:shadow-2xl">
                      <h3 className="text-xl font-semibold mb-6 text-gray-700 flex items-center">
                          <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center me-3 font-bold text-lg">1</span>
                          بيانات العميل
                      </h3>
                      <div className="space-y-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">اسم العميل</label>
                              <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500" />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                              <input 
                                  type="tel" 
                                  value={clientPhone} 
                                  onChange={handlePhoneChange} 
                                  required 
                                  placeholder="05X XXX XXXX"
                                  maxLength={12}
                                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                                  style={{ direction: 'ltr', textAlign: 'right' }}
                              />
                          </div>
                      </div>
                  </div>

                  {/* Car Info Card */}
                  <div className="bg-white p-8 rounded-xl shadow-lg transition-shadow hover:shadow-2xl">
                      <h3 className="text-xl font-semibold mb-6 text-gray-700 flex items-center">
                          <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center me-3 font-bold text-lg">2</span>
                          بيانات السيارة
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="relative" ref={makeDropdownRef}>
                              <label className="block text-sm font-medium text-gray-700 mb-1">الشركة</label>
                              <input
                                  type="text"
                                  value={carMakeSearchTerm}
                                  onChange={(e) => {
                                      const newSearchTerm = e.target.value;
                                      setCarMakeSearchTerm(newSearchTerm);
                                      setIsMakeDropdownOpen(true);
                                      const selectedMake = carMakes.find(m => m.id === carMakeId);
                                      if (selectedMake && selectedMake.nameAr !== newSearchTerm) {
                                          setCarMakeId('');
                                          setCarModelId('');
                                          setCarModelSearchTerm('');
                                      }
                                  }}
                                  onFocus={() => setIsMakeDropdownOpen(true)}
                                  onKeyDown={handleMakeKeyDown}
                                  placeholder="ابحث أو اختر الشركة"
                                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                              />
                              {isMakeDropdownOpen && (
                                  <ul className="absolute z-20 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                                      {filteredCarMakes.length > 0 ? (
                                          filteredCarMakes.map(make => (
                                              <li
                                                  key={make.id}
                                                  onClick={() => {
                                                      setCarMakeId(make.id);
                                                      setCarModelId('');
                                                      setCarMakeSearchTerm(make.nameAr);
                                                      setCarModelSearchTerm('');
                                                      setIsMakeDropdownOpen(false);
                                                  }}
                                                  className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                                              >
                                                  {make.nameAr} ({make.nameEn})
                                              </li>
                                          ))
                                      ) : (
                                          <li className="px-4 py-2 text-gray-500">لا توجد نتائج</li>
                                      )}
                                  </ul>
                              )}
                          </div>
                          <div className="relative" ref={modelDropdownRef}>
                              <label className="block text-sm font-medium text-gray-700 mb-1">الموديل</label>
                              <input
                                  ref={modelInputRef}
                                  type="text"
                                  value={carModelSearchTerm}
                                  onChange={(e) => {
                                      setCarModelSearchTerm(e.target.value);
                                      setIsModelDropdownOpen(true);
                                      setActiveModelIndex(-1);
                                      const selectedModel = carModels.find(m => m.id === carModelId);
                                      if(selectedModel && selectedModel.nameAr !== e.target.value) {
                                        setCarModelId('');
                                      }
                                  }}
                                  onFocus={() => setIsModelDropdownOpen(true)}
                                  onKeyDown={handleModelKeyDown}
                                  placeholder="ابحث أو اختر الموديل"
                                  disabled={!carMakeId}
                                  required={!carModelId}
                                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                              />
                              {isModelDropdownOpen && carMakeId && (
                                  <ul ref={modelListRef} className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                                      {filteredCarModels.length > 0 ? (
                                          filteredCarModels.map((model, index) => (
                                              <li
                                                  key={model.id}
                                                  onClick={() => handleSelectModel(model)}
                                                  onMouseEnter={() => setActiveModelIndex(index)}
                                                  className={`px-4 py-2 hover:bg-blue-100 cursor-pointer ${index === activeModelIndex ? 'bg-blue-100' : ''}`}
                                              >
                                                  {model.nameAr} ({model.nameEn})
                                              </li>
                                          ))
                                      ) : (
                                          <li className="px-4 py-2 text-gray-500">لا توجد موديلات مطابقة</li>
                                      )}
                                  </ul>
                              )}
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">سنة الصنع</label>
                              <input ref={carYearRef} type="number" value={carYear} onChange={e => setCarYear(Number(e.target.value))} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500" />
                          </div>
                      </div>

                      <div className="border-t pt-6 mt-6">
                          <h4 className="text-lg font-medium text-gray-600 mb-4">طريقة تعريف السيارة</h4>
                          <div className="flex items-center mb-4">
                              <label className="flex items-center cursor-pointer">
                              <div className="relative">
                                  <input type="checkbox" className="sr-only" checked={useChassisNumber} onChange={() => setUseChassisNumber(!useChassisNumber)} />
                                  <div className="block bg-gray-200 w-14 h-8 rounded-full"></div>
                                  <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform shadow-md ${useChassisNumber ? 'transform translate-x-full bg-blue-600' : 'bg-gray-400'}`}></div>
                              </div>
                              <div className="ms-3 text-gray-700 font-medium">استخدام رقم الشاصي بدلاً من اللوحة</div>
                              </label>
                          </div>
                          
                          { !useChassisNumber ? (
                              <div>
                              <label className="block text-sm font-medium text-gray-700">رقم اللوحة</label>
                              <div className="flex items-center gap-2 mt-1">
                                  <input type="text" placeholder="أ ب ج" value={plateChars} onChange={handlePlateCharChange} required={!useChassisNumber} className="block w-1/2 p-2 border border-gray-300 rounded-md text-center shadow-sm focus:ring-2 focus:ring-blue-500" style={{direction: 'ltr'}}/>
                                  <input type="text" placeholder="١٢٣٤" value={plateNums} onChange={e => setPlateNums(e.target.value.replace(/[^0-9]/g, ''))} required={!useChassisNumber} className="block w-1/2 p-2 border border-gray-300 rounded-md text-center shadow-sm focus:ring-2 focus:ring-blue-500" style={{direction: 'ltr'}}/>
                              </div>
                                  { (plateChars.trim() || plateNums.trim()) && (
                                  <div className="mt-4">
                                      <label className="block text-sm font-medium text-gray-700 mb-2">معاينة اللوحة</label>
                                      <div 
                                          className="flex items-center justify-evenly border-2 rounded-md h-16 p-2 max-w-sm mx-auto"
                                          style={previewContainerStyle}
                                      >
                                          <span className="font-bold tracking-widest" style={{...previewTextStyle, direction: containsArabic ? 'ltr' : 'rtl'}}>
                                              {containsArabic ? spacedEnglishPreview : spacedArabicPreview}
                                          </span>

                                          {platePreviewSettings.separatorImageUrl ? (
                                              <img src={platePreviewSettings.separatorImageUrl} alt="Separator" className="object-contain mx-2" style={separatorImageStyle} />
                                          ) : (
                                              <div style={{ backgroundColor: platePreviewSettings.borderColor }} className="w-px h-10 mx-2"></div>
                                          )}
                                          
                                          <span className="font-bold tracking-widest" style={{...previewTextStyle, direction: 'ltr'}}>
                                              {formattedPlateNumsPreview}
                                          </span>
                                      </div>
                                  </div>
                              )}
                              </div>
                          ) : (
                              <div className="animate-fade-in">
                              <label className="block text-sm font-medium text-gray-700">رقم الشاصي (VIN)</label>
                              <input 
                                  type="text" 
                                  value={chassisNumber} 
                                  onChange={e => setChassisNumber(e.target.value.toUpperCase())} 
                                  required={useChassisNumber} 
                                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                                  style={{direction: 'ltr'}}
                              />
                              </div>
                          )}
                      </div>
                  </div>
                  
                  {/* Request Details Card */}
                  <div className="bg-white p-8 rounded-xl shadow-lg transition-shadow hover:shadow-2xl">
                      <h3 className="text-xl font-semibold mb-6 text-gray-700 flex items-center">
                          <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center me-3 font-bold text-lg">3</span>
                          تفاصيل الطلب
                      </h3>
                      <div className="space-y-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">نوع الفحص</label>
                              <select value={inspectionTypeId} onChange={e => setInspectionTypeId(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500">
                                  {inspectionTypes.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                              </select>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">قيمة الفحص (ريال)</label>
                              <input type="number" value={inspectionPrice} onChange={e => setInspectionPrice(Number(e.target.value))} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500" />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">طريقة الدفع</label>
                              <div className="mt-2 flex flex-wrap gap-4">
                              {Object.values(PaymentType).map(pt => (
                                  <label key={pt} className="flex items-center">
                                      <input type="radio" name="paymentType" value={pt} checked={paymentType === pt} onChange={() => setPaymentType(pt)} className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500" />
                                      <span className="ms-2 text-gray-700">{pt}</span>
                                  </label>
                              ))}
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Broker Card */}
                  <div className="bg-white p-8 rounded-xl shadow-lg transition-shadow hover:shadow-2xl">
                      <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
                          <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center me-3 font-bold text-lg">4</span>
                          السمسار (اختياري)
                      </h3>
                      <div className="flex items-center mb-4">
                          <label className="flex items-center cursor-pointer">
                              <div className="relative">
                                  <input type="checkbox" className="sr-only" checked={useBroker} onChange={() => setUseBroker(!useBroker)} />
                                  <div className="block bg-gray-200 w-14 h-8 rounded-full"></div>
                                  <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform shadow-md ${useBroker ? 'transform translate-x-full bg-blue-600' : 'bg-gray-400'}`}></div>
                              </div>
                              <div className="ms-3 text-gray-700 font-medium">تضمين سمسار في الطلب</div>
                          </label>
                      </div>
                      {useBroker && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">اختر السمسار</label>
                              <select value={brokerId} onChange={e => {
                                  const selectedBroker = brokers.find(b => b.id === e.target.value);
                                  setBrokerId(e.target.value);
                                  setBrokerCommission(selectedBroker?.defaultCommission || 0);
                              }} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500">
                                  <option value="">اختر</option>
                                  {activeBrokers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                              </select>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">قيمة العمولة (ريال)</label>
                              <input type="number" value={brokerCommission} onChange={e => setBrokerCommission(Number(e.target.value))} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500" />
                          </div>
                      </div>
                      )}
                  </div>
              </div>

              {/* Action Bar */}
              <div className="mt-8 pt-6 border-t flex justify-between items-center">
                  <button 
                      type="button" 
                      onClick={() => setPage('requests')} 
                      className="bg-white text-gray-700 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors font-bold"
                  >
                      إلغاء
                  </button>
                  <button type="submit" className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 text-lg font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                      <Icon name="add" className="w-6 h-6" />
                      إنشاء وحفظ الطلب
                  </button>
              </div>
          </form>

        <Modal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} title="تم حفظ الطلب بنجاح">
            <div className="text-center p-4">
                <p className="text-lg">تم حفظ الطلب برقم: <span className="font-bold text-2xl text-blue-600">{newRequest?.requestNumber?.toLocaleString('en-US', { useGrouping: false })}</span></p>
                <div className="mt-8 flex justify-center gap-4">
                    <button onClick={resetForm} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">فتح طلب جديد</button>
                    <button onClick={() => setPage('requests')} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">العودة للطلبات</button>
                    <button onClick={handlePrint} className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 flex items-center">
                        <Icon name="print" className="w-5 h-5 me-2"/> طباعة مسودة
                    </button>
                </div>
            </div>
        </Modal>
        
        {newRequest && clientForPrint && carForPrint && selectedCarMake && selectedCarModel && selectedInspectionType &&
            <PrintDraft 
                ref={printRef}
                request={newRequest}
                client={clientForPrint}
                car={carForPrint}
                carMake={selectedCarMake}
                carModel={selectedCarModel}
                inspectionType={selectedInspectionType}
                price={inspectionPrice}
                appName={settings.appName}
                logoUrl={settings.logoUrl}
                customFindingCategories={customFindingCategories}
            />
        }
      </div>
    );
};

export default NewRequestForm;