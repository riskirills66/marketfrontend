import React, { useEffect, useRef } from "react";
import { Category } from "../../types";

const CategoriesMenu: React.FC<{
  categories: Category[];
  selectedCategoryId: number | null;
  onCategorySelect: (categoryId: number | null) => void;
}> = React.memo(({ categories, selectedCategoryId, onCategorySelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedItemRef.current && containerRef.current) {
      const container = containerRef.current;
      const selectedElement = selectedItemRef.current;

      const elementLeft = selectedElement.offsetLeft;
      const elementWidth = selectedElement.offsetWidth;
      const containerWidth = container.offsetWidth;
      const maxScroll = container.scrollWidth - containerWidth;

      // Calculate scroll position to center the element
      let scrollTarget = elementLeft + elementWidth / 2 - containerWidth / 2;

      // Clamp scroll position to valid range
      scrollTarget = Math.max(0, Math.min(scrollTarget, maxScroll));

      // Scroll instantly
      container.scrollTo({
        left: scrollTarget,
        behavior: "auto",
      });
    }
  }, [selectedCategoryId]);

  return (
    <div className="categories-menu-container" ref={containerRef}>
      <div className="categories-menu">
        <div
          ref={selectedCategoryId === null ? selectedItemRef : null}
          className={`category-item ${selectedCategoryId === null ? "active" : ""}`}
          onClick={() => onCategorySelect(null)}
        >
          <span>Semua</span>
        </div>
        {categories.map((category) => (
          <div
            key={category.id}
            ref={selectedCategoryId === category.id ? selectedItemRef : null}
            className={`category-item ${selectedCategoryId === category.id ? "active" : ""}`}
            onClick={() => onCategorySelect(category.id)}
          >
            <span>{category.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

export default CategoriesMenu;

