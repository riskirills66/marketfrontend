import React from "react";
import { Layout, Typography, Badge, Button } from "antd";
import { ArrowLeftOutlined, MenuOutlined, ShopOutlined, ShoppingCartOutlined } from "@ant-design/icons";

const { Header } = Layout;
const { Title } = Typography;

const ModernHeader: React.FC<{
  cartItemCount: number;
  onMenuClick: () => void;
  onCartClick: () => void;
  onBackClick?: () => void;
  showBackButton?: boolean;
  title?: string;
}> = ({
  cartItemCount,
  onMenuClick,
  onCartClick,
  onBackClick,
  showBackButton = false,
  title,
}) => {
  return (
    <Header className="modern-header">
      <div className="header-content">
        <div className="header-left">
          {showBackButton ? (
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={onBackClick}
              className="back-button"
            />
          ) : (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={onMenuClick}
              className="menu-button"
            />
          )}
        </div>

        <div className="header-center">
          {title ? (
            <Title level={4} className="page-title">
              {title}
            </Title>
          ) : (
            <div className="logo">
              <ShopOutlined className="logo-icon" />
              <Title level={4} className="logo-text">
                Belanja
              </Title>
            </div>
          )}
        </div>

        <div className="header-right">
          <Badge count={cartItemCount} size="small" className="cart-badge">
            <Button
              type="text"
              icon={<ShoppingCartOutlined />}
              onClick={onCartClick}
              className="cart-button"
            />
          </Badge>
        </div>
      </div>
    </Header>
  );
};

export default ModernHeader;


