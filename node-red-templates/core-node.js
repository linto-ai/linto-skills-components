const debug = require('debug')('linto:linto-components:template:node:core')
const fs = require('fs')

const Node = require('./node')
const wireNode = require('../components/wire-node')

const nodeType = require('../data/type-node')

class LintoCoreNode extends Node {
  constructor(node, config) {
    super(node, config)
    this.nodeType = nodeType.CORE

    this.wireNode = wireNode
  }

  async loadModule(modulePath) {
    if (fs.existsSync(`${modulePath}.js`)) {
      return require(modulePath)
    }
    return undefined
  }

  sendPayloadToLinTO(topic, payload, qos = 2) {
    if (this.wireEvent) {
      this.wireEvent.notify(`${this.node.z}-${this.wireEvent.getOutputName()}`, {
        topic,
        payload,
        qos
      })
    } else {
      console.log('wire event is not define for connect-core-node')
    }
  }
}

module.exports = LintoCoreNode