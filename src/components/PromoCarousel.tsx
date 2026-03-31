import React, { useEffect, useRef, useState } from "react";
import { Button, Spin, Typography } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Item } from "../types";
import { apiClient } from "../api";

const { Title, Text } = Typography;

const PromoCarousel: React.FC<{
  onAddToCart: (item: Item) => void;
  onBuyNow: (item: Item) => void;
  onViewDetails: (item: Item) => void;
}> = ({ onAddToCart, onBuyNow, onViewDetails }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [promoItems, setPromoItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromoItems = async () => {
      try {
        const items = await apiClient.getPromoItems();
        const shuffledItems = [...items]
          .sort(() => Math.random() - 0.5)
          .slice(0, 10);
        setPromoItems(shuffledItems);
      } catch (error) {
        console.error("Error fetching promo items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPromoItems();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (promoItems.length >= 3) {
        setCurrentIndex((prevIndex) =>
          prevIndex >=
          Math.max(0, Math.ceil(promoItems.length / getItemsPerSlide()) - 1)
            ? 0
            : prevIndex + 1,
        );
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [promoItems.length]);

  useEffect(() => {
    const handleResize = () => {
      setCurrentIndex(0);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getItemsPerSlide = () => {
    if (window.innerWidth >= 1200) return 2;
    if (window.innerWidth >= 992) return 1.5;
    return 1;
  };

  const getMaxIndex = () => {
    const itemsPerSlide = getItemsPerSlide();
    return Math.max(0, Math.ceil(promoItems.length / itemsPerSlide) - 1);
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex >= getMaxIndex() ? 0 : prevIndex + 1,
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? getMaxIndex() : prevIndex - 1,
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) =>
    setTouchEnd(e.targetTouches[0].clientX);

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  if (loading) {
    return null;
  }

  if (promoItems.length < 3) {
    return null;
  }

  return (
    <div className="promo-carousel-container">
      <div className="carousel-wrapper">
        <Button
          type="text"
          icon={<LeftOutlined />}
          className="carousel-nav-btn carousel-prev"
          onClick={prevSlide}
        />

        <div
          className="carousel-content"
          ref={carouselRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="carousel-track"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {promoItems.map((item) => (
              <div key={item.id} className="carousel-slide">
                <div className="promo-item-card">
                  <div
                    className="promo-item-image-container"
                    onClick={() => onViewDetails(item)}
                  >
                    <div className="promo-badge-large">
                      PROMO
                      <span className="promo-percentage-large">
                        -{Math.round((item.price_cut / item.price) * 100)}%
                      </span>
                    </div>
                    <img
                      alt={item.name}
                      src={item.image_url}
                      className="promo-item-image"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                        (
                          e.target as HTMLImageElement
                        ).parentElement!.innerHTML =
                          '<div class="placeholder-image">📦</div>';
                      }}
                    />
                  </div>

                  <div className="promo-item-details">
                    <Title level={4} className="promo-item-name">
                      {item.name}
                    </Title>

                    <div className="promo-price-section">
                      <div className="promo-price-row">
                        <Text className="promo-original-price">
                          Rp {item.price.toLocaleString("id-ID")}
                        </Text>
                        <Text className="promo-discount-percentage">
                          -{Math.round((item.price_cut / item.price) * 100)}%
                        </Text>
                      </div>
                      <Text className="promo-final-price">
                        Rp {(item.price - item.price_cut).toLocaleString("id-ID")}
                      </Text>
                    </div>

                    <div className="promo-item-actions">
                      <Button
                        type="primary"
                        className="promo-buy-now-btn"
                        onClick={() => onBuyNow(item)}
                        block
                      >
                        Beli Sekarang
                      </Button>
                      <Button
                        className="promo-add-cart-btn"
                        onClick={() => onAddToCart(item)}
                        block
                      >
                        + Keranjang
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button
          type="text"
          icon={<RightOutlined />}
          className="carousel-nav-btn carousel-next"
          onClick={nextSlide}
        />
      </div>

      <div className="carousel-dots">
        {Array.from({ length: getMaxIndex() + 1 }, (_, index) => (
          <button
            key={index}
            className={`carousel-dot ${index === currentIndex ? "active" : ""}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default PromoCarousel;


