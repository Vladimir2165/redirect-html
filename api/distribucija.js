const { Redis } = require('@upstash/redis');

const redis = Redis.fromEnv();

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metoda nije dozvoljena' });
  }

  try {

    const linkoviKonfiguracija = [
      { id: "link_1", naziv: "Upitnik 1", url: "https://docs.google.com/forms/d/e/1FAIpQLSdjfNXiETeL17V4KPVkPlwrj7x8Jkv5qQ7Myx3BlbYDsmi2Yw/viewform", aktivan: true },
      { id: "link_2", naziv: "Upitnik 2", url: "https://docs.google.com/forms/d/e/1FAIpQLSfwcBzWDoNioK2D3Qa7ApEk82wrclGLs-AAR2iRgX_4mL42Hw/viewform", aktivan: true },
      { id: "link_3", naziv: "Upitnik 3", url: "https://docs.google.com/forms/d/e/1FAIpQLSfagTCoenqAE1XolaJUKVn-EmKeQVt0rkZLOgIhPd9oK96APw/viewform", aktivan: true },
      { id: "link_4", naziv: "Upitnik 4", url: "https://docs.google.com/forms/d/e/1FAIpQLSfkSQe2vr_cZqBwrK2-Vqx4q3rI5rzv83T6tv42DF8UVYIbUQ/viewform", aktivan: true },
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
