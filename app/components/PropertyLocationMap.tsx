"use client";

import { useEffect, useRef, useState } from "react";
import {
  Map,
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
};

const DEFAULT_LATITUDE = 18.5601;
const DEFAULT_LONGITUDE = -68.3725;

export default function PropertyLocationMap({
  locationType,
  initialLatitude = DEFAULT_LATITUDE,
  initialLongitude = DEFAULT_LONGITUDE,
  readOnly = false,
}: PropertyLocationMapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);

  const [latitude, setLatitude] = useState(initialLatitude);
  const [longitude, setLongitude] = useState(initialLongitude);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) {
      return;
    }

    const map = new Map({
      container: mapContainer.current,

      style: {
        version: 8,
        sources: {
          "openstreetmap-tiles": {
            type: "raster",
            tiles: [
              "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [
          {
            id: "openstreetmap-layer",
            type: "raster",
            source: "openstreetmap-tiles",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },

      center: [initialLongitude, initialLatitude],
      zoom: 14,
    });

    map.addControl(new NavigationControl(), "top-right");

    const marker = new Marker({
      draggable: !readOnly,
    })
      .setLngLat([initialLongitude, initialLatitude])
      .addTo(map);

    if (!readOnly) {
      marker.on("dragend", () => {
        const position = marker.getLngLat();

        setLatitude(position.lat);
        setLongitude(position.lng);
      });

      map.on("click", (event: MapMouseEvent) => {
        marker.setLngLat(event.lngLat);

        setLatitude(event.lngLat.lat);
        setLongitude(event.lngLat.lng);
      });
    }

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      marker.remove();
      map.remove();

      markerRef.current = null;
      mapRef.current = null;
    };
  }, [initialLatitude, initialLongitude, readOnly]);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) {
      return;
    }

    markerRef.current.setLngLat([
      initialLongitude,
      initialLatitude,
    ]);

    mapRef.current.flyTo({
      center: [initialLongitude, initialLatitude],
      zoom: 14,
    });

    setLatitude(initialLatitude);
    setLongitude(initialLongitude);
  }, [initialLatitude, initialLongitude]);

  const displayedLatitude =
    locationType === "aproximada"
      ? Number(latitude.toFixed(3))
      : latitude;

  const displayedLongitude =
    locationType === "aproximada"
      ? Number(longitude.toFixed(3))
      : longitude;

  return (
    <div>
      {!readOnly && (
        <div className="mb-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-900">
          Arrastra el marcador o haz clic sobre el mapa para seleccionar la
          ubicación.
        </div>
      )}

      <div
        ref={mapContainer}
        className="h-[420px] w-full overflow-hidden rounded-2xl border border-slate-300"
      />

      {!readOnly && (
        <>
          <input
            type="hidden"
            name="latitude"
            value={displayedLatitude}
            readOnly
          />

          <input
            type="hidden"
            name="longitude"
            value={displayedLongitude}
            readOnly
          />
        </>
      )}

      <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-xl bg-slate-100 p-3">
          <span className="font-semibold">Latitud:</span>{" "}
          {displayedLatitude}
        </div>

        <div className="rounded-xl bg-slate-100 p-3">
          <span className="font-semibold">Longitud:</span>{" "}
          {displayedLongitude}
        </div>
      </div>

      {locationType === "aproximada" && (
        <p className="mt-3 text-sm text-slate-500">
          La ubicación se guardará de manera aproximada para proteger la
          privacidad del propietario.
        </p>
      )}
    </div>
  );
}