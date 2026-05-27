const { Redis } = require('@upstash/redis');

const redis = Redis.fromEnv();

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metoda nije dozvoljena' });
  }

  try {

    const linkoviKonfiguracija = [
      { id: "link_1", naziv: "Upitnik 1", url: "https://docs.google.com/forms/d/e/1FAIpQLSdRwt1ePICIk_1eFCqJTj7TzWh5_F83d-HRgRe6ibD6xd9FnA/viewform", aktivan: true },
      { id: "link_2", naziv: "Upitnik 2", url: "https://docs.google.com/forms/d/e/1FAIpQLSejGfxzWkfccjJ2v8W2DXRhNHSWrKp7CazBsORDdSsBRNaxqQ/viewform", aktivan: true },
      { id: "link_3", naziv: "Upitnik 3", url: "https://docs.google.com/forms/d/e/1FAIpQLScpHT_FijYR2kSYrktP47DT5tX2563wu9j45PwQnxl26ZEcGQ/viewform", aktivan: true },
      { id: "link_4", naziv: "Upitnik 4", url: "https://docs.google.com/forms/d/e/1FAIpQLSdUSE0UTBamjsN8M5WlKrq0WzGwKQ_faKLCfahAP8hZcIq67Q/viewform", aktivan: true },
      { id: "link_5", naziv: "Upitnik 5", url: "https://docs.google.com/forms/d/e/1FAIpQLSfwo_lc1Cs5d34VzqtAgs1eMk8hiWtqAzAG5pZV9hlAEHOMYg/viewform", aktivan: true },
      { id: "link_6", naziv: "Upitnik 6", url: "https://docs.google.com/forms/d/e/1FAIpQLSfCMjEi1xDZkqypefV82ib3hBJArgT7-cD09uaB9pz6UwGtBw/viewform", aktivan: true },
      { id: "link_7", naziv: "Upitnik 7", url: "https://docs.google.com/forms/d/e/1FAIpQLSf0fvBeRqpXbzUpZWIiIl-_AztcF-lCGaqXXgh2G_fOMwU0tQ/viewform", aktivan: true },
      { id: "link_8", naziv: "Upitnik 8", url: "https://docs.google.com/forms/d/e/1FAIpQLScpRh8g4W65zP6PuD-rLGBVgrD2uTmoBjnj-45SgkciCQe7mw/viewform", aktivan: true },
      { id: "link_9", naziv: "Upitnik 9", url: "https://docs.google.com/forms/d/e/1FAIpQLScQORW3JWLnAuM-9VkwNyqrH8jB0QUt0USfgPzrS959gol5kQ/viewform", aktivan: true },
      { id: "link_10", naziv: "Upitnik 10", url: "https://docs.google.com/forms/d/e/1FAIpQLSedxYGfIr2rcwPl8KRCatYJF-77jEoFgPE84YxgitV_RbXNQg/viewform", aktivan: true }
    ];

   const aktivniKandidati = linkoviKonfiguracija.filter(l => l.aktivan && l.url);

    if (aktivniKandidati.length === 0) {
      return res.status(400).json({ error: 'Nema aktivnih linkova u sistemu.' });
    }

    const kljucevi = aktivniKandidati.map(k => k.id);
    const klikoviIzBaze = await redis.mget(...kljucevi);

    const kandidatiSaStanjem = aktivniKandidati.map((kandidat, index) => {
      const br = klikoviIzBaze[index];
      return {
        ...kandidat,
        broj: br ? Number(br) : 0
      };
    });

    const minBroj = Math.min(...kandidatiSaStanjem.map(c => c.broj));
    const najmanjeKorisceni = kandidatiSaStanjem.filter(c => c.broj === minBroj);
    
    const chosen = najmanjeKorisceni[
      Math.floor(Math.random() * najmanjeKorisceni.length)
    ];

    await redis.incr(chosen.id);

    return res.status(200).json({ url: chosen.url });

  } catch (error) {
    console.error("Greška na serveru:", error);
    return res.status(500).json({ error: "Interna greška servera" });
  }
};