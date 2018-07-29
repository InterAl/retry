module.exports = function retry(params) {
    params = params || {};

    var action = params.action,
        successPredicate = params.successPredicate,
        retryCount = params.retryCount || 1,
        delay = params.delay || 0,
        errorLog = params.errorLog || noop

    if (!action)
        throw 'action is required';
    if (!successPredicate)
        throw 'successPredicate is required';

    var retried = 0;

    return new Promise(function (resolve, reject) {
        (function iter() {
            try {
                Promise.resolve(params.action()).then(function (result) {
                    if (!successPredicate(result)) {
                        if (retried === retryCount) {
                            reject('All retry count failed');
                        } else {
                            retried++;
                            setTimeout(iter, delay);
                        }
                    } else {
                        resolve(result);
                    }
                });
            } catch (err) {
                errorLog(err);
                retried++;
                setTimeout(iter, delay);
            }
        })();
    });
}

function noop() {}
