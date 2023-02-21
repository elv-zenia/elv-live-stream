import React from "react";
import {NavLink} from "react-router-dom";
import {appRoutes} from "../index";

const LeftNavigation = () => {
  return (
    <nav className="navigation">
      {
        appRoutes.map(({path, label}) => (
          <NavLink to={path} key={path} className={"navigation__link"}>{ label }</NavLink>
        ))
      }
    </nav>
  );
};

export default LeftNavigation;
