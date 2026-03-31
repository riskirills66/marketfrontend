import React from "react";
import { Button } from "antd";
import { CreditCardOutlined } from "@ant-design/icons";

const PurchaseFooter: React.FC<{
  totalPrice: number;
  onCheckout: () => void;
  loading: boolean;
  disabled?: boolean;
}> = ({ totalPrice, onCheckout, loading, disabled = false }) => {
  return (
    <div className="purchase-footer">
      <div className="purchase-footer-content">
        <div className="purchase-footer-left">
          <div className="purchase-footer-summary">
            <span className="purchase-footer-total">
              Total: Rp {totalPrice.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
        <div className="purchase-footer-right">
          <Button
            type="primary"
            size="large"
            icon={<CreditCardOutlined />}
            onClick={onCheckout}
            loading={loading}
            disabled={disabled}
            className="purchase-footer-checkout-btn"
          >
            {disabled ? 'Lengkapi Informasi' : 'Selesaikan Pembelian'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseFooter;


