import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Minus, Calendar, Package, Archive, PieChart, Trash2, Carrot, Box, Maximize2, X, ArrowUp, ArrowDown, ArrowUpDown, Search, Edit2, Check, ClipboardList, PenTool, Link, AlertCircle, Database, Coins, Landmark, Banknote, Clock, Wallet, Scale, RefreshCw, TrendingUp, Download, RotateCcw, CheckCircle2, XCircle, Info } from 'lucide-react';

// --- Supabase 설정 ---
import { createClient } from '@supabase/supabase-js';

// Vercel 환경 변수 불러오기
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const CORRECT_PIN = import.meta.env.VITE_ADMIN_PIN;

// 환경 변수가 제대로 불러와졌을 때만 클라이언트를 생성합니다.
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// --- 공휴일 자동화 설정 ---
const FIXED_HOLIDAYS = ['01-01', '03-01', '05-05', '06-06', '08-15', '10-03', '10-09', '12-25'];
const VARIABLE_HOLIDAYS = [
  '2024-02-09', '2024-02-10', '2024-02-11', '2024-02-12', '2024-04-10', '2024-05-06', '2024-05-15', '2024-09-16', '2024-09-17', '2024-09-18',
  '2025-01-28', '2025-01-29', '2025-01-30', '2025-03-03', '2025-05-06', '2025-10-06', '2025-10-07', '2025-10-08',
  '2026-02-16', '2026-02-17', '2026-02-18', '2026-03-02', '2026-05-24', '2026-05-25', '2026-09-24', '2026-09-25', '2026-09-26',
  '2027-02-06', '2027-02-07', '2027-02-08', '2027-05-13', '2027-08-16', '2027-09-14', '2027-09-15', '2027-09-16', '2027-10-11',
  '2028-01-26', '2028-01-27', '2028-01-28', '2028-05-02', '2028-10-02', '2028-10-03', '2028-10-04',
  '2029-02-12', '2029-02-13', '2029-02-14', '2029-05-07', '2029-05-20', '2029-09-21', '2029-09-22', '2029-09-23', '2029-09-24',
  '2030-02-02', '2030-02-03', '2030-02-04', '2030-05-06', '2030-05-09', '2030-09-11', '2030-09-12', '2030-09-13'
];

const checkIsHoliday = (dateString) => {
  if (!dateString) return false;
  const monthDay = dateString.substring(5);
  return FIXED_HOLIDAYS.includes(monthDay) || VARIABLE_HOLIDAYS.includes(dateString);
};

const getDateColorClass = (dateString) => {
  if (!dateString) return 'text-gray-900 dark:text-gray-100';
  const date = new Date(dateString);
  const day = date.getDay();
  if (day === 0 || checkIsHoliday(dateString)) return 'text-red-600 dark:text-red-400';
  if (day === 6) return 'text-blue-600 dark:text-blue-400';
  return 'text-gray-900 dark:text-gray-100';
};

const formatDateWithDay = (dateStr) => {
  if (!dateStr) return '';
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dateObj = new Date(dateStr);
  return `${dateStr} (${days[dateObj.getDay()]})`;
};

// --- 커스텀 날짜 선택기 ---
const CustomDatePicker = ({ startDate, endDate, onChange, className, wrapperClassName = "inline-block", dropdownAlign = "left", isRangeMode = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(startDate ? new Date(startDate) : new Date());
  const calendarRef = useRef(null);
  const [tempStart, setTempStart] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setViewDate(startDate ? new Date(startDate) : new Date());
      setTempStart(null);
      setHoverDate(null);
    }
  }, [isOpen, startDate]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handleDayClick = (dayStr) => {
    if (!isRangeMode) {
      onChange(dayStr, dayStr);
      setIsOpen(false);
    } else {
      if (!tempStart) {
        setTempStart(dayStr);
      } else {
        const start = tempStart < dayStr ? tempStart : dayStr;
        const end = tempStart > dayStr ? tempStart : dayStr;
        onChange(start, end);
        setIsOpen(false);
        setTempStart(null);
      }
    }
  };

  const days = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - firstDay + 1;
    if (dayNum > 0 && dayNum <= daysInMonth) return dayNum;
    return null;
  });

  return (
    <div className={`relative ${wrapperClassName}`} ref={calendarRef}>
      <div className={`flex items-center justify-between ${className}`}>
        {!startDate ? (
          <span className="text-gray-500 dark:text-gray-400 font-medium px-1">전체 기간</span>
        ) : isRangeMode && startDate !== endDate ? (
          <div className="flex items-center gap-1">
            <span className={getDateColorClass(startDate)}>{startDate}</span>
            <span className="text-gray-400 dark:text-gray-500 font-medium px-1">~</span>
            <span className={getDateColorClass(endDate)}>{endDate}</span>
          </div>
        ) : (
          <span className={getDateColorClass(startDate)}>{startDate}</span>
        )}
        <button type="button" onClick={() => setIsOpen(!isOpen)} className="p-1 -mr-1 ml-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-gray-500 dark:text-gray-400 focus:outline-none transition-colors">
          <Calendar size={16} />
        </button>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/10 dark:bg-black/40 backdrop-blur-[1px] md:hidden" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}></div>
          <div className={`z-[70] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-3 w-[280px] md:w-64 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:absolute md:top-[100%] md:translate-x-0 md:translate-y-0 md:mt-1 ${dropdownAlign === 'right' ? 'md:right-0 md:left-auto' : 'md:left-0 md:right-auto'}`}>
            <div className="flex justify-between items-center mb-2">
              <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300">&lt;</button>
              <div className="font-bold text-gray-800 dark:text-gray-100">{year}년 {month + 1}월</div>
              <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300">&gt;</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-1">
              <div className="text-red-500 dark:text-red-400 font-medium">일</div>
              <div className="text-gray-500 dark:text-gray-400">월</div><div className="text-gray-500 dark:text-gray-400">화</div><div className="text-gray-500 dark:text-gray-400">수</div><div className="text-gray-500 dark:text-gray-400">목</div><div className="text-gray-500 dark:text-gray-400">금</div>
              <div className="text-blue-500 dark:text-blue-400 font-medium">토</div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {days.map((day, idx) => {
                if (!day) return <div key={idx} className="p-1"></div>;
                const currentDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isHoliday = checkIsHoliday(currentDateStr);
                const isSunday = idx % 7 === 0;
                const isSaturday = idx % 7 === 6;

                let isInRange = false;
                let isEndpoint = false;

                if (isRangeMode) {
                  if (tempStart) {
                    if (hoverDate) {
                      const minStr = tempStart < hoverDate ? tempStart : hoverDate;
                      const maxStr = tempStart > hoverDate ? tempStart : hoverDate;
                      if (currentDateStr >= minStr && currentDateStr <= maxStr) isInRange = true;
                      if (currentDateStr === tempStart || currentDateStr === hoverDate) isEndpoint = true;
                    } else {
                      if (currentDateStr === tempStart) isEndpoint = true;
                    }
                  } else {
                    if (startDate && endDate) {
                      if (currentDateStr >= startDate && currentDateStr <= endDate) isInRange = true;
                      if (currentDateStr === startDate || currentDateStr === endDate) isEndpoint = true;
                    }
                  }
                } else {
                  if (currentDateStr === startDate) isEndpoint = true;
                }

                let textColor = 'text-gray-700 dark:text-gray-300';
                if (isSunday || isHoliday) textColor = 'text-red-600 dark:text-red-400 font-bold';
                else if (isSaturday) textColor = 'text-blue-600 dark:text-blue-400 font-bold';

                let bgClass = 'hover:bg-gray-100 dark:hover:bg-gray-700';
                if (isEndpoint) {
                  bgClass = 'bg-orange-500 dark:bg-orange-600 text-white font-bold ring-2 ring-orange-200 dark:ring-orange-900';
                  textColor = 'text-white';
                } else if (isInRange) {
                  bgClass = 'bg-orange-50 dark:bg-orange-900/30';
                }

                return (
                  <button key={idx} type="button" onClick={() => handleDayClick(currentDateStr)} onMouseEnter={() => setHoverDate(currentDateStr)} className={`p-1.5 rounded-md transition-colors ${textColor} ${bgClass}`}>
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default function App() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pinDigits, setPinDigits] = useState(['', '', '', '']);
  const pinRefs = useRef([]);

  const [supabaseClient, setSupabaseClient] = useState(null);
  const isDbConnected = !!supabaseClient;
  const [isLoading, setIsLoading] = useState(false);
  
  const [toasts, setToasts] = useState([]);
  
  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };
  
  const [sales, setSales] = useState([]); 
  const [inventoryData, setInventoryData] = useState([]); 
  const [optionMappings, setOptionMappings] = useState([]); 
  
  const [pendingRawData, setPendingRawData] = useState([]); 
  const [invTab, setInvTab] = useState('stock'); 

  const [addMode, setAddMode] = useState('manual'); 
  const [manualAddForm, setManualAddForm] = useState({ product: '', option: '', qty: 1, sellPrice: 0 });

  const [summaryTab, setSummaryTab] = useState('sales'); 
  const [settlementData, setSettlementData] = useState({ intermediate: 0, account: 0, cash: 0 });
  const [isSettlementSaving, setIsSettlementSaving] = useState(false);

  useEffect(() => {
    if (!supabaseUrl || !supabaseKey) return;

    const initSupabase = () => {
      if (window.supabase && !supabaseClient) {
        setSupabaseClient(window.supabase.createClient(supabaseUrl, supabaseKey));
      }
    };

    if (window.supabase) {
      initSupabase();
    } else {
      let script = document.getElementById('supabase-js-script');
      if (!script) {
        script = document.createElement('script');
        script.id = 'supabase-js-script';
        script.src = "https://unpkg.com/@supabase/supabase-js@2";
        script.onload = initSupabase;
        document.head.appendChild(script);
      } else {
        script.addEventListener('load', initSupabase);
      }
    }
  }, []);

  const fetchAllData = async () => {
    if (!supabaseClient || !isAuthorized) return; 
    setIsLoading(true);
    try {
      const { data: invData, error: invErr } = await supabaseClient.from('inventory').select('*').order('id', { ascending: true });
      if (!invErr && invData) setInventoryData(invData);

      const { data: salesData, error: salesErr } = await supabaseClient.from('sales').select('*').order('date', { ascending: false });
      if (!salesErr && salesData) setSales(salesData);

      const { data: mapData, error: mapErr } = await supabaseClient.from('option_mappings').select('*');
      if (!mapErr && mapData) setOptionMappings(mapData);

      const { data: settleData, error: settleErr } = await supabaseClient.from('settlement').select('*').eq('id', 1).maybeSingle();
      if (!settleErr && settleData) {
         setSettlementData({
           intermediate: settleData.intermediate || 0,
           account: settleData.account || 0,
           cash: settleData.cash || 0
         });
      }
    } catch (error) {
      console.error("DB Fetch Error:", error);
      showToast("데이터를 불러오는데 실패했습니다.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [isAuthorized, supabaseClient]);

  const handlePinChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; 
    const newDigits = [...pinDigits];
    newDigits[index] = value.slice(-1); 
    setPinDigits(newDigits);
    if (value && index < 3) pinRefs.current[index + 1].focus();
  };

  const handlePinKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      pinRefs.current[index - 1].focus();
    }
  };

  const handlePinPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 4);
    if (pastedData) {
      const newDigits = ['', '', '', ''];
      for (let i = 0; i < pastedData.length; i++) newDigits[i] = pastedData[i];
      setPinDigits(newDigits);
      const focusIndex = pastedData.length < 4 ? pastedData.length : 3;
      pinRefs.current[focusIndex].focus();
    }
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinDigits.join('') === CORRECT_PIN) {
      setIsAuthorized(true);
      showToast("환영합니다!", "success");
    } else {
      showToast("PIN 번호가 일치하지 않습니다.", "error");
      setPinDigits(['', '', '', '']); 
      if (pinRefs.current[0]) pinRefs.current[0].focus();
    }
  };

  const getLocalToday = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const today = getLocalToday();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [formData, setFormData] = useState({ date: today, product: '', option: '', quantity: 1, price: 0, unitPrice: 0, note: '' });

  const uniqueProducts = useMemo(() => [...new Set(inventoryData.map(item => item.product))], [inventoryData]);
  const uniqueOptionsAll = useMemo(() => [...new Set(inventoryData.map(item => item.option))], [inventoryData]);
  const availableOptions = useMemo(() => {
    if (!formData.product) return [];
    return inventoryData.filter(item => item.product === formData.product);
  }, [formData.product, inventoryData]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'product') {
      setFormData(prev => ({ ...prev, product: value, option: '', price: 0, unitPrice: 0 }));
    } else if (name === 'option') {
      const selectedItem = availableOptions.find(opt => opt.option === value);
      const unitPrice = selectedItem ? selectedItem.sellPrice : 0;
      setFormData(prev => ({ ...prev, option: value, unitPrice, price: unitPrice * prev.quantity }));
    } else if (name === 'quantity') {
      const qty = Number(value) || 0;
      setFormData(prev => ({ ...prev, quantity: value, price: prev.unitPrice * qty }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddSale = async (e) => {
    e.preventDefault();
    if (!formData.product || !formData.option || formData.quantity <= 0) return showToast("상품, 옵션, 수량을 정확히 입력해주세요.", "error");

    const newSale = {
      id: Date.now() + Math.floor(Math.random() * 10000), 
      date: formData.date,
      product: formData.product,
      option: formData.option,
      quantity: Number(formData.quantity),
      price: Math.round(Number(formData.price) / Number(formData.quantity)), 
      totalPrice: Number(formData.price), 
      note: formData.note
    };

    if (supabaseClient) {
      const { error } = await supabaseClient.from('sales').insert([newSale]);
      if (error) return showToast("DB 저장 중 오류가 발생했습니다.", "error");
    }
    
    setSales([newSale, ...sales]);
    showToast("판매 내역이 등록되었습니다.", "success");
    setFormData({ date: formData.date, product: '', option: '', quantity: 1, price: 0, unitPrice: 0, note: '' });
  };

  const handleDeleteSale = async (id) => {
    if (window.confirm("이 판매 내역을 완전히 삭제하시겠습니까?")) {
      if (supabaseClient) await supabaseClient.from('sales').delete().eq('id', id);
      setSales(sales.filter(sale => sale.id !== id));
      showToast("삭제되었습니다.", "info");
    }
  };

  const saveEdit = async () => {
    if (!editForm.product || !editForm.option || editForm.quantity <= 0 || editForm.price < 0) return showToast("입력값을 확인해주세요.", "error");
    const updatedSale = { ...editForm, quantity: Number(editForm.quantity), price: Number(editForm.price), totalPrice: Number(editForm.price) };
    if (supabaseClient) await supabaseClient.from('sales').update(updatedSale).eq('id', updatedSale.id);
    setSales(sales.map(s => s.id === updatedSale.id ? updatedSale : s));
    showToast("수정되었습니다.", "success");
    cancelEdit();
  };

  const saveInvEdit = async () => {
    if (!invEditForm.product || !invEditForm.option || invEditForm.qty < 0) return showToast("입력값을 확인해주세요.", "error");
    const { soldQty, remainQty, ...pureData } = invEditForm;
    const updatedInv = { ...pureData, qty: Number(invEditForm.qty), originPrice: Number(invEditForm.originPrice) || 0, sellPrice: Number(invEditForm.sellPrice) || 0 };
    if (supabaseClient) await supabaseClient.from('inventory').update(updatedInv).eq('id', updatedInv.id);
    setInventoryData(inventoryData.map(i => i.id === updatedInv.id ? updatedInv : i));
    showToast("재고가 수정되었습니다.", "success");
    cancelInvEdit();
  };

  const handleDeleteInv = async (id) => {
    if(window.confirm("이 품목을 재고 목록에서 삭제하시겠습니까?")) {
      if (supabaseClient) await supabaseClient.from('inventory').delete().eq('id', id);
      setInventoryData(inventoryData.filter(i => i.id !== id));
      showToast("삭제되었습니다.", "info");
    }
  };

  const handleAddManualInv = async (e) => {
    e.preventDefault();
    if (!manualAddForm.product || !manualAddForm.option || manualAddForm.qty <= 0) return showToast("상품명, 옵션명, 수량을 확인해주세요.", "error");

    const newItem = {
      id: Date.now() + Math.floor(Math.random() * 10000), 
      product: manualAddForm.product,
      option: manualAddForm.option,
      qty: Number(manualAddForm.qty),
      originPrice: 0,
      sellPrice: Number(manualAddForm.sellPrice) || 0
    };

    let newInv = [...inventoryData];
    const existingIdx = newInv.findIndex(i => i.product === newItem.product && i.option === newItem.option);
    let dbItemToSave;

    if (existingIdx >= 0) {
      newInv[existingIdx] = { ...newInv[existingIdx], qty: newInv[existingIdx].qty + newItem.qty, sellPrice: newItem.sellPrice };
      const { soldQty, remainQty, ...pureData } = newInv[existingIdx];
      dbItemToSave = pureData;
    } else {
      newInv.push(newItem);
      dbItemToSave = newItem;
    }

    if (supabaseClient) await supabaseClient.from('inventory').upsert([dbItemToSave]);
    setInventoryData(newInv);
    setManualAddForm({ product: '', option: '', qty: 1, sellPrice: 0 });
    showToast("재고가 추가되었습니다!", "success");
  };

  const handleSaveSettlement = async () => {
    setIsSettlementSaving(true);
    if (supabaseClient) {
      const { error } = await supabaseClient.from('settlement').upsert([{
        id: 1, 
        intermediate: settlementData.intermediate,
        account: settlementData.account,
        cash: settlementData.cash
      }]);
      if (error) showToast("DB 저장에 실패했습니다.", "error");
      else showToast("정산 데이터가 안전하게 저장되었습니다!", "success");
    } else {
      showToast("로컬 환경에 임시 저장되었습니다.", "success");
    }
    setIsSettlementSaving(false);
  };

  const applyPendingData = async () => {
    for (const item of pendingRawData) {
      if (!item.mapTo.product || !item.mapTo.option) return showToast(`[${item.rawId}] 항목의 매칭을 완료해주세요.`, "error");
    }

    let newInv = [...inventoryData];
    let newMappings = [...optionMappings];

    const dbMappingsToUpsert = [];
    for (const item of pendingRawData) {
      const mapData = { rawId: item.rawId, rawName: item.rawName, product: item.mapTo.product, option: item.mapTo.option, sellPrice: Number(item.mapTo.sellPrice) || 0 };
      const existingMapIdx = newMappings.findIndex(m => m.rawId === item.rawId);
      if (existingMapIdx >= 0) newMappings[existingMapIdx] = mapData;
      else newMappings.push(mapData);
      if(!dbMappingsToUpsert.find(m => m.rawId === mapData.rawId)) dbMappingsToUpsert.push(mapData);
    }

    const inventoryAddMap = {};
    for (const item of pendingRawData) {
      const key = `${item.mapTo.product}__|__${item.mapTo.option}`;
      if (!inventoryAddMap[key]) {
        inventoryAddMap[key] = { product: item.mapTo.product, option: item.mapTo.option, qty: item.qty, sellPrice: Number(item.mapTo.sellPrice) || 0 };
      } else {
        inventoryAddMap[key].qty += item.qty;
      }
    }

    const dbInventoryToUpsert = [];
    const aggregatedInventory = Object.values(inventoryAddMap);

    for (let i = 0; i < aggregatedInventory.length; i++) {
      const aggItem = aggregatedInventory[i];
      const invIdx = newInv.findIndex(inv => inv.product === aggItem.product && inv.option === aggItem.option);
      let dbItemToSave;

      if (invIdx >= 0) {
         newInv[invIdx] = { ...newInv[invIdx], qty: newInv[invIdx].qty + aggItem.qty, sellPrice: aggItem.sellPrice };
         const { soldQty, remainQty, ...pureData } = newInv[invIdx];
         dbItemToSave = pureData;
      } else {
         dbItemToSave = { id: Date.now() + Math.floor(Math.random() * 10000) + i, product: aggItem.product, option: aggItem.option, qty: aggItem.qty, originPrice: 0, sellPrice: aggItem.sellPrice };
         newInv.push(dbItemToSave);
      }
      dbInventoryToUpsert.push(dbItemToSave);
    }

    if (supabaseClient) {
      try {
        await supabaseClient.from('option_mappings').upsert(dbMappingsToUpsert);
        await supabaseClient.from('inventory').upsert(dbInventoryToUpsert);
      } catch(err) {
        return showToast("DB 일괄 저장에 실패했습니다.", "error");
      }
    }

    setOptionMappings(newMappings);
    setInventoryData(newInv);
    setPendingRawData([]);
    setBulkInvInput('');
    showToast("데이터가 매칭 및 저장되었습니다!", "success");
  };

  const saveMapEdit = async () => {
    const updatedMap = { ...mapEditForm, sellPrice: Number(mapEditForm.sellPrice) };
    if (supabaseClient) await supabaseClient.from('option_mappings').update(updatedMap).eq('rawId', updatedMap.rawId);
    
    setOptionMappings(optionMappings.map(m => m.rawId === mapEditForm.rawId ? updatedMap : m));

    const invIdx = inventoryData.findIndex(i => i.product === updatedMap.product && i.option === updatedMap.option);
    if (invIdx >= 0) {
       const newInv = [...inventoryData];
       newInv[invIdx].sellPrice = updatedMap.sellPrice;
       if (supabaseClient) await supabaseClient.from('inventory').update({ sellPrice: updatedMap.sellPrice }).eq('id', newInv[invIdx].id);
       setInventoryData(newInv);
    }
    showToast("매칭 정보가 수정되었습니다.", "success");
    setEditingMapId(null); setMapEditForm(null);
  };

  const deleteMap = async (rawId) => {
    if(window.confirm("이 매칭 정보를 삭제하시겠습니까?")) {
      if (supabaseClient) await supabaseClient.from('option_mappings').delete().eq('rawId', rawId);
      setOptionMappings(optionMappings.filter(m => m.rawId !== rawId));
      showToast("삭제되었습니다.", "info");
    }
  };

  const currentInventory = useMemo(() => {
    const calculated = inventoryData.map(item => {
      const soldQty = sales
        .filter(sale => sale.product === item.product && sale.option === item.option)
        .reduce((sum, sale) => sum + sale.quantity, 0);
      return { ...item, soldQty, remainQty: item.qty - soldQty };
    });
    return calculated.sort((a, b) => {
      if (a.product === b.product) return a.option.localeCompare(b.option);
      return a.product.localeCompare(b.product);
    });
  }, [sales, inventoryData]);

  const selectedRemainQty = useMemo(() => {
    if (!formData.product || !formData.option) return null;
    const item = currentInventory.find(i => i.product === formData.product && i.option === formData.option);
    return item ? item.remainQty : null;
  }, [formData.product, formData.option, currentInventory]);

  const periodSalesSummary = useMemo(() => {
    const periodSales = sales.filter(sale => sale.date >= startDate && sale.date <= endDate);
    const summary = {};
    let totalQty = 0;
    let totalAmount = 0;
    periodSales.forEach(sale => {
      const key = sale.product;
      if (!summary[key]) summary[key] = { product: sale.product, quantity: 0, amount: 0 };
      summary[key].quantity += sale.quantity;
      summary[key].amount += sale.totalPrice;
      totalQty += sale.quantity;
      totalAmount += sale.totalPrice;
    });
    return { list: Object.values(summary).sort((a, b) => b.quantity - a.quantity), totalQty, totalAmount };
  }, [sales, startDate, endDate]);

  const totalSalesSummary = useMemo(() => {
    const summary = {};
    let totalQty = 0; let totalAmount = 0;
    sales.forEach(sale => {
      const key = sale.product;
      if (!summary[key]) summary[key] = { product: sale.product, quantity: 0, amount: 0 };
      summary[key].quantity += sale.quantity; summary[key].amount += sale.totalPrice;
      totalQty += sale.quantity; totalAmount += sale.totalPrice;
    });
    return { list: Object.values(summary).sort((a, b) => b.quantity - a.quantity), totalQty, totalAmount };
  }, [sales]);

  const totalRemainQty = useMemo(() => currentInventory.reduce((acc, curr) => acc + curr.remainQty, 0), [currentInventory]);
  
  const todayDetailedSales = useMemo(() => {
    const todaysSales = sales.filter(sale => sale.date === today);
    return todaysSales.sort((a, b) => {
      if (a.product !== b.product) return a.product.localeCompare(b.product);
      return a.option.localeCompare(b.option);
    });
  }, [sales, today]);
  
  const todayTotalQty = useMemo(() => todayDetailedSales.reduce((acc, sale) => acc + sale.quantity, 0), [todayDetailedSales]);
  const todayTotalAmount = useMemo(() => todayDetailedSales.reduce((acc, sale) => acc + sale.totalPrice, 0), [todayDetailedSales]);

  const [maximizedView, setMaximizedView] = useState(null); 
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' }); 
  const [searchProduct, setSearchProduct] = useState('');
  const [searchOption, setSearchOption] = useState('');
  const [editingSaleId, setEditingSaleId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [bulkInvInput, setBulkInvInput] = useState('');
  const [editingInvId, setEditingInvId] = useState(null);
  const [invEditForm, setInvEditForm] = useState(null);
  const [editingMapId, setEditingMapId] = useState(null);
  const [mapEditForm, setMapEditForm] = useState(null);
  const [showRawDataInput, setShowRawDataInput] = useState(false); 

  const handleCloseModal = () => {
    setMaximizedView(null); 
    setSearchProduct(''); 
    setSearchOption(''); 
    setSortConfig({ key: 'date', direction: 'desc' });
    setEditingSaleId(null); setEditForm(null); setEditingInvId(null); setInvEditForm(null);
    setBulkInvInput(''); setPendingRawData([]); setInvTab('stock'); setEditingMapId(null); setShowRawDataInput(false);
  };

  const exportToCSV = (data, type) => {
    if (!data || data.length === 0) return showToast("내보낼 데이터가 없습니다.", "error");

    let csvContent = '\uFEFF'; 
    if (type === 'sales') {
      csvContent += '판매일,상품명,옵션명,수량,판매금액,비고\n';
      data.forEach(row => {
        csvContent += `"${row.date}","${row.product}","${row.option}",${row.quantity},${row.totalPrice},"${row.note || ''}"\n`;
      });
    } else if (type === 'inventory') {
      csvContent += '상품명,옵션명,총수량,남은수량,판매금액\n';
      data.forEach(row => {
        csvContent += `"${row.product}","${row.option}",${row.qty},${row.remainQty},${row.sellPrice}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${type === 'sales' ? '판매내역' : '재고현황'}_${getLocalToday()}.csv`;
    link.click();
    showToast("CSV 다운로드가 완료되었습니다.", "success");
  };

  const startEdit = (sale) => { setEditingSaleId(sale.id); setEditForm({ ...sale, price: sale.totalPrice }); };
  const cancelEdit = () => { setEditingSaleId(null); setEditForm(null); };
  const startInvEdit = (item) => { setEditingInvId(item.id); setInvEditForm({ ...item }); };
  const cancelInvEdit = () => { setEditingInvId(null); setInvEditForm(null); };
  const startMapEdit = (mapObj) => { setEditingMapId(mapObj.rawId); setMapEditForm({ ...mapObj }); };
  const cancelMapEdit = () => { setEditingMapId(null); setMapEditForm(null); };

  const handleParseRawData = () => {
    if (!bulkInvInput.trim()) return;
    const lines = bulkInvInput.trim().split('\n').map(l => l.trim()).filter(Boolean);
    const parsed = [];
    if (lines[0].includes('\t')) {
      for (let line of lines) {
        if (line.includes('옵션ID')) continue; 
        const parts = line.split('\t').map(p => p.trim());
        if (parts.length >= 3) parsed.push({ rawId: parts[0], rawName: parts[1], qty: parseInt(parts[2].replace(/,/g, ''), 10) || 0 });
      }
    } else {
      let start = 0; if (lines[0].includes('옵션ID') || lines[0] === '옵션ID') start = 3; 
      for (let i = start; i < lines.length; i += 3) {
         if (lines[i] && lines[i+1] && lines[i+2]) parsed.push({ rawId: lines[i], rawName: lines[i+1], qty: parseInt(lines[i+2].replace(/,/g, ''), 10) || 0 });
      }
    }
    if (parsed.length === 0) return showToast("인식할 수 있는 데이터가 없습니다.", "error");

    const combined = {};
    parsed.forEach(p => { if (!combined[p.rawId]) combined[p.rawId] = { ...p }; else combined[p.rawId].qty += p.qty; });
    
    setPendingRawData(Object.values(combined).map(item => {
       const existingMap = optionMappings.find(m => m.rawId === item.rawId);
       if (existingMap) return { ...item, mapped: true, mapTo: { product: existingMap.product, option: existingMap.option, sellPrice: existingMap.sellPrice } };
       else return { ...item, mapped: false, mapTo: { product: '', option: '', sellPrice: 0 } };
    }));
    setShowRawDataInput(false); 
    showToast(`${Object.values(combined).length}개의 데이터가 인식되었습니다.`, "success");
  };

  const updatePendingMap = (index, field, value) => {
    const newPending = [...pendingRawData];
    newPending[index].mapTo[field] = value;
    if (field === 'option' || field === 'product') {
       const prod = newPending[index].mapTo.product; const opt = newPending[index].mapTo.option;
       if (prod && opt) {
          const matchedInv = inventoryData.find(i => i.product === prod && i.option === opt);
          if (matchedInv && newPending[index].mapTo.sellPrice === 0) newPending[index].mapTo.sellPrice = matchedInv.sellPrice;
       }
    }
    setPendingRawData(newPending);
  };

  const requestSort = (key) => {
    let direction = 'asc'; if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} className="text-gray-400 dark:text-gray-600 opacity-50" />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-gray-700 dark:text-gray-300" /> : <ArrowDown size={14} className="text-gray-700 dark:text-gray-300" />;
  };

  const modalDetailedData = useMemo(() => {
    let data = [];
    if (maximizedView === 'period') data = sales.filter(sale => sale.date >= startDate && sale.date <= endDate);
    else if (maximizedView === 'total') data = [...sales];
    else return [];
    
    if (searchProduct.trim()) data = data.filter(s => s.product.toLowerCase().includes(searchProduct.toLowerCase().trim()));
    if (searchOption.trim()) data = data.filter(s => s.option.toLowerCase().includes(searchOption.toLowerCase().trim()));
    
    data.sort((a, b) => {
      let valA = a[sortConfig.key] ?? ''; let valB = b[sortConfig.key] ?? '';
      let comparison = 0;
      
      if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      } else {
        if (valA < valB) comparison = -1;
        else if (valA > valB) comparison = 1;
      }

      if (comparison !== 0) return sortConfig.direction === 'asc' ? comparison : -comparison;
      if (a.product !== b.product) return a.product.localeCompare(b.product);
      return a.option.localeCompare(b.option);
    });

    return data;
  }, [maximizedView, sales, startDate, endDate, sortConfig, searchProduct, searchOption]);

  const processedInventory = useMemo(() => {
    let data = [...currentInventory];
    if (searchProduct.trim()) data = data.filter(item => item.product.toLowerCase().includes(searchProduct.toLowerCase().trim()));
    if (searchOption.trim()) data = data.filter(item => item.option.toLowerCase().includes(searchOption.toLowerCase().trim()));
    if (sortConfig.key) {
      data.sort((a, b) => {
        let valA = a[sortConfig.key] ?? ''; let valB = b[sortConfig.key] ?? '';
        if (typeof valA === 'number' && typeof valB === 'number') return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [currentInventory, searchProduct, searchOption, sortConfig]);

  if (isLoading && sales.length === 0) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-500 dark:text-gray-400 font-bold">DB 데이터를 불러오는 중입니다...</div>;

  const renderToastContainer = () => (
    <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className={`flex items-center gap-2 px-5 py-3.5 rounded-xl shadow-xl text-sm font-bold text-white transition-all duration-300 transform translate-y-0 opacity-100 ${toast.type === 'success' ? 'bg-emerald-600 dark:bg-emerald-500' : toast.type === 'error' ? 'bg-red-600 dark:bg-red-500' : 'bg-gray-800 dark:bg-gray-700'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : toast.type === 'error' ? <XCircle size={18} /> : <Info size={18} />}
          {toast.message}
        </div>
      ))}
    </div>
  );

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <form onSubmit={handlePinSubmit} className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl w-full max-w-sm text-center border border-gray-200 dark:border-gray-800 transition-colors">
          <div className="flex justify-center mb-4"><Carrot size={48} className="text-orange-500 drop-shadow-sm" /></div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">관리자 로그인</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">시스템에 접근하려면 PIN 번호를 입력하세요.</p>
          <div className="flex justify-center gap-3 mb-8">
            {[0, 1, 2, 3].map((index) => (
              <input
                key={index}
                ref={(el) => (pinRefs.current[index] = el)}
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={pinDigits[index]}
                onChange={(e) => handlePinChange(index, e.target.value)}
                onKeyDown={(e) => handlePinKeyDown(index, e)}
                onPaste={handlePinPaste}
                autoFocus={index === 0}
                className="w-14 h-16 text-center text-3xl font-bold border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:border-orange-500 dark:focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 outline-none transition-all bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700 shadow-inner text-gray-900 dark:text-white"
              />
            ))}
          </div>
          <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98]">
            접속하기
          </button>
        </form>
        {renderToastContainer()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 p-4 md:p-8 font-sans transition-colors duration-200">
      <datalist id="globalProductList">{uniqueProducts.map(p => <option key={p} value={p} />)}</datalist>
      <datalist id="globalOptionList">{uniqueOptionsAll.map(o => <option key={o} value={o} />)}</datalist>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Carrot className="text-orange-500 shrink-0" />
            당근 재고관리 시스템
            <button 
              onClick={fetchAllData} 
              disabled={isLoading}
              className="ml-1 p-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full transition-colors focus:outline-none shadow-sm" 
              title="최신 데이터 불러오기"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin text-orange-500" : ""} />
            </button>
          </h1>
          <div className="mt-2 flex items-center gap-2 text-xs font-semibold">
            {isDbConnected ? <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-800 shadow-sm"><Database size={12} className="text-emerald-500" /> DB 연동됨</span> : <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-800 shadow-sm"><AlertCircle size={12} className="text-orange-500" /> 로컬 모드</span>}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* --- 새 판매 등록 (뉴트럴/오렌지 테마) --- */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden h-full flex flex-col transition-colors">
              <div className="bg-gray-50/80 dark:bg-gray-800/50 px-5 py-4 border-b border-gray-200 dark:border-gray-800 font-bold text-gray-900 dark:text-white flex items-center gap-2 shrink-0">
                <Plus size={18} className="text-orange-500" /> 새 판매 등록
              </div>
              <form onSubmit={handleAddSale} className="p-5 flex flex-col gap-5 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">판매일</label>
                    <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 pr-1.5 transition-colors focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 shadow-sm">
                      <CustomDatePicker startDate={formData.date} onChange={(start) => setFormData(prev => ({ ...prev, date: start }))} wrapperClassName="flex-1" className="w-full px-3 py-2 text-sm bg-transparent font-bold dark:text-white" isRangeMode={false} />
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, date: today }))} className="shrink-0 px-2.5 py-1 text-xs rounded border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-bold bg-white dark:bg-gray-800 transition-colors">오늘</button>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">상품명</label>
                    <select name="product" value={formData.product} onChange={handleFormChange} className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-sm font-medium focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white" required>
                      <option value="">상품 선택</option>
                      {uniqueProducts.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">옵션명</label>
                    <select name="option" value={formData.option} onChange={handleFormChange} disabled={!formData.product} className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-sm font-medium focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition shadow-sm disabled:bg-gray-50 dark:disabled:bg-gray-900/50 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50" required>
                      <option value="">옵션 선택</option>
                      {availableOptions.map(opt => <option key={opt.id} value={opt.option}>{opt.option}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4 md:col-span-2 md:grid-cols-2">
                    <div>
                      <label className="flex justify-between items-end text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                        <span>판매 개수</span>
                        {selectedRemainQty !== null && (
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${formData.quantity > selectedRemainQty ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                            잔여: {selectedRemainQty}개
                          </span>
                        )}
                      </label>
                      <div className={`flex items-center w-full border rounded-lg overflow-hidden transition-colors shadow-sm bg-white dark:bg-gray-800 ${selectedRemainQty !== null && formData.quantity > selectedRemainQty ? 'border-red-400 dark:border-red-600 focus-within:ring-1 focus-within:border-red-500 focus-within:ring-red-500' : 'border-gray-300 dark:border-gray-700 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500'}`}>
                        <button 
                          type="button" 
                          onClick={() => { const q = Number(formData.quantity) || 0; if (q > 1) handleFormChange({ target: { name: 'quantity', value: q - 1 } }); }}
                          className="px-3 py-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-orange-500 dark:hover:text-orange-400 transition-colors border-r border-gray-200 dark:border-gray-700 focus:outline-none"
                        >
                          <Minus size={14} strokeWidth={2.5} />
                        </button>
                        <input 
                          type="text" 
                          inputMode="numeric" 
                          name="quantity" 
                          value={formData.quantity} 
                          onChange={(e) => { const val = e.target.value.replace(/[^0-9]/g, ''); handleFormChange({ target: { name: 'quantity', value: val } }); }} 
                          className={`flex-1 w-full py-2.5 px-1 text-sm outline-none text-center font-black bg-transparent ${selectedRemainQty !== null && formData.quantity > selectedRemainQty ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10' : 'text-gray-900 dark:text-white'}`} 
                          required 
                        />
                        <button 
                          type="button" 
                          onClick={() => { const q = Number(formData.quantity) || 0; handleFormChange({ target: { name: 'quantity', value: q + 1 } }); }}
                          className="px-3 py-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-orange-500 dark:hover:text-orange-400 transition-colors border-l border-gray-200 dark:border-gray-700 focus:outline-none"
                        >
                          <Plus size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">판매 금액 (원)</label>
                      <input type="text" inputMode="numeric" name="price" value={formData.price === 0 ? '' : Number(formData.price).toLocaleString()} onChange={(e) => { const rawValue = e.target.value.replace(/[^0-9]/g, ''); handleFormChange({ target: { name: 'price', value: Number(rawValue) } }); }} className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-sm font-bold focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition text-right shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white" placeholder="0" required />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">비고 (선택)</label>
                    <input type="text" name="note" value={formData.note} onChange={handleFormChange} className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500" placeholder="입금 방식 등..." />
                  </div>
                </div>
                <div className="mt-auto pt-2">
                  <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md">
                    판매 내역 추가
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden h-full flex flex-col transition-colors">
              <div className="flex bg-gray-50/80 dark:bg-gray-800/50 pt-3 px-4 gap-2 border-b border-gray-200 dark:border-gray-800 shrink-0">
                <button onClick={() => setSummaryTab('sales')} className={`px-5 py-2.5 rounded-t-xl font-bold text-sm transition-colors flex items-center gap-2 ${summaryTab === 'sales' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-t border-x border-gray-200 dark:border-gray-800 shadow-[0_4px_0_0_white] dark:shadow-[0_4px_0_0_#111827] relative z-10' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'}`}>
                  <PieChart size={16} className={summaryTab === 'sales' ? "text-orange-500" : ""} /> 판매 요약
                </button>
                <button onClick={() => setSummaryTab('settlement')} className={`px-5 py-2.5 rounded-t-xl font-bold text-sm transition-colors flex items-center gap-2 ${summaryTab === 'settlement' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-t border-x border-gray-200 dark:border-gray-800 shadow-[0_4px_0_0_white] dark:shadow-[0_4px_0_0_#111827] relative z-10' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'}`}>
                  <Database size={16} className={summaryTab === 'settlement' ? "text-orange-500" : ""} /> 정산 현황
                </button>
              </div>

              {summaryTab === 'sales' && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-5 border-b border-gray-100 dark:border-gray-800 text-center bg-white dark:bg-gray-900 shrink-0">
                    <div className="p-4 border-r border-b md:border-b-0 border-gray-100 dark:border-gray-800 flex flex-col justify-center">
                      <div className="text-[11px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">오늘 수량</div>
                      <div className="font-black text-gray-900 dark:text-white text-lg lg:text-xl">{todayTotalQty}개</div>
                    </div>
                    <div className="p-4 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 flex flex-col justify-center">
                      <div className="text-[11px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">오늘 금액</div>
                      <div className="font-black text-gray-900 dark:text-white text-lg lg:text-xl">{todayTotalAmount.toLocaleString()}원</div>
                    </div>
                    <div className="p-4 border-r border-b md:border-b-0 border-gray-100 dark:border-gray-800 flex flex-col justify-center">
                      <div className="text-[11px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">누적 수량</div>
                      <div className="font-bold text-gray-700 dark:text-gray-300 text-base lg:text-lg">{totalSalesSummary.totalQty}개</div>
                    </div>
                    <div className="p-4 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 flex flex-col justify-center">
                      <div className="text-[11px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">누적 금액</div>
                      <div className="font-bold text-gray-700 dark:text-gray-300 text-base lg:text-lg">{totalSalesSummary.totalAmount.toLocaleString()}원</div>
                    </div>
                    <div className="p-4 col-span-2 md:col-span-1 flex flex-col justify-center">
                      <div className="text-[11px] md:text-xs font-bold text-orange-500 mb-1.5">남은 재고</div>
                      <div className="font-black text-orange-500 text-lg lg:text-xl">{totalRemainQty}개</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800/30 px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">오늘 판매 상세 내역</span>
                    <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                      <Calendar size={12} className="text-orange-500" />
                      <span>{formatDateWithDay(today)}</span>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 bg-white dark:bg-gray-900 relative">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 dark:bg-gray-800/80 sticky top-0 text-gray-500 dark:text-gray-400 z-10 border-b border-gray-100 dark:border-gray-800 text-xs">
                        <tr>
                          <th className="px-5 py-3 font-semibold w-[45%] md:w-[25%]">상품명 <span className="md:hidden font-normal text-gray-400 ml-1">/ 옵션</span></th>
                          <th className="px-5 py-3 font-semibold hidden md:table-cell md:w-[20%]">옵션명</th>
                          <th className="px-3 py-3 font-semibold text-center w-[15%]">수량</th>
                          <th className="px-3 py-3 font-semibold text-right w-[25%] md:w-[15%]">금액</th>
                          <th className="pl-6 pr-3 py-3 font-semibold hidden md:table-cell md:w-[15%]">비고</th>
                          <th className="px-3 py-3 text-center w-[15%] md:w-[10%]">관리</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                        {todayDetailedSales.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="py-20">
                              <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                                <Archive size={40} className="text-gray-200 dark:text-gray-700 mb-3" strokeWidth={1.5} />
                                <span className="text-sm font-medium">오늘 등록된 판매 내역이 없습니다.</span>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          todayDetailedSales.map((sale) => {
                            if (editingSaleId === sale.id) {
                              return (
                                <tr key={sale.id} className="bg-orange-50/50 dark:bg-orange-900/10">
                                  <td className="px-2 py-2 whitespace-nowrap">
                                    <input type="text" value={editForm.product} onChange={e => setEditForm({...editForm, product: e.target.value})} className="w-full h-8 md:h-9 border border-gray-300 dark:border-gray-600 rounded-md px-2 md:px-3 text-xs md:text-sm font-bold mb-1 md:mb-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 outline-none" placeholder="상품명" />
                                    <input type="text" value={editForm.option} onChange={e => setEditForm({...editForm, option: e.target.value})} className="w-full h-8 md:h-9 border border-gray-300 dark:border-gray-600 rounded-md px-2 text-xs mb-1 md:hidden bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 outline-none" placeholder="옵션명" />
                                    <input type="text" value={editForm.note} onChange={e => setEditForm({...editForm, note: e.target.value})} className="w-full h-8 md:h-9 border border-gray-300 dark:border-gray-600 rounded-md px-2 text-xs md:hidden bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 outline-none" placeholder="비고" />
                                  </td>
                                  <td className="px-2 py-2 hidden md:table-cell">
                                    <input type="text" value={editForm.option} onChange={e => setEditForm({...editForm, option: e.target.value})} className="w-full h-8 md:h-9 border border-gray-300 dark:border-gray-600 rounded-md px-2 md:px-3 text-xs md:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 outline-none" />
                                  </td>
                                  <td className="px-1 py-2 text-center">
                                    {/* 💡 모바일 환경: +/- 버튼 숨기고 숫자패드 입력만 활성화 */}
                                    <div className="flex items-center justify-center w-full sm:w-[90px] h-8 md:h-9 mx-auto border border-gray-300 dark:border-gray-600 sm:rounded-md overflow-hidden bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus-within:ring-1 focus-within:ring-orange-500 transition-shadow rounded">
                                       <button type="button" onClick={() => { const q = Number(editForm.quantity) || 0; if (q > 1) setEditForm({...editForm, quantity: q - 1}); }} className="hidden sm:flex px-2 h-full items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 border-r border-gray-200 dark:border-gray-600 focus:outline-none"><Minus size={12} strokeWidth={2.5}/></button>
                                       <input type="text" inputMode="numeric" pattern="[0-9]*" value={editForm.quantity} onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); setEditForm({...editForm, quantity: val}); }} className="flex-1 w-full h-full text-center text-xs md:text-sm font-black bg-transparent outline-none" />
                                       <button type="button" onClick={() => { const q = Number(editForm.quantity) || 0; setEditForm({...editForm, quantity: q + 1}); }} className="hidden sm:flex px-2 h-full items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 border-l border-gray-200 dark:border-gray-600 focus:outline-none"><Plus size={12} strokeWidth={2.5}/></button>
                                    </div>
                                  </td>
                                  <td className="px-1 py-2 text-right">
                                    {/* 💡 모바일 환경: 숫자패드 입력만 활성화 */}
                                    <input type="text" inputMode="numeric" pattern="[0-9]*" value={editForm.price === 0 ? '' : Number(editForm.price).toLocaleString()} onChange={e => { const rawValue = e.target.value.replace(/[^0-9]/g, ''); setEditForm({...editForm, price: Number(rawValue)}); }} className="w-full min-w-0 sm:min-w-[70px] h-8 md:h-9 ml-auto border border-gray-300 dark:border-gray-600 rounded px-1 sm:px-3 text-xs md:text-sm font-bold text-right bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 outline-none" placeholder="0" />
                                  </td>
                                  <td className="px-2 py-2 hidden md:table-cell">
                                    <input type="text" value={editForm.note} onChange={e => setEditForm({...editForm, note: e.target.value})} className="w-full h-8 md:h-9 border border-gray-300 dark:border-gray-600 rounded px-2 md:px-3 text-xs md:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 outline-none" />
                                  </td>
                                  <td className="px-1 py-2 text-center">
                                    <div className="flex justify-center items-center gap-1.5">
                                      <button onClick={saveEdit} className="text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 p-1.5 md:p-2 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 transition-colors"><Check size={14}/></button>
                                      <button onClick={cancelEdit} className="text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 p-1.5 md:p-2 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 transition-colors"><X size={14}/></button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            }

                            return (
                              <tr key={sale.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 group transition-colors">
                                <td className="px-5 py-3.5 whitespace-nowrap">
                                  <div className="font-bold leading-tight text-gray-900 dark:text-white">
                                    {sale.product}
                                  </div>
                                  <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 md:hidden">{sale.option}</div>
                                  <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 md:hidden truncate max-w-[150px]">{sale.note}</div>
                                </td>
                                <td className="px-5 py-3.5 hidden md:table-cell text-gray-600 dark:text-gray-400">{sale.option}</td>
                                <td className="px-3 py-3.5 text-center font-bold text-gray-900 dark:text-gray-200">{sale.quantity}</td>
                                <td className="px-3 py-3.5 text-right">
                                  <div className="font-black whitespace-nowrap text-gray-900 dark:text-white">{sale.totalPrice.toLocaleString()}원</div>
                                </td>
                                <td className="pl-6 pr-3 py-3.5 text-gray-500 dark:text-gray-400 text-xs truncate hidden md:table-cell" title={sale.note}>{sale.note}</td>
                                <td className="px-3 py-3.5 text-center">
                                  <div className="flex justify-center items-center gap-1.5 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => startEdit(sale)} className="text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="수정"><Edit2 size={16}/></button>
                                    <button onClick={() => handleDeleteSale(sale.id)} className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors" title="삭제"><Trash2 size={16}/></button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {summaryTab === 'settlement' && (
                <div className="flex-1 p-5 md:p-6 bg-white dark:bg-gray-900 overflow-y-auto">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                    <div>
                      <h2 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2"><Database size={18} className="text-orange-500" /> 정산 및 시재 점검</h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">현재 실제 보유 자산을 입력하여 미정산금과의 오차를 확인하세요.</p>
                    </div>
                    <button 
                      onClick={handleSaveSettlement} 
                      disabled={isSettlementSaving}
                      className="w-full sm:w-auto bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white px-5 py-2.5 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300 dark:disabled:bg-gray-800 whitespace-nowrap shadow-sm"
                    >
                      <Check size={14} /> 
                      <span>{isSettlementSaving ? "저장 중..." : "정산 내역 저장"}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {[
                      { key: 'intermediate', label: '대표님 송금액', desc: '입금 완료한 정산금', icon: <Coins size={16} className="text-gray-500 dark:text-gray-400" /> },
                      { key: 'account', label: '내 계좌 잔액', desc: '현재 계좌 잔고', icon: <Landmark size={16} className="text-gray-500 dark:text-gray-400" /> },
                      { key: 'cash', label: '보유중인 현금', desc: '현재 수중의 현금', icon: <Banknote size={16} className="text-gray-500 dark:text-gray-400" /> }
                    ].map((item) => (
                      <div key={item.key} className="p-4 bg-gray-50/80 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col justify-between h-full transition-colors">
                        <div className="flex flex-col items-start mb-4">
                          <div className="flex items-center gap-2 mb-1.5">
                            {item.icon}
                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">{item.label}</span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 break-keep">{item.desc}</span>
                        </div>
                        <div className="flex items-center justify-end border-b border-gray-300 dark:border-gray-600 pb-1.5 focus-within:border-orange-500 dark:focus-within:border-orange-500 transition-colors">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={settlementData[item.key] === 0 ? '' : settlementData[item.key].toLocaleString()}
                            onChange={(e) => {
                              const rawValue = e.target.value.replace(/[^0-9]/g, '');
                              setSettlementData({ ...settlementData, [item.key]: Number(rawValue) || 0 });
                            }}
                            className="w-full text-right font-black text-xl bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600"
                            placeholder="0"
                          />
                          <span className="ml-1.5 text-sm font-bold text-gray-500 dark:text-gray-400">원</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {(() => {
                    const remitted = Number(settlementData.intermediate) || 0; 
                    const inAccount = Number(settlementData.account) || 0;     
                    const inCash = Number(settlementData.cash) || 0;           
                    const totalSales = totalSalesSummary.totalAmount || 0;     
                    const unsettledAmount = totalSales - remitted;
                    const totalAsset = inAccount + inCash;
                    const tillDifference = totalAsset - unsettledAmount;

                    return (
                      <div className="flex flex-col gap-3">
                        <div className="p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between md:items-center shadow-sm gap-2">
                          <div>
                            <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center text-sm">
                              <Clock size={16} className="text-gray-500 dark:text-gray-400 mr-2" /> 미정산금 <span className="font-normal text-xs text-gray-500 ml-1.5">(보관 중)</span>
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                              누적 판매금({totalSales.toLocaleString()}원) - 송금액({remitted.toLocaleString()}원)
                            </span>
                          </div>
                          <span className="font-black text-xl text-gray-900 dark:text-white text-right">
                            {unsettledAmount.toLocaleString()} 원
                          </span>
                        </div>

                        <div className="p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between md:items-center shadow-sm gap-2">
                          <div>
                            <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center text-sm">
                              <Wallet size={16} className="text-gray-500 dark:text-gray-400 mr-2" /> 현재 보유 자산 <span className="font-normal text-xs text-gray-500 ml-1.5">(계좌+현금)</span>
                            </span>
                          </div>
                          <span className="font-black text-xl text-gray-900 dark:text-white text-right">
                            {totalAsset.toLocaleString()} 원
                          </span>
                        </div>

                        <div className={`p-5 rounded-xl border flex flex-col md:flex-row justify-between md:items-center shadow-sm gap-2 transition-colors ${tillDifference === 0 ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50' : tillDifference > 0 ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/50' : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50'}`}>
                          <div>
                            <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center text-sm">
                              <Scale size={16} className={`mr-2 ${tillDifference === 0 ? 'text-emerald-500' : tillDifference > 0 ? 'text-blue-500' : 'text-red-500'}`} /> 최종 시재 (차액)
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                              {tillDifference === 0 ? '정산 내역이 완벽히 일치합니다.' : 
                               tillDifference > 0 ? '보유 자산이 미정산금보다 많습니다.' : 
                               '보유 자산이 미정산금보다 부족합니다.'}
                            </span>
                          </div>
                          <span className={`font-black text-2xl text-right ${tillDifference === 0 ? 'text-emerald-600 dark:text-emerald-400' : tillDifference > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                            {tillDifference > 0 ? '+' : ''}{tillDifference.toLocaleString()} <span className="text-base font-bold ml-0.5">원</span>
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden relative transition-colors">
               <div className="bg-gray-50 dark:bg-gray-800/50 px-5 py-4 border-b border-gray-200 dark:border-gray-800 font-bold text-gray-900 dark:text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2"><Archive size={18} className="text-gray-500" /> 누적 판매 요약</div>
                <button onClick={() => setMaximizedView('total')} className="text-gray-400 hover:text-gray-900 dark:hover:text-white p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="상세 내역 확대 보기"><Maximize2 size={16} /></button>
              </div>
               <div className="p-0 flex-1 overflow-y-auto min-h-0">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-900/50 sticky top-0 border-b border-gray-100 dark:border-gray-800">
                    <tr>
                      <th className="px-4 py-3 font-semibold">상품명</th>
                      <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">수량</th>
                      <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">금액</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                    {totalSalesSummary.list.length === 0 ? (
                      <tr><td colSpan="3" className="text-center text-gray-400 dark:text-gray-500 py-16">판매 데이터가 없습니다.</td></tr>
                    ) : (
                      totalSalesSummary.list.map((item, idx) => {
                        const percent = totalSalesSummary.totalQty > 0 ? Math.round((item.quantity / totalSalesSummary.totalQty) * 100) : 0;
                        return (
                          <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                            <td className="px-4 py-3">
                              <div className="font-bold text-gray-800 dark:text-gray-200 break-keep">{item.product}</div>
                              <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">비중: {percent}%</div>
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-gray-200">{item.quantity}</td>
                            <td className="px-4 py-3 text-right font-black text-gray-900 dark:text-white">{item.amount.toLocaleString()}원</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-gray-800/50 font-bold border-t border-gray-200 dark:border-gray-800 sticky bottom-0">
                    <tr>
                      <td className="px-4 py-3.5 text-gray-800 dark:text-gray-200 text-xs">누적 합계</td>
                      <td className="px-4 py-3.5 text-right text-gray-800 dark:text-gray-200">{totalSalesSummary.totalQty}</td>
                      <td className="px-4 py-3.5 text-right text-gray-900 dark:text-white">{totalSalesSummary.totalAmount.toLocaleString()}원</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* 💡 실시간 재고 현황 메인 화면 모바일 UI 최적화 */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden h-full flex flex-col relative transition-colors">
              <div className="bg-gray-50 dark:bg-gray-800/50 px-5 py-4 border-b border-gray-200 dark:border-gray-800 font-bold text-gray-900 dark:text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2"><Box size={18} className="text-orange-500" /> 실시간 재고 현황</div>
                <button onClick={() => setMaximizedView('inventory')} className="text-gray-400 hover:text-gray-900 dark:hover:text-white p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="재고 관리 확대 보기"><Maximize2 size={16} /></button>
              </div>
              <div className="flex-1 overflow-x-auto min-h-0 relative">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 sticky top-0 shadow-sm border-b border-gray-100 dark:border-gray-800">
                    <tr>
                      <th className="px-4 sm:px-5 py-3.5 font-semibold w-[45%] sm:w-auto">상품명 <span className="sm:hidden font-normal text-gray-400 ml-1">/ 옵션</span></th>
                      <th className="px-5 py-3.5 font-semibold hidden sm:table-cell">옵션명</th>
                      <th className="px-2 sm:px-4 py-3.5 font-semibold text-center w-[25%] sm:w-auto whitespace-nowrap">총 수량</th>
                      <th className="px-2 sm:px-4 py-3.5 font-semibold text-center w-[30%] sm:w-auto whitespace-nowrap">남은 수량</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                    {currentInventory.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-24">
                          <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                            <Box size={48} className="text-gray-200 dark:text-gray-700 mb-4" strokeWidth={1.5} />
                            <span className="text-base font-medium">등록된 재고가 없습니다.</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentInventory.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors">
                          <td className="px-4 sm:px-5 py-3">
                            <div className="font-bold text-gray-900 dark:text-white leading-tight break-keep">{item.product}</div>
                            {/* 모바일에서는 옵션명을 상품명 아래에 표시 */}
                            <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 sm:hidden">{item.option}</div>
                          </td>
                          <td className="px-5 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap text-sm hidden sm:table-cell">{item.option}</td>
                          <td className="px-2 sm:px-4 py-3 text-center font-semibold text-gray-600 dark:text-gray-400">{item.qty}</td>
                          <td className="px-2 sm:px-4 py-3 text-center">
                            <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md font-black text-xs sm:text-sm ${item.remainQty === 0 ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-800 text-orange-500'}`}>{item.remainQty}</span>
                          </td>
                        </tr>
                      ))
                    )}
                    <tr className="h-full pointer-events-none"><td colSpan="4" className="p-0 border-0"></td></tr>
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 font-bold text-gray-800 dark:text-gray-200 sticky bottom-0">
                    <tr>
                      <td colSpan="2" className="px-4 sm:px-5 py-4 text-center text-xs">전체 합계</td>
                      <td className="px-2 sm:px-4 py-4 text-center text-base">{currentInventory.reduce((acc, curr) => acc + curr.qty, 0)}</td>
                      <td className="px-2 sm:px-4 py-4 text-center text-orange-500 text-lg sm:text-xl font-black">{currentInventory.reduce((acc, curr) => acc + curr.remainQty, 0)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- 모달 (상세 보기) 영역 --- */}
      {maximizedView && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-6 lg:p-8 transition-colors">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl h-[95vh] sm:h-[85vh] flex flex-col overflow-hidden border-2 border-gray-200 dark:border-gray-700">
            
            <div className="px-4 sm:px-6 py-4 flex justify-between items-center border-b shrink-0 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
              <div className="flex items-center gap-3">
                {maximizedView === 'total' ? <Archive size={24} className="text-orange-500 shrink-0" /> : <Box size={24} className="text-orange-500 shrink-0" />}
                <div>
                  <h2 className="text-lg sm:text-xl font-black">
                    {maximizedView === 'total' ? "전체 판매 상세 내역" : "재고 상세 관리 및 추가"}
                  </h2>
                </div>
              </div>
              <button onClick={handleCloseModal} className="p-2 rounded-lg transition-colors text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 shrink-0"><X size={24} /></button>
            </div>

            {maximizedView === 'inventory' ? (
              <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/50 dark:bg-gray-900">
                
                <div className="flex bg-gray-100 dark:bg-gray-800/50 px-3 sm:px-5 pt-3 sm:pt-4 gap-2 shrink-0 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
                  <button className={`px-4 sm:px-5 py-2.5 rounded-t-xl font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 whitespace-nowrap ${invTab === 'stock' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-t border-x border-gray-200 dark:border-gray-800 shadow-[0_4px_0_0_white] dark:shadow-[0_4px_0_0_#111827]' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-800'}`} onClick={() => { setInvTab('stock'); setPendingRawData([]); setShowRawDataInput(false); }}><Package size={16} className={invTab === 'stock' ? "text-orange-500" : ""} /> 재고 현황</button>
                  <button className={`px-4 sm:px-5 py-2.5 rounded-t-xl font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 whitespace-nowrap ${invTab === 'mapping' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-t border-x border-gray-200 dark:border-gray-800 shadow-[0_4px_0_0_white] dark:shadow-[0_4px_0_0_#111827]' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-800'}`} onClick={() => setInvTab('mapping')}><Link size={16} className={invTab === 'mapping' ? "text-orange-500" : ""} /> 데이터 매칭 관리</button>
                </div>

                {invTab === 'stock' && pendingRawData.length === 0 && (
                  <>
                    <div className="px-4 sm:px-6 py-3.5 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0 shadow-sm z-30 flex-wrap gap-3">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
                        <div className="flex items-center gap-2 flex-1 sm:flex-none">
                          <label className="text-[11px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">상품 검색</label>
                          <div className="relative w-full sm:w-40"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" value={searchProduct} onChange={(e) => { setSearchProduct(e.target.value); setSearchOption(''); }} placeholder="상품명" className="w-full pl-8 pr-3 py-1.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all" /></div>
                        </div>
                        {searchProduct && (
                          <div className="flex items-center gap-2 flex-1 sm:flex-none">
                            <label className="text-[11px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">옵션 선택</label>
                            <div className="relative w-full sm:w-40">
                              <select value={searchOption} onChange={(e) => setSearchOption(e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 cursor-pointer appearance-none">
                                <option value="">모든 옵션</option>
                                {Array.from(new Set(inventoryData.filter(item => item.product.toLowerCase().includes(searchProduct.toLowerCase().trim())).map(item => item.option))).map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                 <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                              </div>
                            </div>
                          </div>
                        )}
                        {(searchProduct || searchOption) && <button onClick={() => { setSearchProduct(''); setSearchOption(''); }} className="text-[11px] sm:text-xs text-gray-400 hover:text-gray-800 dark:hover:text-white underline font-bold whitespace-nowrap shrink-0">초기화</button>}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-auto w-full sm:w-auto justify-end">
                        <button onClick={() => exportToCSV(processedInventory, 'inventory')} className="hidden sm:flex px-3 py-2 rounded-lg text-xs font-bold transition-colors items-center gap-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-700 shrink-0">
                          <Download size={14} /> <span>CSV 내보내기</span>
                        </button>
                        
                        <button onClick={() => setShowRawDataInput(!showRawDataInput)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 flex-1 sm:flex-none ${showRawDataInput ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' : 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm'}`}>
                          {showRawDataInput ? <X size={14} /> : <Plus size={14} />} <span className="whitespace-nowrap">{showRawDataInput ? "닫기" : "재고 추가"}</span>
                        </button>
                      </div>
                    </div>

                    {showRawDataInput && (
                      <div className="px-4 sm:px-6 py-4 sm:py-5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 shrink-0 shadow-inner flex flex-col gap-4">
                        <div className="flex gap-4 sm:gap-6 border-b border-gray-200 dark:border-gray-700 pb-3">
                          {/* 💡 이모티콘 제거하고 깔끔한 아이콘으로 복구 */}
                          <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer font-bold text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors">
                            <input type="radio" name="addMode" value="manual" checked={addMode === 'manual'} onChange={() => setAddMode('manual')} className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 focus:ring-orange-500 cursor-pointer" />
                            <PenTool size={16} className={addMode === 'manual' ? "text-orange-500" : "text-gray-400"} />
                            <span className={addMode === 'manual' ? "text-orange-500" : ""}>수동 직접 입력</span>
                          </label>
                          <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer font-bold text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors">
                            <input type="radio" name="addMode" value="bulk" checked={addMode === 'bulk'} onChange={() => setAddMode('bulk')} className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 focus:ring-orange-500 cursor-pointer" />
                            <ClipboardList size={16} className={addMode === 'bulk' ? "text-orange-500" : "text-gray-400"} />
                            <span className={addMode === 'bulk' ? "text-orange-500" : ""}>텍스트 일괄 붙여넣기 (Raw Data)</span>
                          </label>
                        </div>

                        {addMode === 'manual' ? (
                          <form onSubmit={handleAddManualInv} className="flex flex-wrap md:flex-nowrap gap-3 items-end bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div className="w-full md:flex-1">
                              <label className="block text-[11px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">상품명</label>
                              <input list="globalProductList" value={manualAddForm.product} onChange={e => setManualAddForm({...manualAddForm, product: e.target.value})} className="w-full border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white rounded-lg px-3 py-2 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none transition-shadow" placeholder="직접 입력 또는 선택" required />
                            </div>
                            <div className="w-full md:flex-1">
                              <label className="block text-[11px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">옵션명</label>
                              <input list="globalOptionList" value={manualAddForm.option} onChange={e => setManualAddForm({...manualAddForm, option: e.target.value})} className="w-full border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white rounded-lg px-3 py-2 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none transition-shadow" placeholder="직접 입력 또는 선택" required />
                            </div>
                            
                            <div className="w-full md:w-[130px]">
                              <label className="block text-[11px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">수량</label>
                              <div className="flex items-center w-full border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-orange-500 bg-transparent text-gray-900 dark:text-white transition-shadow">
                                <button type="button" onClick={() => { const q = Number(manualAddForm.qty) || 0; if (q > 1) setManualAddForm({...manualAddForm, qty: q - 1 }); }} className="px-3 py-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border-r border-gray-300 dark:border-gray-700 focus:outline-none"><Minus size={14} strokeWidth={2.5}/></button>
                                <input type="text" inputMode="numeric" pattern="[0-9]*" value={manualAddForm.qty} onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); setManualAddForm({...manualAddForm, qty: val}); }} className="flex-1 w-full text-center text-xs sm:text-sm font-black bg-transparent outline-none py-2" required />
                                <button type="button" onClick={() => { const q = Number(manualAddForm.qty) || 0; setManualAddForm({...manualAddForm, qty: q + 1 }); }} className="px-3 py-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border-l border-gray-300 dark:border-gray-700 focus:outline-none"><Plus size={14} strokeWidth={2.5}/></button>
                              </div>
                            </div>

                            <div className="w-full md:w-[150px]">
                              <label className="block text-[11px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">판매 금액 (원)</label>
                              <input type="text" inputMode="numeric" pattern="[0-9]*" value={manualAddForm.sellPrice === 0 ? '' : Number(manualAddForm.sellPrice).toLocaleString()} onChange={e => { const rawValue = e.target.value.replace(/[^0-9]/g, ''); setManualAddForm({...manualAddForm, sellPrice: Number(rawValue)}); }} className="w-full border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white rounded-lg px-3 py-2 text-xs sm:text-sm font-black focus:ring-2 focus:ring-orange-500 outline-none text-right transition-shadow" placeholder="0" />
                            </div>

                            <button type="submit" className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg px-8 py-2.5 transition-colors shadow-sm flex items-center justify-center h-[42px] shrink-0 mt-2 md:mt-0">
                              <Plus size={18} className="mr-1"/> 추가
                            </button>
                          </form>
                        ) : (
                          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><ClipboardList size={16} className="text-orange-500" /> 스마트 인식</h3>
                            <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
                              <textarea value={bulkInvInput} onChange={(e) => setBulkInvInput(e.target.value)} placeholder="상차된 상품목록 데이터를 복사해서 바로 붙여넣으세요.&#13;&#10;자동으로 옵션ID, 상품명, 수량을 인식해서 매칭해줍니다!" className="flex-1 border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white rounded-lg p-3 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500 resize-none h-24 font-mono leading-relaxed transition-shadow placeholder-gray-400" />
                              <button onClick={handleParseRawData} className="bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white font-bold rounded-lg px-6 py-2.5 sm:py-3 transition-colors shadow-sm flex md:flex-col items-center justify-center gap-2 shrink-0 md:w-36 h-auto"><Search size={18} className="sm:w-5 sm:h-5" /><span>데이터 인식</span></button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 💡 재고 현황 모달창 모바일 UI 최적화 */}
                    <div className="flex-1 overflow-x-auto overflow-y-auto bg-white dark:bg-gray-900 relative">
                      <table className="w-full text-sm text-left min-w-[340px] sm:min-w-[700px]">
                        <thead className="bg-gray-50 dark:bg-gray-800/80 sticky top-0 shadow-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 z-10 text-[11px] sm:text-xs">
                          <tr>
                            <th className="px-3 sm:px-6 py-3 font-semibold w-[45%] sm:w-[25%] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none transition-colors" onClick={() => requestSort('product')}><div className="flex items-center gap-1">상품명 <span className="sm:hidden font-normal text-gray-400">/ 정보</span> {getSortIcon('product')}</div></th>
                            <th className="px-6 py-3 font-semibold w-[20%] hidden sm:table-cell cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none transition-colors" onClick={() => requestSort('option')}><div className="flex items-center gap-1">옵션명 {getSortIcon('option')}</div></th>
                            <th className="px-1 sm:px-6 py-3 font-semibold text-center sm:text-right w-[15%] sm:w-[15%] whitespace-nowrap cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none transition-colors" onClick={() => requestSort('qty')}><div className="flex items-center justify-center sm:justify-end gap-1">총 수량 {getSortIcon('qty')}</div></th>
                            <th className="px-6 py-3 font-semibold text-right hidden sm:table-cell w-[15%] whitespace-nowrap cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none transition-colors" onClick={() => requestSort('sellPrice')}><div className="flex items-center justify-end gap-1">판매 금액 {getSortIcon('sellPrice')}</div></th>
                            <th className="px-1 sm:px-6 py-3 font-semibold text-center w-[20%] sm:w-[15%] whitespace-nowrap cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none transition-colors" onClick={() => requestSort('remainQty')}><div className="flex items-center justify-center gap-1">남은 수량 {getSortIcon('remainQty')}</div></th>
                            <th className="px-1 sm:px-6 py-3 font-semibold text-center w-[20%] sm:w-[10%] whitespace-nowrap">관리</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                          {processedInventory.length === 0 ? (
                            <tr><td colSpan="6" className="text-center text-gray-400 py-20 text-sm font-medium">해당 조건의 재고 데이터가 없습니다.</td></tr>
                          ) : (
                            processedInventory.map((item) => {
                              if (editingInvId === item.id) {
                                return (
                                  <tr key={item.id} className="bg-orange-50/50 dark:bg-orange-900/10">
                                    <td className="px-2 sm:px-4 py-2">
                                      <input type="text" value={invEditForm.product} onChange={e => setInvEditForm({...invEditForm, product: e.target.value})} className="w-full h-8 border border-gray-300 dark:border-gray-600 rounded px-2 text-xs sm:text-sm font-bold bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 outline-none" placeholder="상품명" />
                                      {/* 모바일에서는 옵션명, 금액을 상품명 칸 아래에서 편집 가능하도록 표시 */}
                                      <input type="text" value={invEditForm.option} onChange={e => setInvEditForm({...invEditForm, option: e.target.value})} className="w-full h-8 border border-gray-300 dark:border-gray-600 rounded px-2 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 outline-none sm:hidden mt-1" placeholder="옵션명" />
                                      <input type="text" inputMode="numeric" pattern="[0-9]*" value={invEditForm.sellPrice === 0 ? '' : Number(invEditForm.sellPrice).toLocaleString()} onChange={e => { const rawValue = e.target.value.replace(/[^0-9]/g, ''); setInvEditForm({...invEditForm, sellPrice: Number(rawValue)}); }} className="w-full h-8 border border-gray-300 dark:border-gray-600 rounded px-2 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 outline-none sm:hidden mt-1 font-bold text-right" placeholder="판매 금액" />
                                    </td>
                                    <td className="px-4 py-2 hidden sm:table-cell">
                                      <input type="text" value={invEditForm.option} onChange={e => setInvEditForm({...invEditForm, option: e.target.value})} className="w-full h-8 border border-gray-300 dark:border-gray-600 rounded px-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 outline-none" placeholder="옵션명" />
                                    </td>
                                    <td className="px-1 sm:px-4 py-2 text-center sm:text-right">
                                      {/* 모바일 환경: 숫자패드 입력만 활성화 */}
                                      <div className="flex items-center justify-center w-full sm:w-[90px] h-8 mx-auto sm:border sm:border-gray-300 dark:sm:border-gray-600 rounded overflow-hidden bg-transparent sm:bg-white dark:sm:bg-gray-800 text-gray-900 dark:text-white focus-within:ring-1 focus-within:ring-orange-500 transition-shadow">
                                         <button type="button" onClick={() => { const q = Number(invEditForm.qty) || 0; if (q > 0) setInvEditForm({...invEditForm, qty: q - 1}); }} className="hidden sm:flex px-2 h-full items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border-r border-gray-200 dark:border-gray-600 focus:outline-none"><Minus size={12} strokeWidth={2.5}/></button>
                                         <input type="text" inputMode="numeric" pattern="[0-9]*" value={invEditForm.qty} onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); setInvEditForm({...invEditForm, qty: val}); }} className="flex-1 w-full h-full text-center text-xs sm:text-sm font-black bg-white dark:bg-gray-800 sm:bg-transparent border border-gray-300 dark:border-gray-600 sm:border-0 rounded-md sm:rounded-none outline-none" />
                                         <button type="button" onClick={() => { const q = Number(invEditForm.qty) || 0; setInvEditForm({...invEditForm, qty: q + 1}); }} className="hidden sm:flex px-2 h-full items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border-l border-gray-200 dark:border-gray-600 focus:outline-none"><Plus size={12} strokeWidth={2.5}/></button>
                                      </div>
                                    </td>
                                    <td className="px-4 py-2 text-right hidden sm:table-cell">
                                      <input type="text" inputMode="numeric" pattern="[0-9]*" value={invEditForm.sellPrice === 0 ? '' : Number(invEditForm.sellPrice).toLocaleString()} onChange={e => { const rawValue = e.target.value.replace(/[^0-9]/g, ''); setInvEditForm({...invEditForm, sellPrice: Number(rawValue)}); }} className="w-full sm:w-24 h-8 border border-gray-300 dark:border-gray-600 rounded px-2 text-sm text-right ml-auto font-bold bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 outline-none" placeholder="0" />
                                    </td>
                                    <td className="px-1 sm:px-4 py-2 text-center text-gray-400 text-[10px] sm:text-xs font-medium">자동 계산</td>
                                    <td className="px-1 sm:px-4 py-2 text-center">
                                      <div className="flex justify-center items-center gap-1 sm:gap-1.5">
                                        <button onClick={saveInvEdit} className="text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 p-1.5 rounded-md border border-gray-200 dark:border-gray-700 transition-colors shadow-sm"><Check size={14} className="sm:w-4 sm:h-4" /></button>
                                        <button onClick={cancelInvEdit} className="text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 p-1.5 rounded-md border border-gray-200 dark:border-gray-700 transition-colors shadow-sm"><X size={14} className="sm:w-4 sm:h-4" /></button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              }
                              return (
                                <tr key={item.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 group transition-colors">
                                  <td className="px-3 sm:px-6 py-2.5 sm:py-3">
                                    <div className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white break-keep leading-tight">{item.product}</div>
                                    <div className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 mt-1 sm:hidden">{item.option}</div>
                                    <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 sm:hidden mt-0.5">{item.sellPrice.toLocaleString()}원</div>
                                  </td>
                                  <td className="px-6 py-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-keep hidden sm:table-cell">{item.option}</td>
                                  <td className="px-1 sm:px-6 py-2.5 sm:py-3 text-center sm:text-right font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-200">{item.qty}</td>
                                  <td className="px-6 py-3 text-right font-black text-xs sm:text-sm text-gray-900 dark:text-white hidden sm:table-cell">{item.sellPrice.toLocaleString()}원</td>
                                  <td className="px-1 sm:px-6 py-2.5 sm:py-3 text-center">
                                    <span className={`inline-flex items-center justify-center px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md font-black text-[10px] sm:text-sm ${item.remainQty === 0 ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-800 text-orange-500'}`}>{item.remainQty}</span>
                                  </td>
                                  <td className="px-1 sm:px-6 py-2.5 sm:py-3 text-center">
                                    <div className="flex justify-center items-center gap-1 sm:gap-1.5 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => startInvEdit(item)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white p-1 sm:p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="재고 수정"><Edit2 size={14} className="sm:w-4 sm:h-4" /></button>
                                      <button onClick={() => handleDeleteInv(item.id)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1 sm:p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors" title="품목 삭제"><Trash2 size={14} className="sm:w-4 sm:h-4" /></button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {invTab === 'stock' && pendingRawData.length > 0 && (
                  <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-900">
                    <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm shrink-0 gap-3">
                      <div>
                        <h3 className="text-sm sm:text-lg font-black text-gray-900 dark:text-white flex items-center gap-1.5 sm:gap-2"><AlertCircle size={16} className="text-orange-500 sm:w-[18px] sm:h-[18px]" /> 인식된 데이터 ({pendingRawData.length}건)<span className="text-[10px] sm:text-sm bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 sm:px-2.5 py-0.5 rounded-full ml-1.5 sm:ml-2 font-bold">총: {pendingRawData.reduce((a, c) => a + c.qty, 0)}개</span></h3>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto"><button onClick={() => setPendingRawData([])} className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-xs sm:text-sm font-bold transition-colors">취소</button><button onClick={applyPendingData} className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white hover:bg-black dark:hover:bg-gray-600 rounded-lg text-xs sm:text-sm font-bold shadow-sm transition-colors">매칭 저장 및 반영</button></div>
                    </div>
                    <div className="flex-1 overflow-x-auto overflow-y-auto">
                      <table className="w-full text-sm text-left min-w-[600px] sm:min-w-[700px]">
                        <thead className="bg-gray-50 dark:bg-gray-800/80 sticky top-0 shadow-sm text-gray-500 dark:text-gray-400 text-[11px] sm:text-xs border-b border-gray-100 dark:border-gray-800">
                          <tr><th className="px-4 sm:px-5 py-3 sm:py-3.5 w-[30%] sm:w-1/3 font-semibold">Raw Data</th><th className="px-2 sm:px-5 py-3 sm:py-3.5 text-right font-semibold">수량</th><th className="px-3 sm:px-5 py-3 sm:py-3.5 font-semibold">매칭 상품</th><th className="px-3 sm:px-5 py-3 sm:py-3.5 font-semibold">매칭 옵션</th><th className="px-3 sm:px-5 py-3 sm:py-3.5 text-right font-semibold">판매 금액(원)</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                          {pendingRawData.map((item, idx) => (
                            <tr key={idx} className={item.mapped ? "bg-gray-50/50 dark:bg-gray-800/30" : "bg-red-50/50 dark:bg-red-900/10"}>
                              <td className="px-4 sm:px-5 py-2 sm:py-3 text-[10px] sm:text-xs"><div className="font-mono text-gray-500 dark:text-gray-400">{item.rawId}</div><div className="font-bold text-gray-900 dark:text-white mt-0.5 leading-tight">{item.rawName.split(',')[0]}</div></td>
                              <td className="px-2 sm:px-5 py-2 sm:py-3 text-right font-black text-gray-900 dark:text-white text-sm sm:text-base">{item.qty}</td>
                              <td className="px-3 sm:px-5 py-2 sm:py-3"><input list="globalProductList" value={item.mapTo.product} onChange={(e) => updatePendingMap(idx, 'product', e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-1.5 sm:px-2 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 outline-none" /></td>
                              <td className="px-3 sm:px-5 py-2 sm:py-3"><input list="globalOptionList" value={item.mapTo.option} onChange={(e) => updatePendingMap(idx, 'option', e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-1.5 sm:px-2 py-1 sm:py-1.5 text-[11px] sm:text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 outline-none" /></td>
                              <td className="px-3 sm:px-5 py-2 sm:py-3 text-right"><input type="text" inputMode="numeric" pattern="[0-9]*" value={item.mapTo.sellPrice || ''} onChange={(e) => updatePendingMap(idx, 'sellPrice', e.target.value.replace(/[^0-9]/g, ''))} className="w-16 sm:w-24 border border-gray-300 dark:border-gray-600 rounded-md px-1.5 sm:px-2 py-1 sm:py-1.5 text-[11px] sm:text-xs text-right font-bold bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 outline-none" /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {invTab === 'mapping' && (
                  <div className="flex-1 overflow-x-auto overflow-y-auto bg-white dark:bg-gray-900 relative">
                    <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800 shadow-sm shrink-0">
                      <p className="text-[11px] sm:text-sm text-gray-600 dark:text-gray-400 font-medium">이곳에서 외부 데이터의 <strong className="font-bold text-gray-900 dark:text-white">옵션ID</strong>와 내부 <strong className="font-bold text-gray-900 dark:text-white">상품/옵션명</strong>의 연결 상태를 확인하고 판매단가를 수정할 수 있습니다.</p>
                    </div>
                    {/* 💡 매칭 관리 모바일 UI 넓이 비율 조절 */}
                    <table className="w-full text-sm text-left min-w-[340px] sm:min-w-[600px]">
                      <thead className="bg-gray-50 dark:bg-gray-800/80 sticky top-0 shadow-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 text-[11px] sm:text-xs">
                        <tr>
                          <th className="px-3 sm:px-6 py-3 font-semibold w-[35%] sm:w-1/4">옵션ID / 원본명</th>
                          <th className="px-2 sm:px-6 py-3 font-semibold w-[35%] sm:w-1/4">매칭 상품<span className="sm:hidden font-normal text-gray-400">/옵션</span></th>
                          <th className="px-6 py-3 font-semibold hidden sm:table-cell w-1/4">매칭 옵션명</th>
                          <th className="px-2 sm:px-6 py-3 font-semibold text-right w-[15%] sm:w-auto whitespace-nowrap">판매 금액</th>
                          <th className="px-2 sm:px-6 py-3 font-semibold text-center w-[15%] sm:w-24 whitespace-nowrap">관리</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                        {optionMappings.length === 0 ? (
                          <tr><td colSpan="5" className="text-center text-gray-400 dark:text-gray-500 py-20 text-sm font-medium">저장된 데이터 매칭 정보가 없습니다.</td></tr>
                        ) : (
                          optionMappings.map((mapItem) => {
                             if (editingMapId === mapItem.rawId) {
                                return (
                                  <tr key={mapItem.rawId} className="bg-orange-50/50 dark:bg-orange-900/10">
                                    <td className="px-3 sm:px-6 py-2">
                                      <div className="font-mono text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate max-w-[100px] sm:max-w-[150px]">{mapItem.rawId}</div>
                                      <div className="font-bold text-[11px] sm:text-xs text-gray-900 dark:text-white mt-1 truncate max-w-[120px] sm:max-w-[150px]">{mapItem.rawName.split(',')[0]}</div>
                                    </td>
                                    <td className="px-2 sm:px-4 py-2">
                                      <input type="text" value={mapEditForm.product} onChange={e => setMapEditForm({...mapEditForm, product: e.target.value})} className="w-full h-8 border border-gray-300 dark:border-gray-600 rounded-md px-1.5 sm:px-2 text-[11px] sm:text-sm font-bold bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 outline-none" placeholder="상품명" />
                                      {/* 모바일에서는 옵션명을 아래에 배치 */}
                                      <input type="text" value={mapEditForm.option} onChange={e => setMapEditForm({...mapEditForm, option: e.target.value})} className="w-full h-8 border border-gray-300 dark:border-gray-600 rounded-md px-1.5 text-[11px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 outline-none sm:hidden mt-1" placeholder="옵션명" />
                                    </td>
                                    <td className="px-4 py-2 hidden sm:table-cell">
                                      <input type="text" value={mapEditForm.option} onChange={e => setMapEditForm({...mapEditForm, option: e.target.value})} className="w-full h-8 border border-gray-300 dark:border-gray-600 rounded-md px-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 outline-none" placeholder="옵션명" />
                                    </td>
                                    <td className="px-2 sm:px-4 py-2 text-right">
                                      <input type="text" inputMode="numeric" pattern="[0-9]*" value={mapEditForm.sellPrice === 0 ? '' : Number(mapEditForm.sellPrice).toLocaleString()} onChange={e => { const rawValue = e.target.value.replace(/[^0-9]/g, ''); setMapEditForm({...mapEditForm, sellPrice: Number(rawValue)}); }} className="w-full min-w-[50px] sm:min-w-[70px] h-8 border border-gray-300 dark:border-gray-600 rounded-md px-1.5 sm:px-2 text-[11px] sm:text-sm text-right font-bold bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 outline-none" placeholder="0" />
                                    </td>
                                    <td className="px-2 sm:px-4 py-2 text-center">
                                      <div className="flex justify-center items-center gap-1 sm:gap-1.5">
                                        <button onClick={saveMapEdit} className="text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 sm:p-1.5 rounded-md border border-gray-200 dark:border-gray-700 transition-colors shadow-sm"><Check size={14} className="sm:w-4 sm:h-4" /></button>
                                        <button onClick={cancelMapEdit} className="text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 sm:p-1.5 rounded-md border border-gray-200 dark:border-gray-700 transition-colors shadow-sm"><X size={14} className="sm:w-4 sm:h-4" /></button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                             }
                             return (
                              <tr key={mapItem.rawId} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 group transition-colors">
                                <td className="px-3 sm:px-6 py-2.5 sm:py-3.5">
                                  <div className="font-mono text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{mapItem.rawId}</div>
                                  <div className="text-[11px] sm:text-xs mt-1 leading-relaxed">
                                    <div className="font-bold text-gray-900 dark:text-white break-keep">{mapItem.rawName.split(',')[0]}</div>
                                    {mapItem.rawName.includes(',') && <div className="font-bold text-orange-500 break-keep mt-0.5 text-[10px] sm:text-[11px]">옵션: {mapItem.rawName.split(',').slice(1).join(',')}</div>}
                                  </div>
                                </td>
                                <td className="px-2 sm:px-6 py-2.5 sm:py-3.5">
                                  <div className="font-bold text-[11px] sm:text-sm text-gray-900 dark:text-white break-keep">{mapItem.product}</div>
                                  <div className="text-[10px] text-gray-500 dark:text-gray-400 sm:hidden mt-0.5 truncate">{mapItem.option}</div>
                                </td>
                                <td className="px-6 py-3.5 hidden sm:table-cell text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-keep">{mapItem.option}</td>
                                <td className="px-2 sm:px-6 py-2.5 sm:py-3.5 text-right font-black text-[11px] sm:text-sm text-gray-900 dark:text-white">{mapItem.sellPrice.toLocaleString()}원</td>
                                <td className="px-2 sm:px-6 py-2.5 sm:py-3.5 text-center">
                                  <div className="flex justify-center items-center gap-1 sm:gap-1.5 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => startMapEdit(mapItem)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white p-1 sm:p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="매칭 수정"><Edit2 size={14} className="sm:w-4 sm:h-4" /></button>
                                    <button onClick={() => deleteMap(mapItem.rawId)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1 sm:p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors" title="매칭 삭제"><Trash2 size={14} className="sm:w-4 sm:h-4" /></button>
                                  </div>
                                </td>
                              </tr>
                             );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="px-4 sm:px-6 py-3 sm:py-3.5 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 sm:gap-4 shrink-0 shadow-sm z-30">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
                    <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-50 dark:bg-gray-800 px-2 sm:px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 flex-1 sm:flex-none shadow-sm">
                      <span className="text-[11px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">조회 기간</span>
                      <CustomDatePicker 
                        startDate={startDate} 
                        endDate={endDate} 
                        isRangeMode={true} 
                        onChange={(start, end) => { setStartDate(start); setEndDate(end); }} 
                        dropdownAlign="left" 
                        className="text-[11px] sm:text-xs font-bold text-gray-800 dark:text-gray-200 flex-1 justify-center ml-1" 
                      />
                      {startDate && (
                        <button onClick={() => { setStartDate(''); setEndDate(''); }} className="ml-1 sm:ml-1.5 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors" title="날짜 초기화"><X size={14}/></button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-none">
                      <label className="text-[11px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">검색</label>
                      <div className="relative w-full sm:w-32"><Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 sm:w-[14px] sm:h-[14px]" /><input type="text" value={searchProduct} onChange={(e) => { setSearchProduct(e.target.value); setSearchOption(''); }} placeholder="상품명" className="w-full pl-7 sm:pl-8 pr-2 py-1.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-[11px] sm:text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all" /></div>
                    </div>
                    {searchProduct && (
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-none">
                        <label className="text-[11px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">옵션</label>
                        <div className="relative w-full sm:w-32">
                          <select value={searchOption} onChange={(e) => setSearchOption(e.target.value)} className="w-full px-2 sm:px-3 py-1.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-[11px] sm:text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 cursor-pointer appearance-none">
                            <option value="">모든 옵션</option>
                            {Array.from(new Set(sales.filter(item => item.product.toLowerCase().includes(searchProduct.toLowerCase().trim())).map(item => item.option))).map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 sm:px-2 text-gray-400">
                             <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                          </div>
                        </div>
                      </div>
                    )}
                    {(searchProduct || searchOption || startDate) && <button onClick={() => { setSearchProduct(''); setSearchOption(''); setStartDate(''); setEndDate(''); }} className="text-[11px] sm:text-xs text-gray-400 hover:text-gray-800 dark:hover:text-white underline font-bold whitespace-nowrap">초기화</button>}
                  </div>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                     {/* 모바일 환경에서는 내보내기 버튼 숨김 (hidden sm:flex) */}
                     <button onClick={() => exportToCSV(modalDetailedData, 'sales')} className="hidden sm:flex px-3 py-2 rounded-lg text-xs font-bold transition-colors items-center gap-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-700">
                       <Download size={14} /> <span>CSV 내보내기</span>
                     </button>
                  </div>
                </div>

                <div className="flex-1 overflow-x-auto overflow-y-auto bg-white dark:bg-gray-900 p-0 relative">
                  <table className="w-full text-sm text-left min-w-[340px] sm:min-w-[700px]">
                    <thead className="bg-gray-50 dark:bg-gray-800/80 sticky top-0 shadow-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 z-10 text-[11px] sm:text-xs">
                      <tr>
                        <th className="px-2 sm:px-6 py-3 font-semibold whitespace-nowrap cursor-pointer hidden sm:table-cell sm:w-[15%] transition-colors" onClick={() => requestSort('date')}><div className="flex items-center gap-1">판매일 {getSortIcon('date')}</div></th>
                        <th className="px-2 sm:px-6 py-3 font-semibold whitespace-nowrap cursor-pointer w-[40%] sm:w-[22%] transition-colors" onClick={() => requestSort('product')}><div className="flex items-center gap-1">상품명 <span className="sm:hidden font-normal text-gray-400">/ 정보</span> {getSortIcon('product')}</div></th>
                        <th className="px-6 py-3 font-semibold whitespace-nowrap cursor-pointer hidden sm:table-cell w-[16%] transition-colors" onClick={() => requestSort('option')}><div className="flex items-center gap-1">옵션명 {getSortIcon('option')}</div></th>
                        <th className="px-1 sm:px-6 py-3 font-semibold whitespace-nowrap cursor-pointer w-[15%] sm:w-auto transition-colors" onClick={() => requestSort('quantity')}><div className="flex items-center justify-center sm:justify-end gap-1">수량 {getSortIcon('quantity')}</div></th>
                        <th className="px-1 sm:px-6 py-3 font-semibold whitespace-nowrap cursor-pointer w-[25%] sm:w-auto transition-colors" onClick={() => requestSort('totalPrice')}><div className="flex items-center justify-end gap-1">판매 금액 {getSortIcon('totalPrice')}</div></th>
                        <th className="px-6 py-3 font-semibold whitespace-nowrap cursor-pointer hidden sm:table-cell w-[28%] transition-colors" onClick={() => requestSort('note')}><div className="flex items-center gap-1">비고 {getSortIcon('note')}</div></th>
                        <th className="px-1 sm:px-6 py-3 font-semibold text-center w-[20%] sm:w-24 whitespace-nowrap">관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                      {modalDetailedData.length === 0 ? (
                        <tr><td colSpan="7" className="text-center text-gray-400 dark:text-gray-500 py-20 text-sm font-medium">해당 조건의 판매 내역이 없습니다.</td></tr>
                      ) : (
                        modalDetailedData.map((sale) => {
                          if (editingSaleId === sale.id) {
                            return (
                              <tr key={sale.id} className="bg-orange-50/50 dark:bg-orange-900/10">
                                <td className="px-2 sm:px-4 py-2 hidden sm:table-cell"><div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 pr-1 transition-colors focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500"><CustomDatePicker startDate={editForm.date} onChange={(start) => setEditForm({...editForm, date: start})} wrapperClassName="w-full" className="w-full pl-2 py-1.5 text-xs bg-transparent outline-none whitespace-nowrap font-bold text-gray-900 dark:text-white" isRangeMode={false} /></div></td>
                                <td className="px-2 sm:px-4 py-2">
                                  <input type="text" value={editForm.product} onChange={e => setEditForm({...editForm, product: e.target.value})} className="w-full h-8 border border-gray-300 dark:border-gray-600 rounded-md px-1.5 sm:px-2 text-[11px] sm:text-sm font-bold bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 outline-none" placeholder="상품명" />
                                  <input type="text" value={editForm.option} onChange={e => setEditForm({...editForm, option: e.target.value})} className="w-full h-8 border border-gray-300 dark:border-gray-600 rounded-md px-1.5 text-[11px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 outline-none sm:hidden mt-1" placeholder="옵션명" />
                                  <input type="text" value={editForm.note} onChange={e => setEditForm({...editForm, note: e.target.value})} className="w-full h-8 border border-gray-300 dark:border-gray-600 rounded-md px-1.5 text-[11px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 outline-none sm:hidden mt-1" placeholder="비고" />
                                </td>
                                <td className="px-4 py-2 hidden sm:table-cell"><input type="text" value={editForm.option} onChange={e => setEditForm({...editForm, option: e.target.value})} className="w-full h-8 border border-gray-300 dark:border-gray-600 rounded-md px-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 outline-none" placeholder="옵션명" /></td>
                                <td className="px-1 sm:px-4 py-2 text-center">
                                  <div className="flex items-center justify-center w-full sm:w-[90px] h-8 mx-auto sm:border sm:border-gray-300 dark:sm:border-gray-600 rounded-md overflow-hidden bg-transparent sm:bg-white dark:sm:bg-gray-800 text-gray-900 dark:text-white focus-within:ring-1 focus-within:ring-orange-500 transition-shadow">
                                     <button type="button" onClick={() => { const q = Number(editForm.quantity) || 0; if (q > 1) setEditForm({...editForm, quantity: q - 1}); }} className="hidden sm:flex px-2 h-full items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border-r border-gray-200 dark:border-gray-600 focus:outline-none"><Minus size={12} strokeWidth={2.5}/></button>
                                     <input type="text" inputMode="numeric" pattern="[0-9]*" value={editForm.quantity} onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); setEditForm({...editForm, quantity: val}); }} className="flex-1 w-full h-full text-center text-xs sm:text-sm font-black bg-white dark:bg-gray-800 sm:bg-transparent border border-gray-300 dark:border-gray-600 sm:border-0 rounded-md sm:rounded-none outline-none" />
                                     <button type="button" onClick={() => { const q = Number(editForm.quantity) || 0; setEditForm({...editForm, quantity: q + 1}); }} className="hidden sm:flex px-2 h-full items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border-l border-gray-200 dark:border-gray-600 focus:outline-none"><Plus size={12} strokeWidth={2.5}/></button>
                                  </div>
                                </td>
                                <td className="px-1 sm:px-4 py-2 text-right">
                                  <input type="text" inputMode="numeric" pattern="[0-9]*" value={editForm.price === 0 ? '' : Number(editForm.price).toLocaleString()} onChange={e => { const rawValue = e.target.value.replace(/[^0-9]/g, ''); setEditForm({...editForm, price: Number(rawValue)}); }} className="w-full min-w-[50px] sm:min-w-[70px] h-8 ml-auto border border-gray-300 dark:border-gray-600 rounded-md px-1.5 sm:px-2 text-[11px] sm:text-sm text-right font-bold bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 outline-none" placeholder="0" />
                                </td>
                                <td className="px-4 py-2 hidden sm:table-cell"><input type="text" value={editForm.note} onChange={e => setEditForm({...editForm, note: e.target.value})} className="w-full h-8 border border-gray-300 dark:border-gray-600 rounded-md px-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 outline-none" placeholder="비고" /></td>
                                <td className="px-1 sm:px-4 py-2 text-center">
                                   <div className="flex justify-center items-center gap-1 sm:gap-1.5">
                                     <button onClick={saveEdit} className="text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 sm:p-1.5 rounded-md border border-gray-200 dark:border-gray-700 transition-colors shadow-sm"><Check size={14} className="sm:w-4 sm:h-4" /></button>
                                     <button onClick={cancelEdit} className="text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 sm:p-1.5 rounded-md border border-gray-200 dark:border-gray-700 transition-colors shadow-sm"><X size={14} className="sm:w-4 sm:h-4" /></button>
                                   </div>
                                </td>
                              </tr>
                            );
                          }
                          return (
                            <tr key={sale.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 group transition-colors">
                              <td className="px-4 sm:px-6 py-2.5 sm:py-3.5 text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap text-[11px] sm:text-xs hidden sm:table-cell">{sale.date}</td>
                              <td className="px-2 sm:px-6 py-2.5 sm:py-3.5">
                                <div className="font-bold text-[11px] sm:text-sm text-gray-900 dark:text-white leading-tight">
                                  {sale.product}
                                </div>
                                <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 sm:hidden"><span className="text-orange-500 font-bold">{sale.date.substring(5)}</span> | {sale.option}</div>
                                <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 sm:hidden truncate max-w-[120px]">{sale.note}</div>
                              </td>
                              <td className="px-6 py-3.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap hidden sm:table-cell">{sale.option}</td>
                              <td className="px-1 sm:px-6 py-2.5 sm:py-3.5 text-center sm:text-right font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-200">{sale.quantity}</td>
                              <td className="px-1 sm:px-6 py-2.5 sm:py-3.5 text-right font-black whitespace-nowrap text-[11px] sm:text-sm text-gray-900 dark:text-white">{sale.totalPrice.toLocaleString()}원</td>
                              <td className="px-6 py-3.5 text-gray-500 dark:text-gray-400 text-xs break-all hidden sm:table-cell">{sale.note || '-'}</td>
                              <td className="px-1 sm:px-6 py-2.5 sm:py-3.5 text-center">
                                <div className="flex justify-center items-center gap-1 sm:gap-1.5 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => startEdit(sale)} className="text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white p-1 sm:p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="내역 수정"><Edit2 size={14} className="sm:w-4 sm:h-4" /></button>
                                  <button onClick={() => handleDeleteSale(sale.id)} className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 p-1 sm:p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors" title="내역 삭제"><Trash2 size={14} className="sm:w-4 sm:h-4" /></button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                
                {(() => {
                  const totalQty = modalDetailedData.reduce((acc, curr) => acc + curr.quantity, 0);
                  const totalAmount = modalDetailedData.reduce((acc, curr) => acc + curr.totalPrice, 0);
                  
                  const tCount = modalDetailedData.length;
                  let bestItem = "-";
                  if (tCount > 0) {
                    const itemCounts = {};
                    modalDetailedData.forEach(sale => {
                      itemCounts[sale.product] = (itemCounts[sale.product] || 0) + sale.quantity;
                    });
                    bestItem = Object.keys(itemCounts).reduce((a, b) => itemCounts[a] > itemCounts[b] ? a : b);
                  }

                  return (
                    <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                      <div className="flex items-center gap-2 sm:gap-4 text-[11px] sm:text-sm font-bold">
                        <div>
                          <span className="opacity-80 text-gray-500 dark:text-gray-400">총 거래: </span> 
                          <span>{tCount}건</span>
                        </div>
                        {tCount > 0 && (
                          <>
                            <span className="opacity-30 text-gray-400">|</span>
                            <div className="hidden sm:block">
                              <span className="opacity-80 text-gray-500 dark:text-gray-400">최다 판매: </span> 
                              <span className="text-orange-500 truncate max-w-[120px] inline-block align-bottom" title={bestItem}>{bestItem}</span>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex gap-4 sm:gap-8 text-xs sm:text-base items-center">
                        <div className="font-bold text-gray-500 dark:text-gray-400">총 수량: <span className="font-black text-gray-900 dark:text-white text-base sm:text-xl ml-1">{totalQty}개</span></div>
                        <div className="font-bold text-gray-500 dark:text-gray-400">총 금액: <span className="font-black text-gray-900 dark:text-white text-base sm:text-xl ml-1">{totalAmount.toLocaleString()}원</span></div>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      )}

      {/* 💡 전역 Toast 알림 컨테이너 렌더링 */}
      {renderToastContainer()}
    </div>
  );
}