# Kuchimane

A runner of feature tests for VUI.

## Overview
Kuchimane helps you to test a dialog (include several conversions) in local.

As an example, you will test a very simple skill `GreetingBot` that replys greeting messages.
You can write a test code, such as

```js
it("greet", () => {
  return kuchimaneRunner.talkCheck('Open GreetingBot', (replyMessage) => {
      expect(replyMessage).to.include('Welocome to GreetingBot')
    })()
    .then(kuchimaneRunner.talkCheck('Hello', (replyMessage) => {
      expect(replyMessage).to.include('Hello! Good day');
    }))
    .then(kuchimaneRunner.talkCheck('Bye', (replyMessage) => {
      expect(replyMessage).to.include('See you');
    }));
  }
);
```

## Install

```
npm install kuchimane
```

## Setup
### Configuration
You should prepare `kuchimane_config.json`.
```json
{
  "modelPath": "../../sample/greeting_bot/models/en-US.json",
  "LaunchRequest": {
    "match": {
      "patterns": ["Open GreetingBot", "Open Geeging"],
      "type": "verbatim"
    }
  }
}

```

`modelPath` is a path for model file for Alexa.
Kuchimane collects intents information from it.
`LaunchRequest` is not include in the model file, so you should define in this `kuchimane_config.json`.

### Test code

```js
const handlers = { LaunchRequest, HelloIntent, ByeIntent };
const kuchimaneRunner = Kuchimane.runner(handlers, __dirname + '/kuchimane_config.json');

it("greet", () => {
  return kuchimaneRunner.talkCheck('Open GreetingBot', (replyMessage) => {
      expect(replyMessage).to.include('Welocome to GreetingBot')
    })()
    .then(kuchimaneRunner.talkCheck('Hello', (replyMessage) => {
      expect(replyMessage).to.include('Hello! Good day');
    }))
    .then(kuchimaneRunner.talkCheck('Bye', (replyMessage) => {
      expect(replyMessage).to.include('See you');
    }));
  }
);
```

At first, you create a `kuchimaneRunner` by the `runner` method of `Kuchimane`.
The method several arguments, the first one is the `handlers` for Alexa.
The second is the path to `kuchimane_config.json`.
