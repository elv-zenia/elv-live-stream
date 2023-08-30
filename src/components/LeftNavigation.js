import React from "react";
import {NavLink} from "react-router-dom";
import {appRoutes} from "../index";
import ImageIcon from "Components/ImageIcon";

const LeftNavigation = () => {
  return (
    <nav className="navigation">
      {
        appRoutes.filter(({path}) => path !== "/").map(({path, label, icon}) => (
          <NavLink to={path} key={path} className={"navigation__link"}>
            <ImageIcon icon={icon} />
            { label }
          </NavLink>
        ))
      }
    </nav>
  );
};

export default LeftNavigation;
