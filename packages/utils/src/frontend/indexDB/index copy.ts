export default class DB {
  private db!: IDBDatabase;
  private DB_NAME: string;
  constructor(DB_NAME: string) {
    this.DB_NAME = DB_NAME;
  }

  // openDB
  public openStore = (
    name: string,
    keyPath: string,
    indexs?: Array<string>
  ): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request: IDBOpenDBRequest = indexedDB.open(this.DB_NAME, 1);
      request.onsuccess = (event: any) => {
        this.db = event.target.result;
        resolve(this.db);
      };
      request.onerror = reject;
      request.onupgradeneeded = (event: any) => {
        // 数据库升级成功
        this.db = event.target.result;
        let objectStore: IDBObjectStore;
        if (!this.db.objectStoreNames.contains(name)) {
          objectStore = this.db.createObjectStore(name, {
            keyPath, // 使用name名称作为主键
            autoIncrement: true, // 自增
          });
          if (indexs && indexs.length > 0) {
            indexs.map((E) => {
              // 新建索引       索引名称/索引字段 配置 unique 是否唯一
              objectStore.createIndex(E, E, { unique: false });
            });
          }
          objectStore.transaction.oncomplete = function (event: any) {
            console.log("创建对象仓库成功");
          };
        }
      };
    });
  };

  // get操作，获取数据
  public get = (name: string, key: string | number): Promise<any> => {
    return new Promise((resolve, reject) => {
      const select: IDBRequest = key
        ? this.db.transaction([name], "readonly").objectStore(name).get(key)
        : this.db.transaction([name], "readonly").objectStore(name).getAll();

      select.onsuccess = function () {
        resolve(select.result);
      };
      select.onerror = reject;
    });
  };

  // add/put操作，添加数据，兼容新增修改
  public put = async (name: string, content: any): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
      const select: IDBRequest = this.db
        // 事务操作           仓库名称  操作类型(只读)
        .transaction([name], "readwrite")
        .objectStore(name)
        .put({ name, content, upDateTine: new Date().getTime() });

      select.onsuccess = (event: any) => {
        resolve(event.target.result);
      };
      select.onerror = reject;
    });
  };

  // delete操作，删除数据
  public delete = (name: string, key: string | number): Promise<any> => {
    return new Promise((resolve, reject) => {
      const select: IDBRequest = this.db
        .transaction([name], "readwrite")
        .objectStore(name)
        .delete(key);
      select.onsuccess = (event: any) => {
        resolve(event.target.result);
      };
      select.onerror = reject;
    });
  };
}
