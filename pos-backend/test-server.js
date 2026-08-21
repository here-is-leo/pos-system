// test-server.js
const express = require('express');
const app = express();
const port = 5000;

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running!' });
});

app.get('/api/customers', (req, res) => {
  res.json({ data: [{ id: 1, name: 'مشتری تست' }] });
});

app.post('/api/invoices', (req, res) => {
  console.log('📝 دریافت درخواست:', req.body);
  res.json({ 
    id: 1, 
    invoiceNumber: 'INV-2026-0001',
    message: 'فاکتور با موفقیت ایجاد شد'
  });
});

app.listen(port, () => {
  console.log(`✅ Test server running on http://localhost:${port}`);
});