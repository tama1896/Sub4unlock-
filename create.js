function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}

function isHttpUrl(value) {
  if (typeof value !== "string" || value.length > 4096) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export async function onRequestPost({ request, env }) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
    return json({ error: "Backend belum dikonfigurasi. Tambahkan secrets Supabase di Cloudflare." }, 500);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Data permintaan tidak valid." }, 400);
  }

  const allowed = ["t", "s", "l", "i", "g", "w"];
  const cleaned = {};
  for (const key of allowed) {
    if (payload[key] !== undefined && payload[key] !== "") {
      if (!isHttpUrl(payload[key])) {
        return json({ error: "Salah satu URL tidak valid. Gunakan http:// atau https://." }, 400);
      }
      cleaned[key] = payload[key];
    }
  }

  if (!cleaned.t) return json({ error: "Link tujuan wajib diisi." }, 400);

  // Use a random, non-sequential ID. Database uniqueness is enforced by the primary key.
  for (let attempt = 0; attempt < 3; attempt++) {
    const id = crypto.randomUUID().replaceAll("-", "").slice(0, 10);
    const endpoint = `${env.SUPABASE_URL.replace(/\/$/, "")}/rest/v1/links`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "apikey": env.SUPABASE_SECRET_KEY,
        "Authorization": `Bearer ${env.SUPABASE_SECRET_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({ id, payload: cleaned })
    });

    if (response.ok) {
      const origin = new URL(request.url).origin;
      return json({ id, url: `${origin}/u/${id}` }, 201);
    }

    if (response.status !== 409) {
      const detail = await response.text();
      console.error("Supabase insert failed:", response.status, detail);
      return json({ error: "Database gagal menyimpan link. Periksa konfigurasi Supabase." }, 502);
    }
  }

  return json({ error: "Tidak berhasil membuat ID unik. Coba lagi." }, 503);
}
