const { Redis } = require('@upstash/redis');

const redis = Redis.fromEnv();

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metoda nije dozvoljena' });
  }

  try {

    const linkoviKonfiguracija = [
      { id: "link_1", naziv: "Upitnik 1", url: "https://docs.google.com/forms/d/e/1FAIpQLSfewqwISzuJqDPGsQNVKmUtovlZgNiswwwBL9tv5xgUd3Ex6g/viewform", aktivan: true },
      { id: "link_2", naziv: "Upitnik 2", url: "https://docs.google.com/forms/d/e/1FAIpQLScb7MrSWUHcksTGB3vi7XAcRrPCoMBDLsi8ggiEenKZ0Poa8g/viewform", aktivan: true },
      { id: "link_3", naziv: "Upitnik 3", url: "https://docs.google.com/forms/d/e/1FAIpQLScQPaaSo935k8XVXG0j6FN-_ydKzaYYtGbg1jvHMMVq3CZ1tA/viewform", aktivan: true },
      { id: "link_4", naziv: "Upitnik 4", url: "https://docs.google.com/forms/d/e/1FAIpQLSfyJAFaytDrWCJ5Pq231IkD49MTpryOEmCWoTBf-Qk0WwOYcg/viewform", aktivan: true },
      { id: "link_5", naziv: "Upitnik 5", url: "https://docs.google.com/forms/d/e/1FAIpQLSevtIdhdlwzMbSXjvUezU8ObovPLU6L5eoBkaCJlsyP7dj3BQ/viewform", aktivan: true },
      { id: "link_6", naziv: "Upitnik 6", url: "https://docs.google.com/forms/d/e/1FAIpQLScEDRbozscdSCHi9u7swg_cGtw2svfj3Liv89dqiCDbb0yR8w/viewform", aktivan: true },
      { id: "link_7", naziv: "Upitnik 7", url: "https://docs.google.com/forms/d/e/1FAIpQLSeLCuT8sE5W0cjFbtapmGsgXo6vzh9GttxJRtOCleb-cAg0sQ/viewform", aktivan: true },
      { id: "link_8", naziv: "Upitnik 8", url: "https://docs.google.com/forms/d/e/1FAIpQLSdeaoN-fMEgaJQWbzPGQTh0RdwfPWDSE4b5m_36tOS5sLTioA/viewform", aktivan: true },
      { id: "link_9", naziv: "Upitnik 9", url: "https://docs.google.com/forms/d/e/1FAIpQLSde325u6DPBjWXm1uunAWR6mU17Au75K7EsUHYyxXA8EwaJYQ/viewform", aktivan: true },
      { id: "link_10", naziv: "Upitnik 10", url: "https://docs.google.com/forms/d/e/1FAIpQLSdyln4TJhUExqkJGRoHAmLNzDWFGpF5Et9aLxPqnuArojmIXg/viewform", aktivan: true }
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