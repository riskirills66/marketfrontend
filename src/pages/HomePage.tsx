import React, { useCallback, useEffect, useState } from "react";
import { Button, Empty, Input, Spin, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Item, Tag, Category } from "../types";
import { apiClient } from "../api";
import CartContext from "../contexts/AppCartContext";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import ProductGridItem from "../components/ProductGridItem";
import PromoCarousel from "../components/PromoCarousel";
import PopularTags from "../components/tags/PopularTags";
import CategoriesMenu from "../components/categories/CategoriesMenu";
import SearchPage from "./SearchPage";

const { Title, Text } = Typography;
const { Search } = Input;

const HomePage: React.FC<{
  selectedTags: string[];
  popularTags: Tag[];
  onTagToggle: (tag: string) => void;
  onShowMoreTags: () => void;
  allTags: Tag[];
  onTagsUpdate: (categoryId: number | null) => Promise<void>;
}> = ({ selectedTags, popularTags, onTagToggle, onShowMoreTags, allTags, onTagsUpdate }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [showSearchPage, setShowSearchPage] = useState(false);
  const isClearingRef = React.useRef(false);
  const { addToCart } = React.useContext(CartContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const fetchItems = async (searchTerm?: string, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError(null);
    }

    try {
      const data =
        selectedTags.length > 0
          ? await apiClient.getItemsByTags(
              selectedTags,
              isLoadMore ? currentPage + 1 : 1,
              12,
              searchTerm,
              selectedCategoryId,
            )
          : await apiClient.getItemsRandom(isLoadMore ? cursor : undefined, 12, searchTerm, selectedCategoryId);

      let filteredItems = data.items || [];

      if (isLoadMore) {
        setItems((prevItems) => [...prevItems, ...filteredItems]);
      } else {
        setItems(filteredItems);
      }
      setTotalItems(filteredItems.length);
      setHasMore(data.hasMore || false);

      if (selectedTags.length > 0) {
        if (isLoadMore) {
          setCurrentPage((prev) => prev + 1);
        } else {
          setCurrentPage(1);
        }
      } else {
        if ("cursor" in data) {
          setCursor((data as any).cursor);
        }
      }
    } catch (err) {
      if (!isLoadMore) {
        setError("Gagal memuat produk");
        console.error("Error fetching items:", err);
        setItems([]);
        setTotalItems(0);
        setHasMore(false);
      }
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchItems(searchQuery || undefined, true);
    }
  }, [loadingMore, hasMore, searchQuery, selectedTags, selectedCategoryId]);

  const lastElementRef = useInfiniteScroll(loadMore, hasMore, loadingMore);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await apiClient.getCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategoryId(Number(categoryParam));
    }
  }, []);

  useEffect(() => {
    onTagsUpdate(selectedCategoryId);
  }, [selectedCategoryId]);

  useEffect(() => {
    setCursor(undefined);
    setCurrentPage(1);
    setItems([]);
    setTotalItems(0);
    setHasMore(false);
    fetchItems(searchQuery || undefined);
  }, [selectedTags, selectedCategoryId, searchQuery]);

  const handleAddToCart = (item: Item) => {
    addToCart(item);
  };

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    if (categoryId) {
      setSearchParams({ category: categoryId.toString() });
    } else {
      setSearchParams({});
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Don't open search page if we're clearing
    if (!isClearingRef.current) {
      setShowSearchPage(true);
    }
    // Reset the flag after a short delay
    setTimeout(() => {
      isClearingRef.current = false;
    }, 100);
  };

  const handleClearSearch = () => {
    isClearingRef.current = true;
    setSearchQuery("");
    setHasSearched(false);
    setCursor(undefined);
    setCurrentPage(1);
    setItems([]);
    setTotalItems(0);
    setHasMore(false);
    setSelectedCategoryId(null);
    setSearchParams({});
    setShowSearchPage(false);
    fetchItems();
  };

  const handleSearch = () => {
    setHasSearched(true);
    setCursor(undefined);
    setCurrentPage(1);
    setItems([]);
    setTotalItems(0);
    setHasMore(false);
    // Force a fresh search by clearing all state first
    fetchItems(searchQuery || undefined);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };


  const handleBuyNow = (item: Item) => {
    addToCart(item);
    navigate("/cart");
  };

  const handleViewDetails = (item: Item) => {
    navigate(`/item/${item.id}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <Text className="loading-text">Memuat produk menarik...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <Title level={4}>Ups! Terjadi kesalahan</Title>
              <Text type="secondary">{error}</Text>
              <Button
                type="primary"
                onClick={() => window.location.reload()}
                className="retry-btn"
              >
                Coba Lagi
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  if (showSearchPage) {
    return (
      <SearchPage
        onCategorySelect={setSelectedCategoryId}
        onClose={() => setShowSearchPage(false)}
        onSearch={(query) => {
          setSearchQuery(query);
          setHasSearched(true);
          setShowSearchPage(false);
          setCursor(undefined);
          setCurrentPage(1);
          setItems([]);
          setTotalItems(0);
          setHasMore(false);
          fetchItems(query);
        }}
        initialQuery={searchQuery}
      />
    );
  }

  return (
    <div className="modern-home-page">
      <div className="search-filter-section">
        <div className="search-container">
          <Search
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={handleSearchChange}
            onSearch={handleSearch}
            onKeyPress={handleKeyPress}
            onFocus={handleSearchFocus}
            className="modern-search"
            size="large"
            enterButton={<SearchOutlined />}
            allowClear
            onClear={handleClearSearch}
          />
        </div>
      </div>

        {categories.length > 0 && (
          <CategoriesMenu
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onCategorySelect={handleCategorySelect}
          />
        )}

      <PopularTags
        popularTags={popularTags}
        selectedTags={selectedTags}
        onTagToggle={onTagToggle}
        onShowMoreTags={onShowMoreTags}
        allTags={allTags}
      />

      {selectedTags.length === 0 && !hasSearched && selectedCategoryId === null && (
        <PromoCarousel
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onViewDetails={handleViewDetails}
        />
      )}

      <div className="products-grid">
        {items.map((item) => (
          <ProductGridItem
            key={item.id}
            item={item}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      {items.length === 0 && !loading && (
        <div className="no-results">
          <Empty
            description={
              <div>
                <Title level={4}>Tidak di temukan item</Title>
                <Text type="secondary">
                  Coba sesuaikan pencarian atau filter Anda
                </Text>
              </div>
            }
          />
        </div>
      )}

      {items.length > 0 && (
        <div
          style={{
            marginTop: "32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          {loadingMore && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Spin size="small" />
              <Text type="secondary">Memuat lebih banyak produk...</Text>
            </div>
          )}

          {hasMore && !loadingMore && (
            <div
              ref={lastElementRef}
              style={{ height: "20px", width: "100%" }}
            />
          )}

          {!hasMore && items.length > 0 && (
            <Text type="secondary" style={{ textAlign: "center" }}>
              {selectedTags.length > 0 
                ? `Semua produk telah dimuat (${items.length} dari ${totalItems} produk)`
                : `Semua produk telah dimuat (${items.length} produk)`
              }
            </Text>
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;


