import { json } from "@sveltejs/kit";
import { fetch } from "@tauri-apps/api/http";
import { Body } from "@tauri-apps/api/http";

export async function* queryQwen(
  input: object,
  model: string,
  server: string =
    "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
) {
  const body = Body.json({
    model,
    input,
    parameters: { incremental_output: true },
  });

  console.log("body is", body);

  const resp = await fetch(server, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer sk-b6fb4372167e4e849094180c9a227b3c",
      "X-DashScope-SSE": "enable",
    },
    body,
  });

  //检查是否有响应：如果有响应会读入reader，如果没有响应则返回错误信息提示

  if (!resp.ok) {
    yield "No response from the server."; // 如果函数没有响应就会在这里返回错误信息并暂停执行
    console.log("server is", server);
    return;
  }
  //
  const decoder = new TextDecoder();
  let lastDelta = "";

  yield resp.data;
  //done表示是否读完本次数据，value是本次数据块（如果所有数据都读取完毕就结束整个过程）
  console.log(resp.data);

  // while (true) {
  //   const value = await resp.data
  //   console.log("value is", value);
  //   //解码为字符串
  //   const textDelta = decoder.decode(value).trim();
  //   //提取关键信息输出
  //   try {
  //     let jsonStrings = textDelta.split("data:")[1];
  //     let delta = JSON.parse(jsonStrings).output.text;
  //     lastDelta += delta;
  //   }
  //   catch (e) {
  //     // console.log("Error in parsing JSON", e);
  //   }
  //   if (done) {
  //     yield lastDelta;
  //     break;
  //   }
  // }
}

//  const model: string = "qwen-plus";
//  const server: string= 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
//   // const input:object ={
//   //   "messages":[
//   //           {
//   //               "role": "system",
//   //               "content": "You are a helpful assistant."
//   //           },
//   //           {
//   //               "role": "user",
//   //               "content": "你好，哪个公园距离我最近？"
//   //           }
//   //       ]
//   //  };

//    for await (const output of queryQwen(input,model,server)){
//    console.log(output);
//    }
