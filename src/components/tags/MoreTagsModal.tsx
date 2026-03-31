import React from "react";
import { Modal, Button } from "antd";
import { Tag } from "../../types";
import { CheckOutlined } from "@ant-design/icons";

const MoreTagsModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  allTags: Tag[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onClearSelection: () => void;
}> = ({
  visible,
  onClose,
  allTags,
  selectedTags,
  onTagToggle,
  onClearSelection,
}) => {
  return (
    <Modal
      title="Pilih Tag"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="clear" onClick={onClearSelection}>
          Hapus Semua
        </Button>,
        <Button key="close" type="primary" onClick={onClose}>
          Tutup
        </Button>,
      ]}
      width={600}
    >
      <div className="more-tags-content">
        <div className="more-tags-grid">
          {allTags.map((tag) => (
            <div
              key={tag.id}
              className={`more-tag-item ${selectedTags.includes(tag.name) ? "active" : ""}`}
              onClick={() => onTagToggle(tag.name)}
            >
              <div
                className="tag-color"
                style={{ backgroundColor: tag.color }}
              />
              <span>{tag.name}</span>
              {selectedTags.includes(tag.name) && (
                <CheckOutlined className="check-icon" />
              )}
            </div>
          ))}
        </div>
        {selectedTags.length > 0 && (
          <div className="selected-tags-preview">
            <div className="selected-tags-label">Tag terpilih:</div>
            <div className="selected-tags-list">
              {selectedTags.map((tagName) => (
                <span key={tagName} className="selected-tag-chip">
                  {tagName}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default MoreTagsModal;


