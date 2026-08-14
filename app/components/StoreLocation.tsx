export default function StoreLocation() {
  const mapsUrl =
    "https://www.google.com/maps/place/Pichardovapeshop/@18.6017468,-68.4409861,624m/data=!3m1!1e3!4m14!1m7!3m6!1s0x8ea895099f1aca57:0xc7aa439080fe8369!2sPichardovapeshop!8m2!3d18.6014561!4d-68.4397076!16s%2Fg%2F11x6rwclg9!3m5!1s0x8ea895099f1aca57:0xc7aa439080fe8369!8m2!3d18.6014561!4d-68.4397076!16s%2Fg%2F11x6rwclg9";

  const embedUrl =
    "https://www.google.com/maps?q=18.6014561,-68.4397076&z=17&output=embed";

  return (
    <section className="bg-white px-5 py-14 text-zinc-900">
      <div className="mx-auto max-w-[1500px]">

        <div className="mb-8">

          <p className="text-sm font-black uppercase tracking-[0.2em] text-red-500">
            Visítanos
          </p>

          <h2 className="mt-2 text-3xl font-black text-zinc-900 md:text-4xl">
            Nuestra Dirección
          </h2>

          <div className="mt-4 h-1 w-16 rounded-full bg-red-600" />

        </div>

        <div className="grid overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm lg:grid-cols-[0.42fr_0.58fr]">

          {/* INFORMACIÓN */}
          <div className="p-7 md:p-10">

            <div className="flex items-center gap-4">

              <img
                src="/logo-pichardo.png"
                alt="Pichardo Vape Shop"
                className="h-16 w-16 object-contain"
              />

              <div>
                <h3 className="text-xl font-black text-zinc-900 md:text-2xl">
                  PICHARDO VAPE SHOP
                </h3>

                <p className="mt-1 text-sm font-bold text-red-500">
                  El papá de los precios
                </p>
              </div>

            </div>

            <div className="mt-8 rounded-2xl bg-zinc-50 p-5">

              <p className="text-sm font-black uppercase tracking-widest text-zinc-500">
                Ubicación
              </p>

              <p className="mt-2 text-lg font-bold text-zinc-900">
                Punta Cana, República Dominicana
              </p>

              <p className="mt-2 text-zinc-600">
                WhatsApp: +1 (809) 505-6991
              </p>

            </div>

            {/* HORARIOS */}
            <div className="mt-8">

              <h4 className="mb-5 text-lg font-black text-zinc-900">
                Horarios
              </h4>

              <div className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white">

                {[
                  ["Lunes", "11:00 a. m. - 11:00 p. m."],
                  ["Martes", "11:00 a. m. - 11:00 p. m."],
                  ["Miércoles", "11:00 a. m. - 11:00 p. m."],
                  ["Jueves", "11:00 a. m. - 11:00 p. m."],
                  ["Viernes", "11:00 a. m. - 11:00 p. m."],
                  ["Sábado", "11:00 a. m. - 11:00 p. m."],
                  ["Domingo", "11:30 a. m. - 10:00 p. m."],
                ].map(([day, hours]) => (
                  <div
                    key={day}
                    className="flex flex-col justify-between gap-1 px-4 py-3 sm:flex-row sm:items-center"
                  >
                    <span className="font-bold text-zinc-800">
                      {day}
                    </span>

                    <span className="text-sm font-semibold text-zinc-500">
                      {hours}
                    </span>
                  </div>
                ))}

              </div>
            </div>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 block w-full rounded-xl bg-red-600 px-8 py-4 text-center font-black text-white transition hover:bg-red-500"
            >
              📍 Cómo llegar
            </a>

          </div>

          {/* MAPA */}
          <div className="min-h-[420px] bg-zinc-100 lg:min-h-[620px]">

            <iframe
              src={embedUrl}
              width="100%"
              height="100%"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="min-h-[420px] w-full border-0 lg:min-h-[620px]"
              title="Ubicación Pichardo Vape Shop"
            />

          </div>

        </div>

      </div>
    </section>
  );
}