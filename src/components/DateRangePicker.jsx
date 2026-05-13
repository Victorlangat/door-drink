import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

const DateRangePicker = ({ onDateRangeSelect, onClose }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedRange, setSelectedRange] = useState('today');

  const ranges = [
    { id: 'today', label: 'Today', days: 0 },
    { id: 'yesterday', label: 'Yesterday', days: 1 },
    { id: 'last7', label: 'Last 7 Days', days: 7 },
    { id: 'last30', label: 'Last 30 Days', days: 30 },
    { id: 'thisMonth', label: 'This Month', days: 'month' },
    { id: 'custom', label: 'Custom Range', days: null }
  ];

  const handleRangeClick = (range) => {
    setSelectedRange(range.id);
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (range.id) {
      case 'today':
        start = today;
        end = today;
        break;
      case 'yesterday':
        start = new Date(today.setDate(today.getDate() - 1));
        end = new Date(today);
        break;
      case 'last7':
        start = new Date(today.setDate(today.getDate() - 7));
        end = new Date();
        break;
      case 'last30':
        start = new Date(today.setDate(today.getDate() - 30));
        end = new Date();
        break;
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date();
        break;
      default:
        return;
    }

    if (range.id !== 'custom') {
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
      onDateRangeSelect(start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
    }
  };

  const handleCustomSubmit = () => {
    if (startDate && endDate) {
      onDateRangeSelect(startDate, endDate);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
      }}>
        <div style={{
          padding: '1rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} color="#3b82f6" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Select Date Range</h2>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0.25rem'
          }}>
            <X size={20} color="#6b7280" />
          </button>
        </div>

        <div style={{ padding: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {ranges.map(range => (
              <button
                key={range.id}
                onClick={() => handleRangeClick(range)}
                style={{
                  padding: '0.6rem',
                  background: selectedRange === range.id ? '#3b82f6' : '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: selectedRange === range.id ? 'white' : '#4b5563',
                  fontWeight: 500,
                  fontSize: '0.875rem'
                }}
              >
                {range.label}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '16px'
              }}
            />
          </div>

          <button
            onClick={handleCustomSubmit}
            disabled={!startDate || !endDate}
            style={{
              width: '100%',
              background: '#10b981',
              color: 'white',
              border: 'none',
              padding: '0.75rem',
              borderRadius: '10px',
              cursor: !startDate || !endDate ? 'not-allowed' : 'pointer',
              opacity: !startDate || !endDate ? 0.5 : 1,
              fontWeight: 600
            }}
          >
            Apply Date Range
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker;