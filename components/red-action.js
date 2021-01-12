const debug = require('debug')('linto:linto-components:components:red-action')

const APPLICATION_NODE_NAME = 'linto-application-in'
const TERMINAL_NODE_NAME = 'linto-terminal-in'

// This compoents should be called with redAction.funcToCall.call(RED, ...param)
class RedAction {

  /**
    * @summary Get information about a defined node id
    *  
    * @param {String} flowId the flow id to search the node
    * @param {String} nodeId the node id to get information
    *
    * @returns {Object} The corresponding node based on the id
  **/
  getNodeFromId(flowId, idNode) {
    let node = this.nodes.getNode(idNode)
    if (node.z === flowId && !node.d)
      return node
    return null
  }

  /**
  * @summary Search a specific node based on their exact name
  *  
  * @param {String} flowId the flow id to search the node
  * @param {String} nodeName the node name to get information
  *
  * @returns {Object} The N corresponding node based on their name
**/
  findNodeType(flowId, nodeName) {
    let findNode = undefined
    this.nodes.eachNode((node) => {
      if (node.z === flowId && !node.d && node.type === nodeName) {
        findNode = node
        return;
      }
    })
    return findNode
  }

  /**
    * @summary Search all specific node based on their name
    *  
    * @param {String} flowId the flow id to search the node
    * @param {String} nodeName the node name to get information
    *
    * @returns {Object} The N corresponding node based on their name
  **/
  getFirstNodeFromName(flowId, nodeName) {
    let findNode = undefined
    this.nodes.eachNode((node) => {
      if (node.z === flowId && !node.d && node.type.includes(nodeName)) {
        findNode = node
        return;
      }
    })
    return findNode
  }

  /**
    * @summary Search all specific node based on their name
    *  
    * @param {Object} flowId the flow id to search the node
    * @param {String} nodeName the node name to get information
    *
    * @returns {Object} The N corresponding node based on their name
  **/
  getNodesFromName(flowId, nodeName) {
    let flowsNodes = []
    this.nodes.eachNode((node) => {
      if (node.z === flowId && !node.d && node.type.includes(nodeName)) {
        flowsNodes.push(node)
      }
    })
    return flowsNodes
  }

  getLintoSnFromFlow(flowId) {
    let searchedNode = [APPLICATION_NODE_NAME, TERMINAL_NODE_NAME]
    let sn = []
    this.nodes.eachNode((node) => {
      if (node.z === flowId && !node.d && searchedNode.indexOf(node.type) > -1) {
        if (node.type === APPLICATION_NODE_NAME)
          sn.push({ id: '+' })   // sn = Object.assign(sn, node.lintoIds)
        else if (node.type === TERMINAL_NODE_NAME)
          sn.push({ id: node.sn })
      }
    })
    return sn
  }

  /**
    * @summary Get all node based on a flow id
    *  
    * @param {Object} flowId the flow id to search the node
    *
    * @returns {Object} The N corresponding node based on the flow id
  **/
  listNodesFromFlowId(flowId) {
    let flowsNodes = []
    this.nodes.eachNode((node) => {
      if (node.z === flowId && !node.d) {
        flowsNodes.push(node)
      }
    })
    return flowsNodes
  }

  /**
  * @summary Get all node based on a flow id
  *  
  * @param {Object} flowId the flow id to search the node
  *
  * @returns {Object} The N corresponding node based on the flow id
**/
  listPartialNodesInfosFromFlowId(flowId) {
    let flowsNodes = []
    this.nodes.eachNode((node) => {
      if (node.z === flowId && !node.d) {
        flowsNodes.push({
          id: node.id,
          type: node.type,
          name: node.name,
          description: node.description
        })
      }
    })
    return flowsNodes
  }
}

module.exports = new RedAction()