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

  //检查是否有响应
  if (!resp.ok) {
    yield resp.text(); // 如果函数没有响应就会在这里返回错误信息并暂停执行
    console.log("server is", server);
    return;
  }
  // yield resp.text();

  // 输出数据
  const respmsg: string = JSON.parse(await resp.text()).output.text;
  yield respmsg;
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
