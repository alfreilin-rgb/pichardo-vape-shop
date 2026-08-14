"use client";

import { useEffect, useRef, useState } from "react";
import {
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  type MapMouseEvent,
} from "maplibre-gl";

import "maplibre-gl/dist/maplibre-gl.css";

type PropertyLocationMapProps = {
  locationType: "exacta" | "aproximada";
  initialLatitude?: number;
  initialLongitude?: number;
  readOnly?: boolean;
  onLocationChange?: (
    latitude: number,
    longitude: number,
  ) => void;
};

const DEFAULT_LATITUDE = 18.5601;
const DEFAULT_LONGITUDE = -68.3725;

export default function PropertyLocationMap({
  locationType,
  initialLatitude = DEFAULT_LATITUDE,
  initialLongitude = DEFAULT_LONGITUDE,
  readOnly = false,
  onLocationChange,
}: PropertyLocationMapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<Marker | null>(null);

  const [latitude, setLatitude] = useState(initialLatitude);
  const [longitude, setLongitude] =
    useState(initialLongitude);

  function normalizePosition(lat: number, lng: number) {
    if (locationType === "aproximada") {
      return {
        latitude: Number(lat.toFixed(3)),
        longitude: Number(lng.toFixed(3)),
      };
    }

    return {
      latitude: lat,
      longitude: lng,
    };
  }

  function updatePosition(lat: number, lng: number) {
    markerRef.current?.setLngLat([lng, lat]);

    setLatitude(lat);
    setLongitude(lng);

    const normalized = normalizePosition(lat, lng);

    onLocationChange?.(
      normalized.latitude,
      normalized.longitude,
    );
  }

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new MapLibreMap({
      container: mapContainer.current,
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
      center: [initialLongitude, initialLatitude],
      zoom: readOnly ? 15 : 13,
      minZoom: 8,
      maxZoom: 19,
    });

    map.addControl(
      new NavigationControl(),
      "top-right",
    );

    const markerElement = document.createElement("div");
    markerElement.className =
      "h-8 w-8 rounded-full border-4 border-white bg-emerald-600 shadow-xl";

    const marker = new Marker({
      element: markerElement,
      draggable: !readOnly,
      anchor: "center",
    })
      .setLngLat([initialLongitude, initialLatitude])
      .addTo(map);

    mapRef.current = map;
    markerRef.current = marker;

    if (!readOnly) {
      marker.on("dragend", () => {
        const position = marker.getLngLat();
        updatePosition(position.lat, position.lng);
      });

      map.on("click", (event: MapMouseEvent) => {
        updatePosition(
          event.lngLat.lat,
          event.lngLat.lng,
        );
      });
    }

    const initial = normalizePosition(
      initialLatitude,
      initialLongitude,
    );

    onLocationChange?.(
      initial.latitude,
      initial.longitude,
    );

    return () => {
      marker.remove();
      map.remove();
      markerRef.current = null;
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;

    markerRef.current.setLngLat([
      initialLongitude,
      initialLatitude,
    ]);

    mapRef.current.flyTo({
      center: [initialLongitude, initialLatitude],
      zoom: readOnly ? 15 : 13,
      duration: 800,
    });

    setLatitude(initialLatitude);
    setLongitude(initialLongitude);

    const normalized = normalizePosition(
      initialLatitude,
      initialLongitude,
    );

    onLocationChange?.(
      normalized.latitude,
      normalized.longitude,
    );
  }, [
    initialLatitude,
    initialLongitude,
    readOnly,
  ]);

  useEffect(() => {
    const normalized = normalizePosition(
      latitude,
      longitude,
    );

    onLocationChange?.(
      normalized.latitude,
      normalized.longitude,
    );
  }, [locationType]);

  const displayedLatitude =
    locationType === "aproximada"
      ? Number(latitude.toFixed(3))
      : latitude;

  const displayedLongitude =
    locationType === "aproximada"
      ? Number(longitude.toFixed(3))
      : longitude;

  return (
    <div className="text-slate-900">
      {!readOnly && (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-900">
          Arrastra el marcador verde o toca el mapa para
          seleccionar la ubicación.
        </div>
      )}

      <div
        ref={mapContainer}
        className="h-[460px] w-full overflow-hidden rounded-3xl border border-slate-200 shadow-sm"
      />

      {!readOnly && (
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <span className="font-bold">Latitud:</span>{" "}
            {displayedLatitude}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <span className="font-bold">Longitud:</span>{" "}
            {displayedLongitude}
          </div>
        </div>
      )}

      {locationType === "aproximada" && (
        <p className="mt-3 text-sm text-slate-500">
          La ubicación se guarda de manera aproximada para
          proteger la privacidad del propietario.
        </p>
      )}

      <style jsx global>{`
        .maplibregl-ctrl-group {
          overflow: hidden;
          border-radius: 14px;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.16);
        }
      `}</style>
    </div>
  );
}