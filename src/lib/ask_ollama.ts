const MODEL_NAME = "codegemma";
const DEFAULT_TEMPRATURE = 0.9;

export async function* queryOllama(
  prompt: string = "Hi",
  model: string = MODEL_NAME,
  server: string = "http://10.1.22.88:11434/api/generate",
  temprature: number = DEFAULT_TEMPRATURE
) {
  const body = JSON.stringify({
    model,
    prompt,
    temprature,
  });
  const resp = await fetch(server, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });

  const reader = resp.body?.getReader();
  if (!reader) {
    yield "No response from the server.";
    return;
  }

  const decoder = new TextDecoder();
  let lastDelta = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    const textDelta = decoder.decode(value).trim();
    try {
      let jsonStrings = textDelta.split(/(?<=false})/g);

      let delta = jsonStrings.map((s) => JSON.parse(s).response).join("");

      lastDelta = "";
      yield delta;
    } catch (e) {
      console.log(textDelta);
      lastDelta = textDelta;
    }
  }
}
