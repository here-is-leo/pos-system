'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, User, ChevronDown, Users, X } from 'lucide-react';
import { Customer } from '@/lib/invoice-types';

interface CustomerSectionProps {
  customer: Customer;
  onChange: (customer: Customer) => void;
  customers: Customer[];
}

export default function CustomerSection({ customer, onChange, customers }: CustomerSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAllCustomers, setShowAllCustomers] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // 🔥 نمایش همه مشتریان (بدون جستجو)
  const displayCustomers = showAllCustomers 
    ? customers 
    : customers.filter(c => 
        (c.name.includes(searchQuery) || c.phone.includes(searchQuery)) && 
        searchQuery.length > 0
      );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setShowAllCustomers(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (c: Customer) => {
    onChange(c);
    setSearchQuery(c.name);
    setShowDropdown(false);
    setShowAllCustomers(false);
  };

  const handleClear = () => {
    onChange({ id: 0, name: '', phone: '', nationalId: '', address: '' });
    setSearchQuery('');
    setShowDropdown(false);
    setShowAllCustomers(false);
  };

  const toggleShowAll = () => {
    setShowAllCustomers(!showAllCustomers);
    setShowDropdown(true);
    if (!showAllCustomers) {
      // اگر لیست باز می‌شود، جستجو را خالی کن تا همه مشتریان نمایش داده شوند
      setSearchQuery('');
    }
  };

  return (
    <section className="mx-4 mb-4">
      <div
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: '#F8F9FA', border: '1.5px solid #ECF0F1' }}
      >
        {/* Section header */}
        <div
          className="flex items-center justify-between px-4 py-3.5"
          style={{ borderBottom: '1.5px solid #ECF0F1', backgroundColor: '#FFFFFF' }}
        >
          <button
            onClick={handleClear}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            style={{ backgroundColor: '#EBF5FB', color: '#3498DB', border: '1px solid #3498DB' }}
          >
            مشتری جدید
          </button>
          <div className="flex items-center gap-2">
            <User size={17} style={{ color: '#2C3E50' }} />
            <span className="font-bold text-sm" style={{ color: '#2C3E50' }}>اطلاعات مشتری</span>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* Search with Show All button */}
          <div className="relative" ref={searchRef}>
            <div
              className="flex items-center rounded-xl px-3.5 py-3 gap-2.5"
              style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #ECF0F1' }}
            >
              {/* 🔥 دکمه نمایش همه مشتریان */}
              <button
                onClick={toggleShowAll}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${
                  showAllCustomers 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={showAllCustomers ? 'بستن لیست همه مشتریان' : 'نمایش همه مشتریان'}
              >
                <Users size={14} />
                {showAllCustomers ? 'بستن' : 'همه'}
              </button>

              <div className="w-px h-6 bg-gray-200 flex-shrink-0" />

              <input
                type="text"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(e.target.value.length > 0);
                  if (e.target.value.length > 0) {
                    setShowAllCustomers(false);
                  }
                }}
                onFocus={() => {
                  if (searchQuery.length > 0 || showAllCustomers) {
                    setShowDropdown(true);
                  }
                }}
                placeholder="جستجوی مشتری..."
                className="flex-1 bg-transparent outline-none text-sm text-right"
                style={{ color: '#2C3E50', direction: 'rtl' }}
              />

              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setShowDropdown(false);
                  }}
                  className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X size={14} style={{ color: '#7F8C8D' }} />
                </button>
              )}

              <Search size={17} style={{ color: '#7F8C8D' }} />
            </div>

            {/* 🔥 نمایش تعداد مشتریان */}
            {showDropdown && displayCustomers.length > 0 && (
              <div className="text-xs text-gray-400 mt-1 px-2">
                {displayCustomers.length} مشتری
              </div>
            )}

            {/* Dropdown */}
            {showDropdown && displayCustomers.length > 0 && (
              <div
                className="absolute top-full right-0 left-0 rounded-xl shadow-lg z-20 overflow-hidden mt-1"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECF0F1', maxHeight: '250px', overflowY: 'auto' }}
              >
                {displayCustomers.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleSelect(c)}
                    className="w-full flex items-center justify-between px-4 py-3 text-right transition-colors hover:bg-gray-50"
                    style={{ borderBottom: '1px solid #ECF0F1' }}
                  >
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-semibold" style={{ color: '#2C3E50' }}>{c.name}</span>
                      <span className="text-xs" style={{ color: '#7F8C8D' }}>{c.phone || 'بدون تلفن'}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 ml-3">
                      <User size={14} style={{ color: '#3498DB' }} />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* پیام خالی بودن */}
            {showDropdown && displayCustomers.length === 0 && searchQuery.length > 0 && (
              <div className="absolute top-full right-0 left-0 rounded-xl shadow-lg z-20 overflow-hidden mt-1 bg-white p-4 text-center text-gray-400 text-sm border border-gray-200">
                مشتریی یافت نشد
              </div>
            )}
          </div>

          {/* Fields Grid */}
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="آدرس"
              value={customer.address}
              onChange={v => onChange({ ...customer, address: v })}
              placeholder="آدرس مشتری"
            />
            <InputField
              label="شناسه ملی"
              value={customer.nationalId}
              onChange={v => onChange({ ...customer, nationalId: v })}
              placeholder="کد ملی / شناسه"
              inputMode="numeric"
            />
            <InputField
              label="تلفن"
              value={customer.phone}
              onChange={v => onChange({ ...customer, phone: v })}
              placeholder="09..."
              inputMode="tel"
            />
            <InputField
              label="نام مشتری"
              value={customer.name}
              onChange={v => onChange({ ...customer, name: v })}
              placeholder="نام و نام خانوادگی"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: 'numeric' | 'tel' | 'text';
}

function InputField({ label, value, onChange, placeholder, inputMode = 'text' }: InputFieldProps) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5 text-right" style={{ color: '#7F8C8D' }}>
        {label}
      </label>
      <input
        type="text"
        inputMode={inputMode}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl px-3 py-2.5 text-sm outline-none text-right transition-all focus:border-blue-400"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1.5px solid #ECF0F1',
          color: '#2C3E50',
          direction: 'rtl',
        }}
        onFocus={e => {
          e.target.style.borderColor = '#3498DB';
          e.target.style.boxShadow = '0 0 0 3px rgba(52,152,219,0.1)';
        }}
        onBlur={e => {
          e.target.style.borderColor = '#ECF0F1';
          e.target.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}