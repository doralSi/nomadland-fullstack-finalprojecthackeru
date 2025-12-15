import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getAdminStats,
  getUsers,
  freezeUser,
  unfreezeUser,
  deleteUser,
  promoteToMapRanger,
  demoteFromMapRanger,
  getAdminPoints,
  deletePoint,
  getAdminEvents,
  deleteEvent,
} from "../api/admin";
import { getAllRegions } from "../api/regions";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Stats
  const [stats, setStats] = useState(null);
  
  // Active tab
  const [activeTab, setActiveTab] = useState("users");
  
  // Users tab
  const [users, setUsers] = useState([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [usersSearch, setUsersSearch] = useState("");
  const [usersRoleFilter, setUsersRoleFilter] = useState("");
  const [usersStatusFilter, setUsersStatusFilter] = useState("");
  
  // Points tab
  const [points, setPoints] = useState([]);
  const [pointsPage, setPointsPage] = useState(1);
  const [pointsTotalPages, setPointsTotalPages] = useState(1);
  const [pointsSearch, setPointsSearch] = useState("");
  const [pointsRegionFilter, setPointsRegionFilter] = useState("");
  const [pointsCategoryFilter, setPointsCategoryFilter] = useState("");
  const [pointsStatusFilter, setPointsStatusFilter] = useState("");
  
  // Events tab
  const [events, setEvents] = useState([]);
  const [eventsPage, setEventsPage] = useState(1);
  const [eventsTotalPages, setEventsTotalPages] = useState(1);
  const [eventsSearch, setEventsSearch] = useState("");
  const [eventsRegionFilter, setEventsRegionFilter] = useState("");
  const [eventsStartDate, setEventsStartDate] = useState("");
  const [eventsEndDate, setEventsEndDate] = useState("");
  
  // Regions for filters
  const [regions, setRegions] = useState([]);
  
  const [loading, setLoading] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  // Load stats
  useEffect(() => {
    loadStats();
  }, []);

  // Load regions for filters
  useEffect(() => {
    const loadRegions = async () => {
      try {
        const data = await getAllRegions();
        setRegions(data);
      } catch (error) {
        console.error("Error loading regions:", error);
      }
    };
    loadRegions();
  }, []);

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === "users") {
      loadUsers();
    } else if (activeTab === "points") {
      loadPoints();
    } else if (activeTab === "events") {
      loadEvents();
    }
  }, [
    activeTab,
    usersPage,
    usersSearch,
    usersRoleFilter,
    usersStatusFilter,
    pointsPage,
    pointsSearch,
    pointsRegionFilter,
    pointsCategoryFilter,
    pointsStatusFilter,
    eventsPage,
    eventsSearch,
    eventsRegionFilter,
    eventsStartDate,
    eventsEndDate,
  ]);

  const loadStats = async () => {
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers({
        page: usersPage,
        search: usersSearch,
        role: usersRoleFilter,
        status: usersStatusFilter,
      });
      setUsers(data.users);
      setUsersTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPoints = async () => {
    setLoading(true);
    try {
      const data = await getAdminPoints({
        page: pointsPage,
        search: pointsSearch,
        region: pointsRegionFilter,
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
      const data = await getAdminEvents({
        page: eventsPage,
        search: eventsSearch,
        region: eventsRegionFilter,
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

  const handleFreezeUser = async (userId) => {
    if (window.confirm("האם אתה בטוח שברצונך להקפיא את המשתמש?")) {
      try {
        await freezeUser(userId);
        loadUsers();
        loadStats();
      } catch (error) {
        console.error("Error freezing user:", error);
        alert("שגיאה בהקפאת משתמש");
      }
    }
  };

  const handleUnfreezeUser = async (userId) => {
    try {
      await unfreezeUser(userId);
      loadUsers();
      loadStats();
    } catch (error) {
      console.error("Error unfreezing user:", error);
      alert("שגיאה בהפשרת משתמש");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק את המשתמש? פעולה זו אינה הפיכה!")) {
      try {
        await deleteUser(userId);
        loadUsers();
        loadStats();
      } catch (error) {
        console.error("Error deleting user:", error);
        alert(error.response?.data?.message || "שגיאה במחיקת משתמש");
      }
    }
  };

  const handlePromoteUser = async (userId) => {
    if (window.confirm("האם אתה בטוח שברצונך לקדם את המשתמש ל-Map Ranger?")) {
      try {
        await promoteToMapRanger(userId);
        loadUsers();
        loadStats();
      } catch (error) {
        console.error("Error promoting user:", error);
        alert("שגיאה בקידום משתמש");
      }
    }
  };

  const handleDemoteUser = async (userId) => {
    if (window.confirm("האם אתה בטוח שברצונך להוריד את המשתמש מ-Map Ranger?")) {
      try {
        await demoteFromMapRanger(userId);
        loadUsers();
        loadStats();
      } catch (error) {
        console.error("Error demoting user:", error);
        alert("שגיאה בהורדת משתמש");
      }
    }
  };

  const handleDeletePoint = async (pointId) => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק את הנקודה? פעולה זו אינה הפיכה!")) {
      try {
        await deletePoint(pointId);
        loadPoints();
        loadStats();
      } catch (error) {
        console.error("Error deleting point:", error);
        alert("שגיאה במחיקת נקודה");
      }
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק את האירוע? פעולה זו אינה הפיכה!")) {
      try {
        await deleteEvent(eventId);
        loadEvents();
        loadStats();
      } catch (error) {
        console.error("Error deleting event:", error);
        alert("שגיאה במחיקת אירוע");
      }
    }
  };

  const handleUsersSearchChange = (e) => {
    setUsersSearch(e.target.value);
    setUsersPage(1);
  };

  const handlePointsSearchChange = (e) => {
    setPointsSearch(e.target.value);
    setPointsPage(1);
  };

  const handleEventsSearchChange = (e) => {
    setEventsSearch(e.target.value);
    setEventsPage(1);
  };

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="admin-dashboard">
      <h1 className="admin-title">🛡️ Admin Dashboard</h1>

      {/* Stats Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>{stats.totalUsers}</h3>
              <p>Total Users</p>
              <small>{stats.newUsers} new (7 days)</small>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📍</div>
            <div className="stat-info">
              <h3>{stats.totalPoints}</h3>
              <p>Total Points</p>
              <small>{stats.pendingPoints} pending</small>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <h3>{stats.totalEvents}</h3>
              <p>Total Events</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-info">
              <h3>{stats.totalReviews}</h3>
              <p>Total Reviews</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🗺️</div>
            <div className="stat-info">
              <h3>{stats.mapRangers}</h3>
              <p>Map Rangers</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🛡️</div>
            <div className="stat-info">
              <h3>{stats.admins}</h3>
              <p>Admins</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          👥 משתמשים
        </button>
        <button
          className={`tab-button ${activeTab === "points" ? "active" : ""}`}
          onClick={() => setActiveTab("points")}
        >
          📍 תוכן
        </button>
        <button
          className={`tab-button ${activeTab === "events" ? "active" : ""}`}
          onClick={() => setActiveTab("events")}
        >
          📅 לוח אירועים
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="tab-content">
          <div className="filters-bar">
            <input
              type="text"
              placeholder="🔍 חיפוש לפי שם או אימייל..."
              value={usersSearch}
              onChange={handleUsersSearchChange}
              className="search-input"
            />
            <select
              value={usersRoleFilter}
              onChange={(e) => {
                setUsersRoleFilter(e.target.value);
                setUsersPage(1);
              }}
              className="filter-select"
            >
              <option value="">כל התפקידים</option>
              <option value="user">User</option>
              <option value="mapRanger">Map Ranger</option>
              <option value="admin">Admin</option>
            </select>
            <select
              value={usersStatusFilter}
              onChange={(e) => {
                setUsersStatusFilter(e.target.value);
                setUsersPage(1);
              }}
              className="filter-select"
            >
              <option value="">כל הסטטוסים</option>
              <option value="active">Active</option>
              <option value="frozen">Frozen</option>
            </select>
          </div>

          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>שם</th>
                      <th>אימייל</th>
                      <th>תפקיד</th>
                      <th>סטטוס</th>
                      <th>Points</th>
                      <th>Reviews</th>
                      <th>תאריך הצטרפות</th>
                      <th>פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`role-badge ${u.role}`}>
                            {u.role === "admin"
                              ? "🛡️ Admin"
                              : u.role === "mapRanger"
                              ? "🗺️ Ranger"
                              : "👤 User"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`status-badge ${
                              u.status === "frozen" ? "frozen" : "active"
                            }`}
                          >
                            {u.status === "frozen" ? "🧊 Frozen" : "✅ Active"}
                          </span>
                        </td>
                        <td>{u.pointsCount}</td>
                        <td>{u.reviewsCount}</td>
                        <td>{new Date(u.createdAt).toLocaleDateString("he-IL")}</td>
                        <td>
                          <div className="action-buttons">
                            {u.status === "active" ? (
                              <button
                                onClick={() => handleFreezeUser(u._id)}
                                className="btn-freeze"
                                disabled={u.role === "admin"}
                              >
                                🧊 הקפא
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUnfreezeUser(u._id)}
                                className="btn-unfreeze"
                              >
                                ✅ הפשר
                              </button>
                            )}
                            {u.role === "user" && (
                              <button
                                onClick={() => handlePromoteUser(u._id)}
                                className="btn-promote"
                              >
                                ⬆️ קדם
                              </button>
                            )}
                            {u.role === "mapRanger" && (
                              <button
                                onClick={() => handleDemoteUser(u._id)}
                                className="btn-demote"
                              >
                                ⬇️ הורד
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              className="btn-delete"
                              disabled={u.role === "admin"}
                            >
                              🗑️ מחק
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="pagination">
                <button
                  onClick={() => setUsersPage(usersPage - 1)}
                  disabled={usersPage === 1}
                  className="pagination-btn"
                >
                  ← הקודם
                </button>
                <span className="pagination-info">
                  עמוד {usersPage} מתוך {usersTotalPages}
                </span>
                <button
                  onClick={() => setUsersPage(usersPage + 1)}
                  disabled={usersPage >= usersTotalPages}
                  className="pagination-btn"
                >
                  הבא →
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Points Tab */}
      {activeTab === "points" && (
        <div className="tab-content">
          <div className="filters-bar">
            <input
              type="text"
              placeholder="🔍 חיפוש לפי שם נקודה..."
              value={pointsSearch}
              onChange={handlePointsSearchChange}
              className="search-input"
            />
            <select
              value={pointsRegionFilter}
              onChange={(e) => {
                setPointsRegionFilter(e.target.value);
                setPointsPage(1);
              }}
              className="filter-select"
            >
              <option value="">כל האזורים</option>
              {regions.map((region) => (
                <option key={region._id} value={region._id}>
                  {region.name}
                </option>
              ))}
            </select>
            <select
              value={pointsCategoryFilter}
              onChange={(e) => {
                setPointsCategoryFilter(e.target.value);
                setPointsPage(1);
              }}
              className="filter-select"
            >
              <option value="">כל הקטגוריות</option>
              <option value="camp">⛺ Camp</option>
              <option value="water">💧 Water</option>
              <option value="wifi">📶 WiFi</option>
              <option value="food">🍽️ Food</option>
              <option value="attraction">🎯 Attraction</option>
              <option value="warning">⚠️ Warning</option>
            </select>
            <select
              value={pointsStatusFilter}
              onChange={(e) => {
                setPointsStatusFilter(e.target.value);
                setPointsPage(1);
              }}
              className="filter-select"
            >
              <option value="">כל הסטטוסים</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>שם</th>
                      <th>קטגוריה</th>
                      <th>אזור</th>
                      <th>נוצר ע"י</th>
                      <th>סטטוס</th>
                      <th>תאריך</th>
                      <th>פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {points.map((point) => (
                      <tr key={point._id}>
                        <td>{point.name}</td>
                        <td>{point.category}</td>
                        <td>{point.region?.name || "N/A"}</td>
                        <td>{point.createdBy?.name || "Unknown"}</td>
                        <td>
                          <span
                            className={`status-badge ${
                              point.status === "approved" ? "active" : "pending"
                            }`}
                          >
                            {point.status}
                          </span>
                        </td>
                        <td>
                          {new Date(point.createdAt).toLocaleDateString("he-IL")}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() =>
                                navigate(`/points/${point._id}`)
                              }
                              className="btn-view"
                            >
                              👁️ צפה
                            </button>
                            <button
                              onClick={() => handleDeletePoint(point._id)}
                              className="btn-delete"
                            >
                              🗑️ מחק
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="pagination">
                <button
                  onClick={() => setPointsPage(pointsPage - 1)}
                  disabled={pointsPage === 1}
                  className="pagination-btn"
                >
                  ← הקודם
                </button>
                <span className="pagination-info">
                  עמוד {pointsPage} מתוך {pointsTotalPages}
                </span>
                <button
                  onClick={() => setPointsPage(pointsPage + 1)}
                  disabled={pointsPage >= pointsTotalPages}
                  className="pagination-btn"
                >
                  הבא →
                </button>
              </div>
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
              placeholder="🔍 חיפוש לפי שם אירוע..."
              value={eventsSearch}
              onChange={handleEventsSearchChange}
              className="search-input"
            />
            <select
              value={eventsRegionFilter}
              onChange={(e) => {
                setEventsRegionFilter(e.target.value);
                setEventsPage(1);
              }}
              className="filter-select"
            >
              <option value="">כל האזורים</option>
              {regions.map((region) => (
                <option key={region._id} value={region._id}>
                  {region.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={eventsStartDate}
              onChange={(e) => {
                setEventsStartDate(e.target.value);
                setEventsPage(1);
              }}
              className="filter-select"
              placeholder="מתאריך"
            />
            <input
              type="date"
              value={eventsEndDate}
              onChange={(e) => {
                setEventsEndDate(e.target.value);
                setEventsPage(1);
              }}
              className="filter-select"
              placeholder="עד תאריך"
            />
          </div>

          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>שם</th>
                      <th>אזור</th>
                      <th>תאריך התחלה</th>
                      <th>תאריך סיום</th>
                      <th>נוצר ע"י</th>
                      <th>משתתפים</th>
                      <th>פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event._id}>
                        <td>{event.name}</td>
                        <td>{event.region?.name || "N/A"}</td>
                        <td>
                          {new Date(event.startDate).toLocaleDateString("he-IL")}
                        </td>
                        <td>
                          {new Date(event.endDate).toLocaleDateString("he-IL")}
                        </td>
                        <td>{event.createdBy?.name || "Unknown"}</td>
                        <td>{event.participants?.length || 0}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() =>
                                navigate(`/events/${event._id}`)
                              }
                              className="btn-view"
                            >
                              👁️ צפה
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event._id)}
                              className="btn-delete"
                            >
                              🗑️ מחק
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="pagination">
                <button
                  onClick={() => setEventsPage(eventsPage - 1)}
                  disabled={eventsPage === 1}
                  className="pagination-btn"
                >
                  ← הקודם
                </button>
                <span className="pagination-info">
                  עמוד {eventsPage} מתוך {eventsTotalPages}
                </span>
                <button
                  onClick={() => setEventsPage(eventsPage + 1)}
                  disabled={eventsPage >= eventsTotalPages}
                  className="pagination-btn"
                >
                  הבא →
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
