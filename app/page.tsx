"use client";

import type { CSSProperties, Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const FEATURE_DATA = [
  {
    id: "architecture",
    label: "Hybrid core architecture",
    category: "Performance",
    focus: "cores",
    stat: "Up to 16 cores",
    metric: "4 P-cores + 8 E-cores + 4 LP E-cores",
    benefit:
      "Responsive foreground work, parallel throughput, and efficient everyday tasks in one mobile processor.",
    proof:
      "The local product brief lists next-gen P-cores, E-cores, and Low Power E-cores with up to 16 total cores on leading SKUs.",
    position: [-1.72, 0.98, 0.54],
    angle: -0.7,
    color: "#00c7fd",
  },
  {
    id: "arc",
    label: "Built-in Intel Arc GPU",
    category: "Graphics",
    focus: "graphics",
    stat: "Up to 12 Xe-cores",
    metric: "Intel Arc B390 on select SKUs",
    benefit:
      "Premium integrated graphics for thin and light systems, creative workflows, AI, and smoother gaming.",
    proof:
      "Intel publishes Series 3 SKUs with Intel Arc B390 GPU options, up to 12 Xe-cores, and GPU AI acceleration.",
    position: [1.34, 0.98, 0.48],
    angle: 0.7,
    color: "#7dfc89",
  },
  {
    id: "xess",
    label: "XeSS 3 game pipeline",
    category: "Gaming",
    focus: "graphics",
    stat: "AI upscaling + frame generation",
    metric: "XeSS-SR, XeSS-MFG, and XeLL",
    benefit:
      "A richer on-the-go play story: higher perceived frame rates, smoother motion, and lower latency when supported.",
    proof:
      "The brief describes XeSS 3 as a package of AI-driven Super Resolution, Multi-Frame Generation, and Xe Low Latency.",
    position: [2.3, 0.94, -0.48],
    angle: 1.18,
    color: "#f6d84f",
  },
  {
    id: "npu",
    label: "NPU 5 architecture",
    category: "AI",
    focus: "ai",
    stat: "Up to 50 NPU TOPS",
    metric: "Low-power sustained AI",
    benefit:
      "Keeps AI assistive work local and efficient, saving battery for workflows that should not need the cloud.",
    proof:
      "Intel positions the Series 3 NPU as low power, ideal for sustained AI workloads and AI offload for battery life.",
    position: [-0.18, 1.04, -0.2],
    angle: -0.08,
    color: "#8d7cff",
  },
  {
    id: "triEngine",
    label: "CPU + GPU + NPU AI PC",
    category: "AI ecosystem",
    focus: "ai",
    stat: "350+ ISVs",
    metric: "500+ AI features, 900+ models",
    benefit:
      "Routes work to the right engine: GPU for throughput, NPU for sustained efficiency, CPU for fast response.",
    proof:
      "Intel cites a broad AI ecosystem with hundreds of ISVs, accelerated features, and supported AI models.",
    position: [0.16, 1.34, 0.9],
    angle: 0.0,
    color: "#00f0b5",
  },
  {
    id: "mobility",
    label: "Evo-class mobility",
    category: "Mobility",
    focus: "platform",
    stat: "Engineered to go unplugged",
    metric: "Evo verification + intelligent power",
    benefit:
      "Premium laptop designs stay responsive on battery, wake quickly, and stretch play or creative sessions longer.",
    proof:
      "Intel describes Evo verification across performance, battery life, connectivity, audio, visual quality, size, and weight.",
    position: [-1.92, 0.86, -0.9],
    angle: -1.12,
    color: "#ff9d42",
  },
  {
    id: "connectivity",
    label: "Thunderbolt and Wi-Fi 7",
    category: "Platform",
    focus: "platform",
    stat: "80 Gbps bidirectional",
    metric: "Thunderbolt 5 support + Wi-Fi 7 R2",
    benefit:
      "High-speed docks, displays, storage, sharing, streaming, collaboration, and gaming with less friction.",
    proof:
      "The brief lists Thunderbolt 5 support, integrated Thunderbolt 4 ports, Wi-Fi 7 R2, and Dual Bluetooth Core 6.0.",
    position: [2.88, 0.82, 0.88],
    angle: 1.4,
    color: "#52d6ff",
  },
  {
    id: "edge",
    label: "Edge-ready AI",
    category: "Edge",
    focus: "platform",
    stat: "-40 C to 100 C",
    metric: "Industrial-grade support on select SKUs",
    benefit:
      "Brings integrated CPU, GPU, and NPU acceleration to robotics, retail, healthcare, smart cities, and automation.",
    proof:
      "Intel says select Series 3 edge processors support embedded and industrial use cases, including extended temperature ranges.",
    position: [-2.88, 0.82, 0.02],
    angle: -1.62,
    color: "#ff6b6b",
  },
] as const;

type Feature = (typeof FEATURE_DATA)[number];
type FeatureId = Feature["id"];
type FocusMode = "all" | "cores" | "ai" | "graphics" | "platform";
type LayerPart = {
  object: THREE.Object3D;
  compactY: number;
  explodedY: number;
};

const STAT_RAIL = [
  ["Intel 18A", "first AI PC platform built on Intel 18A"],
  ["Up to 16", "CPU cores"],
  ["Up to 50", "NPU TOPS"],
  ["Up to 12", "Xe-cores"],
  ["80 / 120", "Gbps Thunderbolt 5 modes"],
  ["200+", "PC designs"],
];

const SOURCES = [
  {
    label: "Workspace brief",
    detail: "Intel Core Ultra Series 3 Processors - Product Brief v1.2.pdf",
  },
  {
    label: "Intel product page",
    href: "https://www.intel.com/content/www/us/en/products/details/processors/core-ultra/article.html",
  },
  {
    label: "Intel newsroom launch",
    href: "https://newsroom.intel.com/client-computing/ces-2026-intel-core-ultra-series-3-debut-first-built-on-intel-18a",
  },
  {
    label: "Intel Core Ultra X9 388H specs",
    href: "https://www.intel.com/content/www/us/en/products/sku/245526/intel-core-ultra-x9-processor-388h-18m-cache-up-to-5-10-ghz/specifications.html",
  },
];

function useTour(
  enabled: boolean,
  visibleFeatures: readonly Feature[],
  onSelect: Dispatch<SetStateAction<FeatureId>>,
) {
  useEffect(() => {
    if (!enabled || visibleFeatures.length < 2) {
      return;
    }

    const intervalId = window.setInterval(() => {
      onSelect((currentId) => {
        const currentIndex = visibleFeatures.findIndex(
          (feature) => feature.id === currentId,
        );
        const nextFeature =
          visibleFeatures[(currentIndex + 1) % visibleFeatures.length] ??
          visibleFeatures[0];
        return nextFeature.id;
      });
    }, 4200);

    return () => window.clearInterval(intervalId);
  }, [enabled, onSelect, visibleFeatures]);
}

export default function Home() {
  const [activeId, setActiveId] = useState<FeatureId>("architecture");
  const [focus, setFocus] = useState<FocusMode>("all");
  const [exploded, setExploded] = useState(false);
  const [tourEnabled, setTourEnabled] = useState(false);
  const [search, setSearch] = useState("");
  const [showSources, setShowSources] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);

  const visibleFeatures = useMemo(() => {
    const query = search.trim().toLowerCase();

    return FEATURE_DATA.filter((feature) => {
      const matchesFocus = focus === "all" || feature.focus === focus;
      const matchesSearch =
        query.length === 0 ||
        `${feature.label} ${feature.category} ${feature.stat} ${feature.metric}`
          .toLowerCase()
          .includes(query);

      return matchesFocus && matchesSearch;
    });
  }, [focus, search]);

  const activeFeature = useMemo(
    () =>
      FEATURE_DATA.find((feature) => feature.id === activeId) ??
      FEATURE_DATA[0],
    [activeId],
  );

  useEffect(() => {
    if (
      visibleFeatures.length > 0 &&
      !visibleFeatures.some((feature) => feature.id === activeId)
    ) {
      setActiveId(visibleFeatures[0].id);
    }
  }, [activeId, visibleFeatures]);

  useTour(tourEnabled, visibleFeatures, setActiveId);

  const selectFeature = useCallback((id: FeatureId) => {
    setActiveId(id);
    setTourEnabled(false);
  }, []);

  const resetExperience = () => {
    setActiveId("architecture");
    setFocus("all");
    setExploded(false);
    setTourEnabled(false);
    setSearch("");
    setResetSignal((value) => value + 1);
  };

  return (
    <main className="experience-shell">
      <section className="processor-stage" aria-label="Interactive processor">
        <header className="stage-nav">
          <div className="brand-lockup" aria-label="Intel Core Ultra Series 3">
            <span className="intel-word">intel</span>
            <span>Core Ultra Series 3</span>
          </div>
          <button
            className="source-toggle"
            type="button"
            onClick={() => setShowSources((value) => !value)}
            aria-expanded={showSources}
          >
            Sources
          </button>
        </header>

        <div className="hero-copy">
          <p>Silicon anatomy</p>
          <h1>Intel Core Ultra Series 3 processors, explored from the inside.</h1>
        </div>

        <div className="stage-toolbar" aria-label="View controls">
          <button
            className={tourEnabled ? "tool-button active" : "tool-button"}
            type="button"
            onClick={() => setTourEnabled((value) => !value)}
            aria-pressed={tourEnabled}
          >
            <span className="tool-glyph">A</span>
            Tour
          </button>
          <button
            className={exploded ? "tool-button active" : "tool-button"}
            type="button"
            onClick={() => setExploded((value) => !value)}
            aria-pressed={exploded}
          >
            <span className="tool-glyph">X</span>
            X-ray
          </button>
          <button className="tool-button" type="button" onClick={resetExperience}>
            <span className="tool-glyph">R</span>
            Reset
          </button>
        </div>

        <ChipScene
          activeId={activeFeature.id}
          exploded={exploded}
          focus={focus}
          resetSignal={resetSignal}
          onSelect={selectFeature}
        />

        <div className="stat-rail" aria-label="Series 3 proof points">
          {STAT_RAIL.map(([stat, label]) => (
            <div className="rail-item" key={label}>
              <strong>{stat}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {showSources ? (
          <div className="sources-drawer">
            {SOURCES.map((source) =>
              source.href ? (
                <a key={source.label} href={source.href}>
                  {source.label}
                </a>
              ) : (
                <span key={source.label}>{source.detail}</span>
              ),
            )}
          </div>
        ) : null}
      </section>

      <aside className="feature-panel" aria-label="Product feature explorer">
        <div className="panel-top">
          <div>
            <p className="eyebrow">Product features</p>
            <h2>Choose a processor layer.</h2>
          </div>
          <div className="status-pill">{activeFeature.category}</div>
        </div>

        <div className="search-wrap">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search features"
            aria-label="Search features"
          />
        </div>

        <div className="mode-tabs" role="tablist" aria-label="Feature focus">
          {[
            ["all", "All"],
            ["cores", "Cores"],
            ["ai", "AI"],
            ["graphics", "GPU"],
            ["platform", "Platform"],
          ].map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              className={focus === mode ? "mode-tab active" : "mode-tab"}
              onClick={() => setFocus(mode as FocusMode)}
              role="tab"
              aria-selected={focus === mode}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="feature-list">
          {visibleFeatures.length > 0 ? (
            visibleFeatures.map((feature) => (
              <button
                className={
                  feature.id === activeFeature.id
                    ? "feature-card active"
                    : "feature-card"
                }
                key={feature.id}
                type="button"
                onClick={() => selectFeature(feature.id)}
                style={{ "--accent": feature.color } as CSSProperties}
              >
                <span>{feature.category}</span>
                <strong>{feature.label}</strong>
                <em>{feature.stat}</em>
              </button>
            ))
          ) : (
            <div className="empty-state">No matching processor layer.</div>
          )}
        </div>

        <article
          className="detail-panel"
          style={{ "--accent": activeFeature.color } as CSSProperties}
        >
          <div className="detail-kicker">{activeFeature.category}</div>
          <h3>{activeFeature.label}</h3>
          <div className="detail-stat">{activeFeature.stat}</div>
          <p>{activeFeature.benefit}</p>
          <dl>
            <div>
              <dt>Engine role</dt>
              <dd>{activeFeature.metric}</dd>
            </div>
            <div>
              <dt>Accuracy note</dt>
              <dd>{activeFeature.proof}</dd>
            </div>
          </dl>
        </article>

        <footer className="legal-note">
          Claims use Intel published "up to" language. Intel Arc graphics,
          Thunderbolt 5 support, Evo verification, vPro, edge features, and
          performance results vary by SKU, system design, software, and OEM
          enablement.
        </footer>
      </aside>
    </main>
  );
}

function ChipScene({
  activeId,
  exploded,
  focus,
  resetSignal,
  onSelect,
}: {
  activeId: FeatureId;
  exploded: boolean;
  focus: FocusMode;
  resetSignal: number;
  onSelect: (id: FeatureId) => void;
}) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({ activeId, exploded, focus, resetSignal, onSelect });

  useEffect(() => {
    stateRef.current = { activeId, exploded, focus, resetSignal, onSelect };
  }, [activeId, exploded, focus, resetSignal, onSelect]);

  useEffect(() => {
    const mount = mountRef.current;
    const canvas = canvasRef.current;

    if (!mount || !canvas) {
      return;
    }

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
    camera.position.set(0, 3.2, 8.8);

    const root = new THREE.Group();
    root.rotation.x = -0.48;
    root.rotation.y = -0.7;
    scene.add(root);

    const ambient = new THREE.AmbientLight(0xcfefff, 0.8);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 2.6);
    key.position.set(4, 6, 5);
    scene.add(key);

    const rim = new THREE.DirectionalLight(0x00c7fd, 2.2);
    rim.position.set(-5, 3, -4);
    scene.add(rim);

    const fill = new THREE.PointLight(0x7dfc89, 26, 16);
    fill.position.set(-2.8, 2.8, 3.4);
    scene.add(fill);

    const substrateMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x050a12,
      metalness: 0.82,
      roughness: 0.38,
      clearcoat: 0.44,
      clearcoatRoughness: 0.22,
    });
    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: 0x6d7988,
      metalness: 0.95,
      roughness: 0.2,
    });
    const lidMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xaebbc6,
      metalness: 0.96,
      roughness: 0.22,
      clearcoat: 0.28,
    });
    const deckMaterial = new THREE.MeshStandardMaterial({
      color: 0x071324,
      metalness: 0.38,
      roughness: 0.24,
    });
    const dieMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x003f9f,
      emissive: 0x002c79,
      emissiveIntensity: 0.45,
      metalness: 0.15,
      roughness: 0.12,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      transparent: true,
      opacity: 0.92,
    });
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x114dff,
      emissive: 0x0528a5,
      emissiveIntensity: 0.8,
      metalness: 0.1,
      roughness: 0.06,
      clearcoat: 1,
      transparent: true,
      opacity: 0.72,
    });
    const traceMaterial = new THREE.LineBasicMaterial({
      color: 0x00c7fd,
      transparent: true,
      opacity: 0.36,
    });
    const etchedTraceMaterial = new THREE.LineBasicMaterial({
      color: 0x9deeff,
      transparent: true,
      opacity: 0.34,
    });

    const packageWidth = 6.5;
    const packageDepth = 3.25;
    const packageBody = new THREE.Mesh(roundedPackageGeometry(packageWidth, packageDepth, 0.22, 0.2), [
      substrateMaterial,
      edgeMaterial,
    ]);
    root.add(packageBody);

    const lid = new THREE.Group();
    lid.position.y = 0.24;
    const outerWidth = 5.9;
    const outerDepth = 2.62;
    const openingWidth = 2.96;
    const openingDepth = 1.56;
    const bar = 0.26;
    const topBar = new THREE.Mesh(
      new THREE.BoxGeometry(outerWidth, 0.08, bar),
      lidMaterial,
    );
    topBar.position.z = outerDepth / 2 - bar / 2;
    lid.add(topBar);
    const bottomBar = topBar.clone();
    bottomBar.position.z = -outerDepth / 2 + bar / 2;
    lid.add(bottomBar);
    const leftBar = new THREE.Mesh(
      new THREE.BoxGeometry(bar, 0.08, openingDepth),
      lidMaterial,
    );
    leftBar.position.x = -openingWidth / 2 - bar / 2;
    lid.add(leftBar);
    const rightBar = leftBar.clone();
    rightBar.position.x = openingWidth / 2 + bar / 2;
    lid.add(rightBar);
    root.add(lid);

    const dieDeck = new THREE.Mesh(
      roundedPackageGeometry(3.08, 1.66, 0.055, 0.09),
      deckMaterial,
    );
    dieDeck.position.y = 0.31;
    root.add(dieDeck);

    const interposer = new THREE.Mesh(
      roundedPackageGeometry(2.66, 1.38, 0.08, 0.08),
      new THREE.MeshPhysicalMaterial({
        color: 0x0c58cc,
        emissive: 0x073189,
        emissiveIntensity: 0.38,
        metalness: 0.24,
        roughness: 0.12,
        clearcoat: 0.8,
        transparent: true,
        opacity: 0.82,
      }),
    );
    interposer.position.y = 0.4;
    root.add(interposer);

    const die = new THREE.Mesh(roundedPackageGeometry(2.32, 1.18, 0.12, 0.07), dieMaterial);
    die.position.y = 0.48;
    root.add(die);

    const glass = new THREE.Mesh(
      roundedPackageGeometry(2.08, 1.0, 0.035, 0.06),
      glassMaterial,
    );
    glass.position.y = 0.6;
    root.add(glass);

    const topMark = makeLabelSprite("CORE ULTRA", "#ffffff", "#071126");
    topMark.position.set(0, 0.76, -0.74);
    topMark.scale.set(1.24, 0.36, 1);
    root.add(topMark);

    const dieTraces = makeTraceGrid(2.08, 1.0, 8, 6, etchedTraceMaterial);
    dieTraces.position.y = 0.64;
    root.add(dieTraces);

    const substrateTraces = makeTraceGrid(5.62, 2.28, 13, 8, traceMaterial);
    substrateTraces.position.y = 0.18;
    root.add(substrateTraces);

    const layerParts: LayerPart[] = [
      { object: packageBody, compactY: 0, explodedY: -0.24 },
      { object: lid, compactY: 0.24, explodedY: 0.12 },
      { object: dieDeck, compactY: 0.31, explodedY: 0.44 },
      { object: interposer, compactY: 0.4, explodedY: 0.7 },
      { object: die, compactY: 0.48, explodedY: 0.94 },
      { object: glass, compactY: 0.6, explodedY: 1.26 },
      { object: dieTraces, compactY: 0.64, explodedY: 1.32 },
      { object: substrateTraces, compactY: 0.18, explodedY: 0.16 },
      { object: topMark, compactY: 0.76, explodedY: 1.58 },
    ];

    const contacts = new THREE.Group();
    root.add(contacts);
    for (let index = 0; index < 38; index += 1) {
      const x = -3.02 + index * (6.04 / 37);
      addContact(contacts, x, -1.72, 0);
      addContact(contacts, x, 1.72, 0);
    }
    for (let index = 0; index < 18; index += 1) {
      const z = -1.34 + index * (2.68 / 17);
      addContact(contacts, -3.38, z, Math.PI / 2);
      addContact(contacts, 3.38, z, Math.PI / 2);
    }
    layerParts.push({ object: contacts, compactY: 0, explodedY: -0.1 });

    const fiducials = new THREE.Group();
    const fiducialGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.028, 28);
    const fiducialMaterial = new THREE.MeshStandardMaterial({
      color: 0xcaa456,
      metalness: 0.9,
      roughness: 0.24,
    });
    for (const x of [-2.92, 2.92]) {
      for (const z of [-1.36, 1.36]) {
        const fiducial = new THREE.Mesh(fiducialGeometry, fiducialMaterial);
        fiducial.position.set(x, 0.25, z);
        fiducials.add(fiducial);
      }
    }
    root.add(fiducials);
    layerParts.push({ object: fiducials, compactY: 0, explodedY: 0.08 });

    const tracePositions: number[] = [];
    const zoneGroups = new Map<FeatureId, THREE.Mesh[]>();
    const labelSprites = new Map<FeatureId, THREE.Sprite>();
    const hotspots: THREE.Mesh[] = [];
    const interactiveTargets: THREE.Object3D[] = [];

    const featureMaterials = new Map(
      FEATURE_DATA.map((feature) => [
        feature.id,
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(feature.color),
          emissive: new THREE.Color(feature.color),
          emissiveIntensity: 0.28,
          metalness: 0.24,
          roughness: 0.28,
        }),
      ]),
    );

    buildCoreArray(root, zoneGroups, featureMaterials, layerParts);
    buildFeatureBlock(root, zoneGroups, featureMaterials, layerParts, "arc", 1.24, 0.3, 1.24, 0.82);
    buildFeatureBlock(root, zoneGroups, featureMaterials, layerParts, "xess", 2.18, -0.56, 0.82, 0.42);
    buildFeatureBlock(root, zoneGroups, featureMaterials, layerParts, "npu", -0.18, -0.26, 0.88, 0.56);
    buildFeatureBlock(root, zoneGroups, featureMaterials, layerParts, "triEngine", 0.02, 0.88, 1.02, 0.34);
    buildFeatureBlock(root, zoneGroups, featureMaterials, layerParts, "mobility", -1.82, -0.86, 0.86, 0.34);
    buildFeatureBlock(root, zoneGroups, featureMaterials, layerParts, "connectivity", 2.78, 0.9, 0.54, 0.34);
    buildFeatureBlock(root, zoneGroups, featureMaterials, layerParts, "edge", -2.82, 0.02, 0.36, 1.34);

    for (const [featureId, meshes] of zoneGroups) {
      for (const mesh of meshes) {
        mesh.userData.featureId = featureId;
        interactiveTargets.push(mesh);
      }
    }

    for (const feature of FEATURE_DATA) {
      const position = new THREE.Vector3(...feature.position);
      const color = new THREE.Color(feature.color);

      const hotspotMaterial = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.9,
        metalness: 0.1,
        roughness: 0.2,
      });
      const hotspot = new THREE.Mesh(
        new THREE.SphereGeometry(0.095, 28, 28),
        hotspotMaterial,
      );
      hotspot.position.copy(position);
      hotspot.userData.featureId = feature.id;
      root.add(hotspot);
      hotspots.push(hotspot);
      interactiveTargets.push(hotspot);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.18, 0.012, 10, 64),
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.72,
        }),
      );
      ring.position.copy(position);
      ring.rotation.x = Math.PI / 2;
      ring.userData.featureId = feature.id;
      root.add(ring);
      interactiveTargets.push(ring);

      const label = makeLabelSprite(feature.label, feature.color, "#071126");
      label.position.copy(position).add(new THREE.Vector3(0, 0.44, 0));
      label.scale.set(1.48, 0.4, 1);
      label.userData.featureId = feature.id;
      root.add(label);
      labelSprites.set(feature.id, label);
      interactiveTargets.push(label);

      const edge = new THREE.Vector3(
        Math.sign(position.x || 1) * 3.08,
        0.48,
        position.z * 0.84,
      );
      tracePositions.push(
        position.x,
        0.48,
        position.z,
        edge.x,
        edge.y,
        edge.z,
      );
    }

    const traceGeometry = new THREE.BufferGeometry();
    traceGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(tracePositions, 3),
    );
    const traces = new THREE.LineSegments(traceGeometry, traceMaterial);
    root.add(traces);
    layerParts.push({ object: traces, compactY: 0, explodedY: 0.38 });

    const grid = new THREE.GridHelper(13, 34, 0x00c7fd, 0x122968);
    grid.position.y = -0.82;
    grid.material.transparent = true;
    grid.material.opacity = 0.28;
    scene.add(grid);

    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(340 * 3);
    const particleSeeds: number[] = [];
    for (let index = 0; index < 340; index += 1) {
      const radius = 3.1 + Math.random() * 3.9;
      const angle = Math.random() * Math.PI * 2;
      particlePositions[index * 3] = Math.cos(angle) * radius;
      particlePositions[index * 3 + 1] = -0.35 + Math.random() * 2.2;
      particlePositions[index * 3 + 2] = Math.sin(angle) * radius;
      particleSeeds.push(Math.random() * Math.PI * 2);
    }
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3),
    );
    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        color: 0x8be8ff,
        size: 0.026,
        transparent: true,
        opacity: 0.62,
      }),
    );
    scene.add(particles);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const clock = new THREE.Clock();
    let animationId = 0;
    let targetRotationX = -0.48;
    let targetRotationY = -0.7;
    let cameraTargetZ = 8.8;
    let isDragging = false;
    let dragMoved = false;
    let pointerStartX = 0;
    let pointerStartY = 0;
    let previousX = 0;
    let previousY = 0;
    let lastActiveId: FeatureId = stateRef.current.activeId;
    let lastResetSignal = stateRef.current.resetSignal;
    const rootTargetScale = new THREE.Vector3(1, 1, 1);

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    const setPointerFromEvent = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const pickHotspot = (event: PointerEvent) => {
      setPointerFromEvent(event);
      raycaster.setFromCamera(pointer, camera);
      const intersections = raycaster.intersectObjects(interactiveTargets, false);
      return intersections[0]?.object.userData.featureId as FeatureId | undefined;
    };

    const handlePointerDown = (event: PointerEvent) => {
      isDragging = true;
      dragMoved = false;
      pointerStartX = event.clientX;
      pointerStartY = event.clientY;
      previousX = event.clientX;
      previousY = event.clientY;
      canvas.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDragging) {
        canvas.style.cursor = pickHotspot(event) ? "pointer" : "grab";
        return;
      }

      const movementX = event.clientX - previousX;
      const movementY = event.clientY - previousY;
      previousX = event.clientX;
      previousY = event.clientY;
      targetRotationY += movementX * 0.01;
      targetRotationX = THREE.MathUtils.clamp(
        targetRotationX + movementY * 0.006,
        -0.95,
        -0.12,
      );

      if (
        Math.abs(event.clientX - pointerStartX) +
          Math.abs(event.clientY - pointerStartY) >
        6
      ) {
        dragMoved = true;
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!isDragging) {
        return;
      }

      isDragging = false;
      canvas.releasePointerCapture(event.pointerId);

      if (!dragMoved) {
        const picked = pickHotspot(event);
        if (picked) {
          stateRef.current.onSelect(picked);
        }
      }
    };

    const handlePointerLeave = () => {
      canvas.style.cursor = "grab";
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      cameraTargetZ = THREE.MathUtils.clamp(
        cameraTargetZ + event.deltaY * 0.004,
        6.4,
        11.2,
      );
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointerleave", handlePointerLeave);
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    canvas.style.cursor = "grab";

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      const current = stateRef.current;
      const currentFeature =
        FEATURE_DATA.find((feature) => feature.id === current.activeId) ??
        FEATURE_DATA[0];

      if (lastActiveId !== current.activeId) {
        targetRotationY = currentFeature.angle;
        targetRotationX = -0.48;
        lastActiveId = current.activeId;
      }

      if (lastResetSignal !== current.resetSignal) {
        targetRotationY = -0.7;
        targetRotationX = -0.48;
        cameraTargetZ = 8.8;
        lastResetSignal = current.resetSignal;
      }

      if (current.exploded) {
        targetRotationX = Math.min(targetRotationX, -0.56);
      }

      root.rotation.y +=
        (targetRotationY + (current.exploded ? 0.12 : 0) - root.rotation.y) *
        0.072;
      root.rotation.x += (targetRotationX - root.rotation.x) * 0.075;
      const compactViewport = mount.clientWidth < 560;
      const midViewport = mount.clientWidth >= 560 && mount.clientWidth < 900;
      const targetScale = compactViewport ? 0.84 : midViewport ? 0.94 : 1;
      rootTargetScale.set(targetScale, targetScale, targetScale);
      root.scale.lerp(rootTargetScale, 0.08);
      camera.position.z +=
        (cameraTargetZ + (compactViewport ? 1.45 : 0) - camera.position.z) *
        0.08;
      camera.lookAt(0, 0.26, 0);

      fill.intensity = 22 + Math.sin(elapsed * 1.7) * 4;
      particles.rotation.y += 0.0009;
      const particleArray = particleGeometry.attributes.position
        .array as Float32Array;
      for (let index = 0; index < particleSeeds.length; index += 1) {
        particleArray[index * 3 + 1] +=
          Math.sin(elapsed * 1.2 + particleSeeds[index]) * 0.00045;
      }
      particleGeometry.attributes.position.needsUpdate = true;

      for (const part of layerParts) {
        const targetY = current.exploded ? part.explodedY : part.compactY;
        part.object.position.y += (targetY - part.object.position.y) * 0.1;
      }

      for (const feature of FEATURE_DATA) {
        const isActive = feature.id === current.activeId;
        const isFocused = current.focus === "all" || feature.focus === current.focus;
        const meshes = zoneGroups.get(feature.id) ?? [];
        const material = featureMaterials.get(feature.id);

        if (material) {
          material.emissiveIntensity = isActive ? 0.92 : isFocused ? 0.3 : 0.06;
          material.opacity = isFocused || isActive ? 1 : 0.42;
          material.transparent = true;
        }

        for (const mesh of meshes) {
          const targetScale = isActive ? 1.12 : isFocused ? 1 : 0.88;
          mesh.scale.lerp(
            new THREE.Vector3(targetScale, targetScale, targetScale),
            0.09,
          );
        }

        const hotspot = hotspots.find(
          (mesh) => mesh.userData.featureId === feature.id,
        );
        if (hotspot) {
          const pulse = 1 + Math.sin(elapsed * 3 + feature.angle) * 0.055;
          const targetScale = (isActive ? 1.78 : isFocused ? 1.08 : 0.78) * pulse;
          hotspot.scale.lerp(
            new THREE.Vector3(targetScale, targetScale, targetScale),
            0.12,
          );
          const material = hotspot.material as THREE.MeshStandardMaterial;
          material.emissiveIntensity = isActive ? 1.8 : isFocused ? 0.7 : 0.16;
        }

        const label = labelSprites.get(feature.id);
        if (label) {
          const material = label.material as THREE.SpriteMaterial;
          material.opacity = isActive ? 1 : compactViewport ? 0.18 : isFocused ? 0.62 : 0.18;
          const labelScale = compactViewport ? 1.22 : 1.48;
          const activeBoost = isActive ? 1.12 : 1;
          label.scale.lerp(
            new THREE.Vector3(
              labelScale * activeBoost,
              labelScale * 0.27 * activeBoost,
              1,
            ),
            0.09,
          );
        }
      }

      traceMaterial.opacity = current.exploded ? 0.62 : 0.32;
      dieMaterial.opacity = current.exploded ? 0.48 : 0.92;

      renderer.render(scene, camera);
      animationId = window.requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      canvas.removeEventListener("wheel", handleWheel);
      renderer.dispose();
      scene.traverse((object) => {
        if ("geometry" in object) {
          (object.geometry as THREE.BufferGeometry).dispose();
        }
        if ("material" in object) {
          const material = object.material as
            | THREE.Material
            | THREE.Material[]
            | undefined;
          if (Array.isArray(material)) {
            material.forEach((item) => item.dispose());
          } else {
            material?.dispose();
          }
        }
      });
    };
  }, []);

  return (
    <div className="chip-scene" ref={mountRef}>
      <canvas ref={canvasRef} aria-label="3D processor feature model" />
      <div className="scene-readout" aria-live="polite">
        <span>{FEATURE_DATA.find((feature) => feature.id === activeId)?.stat}</span>
        <strong>
          {FEATURE_DATA.find((feature) => feature.id === activeId)?.label}
        </strong>
        <small>Core Ultra X9 388H reference package: 50 mm x 25 mm.</small>
      </div>
    </div>
  );
}

function roundedPackageGeometry(
  width: number,
  depth: number,
  height: number,
  radius: number,
) {
  const x = width / 2;
  const z = depth / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-x + radius, -z);
  shape.lineTo(x - radius, -z);
  shape.quadraticCurveTo(x, -z, x, -z + radius);
  shape.lineTo(x, z - radius);
  shape.quadraticCurveTo(x, z, x - radius, z);
  shape.lineTo(-x + radius, z);
  shape.quadraticCurveTo(-x, z, -x, z - radius);
  shape.lineTo(-x, -z + radius);
  shape.quadraticCurveTo(-x, -z, -x + radius, -z);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: true,
    bevelThickness: Math.min(0.045, height * 0.28),
    bevelSize: Math.min(0.055, radius * 0.36),
    bevelSegments: 5,
  });
  geometry.rotateX(Math.PI / 2);
  geometry.center();
  return geometry;
}

function makeTraceGrid(
  width: number,
  depth: number,
  columns: number,
  rows: number,
  material: THREE.LineBasicMaterial,
) {
  const positions: number[] = [];
  const xMin = -width / 2;
  const xMax = width / 2;
  const zMin = -depth / 2;
  const zMax = depth / 2;

  for (let index = 0; index <= columns; index += 1) {
    const x = xMin + (width * index) / columns;
    const inset = index % 3 === 0 ? 0.12 : 0.28;
    positions.push(x, 0, zMin + inset, x, 0, zMax - inset);
  }

  for (let index = 0; index <= rows; index += 1) {
    const z = zMin + (depth * index) / rows;
    const inset = index % 2 === 0 ? 0.18 : 0.36;
    positions.push(xMin + inset, 0, z, xMax - inset, 0, z);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );

  return new THREE.LineSegments(geometry, material);
}

function addContact(group: THREE.Group, x: number, z: number, rotation: number) {
  const contact = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.04, 0.048),
    new THREE.MeshStandardMaterial({
      color: 0xd6e7f9,
      metalness: 0.85,
      roughness: 0.24,
    }),
  );
  contact.position.set(x, -0.17, z);
  contact.rotation.y = rotation;
  group.add(contact);
}

function buildCoreArray(
  root: THREE.Group,
  zoneGroups: Map<FeatureId, THREE.Mesh[]>,
  materials: Map<FeatureId, THREE.MeshStandardMaterial>,
  layerParts: LayerPart[],
) {
  const material = materials.get("architecture");
  if (!material) {
    return;
  }

  const meshes: THREE.Mesh[] = [];
  const coreSpecs = [
    { countX: 2, countZ: 2, sizeX: 0.34, sizeZ: 0.28, gapX: 0.09, gapZ: 0.09, startX: -1.82, startZ: 0.46 },
    { countX: 4, countZ: 2, sizeX: 0.22, sizeZ: 0.22, gapX: 0.055, gapZ: 0.06, startX: -1.28, startZ: 0.46 },
    { countX: 4, countZ: 1, sizeX: 0.18, sizeZ: 0.2, gapX: 0.05, gapZ: 0, startX: -1.84, startZ: -0.46 },
  ];

  for (const spec of coreSpecs) {
    const geometry = new THREE.BoxGeometry(spec.sizeX, 0.13, spec.sizeZ);
    for (let row = 0; row < spec.countZ; row += 1) {
      for (let column = 0; column < spec.countX; column += 1) {
        const core = new THREE.Mesh(geometry, material);
        core.position.set(
          spec.startX + column * (spec.sizeX + spec.gapX),
          0.72,
          spec.startZ - row * (spec.sizeZ + spec.gapZ),
        );
        root.add(core);
        meshes.push(core);
        layerParts.push({
          object: core,
          compactY: core.position.y,
          explodedY: core.position.y + 0.82,
        });
      }
    }
  }

  zoneGroups.set("architecture", meshes);
}

function buildFeatureBlock(
  root: THREE.Group,
  zoneGroups: Map<FeatureId, THREE.Mesh[]>,
  materials: Map<FeatureId, THREE.MeshStandardMaterial>,
  layerParts: LayerPart[],
  featureId: FeatureId,
  x: number,
  z: number,
  width: number,
  depth: number,
) {
  const material = materials.get(featureId);
  if (!material) {
    return;
  }

  const meshes: THREE.Mesh[] = [];
  const segments = featureId === "arc" ? 12 : featureId === "npu" ? 9 : 1;
  if (segments > 1) {
    const countX = featureId === "arc" ? 4 : 3;
    const countZ = featureId === "arc" ? 3 : 3;
    const gap = 0.045;
    const tileWidth = (width - gap * (countX - 1)) / countX;
    const tileDepth = (depth - gap * (countZ - 1)) / countZ;
    const geometry = new THREE.BoxGeometry(tileWidth, 0.15, tileDepth);

    for (let row = 0; row < countZ; row += 1) {
      for (let column = 0; column < countX; column += 1) {
        const tile = new THREE.Mesh(geometry, material);
        tile.position.set(
          x - width / 2 + tileWidth / 2 + column * (tileWidth + gap),
          0.72,
          z + depth / 2 - tileDepth / 2 - row * (tileDepth + gap),
        );
        root.add(tile);
        meshes.push(tile);
        layerParts.push({
          object: tile,
          compactY: tile.position.y,
          explodedY: tile.position.y + 0.82,
        });
      }
    }

    zoneGroups.set(featureId, meshes);
    return;
  }

  const block = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.15, depth),
    material,
  );
  block.position.set(x, 0.72, z);
  root.add(block);
  meshes.push(block);
  layerParts.push({
    object: block,
    compactY: block.position.y,
    explodedY: block.position.y + 0.82,
  });

  const inset = new THREE.Mesh(
    new THREE.BoxGeometry(Math.max(width - 0.16, 0.16), 0.035, Math.max(depth - 0.16, 0.16)),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.18,
    }),
  );
  inset.position.set(x, 0.83, z);
  root.add(inset);
  meshes.push(inset);
  layerParts.push({
    object: inset,
    compactY: inset.position.y,
    explodedY: inset.position.y + 0.82,
  });

  zoneGroups.set(featureId, meshes);
}

function makeLabelSprite(text: string, accent: string, background: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const context = canvas.getContext("2d");

  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.shadowColor = "rgba(0, 0, 0, 0.45)";
    context.shadowBlur = 22;
    context.shadowOffsetY = 8;
    context.fillStyle = background;
    context.strokeStyle = accent;
    context.lineWidth = 6;
    context.beginPath();
    context.roundRect(22, 38, 980, 170, 24);
    context.fill();
    context.stroke();
    context.shadowColor = "transparent";
    context.fillStyle = accent;
    context.fillRect(58, 84, 22, 76);
    context.fillStyle = "#ffffff";
    context.font = "800 58px Arial, Helvetica, sans-serif";
    context.textBaseline = "middle";
    context.fillText(text, 106, 124, 840);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 0.72,
    depthTest: false,
  });
  return new THREE.Sprite(material);
}
