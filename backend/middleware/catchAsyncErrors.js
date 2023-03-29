//this is basically better version of try: catch block

module.exports = tryFunction => (req, res, next) => {
    Promise.resolve(tryFunction(req, res, next)).catch(next);
}