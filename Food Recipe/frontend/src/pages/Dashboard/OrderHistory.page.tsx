import React, { useState } from 'react';
import { 
  Typography, 
  Card, 
  CardContent, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid
} from '@mui/material';
import { 
  ShoppingCart as CartIcon, 
  Receipt as ReceiptIcon, 
  LocalShipping as ShippingIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

// Static Order Data
const staticOrderHistory = [
  {
    id: 'ORD-2024-001',
    date: '2024-03-15',
    items: [
      { name: 'Organic Extra Virgin Olive Oil', quantity: 2, price: 15.99 },
      { name: 'Himalayan Pink Salt', quantity: 1, price: 7.50 }
    ],
    total: 39.48,
    status: 'Delivered',
    trackingNumber: 'SHIP-456789'
  },
  {
    id: 'ORD-2024-002',
    date: '2024-02-28',
    items: [
      { name: 'Premium Spice Blend Set', quantity: 1, price: 24.99 },
      { name: 'Organic Herbs Collection', quantity: 1, price: 18.50 }
    ],
    total: 43.49,
    status: 'Processing',
    trackingNumber: 'SHIP-123456'
  },
  {
    id: 'ORD-2024-003',
    date: '2024-02-10',
    items: [
      { name: 'Professional Chef\'s Knife', quantity: 1, price: 89.99 },
      { name: 'Cutting Board Set', quantity: 1, price: 35.00 }
    ],
    total: 124.99,
    status: 'Shipped',
    trackingNumber: 'SHIP-789012'
  },
  {
    id: 'ORD-2024-004',
    date: '2024-01-22',
    items: [
      { name: 'Organic Quinoa', quantity: 3, price: 12.99 },
      { name: 'Gourmet Sea Salt Sampler', quantity: 1, price: 22.50 }
    ],
    total: 60.47,
    status: 'Delivered',
    trackingNumber: 'SHIP-345678'
  }
];

const OrderHistoryPage: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'success';
      case 'Processing': return 'warning';
      case 'Shipped': return 'primary';
      default: return 'default';
    }
  };

  const filteredOrders = filterStatus 
    ? staticOrderHistory.filter(order => order.status === filterStatus)
    : staticOrderHistory;

  const handleOpenOrderDetails = (order: any) => {
    setSelectedOrder(order);
  };

  const handleCloseOrderDetails = () => {
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <CartIcon className="text-amber-600" fontSize="large" />
          <Typography variant="h4" className="font-bold">
            Order History
          </Typography>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outlined" 
            startIcon={<FilterIcon />}
            onClick={() => setFilterStatus(null)}
            color={filterStatus ? 'primary' : 'inherit'}
          >
            All Orders
          </Button>
          <Button 
            variant="outlined" 
            color={filterStatus === 'Delivered' ? 'success' : 'primary'}
            onClick={() => setFilterStatus('Delivered')}
          >
            Delivered
          </Button>
          <Button 
            variant="outlined" 
            color={filterStatus === 'Processing' ? 'warning' : 'primary'}
            onClick={() => setFilterStatus('Processing')}
          >
            Processing
          </Button>
        </div>
      </div>

      {/* Order History Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead className="bg-gray-100">
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>${order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={order.status} 
                        color={getStatusColor(order.status) as any} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outlined" 
                        size="small"
                        color="primary"
                        onClick={() => handleOpenOrderDetails(order)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog 
        open={!!selectedOrder} 
        onClose={handleCloseOrderDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle>
              <div className="flex justify-between items-center">
                <Typography variant="h6">Order Details</Typography>
                <Chip 
                  icon={<ReceiptIcon />}
                  label={selectedOrder.id} 
                  color="primary" 
                  size="small" 
                />
              </div>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" className="font-bold mb-2">
                    Order Information
                  </Typography>
                  <div className="space-y-2">
                    <Typography>Date: {selectedOrder.date}</Typography>
                    <Typography>
                      Status: 
                      <Chip 
                        label={selectedOrder.status} 
                        color={getStatusColor(selectedOrder.status) as any} 
                        size="small" 
                        className="ml-2"
                      />
                    </Typography>
                    <Typography>Tracking Number: {selectedOrder.trackingNumber}</Typography>
                  </div>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" className="font-bold mb-2">
                    Order Summary
                  </Typography>
                  {selectedOrder.items.map((item: any) => (
                    <div key={item.name} className="flex justify-between mb-1">
                      <Typography>{item.name}</Typography>
                      <Typography>
                        {item.quantity} x ${item.price.toFixed(2)}
                      </Typography>
                    </div>
                  ))}
                  <div className="border-t mt-2 pt-2 flex justify-between">
                    <Typography variant="subtitle1" className="font-bold">
                      Total
                    </Typography>
                    <Typography variant="subtitle1" className="font-bold">
                      ${selectedOrder.total.toFixed(2)}
                    </Typography>
                  </div>
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>
    </div>
  );
};

export default OrderHistoryPage;