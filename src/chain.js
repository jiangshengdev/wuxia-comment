// 导入提示模板和必要的模块
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
import 'dotenv/config';

// 初始化聊天模型
const llm = new ChatOpenAI(
  {
    model: "qwen2.5-72b-instruct", // 指定模型名称
    temperature: 1, // 设置采样温度
    streaming: true, // 启用流式输出
    openAIApiKey: process.env.OPENAI_API_KEY, // 从环境变量读取 API 密钥
    verbose: true, // 启用详细日志
  },
  {
    baseURL: process.env.OPENAI_BASE_URL, // 从环境变量读取 API 基础 URL
  }
);

// 创建输出解析器，定义输出的结构
const outputParser = StructuredOutputParser.fromZodSchema(
  z.object({
    code: z.string().describe("拥有武侠风格注释的完整代码"),
  })
);

// 可运行的输出解析器函数
async function runnableOutputParser(input) {
  // 解析模型的输出，获取纯代码部分
  const parsed = await outputParser.parse(input.annotatedCode.content);

  // 如果解析结果不是字符串，抛出错误
  if (typeof parsed.code !== "string") {
    throw new Error("Invalid output format: code must be a string");
  }

  // 返回解析后的代码
  return parsed.code;
}

// 定义 chain1，由一个提示和输出解析器组成
export const chain1 = [
  {
    annotatedCode: (input) =>
      prompt1_origin.pipe(llm).invoke({
        code: input.code, // 输入代码
        format_instructions: outputParser.getFormatInstructions(), // 格式化指令
      }),
  },
  runnableOutputParser, // 解析器
];

// 定义 chain2，由一个提示和输出解析器组成
export const chain2 = [
  {
    annotatedCode: (input) =>
      prompt2_clarification.pipe(llm).invoke({
        code: input.code, // 输入代码
        format_instructions: outputParser.getFormatInstructions(), // 格式化指令
      }),
  },
  runnableOutputParser, // 解析器
];

// 定义 chain3，由多个步骤组成，包含代码分析、背景设定、情节设计和注释生成
export const chain3 = [
  {
    code: (input) => input.code, // 传递原始代码
    analysis: async (input) => {
      // 执行代码分析
      const response = await prompt3_1_codeAnalysis
        .pipe(llm)
        .invoke({ code: input.code });
      return response;
    },
  },
  {
    code: (input) => input.code, // 传递原始代码
    setting: async (input) => {
      // 生成武侠背景设定
      const response = await prompt3_2_wuxiaSetting
        .pipe(llm)
        .invoke({ analysis: input.analysis });
      return response;
    },
  },
  {
    code: (input) => input.code, // 传递原始代码
    plot: async (input) => {
      // 设计情节
      const response = await prompt3_3_plotDesign
        .pipe(llm)
        .invoke({ setting: input.setting });
      return response;
    },
  },
  {
    annotatedCode: async (input) => {
      // 生成带有注释的代码
      return prompt3_4_commentGenerator.pipe(llm).invoke({
        plot: input.plot,
        code: input.code,
        format_instructions: outputParser.getFormatInstructions(),
      });
    },
  },
  runnableOutputParser, // 解析器
];
