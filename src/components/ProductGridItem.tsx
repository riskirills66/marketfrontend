import React, { useState } from "react";
import { Button, message } from "antd";
import { StarOutlined, ShoppingCartOutlined, ShopOutlined } from "@ant-design/icons";
import { Item } from "../types";

const ProductGridItem: React.FC<{
  item: Item;
  onAddToCart: (item: Item) => void;
  onBuyNow: (item: Item) => void;
  onViewDetails: (item: Item) => void;
}> = ({ item, onAddToCart, onBuyNow, onViewDetails }) => {
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      onAddToCart(item);
      message.success("Ditambahkan ke keranjang!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-grid-item">
      <div
        className="product-image-container"
        onClick={() => onViewDetails(item)}
        style={{ position: 'relative' }}
      >
        {item.price_cut > 0 && (
          <div className="promo-badge" style={{ fontSize: 10, padding: '2px 6px', borderRadius: 10 }}>
            PROMO
            <span className="promo-percentage">
              -{Math.round((item.price_cut / item.price) * 100)}%
            </span>
          </div>
        )}
        <img
          alt={item.name}
          src={item.image_url}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
            (e.target as HTMLImageElement).parentElement!.innerHTML =
              '<div class="placeholder-image">📦</div>';
          }}
          className="product-image"
        />
        {(item.points ?? 0) > 0 && (
          <div
            className="points-badge"
            style={{
              position: 'absolute',
              right: 8,
              bottom: 8,
              background: '#d4af37',
              color: '#fff',
              fontWeight: 700,
              fontSize: 10,
              borderRadius: 10,
              padding: '1px 6px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
            }}
          >
            Poin {item.points}
          </div>
        )}
      </div>

      <div className="product-details">
        <h3 className="product-title" onClick={() => onViewDetails(item)}>
          {item.name}
        </h3>
        <div className="product-price">
          {item.price_cut > 0 ? (
            <div
              className="price-with-discount"
              style={{ display: 'inline-flex', flexDirection: 'row', alignItems: 'baseline', gap: 8, flexWrap: 'nowrap' }}
            >
              <span className="original-price" style={{ display: 'inline', whiteSpace: 'nowrap' }}>
                Rp {item.price.toLocaleString("id-ID")}
              </span>
              <span className="discounted-price" style={{ display: 'inline', whiteSpace: 'nowrap' }}>
                Rp {(item.price - item.price_cut).toLocaleString("id-ID")}
              </span>
            </div>
          ) : (
            <span className="price-amount">
              Rp {item.price.toLocaleString("id-ID")}
            </span>
          )}
        </div>

        <div className="product-meta">
          <div className="product-rating">
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarOutlined
                  key={star}
                  className={`star ${star <= Math.round(item.rating) ? "filled" : ""}`}
                />
              ))}
            </div>
            <span className="rating-text">({item.rating.toFixed(1)})</span>
          </div>
          {/* Points shown inside image as badge; removed from meta */}

          <div className="product-tags">
            {(Array.isArray(item.tags) ? item.tags : [])
              .slice(0, 2)
              .map((tag, index) => (
                <span key={index} className="product-tag">
                  {tag}
                </span>
              ))}
            {(Array.isArray(item.tags) ? item.tags : []).length > 2 && (
              <span className="product-tag more">
                +{(Array.isArray(item.tags) ? item.tags : []).length - 2}
              </span>
            )}
          </div>
        </div>

        <div className="product-actions">
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            onClick={handleAddToCart}
            loading={loading}
            className="add-to-cart-btn"
            size="small"
          >
            <span className="btn-text-desktop">Tambah ke Keranjang</span>
            <span className="btn-text-mobile">Tambah</span>
          </Button>
          <Button
            type="default"
            icon={<ShopOutlined />}
            onClick={() => onBuyNow(item)}
            className="buy-now-btn"
            size="small"
          >
            <span className="btn-text-desktop">Beli Sekarang</span>
            <span className="btn-text-mobile">Beli</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductGridItem;


