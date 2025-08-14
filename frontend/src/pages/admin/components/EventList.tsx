import React, { useEffect, useMemo, useState } from 'react';
import { Edit, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { eventService } from '../../../services/eventService';

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  venueName: string;
  category: string;
  archived?: boolean;
}

interface EventListProps {
  onEdit: (id: string) => void;
  refreshKey?: number;
}

const EventList: React.FC<EventListProps> = ({ onEdit, refreshKey }) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await eventService.getAllEvents({ limit: 50, sort: 'desc' });
      const items: EventItem[] = (res.events || []).map((e: any) => ({
        id: e.id,
        title: e.title,
        date: e.date,
        time: e.time,
        venueName: e.venueName,
        category: e.category,
        archived: e.archived,
      }));
      setEvents(items);
    } catch (err: any) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-gray-300">
        Loading events...
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl">
      <div className="p-6 border-b border-gray-700 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">All Events</h3>
        <button onClick={load} className="bg-gray-700 text-white px-3 py-2 rounded-lg hover:bg-gray-600 inline-flex items-center gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Venue</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {events.map((ev) => (
              <tr key={ev.id} className="hover:bg-gray-700/50">
                <td className="px-6 py-4 text-sm text-gray-200">{ev.title}</td>
                <td className="px-6 py-4 text-sm text-gray-300">{new Date(ev.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm text-gray-300">{ev.time}</td>
                <td className="px-6 py-4 text-sm text-gray-300">{ev.venueName}</td>
                <td className="px-6 py-4 text-sm text-gray-300">{ev.category}</td>
                <td className="px-6 py-4">
                  <button onClick={() => onEdit(ev.id)} className="p-1 text-green-400 hover:text-green-300">
                    <Edit className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">No events found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventList;


