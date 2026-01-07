import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRegion } from "../context/RegionContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import PointSidePanel from "../components/PointSidePanel";
import AddPointModal from "../components/AddPointModal";
import EventDetailsModal from "../components/EventDetailsModal";
import PointsTable from "../components/admin/PointsTable";
import EventsTable from "../components/admin/EventsTable";
import Pagination from "../components/admin/Pagination";
import { getPoints, getEvents, deletePoint as deletePointByMapRanger, deleteEvent as deleteEventByMapRanger } from "../api/mapRanger";
import { CATEGORIES } from "../constants/categories";
import { useConfirm } from '../hooks/useConfirm';
import { useAlert } from '../hooks/useAlert';
import { toast } from 'react-toastify';
import ConfirmDialog from '../components/ConfirmDialog';
import AlertDialog from '../components/AlertDialog';
import "../styles/AdminDashboard.css";

const MapRangerPanel = () => {
  const { user } = useAuth();
  const { regions } = useRegion();
  const navigate = useNavigate();
  
  const confirmDialog = useConfirm();
  const alertDialog = useAlert();
  
  // Selected region
  const [selectedRegion, setSelectedRegion] = useState("");
  const [availableRegions, setAvailableRegions] = useState([]);
  
  // Stats
  const [stats, setStats] = useState(null);
  
  // Active tab
  const [activeTab, setActiveTab] = useState("points");
  
  // Points tab
  const [points, setPoints] = useState([]);
  const [pointsPage, setPointsPage] = useState(1);
  const [pointsTotalPages, setPointsTotalPages] = useState(1);
  const [pointsSearch, setPointsSearch] = useState("");
  const [pointsCategoryFilter, setPointsCategoryFilter] = useState("");
  const [pointsStatusFilter, setPointsStatusFilter] = useState("");
  const [selectedPointForView, setSelectedPointForView] = useState(null);
  const [editingPoint, setEditingPoint] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Events tab
  const [events, setEvents] = useState([]);
  const [eventsPage, setEventsPage] = useState(1);
  const [eventsTotalPages, setEventsTotalPages] = useState(1);
  const [eventsSearch, setEventsSearch] = useState("");
  const [eventsStartDate, setEventsStartDate] = useState("");
  const [eventsEndDate, setEventsEndDate] = useState("");
  const [selectedEventForView, setSelectedEventForView] = useState(null);
  
  const [loading, setLoading] = useState(false);

  // Check if user is map ranger or admin
  useEffect(() => {
    if (!user || (user.role !== "mapRanger" && user.role !== "admin")) {
      navigate("/");
    }
  }, [user, navigate]);

  // Load user's regions
  useEffect(() => {
    if (user) {
      // If admin, show all regions. If mapRanger, show only managed regions
      if (user.role === "admin") {
        setAvailableRegions(regions);
        if (regions.length > 0 && !selectedRegion) {
          setSelectedRegion(regions[0].slug);
        }
      } else if (user.rangerRegions && user.rangerRegions.length > 0) {
        const userRegions = regions.filter(r => user.rangerRegions.includes(r.slug));
        setAvailableRegions(userRegions);
        if (userRegions.length > 0 && !selectedRegion) {
          setSelectedRegion(userRegions[0].slug);
        }
      }
    }
  }, [user, regions, selectedRegion]);

  // Load stats when region changes
  useEffect(() => {
    if (selectedRegion) {
      loadStats();
    }
  }, [selectedRegion]);

  // Load data based on active tab
  useEffect(() => {
    if (selectedRegion) {
      if (activeTab === "points") {
        loadPoints();
      } else if (activeTab === "events") {
        loadEvents();
      }
    }
  }, [
    activeTab,
    selectedRegion,
    pointsPage,
    pointsSearch,
    pointsCategoryFilter,
    pointsStatusFilter,
    eventsPage,
    eventsSearch,
    eventsStartDate,
    eventsEndDate,
  ]);

  const handleEditPoint = (point) => {
    setEditingPoint(point);
    setShowEditModal(true);
    setSelectedPointForView(null);
  };

  const handleCloseEditModal = () => {
    setEditingPoint(null);
    setShowEditModal(false);
  };

  const handlePointUpdated = () => {
    setEditingPoint(null);
    setShowEditModal(false);
    loadPoints();
  };

  const loadStats = async () => {
    try {
      const response = await axiosInstance.get(`/map-ranger/stats/${selectedRegion}`);
      setStats(response.data);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadPoints = async () => {
    setLoading(true);
    try {
      const data = await getPoints({
        page: pointsPage,
        search: pointsSearch,
        region: selectedRegion,
        category: pointsCategoryFilter,
        status: pointsStatusFilter,
      });
      setPoints(data.points);
      setPointsTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error loading points:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    setLoading(true);
    try {
      // Convert region slug to region ID
      const selectedRegionObj = regions.find(r => r.slug === selectedRegion);
      const regionId = selectedRegionObj ? selectedRegionObj._id : "";
      
      const data = await getEvents({
        page: eventsPage,
        search: eventsSearch,
        region: regionId,
        startDate: eventsStartDate,
        endDate: eventsEndDate,
      });
      setEvents(data.events);
      setEventsTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadData = () => {
    if (activeTab === "points") {
      loadPoints();
    } else if (activeTab === "events") {
      loadEvents();
    }
    loadStats();
  };

  const handlePointsSearchChange = (e) => {
    setPointsSearch(e.target.value);
    setPointsPage(1);
  };

  const handleEventsSearchChange = (e) => {
    setEventsSearch(e.target.value);
    setEventsPage(1);
  };

  const handleTogglePrivacy = async (pointId, isPrivate) => {
    const confirmed = await confirmDialog.confirm({
      title: 'Toggle Privacy',
      message: `Are you sure you want to make this point ${isPrivate ? "public" : "private"}?`,
      confirmText: 'Confirm',
      cancelText: 'Cancel'
    });

    if (!confirmed) return;

    try {
      await axiosInstance.patch(`/points/${pointId}/toggle-privacy`);
      toast.success(`Point ${isPrivate ? "made public" : "made private"} successfully`);
      loadPoints();
    } catch (error) {
      console.error("Error toggling privacy:", error);
      toast.error(error.response?.data?.message || 'Failed to update point');
    }
  };

  const handleDeletePoint = async (pointId) => {
    const confirmed = await confirmDialog.confirm({
      title: 'Delete Point',
      message: "Are you sure you want to delete this point?",
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });

    if (!confirmed) return;

    try {
      await deletePointByMapRanger(pointId);
      toast.success('Point deleted successfully');
      loadPoints();
    } catch (error) {
      console.error("Error deleting point:", error);
      toast.error(error.response?.data?.message || 'Failed to delete point');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const confirmed = await confirmDialog.confirm({
      title: 'Delete Event',
      message: "Are you sure you want to delete this event?",
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });

    if (!confirmed) return;

    try {
      await deleteEventByMapRanger(eventId);
      toast.success('Event deleted successfully');
      loadEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error(error.response?.data?.message || 'Failed to delete event');
    }
  };

  if (!user || (user.role !== "mapRanger" && user.role !== "admin")) {
    return null;
  }

  return (
    <div className="admin-dashboard">
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={confirmDialog.handleClose}
        onConfirm={confirmDialog.config.onConfirm}
        message={confirmDialog.config.message}
        title={confirmDialog.config.title}
        confirmText={confirmDialog.config.confirmText}
        cancelText={confirmDialog.config.cancelText}
      />
      
      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={alertDialog.handleClose}
        message={alertDialog.config.message}
        title={alertDialog.config.title}
        type={alertDialog.config.type}
        confirmText={alertDialog.config.confirmText}
      />
      
      <div className="dashboard-header">
        <h1>Map Ranger Panel</h1>
        
        {/* Region Selector */}
        <div className="region-selector" style={{ marginTop: "1rem", marginBottom: "2rem" }}>
          <label htmlFor="region-select" style={{ marginRight: "0.5rem", fontWeight: "500" }}>
            Select Region: 
          </label>
          <select
            id="region-select"
            value={selectedRegion}
            onChange={(e) => {
              setSelectedRegion(e.target.value);
              setPointsPage(1);
              setEventsPage(1);
            }}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              border: "1px solid #ddd",
              fontSize: "1rem",
              minWidth: "200px"
            }}
          >
            {availableRegions.map((region) => (
              <option key={region.slug} value={region.slug}>
                {region.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dashboard Stats */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Points</h3>
            <p className="stat-number">{stats.pointsCount || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Events</h3>
            <p className="stat-number">{stats.eventsCount || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Reviews</h3>
            <p className="stat-number">{stats.reviewsCount || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Rangers</h3>
            <p className="stat-number">{stats.rangersCount || 0}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button
          onClick={() => setActiveTab("points")}
          className={`tab-button ${activeTab === "points" ? "active" : ""}`}
        >
          Points
        </button>
        <button
          onClick={() => setActiveTab("events")}
          className={`tab-button ${activeTab === "events" ? "active" : ""}`}
        >
          Events
        </button>
      </div>

      {/* Points Tab */}
      {activeTab === "points" && (
        <div className="tab-content">
          <div className="filters-bar">
            <input
              type="text"
              placeholder="Search by point name..."
              value={pointsSearch}
              onChange={handlePointsSearchChange}
              className="search-input"
            />
            <select
              value={pointsCategoryFilter}
              onChange={(e) => {
                setPointsCategoryFilter(e.target.value);
                setPointsPage(1);
              }}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.label}
                </option>
              ))}
            </select>
            <select
              value={pointsStatusFilter}
              onChange={(e) => {
                setPointsStatusFilter(e.target.value);
                setPointsPage(1);
              }}
              className="filter-select"
            >
              <option value="">All Types</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <>
              <PointsTable
                points={points}
                onTogglePrivacy={handleTogglePrivacy}
                onView={setSelectedPointForView}
                onDelete={handleDeletePoint}
                showRegion={false}
              />

              <Pagination
                currentPage={pointsPage}
                totalPages={pointsTotalPages}
                onPageChange={setPointsPage}
              />
            </>
          )}
        </div>
      )}

      {/* Events Tab */}
      {activeTab === "events" && (
        <div className="tab-content">
          <div className="filters-bar">
            <input
              type="text"
              placeholder="Search by event name..."
              value={eventsSearch}
              onChange={handleEventsSearchChange}
              className="search-input"
            />
            <input
              type="date"
              value={eventsStartDate}
              onChange={(e) => {
                setEventsStartDate(e.target.value);
                setEventsPage(1);
              }}
              className="filter-select"
              placeholder="Start Date"
            />
            <input
              type="date"
              value={eventsEndDate}
              onChange={(e) => {
                setEventsEndDate(e.target.value);
                setEventsPage(1);
              }}
              className="filter-select"
              placeholder="End Date"
            />
          </div>

          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <>
              <EventsTable
                events={events}
                onView={setSelectedEventForView}
                onDelete={handleDeleteEvent}
                showRegion={false}
              />

              <Pagination
                currentPage={eventsPage}
                totalPages={eventsTotalPages}
                onPageChange={setEventsPage}
              />
            </>
          )}
        </div>
      )}

      {/* Point View Modal */}
      {selectedPointForView && (
        <div className="modal-overlay" onClick={() => setSelectedPointForView(null)}>
          <div className="point-modal-container" onClick={(e) => e.stopPropagation()}>
            <PointSidePanel
              point={selectedPointForView}
              onClose={() => setSelectedPointForView(null)}
              onToggleFavorite={() => {}}
              isFavorite={false}
              onEdit={handleEditPoint}
            />
          </div>
        </div>
      )}

      {/* Event View Modal */}
      {selectedEventForView && (
        <EventDetailsModal
          event={selectedEventForView}
          region={selectedEventForView.region}
          onClose={() => setSelectedEventForView(null)}
          onShowOnMap={() => {}}
          onEventDeleted={() => {
            setSelectedEventForView(null);
            loadData();
          }}
        />
      )}

      {/* Edit Point Modal */}
      {showEditModal && editingPoint && (
        <AddPointModal
          location={{ lat: editingPoint.lat, lng: editingPoint.lng }}
          regionSlug={editingPoint.regionSlug}
          onClose={handleCloseEditModal}
          onSuccess={handlePointUpdated}
          editMode={true}
          pointData={editingPoint}
        />
      )}
    </div>
  );
};

export default MapRangerPanel;
