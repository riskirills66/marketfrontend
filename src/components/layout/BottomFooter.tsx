import React from "react";
import { Button, Typography } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { CartItemWithDetails } from "../../types";

const { Text } = Typography;

const BottomFooter: React.FC<{ cart: CartItemWithDetails[]; onCheckout: () => void }> = ({
  cart,
  onCheckout,
}) => {
  const totalPrice = cart.reduce((sum, item) => {
    const finalPrice =
      item.item.price_cut > 0
        ? Math.max(0, item.item.price - item.item.price_cut)
        : item.item.price;
    return sum + finalPrice * item.quantity;
  }, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bottom-footer">
      <div className="footer-content">
        <div className="footer-left">
          <div className="footer-summary">
            <span className="footer-items">{totalItems} item</span>
            <span className="footer-total">
              Total: Rp {totalPrice.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
        <div className="footer-right">
          <Button
            type="primary"
            size="large"
            icon={<CheckOutlined />}
            onClick={onCheckout}
            disabled={cart.length === 0}
            className="footer-checkout-btn"
          >
            Lanjut ke Pembayaran
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BottomFooter;


