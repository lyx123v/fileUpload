<template>
  <div id="main" style="width: 100vw; height: 100vw;">
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getGraphData } from '../api/index.js'
import { INodeArrayProps, IGraphProps } from '@project/dependency-analysis/types'
import * as echarts from "echarts";
import { CONFIG } from "@project/dependency-analysis/setting";

const myChart = ref<echarts.ECharts | null>(null)
onMounted(() => {
  myChart.value = echarts.init(document.getElementById("main"));
  myChart.value.showLoading();
  init();
});
async function init() {
  await getGraphData().then((res) => {
    myChart.value!.hideLoading();
    const dataValue = res.data.data;

    const edges = dataValue.graph.map((e) => {
      return {
        source: e.source,
        target: e.target
      }
    }) as IGraphProps[];


    const circle = CONFIG.circle || 4;
    const isSort = !!CONFIG.isSort
    const angle = 360 / dataValue.nodeArray.length * circle;
    // 从大到小排序
    isSort && dataValue.nodeArray.sort((a, b) => {
      return b.symbolSize - a.symbolSize;
    })

    const MathXY = (angle: number, i: number, type: 'x' | 'y') => {
      const max = CONFIG.size || Math.min(window.innerWidth, window.innerHeight)
      const nowCircle = max - Math.floor((angle * i) / 360) * (max / circle)
      return Math[type == 'x' ? 'cos' : 'sin']((angle * i) * Math.PI / 180) * nowCircle
    }

    // 计算颜色
    const MathColor = (i: number) => {
      if (CONFIG.colorArray?.length > 0) {
        return CONFIG.colorArray[i % CONFIG.colorArray.length]
      } else {
        return 'rgb(' + [
          Math.round(Math.random() * 160),
          Math.round(Math.random() * 160),
          Math.round(Math.random() * 160)
        ].join(',') + ')'
      }
    }

    const data = dataValue.nodeArray.map((e: INodeArrayProps, i: number) => {
      return {
        id: e.id,
        name: e.id,
        // 根据角度画出圆形
        x: MathXY(angle, i, 'x'),
        y: MathXY(angle, i, 'y'),
        symbolSize: e.symbolSize,
        itemStyle: {
          // 计算颜色
          color: MathColor(i)
        }
      }
    }) as INodeArrayProps[];

    // 绘制图表
    let options = {
      title: {
        text: 'NPM Dependencies'
      },
      animationDurationUpdate: 1500,
      animationEasingUpdate: 'quinticInOut',
      series: [
        {
          type: 'graph',
          layout: 'none',
          // 点
          data: data,
          // 边
          edges: edges,
          emphasis: {
            focus: 'adjacency',
            label: {
              position: 'right',
              show: true
            }
          },
          roam: true,
          lineStyle: {
            width: 0.5,
            curveness: 0.3,
            opacity: 0.7
          }
        }
      ]
    };
    // 渲染图表
    myChart.value!.setOption(options);
  })
}

</script>

<style lang="less" scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  color: #333;

  h2 {
    margin-bottom: 20px;
    color: #5c6ac4;
  }

  .el-input {
    max-width: 600px;
    width: 100%;
    margin-bottom: 30px;

    .el-input__inner {
      border-radius: 20px;
      border: 1px solid #d3dce6;
      padding: 10px 15px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      &:focus {
        border-color: #5c6ac4;
      }
    }

    .el-input__icon {
      color: #5c6ac4;
    }
  }
}
</style>
