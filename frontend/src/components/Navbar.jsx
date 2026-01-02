import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("all"); // all, event, org
  const [searchResults, setSearchResults] = useState({ events: [], organizations: [] });
  const [showResults, setShowResults] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [events, setEvents] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    // Load data for search
    const loadData = async () => {
      try {
        const [eventsRes, orgsRes] = await Promise.all([
          api.get("/events"),
          api.get("/organizations/public").catch(() => ({ data: { organizations: [] } }))
        ]);
        setEvents(eventsRes.data.events || []);
        setOrganizations(orgsRes.data.organizations || []);
      } catch (error) {
        console.error("Failed to load search data:", error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length >= 2) {
      const filteredEvents = events.filter(evt =>
        evt.title.toLowerCase().includes(query.toLowerCase()) ||
        (evt.description || "").toLowerCase().includes(query.toLowerCase()) ||
        (evt.category || "").toLowerCase().includes(query.toLowerCase())
      );

      const filteredOrgs = organizations.filter(org =>
        org.name.toLowerCase().includes(query.toLowerCase()) ||
        (org.category || "").toLowerCase().includes(query.toLowerCase())
      );

      if (searchType === "event") {
        setSearchResults({ events: filteredEvents, organizations: [] });
      } else if (searchType === "org") {
        setSearchResults({ events: [], organizations: filteredOrgs });
      } else {
        // All - show both
        setSearchResults({ events: filteredEvents, organizations: filteredOrgs });
      }
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Helper to properly format thumbnail URLs
  const getThumbnailUrl = (url) => {
    if (!url) return null;
    let cleanUrl = url.replace(/^\/+/, '').replace(/\\/g, '/');
    return `http://localhost:8080/${cleanUrl}`;
  };

  const getSearchTypeLabel = () => {
    if (searchType === "event") return "🎓 Event";
    if (searchType === "org") return "🏢 Organisasi";
    return "🔍 Semua";
  };

  const totalResults = searchResults.events.length + searchResults.organizations.length;

  return (
    <nav style={{
      padding: "12px 32px",
      background: "linear-gradient(135deg, #1e40af, #3b82f6)",
      color: "white",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "20px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      position: "sticky",
      top: 0,
      zIndex: 100
    }}>
      {/* Logo */}
      <Link to="/" style={{
        fontSize: "1.5rem",
        fontWeight: "700",
        color: "white",
        textDecoration: "none",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        flexShrink: 0
      }}>
        🚀 Proyek3
      </Link>

      {/* Search Bar - Center */}
      <div ref={searchRef} style={{ position: "relative", flex: 1, maxWidth: "500px" }}>
        <div style={{ display: "flex", alignItems: "stretch" }}>
          {/* Dropdown Button */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                height: "100%",
                padding: "10px 14px",
                background: "rgba(255,255,255,0.95)",
                border: "none",
                borderRadius: "8px 0 0 8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.85rem",
                color: "#374151",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                whiteSpace: "nowrap"
              }}
            >
              {getSearchTypeLabel()}
              <span style={{ fontSize: "0.7rem" }}>▼</span>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div style={{
                position: "absolute",
                top: "100%",
                left: 0,
                background: "white",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                marginTop: "4px",
                overflow: "hidden",
                zIndex: 200,
                minWidth: "150px"
              }}>
                <button
                  onClick={() => { setSearchType("all"); setShowDropdown(false); handleSearch({ target: { value: searchQuery } }); }}
                  style={dropdownItemStyle(searchType === "all")}
                >
                  🔍 Semua
                </button>
                <button
                  onClick={() => { setSearchType("event"); setShowDropdown(false); handleSearch({ target: { value: searchQuery } }); }}
                  style={dropdownItemStyle(searchType === "event")}
                >
                  🎓 Event
                </button>
                <button
                  onClick={() => { setSearchType("org"); setShowDropdown(false); handleSearch({ target: { value: searchQuery } }); }}
                  style={dropdownItemStyle(searchType === "org")}
                >
                  🏢 Organisasi
                </button>
              </div>
            )}
          </div>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Cari event atau organisasi..."
            value={searchQuery}
            onChange={handleSearch}
            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
            style={{
              flex: 1,
              padding: "10px 16px",
              border: "none",
              fontSize: "0.95rem",
              borderRadius: "0 8px 8px 0",
              minWidth: "150px"
            }}
          />
        </div>

        {/* Search Results */}
        {showResults && totalResults > 0 && (
          <div style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            marginTop: "8px",
            maxHeight: "400px",
            overflowY: "auto",
            zIndex: 200
          }}>
            {/* Events Section */}
            {searchResults.events.length > 0 && (
              <>
                <div style={{
                  padding: "10px 16px",
                  background: "#f8fafc",
                  color: "#64748b",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  borderBottom: "1px solid #e2e8f0"
                }}>
                  🎓 Event ({searchResults.events.length})
                </div>
                {searchResults.events.slice(0, 5).map((item) => (
                  <Link
                    key={`event-${item.id}`}
                    to={`/event/${item.id}`}
                    onClick={() => { setShowResults(false); setSearchQuery(""); }}
                    style={resultItemStyle}
                  >
                    <div style={resultThumbStyle}>
                      {item.thumbnail_url ? (
                        <img
                          src={getThumbnailUrl(item.thumbnail_url)}
                          alt=""
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <span style={{ fontSize: "1.2rem" }}>🎓</span>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: "600", color: "#1e293b" }}>{item.title}</div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{item.category || "Umum"}</div>
                    </div>
                  </Link>
                ))}
              </>
            )}

            {/* Organizations Section */}
            {searchResults.organizations.length > 0 && (
              <>
                <div style={{
                  padding: "10px 16px",
                  background: "#f8fafc",
                  color: "#64748b",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  borderBottom: "1px solid #e2e8f0"
                }}>
                  🏢 Organisasi ({searchResults.organizations.length})
                </div>
                {searchResults.organizations.slice(0, 5).map((item) => (
                  <Link
                    key={`org-${item.id}`}
                    to={`/organization/${item.id}`}
                    onClick={() => { setShowResults(false); setSearchQuery(""); }}
                    style={resultItemStyle}
                  >
                    <div style={resultThumbStyle}>
                      {item.logo_url ? (
                        <img
                          src={getThumbnailUrl(item.logo_url)}
                          alt=""
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <span style={{ fontSize: "1.2rem" }}>🏢</span>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: "600", color: "#1e293b" }}>{item.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{item.category || "Umum"}</div>
                    </div>
                  </Link>
                ))}
              </>
            )}
          </div>
        )}

        {/* No Results */}
        {showResults && searchQuery.length >= 2 && totalResults === 0 && (
          <div style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            marginTop: "8px",
            padding: "24px",
            textAlign: "center",
            color: "#64748b",
            zIndex: 200
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🔍</div>
            Tidak ditemukan hasil untuk "{searchQuery}"
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
        <Link to="/" style={linkStyle}>Home</Link>
        <Link to="/about" style={linkStyle}>About</Link>

        {user ? (
          <>
            <Link to="/dashboard" style={{
              ...linkStyle,
              background: "rgba(255,255,255,0.2)",
              padding: "8px 16px",
              borderRadius: "8px",
              fontWeight: "600"
            }}>
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              style={{
                background: "rgba(239, 68, 68, 0.9)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "8px 16px",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "0.9rem",
                transition: "all 0.2s ease"
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={linkStyle}>Login</Link>
            <Link to="/register" style={{
              background: "white",
              color: "#2563eb",
              padding: "10px 20px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "0.9rem",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
              Daftar
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

const linkStyle = {
  color: "rgba(255,255,255,0.9)",
  textDecoration: "none",
  fontWeight: "500",
  fontSize: "0.95rem",
  padding: "6px 12px",
  borderRadius: "6px",
  transition: "all 0.2s ease"
};

const dropdownItemStyle = (isActive) => ({
  display: "block",
  width: "100%",
  padding: "10px 16px",
  border: "none",
  background: isActive ? "#eff6ff" : "white",
  color: isActive ? "#3b82f6" : "#374151",
  textAlign: "left",
  cursor: "pointer",
  fontSize: "0.9rem",
  fontWeight: isActive ? "600" : "400"
});

const resultItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "12px 16px",
  borderBottom: "1px solid #e2e8f0",
  textDecoration: "none",
  transition: "background 0.2s ease"
};

const resultThumbStyle = {
  width: "40px",
  height: "40px",
  borderRadius: "8px",
  background: "#f1f5f9",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  flexShrink: 0
};