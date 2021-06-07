const debug = require('debug')('linto:linto-components:components:wire-event')

const { WireEventHandlerException } = require('../exception/wire')

const EVENT_BASE_NAME = 'linto-skill-'
const OUTPUT_NODE_NAME = 'linto-out'

class WireEvent {
  constructor() {
    if (process.env.EVENT_BASE_NAME) {
      this.eventBaseName = process.env.EVENT_BASE_NAME
    } else {
      this.eventBaseName = EVENT_BASE_NAME
    }
    this.eventOutputName = OUTPUT_NODE_NAME
    this.eventRegister = []
  }

  init(RED) {
    this.redEvents = RED.events
    return this
  }

  getBaseName() {
    return this.eventBaseName
  }

  getOutputName() {
    return this.eventOutputName
  }

  subscribe(flowId, eventName, handler) {
    debug(`create ${this.eventBaseName}${flowId}-${eventName}`)
    this.redEvents.on(`${this.eventBaseName}${flowId}-${eventName}`, async (...args) => {
      try {
        let skillResult = await handler(...args)
        if (eventName !== OUTPUT_NODE_NAME) {
          let toLintoRes = {
            topic: args[0],
            payload: skillResult,
          }

          if (args[0].payload.transcript && args[0].payload.transcript.text)
            toLintoRes.transcript = args[0].payload.transcript

          this.notify(`${flowId}-${OUTPUT_NODE_NAME}`, toLintoRes)
        }

      } catch (error) {
        throw new WireEventHandlerException(error)
      }
    })
  }

  /* Require to be called with call */
  subscribeWithStatus(flowId, eventName, handler) {
    debug(`create ${this.wireEvent.eventBaseName}${flowId}-${eventName}`)
    let node = this
    this.wireEvent.redEvents.on(`${this.wireEvent.eventBaseName}${flowId}-${eventName}`, async (...args) => {
      try {
        node.sendStatus('green', 'ring')
        let skillResult = await handler(...args)
        if (eventName !== OUTPUT_NODE_NAME) {
          let toLintoRes = {
            topic: (args[0].topic) ? args[0].topic : args[0].payload.topic,
            payload: skillResult,
          }

          if (args[0].payload.transcript && args[0].payload.transcript.text)
            toLintoRes.transcript = args[0].payload.transcript

          node.wireEvent.notify(`${flowId}-${OUTPUT_NODE_NAME}`, toLintoRes)
        }

        setTimeout(function () {
          node.cleanStatus()
        }, node.statusTimer);

      } catch (error) {
        throw new WireEventHandlerException(error)
      }
    })
  }

  notify(eventName, ...args) {
    this.redEvents.emit(`${this.eventBaseName}${eventName}`, ...args)
  }

  // update all subscribed objects / DOM elements
  // and pass some data to each of them
  unsubscribe(eventName) {
    if (!eventName) return
    this.redEvents.removeAllListeners(`${this.eventBaseName}${eventName}`)
  }

  isEventFlow(eventName) {
    let event = `${this.eventBaseName}${eventName}`
    let result = Object.keys(this.redEvents._events).filter(name => name === event)
    if (result.length === 0) {
      return false
    }
    return true
  }
}

module.exports = new WireEvent()