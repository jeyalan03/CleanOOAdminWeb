function Sidebar() {
  return (
    <div style={{
      width: "220px",
      height: "100vh",
      background: "#1e293b",
      color: "white",
      padding: "20px",
      position: "fixed",
      left: 0,
      top: 0
    }}>
      <h2>Admin Panel</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <li>Dashboard</li>
        <li>Househols</li>
        <li>Collectors</li>
        <li>Settings</li>
      </ul>
    </div>
  );
}

export default Sidebar;
