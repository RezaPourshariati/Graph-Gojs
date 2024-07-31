export interface IGraphService {
  getData(clusterNUmber: number): Promise<{ nodes: any[]; relations: any[] }>
  getUrl(nodeId: number): string
}
