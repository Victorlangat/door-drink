import React, { createContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // State
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [inventory, setInventory] = useState({});
  
  // Security & Daily Tracking States
  const [dailySales, setDailySales] = useState([]);
  const [dailyCounter, setDailyCounter] = useState(0);
  const [currentDate, setCurrentDate] = useState(new Date().toDateString());
  const [securityLogs, setSecurityLogs] = useState([]);
  const [projectedEarnings, setProjectedEarnings] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
    basedOnInventory: 0
  });
  const [customers, setCustomers] = useState([]);

  // Load data from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedUser = localStorage.getItem('user');
    const savedDailySales = localStorage.getItem('dailySales');
    const savedSecurityLogs = localStorage.getItem('securityLogs');
    const savedCurrentDate = localStorage.getItem('currentDate');
    const savedCustomers = localStorage.getItem('customers');
    
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedDailySales) setDailySales(JSON.parse(savedDailySales));
    if (savedSecurityLogs) setSecurityLogs(JSON.parse(savedSecurityLogs));
    if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
    
    // Check if date changed (new day)
    const today = new Date().toDateString();
    if (savedCurrentDate && savedCurrentDate !== today) {
      setDailyCounter(0);
      setCurrentDate(today);
      localStorage.setItem('currentDate', today);
      addSecurityLog('SYSTEM', 'New day started - Counter reset');
    } else if (savedCurrentDate) {
      setCurrentDate(savedCurrentDate);
    } else {
      setCurrentDate(today);
      localStorage.setItem('currentDate', today);
    }
    
    // Load sample products
    loadSampleProducts();
    calculateProjections();
  }, []);

  useEffect(() => {
    localStorage.setItem('dailySales', JSON.stringify(dailySales));
    localStorage.setItem('customers', JSON.stringify(customers));
    calculateProjections();
  }, [dailySales, customers]);

  useEffect(() => {
    localStorage.setItem('securityLogs', JSON.stringify(securityLogs));
  }, [securityLogs]);

  const addSecurityLog = (action, details, userEmail = null) => {
    const log = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      action,
      details,
      user: userEmail || user?.email || 'system'
    };
    setSecurityLogs(prev => [log, ...prev].slice(0, 500));
  };

  const loadSampleProducts = () => {
    const sampleProducts = [
      { id: 1, name: 'Johnnie Walker Black Label', category: 'Whisky', price: 3500, stock: 45, image: '' },
      { id: 2, name: 'Absolut Vodka', category: 'Vodka', price: 2200, stock: 30, image: '' },
      { id: 3, name: 'Beefeater Gin', category: 'Gin', price: 2800, stock: 20, image: '' },
      { id: 4, name: 'Bacardi Carta Blanca', category: 'Rum', price: 1800, stock: 50, image: '' },
      { id: 5, name: 'Jose Cuervo Tequila', category: 'Tequila', price: 3200, stock: 12, image: '' },
      { id: 6, name: 'Heineken Beer', category: 'Beer', price: 250, stock: 200, image: '' },
      { id: 7, name: 'Jameson Irish Whiskey', category: 'Whisky', price: 2900, stock: 35, image: '' },
      { id: 8, name: 'Smirnoff Red Label', category: 'Vodka', price: 1500, stock: 60, image: '' },
      { id: 9, name: 'Captain Morgan Spiced Gold', category: 'Rum', price: 2200, stock: 25, image: '' },
      { id: 10, name: 'Moët & Chandon Champagne', category: 'Champagne', price: 8500, stock: 8, image: '' }
    ];
    setProducts(sampleProducts);
    
    const inventoryMap = {};
    sampleProducts.forEach(p => { inventoryMap[p.id] = p.stock; });
    setInventory(inventoryMap);
  };

  // Cart functions
  const addToCart = (product, quantity = 1) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > inventory[product.id]) {
        toast.error(`Only ${inventory[product.id]} items in stock!`);
        return;
      }
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, quantity: newQuantity } : item
      ));
    } else {
      if (quantity > inventory[product.id]) {
        toast.error(`Only ${inventory[product.id]} items in stock!`);
        return;
      }
      setCart([...cart, { ...product, quantity }]);
    }
    toast.success(`Added ${product.name}`);
  };
  
  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
    toast.success('Item removed');
  };
  
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const product = products.find(p => p.id === productId);
    if (quantity > inventory[productId]) {
      toast.error(`Only ${inventory[productId]} in stock!`);
      return;
    }
    
    setCart(cart.map(item => 
      item.id === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Process order (POS checkout)
  const processOrder = (paymentMethod, customerName = '', customerPhone = '') => {
    if (cart.length === 0) {
      toast.error('Cart is empty!');
      return false;
    }
    
    // Verify stock
    for (const item of cart) {
      if (item.quantity > inventory[item.id]) {
        toast.error(`${item.name} - Only ${inventory[item.id]} left!`);
        return false;
      }
    }
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal;
    const orderId = Date.now();
    
    // Update inventory
    const newInventory = { ...inventory };
    cart.forEach(item => {
      newInventory[item.id] -= item.quantity;
    });
    setInventory(newInventory);
    
    // Update products stock
    setProducts(products.map(p => ({
      ...p,
      stock: newInventory[p.id] || p.stock
    })));
    
    // Create order record
    const newOrder = {
      id: orderId,
      orderNumber: `POS-${String(dailyCounter + 1).padStart(4, '0')}`,
      items: [...cart],
      subtotal,
      total,
      paymentMethod,
      customerName: customerName || 'Walk-in Customer',
      customerPhone,
      date: new Date().toISOString(),
      status: 'completed'
    };
    
    setOrders([newOrder, ...orders]);
    
    // Add to daily sales
    const dailyRecord = {
      id: orderId,
      orderNumber: newOrder.orderNumber,
      total,
      items: cart.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })),
      time: new Date().toLocaleTimeString(),
      customerName: newOrder.customerName,
      paymentMethod
    };
    
    setDailySales(prev => [...prev, dailyRecord]);
    setDailyCounter(prev => prev + 1);
    
    // Update customer records
    if (customerName && customerPhone) {
      const existingCustomer = customers.find(c => c.phone === customerPhone);
      if (existingCustomer) {
        setCustomers(customers.map(c => 
          c.phone === customerPhone 
            ? { ...c, totalSpent: c.totalSpent + total, orderCount: c.orderCount + 1, lastOrder: new Date().toISOString() }
            : c
        ));
      } else {
        setCustomers([...customers, {
          name: customerName,
          phone: customerPhone,
          totalSpent: total,
          orderCount: 1,
          firstOrder: new Date().toISOString(),
          lastOrder: new Date().toISOString()
        }]);
      }
    }
    
    // Security logging
    addSecurityLog('ORDER_COMPLETED', `Order #${newOrder.orderNumber} | Total: KSh ${total} | Items: ${cart.length} | Payment: ${paymentMethod}`, user?.email);
    
    // Clear cart
    setCart([]);
    
    toast.success(`Order ${newOrder.orderNumber} completed!`);
    return true;
  };
  
  // Calculate projections
  const calculateProjections = () => {
    const today = new Date().toDateString();
    const todaySales = dailySales.filter(sale => 
      new Date(sale.time).toDateString() === today
    );
    const todayTotal = todaySales.reduce((sum, sale) => sum + sale.total, 0);
    
    // 7-day average
    let last7Total = 0;
    let daysWithSales = 0;
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const dayTotal = dailySales.filter(sale => new Date(sale.time).toDateString() === dateStr)
        .reduce((sum, sale) => sum + sale.total, 0);
      if (dayTotal > 0 || i === 0) {
        last7Total += dayTotal;
        daysWithSales++;
      }
    }
    const avgDailySales = daysWithSales ? last7Total / daysWithSales : todayTotal;
    
    const inventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    
    setProjectedEarnings({
      daily: todayTotal,
      weekly: avgDailySales * 7,
      monthly: avgDailySales * 30,
      inventoryValue,
      averageDailyTrend: avgDailySales
    });
  };
  
  // Admin functions
  const updateInventory = (productId, newStock) => {
    if (newStock < 0) return false;
    const product = products.find(p => p.id === productId);
    const oldStock = inventory[productId];
    
    setInventory({ ...inventory, [productId]: newStock });
    setProducts(products.map(p => p.id === productId ? { ...p, stock: newStock } : p));
    
    addSecurityLog('INVENTORY_UPDATE', `${product?.name}: ${oldStock} → ${newStock}`, user?.email);
    toast.success('Inventory updated');
    calculateProjections();
    return true;
  };
  
  const addNewProduct = (product, imageFile = null) => {
    const newId = Date.now();
    let imageUrl = '';
    
    if (imageFile) {
      imageUrl = URL.createObjectURL(imageFile);
    }
    
    const newProduct = {
      id: newId,
      name: product.name,
      category: product.category,
      price: parseFloat(product.price),
      stock: parseInt(product.stock),
      image: imageUrl
    };
    
    setProducts([...products, newProduct]);
    setInventory({ ...inventory, [newId]: newProduct.stock });
    addSecurityLog('PRODUCT_ADDED', `Added: ${product.name} (Stock: ${product.stock}, Price: KSh ${product.price})`, user?.email);
    toast.success('Product added');
    calculateProjections();
  };
  
  const updateProductImage = (productId, imageFile) => {
    const imageUrl = URL.createObjectURL(imageFile);
    setProducts(products.map(p => p.id === productId ? { ...p, image: imageUrl } : p));
    addSecurityLog('IMAGE_UPDATED', `Updated image for product ID: ${productId}`, user?.email);
    toast.success('Image updated');
  };
  
  const deleteProduct = (productId) => {
    const product = products.find(p => p.id === productId);
    setProducts(products.filter(p => p.id !== productId));
    const newInventory = { ...inventory };
    delete newInventory[productId];
    setInventory(newInventory);
    addSecurityLog('PRODUCT_DELETED', `Deleted: ${product?.name}`, user?.email);
    toast.success('Product deleted');
    calculateProjections();
  };
  
  // Analytics
  const getSalesAnalytics = () => {
    const categorySales = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const category = products.find(p => p.name === item.name)?.category || 'Other';
        categorySales[category] = (categorySales[category] || 0) + (item.price * item.quantity);
      });
    });
    
    const topProducts = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        topProducts[item.name] = (topProducts[item.name] || 0) + item.quantity;
      });
    });
    
    return {
      totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
      totalOrders: orders.length,
      averageOrderValue: orders.length ? (orders.reduce((sum, o) => sum + o.total, 0) / orders.length).toFixed(2) : 0,
      categorySales,
      topProducts: Object.entries(topProducts).sort((a, b) => b[1] - a[1]).slice(0, 5),
      repeatCustomers: customers.filter(c => c.orderCount > 1).length
    };
  };
  
  const getDailyReport = () => {
    const today = new Date().toDateString();
    const todaysTransactions = dailySales.filter(sale => 
      new Date(sale.time).toDateString() === today
    );
    
    return {
      date: today,
      transactionCount: todaysTransactions.length,
      totalRevenue: todaysTransactions.reduce((sum, sale) => sum + sale.total, 0),
      transactions: todaysTransactions,
      counterNumber: dailyCounter
    };
  };
  
  const getSecurityLogs = (limit = 100) => securityLogs.slice(0, limit);
  
  return (
    <AppContext.Provider value={{
      products,
      cart,
      orders,
      user,
      setUser,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      processOrder,
      updateInventory,
      addNewProduct,
      updateProductImage,
      deleteProduct,
      getSalesAnalytics,
      getDailyReport,
      getSecurityLogs,
      getCartTotal: () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      getCartCount: () => cart.reduce((count, item) => count + item.quantity, 0),
      dailyCounter,
      projectedEarnings,
      dailySales,
      customers
    }}>
      {children}
    </AppContext.Provider>
  );
};