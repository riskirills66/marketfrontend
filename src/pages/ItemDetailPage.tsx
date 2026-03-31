import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Empty, InputNumber, Spin, Typography, message } from "antd";
import { MinusOutlined, PlusOutlined, ShoppingCartOutlined, ShopOutlined, DownOutlined } from "@ant-design/icons";
import { apiClient } from "../api";
import { Item } from "../types";
import CartContext from "../contexts/AppCartContext";
import BackButton from "../components/BackButton";

const { Title, Text, Paragraph } = Typography;

const ItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const { addToCart } = React.useContext(CartContext);

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) {
        setError("ID item tidak diberikan");
        setLoading(false);
        return;
      }

      try {
        const data = await apiClient.getItemById(parseInt(id));
        setItem(data);
      } catch (err) {
        setError("Gagal memuat detail produk");
        console.error("Error fetching item:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      const descriptionSection = document.querySelector('.item-description-section');
      if (descriptionSection) {
        const rect = descriptionSection.getBoundingClientRect();
        // Hide indicator when description section is visible
        if (rect.top < window.innerHeight) {
          setShowScrollIndicator(false);
        } else {
          setShowScrollIndicator(true);
        }
      }
    };

    // Only add scroll listener on mobile
    if (window.innerWidth <= 768) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      setShowScrollIndicator(false);
    }
  }, [item]);

  const handleAddToCart = () => {
    if (item) {
      for (let i = 0; i < quantity; i++) {
        addToCart(item);
      }
      message.success(`Ditambahkan ${quantity} item ke keranjang!`);
    }
  };

  const handleBuyNow = () => {
    if (item) {
      for (let i = 0; i < quantity; i++) {
        addToCart(item);
      }
      navigate("/cart");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <Text className="loading-text">Memuat detail produk...</Text>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="error-container">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <Title level={4}>Produk Tidak Ditemukan</Title>
              <Text type="secondary">
                {error || "Produk yang Anda cari tidak ada."}
              </Text>
              <Button
                type="primary"
                onClick={() => navigate("/")}
                className="retry-btn"
              >
                Kembali ke Beranda
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="item-detail-page">
      <BackButton onBackClick={() => navigate("/")} title="Detail Produk" />
      {showScrollIndicator && (
        <div className="scroll-indicator">
          <DownOutlined />
          <span>Scroll untuk info lengkap</span>
        </div>
      )}
      <div className="item-detail-container">
        <div className="item-image-section">
          <img
            src={item.image_url}
            alt={item.name}
            className="item-detail-image"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).parentElement!.innerHTML =
                '<div class="placeholder-image-large">📦</div>';
            }}
          />
        </div>

        <div className="item-info-section">
          <div className="item-header">
            <Title level={2} className="item-detail-title">
              {item.name}
            </Title>
          </div>

          <div className="item-price-section">
            {item.price_cut > 0 ? (
              <div className="item-price-with-discount">
                <div className="price-row">
                  <Text className="item-detail-price original">
                    Rp {item.price.toLocaleString("id-ID")}
                  </Text>
                  <span className="discount-percentage">
                    -{Math.round((item.price_cut / item.price) * 100)}%
                  </span>
                </div>
                <Text className="item-detail-price discounted">
                  Rp {(item.price - item.price_cut).toLocaleString("id-ID")}
                </Text>
                <div className="savings-text">
                  Hemat Rp {item.price_cut.toLocaleString("id-ID")}
                </div>
              </div>
            ) : (
              <Text className="item-detail-price">
                Rp {item.price.toLocaleString("id-ID")}
              </Text>
            )}
            {(item.points ?? 0) > 0 && (
              <div style={{ marginTop: 8 }}>
                <Text strong style={{ color: '#52c41a' }}>Poin {item.points}</Text>
              </div>
            )}
          </div>


          <div className="item-tags-section">
            <div className="item-tags">
              {item.tags.map((tag, index) => (
                <span key={index} className="item-tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="item-description-section">
            <Title level={4} className="description-title">
              Deskripsi
            </Title>
            <Paragraph className="item-description">
              {item.description}
            </Paragraph>
          </div>

          <div className="item-actions-section">
            <div className="quantity-selector">
              <Text strong className="quantity-label">
                Jumlah:
              </Text>
              <div className="quantity-controls">
                <Button
                  icon={<MinusOutlined />}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="quantity-btn"
                />
                <InputNumber
                  min={1}
                  value={quantity}
                  onChange={(value) => setQuantity(value || 1)}
                  className="quantity-input"
                />
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => setQuantity(quantity + 1)}
                  className="quantity-btn"
                />
              </div>
            </div>

            <div className="action-buttons">
              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                onClick={handleAddToCart}
                className="add-to-cart-btn-large"
              >
                Tambah ke Keranjang
              </Button>
              <Button
                type="default"
                size="large"
                icon={<ShopOutlined />}
                onClick={handleBuyNow}
                className="buy-now-btn-large"
              >
                Beli Sekarang
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailPage;


