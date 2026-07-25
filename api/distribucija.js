const { Redis } = require('@upstash/redis');

const redis = Redis.fromEnv();

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metoda nije dozvoljena' });
  }

  try {

    const linkoviKonfiguracija = [
      { id: "link_1", naziv: "Upitnik 1", url: "https://docs.google.com/forms/d/e/1FAIpQLSfVJAi_Gh_ui11VcLEfpWWLo4m6KD8jsFZK_OlcfPFf_Y2vqA/viewform", aktivan: true },
      { id: "link_2", naziv: "Upitnik 2", url: "https://docs.google.com/forms/d/e/1FAIpQLScgjDf9AYY1KRpm8UjsmicCNt6vTTaIWraLyP2OaVOmkASj7A/viewform", aktivan: true },
      { id: "link_3", naziv: "Upitnik 3", url: "https://docs.google.com/forms/d/e/1FAIpQLSfhP7S2vp8vGtybQw4OMJ1eXjFaZS6aNf3raHtZViXv6V1-Ng/viewform", aktivan: true },
      { id: "link_4", naziv: "Upitnik 4", url: "https://docs.google.com/forms/d/e/1FAIpQLSeg5Af0WCury_--oaSCD8xCoV1Y_x4HOlinlVGITwMhCFBA-g/viewform", aktivan: true },
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
