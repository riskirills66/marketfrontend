import React from "react";
import { Drawer, Typography } from "antd";
import { HomeOutlined, ShoppingCartOutlined, UserOutlined } from "@ant-design/icons";

const { Title } = Typography;

const Sidebar: React.FC<{
  visible: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}> = ({ visible, onClose, onNavigate }) => {
  const handleMenuClick = (path: string) => {
    onNavigate(path);
    onClose();
  };

  return (
    <Drawer
      title="Menu"
      placement="left"
      onClose={onClose}
      open={visible}
      width={280}
      className="sidebar-drawer"
    >
      <div className="sidebar-content">
        <div className="sidebar-section">
          <Title level={5} style={{ margin: 0, marginBottom: "16px" }}>
            Menu
          </Title>
          <div className="menu-list">
            <div className="menu-item" onClick={() => handleMenuClick("/")}>
              <HomeOutlined />
              <span>Beranda</span>
            </div>
            <div className="menu-item" onClick={() => handleMenuClick("/cart")}>
              <ShoppingCartOutlined />
              <span>Keranjang</span>
            </div>
            <div
              className="menu-item"
              onClick={() => handleMenuClick("/profile")}
            >
              <UserOutlined />
              <span>Profil</span>
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default Sidebar;


