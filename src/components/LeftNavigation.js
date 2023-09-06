import React from "react";
import {NavLink} from "react-router-dom";
import ImageIcon from "Components/ImageIcon";
import VideoPlusIcon from "Assets/icons/video-plus";
import StreamIcon from "Assets/icons/stream";
import MediaIcon from "Assets/icons/media";

const LeftNavigation = () => {
  return (
    <nav className="navigation">
      <NavLink to="/create" className="navigation__link">
        <ImageIcon icon={VideoPlusIcon} />
        Create
      </NavLink>
      <NavLink to="/streams" className="navigation__link">
        <ImageIcon icon={StreamIcon} />
        Streams
      </NavLink>
      <NavLink to="/monitor" className="navigation__link">
        <ImageIcon icon={MediaIcon} />
        Monitor
      </NavLink>
    </nav>
  );
};

export default LeftNavigation;
