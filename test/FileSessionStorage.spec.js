const {FileSessionStorage} = require("../main");
const {Session} = require('@shopify/shopify-api');
const assert = require('assert');

describe('FileSessionStorage', function() {
  it('should be able to store session', async function() {
    const sessionStorage = new FileSessionStorage();
    const result = await sessionStorage.storeSession(new Session({
      id: 'test',
      shop: 'test-shop',
      scope: 'read_products'
    }));
    assert.equal(result, true);
  });
  it('should return a session from storage', async function() {
    const sessionStorage = new FileSessionStorage();
    const session = await sessionStorage.loadSession('eac8b4e2-fbb4-4c67-be31-766034e7a089');
    assert.equal(session.id, 'eac8b4e2-fbb4-4c67-be31-766034e7a089');
    assert.equal(session.scope, 'read_products');
  });
  it('should return a list of sessions by shop', async function() {
    const sessionStorage = new FileSessionStorage();
    const sessions = await sessionStorage.findSessionsByShop('demo.myshopify.com');
    assert.equal(sessions.length, 2);
  });
  it('should delete session by id', async function() {
    const sessionStorage = new FileSessionStorage();
    const result = await sessionStorage.deleteSession('test');
    assert.equal(result, true);
  });
  it('should delete sessions by ids', async function() {
    const sessionStorage = new FileSessionStorage();
    await sessionStorage.storeSession(new Session({
      id: 'test-2',
      shop: 'test-shop',
      scope: 'read_products'
    }));
    const result = await sessionStorage.deleteSessions([
      'test',
      'test-2'
    ]);
    assert.equal(result, true);
    assert.equal(await sessionStorage.loadSession('test-2'), undefined);
  });
});