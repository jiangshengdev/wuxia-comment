// 导入文件系统模块的异步函数，以便进行文件操作
import fs from "fs/promises";

// 主函数：生成武侠风格的代码注释
async function generateWuxiaCodeComments(code, runnable) {
  try {
    // 调用 runnable 对象的 invoke 方法，生成带有武侠风格注释的代码
    return await runnable.invoke({ code });
  } catch (error) {
    // 如果发生错误，输出错误信息并抛出异常
    console.error("生成注释出错：", error);
    throw error;
  }
}

// 处理代码文件的函数
export async function processCodeFile(filePath, runnable) {
  try {
    const startTime = performance.now(); // 记录开始时间

    // 读取指定路径的代码文件内容
    const code = await fs.readFile(filePath, "utf-8");

    // 生成带有武侠风格注释的代码
    const annotatedCode = await generateWuxiaCodeComments(code, runnable);

    // 将生成的代码写回原文件
    await fs.writeFile(filePath, annotatedCode, "utf-8");

    const endTime = performance.now(); // 记录结束时间
    const timeElapsed = ((endTime - startTime) / 1000).toFixed(2); // 计算耗时

    // 输出成功信息，包含文件路径和耗时
    console.log(`生成注释成功：${filePath} (用时: ${timeElapsed}秒)`);
  } catch (error) {
    // 如果发生错误，输出错误信息并抛出异常
    console.error(`生成注释出错：${filePath}:`, error);
    throw error;
  }
}

// 命令行接口函数
export function cli() {
  // 获取命令行参数，跳过 node 和 npm run 相关的参数
  const args = process.argv.slice(2);
  const whichChain = args[0]; // 获取 Chain 序号
  const filePath = args[1]; // 获取文件路径

  // 如果未提供 Chain 序号，输出错误并退出
  if (!whichChain) {
    console.error("请提供一个Chain序号，1～3");
    process.exit(1);
  }

  // 如果未提供文件路径，输出错误并退出
  if (!filePath) {
    console.error("请提供一个文件路径作为参数");
    process.exit(1);
  }

  // 返回解析后的参数
  return { whichChain, filePath };
}
