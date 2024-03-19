import DetailsPanel from "Pages/stream-details/DetailsPanel";
import PlayoutPanel from "Pages/stream-details/PlayoutPanel";

export const AV_STREAM = {
  DEFAULT: "default",
  CUSTOM: "specific"
};

export const ENCRYPTION_TYPES = {
  DRM: "drm",
  CLEAR: "clear"
};

export const STATUS_MAP = {
  UNCONFIGURED: "unconfigured",
  UNINITIALIZED: "uninitialized",
  INACTIVE: "inactive",
  STOPPED: "stopped",
  STARTING: "starting",
  RUNNING: "running",
  STALLED: "stalled",
  DEGRADED: "degraded"
};

export const DETAILS_TABS = [
  {label: "Details", value: "details", Component: DetailsPanel},
  {label: "Playout", value: "playout", Component: PlayoutPanel}
];

export const DEFAULT_WATERMARK_TEXT = {
  "font_color": "white@0.5",
  "font_relative_height": 0.05,
  "shadow": true,
  "shadow_color": "black@0.5",
  "template": "PREPARED FOR $USERNAME - DO NOT DISTRIBUTE",
  "x": "(w-tw)/2",
  "y": "h-(4*lh)"
};
