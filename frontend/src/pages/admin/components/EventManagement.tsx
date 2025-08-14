import React, { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { eventService } from '../../../services/eventService';
import { AdminComponentProps } from '../types/adminTypes';
import EventList from './EventList';
import EventEditModal from './EventEditModal';

type Category = 'All' | 'Gaming' | 'Technology' | 'Music' | 'Business' | 'Fitness' | 'Art';

interface FormState {
  title: string;
  description: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  venue: string;
  venueName: string;
  capacity: number | '';
  ticketPrice: number | '';
  category: Category;
  featured: boolean;
  organizer: string;
  organizerName: string;
  mapLocationLink: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  lat: string; // keep as string for input; coerce on submit
  lang: string; // keep as string for input; coerce on submit
  images: string[];
  tags: string[];
}

const defaultState: FormState = {
  title: '',
  description: '',
  date: '',
  time: '',
  venue: '',
  venueName: '',
  capacity: '',
  ticketPrice: '',
  category: 'All',
  featured: true,
  organizer: '',
  organizerName: '',
  mapLocationLink: '',
  city: '',
  state: '',
  country: '',
  pincode: '',
  lat: '',
  lang: '',
  images: [],
  tags: [],
};

const inputClass = 'bg-gray-700 text-white placeholder-gray-400 w-full px-3 py-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent';
const labelClass = 'block text-sm font-medium text-gray-300 mb-1';
const sectionClass = 'bg-gray-800 border border-gray-700 rounded-xl p-6';
const chipClass = 'inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-700 border border-gray-600 text-gray-200';

const EventManagement: React.FC<AdminComponentProps> = () => {
  const [form, setForm] = useState<FormState>(defaultState);
  const [imageInput, setImageInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  const [editId, setEditId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editInitial, setEditInitial] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const openEdit = async (id: string) => {
    try {
      const data = await eventService.getEventById(id);
      setEditId(id);
      setEditInitial({
        ...data,
        date: data.date,
        lat: data.location?.coordinates?.lat ?? '',
        lang: data.location?.coordinates?.lang ?? '',
        city: data.location?.city ?? '',
        state: data.location?.state ?? '',
        country: data.location?.country ?? '',
        pincode: data.location?.pincode ?? '',
      });
      setEditOpen(true);
    } catch (e) {
      toast.error('Failed to open editor');
    }
  };

  const categories: Category[] = ['All', 'Gaming', 'Technology', 'Music', 'Business', 'Fitness', 'Art'];

  const missingFields = useMemo(() => {
    const missing: string[] = [];
    if (form.title.trim() === '') missing.push('Title');
    if (form.date === '') missing.push('Date');
    if (form.time === '') missing.push('Time');
    if (form.venue.trim() === '') missing.push('Venue ID');
    if (form.venueName.trim() === '') missing.push('Venue Name');
    if (!(typeof form.capacity === 'number' && form.capacity > 0)) missing.push('Capacity (> 0)');
    if (!(typeof form.ticketPrice === 'number' && form.ticketPrice > 0)) missing.push('Ticket Price (> 0)');
    if (form.mapLocationLink.trim() === '') missing.push('Map Location Link');
    if (form.city.trim() === '') missing.push('City');
    if (form.state.trim() === '') missing.push('State');
    if (form.country.trim() === '') missing.push('Country');
    if (form.pincode.trim() === '') missing.push('Pincode');
    const latNum = Number(form.lat);
    const langNum = Number(form.lang);
    if (!(form.lat.trim() !== '' && !isNaN(latNum) && latNum !== 0)) missing.push('Latitude (non-zero)');
    if (!(form.lang.trim() !== '' && !isNaN(langNum) && langNum !== 0)) missing.push('Longitude (non-zero)');
    if (form.images.length === 0) missing.push('At least 1 Image');
    if (form.tags.length === 0) missing.push('At least 1 Tag');
    return missing;
  }, [form]);

  const isValid = useMemo(() => missingFields.length === 0, [missingFields]);

  const payloadPreview = useMemo(() => {
    const latNum = Number(form.lat);
    const langNum = Number(form.lang);
    return {
      title: form.title,
      description: form.description,
      date: form.date ? new Date(form.date).toISOString() : '',
      time: form.time,
      location: {
        address: `${form.city}, ${form.state}, ${form.country}, ${form.pincode}`,
        city: form.city.toLowerCase(),
        state: form.state,
        country: form.country,
        pincode: form.pincode,
        coordinates: { lat: isNaN(latNum) ? undefined : latNum, lang: isNaN(langNum) ? undefined : langNum },
      },
      venue: form.venue,
      venueName: form.venueName,
      capacity: typeof form.capacity === 'number' ? form.capacity : undefined,
      ticketPrice: typeof form.ticketPrice === 'number' ? form.ticketPrice : undefined,
      category: form.category,
      images: form.images,
      featured: form.featured,
      tags: form.tags,
      organizer: form.organizer || undefined,
      organizerName: form.organizerName || undefined,
      mapLocationLink: form.mapLocationLink,
      archived: false,
      // Additionally sent in body for backend derivation
      city: form.city,
      state: form.state,
      country: form.country,
      pincode: form.pincode,
      lat: isNaN(latNum) ? undefined : latNum,
      lang: isNaN(langNum) ? undefined : langNum,
    };
  }, [form]);

  const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    if (name === 'capacity' || name === 'ticketPrice') {
      const numeric = value === '' ? '' : Number(value);
      setForm((prev) => ({ ...prev, [name]: numeric }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const addToList = (kind: 'images' | 'tags') => {
    const value = kind === 'images' ? imageInput.trim() : tagInput.trim();
    if (!value) return;
    setForm((prev) => ({ ...prev, [kind]: Array.from(new Set([...(prev[kind] as string[]), value])) }));
    kind === 'images' ? setImageInput('') : setTagInput('');
  };

  const removeFromList = (kind: 'images' | 'tags', item: string) => {
    setForm((prev) => ({ ...prev, [kind]: (prev[kind] as string[]).filter((v) => v !== item) }));
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    try {
      setSubmitting(true);
      const { location, ...rest } = payloadPreview as any;
      const responseId = await eventService.createEvent({
        ...rest,
        date: form.date,
        time: form.time,
        location: {
          address: location.address,
          city: form.city,
          state: form.state,
          country: form.country,
          pincode: form.pincode,
          coordinates: {
            lat: Number(form.lat),
            lang: Number(form.lang),
          },
        },
        featured: true,
        city: form.city,
        state: form.state,
        country: form.country,
        pincode: form.pincode,
        lat: Number(form.lat),
        lang: Number(form.lang),
      } as any);
      toast('Note: featured is required by API and was sent as ON', { icon: 'ℹ️' });
      toast.success(`Event created (id: ${responseId ?? 'n/a'})`);
      if (responseId) {
        try {
          const created = await eventService.getEventById(responseId);
          // eslint-disable-next-line no-console
          console.log('Created event verification:', created);
        } catch (_e) {
          toast('Created event not immediately visible via GET by id', { icon: '⚠️' });
        }
      }
      setForm(defaultState);
      setActiveTab('list');
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Failed to create event';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className={sectionClass}>
        <div className="mb-4 flex gap-2">
          <button onClick={() => setActiveTab('create')} className={`px-3 py-2 rounded-lg text-sm ${activeTab === 'create' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>Create Event</button>
          <button onClick={() => setActiveTab('list')} className={`px-3 py-2 rounded-lg text-sm ${activeTab === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>All Events</button>
        </div>

        {activeTab === 'create' && (
        <>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Create Event</h3>
            <p className="text-sm text-gray-400">Fill out the details to create a new event</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Title</label>
              <input name="title" value={form.title} onChange={handleBasicChange} placeholder="e.g. Tech Meetup 2025" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select name="category" value={form.category} onChange={handleBasicChange} className={inputClass}>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea name="description" value={form.description} onChange={handleBasicChange} placeholder="Brief description" className={`${inputClass} min-h-[96px]`} />
            </div>
          </div>

          {/* Schedule & Venue */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Date</label>
              <input type="date" name="date" value={form.date} onChange={handleBasicChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Time</label>
              <input type="time" name="time" value={form.time} onChange={handleBasicChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Venue ID</label>
              <input name="venue" value={form.venue} onChange={handleBasicChange} placeholder="Venue identifier" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Venue Name</label>
              <input name="venueName" value={form.venueName} onChange={handleBasicChange} placeholder="Display name" className={inputClass} />
            </div>
          </div>

          {/* Capacity & Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Capacity</label>
              <input type="number" min={1} name="capacity" value={form.capacity} onChange={handleBasicChange} placeholder="e.g. 100" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Ticket Price (₹)</label>
              <input type="number" min={0} name="ticketPrice" value={form.ticketPrice} onChange={handleBasicChange} placeholder="e.g. 499" className={inputClass} />
            </div>
          </div>

          {/* Organizer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Organizer ID</label>
              <input name="organizer" value={form.organizer} onChange={handleBasicChange} placeholder="Optional" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Organizer Name</label>
              <input name="organizerName" value={form.organizerName} onChange={handleBasicChange} placeholder="Optional" className={inputClass} />
            </div>
          </div>

          {/* Location */}
          <div>
            <h4 className="text-md font-semibold text-white mb-3">Location</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>City</label>
                <input name="city" value={form.city} onChange={handleBasicChange} placeholder="City" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>State</label>
                <input name="state" value={form.state} onChange={handleBasicChange} placeholder="State" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Country</label>
                <input name="country" value={form.country} onChange={handleBasicChange} placeholder="Country" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Pincode</label>
                <input name="pincode" value={form.pincode} onChange={handleBasicChange} placeholder="Pincode" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Latitude</label>
                <input name="lat" value={form.lat} onChange={handleBasicChange} placeholder="e.g. 12.9716" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Longitude</label>
                <input name="lang" value={form.lang} onChange={handleBasicChange} placeholder="e.g. 77.5946" className={inputClass} />
              </div>
              <div className="lg:col-span-3">
                <label className={labelClass}>Map Location Link</label>
                <input name="mapLocationLink" value={form.mapLocationLink} onChange={handleBasicChange} placeholder="https://maps.google.com/..." className={inputClass} />
              </div>
            </div>
          </div>

          {/* Images & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Images</label>
              <div className="flex gap-2">
                <input value={imageInput} onChange={(e) => setImageInput(e.target.value)} placeholder="Image URL" className={inputClass} />
                <button type="button" onClick={() => addToList('images')} className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-1">
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {form.images.map((img) => (
                  <span key={img} className={chipClass}>
                    <span className="truncate max-w-[200px]">{img}</span>
                    <button type="button" className="ml-2 hover:text-red-300" onClick={() => removeFromList('images', img)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Tags</label>
              <div className="flex gap-2">
                <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="e.g. meetup, dev" className={inputClass} />
                <button type="button" onClick={() => addToList('tags')} className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-1">
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {form.tags.map((tag) => (
                  <span key={tag} className={chipClass}>
                    <span>#{tag}</span>
                    <button type="button" className="ml-2 hover:text-red-300" onClick={() => removeFromList('tags', tag)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Featured */}
          <div className="flex items-center gap-2">
            <input id="featured" type="checkbox" name="featured" checked={true} disabled className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500" />
            <label htmlFor="featured" className="text-sm text-gray-300">Featured (required by API)</label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <button type="button" onClick={() => setForm(defaultState)} className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">Reset</button>
            <button type="submit" disabled={!isValid || submitting} className={`px-4 py-2 rounded-lg transition-colors ${isValid && !submitting ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-600 text-gray-300 cursor-not-allowed'}`}>{submitting ? 'Creating...' : 'Create Event'}</button>
          </div>

          {!isValid && (
            <div className="mt-3 text-sm text-red-300">
              Missing required: {missingFields.join(', ')}
            </div>
          )}
        </form>
        </>
        )}
        {activeTab === 'list' && (
          <EventList onEdit={(id) => { openEdit(id); }} refreshKey={refreshKey} />
        )}
      </div>

      <EventEditModal
        open={editOpen}
        eventId={editId}
        onClose={() => setEditOpen(false)}
        initial={editInitial}
        onSaved={() => { /* no-op; list component has its own refresh */ }}
      />

      {/* Payload Preview */}
      <div className={sectionClass}>
        <h4 className="text-md font-semibold text-white mb-3">Payload Preview</h4>
        <pre className="bg-gray-900 text-gray-200 p-4 rounded-lg overflow-auto text-xs border border-gray-700">
          {JSON.stringify(payloadPreview, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default EventManagement;


