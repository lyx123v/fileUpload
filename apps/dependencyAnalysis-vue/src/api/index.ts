import axios, { type CancelTokenSource } from "axios";
import { PORT } from "@project/dependency-analysis/setting";
const BASE_URL = `http://localhost:${PORT}`;

const instance = axios.create({
  // 正式项目中，需要根据环境变量赋予实际地址
  baseURL: BASE_URL,
  timeout: 10000,
});

export function getGraphData() {
  return instance.get("/api/graph");
}
