'use strict'

import fs from 'fs';
import path from 'path';
import { IntentDetector, Configuration } from 'satori-flow';

const DefaultRequestMock = {
  "session": {
    "attributes": {},
    "user": {}
  },
  "request": {
    "type": "IntentRequest"
  },
  "context": {
    "System": {
      "device": {
        "supportedInterfaces": {}
      }
    }
  }
}

class AlexaResponseMock {
  speak(m) { this.message = m; }
  listen(r) { this.reprompt = r; }
  cardRenderer(c) { this.card = c; }
  renderTemplate(r) { this.templateSetting = r; }
  linkAccountCard(l) { this.linkAccountCard = l; }
}
class AlexaMock {
  constructor() {
    this.response = new AlexaResponseMock();
    this.event = {};
    this.handler = {
      state: null
    }
  }
  emit() {}
}

export default class Kuchimane {
  constructor(satori, handlers, requestMock) {
    this.satori = satori;
    this.handlers = handlers;
    this.alexa = new AlexaMock();
    this.alexa.event = requestMock;
  }

  listen(text) {
    const satoriResult = this.satori.match({ text });
    this.alexa.event.request.intent = {};
    this.alexa.event.request.intent.slots = {};
    if(satoriResult.feature) {
      for(const k in satoriResult.feature) {
        this.alexa.event.request.intent.slots[k] = { value: satoriResult.feature[k] }
      }
    }

    const result = this.handlers[[satoriResult.match, this.alexa.handler.state].join('')].call(this.alexa);

    if (result instanceof Promise) {
      return result.then(() => {
          return this.alexa.response.message;
        }).catch((e) => { console.log(e) });
    } else {
      return Promise.resolve(this.alexa.response.message);
    }
  }

  talkCheck(inputMessage, assertion) { return () => this.listen(inputMessage).then(assertion) }

  static runner(handlers, configPath, requestMockName) {
    const testConfig = JSON.parse(fs.readFileSync(configPath));
    const baseDir = path.dirname(configPath);
    let requestMock = DefaultRequestMock;
    if (requestMockName && testConfig.requestMocksDirPath) {
      requestMock = JSON.parse(fs.readFileSync(path.join(baseDir, testConfig.requestMocksDirPath, requestMockName + '.json')));
    }
    return new Kuchimane(
      new IntentDetector(new Configuration(this.satoriConfig(testConfig, baseDir))),
      handlers,
      requestMock
    );
  }

  static satoriConfig(testConfig, baseDir) {
    const intents = [];
    const slots = [];

    if (testConfig['LaunchRequest'] && testConfig['LaunchRequest']['match']) {
      intents.push({ name: 'LaunchRequest', match: testConfig['LaunchRequest']['match'] });
    }
    const modelData = JSON.parse(fs.readFileSync(path.join(baseDir, testConfig.modelPath)));
    this._satoriConfig(modelData, intents, slots);
    return { intents, slots };
  }

  static _satoriConfig(modelData, intents, slots) {
    modelData.interactionModel.languageModel.intents.forEach((intent) => {
      if(!intent.samples) {
        if(intent.name == 'AMAZON.HelpIntent') {
          intents.push({ name: intent.name, match: { patterns: ['ヘルプ'], type: 'verbatim' } });
        } else if(intent.name == 'AMAZON.StopIntent') {
          intents.push({ name: intent.name, match: { patterns: ['ストップ'], type: 'verbatim' } });
        } else if(intent.name == 'AMAZON.CancelIntent') {
          intents.push({ name: intent.name, match: { patterns: ['キャンセル'], type: 'verbatim' } });
        }
        return;
      }
      const obj = {};
      obj.match = {}
      obj.name = intent.name;
      obj.match.patterns = intent.samples;
      if (intent.slots) {
        obj.match.type = 'template';
        obj.match.options = ['ignoreSpace', 'exactMatch'];
        obj.match.slotAlias = {};
        for(let i = 0; i < obj.match.patterns.length; i++) {
          let text = obj.match.patterns[i];
          intent.slots.forEach((s) => {
            text = text.replace(new RegExp(`\{${s.name}\}`, 'g'), `#{${s.name}}`)
            obj.match.slotAlias[s.name] = s.type;
          })
          obj.match.patterns[i] = text;
        }
      } else {
        obj.match.type = 'verbatim';
      }
      intents.push(obj);

      if (modelData.interactionModel.languageModel.types) {
        modelData.interactionModel.languageModel.types.forEach((t) => {
          slots[t.name] = t.values.map((v) => v.name.value);
        });
      }
    });
  }
}
