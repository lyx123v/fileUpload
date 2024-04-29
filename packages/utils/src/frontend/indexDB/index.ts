const SQL_NAME = "SQL_NAME";
const DB_NAME = "DB_NAME";

interface Result {
  name: string;
  content: string;
}

interface Get {
  result: Result;
  onsuccess: () => void;
  onerror: (reason?: any) => void;
}

interface Put {
  onsuccess: (target: { result: Result }) => void;
  onerror: (reason?: any) => void;
}

let request: any;
let db: any;

// 初始化数据库
export const init = () => {
  return new Promise((resolve, reject) => {
    request = window.indexedDB.open(SQL_NAME);
    request.onerror = (event: any) => {
      reject(event);
      console.log("初始化数据库失败");
    };
    request.onsuccess = (event: any) => {
      resolve(event.target.result);
      db = event.target.result;
      console.log("初始化成功");
    };
    request.onupgradeneeded = (event: any) => {
      db = event.target.result;
      let objectStore;
      if (!db.objectStoreNames.contains(DB_NAME)) {
        // 创建数据库
        objectStore = db.createObjectStore(DB_NAME, {
          keyPath: "name",
          unique: true, // 使用name名称作为主键，且不允许重复
        });
        objectStore.createIndex("content", "content", { unique: false }); // 建立索引
      }
    };
  });
};

// get操作，读取数据
export const get = (name: string): Promise<Result> => {
  return new Promise<Result>((resolve, reject) => {
    const select: Get = db
      .transaction([DB_NAME], "readonly")
      .objectStore(DB_NAME)
      .get(name);

    select.onsuccess = function () {
      resolve(select.result);
    };
    select.onerror = reject;
  });
};

// add操作，添加数据
export const add = async (name: string, content: any): Promise<Result> => {
  // 如果存在则更新
  const isExist = await get(name);
  if (isExist) return update(name, content);
  return new Promise<Result>((resolve, reject) => {
    const select: Put = db
      .transaction([DB_NAME], "readwrite")
      .objectStore(DB_NAME)
      .add({ name: name, content });

    select.onsuccess = (event: any) => {
      resolve(event.target.result);
    };
    select.onerror = reject;
  });
};

// update操作，更新数据
export const update = (name: string, content: any): Promise<Result> => {
  return new Promise((resolve, reject) => {
    const select: Put = db
      .transaction([DB_NAME], "readwrite")
      .objectStore(DB_NAME)
      .put({ name, content });

    select.onsuccess = (event: any) => {
      resolve(event.target.result);
    };
    select.onerror = reject;
  });
};

// remove操作，删除数据
export const remove = (name: string): Promise<Result> => {
  return new Promise((resolve, reject) => {
    const select: Put = db
      .transaction([DB_NAME], "readwrite")
      .objectStore(DB_NAME)
      .delete(name);

    select.onsuccess = (event: any) => {
      resolve(event.target.result);
    };
    select.onerror = reject;
  });
};

export default {
  init,
  get,
  add,
  update,
  remove,
};
