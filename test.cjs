async function test() {
  const renderApiKey = "rnd_7DdzEjihqEBfrY5h5YH6Ewr9AmBS";
  const auth = `Bearer ${renderApiKey}`;

  const res = await fetch("https://api.render.com/v1/owners", {
    headers: { Authorization: auth }
  });
  console.log(await res.json());
}
test();
