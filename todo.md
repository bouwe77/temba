# TODO

- Test setup

  - [x] Separate running unit+integration test from E2E tests
  - [ ] Change integration tests so they run with supertest
  - [ ] Make integration tests depending on the user config provided to temba
  - [ ] As integration tests become more complete, simplify E2E tests

- E2E met fetch uitkleden: alleen smoke tests
- Uitgebreider (meerdere configs) testen met supertest
- Tests voor de initConfig in config.test.js maken
- Integratietest voor config.validateResources true/false 404
- Config documenteren
- Logger in gebruik nemen en zinvollere logging
- TypeScript
- ESLint
- npx create-temba-server

# Bevindingen json-server

- root URL geeft inderdaad info pagina.
- info pagina kun je overrulen door zelf een HTML pagina neer te zetten.
- json-data heeft ook geen model validatie
- Deleten van alle resources wordt niet ondersteund. Is ook wel gevaarlijk..? Je krijgt dan trouwens een 404 error, dat is raar.
- Patch vervangt/voeg toe de properties die je meegeeft. Wel te doen?
- PUT zonder ID wordt niet ondersteund.
- Alleen een POST geeft een Location header terug.
- HEAD en OPTIONS wordt ondersteund.
- OPTIONS geeft een header terug: Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
- Ook bij een collectie request wordt dezelfde options teruggegeven, terwijl dat niet klopt...
- Only a value set in a POST request will be respected, but only if not already taken.
- De "/db" route geeft de inhoud van de hele database terug.
- Bij het starten van de app wat meer info tonen:
  \{^\_^}/ hi!
  Connecting to DB...
  Done
  Resources
- http://localhost:3000/songs
  Home
  http://localhost:3000
  Watching...
  GET /songs 200 4.559 ms - 2
  POST /songs 201 11.465 ms - 33
  GET /songs 200 2.946 ms - 45
  POST /songs 201 4.167 ms - 31
