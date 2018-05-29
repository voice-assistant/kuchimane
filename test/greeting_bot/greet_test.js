'use strict'

import assert  from 'power-assert';
import Kuchimane from '../../src/index';
import { LaunchRequest, HelloIntent, ByeIntent } from '../../sample/greeting_bot/handlers'

describe("GreetingBot", () => {
  const kuchimaeRunner = Kuchimane.runner({ LaunchRequest, HelloIntent, ByeIntent }, __dirname + '/kuchimane_config.json');
  it("greet", () => {
    return kuchimaeRunner.talkCheck('Open GreetingBot', (replyMessage) => {
        assert( replyMessage === 'Welocome to GreetingBot' );
      })()
      .then(kuchimaeRunner.talkCheck('Hello', (replyMessage) => {
        assert( replyMessage === 'Hello! Good day.' );
      }))
      .then(kuchimaeRunner.talkCheck('Bye', (replyMessage) => {
        assert( replyMessage === 'See you!' );
      }));
    }
  );
});
