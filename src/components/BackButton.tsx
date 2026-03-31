import React from "react";
import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

interface BackButtonProps {
  onBackClick: () => void;
  title?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ onBackClick, title }) => {
  return (
    <div className="back-button-container">
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={onBackClick}
        className="back-button"
      />
      {title && <span className="back-button-title">{title}</span>}
    </div>
  );
};

export default BackButton;
