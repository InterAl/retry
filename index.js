module.exports = function retry({action, successPredicate, retryCount = 1, delay = 0, errorLog = (() => {})} = {}) {
    let retried = 0;

    return new Promise((resolve, reject) => {
        (function iter() {
            if (!action)
                throw 'action is required';
            if (!successPredicate)
                throw 'successPredicate is required';

            try {
                Promise.resolve(action()).then(result => {
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
