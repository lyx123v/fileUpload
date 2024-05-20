import { createRouter, createWebHistory } from "vue-router";
import UploadFileView from "../pages/dependencyAnalysis.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: UploadFileView,
    },
  ],
});

export default router;
