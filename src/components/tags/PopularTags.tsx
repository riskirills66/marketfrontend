import React from "react";
import { Tag } from "../../types";
import { CheckOutlined } from "@ant-design/icons";

const PopularTags: React.FC<{
  popularTags: Tag[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onShowMoreTags: () => void;
  allTags: Tag[];
}> = React.memo(({ popularTags, selectedTags, onTagToggle, onShowMoreTags, allTags }) => {
  const popularTagNames = popularTags.map((tag) => tag.name);
  const selectedLainnyaTags = selectedTags.filter(
    (tagName) => !popularTagNames.includes(tagName),
  );
  const selectedLainnyaTagObjects = allTags.filter((tag) =>
    selectedLainnyaTags.includes(tag.name),
  );

  const totalTagsCount = allTags.length;
  const shouldShowLainnya = totalTagsCount > 5;

  if (totalTagsCount === 0) {
    return null;
  }

  return (
    <div className="popular-tags-container">
      <div className="popular-tags">
        {popularTags.map((tag) => (
          <div
            key={tag.id}
            className={`popular-tag ${selectedTags.includes(tag.name) ? "active" : ""}`}
            onClick={() => onTagToggle(tag.name)}
          >
            <div className="tag-color" style={{ backgroundColor: tag.color }} />
            <span>{tag.name}</span>
          </div>
        ))}

        {selectedLainnyaTagObjects.map((tag) => (
          <div
            key={tag.id}
            className={`popular-tag lainnya-selected-tag ${selectedTags.includes(tag.name) ? "active" : ""}`}
            onClick={() => onTagToggle(tag.name)}
          >
            <div className="tag-color" style={{ backgroundColor: tag.color }} />
            <span>{tag.name}</span>
          </div>
        ))}

        {shouldShowLainnya && (
          <div className="popular-tag lainnya-tag" onClick={onShowMoreTags}>
            <span>Lainnya</span>
          </div>
        )}
      </div>
    </div>
  );
});

export default PopularTags;


