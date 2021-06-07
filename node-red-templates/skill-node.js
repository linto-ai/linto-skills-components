const debug = require('debug')('linto:linto-components:template:node:skill')
const path = require('path')
const fs = require('fs')

const Node = require('./node')
const nodeType = require('../data/type-node')

const { AutoLoadException } = require('../exception/node')
const wireEvent = require('../components/wire-event')
const skillNodeLabel = require('../data/label').nodeRedTemplates.skillNode

const DEFAULT_COMPONENT_NODE_TO_LOAD = ['/controllers', '/data', '/events', '/actions']
const DEFAULT_LANGUAGE = { language: 'en-US' }

class LintoSkillNode extends Node {

  constructor(RED, node, config, nodePath) {
    super(node, config)
    this.nodeType = nodeType.SKILL
    RED.library.register("skills")

    this.wireEvent = wireEvent.init(RED)

    this.nodePath = path.join(nodePath)

    this.controller = {}
    this.skillConfig = {}     // Is this optional or require ? use for language ?

    this.registeredEvent = []
  }

  async configure(nodeComponentToLoad) {
    return new Promise(async (resolve, reject) => {
      autoloadSettings.call(this)
      await autoload.call(this, nodeComponentToLoad)
      onDeletedNode.call(this)
      resolve(this)
    })
  }
}

function autoloadSettings() {
  let configLanguage = this.getFlowConfig('language')
  if (configLanguage) {
    this.skillConfig.language = configLanguage.language
  } else {
    this.skillConfig.language = DEFAULT_LANGUAGE
  }
  this.skillConfig.lang = this.skillConfig.language.split('-')[0]
}

async function autoload(nodeComponentToLoad) {
  if (!nodeComponentToLoad) {
    nodeComponentToLoad = DEFAULT_COMPONENT_NODE_TO_LOAD
  }

  if (!Array.isArray(nodeComponentToLoad)) {
    throw new AutoLoadException(skillNodeLabel.autoLoadParamError)
  }

  return new Promise(async (resolve, reject) => {
    try {
      await loadFolderData.call(this, nodeComponentToLoad)
      resolve(this)
    } catch (e) {
      reject(new AutoLoadException(`${skillNodeLabel.autoLoadError} : ${e}`))
    }
  })
}

async function loadFolderData(dirName) {
  try {
    for (let dir of dirName) {
      let pathDir = this.nodePath + dir
      try {
        const currentDir = await fs.promises.readdir(pathDir)

        for (let item of currentDir) {
          let itemPath = path.join(pathDir, item)

          if (item.toLocaleLowerCase().indexOf('.json') !== -1) { // Load if not a json
            this.skillConfig = Object.assign(this.skillConfig, require(itemPath))
          }
          else if (item.toLocaleLowerCase().indexOf('.js') !== -1) {
            let name = item.split('.js')[0]
            let controller = require(itemPath)

            if (dir === '/events' && typeof controller === "function") {
              this.wireEvent.subscribeWithStatus.call(this, this.node.z, name, controller.bind(this))
              this.registeredEvent.push(`${this.node.z}-${name}`)
            }
            else if (dir === '/actions' && typeof controller === "function") {
              name = 'customAction-' + name
              this.wireEvent.subscribeWithStatus.call(this, this.node.z, name, controller.bind(this))
              this.registeredEvent.push(`${this.node.z}-${name}`)
            }
            else if (typeof controller === "function") {
              this.controller[name] = controller.bind(this)
            }
          }
        }
      } catch (e) {
        // Skip, folder don't exist
      }
    }
  } catch (e) {
    throw e
  }
}

function onDeletedNode() {
  let skillNode = this
  this.node.on('close', (remove, done) => {
    for (let eventName of skillNode.registeredEvent) {
      skillNode.wireEvent.unsubscribe(eventName)
    }
    skillNode.registeredEvent = []
    done()
  })
}

module.exports = LintoSkillNode
