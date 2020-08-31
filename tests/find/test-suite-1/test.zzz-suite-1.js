'use strict';

['http'].forEach(function (adapter) {
  describe('pouchdb-find: ' + adapter + ': test.zzz-suite-1.js', function () {
    this.timeout(100000);

    const setupWait = (db) => {
      const waitForIndexes = async (db) => {
        const resp = await db.getIndexes();
        const indexes = resp.indexes;

        const building = indexes.filter(idx => idx.build_status === 'building'); 

        if (building.length > 0) {
          await waitForIndexes(db);
        }
      }

      const actualCreate = db.createIndex;

      db.createIndex = async (...args) => {
        const resp = await actualCreate.apply(db, args)
        await waitForIndexes(db);
        return resp;
      }
    }

    var context = {};

    beforeEach(function () {
      this.timeout(60000);
      var dbName = testUtils.adapterUrl(adapter, 'testdb');
      context.db = new PouchDB(dbName);
      setupWait(context.db);
      return context.db;
    });
    afterEach(function () {
      this.timeout(60000);
      return context.db.destroy();
    });

    testCases.forEach(function (testCase) {
      testCase(adapter, context);
    });
  });
});
