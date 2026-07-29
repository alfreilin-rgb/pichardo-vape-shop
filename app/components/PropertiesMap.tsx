"use client";

import { useEffect, useRef } from "react";
import {
  Map,
  Marker,
  NavigationControl,
  Popup,
} from "maplibre-gl";
import type { Property } from "../lib/puntahogar";

import "maplibre-gl/dist/maplibre-gl.css";

type PropertiesMapProps = {
  properties: Property[];
  selectedId: number | null;
  onSelect: (property: Property) => void;
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

export default function PropertiesMap({
  properties,
  selectedId,
  onSelect,
}: PropertiesMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<Map<number, Marker>>(
    new globalThis.Map(),
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new Map({
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

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((marker) =>
        marker.remove(),
      );
      markersRef.current.clear();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) =>
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
      element.className = "puntahogar-price-marker";
      element.textContent = propertyPrice(property);
      element.setAttribute(
        "aria-label",
        `Ver ${property.title}`,
      );

      element.addEventListener("click", (event) => {
        event.stopPropagation();
        onSelect(property);
      });

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
        closeButton: false,
        maxWidth: "280px",
      }).setDOMContent(popupNode);

      const marker = new Marker({
        element,
        anchor: "bottom",
      })
        .setLngLat([
          Number(property.longitude),
          Number(property.latitude),
        ])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.set(property.id, marker);
    });

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
            [Math.min(...longitudes), Math.min(...latitudes)],
            [Math.max(...longitudes), Math.max(...latitudes)],
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
    if (!selectedId || !mapRef.current) return;

    const property = properties.find(
      (item) => item.id === selectedId,
    );

    const marker = markersRef.current.get(selectedId);

    if (!property || !marker) return;

    mapRef.current.flyTo({
      center: [
        Number(property.longitude),
        Number(property.latitude),
      ],
      zoom: 15,
      duration: 900,
      essential: true,
    });

    marker.togglePopup();
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
          border: 2px solid white;
          border-radius: 9999px;
          background: #059669;
          padding: 8px 12px;
          color: white;
          font-size: 12px;
          font-weight: 800;
          line-height: 1;
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.25);
          transition:
            transform 160ms ease,
            background 160ms ease;
        }

        .puntahogar-price-marker:hover {
          background: #047857;
          transform: translateY(-2px) scale(1.05);
        }

        .maplibregl-popup-content {
          border-radius: 18px;
          padding: 12px;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.2);
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
