import "./app.less";

import { Suspense, lazy, useCallback, useState } from "preact/compat";

import { toDataURL } from "qrcode";
import { knownFiles } from "./knownFiles";
import version from "./version.json";

type Value = null | number | string;

const fileRoot =
  "https://github.com/arobertson0/pages/raw/refs/heads/main/files";

function parseValue(v: string): Value {
  if (v === "null") return null;
  if (v === "") return null;
  const num = Number.parseInt(v, 10);
  if (!Number.isNaN(num)) {
    if (num >= 0 && num < knownFiles.length) return num;
    return null;
  }
  return v;
}

function printValue(v: Value): string {
  if (v === null) return "";
  if (typeof v === "number") return `${v}`;
  return v;
}

export function App() {
  const [file, setFile] = useState<Value>(getSearch());

  return (
    <div>
      <h1>USDZ test page v{version}</h1>
      <div className="row">
        <div>
          <h2>Files</h2>
          <Files value={file} onChange={setFile} />
        </div>
        <div>
          <h2>Viewer</h2>
          <Viewer file={file} />
        </div>
        <div>
          <h2>QR</h2>
          <QR />
        </div>
      </div>
    </div>
  );
}

interface ViewerProps {
  file: Value;
}
function Viewer({ file }: ViewerProps) {
  if (file === null) return "No file selected";

  const fileName = typeof file === "number" ? knownFiles[file] : file;
  const href = `${fileRoot}/${fileName}?r=${Math.random()
    .toString(36)
    .substring(2)}`;
  return (
    <a className="column" rel="ar" href={href}>
      View in AR
      <img src="https://docs-assets.developer.apple.com/published/871b39e1a8262c994c20c3b10c91c808/arkit-glyph~dark@2x.png" />
    </a>
  );
}

function QR() {
  const currentUrl = window.location.href;

  const HostList = lazy(async () => {
    const hostImage = await toDataURL(currentUrl, {
      color: { light: "#222", dark: "#eee" },
      margin: 0,
      scale: 8,
    });

    return () => (
      <a className="column" href={currentUrl}>
        {currentUrl}
        <img src={hostImage} />
      </a>
    );
  });

  return (
    <Suspense fallback="Loading...">
      <ul>
        <HostList />
      </ul>
    </Suspense>
  );
}

interface FilesProps {
  value: null | string | number;
  onChange: (value: null | string | number) => void;
}

function setSearch(v: Value) {
  const currentUrl = new URL(window.location.href);
  if (v === null) {
    currentUrl.searchParams.delete("v");
  } else {
    currentUrl.searchParams.set("v", printValue(v));
  }
  window.history.replaceState({}, "", currentUrl.toString());
}

function getSearch(): Value {
  const currentUrl = new URL(window.location.href);
  const parsed = parseValue(currentUrl.searchParams.get("v") || "");
  setSearch(parsed);
  return parsed;
}

function Files({ value, onChange }: FilesProps) {
  const handleChange = useCallback((event: Event) => {
    const target = event.target! as HTMLSelectElement | HTMLInputElement;
    const value = target.value;

    const v = parseValue(value);
    setSearch(v);
    onChange(v);
  }, []);

  const handleClear = useCallback(() => {
    onChange(null);
  }, []);

  const knownSelectValue = typeof value === "number" ? value : null;
  const unknownInputValue = typeof value === "string" ? value : "";

  return (
    <div className="filechoose">
      <select name="known-select" onChange={handleChange}>
        <option selected={knownSelectValue === null} value="null">
          Select a file
        </option>
        {knownFiles.map((file, idx) => (
          <option
            key={file}
            value={`${idx}`}
            selected={knownSelectValue === idx}
          >
            {file}
          </option>
        ))}
      </select>
      <input
        name="unknown-input"
        type="text"
        value={unknownInputValue}
        onChange={handleChange}
      />
      <button onClick={handleClear}>Clear</button>
    </div>
  );
}
