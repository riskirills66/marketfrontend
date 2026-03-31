import React from "react";
import { Button, Badge } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";

interface FloatingCartButtonProps {
  cartItemCount: number;
  onCartClick: () => void;
}

const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({
  cartItemCount,
  onCartClick,
}) => {
  return (
    <div className="floating-cart-container">
      <Badge count={cartItemCount} size="small" className="floating-cart-badge">
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<ShoppingCartOutlined />}
          onClick={onCartClick}
          className="floating-cart-button"
        />
      </Badge>
    </div>
  );
};

export default FloatingCartButton;
