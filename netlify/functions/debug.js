exports.handler = async () => {
  const key = process.env.GROQ_API_KEY;
  return {
    statusCode: 200,
    body: JSON.stringify({
      key_start: key ? key.substring(0, 8) : 'LEEG - NIET GEVONDEN',
      key_length: key ? key.length : 0,
      key_exists: !!key
    })
  };
};
