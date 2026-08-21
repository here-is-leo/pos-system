'use client'

import { useState, useRef, useEffect } from 'react';
import { Search, UserPlus, ChevronDown } from 'lucide-react';
import { Customer } from '@/types/invoice';

interface CustomerSectionProps {
  customer: Customer;
  onChange: (customer: Customer) => void;
  customers: Customer[];
}

export default function CustomerSection({ customer, onChange, customers }: CustomerSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const filtered = customers.filter(c =>
    (c.name.includes(searchQuery) || c.phone.includes(searchQuery)) &&
    searchQuery.length > 0
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (c: Customer) => {
    onChange(c);
    setSearchQuery(c.name);
    setShowDropdown(false);
  };

  const handleClear = () => {
    onChange({ id: 0, name: '', phone: '', nationalId: '', address: '' });
    setSearchQuery('');
  };

  return (
    <section className="mx-4 mb-4">
      <div
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: '#F8F9FA', border: '1.5px solid #ECF0F1' }}
      >
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
            <UserPlus size={17} style={{ color: '#2C3E50' }} />
            <span className="font-bold text-sm" style={{ color: '#2C3E50' }}>اطلاعات مشتری</span>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="relative" ref={searchRef}>
            <div
              className="flex items-center rounded-xl px-3.5 py-3 gap-2.5"
              style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #ECF0F1' }}
            >
              <ChevronDown size={16} style={{ color: '#BDC3C7' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(e.target.value.length > 0);
                }}
                onFocus={() => searchQuery.length > 0 && setShowDropdown(true)}
                placeholder="جستجوی مشتری..."
                className="flex-1 bg-transparent outline-none text-sm text-right"
                style={{ color: '#2C3E50', direction: 'rtl' }}
              />
              <Search size={17} style={{ color: '#7F8C8D' }} />
            </div>

            {showDropdown && filtered.length > 0 && (
              <div
                className="absolute top-full right-0 left-0 rounded-xl shadow-lg z-20 overflow-hidden mt-1"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECF0F1' }}
              >
                {filtered.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleSelect(c)}
                    className="w-full flex items-center justify-between px-4 py-3 text-right transition-colors"
                    style={{ borderBottom: '1px solid #ECF0F1' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F8F9FA')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <span className="text-xs" style={{ color: '#7F8C8D' }}>{c.phone}</span>
                    <span className="text-sm font-semibold" style={{ color: '#2C3E50' }}>{c.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

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
        className="w-full rounded-xl px-3 py-2.5 text-sm outline-none text-right"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1.5px solid #ECF0F1',
          color: '#2C3E50',
          direction: 'rtl',
        }}
      />
    </div>
  );
}