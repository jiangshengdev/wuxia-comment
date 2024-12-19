// 导入处理代码文件的函数和命令行接口函数
import { processCodeFile, cli } from "./processCodeFile.js";
// 导入可运行的序列模块
import { RunnableSequence } from "@langchain/core/runnables";
// 导入预定义的链（chain）
import { chain1, chain2, chain3 } from "./chain.js";

// 从命令行获取参数
const { whichChain, filePath } = cli();

// 根据提供的序号选择对应的链
const chain = [chain1, chain2, chain3][whichChain - 1];
// 从链中创建可运行的序列
const runnable = RunnableSequence.from(chain);

// 处理代码文件，生成武侠风格的注释
processCodeFile(filePath, runnable);
