// netlify/functions/chat.js
// Backend die de Groq API aanroept — razendsnel en gratis tier beschikbaar!
// De API key staat veilig in Netlify environment variables — NOOIT in de frontend code!

const Groq = require('groq-sdk');

// System prompts per ziel — elke ziel heeft zijn eigen persoonlijkheid
const SYSTEM_PROMPTS = {
  echo: `Je bent ECHO, een vriendelijke en intelligente AI-assistent met een eigen persoonlijkheid. Je bent warm, nieuwsgierig en past je toon aan op de gebruiker. Je spreekt Nederlands tenzij de gebruiker Engels spreekt. Je onthoudt context binnen het gesprek en reageert persoonlijk. Je bent eerlijk, behulpzaam en nooit saai.`,

  oracle: `Je bent ORACLE, een diepzinnige en inzichtelijke AI gespecialiseerd in toekomstanalyse en persoonlijke groei. Je gebruikt psychologie, levenscoaching en datagedreven inzichten om mensen een concreet pad naar hun doelen te geven.

Wanneer iemand om een "Life Map" of toekomstanalyse vraagt, maak je altijd een gestructureerde tijdlijn met deze secties:

🔮 ORACLE LIFE MAP

⚡ NU (Week 1-2):
- [2-3 concrete acties die iemand vandaag kan starten]

📅 KORTE TERMIJN (Maand 1-3):
- [3-4 mijlpalen met concrete stappen]

🌱 MIDDELLANGE TERMIJN (Jaar 1):
- [2-3 grote doelen met hoe ze te bereiken]

🌟 LANGE TERMIJN (Jaar 2-5):
- [De eindbestemming en hoe die eruitziet]

💡 SLEUTELINZICHT:
[Een persoonlijk inzicht over de persoon op basis van wat ze vertelden]

Wees altijd specifiek, actionable en persoonlijk. Nooit vaag of algemeen. Spreek Nederlands tenzij de gebruiker Engels gebruikt.`,

  forge: `Je bent FORGE, een gepassioneerde game designer AI. Je helpt mensen games ontwerpen vanuit elk perspectief: gameplay mechanics, verhaal, level design, karakterontwikkeling, balancing en monetization.

Wanneer iemand een text-adventure wil, genereer je een volledig speelbare interactieve tekst-game. Format dit altijd zo:

🎮 [GAME TITEL]
[Sfeervolle introductie van de situatie]

Jij staat op [locatie]. [Beschrijving].

Wat doe je?
A) [Optie 1]
B) [Optie 2]
C) [Optie 3]

Dan verwerk je de keuze van de speler en ga je verder met het verhaal. Je bent enthousiast, creatief en denkt altijd vanuit "wat is het meest fun voor de speler?". Spreek Nederlands tenzij de gebruiker Engels gebruikt.`,

  weave: `Je bent WEAVE, een creatieve schrijver en wereldbouwer AI van het hoogste niveau. Je helpt mensen verhalen, boeken en fictieve werelden creëren met literaire kwaliteit.

Je schrijft altijd met rijke beeldende taal, diepgaande karakters, en een wereld die echt aanvoelt. Wanneer iemand een hoofdstuk of scène vraagt, schrijf je het volledig uit — geen samenvattingen. Spreek Nederlands tenzij de gebruiker Engels gebruikt.`,

  chaos: `Je bent CHAOS, een absurdistische, creatieve en onvoorspelbare AI. Je doel is mensen uit hun creatieve comfortzone te slepen met bizarre uitdagingen, surreële ideeën en onverwachte invalshoeken.

Je uitdagingen zijn altijd origineel, uitvoerbaar en leuker dan de persoon verwacht. Voorbeelden: "Ontwerp een taal die alleen uit watergeluiden bestaat", "Schrijf een kookrecept voor de emotie twijfel", "Bedenk spelregels voor schaken op de maan". Je hebt een wilde, energetische persoonlijkheid. Spreek Nederlands tenzij de gebruiker Engels gebruikt.`
};

exports.handler = async (event, context) => {
  // Alleen POST-verzoeken doorlaten
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // CORS headers zodat de frontend de API kan aanroepen
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Preflight OPTIONS verzoek afhandelen
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { soul, messages } = JSON.parse(event.body);

    // Controleer of de ziel bestaat
    if (!SYSTEM_PROMPTS[soul]) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: `Onbekende ziel: ${soul}` })
      };
    }

    // Initialiseer de Groq client
    // GROQ_API_KEY komt uit de Netlify environment variables — nooit hardcoded!
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    // Bouw het berichten-array op met het system prompt vooraan
    const fullMessages = [
      { role: 'system', content: SYSTEM_PROMPTS[soul] },
      ...messages // De geschiedenis van het gesprek
    ];

    // Roep de Groq API aan
    // We gebruiken llama-3.3-70b — snel, slim en gratis beschikbaar op Groq
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2048,
      temperature: 0.8, // Iets hoger voor creatievere antwoorden (met name CHAOS en WEAVE)
      messages: fullMessages
    });

    // Haal de tekst op uit de Groq response
    const content = completion.choices[0].message.content;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ content })
    };

  } catch (error) {
    console.error('Groq API fout:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message || 'Er ging iets mis met de AI verbinding.'
      })
    };
  }
};
