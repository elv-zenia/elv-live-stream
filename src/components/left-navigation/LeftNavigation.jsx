import {VideoPlusIcon, StreamIcon, MediaIcon} from "@/assets/icons";
import {AppShell, NavLink} from "@mantine/core";
import {useLocation, useNavigate} from "react-router-dom";
import styles from "./LeftNavigation.module.css";

const NAV_LINKS = [
  {path: "/create", label: "Create", icon: <VideoPlusIcon />},
  {path: "/streams", label: "Streams", icon: <StreamIcon />},
  {path: "/monitor", label: "Monitor", icon: <MediaIcon />}
];

const LeftNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppShell.Navbar p="12 0" classNames={styles}>
      {
        NAV_LINKS.map(({path, label, icon}) => (
          <NavLink
            key={`navigation-link-${path}`}
            className={styles.navLink}
            href="#"
            onClick={() => navigate(path)}
            label={label}
            leftSection={icon}
            active={path === location.pathname}
          />
        ))
      }
    </AppShell.Navbar>
  );
};

export default LeftNavigation;
