const retry = require('./index.js');
const {assert} = require('chai');
const sinon = require('sinon');

describe('retry', () => {
    it('retry a promise until it succeeds and return the first successful result', async () => {
        const stub = sinon.stub();
        stub.onCall(0).returns(Promise.resolve(1));
        stub.onCall(1).returns(Promise.resolve(2));
        stub.onCall(2).returns(Promise.resolve(3));
        stub.onCall(3).returns(Promise.resolve(4));

        const result = await retry({
            action: stub,
            successPredicate: result => result === 3,
            retryCount: 3
        });

        assert.equal(result, 3);
        assert.equal(stub.callCount, 3);
    });

    it('reject after all retries failed', () => {
        const stub = sinon.stub();
        stub.onCall(0).returns(Promise.resolve(1));
        stub.onCall(1).returns(Promise.resolve(2));
        stub.onCall(2).returns(Promise.resolve(3));
        stub.onCall(3).returns(Promise.resolve(4));

        return retry({
            action: stub,
            successPredicate: result => result === 5,
            retryCount: 3
        }).then(
            () => Promise.reject(),
            () => Promise.resolve()
        );
    });

    it('an exception counts as a failed try', async () => {
        const stub = sinon.stub();
        stub.onCall(0).throws();
        stub.onCall(1).returns(Promise.resolve(2));
        stub.onCall(2).returns(Promise.resolve(3));
        stub.onCall(3).returns(Promise.resolve(4));

        const result = await retry({
            action: stub,
            successPredicate: result => result === 3,
            retryCount: 3
        });

        assert.equal(result, 3);
    });
});
