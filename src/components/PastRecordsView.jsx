import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Calendar, Download, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

const PastRecordsView = ({ storeId, onClose }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyData, setDailyData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);

  useEffect(() => {
    loadAvailableDates();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadDataForDate(selectedDate);
    }
  }, [selectedDate]);

  const loadAvailableDates = async () => {
    const { data } = await supabase
      .from('daily_sales')
      .select('sale_date')
      .eq('store_id', storeId)
      .order('sale_date', { ascending: false });
    
    setAvailableDates(data || []);
  };

  const loadDataForDate = async (date) => {
    setLoading(true);
    try {
      // Get daily summary
      const { data: dailySummary } = await supabase
        .from('daily_sales')
        .select('*')
        .eq('store_id', storeId)
        .eq('sale_date', date)
        .maybeSingle();

      // Get orders for that day
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('store_id', storeId)
        .gte('created_at', `${date}T00:00:00`)
        .lte('created_at', `${date}T23:59:59`)
        .order('created_at', { ascending: false });

      setDailyData(dailySummary);
      setOrders(ordersData || []);
    } catch (error) {
      console.error('Error loading date data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!orders.length) return;
    
    const headers = ['Order #', 'Time', 'Customer', 'Payment', 'Items', 'Total'];
    const rows = orders.map(order => [
      order.order_number,
      new Date(order.created_at).toLocaleTimeString(),
      order.customer_name || 'Walk-in Customer',
      order.payment_method || 'cash',
      order.items?.length || 0,
      order.total || 0
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#f3f4f6',
      zIndex: 2000,
      overflow: 'auto'
    }}>
      <div style={{
        position: 'sticky',
        top: 0,
        background: 'white',
        padding: '1rem',
        borderBottom: '1px solid #e5e7eb',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={24} color="#3b82f6" />
            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Past Records</h1>
          </div>
          <button onClick={onClose} style={{
            background: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer'
          }}>
            Close
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
        {/* Date Selector */}
        <div style={{
          background: 'white',
          padding: '1rem',
          borderRadius: '16px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => changeDate(-1)} style={{
              background: '#f3f4f6',
              border: 'none',
              padding: '0.5rem',
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
              <ChevronLeft size={20} />
            </button>
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={18} color="#3b82f6" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <button onClick={() => changeDate(1)} style={{
              background: '#f3f4f6',
              border: 'none',
              padding: '0.5rem',
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
              <ChevronRight size={20} />
            </button>
          </div>
          
          {orders.length > 0 && (
            <button onClick={exportToCSV} style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Download size={16} />
              Export to CSV
            </button>
          )}
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', padding: '1.25rem', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '0.85rem', opacity: 0.9 }}>Total Transactions</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{dailyData?.transaction_count || orders.length || 0}</p>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', padding: '1.25rem', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '0.85rem', opacity: 0.9 }}>Total Revenue</h3>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>KSh {totalRevenue.toLocaleString()}</p>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', padding: '1.25rem', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '0.85rem', opacity: 0.9 }}>Average Order</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>KSh {orders.length ? Math.round(totalRevenue / orders.length).toLocaleString() : 0}</p>
          </div>
        </div>

        {/* Orders Table */}
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', overflowX: 'auto' }}>
          <h3 style={{ marginBottom: '1rem' }}>Orders for {new Date(selectedDate).toLocaleDateString()}</h3>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>
          ) : orders.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f3f4f6' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Order #</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Time</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Customer</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Payment</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Items</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.75rem' }}>{order.order_number}</td>
                    <td style={{ padding: '0.75rem' }}>{new Date(order.created_at).toLocaleTimeString()}</td>
                    <td style={{ padding: '0.75rem' }}>{order.customer_name || 'Walk-in Customer'}</td>
                    <td style={{ padding: '0.75rem' }}>{order.payment_method || 'cash'}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{order.items?.length || 0}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>KSh {(order.total || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot style={{ background: '#f3f4f6' }}>
                <tr>
                  <td colSpan="5" style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>Total:
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>KSh {totalRevenue.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>No orders found for this date</p>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Select a different date to view records</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PastRecordsView;