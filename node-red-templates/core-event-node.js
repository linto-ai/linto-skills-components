const debug = require('debug')('linto:linto-components:template:node:core-event')

const CoreNode = require('./core-node')
const wireEvent = require('../components/wire-event')

const nodeType = require('../data/type-node')

class LintoCoreEventNode extends CoreNode {
  constructor(RED, node, config) {
    super(node, config)
    this.nodeType = nodeType.CORE

    this.wireEvent = wireEvent.init(RED)
  }

  notifyEventError(topic, say, error) {
    this.wireEvent.notify(`${this.node.z}-${this.wireEvent.getOutputName()}`, {
      topic,
      payload: {
        say,    //phonetic and text
        error   // message and code
      }
    })
  }

  sendToLinto(topic, say) {
    this.wireEvent.notify(`${this.node.z}-${this.wireEvent.getOutputName()}`, {
      topic,
      payload: {
        say    //phonetic and text
      }
    })
  }
}

module.exports = LintoCoreEventNode