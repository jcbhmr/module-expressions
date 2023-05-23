import replaceAllModulesWithURLs from "./internal/replaceAllModulesWithURLs";

const super_postMessage = Worker.prototype.postMessage;
const WorkerMixin = {
  prototype: {
    postMessage(
      data: any,
      transferListOrOptions:
        | Transferable[]
        | StructuredSerializeOptions
        | undefined
    ): void {
      const processedData = replaceAllModulesWithURLs(data);

      // @ts-ignore
      super_postMessage.call(this, processedData, transferListOrOptions);
    },
  },
};

export default WorkerMixin;
