import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Switch } from '../ui/switch';
import { toast } from 'sonner@2.0.3';
import { 
  Plus, Edit2, Trash2, Save, X, Upload, Image as ImageIcon, 
  Calendar, DollarSign, Clock, ArrowLeft, Sparkles, Crown, CheckCircle, XCircle, Copy
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'vendor';
}

interface TimeSlot {
  id: string;
  time: string;
  isAvailable: boolean;
}

interface ServiceImage {
  id: string;
  url: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  cost: number;
  advancePayment: number;
  images: ServiceImage[];
  availableDates: string[];
  timeSlots: TimeSlot[];
  isActive: boolean;
}

interface ManageServicesProps {
  user: User;
  onBack: () => void;
}

const CATEGORIES = [
  'Function Halls',
  'Music & DJ',
  'Decoration',
  'Cars & Transport',
  'Catering',
  'Pandit Services',
  'Photography',
  'Makeup & Styling'
];

const DEFAULT_TIME_SLOTS = [
  '9:00 AM - 12:00 PM',
  '12:00 PM - 3:00 PM',
  '3:00 PM - 6:00 PM',
  '6:00 PM - 9:00 PM',
  '9:00 PM - 12:00 AM'
];

export default function ManageServices({ user, onBack }: ManageServicesProps) {
  const [services, setServices] = useState<Service[]>([
    {
      id: '1',
      name: 'Royal Banquet Hall',
      description: 'Luxurious banquet hall with royal decor and modern amenities. Perfect for grand celebrations with capacity up to 500 guests.',
      category: 'Function Halls',
      cost: 150000,
      advancePayment: 50000,
      images: [
        { id: '1', url: 'https://images.unsplash.com/photo-1519167758481-83f29da1a56d?w=800' },
        { id: '2', url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800' }
      ],
      availableDates: [],
      timeSlots: DEFAULT_TIME_SLOTS.map((time, idx) => ({
        id: `slot-${idx}`,
        time,
        isAvailable: true
      })),
      isActive: true
    }
  ]);

  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [showAddAnotherDialog, setShowAddAnotherDialog] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: CATEGORIES[0],
    cost: '',
    advancePayment: '',
    imageUrls: [''],
  });

  const [customSlots, setCustomSlots] = useState<string[]>(['']);

  const handleAddService = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      category: CATEGORIES[0],
      cost: '',
      advancePayment: '',
      imageUrls: [''],
    });
    setCustomSlots(['']);
    setShowServiceDialog(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      category: service.category,
      cost: service.cost.toString(),
      advancePayment: service.advancePayment.toString(),
      imageUrls: service.images.map(img => img.url),
    });
    setCustomSlots(service.timeSlots.map(slot => slot.time));
    setShowServiceDialog(true);
  };

  const handleSaveService = (addAnother: boolean = false) => {
    const newService: Service = {
      id: editingService?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      category: formData.category,
      cost: parseFloat(formData.cost),
      advancePayment: parseFloat(formData.advancePayment),
      images: formData.imageUrls
        .filter(url => url.trim())
        .map((url, idx) => ({ id: `img-${idx}`, url })),
      availableDates: editingService?.availableDates || [],
      timeSlots: customSlots
        .filter(slot => slot.trim())
        .map((time, idx) => ({
          id: `slot-${idx}`,
          time,
          isAvailable: true
        })),
      isActive: editingService?.isActive ?? true
    };

    if (editingService) {
      setServices(services.map(s => s.id === editingService.id ? newService : s));
      setShowServiceDialog(false);
      toast.success('Service updated successfully!', {
        description: `${newService.name} has been updated.`,
      });
    } else {
      setServices([...services, newService]);
      toast.success('Service created successfully!', {
        description: `${newService.name} has been added to your offerings.`,
      });
      
      if (addAnother) {
        // Keep the dialog open and reset for new service
        setFormData({
          name: '',
          description: '',
          category: formData.category, // Keep same category
          cost: '',
          advancePayment: '',
          imageUrls: [''],
        });
        setCustomSlots(customSlots); // Keep same slots structure
      } else {
        setShowServiceDialog(false);
      }
    }
  };

  const handleDuplicateService = (service: Service) => {
    setEditingService(null); // Important: set to null so it creates a new service
    setFormData({
      name: `${service.name} (Copy)`,
      description: service.description,
      category: service.category,
      cost: service.cost.toString(),
      advancePayment: service.advancePayment.toString(),
      imageUrls: service.images.map(img => img.url),
    });
    setCustomSlots(service.timeSlots.map(slot => slot.time));
    setShowServiceDialog(true);
    toast.info('Service duplicated', {
      description: 'You can now edit and save this as a new service.',
    });
  };

  const handleDeleteService = (id: string) => {
    const service = services.find(s => s.id === id);
    setServices(services.filter(s => s.id !== id));
    toast.success('Service deleted', {
      description: `${service?.name || 'Service'} has been removed.`,
    });
  };

  const toggleServiceActive = (id: string) => {
    setServices(services.map(s => 
      s.id === id ? { ...s, isActive: !s.isActive } : s
    ));
  };

  const addImageUrlField = () => {
    setFormData({ ...formData, imageUrls: [...formData.imageUrls, ''] });
  };

  const updateImageUrl = (index: number, value: string) => {
    const newUrls = [...formData.imageUrls];
    newUrls[index] = value;
    setFormData({ ...formData, imageUrls: newUrls });
  };

  const removeImageUrl = (index: number) => {
    setFormData({ 
      ...formData, 
      imageUrls: formData.imageUrls.filter((_, i) => i !== index) 
    });
  };

  const addSlotField = () => {
    setCustomSlots([...customSlots, '']);
  };

  const updateSlot = (index: number, value: string) => {
    const newSlots = [...customSlots];
    newSlots[index] = value;
    setCustomSlots(newSlots);
  };

  const removeSlot = (index: number) => {
    setCustomSlots(customSlots.filter((_, i) => i !== index));
  };

  const toggleSlotAvailability = (serviceId: string, slotId: string) => {
    setServices(services.map(service => {
      if (service.id === serviceId) {
        return {
          ...service,
          timeSlots: service.timeSlots.map(slot =>
            slot.id === slotId ? { ...slot, isAvailable: !slot.isAvailable } : slot
          )
        };
      }
      return service;
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--royal-cream)] via-white to-[var(--royal-cream)]">
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-r from-[var(--royal-maroon)] via-[var(--royal-copper)] to-[var(--royal-maroon)] text-white shadow-2xl"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={onBack}
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-2">
                <Crown className="h-8 w-8" />
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl">Manage Services</h1>
                    <Badge className="bg-[var(--royal-gold)] text-white">
                      {services.length} {services.length === 1 ? 'Service' : 'Services'}
                    </Badge>
                  </div>
                  <p className="text-sm text-white/80">Add and edit your royal offerings</p>
                </div>
              </div>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleAddService}
                className="bg-white text-[var(--royal-maroon)] hover:bg-[var(--royal-gold)] hover:text-white"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New Service
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Services Grid */}
      <div className="container mx-auto px-4 py-8">
        {services.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Sparkles className="h-20 w-20 text-[var(--royal-gold)] mx-auto mb-4" />
            <h2 className="text-2xl text-[var(--royal-maroon)] mb-2">No Services Yet</h2>
            <p className="text-gray-600 mb-6">Start by adding your first royal service</p>
            <Button
              onClick={handleAddService}
              className="bg-gradient-to-r from-[var(--royal-maroon)] to-[var(--royal-copper)] text-white"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Service
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                  layout
                >
                  <Card className="overflow-hidden border-2 border-[var(--royal-gold)]/30 hover:border-[var(--royal-gold)] transition-all shadow-lg hover:shadow-2xl">
                    {/* Service Images */}
                    <div className="relative h-48 bg-gradient-to-br from-[var(--royal-maroon)]/10 to-[var(--royal-gold)]/10">
                      {service.images.length > 0 ? (
                        <ImageWithFallback
                          src={service.images[0].url}
                          alt={service.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-16 w-16 text-[var(--royal-gold)]/50" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Badge 
                          variant={service.isActive ? "default" : "secondary"}
                          className={service.isActive 
                            ? "bg-green-500 text-white" 
                            : "bg-gray-400 text-white"
                          }
                        >
                          {service.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>

                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-[var(--royal-maroon)]">{service.name}</CardTitle>
                          <CardDescription>{service.category}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Total Cost:</span>
                          <span className="text-[var(--royal-maroon)]">₹{service.cost.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Advance:</span>
                          <span className="text-[var(--royal-copper)]">₹{service.advancePayment.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Slot Management */}
                      <div>
                        <Label className="text-xs text-gray-600 mb-2 block">Available Slots</Label>
                        <div className="flex flex-wrap gap-1">
                          {service.timeSlots.slice(0, 3).map((slot) => (
                            <Badge
                              key={slot.id}
                              variant="outline"
                              className={`text-xs cursor-pointer ${
                                slot.isAvailable
                                  ? 'border-green-500 text-green-700 bg-green-50'
                                  : 'border-gray-300 text-gray-400 bg-gray-50'
                              }`}
                              onClick={() => toggleSlotAvailability(service.id, slot.id)}
                            >
                              {slot.isAvailable ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                              {slot.time.split(' - ')[0]}
                            </Badge>
                          ))}
                          {service.timeSlots.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{service.timeSlots.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2 pt-4 border-t border-[var(--royal-gold)]/30">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={service.isActive}
                            onCheckedChange={() => toggleServiceActive(service.id)}
                          />
                          <span className="text-xs text-gray-600">Active</span>
                        </div>
                        <div className="flex gap-2">
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                            <Button
                              size="sm"
                              onClick={() => handleEditService(service)}
                              className="w-full bg-gradient-to-r from-[var(--royal-maroon)] to-[var(--royal-copper)] text-white"
                            >
                              <Edit2 className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                            <Button
                              size="sm"
                              onClick={() => handleDuplicateService(service)}
                              variant="outline"
                              className="w-full border-[var(--royal-gold)] text-[var(--royal-maroon)]"
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              Copy
                            </Button>
                          </motion.div>
                        </div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteService(service.id)}
                            className="w-full"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      {services.length > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              onClick={handleAddService}
              className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-br from-[var(--royal-gold)] to-[var(--royal-amber)] text-white hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]"
            >
              <Plus className="h-8 w-8" />
            </Button>
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-[var(--royal-gold)]/30 blur-xl -z-10"
          />
        </motion.div>
      )}

      {/* Add/Edit Service Dialog */}
      <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-2 border-[var(--royal-gold)]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[var(--royal-maroon)] flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              {editingService ? 'Edit Service' : 'Add New Service'}
            </DialogTitle>
            <DialogDescription>
              {editingService 
                ? 'Update your service details below' 
                : 'Fill in the details to create a new royal service'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg text-[var(--royal-maroon)]">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Service Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Royal Banquet Hall"
                    className="border-[var(--royal-gold)]/50 focus:border-[var(--royal-gold)]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-[var(--royal-gold)]/50 rounded-lg focus:border-[var(--royal-gold)] focus:outline-none bg-white"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your service in detail..."
                  rows={4}
                  className="border-[var(--royal-gold)]/50 focus:border-[var(--royal-gold)]"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg text-[var(--royal-maroon)] flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost">Total Cost (₹) *</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    placeholder="150000"
                    className="border-[var(--royal-gold)]/50 focus:border-[var(--royal-gold)]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="advance">Advance Payment (₹) *</Label>
                  <Input
                    id="advance"
                    type="number"
                    value={formData.advancePayment}
                    onChange={(e) => setFormData({ ...formData, advancePayment: e.target.value })}
                    placeholder="50000"
                    className="border-[var(--royal-gold)]/50 focus:border-[var(--royal-gold)]"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg text-[var(--royal-maroon)] flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Service Images
                </h3>
                <Button
                  type="button"
                  size="sm"
                  onClick={addImageUrlField}
                  variant="outline"
                  className="border-[var(--royal-gold)] text-[var(--royal-maroon)]"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Image
                </Button>
              </div>

              <div className="space-y-3">
                {formData.imageUrls.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={url}
                      onChange={(e) => updateImageUrl(index, e.target.value)}
                      placeholder="Enter image URL"
                      className="flex-1 border-[var(--royal-gold)]/50 focus:border-[var(--royal-gold)]"
                    />
                    {formData.imageUrls.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeImageUrl(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg text-[var(--royal-maroon)] flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Available Time Slots
                </h3>
                <Button
                  type="button"
                  size="sm"
                  onClick={addSlotField}
                  variant="outline"
                  className="border-[var(--royal-gold)] text-[var(--royal-maroon)]"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Slot
                </Button>
              </div>

              <div className="space-y-3">
                {customSlots.map((slot, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={slot}
                      onChange={(e) => updateSlot(index, e.target.value)}
                      placeholder="e.g., 9:00 AM - 12:00 PM"
                      className="flex-1 border-[var(--royal-gold)]/50 focus:border-[var(--royal-gold)]"
                    />
                    {customSlots.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeSlot(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-6 border-t border-[var(--royal-gold)]/30">
              {!editingService && (
                <motion.div 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => handleSaveService(true)}
                    disabled={!formData.name || !formData.cost || !formData.advancePayment}
                    className="w-full bg-gradient-to-r from-[var(--royal-gold)] to-[var(--royal-amber)] text-white"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Save & Add Another Service
                  </Button>
                </motion.div>
              )}
              <div className="flex gap-3">
                <motion.div 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }}
                  className="flex-1"
                >
                  <Button
                    onClick={() => handleSaveService(false)}
                    disabled={!formData.name || !formData.cost || !formData.advancePayment}
                    className="w-full bg-gradient-to-r from-[var(--royal-maroon)] to-[var(--royal-copper)] text-white"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    {editingService ? 'Update Service' : 'Save Service'}
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => setShowServiceDialog(false)}
                    variant="outline"
                    className="border-2 border-[var(--royal-gold)] text-[var(--royal-maroon)]"
                  >
                    Cancel
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
