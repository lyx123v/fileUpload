const SQL_NAME = "SQL_NAME";
const DB_NAME = "DB_NAME";

// Result 这个命名太随意了，没有指向性
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

// 其实这个文件适合做成单例 class，因为它是有状态的
// 你当前的设计要求外部按规则，先调用 init，之后才能调用其他数据操作接口
// 假如做成单例 class，就可以在 construct 里面自行做好数据初始化操作
// 外部只需直接操作数据即可
// 初始化数据库
export const init = () => {
  return new Promise((resolve, reject) => {
    //  as IDBOpenDBRequest
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
    // 更新数据库
    request.onupgradeneeded = (event: any) => {
      db = event.target.result;
      let objectStore;
      if (!db.objectStoreNames.contains(DB_NAME)) {
        // 创建数据库
        objectStore = db.createObjectStore(DB_NAME, {
          keyPath: "name",
          unique: true, // 使用name名称作为主键，且不允许重复
        });
        // 创建索引              索引名称    索引字段         配置
        objectStore.createIndex("content", "content", { unique: false }); // 建立索引
      }
    };
  });
};

// get操作，读取数据
export const get = (name: string): Promise<Result> => {
  return new Promise<Result>((resolve, reject) => {
    // 我感觉，这个类型规则，Get 和 Put 好像都没啥必要，外部并没有地方用到里面的 onsuccess 和 onerror 方法吧？
    // 感觉有点过度设计了
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
