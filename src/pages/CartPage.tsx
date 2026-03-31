import React, { useState } from "react";
import { Button, Card, Empty, InputNumber, List, Modal, Typography } from "antd";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import CartContext from "../contexts/AppCartContext";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

const { Title, Paragraph, Text } = Typography;

const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } =
    React.useContext(CartContext);
  const navigate = useNavigate();
  const [loading] = useState(false);

  const totalPrice = cart.reduce((sum, item) => {
    const finalPrice =
      item.item.price_cut > 0
        ? Math.max(0, item.item.price - item.item.price_cut)
        : item.item.price;
    return sum + finalPrice * item.quantity;
  }, 0);

  const handleCheckout = () => {
    if (cart.length === 0) {
      return;
    }
    navigate("/purchase");
  };

  const handleClearCart = () => {
    Modal.confirm({
      title: "Kosongkan Keranjang",
      content: "Apakah Anda yakin ingin menghapus semua item dari keranjang?",
      onOk: () => {
        clearCart();
      },
    });
  };

  if (cart.length === 0) {
    return (
      <div className="modern-cart-page">
        <div className="empty-cart-container">
          <div className="empty-cart-icon">🛒</div>
          <Title level={2} className="empty-cart-title">
            Keranjang Anda kosong
          </Title>
          <Paragraph className="empty-cart-description">
            Sepertinya Anda belum menambahkan item apapun ke keranjang.
          </Paragraph>
          <Button
            type="primary"
            size="large"
            onClick={() => navigate("/")}
            className="start-shopping-btn"
          >
            Mulai Belanja
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-cart-page">
      <BackButton onBackClick={() => navigate("/")} title="Keranjang Belanja" />
      <div className="cart-content">
        <div className="cart-items-section">
          <Card className="cart-items-card">
            <List
              dataSource={cart}
              renderItem={(cartItem) => (
                <List.Item className="modern-cart-item">
                  <div className="cart-item-content">
                    <div className="cart-item-image-section">
                      <img
                        src={cartItem.item.image_url}
                        alt={cartItem.item.name}
                        className="cart-item-image"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                          (
                            e.target as HTMLImageElement
                          ).parentElement!.innerHTML =
                            '<div class="cart-item-placeholder">📦</div>';
                        }}
                      />
                    </div>

                    <div className="cart-item-details">
                      <div className="cart-item-name">{cartItem.item.name}</div>
                      <div className="cart-item-unit-price">
                        {cartItem.item.price_cut > 0 ? (
                          <div className="cart-price-with-discount">
                            <span className="cart-original-price">
                              Rp {cartItem.item.price.toLocaleString("id-ID")}
                            </span>
                            <span className="cart-discounted-price">
                              Rp {(
                                cartItem.item.price - cartItem.item.price_cut
                              ).toLocaleString("id-ID")}
                            </span>
                            <span className="cart-discount-badge">
                              -
                              {Math.round(
                                (cartItem.item.price_cut /
                                  cartItem.item.price) *
                                  100,
                              )}
                              %
                            </span>
                          </div>
                        ) : (
                          <span>
                            Rp {cartItem.item.price.toLocaleString("id-ID")}
                          </span>
                        )}
                        <span className="per-item-text"> per item</span>
                      </div>
                    </div>
                  </div>

                  <div className="cart-item-controls">
                    <div className="quantity-and-price">
                      <div className="quantity-controls">
                        <Button
                          icon={<MinusOutlined />}
                          onClick={() => {
                            if (cartItem.quantity <= 1) {
                              removeFromCart(cartItem.item.id);
                            } else {
                              updateQuantity(
                                cartItem.item.id,
                                cartItem.quantity - 1,
                              );
                            }
                          }}
                          className="quantity-btn"
                        />
                        <InputNumber
                          min={1}
                          value={cartItem.quantity}
                          onChange={(value) =>
                            updateQuantity(cartItem.item.id, value || 1)
                          }
                          className="quantity-input"
                        />
                        <Button
                          icon={<PlusOutlined />}
                          onClick={() =>
                            updateQuantity(
                              cartItem.item.id,
                              cartItem.quantity + 1,
                            )
                          }
                          className="quantity-btn"
                        />
                      </div>

                      <div className="cart-item-total">
                        <Text strong className="item-total-price">
                          Rp{" "}
                          {(
                            (cartItem.item.price_cut > 0
                              ? Math.max(
                                  0,
                                  cartItem.item.price - cartItem.item.price_cut,
                                )
                              : cartItem.item.price) * cartItem.quantity
                          ).toLocaleString("id-ID")}
                        </Text>
                      </div>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CartPage;


