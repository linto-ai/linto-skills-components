const debug = require('debug')('linto:linto-components:template:node:node')
const fs = require('fs')

const nodeType = require('../data/type-node')

const STATUS_TIMER = 500  //ms

class LintoNode {
  constructor(node, config) {
    this.node = node
    this.config = config
    this.nodeType = nodeType.DEFAULT
    this.statusTimer = STATUS_TIMER
  }

  cleanStatus() {
    this.node.status({})
  }

  sendStatus(fill, shape, text) {
    this.node.status({ fill, shape, text })
  }

  setFlowConfig(key, value) {
    this.node.context().flow.set(key, value)
  }

  getFlowConfig(key) {
    return this.node.context().flow.get(key)
  }

  getNodeConfig(key) {
    return this.config[key]
  }
}

module.exports = LintoNode
module.exports.loadFile = (dirLocation, filePath) => {
  const ext = filePath.substring(filePath.indexOf('.'))
  if (ext === '.json') return require(`${dirLocation}/${filePath}`)
  else return fs.readFileSync(`${dirLocation}/${filePath}`, 'utf-8')
}