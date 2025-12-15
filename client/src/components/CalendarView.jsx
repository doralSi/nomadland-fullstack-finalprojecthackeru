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

// Day View Cards Component
const DayViewCards = ({ events, date, onEventClick }) => {
  const dayEvents = events.filter(event => {
    const eventDate = new Date(event.start);
    return eventDate.toDateString() === date.toDateString();
  }).sort((a, b) => a.start - b.start);

  if (dayEvents.length === 0) {
    return (
      <div className="day-view-empty">
        <span className="material-symbols-outlined">event_busy</span>
        <h3>No events scheduled for this day</h3>
        <p>Check out other days or add a new event!</p>
      </div>
    );
  }

  return (
    <div className="day-view-cards">
      <div className="day-view-header">
        <h2>
          <span className="material-symbols-outlined">wb_sunny</span>
          What's happening on {format(date, 'EEEE, MMMM d')}?
        </h2>
        <p className="day-subtitle">{dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''} scheduled</p>
      </div>
      
      <div className="events-feed">
        {dayEvents.map((event) => {
          const eventResource = event.resource || {};
          
          // Handle location display - only show text locations, not coordinates
          let locationText = '';
          if (eventResource.locationName) {
            locationText = eventResource.locationName;
          } else if (eventResource.venue) {
            locationText = eventResource.venue;
          } else if (typeof eventResource.location === 'string') {
            locationText = eventResource.location;
          }
          // Don't show numeric coordinates
          
          return (
            <div 
              key={event.id} 
              className="event-card"
              onClick={() => onEventClick(event)}
            >
              {eventResource.imageUrl && (
                <div className="event-card-image">
                  <img src={eventResource.imageUrl} alt={event.title} />
                  <div className="event-card-time-badge">
                    <span className="material-symbols-outlined">schedule</span>
                    {format(event.start, 'HH:mm')}
                  </div>
                </div>
              )}
              
              <div className="event-card-content">
                <div className="event-card-header">
                  <h3>{event.title}</h3>
                  {!event.allDay && (
                    <span className="event-duration">
                      {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
                    </span>
                  )}
                </div>
                
                {locationText && (
                  <div className="event-location">
                    <span className="material-symbols-outlined">location_on</span>
                    <span>{locationText}</span>
                  </div>
                )}
                
                {eventResource.description && (
                  <p className="event-description">
                    {eventResource.description.length > 150 
                      ? eventResource.description.substring(0, 150) + '...'
                      : eventResource.description
                    }
                  </p>
                )}
                
                <div className="event-card-footer">
                  {eventResource.category && (
                    <span className="event-category">
                      {eventResource.category}
                    </span>
                  )}
                  <button className="event-details-btn">
                    View Details
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CalendarView = ({ events = [], region, onEventClick, onAddEvent }) => {
  const [view, setView] = useState('day'); // 'month', 'week', 'day'
  const [date, setDate] = useState(new Date());

  // Transform events to calendar format
  const calendarEvents = useMemo(() => {
    return events.map(event => {
      const startDate = new Date(event.date || event.startDate);
      let endDate = new Date(event.endDate || event.date || event.startDate);
      
      // If event has time and duration, calculate end time
      if (event.time && event.duration && !event.isAllDay) {
        const [hours, minutes] = event.time.split(':').map(Number);
        startDate.setHours(hours, minutes || 0, 0, 0);
        
        endDate = new Date(startDate);
        endDate.setHours(startDate.getHours() + event.duration);
      }
      
      return {
        id: event._id,
        title: event.title,
        start: startDate,
        end: endDate,
        allDay: event.isAllDay || false,
        resource: event, // Keep original event data
      };
    });
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
        {view === 'day' ? (
          <DayViewCards 
            events={calendarEvents}
            date={date}
            onEventClick={handleSelectEvent}
          />
        ) : (
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
            toolbar={false}
            step={60}
            timeslots={1}
          />
        )}
      </div>
    </div>
  );
};

export default CalendarView;
