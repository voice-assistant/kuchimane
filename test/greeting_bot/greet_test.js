'use strict'

import assert  from 'power-assert';
import Kuchimane from '../../src/index';
import { LaunchRequest, HelloIntent, ByeIntent } from '../../sample/greeting_bot/handlers'

describe("GreetingBot", () => {
  const kuchimaneRunner = Kuchimane.runner({ LaunchRequest, HelloIntent, ByeIntent }, __dirname + '/kuchimane_config.json');
  it("greet", () => {
    return kuchimaneRunner.talkCheck('Open GreetingBot', (replyMessage) => {
        assert( replyMessage === 'Welocome to GreetingBot' );
      })()
      .then(kuchimaneRunner.talkCheck('Hello', (replyMessage) => {
        assert( replyMessage === 'Hello! Good day.' );
      }))
      .then(kuchimaneRunner.talkCheck('Bye', (replyMessage) => {
        assert( replyMessage === 'See you!' );
      }));
    }
  );
});
