import { json } from "@sveltejs/kit";
import { fetch } from "@tauri-apps/plugin-http";

export async function* queryQwen(
  input: object,
  model: string,
  server: string =
    "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
) {
  // bodyinput
  const data = {
    model,
    input,
    //  parameters: { tools:"function" },
  };

  console.log("body is", data);

  const resp = await fetch(
    server,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer sk-b6fb4372167e4e849094180c9a227b3c",
        //  "X-DashScope-SSE": "enable",
      },
      body: JSON.stringify(data),
    },
  );

  const respmsg = await resp.text();

  if (!resp.ok) {
    console.log("error is", respmsg);
    console.log("server is", server);
    yield "服务器出错啦！";
    return;
  }

  try {
    yield JSON.parse(respmsg).output.text;
  } catch (e) {
    yield "解析出错啦！";
  }
}

// const input:object ={
//   "messages":[
//           {
//               "role": "system",
//               "content": "You are a helpful assistant."
//           },
//           {
//               "role": "user",
//               "content": "你好，哪个公园距离我最近？"
//           }
//       ]
//  };
//  for await (const output of queryQwen(input,model,server)){
//  console.log(output);
//  }
