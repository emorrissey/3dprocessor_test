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
    position: [-1.42, 0.86, 0.72],
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
    position: [1.16, 0.9, 0.64],
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
    position: [1.95, 0.82, -0.48],
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
    position: [-0.22, 1.02, -0.18],
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
    position: [0.1, 1.32, 0.92],
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
    position: [-1.8, 0.78, -0.78],
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
    position: [2.26, 0.66, 1.0],
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
    position: [-2.18, 0.66, 0.04],
    angle: -1.62,
    color: "#ff6b6b",
  },
] as const;

type Feature = (typeof FEATURE_DATA)[number];
type FeatureId = Feature["id"];
type FocusMode = "all" | "cores" | "ai" | "graphics" | "platform";

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
    camera.position.set(0, 3.2, 8.4);

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

    const baseMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x06101e,
      metalness: 0.82,
      roughness: 0.34,
      clearcoat: 0.55,
      clearcoatRoughness: 0.18,
    });
    const bevelMaterial = new THREE.MeshStandardMaterial({
      color: 0x526172,
      metalness: 0.95,
      roughness: 0.2,
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
    const traceMaterial = new THREE.LineBasicMaterial({
      color: 0x00c7fd,
      transparent: true,
      opacity: 0.36,
    });

    const base = new THREE.Mesh(roundedPackageGeometry(5.8, 3.72, 0.28, 0.35), [
      baseMaterial,
      bevelMaterial,
    ]);
    root.add(base);

    const die = new THREE.Mesh(roundedPackageGeometry(3.72, 2.3, 0.16, 0.16), dieMaterial);
    die.position.y = 0.3;
    root.add(die);

    const glass = new THREE.Mesh(
      roundedPackageGeometry(2.72, 1.46, 0.04, 0.1),
      new THREE.MeshPhysicalMaterial({
        color: 0x114dff,
        emissive: 0x0528a5,
        emissiveIntensity: 0.8,
        metalness: 0.1,
        roughness: 0.06,
        clearcoat: 1,
        transparent: true,
        opacity: 0.72,
      }),
    );
    glass.position.y = 0.43;
    root.add(glass);

    const topMark = makeLabelSprite("CORE ULTRA", "#ffffff", "#071126");
    topMark.position.set(0, 0.58, -1.1);
    topMark.scale.set(1.12, 0.3, 1);
    root.add(topMark);

    const layerParts: Array<{
      object: THREE.Object3D;
      compactY: number;
      explodedY: number;
    }> = [
      { object: base, compactY: 0, explodedY: -0.2 },
      { object: die, compactY: 0.3, explodedY: 0.56 },
      { object: glass, compactY: 0.43, explodedY: 0.9 },
      { object: topMark, compactY: 0.58, explodedY: 1.2 },
    ];

    const contacts = new THREE.Group();
    root.add(contacts);
    for (let index = 0; index < 34; index += 1) {
      const x = -2.72 + index * (5.44 / 33);
      addContact(contacts, x, -1.98, 0);
      addContact(contacts, x, 1.98, 0);
    }
    for (let index = 0; index < 22; index += 1) {
      const z = -1.68 + index * (3.36 / 21);
      addContact(contacts, -3.0, z, Math.PI / 2);
      addContact(contacts, 3.0, z, Math.PI / 2);
    }

    const tracePositions: number[] = [];
    const zoneGroups = new Map<FeatureId, THREE.Mesh[]>();
    const labelSprites = new Map<FeatureId, THREE.Sprite>();
    const hotspots: THREE.Mesh[] = [];

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
    buildFeatureBlock(root, zoneGroups, featureMaterials, layerParts, "arc", 1.1, 0.02, 1.35, 1.05);
    buildFeatureBlock(root, zoneGroups, featureMaterials, layerParts, "xess", 1.95, -0.72, 0.7, 0.55);
    buildFeatureBlock(root, zoneGroups, featureMaterials, layerParts, "npu", -0.26, -0.22, 1.02, 0.74);
    buildFeatureBlock(root, zoneGroups, featureMaterials, layerParts, "triEngine", 0.02, 0.78, 1.18, 0.5);
    buildFeatureBlock(root, zoneGroups, featureMaterials, layerParts, "mobility", -1.55, -0.82, 0.86, 0.62);
    buildFeatureBlock(root, zoneGroups, featureMaterials, layerParts, "connectivity", 2.16, 0.96, 0.64, 0.42);
    buildFeatureBlock(root, zoneGroups, featureMaterials, layerParts, "edge", -2.18, 0.02, 0.48, 1.3);

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

      const label = makeLabelSprite(feature.label, feature.color, "#071126");
      label.position.copy(position).add(new THREE.Vector3(0, 0.38, 0));
      label.scale.set(1.05, 0.28, 1);
      root.add(label);
      labelSprites.set(feature.id, label);

      const edge = new THREE.Vector3(
        Math.sign(position.x || 1) * 2.55,
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
    let cameraTargetZ = 8.4;
    let isDragging = false;
    let dragMoved = false;
    let pointerStartX = 0;
    let pointerStartY = 0;
    let previousX = 0;
    let previousY = 0;
    let lastActiveId: FeatureId = stateRef.current.activeId;
    let lastResetSignal = stateRef.current.resetSignal;

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
      const intersections = raycaster.intersectObjects(hotspots, false);
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
        5.8,
        10.2,
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
        cameraTargetZ = 8.4;
        lastResetSignal = current.resetSignal;
      }

      if (current.exploded) {
        targetRotationX = Math.min(targetRotationX, -0.56);
      }

      root.rotation.y +=
        (targetRotationY + (current.exploded ? 0.12 : 0) - root.rotation.y) *
        0.072;
      root.rotation.x += (targetRotationX - root.rotation.x) * 0.075;
      camera.position.z += (cameraTargetZ - camera.position.z) * 0.08;
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
          material.opacity = isActive ? 1 : isFocused ? 0.52 : 0.16;
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
  layerParts: Array<{ object: THREE.Object3D; compactY: number; explodedY: number }>,
) {
  const material = materials.get("architecture");
  if (!material) {
    return;
  }

  const meshes: THREE.Mesh[] = [];
  const geometry = new THREE.BoxGeometry(0.42, 0.16, 0.34);

  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 4; column += 1) {
      const core = new THREE.Mesh(geometry, material);
      core.position.set(-1.45 + column * 0.48, 0.56, 0.72 - row * 0.42);
      root.add(core);
      meshes.push(core);
      layerParts.push({
        object: core,
        compactY: core.position.y,
        explodedY: core.position.y + 0.68,
      });
    }
  }

  zoneGroups.set("architecture", meshes);
}

function buildFeatureBlock(
  root: THREE.Group,
  zoneGroups: Map<FeatureId, THREE.Mesh[]>,
  materials: Map<FeatureId, THREE.MeshStandardMaterial>,
  layerParts: Array<{ object: THREE.Object3D; compactY: number; explodedY: number }>,
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
  const block = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.18, depth),
    material,
  );
  block.position.set(x, 0.58, z);
  root.add(block);
  meshes.push(block);
  layerParts.push({
    object: block,
    compactY: block.position.y,
    explodedY: block.position.y + 0.72,
  });

  const inset = new THREE.Mesh(
    new THREE.BoxGeometry(Math.max(width - 0.18, 0.18), 0.035, Math.max(depth - 0.18, 0.18)),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.18,
    }),
  );
  inset.position.set(x, 0.69, z);
  root.add(inset);
  meshes.push(inset);
  layerParts.push({
    object: inset,
    compactY: inset.position.y,
    explodedY: inset.position.y + 0.72,
  });

  zoneGroups.set(featureId, meshes);
}

function makeLabelSprite(text: string, accent: string, background: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 192;
  const context = canvas.getContext("2d");

  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = background;
    context.strokeStyle = accent;
    context.lineWidth = 4;
    context.beginPath();
    context.roundRect(18, 36, 732, 120, 18);
    context.fill();
    context.stroke();
    context.fillStyle = accent;
    context.fillRect(44, 70, 16, 52);
    context.fillStyle = "#ffffff";
    context.font = "700 42px Arial, Helvetica, sans-serif";
    context.textBaseline = "middle";
    context.fillText(text, 82, 98, 620);
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
