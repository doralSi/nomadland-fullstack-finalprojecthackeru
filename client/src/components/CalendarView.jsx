import React, { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarView.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CalendarView = ({ events = [], region, onEventClick, onAddEvent }) => {
  const [view, setView] = useState('week'); // 'month', 'week', 'day'
  const [date, setDate] = useState(new Date());

  // Transform events to calendar format
  const calendarEvents = useMemo(() => {
    return events.map(event => ({
      id: event._id,
      title: event.title,
      start: new Date(event.date || event.startDate),
      end: new Date(event.endDate || event.date || event.startDate),
      resource: event, // Keep original event data
    }));
  }, [events]);

  const handleSelectEvent = (event) => {
    if (onEventClick) {
      onEventClick(event.resource);
    }
  };

  const handleSelectSlot = (slotInfo) => {
    if (onAddEvent) {
      onAddEvent(slotInfo);
    }
  };

  // Custom event style
  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: '#667eea',
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '13px',
        fontWeight: '500',
      }
    };
  };

  return (
    <div className="calendar-view-container">
      <div className="calendar-header">
        <div className="calendar-title-section">
          <h2>
            <span className="material-symbols-outlined">event</span>
            {region?.name ? `Happening in ${region.name}` : 'Upcoming Events'}
          </h2>
          <p className="calendar-subtitle">
            {format(date, 'MMMM yyyy')}
          </p>
        </div>

        <div className="calendar-controls">
          <div className="view-mode-selector">
            <button 
              className={`view-mode-btn ${view === 'day' ? 'active' : ''}`}
              onClick={() => setView('day')}
              title="Day View"
            >
              <span className="material-symbols-outlined">view_day</span>
              <span className="view-label">Day</span>
            </button>
            <button 
              className={`view-mode-btn ${view === 'week' ? 'active' : ''}`}
              onClick={() => setView('week')}
              title="Week View"
            >
              <span className="material-symbols-outlined">view_week</span>
              <span className="view-label">Week</span>
            </button>
            <button 
              className={`view-mode-btn ${view === 'month' ? 'active' : ''}`}
              onClick={() => setView('month')}
              title="Month View"
            >
              <span className="material-symbols-outlined">calendar_month</span>
              <span className="view-label">Month</span>
            </button>
          </div>

          <button 
            className="add-event-fab"
            onClick={() => onAddEvent && onAddEvent()}
            title="Add Event"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
      </div>

      <div className="calendar-content">
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          eventPropGetter={eventStyleGetter}
          popup
          views={['month', 'week', 'day']}
          messages={{
            next: 'Next',
            previous: 'Previous',
            today: 'Today',
            month: 'Month',
            week: 'Week',
            day: 'Day',
          }}
        />
      </div>
    </div>
  );
};

export default CalendarView;
