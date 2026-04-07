import { useState, useEffect } from "react";

export default function SaaSLayout() {
  const [sidebarOpen] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem("lumina-theme") || "dark");
  const [user] = useState({
    name: "John Doe",
    email: "john@example.com",
    plan: "pro", // free, pro, enterprise
    workspace: "Study Hub",
  });
  const [currentPage, setCurrentPage] = useState("workspace");

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("lumina-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  return (
    <div className="saas-layout">
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        :root {
          --bg: #0a0e27;
          --surface: #0f1629;
          --elevated: #161d3c;
          --border: rgba(255,255,255,0.06);
          --text: #e8ecf1;
          --muted: #8892a8;
          --accent: #7c6af7;
          --accent2: #a78bfa;
          --accent3: #c4b5fd;
          --green: #34d399;
          --red: #ff6b6b;
          --glow: rgba(124,106,247,0.18);
        }
        
        html.light {
          --bg: #f9fafb;
          --surface: #f3f4f6;
          --elevated: #ffffff;
          --border: rgba(0,0,0,0.08);
          --text: #1f2937;
          --muted: #6b7280;
          --accent: #7c6af7;
          --accent2: #8b5cf6;
          --accent3: #a78bfa;
          --green: #10b981;
          --red: #ef4444;
          --glow: rgba(124,106,247,0.15);
        }
        
        html, body, #root { height: 100%; width: 100%; }
        body { font-family: 'Inter', system-ui, sans-serif; overflow: hidden; }
        
        .saas-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          grid-template-rows: 72px 1fr;
          height: 100vh;
          background: var(--bg);
          color: var(--text);
        }
        
        /* ── TOP HEADER ─────────────────────────────────────────────────── */
        .saas-header {
          grid-column: 1/-1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          background: rgba(10,14,39,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          z-index: 20;
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        
        .logo-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .logo {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          color: white;
          font-size: 1.2rem;
          box-shadow: 0 0 20px var(--glow);
        }
        
        .workspace-info h1 {
          font-size: 0.95rem;
          font-weight: 700;
          margin: 0;
          background: linear-gradient(135deg, var(--text), var(--accent2));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .workspace-info p {
          font-size: 0.75rem;
          color: var(--muted);
          margin: 2px 0 0 0;
        }
        
        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .header-btn {
          background: rgba(124,106,247,0.1);
          border: 1px solid rgba(124,106,247,0.2);
          border-radius: 8px;
          padding: 8px 12px;
          cursor: pointer;
          color: var(--accent2);
          font-size: 0.8rem;
          font-weight: 500;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .header-btn:hover {
          background: rgba(124,106,247,0.2);
          border-color: rgba(124,106,247,0.4);
          transform: scale(1.05);
        }
        
        .user-menu {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-left: 16px;
          border-left: 1px solid var(--border);
        }
        
        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        
        .user-avatar:hover {
          transform: scale(1.1);
          box-shadow: 0 0 15px var(--glow);
        }
        
        /* ── SIDEBAR ─────────────────────────────────────────────────────── */
        .saas-sidebar {
          grid-row: 2;
          background: var(--surface);
          border-right: 1px solid var(--border);
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        
        .sidebar-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px 0;
        }
        
        .sidebar-section {
          margin-bottom: 8px;
        }
        
        .sidebar-label {
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--muted);
          padding: 12px 18px 8px;
        }
        
        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 18px;
          margin: 4px 12px;
          border-radius: 8px;
          cursor: pointer;
          color: var(--muted);
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.25s ease;
          border: 1px solid transparent;
        }
        
        .sidebar-item:hover {
          background: rgba(124,106,247,0.1);
          color: var(--accent2);
          border-color: rgba(124,106,247,0.2);
          transform: translateX(4px);
        }
        
        .sidebar-item.active {
          background: rgba(124,106,247,0.15);
          border-color: rgba(124,106,247,0.3);
          color: var(--accent2);
        }
        
        .sidebar-item-icon {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }
        
        .sidebar-footer {
          padding: 16px 18px;
          border-top: 1px solid var(--border);
          margin-top: auto;
        }
        
        .plan-badge {
          background: rgba(52,211,153,0.1);
          border: 1px solid rgba(52,211,153,0.3);
          border-radius: 8px;
          padding: 10px 12px;
          margin-bottom: 12px;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .plan-badge.pro {
          background: rgba(124,106,247,0.1);
          border-color: rgba(124,106,247,0.3);
        }
        
        .plan-badge.enterprise {
          background: rgba(255,215,0,0.05);
          border-color: rgba(255,215,0,0.2);
        }
        
        .plan-text {
          font-weight: 600;
          color: var(--accent2);
        }
        
        /* ── MAIN CONTENT ─────────────────────────────────────────────────── */
        .saas-main {
          grid-row: 2;
          grid-column: 2;
          overflow-y: auto;
          background: var(--bg);
        }
        
        .main-content {
          padding: 32px 40px;
          height: 100%;
        }
        
        /* Scrollbar styling */
        .saas-sidebar::-webkit-scrollbar,
        .saas-main::-webkit-scrollbar {
          width: 5px;
        }
        
        .saas-sidebar::-webkit-scrollbar-thumb,
        .saas-main::-webkit-scrollbar-thumb {
          background: rgba(124,106,247,0.2);
          border-radius: 3px;
        }
        
        .saas-sidebar::-webkit-scrollbar-thumb:hover,
        .saas-main::-webkit-scrollbar-thumb:hover {
          background: rgba(124,106,247,0.4);
        }
      `}</style>

      {/* HEADER */}
      <header className="saas-header">
        <div className="header-left">
          <div className="logo-section">
            <div className="logo">L</div>
            <div className="workspace-info">
              <h1>{user.workspace}</h1>
              <p>{user.plan.toUpperCase()}</p>
            </div>
          </div>
        </div>

        <div className="header-right">
          <button className="header-btn" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button className="header-btn">💬 Help</button>
          <button className="header-btn">⚙️ Settings</button>
          <div className="user-menu">
            <div className="user-avatar">{user.name.charAt(0)}</div>
          </div>
        </div>
      </header>

      {/* SIDEBAR */}
      <aside className="saas-sidebar">
        <div className="sidebar-content">
          <div className="sidebar-section">
            <div className="sidebar-label">Workspace</div>
            <div className="sidebar-item active" onClick={() => setCurrentPage("workspace")}>
              <span className="sidebar-item-icon">📚</span>
              <span>Study Assistant</span>
            </div>
            <div className="sidebar-item" onClick={() => setCurrentPage("analytics")}>
              <span className="sidebar-item-icon">📊</span>
              <span>Analytics</span>
            </div>
            <div className="sidebar-item" onClick={() => setCurrentPage("documents")}>
              <span className="sidebar-item-icon">📄</span>
              <span>Documents</span>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Collections</div>
            <div className="sidebar-item">
              <span className="sidebar-item-icon">📖</span>
              <span>My Library</span>
            </div>
            <div className="sidebar-item">
              <span className="sidebar-item-icon">⭐</span>
              <span>Favorites</span>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">More</div>
            <div className="sidebar-item">
              <span className="sidebar-item-icon">🤝</span>
              <span>Team</span>
            </div>
            <div className="sidebar-item">
              <span className="sidebar-item-icon">🎓</span>
              <span>Learn</span>
            </div>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className={`plan-badge ${user.plan}`}>
            <span className="plan-text">{user.plan === 'pro' ? '✨ Pro Plan' : user.plan === 'enterprise' ? '👑 Enterprise' : '🆓 Free'}</span>
            <span style={{fontSize: '0.65rem', color: 'var(--muted)'}}>Upgrade</span>
          </div>
          <button className="header-btn" style={{width: '100%', justifyContent: 'center', marginTop: '8px'}}>
            📞 Support
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="saas-main">
        <div className="main-content">
          {currentPage === "workspace" && (
            <StudyAssistantApp />
          )}
          {currentPage === "analytics" && (
            <div style={{textAlign: 'center', paddingTop: '60px'}}>
              <h2 style={{fontSize: '1.5rem', marginBottom: '16px'}}>📊 Analytics Coming Soon</h2>
              <p style={{color: 'var(--muted)'}}>Track your learning progress and insights</p>
            </div>
          )}
          {currentPage === "documents" && (
            <div style={{textAlign: 'center', paddingTop: '60px'}}>
              <h2 style={{fontSize: '1.5rem', marginBottom: '16px'}}>📄 Documents</h2>
              <p style={{color: 'var(--muted)'}}>Manage your uploaded documents</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Import and wrap the existing StudyAssistant
import StudyAssistant from "../page/StudyAssistant";

function StudyAssistantApp() {
  return <StudyAssistant isEmbedded={true} />;
}
