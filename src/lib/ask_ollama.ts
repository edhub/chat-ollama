const MODEL_NAME = "codegemma";
// const MODEL_NAME = "phi3:14b";
const DEFAULT_TEMPRATURE = 0.9;

export async function* queryOllama(
  prompt: string = "Hi",
  model: string = MODEL_NAME,
  temprature: number = DEFAULT_TEMPRATURE
) {
  const OLLAMA_URL = "http://localhost:11434/api/generate";

  //   const OLLAMA_URL = "http://10.1.22.88:11434/api/generate";
  const resp = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt,
      temprature,
    }),
  });
  // console.log(prompt);

  const reader = resp.body?.getReader();
  if (!reader) {
    console.log("No response from the server.");
    return;
  }

  const decoder = new TextDecoder();
  let lastDelta = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    const textDelta = decoder.decode(value);
    try {
      const delta = JSON.parse(lastDelta + textDelta).response;
      lastDelta = "";
      yield delta;
    } catch (e) {
      lastDelta = textDelta;
    }
  }
}
