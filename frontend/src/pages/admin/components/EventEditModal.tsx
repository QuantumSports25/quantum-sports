import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { eventService } from '../../../services/eventService';

interface Props {
  eventId: string | null;
  open: boolean;
  onClose: () => void;
  initial?: any;
  onSaved: () => void;
}

const inputClass = 'bg-gray-700 text-white placeholder-gray-400 w-full px-3 py-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent';
const labelClass = 'block text-sm font-medium text-gray-300 mb-1';

const EventEditModal: React.FC<Props> = ({ eventId, open, onClose, initial, onSaved }) => {
  const [form, setForm] = useState<any>(initial || {});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(initial || {});
  }, [initial]);

  const isValid = useMemo(() => {
    return (
      form?.title && form?.date && form?.time && form?.venue && form?.venueName &&
      typeof form?.capacity === 'number' && form.capacity > 0 &&
      typeof form?.ticketPrice === 'number' && form.ticketPrice > 0 &&
      form?.mapLocationLink &&
      form?.city && form?.state && form?.country && form?.pincode &&
      Array.isArray(form?.images) && form.images.length > 0 &&
      Array.isArray(form?.tags) && form.tags.length > 0 &&
      form?.lat && form?.lang
    );
  }, [form]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((p: any) => ({ ...p, [name]: name === 'capacity' || name === 'ticketPrice' ? Number(value) : value }));
  };

  const handleArrayChange = (name: 'images' | 'tags', index: number, value: string) => {
    setForm((p: any) => {
      const updated = [...(p[name] || [])];
      updated[index] = value;
      return { ...p, [name]: updated };
    });
  };

  const addArrayItem = (name: 'images' | 'tags') => {
    setForm((p: any) => ({ ...p, [name]: [...(p[name] || []), ''] }));
  };

  const save = async () => {
    if (!eventId || !isValid) return;
    try {
      setSaving(true);
      await eventService.updateEvent(eventId, {
        ...form,
        featured: true,
        location: {
          address: `${form.city}, ${form.state}, ${form.country}, ${form.pincode}`,
          city: String(form.city).toLowerCase(),
          state: form.state,
          country: form.country,
          pincode: form.pincode,
          coordinates: { lat: Number(form.lat), lang: Number(form.lang) },
        },
        lat: Number(form.lat),
        lang: Number(form.lang),
      });
      toast.success('Event updated');
      onSaved();
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-3xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-white font-semibold">Edit Event</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-4 space-y-4 max-h-[70vh] overflow-auto">
          <div>
            <label className={labelClass}>Title</label>
            <input name="title" value={form.title || ''} onChange={handleChange} className={inputClass} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Date</label>
              <input name="date" type="date" value={form.date?.slice(0,10) || ''} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Time</label>
              <input name="time" value={form.time || ''} onChange={handleChange} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Venue ID</label>
              <input name="venue" value={form.venue || ''} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Venue Name</label>
              <input name="venueName" value={form.venueName || ''} onChange={handleChange} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Capacity</label>
              <input name="capacity" type="number" value={form.capacity ?? ''} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Ticket Price (₹)</label>
              <input name="ticketPrice" type="number" value={form.ticketPrice ?? ''} onChange={handleChange} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Map Location Link</label>
            <input name="mapLocationLink" value={form.mapLocationLink || ''} onChange={handleChange} className={inputClass} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>City</label>
              <input name="city" value={form.city || ''} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>State</label>
              <input name="state" value={form.state || ''} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Country</label>
              <input name="country" value={form.country || ''} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Pincode</label>
              <input name="pincode" value={form.pincode || ''} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Latitude</label>
              <input name="lat" value={form.lat ?? ''} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Longitude</label>
              <input name="lang" value={form.lang ?? ''} onChange={handleChange} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Images</label>
            {(form.images || []).map((v: string, i: number) => (
              <input key={i} value={v} onChange={(e) => handleArrayChange('images', i, e.target.value)} className={`${inputClass} mt-2`} />
            ))}
            <button onClick={() => addArrayItem('images')} type="button" className="mt-2 bg-gray-700 text-white px-3 py-2 rounded-lg hover:bg-gray-600">Add Image</button>
          </div>
          <div>
            <label className={labelClass}>Tags</label>
            {(form.tags || []).map((v: string, i: number) => (
              <input key={i} value={v} onChange={(e) => handleArrayChange('tags', i, e.target.value)} className={`${inputClass} mt-2`} />
            ))}
            <button onClick={() => addArrayItem('tags')} type="button" className="mt-2 bg-gray-700 text-white px-3 py-2 rounded-lg hover:bg-gray-600">Add Tag</button>
          </div>
        </div>
        <div className="p-4 border-t border-gray-700 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600">Cancel</button>
          <button disabled={!isValid || saving} onClick={save} className={`px-4 py-2 rounded-lg ${!isValid || saving ? 'bg-gray-600 text-gray-300' : 'bg-green-600 text-white hover:bg-green-700'}`}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </div>
    </div>
  );
};

export default EventEditModal;


