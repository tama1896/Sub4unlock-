export async function onRequest(context) {
  const id = String(context.params.id || "");
  if (!/^[a-f0-9]{10}$/i.test(id)) {
    return new Response("Link tidak valid.", { status: 400 });
  }

  // Rewrite /u/0123abcdef internally to /unlock.html?id=0123abcdef.
  // context.next() lets Pages serve the static unlock.html asset.
  const url = new URL(context.request.url);
  url.pathname = "/unlock.html";
  url.search = "";
  url.searchParams.set("id", id);

  return context.next({ url });
}
