import { Command } from "commander";
import { startServer } from "./server";

export const main = async () => {
  const program = new Command();

  const mapActions = {
    analyze: {
      alias: "ana",
      description: "分析模块依赖关系",
      examples: ["dep-graph-cli ana <lockFilename>"],
      options: [
        {
          flag: "-e, --entry [file-path]",
          description: "指定传入的文件路径",
        },
        {
          flag: "-j, --json [file-path]",
          description: "将依赖关系以 JSON 形式存储到指定的文件",
        },
      ],
    },
    "*": {
      alias: "",
      description: "command not found",
      examples: [],
    },
  };

  // 循环创建命令
  Reflect.ownKeys(mapActions).forEach((action) => {
    const cmd = program
      .command(String(action)) // 配置命令名称
      .alias(mapActions[action].alias) // 命令别名
      .description(mapActions[action].description); // 命令对应描述

    // 选项
    if (mapActions[action].options) {
      mapActions[action].options.forEach((option) => {
        cmd.option(
          option.flag, // 配置选项
          option.description // 选项描述
        );
      });
    }

    cmd.action((cmdObj) => {
      if (action === "*") {
        console.log("未找到命令");
      } else {
        const { entry, json = null } = cmdObj;
        startServer({
          entry,
          json,
        });
      }
    });
  });

  program.on("--help", () => {
    console.log("\nExamples:");
    Reflect.ownKeys(mapActions).forEach((action) => {
      mapActions[action].examples.forEach((example) => {
        console.log(`${example}`);
      });
    });
  });

  program.parse(process.argv);
};
