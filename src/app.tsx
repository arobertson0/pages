import "./app.less";

import { JSX, Suspense, lazy } from "preact/compat";

import { toDataURL } from "qrcode";

export function App() {
  return (
    <div>
      <h1>USDZ test page</h1>
      <div className="cols">
        <div>
          <h2>Viewer</h2>
          <Viewer />
        </div>
        <div>
          <h2>Hosts</h2>
          <Hosts />
        </div>
        <div>
          <h2>Files</h2>
          <Files />
        </div>
      </div>
    </div>
  );
}

function Viewer() {
  return null;
}

function Hosts() {
  const currentUrl = window.location.href;

  const HostList = lazy(async () => {
    const hostImage = await toDataURL(currentUrl, {
      color: { light: "#222", dark: "#eee" },
      margin: 0,
      scale: 8,
    });

    return () => (
      <li>
        <a className="host-list" href={currentUrl}>
          {currentUrl}
          <img src={hostImage} />
        </a>
      </li>
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

function Files() {
  return null;
}
