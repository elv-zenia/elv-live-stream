import {STATUS_MAP} from "@/utils/constants";
import Fraction from "fraction.js";

export const ParseLiveConfigData = ({
  url,
  referenceUrl,
  encryption,
  retention,
  audioFormData
}) => {
  const config = {
    drm: encryption?.includes("drm") ? "drm" : encryption.includes("clear") ? "clear" : undefined,
    drm_type: encryption,
    audio: audioFormData ? audioFormData : null,
    part_ttl: parseInt(retention),
    url,
    reference_url: referenceUrl
  };

  return config;
};

export const Slugify = (string) => {
  return (string || "")
    .toLowerCase()
    .trim()
    .replace(/ /g, "-")
    .replace(/[^a-z0-9-]/g,"")
    .replace(/-+/g, "-");
};

export const VideoBitrateReadable = (bitrate) => {
  if(!bitrate) { return ""; }
  const denominator = 1000000;
  let value = (bitrate / denominator).toFixed(1);

  return `${value}Mbps`;
};

export const AudioBitrateReadable = (bitrate) => {
  if(!bitrate) { return ""; }
  const denominator = 1000;
  const value = (bitrate / denominator).toFixed(0);

  return `${value} Kbps`;
};

export const StreamIsActive = (state) => {
  let active = false;

  if([STATUS_MAP.STARTING, STATUS_MAP.RUNNING, STATUS_MAP.STALLED, STATUS_MAP.STOPPED].includes(state)) {
    active = true;
  }

  return active;
};

export const StatusIndicator = (status) => {
  if(status === STATUS_MAP.STOPPED) {
    return "elv-orange.6";
  } else if(status === STATUS_MAP.RUNNING) {
    return "elv-green.5";
  } else if([STATUS_MAP.INACTIVE, STATUS_MAP.UNINITIALIZED, STATUS_MAP.UNINITIALIZED, STATUS_MAP.STALLED].includes(status)) {
    return "elv-red.4";
  } else if(status === STATUS_MAP.DEGRADED) {
    return "elv-yellow.6";
  }
};

export const FormatTime = ({milliseconds, iso, format="hh,mm,ss"}) => {
  if(iso) {
    milliseconds = new Date(iso).getTime();
  }

  if(!milliseconds) { return ""; }

  const hours = new Fraction(milliseconds, 1000)
    .div(3600)
    .mod(24)
    .floor(0)
    .toString();
  const minutes = new Fraction(milliseconds, 1000)
    .div(60)
    .mod(60)
    .floor(0)
    .toString();
  const seconds = new Fraction(milliseconds, 1000)
    .mod(60)
    .floor(0)
    .toString();

  let timeString = `${hours}h ${minutes}min`;

  if(format === "hh:mm:ss") {
    const arrayValue = [
      hours.padStart(2, "0"),
      minutes.padStart(2, "0"),
      seconds.padStart(2, "0")
    ];

    timeString = arrayValue.join(":");
    // timeString = `${hours}h ${minutes}min ${seconds}sec`
  } else if(format === "hh,mm") {
    timeString = `${hours}h ${minutes}min`;
  } else if(format === "hh,mm,ss") {
    timeString = `${hours}h ${minutes}min ${seconds}sec`;
  }

  return timeString;
};

// Convert a FileList to file info
export const FileInfo = async ({path, fileList}) => {
  return Promise.all(
    Array.from(fileList).map(async file => {
      const data = file;
      const filePath = file.webkitRelativePath || file.name;
      return {
        path: `${path}${filePath}`.replace(/^\/+/g, ""),
        type: "file",
        size: file.size,
        mime_type: file.type,
        data
      };
    })
  );
};

export const Pluralize = ({base, suffix="s", count}) => {
  return `${count} ${base}${count > 1 ? suffix : ""}`;
};

export const SortTable = ({sortStatus, AdditionalCondition}) => {
  return (a, b) => {
    if(AdditionalCondition && typeof AdditionalCondition(a, b) !== "undefined") {
      return AdditionalCondition(a, b);
    }

    a = a[sortStatus.columnAccessor];
    b = b[sortStatus.columnAccessor];

    if(typeof a === "number") {
      a = a || 0;
      b = b || 0;
    } else {
      a = a?.toLowerCase?.() || a || "";
      b = b?.toLowerCase?.() || b || "";
    }

    return (a < b ? -1 : 1) * (sortStatus.direction === "asc" ? 1 : -1);
  };
};

export const DateFormat = ({time, format="sec", options={}}) => {
  if(!["sec", "iso", "ms"].includes(format)) { throw Error("Invalid format type provided."); }

  if(format === "sec") {
    time = time * 1000;
  }

  return new Date(time).toLocaleString(navigator.language, options);
};

export const SanitizeUrl = ({url}) => {
  if(!url) {
    return "";
  }

  try {
    const urlObject = new URL(url);
    urlObject.searchParams.delete("passphrase");

    return urlObject.toString();
  } catch(error) {
    // eslint-disable-next-line no-console
    console.error(`Unable to sanitize ${url}`, error);
    return false;
  }
};

const FallbackCopyToClipboard = ({text}) => {
  const element = document.createElement("textarea");
  element.value = text;
  element.style.all = "unset";
  // Avoid screen readers from reading text out loud
  element.ariaHidden = "true";
  // used to preserve spaces and line breaks
  element.style.whiteSpace = "pre";
  // do not inherit user-select (it may be `none`)
  element.style.webkitUserSelect = "text";
  element.style.MozUserSelect = "text";
  element.style.msUserSelect = "text";
  element.style.userSelect = "text";

  document.body.appendChild(element);
  element.focus();
  element.select();

  try {
    document.execCommand("copy");
    document.body.removeChild(element);
  } catch(error) {
    // eslint-disable-next-line no-console
    console.error("Unable to copy to clipboard", error);
  }
};

export const CopyToClipboard = ({text}) => {
  if(!navigator.clipboard) {
    FallbackCopyToClipboard({text});
    return;
  }

  navigator.clipboard.writeText(text)
    .catch(error => {
      if(error instanceof DOMException && error.name === "NotAllowedError") {
        FallbackCopyToClipboard({text});
      } else {
        // eslint-disable-next-line no-console
        console.error("Unable to copy to clipboard", error);
      }
    });
};
