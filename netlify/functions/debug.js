exports.handler = async () => {
  const key = process.env.GROQ_API_KEY;
  return {
    statusCode: 200,
    body: JSON.stringify({
      // We tonen alleen de eerste 8 tekens zodat de key niet volledig zichtbaar is
      key_start: key ? key.substring(0, 8) : 'LEEG - NIET GEVONDEN',
      key_length: key ? key.length : 0,
      key_exists: !!key
    })
  };
};
```

Nadat Netlify opnieuw heeft gedeployed, open je in je browser dit adres (vervang de sitenaam door die van jou):
```
https://lumina-ai-dani.netlify.app/.netlify/functions/debug
