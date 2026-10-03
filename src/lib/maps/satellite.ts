export async function satelliteForAddress(address: string) {
  const geoResponse = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(address)}`,
    {
      headers: {
        "User-Agent": "GeoMancyAI/0.1 (feng shui study app)",
        Accept: "application/json",
      },
      next: { revalidate: 0 },
    },
  );

  if (!geoResponse.ok) {
    throw new Error("The address search did not respond.");
  }

  const places = (await geoResponse.json()) as { lat: string; lon: string; display_name: string }[];
  const place = places[0];
  if (!place) throw new Error("No map location was found for that address.");

  const lat = Number(place.lat);
  const lon = Number(place.lon);
  const delta = 0.0016;
  const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
  const imageResponse = await fetch(
    `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${bbox}&bboxSR=4326&size=640,640&format=jpg&f=image`,
  );

  if (!imageResponse.ok) {
    throw new Error("Satellite imagery could not be fetched.");
  }

  const bytes = Buffer.from(await imageResponse.arrayBuffer());
  return {
    label: place.display_name,
    dataUrl: `data:image/jpeg;base64,${bytes.toString("base64")}`,
  };
}
