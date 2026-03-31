import React, { useEffect, useState, useRef } from "react";
import { Input, Typography } from "antd";
import { ArrowLeftOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Category } from "../types";
import { apiClient } from "../api";
import "./SearchPage.css";

const { Search } = Input;

const SearchPage: React.FC<{
  onCategorySelect: (categoryId: number | null) => void;
  onClose: () => void;
  onSearch?: (query: string) => void;
  initialQuery?: string;
}> = ({ onCategorySelect, onClose, onSearch, initialQuery = "" }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const searchInputRef = useRef<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await apiClient.getCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    // Auto-focus the search input when the page opens
    if (searchInputRef.current) {
      const input = searchInputRef.current.input || searchInputRef.current;
      if (input && typeof input.focus === 'function') {
        setTimeout(() => {
          input.focus();
        }, 100);
      }
    }
  }, []);

  const handleCategoryClick = (category: Category) => {
    onCategorySelect(category.id);
    onClose();
    navigate("/");
  };


  const handleBack = () => {
    onClose();
    navigate("/");
  };

  const handleSearch = () => {
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
      onClose();
      navigate("/");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="search-page-container">
      <div className="search-filter-section">
        <div className="search-container">
          <ArrowLeftOutlined className="search-back-icon" onClick={handleBack} />
          <Search
            ref={searchInputRef}
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={handleSearchChange}
            onSearch={handleSearch}
            onKeyPress={handleKeyPress}
            className="modern-search"
            size="large"
            enterButton={<SearchOutlined />}
            allowClear
            onClear={handleClearSearch as any}
            autoFocus
          />
        </div>
      </div>

      <div className="search-page-content">
        <div className="search-categories-section">
          <Typography.Title level={4} className="search-section-title">
            Pencarian Pilihan
          </Typography.Title>
          <div className="search-categories-grid">
            {categories.map((category) => (
              <div
                key={category.id}
                className="search-category-card"
                onClick={() => handleCategoryClick(category)}
              >
                <div className="search-category-image-container">
                  {category.pict ? (
                    <img
                      src={category.pict}
                      alt={category.name}
                      className="search-category-image"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        if (e.currentTarget.nextElementSibling) {
                          (e.currentTarget.nextElementSibling as HTMLElement).style.display =
                            "flex";
                        }
                      }}
                    />
                  ) : null}
                  <div
                    className="search-category-image-placeholder"
                    style={{ display: category.pict ? "none" : "flex" }}
                  >
                    {category.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="search-category-name">{category.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;

