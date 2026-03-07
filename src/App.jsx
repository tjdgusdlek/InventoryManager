import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Calendar, Package, TrendingUp, Archive, PieChart, Trash2, Carrot, Box, Maximize2, X, ArrowUp, ArrowDown, ArrowUpDown, Search, Edit2, Check, ClipboardPaste, Link, AlertCircle, Database } from 'lucide-react';

// --- Supabase 설정 ---
import { createClient } from '@supabase/supabase-js';

// 환경 변수에서 값을 불러옵니다. (없을 경우를 대비해 기존 값 폴백 유지)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uikjmnpqcqietillvjpl.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_lQGP1enTikX8nWh9vfFqUw_FMFsnMy-';

const supabase = createClient(supabaseUrl, supabaseKey);

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
  if (!dateString) return 'text-gray-900';
  const date = new Date(dateString);
  const day = date.getDay();
  if (day === 0 || checkIsHoliday(dateString)) return 'text-red-600';
  if (day === 6) return 'text-blue-600';
  return 'text-gray-900';
};

// --- 커스텀 날짜 선택기 컴포넌트 ---
const CustomDatePicker = ({ startDate, endDate, onChange, className, wrapperClassName = "inline-block", dropdownAlign = "left", isRangeMode = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(startDate || new Date()));
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
      setViewDate(new Date(startDate || new Date()));
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
        {isRangeMode && startDate !== endDate ? (
          <div className="flex items-center gap-1">
            <span className={getDateColorClass(startDate)}>{startDate}</span>
            <span className="text-gray-400 font-medium px-1">~</span>
            <span className={getDateColorClass(endDate)}>{endDate}</span>
          </div>
        ) : (
          <span className={getDateColorClass(startDate)}>{startDate}</span>
        )}
        <button type="button" onClick={() => setIsOpen(!isOpen)} className="p-1 -mr-1 ml-1 hover:bg-gray-200 rounded-md text-gray-500 focus:outline-none transition-colors">
          <Calendar size={16} />
        </button>
      </div>
      {isOpen && (
        <div className={`absolute z-50 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 p-3 w-64 ${dropdownAlign === 'right' ? 'right-0' : 'left-0'}`}>
          <div className="flex justify-between items-center mb-2">
            <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-1 hover:bg-gray-100 rounded text-gray-600">&lt;</button>
            <div className="font-bold text-gray-800">{year}년 {month + 1}월</div>
            <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-1 hover:bg-gray-100 rounded text-gray-600">&gt;</button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs mb-1">
            <div className="text-red-500 font-medium">일</div>
            <div className="text-gray-600">월</div><div className="text-gray-600">화</div><div className="text-gray-600">수</div><div className="text-gray-600">목</div><div className="text-gray-600">금</div>
            <div className="text-blue-500 font-medium">토</div>
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

              let textColor = 'text-gray-700';
              if (isSunday || isHoliday) textColor = 'text-red-600 font-bold';
              else if (isSaturday) textColor = 'text-blue-600 font-bold';

              let bgClass = 'hover:bg-gray-100';
              if (isEndpoint) {
                bgClass = 'bg-violet-500 text-white font-bold ring-2 ring-violet-200';
                textColor = 'text-white';
              } else if (isInRange) {
                bgClass = 'bg-violet-50';
              }

              return (
                <button key={idx} type="button" onClick={() => handleDayClick(currentDateStr)} onMouseEnter={() => setHoverDate(currentDateStr)} className={`p-1.5 rounded-md transition-colors ${textColor} ${bgClass}`}>
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// 로컬 환경용 초기 데이터 (Supabase가 연결되지 않았을 때만 사용됨)
const INITIAL_INVENTORY = [
  { id: 1, product: '공간활용 수납장', option: '5박스 55cm', qty: 1, originPrice: 58900, sellPrice: 25000 },
  { id: 2, product: '공간활용 수납장', option: '5박스 65cm', qty: 5, originPrice: 69900, sellPrice: 30000 },
];

export default function App() {
  const [isDbConnected, setIsDbConnected] = useState(!!supabase);
  const [isLoading, setIsLoading] = useState(false);
  
  const [sales, setSales] = useState([]); 
  const [inventoryData, setInventoryData] = useState(INITIAL_INVENTORY); 
  const [optionMappings, setOptionMappings] = useState([]); 
  
  const [pendingRawData, setPendingRawData] = useState([]); 
  const [invTab, setInvTab] = useState('stock'); 

  // --- Supabase 초기 데이터 페칭 ---
  useEffect(() => {
    if (!supabase) return;

    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const { data: invData, error: invErr } = await supabase.from('inventory').select('*').order('id', { ascending: true });
        if (!invErr && invData) setInventoryData(invData);

        const { data: salesData, error: salesErr } = await supabase.from('sales').select('*').order('date', { ascending: false });
        if (!salesErr && salesData) setSales(salesData);

        const { data: mapData, error: mapErr } = await supabase.from('option_mappings').select('*');
        if (!mapErr && mapData) setOptionMappings(mapData);
        
      } catch (error) {
        console.error("DB Fetch Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const getLocalToday = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const today = getLocalToday();

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  
  const [formData, setFormData] = useState({ date: today, product: '', option: '', quantity: 1, price: 0, note: '' });

  const uniqueProducts = useMemo(() => [...new Set(inventoryData.map(item => item.product))], [inventoryData]);
  const uniqueOptionsAll = useMemo(() => [...new Set(inventoryData.map(item => item.option))], [inventoryData]);
  const availableOptions = useMemo(() => {
    if (!formData.product) return [];
    return inventoryData.filter(item => item.product === formData.product);
  }, [formData.product, inventoryData]);

  const handleTodayClick = () => { setStartDate(today); setEndDate(today); };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'product') {
      setFormData(prev => ({ ...prev, product: value, option: '', price: 0 }));
    } else if (name === 'option') {
      const selectedItem = availableOptions.find(opt => opt.option === value);
      setFormData(prev => ({ ...prev, option: value, price: selectedItem ? selectedItem.sellPrice : 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // --- Supabase 지원 CRUD 핸들러 ---
  const handleAddSale = async (e) => {
    e.preventDefault();
    if (!formData.product || !formData.option || formData.quantity <= 0) return alert("상품, 옵션, 올바른 수량을 입력해주세요.");

    const newSale = {
      id: Date.now(), 
      date: formData.date,
      product: formData.product,
      option: formData.option,
      quantity: Number(formData.quantity),
      price: Number(formData.price),
      totalPrice: Number(formData.quantity) * Number(formData.price),
      note: formData.note
    };

    if (supabase) {
      const { error } = await supabase.from('sales').insert([newSale]);
      if (error) { console.error(error); return alert("DB 저장 중 오류가 발생했습니다."); }
    }
    
    setSales([newSale, ...sales]);
    setFormData({ date: formData.date, product: '', option: '', quantity: 1, price: 0, note: '' });
  };

  const handleDeleteSale = async (id) => {
    if (supabase) {
      const { error } = await supabase.from('sales').delete().eq('id', id);
      if (error) { console.error(error); return alert("삭제 실패"); }
    }
    setSales(sales.filter(sale => sale.id !== id));
  };

  const saveEdit = async () => {
    if (!editForm.product || !editForm.option || editForm.quantity <= 0 || editForm.price < 0) return alert("입력값을 확인해주세요.");
    const updatedSale = { ...editForm, quantity: Number(editForm.quantity), price: Number(editForm.price), totalPrice: Number(editForm.quantity) * Number(editForm.price) };
    
    if (supabase) {
      const { error } = await supabase.from('sales').update(updatedSale).eq('id', updatedSale.id);
      if (error) { console.error(error); return alert("수정 실패"); }
    }
    
    setSales(sales.map(s => s.id === updatedSale.id ? updatedSale : s));
    cancelEdit();
  };

  const saveInvEdit = async () => {
    if (!invEditForm.product || !invEditForm.option || invEditForm.qty < 0) return alert("입력값을 확인해주세요.");
    const updatedInv = { ...invEditForm, qty: Number(invEditForm.qty), originPrice: Number(invEditForm.originPrice), sellPrice: Number(invEditForm.sellPrice) };
    
    if (supabase) {
      const { error } = await supabase.from('inventory').update(updatedInv).eq('id', updatedInv.id);
      if (error) { console.error(error); return alert("수정 실패"); }
    }

    setInventoryData(inventoryData.map(i => i.id === updatedInv.id ? updatedInv : i));
    cancelInvEdit();
  };

  const handleDeleteInv = async (id) => {
    if(window.confirm("이 품목을 재고 목록에서 삭제하시겠습니까?")) {
      if (supabase) {
        const { error } = await supabase.from('inventory').delete().eq('id', id);
        if (error) { console.error(error); return alert("삭제 실패"); }
      }
      setInventoryData(inventoryData.filter(i => i.id !== id));
    }
  };

  const applyPendingData = async () => {
    for (const item of pendingRawData) {
      if (!item.mapTo.product || !item.mapTo.option) return alert(`[${item.rawId}] 항목의 매칭을 완료해주세요.`);
    }

    let newInv = [...inventoryData];
    let newMappings = [...optionMappings];

    const dbMappingsToUpsert = [];
    const dbInventoryToUpsert = [];

    for (const item of pendingRawData) {
      const existingMapIdx = newMappings.findIndex(m => m.rawId === item.rawId);
      const mapData = {
        rawId: item.rawId,
        rawName: item.rawName,
        product: item.mapTo.product,
        option: item.mapTo.option,
        sellPrice: Number(item.mapTo.sellPrice) || 0
      };
      
      if (existingMapIdx >= 0) newMappings[existingMapIdx] = mapData;
      else newMappings.push(mapData);
      dbMappingsToUpsert.push(mapData);

      const invIdx = newInv.findIndex(i => i.product === mapData.product && i.option === mapData.option);
      if (invIdx >= 0) {
         newInv[invIdx] = { ...newInv[invIdx], qty: newInv[invIdx].qty + item.qty, sellPrice: mapData.sellPrice };
         dbInventoryToUpsert.push(newInv[invIdx]);
      } else {
         // DB에 보낼 때는 id를 제외하고 보냅니다. (Supabase가 1, 2, 3... 자동 생성)
        const newDbInvItem = {
          product: mapData.product,
          option: mapData.option,
          qty: item.qty,
          originPrice: 0,
          sellPrice: mapData.sellPrice
        };

        // 1. DB 업데이트용 배열에는 id 없는 객체를 넣습니다.
        dbInventoryToUpsert.push(newDbInvItem);

        // 2. React 화면(상태)용으로는 임시로 정수 id를 부여하여 넣습니다.
        newInv.push({ 
          ...newDbInvItem, 
          id: Date.now() // Math.random() 제거 (화면 렌더링용 임시 ID)
        });
      }
    }

    if (supabase) {
      try {
        const { error: mapErr } = await supabase.from('option_mappings').upsert(dbMappingsToUpsert);
        if (mapErr) throw mapErr;
        const { error: invErr } = await supabase.from('inventory').upsert(dbInventoryToUpsert);
        if (invErr) throw invErr;
      } catch(err) {
        console.error(err);
        return alert("DB 일괄 저장에 실패했습니다.");
      }
    }

    setOptionMappings(newMappings);
    setInventoryData(newInv);
    setPendingRawData([]);
    setBulkInvInput('');
    alert("데이터가 성공적으로 매칭 및 저장되었습니다!");
  };

  const saveMapEdit = async () => {
    const updatedMap = { ...mapEditForm, sellPrice: Number(mapEditForm.sellPrice) };
    
    if (supabase) {
      const { error } = await supabase.from('option_mappings').update(updatedMap).eq('rawId', updatedMap.rawId);
      if (error) { console.error(error); return alert("매칭 정보 수정 실패"); }
    }

    const newMappings = optionMappings.map(m => m.rawId === mapEditForm.rawId ? updatedMap : m);
    setOptionMappings(newMappings);

    // 연관된 재고 단가도 업데이트
    const invIdx = inventoryData.findIndex(i => i.product === updatedMap.product && i.option === updatedMap.option);
    if (invIdx >= 0) {
       const newInv = [...inventoryData];
       newInv[invIdx].sellPrice = updatedMap.sellPrice;
       if (supabase) await supabase.from('inventory').update({ sellPrice: updatedMap.sellPrice }).eq('id', newInv[invIdx].id);
       setInventoryData(newInv);
    }
    
    setEditingMapId(null);
    setMapEditForm(null);
  };

  const deleteMap = async (rawId) => {
    if(window.confirm("이 매칭 정보를 삭제하시겠습니까?")) {
      if (supabase) {
        const { error } = await supabase.from('option_mappings').delete().eq('rawId', rawId);
        if (error) { console.error(error); return alert("삭제 실패"); }
      }
      setOptionMappings(optionMappings.filter(m => m.rawId !== rawId));
    }
  };

  // --- 동적 데이터 계산 로직 ---
  const currentInventory = useMemo(() => {
    return inventoryData.map(item => {
      const soldQty = sales
        .filter(sale => sale.product === item.product && sale.option === item.option)
        .reduce((sum, sale) => sum + sale.quantity, 0);
      return { ...item, soldQty, remainQty: item.qty - soldQty };
    });
  }, [sales, inventoryData]);

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
    let totalQty = 0;
    let totalAmount = 0;
    sales.forEach(sale => {
      const key = sale.product;
      if (!summary[key]) summary[key] = { product: sale.product, quantity: 0, amount: 0 };
      summary[key].quantity += sale.quantity;
      summary[key].amount += sale.totalPrice;
      totalQty += sale.quantity;
      totalAmount += sale.totalPrice;
    });
    return { list: Object.values(summary).sort((a, b) => b.quantity - a.quantity), totalQty, totalAmount };
  }, [sales]);

  const totalRemainQty = useMemo(() => currentInventory.reduce((acc, curr) => acc + curr.remainQty, 0), [currentInventory]);
  const todayDetailedSales = useMemo(() => sales.filter(sale => sale.date === today), [sales, today]);
  const todayTotalQty = useMemo(() => todayDetailedSales.reduce((acc, sale) => acc + sale.quantity, 0), [todayDetailedSales]);
  const todayTotalAmount = useMemo(() => todayDetailedSales.reduce((acc, sale) => acc + sale.totalPrice, 0), [todayDetailedSales]);

  // --- 모달 상태 ---
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
    setEditingSaleId(null);
    setEditForm(null);
    setEditingInvId(null);
    setInvEditForm(null);
    setBulkInvInput('');
    setPendingRawData([]);
    setInvTab('stock');
    setEditingMapId(null);
    setShowRawDataInput(false);
  };

  const startEdit = (sale) => { setEditingSaleId(sale.id); setEditForm({ ...sale }); };
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
        if (parts.length >= 3) {
           parsed.push({ rawId: parts[0], rawName: parts[1], qty: parseInt(parts[2].replace(/,/g, ''), 10) || 0 });
        }
      }
    } else {
      let start = 0;
      if (lines[0].includes('옵션ID') || lines[0] === '옵션ID') start = 3; 
      for (let i = start; i < lines.length; i += 3) {
         if (lines[i] && lines[i+1] && lines[i+2]) {
           parsed.push({ rawId: lines[i], rawName: lines[i+1], qty: parseInt(lines[i+2].replace(/,/g, ''), 10) || 0 });
         }
      }
    }

    if (parsed.length === 0) return alert("인식할 수 있는 데이터가 없습니다.");

    const combined = {};
    parsed.forEach(p => {
       if (!combined[p.rawId]) combined[p.rawId] = { ...p };
       else combined[p.rawId].qty += p.qty;
    });
    const finalParsed = Object.values(combined);

    const pending = finalParsed.map(item => {
       const existingMap = optionMappings.find(m => m.rawId === item.rawId);
       if (existingMap) {
          return { ...item, mapped: true, mapTo: { product: existingMap.product, option: existingMap.option, sellPrice: existingMap.sellPrice } };
       } else {
          return { ...item, mapped: false, mapTo: { product: '', option: '', sellPrice: 0 } };
       }
    });

    setPendingRawData(pending);
    setShowRawDataInput(false); 
  };

  const updatePendingMap = (index, field, value) => {
    const newPending = [...pendingRawData];
    newPending[index].mapTo[field] = value;
    
    if (field === 'option' || field === 'product') {
       const prod = newPending[index].mapTo.product;
       const opt = newPending[index].mapTo.option;
       if (prod && opt) {
          const matchedInv = inventoryData.find(i => i.product === prod && i.option === opt);
          if (matchedInv && newPending[index].mapTo.sellPrice === 0) {
            newPending[index].mapTo.sellPrice = matchedInv.sellPrice;
          }
       }
    }
    setPendingRawData(newPending);
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} className="text-gray-400 opacity-50" />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-gray-700" /> : <ArrowDown size={14} className="text-gray-700" />;
  };

  // 기존 판매 내역 데이터 (검색 및 정렬 적용)
  const modalDetailedData = useMemo(() => {
    let data = [];
    if (maximizedView === 'period') data = sales.filter(sale => sale.date >= startDate && sale.date <= endDate);
    else if (maximizedView === 'total') data = [...sales];
    else return [];

    if (searchProduct.trim()) data = data.filter(sale => sale.product.toLowerCase().includes(searchProduct.toLowerCase().trim()));
    if (searchOption.trim()) data = data.filter(sale => sale.option.toLowerCase().includes(searchOption.toLowerCase().trim()));

    if (sortConfig.key) {
      data.sort((a, b) => {
        let valA = a[sortConfig.key] ?? '';
        let valB = b[sortConfig.key] ?? '';
        if (typeof valA === 'number' && typeof valB === 'number') {
           return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
        }
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [maximizedView, sales, startDate, endDate, sortConfig, searchProduct, searchOption]);

  // 재고 현황 데이터 전용 (검색 및 정렬 적용)
  const processedInventory = useMemo(() => {
    let data = [...currentInventory];
    if (searchProduct.trim()) data = data.filter(item => item.product.toLowerCase().includes(searchProduct.toLowerCase().trim()));
    if (searchOption.trim()) data = data.filter(item => item.option.toLowerCase().includes(searchOption.toLowerCase().trim()));

    if (sortConfig.key) {
      data.sort((a, b) => {
        let valA = a[sortConfig.key] ?? '';
        let valB = b[sortConfig.key] ?? '';
        if (typeof valA === 'number' && typeof valB === 'number') {
           return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
        }
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [currentInventory, searchProduct, searchOption, sortConfig]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-bold">DB 데이터를 불러오는 중입니다...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 md:p-8 font-sans">
      
      {/* 글로벌 Datalist */}
      <datalist id="globalProductList">
        {uniqueProducts.map(p => <option key={p} value={p} />)}
      </datalist>
      <datalist id="globalOptionList">
        {uniqueOptionsAll.map(o => <option key={o} value={o} />)}
      </datalist>

      {/* Header & Supabase Connection Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Carrot className="text-orange-500" />
            당근 판매 & 재고 관리 표
          </h1>
          <div className="mt-2 flex items-center gap-2 text-xs font-semibold">
            {isDbConnected ? (
              <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                <Database size={12} /> Supabase 클라우드 DB 연동됨
              </span>
            ) : (
              <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded-md border border-orange-200">
                <AlertCircle size={12} /> 로컬 모드 (환경변수 설정 시 DB 영구 저장 활성화)
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 mt-2 md:mt-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">{startDate !== endDate ? "조회 기간:" : "기준일:"}</span>
            <CustomDatePicker startDate={startDate} endDate={endDate} isRangeMode={true} onChange={(start, end) => { setStartDate(start); setEndDate(end); }} dropdownAlign="right" className="font-semibold text-sm transition-colors" />
            <button onClick={handleTodayClick} className="ml-1 px-3 py-1 text-xs rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50 font-medium shadow-sm">오늘</button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* --- 상단 영역: 새 판매 등록 (좌) + 핵심 요약 보드 (우) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow-sm border border-violet-200 overflow-hidden h-full flex flex-col">
              <div className="bg-violet-50 px-4 py-3 border-b border-violet-100 font-semibold text-violet-800 flex items-center gap-2 shrink-0">
                <Plus size={18} className="text-violet-600" /> 새 판매 등록
              </div>
              <form onSubmit={handleAddSale} className="p-4 flex flex-col gap-4 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">판매일</label>
                    <div className="flex items-center border border-gray-300 rounded-md bg-white pr-1.5 transition-colors focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500">
                      <CustomDatePicker startDate={formData.date} onChange={(start) => setFormData(prev => ({ ...prev, date: start }))} wrapperClassName="flex-1" className="w-full px-3 py-1.5 text-sm bg-transparent font-semibold" isRangeMode={false} />
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, date: today }))} className="shrink-0 px-2.5 py-1 text-xs rounded border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium shadow-sm bg-white">오늘</button>
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">상품명</label>
                    <select name="product" value={formData.product} onChange={handleFormChange} className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none transition" required>
                      <option value="">상품 선택</option>
                      {uniqueProducts.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">옵션명</label>
                    <select name="option" value={formData.option} onChange={handleFormChange} disabled={!formData.product} className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none transition disabled:bg-gray-100" required>
                      <option value="">옵션 선택</option>
                      {availableOptions.map(opt => <option key={opt.id} value={opt.option}>{opt.option}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">판매 개수</label>
                    <input type="number" name="quantity" min="1" value={formData.quantity} onChange={handleFormChange} className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none transition" required />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">판매 금액 (원)</label>
                    <input type="number" name="price" value={formData.price} onChange={handleFormChange} className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none transition" required />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">비고 (선택)</label>
                    <input type="text" name="note" value={formData.note} onChange={handleFormChange} className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none transition" placeholder="입금 방식 등..." />
                  </div>
                </div>
                
                <div className="mt-auto pt-2">
                  <button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-2 rounded-md transition-colors flex items-center justify-center gap-2">
                    판매 내역 추가
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
              <div className="px-5 py-3.5 bg-gray-100 border-b border-gray-200 flex justify-between items-center shrink-0">
                <span className="font-bold text-base text-gray-800 flex items-center gap-2">
                  <PieChart size={18} className="text-gray-600" /> 판매 요약
                </span>
              </div>
              
              <div className="grid grid-cols-5 divide-x divide-gray-200 border-b border-gray-100 text-center bg-white shrink-0">
                <div className="p-3 md:p-4">
                  <div className="text-[11px] md:text-xs font-medium text-gray-500 mb-1">오늘 총 판매 수량</div>
                  <div className="font-bold text-emerald-600 text-base lg:text-lg">{todayTotalQty}개</div>
                </div>
                <div className="p-3 md:p-4">
                  <div className="text-[11px] md:text-xs font-medium text-gray-500 mb-1">오늘 총 판매 금액</div>
                  <div className="font-bold text-emerald-600 text-base lg:text-lg">{todayTotalAmount.toLocaleString()}원</div>
                </div>
                <div className="p-3 md:p-4 bg-gray-50/30">
                  <div className="text-[11px] md:text-xs font-medium text-gray-500 mb-1">누적 판매 수량</div>
                  <div className="font-bold text-blue-600 text-base lg:text-lg">{totalSalesSummary.totalQty}개</div>
                </div>
                <div className="p-3 md:p-4 bg-gray-50/30">
                  <div className="text-[11px] md:text-xs font-medium text-gray-500 mb-1">누적 판매 금액</div>
                  <div className="font-bold text-blue-600 text-base lg:text-lg">{totalSalesSummary.totalAmount.toLocaleString()}원</div>
                </div>
                <div className="p-3 md:p-4 bg-orange-50/30">
                  <div className="text-[11px] md:text-xs font-medium text-orange-600 mb-1">남은 재고</div>
                  <div className="font-bold text-orange-600 text-base lg:text-lg">{totalRemainQty}개</div>
                </div>
              </div>

              <div className="bg-gray-50 px-5 py-2.5 border-b border-gray-100 flex items-center shrink-0">
                <span className="text-sm font-bold text-gray-700">오늘 판매 상세 내역</span>
              </div>
              <div className="flex-1 overflow-y-auto min-h-0 bg-white">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white sticky top-0 shadow-sm text-gray-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">상품명</th>
                      <th className="px-4 py-3 font-medium">옵션명</th>
                      <th className="px-4 py-3 font-medium text-right">수량</th>
                      <th className="px-4 py-3 font-medium text-right">금액</th>
                      <th className="pl-8 pr-4 py-3 font-medium">비고</th>
                      <th className="px-3 py-3 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {todayDetailedSales.length === 0 ? (
                      <tr><td colSpan="6" className="text-center text-gray-400 py-10">오늘 등록된 판매 내역이 없습니다.</td></tr>
                    ) : (
                      todayDetailedSales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-emerald-50/50 group transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-800">{sale.product}</td>
                          <td className="px-4 py-3 text-gray-600">{sale.option}</td>
                          <td className="px-4 py-3 text-right font-medium">{sale.quantity}</td>
                          <td className="px-4 py-3 text-right text-emerald-600 font-bold">{sale.totalPrice.toLocaleString()}원</td>
                          <td className="pl-8 pr-4 py-3 text-gray-500 text-xs truncate max-w-[150px]" title={sale.note}>{sale.note}</td>
                          <td className="px-3 py-3 text-center">
                            <button onClick={() => handleDeleteSale(sale.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="내역 삭제"><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* --- 하단 영역: 판매 요약 (좌) + 재고 현황 (우) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-emerald-200 overflow-hidden relative">
               <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-100 font-semibold text-emerald-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} /> {startDate !== endDate ? "기간 판매 요약" : `${startDate} 판매 요약`}
                </div>
                <button onClick={() => setMaximizedView('period')} className="text-emerald-600 hover:text-emerald-900 hover:bg-emerald-100 p-1.5 rounded transition-colors" title="상세 내역 확대 보기"><Maximize2 size={16} /></button>
              </div>
              {startDate !== endDate && <div className="bg-emerald-50/50 px-4 py-2 text-xs text-emerald-700 border-b border-emerald-100 text-center font-medium">{startDate} ~ {endDate}</div>}
              <div className="p-0">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-600 bg-gray-50/50">
                    <tr>
                      <th className="px-3 py-2 font-medium">상품명</th>
                      <th className="px-3 py-2 font-medium text-right whitespace-nowrap">수량</th>
                      <th className="px-3 py-2 font-medium text-right whitespace-nowrap">금액</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {periodSalesSummary.list.length === 0 ? (
                      <tr><td colSpan="3" className="text-center text-gray-400 py-4">판매 내역 없음</td></tr>
                    ) : (
                      periodSalesSummary.list.map((item, idx) => {
                        const percent = periodSalesSummary.totalQty > 0 ? Math.round((item.quantity / periodSalesSummary.totalQty) * 100) : 0;
                        return (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-3 py-2">
                              <div className="font-bold text-gray-800 break-keep">{item.product}</div>
                              <div className="text-[11px] text-emerald-600/80 font-bold break-keep mt-0.5">판매 비중: {percent}%</div>
                            </td>
                            <td className="px-3 py-2 text-right font-bold whitespace-nowrap">{item.quantity}</td>
                            <td className="px-3 py-2 text-right text-emerald-600 font-bold whitespace-nowrap">{item.amount.toLocaleString()}원</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                  <tfoot className="bg-emerald-50/50 font-bold border-t border-emerald-100">
                    <tr>
                      <td className="px-3 py-3 text-emerald-800 whitespace-nowrap">기간 합계</td>
                      <td className="px-3 py-3 text-right text-emerald-800 whitespace-nowrap">{periodSalesSummary.totalQty}</td>
                      <td className="px-3 py-3 text-right text-emerald-700 whitespace-nowrap">{periodSalesSummary.totalAmount.toLocaleString()}원</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-blue-200 overflow-hidden relative">
               <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 font-semibold text-blue-800 flex justify-between items-center">
                <div className="flex items-center gap-2"><Archive size={18} /> 누적 판매 요약</div>
                <button onClick={() => setMaximizedView('total')} className="text-blue-600 hover:text-blue-900 hover:bg-blue-100 p-1.5 rounded transition-colors" title="상세 내역 확대 보기"><Maximize2 size={16} /></button>
              </div>
               <div className="p-0">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-blue-700 bg-blue-50/50">
                    <tr>
                      <th className="px-3 py-2 font-medium">상품명</th>
                      <th className="px-3 py-2 font-medium text-right whitespace-nowrap">수량</th>
                      <th className="px-3 py-2 font-medium text-right whitespace-nowrap">금액</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {totalSalesSummary.list.length === 0 ? (
                      <tr><td colSpan="3" className="text-center text-gray-400 py-4">데이터 없음</td></tr>
                    ) : (
                      totalSalesSummary.list.map((item, idx) => {
                        const percent = totalSalesSummary.totalQty > 0 ? Math.round((item.quantity / totalSalesSummary.totalQty) * 100) : 0;
                        return (
                          <tr key={idx} className="hover:bg-blue-50/50">
                            <td className="px-3 py-2">
                              <div className="font-bold text-gray-800 break-keep">{item.product}</div>
                              <div className="text-[11px] text-blue-600/80 font-bold break-keep mt-0.5">판매 비중: {percent}%</div>
                            </td>
                            <td className="px-3 py-2 text-right font-bold whitespace-nowrap">{item.quantity}</td>
                            <td className="px-3 py-2 text-right text-blue-600 font-bold whitespace-nowrap">{item.amount.toLocaleString()}원</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                  <tfoot className="bg-blue-50/50 font-bold border-t border-blue-100">
                    <tr>
                      <td className="px-3 py-3 text-blue-800 whitespace-nowrap">누적 합계</td>
                      <td className="px-3 py-3 text-right text-blue-800 whitespace-nowrap">{totalSalesSummary.totalQty}</td>
                      <td className="px-3 py-3 text-right text-blue-700 whitespace-nowrap">{totalSalesSummary.totalAmount.toLocaleString()}원</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl shadow-sm border border-orange-200 overflow-hidden h-full flex flex-col relative">
              <div className="bg-orange-50 px-4 py-3 border-b border-orange-100 font-semibold text-orange-800 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2"><Box size={18} /> 실시간 재고 현황</div>
                <button onClick={() => setMaximizedView('inventory')} className="text-orange-600 hover:text-orange-900 hover:bg-orange-100 p-1.5 rounded transition-colors" title="재고 관리 확대 보기"><Maximize2 size={16} /></button>
              </div>
              <div className="flex-1 overflow-x-auto min-h-0">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-orange-700 bg-orange-50/50 sticky top-0 shadow-sm">
                    <tr>
                      <th className="px-4 py-3 font-medium whitespace-nowrap">상품명</th>
                      <th className="px-4 py-3 font-medium whitespace-nowrap">옵션명</th>
                      <th className="px-4 py-3 font-medium text-center whitespace-nowrap">총 수량</th>
                      <th className="px-4 py-3 font-medium text-center whitespace-nowrap">남은 수량</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentInventory.map((item) => (
                      <tr key={item.id} className="hover:bg-orange-50/50 transition-colors">
                        <td className="px-4 py-2 font-medium text-gray-800 whitespace-nowrap">{item.product}</td>
                        <td className="px-4 py-2 text-gray-600 whitespace-nowrap text-xs">{item.option}</td>
                        <td className="px-4 py-2 text-center text-gray-500">{item.qty}</td>
                        <td className="px-4 py-2 text-center">
                          <span className={`inline-flex items-center justify-center px-2 py-1 rounded font-bold ${item.remainQty === 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{item.remainQty}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-orange-50/30 border-t border-orange-100 font-bold text-gray-800">
                    <tr>
                      <td colSpan="2" className="px-4 py-3 text-center text-orange-800">전체 합계</td>
                      <td className="px-4 py-3 text-center text-orange-800">{currentInventory.reduce((acc, curr) => acc + curr.qty, 0)}</td>
                      <td className="px-4 py-3 text-center text-orange-600 text-lg">{currentInventory.reduce((acc, curr) => acc + curr.remainQty, 0)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- 상세 내역 및 재고 관리 최대화 모달 --- */}
      {maximizedView && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden border-2 ${maximizedView === 'period' ? 'border-emerald-400' : maximizedView === 'total' ? 'border-blue-400' : 'border-orange-400'}`}>
            
            <div className={`px-6 py-4 flex justify-between items-center border-b shrink-0 ${maximizedView === 'period' ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : maximizedView === 'total' ? 'bg-blue-50 border-blue-100 text-blue-900' : 'bg-orange-50 border-orange-100 text-orange-900'}`}>
              <div className="flex items-center gap-3">
                {maximizedView === 'period' ? <TrendingUp size={24} className="text-emerald-600" /> : maximizedView === 'total' ? <Archive size={24} className="text-blue-600" /> : <Box size={24} className="text-orange-600" />}
                <div>
                  <h2 className="text-xl font-bold">
                    {maximizedView === 'period' ? (startDate !== endDate ? "기간 판매 상세 내역" : `${startDate} 판매 상세 내역`) : maximizedView === 'total' ? "전체 누적 판매 상세 내역" : "재고 상세 관리 및 추가"}
                  </h2>
                  {maximizedView === 'period' && startDate !== endDate && <p className="text-sm opacity-80 mt-0.5">{startDate} ~ {endDate}</p>}
                </div>
              </div>
              <button onClick={handleCloseModal} className={`p-2 rounded-lg transition-colors ${maximizedView === 'period' ? 'hover:bg-emerald-100 text-emerald-700' : maximizedView === 'total' ? 'hover:bg-blue-100 text-blue-700' : 'hover:bg-orange-100 text-orange-700'}`}><X size={24} /></button>
            </div>

            {maximizedView === 'inventory' ? (
              <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/30">
                
                <div className="flex bg-orange-100/40 px-4 pt-3 gap-2 shrink-0 border-b border-orange-200">
                  <button className={`px-5 py-2.5 rounded-t-lg font-bold text-sm transition-colors flex items-center gap-2 ${invTab === 'stock' ? 'bg-white text-orange-800 border-t border-x border-orange-200 shadow-[0_4px_0_0_white]' : 'text-orange-600/70 hover:bg-orange-100/50'}`} onClick={() => { setInvTab('stock'); setPendingRawData([]); setShowRawDataInput(false); }}><Package size={16} /> 재고 현황</button>
                  <button className={`px-5 py-2.5 rounded-t-lg font-bold text-sm transition-colors flex items-center gap-2 ${invTab === 'mapping' ? 'bg-white text-orange-800 border-t border-x border-orange-200 shadow-[0_4px_0_0_white]' : 'text-orange-600/70 hover:bg-orange-100/50'}`} onClick={() => setInvTab('mapping')}><Link size={16} /> 데이터 매칭 관리</button>
                </div>

                {invTab === 'stock' && pendingRawData.length === 0 && (
                  <>
                    <div className="px-6 py-3 bg-white border-b border-gray-100 flex justify-between items-center shrink-0 shadow-sm z-10">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-semibold text-gray-600">상품명 검색</label>
                          <div className="relative"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" value={searchProduct} onChange={(e) => setSearchProduct(e.target.value)} placeholder="상품명 입력..." className="pl-8 pr-3 py-1.5 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all w-32 sm:w-40" /></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-semibold text-gray-600">옵션명 검색</label>
                          <div className="relative"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" value={searchOption} onChange={(e) => setSearchOption(e.target.value)} placeholder="옵션명 입력..." className="pl-8 pr-3 py-1.5 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all w-32 sm:w-40" /></div>
                        </div>
                        {(searchProduct || searchOption) && <button onClick={() => { setSearchProduct(''); setSearchOption(''); }} className="text-xs text-gray-500 hover:text-gray-800 underline font-medium">초기화</button>}
                      </div>
                      <button onClick={() => setShowRawDataInput(!showRawDataInput)} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${showRawDataInput ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-orange-500 text-white hover:bg-orange-600 shadow-sm'}`}>
                        {showRawDataInput ? <X size={16} /> : <Plus size={16} />}
                        {showRawDataInput ? "입력창 닫기" : "데이터 추가"}
                      </button>
                    </div>

                    {showRawDataInput && (
                      <div className="px-6 py-4 bg-orange-50/30 border-b border-gray-200 shrink-0 shadow-inner">
                        <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2"><ClipboardPaste size={16} className="text-orange-500" /> Raw 데이터 복사 & 붙여넣기 (스마트 인식)</h3>
                        <div className="flex gap-4">
                          <textarea value={bulkInvInput} onChange={(e) => setBulkInvInput(e.target.value)} placeholder="상차된 상품목록 데이터를 복사해서 바로 붙여넣으세요.&#13;&#10;자동으로 옵션ID, 상품명, 수량을 인식해서 매칭해줍니다!" className="flex-1 border border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-orange-500 resize-none h-24 font-mono leading-relaxed bg-white" />
                          <button onClick={handleParseRawData} className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg px-6 transition-colors shadow-sm flex flex-col items-center justify-center gap-1 shrink-0 w-36"><Search size={20} /><span>데이터 인식</span></button>
                        </div>
                      </div>
                    )}

                    <div className="flex-1 overflow-y-auto bg-white relative">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 sticky top-0 shadow-sm text-gray-600 border-b border-gray-200 z-0">
                          <tr>
                            <th className="px-6 py-4 font-semibold w-[25%] cursor-pointer hover:bg-gray-100 select-none transition-colors" onClick={() => requestSort('product')}><div className="flex items-center gap-1">상품명 {getSortIcon('product')}</div></th>
                            <th className="px-6 py-4 font-semibold w-[20%] cursor-pointer hover:bg-gray-100 select-none transition-colors" onClick={() => requestSort('option')}><div className="flex items-center gap-1">옵션명 {getSortIcon('option')}</div></th>
                            <th className="px-6 py-4 font-semibold text-right whitespace-nowrap cursor-pointer hover:bg-gray-100 select-none transition-colors" onClick={() => requestSort('qty')}><div className="flex items-center justify-end gap-1">총 수량 {getSortIcon('qty')}</div></th>
                            <th className="px-6 py-4 font-semibold text-right whitespace-nowrap cursor-pointer hover:bg-gray-100 select-none transition-colors" onClick={() => requestSort('sellPrice')}><div className="flex items-center justify-end gap-1">판매 금액 {getSortIcon('sellPrice')}</div></th>
                            <th className="px-6 py-4 font-semibold text-center w-28 whitespace-nowrap cursor-pointer hover:bg-gray-100 select-none transition-colors" onClick={() => requestSort('remainQty')}><div className="flex items-center justify-center gap-1">남은수량 {getSortIcon('remainQty')}</div></th>
                            <th className="px-6 py-4 font-semibold text-center w-24 whitespace-nowrap">관리</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {processedInventory.length === 0 ? (
                            <tr><td colSpan="6" className="text-center text-gray-400 py-20 text-base">해당 조건의 재고 데이터가 없습니다.</td></tr>
                          ) : (
                            processedInventory.map((item) => {
                              if (editingInvId === item.id) {
                                return (
                                  <tr key={item.id} className="bg-yellow-50/50">
                                    <td className="px-4 py-2"><input type="text" value={invEditForm.product} onChange={e => setInvEditForm({...invEditForm, product: e.target.value})} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-orange-500 font-bold" /></td>
                                    <td className="px-4 py-2"><input type="text" value={invEditForm.option} onChange={e => setInvEditForm({...invEditForm, option: e.target.value})} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-orange-500" /></td>
                                    <td className="px-4 py-2 text-right"><input type="number" value={invEditForm.qty} min="0" onChange={e => setInvEditForm({...invEditForm, qty: e.target.value})} className="w-20 border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-orange-500 text-right font-bold" /></td>
                                    <td className="px-4 py-2 text-right"><input type="number" value={invEditForm.sellPrice} min="0" onChange={e => setInvEditForm({...invEditForm, sellPrice: e.target.value})} className="w-24 border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-orange-500 text-right" /></td>
                                    <td className="px-4 py-2 text-center text-gray-400 text-xs">자동 계산</td>
                                    <td className="px-4 py-2 text-center">
                                      <div className="flex justify-center items-center gap-1">
                                        <button onClick={saveInvEdit} className="text-emerald-600 hover:bg-emerald-100 p-1.5 rounded transition-colors" title="저장"><Check size={16} /></button>
                                        <button onClick={cancelInvEdit} className="text-red-500 hover:bg-red-100 p-1.5 rounded transition-colors" title="취소"><X size={16} /></button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              }
                              return (
                                <tr key={item.id} className="hover:bg-orange-50/40 group transition-colors">
                                  <td className="px-6 py-3.5 font-bold text-gray-800 break-keep">{item.product}</td>
                                  <td className="px-6 py-3.5 text-gray-600 break-keep">{item.option}</td>
                                  <td className="px-6 py-3.5 text-right font-semibold text-gray-900">{item.qty}</td>
                                  <td className="px-6 py-3.5 text-right font-medium text-gray-600">{item.sellPrice.toLocaleString()}원</td>
                                  <td className="px-6 py-3.5 text-center">
                                    <span className={`inline-flex items-center justify-center px-2 py-1 rounded font-bold ${item.remainQty === 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{item.remainQty}</span>
                                  </td>
                                  <td className="px-6 py-3.5 text-center">
                                    <div className="flex justify-center items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => startInvEdit(item)} className="text-gray-400 hover:text-orange-600 p-1.5 rounded hover:bg-orange-50 transition-colors" title="재고 수정"><Edit2 size={16} /></button>
                                      <button onClick={() => handleDeleteInv(item.id)} className="text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors" title="품목 삭제"><Trash2 size={16} /></button>
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
                  <div className="flex-1 flex flex-col overflow-hidden bg-white">
                    <div className="px-6 py-4 bg-orange-50 border-b border-orange-200 flex justify-between items-center shadow-sm shrink-0">
                      <div>
                        <h3 className="text-lg font-bold text-orange-900 flex items-center gap-2">
                          {pendingRawData.some(p => !p.mapped) ? <AlertCircle className="text-orange-600" size={20} /> : <Check className="text-emerald-600" size={20} />}
                          인식된 데이터 ({pendingRawData.length}건)
                          <span className="text-sm bg-orange-200 text-orange-800 px-2.5 py-0.5 rounded-full ml-1 font-bold">총 추가 수량: {pendingRawData.reduce((acc, curr) => acc + curr.qty, 0)}개</span>
                        </h3>
                        <p className="text-sm text-orange-700 mt-1">{pendingRawData.some(p => !p.mapped) ? "새로운 옵션ID가 발견되었습니다. 어떤 상품/옵션으로 등록할지 매칭해주세요." : "모든 항목이 정상적으로 매칭되었습니다. 바로 재고에 적용할 수 있습니다."}</p>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => setPendingRawData([])} className="px-4 py-2 bg-white text-gray-600 border border-gray-300 rounded-lg text-sm font-bold hover:bg-gray-50 shadow-sm transition-colors">취소</button>
                        <button onClick={applyPendingData} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 shadow-sm transition-colors flex items-center gap-2"><Check size={18} /> 선택 매칭 저장 및 재고 반영</button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 text-gray-700 sticky top-0 shadow-sm">
                          <tr>
                            <th className="px-5 py-3 font-semibold w-1/3">Raw Data (옵션ID / 원본 상품명)</th>
                            <th className="px-5 py-3 font-semibold text-right whitespace-nowrap w-24">추가 수량</th>
                            <th className="px-5 py-3 font-semibold">매칭할 상품명</th>
                            <th className="px-5 py-3 font-semibold">매칭할 옵션명</th>
                            <th className="px-5 py-3 font-semibold text-right whitespace-nowrap w-32">판매 금액(원)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {pendingRawData.map((item, idx) => (
                            <tr key={idx} className={item.mapped ? "bg-emerald-50/30" : "bg-red-50/60"}>
                              <td className="px-5 py-3">
                                <div className="font-mono text-xs text-gray-500">{item.rawId}</div>
                                <div className="text-xs mt-1 leading-relaxed">
                                  <div className="font-bold text-gray-800 break-keep">{item.rawName.split(',')[0]}</div>
                                  {item.rawName.includes(',') && <div className="font-bold text-indigo-600 break-keep mt-0.5">옵션: {item.rawName.split(',').slice(1).join(',')}</div>}
                                </div>
                                {!item.mapped && <span className="inline-block mt-1.5 px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded">New 매칭 필요</span>}
                              </td>
                              <td className="px-5 py-3 text-right font-black text-orange-600 text-base">{item.qty}</td>
                              <td className="px-5 py-3">
                                <input list="globalProductList" value={item.mapTo.product} onChange={(e) => updatePendingMap(idx, 'product', e.target.value)} className={`w-full border rounded-md px-3 py-1.5 text-sm outline-none focus:ring-2 ${item.mapped ? 'bg-transparent border-transparent' : 'border-red-300 focus:ring-red-400 bg-white'}`} placeholder="선택 또는 직접 입력" />
                              </td>
                              <td className="px-5 py-3">
                                <datalist id={`pending-opt-${idx}`}>{inventoryData.filter(i => i.product === item.mapTo.product).map(o => <option key={o.id} value={o.option}>{o.option}</option>)}</datalist>
                                <input list={`pending-opt-${idx}`} value={item.mapTo.option} onChange={(e) => updatePendingMap(idx, 'option', e.target.value)} className={`w-full border rounded-md px-3 py-1.5 text-sm outline-none focus:ring-2 ${item.mapped ? 'bg-transparent border-transparent' : 'border-red-300 focus:ring-red-400 bg-white'}`} placeholder="선택 또는 직접 입력" />
                              </td>
                              <td className="px-5 py-3 text-right">
                                <input type="number" value={item.mapTo.sellPrice || ''} onChange={(e) => updatePendingMap(idx, 'sellPrice', e.target.value)} className={`w-full border rounded-md px-3 py-1.5 text-sm outline-none focus:ring-2 text-right ${item.mapped ? 'bg-transparent border-transparent font-bold' : 'border-red-300 focus:ring-red-400 bg-white'}`} placeholder="0" />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {invTab === 'mapping' && (
                  <div className="flex-1 overflow-y-auto bg-white">
                    <div className="px-6 py-4 bg-orange-50 border-b border-orange-100 shadow-sm shrink-0">
                      <p className="text-sm text-orange-800 font-medium">이곳에서 외부 데이터의 <strong className="font-bold">옵션ID</strong>와 내부 <strong className="font-bold">상품/옵션명</strong>의 연결 상태를 확인하고 판매단가를 수정할 수 있습니다.</p>
                    </div>
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 sticky top-0 shadow-sm text-gray-600 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 font-semibold w-1/4">옵션ID / 원본명</th>
                          <th className="px-6 py-4 font-semibold w-1/4">매칭 상품명</th>
                          <th className="px-6 py-4 font-semibold w-1/4">매칭 옵션명</th>
                          <th className="px-6 py-4 font-semibold text-right whitespace-nowrap">판매 금액</th>
                          <th className="px-6 py-4 font-semibold text-center w-24 whitespace-nowrap">관리</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {optionMappings.length === 0 ? (
                          <tr><td colSpan="5" className="text-center text-gray-400 py-20 text-base">저장된 데이터 매칭 정보가 없습니다.</td></tr>
                        ) : (
                          optionMappings.map((mapItem) => {
                            if (editingMapId === mapItem.rawId) {
                              return (
                                <tr key={mapItem.rawId} className="bg-yellow-50/50">
                                  <td className="px-6 py-3">
                                    <div className="font-mono text-xs text-gray-500">{mapItem.rawId}</div>
                                    <div className="text-xs mt-1 leading-relaxed"><div className="font-bold text-gray-800 break-keep">{mapItem.rawName.split(',')[0]}</div>{mapItem.rawName.includes(',') && <div className="font-bold text-indigo-600 break-keep mt-0.5">옵션: {mapItem.rawName.split(',').slice(1).join(',')}</div>}</div>
                                  </td>
                                  <td className="px-4 py-2"><input list="globalProductList" value={mapEditForm.product} onChange={e => setMapEditForm({...mapEditForm, product: e.target.value, option: '', sellPrice: 0})} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-orange-500 font-bold" placeholder="선택 또는 직접 입력" /></td>
                                  <td className="px-4 py-2"><datalist id={`map-opt-${mapItem.rawId}`}>{inventoryData.filter(i => i.product === mapEditForm.product).map(o => <option key={o.id} value={o.option}>{o.option}</option>)}</datalist><input list={`map-opt-${mapItem.rawId}`} value={mapEditForm.option} onChange={e => { const opt = inventoryData.find(i => i.product === mapEditForm.product && i.option === e.target.value); setMapEditForm({...mapEditForm, option: e.target.value, sellPrice: opt ? opt.sellPrice : 0}); }} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-orange-500" placeholder="선택 또는 직접 입력" /></td>
                                  <td className="px-4 py-2 text-right"><input type="number" value={mapEditForm.sellPrice} min="0" onChange={e => setMapEditForm({...mapEditForm, sellPrice: e.target.value})} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-orange-500 text-right font-bold" /></td>
                                  <td className="px-4 py-2 text-center">
                                    <div className="flex justify-center items-center gap-1">
                                      <button onClick={saveMapEdit} className="text-emerald-600 hover:bg-emerald-100 p-1.5 rounded transition-colors" title="저장"><Check size={16} /></button>
                                      <button onClick={cancelMapEdit} className="text-red-500 hover:bg-red-100 p-1.5 rounded transition-colors" title="취소"><X size={16} /></button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            }
                            return (
                              <tr key={mapItem.rawId} className="hover:bg-orange-50/40 group transition-colors">
                                <td className="px-6 py-3">
                                  <div className="font-mono text-xs text-gray-500">{mapItem.rawId}</div>
                                  <div className="text-xs mt-1 leading-relaxed"><div className="font-bold text-gray-800 break-keep">{mapItem.rawName.split(',')[0]}</div>{mapItem.rawName.includes(',') && <div className="font-bold text-indigo-600 break-keep mt-0.5">옵션: {mapItem.rawName.split(',').slice(1).join(',')}</div>}</div>
                                </td>
                                <td className="px-6 py-3 font-bold text-gray-800 break-keep">{mapItem.product}</td>
                                <td className="px-6 py-3 text-gray-600 break-keep">{mapItem.option}</td>
                                <td className="px-6 py-3 text-right font-medium text-blue-600">{mapItem.sellPrice.toLocaleString()}원</td>
                                <td className="px-6 py-3 text-center">
                                  <div className="flex justify-center items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => startMapEdit(mapItem)} className="text-gray-400 hover:text-orange-600 p-1.5 rounded hover:bg-orange-50 transition-colors" title="매칭 수정"><Edit2 size={16} /></button>
                                    <button onClick={() => deleteMap(mapItem.rawId)} className="text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors" title="매칭 삭제"><Trash2 size={16} /></button>
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
                <div className="px-6 py-3 bg-white border-b border-gray-100 flex items-center gap-4 shrink-0 shadow-sm z-10">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-gray-600">상품명 검색</label>
                    <div className="relative"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" value={searchProduct} onChange={(e) => setSearchProduct(e.target.value)} placeholder="상품명 입력..." className="pl-8 pr-3 py-1.5 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all w-40 sm:w-48" /></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-gray-600">옵션명 검색</label>
                    <div className="relative"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" value={searchOption} onChange={(e) => setSearchOption(e.target.value)} placeholder="옵션명 입력..." className="pl-8 pr-3 py-1.5 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all w-40 sm:w-48" /></div>
                  </div>
                  {(searchProduct || searchOption) && <button onClick={() => { setSearchProduct(''); setSearchOption(''); }} className="text-xs text-gray-500 hover:text-gray-800 underline ml-auto font-medium">필터 초기화</button>}
                </div>

                <div className="flex-1 overflow-y-auto bg-white p-0 relative">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 sticky top-0 shadow-sm text-gray-600 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 font-semibold whitespace-nowrap cursor-pointer hover:bg-gray-100 select-none transition-colors" onClick={() => requestSort('date')}><div className="flex items-center gap-1">판매일 {getSortIcon('date')}</div></th>
                        <th className="px-6 py-4 font-semibold whitespace-nowrap cursor-pointer hover:bg-gray-100 select-none w-[22%] transition-colors" onClick={() => requestSort('product')}><div className="flex items-center gap-1">상품명 {getSortIcon('product')}</div></th>
                        <th className="px-6 py-4 font-semibold whitespace-nowrap cursor-pointer hover:bg-gray-100 select-none w-[16%] transition-colors" onClick={() => requestSort('option')}><div className="flex items-center gap-1">옵션명 {getSortIcon('option')}</div></th>
                        <th className="px-6 py-4 font-semibold whitespace-nowrap cursor-pointer hover:bg-gray-100 select-none text-right transition-colors" onClick={() => requestSort('quantity')}><div className="flex items-center justify-end gap-1">수량 {getSortIcon('quantity')}</div></th>
                        <th className="px-6 py-4 font-semibold whitespace-nowrap cursor-pointer hover:bg-gray-100 select-none text-right transition-colors" onClick={() => requestSort('totalPrice')}><div className="flex items-center justify-end gap-1">판매 금액 {getSortIcon('totalPrice')}</div></th>
                        <th className="px-6 py-4 font-semibold whitespace-nowrap cursor-pointer hover:bg-gray-100 select-none w-[28%] transition-colors" onClick={() => requestSort('note')}><div className="flex items-center gap-1">비고 {getSortIcon('note')}</div></th>
                        <th className="px-6 py-4 font-semibold text-center w-24 whitespace-nowrap">관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {modalDetailedData.length === 0 ? (
                        <tr><td colSpan="7" className="text-center text-gray-400 py-20 text-base">해당 조건의 판매 내역이 없습니다.</td></tr>
                      ) : (
                        modalDetailedData.map((sale) => {
                          if (editingSaleId === sale.id) {
                            return (
                              <tr key={sale.id} className="bg-yellow-50/50">
                                <td className="px-4 py-2"><div className="flex items-center border border-gray-300 rounded bg-white pr-1 transition-colors focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"><CustomDatePicker startDate={editForm.date} onChange={(start) => setEditForm({...editForm, date: start})} wrapperClassName="w-full" className="w-full pl-2 py-1 text-sm bg-transparent outline-none whitespace-nowrap" isRangeMode={false} /></div></td>
                                <td className="px-4 py-2"><select value={editForm.product} onChange={e => setEditForm({...editForm, product: e.target.value, option: '', price: 0})} className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"><option value="">선택</option>{uniqueProducts.map(p => <option key={p} value={p}>{p}</option>)}</select></td>
                                <td className="px-4 py-2"><select value={editForm.option} onChange={e => { const opt = inventoryData.find(i => i.product === editForm.product && i.option === e.target.value); setEditForm({...editForm, option: e.target.value, price: opt ? opt.sellPrice : 0}); }} className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"><option value="">선택</option>{inventoryData.filter(i => i.product === editForm.product).map(o => <option key={o.id} value={o.option}>{o.option}</option>)}</select></td>
                                <td className="px-4 py-2 text-right"><input type="number" value={editForm.quantity} min="1" onChange={e => setEditForm({...editForm, quantity: e.target.value})} className="w-14 border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500 text-right" /></td>
                                <td className="px-4 py-2 text-right"><input type="number" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} className="w-20 border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500 text-right" /></td>
                                <td className="px-4 py-2"><input type="text" value={editForm.note} onChange={e => setEditForm({...editForm, note: e.target.value})} className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500" placeholder="비고" /></td>
                                <td className="px-4 py-2 text-center">
                                   <div className="flex justify-center items-center gap-1"><button onClick={saveEdit} className="text-emerald-600 hover:bg-emerald-100 p-1.5 rounded transition-colors" title="저장"><Check size={16} /></button><button onClick={cancelEdit} className="text-red-500 hover:bg-red-100 p-1.5 rounded transition-colors" title="취소"><X size={16} /></button></div>
                                </td>
                              </tr>
                            );
                          }
                          return (
                            <tr key={sale.id} className={`group transition-colors ${maximizedView === 'period' ? 'hover:bg-emerald-50/40' : 'hover:bg-blue-50/40'}`}>
                              <td className="px-6 py-3.5 text-gray-600 font-medium whitespace-nowrap">{sale.date}</td>
                              <td className="px-6 py-3.5 font-bold text-gray-800 whitespace-nowrap">{sale.product}</td>
                              <td className="px-6 py-3.5 text-gray-600 whitespace-nowrap">{sale.option}</td>
                              <td className="px-6 py-3.5 text-right font-semibold text-gray-900">{sale.quantity}</td>
                              <td className={`px-6 py-3.5 text-right font-bold whitespace-nowrap ${maximizedView === 'period' ? 'text-emerald-600' : 'text-blue-600'}`}>{sale.totalPrice.toLocaleString()}원</td>
                              <td className="px-6 py-3.5 text-gray-500 text-sm break-all">{sale.note || '-'}</td>
                              <td className="px-6 py-3.5 text-center">
                                <div className="flex justify-center items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => startEdit(sale)} className="text-gray-400 hover:text-blue-600 p-1.5 rounded hover:bg-blue-50 transition-colors" title="내역 수정"><Edit2 size={16} /></button>
                                  <button onClick={() => handleDeleteSale(sale.id)} className="text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors" title="내역 삭제"><Trash2 size={16} /></button>
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
                  const avgPrice = totalQty > 0 ? Math.round(totalAmount / totalQty) : 0;
                  return (
                    <div className={`px-6 py-4 border-t flex justify-between items-center ${maximizedView === 'period' ? 'bg-emerald-50/50 text-emerald-900' : 'bg-blue-50/50 text-blue-900'}`}>
                      <div className="font-medium text-sm md:text-base"><span className="opacity-80">개당 평균 판매가:</span> <span className="font-bold text-lg">{avgPrice.toLocaleString()}원</span></div>
                      <div className="flex gap-5 md:gap-8 text-sm md:text-base items-center">
                        <div>총 수량: <span className="font-bold text-lg md:text-xl">{totalQty}개</span></div>
                        <div>총 금액: <span className="font-bold text-lg md:text-xl">{totalAmount.toLocaleString()}원</span></div>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}