import Sidebar from "./Sidebar";
import Header from "./Header";

function Layout({ children }) {
  return (
    <>
      <Sidebar />
      <Header />
      <div style={{
        marginLeft: "220px",
        marginTop: "60px",
        padding: "20px"
      }}>
        {children}
      </div>
    </>
  );
}

export default Layout;
