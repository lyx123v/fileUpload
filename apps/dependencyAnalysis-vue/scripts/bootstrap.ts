import exec from "child_process";
import path from "path";

export const startVueProject = async () => {
  exec.exec(
    `cd ${path.resolve(
      __dirname,
      "../../../apps/dependencyAnalysis-vue"
    )} && npm run dev`
  );
};
