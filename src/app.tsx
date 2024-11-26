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
  const knownHosts = [
    "http://localhost:5174/",
    "http://10.255.255.254:5174/",
    "http://172.20.103.242:5174/",
  ];
  const HostList = lazy(async () => {
    const hostElements: JSX.Element[] = [];

    for (const host of knownHosts) {
      const hostImage = await toDataURL(host, {
        color: { light: "#222", dark: "#eee" },
        margin: 0,
        scale: 8,
      });
      hostElements.push(
        <li>
          <a className="host-list" href={host}>
            {host}
            <img src={hostImage} />
          </a>
        </li>
      );
    }

    return () => <>{hostElements}</>;
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
