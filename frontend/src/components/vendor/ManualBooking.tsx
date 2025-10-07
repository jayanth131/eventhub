import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar as CalendarIcon, UserPlus, Phone, Mail, Clock, DollarSign, Check } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner@2.0.3';

interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  date: string;
  time: string;
  amount: number;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  advancePaid: number;
}

interface ManualBookingProps {
  onAddBooking: (booking: Booking) => void;
}

const timeSlots = [
  '9:00 AM - 12:00 PM',
  '10:00 AM - 2:00 PM',
  '12:00 PM - 4:00 PM',
  '3:00 PM - 7:00 PM',
  '5:00 PM - 9:00 PM',
  '6:00 PM - 10:00 PM',
  '7:00 PM - 11:00 PM',
  '8:00 PM - 12:00 AM',
];

export default function ManualBooking({ onAddBooking }: ManualBookingProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    time: '',
    amount: '',
    advancePaid: '',
    status: 'confirmed' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.customerName || !formData.customerPhone || !date || !formData.time || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    const advancePaid = formData.advancePaid ? parseFloat(formData.advancePaid) : 0;

    if (advancePaid > amount) {
      toast.error('Advance amount cannot be greater than total amount');
      return;
    }

    const newBooking: Booking = {
      id: `WB${Date.now().toString().slice(-6)}`,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerEmail: formData.customerEmail || '',
      date: format(date, 'yyyy-MM-dd'),
      time: formData.time,
      amount: amount,
      status: formData.status,
      advancePaid: advancePaid
    };

    onAddBooking(newBooking);
    toast.success('Offline booking added successfully!', {
      description: `Booking for ${formData.customerName} on ${format(date, 'PPP')}`
    });

    // Reset form
    setFormData({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      time: '',
      amount: '',
      advancePaid: '',
      status: 'confirmed'
    });
    setDate(undefined);
    setOpen(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-gradient-to-r from-[var(--royal-maroon)] to-[var(--royal-copper)] text-white border-2 border-[var(--royal-gold)] hover:from-[var(--royal-copper)] hover:to-[var(--royal-maroon)] shadow-xl"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Offline Booking
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto border-4 border-[var(--royal-gold)]/30">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[var(--royal-maroon)] flex items-center">
            <UserPlus className="h-6 w-6 mr-2" />
            Add Manual Booking
          </DialogTitle>
          <DialogDescription>
            Record an offline booking made via phone call or in-person
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Customer Details Section */}
          <div className="space-y-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-[var(--royal-gold)]/20">
            <h3 className="text-sm text-[var(--royal-maroon)] flex items-center">
              <UserPlus className="h-4 w-4 mr-2" />
              Customer Details
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="customerName" className="text-gray-700">
                Customer Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="customerName"
                placeholder="e.g., Rahul & Priya"
                value={formData.customerName}
                onChange={(e) => handleChange('customerName', e.target.value)}
                className="border-2 border-[var(--royal-gold)]/20 focus:border-[var(--royal-gold)] bg-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerPhone" className="text-gray-700">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="customerPhone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.customerPhone}
                    onChange={(e) => handleChange('customerPhone', e.target.value)}
                    className="pl-10 border-2 border-[var(--royal-gold)]/20 focus:border-[var(--royal-gold)] bg-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerEmail" className="text-gray-700">
                  Email (Optional)
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="customerEmail"
                    type="email"
                    placeholder="customer@example.com"
                    value={formData.customerEmail}
                    onChange={(e) => handleChange('customerEmail', e.target.value)}
                    className="pl-10 border-2 border-[var(--royal-gold)]/20 focus:border-[var(--royal-gold)] bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Booking Details Section */}
          <div className="space-y-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-[var(--royal-gold)]/20">
            <h3 className="text-sm text-[var(--royal-maroon)] flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Booking Details
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700">
                  Event Date <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left border-2 border-[var(--royal-gold)]/20 hover:border-[var(--royal-gold)] bg-white"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP') : <span className="text-gray-500">Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border-2 border-[var(--royal-gold)]/30">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="text-gray-700">
                  Time Slot <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.time} onValueChange={(value) => handleChange('time', value)}>
                  <SelectTrigger className="border-2 border-[var(--royal-gold)]/20 focus:border-[var(--royal-gold)] bg-white">
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-gray-700">
                Booking Status
              </Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleChange('status', value as any)}
              >
                <SelectTrigger className="border-2 border-[var(--royal-gold)]/20 focus:border-[var(--royal-gold)] bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Payment Details Section */}
          <div className="space-y-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-[var(--royal-gold)]/20">
            <h3 className="text-sm text-[var(--royal-maroon)] flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Payment Details
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-gray-700">
                  Total Amount (₹) <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">₹</span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="50000"
                    value={formData.amount}
                    onChange={(e) => handleChange('amount', e.target.value)}
                    className="pl-8 border-2 border-[var(--royal-gold)]/20 focus:border-[var(--royal-gold)] bg-white"
                    min="0"
                    step="100"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="advancePaid" className="text-gray-700">
                  Advance Paid (₹)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">₹</span>
                  <Input
                    id="advancePaid"
                    type="number"
                    placeholder="12500"
                    value={formData.advancePaid}
                    onChange={(e) => handleChange('advancePaid', e.target.value)}
                    className="pl-8 border-2 border-[var(--royal-gold)]/20 focus:border-[var(--royal-gold)] bg-white"
                    min="0"
                    step="100"
                  />
                </div>
              </div>
            </div>

            {formData.amount && (
              <div className="p-3 bg-white rounded-lg border-2 border-[var(--royal-gold)]/20">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Pending Amount:</span>
                  <span className="text-[var(--royal-maroon)]">
                    ₹{(parseFloat(formData.amount) - (parseFloat(formData.advancePaid) || 0)).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="border-2 border-[var(--royal-gold)]/20"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-gradient-to-r from-[var(--royal-maroon)] to-[var(--royal-copper)] text-white border-2 border-[var(--royal-gold)] hover:from-[var(--royal-copper)] hover:to-[var(--royal-maroon)]"
            >
              <Check className="h-4 w-4 mr-2" />
              Add Booking
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
