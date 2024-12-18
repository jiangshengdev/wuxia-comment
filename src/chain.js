import {
  prompt1_origin,
  prompt2_clarification,
  prompt3_1_codeAnalysis,
  prompt3_2_wuxiaSetting,
  prompt3_3_plotDesign,
  prompt3_4_commentGenerator,
} from "./prompt.js";
import { z } from "zod";
import { StructuredOutputParser } from "langchain/output_parsers";
import { ChatOpenAI } from "@langchain/openai";
import 'dotenv/config'

// 初始化模型
const llm = new ChatOpenAI({
  model: "qwen2.5-72b-instruct",
  temperature: 1,
  streaming: true,
  openAIApiKey: process.env.OPENAI_API_KEY,
  verbose: true,
}, {
  baseURL: process.env.OPENAI_BASE_URL
});

// 创建输出解析器
const outputParser = StructuredOutputParser.fromZodSchema(
  z.object({
    code: z.string().describe("拥有武侠风格注释的完整代码"),
  })
);

// 最后一步的 runnable
async function runnableOutputParser(input) {
  // 解析输出以获取纯代码内容
  const parsed = await outputParser.parse(input.annotatedCode.content); // 修改此行，访问 content 属性

  // 确保返回的代码是字符串
  if (typeof parsed.code !== "string") {
    throw new Error("Invalid output format: code must be a string");
  }

  return parsed.code;
}

export const chain1 = [
  {
    annotatedCode: (input) =>
      prompt1_origin.pipe(llm).invoke({
        code: input.code,
        format_instructions: outputParser.getFormatInstructions(),
      }),
  },
  runnableOutputParser,
];

export const chain2 = [
  {
    annotatedCode: (input) =>
      prompt2_clarification.pipe(llm).invoke({
        code: input.code,
        format_instructions: outputParser.getFormatInstructions(),
      }),
  },
  runnableOutputParser,
];

// 构建处理链
export const chain3 = [
  {
    code: (input) => input.code,
    analysis: async (input) => {
      const response = await prompt3_1_codeAnalysis
        .pipe(llm)
        .invoke({ code: input.code });
      return response;
    },
  },
  {
    code: (input) => input.code,
    setting: async (input) => {
      const response = await prompt3_2_wuxiaSetting
        .pipe(llm)
        .invoke({ analysis: input.analysis });
      return response;
    },
  },
  {
    code: (input) => input.code,
    plot: async (input) => {
      const response = await prompt3_3_plotDesign
        .pipe(llm)
        .invoke({ setting: input.setting });
      return response;
    },
  },
  {
    annotatedCode: async (input) => {
      return prompt3_4_commentGenerator.pipe(llm).invoke({
        plot: input.plot,
        code: input.code,
        format_instructions: outputParser.getFormatInstructions(),
      });
    },
  },
  runnableOutputParser,
];
