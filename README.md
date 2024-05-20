# Devil Camp Couse

## init

``` bash
npm i -g pnpm@8.5.0 @microsoft/rush@5.110.2
rush update
```

## @demo/upload-file


``` bash
大文件上传服务端
cd apps/upload-file
npm run dev
```

``` bash
大文件上传客户端
cd apps/upload-file-vue
npm run dev
```

``` bash
rush 操作
rush update // 跑
rush unlink // 断联
rush purge // 去除node_modules
```

``` bash
依赖分析
cd apps/dependencyAnalysis
dep-graph-cli ana -e ../../common/config/rush/pnpm-lock.yaml
dep-graph-cli ana -e ./test/pnpm-lock.yaml
dep-graph-cli ana -e ./test/package-lock.json
dep-graph-cli ana -e ./test/yarn.lock
```