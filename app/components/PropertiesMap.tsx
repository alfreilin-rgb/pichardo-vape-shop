"use client";

import { useEffect, useRef } from "react";
import {
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  Popup,
} from "maplibre-gl";
import type { Property } from "../lib/puntahogar";

import "maplibre-gl/dist/maplibre-gl.css";

type UserLocation = {
  latitude: number;
  longitude: number;
};

type PropertiesMapProps = {
  properties: Property[];
  selectedId: number | null;
  onSelect: (property: Property) => void;
  userLocation?: UserLocation | null;
};

const DEFAULT_CENTER: [number, number] = [
  -68.3725,
  18.5601,
];

function propertyPrice(property: Property) {
  const amount = Number(property.price || 0);

  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000;

    return `RD$${millions.toFixed(
      millions % 1 === 0 ? 0 : 1,
    )}M`;
  }

  if (amount >= 1_000) {
    return `RD$${Math.round(amount / 1_000)}K`;
  }

  return `RD$${amount.toLocaleString("es-DO")}`;
}

function markerSizeForZoom(zoom: number) {
  if (zoom < 10) return "tiny";
  if (zoom < 12) return "small";
  return "normal";
}

export default function PropertiesMap({
  properties,
  selectedId,
  onSelect,
  userLocation = null,
}: PropertiesMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  const markersRef = useRef<Map<number, Marker>>(
    new globalThis.Map(),
  );

  const userMarkerRef = useRef<Marker | null>(null);
  const activePopupRef = useRef<Popup | null>(null);

  function closeActivePopup() {
    activePopupRef.current?.remove();
    activePopupRef.current = null;
  }

  function updateMarkerSizes() {
    const map = mapRef.current;
    if (!map) return;

    const size = markerSizeForZoom(map.getZoom());

    markersRef.current.forEach((marker: Marker) => {
      const element = marker.getElement();

      element.classList.remove(
        "puntahogar-marker-normal",
        "puntahogar-marker-small",
        "puntahogar-marker-tiny",
      );

      element.classList.add(
        `puntahogar-marker-${size}`,
      );
    });
  }

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new MapLibreMap({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          "carto-light": {
            type: "raster",
            tiles: [
              "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
              "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
              "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
            ],
            tileSize: 256,
            attribution:
              "© OpenStreetMap contributors © CARTO",
          },
        },
        layers: [
          {
            id: "carto-light-layer",
            type: "raster",
            source: "carto-light",
            minzoom: 0,
            maxzoom: 20,
          },
        ],
      },
      center: DEFAULT_CENTER,
      zoom: 11.5,
      minZoom: 8,
      maxZoom: 19,
    });

    map.addControl(
      new NavigationControl({
        showCompass: true,
        showZoom: true,
      }),
      "top-right",
    );

    map.on("zoom", updateMarkerSizes);

    map.on("zoomstart", () => {
      closeActivePopup();
    });

    mapRef.current = map;

    return () => {
      closeActivePopup();

      markersRef.current.forEach((marker: Marker) =>
        marker.remove(),
      );

      markersRef.current.clear();
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;

      map.off("zoom", updateMarkerSizes);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    closeActivePopup();

    markersRef.current.forEach((marker: Marker) =>
      marker.remove(),
    );

    markersRef.current.clear();

    const validProperties = properties.filter(
      (property) =>
        Number.isFinite(Number(property.latitude)) &&
        Number.isFinite(Number(property.longitude)),
    );

    validProperties.forEach((property) => {
      const element = document.createElement("button");
      element.type = "button";
      element.className =
        "puntahogar-price-marker puntahogar-marker-normal";
      element.textContent = propertyPrice(property);

      element.setAttribute(
        "aria-label",
        `Ver ${property.title}`,
      );

      const image =
        property.images?.[0] ||
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=75";

      const popupNode = document.createElement("div");
      popupNode.className = "w-60";

      const popupImage = document.createElement("img");
      popupImage.src = image;
      popupImage.alt = property.title;
      popupImage.className =
        "h-28 w-full rounded-xl object-cover";

      const popupTitle = document.createElement("p");
      popupTitle.textContent = property.title;
      popupTitle.className =
        "mt-3 line-clamp-2 font-bold text-slate-950";

      const popupZone = document.createElement("p");
      popupZone.textContent = property.zone;
      popupZone.className =
        "mt-1 text-sm text-slate-500";

      const popupPrice = document.createElement("p");
      popupPrice.textContent = propertyPrice(property);
      popupPrice.className =
        "mt-2 text-lg font-black text-emerald-700";

      const popupLink = document.createElement("a");
      popupLink.href = `/propiedad/${property.id}`;
      popupLink.textContent = "Ver propiedad";
      popupLink.className =
        "mt-3 block rounded-xl bg-emerald-600 px-4 py-2.5 text-center font-bold text-white";

      popupNode.append(
        popupImage,
        popupTitle,
        popupZone,
        popupPrice,
        popupLink,
      );

      const popup = new Popup({
        offset: 24,
        closeButton: true,
        closeOnClick: false,
        maxWidth: "280px",
      }).setDOMContent(popupNode);

      popup.on("close", () => {
        if (activePopupRef.current === popup) {
          activePopupRef.current = null;
        }
      });

      element.addEventListener("click", (event) => {
        event.stopPropagation();

        closeActivePopup();
        onSelect(property);

        popup
          .setLngLat([
            Number(property.longitude),
            Number(property.latitude),
          ])
          .addTo(map);

        activePopupRef.current = popup;
      });

      const marker = new Marker({
        element,
        anchor: "bottom",
      })
        .setLngLat([
          Number(property.longitude),
          Number(property.latitude),
        ])
        .addTo(map);

      markersRef.current.set(property.id, marker);
    });

    updateMarkerSizes();

    if (validProperties.length > 0) {
      const longitudes = validProperties.map((property) =>
        Number(property.longitude),
      );

      const latitudes = validProperties.map((property) =>
        Number(property.latitude),
      );

      if (validProperties.length === 1) {
        map.flyTo({
          center: [longitudes[0], latitudes[0]],
          zoom: 14,
          duration: 900,
        });
      } else {
        map.fitBounds(
          [
            [
              Math.min(...longitudes),
              Math.min(...latitudes),
            ],
            [
              Math.max(...longitudes),
              Math.max(...latitudes),
            ],
          ],
          {
            padding: 80,
            maxZoom: 14,
            duration: 900,
          },
        );
      }
    }
  }, [properties, onSelect]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    userMarkerRef.current?.remove();
    userMarkerRef.current = null;

    if (!userLocation) return;

    const element = document.createElement("div");
    element.className = "puntahogar-user-marker";
    element.innerHTML = "<span></span>";

    const marker = new Marker({
      element,
      anchor: "center",
    })
      .setLngLat([
        userLocation.longitude,
        userLocation.latitude,
      ])
      .addTo(map);

    userMarkerRef.current = marker;
  }, [userLocation]);

  useEffect(() => {
    const map = mapRef.current;

    if (!selectedId || !map) {
      closeActivePopup();
      return;
    }

    const property = properties.find(
      (item) => item.id === selectedId,
    );

    if (!property) return;

    closeActivePopup();

    map.flyTo({
      center: [
        Number(property.longitude),
        Number(property.latitude),
      ],
      zoom: Math.max(map.getZoom(), 14),
      duration: 900,
      essential: true,
    });
  }, [selectedId, properties]);

  return (
    <>
      <div
        ref={containerRef}
        className="h-full min-h-[560px] w-full"
      />

      <style jsx global>{`
        .puntahogar-price-marker {
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          border-radius: 9999px;
          background: #059669;
          color: white;
          font-weight: 800;
          line-height: 1;
          white-space: nowrap;
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.25);
          transform-origin: bottom center;
          transition:
            min-width 180ms ease,
            width 180ms ease,
            height 180ms ease,
            padding 180ms ease,
            font-size 180ms ease,
            transform 160ms ease,
            background 160ms ease;
        }

        .puntahogar-marker-normal {
          min-width: 72px;
          height: 38px;
          padding: 8px 12px;
          font-size: 12px;
        }

        .puntahogar-marker-small {
          min-width: 52px;
          height: 28px;
          padding: 5px 8px;
          font-size: 10px;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
        }

        .puntahogar-marker-tiny {
          width: 18px;
          min-width: 18px;
          height: 18px;
          padding: 0;
          overflow: hidden;
          color: transparent;
          font-size: 0;
          border-width: 2px;
          box-shadow: 0 3px 9px rgba(15, 23, 42, 0.2);
        }

        .puntahogar-price-marker:hover {
          background: #047857;
          transform: translateY(-2px) scale(1.08);
          z-index: 20;
        }

        .puntahogar-marker-tiny:hover {
          width: auto;
          min-width: 58px;
          height: 28px;
          padding: 5px 8px;
          color: white;
          font-size: 10px;
        }

        .puntahogar-user-marker {
          position: relative;
          width: 24px;
          height: 24px;
          border: 4px solid white;
          border-radius: 9999px;
          background: #2563eb;
          box-shadow: 0 0 0 8px rgba(37, 99, 235, 0.18);
        }

        .puntahogar-user-marker::after {
          content: "";
          position: absolute;
          inset: -10px;
          border: 2px solid rgba(37, 99, 235, 0.35);
          border-radius: 9999px;
          animation: puntahogar-pulse 1.8s ease-out infinite;
        }

        @keyframes puntahogar-pulse {
          0% {
            transform: scale(0.7);
            opacity: 0.9;
          }

          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }

        .maplibregl-popup {
          z-index: 30;
        }

        .maplibregl-popup-content {
          border-radius: 18px;
          padding: 12px;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.2);
        }

        .maplibregl-popup-close-button {
          right: 8px;
          top: 7px;
          width: 28px;
          height: 28px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.94);
          color: #0f172a;
          font-size: 20px;
          line-height: 24px;
        }

        .maplibregl-ctrl-group {
          overflow: hidden;
          border-radius: 14px;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.16);
        }
      `}</style>
    </>
  );
}