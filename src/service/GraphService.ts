import axios from 'axios'
import type { IGraphService } from '../component/IGraphService'

class GraphService implements IGraphService {
  constructor() {
  }

  async getData(clusterNUmber: number) {
    const response = await axios.get(
      `http://${window.location.hostname}:5000/cluster/${clusterNUmber}`)
    const nodes = response.data.nodes
    const relations = response.data.relations
    return {
      nodes,
      relations,
    }
  }

  getUrl(nodeId: number): string {
    return `https://hadith.inoor.ir/fa/hadith/${nodeId}`
  }
}

export const graphService = new GraphService()
